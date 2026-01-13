import { motion } from 'framer-motion';
import { Dumbbell, Check, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VitalityLog } from '@/types/rpg';

interface WorkoutTrackerProps {
  todayLog: VitalityLog | null;
  onLogWorkout: (type: string) => void;
}

const WORKOUT_TYPES = [
  { id: 'musculacao', label: 'Musculação', icon: '🏋️' },
  { id: 'cardio', label: 'Cardio', icon: '🏃' },
  { id: 'yoga', label: 'Yoga', icon: '🧘' },
  { id: 'luta', label: 'Luta', icon: '🥊' },
  { id: 'natacao', label: 'Natação', icon: '🏊' },
  { id: 'outro', label: 'Outro', icon: '💪' },
];

export function WorkoutTracker({ todayLog, onLogWorkout }: WorkoutTrackerProps) {
  const hasWorkedOut = todayLog?.workout_completed || false;
  const workoutType = todayLog?.workout_type;

  return (
    <Card className="bg-gradient-to-br from-orange-500/10 to-red-600/10 border-orange-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-orange-400">
          <Dumbbell className="w-5 h-5" />
          Treino
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasWorkedOut ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-6 space-y-3"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Check className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">
                Treino Completo! 
              </p>
              <p className="text-sm text-muted-foreground">
                {WORKOUT_TYPES.find(w => w.id === workoutType)?.icon}{' '}
                {WORKOUT_TYPES.find(w => w.id === workoutType)?.label || workoutType}
              </p>
              <p className="text-xs text-green-400 mt-1">
                +50 VIT XP ganhos
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center py-4 space-y-2">
              <Flame className="w-12 h-12 text-orange-400/50" />
              <p className="text-sm text-muted-foreground text-center">
                Registre seu treino de hoje
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {WORKOUT_TYPES.map((workout) => (
                <Button
                  key={workout.id}
                  variant="outline"
                  className="border-orange-500/30 hover:bg-orange-500/20 hover:border-orange-500 flex-col h-auto py-3"
                  onClick={() => onLogWorkout(workout.id)}
                >
                  <span className="text-xl mb-1">{workout.icon}</span>
                  <span className="text-xs">{workout.label}</span>
                </Button>
              ))}
            </div>

            <p className="text-xs text-center text-muted-foreground">
              +50 VIT XP por treino
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
