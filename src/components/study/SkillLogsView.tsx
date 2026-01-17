import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { StudySkill, StudySkillLog } from '@/types/skill';
import { SkillLogCard } from './SkillLogCard';
import { Progress } from '@/components/ui/progress';

interface SkillLogsViewProps {
  skill: StudySkill;
  logs: StudySkillLog[];
  onBack: () => void;
  onDeleteLog: (logId: string) => void;
}

export function SkillLogsView({ skill, logs, onBack, onDeleteLog }: SkillLogsViewProps) {
  const skillLogs = logs.filter(l => l.skill_id === skill.id);
  const progress = (skill.current_day / skill.target_days) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{skill.name}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Dia {skill.current_day} de {skill.target_days}</span>
            <Progress value={progress} className="w-24 h-2" />
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {skillLogs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-muted-foreground"
          >
            <p>Nenhum registro ainda. Comece seu primeiro dia!</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {skillLogs.map((log) => (
              <SkillLogCard
                key={log.id}
                log={log}
                onDelete={() => onDeleteLog(log.id)}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
