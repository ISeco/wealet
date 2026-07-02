import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from '../health/health.module';
import { Fund } from './entities/fund.entity';
import { FundsController } from './funds.controller';
import { FundsService } from './funds.service';

@Module({
  imports: [TypeOrmModule.forFeature([Fund]), HealthModule],
  controllers: [FundsController],
  providers: [FundsService],
  exports: [FundsService],
})
export class FundsModule {}
