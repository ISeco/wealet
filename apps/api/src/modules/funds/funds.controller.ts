import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateFundDto } from './dto/create-fund.dto';
import { CreatePresetFundsDto } from './dto/create-preset-funds.dto';
import { FundHistoryPointDto } from './dto/fund-history-point.dto';
import { FundHistoryQueryDto } from './dto/fund-history-query.dto';
import { FundQueryDto } from './dto/fund-query.dto';
import { FundResponseDto } from './dto/fund-response.dto';
import { UpdateFundDto } from './dto/update-fund.dto';
import { FundsService } from './funds.service';
import { toFundResponseDto } from './mappers/fund.mapper';

@ApiTags('funds')
@ApiBearerAuth()
@Controller('funds')
@UseGuards(JwtAuthGuard)
export class FundsController {
  constructor(private readonly fundsService: FundsService) {}

  @ApiOperation({
    summary:
      'List the user funds with their derived balance (excludes archived by default)',
  })
  @ApiOkResponse({ type: FundResponseDto, isArray: true })
  @Get()
  async findAll(
    @CurrentUser() userId: string,
    @Query() query: FundQueryDto,
  ): Promise<FundResponseDto[]> {
    const fundsWithBalances = await this.fundsService.findAllWithBalances(
      userId,
      query.includeArchived,
    );
    return fundsWithBalances.map(({ fund, balance }) =>
      toFundResponseDto(fund, balance),
    );
  }

  @ApiOperation({ summary: 'Create a fund' })
  @ApiOkResponse({ type: FundResponseDto })
  @Post()
  async create(
    @CurrentUser() userId: string,
    @Body() dto: CreateFundDto,
  ): Promise<FundResponseDto> {
    const { fund, balance } = await this.fundsService.create(userId, dto);
    return toFundResponseDto(fund, balance);
  }

  @ApiOperation({ summary: 'Create a preset of funds (Jars/50-30-20/sobres)' })
  @ApiOkResponse({ type: FundResponseDto, isArray: true })
  @Post('preset')
  async createPreset(
    @CurrentUser() userId: string,
    @Body() dto: CreatePresetFundsDto,
  ): Promise<FundResponseDto[]> {
    const funds = await this.fundsService.createPreset(userId, dto);
    return funds.map((fund) => toFundResponseDto(fund, '0'));
  }

  @ApiOperation({ summary: 'Get a single fund with its derived balance' })
  @ApiOkResponse({ type: FundResponseDto })
  @Get(':id')
  async findOne(
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ): Promise<FundResponseDto> {
    const fund = await this.fundsService.findOneOrThrow(userId, id);
    const balance = await this.fundsService.getBalanceForFund(userId, id);
    return toFundResponseDto(fund, balance);
  }

  @ApiOperation({ summary: 'Get the balance evolution of a fund by month' })
  @ApiOkResponse({ type: FundHistoryPointDto, isArray: true })
  @Get(':id/history')
  async getHistory(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Query() query: FundHistoryQueryDto,
  ): Promise<FundHistoryPointDto[]> {
    await this.fundsService.findOneOrThrow(userId, id);
    return this.fundsService.getHistory(userId, id, query.months ?? 12);
  }

  @ApiOperation({ summary: 'Update a fund' })
  @ApiOkResponse({ type: FundResponseDto })
  @Patch(':id')
  async update(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateFundDto,
  ): Promise<FundResponseDto> {
    const { fund, balance } = await this.fundsService.update(userId, id, dto);
    return toFundResponseDto(fund, balance);
  }

  @ApiOperation({
    summary: 'Archive a fund (always soft-delete for traceability)',
  })
  @ApiOkResponse({ type: FundResponseDto })
  @Delete(':id')
  async remove(
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ): Promise<FundResponseDto> {
    const { fund, balance } = await this.fundsService.remove(userId, id);
    return toFundResponseDto(fund, balance);
  }
}
