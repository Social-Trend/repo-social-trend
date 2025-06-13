import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, User, DollarSign, MapPin, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Professional } from "@shared/schema";

const createProfessionalSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  location: z.string().min(2, "Location must be at least 2 characters").max(100, "Location must be less than 100 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500, "Bio must be less than 500 characters"),
  services: z.array(z.string()).min(1, "Please select at least one service"),
  hourlyRate: z.string().min(1, "Please enter your hourly rate"),
  experience: z.number().min(0, "Experience cannot be negative").max(50, "Experience must be less than 50 years"),
  avatar: z.string().url("Please enter a valid image URL").optional().or(z.literal(""))
});

type CreateProfessionalForm = z.infer<typeof createProfessionalSchema>;

const serviceOptions = [
  "Photography", "Catering", "DJ Services", "Bartending", "Event Planning", 
  "Decoration", "Entertainment", "Waitstaff", "Chef", "Private Chef",
  "Mixology", "Server", "Event Coordination", "Sound Equipment", 
  "MC Services", "Floral Design", "Venue Styling", "Menu Planning",
  "Beverage Service", "Bar Setup", "Service Coordination", "Project Management",
  "Vendor Coordination", "Culinary Arts", "Menu Development"
];

interface CreateProfessionalFormProps {
  onSuccess?: (professional: Professional) => void;
  onCancel?: () => void;
}

export default function CreateProfessionalForm({ onSuccess, onCancel }: CreateProfessionalFormProps) {
  const [customService, setCustomService] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateProfessionalForm>({
    resolver: zodResolver(createProfessionalSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      location: "",
      bio: "",
      services: [],
      hourlyRate: "",
      experience: 0,
      avatar: ""
    }
  });

  const createProfessionalMutation = useMutation({
    mutationFn: async (data: CreateProfessionalForm) => {
      const response = await fetch("/api/professionals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error("Failed to create professional profile");
      }
      
      return response.json() as Promise<Professional>;
    },
    onSuccess: (professional) => {
      queryClient.invalidateQueries({ queryKey: ["/api/professionals"] });
      toast({
        title: "Profile Created",
        description: "Your professional profile has been created successfully!",
      });
      onSuccess?.(professional);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create professional profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: CreateProfessionalForm) => {
    createProfessionalMutation.mutate(data);
  };

  const addService = (service: string) => {
    const currentServices = form.getValues("services");
    if (!currentServices.includes(service)) {
      form.setValue("services", [...currentServices, service]);
    }
  };

  const removeService = (service: string) => {
    const currentServices = form.getValues("services");
    form.setValue("services", currentServices.filter(s => s !== service));
  };

  const addCustomService = () => {
    if (customService.trim() && !form.getValues("services").includes(customService.trim())) {
      addService(customService.trim());
      setCustomService("");
    }
  };

  const selectedServices = form.watch("services") || [];

  return (
    <Card className="w-full max-w-2xl mx-auto border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <User className="h-5 w-5" />
          Create Professional Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Location
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="City, State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Professional Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Professional Details</h3>
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your experience, specialties, and what makes you unique..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum 10 characters, maximum 500 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Hourly Rate (USD)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="150" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        Years of Experience
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="5" 
                          min="0" 
                          max="50"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/your-photo.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide a URL to your professional headshot
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Services Offered</h3>
              
              <FormField
                control={form.control}
                name="services"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Your Services</FormLabel>
                    <Select onValueChange={addService}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose services you offer..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {serviceOptions.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Custom Service Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom service..."
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomService())}
                />
                <Button type="button" variant="outline" onClick={addCustomService}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Selected Services */}
              {selectedServices.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Selected Services:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedServices.map((service) => (
                      <Badge key={service} variant="secondary" className="flex items-center gap-1">
                        {service}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-500" 
                          onClick={() => removeService(service)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={createProfessionalMutation.isPending}
                className="flex-1"
              >
                {createProfessionalMutation.isPending ? "Creating Profile..." : "Create Profile"}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}