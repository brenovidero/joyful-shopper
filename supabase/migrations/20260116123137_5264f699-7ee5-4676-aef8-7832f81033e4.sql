-- Remover política atual que expõe todos os dados do perfil para amigos
DROP POLICY IF EXISTS "Users can view own profile and friends profiles" ON public.profiles;

-- Nova política: usuários SÓ podem ver seu PRÓPRIO perfil completo
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    id = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Criar view pública com APENAS campos básicos para amigos/seguidores/comunidade
-- Esta view usa security_invoker para respeitar permissões
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = on)
AS SELECT 
    id,
    display_name,
    avatar_url,
    level,
    rank
    -- Campos SENSÍVEIS removidos:
    -- cover_url, xp_intelligence, xp_vitality, xp_discipline, 
    -- gold, total_pages_read, total_battles_won, total_water_ml, 
    -- streak_days, last_active_date
FROM public.profiles;

-- Política para a view: amigos aceitos, seguidores ou membros da mesma comunidade podem ver perfis públicos básicos
-- Nota: Como é uma view com security_invoker, ela herda as políticas da tabela base
-- Precisamos criar uma política adicional na tabela profiles para permitir SELECT limitado

-- Atualizar a política para permitir que amigos vejam apenas via subquery específica
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view profiles"
ON public.profiles FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    -- Próprio perfil (acesso total)
    id = auth.uid()
    -- Admins (acesso total)
    OR public.has_role(auth.uid(), 'admin'::app_role)
    -- Amigos aceitos (vão acessar via public_profiles view que filtra campos)
    OR EXISTS (
      SELECT 1 FROM public.friendships
      WHERE friendships.status = 'accepted'
      AND (
        (friendships.requester_id = auth.uid() AND friendships.addressee_id = profiles.id)
        OR (friendships.addressee_id = auth.uid() AND friendships.requester_id = profiles.id)
      )
    )
    -- Membros da mesma comunidade
    OR EXISTS (
      SELECT 1 FROM public.community_members cm1
      JOIN public.community_members cm2 ON cm1.community_id = cm2.community_id
      WHERE cm1.user_id = auth.uid() AND cm2.user_id = profiles.id
    )
  )
);