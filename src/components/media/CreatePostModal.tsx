import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Video, Image as ImageIcon } from 'lucide-react';
import { useMedia } from '@/hooks/useMedia';

interface CreatePostModalProps {
  communityId?: string;
  catalogId?: string;
}

export function CreatePostModal({ communityId, catalogId }: CreatePostModalProps) {
  const media = useMedia();
  const [open, setOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'video' | 'image'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!mediaUrl.trim()) return;

    media.createPost({
      mediaType,
      mediaUrl: mediaUrl.trim(),
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      communityId,
      catalogId,
    });

    setMediaUrl('');
    setThumbnailUrl('');
    setTitle('');
    setDescription('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-primary to-secondary">
          <Plus className="w-4 h-4 mr-2" />
          Nova Publicação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-primary">Criar Publicação</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Media Type */}
          <div className="space-y-2">
            <Label>Tipo de Mídia</Label>
            <RadioGroup
              value={mediaType}
              onValueChange={(v) => setMediaType(v as 'video' | 'image')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="image" id="image" />
                <Label htmlFor="image" className="flex items-center gap-1 cursor-pointer">
                  <ImageIcon className="w-4 h-4" />
                  Foto
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="video" id="video" />
                <Label htmlFor="video" className="flex items-center gap-1 cursor-pointer">
                  <Video className="w-4 h-4" />
                  Vídeo
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Media URL */}
          <div className="space-y-2">
            <Label htmlFor="mediaUrl">URL da Mídia *</Label>
            <Input
              id="mediaUrl"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://..."
              className="bg-background/50"
            />
          </div>

          {/* Thumbnail (for videos) */}
          {mediaType === 'video' && (
            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">URL da Thumbnail</Label>
              <Input
                id="thumbnailUrl"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://..."
                className="bg-background/50"
              />
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da publicação"
              className="bg-background/50"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva sua publicação..."
              className="bg-background/50 min-h-[80px]"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!mediaUrl.trim()}
            className="w-full bg-gradient-to-r from-primary to-secondary"
          >
            Publicar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
