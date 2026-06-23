import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CategoriesService } from './categories.service';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { toCategoryResponseDto } from './mappers/category.mapper';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'List system categories and the user own ones' })
  @ApiOkResponse({ type: CategoryResponseDto, isArray: true })
  @Get()
  async findAll(@CurrentUser() userId: string): Promise<CategoryResponseDto[]> {
    const categories = await this.categoriesService.findAll(userId);
    return categories.map(toCategoryResponseDto);
  }

  @ApiOperation({ summary: 'Create a category' })
  @ApiOkResponse({ type: CategoryResponseDto })
  @Post()
  async create(
    @CurrentUser() userId: string,
    @Body() dto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.create(userId, dto);
    return toCategoryResponseDto(category);
  }

  @ApiOperation({ summary: 'Update a category owned by the current user' })
  @ApiOkResponse({ type: CategoryResponseDto })
  @Patch(':id')
  async update(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.update(userId, id, dto);
    return toCategoryResponseDto(category);
  }

  @ApiOperation({
    summary: 'Delete a category owned by the current user',
  })
  @Delete(':id')
  @HttpCode(204)
  async remove(
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.categoriesService.remove(userId, id);
  }
}
