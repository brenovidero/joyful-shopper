-- Remover a política problemática de profiles que causa recursão
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Criar nova política mais restritiva: apenas o próprio usuário, amigos aceitos, ou admins
CREATE POLICY "Users can view own profile and friends profiles"
ON public.profiles FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    -- Pode ver próprio perfil
    id = auth.uid()
    -- Pode ver perfis de amigos aceitos (sem referência a community_members para evitar recursão)
    OR EXISTS (
      SELECT 1 FROM public.friendships
      WHERE friendships.status = 'accepted'
      AND (
        (friendships.requester_id = auth.uid() AND friendships.addressee_id = profiles.id)
        OR (friendships.addressee_id = auth.uid() AND friendships.requester_id = profiles.id)
      )
    )
    -- Admins podem ver todos
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);