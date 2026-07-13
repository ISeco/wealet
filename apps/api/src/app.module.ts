import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import { envValidationSchema } from './config/env.validation';
import { ActivityModule } from './modules/activity/activity.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { FundsModule } from './modules/funds/funds.module';
import { HealthModule } from './modules/health/health.module';
import { ImportExportModule } from './modules/import-export/import-export.module';
import { MonthlyAllocationModule } from './modules/monthly-allocation/monthly-allocation.module';
import { ReportsModule } from './modules/reports/reports.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      load: [databaseConfig, authConfig],
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('database')!,
    }),
    UsersModule,
    AuthModule,
    FundsModule,
    CategoriesModule,
    TransactionsModule,
    TransfersModule,
    ActivityModule,
    ReportsModule,
    HealthModule,
    ImportExportModule,
    MonthlyAllocationModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
