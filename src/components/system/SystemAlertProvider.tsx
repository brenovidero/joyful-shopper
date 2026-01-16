import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useSystemAlerts } from '@/hooks/useSystemAlerts';

export function SystemAlertProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { welcomeBack, welcomeNew } = useSystemAlerts();
  const hasGreeted = useRef(false);
  const previousLevel = useRef<number | null>(null);

  // Welcome alert on login
  useEffect(() => {
    if (user && profile && !hasGreeted.current) {
      hasGreeted.current = true;
      
      // Check if this is a new user (created in the last minute)
      const createdAt = new Date(profile.created_at);
      const now = new Date();
      const isNewUser = (now.getTime() - createdAt.getTime()) < 60000; // 1 minute
      
      if (isNewUser) {
        welcomeNew(profile.display_name || undefined);
      } else {
        welcomeBack(profile.display_name || undefined);
      }
    }
  }, [user, profile, welcomeBack, welcomeNew]);

  // Reset greeting flag on logout
  useEffect(() => {
    if (!user) {
      hasGreeted.current = false;
      previousLevel.current = null;
    }
  }, [user]);

  // Track level for level up alerts
  useEffect(() => {
    if (profile) {
      if (previousLevel.current !== null && profile.level > previousLevel.current) {
        // Level up detected - this will be handled by the component that triggers the level up
      }
      previousLevel.current = profile.level;
    }
  }, [profile]);

  return <>{children}</>;
}