import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { useCategories } from '@/hooks/useCategories';
import { useIsMobile } from '@/hooks/use-mobile';
import CustomFieldsManager from '@/components/CustomFieldsManager';

interface Category {
  id: string;
  name: string;
  emoji: string | null;
  is_hidden: boolean;
}

interface CategoryEditorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null; // null = create mode
}

export default function CategoryEditorSheet({ open, onOpenChange, category }: CategoryEditorSheetProps) {
  const isMobile = useIsMobile();
  const { addCategory, updateCategory, deleteCategory } = useCategories();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📦');
  const [isHidden, setIsHidden] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);

  const isCreate = !category;

  useEffect(() => {
    if (open) {
      setName(category?.name || '');
      setEmoji(category?.emoji || '📦');
      setIsHidden(category?.is_hidden || false);
      setEmojiOpen(false);
    }
  }, [open, category]);

  const handleSave = async () => {
    if (!name.trim()) return;
    if (isCreate) {
      await addCategory.mutateAsync({ name: name.trim(), emoji });
    } else {
      await updateCategory.mutateAsync({
        id: category!.id,
        name: name.trim(),
        emoji,
        is_hidden: isHidden,
      });
    }
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (category) {
      await deleteCategory.mutateAsync(category.id);
      onOpenChange(false);
    }
  };

  const body = (
    <div className="space-y-5 py-2">
      {/* Emoji + Name row */}
      <div className="flex gap-3 items-end">
        <div>
          <Label className="text-xs text-muted-foreground">Icoon</Label>
          <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="mt-1 h-10 w-14 rounded-md border border-input bg-background text-2xl flex items-center justify-center hover:bg-muted transition-colors"
              >
                {emoji}
              </button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-auto border-none" align="start">
              <EmojiPicker
                onEmojiClick={(e) => {
                  setEmoji(e.emoji);
                  setEmojiOpen(false);
                }}
                theme={Theme.AUTO}
                width={320}
                height={380}
                searchDisabled={false}
                skinTonesDisabled
                previewConfig={{ showPreview: false }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Naam</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Categorie naam"
            className="mt-1"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>
      </div>

      {/* Visibility toggle (only when editing) */}
      {!isCreate && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Zichtbaar in app</p>
            <p className="text-xs text-muted-foreground">
              Verberg deze categorie uit menu's zonder te verwijderen
            </p>
          </div>
          <Switch checked={!isHidden} onCheckedChange={(c) => setIsHidden(!c)} />
        </div>
      )}

      {/* Custom fields */}
      {!isCreate && category && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Aangepaste velden</p>
          <CustomFieldsManager categoryId={category.id} />
        </div>
      )}

      {/* Save + Delete */}
      <div className="flex gap-2 pt-2">
        <Button onClick={handleSave} className="flex-1" disabled={!name.trim()}>
          {isCreate ? 'Toevoegen' : 'Opslaan'}
        </Button>
        {!isCreate && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Categorie verwijderen?</AlertDialogTitle>
                <AlertDialogDescription>
                  Items in deze categorie worden niet verwijderd, maar krijgen geen categorie meer toegewezen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuleren</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Verwijderen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>{isCreate ? 'Nieuwe categorie' : 'Categorie bewerken'}</SheetTitle>
          </SheetHeader>
          {body}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isCreate ? 'Nieuwe categorie' : 'Categorie bewerken'}</DialogTitle>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  );
}
