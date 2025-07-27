import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedReviews from "@/components/featured_reviews";
import SearchFilters from "@/components/Search_Filters";
import ForumPreview from "@/components/Forum_Preview";
import Footer from "@/components/Footer";

const Index = () => {
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
};

export default Index;