import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Workbook } from 'exceljs';
import { In, Repository } from 'typeorm';
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
    year?: number,
  ): Promise<ImportPreviewResponseDto> {
    const parsed = await parseLedgerWorkbook(buffer, { year });

    if (parsed.needsYear) {
      return {
        rows: [],
        openingBalances: [],
        unknownFunds: [],
        errors: [],
        needsYear: true,
      };
    }

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
      needsYear: false,
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
    from?: string,
    to?: string,
  ): Promise<Buffer> {
    const transactions = await this.transactionsRepository.find({
      where: { userId },
      relations: { fund: true, category: true },
      order: { occurredOn: 'ASC' },
    });

    const filtered =
      from && to
        ? transactions.filter((t) => t.occurredOn >= from && t.occurredOn <= to)
        : transactions;

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Transacciones');
    worksheet.columns = [
      { header: 'Fecha', key: 'fecha' },
      { header: 'Fondo', key: 'fondo' },
      { header: 'Categoria', key: 'categoria' },
      { header: 'Tipo', key: 'tipo' },
      { header: 'Monto', key: 'monto' },
      { header: 'Descripcion', key: 'descripcion' },
    ];
    worksheet.addRows(
      filtered.map((transaction) => ({
        fecha: transaction.occurredOn,
        fondo: transaction.fund.name,
        categoria: transaction.category.name,
        tipo: transaction.type,
        monto:
          Number(transaction.amount) *
          (transaction.type === TransactionType.EXPENSE ? -1 : 1),
        descripcion: transaction.description ?? '',
      })),
    );
    return Buffer.from(await workbook.xlsx.writeBuffer());
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
