import { http } from './client';
import { Rate } from '../modules/estimates/types';

export interface RatesQuery {
  search?: string;
  catalogId?: number;
  page?: number;
  limit?: number;
}

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number };
}

// DTO с бэкенда (snake_case) → фронтенд-модель (camelCase)
interface RateDto {
  id: string;
  code: string;
  name: string;
  unit: string;
  ozp_base: number;
  emm_base: number;
  mat_base: number;
  nr_rate: number;
  sp_rate: number;
}

const toRate = (d: RateDto): Rate => ({
  id: d.id,
  code: d.code,
  name: d.name,
  unit: d.unit,
  ozpBase: d.ozp_base,
  emmBase: d.emm_base,
  matBase: d.mat_base,
  nrRate: d.nr_rate,
  spRate: d.sp_rate,
});

export const ratesApi = {
  search: async (q: RatesQuery): Promise<Paginated<Rate>> => {
    const res = await http.get<Paginated<RateDto>>('/rates', {
      search: q.search,
      catalogId: q.catalogId,
      page: q.page ?? 1,
      limit: q.limit ?? 50,
    });
    return { ...res, data: res.data.map(toRate) };
  },

  getById: async (id: string): Promise<Rate> =>
    toRate(await http.get<RateDto>(`/rates/${id}`)),
};
