import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Users, MapPin, DollarSign, Star, MessageCircle, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { ProfessionalProfile } from "@shared/schema";
import ContactProfessionalForm from "@/components/messaging/contact-professional-form";
import ServiceRequestForm from "@/components/service-request-form";

// Predefined service categories
const serviceCategories = [
  "Photography",
  "DJ Services", 
  "Event Planning",
  "Catering",
  "Bartending",
  "Wedding Planning",
  "Audio/Visual",
  "Decoration",
  "Security",
  "Transportation",
  "Cleaning",
  "Entertainment"
];

export default function Professionals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [customService, setCustomService] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [priceRangeMin, setPriceRangeMin] = useState("");
  const [priceRangeMax, setPriceRangeMax] = useState("");
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalProfile | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Determine effective service filter (predefined or custom)
  const effectiveServiceFilter = serviceFilter === 'custom' ? customService : serviceFilter;

  // Build query parameters for API call
  const queryParams = new URLSearchParams();
  if (searchTerm) queryParams.set('search', searchTerm);
  if (locationFilter && locationFilter !== 'all' && locationFilter !== '') queryParams.set('location', locationFilter);
  if (effectiveServiceFilter && effectiveServiceFilter !== 'all' && effectiveServiceFilter !== '') {
    queryParams.set('service', effectiveServiceFilter);
  }
  if (priceRangeMin) queryParams.set('minRate', priceRangeMin);
  if (priceRangeMax) queryParams.set('maxRate', priceRangeMax);
  
  const queryString = queryParams.toString();
  const queryUrl = queryString ? `/api/professionals?${queryString}` : '/api/professionals';

  const { data: professionals = [], isLoading, error } = useQuery({
    queryKey: ['/api/professionals', searchTerm, locationFilter, effectiveServiceFilter, priceRangeMin, priceRangeMax],
    queryFn: async () => {
      const response = await fetch(queryUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch professionals");
      }
      return response.json() as Promise<ProfessionalProfile[]>;
    }
  });

  // Extract unique locations and services for filter options
  const { uniqueLocations, uniqueServices } = useMemo(() => {
    const locations = new Set<string>();
    const services = new Set<string>();
    
    professionals.forEach(professional => {
      if (professional.location) locations.add(professional.location);
      if (professional.services) {
        professional.services.forEach((service: string) => services.add(service));
      }
    });
    
    return {
      uniqueLocations: Array.from(locations).sort(),
      uniqueServices: Array.from(services).sort()
    };
  }, [professionals]);

  const handleContact = (professional: ProfessionalProfile) => {
    setSelectedProfessional(professional);
    setIsContactModalOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("all");
    setServiceFilter("all");
    setCustomService("");
    setPriceRangeMin("");
    setPriceRangeMax("");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading professionals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">Failed to load professionals. Please try again.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Professional Tenders</h1>
        <p className="text-gray-600">
          Connect with verified hospitality professionals for your events
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        {/* Basic Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Advanced Filters
            </Button>
            
            {(searchTerm || (locationFilter && locationFilter !== 'all') || (effectiveServiceFilter && effectiveServiceFilter !== 'all') || priceRangeMin || priceRangeMax) && (
              <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleContent className="space-y-4">
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Location Filter */}
              <div>
                <Label htmlFor="location-filter" className="text-sm font-medium mb-2 block">
                  Location
                </Label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {uniqueLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Type Filter */}
              <div>
                <Label htmlFor="service-filter" className="text-sm font-medium mb-2 block">
                  Service Type
                </Label>
                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {serviceCategories.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Service...</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Service Input */}
              {serviceFilter === 'custom' && (
                <div>
                  <Label htmlFor="custom-service" className="text-sm font-medium mb-2 block">
                    Custom Service
                  </Label>
                  <Input
                    id="custom-service"
                    placeholder="Enter service type..."
                    value={customService}
                    onChange={(e) => setCustomService(e.target.value)}
                  />
                </div>
              )}

              {/* Price Range */}
              <div className={serviceFilter === 'custom' ? 'md:col-span-2 lg:col-span-1' : ''}>
                <Label className="text-sm font-medium mb-2 block">
                  Hourly Rate Range
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={priceRangeMin}
                    onChange={(e) => setPriceRangeMin(e.target.value)}
                    className="w-full"
                  />
                  <Input
                    placeholder="Max" 
                    type="number"
                    value={priceRangeMax}
                    onChange={(e) => setPriceRangeMax(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {((effectiveServiceFilter && effectiveServiceFilter !== 'all') || (locationFilter && locationFilter !== 'all') || priceRangeMin || priceRangeMax) && (
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {effectiveServiceFilter && effectiveServiceFilter !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {effectiveServiceFilter}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => {
                        setServiceFilter("all");
                        setCustomService("");
                      }}
                    />
                  </Badge>
                )}
                {locationFilter && locationFilter !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {locationFilter}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setLocationFilter("all")}
                    />
                  </Badge>
                )}
                {(priceRangeMin || priceRangeMax) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    ${priceRangeMin || '0'} - ${priceRangeMax || '∞'}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => {
                        setPriceRangeMin("");
                        setPriceRangeMax("");
                      }}
                    />
                  </Badge>
                )}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        <div className="flex items-center gap-2 text-sm text-gray-600 mt-4">
          <Users className="h-4 w-4" />
          <span>{professionals.length} professionals found</span>
        </div>
      </div>

      {/* Results */}
      {professionals.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No professionals found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || (locationFilter && locationFilter !== 'all') || (effectiveServiceFilter && effectiveServiceFilter !== 'all') || priceRangeMin || priceRangeMax
              ? "Try adjusting your search criteria or clearing filters"
              : "No professional profiles have been created yet"}
          </p>
          {(searchTerm || (locationFilter && locationFilter !== 'all') || (effectiveServiceFilter && effectiveServiceFilter !== 'all') || priceRangeMin || priceRangeMax) && (
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professionals.map((professional) => (
            <Card key={professional.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={professional.profileImageUrl || undefined} />
                    <AvatarFallback className="text-lg">
                      {professional.name?.charAt(0).toUpperCase() || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl mb-1">{professional.name}</CardTitle>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{professional.location}</span>
                    </div>
                    {professional.hourlyRate && (
                      <div className="flex items-center text-green-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span className="font-semibold">
                          {professional.hourlyRate.toString().replace(/^\$/, '')}/hour
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {professional.bio && (
                  <CardDescription className="mb-4 line-clamp-3">
                    {professional.bio}
                  </CardDescription>
                )}

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {professional.services?.slice(0, 3).map((service: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                    {professional.services && professional.services.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{professional.services.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator className="mb-4" />

                <div className="flex gap-2">
                  <ServiceRequestForm
                    professional={professional}
                    trigger={
                      <Button className="flex-1" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Request Services
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Contact Modal */}
      {selectedProfessional && (
        <ContactProfessionalForm
          professional={selectedProfessional}
          trigger={null}
          onConversationCreated={() => {
            setIsContactModalOpen(false);
            setSelectedProfessional(null);
          }}
        />
      )}
    </div>
  );
}