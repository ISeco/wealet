import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ActivityQueryDto } from './dto/activity-query.dto';
import { ActivityService, PaginatedActivity } from './activity.service';

@ApiTags('activity')
@ApiBearerAuth()
@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @ApiOperation({
    summary: 'Unified paginated timeline of transactions and transfers',
  })
  @ApiOkResponse({
    description: 'Paginated activity items sorted by date descending',
  })
  @Get()
  findAll(
    @CurrentUser() userId: string,
    @Query() query: ActivityQueryDto,
  ): Promise<PaginatedActivity> {
    return this.activityService.findAll(userId, query);
  }
}
