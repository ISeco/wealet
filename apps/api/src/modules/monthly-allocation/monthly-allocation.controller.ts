import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
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
  async getCurrent(
    @CurrentUser() userId: string,
    @Res() res: Response,
  ): Promise<void> {
    const allocation = await this.service.getCurrent(userId);
    // NestJS skips JSON serialization for null returns (sends empty body).
    // Call res.json() directly so the client receives the literal JSON null.
    res.json(allocation);
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
