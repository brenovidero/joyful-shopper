import { motion } from 'framer-motion';
import { Trophy, Sparkles, Coins, ArrowLeft, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BattleResult } from '@/types/rpg';

interface BattleVictoryProps {
  result: BattleResult;
  xpEarned: number;
  goldEarned: number;
  battleType: 'minion' | 'boss';
  onClose: () => void;
}

export function BattleVictory({
  result,
  xpEarned,
  goldEarned,
  battleType,
  onClose,
}: BattleVictoryProps) {
  const isVictory = result === 'victory';
  const isDefeat = result === 'defeat';
  
  const config = {
    victory: {
      title: 'Vitória!',
      subtitle: 'Você derrotou o inimigo!',
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'from-yellow-500/20',
    },
    defeat: {
      title: 'Derrota',
      subtitle: 'Você lutou bravamente...',
      icon: Swords,
      color: 'text-orange-500',
      bgColor: 'from-orange-500/20',
    },
    abandoned: {
      title: 'Fuga',
      subtitle: 'Você fugiu da batalha',
      icon: ArrowLeft,
      color: 'text-muted-foreground',
      bgColor: 'from-muted/20',
    },
  };

  const current = config[result];
  const Icon = current.icon;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] px-4">
      {/* Background glow */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-radial to-transparent opacity-50 pointer-events-none",
          current.bgColor
        )}
      />

      {/* Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center mb-6",
          isVictory ? "bg-yellow-500/20" : isDefeat ? "bg-orange-500/20" : "bg-muted/20"
        )}
      >
        <Icon className={cn("h-12 w-12", current.color)} />
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={cn("text-3xl font-bold mb-2", current.color)}
      >
        {current.title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground mb-8"
      >
        {current.subtitle}
      </motion.p>

      {/* Rewards */}
      {(xpEarned > 0 || goldEarned > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-4 mb-8"
        >
          <p className="text-sm text-muted-foreground">Recompensas</p>
          
          <div className="flex items-center gap-6">
            {xpEarned > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30"
              >
                <Sparkles className="h-5 w-5 text-purple-400" />
                <span className="text-lg font-bold text-purple-400">+{xpEarned} XP</span>
              </motion.div>
            )}
            
            {goldEarned > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30"
              >
                <Coins className="h-5 w-5 text-yellow-400" />
                <span className="text-lg font-bold text-yellow-400">+{goldEarned}</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Battle type badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className={cn(
          "px-3 py-1 rounded-full text-xs mb-8",
          battleType === 'boss' 
            ? "bg-red-500/20 text-red-400 border border-red-500/30"
            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
        )}
      >
        {battleType === 'boss' ? 'Boss Battle' : 'Minion Battle'}
      </motion.div>

      {/* Continue button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Button
          size="lg"
          onClick={onClose}
          className="gap-2 px-8"
        >
          Continuar
          <ArrowLeft className="h-4 w-4 rotate-180" />
        </Button>
      </motion.div>
    </div>
  );
}
