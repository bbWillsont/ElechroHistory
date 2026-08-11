import { AiAvailability } from '../types';

const CFG: Record<AiAvailability, { label: string; cls: string; dot: string }> = {
  ready:    { label: 'ИИ активен',        cls: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  degraded: { label: 'ИИ деградировал',   cls: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500' },
  disabled: { label: 'ИИ отключён',       cls: 'bg-gray-100 text-gray-500',    dot: 'bg-gray-400' },
};

export function AiStatusBadge({ availability, onRetry }: { availability: AiAvailability; onRetry?: () => void }) {
  const c = CFG[availability];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
      {availability !== 'ready' && onRetry && (
        <button onClick={onRetry} className="underline ml-1">проверить</button>
      )}
    </span>
  );
}
