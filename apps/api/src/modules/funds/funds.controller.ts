import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateFundDto } from './dto/create-fund.dto';
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

  @ApiOperation({ summary: 'List the user funds with their derived balance' })
  @ApiOkResponse({ type: FundResponseDto, isArray: true })
  @Get()
  async findAll(@CurrentUser() userId: string): Promise<FundResponseDto[]> {
    const fundsWithBalances =
      await this.fundsService.findAllWithBalances(userId);
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
    summary: 'Archive a fund with movements, or hard-delete it if it has none',
  })
  @ApiOkResponse({ type: FundResponseDto })
  @Delete(':id')
  async remove(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<FundResponseDto | undefined> {
    const result = await this.fundsService.remove(userId, id);
    if (!result) {
      res.status(204);
      return undefined;
    }
    return toFundResponseDto(result.fund, result.balance);
  }
}
