import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { Book, BookStatus } from '@/types/rpg';

const XP_PER_PAGE = 2;

export function useBooks() {
  const { user } = useAuth();
  const { addXP, fetchProfile } = useProfile();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setBooks(data as unknown as Book[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const addBook = async (book: {
    title: string;
    author?: string;
    total_pages: number;
    category?: string;
    target_date?: string;
    image_url?: string;
  }) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('books')
      .insert({
        user_id: user.id,
        title: book.title,
        author: book.author || null,
        total_pages: book.total_pages,
        category: book.category || null,
        target_date: book.target_date || null,
        image_url: book.image_url || null,
        pages_read: 0,
        status: 'active' as BookStatus,
        xp_earned: 0,
      })
      .select()
      .single();

    if (!error) {
      await fetchBooks();
    }
    return { data, error };
  };

  const updateBook = async (bookId: string, updates: Partial<Book>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('books')
      .update(updates)
      .eq('id', bookId)
      .eq('user_id', user.id);

    if (!error) {
      await fetchBooks();
    }
    return { error };
  };

  const deleteBook = async (bookId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId)
      .eq('user_id', user.id);

    if (!error) {
      await fetchBooks();
    }
    return { error };
  };

  const logReading = async (bookId: string, pagesRead: number, notes?: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const book = books.find(b => b.id === bookId);
    if (!book) return { error: new Error('Book not found') };

    const xpEarned = pagesRead * XP_PER_PAGE;
    const newPagesRead = Math.min(book.pages_read + pagesRead, book.total_pages);
    const isCompleted = newPagesRead >= book.total_pages;

    // Create reading session
    const { error: sessionError } = await supabase
      .from('reading_sessions')
      .insert({
        user_id: user.id,
        book_id: bookId,
        pages_read: pagesRead,
        xp_earned: xpEarned,
        notes: notes || null,
      });

    if (sessionError) {
      return { error: sessionError };
    }

    // Update book progress
    const { error: bookError } = await supabase
      .from('books')
      .update({
        pages_read: newPagesRead,
        xp_earned: book.xp_earned + xpEarned,
        status: isCompleted ? 'completed' : book.status,
      })
      .eq('id', bookId);

    if (bookError) {
      return { error: bookError };
    }

    // Update profile total pages read
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_pages_read')
      .eq('id', user.id)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({ total_pages_read: profile.total_pages_read + pagesRead })
        .eq('id', user.id);
    }

    // Award XP
    await addXP('intelligence', xpEarned);
    await fetchProfile();
    await fetchBooks();

    return { xpEarned, isCompleted, error: null };
  };

  const getActiveBooks = () => books.filter(b => b.status === 'active');
  const getCompletedBooks = () => books.filter(b => b.status === 'completed');
  const getPausedBooks = () => books.filter(b => b.status === 'paused');

  return {
    books,
    loading,
    fetchBooks,
    addBook,
    updateBook,
    deleteBook,
    logReading,
    getActiveBooks,
    getCompletedBooks,
    getPausedBooks,
  };
}
