import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircleQuestion, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudyQuestion } from '@/types/study';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: StudyQuestion;
  onToggleFavorite: (questionId: string, isFavorite: boolean) => void;
  onDelete: (questionId: string) => void;
}

export function QuestionCard({ question, onToggleFavorite, onDelete }: QuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
            <MessageCircleQuestion className="w-5 h-5 text-amber-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{question.question}</p>
            <div className="flex items-center gap-2 mt-2">
              {question.diary_entry?.course && (
                <Badge variant="secondary" className="text-xs">
                  {question.diary_entry.course.name}
                </Badge>
              )}
              {question.diary_entry && (
                <span className="text-xs text-muted-foreground">
                  {question.diary_entry.subject}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Criada em {format(new Date(question.created_at), "d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleFavorite(question.id, !question.is_favorite)}
            className={cn(
              "shrink-0",
              question.is_favorite && "text-amber-500"
            )}
          >
            <Star className={cn("w-4 h-4", question.is_favorite && "fill-current")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-destructive hover:text-destructive"
            onClick={() => onDelete(question.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
