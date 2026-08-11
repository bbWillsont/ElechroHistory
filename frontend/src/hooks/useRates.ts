import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ratesApi, RatesQuery } from '../api/rates.api';

export function useRates(q: RatesQuery = {}) {
  return useQuery({
    queryKey: ['rates', q],
    queryFn: () => ratesApi.search(q),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // справочник меняется редко
  });
}

/** Загрузить весь справочник для AI-подбора (лимит побольше) */
export function useAllRatesForAi() {
  return useQuery({
    queryKey: ['rates', 'ai-catalog'],
    queryFn: () => ratesApi.search({ limit: 500 }),
    staleTime: 10 * 60 * 1000,
    select: (res) => res.data,
  });
}
