import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useBattle } from '@/hooks/useBattle';
import { BattleSelection } from '@/components/rpg/BattleSelection';
import { BattleTimer } from '@/components/rpg/BattleTimer';
import { BattleVictory } from '@/components/rpg/BattleVictory';
import { BattleHistory } from '@/components/rpg/BattleHistory';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { BattleResult, BattleType } from '@/types/rpg';

type BattlePhase = 'selection' | 'battle' | 'result' | 'history';

interface BattleResultData {
  result: BattleResult;
  xpEarned: number;
  goldEarned: number;
  battleType: BattleType;
}

export default function Battle() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const {
    state,
    history,
    loading,
    startBattle,
    pauseBattle,
    resumeBattle,
    abandonBattle,
    defeatBattle,
  } = useBattle();

  const [phase, setPhase] = useState<BattlePhase>('selection');
  const [resultData, setResultData] = useState<BattleResultData | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Watch for battle completion
  useEffect(() => {
    if (state.isActive) {
      setPhase('battle');
    }
  }, [state.isActive]);

  const handleStartBattle = async (type: BattleType) => {
    await startBattle(type);
  };

  const handleEndBattle = async (endFn: () => Promise<{ xpEarned: number; goldEarned: number; result: BattleResult } | undefined>) => {
    const result = await endFn();
    if (result && state.battleType) {
      setResultData({
        ...result,
        battleType: state.battleType,
      });
      setPhase('result');
    }
  };

  const handleCloseResult = () => {
    setResultData(null);
    setPhase('selection');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            {phase !== 'battle' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => phase === 'history' ? setPhase('selection') : navigate('/')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <span className="font-bold text-foreground">
              {phase === 'history' ? 'Histórico' : 'Arena de Batalha'}
            </span>
          </div>
          {phase === 'selection' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPhase('history')}
            >
              <History className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {phase === 'selection' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <BattleSelection
                onSelect={handleStartBattle}
                loading={loading}
              />
            </motion.div>
          )}

          {phase === 'battle' && state.battleType && (
            <motion.div
              key="battle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <BattleTimer
                timeRemaining={state.timeRemaining}
                totalTime={state.totalTime}
                isPaused={state.isPaused}
                battleType={state.battleType}
                interruptions={state.interruptions}
                onPause={pauseBattle}
                onResume={resumeBattle}
                onAbandon={() => handleEndBattle(abandonBattle)}
                onDefeat={() => handleEndBattle(defeatBattle)}
              />
            </motion.div>
          )}

          {phase === 'result' && resultData && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <BattleVictory
                result={resultData.result}
                xpEarned={resultData.xpEarned}
                goldEarned={resultData.goldEarned}
                battleType={resultData.battleType}
                onClose={handleCloseResult}
              />
            </motion.div>
          )}

          {phase === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <BattleHistory sessions={history} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
