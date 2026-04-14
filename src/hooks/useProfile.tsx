import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  currency: string;
  updateProfile: (updates: Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'currency'>>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  refetch: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setProfile(data as Profile);
    } else if (!error || error.code === 'PGRST116') {
      // Profile doesn't exist yet (e.g. existing user before migration), create it
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({ user_id: user.id })
        .select()
        .single();
      if (newProfile) setProfile(newProfile as Profile);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'currency'>>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) throw error;
    if (data) setProfile(data as Profile);
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage
      .from('collection-images')
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage
      .from('collection-images')
      .getPublicUrl(path);
    // Append cache-buster
    const url = `${urlData.publicUrl}?t=${Date.now()}`;
    await updateProfile({ avatar_url: url });
    return url;
  };

  const currency = profile?.currency ?? '€';

  return (
    <ProfileContext.Provider value={{ profile, loading, currency, updateProfile, uploadAvatar, refetch: fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within ProfileProvider');
  return context;
}

export function useCurrency() {
  const { currency } = useProfile();
  return currency;
}
