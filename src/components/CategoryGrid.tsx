import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Package, Layers, Camera, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryGridItem {
  id: string;
  emoji: string | null;
  name: string;
  cover_image_url?: string | null;
}

interface Item {
  id: string;
  category_id: string | null;
  image_url: string | null;
  status: string;
}

interface CategoryGridProps {
  categories: CategoryGridItem[];
  items: Item[];
  view: 'grid' | 'list';
  editMode: boolean;
  onEditCover: (categoryId: string, categoryName: string) => void;
}

function TileCover({ coverUrl, images, emoji }: { coverUrl?: string | null; images: string[]; emoji: string | null }) {
  if (coverUrl) {
    return <img src={coverUrl} alt="" className="w-full h-full object-cover" />;
  }
  if (images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        {emoji ? (
          <span className="text-5xl">{emoji}</span>
        ) : (
          <Package className="w-10 h-10 text-muted-foreground" />
        )}
      </div>
    );
  }
  if (images.length === 1) {
    return <img src={images[0]} alt="" className="w-full h-full object-cover" />;
  }
  const slots: (string | null)[] = [images[0], images[1], images[2] || null, images[3] || null];
  return (
    <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0.5 bg-background">
      {slots.map((src, i) =>
        src ? (
          <img key={i} src={src} alt="" className="w-full h-full object-cover" />
        ) : (
          <div key={i} className="w-full h-full flex items-center justify-center bg-muted">
            <Camera className="w-4 h-4 text-muted-foreground/50" />
          </div>
        )
      )}
    </div>
  );
}

export default function CategoryGrid({ categories, items, view, editMode, onEditCover }: CategoryGridProps) {
  const navigate = useNavigate();
  const collectionItems = useMemo(() => items.filter(i => i.status === 'collection'), [items]);

  const allPreviewImages = useMemo(
    () => collectionItems.map(i => i.image_url).filter((u): u is string => !!u).slice(0, 4),
    [collectionItems]
  );

  const categoryTiles = useMemo(() => {
    return categories
      .map(cat => {
        const inCat = collectionItems.filter(i => i.category_id === cat.id);
        const previewImages = inCat.map(i => i.image_url).filter((u): u is string => !!u).slice(0, 4);
        return { ...cat, count: inCat.length, previewImages };
      })
      .filter(cat => cat.count > 0);
  }, [categories, collectionItems]);

  const handleTileClick = (catId: string, catName: string) => {
    if (editMode) {
      onEditCover(catId, catName);
    } else {
      navigate(`/collection?category=${catId}`);
    }
  };

  const handleAllClick = () => {
    if (editMode) return;
    navigate('/collection?category=all');
  };

  if (view === 'list') {
    return (
      <Card className="overflow-hidden divide-y divide-border">
        <button
          onClick={handleAllClick}
          disabled={editMode}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 transition-colors text-left",
            !editMode && "hover:bg-muted/40 active:bg-muted/60",
            editMode && "opacity-50"
          )}
        >
          <div className="w-12 h-12 rounded-md overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 shrink-0 flex items-center justify-center">
            {allPreviewImages.length > 0 ? (
              <TileCover images={allPreviewImages} emoji={null} />
            ) : (
              <Layers className="w-6 h-6 text-primary/60" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">Alles</div>
            <div className="text-xs text-muted-foreground">
              {collectionItems.length} {collectionItems.length === 1 ? 'item' : 'items'}
            </div>
          </div>
        </button>

        {categoryTiles.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleTileClick(cat.id, cat.name)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 transition-colors text-left hover:bg-muted/40 active:bg-muted/60",
              editMode && "ring-2 ring-dashed ring-primary/30 ring-inset"
            )}
          >
            <div className="w-12 h-12 rounded-md overflow-hidden shrink-0">
              <TileCover coverUrl={cat.cover_image_url} images={cat.previewImages} emoji={cat.emoji} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">
                {cat.emoji ? `${cat.emoji} ` : ''}{cat.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {cat.count} {cat.count === 1 ? 'item' : 'items'}
              </div>
            </div>
            {editMode && <Pencil className="w-4 h-4 text-primary shrink-0" />}
          </button>
        ))}
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      <button
        onClick={handleAllClick}
        disabled={editMode}
        className={cn("group text-left", editMode && "opacity-50")}
      >
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="aspect-square w-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
            {allPreviewImages.length > 0 ? (
              <TileCover images={allPreviewImages} emoji={null} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Layers className="w-12 h-12 text-primary/60" />
              </div>
            )}
          </div>
          <div className="p-3">
            <div className="font-medium text-sm truncate">Alles</div>
            <div className="text-xs text-muted-foreground">
              {collectionItems.length} {collectionItems.length === 1 ? 'item' : 'items'}
            </div>
          </div>
        </Card>
      </button>

      {categoryTiles.map(cat => (
        <button
          key={cat.id}
          onClick={() => handleTileClick(cat.id, cat.name)}
          className="group text-left"
        >
          <Card className={cn(
            "overflow-hidden hover:shadow-md transition-shadow relative",
            editMode && "ring-2 ring-dashed ring-primary/40"
          )}>
            <div className="aspect-square w-full overflow-hidden relative">
              <TileCover coverUrl={cat.cover_image_url} images={cat.previewImages} emoji={cat.emoji} />
              {editMode && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                    <Pencil className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>
            <div className="p-3">
              <div className="font-medium text-sm truncate">
                {cat.emoji ? `${cat.emoji} ` : ''}{cat.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {cat.count} {cat.count === 1 ? 'item' : 'items'}
              </div>
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}
