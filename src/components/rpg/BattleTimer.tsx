import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Pause, Play, X, Skull, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BattleTimerProps {
  timeRemaining: number;
  totalTime: number;
  isPaused: boolean;
  battleType: 'minion' | 'boss';
  interruptions: number;
  onPause: () => void;
  onResume: () => void;
  onAbandon: () => void;
  onDefeat: () => void;
}

export function BattleTimer({
  timeRemaining,
  totalTime,
  isPaused,
  battleType,
  interruptions,
  onPause,
  onResume,
  onAbandon,
  onDefeat,
}: BattleTimerProps) {
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  
  const progress = ((totalTime - timeRemaining) / totalTime) * 100;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const isBoss = battleType === 'boss';
  const accentColor = isBoss ? 'text-red-500' : 'text-amber-500';
  const bgGlow = isBoss ? 'from-red-500/20' : 'from-amber-500/20';
  const progressColor = isBoss ? 'bg-red-500' : 'bg-amber-500';

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] px-4">
      {/* Background glow effect */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-radial to-transparent opacity-50 pointer-events-none",
          bgGlow
        )}
      />

      {/* Battle Type Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full mb-6",
          isBoss ? "bg-red-500/20 border border-red-500/30" : "bg-amber-500/20 border border-amber-500/30"
        )}
      >
        <Swords className={cn("h-4 w-4", accentColor)} />
        <span className={cn("font-bold uppercase tracking-wider text-sm", accentColor)}>
          {isBoss ? 'Boss Battle' : 'Minion Battle'}
        </span>
      </motion.div>

      {/* Timer Circle */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-64 h-64 mb-8"
      >
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted/20"
          />
          {/* Progress circle */}
          <motion.circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className={accentColor}
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
            initial={{ strokeDashoffset: 2 * Math.PI * 120 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 120 * (1 - progress / 100) }}
            transition={{ duration: 0.5 }}
          />
        </svg>

        {/* Timer text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={timeRemaining}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className={cn(
              "text-5xl font-bold font-mono tracking-wider",
              isPaused ? "text-muted-foreground" : "text-foreground"
            )}
          >
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </motion.span>
          
          {isPaused && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground mt-2"
            >
              PAUSADO
            </motion.span>
          )}
        </div>

        {/* Pulse effect when active */}
        {!isPaused && (
          <motion.div
            className={cn(
              "absolute inset-0 rounded-full border-2",
              isBoss ? "border-red-500/30" : "border-amber-500/30"
            )}
            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Interruptions indicator */}
      {interruptions > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-muted-foreground mb-6"
        >
          <span className="text-sm">Interrupções: {interruptions}</span>
          <span className="text-xs text-warning">(-{interruptions * 10}% recompensa)</span>
        </motion.div>
      )}

      {/* Progress bar */}
      <div className="w-full max-w-xs mb-8">
        <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full", progressColor)}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0%</span>
          <span>{Math.floor(progress)}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {isPaused ? (
          <Button
            size="lg"
            onClick={onResume}
            className={cn(
              "gap-2 px-8",
              isBoss ? "bg-red-500 hover:bg-red-600" : "bg-amber-500 hover:bg-amber-600"
            )}
          >
            <Play className="h-5 w-5" />
            Continuar
          </Button>
        ) : (
          <Button
            size="lg"
            variant="outline"
            onClick={onPause}
            className="gap-2 px-8"
          >
            <Pause className="h-5 w-5" />
            Pausar
          </Button>
        )}
      </div>

      {/* Abandon/Defeat buttons */}
      <AnimatePresence>
        {showAbandonConfirm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8 p-4 bg-card rounded-xl border border-border space-y-4"
          >
            <p className="text-center text-sm text-muted-foreground">
              Tem certeza que quer desistir?
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAbandonConfirm(false)}
              >
                Voltar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setShowAbandonConfirm(false);
                  onDefeat();
                }}
                className="gap-2"
              >
                <Skull className="h-4 w-4" />
                Desistir (30% XP)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAbandonConfirm(false);
                  onAbandon();
                }}
                className="gap-2 text-muted-foreground"
              >
                <X className="h-4 w-4" />
                Abandonar (0 XP)
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAbandonConfirm(true)}
            className="mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Desistir da batalha
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
