import { useCallback, useState } from 'react';
import { aiService } from '../lib/ai.service';
import { AiResult, Rate } from '../types';

export function useAiSuggest(allRates: Rate[]) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);

  const suggest = useCallback(async (description: string) => {
    if (!description.trim()) return;
    setLoading(true);
    try {
      // try/catch на случай непредвиденной ошибки — модуль не должен падать
      const res = await aiService.suggestRates(description, allRates);
      setResult(res);
    } catch (e) {
      console.error('[AI] unexpected error', e);
      setResult({ suggestions: [], availability: 'disabled', message: 'Не удалось получить подсказки. Добавьте позицию вручную.' });
    } finally {
      setLoading(false);
    }
  }, [allRates]);

  return { suggest, loading, result, availability: aiService.availability, reset: () => aiService.reset() };
}
