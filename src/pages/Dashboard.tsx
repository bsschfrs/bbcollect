import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollectionItems } from '@/hooks/useCollectionItems';
import { useCategories } from '@/hooks/useCategories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Package, Heart, Trophy, TrendingUp } from 'lucide-react';
import OnboardingFlow from '@/components/OnboardingFlow';

export default function Dashboard() {
  const { data: allItems = [] } = useCollectionItems();
  const { data: categories = [], isSuccess: categoriesLoaded } = useCategories();
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welkom bij BB Collect!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      {categoryCounts.length > 0 && (
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Collectie per Categorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {categoryCounts.map(c => (
                <div key={c.id} className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
                  <span>{c.emoji}</span>
                  <span>{c.count} {c.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {top5.length > 0 && (
        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">Top 5 Meest Waardevol</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {top5.map((item, i) => (
                <div key={item.id} className="flex items-center gap-3">
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {allItems.length === 0 && (
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
