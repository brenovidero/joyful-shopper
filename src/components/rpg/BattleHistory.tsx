import { motion } from 'framer-motion';
import { Trophy, Skull, XCircle, Clock, Sparkles, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BattleSession } from '@/types/rpg';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BattleHistoryProps {
  sessions: BattleSession[];
}

export function BattleHistory({ sessions }: BattleHistoryProps) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
          <Trophy className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">Nenhuma batalha ainda</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Comece sua primeira batalha para ver seu histórico aqui!
        </p>
      </div>
    );
  }

  const getResultConfig = (result: string) => {
    switch (result) {
      case 'victory':
        return {
          icon: Trophy,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          label: 'Vitória',
        };
      case 'defeat':
        return {
          icon: Skull,
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/10',
          label: 'Derrota',
        };
      default:
        return {
          icon: XCircle,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/10',
          label: 'Abandonado',
        };
    }
  };

  return (
    <div className="p-4 space-y-3">
      {sessions.map((session, index) => {
        const resultConfig = getResultConfig(session.result);
        const Icon = resultConfig.icon;
        const date = new Date(session.started_at);
        
        return (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "p-4 rounded-xl border border-border/50 bg-card/50",
              "flex items-center gap-4"
            )}
          >
            {/* Result icon */}
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
              resultConfig.bgColor
            )}>
              <Icon className={cn("h-6 w-6", resultConfig.color)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("font-semibold", resultConfig.color)}>
                  {resultConfig.label}
                </span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  session.battle_type === 'boss'
                    ? "bg-red-500/20 text-red-400"
                    : "bg-amber-500/20 text-amber-400"
                )}>
                  {session.battle_type === 'boss' ? 'Boss' : 'Minion'}
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {session.duration_minutes}min
                </span>
                <span>
                  {format(date, "d MMM, HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>

            {/* Rewards */}
            <div className="flex flex-col items-end gap-1">
              {session.xp_earned > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <Sparkles className="h-3 w-3 text-purple-400" />
                  <span className="text-purple-400">+{session.xp_earned}</span>
                </div>
              )}
              {session.gold_earned > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <Coins className="h-3 w-3 text-yellow-400" />
                  <span className="text-yellow-400">+{session.gold_earned}</span>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
