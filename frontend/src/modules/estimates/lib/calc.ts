import { EstimateItem, EstimateTotals, VatMode } from '../types';

const round2 = (n: number) => Math.round(n * 100) / 100;

/** НР и СП начисляются на ОЗП (по Постановлению №145) */
export function calcTotals(items: EstimateItem[], vatRate: number, vatMode: VatMode): EstimateTotals {
  const ozp = items.reduce((s, i) => s + i.priceOzp * i.quantity, 0);
  const emm = items.reduce((s, i) => s + i.priceEmm * i.quantity, 0);
  const mat = items.reduce((s, i) => s + i.priceMat * i.quantity, 0);
  const direct = ozp + emm + mat;

  const nr = items.reduce((s, i) => s + (i.priceOzp * i.quantity * (i.nrRate || 0)) / 100, 0);
  const sp = items.reduce((s, i) => s + (i.priceOzp * i.quantity * (i.spRate || 0)) / 100, 0);

  const beforeVat = direct + nr + sp;

  let vat = 0;
  let grand = beforeVat;
  if (vatMode === 'on_top') {
    vat = (beforeVat * vatRate) / 100;
    grand = beforeVat + vat;
  } else if (vatMode === 'included') {
    vat = (beforeVat * vatRate) / (100 + vatRate);
    grand = beforeVat;
  }

  return {
    ozp: round2(ozp), emm: round2(emm), mat: round2(mat), direct: round2(direct),
    nr: round2(nr), sp: round2(sp), beforeVat: round2(beforeVat),
    vat: round2(vat), grand: round2(grand),
  };
}

export const fmtMoney = (n: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 }).format(n);
