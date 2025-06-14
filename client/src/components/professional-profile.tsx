import { 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  Star, 
  Badge as BadgeIcon,
  DollarSign,
  User
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ContactProfessionalForm from "@/components/messaging/contact-professional-form";
import type { Professional } from "@shared/schema";

interface ProfessionalProfileProps {
  professional: Professional;
  onContact?: () => void;
  onBookmark?: () => void;
}

export default function ProfessionalProfile({ 
  professional, 
  onContact, 
  onBookmark 
}: ProfessionalProfileProps) {
  const handleContactClick = () => {
    onContact?.();
  };

  const formatRate = (rate: string | null) => {
    if (!rate) return "Rate upon request";
    return `$${rate}/hour`;
  };

  const formatExperience = (years: number | null) => {
    if (!years) return "Experience level not specified";
    return `${years} year${years === 1 ? '' : 's'} experience`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto hover:shadow-lg transition-all duration-200 border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 ring-2 ring-slate-100 dark:ring-slate-800">
            <AvatarImage src={professional.avatar || undefined} alt={professional.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
              {getInitials(professional.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                {professional.name}
              </h3>
              {professional.verified && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                  <BadgeIcon className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            
            <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm mb-2">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{professional.location}</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                <span>{formatRate(professional.hourlyRate)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{formatExperience(professional.experience)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bio */}
        {professional.bio && (
          <div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {professional.bio}
            </p>
          </div>
        )}

        {/* Services */}
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center">
            <Star className="h-4 w-4 mr-2" />
            Services Offered
          </h4>
          <div className="flex flex-wrap gap-2">
            {professional.services.map((service, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                {service}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="flex-1 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <User className="h-4 w-4 mr-2" />
              View Profile
            </Button>
            <ContactProfessionalForm 
              professional={professional}
              trigger={
                <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              }
            />
            <Button 
              variant="outline" 
              onClick={onBookmark}
              className="px-4 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Star className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Contact Modal */}
        <ContactModal
          professional={professional}
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />
      </CardContent>
    </Card>
  );
}