'use client'

import { Filter, MapPin, BookOpen, Star, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface FilterOptions {
  countries: string[];
  institutions: string[];
  fields: string[];
  positions: string[];
}

interface Filters {
  institution: string;
  field: string;
  position: string;
  minRating: number;
  labSize: string;
}

const SearchFilters = () => {
  const router = useRouter();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    countries: [],
    institutions: [],
    fields: [],
    positions: []
  });
  const [filters, setFilters] = useState<Filters>({
    institution: '',
    field: '',
    position: '',
    minRating: 1,
    labSize: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [resultCount, setResultCount] = useState(0);

  // Fetch filter options on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('/api/filter-options');
        if (response.ok) {
          const data = await response.json();
          setFilterOptions(data.filterOptions);
        }
      } catch (error) {
        console.error('Failed to fetch filter options:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // Update result count when filters change
  useEffect(() => {
    const updateResultCount = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.institution) params.set('institution', filters.institution);
        if (filters.field) params.set('field', filters.field);
        if (filters.position) params.set('position', filters.position);
        if (filters.minRating > 1) params.set('min_rating', filters.minRating.toString());
        if (filters.labSize) params.set('lab_size', filters.labSize);

        const response = await fetch(`/api/reviews?${params.toString()}&limit=1`);
        if (response.ok) {
          const data = await response.json();
          setResultCount(data.reviews?.length || 0);
        }
      } catch (error) {
        console.error('Failed to update result count:', error);
      }
    };

    updateResultCount();
  }, [filters]);

  const handleFilterChange = (key: keyof Filters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (filters.institution) params.set('institution', filters.institution);
    if (filters.field) params.set('field', filters.field);
    if (filters.position) params.set('position', filters.position);
    if (filters.minRating > 1) params.set('min_rating', filters.minRating.toString());
    if (filters.labSize) params.set('lab_size', filters.labSize);

    router.push(`/search?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setFilters({
      institution: '',
      field: '',
      position: '',
      minRating: 1,
      labSize: ''
    });
  };



  return (
    <section className="py-16 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gradient-primary">Find Your Perfect Match</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Use our advanced filters to discover labs and universities that align with your research interests and career goals
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card shadow-soft hover:shadow-medium transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-primary">
                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center mr-2 shadow-soft">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                Universities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={filters.institution} onValueChange={(value) => handleFilterChange('institution', value)}>
                <SelectTrigger className="border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200">
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.institutions.map((institution) => (
                    <SelectItem key={institution} value={institution}>
                      🏛️ {institution}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1">
                {filterOptions.institutions.slice(0, 4).map((institution) => (
                  <Badge 
                    key={institution}
                    variant="outline" 
                    className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleFilterChange('institution', institution)}
                  >
                    {institution}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft hover:shadow-medium transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-primary">
                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center mr-2 shadow-soft">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                Research Field
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={filters.field} onValueChange={(value) => handleFilterChange('field', value)}>
                <SelectTrigger className="border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.fields.map((field) => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1">
                {filterOptions.fields.slice(0, 3).map((field) => (
                  <Badge 
                    key={field}
                    variant="outline" 
                    className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleFilterChange('field', field)}
                  >
                    {field}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft hover:shadow-medium transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-primary">
                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center mr-2 shadow-soft">
                  <Star className="h-4 w-4 text-white" />
                </div>
                Rating Range
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Minimum Rating</span>
                  <span className="font-semibold text-primary">{filters.minRating.toFixed(1)}+</span>
                </div>
                <Slider 
                  value={[filters.minRating]} 
                  max={5} 
                  min={1} 
                  step={0.1} 
                  className="w-full"
                  onValueChange={(value) => handleFilterChange('minRating', value[0])}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Only show labs with high ratings
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft hover:shadow-medium transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-primary">
                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center mr-2 shadow-soft">
                  <Users className="h-4 w-4 text-white" />
                </div>
                Position
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={filters.position} onValueChange={(value) => handleFilterChange('position', value)}>
                <SelectTrigger className="border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleFilterChange('position', 'PhD')}
                >
                  PhD
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleFilterChange('position', 'Postdoc')}
                >
                  Postdoc
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button 
            className="bg-gradient-primary hover:opacity-90 transition-all duration-200 shadow-soft hover:shadow-medium"
            onClick={handleApplyFilters}
          >
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
          <Button variant="outline" onClick={handleClearFilters} className="hover:bg-primary/10 hover:text-primary transition-colors">
            Clear All
          </Button>
          <div className="text-sm text-muted-foreground">
            {isLoading ? 'Loading...' : `Showing ${resultCount} labs matching your criteria`}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchFilters;
