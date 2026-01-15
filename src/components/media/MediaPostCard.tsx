import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Heart, MessageCircle, Share, MoreHorizontal, 
  Play, Image as ImageIcon, Trash2, Send 
} from 'lucide-react';
import { useMedia } from '@/hooks/useMedia';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { MediaPost } from '@/types/social';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MediaPostCardProps {
  post: MediaPost;
}

export function MediaPostCard({ post }: MediaPostCardProps) {
  const { user } = useAuth();
  const media = useMedia();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const { data: comments } = media.useComments(post.id);
  const isOwn = post.user_id === user?.id;

  const handleLike = () => {
    if (post.has_liked) {
      media.unlikePost(post.id);
    } else {
      media.likePost(post.id);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    media.addComment({ postId: post.id, content: newComment.trim() });
    setNewComment('');
  };

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.user_profile?.avatar_url || undefined} />
            <AvatarFallback>
              {post.user_profile?.display_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{post.user_profile?.display_name || 'Usuário'}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(post.created_at), "d 'de' MMM", { locale: ptBR })}
            </p>
          </div>
        </div>

        {isOwn && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => media.deletePost(post.id)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Media */}
      <div className="relative bg-black/20">
        {post.media_type === 'video' ? (
          <div className="relative aspect-video">
            <video
              src={post.media_url}
              poster={post.thumbnail_url || undefined}
              controls
              className="w-full h-full object-contain"
            />
            <Badge className="absolute top-2 left-2 bg-black/60">
              <Play className="w-3 h-3 mr-1" />
              Vídeo
            </Badge>
          </div>
        ) : (
          <div className="relative aspect-square">
            <img
              src={post.media_url}
              alt={post.title || 'Post'}
              className="w-full h-full object-cover"
            />
            <Badge className="absolute top-2 left-2 bg-black/60">
              <ImageIcon className="w-3 h-3 mr-1" />
              Foto
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-3">
        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={post.has_liked ? 'text-red-500' : ''}
          >
            <Heart className={`w-5 h-5 mr-1 ${post.has_liked ? 'fill-current' : ''}`} />
            {post.likes_count}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="w-5 h-5 mr-1" />
            {post.comments_count}
          </Button>
          <Button variant="ghost" size="sm">
            <Share className="w-5 h-5" />
          </Button>
        </div>

        {/* Title & Description */}
        {post.title && (
          <p className="font-medium">{post.title}</p>
        )}
        {post.description && (
          <p className="text-sm text-muted-foreground">{post.description}</p>
        )}

        {/* Comments */}
        {showComments && (
          <div className="border-t border-border/50 pt-3 space-y-3">
            <ScrollArea className="max-h-48">
              <div className="space-y-3">
                {comments?.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={comment.user_profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {comment.user_profile?.display_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-muted/30 rounded-lg px-3 py-2">
                      <p className="text-xs font-medium">{comment.user_profile?.display_name}</p>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    {comment.user_id === user?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => media.deleteComment(comment.id)}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Add Comment */}
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="bg-background/50 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
