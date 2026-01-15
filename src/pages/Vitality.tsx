import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, History, Dumbbell, Activity, Flower2, Swords, Waves, Sparkles, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVitality } from '@/hooks/useVitality';
import { useProfile } from '@/hooks/useProfile';
import { 
  useStrengthExercises, 
  useWorkoutPlans, 
  useCardioSessions,
  useYogaSessions,
  useMartialArtsSessions,
  useSwimmingSessions,
  useOtherExercises,
} from '@/hooks/useWorkouts';
import { WaterTracker } from '@/components/rpg/WaterTracker';
import { VitalityHistory } from '@/components/rpg/VitalityHistory';
import { WorkoutPlanBuilder } from '@/components/workout/WorkoutPlanBuilder';
import { CardioTracker } from '@/components/workout/CardioTracker';
import { YogaSessionComponent } from '@/components/workout/YogaSession';
import { MartialArtsSessionComponent } from '@/components/workout/MartialArtsSession';
import { SwimmingSessionComponent } from '@/components/workout/SwimmingSession';
import { OtherExerciseCatalog } from '@/components/workout/OtherExerciseCatalog';
import { toast } from '@/hooks/use-toast';

export default function Vitality() {
  const navigate = useNavigate();
  const { todayLog, history, addWater } = useVitality();
  const { profile } = useProfile();
  
  // Workout hooks
  const { exercises } = useStrengthExercises();
  const { 
    activePlan, planDays, createPlan, addDayToPlan, 
    addExerciseToDay, removeExerciseFromDay, removeDayFromPlan 
  } = useWorkoutPlans();
  const { activeSession: cardioSession, startSession: startCardio, updateSession: updateCardio, endSession: endCardio, setActiveSession } = useCardioSessions();
  const { poses, startSession: startYoga, endSession: endYoga } = useYogaSessions();
  const { styles: martialStyles, sessions: martialSessions, logSession: logMartial } = useMartialArtsSessions();
  const { styles: swimStyles, sessions: swimSessions, logSession: logSwim } = useSwimmingSessions();
  const { exercises: otherExercises, sessions: otherSessions, logSession: logOther } = useOtherExercises();

  const handleAddWater = async (ml: number) => {
    await addWater(ml);
    toast({ title: '💧 Água registrada!', description: `+${Math.floor(ml / 250) * 5} VIT XP` });
  };

  const handleCreatePlan = async () => {
    if (!activePlan) {
      await createPlan('Meu Treino Semanal');
      toast({ title: '🏋️ Plano criado!', description: 'Configure seus dias de treino' });
    }
  };

  const handleEndCardio = async (sessionId: string, duration: number, distance?: number, calories?: number) => {
    const xp = await endCardio(sessionId, duration, distance, calories);
    toast({ title: '🏃 Cardio finalizado!', description: `+${xp} VIT XP ganhos` });
    return xp;
  };

  const handleEndYoga = async (sessionId: string, posesCompleted: number, duration: number) => {
    const xp = await endYoga(sessionId, posesCompleted, duration);
    toast({ title: '🧘 Sessão de yoga completa!', description: `+${xp} VIT XP ganhos` });
    return xp;
  };

  const handleLogMartial = async (...args: Parameters<typeof logMartial>) => {
    const xp = await logMartial(...args);
    toast({ title: '🥊 Treino registrado!', description: `+${xp} VIT XP ganhos` });
    return xp;
  };

  const handleLogSwim = async (...args: Parameters<typeof logSwim>) => {
    const xp = await logSwim(...args);
    toast({ title: '🏊 Natação registrada!', description: `+${xp} VIT XP ganhos` });
    return xp;
  };

  const handleLogOther = async (...args: Parameters<typeof logOther>) => {
    const xp = await logOther(...args);
    toast({ title: '✨ Exercício registrado!', description: `+${xp} VIT XP ganhos` });
    return xp;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            Vitalidade
          </h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 space-y-4 pb-24">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-xl p-4 border border-cyan-500/20">
            <p className="text-xs text-muted-foreground">Total água</p>
            <p className="text-2xl font-bold text-cyan-400">
              {((profile?.total_water_ml || 0) / 1000).toFixed(1)}L
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-4 border border-green-500/20">
            <p className="text-xs text-muted-foreground">VIT XP</p>
            <p className="text-2xl font-bold text-green-400">{profile?.xp_vitality || 0}</p>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="training" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/30 h-auto">
            <TabsTrigger value="training" className="flex-col py-2 text-xs gap-1">
              <Dumbbell className="w-4 h-4" /> Treino
            </TabsTrigger>
            <TabsTrigger value="cardio" className="flex-col py-2 text-xs gap-1">
              <Activity className="w-4 h-4" /> Cardio
            </TabsTrigger>
            <TabsTrigger value="wellness" className="flex-col py-2 text-xs gap-1">
              <Flower2 className="w-4 h-4" /> Wellness
            </TabsTrigger>
            <TabsTrigger value="water" className="flex-col py-2 text-xs gap-1">
              <Droplets className="w-4 h-4" /> Água
            </TabsTrigger>
          </TabsList>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-4 mt-4">
            {!activePlan ? (
              <Button className="w-full" onClick={handleCreatePlan}>
                <Dumbbell className="w-4 h-4 mr-2" /> Criar Plano de Treino
              </Button>
            ) : (
              <WorkoutPlanBuilder
                planDays={planDays}
                exercises={exercises}
                onAddDay={addDayToPlan.bind(null, activePlan.id)}
                onRemoveDay={removeDayFromPlan}
                onAddExercise={addExerciseToDay}
                onRemoveExercise={removeExerciseFromDay}
              />
            )}
          </TabsContent>

          {/* Cardio Tab */}
          <TabsContent value="cardio" className="mt-4">
            <CardioTracker
              activeSession={cardioSession}
              onStartSession={startCardio}
              onUpdateSession={updateCardio}
              onEndSession={handleEndCardio}
            />
          </TabsContent>

          {/* Wellness Tab */}
          <TabsContent value="wellness" className="space-y-4 mt-4">
            <Tabs defaultValue="yoga">
              <TabsList className="grid w-full grid-cols-4 h-auto">
                <TabsTrigger value="yoga" className="text-xs py-1.5">🧘 Yoga</TabsTrigger>
                <TabsTrigger value="martial" className="text-xs py-1.5">🥊 Luta</TabsTrigger>
                <TabsTrigger value="swim" className="text-xs py-1.5">🏊 Natação</TabsTrigger>
                <TabsTrigger value="other" className="text-xs py-1.5">✨ Outros</TabsTrigger>
              </TabsList>
              <TabsContent value="yoga" className="mt-3">
                <YogaSessionComponent poses={poses} onStartSession={startYoga} onEndSession={handleEndYoga} />
              </TabsContent>
              <TabsContent value="martial" className="mt-3">
                <MartialArtsSessionComponent styles={martialStyles} sessions={martialSessions} onLogSession={handleLogMartial} />
              </TabsContent>
              <TabsContent value="swim" className="mt-3">
                <SwimmingSessionComponent styles={swimStyles} sessions={swimSessions} onLogSession={handleLogSwim} />
              </TabsContent>
              <TabsContent value="other" className="mt-3">
                <OtherExerciseCatalog exercises={otherExercises} sessions={otherSessions} onLogSession={handleLogOther} />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Water Tab */}
          <TabsContent value="water" className="space-y-4 mt-4">
            <WaterTracker todayLog={todayLog} onAddWater={handleAddWater} />
            <VitalityHistory history={history} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
