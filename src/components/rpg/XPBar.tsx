import { cn } from '@/lib/utils';

interface XPBarProps {
  label: string;
  current: number;
  max: number;
  color: 'intelligence' | 'vitality' | 'discipline';
  icon: React.ReactNode;
}

const colorMap = {
  intelligence: {
    bg: 'bg-blue-500/20',
    fill: 'bg-gradient-to-r from-blue-600 to-blue-400',
    glow: 'shadow-blue-500/30',
    text: 'text-blue-400',
  },
  vitality: {
    bg: 'bg-emerald-500/20',
    fill: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
    glow: 'shadow-emerald-500/30',
    text: 'text-emerald-400',
  },
  discipline: {
    bg: 'bg-amber-500/20',
    fill: 'bg-gradient-to-r from-amber-600 to-amber-400',
    glow: 'shadow-amber-500/30',
    text: 'text-amber-400',
  },
};

export function XPBar({ label, current, max, color, icon }: XPBarProps) {
  const percentage = Math.min((current / max) * 100, 100);
  const colors = colorMap[color];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className={cn('flex items-center gap-1.5 font-medium', colors.text)}>
          {icon}
          <span>{label}</span>
        </div>
        <span className="text-muted-foreground font-mono text-[10px]">
          {current.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <div className={cn('h-2 rounded-full overflow-hidden', colors.bg)}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out shadow-lg',
            colors.fill,
            colors.glow
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
