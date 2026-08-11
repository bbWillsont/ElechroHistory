import { useMemo, useState } from 'react';
import { Rate } from '../types';

export function RateSearch({ rates, onPick }: { rates: Rate[]; onPick: (r: Rate) => void }) {
  const [q, setQ] = useState('');

  const found = useMemo(() => {
    if (q.trim().length < 2) return [];
    const s = q.toLowerCase();
    return rates.filter(r => r.name.toLowerCase().includes(s) || r.code.toLowerCase().includes(s)).slice(0, 8);
  }, [q, rates]);

  return (
    <div className="relative">
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Поиск расценки по названию или коду…"
        className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
      />
      {found.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          {found.map(r => (
            <button
              key={r.id}
              onClick={() => { onPick(r); setQ(''); }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b last:border-0"
            >
              <div className="text-xs text-slate-500">{r.code} · {r.unit}</div>
              <div className="text-sm">{r.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
