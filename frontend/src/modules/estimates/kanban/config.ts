import { EstimateStatus } from '../types';

export interface KanbanColumnDef {
  id: EstimateStatus;
  title: string;
  accent: string;   // цвет полоски колонки
  badge: string;    // цвет счётчика
}

// Цепочка из скилла: Черновик → На согласовании → Утверждена → В работе → Закрыта
export const KANBAN_COLUMNS: KanbanColumnDef[] = [
  { id: 'draft',       title: 'Черновик',        accent: 'bg-slate-400',  badge: 'bg-slate-100 text-slate-600' },
  { id: 'in_review',   title: 'На согласовании', accent: 'bg-amber-400',  badge: 'bg-amber-100 text-amber-700' },
  { id: 'approved',    title: 'Утверждена',      accent: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-700' },
  { id: 'in_progress', title: 'В работе',        accent: 'bg-violet-500', badge: 'bg-violet-100 text-violet-700' },
  { id: 'closed',      title: 'Закрыта',         accent: 'bg-green-500',  badge: 'bg-green-100 text-green-700' },
];

const ORDER: EstimateStatus[] = KANBAN_COLUMNS.map((c) => c.id);

/** Разрешаем шаг вперёд/назад по цепочке, а также возврат из in_review в draft */
export function canTransition(from: EstimateStatus, to: EstimateStatus): boolean {
  if (from === to) return false;
  const i = ORDER.indexOf(from);
  const j = ORDER.indexOf(to);
  if (i === -1 || j === -1) return false;
  return Math.abs(i - j) === 1; // соседние колонки
}
