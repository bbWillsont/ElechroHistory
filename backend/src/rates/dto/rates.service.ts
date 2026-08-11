import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, rates } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueryRatesDto } from './dto/query-rates.dto';
import { toNumber } from '../common/utils/money';

@Injectable()
export class RatesService {
  constructor(private readonly prisma: PrismaService) {}

  async search(q: QueryRatesDto) {
    const { search, catalogId, page = 1, limit = 50 } = q;

    const where: Prisma.ratesWhereInput = {
      is_active: true,
      ...(catalogId ? { catalog_id: catalogId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { code: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.rates.findMany({
        where,
        orderBy: { code: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.rates.count({ where }),
    ]);

    return { data: rows.map((r) => this.serialize(r)), meta: { total, page, limit } };
  }

  async getById(id: string) {
    const r = await this.prisma.rates.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Расценка не найдена');
    return this.serialize(r);
  }

  // snake_case — ровно то, что ждёт фронтенд (rates.api.ts)
  private serialize(r: rates) {
    return {
      id: r.id,
      code: r.code,
      name: r.name,
      unit: r.unit,
      ozp_base: toNumber(r.ozp_base),
      emm_base: toNumber(r.emm_base),
      mat_base: toNumber(r.mat_base),
      nr_rate: toNumber(r.nr_rate),
      sp_rate: toNumber(r.sp_rate),
    };
  }
}
