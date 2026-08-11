import { useState } from 'react';
import { EstimatesKanban } from './modules/estimates/kanban/EstimatesKanban';
import { EstimateEditor } from './modules/estimates/components/EstimateEditor';
import { useEstimate } from './hooks/useEstimates';
import { useAllRatesForAi } from './hooks/useRates';

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: estimate } = useEstimate(selectedId ?? '');
  const { data: rates = [] } = useAllRatesForAi();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-6 py-3 flex items-center gap-3">
        <span className="text-lg font-bold">⚡ ElectroHistory</span>
        <span className="text-sm text-slate-400">Сметы и проекты</span>
        {selectedId && (
          <button onClick={() => setSelectedId(null)} className="ml-auto text-sm text-blue-600">
            ← К доске смет
          </button>
        )}
      </header>

      {selectedId && estimate ? (
        <EstimateEditor
          estimate={estimate}
          allRates={rates}
          onSave={() => setSelectedId(null)}
        />
      ) : (
        <EstimatesKanban onSelect={setSelectedId} />
      )}
    </div>
  );
}
