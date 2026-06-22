import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthConfig } from '../../config/auth.config';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, UserResponseDto } from './dto/auth-response.dto';
import { toUserResponseDto } from './mappers/user.mapper';

const REFRESH_COOKIE_NAME = 'refresh_token';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { authResponse, refreshToken } = await this.authService.register(dto);
    this.setRefreshCookie(res, refreshToken);
    return authResponse;
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { authResponse, refreshToken } = await this.authService.login(dto);
    this.setRefreshCookie(res, refreshToken);
    return authResponse;
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const rawToken = this.getRefreshTokenFromRequest(req);
    if (!rawToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const { authResponse, refreshToken } =
      await this.authService.refresh(rawToken);
    this.setRefreshCookie(res, refreshToken);
    return authResponse;
  }

  @Post('logout')
  @HttpCode(204)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const rawToken = this.getRefreshTokenFromRequest(req);
    if (rawToken) {
      await this.authService.logout(rawToken);
    }
    res.clearCookie(REFRESH_COOKIE_NAME, this.cookieOptions());
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return toUserResponseDto(user);
  }

  private setRefreshCookie(res: Response, token: string): void {
    const { refreshTokenExpirationDays } =
      this.configService.get<AuthConfig>('auth')!;
    res.cookie(REFRESH_COOKIE_NAME, token, {
      ...this.cookieOptions(),
      maxAge: refreshTokenExpirationDays * 86_400_000,
    });
  }

  private getRefreshTokenFromRequest(req: Request): string | undefined {
    return req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  }

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      path: '/auth',
    };
  }
}
