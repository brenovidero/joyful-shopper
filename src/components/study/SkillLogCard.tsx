import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trash2, Calendar } from 'lucide-react';
import { StudySkillLog } from '@/types/skill';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SkillLogCardProps {
  log: StudySkillLog;
  onDelete: () => void;
}

export function SkillLogCard({ log, onDelete }: SkillLogCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono">
                Dia {log.day_number}
              </Badge>
              <div>
                <CardTitle className="text-base">{log.title}</CardTitle>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(log.log_date), "d 'de' MMMM, yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
            <Button onClick={onDelete} variant="ghost" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{log.content}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
