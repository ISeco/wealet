import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Fund } from '../funds/entities/fund.entity';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { TransferQueryDto } from './dto/transfer-query.dto';
import { Transfer } from './entities/transfer.entity';

const DEFAULT_CURRENCY = 'CLP';

@Injectable()
export class TransfersService {
  constructor(
    @InjectRepository(Transfer)
    private readonly transfersRepository: Repository<Transfer>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, dto: CreateTransferDto): Promise<Transfer> {
    if (dto.fromFundId === dto.toFundId) {
      throw new BadRequestException(
        'fromFundId and toFundId must be different funds',
      );
    }
    if (BigInt(dto.amount) <= 0n) {
      throw new BadRequestException('amount must be greater than zero');
    }

    return this.dataSource.transaction(async (manager) => {
      const fundsRepository = manager.getRepository(Fund);
      const [fromFund, toFund] = await Promise.all([
        fundsRepository.findOne({ where: { id: dto.fromFundId, userId } }),
        fundsRepository.findOne({ where: { id: dto.toFundId, userId } }),
      ]);
      if (!fromFund) {
        throw new NotFoundException('Source fund not found');
      }
      if (!toFund) {
        throw new NotFoundException('Destination fund not found');
      }

      const transfer = manager.create(Transfer, {
        ...dto,
        userId,
        currency: dto.currency ?? DEFAULT_CURRENCY,
      });
      return manager.save(transfer);
    });
  }

  async findAll(userId: string, query: TransferQueryDto): Promise<Transfer[]> {
    const qb = this.transfersRepository
      .createQueryBuilder('transfer')
      .where('transfer.userId = :userId', { userId });

    if (query.from) {
      qb.andWhere('transfer.occurredOn >= :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('transfer.occurredOn <= :to', { to: query.to });
    }

    return qb.orderBy('transfer.occurredOn', 'DESC').getMany();
  }
}
