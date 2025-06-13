import { Search, ClipboardList, TrendingUp, Calendar, Users, ArrowRight, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Professional } from "@shared/schema";

export default function OrganizerView() {
  const { data: professionals = [] } = useQuery({
    queryKey: ["/api/professionals"],
    queryFn: async () => {
      const response = await fetch("/api/professionals");
      if (!response.ok) {
        throw new Error("Failed to fetch professionals");
      }
      return response.json() as Promise<Professional[]>;
    }
  });

  const featuredProfessionals = professionals.slice(0, 3);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fade-in" role="tabpanel" aria-labelledby="organizer-btn">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            Plan & Execute Unforgettable Events
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
            Browse and connect with verified hospitality professionals including bartenders, chefs, photographers, DJs, and event coordinators all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/professionals">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Search className="mr-2 h-4 w-4" />
                Browse Professionals
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="px-8 py-3 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Start Planning Your Event
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-2 gap-8 mb-12">
        <Card className="hover:shadow-md transition-shadow duration-200 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <ClipboardList className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Manage Projects</h3>
            <p className="text-slate-600 dark:text-slate-400">Organize timelines, tasks, and communications all in one place for seamless event coordination.</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Track Success</h3>
            <p className="text-slate-600 dark:text-slate-400">Monitor event performance and gather valuable insights for future planning and improvement.</p>
          </CardContent>
        </Card>
      </section>

      {/* Featured Professionals */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Featured Professionals</h3>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Discover top-rated hospitality experts for your events</p>
          </div>
          <Link href="/professionals">
            <Button variant="outline" className="text-primary hover:text-primary/80">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {featuredProfessionals.map((professional) => (
            <Card key={professional.id} className="hover:shadow-md transition-shadow duration-200 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-12 w-12 ring-2 ring-slate-100 dark:ring-slate-800">
                    <AvatarImage src={professional.avatar || undefined} alt={professional.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(professional.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {professional.name}
                      </h4>
                      {professional.verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm mb-2">
                      <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{professional.location}</span>
                    </div>
                    
                    <div className="flex items-center text-sm font-medium text-slate-800 dark:text-slate-200">
                      ${professional.hourlyRate}/hour
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {professional.services.slice(0, 2).map((service, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {service}
                      </Badge>
                    ))}
                    {professional.services.length > 2 && (
                      <Badge variant="outline" className="text-xs text-slate-500 dark:text-slate-400">
                        +{professional.services.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Link href="/professionals">
                  <Button size="sm" className="w-full">
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {featuredProfessionals.length === 0 && (
          <Card className="p-8 text-center border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardContent>
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                Loading featured professionals...
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Recent Projects */}
      <section>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-800">Recent Projects</h3>
              <Button variant="ghost" className="text-primary hover:text-primary/80">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200 cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Corporate Summit 2024</h4>
                    <p className="text-sm text-slate-500">March 15, 2024</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                  Completed
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200 cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Wedding Reception</h4>
                    <p className="text-sm text-slate-500">April 22, 2024</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  In Progress
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
