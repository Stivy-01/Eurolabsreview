'use client'

import { Star, MapPin, TrendingUp, MessageSquare, Shield, Mail, FileText, Cookie, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const Footer = () => {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCountries: 0,
    totalReviews: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalCountries: data.stats.uniqueCountries,
            totalReviews: data.stats.totalReviews
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <footer className="bg-gradient-to-br from-primary/5 to-primary/10 border-t">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-soft">
                <Star className="h-6 w-6 text-white" />
              </div>
                          <span className="text-2xl font-bold text-gradient-primary">
              EuroLabReviews
            </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The trusted platform for anonymous reviews of Principal Investigators and research labs across Europe. 
              Make informed decisions about your academic future.
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{stats.totalCountries} Countries</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span>{stats.totalReviews} Reviews</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/search" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center space-x-2 group"
                >
                  <TrendingUp className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Browse Reviews</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/search?country=Germany" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center space-x-2 group"
                >
                  <MapPin className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Search by Country</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/search?min_rating=4" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center space-x-2 group"
                >
                  <Star className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Top Rated Labs</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/search?sort=recent" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center space-x-2 group"
                >
                  <MessageSquare className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Recent Reviews</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Community</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/search" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center space-x-2 group"
                >
                  <MessageSquare className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Forum</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/submit" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center space-x-2 group"
                >
                  <FileText className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Guidelines</span>
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:support@eurolabreviews.eu" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center space-x-2 group"
                >
                  <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Report Issue</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:contact@eurolabreviews.eu" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center space-x-2 group"
                >
                  <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Contact Us</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Add Review */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Legal</h3>
            <ul className="space-y-2 mb-6">
              <li>
                <Link 
                  href="/privacy" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center space-x-2 group"
                >
                  <Shield className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center space-x-2 group"
                >
                  <FileText className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/cookies" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center space-x-2 group"
                >
                  <Cookie className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Cookie Policy</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/anonymity" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center space-x-2 group"
                >
                  <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Anonymity Promise</span>
                </Link>
              </li>
            </ul>
            
            <Button 
              className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-200 shadow-soft hover:shadow-medium"
              onClick={() => router.push('/submit')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Write Review
            </Button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-primary/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2025 EuroLabReviews. All rights reserved. Empowering students to make informed academic decisions.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <span className="text-muted-foreground">
                Made with ❤️ for the European research community
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;