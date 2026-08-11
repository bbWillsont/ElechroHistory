import { EstimateItem } from '../types';
import { fmtMoney } from '../lib/calc';

interface Props {
  items: EstimateItem[];
  onChange: (id: string, patch: Partial<EstimateItem>) => void;
  onRemove: (id: string) => void;
}

export function ItemsTable({ items, onChange, onRemove }: Props) {
  return (
    <div className="overflow-x-auto border rounded-xl">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="p-2 w-10">№</th>
            <th className="p-2">Код</th>
            <th className="p-2 min-w-[240px]">Наименование</th>
            <th className="p-2 w-20">Ед.</th>
            <th className="p-2 w-24">Кол-во</th>
            <th className="p-2 w-28">ОЗП</th>
            <th className="p-2 w-28">ЭММ</th>
            <th className="p-2 w-28">МАТ</th>
            <th className="p-2 w-28 text-right">Сумма</th>
            <th className="p-2 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => {
            const sum = (it.priceOzp + it.priceEmm + it.priceMat) * it.quantity;
            return (
              <tr key={it.id} className="border-t hover:bg-slate-50">
                <td className="p-2 text-slate-400">{idx + 1}</td>
                <td className="p-2 text-xs">{it.code}</td>
                <td className="p-2">{it.name}</td>
                <td className="p-2">{it.unit}</td>
                <td className="p-2">
                  <input type="number" min={0} step="0.01" value={it.quantity}
                    onChange={e => onChange(it.id, { quantity: Number(e.target.value) })}
                    className="w-20 border rounded p-1" />
                </td>
                <td className="p-2">
                  <input type="number" min={0} step="0.01" value={it.priceOzp}
                    onChange={e => onChange(it.id, { priceOzp: Number(e.target.value) })}
                    className="w-24 border rounded p-1" />
                </td>
                <td className="p-2">
                  <input type="number" min={0} step="0.01" value={it.priceEmm}
                    onChange={e => onChange(it.id, { priceEmm: Number(e.target.value) })}
                    className="w-24 border rounded p-1" />
                </td>
                <td className="p-2">
                  <input type="number" min={0} step="0.01" value={it.priceMat}
                    onChange={e => onChange(it.id, { priceMat: Number(e.target.value) })}
                    className="w-24 border rounded p-1" />
                </td>
                <td className="p-2 text-right font-medium">{fmtMoney(sum)}</td>
                <td className="p-2">
                  <button onClick={() => onRemove(it.id)} className="text-red-500 hover:text-red-700">✕</button>
                </td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr><td colSpan={10} className="p-6 text-center text-slate-400">Позиций нет — добавьте через AI-помощник или поиск</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
