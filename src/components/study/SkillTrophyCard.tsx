import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Star, Calendar, Zap } from 'lucide-react';
import { StudySkill } from '@/types/skill';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SkillTrophyCardProps {
  skill: StudySkill;
  index: number;
}

export function SkillTrophyCard({ skill, index }: SkillTrophyCardProps) {
  const trophyColors = [
    'from-yellow-400 to-amber-600',
    'from-slate-300 to-slate-500',
    'from-amber-600 to-amber-800',
    'from-purple-400 to-purple-600',
    'from-emerald-400 to-emerald-600',
  ];

  const colorClass = trophyColors[index % trophyColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.05, rotate: 2 }}
    >
      <Card className="relative overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-all">
        <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-10`} />
        <CardContent className="p-4 text-center relative">
          <motion.div
            className="mx-auto mb-3 relative"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center mx-auto shadow-lg`}>
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ rotate: [0, 20, -20, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            </motion.div>
          </motion.div>
          
          <h3 className="font-bold text-lg mb-1">{skill.name}</h3>
          
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-2">
            <Zap className="h-4 w-4 text-primary" />
            <span>{skill.target_days} dias de dedicação</span>
          </div>
          
          {skill.completed_at && (
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Conquistado em {format(new Date(skill.completed_at), "d 'de' MMM, yyyy", { locale: ptBR })}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
