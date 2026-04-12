import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/hooks/useCategories';
import { useCollectionItems } from '@/hooks/useCollectionItems';
import { Camera, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: any;
  defaultStatus?: 'collection' | 'wishlist';
}

export default function ItemFormDialog({ open, onOpenChange, editItem, defaultStatus = 'collection' }: ItemFormDialogProps) {
  const { data: categories = [] } = useCategories();
  const { addItem, updateItem, deleteItem, uploadImage } = useCollectionItems();
  const visibleCategories = categories.filter(c => !c.is_hidden);

  const [form, setForm] = useState({
    name: '',
    category_id: '',
    status: defaultStatus as 'collection' | 'wishlist',
    purchase_price: '',
    purchase_date: '',
    condition: '',
    notes: '',
    priority: '',
    image_url: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name || '',
        category_id: editItem.category_id || '',
        status: editItem.status || 'collection',
        purchase_price: editItem.purchase_price?.toString() || '',
        purchase_date: editItem.purchase_date || '',
        condition: editItem.condition || '',
        notes: editItem.notes || '',
        priority: editItem.priority || '',
        image_url: editItem.image_url || '',
      });
      setImagePreview(editItem.image_url || null);
    } else {
      setForm({
        name: '',
        category_id: visibleCategories[0]?.id || '',
        status: defaultStatus,
        purchase_price: '',
        purchase_date: '',
        condition: '',
        notes: '',
        priority: '',
        image_url: '',
      });
      setImagePreview(null);
    }
    setImageFile(null);
  }, [editItem, open, defaultStatus]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = form.image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const data = {
        name: form.name,
        category_id: form.category_id,
        status: form.status as 'collection' | 'wishlist',
        purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
        purchase_date: form.purchase_date || null,
        condition: (form.condition || null) as any,
        notes: form.notes || null,
        priority: form.status === 'wishlist' ? (form.priority || null) as any : null,
        image_url: imageUrl || null,
      };

      if (editItem) {
        await updateItem.mutateAsync({ id: editItem.id, ...data });
      } else {
        await addItem.mutateAsync(data);
      }
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (editItem) {
      await deleteItem.mutateAsync(editItem.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editItem ? 'Item Bewerken' : 'Nieuw Item Toevoegen'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div>
            <Label>Foto</Label>
            <label className="mt-1 flex h-40 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted transition-colors overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <Camera className="h-8 w-8 mb-1" />
                  <span className="text-sm">Klik om foto te uploaden</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name">Naam *</Label>
            <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>

          {/* Category */}
          <div>
            <Label>Categorie</Label>
            <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Kies categorie" /></SelectTrigger>
              <SelectContent>
                {visibleCategories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.emoji} {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as any }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="collection">In Collectie</SelectItem>
                <SelectItem value="wishlist">Wishlist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority (wishlist only) */}
          {form.status === 'wishlist' && (
            <div>
              <Label>Prioriteit</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                <SelectTrigger><SelectValue placeholder="Kies prioriteit" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Hoog</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Laag</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Price & Date Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Aankoopprijs (€)</Label>
              <Input id="price" type="number" step="0.01" min="0" placeholder="0.00" value={form.purchase_price} onChange={e => setForm(f => ({ ...f, purchase_price: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="date">Aankoopdatum</Label>
              <Input id="date" type="date" value={form.purchase_date} onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))} />
            </div>
          </div>

          {/* Condition */}
          <div>
            <Label>Conditie</Label>
            <Select value={form.condition} onValueChange={v => setForm(f => ({ ...f, condition: v }))}>
              <SelectTrigger><SelectValue placeholder="Kies conditie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mint">Mint</SelectItem>
                <SelectItem value="near_mint">Near Mint</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notities</Label>
            <Textarea id="notes" placeholder="Persoonlijke notities..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Opslaan...' : editItem ? 'Opslaan' : 'Toevoegen'}
            </Button>
            {editItem && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Item verwijderen?</AlertDialogTitle>
                    <AlertDialogDescription>Dit kan niet ongedaan worden gemaakt.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuleren</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Verwijderen</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
