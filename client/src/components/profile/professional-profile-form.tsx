import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  insertProfessionalProfileSchema, 
  serviceOptions,
  type InsertProfessionalProfile 
} from "@shared/schema";
import { Loader2, Upload, X } from "lucide-react";

interface ProfessionalProfileFormProps {
  userId: string | number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ProfessionalProfileForm({ 
  userId, 
  onSuccess, 
  onCancel 
}: ProfessionalProfileFormProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [otherService, setOtherService] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertProfessionalProfile>({
    resolver: zodResolver(insertProfessionalProfileSchema),
    defaultValues: {
      userId: typeof userId === 'string' ? userId : userId.toString(),
      firstName: "",
      lastName: "",
      displayName: "",
      email: "",
      phone: "",
      location: "",
      services: [],
      hourlyRate: "",
      bio: "",
      experience: 0,
      profileImageUrl: null,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertProfessionalProfile) => {
      return await apiRequest("/api/profiles/professional", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/professional", userId] });
      toast({
        title: "Profile created!",
        description: "Your professional profile has been successfully created.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create profile",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev => {
      const updated = prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service];
      form.setValue("services", updated);
      return updated;
    });
  };

  const handleOtherServiceAdd = () => {
    if (otherService.trim() && !selectedServices.includes(otherService.trim())) {
      const updated = [...selectedServices, otherService.trim()];
      setSelectedServices(updated);
      form.setValue("services", updated);
      setOtherService("");
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setProfileImage(base64);
        form.setValue("profileImageUrl", base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: any) => {
    const profileData: InsertProfessionalProfile = {
      ...data,
      services: selectedServices,
      profileImageUrl: profileImage,
    };
    mutation.mutate(profileData);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Your Professional Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Photo Upload */}
          <div className="space-y-2">
            <Label>Profile Photo</Label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="profile-image"
                />
                <Label htmlFor="profile-image" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>Upload Photo</span>
                  </Button>
                </Label>
                {profileImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setProfileImage(null);
                      form.setValue("profileImageUrl", null);
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                {...form.register("firstName")}
                placeholder="Your first name"
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                {...form.register("lastName")}
                placeholder="Your last name"
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Business/Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Business/Display Name</Label>
            <Input
              id="displayName"
              {...form.register("displayName")}
              placeholder="Optional business or professional name"
            />
            {form.formState.errors.displayName && (
              <p className="text-sm text-red-500">{form.formState.errors.displayName.message}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Professional Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="your.business@email.com"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                placeholder="(555) 123-4567"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              {...form.register("location")}
              placeholder="City, State"
            />
            {form.formState.errors.location && (
              <p className="text-sm text-red-500">{form.formState.errors.location.message}</p>
            )}
          </div>

          {/* Services */}
          <div className="space-y-2">
            <Label>Services Offered *</Label>
            <div className="grid grid-cols-2 gap-2">
              {serviceOptions.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={service}
                    checked={selectedServices.includes(service)}
                    onCheckedChange={() => handleServiceToggle(service)}
                  />
                  <Label htmlFor={service} className="text-sm">
                    {service}
                  </Label>
                </div>
              ))}
            </div>
            
            {/* Other Service Input */}
            <div className="flex space-x-2">
              <Input
                placeholder="Other service..."
                value={otherService}
                onChange={(e) => setOtherService(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleOtherServiceAdd())}
              />
              <Button type="button" onClick={handleOtherServiceAdd} variant="outline" size="sm">
                Add
              </Button>
            </div>

            {/* Selected Services */}
            {selectedServices.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedServices.map((service) => (
                  <Badge key={service} variant="secondary" className="flex items-center gap-1">
                    {service}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => handleServiceToggle(service)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            
            {form.formState.errors.services && (
              <p className="text-sm text-red-500">{form.formState.errors.services.message}</p>
            )}
          </div>

          {/* Hourly Rate */}
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Hourly Rate</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <Input
                id="hourlyRate"
                {...form.register("hourlyRate")}
                placeholder="50"
                className="pl-8"
                type="number"
                min="0"
                step="0.01"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">/hour</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...form.register("bio")}
              placeholder="Tell potential clients about your experience and expertise..."
              rows={4}
            />
            {form.formState.errors.bio && (
              <p className="text-sm text-red-500">{form.formState.errors.bio.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                "Create Profile"
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={mutation.isPending}
              >
                Skip for Now
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}