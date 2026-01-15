import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { GlobalCatalog, CommunityCatalog } from '@/types/community';

export function useCatalogs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is admin
  const useIsAdmin = () => {
    return useQuery({
      queryKey: ['isAdmin', user?.id],
      queryFn: async () => {
        if (!user?.id) return false;
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
        return !!data;
      },
      enabled: !!user?.id,
    });
  };

  // Global catalogs
  const useGlobalCatalogs = (parentId?: string) => {
    return useQuery({
      queryKey: ['globalCatalogs', parentId],
      queryFn: async () => {
        let query = supabase
          .from('global_catalogs')
          .select('*')
          .order('name');

        if (parentId) {
          query = query.eq('parent_id', parentId);
        } else {
          query = query.is('parent_id', null);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as GlobalCatalog[];
      },
    });
  };

  // Create global catalog (admin only)
  const createGlobalCatalogMutation = useMutation({
    mutationFn: async (catalog: { name: string; description?: string; icon?: string; parentId?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase.from('global_catalogs').insert({
        name: catalog.name,
        description: catalog.description,
        icon: catalog.icon,
        parent_id: catalog.parentId,
        created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalCatalogs'] });
      toast({ title: 'Catálogo criado!' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Apenas admins podem criar catálogos globais.', variant: 'destructive' });
    },
  });

  // Delete global catalog
  const deleteGlobalCatalogMutation = useMutation({
    mutationFn: async (catalogId: string) => {
      const { error } = await supabase.from('global_catalogs').delete().eq('id', catalogId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalCatalogs'] });
      toast({ title: 'Catálogo excluído' });
    },
  });

  // Community catalogs
  const useCommunityatalogs = (communityId: string, parentId?: string) => {
    return useQuery({
      queryKey: ['communityCatalogs', communityId, parentId],
      queryFn: async () => {
        let query = supabase
          .from('community_catalogs')
          .select('*')
          .eq('community_id', communityId)
          .order('name');

        if (parentId) {
          query = query.eq('parent_id', parentId);
        } else {
          query = query.is('parent_id', null);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as CommunityCatalog[];
      },
      enabled: !!communityId,
    });
  };

  // Create community catalog (leader only)
  const createCommunityCatalogMutation = useMutation({
    mutationFn: async (catalog: { communityId: string; name: string; description?: string; icon?: string; parentId?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase.from('community_catalogs').insert({
        community_id: catalog.communityId,
        name: catalog.name,
        description: catalog.description,
        icon: catalog.icon,
        parent_id: catalog.parentId,
        created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityCatalogs'] });
      toast({ title: 'Catálogo da comunidade criado!' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Apenas líderes podem criar catálogos.', variant: 'destructive' });
    },
  });

  // Delete community catalog
  const deleteCommunityCatalogMutation = useMutation({
    mutationFn: async (catalogId: string) => {
      const { error } = await supabase.from('community_catalogs').delete().eq('id', catalogId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityCatalogs'] });
      toast({ title: 'Catálogo excluído' });
    },
  });

  return {
    useIsAdmin,
    useGlobalCatalogs,
    createGlobalCatalog: createGlobalCatalogMutation.mutate,
    deleteGlobalCatalog: deleteGlobalCatalogMutation.mutate,
    useCommunityatalogs,
    createCommunityCatalog: createCommunityCatalogMutation.mutate,
    deleteCommunityCatalog: deleteCommunityCatalogMutation.mutate,
  };
}
