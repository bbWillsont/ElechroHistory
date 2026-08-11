import { http } from './client';
import { Estimate, EstimateItem, EstimateStatus } from '../modules/estimates/types';

export interface EstimatesQuery {
  projectId?: string;
  status?: EstimateStatus;
}

interface ItemDto {
  id: string;
  rate_id?: string;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  price_ozp: number;
  price_emm: number;
  price_mat: number;
  nr_rate: number;
  sp_rate: number;
}

interface EstimateDto {
  id: string;
  project_id: string;
  name: string;
  status: EstimateStatus;
  vat_rate: number;
  vat_mode: 'on_top' | 'included' | 'none';
  complexity_factor: number;
  urgency_factor: number;
  grand_total: number;
  updated_at: string;
  items: ItemDto[];
}

const toItem = (d: ItemDto): EstimateItem => ({
  id: d.id,
  rateId: d.rate_id,
  code: d.code,
  name: d.name,
  unit: d.unit,
  quantity: d.quantity,
  priceOzp: d.price_ozp,
  priceEmm: d.price_emm,
  priceMat: d.price_mat,
  nrRate: d.nr_rate,
  spRate: d.sp_rate,
});

const toEstimate = (d: EstimateDto): Estimate => ({
  id: d.id,
  projectId: d.project_id,
  name: d.name,
  status: d.status,
  vatRate: d.vat_rate,
  vatMode: d.vat_mode,
  complexityFactor: d.complexity_factor,
  urgencyFactor: d.urgency_factor,
  grandTotal: d.grand_total,
  updatedAt: d.updated_at,
  items: (d.items ?? []).map(toItem),
});

export const estimatesApi = {
  list: async (q: EstimatesQuery = {}): Promise<Estimate[]> => {
    const res = await http.get<EstimateDto[]>('/estimates', {
      projectId: q.projectId,
      status: q.status,
    });
    return res.map(toEstimate);
  },

  getById: async (id: string): Promise<Estimate> =>
    toEstimate(await http.get<EstimateDto>(`/estimates/${id}`)),

  create: (payload: Partial<Estimate>) =>
    http.post<EstimateDto>('/estimates', {
      project_id: payload.projectId,
      name: payload.name,
      vat_rate: payload.vatRate ?? 20,
      vat_mode: payload.vatMode ?? 'on_top',
    }).then(toEstimate),

  update: (id: string, payload: Partial<Estimate>) =>
    http.patch<EstimateDto>(`/estimates/${id}`, {
      name: payload.name,
      status: payload.status,
      vat_rate: payload.vatRate,
      vat_mode: payload.vatMode,
    }).then(toEstimate),

  /** Точечная смена статуса — используется Kanban-доской */
  changeStatus: (id: string, status: EstimateStatus) =>
    http.patch<EstimateDto>(`/estimates/${id}`, { status }).then(toEstimate),

  remove: (id: string) => http.delete<void>(`/estimates/${id}`),

  // --- Позиции ---
  addItem: (estimateId: string, item: Partial<EstimateItem>) =>
    http.post<ItemDto>(`/estimates/${estimateId}/items`, {
      rate_id: item.rateId,
      code: item.code,
      name: item.name,
      unit: item.unit,
      quantity: item.quantity,
      price_ozp: item.priceOzp,
      price_emm: item.priceEmm,
      price_mat: item.priceMat,
      nr_rate: item.nrRate,
      sp_rate: item.spRate,
    }).then(toItem),

  updateItem: (estimateId: string, itemId: string, patch: Partial<EstimateItem>) =>
    http.patch<ItemDto>(`/estimates/${estimateId}/items/${itemId}`, {
      quantity: patch.quantity,
      price_ozp: patch.priceOzp,
      price_emm: patch.priceEmm,
      price_mat: patch.priceMat,
    }).then(toItem),

  removeItem: (estimateId: string, itemId: string) =>
    http.delete<void>(`/estimates/${estimateId}/items/${itemId}`),
};
