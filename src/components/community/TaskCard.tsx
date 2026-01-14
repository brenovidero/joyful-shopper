import { useState } from 'react';
import { CheckCircle2, Circle, Clock, Coins, Sparkles, Trash2, Edit2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CommunityTask, TaskProgress, TaskStatus, TASK_STATUS_LABELS } from '@/types/community';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskCardProps {
  task: CommunityTask;
  progress?: TaskProgress;
  canManage?: boolean;
  onUpdateProgress?: (status: TaskStatus) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TaskCard({ 
  task, 
  progress, 
  canManage,
  onUpdateProgress,
  onEdit,
  onDelete 
}: TaskCardProps) {
  const currentStatus = progress?.status || 'pending';
  const isCompleted = currentStatus === 'completed';

  const handleStatusChange = () => {
    if (!onUpdateProgress) return;
    
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      pending: 'in_progress',
      in_progress: 'completed',
      completed: 'pending',
    };
    
    onUpdateProgress(nextStatus[currentStatus]);
  };

  const StatusIcon = {
    pending: Circle,
    in_progress: Clock,
    completed: CheckCircle2,
  }[currentStatus];

  const statusColors = {
    pending: 'text-muted-foreground',
    in_progress: 'text-yellow-400',
    completed: 'text-emerald-400',
  };

  return (
    <Card className={cn(
      "transition-all duration-200",
      "bg-card/50 backdrop-blur-sm border-border/50",
      isCompleted && "opacity-70"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Status Button */}
          <button
            onClick={handleStatusChange}
            className={cn(
              "mt-1 transition-colors",
              statusColors[currentStatus],
              "hover:opacity-80"
            )}
          >
            <StatusIcon className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className={cn(
                "font-medium",
                isCompleted && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h4>
              
              {canManage && (
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={onEdit}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>

            {task.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {task.description}
              </p>
            )}

            {/* Rewards & Info */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3 text-blue-400" />
                {task.xp_reward} XP
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Coins className="w-3 h-3 text-yellow-400" />
                {task.gold_reward} Gold
              </Badge>
              {task.due_date && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Clock className="w-3 h-3" />
                  {format(new Date(task.due_date), "dd MMM", { locale: ptBR })}
                </Badge>
              )}
              <Badge 
                variant="outline" 
                className={cn("text-xs", statusColors[currentStatus])}
              >
                {TASK_STATUS_LABELS[currentStatus]}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
