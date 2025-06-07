import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProfessionalProfile from "@/components/professional-profile";
import type { Professional } from "@shared/schema";
import { useState } from "react";

export default function Professionals() {
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredProfessionals = professionals.filter(professional =>
    professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.services.some(service => 
      service.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, location, or services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
            />
          </div>
          <Button 
            variant="outline" 
            className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
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