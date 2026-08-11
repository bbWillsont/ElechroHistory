import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { EstimatesService } from './estimates.service';
import { TenantId } from '../common/decorators/tenant.decorator';
import { CreateEstimateDto } from './dto/create-estimate.dto';
import { UpdateEstimateDto, EstimateStatus } from './dto/update-estimate.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('estimates')
export class EstimatesController {
  constructor(private readonly estimatesService: EstimatesService) {}

  @Get()
  list(
    @TenantId() tenantId: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: EstimateStatus,
  ) {
    return this.estimatesService.list(tenantId, projectId, status);
  }

  @Get(':id')
  getById(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.estimatesService.getById(tenantId, id);
  }

  @Post()
  create(@TenantId() tenantId: string, @Body() dto: CreateEstimateDto) {
    return this.estimatesService.create(tenantId, dto);
  }

  @Patch(':id')
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEstimateDto,
  ) {
    return this.estimatesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.estimatesService.remove(tenantId, id);
  }

  // ---------- Позиции ----------

  @Post(':id/items')
  addItem(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateItemDto,
  ) {
    return this.estimatesService.addItem(tenantId, id, dto);
  }

  @Patch(':id/items/:itemId')
  updateItem(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.estimatesService.updateItem(tenantId, id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  @HttpCode(204)
  removeItem(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.estimatesService.removeItem(tenantId, id, itemId);
  }
}
