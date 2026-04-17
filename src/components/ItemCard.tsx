import { Package, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/hooks/useProfile';
import type { CustomField, CustomFieldValue } from '@/hooks/useCustomFields';

interface ItemCardProps {
  item: {
    id: string;
    name: string;
    image_url: string | null;
    purchase_price: number | null;
    estimated_value?: number | null;
    value_updated_at?: string | null;
    is_gift?: boolean;
    url?: string | null;
    condition: string | null;
    status: string;
    priority: string | null;
    categories?: { name: string; emoji: string | null } | null;
  };
  view?: 'grid' | 'list';
  onClick?: () => void;
  customFields?: CustomField[];
  customFieldValues?: CustomFieldValue[];
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
}

function CustomFieldDisplay({ fields, values }: { fields?: CustomField[]; values?: CustomFieldValue[] }) {
  if (!fields?.length) return null;
  const valueMap = new Map(values?.map(v => [v.field_id, v.value]) || []);
  const fieldsWithValues = fields.filter(f => valueMap.has(f.id));
  if (fieldsWithValues.length === 0) return null;

  return (
    <div className="mt-1 space-y-0.5">
      {fieldsWithValues.map(field => (
        <p key={field.id} className="text-[11px] text-muted-foreground truncate">
          <span className="font-medium">{field.field_name}:</span>{' '}
          {valueMap.get(field.id) || '—'}
        </p>
      ))}
    </div>
  );
}

export default function ItemCard({ item, view = 'grid', onClick, customFields, customFieldValues }: ItemCardProps) {
  const currency = useCurrency();
  const purchaseLabel = item.is_gift
    ? 'Gekregen'
    : item.purchase_price != null
      ? `${currency}${item.purchase_price.toFixed(2)}`
      : '—';

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
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
              {item.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-primary hover:text-primary/80 flex-shrink-0">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{item.categories?.emoji} {item.categories?.name}</p>
            <CustomFieldDisplay fields={customFields} values={customFieldValues} />
          </div>
          <div className="text-right flex-shrink-0 space-y-0.5">
            <p className="text-sm font-bold text-primary">
              {item.estimated_value != null ? `${currency}${item.estimated_value.toFixed(2)}` : '—'}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Aanschaf: {purchaseLabel}
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
        {item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="absolute top-2 left-2 rounded-full bg-background/80 p-1.5 text-primary hover:bg-background">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
      <CardContent className="p-3">
        <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{item.categories?.emoji} {item.categories?.name}</p>
        <p className="text-base font-bold text-primary mt-1">
          {item.estimated_value != null ? `${currency}${item.estimated_value.toFixed(2)}` : '—'}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Aanschaf: {purchaseLabel}
        </p>
        {item.estimated_value != null && item.value_updated_at && (
          <p className="text-[10px] text-muted-foreground/70">Bijgewerkt: {formatDate(item.value_updated_at)}</p>
        )}
        <CustomFieldDisplay fields={customFields} values={customFieldValues} />
      </CardContent>
    </Card>
  );
}
