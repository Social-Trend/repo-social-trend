import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth-context";
import { z } from "zod";

// Minimal profile schemas for quick onboarding
const quickProfessionalSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number is required"),
  location: z.string().min(1, "Location is required"),
  services: z.array(z.string()).min(1, "Select at least one service"),
  hourlyRate: z.string().optional(),
});

const quickOrganizerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number is required"),
  location: z.string().min(1, "Location is required"),
  companyName: z.string().optional(),
});

type QuickProfessionalForm = z.infer<typeof quickProfessionalSchema>;
type QuickOrganizerForm = z.infer<typeof quickOrganizerSchema>;

interface QuickStartProps {
  role: "professional" | "organizer";
  onComplete: () => void;
  onSkip: () => void;
}

const serviceOptions = [
  "Photography", "DJ Services", "Event Planning", "Catering",
  "Bartending", "Wedding Planning", "Audio/Visual", "Decoration",
  "Security", "Transportation", "Entertainment"
];

export default function QuickStart({ role, onComplete, onSkip }: QuickStartProps) {
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const totalSteps = role === "professional" ? 3 : 2;
  const progress = (step / totalSteps) * 100;

  const professionalForm = useForm<QuickProfessionalForm>({
    resolver: zodResolver(quickProfessionalSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: user?.email || "",
      phone: "",
      location: "",
      services: [],
      hourlyRate: "",
    },
  });

  const organizerForm = useForm<QuickOrganizerForm>({
    resolver: zodResolver(quickOrganizerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: user?.email || "",
      phone: "",
      location: "",
      companyName: "",
    },
  });

  const createProfile = useMutation({
    mutationFn: async (data: QuickProfessionalForm | QuickOrganizerForm) => {
      const endpoint = role === "professional" 
        ? "/api/profiles/professional" 
        : "/api/profiles/organizer";
      
      return await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify({
          ...data,
          displayName: `${data.firstName} ${data.lastName}`,
          bio: role === "professional" ? "Professional service provider" : "",
          eventTypes: role === "organizer" ? ["Corporate", "Private"] : undefined,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      toast({
        title: "Profile Created!",
        description: `Your ${role} profile has been set up successfully.`,
      });
      onComplete();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    if (role === "professional") {
      professionalForm.handleSubmit((data) => createProfile.mutate(data))();
    } else {
      organizerForm.handleSubmit((data) => createProfile.mutate(data))();
    }
  };

  const canProceed = () => {
    if (role === "professional") {
      const { firstName, lastName, email, phone } = professionalForm.getValues();
      if (step === 1) return firstName && lastName && email;
      if (step === 2) return phone;
      if (step === 3) return professionalForm.getValues().services.length > 0;
    } else {
      const { firstName, lastName, email, phone, location } = organizerForm.getValues();
      if (step === 1) return firstName && lastName && email;
      if (step === 2) return phone && location;
    }
    return false;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Quick Setup</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>2-3 minutes</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-gray-600 mt-2">
          Step {step} of {totalSteps} - Get started with the essentials
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {role === "professional" ? (
              step === 1 ? "Basic Information" :
              step === 2 ? "Contact Details" : "Your Services"
            ) : (
              step === 1 ? "Basic Information" : "Contact & Location"
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {role === "professional" ? (
            <>
              {step === 1 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      {...professionalForm.register("firstName")}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...professionalForm.register("lastName")}
                      placeholder="Smith"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...professionalForm.register("email")}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      {...professionalForm.register("phone")}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      {...professionalForm.register("location")}
                      placeholder="Los Angeles, CA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate (Optional)</Label>
                    <Input
                      id="hourlyRate"
                      {...professionalForm.register("hourlyRate")}
                      placeholder="$50/hour"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <Label>What services do you offer? *</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {serviceOptions.map((service) => (
                      <label key={service} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={service}
                          onChange={(e) => {
                            const current = professionalForm.getValues().services;
                            if (e.target.checked) {
                              professionalForm.setValue("services", [...current, service]);
                            } else {
                              professionalForm.setValue("services", current.filter(s => s !== service));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {step === 1 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      {...organizerForm.register("firstName")}
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...organizerForm.register("lastName")}
                      placeholder="Doe"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...organizerForm.register("email")}
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="companyName">Company Name (Optional)</Label>
                    <Input
                      id="companyName"
                      {...organizerForm.register("companyName")}
                      placeholder="Event Company Inc."
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      {...organizerForm.register("phone")}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      {...organizerForm.register("location")}
                      placeholder="Los Angeles, CA"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex justify-between pt-6">
            <div className="flex gap-2">
              {step > 1 && (
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              <Button variant="ghost" onClick={onSkip}>
                Skip for now
              </Button>
            </div>

            <div>
              {step < totalSteps ? (
                <Button 
                  onClick={handleNext} 
                  disabled={!canProceed()}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={!canProceed() || createProfile.isPending}
                >
                  {createProfile.isPending ? "Creating..." : "Complete Setup"}
                  <CheckCircle className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          💡 <strong>Pro tip:</strong> You can always complete your profile later with additional details like photos, portfolio, and detailed descriptions.
        </p>
      </div>
    </div>
  );
}