import { Metadata } from 'next'
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedReviews from "@/components/featured_reviews";
import SearchFilters from "@/components/Search_Filters";
import ForumPreview from "@/components/Forum_Preview";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: 'RateMyPI - European Research Lab Reviews',
  description: 'Anonymous reviews of Principal Investigators and research labs across Europe',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <SearchFilters />
      <FeaturedReviews />
      <ForumPreview />
      <Footer />
    </div>
  );
}
