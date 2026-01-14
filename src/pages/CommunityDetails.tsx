import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  ListTodo, 
  Settings, 
  Plus,
  Crown,
  Shield,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TaskCard } from '@/components/community/TaskCard';
import { MemberCard } from '@/components/community/MemberCard';
import { CreateTaskModal } from '@/components/community/CreateTaskModal';
import { useCommunityDetails } from '@/hooks/useCommunity';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { COMMUNITY_ROLE_LABELS, TaskStatus, CommunityRole } from '@/types/community';
import { cn } from '@/lib/utils';

export default function CommunityDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addXP, addGold } = useProfile();
  const { toast } = useToast();
  
  const {
    community,
    members,
    tasks,
    myProgress,
    myRole,
    loading,
    isLeader,
    canManageTasks,
    canManageMembers,
    fetchCommunityDetails,
    createTask,
    deleteTask,
    updateTaskProgress,
    updateMemberRole,
    removeMember,
  } = useCommunityDetails(id || '');

  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  if (!id) {
    navigate('/communities');
    return null;
  }

  const handleCreateTask = async (
    title: string, 
    description?: string, 
    xpReward?: number, 
    goldReward?: number,
    dueDate?: string
  ) => {
    const { error } = await createTask(title, description, xpReward, goldReward, dueDate);
    if (error) {
      toast({
        title: 'Erro ao criar tarefa',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Tarefa criada!' });
    }
  };

  const handleUpdateProgress = async (taskId: string, status: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    const previousProgress = myProgress.find(p => p.task_id === taskId);
    const wasCompleted = previousProgress?.status === 'completed';
    
    const { error } = await updateTaskProgress(taskId, status);
    
    if (error) {
      toast({
        title: 'Erro ao atualizar progresso',
        description: error.message,
        variant: 'destructive',
      });
    } else if (status === 'completed' && !wasCompleted && task) {
      // Give rewards on completion
      await addXP('discipline', task.xp_reward);
      await addGold(task.gold_reward);
      toast({
        title: 'Tarefa concluída!',
        description: `+${task.xp_reward} XP, +${task.gold_reward} Gold`,
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await deleteTask(taskId);
    if (error) {
      toast({
        title: 'Erro ao excluir tarefa',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Tarefa excluída' });
    }
  };

  const handlePromoteMember = async (memberId: string, role: CommunityRole) => {
    const { error } = await updateMemberRole(memberId, role);
    if (error) {
      toast({
        title: 'Erro ao alterar cargo',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Cargo alterado!' });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const { error } = await removeMember(memberId);
    if (error) {
      toast({
        title: 'Erro ao remover membro',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Membro removido' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Users className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Comunidade não encontrada</h2>
        <Button onClick={() => navigate('/communities')}>Voltar</Button>
      </div>
    );
  }

  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder = { leader: 0, vice_leader: 1, member: 2 };
    return roleOrder[a.role] - roleOrder[b.role];
  });

  const pendingTasks = tasks.filter(t => {
    const progress = myProgress.find(p => p.task_id === t.id);
    return !progress || progress.status === 'pending';
  });

  const inProgressTasks = tasks.filter(t => {
    const progress = myProgress.find(p => p.task_id === t.id);
    return progress?.status === 'in_progress';
  });

  const completedTasks = tasks.filter(t => {
    const progress = myProgress.find(p => p.task_id === t.id);
    return progress?.status === 'completed';
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Cover */}
      <div 
        className="h-32 bg-gradient-to-br from-primary/30 to-accent/30 relative"
        style={community.cover_url ? {
          backgroundImage: `url(${community.cover_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      >
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 left-4 bg-background/50 backdrop-blur-sm"
          onClick={() => navigate('/communities')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 bg-background/50 backdrop-blur-sm"
          onClick={fetchCommunityDetails}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Header */}
      <div className="px-4 -mt-12 relative">
        <div className="flex items-end gap-4">
          <div className="w-20 h-20 rounded-xl bg-background border-4 border-background overflow-hidden shadow-lg">
            {community.image_url ? (
              <img 
                src={community.image_url} 
                alt={community.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                <Users className="w-10 h-10 text-primary" />
              </div>
            )}
          </div>
          <div className="flex-1 pb-1">
            <h1 className="text-xl font-bold">{community.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{members.length} membros</span>
              {myRole && (
                <>
                  <span>•</span>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs",
                      myRole === 'leader' && "text-yellow-400",
                      myRole === 'vice_leader' && "text-purple-400"
                    )}
                  >
                    {COMMUNITY_ROLE_LABELS[myRole]}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>

        {community.description && (
          <p className="text-sm text-muted-foreground mt-4">
            {community.description}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="p-4 mt-4">
        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList className="w-full">
            <TabsTrigger value="tasks" className="flex-1 gap-1">
              <ListTodo className="w-4 h-4" />
              Tarefas
            </TabsTrigger>
            <TabsTrigger value="members" className="flex-1 gap-1">
              <Users className="w-4 h-4" />
              Membros
            </TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            {canManageTasks && (
              <Button 
                className="w-full"
                onClick={() => setShowCreateTaskModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Tarefa
              </Button>
            )}

            {tasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma tarefa ainda</p>
                {canManageTasks && (
                  <p className="text-sm mt-1">Crie a primeira tarefa para os membros</p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {pendingTasks.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Pendentes ({pendingTasks.length})
                    </h3>
                    <div className="space-y-3">
                      {pendingTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          progress={myProgress.find(p => p.task_id === task.id)}
                          canManage={canManageTasks}
                          onUpdateProgress={(status) => handleUpdateProgress(task.id, status)}
                          onDelete={() => handleDeleteTask(task.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {inProgressTasks.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-yellow-400">
                      Em Progresso ({inProgressTasks.length})
                    </h3>
                    <div className="space-y-3">
                      {inProgressTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          progress={myProgress.find(p => p.task_id === task.id)}
                          canManage={canManageTasks}
                          onUpdateProgress={(status) => handleUpdateProgress(task.id, status)}
                          onDelete={() => handleDeleteTask(task.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {completedTasks.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-emerald-400">
                      Concluídas ({completedTasks.length})
                    </h3>
                    <div className="space-y-3">
                      {completedTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          progress={myProgress.find(p => p.task_id === task.id)}
                          canManage={canManageTasks}
                          onUpdateProgress={(status) => handleUpdateProgress(task.id, status)}
                          onDelete={() => handleDeleteTask(task.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-3">
            {sortedMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                canManage={canManageMembers}
                isCurrentUser={member.user_id === user?.id}
                onPromote={(role) => handlePromoteMember(member.id, role)}
                onRemove={() => handleRemoveMember(member.id)}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        open={showCreateTaskModal}
        onOpenChange={setShowCreateTaskModal}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}
