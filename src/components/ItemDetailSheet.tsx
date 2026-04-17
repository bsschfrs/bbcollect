import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, ExternalLink, TrendingUp, Pencil, Calendar, Tag, FileText } from 'lucide-react';
import { useCurrency } from '@/hooks/useProfile';
import type { CustomField, CustomFieldValue } from '@/hooks/useCustomFields';

interface ItemDetailSheetProps {
  item: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
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

const priorityLabels: Record<string, string> = {
  high: 'Hoog',
  medium: 'Gemiddeld',
  low: 'Laag',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function DetailRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: any }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium text-foreground mt-0.5">{value}</div>
      </div>
    </div>
  );
}

export default function ItemDetailSheet({ item, open, onOpenChange, onEdit, customFields, customFieldValues }: ItemDetailSheetProps) {
  const currency = useCurrency();
  if (!item) return null;

  const valueMap = new Map(customFieldValues?.map(v => [v.field_id, v.value]) || []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        {/* Image */}
        <div className="relative bg-muted">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-full h-auto object-contain" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-3 right-3 rounded-full bg-background/80 backdrop-blur-sm p-2 text-primary hover:bg-background transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Header */}
          <SheetHeader className="p-0 space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {item.categories?.emoji && <span>{item.categories.emoji}</span>}
              <span>{item.categories?.name || 'Geen categorie'}</span>
              {item.status === 'wishlist' && item.priority && (
                <Badge variant="secondary" className="text-[10px] ml-auto">
                  Prioriteit: {priorityLabels[item.priority] || item.priority}
                </Badge>
              )}
            </div>
            <SheetTitle className="text-xl font-bold text-foreground">{item.name}</SheetTitle>
          </SheetHeader>

          <Separator />

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Geschatte waarde
              </p>
              <p className="text-lg font-bold text-primary mt-0.5">
                {item.estimated_value != null ? `${currency}${Number(item.estimated_value).toFixed(2)}` : '—'}
              </p>
              {item.value_updated_at && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Bijgewerkt: {formatDate(item.value_updated_at)}
                </p>
              )}
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Aanschaf</p>
              <p className="text-lg font-bold text-foreground mt-0.5">
                {item.is_gift
                  ? 'Gekregen'
                  : item.purchase_price != null
                    ? `${currency}${Number(item.purchase_price).toFixed(2)}`
                    : '—'}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-0">
            {item.condition && (
              <DetailRow label="Conditie" value={
                <Badge variant="secondary">{conditionLabels[item.condition] || item.condition}</Badge>
              } icon={Tag} />
            )}
            {item.purchase_date && (
              <DetailRow label="Datum verkregen" value={formatDate(item.purchase_date)} icon={Calendar} />
            )}
            {item.notes && (
              <DetailRow label="Notities" value={
                <p className="whitespace-pre-wrap text-sm text-foreground">{item.notes}</p>
              } icon={FileText} />
            )}
          </div>

          {/* Custom fields */}
          {customFields && customFields.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Extra velden</p>
                <div className="space-y-0">
                  {customFields.map(field => (
                    <DetailRow
                      key={field.id}
                      label={field.field_name}
                      value={valueMap.get(field.id) || '—'}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* External link */}
          {item.url && (
            <>
              <Separator />
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Bekijk online
              </a>
            </>
          )}

          {/* Edit button */}
          <div className="pt-2">
            <Button className="w-full" size="lg" onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Pas item aan
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
