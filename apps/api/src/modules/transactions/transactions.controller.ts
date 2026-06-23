import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import {
  PaginatedTransactionsResponseDto,
  TransactionResponseDto,
} from './dto/transaction-response.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { toTransactionResponseDto } from './mappers/transaction.mapper';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async findAll(
    @CurrentUser() userId: string,
    @Query() query: TransactionQueryDto,
  ): Promise<PaginatedTransactionsResponseDto> {
    const { data, total, page, limit } = await this.transactionsService.findAll(
      userId,
      query,
    );
    return { data: data.map(toTransactionResponseDto), total, page, limit };
  }

  @Post()
  async create(
    @CurrentUser() userId: string,
    @Body() dto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.transactionsService.create(userId, dto);
    return toTransactionResponseDto(transaction);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.transactionsService.findOneOrThrow(
      userId,
      id,
    );
    return toTransactionResponseDto(transaction);
  }

  @Patch(':id')
  async update(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.transactionsService.update(userId, id, dto);
    return toTransactionResponseDto(transaction);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.transactionsService.remove(userId, id);
  }
}
