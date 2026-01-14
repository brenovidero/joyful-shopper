-- Enum para roles na comunidade
CREATE TYPE public.community_role AS ENUM ('leader', 'vice_leader', 'member');

-- Enum para status da comunidade
CREATE TYPE public.community_status AS ENUM ('pending', 'approved', 'rejected');

-- Enum para status das tarefas
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed');

-- Tabela de comunidades
CREATE TABLE public.communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    cover_url TEXT,
    status community_status NOT NULL DEFAULT 'pending',
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Membros da comunidade
CREATE TABLE public.community_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role community_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(community_id, user_id)
);

-- Tarefas da comunidade
CREATE TABLE public.community_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    created_by UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    xp_reward INTEGER NOT NULL DEFAULT 10,
    gold_reward INTEGER NOT NULL DEFAULT 5,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Progresso das tarefas por usuário
CREATE TABLE public.task_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.community_tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    status task_status NOT NULL DEFAULT 'pending',
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(task_id, user_id)
);

-- Catálogos globais (somente admins podem criar)
CREATE TABLE public.global_catalogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    parent_id UUID REFERENCES public.global_catalogs(id) ON DELETE CASCADE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Catálogos da comunidade (líderes podem criar)
CREATE TABLE public.community_catalogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    parent_id UUID REFERENCES public.community_catalogs(id) ON DELETE CASCADE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de roles de usuário (admin do app)
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Função para verificar role do usuário
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    )
$$;

-- Função para verificar role na comunidade
CREATE OR REPLACE FUNCTION public.has_community_role(_user_id UUID, _community_id UUID, _roles community_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.community_members
        WHERE user_id = _user_id 
        AND community_id = _community_id 
        AND role = ANY(_roles)
    )
$$;

-- Enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies para communities
CREATE POLICY "Anyone can view approved communities" ON public.communities
    FOR SELECT USING (status = 'approved' OR created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create communities" ON public.communities
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Leader or admin can update community" ON public.communities
    FOR UPDATE USING (
        created_by = auth.uid() OR 
        public.has_role(auth.uid(), 'admin') OR
        public.has_community_role(auth.uid(), id, ARRAY['leader']::community_role[])
    );

-- RLS policies para community_members
CREATE POLICY "Members can view community members" ON public.community_members
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.community_members cm WHERE cm.community_id = community_id AND cm.user_id = auth.uid())
        OR public.has_role(auth.uid(), 'admin')
    );

CREATE POLICY "Users can join approved communities" ON public.community_members
    FOR INSERT TO authenticated WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (SELECT 1 FROM public.communities c WHERE c.id = community_id AND c.status = 'approved')
    );

CREATE POLICY "Leaders can manage members" ON public.community_members
    FOR UPDATE USING (
        public.has_community_role(auth.uid(), community_id, ARRAY['leader', 'vice_leader']::community_role[])
    );

CREATE POLICY "Users can leave or leaders can remove" ON public.community_members
    FOR DELETE USING (
        auth.uid() = user_id OR
        public.has_community_role(auth.uid(), community_id, ARRAY['leader']::community_role[])
    );

-- RLS policies para community_tasks
CREATE POLICY "Members can view tasks" ON public.community_tasks
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.community_members cm WHERE cm.community_id = community_id AND cm.user_id = auth.uid())
    );

CREATE POLICY "Leaders can create tasks" ON public.community_tasks
    FOR INSERT TO authenticated WITH CHECK (
        public.has_community_role(auth.uid(), community_id, ARRAY['leader', 'vice_leader']::community_role[])
    );

CREATE POLICY "Leaders can update tasks" ON public.community_tasks
    FOR UPDATE USING (
        public.has_community_role(auth.uid(), community_id, ARRAY['leader', 'vice_leader']::community_role[])
    );

CREATE POLICY "Leaders can delete tasks" ON public.community_tasks
    FOR DELETE USING (
        public.has_community_role(auth.uid(), community_id, ARRAY['leader', 'vice_leader']::community_role[])
    );

-- RLS policies para task_progress
CREATE POLICY "Users can view own progress" ON public.task_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own progress" ON public.task_progress
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.task_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies para global_catalogs
CREATE POLICY "Anyone can view global catalogs" ON public.global_catalogs
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage global catalogs" ON public.global_catalogs
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies para community_catalogs
CREATE POLICY "Members can view community catalogs" ON public.community_catalogs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.community_members cm WHERE cm.community_id = community_id AND cm.user_id = auth.uid())
    );

CREATE POLICY "Leaders can manage community catalogs" ON public.community_catalogs
    FOR ALL USING (
        public.has_community_role(auth.uid(), community_id, ARRAY['leader']::community_role[])
    );

-- RLS policies para user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Triggers para updated_at
CREATE TRIGGER update_communities_updated_at
    BEFORE UPDATE ON public.communities
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_tasks_updated_at
    BEFORE UPDATE ON public.community_tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();