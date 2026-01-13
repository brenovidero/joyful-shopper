import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useStats } from '@/hooks/useStats';
import { useProfile } from '@/hooks/useProfile';
import { XPRadarChart } from '@/components/rpg/XPRadarChart';
import { ActivityHeatmap } from '@/components/rpg/ActivityHeatmap';
import { WeeklyStatsCard } from '@/components/rpg/WeeklyStatsCard';

export default function Stats() {
  const navigate = useNavigate();
  const { dailyActivity, weeklyStats, loading, refetch } = useStats();
  const { profile, loading: profileLoading } = useProfile();

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
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Estatísticas
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={refetch}
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 space-y-4 pb-24"
      >
        {loading || profileLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* XP Radar Chart */}
            {profile && <XPRadarChart profile={profile} />}

            {/* Weekly Stats */}
            <WeeklyStatsCard stats={weeklyStats} />

            {/* Activity Heatmap */}
            <ActivityHeatmap dailyActivity={dailyActivity} />
          </>
        )}
      </motion.div>
    </div>
  );
}
