import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, User } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileModal({ open, onOpenChange }: EditProfileModalProps) {
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [coverUrl, setCoverUrl] = useState((profile as any)?.cover_url || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        display_name: displayName,
        avatar_url: avatarUrl || null,
        cover_url: coverUrl || null,
      } as any);
      toast({ title: 'Perfil atualizado!' });
      onOpenChange(false);
    } catch {
      toast({ title: 'Erro ao atualizar perfil', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-primary">Editar Perfil</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cover Preview */}
          <div className="relative h-24 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 overflow-hidden">
            {coverUrl && (
              <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Avatar */}
          <div className="flex justify-center -mt-12">
            <div className="relative">
              <Avatar className="w-20 h-20 border-4 border-card">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-primary/20">
                  <User className="w-8 h-8 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1.5">
                <Camera className="w-3 h-3 text-primary-foreground" />
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nome de Exibição</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Seu nome de aventureiro"
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl">URL da Foto de Perfil</Label>
              <Input
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverUrl">URL da Capa</Label>
              <Input
                id="coverUrl"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://..."
                className="bg-background/50"
              />
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-secondary"
          >
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
