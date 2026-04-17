import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Package, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryGridItem {
  id: string;
  emoji: string | null;
  name: string;
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
}

function TilePreview({ images, emoji }: { images: string[]; emoji: string | null }) {
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
  const slots = images.slice(0, 4);
  while (slots.length < 4) slots.push(slots[slots.length - 1]);
  return (
    <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0.5 bg-background">
      {slots.map((src, i) => (
        <img key={i} src={src} alt="" className="w-full h-full object-cover" />
      ))}
    </div>
  );
}

export default function CategoryGrid({ categories, items }: CategoryGridProps) {
  const navigate = useNavigate();
  const collectionItems = useMemo(() => items.filter(i => i.status === 'collection'), [items]);

  const allPreviewImages = useMemo(
    () => collectionItems.map(i => i.image_url).filter((u): u is string => !!u).slice(0, 4),
    [collectionItems]
  );

  const categoryTiles = useMemo(() => {
    return categories.map(cat => {
      const inCat = collectionItems.filter(i => i.category_id === cat.id);
      const previewImages = inCat.map(i => i.image_url).filter((u): u is string => !!u).slice(0, 4);
      return { ...cat, count: inCat.length, previewImages };
    });
  }, [categories, collectionItems]);

  const go = (param: string) => navigate(`/collection?category=${param}`);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {/* Alles tile */}
      <button onClick={() => go('all')} className="group text-left">
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="aspect-square w-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
            {allPreviewImages.length > 0 ? (
              <TilePreview images={allPreviewImages} emoji={null} />
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

      {/* Per-category tiles */}
      {categoryTiles.map(cat => (
        <button key={cat.id} onClick={() => go(cat.id)} className="group text-left">
          <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-square w-full overflow-hidden">
              <TilePreview images={cat.previewImages} emoji={cat.emoji} />
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
