import { Category } from '../entities/category.entity';
import { CategoryResponseDto } from '../dto/category-response.dto';

export function toCategoryResponseDto(category: Category): CategoryResponseDto {
  return {
    id: category.id,
    name: category.name,
    type: category.type,
    color: category.color,
    isSystem: category.isSystem,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}
