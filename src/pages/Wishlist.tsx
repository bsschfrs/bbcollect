import { useState, useMemo } from 'react';
import { useCollectionItems } from '@/hooks/useCollectionItems';
import { useCategories } from '@/hooks/useCategories';
import { useCustomFields, useAllCustomFieldValues } from '@/hooks/useCustomFields';
import ItemCard from '@/components/ItemCard';
import ItemFormDialog from '@/components/ItemFormDialog';
import ItemDetailSheet from '@/components/ItemDetailSheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Heart, Check, LayoutGrid, List, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Wishlist() {
  const { data: items = [], isLoading } = useCollectionItems('wishlist');
  const { data: categories = [] } = useCategories();
  const { updateItem } = useCollectionItems();
  const { allFields } = useCustomFields();
  const itemIds = useMemo(() => items.map(i => i.id), [items]);
  const { values: allFieldValues } = useAllCustomFieldValues(itemIds);

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [detailItem, setDetailItem] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [moveItem, setMoveItem] = useState<any>(null);
  const [movePrice, setMovePrice] = useState('');
  const [moveDate, setMoveDate] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const priorityOrder = { high: 0, medium: 1, low: 2 };

  const filtered = useMemo(() => {
    let result = items;
    if (categoryFilter !== 'all') result = result.filter(i => i.category_id === categoryFilter);
    return [...result].sort((a, b) => {
      const pa = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3;
      const pb = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3;
      return pa - pb;
    });
  }, [items, categoryFilter]);

  const visibleCategories = categories.filter(c => !c.is_hidden);

  const handleMoveToCollection = async () => {
    if (!moveItem) return;
    await updateItem.mutateAsync({
      id: moveItem.id,
      status: 'collection',
      priority: null,
      purchase_price: movePrice ? parseFloat(movePrice) : null,
      purchase_date: moveDate || null,
    });
    setMoveItem(null);
    setMovePrice('');
    setMoveDate('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Wishlist</h1>
          <p className="text-muted-foreground">{items.length} items op je wishlist</p>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <button
            onClick={() => setView('grid')}
            className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'text-foreground bg-muted' : 'hover:text-foreground'}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'text-foreground bg-muted' : 'hover:text-foreground'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Categorie" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle categorieën</SelectItem>
            {visibleCategories.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">Nog geen categorieën aangemaakt</div>
            ) : (
              visibleCategories.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.emoji} {c.name}</SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Heart className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Je wishlist is leeg</h3>
          <p className="text-sm text-muted-foreground mt-1">Voeg items toe die je nog wilt scoren!</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="relative group">
              <ItemCard
                item={item as any}
                view="grid"
                onClick={() => { setDetailItem(item); setDetailOpen(true); }}
                customFields={allFields.filter(f => f.category_id === item.category_id)}
                customFieldValues={allFieldValues.filter(v => v.item_id === item.id)}
              />
              <Button
                size="sm"
                className="absolute bottom-14 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); setMoveItem(item); }}
              >
                <Check className="h-3 w-3 mr-1" /> Gescoord!
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <div key={item.id} className="relative group">
              <ItemCard
                item={item as any}
                view="list"
                onClick={() => { setDetailItem(item); setDetailOpen(true); }}
                customFields={allFields.filter(f => f.category_id === item.category_id)}
                customFieldValues={allFieldValues.filter(v => v.item_id === item.id)}
              />
            </div>
          ))}
        </div>
      )}

      <ItemDetailSheet
        item={detailItem}
        open={detailOpen}
        onOpenChange={o => { setDetailOpen(o); if (!o) setDetailItem(null); }}
        onEdit={() => { setDetailOpen(false); setEditItem(detailItem); setDialogOpen(true); }}
        customFields={allFields.filter(f => f.category_id === detailItem?.category_id)}
        customFieldValues={allFieldValues.filter(v => v.item_id === detailItem?.id)}
      />
      <ItemFormDialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) setEditItem(null); }} editItem={editItem} defaultStatus="wishlist" />

      {/* Move to Collection Dialog */}
      <Dialog open={!!moveItem} onOpenChange={o => { if (!o) setMoveItem(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>🎉 Item gescoord!</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Verplaats "{moveItem?.name}" naar je collectie.</p>
          <div className="space-y-3 mt-2">
            <div>
              <Label>Aankoopprijs (€)</Label>
              <Input type="number" step="0.01" min="0" placeholder="0.00" value={movePrice} onChange={e => setMovePrice(e.target.value)} />
            </div>
            <div>
              <Label>Aankoopdatum</Label>
              <Input type="date" value={moveDate} onChange={e => setMoveDate(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setMoveItem(null)}>Annuleren</Button>
            <Button className="flex-1" onClick={handleMoveToCollection}>Toevoegen aan Collectie</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
