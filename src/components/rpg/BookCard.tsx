import { motion } from 'framer-motion';
import { Book, MoreVertical, Pause, Play, Trash2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Book as BookType, BookStatus } from '@/types/rpg';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface BookCardProps {
  book: BookType;
  onSelect: (book: BookType) => void;
  onStatusChange: (bookId: string, status: BookStatus) => void;
  onDelete: (bookId: string) => void;
}

export function BookCard({ book, onSelect, onStatusChange, onDelete }: BookCardProps) {
  const progress = Math.round((book.pages_read / book.total_pages) * 100);
  const isCompleted = book.status === 'completed';
  const isPaused = book.status === 'paused';

  const statusConfig = {
    active: { color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', label: 'Ativo' },
    paused: { color: 'text-amber-500', bgColor: 'bg-amber-500/10', label: 'Pausado' },
    completed: { color: 'text-blue-500', bgColor: 'bg-blue-500/10', label: 'Completo' },
    dropped: { color: 'text-muted-foreground', bgColor: 'bg-muted/10', label: 'Abandonado' },
  };

  const config = statusConfig[book.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-xl border border-border/50 bg-card/50",
        "transition-all duration-200",
        !isCompleted && "active:scale-[0.98] cursor-pointer hover:border-border"
      )}
      onClick={() => !isCompleted && onSelect(book)}
    >
      <div className="flex gap-4">
        {/* Book cover / icon */}
        <div className={cn(
          "w-16 h-20 rounded-lg flex items-center justify-center flex-shrink-0",
          "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20"
        )}>
          {book.image_url ? (
            <img 
              src={book.image_url} 
              alt={book.title}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <Book className="h-8 w-8 text-primary/60" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {book.title}
              </h3>
              {book.author && (
                <p className="text-xs text-muted-foreground truncate">
                  {book.author}
                </p>
              )}
            </div>

            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {book.status === 'active' && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(book.id, 'paused');
                  }}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </DropdownMenuItem>
                )}
                {book.status === 'paused' && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(book.id, 'active');
                  }}>
                    <Play className="h-4 w-4 mr-2" />
                    Retomar
                  </DropdownMenuItem>
                )}
                {!isCompleted && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(book.id, 'completed');
                  }}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como completo
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(book.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Progress */}
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {book.pages_read} / {book.total_pages} páginas
              </span>
              <span className={cn("font-medium", config.color)}>
                {progress}%
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          {/* Status badge & XP */}
          <div className="flex items-center justify-between mt-2">
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              config.bgColor,
              config.color
            )}>
              {config.label}
            </span>
            <span className="text-xs text-purple-400">
              +{book.xp_earned} XP
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
