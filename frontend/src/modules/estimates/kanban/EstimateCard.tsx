import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Estimate } from '../types';
import { fmtMoney } from '../lib/calc';

export function EstimateCard({ estimate }: { estimate: Estimate }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: estimate.id,
    data: { status: estimate.status },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={`bg-white border rounded-xl p-3 shadow-sm cursor-grab active:cursor-grabbing
        transition hover:shadow-md select-none ${isDragging ? 'opacity-50 ring-2 ring-blue-400' : ''}`}
    >
      <div className="text-sm font-semibold text-slate-800 line-clamp-2">{estimate.name}</div>

      <div className="mt-1 text-xs text-slate-400">
        {new Date(estimate.updatedAt).toLocaleDateString('ru-RU')}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-bold text-green-600">{fmtMoney(estimate.grandTotal ?? 0)}</span>
        <span className="text-[10px] text-slate-400">{estimate.items.length} поз.</span>
      </div>
    </div>
  );
}
