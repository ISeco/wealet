import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fund } from '../funds/entities/fund.entity';
import { HealthProfile } from './entities/health-profile.entity';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [TypeOrmModule.forFeature([HealthProfile, Fund])],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
