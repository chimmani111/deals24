
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Target, Heart, ShoppingBag } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get search query from URL if it exists
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryParam = searchParams.get('search');
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [location.search]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/deals?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchPopoverOpen(false);
    }
  };

  const handlePopularSearch = (query: string) => {
    setSearchQuery(query);
    navigate(`/deals?search=${encodeURIComponent(query)}`);
    setIsSearchPopoverOpen(false);
  };

  const popularSearches = [
    'Smart TV', '4K TV', 'Gaming Laptop', 'MacBook', 'iPhone', 'Samsung', 
    'LG', 'Washing Machine', 'Refrigerator', 'Air Conditioner', 'Headphones', 'TWS'
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Target className="h-8 w-8 mr-2" />
              <span className="text-2xl font-bold">Deals24</span>
            </Link>
          </div>

          <div className="flex-1 mx-4 max-w-xl">
            <form onSubmit={handleSearch} className="relative">
              <Popover 
                open={isSearchPopoverOpen} 
                onOpenChange={(open) => {
                  setIsSearchPopoverOpen(open);
                  if (open && inputRef.current) {
                    // Focus input when popover opens
                    setTimeout(() => {
                      inputRef.current?.focus();
                    }, 0);
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Input
                      ref={inputRef}
                      type="search"
                      placeholder="Search deals..."
                      className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-apple-darkGray"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchPopoverOpen(true)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Button 
                      type="submit" 
                      size="icon" 
                      variant="ghost"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full hover:bg-gray-100"
                      onClick={() => handleSearch()}
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                  </div>
                </PopoverTrigger>
                <PopoverContent 
                  className="p-2 w-[var(--radix-popover-trigger-width)] rounded-xl mt-1"
                  align="start"
                >
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-apple-darkGray px-2">Popular searches</h3>
                    <div className="flex flex-wrap gap-2 p-1">
                      {popularSearches.map((search) => (
                        <button
                          key={search}
                          onClick={() => handlePopularSearch(search)}
                          className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-xs text-apple-darkGray transition-colors"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </form>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/deals">
              <Button variant="ghost" size="sm" className="text-sm rounded-full">
                <ShoppingBag className="h-5 w-5 mr-1" />
                {!isMobile && <span>Deals</span>}
              </Button>
            </Link>
            <Link to="/categories">
              <Button variant="ghost" size="sm" className="text-sm rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-1">
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
                {!isMobile && <span>Categories</span>}
              </Button>
            </Link>
            <Link to="/wishlist">
              <Button variant="ghost" size="sm" className="text-sm rounded-full">
                <Heart className="h-5 w-5 mr-1" />
                {!isMobile && <span>Wishlist</span>}
              </Button>
            </Link>
            <Link to="/admin">
              <Button className="rounded-full">
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
