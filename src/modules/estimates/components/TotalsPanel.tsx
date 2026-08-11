import { EstimateTotals } from '../types';
import { fmtMoney } from '../lib/calc';

export function TotalsPanel({ t }: { t: EstimateTotals }) {
  const rows = [
    ['ОЗП', t.ozp], ['ЭММ', t.emm], ['МАТ', t.mat],
    ['Прямые затраты', t.direct], ['Накладные расходы', t.nr], ['Сметная прибыль', t.sp],
    ['Итого до НДС', t.beforeVat], ['НДС', t.vat],
  ] as const;

  return (
    <div className="bg-slate-900 text-white rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
      {rows.map(([label, val]) => (
        <div key={label}>
          <div className="text-xs text-slate-400">{label}</div>
          <div className="font-semibold">{fmtMoney(val)}</div>
        </div>
      ))}
      <div className="col-span-2 md:col-span-4 border-t border-slate-700 pt-2 flex justify-between">
        <span className="text-slate-300">ВСЕГО по смете</span>
        <span className="text-xl font-bold text-green-400">{fmtMoney(t.grand)}</span>
      </div>
    </div>
  );
}
