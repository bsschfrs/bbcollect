import { Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ItemCardProps {
  item: {
    id: string;
    name: string;
    image_url: string | null;
    purchase_price: number | null;
    condition: string | null;
    status: string;
    priority: string | null;
    categories?: { name: string; emoji: string | null } | null;
  };
  view?: 'grid' | 'list';
  onClick?: () => void;
}

const conditionLabels: Record<string, string> = {
  mint: 'Mint',
  near_mint: 'Near Mint',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

const priorityColors: Record<string, string> = {
  high: 'bg-destructive/10 text-destructive',
  medium: 'bg-warning/10 text-warning',
  low: 'bg-muted text-muted-foreground',
};

export default function ItemCard({ item, view = 'grid', onClick }: ItemCardProps) {
  if (view === 'list') {
    return (
      <Card className="card-shadow hover:card-shadow-hover transition-shadow cursor-pointer" onClick={onClick}>
        <CardContent className="flex items-center gap-4 p-3">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="h-14 w-14 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.categories?.emoji} {item.categories?.name}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-semibold text-foreground">
              {item.purchase_price != null ? `€${item.purchase_price.toFixed(2)}` : '—'}
            </p>
            {item.condition && (
              <Badge variant="secondary" className="text-[10px] mt-1">{conditionLabels[item.condition] || item.condition}</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-shadow hover:card-shadow-hover transition-shadow cursor-pointer overflow-hidden" onClick={onClick}>
      <div className="aspect-square relative bg-muted">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
        {item.status === 'wishlist' && item.priority && (
          <Badge className={`absolute top-2 right-2 text-[10px] ${priorityColors[item.priority]}`}>
            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
          </Badge>
        )}
      </div>
      <CardContent className="p-3">
        <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{item.categories?.emoji} {item.categories?.name}</p>
        <p className="text-sm font-bold text-primary mt-1">
          {item.purchase_price != null ? `€${item.purchase_price.toFixed(2)}` : '—'}
        </p>
      </CardContent>
    </Card>
  );
}
