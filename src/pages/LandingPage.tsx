import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Package, ArrowRight, Loader2 } from 'lucide-react';
import mockup from '@/assets/bb-collect-mockup.png';
import logo from '@/assets/logo.jpeg';

export default function LandingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<'register' | 'login' | null>(null);

  const handleNavigate = (mode: 'register' | 'login') => {
    setLoading(mode);
    setTimeout(() => navigate(`/auth?mode=${mode}`), 400);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-5xl mx-auto flex items-center px-4 py-3">
          <div className="flex items-center gap-2 mx-auto">
            <img src={logo} alt="BB Collect logo" className="h-9 w-9 rounded-lg object-cover" />
            <span className="text-lg font-bold text-foreground">BB Collect</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-start justify-center px-4 pt-8 pb-16 md:pt-12 md:pb-24">
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
            Houd bij wat je hebt, wat je zoekt en wat het waard is. Of het nu gaat om sneakers, vinyl, Pokémon-kaarten of postzegels.
          </p>
          <p className="text-lg font-semibold text-foreground">
            BB Collect houdt alles overzichtelijk.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={() => handleNavigate('register')}
              disabled={loading !== null}
              className="gap-2 active:scale-95 transition-transform duration-150"
            >
              {loading === 'register' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Gratis beginnen <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleNavigate('login')}
              disabled={loading !== null}
              className="active:scale-95 transition-transform duration-150"
            >
              {loading === 'login' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Inloggen'
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Mockup */}
      <section className="px-6 pb-16 md:pb-24">
        <div className="max-w-[200px] md:max-w-[240px] mx-auto">
          <img
            src={mockup}
            alt="BB Collect app voorbeeld"
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
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
