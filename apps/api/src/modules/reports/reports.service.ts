import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CashFlowPointDto } from './dto/cash-flow-point.dto';
import { CategoryBreakdownPointDto } from './dto/category-breakdown-point.dto';
import { NetWorthResponseDto } from './dto/net-worth-response.dto';
import { RunwayResponseDto } from './dto/runway-response.dto';
import { SummaryResponseDto } from './dto/summary-response.dto';

interface ClassificationBalanceRow {
  classification: 'available' | 'reserve' | 'committed';
  balance: string;
}

const CLASSIFICATIONS: Array<'available' | 'reserve' | 'committed'> = [
  'available',
  'reserve',
  'committed',
];

@Injectable()
export class ReportsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getAvailableMonths(userId: string): Promise<string[]> {
    const rows: Array<{ month: string }> = await this.dataSource.query(
      `SELECT DISTINCT to_char(date_trunc('month', occurred_on), 'YYYY-MM') AS month
       FROM transactions
       WHERE user_id = $1
         AND occurred_on >= date_trunc('month', CURRENT_DATE) - INTERVAL '12 months'
       ORDER BY month DESC`,
      [userId],
    );
    return rows.map((r) => r.month);
  }

  async getSummary(
    userId: string,
    from: string,
    to: string,
    month?: string,
  ): Promise<SummaryResponseDto> {
    const [[balanceRow], [flowRow]] = await Promise.all([
      this.dataSource.query<Array<{ balance: string }>>(
        `SELECT COALESCE(SUM(m.amount), 0)::text AS balance
         FROM (
           SELECT CASE WHEN type = 'income' THEN amount ELSE -amount END AS amount
           FROM transactions WHERE user_id = $1 AND occurred_on <= $2
           UNION ALL
           SELECT amount FROM transfers WHERE user_id = $1 AND occurred_on <= $2
           UNION ALL
           SELECT -amount FROM transfers WHERE user_id = $1 AND occurred_on <= $2
         ) m`,
        [userId, to],
      ),
      this.dataSource.query<Array<{ income: string; expense: string }>>(
        `SELECT
           COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)::text AS income,
           COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::text AS expense
         FROM transactions
         WHERE user_id = $1 AND occurred_on BETWEEN $2 AND $3`,
        [userId, from, to],
      ),
    ]);

    const { balance } = balanceRow;
    const { income, expense } = flowRow;

    if (!month) return { balance, income, expense };

    const prevFrom = this.prevMonthFirstDay(month);
    const prevTo = this.prevMonthLastDay(month);
    const [{ expense: previousExpense }] = await this.dataSource.query<
      Array<{ expense: string }>
    >(
      `SELECT COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::text AS expense
       FROM transactions WHERE user_id = $1 AND occurred_on BETWEEN $2 AND $3`,
      [userId, prevFrom, prevTo],
    );

    const prevNum = Number(previousExpense);
    const expenseChangePercent =
      prevNum !== 0 ? ((Number(expense) - prevNum) / prevNum) * 100 : null;

    return { balance, income, expense, previousExpense, expenseChangePercent };
  }

  async getByCategory(
    userId: string,
    from: string,
    to: string,
  ): Promise<CategoryBreakdownPointDto[]> {
    const rows: Array<{
      category_id: string;
      category_name: string;
      color: string | null;
      amount: string;
    }> = await this.dataSource.query(
      `SELECT c.id AS category_id, c.name AS category_name, c.color,
         COALESCE(SUM(t.amount), 0)::text AS amount
       FROM categories c
       JOIN transactions t ON t.category_id = c.id
       WHERE t.user_id = $1 AND t.type = 'expense'
         AND t.occurred_on BETWEEN $2 AND $3
       GROUP BY c.id, c.name, c.color
       ORDER BY SUM(t.amount) DESC`,
      [userId, from, to],
    );

    return rows.map((row) => ({
      categoryId: row.category_id,
      categoryName: row.category_name,
      color: row.color,
      amount: row.amount,
    }));
  }

  async getNetWorth(
    userId: string,
    month?: string,
  ): Promise<NetWorthResponseDto> {
    const asOf = month ? this.monthLastDay(month) : undefined;
    const current = await this.getNetWorthAsOf(userId, asOf);

    if (!month) return current;

    const prevAsOf = this.prevMonthLastDay(month);
    const previous = await this.getNetWorthAsOf(userId, prevAsOf);

    const prevNum = Number(previous.total);
    const changePercent =
      prevNum !== 0
        ? ((Number(current.total) - prevNum) / prevNum) * 100
        : null;

    return {
      ...current,
      previousTotal: previous.total,
      changePercent,
    };
  }

  async getRunway(userId: string): Promise<RunwayResponseDto> {
    const [{ cushion }]: Array<{ cushion: string }> =
      await this.dataSource.query(
        `SELECT COALESCE(SUM(m.amount), 0)::text AS cushion
         FROM funds f
         LEFT JOIN (
           SELECT fund_id, CASE WHEN type = 'income' THEN amount ELSE -amount END AS amount
           FROM transactions WHERE user_id = $1
           UNION ALL
           SELECT to_fund_id AS fund_id, amount FROM transfers WHERE user_id = $1
           UNION ALL
           SELECT from_fund_id AS fund_id, -amount FROM transfers WHERE user_id = $1
         ) m ON m.fund_id = f.id
         WHERE f.user_id = $1 AND f.counts_for_runway = true AND f.archived_at IS NULL`,
        [userId],
      );

    const [{ monthly_burn: monthlyBurn }]: Array<{ monthly_burn: string }> =
      await this.dataSource.query(
        `SELECT COALESCE(ROUND(SUM(amount) / 3.0), 0)::text AS monthly_burn
         FROM transactions
         WHERE user_id = $1 AND type = 'expense'
           AND occurred_on >= date_trunc('month', CURRENT_DATE) - INTERVAL '3 months'
           AND occurred_on < date_trunc('month', CURRENT_DATE)`,
        [userId],
      );

    const burn = Number(monthlyBurn);
    const months =
      burn > 0 ? Number((Number(cushion) / burn).toFixed(1)) : null;

    return { cushion, monthlyBurn, months };
  }

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

  private async getNetWorthAsOf(
    userId: string,
    asOf?: string,
  ): Promise<{
    available: string;
    reserve: string;
    committed: string;
    total: string;
  }> {
    const dateClause = asOf ? ' AND occurred_on <= $2' : '';
    const params: unknown[] = asOf ? [userId, asOf] : [userId];

    const rows: ClassificationBalanceRow[] = await this.dataSource.query(
      `SELECT f.classification,
         COALESCE(SUM(m.amount), 0)::text AS balance
       FROM funds f
       LEFT JOIN (
         SELECT fund_id, CASE WHEN type = 'income' THEN amount ELSE -amount END AS amount
         FROM transactions WHERE user_id = $1${dateClause}
         UNION ALL
         SELECT to_fund_id AS fund_id, amount FROM transfers WHERE user_id = $1${dateClause}
         UNION ALL
         SELECT from_fund_id AS fund_id, -amount FROM transfers WHERE user_id = $1${dateClause}
       ) m ON m.fund_id = f.id
       WHERE f.user_id = $1
       GROUP BY f.classification`,
      params,
    );

    const balanceByClassification = new Map(
      rows.map((row) => [row.classification, row.balance]),
    );

    const [available, reserve, committed] = CLASSIFICATIONS.map(
      (c) => balanceByClassification.get(c) ?? '0',
    );

    const total = (
      BigInt(available) +
      BigInt(reserve) +
      BigInt(committed)
    ).toString();

    return { available, reserve, committed, total };
  }

  private monthLastDay(month: string): string {
    const [year, m] = month.split('-').map(Number);
    const lastDay = new Date(year, m, 0).getDate();
    return `${month}-${String(lastDay).padStart(2, '0')}`;
  }

  private prevMonthLastDay(month: string): string {
    const [year, m] = month.split('-').map(Number);
    const prevDate = new Date(year, m - 1, 0);
    const y = prevDate.getFullYear();
    const mo = String(prevDate.getMonth() + 1).padStart(2, '0');
    const d = String(prevDate.getDate()).padStart(2, '0');
    return `${y}-${mo}-${d}`;
  }

  private prevMonthFirstDay(month: string): string {
    const [year, m] = month.split('-').map(Number);
    const prevDate = new Date(year, m - 1, 0);
    const y = prevDate.getFullYear();
    const mo = String(prevDate.getMonth() + 1).padStart(2, '0');
    return `${y}-${mo}-01`;
  }
}
