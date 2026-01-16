-- Corrigir exposição pública de likes: usuários só podem ver seus próprios likes ou contagens
DROP POLICY IF EXISTS "Users can view likes" ON public.media_likes;

-- Nova política: usuários só podem ver seus próprios likes
-- A contagem de likes já está na tabela media_posts (likes_count)
CREATE POLICY "Users can view own likes"
ON public.media_likes FOR SELECT
USING (auth.uid() = user_id);