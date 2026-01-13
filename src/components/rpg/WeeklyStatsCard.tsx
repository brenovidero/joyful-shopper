import { motion } from 'framer-motion';
import { BookOpen, Swords, Droplets, Dumbbell, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeeklyStats {
  totalPages: number;
  totalBattles: number;
  totalWater: number;
  totalWorkouts: number;
  battlesWon: number;
}

interface WeeklyStatsCardProps {
  stats: WeeklyStats;
}

export function WeeklyStatsCard({ stats }: WeeklyStatsCardProps) {
  const statItems = [
    {
      icon: BookOpen,
      label: 'Páginas lidas',
      value: stats.totalPages,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Swords,
      label: 'Batalhas',
      value: `${stats.battlesWon}/${stats.totalBattles}`,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
    {
      icon: Droplets,
      label: 'Água (L)',
      value: (stats.totalWater / 1000).toFixed(1),
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      icon: Dumbbell,
      label: 'Treinos',
      value: stats.totalWorkouts,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-600/10 border-yellow-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 text-yellow-400">
          <Trophy className="w-5 h-5" />
          Resumo Semanal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-xl ${item.bgColor} border border-border/30`}
            >
              <div className="flex items-center gap-2 mb-1">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
