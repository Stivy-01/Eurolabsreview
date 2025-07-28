'use client'

import { Search, TrendingUp, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Stats {
  totalReviews: number;
  uniquePIs: number;
  uniqueInstitutions: number;
  uniqueCountries: number;
}

const Hero = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<Stats>({
    totalReviews: 0,
    uniquePIs: 0,
    uniqueInstitutions: 0,
    uniqueCountries: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch stats on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

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

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k+`;
    }
    return `${num}+`;
  };

  return (
    <section className="relative overflow-hidden bg-gradient-subtle">
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Find Your Perfect
                <span className="block text-gradient-primary">
                  European Lab Reviews
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Anonymous reviews and honest discussions about PIs, labs, and research opportunities across Europe. Make informed decisions about your academic future.
              </p>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search by PI, lab, or university..." 
                  className="pl-10 h-12 bg-white border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 shadow-soft"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <Button 
                type="submit"
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 transition-all duration-200 h-12 shadow-soft hover:shadow-medium"
              >
                Search Labs
              </Button>
            </form>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {isLoading ? "..." : formatNumber(stats.uniquePIs)}
                </div>
                <div className="text-sm text-muted-foreground">PIs Reviewed</div>
              </div>
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {isLoading ? "..." : formatNumber(stats.totalReviews)}
                </div>
                <div className="text-sm text-muted-foreground">Student Reviews</div>
              </div>
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {isLoading ? "..." : stats.uniqueCountries}
                </div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-strong">
              <img 
                src={"https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"} 
                alt="European research laboratories" 
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            
            {/* Floating review cards */}
            <Card className="absolute -bottom-6 -left-6 p-4 bg-gradient-card shadow-medium animate-slide-in">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft">
                  <span className="text-white font-semibold text-sm">4.8</span>
                </div>
                <div>
                  <div className="font-semibold text-sm">Max Planck Institute</div>
                  <div className="text-xs text-muted-foreground">Latest review</div>
                </div>
              </div>
            </Card>

            <Card className="absolute -top-6 -right-6 p-3 bg-gradient-card shadow-medium animate-slide-in" style={{animationDelay: '0.2s'}}>
              <div className="text-center">
                <div className="text-sm font-semibold text-primary">🇩🇪 🇫🇷 🇳🇱</div>
                <div className="text-xs text-muted-foreground">{stats.uniqueCountries} Countries</div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
