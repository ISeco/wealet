import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AllocationResponseDto } from './dto/allocation-response.dto';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { MonthlyAllocationService } from './monthly-allocation.service';

@ApiTags('monthly-allocation')
@ApiBearerAuth()
@Controller('monthly-allocation')
@UseGuards(JwtAuthGuard)
export class MonthlyAllocationController {
  constructor(private readonly service: MonthlyAllocationService) {}

  @ApiOperation({ summary: 'Get current month allocation or null' })
  @ApiOkResponse({ type: AllocationResponseDto })
  @Get('current')
  getCurrent(
    @CurrentUser() userId: string,
  ): Promise<AllocationResponseDto | null> {
    return this.service.getCurrent(userId);
  }

  @ApiOperation({ summary: 'Create or replace current month allocation' })
  @ApiOkResponse({ type: AllocationResponseDto })
  @Post()
  upsert(
    @CurrentUser() userId: string,
    @Body() dto: CreateAllocationDto,
  ): Promise<AllocationResponseDto> {
    return this.service.upsert(userId, dto);
  }
}
