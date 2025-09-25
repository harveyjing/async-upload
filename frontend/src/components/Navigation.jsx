import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Upload, Zap } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <Link to="/" className="flex items-center space-x-2">
            <Upload className="w-6 h-6" />
            <span className="font-bold text-lg">Async Upload Demo</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2">
            <Link to="/">
              <Button 
                variant={isActive('/') ? 'default' : 'ghost'} 
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
            </Link>
            
            <Link to="/v1">
              <Button 
                variant={isActive('/v1') ? 'default' : 'ghost'} 
                size="sm"
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Version 1
              </Button>
            </Link>
            
            <Link to="/v2">
              <Button 
                variant={isActive('/v2') ? 'default' : 'ghost'} 
                size="sm"
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Version 2
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
