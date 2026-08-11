export type VatMode = 'on_top' | 'included' | 'none';
export type EstimateStatus = 'draft' | 'in_review' | 'approved' | 'in_progress' | 'closed' | 'rejected';

export interface Rate {
  id: string;
  code: string;            // "ФЕРм 08-02-134-01"
  name: string;
  unit: string;
  ozpBase: number;
  emmBase: number;
  matBase: number;
  nrRate: number;          // % НР
  spRate: number;          // % СП
}

export interface EstimateItem {
  id: string;
  tempId?: string;         // для новых позиций до сохранения
  rateId?: string;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  priceOzp: number;
  priceEmm: number;
  priceMat: number;
  nrRate: number;
  spRate: number;
}

export interface Estimate {
  id: string;
  projectId: string;
  name: string;
  status: EstimateStatus;
  vatRate: number;
  vatMode: VatMode;
  complexityFactor: number;
  urgencyFactor: number;
  items: EstimateItem[];
}

export interface EstimateTotals {
  ozp: number; emm: number; mat: number; direct: number;
  nr: number; sp: number; beforeVat: number; vat: number; grand: number;
}

// --- AI ---
export type AiAvailability = 'ready' | 'degraded' | 'disabled';

export interface AiSuggestion {
  rateId?: string;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  reason?: string;         // почему ИИ предложил
  source: 'ai' | 'fallback';  // кто подобрал: ИИ или локальный поиск
}

export interface AiResult {
  suggestions: AiSuggestion[];
  availability: AiAvailability;  // как именно получен результат
  message?: string;
}
