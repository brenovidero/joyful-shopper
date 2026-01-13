import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVitality } from '@/hooks/useVitality';
import { useProfile } from '@/hooks/useProfile';
import { WaterTracker } from '@/components/rpg/WaterTracker';
import { WorkoutTracker } from '@/components/rpg/WorkoutTracker';
import { VitalityHistory } from '@/components/rpg/VitalityHistory';
import { toast } from '@/hooks/use-toast';

export default function Vitality() {
  const navigate = useNavigate();
  const { todayLog, history, loading, addWater, logWorkout } = useVitality();
  const { profile } = useProfile();

  const handleAddWater = async (ml: number) => {
    await addWater(ml);
    toast({
      title: '💧 Água registrada!',
      description: `+${Math.floor(ml / 250) * 5} VIT XP ganhos`,
    });
  };

  const handleLogWorkout = async (type: string) => {
    await logWorkout(type);
    toast({
      title: '💪 Treino registrado!',
      description: '+50 VIT XP ganhos',
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            Vitalidade
          </h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 space-y-4 pb-24"
      >
        {/* Stats summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-xl p-4 border border-cyan-500/20">
            <p className="text-xs text-muted-foreground">Total água</p>
            <p className="text-2xl font-bold text-cyan-400">
              {((profile?.total_water_ml || 0) / 1000).toFixed(1)}L
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-4 border border-green-500/20">
            <p className="text-xs text-muted-foreground">VIT XP</p>
            <p className="text-2xl font-bold text-green-400">
              {profile?.xp_vitality || 0}
            </p>
          </div>
        </div>

        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/30">
            <TabsTrigger value="today" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Hoje
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4 mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <WaterTracker todayLog={todayLog} onAddWater={handleAddWater} />
                <WorkoutTracker todayLog={todayLog} onLogWorkout={handleLogWorkout} />
              </>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <VitalityHistory history={history} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
