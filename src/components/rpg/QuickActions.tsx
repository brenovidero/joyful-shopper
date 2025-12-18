import { Book, Swords, Droplets, Dumbbell, BarChart3, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
  onClick?: () => void;
  disabled?: boolean;
}

interface QuickActionsProps {
  onNavigate: (section: string) => void;
}

export function QuickActions({ onNavigate }: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: 'quests',
      icon: <Book className="h-6 w-6" />,
      label: 'Quests',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 hover:bg-blue-500/30',
      onClick: () => onNavigate('quests'),
    },
    {
      id: 'battle',
      icon: <Swords className="h-6 w-6" />,
      label: 'Batalha',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20 hover:bg-red-500/30',
      onClick: () => onNavigate('battle'),
    },
    {
      id: 'water',
      icon: <Droplets className="h-6 w-6" />,
      label: 'Água',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20 hover:bg-cyan-500/30',
      onClick: () => onNavigate('water'),
    },
    {
      id: 'workout',
      icon: <Dumbbell className="h-6 w-6" />,
      label: 'Treino',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20 hover:bg-emerald-500/30',
      onClick: () => onNavigate('workout'),
    },
    {
      id: 'stats',
      icon: <BarChart3 className="h-6 w-6" />,
      label: 'Stats',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20 hover:bg-purple-500/30',
      onClick: () => onNavigate('stats'),
    },
    {
      id: 'shop',
      icon: <ShoppingBag className="h-6 w-6" />,
      label: 'Loja',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20 hover:bg-yellow-500/30',
      onClick: () => onNavigate('shop'),
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          disabled={action.disabled}
          className={cn(
            'flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all duration-200',
            'border border-border/50 active:scale-95',
            action.bgColor,
            action.disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className={action.color}>{action.icon}</div>
          <span className="text-xs font-medium text-foreground">{action.label}</span>
        </button>
      ))}
    </div>
  );
}
