import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CashFlowPointDto } from './dto/cash-flow-point.dto';

@Injectable()
export class ReportsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getCashFlow(
    userId: string,
    months: number,
  ): Promise<CashFlowPointDto[]> {
    return this.dataSource.query(
      `WITH window_months AS (
         SELECT generate_series(
           date_trunc('month', CURRENT_DATE) - ($2::int - 1) * INTERVAL '1 month',
           date_trunc('month', CURRENT_DATE),
           INTERVAL '1 month'
         ) AS month
       ),
       monthly_flow AS (
         SELECT date_trunc('month', occurred_on) AS month,
           SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
           SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
         FROM transactions
         WHERE user_id = $1
         GROUP BY 1
       )
       SELECT
         to_char(w.month, 'YYYY-MM-DD') AS month,
         COALESCE(mf.income, 0)::text AS income,
         COALESCE(mf.expense, 0)::text AS expense
       FROM window_months w
       LEFT JOIN monthly_flow mf ON mf.month = w.month
       ORDER BY w.month`,
      [userId, months],
    );
  }
}
