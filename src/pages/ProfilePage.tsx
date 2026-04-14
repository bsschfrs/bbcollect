import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useCollectionItems } from '@/hooks/useCollectionItems';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Camera, User, LogOut, Trash2, Calendar, Package, FolderOpen, Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

const CURRENCIES = [
  { value: '€', label: '€ Euro' },
  { value: '$', label: '$ Dollar' },
  { value: '£', label: '£ Pond' },
  { value: '¥', label: '¥ Yen' },
  { value: 'CHF', label: 'CHF Frank' },
  { value: 'kr', label: 'kr Kroon' },
  { value: 'zł', label: 'zł Zloty' },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, updateProfile, uploadAvatar, currency } = useProfile();
  const { data: allItems = [] } = useCollectionItems();
  const { data: categories = [] } = useCategories();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const collectionCount = allItems.filter(i => i.status === 'collection').length;
  const categoryCount = categories.filter(c => !c.is_hidden).length;
  const memberSince = user?.created_at ? format(new Date(user.created_at), 'd MMMM yyyy', { locale: nl }) : '—';

  const initials = (profile?.display_name || user?.email || '?')
    .split(/[\s@]/)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join('');

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAvatar(file);
      toast.success('Profielfoto bijgewerkt');
    } catch {
      toast.error('Fout bij uploaden van foto');
    }
  };

  const handleSaveName = async () => {
    setSaving(true);
    try {
      await updateProfile({ display_name: displayName || null });
      toast.success('Naam opgeslagen');
    } catch {
      toast.error('Fout bij opslaan');
    }
    setSaving(false);
  };

  const handleCurrencyChange = async (value: string) => {
    try {
      await updateProfile({ currency: value });
      toast.success('Valuta bijgewerkt');
    } catch {
      toast.error('Fout bij wijzigen valuta');
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      toast.error('Wachtwoord moet minimaal 6 tekens zijn');
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Wachtwoord gewijzigd');
      setNewPassword('');
    } catch {
      toast.error('Fout bij wijzigen wachtwoord');
    }
    setChangingPassword(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      // Delete profile data (items + categories cascade via RLS, profile deleted)
      await supabase.from('collection_items').delete().eq('user_id', user!.id);
      await supabase.from('categories').delete().eq('user_id', user!.id);
      await supabase.from('profiles').delete().eq('user_id', user!.id);
      await signOut();
      toast.success('Account verwijderd');
    } catch {
      toast.error('Fout bij verwijderen van account');
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Terug
      </button>

      {/* Profile photo & name */}
      <Card className="card-shadow">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={profile?.avatar_url ?? undefined} alt="Profiel" />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {initials || <User className="h-10 w-10" />}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>

            <div className="w-full space-y-2">
              <Label htmlFor="displayName">Weergavenaam</Label>
              <div className="flex gap-2">
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Jouw naam"
                />
                <Button onClick={handleSaveName} disabled={saving} size="sm" className="shrink-0">
                  Opslaan
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card className="card-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Account instellingen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Valuta</Label>
            <Select value={currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Wachtwoord wijzigen</Label>
            <div className="flex gap-2">
              <Input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Nieuw wachtwoord"
              />
              <Button onClick={handlePasswordChange} disabled={changingPassword || !newPassword} size="sm" variant="outline" className="shrink-0">
                Wijzig
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collection Stats */}
      <Card className="card-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Jouw verzamelreis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <Calendar className="h-5 w-5 mx-auto text-primary" />
              <p className="text-xs text-muted-foreground">Lid sinds</p>
              <p className="text-sm font-semibold text-foreground">{memberSince}</p>
            </div>
            <div className="space-y-1">
              <Package className="h-5 w-5 mx-auto text-primary" />
              <p className="text-xs text-muted-foreground">Items</p>
              <p className="text-sm font-semibold text-foreground">{collectionCount}</p>
            </div>
            <div className="space-y-1">
              <FolderOpen className="h-5 w-5 mx-auto text-primary" />
              <p className="text-xs text-muted-foreground">Categorieën</p>
              <p className="text-sm font-semibold text-foreground">{categoryCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="card-shadow">
        <CardContent className="pt-6 space-y-3">
          <Button onClick={signOut} variant="outline" className="w-full justify-start gap-2">
            <LogOut className="h-4 w-4" />
            Uitloggen
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
                Account verwijderen
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Account verwijderen?</AlertDialogTitle>
                <AlertDialogDescription>
                  Dit verwijdert al je gegevens permanent: je collectie, categorieën, en profiel. Deze actie kan niet ongedaan worden gemaakt.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuleren</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? 'Verwijderen...' : 'Ja, verwijder mijn account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
