'use client'

import { MessageSquare, TrendingUp, Users, Clock, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Review } from "@/lib/supabase";

interface ForumTopic {
  id: string;
  title: string;
  category: string;
  replies: number;
  views: number;
  lastActivity: string;
  isHot: boolean;
  author: string;
  preview: string;
  rating?: number;
}

const ForumPreview = () => {
  const router = useRouter();
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReviews: 0,
    totalPIs: 0,
    totalInstitutions: 0
  });

  // Fetch recent reviews and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recent reviews
        const reviewsResponse = await fetch('/api/reviews?limit=4');
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          setRecentReviews(reviewsData.reviews || []);
        }

        // Fetch stats
        const statsResponse = await fetch('/api/stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.stats);
        }
      } catch (error) {
        console.error('Failed to fetch forum data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const convertReviewToTopic = (review: Review): ForumTopic => {
    const averageRating = (
      review.ratings.supervision +
      review.ratings.communication +
      review.ratings.career_help +
      review.ratings.work_life_balance +
      review.ratings.lab_environment
    ) / 5;

    const isHot = averageRating >= 4.5 || averageRating <= 2;
    const category = getCategoryFromRating(averageRating);
    const preview = review.review_text 
      ? review.review_text.substring(0, 100) + (review.review_text.length > 100 ? '...' : '')
      : `Review for ${review.pi_name} at ${review.institution}`;

    return {
      id: review.id,
      title: `Review: ${review.pi_name} at ${review.institution}`,
      category,
      replies: Math.floor(Math.random() * 20) + 1, // Mock data for now
      views: Math.floor(Math.random() * 100) + 50,
      lastActivity: formatDate(review.created_at),
      isHot,
      author: `${review.position} Student`,
      preview,
      rating: Math.round(averageRating * 10) / 10
    };
  };

  const getCategoryFromRating = (rating: number): string => {
    if (rating >= 4.5) return "Excellent Labs";
    if (rating >= 3.5) return "Good Experience";
    if (rating >= 2.5) return "Mixed Reviews";
    return "Challenging Environment";
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
  };

  const handleStartDiscussion = () => {
    router.push('/submit');
  };

  const handleViewAllDiscussions = () => {
    router.push('/search');
  };

  const handleTopicClick = (topic: ForumTopic) => {
    // Extract PI name from title and search for it
    const piName = topic.title.replace('Review: ', '').split(' at ')[0];
    router.push(`/search?q=${encodeURIComponent(piName)}`);
  };

  const forumTopics = recentReviews.map(convertReviewToTopic);


  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Recent Lab Reviews</h2>
                <p className="text-muted-foreground">
                  Latest experiences from students across European research institutions
                </p>
              </div>
              <Button 
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
                onClick={handleStartDiscussion}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Write Review
              </Button>
            </div>

            <div className="space-y-4">
              {forumTopics.map((topic) => (
                <Card key={topic.id} className="hover:shadow-medium transition-shadow duration-300 bg-gradient-card cursor-pointer" onClick={() => handleTopicClick(topic)}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {topic.author.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold hover:text-primary cursor-pointer transition-colors">
                                {topic.title}
                              </h3>
                              {topic.isHot && (
                                <Badge variant="destructive" className="text-xs">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Hot
                                </Badge>
                              )}
                              {topic.rating && (
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm font-medium">{topic.rating}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {topic.preview}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <Badge variant="outline">{topic.category}</Badge>
                            <span className="text-xs">by {topic.author}</span>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="h-4 w-4" />
                              <span>{topic.replies}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{topic.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{topic.lastActivity}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleViewAllDiscussions}
              >
                View All Reviews
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-card">
              <CardHeader>
                <CardTitle className="text-lg">Review Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p>Keep reviews respectful and constructive</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p>Protect anonymity - no personal details</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p>Focus on professional experiences</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p>Be honest about your experience</p>
                </div>
              </CardContent>
            </Card>

           

            <Card className="bg-gradient-card">
              <CardHeader>
                <CardTitle className="text-lg">Platform Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Reviews</span>
                  <span className="font-semibold">{stats.totalReviews}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">PIs Reviewed</span>
                  <span className="font-semibold">{stats.totalPIs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Institutions</span>
                  <span className="font-semibold">{stats.totalInstitutions}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForumPreview;
