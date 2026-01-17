import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, Plus, Trash2, ChevronRight, Calendar } from 'lucide-react';
import { StudySkill } from '@/types/skill';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SkillCardProps {
  skill: StudySkill;
  onAddLog: () => void;
  onDelete: () => void;
  onViewLogs: () => void;
}

export function SkillCard({ skill, onAddLog, onDelete, onViewLogs }: SkillCardProps) {
  const progress = (skill.current_day / skill.target_days) * 100;
  const remainingDays = skill.target_days - skill.current_day;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{skill.name}</CardTitle>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Criado {formatDistanceToNow(new Date(skill.created_at), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            </div>
            <Badge variant={skill.is_completed ? "default" : "secondary"}>
              {skill.is_completed ? "Conquistado" : `${remainingDays} dias restantes`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Dia {skill.current_day} de {skill.target_days}</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="flex gap-2">
            {!skill.is_completed && (
              <Button onClick={onAddLog} className="flex-1" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Registrar Dia {skill.current_day + 1}
              </Button>
            )}
            <Button onClick={onViewLogs} variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button onClick={onDelete} variant="ghost" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
