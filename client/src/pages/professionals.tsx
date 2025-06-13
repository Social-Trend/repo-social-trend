import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Users, X, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import ProfessionalProfile from "@/components/professional-profile";
import type { Professional } from "@shared/schema";
import { useState, useMemo } from "react";

export default function Professionals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: professionals = [], isLoading, error } = useQuery({
    queryKey: ["/api/professionals"],
    queryFn: async () => {
      const response = await fetch("/api/professionals");
      if (!response.ok) {
        throw new Error("Failed to fetch professionals");
      }
      return response.json() as Promise<Professional[]>;
    }
  });

  // Extract all unique services from professionals
  const allServices = useMemo(() => {
    const serviceSet = new Set<string>();
    professionals.forEach(professional => {
      professional.services.forEach(service => serviceSet.add(service));
    });
    return Array.from(serviceSet).sort();
  }, [professionals]);

  // Common service categories for quick filtering
  const popularServices = [
    "Catering", "Photography", "DJ Services", "Bartending", 
    "Event Planning", "Decoration", "Entertainment", "Waitstaff"
  ];

  const filteredProfessionals = professionals.filter(professional => {
    // Text search filter
    const matchesSearch = searchTerm === "" || 
      professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.services.some(service => 
        service.toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Service filter
    const matchesServices = selectedServices.length === 0 ||
      selectedServices.some(selectedService =>
        professional.services.some(service =>
          service.toLowerCase().includes(selectedService.toLowerCase())
        )
      );

    return matchesSearch && matchesServices;
  });

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedServices([]);
  };

  const handleContact = (professional: Professional) => {
    window.location.href = `mailto:${professional.email}?subject=Event Inquiry&body=Hi ${professional.name}, I'm interested in your services for an upcoming event.`;
  };

  const handleBookmark = (professional: Professional) => {
    // For now, just show an alert. In a real app, this would save to user's bookmarks
    alert(`Bookmarked ${professional.name}! (This is a demo - bookmarking would be saved to your account)`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <CardContent>
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Unable to Load Professionals
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                There was an error loading the professional profiles. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Browse Hospitality Professionals
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Find the perfect professionals for your event needs
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, location, or services (e.g., bartender, chef, photographer)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Service Filters
                  {selectedServices.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 text-xs">
                      {selectedServices.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Filter by Services</h4>
                    {selectedServices.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedServices([])}
                        className="text-xs h-6 px-2"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                  
                  {/* Popular Services */}
                  <div>
                    <h5 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Popular Services</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {popularServices.map(service => (
                        <div key={service} className="flex items-center space-x-2">
                          <Checkbox
                            id={`popular-${service}`}
                            checked={selectedServices.includes(service)}
                            onCheckedChange={() => handleServiceToggle(service)}
                          />
                          <label
                            htmlFor={`popular-${service}`}
                            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {service}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* All Available Services */}
                  {allServices.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">All Services</h5>
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {allServices.map(service => (
                          <div key={service} className="flex items-center space-x-2">
                            <Checkbox
                              id={`all-${service}`}
                              checked={selectedServices.includes(service)}
                              onCheckedChange={() => handleServiceToggle(service)}
                            />
                            <label
                              htmlFor={`all-${service}`}
                              className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {service}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Active Filters Display */}
          {(selectedServices.length > 0 || searchTerm) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Active filters:</span>
              {searchTerm && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  "{searchTerm}"
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={() => setSearchTerm("")}
                  />
                </Badge>
              )}
              {selectedServices.map(service => (
                <Badge key={service} variant="outline" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {service}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={() => handleServiceToggle(service)}
                  />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs h-6 px-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Professionals List */}
        {!isLoading && (
          <>
            {filteredProfessionals.length === 0 ? (
              <Card className="p-8 text-center">
                <CardContent>
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {searchTerm ? "No matching professionals found" : "No professionals available"}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {searchTerm 
                      ? "Try adjusting your search terms or clearing the search to see all professionals."
                      : "There are currently no professional profiles to display."
                    }
                  </p>
                  {searchTerm && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchTerm("")}
                      className="mt-4"
                    >
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Showing {filteredProfessionals.length} of {professionals.length} professionals
                </div>
                {filteredProfessionals.map((professional) => (
                  <ProfessionalProfile
                    key={professional.id}
                    professional={professional}
                    onContact={() => handleContact(professional)}
                    onBookmark={() => handleBookmark(professional)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}