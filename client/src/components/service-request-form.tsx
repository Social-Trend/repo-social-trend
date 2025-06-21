import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ProfessionalProfile } from "@shared/schema";

const serviceRequestSchema = z.object({
  eventTitle: z.string().min(1, "Event title is required"),
  eventDate: z.string().optional(),
  eventLocation: z.string().optional(),
  eventDescription: z.string().optional(),
  requestMessage: z.string().min(10, "Please provide details about your request"),
});

type ServiceRequestForm = z.infer<typeof serviceRequestSchema>;

interface ServiceRequestFormProps {
  professional: ProfessionalProfile;
  trigger?: React.ReactNode;
}

export default function ServiceRequestForm({ professional, trigger }: ServiceRequestFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ServiceRequestForm>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      eventTitle: "",
      eventDate: "",
      eventLocation: "",
      eventDescription: "",
      requestMessage: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ServiceRequestForm) => {
      return apiRequest(`/api/service-requests`, {
        method: "POST",
        body: JSON.stringify({
          ...data,
          professionalId: professional.userId,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Request Sent!",
        description: `Your service request has been sent to ${professional.name}. They will respond soon.`,
      });
      form.reset();
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating service request:", error);
    },
  });

  const onSubmit = (data: ServiceRequestForm) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>Request Services</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Services from {professional.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="eventTitle">Event Title *</Label>
            <Input
              id="eventTitle"
              placeholder="e.g., Birthday Party, Wedding Reception"
              {...form.register("eventTitle")}
            />
            {form.formState.errors.eventTitle && (
              <p className="text-sm text-red-500">{form.formState.errors.eventTitle.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventDate">Event Date</Label>
            <Input
              id="eventDate"
              type="date"
              {...form.register("eventDate")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventLocation">Event Location</Label>
            <Input
              id="eventLocation"
              placeholder="e.g., Downtown Hotel, Private Residence"
              {...form.register("eventLocation")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventDescription">Event Description</Label>
            <Textarea
              id="eventDescription"
              placeholder="Brief description of your event..."
              {...form.register("eventDescription")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requestMessage">Message to Professional *</Label>
            <Textarea
              id="requestMessage"
              placeholder="Tell them about your requirements, budget, and any specific needs..."
              {...form.register("requestMessage")}
            />
            {form.formState.errors.requestMessage && (
              <p className="text-sm text-red-500">{form.formState.errors.requestMessage.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}