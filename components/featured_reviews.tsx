'use client'

import { Star, MapPin, Calendar, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Review } from "@/lib/supabase";

interface FeaturedReview extends Review {
  averageRating: number;
  reviewCount: number;
  country: string;
  tags: string[];
}

const FeaturedReviews = () => {
  const router = useRouter();
  const [reviews, setReviews] = useState<FeaturedReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch featured reviews on component mount
  useEffect(() => {
    const fetchFeaturedReviews = async () => {
      try {
        const response = await fetch('/api/reviews?limit=6');
        if (response.ok) {
          const data = await response.json();
          const featuredReviews = data.reviews?.map((review: Review) => {
            const averageRating = (
              review.ratings.supervision +
              review.ratings.communication +
              review.ratings.career_help +
              review.ratings.work_life_balance +
              review.ratings.lab_environment
            ) / 5;

            // Generate tags based on ratings
            const tags = [];
            if (review.ratings.supervision >= 4) tags.push("Great Mentoring");
            if (review.ratings.work_life_balance >= 4) tags.push("Work-Life Balance");
            if (review.ratings.lab_environment >= 4) tags.push("Good Environment");
            if (review.ratings.career_help >= 4) tags.push("Career Support");
            if (review.ratings.communication >= 4) tags.push("Good Communication");
            if (tags.length === 0) tags.push("Recent Review");

            // Detect country from institution
            const country = detectCountry(review.institution);

            return {
              ...review,
              averageRating: Math.round(averageRating * 10) / 10,
              reviewCount: 1, // We'll update this if we have PI profile data
              country,
              tags: tags.slice(0, 3) // Limit to 3 tags
            };
          }) || [];

          setReviews(featuredReviews);
        } else {
          setError('Failed to fetch reviews');
        }
      } catch (error) {
        console.error('Failed to fetch featured reviews:', error);
        setError('Failed to load reviews');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedReviews();
  }, []);

  const detectCountry = (institution: string): string => {
    const institutionLower = institution.toLowerCase();
    const countryKeywords = {
      'Germany': ['germany', 'deutschland', 'berlin', 'munich', 'heidelberg', 'max planck', 'tübingen', 'freiburg'],
      'France': ['france', 'paris', 'curie', 'pasteur', 'cnrs', 'lyon', 'marseille'],
      'Netherlands': ['netherlands', 'holland', 'amsterdam', 'rotterdam', 'delft', 'utrecht', 'leiden'],
      'Switzerland': ['switzerland', 'zurich', 'geneva', 'basel', 'eth', 'epfl', 'bern'],
      'UK': ['united kingdom', 'uk', 'england', 'london', 'cambridge', 'oxford', 'manchester', 'edinburgh'],
      'Italy': ['italy', 'rome', 'milan', 'turin', 'bologna', 'pisa'],
      'Spain': ['spain', 'madrid', 'barcelona', 'valencia', 'seville'],
      'Sweden': ['sweden', 'stockholm', 'uppsala', 'gothenburg', 'lund'],
      'Denmark': ['denmark', 'copenhagen', 'aarhus'],
      'Norway': ['norway', 'oslo', 'bergen', 'trondheim'],
      'Finland': ['finland', 'helsinki', 'tampere', 'turku'],
      'Belgium': ['belgium', 'brussels', 'leuven', 'ghent'],
      'Austria': ['austria', 'vienna', 'salzburg', 'innsbruck'],
      'Poland': ['poland', 'warsaw', 'krakow', 'wroclaw'],
      'Czech Republic': ['czech', 'prague', 'brno'],
      'Hungary': ['hungary', 'budapest', 'szeged'],
      'Portugal': ['portugal', 'lisbon', 'porto'],
      'Ireland': ['ireland', 'dublin', 'cork'],
      'Greece': ['greece', 'athens', 'thessaloniki']
    };

    for (const [country, keywords] of Object.entries(countryKeywords)) {
      if (keywords.some(keyword => institutionLower.includes(keyword))) {
        return country;
      }
    }
    return 'Europe';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const handleViewAllReviews = () => {
    router.push('/search');
  };

  const handleReadMore = (review: FeaturedReview) => {
    // Navigate to search page with PI name filter
    router.push(`/search?q=${encodeURIComponent(review.pi_name)}`);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Latest Lab Reviews</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real experiences from students across European research institutions
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">Unable to load reviews at the moment.</p>
            <Button 
              variant="outline" 
              size="lg" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Latest Lab Reviews</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real experiences from students across European research institutions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reviews.map((review) => (
            <Card key={review.id} className="hover:shadow-medium transition-shadow duration-300 bg-gradient-card">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{review.institution}</CardTitle>
                    <p className="text-sm text-muted-foreground">{review.pi_name}</p>
                  </div>
                  <div className="flex items-center space-x-1 bg-primary/10 px-2 py-1 rounded-full">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    <span className="text-sm font-semibold text-primary">{review.averageRating}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{review.country}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{review.position} • {review.year}</span>
                  </div>
                </div>

                {review.field && (
                  <Badge variant="secondary" className="w-fit">
                    {review.field}
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {review.review_text && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {review.review_text}
                  </p>
                )}

                <div className="flex flex-wrap gap-1">
                  {review.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(review.created_at)}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:text-primary/80"
                    onClick={() => handleReadMore(review)}
                  >
                    Read More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg" 
            className="shadow-soft"
            onClick={handleViewAllReviews}
          >
            View All Reviews
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedReviews;