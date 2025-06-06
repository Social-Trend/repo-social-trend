import { 
  Handshake, 
  CalendarDays, 
  DollarSign, 
  ArrowRight, 
  Utensils, 
  Camera, 
  Music, 
  Flower,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProfessionalView() {
  return (
    <div className="fade-in" role="tabpanel" aria-labelledby="professional-btn">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">
            Grow Your Hospitality Business
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Connect with event organizers seeking your expertise and manage your service offerings through our professional platform.
          </p>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Create Professional Profile
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-8 mb-12">
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <Handshake className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Get Discovered</h3>
            <p className="text-slate-600">Showcase your services and let event organizers find and book you.</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <CalendarDays className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Manage Bookings</h3>
            <p className="text-slate-600">Keep track of your appointments and project timelines efficiently.</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4">
              <DollarSign className="h-6 w-6 text-rose-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Increase Revenue</h3>
            <p className="text-slate-600">Access more clients and grow your business with premium tools.</p>
          </CardContent>
        </Card>
      </section>

      {/* Service Categories */}
      <section className="mb-8">
        <Card>
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Popular Service Categories</h3>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Utensils className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-slate-800">Catering</span>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-200 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Camera className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-slate-800">Photography</span>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-200 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Music className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-slate-800">Entertainment</span>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg hover:from-orange-100 hover:to-orange-200 transition-all duration-200 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Flower className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-slate-800">Decoration</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recent Inquiries */}
      <section>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-800">Recent Inquiries</h3>
              <Button variant="ghost" className="text-primary hover:text-primary/80">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200 cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Wedding Catering Services</h4>
                    <p className="text-sm text-slate-500">From Sarah Johnson</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                  Pending
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200 cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Camera className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Corporate Event Photography</h4>
                    <p className="text-sm text-slate-500">From TechCorp Events</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                  Responded
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
