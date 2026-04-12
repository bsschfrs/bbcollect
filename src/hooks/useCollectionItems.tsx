import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Database } from '@/integrations/supabase/types';

type ItemRow = Database['public']['Tables']['collection_items']['Row'];
type ItemInsert = Database['public']['Tables']['collection_items']['Insert'];

export function useCollectionItems(status?: 'collection' | 'wishlist') {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['collection_items', user?.id, status],
    queryFn: async () => {
      if (!user) return [];
      let q = supabase.from('collection_items').select('*, categories(*)');
      if (status) q = q.eq('status', status);
      q = q.order('created_at', { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addItem = useMutation({
    mutationFn: async (item: Omit<ItemInsert, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('collection_items').insert({ ...item, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collection_items'] }),
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ItemRow> & { id: string }) => {
      const { error } = await supabase.from('collection_items').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collection_items'] }),
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('collection_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collection_items'] }),
  });

  const uploadImage = async (file: File): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('collection-images').upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from('collection-images').getPublicUrl(path);
    return data.publicUrl;
  };

  return { ...query, addItem, updateItem, deleteItem, uploadImage };
}
