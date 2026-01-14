export type CommunityRole = 'leader' | 'vice_leader' | 'member';
export type CommunityStatus = 'pending' | 'approved' | 'rejected';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type AppRole = 'admin' | 'moderator' | 'user';

export interface Community {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  cover_url: string | null;
  status: CommunityStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: CommunityRole;
  joined_at: string;
  // Joined data
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
    level: number;
    rank: string;
  };
}

export interface CommunityTask {
  id: string;
  community_id: string;
  created_by: string;
  title: string;
  description: string | null;
  xp_reward: number;
  gold_reward: number;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskProgress {
  id: string;
  task_id: string;
  user_id: string;
  status: TaskStatus;
  completed_at: string | null;
  created_at: string;
}

export interface GlobalCatalog {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
  created_by: string;
  created_at: string;
}

export interface CommunityCatalog {
  id: string;
  community_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
  created_by: string;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export const COMMUNITY_ROLE_LABELS: Record<CommunityRole, string> = {
  leader: 'Líder',
  vice_leader: 'Vice-Líder',
  member: 'Membro',
};

export const COMMUNITY_STATUS_LABELS: Record<CommunityStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em Progresso',
  completed: 'Concluída',
};
