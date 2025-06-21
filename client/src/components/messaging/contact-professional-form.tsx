import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Calendar, MapPin, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ProfessionalProfile, Conversation } from "@shared/schema";

const contactFormSchema = z.object({
  eventTitle: z.string().min(5, "Event title must be at least 5 characters"),
  eventDate: z.string().optional(),
  eventLocation: z.string().optional(),
  eventDescription: z.string().min(20, "Please provide more details about your event (minimum 20 characters)"),
  initialMessage: z.string().min(10, "Please include an initial message (minimum 10 characters)")
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactProfessionalFormProps {
  professional: ProfessionalProfile;
  onConversationCreated?: (conversation: Conversation) => void;
  trigger?: React.ReactNode;
}

export default function ContactProfessionalForm({ 
  professional, 
  onConversationCreated,
  trigger 
}: ContactProfessionalFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      eventTitle: "",
      eventDate: "",
      eventLocation: "",
      eventDescription: "",
      initialMessage: `Hi ${professional.name}! I'm interested in your services for an upcoming event. Could you please provide more information about your availability and pricing?`
    }
  });

  const createConversationMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      // Create conversation
      const conversationResponse = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizerName: "Anonymous Organizer",
          organizerEmail: "organizer@example.com",
          professionalId: professional.userId || professional.id,
          eventTitle: data.eventTitle,
          eventDate: data.eventDate || null,
          eventLocation: data.eventLocation || null,
          eventDescription: data.eventDescription,
          status: "active"
        })
      });

      if (!conversationResponse.ok) {
        throw new Error("Failed to create conversation");
      }

      const conversation = await conversationResponse.json() as Conversation;

      // Send initial message
      const messageResponse = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderType: "organizer",
          senderName: "Anonymous Organizer",
          content: data.initialMessage
        })
      });

      if (!messageResponse.ok) {
        throw new Error("Failed to send initial message");
      }

      return conversation;
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      toast({
        title: "Message sent successfully!",
        description: `Your inquiry has been sent to ${professional.name}. They will respond soon.`
      });
      form.reset();
      setOpen(false);
      onConversationCreated?.(conversation);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: ContactFormData) => {
    createConversationMutation.mutate(data);
  };

  const defaultTrigger = (
    <Button className="w-full">
      <MessageCircle className="h-4 w-4 mr-2" />
      Contact Professional
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact {professional.name}
          </DialogTitle>
        </DialogHeader>
        
        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                

                {/* Initial Message */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Initial Message</h3>
                  
                  <FormField
                    control={form.control}
                    name="initialMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message to {professional.name}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Your message to the professional..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Event Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Event Details</h3>
                  
                  <FormField
                    control={form.control}
                    name="eventTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Summer Wedding Reception, Corporate Annual Gala" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="eventDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Event Date (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="eventLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            Location (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="City, Venue, or Address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="eventDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your event, guest count, specific requirements, and any other relevant details..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Professional Info Summary */}
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                    Contacting: {professional.name}
                  </h4>
                  <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <p>Services: {professional.services.slice(0, 3).join(", ")}</p>
                    <p>Rate: ${professional.hourlyRate}/hour</p>
                    <p>Location: {professional.location}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={createConversationMutation.isPending}
                    className="flex-1"
                  >
                    {createConversationMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setOpen(false)}
                    disabled={createConversationMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}