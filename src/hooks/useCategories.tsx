import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const DEFAULT_CATEGORIES = [
  { name: 'Pokémon Cards', emoji: '🃏' },
  { name: 'Pokémon Elite Trainer Boxes', emoji: '📦' },
  { name: 'Pokémon Games', emoji: '🎮' },
  { name: 'Vinyl Records', emoji: '🎵' },
  { name: 'Game Consoles', emoji: '🕹️' },
  { name: 'Handheld Game Consoles', emoji: '📱' },
  { name: 'Voetbalshirts', emoji: '⚽' },
];

export function useCategories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const seedDefaults = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const inserts = DEFAULT_CATEGORIES.map(c => ({
        user_id: user.id,
        name: c.name,
        emoji: c.emoji,
        is_default: true,
      }));
      const { error } = await supabase.from('categories').insert(inserts);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const addCategory = useMutation({
    mutationFn: async ({ name, emoji }: { name: string; emoji: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('categories').insert({
        user_id: user.id,
        name,
        emoji,
        is_default: false,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, name, emoji, is_hidden }: { id: string; name?: string; emoji?: string; is_hidden?: boolean }) => {
      const { error } = await supabase.from('categories').update({
        name,
        emoji,
        is_hidden,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  return { ...query, seedDefaults, addCategory, updateCategory, deleteCategory };
}
