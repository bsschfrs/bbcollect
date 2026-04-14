import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrency } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useCategories } from '@/hooks/useCategories';
import { useCollectionItems } from '@/hooks/useCollectionItems';
import { useCustomFields, useCustomFieldValues } from '@/hooks/useCustomFields';
import { useIsMobile } from '@/hooks/use-mobile';
import { Camera, Trash2, Settings, X } from 'lucide-react';
import ImageCropper from '@/components/ImageCropper';
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
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const currency = useCurrency();
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
    url: '',
    estimated_value: '',
  });
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { fields } = useCustomFields(form.category_id || null);
  const { values: existingValues } = useCustomFieldValues(editItem?.id || null);

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
        url: editItem.url || '',
        estimated_value: editItem.estimated_value?.toString() || '',
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
        url: '',
        estimated_value: '',
      });
      setImagePreview(null);
      setCustomFieldValues({});
    }
    setImageFile(null);
  }, [editItem, open, defaultStatus]);

  useEffect(() => {
    if (existingValues.length > 0) {
      const vals: Record<string, string> = {};
      existingValues.forEach(v => {
        if (v.value != null) vals[v.field_id] = v.value;
      });
      setCustomFieldValues(vals);
    }
  }, [existingValues]);

  useEffect(() => {
    if (!editItem) {
      setCustomFieldValues({});
    }
  }, [form.category_id]);

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

      const newEstimatedValue = form.estimated_value ? parseFloat(form.estimated_value) : null;
      const oldEstimatedValue = editItem?.estimated_value ?? null;
      const estimatedValueChanged = newEstimatedValue !== oldEstimatedValue;

      const data: any = {
        name: form.name,
        category_id: form.category_id || null,
        status: form.status as 'collection' | 'wishlist',
        purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
        purchase_date: form.purchase_date || null,
        condition: (form.condition || null) as any,
        notes: form.notes || null,
        priority: form.status === 'wishlist' ? (form.priority || null) as any : null,
        image_url: imageUrl || null,
        url: form.url || null,
        estimated_value: newEstimatedValue,
      };

      if (newEstimatedValue != null && (!editItem || estimatedValueChanged)) {
        data.value_updated_at = new Date().toISOString().split('T')[0];
      } else if (newEstimatedValue == null) {
        data.value_updated_at = null;
      }

      let itemId: string;
      if (editItem) {
        await updateItem.mutateAsync({ id: editItem.id, ...data });
        itemId = editItem.id;
      } else {
        const { data: inserted, error } = await supabase
          .from('collection_items')
          .insert({ ...data, user_id: (await supabase.auth.getUser()).data.user?.id })
          .select('id')
          .single();
        if (error) throw error;
        itemId = inserted.id;
      }

      if (fields.length > 0) {
        const valuesToUpsert = fields
          .filter(f => customFieldValues[f.id] !== undefined && customFieldValues[f.id] !== '')
          .map(f => ({
            item_id: itemId,
            field_id: f.id,
            value: customFieldValues[f.id] || null,
          }));
        if (valuesToUpsert.length > 0) {
          const { error } = await supabase
            .from('custom_field_values')
            .upsert(valuesToUpsert, { onConflict: 'item_id,field_id' });
          if (error) throw error;
        }
      }

      queryClient.invalidateQueries({ queryKey: ['collection_items'] });
      queryClient.invalidateQueries({ queryKey: ['custom_field_values'] });

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

  const hasNoCategories = visibleCategories.length === 0;
  const title = editItem ? 'Item Bewerken' : 'Nieuw Item Toevoegen';

  const formContent = (
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
        {hasNoCategories ? (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-3 bg-muted/30 mt-1">
            <p className="text-sm text-muted-foreground flex-1">
              Nog geen categorieën — maak er een aan in Instellingen.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => { onOpenChange(false); navigate('/settings'); }}
            >
              <Settings className="h-3.5 w-3.5 mr-1" /> Instellingen
            </Button>
          </div>
        ) : (
          <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
            <SelectTrigger><SelectValue placeholder="Kies categorie" /></SelectTrigger>
            <SelectContent>
              {visibleCategories.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.emoji} {c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
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
          <Label htmlFor="price">Aankoopprijs ({currency})</Label>
          <Input id="price" type="number" step="0.01" min="0" placeholder="0.00" value={form.purchase_price} onChange={e => setForm(f => ({ ...f, purchase_price: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="date">Datum verkregen</Label>
          <Input id="date" type="date" value={form.purchase_date} onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))} />
        </div>
      </div>

      {/* Estimated Value */}
      <div>
        <Label htmlFor="estimated_value">Geschatte waarde ({currency})</Label>
        <Input id="estimated_value" type="number" step="0.01" min="0" placeholder="0.00" value={form.estimated_value} onChange={e => setForm(f => ({ ...f, estimated_value: e.target.value }))} />
        {editItem?.value_updated_at && form.estimated_value === editItem.estimated_value?.toString() && (
          <p className="text-[11px] text-muted-foreground mt-1">
            Laatst bijgewerkt: {new Date(editItem.value_updated_at).toLocaleDateString('nl-NL')}
          </p>
        )}
      </div>

      {/* URL */}
      <div>
        <Label htmlFor="url">Link (URL)</Label>
        <Input id="url" type="url" placeholder="https://..." value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
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

      {/* Custom Fields */}
      {fields.length > 0 && (
        <div className="space-y-3 rounded-lg border border-border p-3 bg-muted/10">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Aangepaste velden</p>
          {fields.map(field => (
            <div key={field.id}>
              <Label className="text-sm">{field.field_name}</Label>
              {field.field_type === 'text' && (
                <Input
                  value={customFieldValues[field.id] || ''}
                  onChange={e => setCustomFieldValues(v => ({ ...v, [field.id]: e.target.value }))}
                  placeholder={field.field_name}
                />
              )}
              {field.field_type === 'number' && (
                <Input
                  type="number"
                  value={customFieldValues[field.id] || ''}
                  onChange={e => setCustomFieldValues(v => ({ ...v, [field.id]: e.target.value }))}
                  placeholder="0"
                />
              )}
              {field.field_type === 'dropdown' && (
                <Select
                  value={customFieldValues[field.id] || ''}
                  onValueChange={val => setCustomFieldValues(v => ({ ...v, [field.id]: val }))}
                >
                  <SelectTrigger><SelectValue placeholder={`Kies ${field.field_name.toLowerCase()}`} /></SelectTrigger>
                  <SelectContent>
                    {field.dropdown_options?.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>
      )}

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
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[100dvh] max-h-[100dvh] rounded-none">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <DrawerHeader className="p-0">
              <DrawerTitle className="text-lg font-semibold">{title}</DrawerTitle>
            </DrawerHeader>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 pb-8">
            {formContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
