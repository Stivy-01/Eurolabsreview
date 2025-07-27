'use client'

import { Search, Plus, MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Header = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-soft">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-soft">
              <Star className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient-primary">
              EuroLabReviews
            </span>
          </Link>
        </div>

        <div className="flex-1 max-w-lg mx-8">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search labs, PIs, or universities..." 
              className="pl-10 bg-white border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 shadow-soft"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </form>
        </div>

        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="hidden md:flex hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => router.push('/search')}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Browse Reviews
          </Button>
          <Button 
            size="sm" 
            className="bg-gradient-primary hover:opacity-90 transition-all duration-200 shadow-soft hover:shadow-medium"
            onClick={() => router.push('/submit')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Review
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;