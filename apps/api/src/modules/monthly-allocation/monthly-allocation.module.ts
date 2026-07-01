import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity';
import { Fund } from '../funds/entities/fund.entity';
import { HealthProfile } from '../health/entities/health-profile.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { MonthlyAllocation } from './entities/monthly-allocation.entity';
import { MonthlyAllocationController } from './monthly-allocation.controller';
import { MonthlyAllocationService } from './monthly-allocation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MonthlyAllocation,
      Fund,
      Category,
      Transaction,
      HealthProfile,
    ]),
  ],
  controllers: [MonthlyAllocationController],
  providers: [MonthlyAllocationService],
})
export class MonthlyAllocationModule {}
