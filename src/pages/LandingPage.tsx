import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Package, ArrowRight } from 'lucide-react';
import dashboardPreview from '@/assets/dashboard-preview.jpg';
import logo from '@/assets/logo.jpeg';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src={logo} alt="BB Collect logo" className="h-9 w-9 rounded-lg object-cover" />
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
      <section className="flex-1 flex items-center justify-center px-4 py-16 md:py-24">
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

      {/* Footer */}
      <footer className="border-t border-border px-4 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} BB Collect</span>
        </div>
      </footer>
    </div>
  );
}
