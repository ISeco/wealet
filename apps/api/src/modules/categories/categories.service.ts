import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, QueryFailedError, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

const UNIQUE_VIOLATION = '23505';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
  ) {}

  async findAll(userId: string): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: [{ userId: IsNull() }, { userId }],
      order: { isSystem: 'DESC', name: 'ASC' },
    });
  }

  async create(userId: string, dto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create({
      ...dto,
      userId,
      isSystem: false,
    });
    return this.save(category);
  }

  async findOwnedOrThrow(userId: string, id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id, userId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOwnedOrThrow(userId, id);
    Object.assign(category, dto);
    return this.save(category);
  }

  async remove(userId: string, id: string): Promise<void> {
    const category = await this.findOwnedOrThrow(userId, id);
    const transactionCount = await this.transactionsRepository.count({
      where: { categoryId: category.id },
    });
    if (transactionCount > 0) {
      throw new ConflictException(
        'Cannot delete a category with associated transactions',
      );
    }
    await this.categoriesRepository.delete({ id, userId });
  }

  private async save(category: Category): Promise<Category> {
    try {
      return await this.categoriesRepository.save(category);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & { code?: string }).code ===
          UNIQUE_VIOLATION
      ) {
        throw new ConflictException(
          'A category with this name and type already exists',
        );
      }
      throw error;
    }
  }
}
