import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon, RotateCcw, Package } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCategories } from '@/hooks/useCategories';
import { useCollectionItems } from '@/hooks/useCollectionItems';
import ImageCropper from '@/components/ImageCropper';

interface CategoryCoverPickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string | null;
  categoryName?: string;
}

export default function CategoryCoverPickerSheet({ open, onOpenChange, categoryId, categoryName }: CategoryCoverPickerSheetProps) {
  const isMobile = useIsMobile();
  const { updateCategory } = useCategories();
  const { data: allItems = [], uploadImage } = useCollectionItems();
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const itemsInCategory = allItems.filter(i => i.category_id === categoryId && i.image_url);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCropperSrc(url);
    }
    e.target.value = '';
  };

  const handleCropComplete = async (croppedFile: File) => {
    if (!categoryId) return;
    setCropperSrc(null);
    setSaving(true);
    try {
      const url = await uploadImage(croppedFile);
      await updateCategory.mutateAsync({ id: categoryId, cover_image_url: url });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const handlePickFromItem = async (imageUrl: string) => {
    if (!categoryId) return;
    setSaving(true);
    try {
      await updateCategory.mutateAsync({ id: categoryId, cover_image_url: imageUrl });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!categoryId) return;
    setSaving(true);
    try {
      await updateCategory.mutateAsync({ id: categoryId, cover_image_url: null });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const body = (
    <div className="space-y-6 py-2">
      <p className="text-sm text-muted-foreground">
        Kies een cover voor {categoryName || 'deze categorie'}.
      </p>

      {/* Upload new */}
      <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/40 active:bg-muted/60 cursor-pointer transition-colors">
        <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Upload className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">Upload nieuwe foto</div>
          <div className="text-xs text-muted-foreground">Uit je fotobibliotheek of camera</div>
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={saving}
        />
      </label>

      {/* Pick from existing items */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ImageIcon className="w-4 h-4" />
          Kies uit je items
        </div>
        {itemsInCategory.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
            <Package className="w-8 h-8" />
            <div className="text-xs">Nog geen items met foto in deze categorie</div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
            {itemsInCategory.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePickFromItem(item.image_url!)}
                disabled={saving}
                className="aspect-square rounded-md overflow-hidden border border-border hover:ring-2 hover:ring-primary transition-all"
              >
                <img src={item.image_url!} alt={item.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reset */}
      <div className="space-y-2">
        <Button variant="outline" className="w-full" onClick={handleReset} disabled={saving}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Terug naar standaard
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Toont weer een mozaïek van je items
        </p>
      </div>
    </div>
  );

  const cropperElement = cropperSrc ? (
    <ImageCropper
      open={!!cropperSrc}
      imageSrc={cropperSrc}
      onClose={() => setCropperSrc(null)}
      onCropComplete={handleCropComplete}
    />
  ) : null;

  if (isMobile) {
    return (
      <>
        {cropperElement}
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="bottom" className="z-[60] max-h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Cover wijzigen</SheetTitle>
            </SheetHeader>
            {body}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <>
      {cropperElement}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cover wijzigen</DialogTitle>
          </DialogHeader>
          {body}
        </DialogContent>
      </Dialog>
    </>
  );
}
