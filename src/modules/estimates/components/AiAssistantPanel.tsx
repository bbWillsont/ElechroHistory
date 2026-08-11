import { useState } from 'react';
import { useAiSuggest } from '../hooks/useAiSuggest';
import { AiSuggestion, Rate } from '../types';
import { AiStatusBadge } from './AiStatusBadge';

interface Props {
  allRates: Rate[];
  onAddSuggestion: (s: AiSuggestion) => void;
}

export function AiAssistantPanel({ allRates, onAddSuggestion }: Props) {
  const [text, setText] = useState('');
  const { suggest, loading, result, availability, reset } = useAiSuggest(allRates);

  return (
    <div className="border rounded-xl p-4 bg-slate-50 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">🤖 AI-помощник сметчика</h3>
        <AiStatusBadge availability={availability} onRetry={reset} />
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Опишите работы: «проложить кабель ВВГнг 3×2.5 в гофре по потолку, 50 м, установить 12 розеток»"
        rows={2}
        className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) suggest(text); }}
      />

      <button
        onClick={() => suggest(text)}
        disabled={loading || !text.trim()}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-40 hover:bg-blue-700 transition"
      >
        {loading ? '⏳ Подбираем…' : '✨ Подобрать позиции'}
      </button>

      {/* Сообщение о деградации (если AI упал) */}
      {result?.message && (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
          ⚠️ {result.message}
        </div>
      )}

      {/* Результаты — всегда показываются, независимо от источника */}
      {result && result.suggestions.length > 0 && (
        <div className="space-y-2">
          {result.suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2 bg-white border rounded-lg p-2">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-500">{s.code} · {s.unit}</div>
                <div className="text-sm font-medium truncate">{s.name}</div>
                {s.reason && <div className="text-xs text-slate-400 italic">{s.reason}</div>}
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${s.source === 'ai' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                {s.source === 'ai' ? 'AI' : 'поиск'}
              </span>
              <button
                onClick={() => onAddSuggestion(s)}
                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 shrink-0"
              >
                + Добавить
              </button>
            </div>
          ))}
        </div>
      )}

      {result && result.suggestions.length === 0 && !result.message && (
        <div className="text-sm text-slate-500">Ничего не найдено. Попробуйте уточнить описание или добавьте позицию вручную.</div>
      )}
    </div>
  );
}
