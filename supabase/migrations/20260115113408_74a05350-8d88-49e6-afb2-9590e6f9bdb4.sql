
-- =============================================
-- SOCIAL SYSTEM TABLES
-- =============================================

-- User follows (following/followers system)
CREATE TABLE public.user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL,
    following_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all follows"
ON public.user_follows FOR SELECT
USING (true);

CREATE POLICY "Users can follow others"
ON public.user_follows FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
ON public.user_follows FOR DELETE
USING (auth.uid() = follower_id);

-- User blocks
CREATE TABLE public.user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL,
    blocked_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(blocker_id, blocked_id),
    CHECK (blocker_id != blocked_id)
);

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own blocks"
ON public.user_blocks FOR SELECT
USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block others"
ON public.user_blocks FOR INSERT
WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock"
ON public.user_blocks FOR DELETE
USING (auth.uid() = blocker_id);

-- Friendship status enum
CREATE TYPE public.friendship_status AS ENUM ('pending', 'accepted', 'rejected');

-- Friendships table
CREATE TABLE public.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL,
    addressee_id UUID NOT NULL,
    status friendship_status NOT NULL DEFAULT 'pending',
    is_best_friend BOOLEAN NOT NULL DEFAULT false,
    best_friend_title TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(requester_id, addressee_id),
    CHECK (requester_id != addressee_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own friendships"
ON public.friendships FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can send friend requests"
ON public.friendships FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update own friendships"
ON public.friendships FOR UPDATE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can delete own friendships"
ON public.friendships FOR DELETE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- =============================================
-- MEDIA SYSTEM TABLES
-- =============================================

-- Media type enum
CREATE TYPE public.media_type AS ENUM ('video', 'image');

-- Media posts (global feed)
CREATE TABLE public.media_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    catalog_id UUID,
    media_type media_type NOT NULL,
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    title TEXT,
    description TEXT,
    is_nsfw BOOLEAN NOT NULL DEFAULT false,
    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.media_posts ENABLE ROW LEVEL SECURITY;

-- Block NSFW content
CREATE POLICY "Users can view non-NSFW posts"
ON public.media_posts FOR SELECT
USING (
    is_nsfw = false 
    AND NOT EXISTS (
        SELECT 1 FROM public.user_blocks 
        WHERE (blocker_id = auth.uid() AND blocked_id = media_posts.user_id)
        OR (blocker_id = media_posts.user_id AND blocked_id = auth.uid())
    )
);

CREATE POLICY "Users can create posts"
ON public.media_posts FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_nsfw = false);

CREATE POLICY "Users can update own posts"
ON public.media_posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
ON public.media_posts FOR DELETE
USING (auth.uid() = user_id);

-- Media likes
CREATE TABLE public.media_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.media_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(post_id, user_id)
);

ALTER TABLE public.media_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view likes"
ON public.media_likes FOR SELECT
USING (true);

CREATE POLICY "Users can like posts"
ON public.media_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike"
ON public.media_likes FOR DELETE
USING (auth.uid() = user_id);

-- Media comments
CREATE TABLE public.media_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.media_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.media_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments"
ON public.media_comments FOR SELECT
USING (true);

CREATE POLICY "Users can create comments"
ON public.media_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
ON public.media_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
ON public.media_comments FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- COMMUNITY CHAT
-- =============================================

CREATE TABLE public.community_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view community messages"
ON public.community_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.community_members cm
        WHERE cm.community_id = community_messages.community_id
        AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Members can send messages"
ON public.community_messages FOR INSERT
WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
        SELECT 1 FROM public.community_members cm
        WHERE cm.community_id = community_messages.community_id
        AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete own messages"
ON public.community_messages FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- PROFILE UPDATES
-- =============================================

-- Add cover_url to profiles (avatar_url already exists)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Update profiles RLS to allow public view of basic info
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view profiles"
ON public.profiles FOR SELECT
USING (true);

-- =============================================
-- BEST FRIENDS SHARED TASKS
-- =============================================

CREATE TABLE public.shared_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    friendship_id UUID NOT NULL REFERENCES public.friendships(id) ON DELETE CASCADE,
    created_by UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    xp_reward INTEGER NOT NULL DEFAULT 10,
    gold_reward INTEGER NOT NULL DEFAULT 5,
    due_date TIMESTAMPTZ,
    status task_status NOT NULL DEFAULT 'pending',
    completed_by UUID,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Best friends can view shared tasks"
ON public.shared_tasks FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.friendships f
        WHERE f.id = shared_tasks.friendship_id
        AND f.is_best_friend = true
        AND (f.requester_id = auth.uid() OR f.addressee_id = auth.uid())
    )
);

CREATE POLICY "Best friends can create shared tasks"
ON public.shared_tasks FOR INSERT
WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
        SELECT 1 FROM public.friendships f
        WHERE f.id = shared_tasks.friendship_id
        AND f.is_best_friend = true
        AND (f.requester_id = auth.uid() OR f.addressee_id = auth.uid())
    )
);

CREATE POLICY "Best friends can update shared tasks"
ON public.shared_tasks FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.friendships f
        WHERE f.id = shared_tasks.friendship_id
        AND f.is_best_friend = true
        AND (f.requester_id = auth.uid() OR f.addressee_id = auth.uid())
    )
);

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER update_friendships_updated_at
    BEFORE UPDATE ON public.friendships
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_posts_updated_at
    BEFORE UPDATE ON public.media_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_comments_updated_at
    BEFORE UPDATE ON public.media_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shared_tasks_updated_at
    BEFORE UPDATE ON public.shared_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
