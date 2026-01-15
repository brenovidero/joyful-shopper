import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { MediaPost, MediaComment, PublicProfile } from '@/types/social';

export function useMedia() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Global feed
  const useGlobalFeed = (catalogId?: string) => {
    return useQuery({
      queryKey: ['globalFeed', catalogId],
      queryFn: async () => {
        let query = supabase
          .from('media_posts')
          .select('*')
          .is('community_id', null)
          .order('created_at', { ascending: false })
          .limit(50);

        if (catalogId) {
          query = query.eq('catalog_id', catalogId);
        }

        const { data, error } = await query;
        if (error) throw error;

        const postsWithProfiles = await Promise.all(
          (data || []).map(async (post) => {
            const userProfile = await fetchUserProfile(post.user_id);
            
            // Check if current user liked
            let hasLiked = false;
            if (user?.id) {
              const { data: likeData } = await supabase
                .from('media_likes')
                .select('id')
                .eq('post_id', post.id)
                .eq('user_id', user.id)
                .single();
              hasLiked = !!likeData;
            }

            return { ...post, user_profile: userProfile, has_liked: hasLiked };
          })
        );

        return postsWithProfiles as MediaPost[];
      },
    });
  };

  // Community feed
  const useCommunityFeed = (communityId: string) => {
    return useQuery({
      queryKey: ['communityFeed', communityId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('media_posts')
          .select('*')
          .eq('community_id', communityId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const postsWithProfiles = await Promise.all(
          (data || []).map(async (post) => {
            const userProfile = await fetchUserProfile(post.user_id);
            let hasLiked = false;
            if (user?.id) {
              const { data: likeData } = await supabase
                .from('media_likes')
                .select('id')
                .eq('post_id', post.id)
                .eq('user_id', user.id)
                .single();
              hasLiked = !!likeData;
            }
            return { ...post, user_profile: userProfile, has_liked: hasLiked };
          })
        );

        return postsWithProfiles as MediaPost[];
      },
      enabled: !!communityId,
    });
  };

  // Create post
  const createPostMutation = useMutation({
    mutationFn: async (post: {
      mediaType: 'video' | 'image';
      mediaUrl: string;
      thumbnailUrl?: string;
      title?: string;
      description?: string;
      communityId?: string;
      catalogId?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase.from('media_posts').insert({
        user_id: user.id,
        media_type: post.mediaType,
        media_url: post.mediaUrl,
        thumbnail_url: post.thumbnailUrl,
        title: post.title,
        description: post.description,
        community_id: post.communityId,
        catalog_id: post.catalogId,
        is_nsfw: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalFeed'] });
      queryClient.invalidateQueries({ queryKey: ['communityFeed'] });
      toast({ title: 'Post criado!' });
    },
  });

  // Delete post
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from('media_posts').delete().eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalFeed'] });
      queryClient.invalidateQueries({ queryKey: ['communityFeed'] });
      toast({ title: 'Post excluído' });
    },
  });

  // Like post
  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase.from('media_likes').insert({
        post_id: postId,
        user_id: user.id,
      });
      if (error) throw error;

      // Update likes count manually
      const { data } = await supabase.from('media_posts').select('likes_count').eq('id', postId).single();
      if (data) {
        await supabase.from('media_posts').update({ likes_count: (data.likes_count || 0) + 1 }).eq('id', postId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalFeed'] });
      queryClient.invalidateQueries({ queryKey: ['communityFeed'] });
    },
  });

  // Unlike post
  const unlikePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('media_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalFeed'] });
      queryClient.invalidateQueries({ queryKey: ['communityFeed'] });
    },
  });

  // Comments
  const useComments = (postId: string) => {
    return useQuery({
      queryKey: ['comments', postId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('media_comments')
          .select('*')
          .eq('post_id', postId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const commentsWithProfiles = await Promise.all(
          (data || []).map(async (comment) => ({
            ...comment,
            user_profile: await fetchUserProfile(comment.user_id),
          }))
        );

        return commentsWithProfiles as MediaComment[];
      },
      enabled: !!postId,
    });
  };

  // Add comment
  const addCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase.from('media_comments').insert({
        post_id: postId,
        user_id: user.id,
        content,
      });
      if (error) throw error;
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      toast({ title: 'Comentário adicionado!' });
    },
  });

  // Delete comment
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase.from('media_comments').delete().eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });

  return {
    useGlobalFeed,
    useCommunityFeed,
    createPost: createPostMutation.mutate,
    deletePost: deletePostMutation.mutate,
    likePost: likePostMutation.mutate,
    unlikePost: unlikePostMutation.mutate,
    useComments,
    addComment: addCommentMutation.mutate,
    deleteComment: deleteCommentMutation.mutate,
  };
}
