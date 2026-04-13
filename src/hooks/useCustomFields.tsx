import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CustomField {
  id: string;
  category_id: string;
  user_id: string;
  field_name: string;
  field_type: 'text' | 'number' | 'dropdown';
  dropdown_options: string[];
  sort_order: number;
  created_at: string;
}

export interface CustomFieldValue {
  id: string;
  item_id: string;
  field_id: string;
  value: string | null;
}

export function useCustomFields(categoryId?: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fieldsQuery = useQuery({
    queryKey: ['custom_fields', categoryId],
    queryFn: async () => {
      if (!user || !categoryId) return [];
      const { data, error } = await supabase
        .from('custom_fields')
        .select('*')
        .eq('category_id', categoryId)
        .order('sort_order');
      if (error) throw error;
      return data as CustomField[];
    },
    enabled: !!user && !!categoryId,
  });

  const allFieldsQuery = useQuery({
    queryKey: ['custom_fields', 'all'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('custom_fields')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as CustomField[];
    },
    enabled: !!user,
  });

  const addField = useMutation({
    mutationFn: async (field: { category_id: string; field_name: string; field_type: 'text' | 'number' | 'dropdown'; dropdown_options?: string[]; sort_order?: number }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('custom_fields').insert({
        ...field,
        user_id: user.id,
        dropdown_options: field.dropdown_options || [],
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['custom_fields'] }),
  });

  const updateField = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CustomField> & { id: string }) => {
      const { error } = await supabase.from('custom_fields').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['custom_fields'] }),
  });

  const deleteField = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('custom_fields').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['custom_fields'] }),
  });

  return {
    fields: fieldsQuery.data || [],
    allFields: allFieldsQuery.data || [],
    isLoading: fieldsQuery.isLoading,
    addField,
    updateField,
    deleteField,
  };
}

export function useCustomFieldValues(itemId?: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['custom_field_values', itemId],
    queryFn: async () => {
      if (!itemId) return [];
      const { data, error } = await supabase
        .from('custom_field_values')
        .select('*')
        .eq('item_id', itemId);
      if (error) throw error;
      return data as CustomFieldValue[];
    },
    enabled: !!itemId,
  });

  const upsertValues = useMutation({
    mutationFn: async (values: { item_id: string; field_id: string; value: string | null }[]) => {
      if (values.length === 0) return;
      const { error } = await supabase
        .from('custom_field_values')
        .upsert(values, { onConflict: 'item_id,field_id' });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['custom_field_values'] }),
  });

  return {
    values: query.data || [],
    isLoading: query.isLoading,
    upsertValues,
  };
}

export function useAllCustomFieldValues(itemIds: string[]) {
  const query = useQuery({
    queryKey: ['custom_field_values', 'bulk', itemIds.sort().join(',')],
    queryFn: async () => {
      if (itemIds.length === 0) return [];
      const { data, error } = await supabase
        .from('custom_field_values')
        .select('*')
        .in('item_id', itemIds);
      if (error) throw error;
      return data as CustomFieldValue[];
    },
    enabled: itemIds.length > 0,
  });

  return { values: query.data || [], isLoading: query.isLoading };
}
