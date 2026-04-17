import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCollectionItems } from '@/hooks/useCollectionItems';
import { useCategories } from '@/hooks/useCategories';
import { useCustomFields, useAllCustomFieldValues } from '@/hooks/useCustomFields';
import ItemCard from '@/components/ItemCard';
import ItemFormDialog from '@/components/ItemFormDialog';
import ItemDetailSheet from '@/components/ItemDetailSheet';
import CategoryGrid from '@/components/CategoryGrid';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, LayoutGrid, List, Package, ArrowLeft, Pencil, Check } from 'lucide-react';
import CategoryCoverPickerSheet from '@/components/CategoryCoverPickerSheet';

export default function Collection() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryParam = searchParams.get('category');
  const { data: items = [], isLoading } = useCollectionItems('collection');
  const { data: categories = [] } = useCategories();
  const { allFields } = useCustomFields();
  const itemIds = useMemo(() => items.map(i => i.id), [items]);
  const { values: allFieldValues } = useAllCustomFieldValues(itemIds);

  const [search, setSearch] = useState('');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [detailItem, setDetailItem] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customFieldFilters, setCustomFieldFilters] = useState<Record<string, string>>({});
  const [overviewEditMode, setOverviewEditMode] = useState(false);
  const [overviewView, setOverviewView] = useState<'grid' | 'list'>('grid');
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [coverPickerCategory, setCoverPickerCategory] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const detailId = searchParams.get('detail');
    if (detailId && items.length > 0) {
      const found = items.find(i => i.id === detailId);
      if (found) {
        setDetailItem(found);
        setDetailOpen(true);
      }
    }
  }, [searchParams, items]);

  useEffect(() => {
    setCustomFieldFilters({});
  }, [categoryParam]);

  const activeCategory = categoryParam === 'all'
    ? null
    : categories.find(c => c.id === categoryParam);

  const dropdownFields = useMemo(() => {
    if (categoryParam && categoryParam !== 'all') {
      return allFields.filter(f => f.category_id === categoryParam && f.field_type === 'dropdown');
    }
    return [];
  }, [allFields, categoryParam]);

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

    if (categoryParam && categoryParam !== 'all') {
      result = result.filter(i => i.category_id === categoryParam);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i => {
        if (i.name.toLowerCase().includes(q) || i.notes?.toLowerCase().includes(q)) return true;
        const vals = fieldValueMap.get(i.id);
        if (vals) {
          for (const v of vals.values()) {
            if (v.toLowerCase().includes(q)) return true;
          }
        }
        return false;
      });
    }

    if (conditionFilter !== 'all') result = result.filter(i => i.condition === conditionFilter);

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
  }, [items, categoryParam, search, conditionFilter, sortBy, customFieldFilters, fieldValueMap]);

  if (!categoryParam) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Mijn Collectie</h1>
            <p className="text-sm text-muted-foreground">Kies een categorie om te bekijken</p>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground shrink-0">
            <button
              onClick={() => setOverviewView('grid')}
              className={`p-1.5 rounded-md transition-colors ${overviewView === 'grid' ? 'text-foreground bg-muted' : 'hover:text-foreground'}`}
              aria-label="Grid weergave"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setOverviewView('list')}
              className={`p-1.5 rounded-md transition-colors ${overviewView === 'list' ? 'text-foreground bg-muted' : 'hover:text-foreground'}`}
              aria-label="Lijst weergave"
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setOverviewEditMode(m => !m)}
              className={`p-1.5 rounded-md transition-colors ml-1 ${overviewEditMode ? 'text-primary bg-primary/10' : 'hover:text-foreground'}`}
              aria-label={overviewEditMode ? 'Klaar met bewerken' : 'Covers bewerken'}
            >
              {overviewEditMode ? <Check className="h-5 w-5" /> : <Pencil className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <CategoryGrid
          categories={categories.filter(c => !c.is_hidden)}
          items={items}
          view={overviewView}
          editMode={overviewEditMode}
          onEditCover={(id, name) => {
            setCoverPickerCategory({ id, name });
            setCoverPickerOpen(true);
          }}
        />

        <CategoryCoverPickerSheet
          open={coverPickerOpen}
          onOpenChange={(o) => {
            setCoverPickerOpen(o);
            if (!o) setCoverPickerCategory(null);
          }}
          categoryId={coverPickerCategory?.id ?? null}
          categoryName={coverPickerCategory?.name}
        />
      </div>
    );
  }

  const headerTitle = categoryParam === 'all'
    ? 'Alles'
    : activeCategory ? `${activeCategory.emoji || ''} ${activeCategory.name}`.trim() : 'Categorie';

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <button
            onClick={() => navigate('/collection')}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug
          </button>
          <h1 className="text-2xl font-bold">{headerTitle}</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <button
            onClick={() => setView('grid')}
            className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'text-foreground bg-muted' : 'hover:text-foreground'}`}
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'text-foreground bg-muted' : 'hover:text-foreground'}`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Zoeken..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="sm:w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Nieuwste</SelectItem>
            <SelectItem value="name">Naam</SelectItem>
            <SelectItem value="price">Prijs</SelectItem>
            <SelectItem value="purchase_date">Datum verkregen</SelectItem>
          </SelectContent>
        </Select>
        {dropdownFields.map(field => (
          <Select
            key={field.id}
            value={customFieldFilters[field.id] || 'all'}
            onValueChange={v => setCustomFieldFilters(f => ({ ...f, [field.id]: v }))}
          >
            <SelectTrigger className="sm:w-[180px]"><SelectValue placeholder={field.field_name} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle {field.field_name.toLowerCase()}</SelectItem>
              {field.dropdown_options?.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="font-medium">Geen items gevonden</h3>
          <p className="text-sm text-muted-foreground">
            {items.length === 0 ? 'Begin met het toevoegen van items!' : 'Probeer andere filters.'}
          </p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.map(item => (
            <ItemCard
              key={item.id}
              item={item}
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
              item={item}
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
      <ItemFormDialog
        open={dialogOpen}
        onOpenChange={o => { setDialogOpen(o); if (!o) setEditItem(null); }}
        editItem={editItem}
      />
    </div>
  );
}
