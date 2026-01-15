import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { CommunityMessage, PublicProfile } from '@/types/social';

export function useCommunityChat(communityId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [realtimeMessages, setRealtimeMessages] = useState<CommunityMessage[]>([]);

  // Fetch user profile helper
  const fetchUserProfile = async (userId: string): Promise<PublicProfile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, cover_url, level, rank, xp_intelligence, xp_vitality, xp_discipline, total_pages_read, total_battles_won, streak_days')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data as PublicProfile;
  };

  // Fetch messages
  const messagesQuery = useQuery({
    queryKey: ['communityMessages', communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_messages')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      const messagesWithProfiles = await Promise.all(
        (data || []).map(async (msg) => ({
          ...msg,
          user_profile: await fetchUserProfile(msg.user_id),
        }))
      );

      return messagesWithProfiles as CommunityMessage[];
    },
    enabled: !!communityId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!communityId) return;

    const channel = supabase
      .channel(`community-${communityId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `community_id=eq.${communityId}`,
        },
        async (payload) => {
          const newMessage = payload.new as CommunityMessage;
          const profile = await fetchUserProfile(newMessage.user_id);
          setRealtimeMessages((prev) => [...prev, { ...newMessage, user_profile: profile }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [communityId]);

  // Combine fetched + realtime messages
  const allMessages = [...(messagesQuery.data || []), ...realtimeMessages];

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, mediaUrl }: { content: string; mediaUrl?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase.from('community_messages').insert({
        community_id: communityId,
        user_id: user.id,
        content,
        media_url: mediaUrl,
      });
      if (error) throw error;
    },
    onError: () => {
      toast({ title: 'Erro ao enviar mensagem', variant: 'destructive' });
    },
  });

  // Delete message
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase.from('community_messages').delete().eq('id', messageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityMessages', communityId] });
      setRealtimeMessages([]);
    },
  });

  return {
    messages: allMessages,
    isLoading: messagesQuery.isLoading,
    sendMessage: sendMessageMutation.mutate,
    deleteMessage: deleteMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
  };
}
