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
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

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
