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
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';

jest.mock('argon2');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let refreshTokenRepository: jest.Mocked<Repository<RefreshToken>>;

  const authConfig = {
    jwtSecret: 'secret',
    jwtExpirationSeconds: 900,
    refreshTokenExpirationDays: 7,
    passwordPepper: 'pepper',
    corsOrigin: 'http://localhost:5173',
  };

  const buildUser = (overrides: Partial<User> = {}): User => ({
    id: 'user-1',
    email: 'test@test.com',
    passwordHash: 'hashed',
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
});
