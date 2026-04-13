import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCollectionItems } from '@/hooks/useCollectionItems';
import { useCategories } from '@/hooks/useCategories';
import { useCustomFields, useAllCustomFieldValues } from '@/hooks/useCustomFields';
import ItemCard from '@/components/ItemCard';
import ItemFormDialog from '@/components/ItemFormDialog';
import ItemDetailSheet from '@/components/ItemDetailSheet';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, LayoutGrid, List, Package } from 'lucide-react';

export default function Collection() {
  const [searchParams] = useSearchParams();
  const { data: items = [], isLoading } = useCollectionItems();
  const { data: categories = [] } = useCategories();
  const { allFields } = useCustomFields();
  const itemIds = useMemo(() => items.map(i => i.id), [items]);
  const { values: allFieldValues } = useAllCustomFieldValues(itemIds);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');

  // Apply category/detail from URL query params on mount
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setCategoryFilter(cat);
    const detailId = searchParams.get('detail');
    if (detailId && items.length > 0) {
      const found = items.find(i => i.id === detailId);
      if (found) {
        setDetailItem(found);
        setDetailOpen(true);
      }
    }
  }, [searchParams, items]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [detailItem, setDetailItem] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customFieldFilters, setCustomFieldFilters] = useState<Record<string, string>>({});

  // Get dropdown custom fields for the selected category (or all if no category filter)
  const dropdownFields = useMemo(() => {
    if (categoryFilter !== 'all') {
      return allFields.filter(f => f.category_id === categoryFilter && f.field_type === 'dropdown');
    }
    return [];
  }, [allFields, categoryFilter]);

  // Build a map of item_id -> field_id -> value for quick lookup
  const fieldValueMap = useMemo(() => {
    const map = new Map<string, Map<string, string>>();
    allFieldValues.forEach(v => {
      if (!map.has(v.item_id)) map.set(v.item_id, new Map());
      if (v.value) map.get(v.item_id)!.set(v.field_id, v.value);
    });
    return map;
  }, [allFieldValues]);

  const filtered = useMemo(() => {
    let result = items;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i => {
        if (i.name.toLowerCase().includes(q) || i.notes?.toLowerCase().includes(q)) return true;
        // Search in custom field values
        const vals = fieldValueMap.get(i.id);
        if (vals) {
          for (const v of vals.values()) {
            if (v.toLowerCase().includes(q)) return true;
          }
        }
        return false;
      });
    }
    if (categoryFilter !== 'all') result = result.filter(i => i.category_id === categoryFilter);
    if (conditionFilter !== 'all') result = result.filter(i => i.condition === conditionFilter);
    if (statusFilter !== 'all') result = result.filter(i => i.status === statusFilter);

    // Apply custom field filters
    for (const [fieldId, filterValue] of Object.entries(customFieldFilters)) {
      if (filterValue && filterValue !== 'all') {
        result = result.filter(i => {
          const vals = fieldValueMap.get(i.id);
          return vals?.get(fieldId) === filterValue;
        });
      }
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'price': return (b.purchase_price || 0) - (a.purchase_price || 0);
        case 'purchase_date': return (b.purchase_date || '').localeCompare(a.purchase_date || '');
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    return result;
  }, [items, search, categoryFilter, conditionFilter, statusFilter, sortBy, customFieldFilters, fieldValueMap]);

  const visibleCategories = categories.filter(c => !c.is_hidden);

  // Reset custom field filters when category changes
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setCustomFieldFilters({});
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mijn Collectie</h1>
        <p className="text-muted-foreground">{items.length} items in totaal</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Zoeken..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Categorie" /></SelectTrigger>
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alles</SelectItem>
            <SelectItem value="collection">In Collectie</SelectItem>
            <SelectItem value="wishlist">Wishlist</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Nieuwste</SelectItem>
            <SelectItem value="name">Naam</SelectItem>
            <SelectItem value="price">Prijs</SelectItem>
            <SelectItem value="purchase_date">Aankoopdatum</SelectItem>
          </SelectContent>
        </Select>
        {/* Custom field dropdown filters */}
        {dropdownFields.map(field => (
          <Select
            key={field.id}
            value={customFieldFilters[field.id] || 'all'}
            onValueChange={v => setCustomFieldFilters(f => ({ ...f, [field.id]: v }))}
          >
            <SelectTrigger className="w-[150px]"><SelectValue placeholder={field.field_name} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle {field.field_name.toLowerCase()}</SelectItem>
              {field.dropdown_options?.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        <div className="flex rounded-lg border border-border overflow-hidden">
          <Button variant={view === 'grid' ? 'default' : 'ghost'} size="icon" onClick={() => setView('grid')} className="rounded-none">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={view === 'list' ? 'default' : 'ghost'} size="icon" onClick={() => setView('list')} className="rounded-none">
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Items */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Geen items gevonden</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length === 0 ? 'Begin met het toevoegen van items!' : 'Probeer andere filters.'}
          </p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(item => (
            <ItemCard
              key={item.id}
              item={item as any}
              view="grid"
              onClick={() => { setDetailItem(item); setDetailOpen(true); }}
              customFields={allFields.filter(f => f.category_id === item.category_id)}
              customFieldValues={allFieldValues.filter(v => v.item_id === item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <ItemCard
              key={item.id}
              item={item as any}
              view="list"
              onClick={() => { setDetailItem(item); setDetailOpen(true); }}
              customFields={allFields.filter(f => f.category_id === item.category_id)}
              customFieldValues={allFieldValues.filter(v => v.item_id === item.id)}
            />
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
      <ItemFormDialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) setEditItem(null); }} editItem={editItem} />
    </div>
  );
}
