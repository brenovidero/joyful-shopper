import { Profile } from '@/types/rpg';
import { BookOpen, Swords, Droplets, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodayProgressProps {
  profile: Profile;
  todayStats?: {
    pagesRead: number;
    battlesWon: number;
    waterMl: number;
  };
}

export function TodayProgress({ profile, todayStats }: TodayProgressProps) {
  const stats = todayStats || { pagesRead: 0, battlesWon: 0, waterMl: 0 };
  
  const items = [
    {
      icon: <BookOpen className="h-4 w-4" />,
      label: 'Páginas',
      value: stats.pagesRead,
      target: 30,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      icon: <Swords className="h-4 w-4" />,
      label: 'Batalhas',
      value: stats.battlesWon,
      target: 4,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
    },
    {
      icon: <Droplets className="h-4 w-4" />,
      label: 'Água (ml)',
      value: stats.waterMl,
      target: 2000,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
    },
  ];

  return (
    <div className="bg-card rounded-xl border border-border/50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-yellow-500" />
        <h3 className="text-sm font-semibold text-foreground">Progresso de Hoje</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {items.map((item, index) => {
          const percentage = Math.min((item.value / item.target) * 100, 100);
          
          return (
            <div key={index} className="text-center space-y-2">
              <div className={cn(
                'inline-flex items-center justify-center w-10 h-10 rounded-full',
                item.bgColor
              )}>
                <div className={item.color}>{item.icon}</div>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{item.value}</p>
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn('h-full rounded-full transition-all', item.bgColor.replace('/20', ''))}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
