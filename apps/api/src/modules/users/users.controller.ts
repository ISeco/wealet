import {
  Body,
  Controller,
  Get,
  Patch,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { toUserProfileDto } from './mappers/user-profile.mapper';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get the current user profile' })
  @Get('me')
  async me(@CurrentUser() userId: string): Promise<UserProfileDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return toUserProfileDto(user);
  }

  @ApiOperation({ summary: 'Update the current user profile' })
  @Patch('me')
  async updateMe(
    @CurrentUser() userId: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserProfileDto> {
    const user = await this.usersService.update(userId, dto);
    return toUserProfileDto(user);
  }
}
