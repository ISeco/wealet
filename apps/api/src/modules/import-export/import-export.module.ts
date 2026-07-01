import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity';
import { Fund } from '../funds/entities/fund.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { ImportExportController } from './import-export.controller';
import { ImportExportService } from './import-export.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Fund, Category])],
  controllers: [ImportExportController],
  providers: [ImportExportService],
})
export class ImportExportModule {}
