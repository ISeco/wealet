import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fund } from '../funds/entities/fund.entity';
import { Transfer } from './entities/transfer.entity';
import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transfer, Fund])],
  controllers: [TransfersController],
  providers: [TransfersService],
})
export class TransfersModule {}
