import { useState, useRef, DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollectionItems } from '@/hooks/useCollectionItems';
import { useCategories } from '@/hooks/useCategories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { DollarSign, Package, Heart, Trophy, TrendingUp, Pencil, X, Plus, Check } from 'lucide-react';
import OnboardingFlow from '@/components/OnboardingFlow';
import { useDashboardLayout } from '@/hooks/useDashboardLayout';
import { useCurrency } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: allItems = [] } = useCollectionItems();
  const { data: categories = [], isSuccess: categoriesLoaded } = useCategories();
  const currency = useCurrency();
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  const {
    visibleWidgets,
    hiddenWidgets,
    editMode,
    setEditMode,
    toggleVisibility,
    reorder,
    dragIndex,
    setDragIndex,
  } = useDashboardLayout();

  const dragOverIndex = useRef<number | null>(null);

  if (categoriesLoaded && categories.length === 0 && !onboardingDismissed) {
    return <OnboardingFlow onComplete={() => setOnboardingDismissed(true)} />;
  }

  const collectionItems = allItems.filter(i => i.status === 'collection');
  const wishlistItems = allItems.filter(i => i.status === 'wishlist');
  const totalInvested = collectionItems.reduce((sum, i) => sum + (i.purchase_price ?? 0), 0);
  const estimatedTotal = collectionItems.reduce((sum, i) => sum + ((i as any).estimated_value ?? 0), 0);

  const wishlisScored = wishlistItems.length > 0
    ? Math.round((collectionItems.length / (collectionItems.length + wishlistItems.length)) * 100)
    : 100;

  const top5 = [...collectionItems]
    .filter(i => i.purchase_price)
    .sort((a, b) => (b.purchase_price || 0) - (a.purchase_price || 0))
    .slice(0, 5);

  const categoryCounts = categories
    .filter(c => !c.is_hidden)
    .map(c => ({
      ...c,
      count: collectionItems.filter(i => i.category_id === c.id).length,
    }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count);

  const handleDragStart = (index: number) => (e: DragEvent) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (index: number) => (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragOverIndex.current = index;
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    if (dragIndex !== null && dragOverIndex.current !== null) {
      reorder(dragIndex, dragOverIndex.current);
    }
    setDragIndex(null);
    dragOverIndex.current = null;
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    dragOverIndex.current = null;
  };

  // Widget renderers
  const widgetMap: Record<string, () => React.ReactNode> = {
    totalInvested: () => (
      <Card className="card-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Totaal Geïnvesteerd</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">€{totalInvested.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground mt-1">Aankoopprijzen</p>
        </CardContent>
      </Card>
    ),
    estimatedValue: () => (
      <Card className="card-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Geschatte Waarde</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">€{estimatedTotal.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {estimatedTotal >= totalInvested && totalInvested > 0
              ? `+€${(estimatedTotal - totalInvested).toFixed(2)} winst`
              : totalInvested > 0
                ? `-€${(totalInvested - estimatedTotal).toFixed(2)} verlies`
                : 'Huidige waarde'}
          </p>
        </CardContent>
      </Card>
    ),
    inCollection: () => (
      <Card className="card-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">In Collectie</CardTitle>
          <Package className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{collectionItems.length}</div>
          <p className="text-xs text-muted-foreground mt-1">items verzameld</p>
        </CardContent>
      </Card>
    ),
    wishlistMeter: () => (
      <Card className="card-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Wishlist Meter</CardTitle>
          <Heart className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{collectionItems.length} / {collectionItems.length + wishlistItems.length}</div>
          <Progress value={wishlisScored} className="mt-2 h-2" />
          <p className="text-xs text-muted-foreground mt-1">items gescoord</p>
        </CardContent>
      </Card>
    ),
    categoryBreakdown: () => categoryCounts.length > 0 ? (
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Collectie per Categorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {categoryCounts.map(c => (
              <button
                key={c.id}
                onClick={() => !editMode && navigate(`/collection?category=${c.id}`)}
                className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/70 transition-colors cursor-pointer"
              >
                <span>{c.emoji}</span>
                <span>{c.count} {c.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    ) : null,
    top5: () => top5.length > 0 ? (
      <Card className="card-shadow">
        <CardHeader className="flex flex-row items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold">Top 5 Meest Waardevol</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {top5.map((item, i) => (
              <button key={item.id} onClick={() => !editMode && navigate(`/collection?detail=${item.id}`)} className="flex items-center gap-3 w-full text-left hover:bg-secondary/50 rounded-lg p-1 -m-1 transition-colors cursor-pointer">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {i + 1}
                </span>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-muted" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                </div>
                <span className="text-sm font-semibold text-foreground">€{item.purchase_price?.toFixed(2)}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    ) : null,
  };

  // Determine which stat widgets go in the grid vs full-width
  const statWidgetIds = ['totalInvested', 'estimatedValue', 'inCollection', 'wishlistMeter'];
  const visibleStats = visibleWidgets.filter(w => statWidgetIds.includes(w.id));
  const visibleFull = visibleWidgets.filter(w => !statWidgetIds.includes(w.id));

  return (
    <div className="space-y-6">
      {/* Edit mode toggle */}
      <div className="flex justify-end">
        {!editMode ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditMode(true)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={() => setEditMode(false)}
            className="gap-1.5"
          >
            <Check className="h-4 w-4" />
            Opslaan
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      {visibleStats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleStats.map((widget, idx) => {
            const globalIdx = visibleWidgets.indexOf(widget);
            return (
              <div
                key={widget.id}
                draggable={editMode}
                onDragStart={handleDragStart(globalIdx)}
                onDragOver={handleDragOver(globalIdx)}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                className={cn(
                  'relative transition-all',
                  editMode && 'cursor-grab active:cursor-grabbing',
                  editMode && 'ring-2 ring-dashed ring-primary/30 rounded-xl',
                  dragIndex === globalIdx && 'opacity-50'
                )}
              >
                {editMode && (
                  <button
                    onClick={() => toggleVisibility(widget.id)}
                    className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                {widgetMap[widget.id]?.()}
              </div>
            );
          })}
        </div>
      )}

      {/* Full-width widgets */}
      {visibleFull.map(widget => {
        const globalIdx = visibleWidgets.indexOf(widget);
        const content = widgetMap[widget.id]?.();
        if (!content) return null;
        return (
          <div
            key={widget.id}
            draggable={editMode}
            onDragStart={handleDragStart(globalIdx)}
            onDragOver={handleDragOver(globalIdx)}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            className={cn(
              'relative transition-all',
              editMode && 'cursor-grab active:cursor-grabbing',
              editMode && 'ring-2 ring-dashed ring-primary/30 rounded-xl',
              dragIndex === globalIdx && 'opacity-50'
            )}
          >
            {editMode && (
              <button
                onClick={() => toggleVisibility(widget.id)}
                className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {content}
          </div>
        );
      })}

      {/* Hidden widgets panel in edit mode */}
      {editMode && hiddenWidgets.length > 0 && (
        <Card className="border-dashed border-2 border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verborgen widgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {hiddenWidgets.map(widget => (
                <Button
                  key={widget.id}
                  variant="outline"
                  size="sm"
                  onClick={() => toggleVisibility(widget.id)}
                  className="gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {widget.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {allItems.length === 0 && !editMode && (
        <Card className="card-shadow">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Je collectie is nog leeg</h3>
            <p className="text-sm text-muted-foreground mt-1">Begin met het toevoegen van items aan je collectie!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
