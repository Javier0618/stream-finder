import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, Settings, Search, Menu, X } from 'lucide-react';
import { isAuthenticated } from '@/lib/storage';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Header = ({ searchQuery, onSearchChange }: HeaderProps) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = isAuthenticated();

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Film className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-wider">
              STREAM<span className="text-gradient">VAULT</span>
            </span>
          </Link>

          {/* Search - Desktop */}
          {location.pathname === '/' && (
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar películas o series..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="input-field pl-10 py-2"
                />
              </div>
            </div>
          )}

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            <Link 
              to="/" 
              className={`btn-ghost ${location.pathname === '/' ? 'bg-secondary' : ''}`}
            >
              Inicio
            </Link>
            <Link 
              to="/admin" 
              className={`btn-ghost flex items-center gap-2 ${location.pathname === '/admin' ? 'bg-secondary' : ''}`}
            >
              <Settings className="w-4 h-4" />
              {isAdmin ? 'Admin' : 'Acceder'}
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Search */}
        {location.pathname === '/' && (
          <div className="md:hidden mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="input-field pl-10 py-2"
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-border flex flex-col gap-2">
            <Link 
              to="/" 
              className={`btn-ghost text-left ${location.pathname === '/' ? 'bg-secondary' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link 
              to="/admin" 
              className={`btn-ghost text-left flex items-center gap-2 ${location.pathname === '/admin' ? 'bg-secondary' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="w-4 h-4" />
              {isAdmin ? 'Admin' : 'Acceder'}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
