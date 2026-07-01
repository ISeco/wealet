import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ExportQueryDto } from './dto/export-query.dto';
import { ImportCommitDto } from './dto/import-commit.dto';
import { ImportCommitResultDto } from './dto/import-commit-result.dto';
import { ImportPreviewResponseDto } from './dto/import-preview-response.dto';
import { ImportExportService } from './import-export.service';

@ApiTags('import-export')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
export class ImportExportController {
  constructor(private readonly importExportService: ImportExportService) {}

  @ApiOperation({ summary: 'Parse an uploaded ledger workbook for preview' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ type: ImportPreviewResponseDto })
  @Post('import/preview')
  @UseInterceptors(FileInterceptor('file'))
  async preview(
    @CurrentUser() userId: string,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ImportPreviewResponseDto> {
    if (!file) {
      throw new BadRequestException('A file is required');
    }
    return this.importExportService.preview(userId, file.buffer);
  }

  @ApiOperation({ summary: 'Persist confirmed rows from a previewed import' })
  @ApiOkResponse({ type: ImportCommitResultDto })
  @Post('import/commit')
  async commit(
    @CurrentUser() userId: string,
    @Body() dto: ImportCommitDto,
  ): Promise<ImportCommitResultDto> {
    return this.importExportService.commit(userId, dto.rows);
  }

  @ApiOperation({ summary: 'Export transactions in a date range as .xlsx' })
  @Get('export')
  async export(
    @CurrentUser() userId: string,
    @Query() query: ExportQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const buffer = await this.importExportService.exportToXlsx(
      userId,
      query.from,
      query.to,
    );
    const filename =
      query.from && query.to
        ? `transacciones-${query.from}-${query.to}.xlsx`
        : 'transacciones.xlsx';
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(buffer);
  }
}
