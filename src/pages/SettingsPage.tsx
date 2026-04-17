import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, LogOut, Plus, EyeOff } from 'lucide-react';
import CategoryEditorSheet from '@/components/CategoryEditorSheet';

interface Category {
  id: string;
  name: string;
  emoji: string | null;
  is_hidden: boolean;
}

export default function SettingsPage() {
  const { data: categories = [] } = useCategories();
  const { user, signOut } = useAuth();
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const openEditor = (cat: Category | null) => {
    setSelectedCategory(cat);
    setEditorOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Instellingen</h1>
        <p className="text-muted-foreground">Beheer je categorieën en account</p>
      </div>

      {/* Categories — iOS-style grouped list */}
      <Card className="card-shadow overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Categorieën</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border border-t border-border">
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => openEditor(cat as Category)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 active:bg-muted/60 transition-colors text-left min-h-[52px]"
                >
                  <span className="text-xl shrink-0 w-7 text-center">{cat.emoji}</span>
                  <span className="flex-1 text-sm font-medium text-foreground truncate">
                    {cat.name}
                  </span>
                  {cat.is_hidden && (
                    <EyeOff className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              </li>
            ))}
            {/* Add new row */}
            <li>
              <button
                type="button"
                onClick={() => openEditor(null)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 active:bg-muted/60 transition-colors text-left text-primary min-h-[52px]"
              >
                <span className="shrink-0 w-7 flex items-center justify-center">
                  <Plus className="h-5 w-5" />
                </span>
                <span className="flex-1 text-sm font-medium">Nieuwe categorie</span>
              </button>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Account */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Ingelogd als <span className="font-medium text-foreground">{user?.email}</span>
          </p>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" /> Uitloggen
          </Button>
        </CardContent>
      </Card>

      <CategoryEditorSheet
        open={editorOpen}
        onOpenChange={(o) => {
          setEditorOpen(o);
          if (!o) setSelectedCategory(null);
        }}
        category={selectedCategory}
      />
    </div>
  );
}
