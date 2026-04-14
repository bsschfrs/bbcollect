import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  currency: string;
  updateProfile: (updates: Partial<Pick<Profile, 'username' | 'avatar_url' | 'currency'>>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  checkUsernameAvailable: (username: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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
      setProfile(data as unknown as Profile);
    } else if (!error || error.code === 'PGRST116') {
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({ user_id: user.id })
        .select()
        .single();
      if (newProfile) setProfile(newProfile as unknown as Profile);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: Partial<Pick<Profile, 'username' | 'avatar_url' | 'currency'>>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates as any)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) throw error;
    if (data) setProfile(data as unknown as Profile);
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
    const url = `${urlData.publicUrl}?t=${Date.now()}`;
    await updateProfile({ avatar_url: url });
    return url;
  };

  const checkUsernameAvailable = async (username: string): Promise<boolean> => {
    const { data, error } = await supabase.rpc('check_username_available', {
      desired_username: username,
    });
    if (error) return false;
    return data as boolean;
  };

  const currency = profile?.currency ?? '€';

  return (
    <ProfileContext.Provider value={{ profile, loading, currency, updateProfile, uploadAvatar, checkUsernameAvailable, refetch: fetchProfile }}>
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
