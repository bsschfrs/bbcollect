import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Sparkles, ArrowRight, X } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { addCategory } = useCategories();
  const [categories, setCategories] = useState<{ name: string; emoji: string }[]>([]);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('📦');
  const [saving, setSaving] = useState(false);

  const handleAdd = () => {
    if (!newName.trim()) return;
    setCategories(prev => [...prev, { name: newName.trim(), emoji: newEmoji }]);
    setNewName('');
    setNewEmoji('📦');
  };

  const handleRemove = (index: number) => {
    setCategories(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      for (const cat of categories) {
        await addCategory.mutateAsync(cat);
      }
      onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="card-shadow w-full max-w-md">
        <CardContent className="pt-8 pb-6 px-6 space-y-6">
          {/* Welcome */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Welkom bij BB Collect!</h1>
            <p className="text-muted-foreground text-sm">
              Laten we je eerste categorieën instellen zodat je meteen kunt beginnen met verzamelen.
            </p>
          </div>

          {/* Added categories */}
          {categories.length > 0 && (
            <div className="space-y-2">
              {categories.map((cat, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-2.5 bg-muted/30">
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="flex-1 text-sm font-medium text-foreground">{cat.name}</span>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleRemove(i)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add category input */}
          <div className="flex gap-2">
            <Input
              placeholder="Emoji"
              value={newEmoji}
              onChange={e => setNewEmoji(e.target.value)}
              className="w-16 text-center"
            />
            <Input
              placeholder="Bijv. Pokémon Cards"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="flex-1"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd} size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            {categories.length > 0 && (
              <Button onClick={handleFinish} disabled={saving} className="w-full">
                {saving ? 'Opslaan...' : 'Aan de slag!'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            <Button variant="ghost" onClick={onComplete} className="w-full text-muted-foreground">
              Overslaan voor nu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
