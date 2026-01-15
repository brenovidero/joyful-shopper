import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { UserProfileCard } from '@/components/profile/UserProfileCard';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { SocialLists } from '@/components/social/SocialLists';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [editOpen, setEditOpen] = useState(false);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const publicProfile = profile ? {
    id: user.id,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
    cover_url: (profile as any).cover_url || null,
    level: profile.level,
    rank: profile.rank,
    xp_intelligence: profile.xp_intelligence,
    xp_vitality: profile.xp_vitality,
    xp_discipline: profile.xp_discipline,
    total_pages_read: profile.total_pages_read,
    total_battles_won: profile.total_battles_won,
    streak_days: profile.streak_days,
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 p-4 pb-20">
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Meu Perfil
          </h1>
        </div>

        {publicProfile && (
          <UserProfileCard profile={publicProfile} isOwnProfile onEditProfile={() => setEditOpen(true)} />
        )}

        <SocialLists />

        <EditProfileModal open={editOpen} onOpenChange={setEditOpen} />
      </div>
    </div>
  );
};

export default Profile;
