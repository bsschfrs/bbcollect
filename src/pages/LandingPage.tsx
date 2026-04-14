import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Package, LayoutGrid, Heart, TrendingUp, Tags, ArrowRight } from 'lucide-react';
import dashboardPreview from '@/assets/dashboard-preview.jpg';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">BB Collect</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth?mode=login')}>
              Inloggen
            </Button>
            <Button size="sm" onClick={() => navigate('/auth?mode=register')}>
              Registreren
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pt-16 pb-12 md:pt-24 md:pb-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
            <Package className="h-4 w-4" />
            Gratis aan de slag
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight tracking-tight">
            Beheer al je collecties
            <br />
            <span className="text-primary">op één plek</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Houd bij wat je hebt, wat je zoekt en wat het waard is. Of het nu gaat om sneakers, vinyl, Pokémon-kaarten of postzegels — BB Collect houdt alles overzichtelijk.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button size="lg" onClick={() => navigate('/auth?mode=register')} className="gap-2">
              Gratis beginnen <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth?mode=login')}>
              Inloggen
            </Button>
          </div>
        </div>
      </section>

      {/* Preview */}
      <section className="px-4 pb-16 md:pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-border/60 shadow-xl overflow-hidden bg-card">
            <img
              src={dashboardPreview}
              alt="BB Collect dashboard voorbeeld"
              width={800}
              height={600}
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 md:py-24 bg-muted/40">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Alles wat je nodig hebt</h2>
            <p className="text-muted-foreground mt-2">Krachtige tools om je collectie te beheren</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FeatureCard
              icon={<LayoutGrid className="h-6 w-6" />}
              title="Collectie bijhouden"
              description="Voeg items toe met foto's, aankoopprijzen, conditie en persoonlijke notities. Alles op één plek."
            />
            <FeatureCard
              icon={<Heart className="h-6 w-6" />}
              title="Wishlist met prioriteiten"
              description="Houd bij wat je nog zoekt en geef prioriteiten aan. Scoor je een item? Verplaats het met één klik naar je collectie."
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6" />}
              title="Waarde-overzicht"
              description="Zie in één oogopslag hoeveel je hebt geïnvesteerd en wat je collectie nu waard is."
            />
            <FeatureCard
              icon={<Tags className="h-6 w-6" />}
              title="Categorieën & velden"
              description="Organiseer met eigen categorieën en voeg aangepaste velden toe zoals editie, kleur of maat."
            />
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-lg mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Klaar om te beginnen?</h2>
          <p className="text-muted-foreground">Maak gratis een account aan en begin met het bijhouden van je collectie.</p>
          <Button size="lg" onClick={() => navigate('/auth?mode=register')} className="gap-2">
            Account aanmaken <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} BB Collect</span>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
