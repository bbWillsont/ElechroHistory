import { useMemo, useState } from 'react';
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { useEstimates, useChangeEstimateStatus } from '../../../hooks/useEstimates';
import { Estimate, EstimateStatus } from '../types';
import { KANBAN_COLUMNS, canTransition } from './config';
import { KanbanColumn } from './KanbanColumn';
import { EstimateCard } from './EstimateCard';

export function EstimatesKanban({ projectId }: { projectId?: string }) {
  const { data: estimates = [], isLoading, isError } = useEstimates({ projectId });
  const changeStatus = useChangeEstimateStatus();
  const [activeEstimate, setActiveEstimate] = useState<Estimate | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const grouped = useMemo(() => {
    const map = new Map<EstimateStatus, Estimate[]>();
    KANBAN_COLUMNS.forEach((c) => map.set(c.id, []));
    estimates.forEach((e) => map.get(e.status)?.push(e));
    return map;
  }, [estimates]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const onDragStart = (e: DragStartEvent) => {
    setActiveEstimate(estimates.find((x) => x.id === e.active.id) ?? null);
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveEstimate(null);
    const { active, over } = e;
    if (!over) return;

    const id = String(active.id);
    const from = active.data.current?.status as EstimateStatus;
    const to = over.id as EstimateStatus;

    if (from === to) return;

    if (!canTransition(from, to)) {
      showToast('⚠️ Недопустимый переход. Статусы меняются последовательно.');
      return;
    }

    changeStatus.mutate(
      { id, status: to },
      { onError: () => showToast('❌ Не удалось изменить статус. Проверьте права доступа.') },
    );
  };

  if (isLoading) return <div className="p-8 text-slate-400">Загрузка смет…</div>;
  if (isError) return <div className="p-8 text-red-500">Ошибка загрузки смет</div>;

  return (
    <div className="p-4">
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              estimates={grouped.get(col.id) ?? []}
              isOver={false}
            />
          ))}
        </div>

        <DragOverlay>{activeEstimate && <EstimateCard estimate={activeEstimate} />}</DragOverlay>
      </DndContext>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
