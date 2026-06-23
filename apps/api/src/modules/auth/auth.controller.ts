import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { CookieOptions, Request, Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthConfig } from '../../config/auth.config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

const REFRESH_COOKIE_NAME = 'refresh_token';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: 'Register a new user' })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { authResponse, refreshToken } = await this.authService.register(dto);
    this.setRefreshCookie(res, refreshToken);
    return authResponse;
  }

  @ApiOperation({ summary: 'Log in and receive an access token' })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { authResponse, refreshToken } = await this.authService.login(dto);
    this.setRefreshCookie(res, refreshToken);
    return authResponse;
  }

  @ApiOperation({
    summary: 'Rotate the refresh token and issue a new access token',
  })
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

  @ApiOperation({ summary: 'Revoke the current refresh token' })
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

  @ApiOperation({ summary: 'Change the current user password' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(204)
  async changePassword(
    @CurrentUser() userId: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    await this.authService.changePassword(userId, dto);
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
      path: '/api/v1/auth',
    };
  }
}
