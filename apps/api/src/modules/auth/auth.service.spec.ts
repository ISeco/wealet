import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { OAuth2Client } from 'google-auth-library';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';
import { MailService } from '../../common/mail/mail.service';

jest.mock('argon2');
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    getTokenInfo: jest.fn(),
  })),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let refreshTokenRepository: jest.Mocked<Repository<RefreshToken>>;
  let mailService: jest.Mocked<MailService>;
  let configService: jest.Mocked<ConfigService>;

  const authConfig = {
    jwtSecret: 'secret',
    jwtExpirationSeconds: 900,
    refreshTokenExpirationDays: 7,
    passwordPepper: 'pepper',
    corsOrigin: 'http://localhost:5173',
    googleClientId: 'test-client-id',
  };

  const buildUser = (overrides: Partial<User> = {}): User => ({
    id: 'user-1',
    email: 'test@test.com',
    passwordHash: 'hashed',
    googleId: null,
    displayName: null,
    theme: 'system',
    onboardingCompleted: false,
    onboardingCompletedAt: null,
    passwordResetToken: null,
    passwordResetExpiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            updatePasswordHash: jest.fn(),
            findByPasswordResetToken: jest.fn(),
            savePasswordResetToken: jest.fn(),
            clearPasswordResetToken: jest.fn(),
            findByGoogleId: jest.fn(),
            createWithGoogle: jest.fn(),
            linkGoogleId: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendPasswordReset: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn((entity) => entity),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('signed-jwt') },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(authConfig) },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    usersService = module.get(UsersService);
    refreshTokenRepository = module.get(getRepositoryToken(RefreshToken));
    mailService = module.get(MailService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('throws ConflictException when the email already exists', async () => {
      usersService.findByEmail.mockResolvedValue(buildUser());

      await expect(
        authService.register({
          email: 'test@test.com',
          password: 'Pw123456!',
          displayName: 'Test User',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('hashes the password with argon2 and the configured pepper', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(buildUser());
      (argon2.hash as jest.Mock).mockResolvedValue('argon2-hash');

      await authService.register({
        email: 'test@test.com',
        password: 'Pw123456!',
        displayName: 'Test User',
      });

      expect(argon2.hash).toHaveBeenCalledWith('Pw123456!pepper');
      expect(usersService.create).toHaveBeenCalledWith(
        'test@test.com',
        'argon2-hash',
        'Test User',
      );
    });
  });

  describe('login', () => {
    it('throws the same UnauthorizedException when the user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'missing@test.com', password: 'pw123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws the same UnauthorizedException when the password is invalid', async () => {
      usersService.findByEmail.mockResolvedValue(buildUser());
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns the same error message for missing user and wrong password (no email enumeration)', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      const missingUserError = await authService
        .login({ email: 'missing@test.com', password: 'pw' })
        .catch((e: Error) => e);

      usersService.findByEmail.mockResolvedValue(buildUser());
      (argon2.verify as jest.Mock).mockResolvedValue(false);
      const wrongPasswordError = await authService
        .login({ email: 'test@test.com', password: 'wrong' })
        .catch((e: Error) => e);

      expect((missingUserError as { message: string }).message).toBe(
        (wrongPasswordError as { message: string }).message,
      );
    });
  });

  describe('login with pepper rotation', () => {
    it('logs in and re-hashes with the current pepper when only the previous pepper matches', async () => {
      const user = buildUser({ passwordHash: 'old-pepper-hash' });
      usersService.findByEmail.mockResolvedValue(user);
      (configService.get as jest.Mock).mockReturnValue({
        ...authConfig,
        passwordPepperPrevious: 'old-pepper',
      });
      (argon2.verify as jest.Mock)
        .mockResolvedValueOnce(false) // current pepper fails
        .mockResolvedValueOnce(true); // previous pepper matches
      (argon2.hash as jest.Mock).mockResolvedValue('rehashed-with-current');

      const result = await authService.login({
        email: 'test@test.com',
        password: 'Pw123456!',
      });

      expect(result.authResponse.accessToken).toBe('signed-jwt');
      expect(argon2.verify).toHaveBeenNthCalledWith(
        1,
        'old-pepper-hash',
        'Pw123456!pepper',
      );
      expect(argon2.verify).toHaveBeenNthCalledWith(
        2,
        'old-pepper-hash',
        'Pw123456!old-pepper',
      );
      expect(argon2.hash).toHaveBeenCalledWith('Pw123456!pepper');
      expect(usersService.updatePasswordHash).toHaveBeenCalledWith(
        'user-1',
        'rehashed-with-current',
      );
    });

    it('rejects login when the password matches neither the current nor the previous pepper', async () => {
      usersService.findByEmail.mockResolvedValue(buildUser());
      (configService.get as jest.Mock).mockReturnValue({
        ...authConfig,
        passwordPepperPrevious: 'old-pepper',
      });
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(usersService.updatePasswordHash).not.toHaveBeenCalled();
    });

    it('does not attempt a fallback when PASSWORD_PEPPER_PREVIOUS is not configured', async () => {
      usersService.findByEmail.mockResolvedValue(buildUser());
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(argon2.verify).toHaveBeenCalledTimes(1);
    });
  });

  describe('refresh', () => {
    it('throws UnauthorizedException when the token does not exist', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(null);

      await expect(authService.refresh('raw-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rotates the token: revokes the old one and issues a new one', async () => {
      const record = {
        id: 'rt-1',
        userId: 'user-1',
        tokenHash: 'hash',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        revokedAt: null,
        createdAt: new Date(),
      } as RefreshToken;
      refreshTokenRepository.findOne.mockResolvedValue(record);
      usersService.findById.mockResolvedValue(buildUser());

      await authService.refresh('raw-token');

      expect(record.revokedAt).not.toBeNull();
      expect(refreshTokenRepository.save).toHaveBeenCalledWith(record);
      expect(refreshTokenRepository.create).toHaveBeenCalled();
    });

    it('detects reuse of an already-revoked token and revokes all of the user tokens', async () => {
      const record = {
        id: 'rt-1',
        userId: 'user-1',
        tokenHash: 'hash',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        revokedAt: new Date(),
        createdAt: new Date(),
      } as RefreshToken;
      refreshTokenRepository.findOne.mockResolvedValue(record);

      await expect(authService.refresh('raw-token')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1' }),
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });

    it('throws UnauthorizedException for an expired token without rotating it', async () => {
      const record = {
        id: 'rt-1',
        userId: 'user-1',
        tokenHash: 'hash',
        expiresAt: new Date(Date.now() - 1000),
        revokedAt: null,
        createdAt: new Date(),
      } as RefreshToken;
      refreshTokenRepository.findOne.mockResolvedValue(record);

      await expect(authService.refresh('raw-token')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(refreshTokenRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('throws UnauthorizedException when current password is incorrect', async () => {
      usersService.findById.mockResolvedValue(buildUser());
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.changePassword('user-1', {
          currentPassword: 'wrong',
          newPassword: 'NewPw123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws BadRequestException when new password equals current password', async () => {
      usersService.findById.mockResolvedValue(buildUser());
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      await expect(
        authService.changePassword('user-1', {
          currentPassword: 'SamePw123!',
          newPassword: 'SamePw123!',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('revokes all refresh tokens on successful password change', async () => {
      usersService.findById.mockResolvedValue(buildUser());
      (argon2.verify as jest.Mock)
        .mockResolvedValueOnce(true) // currentPassword valid
        .mockResolvedValueOnce(false); // newPassword != currentPassword
      (argon2.hash as jest.Mock).mockResolvedValue('new-hash');

      await authService.changePassword('user-1', {
        currentPassword: 'OldPw123!',
        newPassword: 'NewPw456!',
      });

      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1' }),
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });

    it('allows Google-only user to set a password without currentPassword', async () => {
      const googleUser = buildUser({ passwordHash: null });
      usersService.findById.mockResolvedValue(googleUser);
      (argon2.hash as jest.Mock).mockResolvedValue('new-hash');

      await expect(
        authService.changePassword('user-1', { newPassword: 'NewPass1!' }),
      ).resolves.toBeUndefined();

      expect(usersService.updatePasswordHash).toHaveBeenCalledWith(
        'user-1',
        'new-hash',
      );
    });

    it('requires currentPassword when user has an existing password', async () => {
      const user = buildUser({ passwordHash: 'hashed' });
      usersService.findById.mockResolvedValue(user);

      await expect(
        authService.changePassword('user-1', { newPassword: 'NewPass1!' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('hashToken determinism', () => {
    it('produces the same hash for the same raw token across calls', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(null);

      await expect(authService.refresh('same-raw-token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.refresh('same-raw-token')).rejects.toThrow(
        UnauthorizedException,
      );

      const [[firstCall], [secondCall]] =
        refreshTokenRepository.findOne.mock.calls;
      expect(firstCall).toEqual(secondCall);
    });
  });

  describe('forgotPassword', () => {
    it('does nothing and returns 200-equivalent when email is not registered', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.forgotPassword('unknown@test.com'),
      ).resolves.toBeUndefined();
      expect(mailService.sendPasswordReset).not.toHaveBeenCalled();
    });

    it('saves a hashed token and sends an email when email exists', async () => {
      usersService.findByEmail.mockResolvedValue(buildUser());
      usersService.savePasswordResetToken.mockResolvedValue(undefined);

      await authService.forgotPassword('test@test.com');

      expect(usersService.savePasswordResetToken).toHaveBeenCalledWith(
        'user-1',
        expect.any(String),
        expect.any(Date),
      );
      expect(mailService.sendPasswordReset).toHaveBeenCalledWith(
        'test@test.com',
        expect.stringContaining('/reset-password?token='),
      );
    });

    it('stores a SHA-256 hash, not the raw token', async () => {
      usersService.findByEmail.mockResolvedValue(buildUser());
      usersService.savePasswordResetToken.mockResolvedValue(undefined);

      await authService.forgotPassword('test@test.com');

      const [, savedHash] = usersService.savePasswordResetToken.mock.calls[0];
      const sentUrl = mailService.sendPasswordReset.mock.calls[0][1];
      const rawToken = sentUrl.split('token=')[1];

      expect(savedHash).not.toBe(rawToken);
      expect(savedHash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('resetPassword', () => {
    it('throws BadRequestException when token is not found or expired', async () => {
      usersService.findByPasswordResetToken.mockResolvedValue(null);

      await expect(
        authService.resetPassword('invalid-token', 'NewPw123!'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when token is found but expired', async () => {
      usersService.findByPasswordResetToken.mockResolvedValue(
        buildUser({ passwordResetExpiresAt: new Date(Date.now() - 1000) }),
      );

      await expect(
        authService.resetPassword('expired-token', 'NewPw123!'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when new password equals current password', async () => {
      usersService.findByPasswordResetToken.mockResolvedValue(
        buildUser({ passwordResetExpiresAt: new Date(Date.now() + 60_000) }),
      );
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      await expect(
        authService.resetPassword('valid-token', 'SamePw123!'),
      ).rejects.toThrow(BadRequestException);
    });

    it('updates password, clears reset token, and revokes all refresh tokens on success', async () => {
      usersService.findByPasswordResetToken.mockResolvedValue(
        buildUser({ passwordResetExpiresAt: new Date(Date.now() + 60_000) }),
      );
      (argon2.verify as jest.Mock).mockResolvedValue(false);
      (argon2.hash as jest.Mock).mockResolvedValue('new-hash');
      usersService.updatePasswordHash.mockResolvedValue(undefined);
      usersService.clearPasswordResetToken.mockResolvedValue(undefined);

      await authService.resetPassword('valid-token', 'NewPw456!');

      expect(usersService.updatePasswordHash).toHaveBeenCalledWith(
        'user-1',
        'new-hash',
      );
      expect(usersService.clearPasswordResetToken).toHaveBeenCalledWith(
        'user-1',
      );
      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1' }),
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });
  });

  describe('loginWithGoogle', () => {
    let mockGetTokenInfo: jest.Mock;

    beforeEach(() => {
      mockGetTokenInfo = jest.fn();
      (OAuth2Client as unknown as jest.Mock).mockImplementation(() => ({
        getTokenInfo: mockGetTokenInfo,
      }));
    });

    it('creates a new user when no matching googleId or email', async () => {
      mockGetTokenInfo.mockResolvedValue({
        sub: 'g-123',
        email: 'new@test.com',
        aud: 'test-client-id',
      });
      usersService.findByGoogleId.mockResolvedValue(null);
      usersService.findByEmail.mockResolvedValue(null);
      const newUser = buildUser({
        id: 'user-2',
        email: 'new@test.com',
        googleId: 'g-123',
        passwordHash: null,
      });
      usersService.createWithGoogle.mockResolvedValue(newUser);
      refreshTokenRepository.create.mockReturnValue({} as RefreshToken);
      refreshTokenRepository.save.mockResolvedValue({} as RefreshToken);

      const result = await authService.loginWithGoogle('valid-token');

      expect(usersService.createWithGoogle).toHaveBeenCalledWith({
        googleId: 'g-123',
        email: 'new@test.com',
        displayName: null,
      });
      expect(result.authResponse.user.email).toBe('new@test.com');
    });

    it('returns tokens for existing user with matching googleId', async () => {
      const existingUser = buildUser({ googleId: 'g-123' });
      mockGetTokenInfo.mockResolvedValue({
        sub: 'g-123',
        email: 'test@test.com',
        aud: 'test-client-id',
      });
      usersService.findByGoogleId.mockResolvedValue(existingUser);
      refreshTokenRepository.create.mockReturnValue({} as RefreshToken);
      refreshTokenRepository.save.mockResolvedValue({} as RefreshToken);

      const result = await authService.loginWithGoogle('valid-token');

      expect(usersService.createWithGoogle).not.toHaveBeenCalled();
      expect(result.authResponse.user.id).toBe('user-1');
    });

    it('links googleId to existing email/password user', async () => {
      const existingUser = buildUser();
      mockGetTokenInfo.mockResolvedValue({
        sub: 'g-999',
        email: 'test@test.com',
        aud: 'test-client-id',
      });
      usersService.findByGoogleId.mockResolvedValue(null);
      usersService.findByEmail.mockResolvedValue(existingUser);
      usersService.linkGoogleId.mockResolvedValue(undefined);
      refreshTokenRepository.create.mockReturnValue({} as RefreshToken);
      refreshTokenRepository.save.mockResolvedValue({} as RefreshToken);

      await authService.loginWithGoogle('valid-token');

      expect(usersService.linkGoogleId).toHaveBeenCalledWith('user-1', 'g-999');
    });

    it('throws UnauthorizedException for invalid token', async () => {
      mockGetTokenInfo.mockRejectedValue(new Error('Invalid token'));

      await expect(authService.loginWithGoogle('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
