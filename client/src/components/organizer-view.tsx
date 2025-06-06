import { Search, ClipboardList, TrendingUp, Calendar, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OrganizerView() {
  return (
    <div className="fade-in" role="tabpanel" aria-labelledby="organizer-btn">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">
            Plan & Execute Unforgettable Events
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Connect with top hospitality professionals and streamline your event planning process with our comprehensive platform.
          </p>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Start Planning Your Event
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-8 mb-12">
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Find Professionals</h3>
            <p className="text-slate-600">Search and connect with verified hospitality professionals in your area.</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <ClipboardList className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Manage Projects</h3>
            <p className="text-slate-600">Organize timelines, tasks, and communications all in one place.</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Track Success</h3>
            <p className="text-slate-600">Monitor event performance and gather valuable insights for future planning.</p>
          </CardContent>
        </Card>
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
