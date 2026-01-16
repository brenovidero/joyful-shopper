-- Criar função SECURITY DEFINER para verificar membros de comunidade sem recursão
CREATE OR REPLACE FUNCTION public.is_community_member(_user_id uuid, _community_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.community_members
        WHERE user_id = _user_id 
        AND community_id = _community_id
    )
$$;

-- Remover política problemática que causa recursão infinita
DROP POLICY IF EXISTS "Members can view community members" ON public.community_members;

-- Recriar política usando a função SECURITY DEFINER
CREATE POLICY "Members can view community members"
ON public.community_members FOR SELECT
USING (
    -- Usuário é membro da mesma comunidade (usando função SECURITY DEFINER)
    public.is_community_member(auth.uid(), community_id)
    -- Admins podem ver todos
    OR public.has_role(auth.uid(), 'admin'::app_role)
);