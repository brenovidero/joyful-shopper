import { motion } from 'framer-motion';
import { Swords, Skull, Clock, Coins, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BattleSelectionProps {
  onSelect: (type: 'minion' | 'boss') => void;
  loading: boolean;
}

export function BattleSelection({ onSelect, loading }: BattleSelectionProps) {
  const battles = [
    {
      type: 'minion' as const,
      title: 'Minion',
      subtitle: 'Batalha Rápida',
      duration: '25 min',
      xp: '25 XP',
      gold: '10 Gold',
      description: 'Sessão de foco padrão. Perfeita para tarefas curtas.',
      icon: Swords,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      hoverBorder: 'hover:border-amber-500/60',
    },
    {
      type: 'boss' as const,
      title: 'Boss',
      subtitle: 'Batalha Épica',
      duration: '50 min',
      xp: '60 XP',
      gold: '30 Gold',
      description: 'Sessão intensa para projetos maiores. Recompensas dobradas!',
      icon: Skull,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      hoverBorder: 'hover:border-red-500/60',
    },
  ];

  return (
    <div className="space-y-6 p-4">
      <div className="text-center space-y-2">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground"
        >
          Escolha sua Batalha
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-muted-foreground"
        >
          Quanto maior o desafio, maior a recompensa
        </motion.p>
      </div>

      <div className="space-y-4">
        {battles.map((battle, index) => (
          <motion.button
            key={battle.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            onClick={() => !loading && onSelect(battle.type)}
            disabled={loading}
            className={cn(
              "w-full p-5 rounded-2xl border-2 transition-all duration-300",
              "flex flex-col gap-4 text-left",
              battle.bgColor,
              battle.borderColor,
              battle.hoverBorder,
              "active:scale-[0.98]",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  battle.bgColor
                )}>
                  <battle.icon className={cn("h-6 w-6", battle.color)} />
                </div>
                <div>
                  <h3 className={cn("text-xl font-bold", battle.color)}>
                    {battle.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {battle.subtitle}
                  </p>
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium",
                battle.bgColor,
                battle.color
              )}>
                <Clock className="h-3 w-3" />
                {battle.duration}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground">
              {battle.description}
            </p>

            {/* Rewards */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-foreground">{battle.xp}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-foreground">{battle.gold}</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-4 rounded-xl bg-muted/30 border border-border/50"
      >
        <h4 className="text-sm font-semibold text-foreground mb-2">💡 Dicas de Combate</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Cada pausa reduz sua recompensa em 10%</li>
          <li>• Desistir dá 30% do XP pelo progresso</li>
          <li>• Abandonar não ganha nenhum XP</li>
          <li>• Vitórias aumentam seu contador de streak!</li>
        </ul>
      </motion.div>
    </div>
  );
}
