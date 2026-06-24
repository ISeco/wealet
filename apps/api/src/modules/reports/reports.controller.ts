import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CashFlowPointDto } from './dto/cash-flow-point.dto';
import { CashFlowQueryDto } from './dto/cash-flow-query.dto';
import { CategoryBreakdownPointDto } from './dto/category-breakdown-point.dto';
import { NetWorthResponseDto } from './dto/net-worth-response.dto';
import { ReportQueryDto } from './dto/report-query.dto';
import { RunwayResponseDto } from './dto/runway-response.dto';
import { SummaryResponseDto } from './dto/summary-response.dto';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({
    summary: 'Total balance and income/expenses for a date range',
  })
  @ApiOkResponse({ type: SummaryResponseDto })
  @Get('summary')
  async getSummary(
    @CurrentUser() userId: string,
    @Query() query: ReportQueryDto,
  ): Promise<SummaryResponseDto> {
    return this.reportsService.getSummary(userId, query.from, query.to);
  }

  @ApiOperation({
    summary: 'Expense breakdown by category for a date range',
  })
  @ApiOkResponse({ type: CategoryBreakdownPointDto, isArray: true })
  @Get('by-category')
  async getByCategory(
    @CurrentUser() userId: string,
    @Query() query: ReportQueryDto,
  ): Promise<CategoryBreakdownPointDto[]> {
    return this.reportsService.getByCategory(userId, query.from, query.to);
  }

  @ApiOperation({
    summary: 'Net worth segmented by fund classification',
  })
  @ApiOkResponse({ type: NetWorthResponseDto })
  @Get('net-worth')
  async getNetWorth(
    @CurrentUser() userId: string,
  ): Promise<NetWorthResponseDto> {
    return this.reportsService.getNetWorth(userId);
  }

  @ApiOperation({
    summary: 'Financial runway: cushion ÷ average monthly burn',
  })
  @ApiOkResponse({ type: RunwayResponseDto })
  @Get('runway')
  async getRunway(@CurrentUser() userId: string): Promise<RunwayResponseDto> {
    return this.reportsService.getRunway(userId);
  }

  @ApiOperation({
    summary: 'Monthly net cash flow (income/expense) for the dashboard chart',
  })
  @ApiOkResponse({ type: CashFlowPointDto, isArray: true })
  @Get('cash-flow')
  async getCashFlow(
    @CurrentUser() userId: string,
    @Query() query: CashFlowQueryDto,
  ): Promise<CashFlowPointDto[]> {
    return this.reportsService.getCashFlow(userId, query.months ?? 12);
  }
}
