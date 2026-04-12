import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, LogOut } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function SettingsPage() {
  const { data: categories = [], addCategory, updateCategory, deleteCategory } = useCategories();
  const { user, signOut } = useAuth();
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('📦');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmoji, setEditEmoji] = useState('');

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addCategory.mutateAsync({ name: newName.trim(), emoji: newEmoji });
    setNewName('');
    setNewEmoji('📦');
  };

  const handleUpdate = async (id: string) => {
    await updateCategory.mutateAsync({ id, name: editName, emoji: editEmoji });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Instellingen</h1>
        <p className="text-muted-foreground">Beheer je categorieën en account</p>
      </div>

      {/* Categories */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="text-base">Categorieën</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Add new */}
          <div className="flex gap-2">
            <Input placeholder="Emoji" value={newEmoji} onChange={e => setNewEmoji(e.target.value)} className="w-16 text-center" />
            <Input placeholder="Nieuwe categorie..." value={newName} onChange={e => setNewName(e.target.value)} className="flex-1" onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            <Button onClick={handleAdd} size="icon"><Plus className="h-4 w-4" /></Button>
          </div>

          {/* List */}
          <div className="space-y-2 mt-4">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                {editingId === cat.id ? (
                  <>
                    <Input value={editEmoji} onChange={e => setEditEmoji(e.target.value)} className="w-14 text-center" />
                    <Input value={editName} onChange={e => setEditName(e.target.value)} className="flex-1" onKeyDown={e => e.key === 'Enter' && handleUpdate(cat.id)} />
                    <Button size="sm" onClick={() => handleUpdate(cat.id)}>Opslaan</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Annuleren</Button>
                  </>
                ) : (
                  <>
                    <span className="text-lg">{cat.emoji}</span>
                    <span className="flex-1 text-sm font-medium text-foreground">{cat.name}</span>
                    {cat.is_default && (
                      <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Standaard</span>
                    )}
                    <div className="flex items-center gap-1">
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Switch checked={!cat.is_hidden} onCheckedChange={checked => updateCategory.mutate({ id: cat.id, is_hidden: !checked })} />
                      </label>
                      <Button size="icon" variant="ghost" onClick={() => { setEditingId(cat.id); setEditName(cat.name); setEditEmoji(cat.emoji || ''); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Categorie verwijderen?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Weet je het zeker? Items in deze categorie worden niet verwijderd, maar krijgen geen categorie meer toegewezen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuleren</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteCategory.mutate(cat.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Verwijderen</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Ingelogd als <span className="font-medium text-foreground">{user?.email}</span></p>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" /> Uitloggen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
