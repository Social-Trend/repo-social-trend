import { 
  Handshake, 
  CalendarDays, 
  DollarSign, 
  ArrowRight, 
  Utensils, 
  Camera, 
  Music, 
  Flower,
  Mail,
  Plus,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CreateProfessionalForm from "@/components/create-professional-form";
import { useState } from "react";
import type { Professional } from "@shared/schema";

export default function ProfessionalView() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleFormSuccess = (professional: Professional) => {
    setShowCreateForm(false);
    // Could add success notification or redirect here
  };

  const handleFormCancel = () => {
    setShowCreateForm(false);
  };

  if (showCreateForm) {
    return (
      <div className="fade-in max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setShowCreateForm(false)}
            className="mb-4"
          >
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            Back to Professional Dashboard
          </Button>
        </div>
        <CreateProfessionalForm 
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div className="fade-in" role="tabpanel" aria-labelledby="professional-btn">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            Grow Your Hospitality Business
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
            Connect with event organizers seeking your expertise and manage your service offerings through our professional platform.
          </p>
          <Button 
            size="lg" 
            onClick={() => setShowCreateForm(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
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

      
    </div>
  );
}
