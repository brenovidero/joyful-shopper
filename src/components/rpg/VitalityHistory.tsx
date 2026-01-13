import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Droplets, Dumbbell, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VitalityLog } from '@/types/rpg';

interface VitalityHistoryProps {
  history: VitalityLog[];
}

export function VitalityHistory({ history }: VitalityHistoryProps) {
  if (history.length === 0) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Sparkles className="w-12 h-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground text-center">
            Nenhum registro de vitalidade ainda
          </p>
          <p className="text-sm text-muted-foreground/70 text-center mt-1">
            Comece a registrar água e treinos!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Histórico de Vitalidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
        {history.map((log) => (
          <div
            key={log.id}
            className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30"
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                {format(new Date(log.logged_at), "dd 'de' MMMM", { locale: ptBR })}
              </span>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {log.water_ml > 0 && (
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-cyan-400" />
                    {(log.water_ml / 1000).toFixed(1)}L
                  </span>
                )}
                {log.workout_completed && (
                  <span className="flex items-center gap-1">
                    <Dumbbell className="w-3 h-3 text-orange-400" />
                    {log.workout_type || 'Treino'}
                  </span>
                )}
              </div>
            </div>
            <Badge 
              variant="outline" 
              className="bg-green-500/10 text-green-400 border-green-500/30"
            >
              +{log.xp_earned} XP
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
