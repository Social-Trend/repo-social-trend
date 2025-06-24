import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  insertOrganizerProfileSchema, 
  eventTypeOptions,
  type InsertOrganizerProfile 
} from "@shared/schema";
import { Loader2, Upload, X } from "lucide-react";

interface OrganizerProfileFormProps {
  userId: string | number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function OrganizerProfileForm({ 
  userId, 
  onSuccess, 
  onCancel 
}: OrganizerProfileFormProps) {
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [otherEventType, setOtherEventType] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertOrganizerProfile>({
    resolver: zodResolver(insertOrganizerProfileSchema),
    defaultValues: {
      userId: typeof userId === 'string' ? userId : userId.toString(),
      firstName: "",
      lastName: "",
      companyName: "",
      email: "",
      phone: "",
      location: "",
      eventTypes: [],
      bio: "",
      profileImageUrl: null,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertOrganizerProfile) => {
      return await apiRequest("/api/profiles/organizer", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/organizer", userId] });
      toast({
        title: "Profile created!",
        description: "Your organizer profile has been successfully created.",
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

  const handleEventTypeToggle = (eventType: string) => {
    setSelectedEventTypes(prev => {
      const updated = prev.includes(eventType)
        ? prev.filter(e => e !== eventType)
        : [...prev, eventType];
      form.setValue("eventTypes", updated);
      return updated;
    });
  };

  const handleOtherEventTypeAdd = () => {
    if (otherEventType.trim() && !selectedEventTypes.includes(otherEventType.trim())) {
      const updated = [...selectedEventTypes, otherEventType.trim()];
      setSelectedEventTypes(updated);
      form.setValue("eventTypes", updated);
      setOtherEventType("");
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
    const profileData: InsertOrganizerProfile = {
      ...data,
      eventTypes: selectedEventTypes,
      profileImageUrl: profileImage,
    };
    mutation.mutate(profileData);
  };


  

  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Your Organizer Profile</CardTitle>
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

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Your full name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
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

          {/* Event Types */}
          <div className="space-y-2">
            <Label>Event Types You Organize *</Label>
            <div className="grid grid-cols-2 gap-2">
              {eventTypeOptions.map((eventType) => (
                <div key={eventType} className="flex items-center space-x-2">
                  <Checkbox
                    id={eventType}
                    checked={selectedEventTypes.includes(eventType)}
                    onCheckedChange={() => handleEventTypeToggle(eventType)}
                  />
                  <Label htmlFor={eventType} className="text-sm">
                    {eventType}
                  </Label>
                </div>
              ))}
            </div>
            
            {/* Other Event Type Input */}
            <div className="flex space-x-2">
              <Input
                placeholder="Other event type..."
                value={otherEventType}
                onChange={(e) => setOtherEventType(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleOtherEventTypeAdd())}
              />
              <Button type="button" onClick={handleOtherEventTypeAdd} variant="outline" size="sm">
                Add
              </Button>
            </div>

            {/* Selected Event Types */}
            {selectedEventTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedEventTypes.map((eventType) => (
                  <Badge key={eventType} variant="secondary" className="flex items-center gap-1">
                    {eventType}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => handleEventTypeToggle(eventType)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            
            {form.formState.errors.eventTypes && (
              <p className="text-sm text-red-500">{form.formState.errors.eventTypes.message}</p>
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