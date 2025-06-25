import { 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  Star, 
  Badge as BadgeIcon,
  DollarSign,
  User,
  X
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ProfessionalProfile } from "@shared/schema";
import ServiceRequestForm from "@/components/service-request-form";

interface ProfessionalProfileModalProps {
  professional: ProfessionalProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfessionalProfileModal({ 
  professional, 
  isOpen, 
  onClose 
}: ProfessionalProfileModalProps) {
  if (!professional) return null;

  const formatRate = (rate: string | null) => {
    if (!rate) return "Rate upon request";
    return `$${rate}/hour`;
  };

  const formatExperience = (experience: string | null) => {
    if (!experience) return "Experience level not specified";
    return experience;
  };

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'P';
  };

  const getDisplayName = () => {
    return professional.displayName || `${professional.firstName} ${professional.lastName}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Professional Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={professional.profileImageUrl || ''} alt={getDisplayName()} />
              <AvatarFallback className="text-2xl">
                {getInitials(professional.firstName, professional.lastName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {getDisplayName()}
                </h2>
                {professional.verified && (
                  <div className="flex items-center gap-1 mt-1">
                    <BadgeIcon className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-blue-600 font-medium">Verified Professional</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center text-gray-600 gap-1">
                <MapPin className="h-4 w-4" />
                <span>{professional.location}</span>
              </div>
              
              <div className="flex items-center text-green-600 gap-1">
                <DollarSign className="h-4 w-4" />
                <span className="font-semibold">{formatRate(professional.hourlyRate)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          {(professional.email || professional.phone) && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <div className="space-y-2">
                {professional.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{professional.email}</span>
                  </div>
                )}
                {professional.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{professional.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Services */}
          {professional.services && professional.services.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Services Offered</h3>
              <div className="flex flex-wrap gap-2">
                {professional.services.map((service: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {professional.experience && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Experience</h3>
              <p className="text-gray-600">{formatExperience(professional.experience)}</p>
            </div>
          )}

          {/* Bio */}
          {professional.bio && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">About</h3>
              <p className="text-gray-600 leading-relaxed">{professional.bio}</p>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <ServiceRequestForm
              professional={professional}
              trigger={
                <Button className="flex-1">
                  Request Services
                </Button>
              }
            />
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}