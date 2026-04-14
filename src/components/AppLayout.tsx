import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Library, Heart, Plus, Settings, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ItemFormDialog from '@/components/ItemFormDialog';
import logo from '@/assets/logo.jpeg';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/collection', icon: Library, label: 'Collectie' },
  { to: '/wishlist', icon: Heart, label: 'Wishlist' },
  { to: '/settings', icon: Settings, label: 'Instellingen' },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const showAddButton = pathname !== '/settings' && pathname !== '/profile';
  const { user } = useAuth();
  const { profile } = useProfile();
  const [addOpen, setAddOpen] = useState(false);

  const initials = (profile?.username || user?.email || '?')
    .split(/[\s@]/)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join('');

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed top-0 left-0 h-screen border-r border-border bg-card p-4 z-40">
        <div className="flex items-center gap-2 px-3 py-4 mb-4">
          <img src={logo} alt="BB Collect logo" className="h-9 w-9 rounded-lg object-cover" />
          <span className="text-lg font-bold text-foreground">BB Collect</span>
        </div>

        {/* Add button */}
        {showAddButton && (
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium mb-4 hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Toevoegen
          </button>
        )}

        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                pathname === to
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop profile avatar at bottom of sidebar */}
        <button
          onClick={() => navigate('/profile')}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            pathname === '/profile'
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          )}
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt="Profiel" />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <span className="truncate">{profile?.username || 'Profiel'}</span>
        </button>
      </aside>

      {/* Sidebar spacer for desktop */}
      <div className="hidden md:block w-64 flex-shrink-0" />

      {/* Mobile top bar with avatar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex md:hidden items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <img src={logo} alt="BB Collect logo" className="h-7 w-7 rounded-lg object-cover" />
          <span className="text-sm font-bold text-foreground">BB Collect</span>
        </div>
        <button onClick={() => navigate('/profile')}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt="Profiel" />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 overflow-auto pt-14 md:pt-0">
        <div className="mx-auto max-w-6xl p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile FAB */}
      {showAddButton && (
        <button
          onClick={() => setAddOpen(true)}
          className="fixed md:hidden bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Toevoegen"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-border bg-card px-4 pb-[env(safe-area-inset-bottom)]">
        {navItems.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors',
              pathname === to
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Add Item Dialog */}
      <ItemFormDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
