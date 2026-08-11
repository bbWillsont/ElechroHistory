import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { estimatesApi, EstimatesQuery } from '../api/estimates.api';
import { Estimate, EstimateStatus } from '../modules/estimates/types';

export function useEstimates(q: EstimatesQuery = {}) {
  return useQuery({
    queryKey: ['estimates', q],
    queryFn: () => estimatesApi.list(q),
  });
}

export function useEstimate(id: string) {
  return useQuery({
    queryKey: ['estimates', id],
    queryFn: () => estimatesApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateEstimate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Estimate>) => estimatesApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['estimates'] }),
  });
}

export function useDeleteEstimate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => estimatesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['estimates'] }),
  });
}

/**
 * Смена статуса с ОПТИМИСТИЧНЫМ обновлением — для плавного Kanban.
 * Если бэкенд отклонил переход (например, недопустимый статус),
 * кэш откатывается к серверному состоянию.
 */
export function useChangeEstimateStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EstimateStatus }) =>
      estimatesApi.changeStatus(id, status),

    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['estimates'] });
      const lists = qc.getQueriesData<Estimate[]>({ queryKey: ['estimates'] });

      // Оптимистично двигаем карточку во всех списках
      qc.setQueriesData<Estimate[]>({ queryKey: ['estimates'] }, (old) =>
        old ? old.map((e) => (e.id === id ? { ...e, status } : e)) : old,
      );

      return { lists }; // снапшот для отката
    },

    onError: (_err, _vars, context) => {
      // Откатываем к предыдущему состоянию
      context?.lists.forEach(([key, data]) => qc.setQueryData(key, data));
    },

    onSettled: () => qc.invalidateQueries({ queryKey: ['estimates'] }),
  });
}
