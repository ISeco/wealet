import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ExchangeRateQueryDto } from './dto/exchange-rate-query.dto';
import { ExchangeRateResultDto } from './dto/exchange-rate-result.dto';
import { ExchangeRateService } from './exchange-rate.service';

@ApiTags('exchange-rate')
@ApiBearerAuth()
@Controller('exchange-rate')
@UseGuards(JwtAuthGuard)
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @ApiOperation({
    summary: 'Tipo de cambio de referencia hacia la moneda base (CLP)',
  })
  @Get()
  async getRate(
    @Query() query: ExchangeRateQueryDto,
  ): Promise<ExchangeRateResultDto | null> {
    return this.exchangeRateService.getRate(query.from);
  }
}
