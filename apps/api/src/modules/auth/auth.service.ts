import { randomBytes, createHash } from 'crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { IsNull, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { AuthConfig } from '../../config/auth.config';
import { MailService } from '../../common/mail/mail.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { toUserResponseDto } from './mappers/user.mapper';

export interface IssuedTokens {
  authResponse: AuthResponseDto;
  refreshToken: string;
}

const INVALID_CREDENTIALS_MESSAGE = 'Invalid credentials';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto): Promise<IssuedTokens> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await this.hashPassword(dto.password);
    const user = await this.usersService.create(
      dto.email,
      passwordHash,
      dto.displayName,
    );

    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<IssuedTokens> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const valid = await this.verifyPassword(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    return this.issueTokens(user);
  }

  async refresh(rawToken: string): Promise<IssuedTokens> {
    const tokenHash = this.hashToken(rawToken);
    const record = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
    });

    if (!record) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (record.revokedAt) {
      await this.revokeAllForUser(record.userId);
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    if (record.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.usersService.findById(record.userId);
    if (!user) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    record.revokedAt = new Date();
    await this.refreshTokenRepository.save(record);

    return this.issueTokens(user);
  }

  async logout(rawToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);
    const record = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
    });

    if (record && !record.revokedAt) {
      record.revokedAt = new Date();
      await this.refreshTokenRepository.save(record);
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const valid = await this.verifyPassword(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const isSamePassword = await this.verifyPassword(
      dto.newPassword,
      user.passwordHash,
    );
    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const passwordHash = await this.hashPassword(dto.newPassword);
    await this.usersService.updatePasswordHash(userId, passwordHash);
    await this.revokeAllForUser(userId);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return;

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.usersService.savePasswordResetToken(
      user.id,
      tokenHash,
      expiresAt,
    );

    const frontendUrl = this.configService.get<string>('FRONTEND_URL')!;
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;
    await this.mailService.sendPasswordReset(user.email, resetUrl);
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);
    const user = await this.usersService.findByPasswordResetToken(tokenHash);

    if (
      !user ||
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt < new Date()
    ) {
      throw new BadRequestException('Token inválido o expirado');
    }

    const isSamePassword = await this.verifyPassword(
      newPassword,
      user.passwordHash,
    );
    if (isSamePassword) {
      throw new BadRequestException(
        'La nueva contraseña debe ser diferente a la actual',
      );
    }

    const passwordHash = await this.hashPassword(newPassword);
    await this.usersService.updatePasswordHash(user.id, passwordHash);
    await this.usersService.clearPasswordResetToken(user.id);
    await this.revokeAllForUser(user.id);
  }

  private async issueTokens(user: User): Promise<IssuedTokens> {
    const accessToken = this.jwtService.sign({ sub: user.id });

    const rawRefreshToken = randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);
    const expiresAt = new Date(
      Date.now() + this.authConfig.refreshTokenExpirationDays * 86_400_000,
    );

    await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({
        userId: user.id,
        tokenHash,
        expiresAt,
      }),
    );

    return {
      authResponse: { accessToken, user: toUserResponseDto(user) },
      refreshToken: rawRefreshToken,
    };
  }

  private hashPassword(password: string): Promise<string> {
    return argon2.hash(password + this.authConfig.passwordPepper);
  }

  private verifyPassword(password: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, password + this.authConfig.passwordPepper);
  }

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  private async revokeAllForUser(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  private get authConfig(): AuthConfig {
    return this.configService.get<AuthConfig>('auth')!;
  }
}
