import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AssessmentQueryDto } from './dto/assessment-query.dto';
import { AssessmentResponseDto } from './dto/assessment-response.dto';
import { UpdateHealthProfileDto } from './dto/update-health-profile.dto';
import { HealthProfile } from './entities/health-profile.entity';
import { HealthService } from './health.service';

@ApiTags('health')
@ApiBearerAuth()
@Controller('health')
@UseGuards(JwtAuthGuard)
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @ApiOperation({
    summary: 'Get the financial health profile (framework + targets)',
  })
  @ApiOkResponse({ type: HealthProfile })
  @Get('profile')
  async getProfile(@CurrentUser() userId: string): Promise<HealthProfile> {
    return this.healthService.getOrCreateProfile(userId);
  }

  @ApiOperation({ summary: 'Update the financial health profile' })
  @ApiOkResponse({ type: HealthProfile })
  @Put('profile')
  async updateProfile(
    @CurrentUser() userId: string,
    @Body() dto: UpdateHealthProfileDto,
  ): Promise<HealthProfile> {
    return this.healthService.updateProfile(userId, dto);
  }

  @ApiOperation({
    summary: 'Adherence to the selected framework for a date range',
  })
  @ApiOkResponse({ type: AssessmentResponseDto })
  @Get('assessment')
  async getAssessment(
    @CurrentUser() userId: string,
    @Query() query: AssessmentQueryDto,
  ): Promise<AssessmentResponseDto> {
    const today = new Date();
    const from =
      query.from ??
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    const to = query.to ?? today.toISOString().slice(0, 10);
    return this.healthService.getAssessment(userId, from, to);
  }
}
