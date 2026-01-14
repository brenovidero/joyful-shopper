import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { 
  Community, 
  CommunityMember, 
  CommunityTask, 
  TaskProgress,
  CommunityRole,
  TaskStatus 
} from '@/types/community';

export function useCommunity() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching communities:', error);
    } else {
      setCommunities((data || []) as unknown as Community[]);
    }
    setLoading(false);
  }, []);

  const fetchMyCommunities = useCallback(async () => {
    if (!user) return;
    
    const { data: memberData, error: memberError } = await supabase
      .from('community_members')
      .select('community_id')
      .eq('user_id', user.id);

    if (memberError) {
      console.error('Error fetching my communities:', memberError);
      return;
    }

    const communityIds = (memberData || []).map(m => m.community_id);
    
    if (communityIds.length === 0) {
      setMyCommunities([]);
      return;
    }

    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .in('id', communityIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my communities:', error);
    } else {
      setMyCommunities((data || []) as unknown as Community[]);
    }
  }, [user]);

  useEffect(() => {
    fetchCommunities();
    if (user) {
      fetchMyCommunities();
    }
  }, [user, fetchCommunities, fetchMyCommunities]);

  const createCommunity = async (name: string, description?: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('communities')
      .insert({
        name,
        description,
        created_by: user.id,
        status: 'pending'
      })
      .select()
      .single();

    if (!error && data) {
      // Auto-add creator as leader
      await supabase.from('community_members').insert({
        community_id: data.id,
        user_id: user.id,
        role: 'leader'
      });
      await fetchMyCommunities();
    }

    return { data, error };
  };

  const joinCommunity = async (communityId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('community_members')
      .insert({
        community_id: communityId,
        user_id: user.id,
        role: 'member'
      });

    if (!error) {
      await fetchMyCommunities();
    }

    return { error };
  };

  const leaveCommunity = async (communityId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', user.id);

    if (!error) {
      await fetchMyCommunities();
    }

    return { error };
  };

  const updateCommunity = async (communityId: string, updates: Partial<Community>) => {
    const { error } = await supabase
      .from('communities')
      .update(updates)
      .eq('id', communityId);

    if (!error) {
      await fetchCommunities();
      await fetchMyCommunities();
    }

    return { error };
  };

  return {
    communities,
    myCommunities,
    loading,
    fetchCommunities,
    fetchMyCommunities,
    createCommunity,
    joinCommunity,
    leaveCommunity,
    updateCommunity,
  };
}

export function useCommunityDetails(communityId: string) {
  const { user } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [tasks, setTasks] = useState<CommunityTask[]>([]);
  const [myProgress, setMyProgress] = useState<TaskProgress[]>([]);
  const [myRole, setMyRole] = useState<CommunityRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCommunityDetails = useCallback(async () => {
    setLoading(true);

    // Fetch community
    const { data: communityData } = await supabase
      .from('communities')
      .select('*')
      .eq('id', communityId)
      .single();

    if (communityData) {
      setCommunity(communityData as unknown as Community);
    }

    // Fetch members
    const { data: membersData } = await supabase
      .from('community_members')
      .select('*')
      .eq('community_id', communityId);

    if (membersData) {
      // Fetch profiles for members
      const userIds = membersData.map(m => m.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, level, rank')
        .in('id', userIds);

      const membersWithProfiles = membersData.map(member => ({
        ...member,
        profile: profilesData?.find(p => p.id === member.user_id)
      })) as unknown as CommunityMember[];

      setMembers(membersWithProfiles);

      // Find my role
      if (user) {
        const myMember = membersData.find(m => m.user_id === user.id);
        setMyRole(myMember?.role as CommunityRole || null);
      }
    }

    // Fetch tasks
    const { data: tasksData } = await supabase
      .from('community_tasks')
      .select('*')
      .eq('community_id', communityId)
      .order('created_at', { ascending: false });

    if (tasksData) {
      setTasks(tasksData as unknown as CommunityTask[]);
    }

    // Fetch my progress
    if (user && tasksData) {
      const taskIds = tasksData.map(t => t.id);
      if (taskIds.length > 0) {
        const { data: progressData } = await supabase
          .from('task_progress')
          .select('*')
          .eq('user_id', user.id)
          .in('task_id', taskIds);

        if (progressData) {
          setMyProgress(progressData as unknown as TaskProgress[]);
        }
      }
    }

    setLoading(false);
  }, [communityId, user]);

  useEffect(() => {
    if (communityId) {
      fetchCommunityDetails();
    }
  }, [communityId, fetchCommunityDetails]);

  const createTask = async (title: string, description?: string, xpReward = 10, goldReward = 5, dueDate?: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('community_tasks')
      .insert({
        community_id: communityId,
        created_by: user.id,
        title,
        description,
        xp_reward: xpReward,
        gold_reward: goldReward,
        due_date: dueDate
      });

    if (!error) {
      await fetchCommunityDetails();
    }

    return { error };
  };

  const updateTask = async (taskId: string, updates: Partial<CommunityTask>) => {
    const { error } = await supabase
      .from('community_tasks')
      .update(updates)
      .eq('id', taskId);

    if (!error) {
      await fetchCommunityDetails();
    }

    return { error };
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('community_tasks')
      .delete()
      .eq('id', taskId);

    if (!error) {
      await fetchCommunityDetails();
    }

    return { error };
  };

  const updateTaskProgress = async (taskId: string, status: TaskStatus) => {
    if (!user) return { error: new Error('Not authenticated') };

    const existingProgress = myProgress.find(p => p.task_id === taskId);

    if (existingProgress) {
      const { error } = await supabase
        .from('task_progress')
        .update({
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', existingProgress.id);

      if (!error) {
        await fetchCommunityDetails();
      }
      return { error };
    } else {
      const { error } = await supabase
        .from('task_progress')
        .insert({
          task_id: taskId,
          user_id: user.id,
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null
        });

      if (!error) {
        await fetchCommunityDetails();
      }
      return { error };
    }
  };

  const updateMemberRole = async (memberId: string, role: CommunityRole) => {
    const { error } = await supabase
      .from('community_members')
      .update({ role })
      .eq('id', memberId);

    if (!error) {
      await fetchCommunityDetails();
    }

    return { error };
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('id', memberId);

    if (!error) {
      await fetchCommunityDetails();
    }

    return { error };
  };

  const isLeader = myRole === 'leader';
  const isViceLeader = myRole === 'vice_leader';
  const canManageTasks = isLeader || isViceLeader;
  const canManageMembers = isLeader || isViceLeader;

  return {
    community,
    members,
    tasks,
    myProgress,
    myRole,
    loading,
    isLeader,
    isViceLeader,
    canManageTasks,
    canManageMembers,
    fetchCommunityDetails,
    createTask,
    updateTask,
    deleteTask,
    updateTaskProgress,
    updateMemberRole,
    removeMember,
  };
}
