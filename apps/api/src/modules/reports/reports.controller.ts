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
import { MonthQueryDto } from './dto/month-query.dto';
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
    summary: 'Months with transaction data within the last 12 months',
  })
  @ApiOkResponse({ type: String, isArray: true })
  @Get('months')
  async getAvailableMonths(@CurrentUser() userId: string): Promise<string[]> {
    return this.reportsService.getAvailableMonths(userId);
  }

  @ApiOperation({
    summary: 'Total balance and income/expenses for a date range or month',
  })
  @ApiOkResponse({ type: SummaryResponseDto })
  @Get('summary')
  async getSummary(
    @CurrentUser() userId: string,
    @Query() query: ReportQueryDto,
  ): Promise<SummaryResponseDto> {
    const { from, to } = this.resolveRange(query);
    return this.reportsService.getSummary(userId, from, to, query.month);
  }

  @ApiOperation({
    summary: 'Expense breakdown by category for a date range or month',
  })
  @ApiOkResponse({ type: CategoryBreakdownPointDto, isArray: true })
  @Get('by-category')
  async getByCategory(
    @CurrentUser() userId: string,
    @Query() query: ReportQueryDto,
  ): Promise<CategoryBreakdownPointDto[]> {
    const { from, to } = this.resolveRange(query);
    return this.reportsService.getByCategory(userId, from, to);
  }

  @ApiOperation({
    summary:
      'Net worth segmented by fund classification (optionally point-in-time)',
  })
  @ApiOkResponse({ type: NetWorthResponseDto })
  @Get('net-worth')
  async getNetWorth(
    @CurrentUser() userId: string,
    @Query() query: MonthQueryDto,
  ): Promise<NetWorthResponseDto> {
    return this.reportsService.getNetWorth(userId, query.month);
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

  private resolveRange(query: ReportQueryDto): { from: string; to: string } {
    if (query.month) {
      return { from: `${query.month}-01`, to: this.monthLastDay(query.month) };
    }
    if (query.from && query.to) {
      return { from: query.from, to: query.to };
    }
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return {
      from: `${year}-${month}-01`,
      to: today.toISOString().slice(0, 10),
    };
  }

  private monthLastDay(month: string): string {
    const [year, m] = month.split('-').map(Number);
    const lastDay = new Date(year, m, 0).getDate();
    return `${month}-${String(lastDay).padStart(2, '0')}`;
  }
}
