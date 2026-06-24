import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { TransactionType } from '../../common/enums/transaction-type.enum';
import { Category } from '../categories/entities/category.entity';
import { Fund, FundClassification } from '../funds/entities/fund.entity';
import {
  Transaction,
  TransactionSource,
} from '../transactions/entities/transaction.entity';
import { ImportCommitResultDto } from './dto/import-commit-result.dto';
import { ImportRowDto } from './dto/import-row.dto';
import { ImportPreviewResponseDto } from './dto/import-preview-response.dto';
import { parseLedgerWorkbook } from './parsers/excel-ledger.parser';

const IMPORTED_CATEGORY_NAME = 'Importado';
const DEFAULT_CURRENCY = 'CLP';

@Injectable()
export class ImportExportService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(Fund)
    private readonly fundsRepository: Repository<Fund>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async preview(
    userId: string,
    buffer: Buffer,
  ): Promise<ImportPreviewResponseDto> {
    const parsed = parseLedgerWorkbook(buffer);

    const existingFunds = await this.fundsRepository.find({
      where: { userId },
    });
    const existingFundNames = new Set(
      existingFunds.map((fund) => fund.name.trim().toLowerCase()),
    );
    const unknownFunds = parsed.fundNames.filter(
      (name) => !existingFundNames.has(name.trim().toLowerCase()),
    );

    const existingHashes = await this.getExistingDedupeHashes(
      userId,
      parsed.rows.map((row) => row.dedupeHash),
    );

    const rows: ImportRowDto[] = parsed.rows.map((row) => ({
      ...row,
      duplicate: existingHashes.has(row.dedupeHash),
    }));

    return {
      rows,
      openingBalances: parsed.openingBalances,
      unknownFunds,
      errors: parsed.errors,
    };
  }

  async commit(
    userId: string,
    rows: ImportRowDto[],
  ): Promise<ImportCommitResultDto> {
    const candidateRows = rows.filter((row) => !row.duplicate);
    const existingHashes = await this.getExistingDedupeHashes(
      userId,
      candidateRows.map((row) => row.dedupeHash),
    );
    const newRows = candidateRows.filter(
      (row) => !existingHashes.has(row.dedupeHash),
    );

    const { byName: fundByName, createdNames: createdFunds } =
      await this.resolveFunds(userId, newRows);
    const categoryByType = await this.resolveImportedCategories(userId);

    const transactions = newRows.map((row) =>
      this.transactionsRepository.create({
        userId,
        fundId: fundByName.get(row.fundName.trim().toLowerCase())!.id,
        categoryId: categoryByType.get(row.type)!.id,
        type: row.type,
        amount: row.amount,
        currency: DEFAULT_CURRENCY,
        description: row.description,
        occurredOn: row.occurredOn,
        dedupeHash: row.dedupeHash,
        source: TransactionSource.IMPORT,
      }),
    );

    if (transactions.length > 0) {
      await this.transactionsRepository.save(transactions);
    }

    return {
      imported: transactions.length,
      skippedDuplicates: rows.length - newRows.length,
      createdFunds,
    };
  }

  async exportToXlsx(
    userId: string,
    from: string,
    to: string,
  ): Promise<Buffer> {
    const transactions = await this.transactionsRepository.find({
      where: { userId },
      relations: { fund: true, category: true },
      order: { occurredOn: 'ASC' },
    });

    const filtered = transactions.filter(
      (transaction) =>
        transaction.occurredOn >= from && transaction.occurredOn <= to,
    );

    const sheetRows = filtered.map((transaction) => ({
      Fecha: transaction.occurredOn,
      Fondo: transaction.fund.name,
      Categoria: transaction.category.name,
      Tipo: transaction.type,
      Monto:
        Number(transaction.amount) *
        (transaction.type === TransactionType.EXPENSE ? -1 : 1),
      Descripcion: transaction.description ?? '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(sheetRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transacciones');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }

  private async getExistingDedupeHashes(
    userId: string,
    hashes: string[],
  ): Promise<Set<string>> {
    if (hashes.length === 0) {
      return new Set();
    }
    const existing = await this.transactionsRepository.find({
      where: { userId, dedupeHash: In(hashes) },
      select: { dedupeHash: true },
    });
    return new Set(existing.map((t) => t.dedupeHash!));
  }

  private async resolveFunds(
    userId: string,
    rows: ImportRowDto[],
  ): Promise<{ byName: Map<string, Fund>; createdNames: string[] }> {
    const distinctNames = Array.from(
      new Set(rows.map((row) => row.fundName.trim())),
    );
    const existingFunds = await this.fundsRepository.find({
      where: { userId },
    });
    const byName = new Map(
      existingFunds.map((fund) => [fund.name.trim().toLowerCase(), fund]),
    );

    const toCreate = distinctNames.filter(
      (name) => !byName.has(name.toLowerCase()),
    );
    if (toCreate.length > 0) {
      const created = await this.fundsRepository.save(
        toCreate.map((name) =>
          this.fundsRepository.create({
            userId,
            name,
            classification: FundClassification.AVAILABLE,
          }),
        ),
      );
      for (const fund of created) {
        byName.set(fund.name.trim().toLowerCase(), fund);
      }
    }

    return { byName, createdNames: toCreate };
  }

  private async resolveImportedCategories(
    userId: string,
  ): Promise<Map<TransactionType, Category>> {
    const result = new Map<TransactionType, Category>();
    for (const type of [TransactionType.INCOME, TransactionType.EXPENSE]) {
      let category = await this.categoriesRepository.findOne({
        where: { userId, name: IMPORTED_CATEGORY_NAME, type },
      });
      if (!category) {
        category = await this.categoriesRepository.save(
          this.categoriesRepository.create({
            userId,
            name: IMPORTED_CATEGORY_NAME,
            type,
            isSystem: false,
          }),
        );
      }
      result.set(type, category);
    }
    return result;
  }
}
