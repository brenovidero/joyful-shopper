import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { UserFollow, UserBlock, Friendship, SharedTask, PublicProfile } from '@/types/social';

export function useSocial() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user profile by ID
  const fetchUserProfile = async (userId: string): Promise<PublicProfile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, cover_url, level, rank, xp_intelligence, xp_vitality, xp_discipline, total_pages_read, total_battles_won, streak_days')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data as PublicProfile;
  };

  // Followers
  const useFollowers = (userId: string) => {
    return useQuery({
      queryKey: ['followers', userId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('user_follows')
          .select('*')
          .eq('following_id', userId);

        if (error) throw error;

        // Fetch profiles for each follower
        const followersWithProfiles = await Promise.all(
          (data || []).map(async (follow) => ({
            ...follow,
            follower_profile: await fetchUserProfile(follow.follower_id),
          }))
        );

        return followersWithProfiles as UserFollow[];
      },
      enabled: !!userId,
    });
  };

  // Following
  const useFollowing = (userId: string) => {
    return useQuery({
      queryKey: ['following', userId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('user_follows')
          .select('*')
          .eq('follower_id', userId);

        if (error) throw error;

        const followingWithProfiles = await Promise.all(
          (data || []).map(async (follow) => ({
            ...follow,
            following_profile: await fetchUserProfile(follow.following_id),
          }))
        );

        return followingWithProfiles as UserFollow[];
      },
      enabled: !!userId,
    });
  };

  // Check if following
  const useIsFollowing = (targetUserId: string) => {
    return useQuery({
      queryKey: ['isFollowing', user?.id, targetUserId],
      queryFn: async () => {
        if (!user?.id) return false;
        const { data } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId)
          .single();
        return !!data;
      },
      enabled: !!user?.id && !!targetUserId && user.id !== targetUserId,
    });
  };

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('user_follows')
        .insert({ follower_id: user.id, following_id: targetUserId });
      if (error) throw error;
    },
    onSuccess: (_, targetUserId) => {
      queryClient.invalidateQueries({ queryKey: ['followers', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['following', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
      toast({ title: 'Seguindo!', description: 'Você está seguindo este usuário.' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível seguir.', variant: 'destructive' });
    },
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);
      if (error) throw error;
    },
    onSuccess: (_, targetUserId) => {
      queryClient.invalidateQueries({ queryKey: ['followers', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['following', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
      toast({ title: 'Deixou de seguir', description: 'Você não segue mais este usuário.' });
    },
  });

  // Blocked users
  const useBlockedUsers = () => {
    return useQuery({
      queryKey: ['blockedUsers', user?.id],
      queryFn: async () => {
        if (!user?.id) return [];
        const { data, error } = await supabase
          .from('user_blocks')
          .select('*')
          .eq('blocker_id', user.id);
        if (error) throw error;
        return data as UserBlock[];
      },
      enabled: !!user?.id,
    });
  };

  // Block mutation
  const blockMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('user_blocks')
        .insert({ blocker_id: user.id, blocked_id: targetUserId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
      toast({ title: 'Usuário bloqueado', description: 'Este usuário foi bloqueado.' });
    },
  });

  // Unblock mutation
  const unblockMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('user_blocks')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', targetUserId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
      toast({ title: 'Usuário desbloqueado' });
    },
  });

  // Friendships
  const useFriendships = () => {
    return useQuery({
      queryKey: ['friendships', user?.id],
      queryFn: async () => {
        if (!user?.id) return [];
        const { data, error } = await supabase
          .from('friendships')
          .select('*')
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

        if (error) throw error;

        const friendshipsWithProfiles = await Promise.all(
          (data || []).map(async (f) => ({
            ...f,
            requester_profile: await fetchUserProfile(f.requester_id),
            addressee_profile: await fetchUserProfile(f.addressee_id),
          }))
        );

        return friendshipsWithProfiles as Friendship[];
      },
      enabled: !!user?.id,
    });
  };

  // Send friend request
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('friendships')
        .insert({ requester_id: user.id, addressee_id: targetUserId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      toast({ title: 'Solicitação enviada!' });
    },
  });

  // Accept friend request
  const acceptFriendRequestMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      toast({ title: 'Amizade aceita!' });
    },
  });

  // Reject friend request
  const rejectFriendRequestMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'rejected' })
        .eq('id', friendshipId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
    },
  });

  // Remove friendship
  const removeFriendshipMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      toast({ title: 'Amizade removida' });
    },
  });

  // Set best friend
  const setBestFriendMutation = useMutation({
    mutationFn: async ({ friendshipId, title }: { friendshipId: string; title: string }) => {
      const { error } = await supabase
        .from('friendships')
        .update({ is_best_friend: true, best_friend_title: title })
        .eq('id', friendshipId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      toast({ title: 'Melhor amigo definido!' });
    },
  });

  // Shared tasks (best friends)
  const useSharedTasks = (friendshipId: string) => {
    return useQuery({
      queryKey: ['sharedTasks', friendshipId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('shared_tasks')
          .select('*')
          .eq('friendship_id', friendshipId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data as SharedTask[];
      },
      enabled: !!friendshipId,
    });
  };

  // Create shared task
  const createSharedTaskMutation = useMutation({
    mutationFn: async (task: { friendshipId: string; title: string; description?: string; xpReward: number; goldReward: number; dueDate?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase.from('shared_tasks').insert({
        friendship_id: task.friendshipId,
        created_by: user.id,
        title: task.title,
        description: task.description,
        xp_reward: task.xpReward,
        gold_reward: task.goldReward,
        due_date: task.dueDate,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharedTasks'] });
      toast({ title: 'Tarefa compartilhada criada!' });
    },
  });

  // Complete shared task
  const completeSharedTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('shared_tasks')
        .update({ status: 'completed', completed_by: user.id, completed_at: new Date().toISOString() })
        .eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharedTasks'] });
      toast({ title: 'Tarefa concluída!' });
    },
  });

  return {
    fetchUserProfile,
    useFollowers,
    useFollowing,
    useIsFollowing,
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    useBlockedUsers,
    block: blockMutation.mutate,
    unblock: unblockMutation.mutate,
    useFriendships,
    sendFriendRequest: sendFriendRequestMutation.mutate,
    acceptFriendRequest: acceptFriendRequestMutation.mutate,
    rejectFriendRequest: rejectFriendRequestMutation.mutate,
    removeFriendship: removeFriendshipMutation.mutate,
    setBestFriend: setBestFriendMutation.mutate,
    useSharedTasks,
    createSharedTask: createSharedTaskMutation.mutate,
    completeSharedTask: completeSharedTaskMutation.mutate,
  };
}
