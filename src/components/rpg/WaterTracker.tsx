import { motion } from 'framer-motion';
import { Droplets, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VitalityLog } from '@/types/rpg';

interface WaterTrackerProps {
  todayLog: VitalityLog | null;
  onAddWater: (ml: number) => void;
}

const WATER_GOAL = 2500; // 2.5L daily goal
const WATER_AMOUNTS = [250, 500, 750];

export function WaterTracker({ todayLog, onAddWater }: WaterTrackerProps) {
  const currentWater = todayLog?.water_ml || 0;
  const progress = Math.min((currentWater / WATER_GOAL) * 100, 100);
  const glasses = Math.floor(currentWater / 250);

  return (
    <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border-cyan-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-cyan-400">
          <Droplets className="w-5 h-5" />
          Água
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Water visualization */}
        <div className="relative h-32 bg-background/50 rounded-xl overflow-hidden border border-cyan-500/20">
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-500 to-cyan-400/50"
            initial={{ height: 0 }}
            animate={{ height: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-foreground">
              {(currentWater / 1000).toFixed(1)}L
            </span>
            <span className="text-sm text-muted-foreground">
              de {WATER_GOAL / 1000}L ({glasses} copos)
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progresso diário</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Quick add buttons */}
        <div className="grid grid-cols-3 gap-2">
          {WATER_AMOUNTS.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              className="border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500"
              onClick={() => onAddWater(amount)}
            >
              <Plus className="w-4 h-4 mr-1" />
              {amount}ml
            </Button>
          ))}
        </div>

        {/* XP info */}
        <p className="text-xs text-center text-muted-foreground">
          +5 VIT XP por 250ml
        </p>
      </CardContent>
    </Card>
  );
}
