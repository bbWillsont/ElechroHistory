import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, estimates, estimate_items, estimate_status } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEstimateDto } from './dto/create-estimate.dto';
import { UpdateEstimateDto, EstimateStatus } from './dto/update-estimate.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { toNumber } from '../common/utils/money';

// Цепочка из скилла: Черновик → На согласовании → Утверждена → В работе → Закрыта
const ORDER: EstimateStatus[] = ['draft', 'in_review', 'approved', 'in_progress', 'closed'];

function canTransition(from: estimate_status, to: EstimateStatus): boolean {
  if (from === to) return false;
  const i = ORDER.indexOf(from as EstimateStatus);
  const j = ORDER.indexOf(to);
  if (i === -1 || j === -1) return false;
  return Math.abs(i - j) === 1; // разрешён шаг вперёд/назад
}

@Injectable()
export class EstimatesService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- Сметы ----------

  async list(tenantId: string, projectId?: string, status?: EstimateStatus) {
    const rows = await this.prisma.estimates.findMany({
      where: {
        tenant_id: tenantId,
        ...(projectId ? { project_id: projectId } : {}),
        ...(status ? { status } : {}),
      },
      include: { estimate_items: { orderBy: { position: 'asc' } } },
      orderBy: { updated_at: 'desc' },
    });
    return rows.map((e) => this.serialize(e));
  }

  async getById(tenantId: string, id: string) {
    const e = await this.prisma.estimates.findFirst({
      where: { id, tenant_id: tenantId },
      include: { estimate_items: { orderBy: { position: 'asc' } } },
    });
    if (!e) throw new NotFoundException('Смета не найдена');
    return this.serialize(e);
  }

  async create(tenantId: string, dto: CreateEstimateDto) {
    const created = await this.prisma.estimates.create({
      data: {
        tenant_id: tenantId,
        project_id: dto.project_id,
        name: dto.name,
        vat_rate: dto.vat_rate ?? 20,
        vat_mode: dto.vat_mode ?? 'on_top',
        status: 'draft',
      },
      include: { estimate_items: true },
    });
    await this.logAudit(tenantId, 'estimate', created.id, 'create', dto);
    return this.serialize(created);
  }

  async update(tenantId: string, id: string, dto: UpdateEstimateDto) {
    const existing = await this.ensureEstimate(tenantId, id);

    // Валидация перехода статуса (используется Kanban-доской)
    if (dto.status && dto.status !== existing.status && !canTransition(existing.status, dto.status)) {
      throw new BadRequestException(
        `Недопустимый переход статуса: ${existing.status} → ${dto.status}`,
      );
    }

    const updated = await this.prisma.estimates.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.vat_rate !== undefined ? { vat_rate: dto.vat_rate } : {}),
        ...(dto.vat_mode !== undefined ? { vat_mode: dto.vat_mode } : {}),
      },
      include: { estimate_items: { orderBy: { position: 'asc' } } },
    });

    await this.logAudit(tenantId, 'estimate', id, 'update', dto);
    return this.serialize(updated);
  }

  async remove(tenantId: string, id: string) {
    await this.ensureEstimate(tenantId, id);
    await this.prisma.estimates.delete({ where: { id } });
    await this.logAudit(tenantId, 'estimate', id, 'delete', {});
  }

  // ---------- Позиции ----------

  async addItem(tenantId: string, estimateId: string, dto: CreateItemDto) {
    await this.ensureEstimate(tenantId, estimateId);

    const data: Prisma.estimate_itemsCreateInput = {
      estimate: { connect: { id: estimateId } },
      name: dto.name,
      unit: dto.unit,
      quantity: dto.quantity,
      code: dto.code,
      price_ozp: dto.price_ozp ?? 0,
      price_emm: dto.price_emm ?? 0,
      price_mat: dto.price_mat ?? 0,
      nr_rate: dto.nr_rate,
      sp_rate: dto.sp_rate,
    };

    // Если указан rate_id и цены не заданы вручную — подтягиваем из расценки
    if (dto.rate_id) {
      const rate = await this.prisma.rates.findUnique({ where: { id: dto.rate_id } });
      if (rate) {
        data.code = dto.code ?? rate.code;
        if (!dto.name) data.name = rate.name;
        data.price_ozp = dto.price_ozp ?? toNumber(rate.ozp_base);
        data.price_emm = dto.price_emm ?? toNumber(rate.emm_base);
        data.price_mat = dto.price_mat ?? toNumber(rate.mat_base);
        data.nr_rate = dto.nr_rate ?? toNumber(rate.nr_rate);
        data.sp_rate = dto.sp_rate ?? toNumber(rate.sp_rate);
      }
    }

    const item = await this.prisma.estimate_items.create({ data });
    return this.serializeItem(item);
  }

  async updateItem(tenantId: string, estimateId: string, itemId: string, dto: UpdateItemDto) {
    await this.ensureEstimate(tenantId, estimateId);
    const item = await this.prisma.estimate_items.update({
      where: { id: itemId },
      data: {
        ...(dto.quantity !== undefined ? { quantity: dto.quantity } : {}),
        ...(dto.price_ozp !== undefined ? { price_ozp: dto.price_ozp } : {}),
        ...(dto.price_emm !== undefined ? { price_emm: dto.price_emm } : {}),
        ...(dto.price_mat !== undefined ? { price_mat: dto.price_mat } : {}),
      },
    });
    return this.serializeItem(item);
  }

  async removeItem(tenantId: string, estimateId: string, itemId: string) {
    await this.ensureEstimate(tenantId, estimateId);
    await this.prisma.estimate_items.delete({ where: { id: itemId } });
  }

  // ---------- Вспомогательные ----------

  private async ensureEstimate(tenantId: string, estimateId: string): Promise<estimates> {
    const e = await this.prisma.estimates.findFirst({
      where: { id: estimateId, tenant_id: tenantId },
    });
    if (!e) throw new NotFoundException('Смета не найдена');
    return e;
  }

  private async logAudit(tenantId: string, entityType: string, entityId: string, action: string, details: object) {
    try {
      await this.prisma.audit_log.create({
        data: { tenant_id: tenantId, entity_type: entityType, entity_id: entityId, action, details: details as any },
      });
    } catch (e) {
      // Аудит не должен ронять основной поток
      console.warn('audit_log write failed', e);
    }
  }

  // ---------- Сериализация (snake_case под фронтенд) ----------

  private serializeItem(i: estimate_items) {
    return {
      id: i.id,
      rate_id: i.rate_id ?? undefined,
      code: i.code,
      name: i.name,
      unit: i.unit,
      quantity: toNumber(i.quantity),
      price_ozp: toNumber(i.price_ozp),
      price_emm: toNumber(i.price_emm),
      price_mat: toNumber(i.price_mat),
      nr_rate: toNumber(i.nr_rate),
      sp_rate: toNumber(i.sp_rate),
    };
  }

  private serialize(e: estimates & { estimate_items: estimate_items[] }) {
    return {
      id: e.id,
      project_id: e.project_id,
      name: e.name,
      status: e.status,
      vat_rate: toNumber(e.vat_rate),
      vat_mode: e.vat_mode,
      complexity_factor: toNumber(e.complexity_factor),
      urgency_factor: toNumber(e.urgency_factor),
      grand_total: toNumber(e.grand_total),
      updated_at: e.updated_at,
      items: (e.estimate_items ?? []).map((i) => this.serializeItem(i)),
    };
  }
}
