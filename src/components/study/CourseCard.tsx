import { motion } from 'framer-motion';
import { BookOpen, MoreVertical, Trash2, Edit2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StudyCourse } from '@/types/study';

interface CourseCardProps {
  course: StudyCourse;
  onSelect: (course: StudyCourse) => void;
  onEdit: (course: StudyCourse) => void;
  onDelete: (courseId: string) => void;
}

export function CourseCard({ course, onSelect, onEdit, onDelete }: CourseCardProps) {
  const progress = course.total_lessons > 0 
    ? Math.round((course.current_lesson / course.total_lessons) * 100) 
    : 0;
  
  const completedLessons = course.current_lesson;
  const remainingLessons = course.total_lessons - course.current_lesson;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer group"
      onClick={() => onSelect(course)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm line-clamp-1">{course.name}</h3>
            <p className="text-xs text-muted-foreground">
              Aula {course.current_lesson} de {course.total_lessons}
            </p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(course); }}>
              <Edit2 className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onDelete(course.id); }}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{progress}% concluído</span>
          <span>{remainingLessons} aulas restantes</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-green-500">✓ {completedLessons} concluídas</span>
          <span className="text-muted-foreground">⏳ {remainingLessons} pendentes</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </motion.div>
  );
}
