import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { formatMoney } from '../../common/money/money';
import { ActivityQueryDto } from './dto/activity-query.dto';

export interface ActivityItem {
  type: 'transaction' | 'transfer';
  id: string;
  amount: string;
  amountFormatted: string;
  currency: string;
  occurredOn: string;
  createdAt: Date;
  // transaction-specific
  description?: string | null;
  subtype?: 'income' | 'expense';
  fundId?: string;
  categoryId?: string;
  source?: 'manual' | 'import';
  updatedAt?: Date;
  // transfer-specific
  fromFundId?: string;
  toFundId?: string;
  note?: string | null;
}

export interface PaginatedActivity {
  data: ActivityItem[];
  total: number;
  page: number;
  limit: number;
}

// Raw row returned by the UNION query (snake_case from Postgres)
interface RawActivityRow {
  type: 'transaction' | 'transfer';
  id: string;
  amount: string;
  currency: string;
  occurred_on: string;
  description: string | null;
  subtype: string | null;
  fund_id: string | null;
  category_id: string | null;
  from_fund_id: string | null;
  to_fund_id: string | null;
  source: string | null;
  created_at: Date;
  updated_at: Date | null;
}

const UNION_CTE = `
  WITH tx AS (
    SELECT
      'transaction'::text     AS type,
      id,
      amount::text,
      currency,
      occurred_on,
      description,
      type::text              AS subtype,
      fund_id,
      category_id,
      NULL::uuid              AS from_fund_id,
      NULL::uuid              AS to_fund_id,
      source::text,
      created_at,
      updated_at
    FROM transactions
    WHERE user_id = $1
      AND ($2::date IS NULL OR occurred_on >= $2::date)
      AND ($3::date IS NULL OR occurred_on <= $3::date)
      AND ($4::text IS NULL OR description ILIKE '%' || $4 || '%')
      AND ($5::text IS NULL OR $5 = 'transaction')
      AND ($6::text IS NULL OR type::text = $6)
      AND ($7::uuid IS NULL OR fund_id = $7::uuid)
      AND ($8::uuid IS NULL OR category_id = $8::uuid)
  ),
  tr AS (
    SELECT
      'transfer'::text        AS type,
      id,
      amount::text,
      currency,
      occurred_on,
      note                    AS description,
      NULL::text              AS subtype,
      NULL::uuid              AS fund_id,
      NULL::uuid              AS category_id,
      from_fund_id,
      to_fund_id,
      NULL::text              AS source,
      created_at,
      NULL::timestamptz       AS updated_at
    FROM transfers
    WHERE user_id = $1
      AND ($2::date IS NULL OR occurred_on >= $2::date)
      AND ($3::date IS NULL OR occurred_on <= $3::date)
      AND ($4::text IS NULL OR note ILIKE '%' || $4 || '%')
      AND ($5::text IS NULL OR $5 = 'transfer')
      AND $6::text IS NULL
      AND $7::uuid IS NULL
      AND $8::uuid IS NULL
  ),
  combined AS (SELECT * FROM tx UNION ALL SELECT * FROM tr)
`;

@Injectable()
export class ActivityService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findAll(
    userId: string,
    query: ActivityQueryDto,
  ): Promise<PaginatedActivity> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    const params = [
      userId,
      query.from ?? null,
      query.to ?? null,
      query.q ?? null,
      query.type ?? null,
      query.subtype ?? null,
      query.fundId ?? null,
      query.categoryId ?? null,
    ];

    const [rows, countRows] = (await Promise.all([
      this.dataSource.query(
        `${UNION_CTE} SELECT * FROM combined ORDER BY occurred_on DESC, created_at DESC LIMIT $9 OFFSET $10`,
        [...params, limit, offset],
      ),
      this.dataSource.query(
        `${UNION_CTE} SELECT COUNT(*)::text AS total FROM combined`,
        params,
      ),
    ])) as [RawActivityRow[], [{ total: string }]];
    const [{ total }] = countRows;

    return {
      data: rows.map((row) => this.toActivityItem(row)),
      total: parseInt(total, 10),
      page,
      limit,
    };
  }

  private toActivityItem(row: RawActivityRow): ActivityItem {
    const base = {
      type: row.type,
      id: row.id,
      amount: row.amount,
      amountFormatted: formatMoney(row.amount, row.currency),
      currency: row.currency,
      occurredOn: row.occurred_on,
      createdAt: row.created_at,
    };

    if (row.type === 'transfer') {
      return {
        ...base,
        fromFundId: row.from_fund_id!,
        toFundId: row.to_fund_id!,
        note: row.description,
      };
    }

    return {
      ...base,
      description: row.description,
      subtype: row.subtype as 'income' | 'expense',
      fundId: row.fund_id!,
      categoryId: row.category_id!,
      source: row.source as 'manual' | 'import',
      updatedAt: row.updated_at ?? undefined,
    };
  }
}
