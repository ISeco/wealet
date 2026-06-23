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
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateFundDto } from './dto/create-fund.dto';
import { FundResponseDto } from './dto/fund-response.dto';
import { UpdateFundDto } from './dto/update-fund.dto';
import { FundsService } from './funds.service';
import { toFundResponseDto } from './mappers/fund.mapper';

@Controller('funds')
@UseGuards(JwtAuthGuard)
export class FundsController {
  constructor(private readonly fundsService: FundsService) {}

  @Get()
  async findAll(@CurrentUser() userId: string): Promise<FundResponseDto[]> {
    const fundsWithBalances =
      await this.fundsService.findAllWithBalances(userId);
    return fundsWithBalances.map(({ fund, balance }) =>
      toFundResponseDto(fund, balance),
    );
  }

  @Post()
  async create(
    @CurrentUser() userId: string,
    @Body() dto: CreateFundDto,
  ): Promise<FundResponseDto> {
    const { fund, balance } = await this.fundsService.create(userId, dto);
    return toFundResponseDto(fund, balance);
  }

  @Patch(':id')
  async update(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateFundDto,
  ): Promise<FundResponseDto> {
    const { fund, balance } = await this.fundsService.update(userId, id, dto);
    return toFundResponseDto(fund, balance);
  }

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
