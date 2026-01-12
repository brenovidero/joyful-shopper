import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, BookOpen, CheckCircle, Pause, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBooks } from '@/hooks/useBooks';
import { BookCard } from '@/components/rpg/BookCard';
import { AddBookModal } from '@/components/rpg/AddBookModal';
import { LogReadingModal } from '@/components/rpg/LogReadingModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Book, BookStatus } from '@/types/rpg';
import { cn } from '@/lib/utils';

export default function Quests() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    books,
    loading,
    addBook,
    updateBook,
    deleteBook,
    logReading,
    getActiveBooks,
    getCompletedBooks,
    getPausedBooks,
  } = useBooks();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleAddBook = async (book: {
    title: string;
    author?: string;
    total_pages: number;
    category?: string;
    target_date?: string;
  }) => {
    setActionLoading(true);
    const { error } = await addBook(book);
    setActionLoading(false);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a quest.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Quest criada!',
        description: `"${book.title}" foi adicionado às suas quests.`,
      });
    }
  };

  const handleStatusChange = async (bookId: string, status: BookStatus) => {
    const { error } = await updateBook(bookId, { status });
    
    if (!error) {
      const statusMessages = {
        active: 'Quest retomada!',
        paused: 'Quest pausada',
        completed: 'Quest completada! 🎉',
        dropped: 'Quest abandonada',
      };
      toast({
        title: statusMessages[status],
      });
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    const { error } = await deleteBook(bookId);
    
    if (!error) {
      toast({
        title: 'Quest removida',
      });
    }
  };

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setShowLogModal(true);
  };

  const handleLogReading = async (bookId: string, pagesRead: number, notes?: string) => {
    setActionLoading(true);
    const result = await logReading(bookId, pagesRead, notes);
    setActionLoading(false);

    if (result.error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a leitura.',
        variant: 'destructive',
      });
      return result;
    }

    if (result.isCompleted) {
      toast({
        title: '🎉 Quest Completa!',
        description: `Você ganhou ${result.xpEarned} XP de Inteligência!`,
      });
    } else {
      toast({
        title: 'Leitura registrada!',
        description: `+${result.xpEarned} XP de Inteligência`,
      });
    }

    return result;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeBooks = getActiveBooks();
  const completedBooks = getCompletedBooks();
  const pausedBooks = getPausedBooks();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="font-bold text-foreground">Quests</span>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Nova
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto pb-8">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mx-4 mt-4" style={{ width: 'calc(100% - 2rem)' }}>
            <TabsTrigger value="active" className="gap-1.5">
              <BookOpen className="h-4 w-4" />
              Ativas ({activeBooks.length})
            </TabsTrigger>
            <TabsTrigger value="paused" className="gap-1.5">
              <Pause className="h-4 w-4" />
              Pausadas ({pausedBooks.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-1.5">
              <CheckCircle className="h-4 w-4" />
              Completas ({completedBooks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="p-4 space-y-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : activeBooks.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Nenhuma quest ativa"
                description="Adicione um livro para começar sua jornada de conhecimento!"
                action={
                  <Button onClick={() => setShowAddModal(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar Quest
                  </Button>
                }
              />
            ) : (
              activeBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onSelect={handleSelectBook}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteBook}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="paused" className="p-4 space-y-3">
            {pausedBooks.length === 0 ? (
              <EmptyState
                icon={Pause}
                title="Nenhuma quest pausada"
                description="Quests pausadas aparecerão aqui."
              />
            ) : (
              pausedBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onSelect={handleSelectBook}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteBook}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="p-4 space-y-3">
            {completedBooks.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="Nenhuma quest completa"
                description="Complete suas leituras para ver seu progresso aqui!"
              />
            ) : (
              completedBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onSelect={handleSelectBook}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteBook}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <AddBookModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddBook}
            loading={actionLoading}
          />
        )}
        {showLogModal && (
          <LogReadingModal
            isOpen={showLogModal}
            book={selectedBook}
            onClose={() => {
              setShowLogModal(false);
              setSelectedBook(null);
            }}
            onLog={handleLogReading}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-4">{description}</p>
      {action}
    </div>
  );
}
