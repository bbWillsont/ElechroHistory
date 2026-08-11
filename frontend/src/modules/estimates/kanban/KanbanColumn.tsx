import { useDroppable } from '@dnd-kit/core';
import { Estimate } from '../types';
import { KanbanColumnDef } from './config';
import { EstimateCard } from './EstimateCard';

interface Props {
  column: KanbanColumnDef;
  estimates: Estimate[];
  isOver: boolean;
}

export function KanbanColumn({ column, estimates, isOver }: Props) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-72 shrink-0 rounded-2xl bg-slate-100 transition
        ${isOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}
    >
      <div className="flex items-center gap-2 p-3">
        <span className={`w-2 h-2 rounded-full ${column.accent}`} />
        <h3 className="text-sm font-semibold text-slate-700">{column.title}</h3>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${column.badge}`}>
          {estimates.length}
        </span>
      </div>

      <div className="flex-1 space-y-2 px-3 pb-3 overflow-y-auto max-h-[70vh]">
        {estimates.map((e) => (
          <EstimateCard key={e.id} estimate={e} />
        ))}
        {estimates.length === 0 && (
          <div className="text-center text-xs text-slate-400 py-6 border border-dashed rounded-xl">
            Перетащите сюда смету
          </div>
        )}
      </div>
    </div>
  );
}
