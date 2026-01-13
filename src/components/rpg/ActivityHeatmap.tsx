import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyActivity {
  date: string;
  pages: number;
  battles: number;
  water: number;
  workouts: number;
}

interface ActivityHeatmapProps {
  dailyActivity: DailyActivity[];
}

export function ActivityHeatmap({ dailyActivity }: ActivityHeatmapProps) {
  const getActivityLevel = (activity: DailyActivity): number => {
    let score = 0;
    if (activity.pages > 0) score += 1;
    if (activity.battles > 0) score += 1;
    if (activity.water >= 2000) score += 1;
    if (activity.workouts > 0) score += 1;
    return score;
  };

  const getColorClass = (level: number): string => {
    switch (level) {
      case 0: return 'bg-muted/30';
      case 1: return 'bg-green-500/30';
      case 2: return 'bg-green-500/50';
      case 3: return 'bg-green-500/70';
      case 4: return 'bg-green-500';
      default: return 'bg-muted/30';
    }
  };

  // Get last 28 days (4 weeks)
  const last28Days = dailyActivity.slice(-28);

  // Group by week
  const weeks: DailyActivity[][] = [];
  for (let i = 0; i < last28Days.length; i += 7) {
    weeks.push(last28Days.slice(i, i + 7));
  }

  return (
    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 text-green-400">
          <Flame className="w-5 h-5" />
          Atividade (28 dias)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Heatmap grid */}
        <div className="flex flex-col gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-1">
              {week.map((day) => {
                const level = getActivityLevel(day);
                return (
                  <div
                    key={day.date}
                    className={cn(
                      'flex-1 aspect-square rounded-sm transition-colors',
                      getColorClass(level)
                    )}
                    title={`${format(parseISO(day.date), "dd/MM/yyyy")}: ${level}/4 atividades`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Menos</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn('w-3 h-3 rounded-sm', getColorClass(level))}
              />
            ))}
          </div>
          <span>Mais</span>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {last28Days.filter(d => getActivityLevel(d) > 0).length}
            </p>
            <p className="text-xs text-muted-foreground">dias ativos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {last28Days.filter(d => getActivityLevel(d) === 4).length}
            </p>
            <p className="text-xs text-muted-foreground">dias perfeitos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
