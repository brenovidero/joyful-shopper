export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';
export type MediaType = 'video' | 'image';

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  // Joined data
  follower_profile?: PublicProfile;
  following_profile?: PublicProfile;
}

export interface UserBlock {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  is_best_friend: boolean;
  best_friend_title: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  requester_profile?: PublicProfile;
  addressee_profile?: PublicProfile;
}

export interface SharedTask {
  id: string;
  friendship_id: string;
  created_by: string;
  title: string;
  description: string | null;
  xp_reward: number;
  gold_reward: number;
  due_date: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  completed_by: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaPost {
  id: string;
  user_id: string;
  community_id: string | null;
  catalog_id: string | null;
  media_type: MediaType;
  media_url: string;
  thumbnail_url: string | null;
  title: string | null;
  description: string | null;
  is_nsfw: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  user_profile?: PublicProfile;
  has_liked?: boolean;
}

export interface MediaLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface MediaComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  // Joined data
  user_profile?: PublicProfile;
}

export interface CommunityMessage {
  id: string;
  community_id: string;
  user_id: string;
  content: string;
  media_url: string | null;
  created_at: string;
  // Joined data
  user_profile?: PublicProfile;
}

// Perfil público limitado - usado para exibir informações de outros usuários
// Não inclui dados sensíveis como XP detalhado, gold, estatísticas de progresso
export interface PublicProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  level: number;
  rank: string;
  // Campos opcionais - só disponíveis para o próprio usuário ou admins
  cover_url?: string | null;
  xp_intelligence?: number;
  xp_vitality?: number;
  xp_discipline?: number;
  total_pages_read?: number;
  total_battles_won?: number;
  streak_days?: number;
  gold?: number;
  total_water_ml?: number;
}

export const FRIENDSHIP_STATUS_LABELS: Record<FriendshipStatus, string> = {
  pending: 'Pendente',
  accepted: 'Aceito',
  rejected: 'Rejeitado',
};
