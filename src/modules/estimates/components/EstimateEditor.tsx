import { useMemo, useState } from 'react';
import { AiSuggestion, Estimate, EstimateItem, Rate } from '../types';
import { calcTotals } from '../lib/calc';
import { ItemsTable } from './ItemsTable';
import { RateSearch } from './RateSearch';
import { AiAssistantPanel } from './AiAssistantPanel';
import { TotalsPanel } from './TotalsPanel';

interface Props {
  estimate: Estimate;
  allRates: Rate[];
  onSave: (e: Estimate) => void;
}

let tempSeq = 0;
const nextTempId = () => `tmp_${Date.now()}_${tempSeq++}`;

export function EstimateEditor({ estimate, allRates, onSave }: Props) {
  const [draft, setDraft] = useState<Estimate>(estimate);

  const totals = useMemo(
    () => calcTotals(draft.items, draft.vatRate, draft.vatMode),
    [draft.items, draft.vatRate, draft.vatMode],
  );

  const addItem = (partial: Partial<EstimateItem>) => {
    const item: EstimateItem = {
      id: nextTempId(), code: '', name: '', unit: 'шт', quantity: 1,
      priceOzp: 0, priceEmm: 0, priceMat: 0, nrRate: 0, spRate: 0, ...partial,
    };
    setDraft(d => ({ ...d, items: [...d.items, item] }));
  };

  const addFromRate = (r: Rate) => addItem({
    rateId: r.id, code: r.code, name: r.name, unit: r.unit,
    priceOzp: r.ozpBase, priceEmm: r.emmBase, priceMat: r.matBase,
    nrRate: r.nrRate, spRate: r.spRate,
  });

  const addFromAi = (s: AiSuggestion) => {
    // Если AI вернул rateId — берём полную расценку из справочника
    const rate = s.rateId ? allRates.find(r => r.id === s.rateId) : undefined;
    if (rate) return addFromRate({ ...rate, name: s.name || rate.name });
    // Иначе добавляем как есть (цены пользователь проставит вручную)
    addItem({ code: s.code, name: s.name, unit: s.unit, quantity: s.quantity || 1 });
  };

  const patchItem = (id: string, patch: Partial<EstimateItem>) =>
    setDraft(d => ({ ...d, items: d.items.map(i => (i.id === id ? { ...i, ...patch } : i)) }));

  const removeItem = (id: string) =>
    setDraft(d => ({ ...d, items: d.items.filter(i => i.id !== id) }));

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">📋 {draft.name}</h1>
        <button onClick={() => onSave(draft)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          💾 Сохранить смету
        </button>
      </div>

      {/* AI-панель: не мешает, при недоступности показывает fallback */}
      <AiAssistantPanel allRates={allRates} onAddSuggestion={addFromAi} />

      {/* Ручной поиск — работает всегда */}
      <RateSearch rates={allRates} onPick={addFromRate} />

      <ItemsTable items={draft.items} onChange={patchItem} onRemove={removeItem} />

      <TotalsPanel t={totals} />
    </div>
  );
}
