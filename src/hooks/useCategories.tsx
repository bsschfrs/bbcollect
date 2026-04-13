import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
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

  return { ...query, addCategory, updateCategory, deleteCategory };
}
