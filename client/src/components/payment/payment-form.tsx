import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CreditCard, DollarSign, Loader2 } from "lucide-react";
import type { ServiceRequest } from "@shared/schema";

const paymentSchema = z.object({
  depositAmount: z.number().min(1, "Deposit amount is required"),
  totalAmount: z.number().min(1, "Total amount is required"),
  notes: z.string().optional(),
});

type PaymentForm = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  serviceRequest: ServiceRequest;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PaymentForm({ serviceRequest, onSuccess, onCancel }: PaymentFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      depositAmount: serviceRequest.depositAmount ? serviceRequest.depositAmount / 100 : 50,
      totalAmount: serviceRequest.totalAmount ? serviceRequest.totalAmount / 100 : 200,
      notes: "",
    },
  });

  const createPaymentIntent = useMutation({
    mutationFn: async (data: PaymentForm) => {
      return await apiRequest("POST", "/api/create-payment-intent", {
        serviceRequestId: serviceRequest.id,
        amount: data.depositAmount * 100,
        totalAmount: data.totalAmount * 100,
      });
    },
    onSuccess: (data) => {
      if (data.clientSecret === "payment_intent_placeholder") {
        toast({
          title: "Payment System Ready",
          description: "Payment infrastructure configured. Stripe integration will activate once API keys are provided.",
        });
        onSuccess?.();
      } else {
        setIsProcessing(true);
        toast({
          title: "Processing Payment",
          description: "Redirecting to secure payment processor...",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PaymentForm) => {
    createPaymentIntent.mutate(data);
  };

  const depositPercent = Math.round((form.watch("depositAmount") / form.watch("totalAmount")) * 100);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Secure Payment
        </CardTitle>
        <CardDescription>
          Pay a deposit to confirm your booking with {serviceRequest.eventTitle}
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium text-sm mb-2">Booking Details</h4>
              <p className="text-sm text-muted-foreground">{serviceRequest.eventTitle}</p>
              {serviceRequest.eventDate && (
                <p className="text-sm text-muted-foreground">
                  {new Date(serviceRequest.eventDate).toLocaleDateString()}
                </p>
              )}
              {serviceRequest.eventLocation && (
                <p className="text-xs text-muted-foreground">{serviceRequest.eventLocation}</p>
              )}
            </div>

            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Service Cost</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        min="1"
                        className="pl-9"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="depositAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    Deposit Amount
                    <Badge variant="secondary">{depositPercent}% of total</Badge>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        min="1"
                        max={form.watch("totalAmount")}
                        className="pl-9"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special payment arrangements or notes..."
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="p-3 border rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Remaining Balance:</span>
                <span>${(form.watch("totalAmount") - form.watch("depositAmount")).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Deposit Due Now:</span>
                <span>${form.watch("depositAmount").toFixed(2)}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPaymentIntent.isPending || isProcessing}
              className="flex-1"
            >
              {createPaymentIntent.isPending || isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay $${form.watch("depositAmount").toFixed(2)}`
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}