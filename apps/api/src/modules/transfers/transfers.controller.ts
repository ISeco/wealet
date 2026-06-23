import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { TransferQueryDto } from './dto/transfer-query.dto';
import { TransferResponseDto } from './dto/transfer-response.dto';
import { toTransferResponseDto } from './mappers/transfer.mapper';
import { TransfersService } from './transfers.service';

@ApiTags('transfers')
@ApiBearerAuth()
@Controller('transfers')
@UseGuards(JwtAuthGuard)
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @ApiOperation({ summary: 'List transfers between funds, filtered by date' })
  @ApiOkResponse({ type: TransferResponseDto, isArray: true })
  @Get()
  async findAll(
    @CurrentUser() userId: string,
    @Query() query: TransferQueryDto,
  ): Promise<TransferResponseDto[]> {
    const transfers = await this.transfersService.findAll(userId, query);
    return transfers.map(toTransferResponseDto);
  }

  @ApiOperation({ summary: 'Atomically transfer an amount between two funds' })
  @ApiOkResponse({ type: TransferResponseDto })
  @Post()
  async create(
    @CurrentUser() userId: string,
    @Body() dto: CreateTransferDto,
  ): Promise<TransferResponseDto> {
    const transfer = await this.transfersService.create(userId, dto);
    return toTransferResponseDto(transfer);
  }
}
