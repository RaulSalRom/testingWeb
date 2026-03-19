
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Home, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = [
    { name: 'Habitaciones alquiler', path: '/properties?category=Habitaciones alquiler' },
    { name: 'Inversiones', path: '/properties?category=Inversiones' },
    { name: 'Propiedades en venta', path: '/properties?category=Propiedades en venta' },
    { name: 'Propiedades en alquiler', path: '/properties?category=Propiedades en alquiler' },
    { name: 'Obras', path: '/properties?category=Obras' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-primary p-2 rounded-lg group-hover:bg-primary/90 transition-colors">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">Corina Capital</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Inicio
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none">
                Propiedades <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2">
                <DropdownMenuItem asChild className="cursor-pointer rounded-md">
                  <Link to="/properties" className="w-full font-medium">Todas las propiedades</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                {categories.map((cat) => (
                  <DropdownMenuItem key={cat.name} asChild className="cursor-pointer rounded-md">
                    <Link to={cat.path} className="w-full text-muted-foreground hover:text-foreground">{cat.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button asChild className="transition-all duration-200 active:scale-98 rounded-full px-6">
              <Link to="/properties">Ver Catálogo</Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-border animate-in slide-in-from-top-4">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-base font-medium text-foreground hover:text-primary transition-colors px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <div className="px-2 pt-2 pb-1">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Propiedades</span>
              </div>
              <Link
                to="/properties"
                className="text-base font-medium text-foreground hover:text-primary transition-colors px-4 border-l-2 border-transparent hover:border-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Todas las propiedades
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={cat.path}
                  className="text-base font-medium text-muted-foreground hover:text-primary transition-colors px-4 border-l-2 border-transparent hover:border-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
