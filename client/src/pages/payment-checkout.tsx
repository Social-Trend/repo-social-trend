import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import type { ServiceRequest } from "@shared/schema";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

function CheckoutForm({ serviceRequest, clientSecret }: { serviceRequest: ServiceRequest; clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/messages`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Your deposit has been processed successfully!",
        });
        setLocation("/messages");
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred during payment processing.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Complete Your Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <h3 className="font-medium">{serviceRequest.eventTitle}</h3>
          {serviceRequest.eventDate && (
            <p className="text-sm text-muted-foreground">
              {new Date(serviceRequest.eventDate).toLocaleDateString()}
            </p>
          )}
          {serviceRequest.depositAmount && (
            <p className="text-lg font-semibold mt-2">
              Deposit: ${(serviceRequest.depositAmount / 100).toFixed(2)}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement />
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/messages")}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={!stripe || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Pay Now"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function PaymentCheckout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const clientSecret = urlParams.get("client_secret");
  const serviceRequestId = urlParams.get("service_request_id");

  // Fetch service request details
  const { data: serviceRequest, isLoading } = useQuery({
    queryKey: ["/api/service-requests", serviceRequestId],
    queryFn: () => apiRequest(`/api/service-requests/${serviceRequestId}`),
    enabled: !!serviceRequestId,
  });

  useEffect(() => {
    if (!clientSecret || !serviceRequestId) {
      toast({
        title: "Invalid Payment Link",
        description: "Missing payment information. Redirecting to messages.",
        variant: "destructive",
      });
      setLocation("/messages");
    }
  }, [clientSecret, serviceRequestId, setLocation, toast]);

  if (!stripePromise) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Stripe integration is not configured. Please contact support.
            </p>
            <Button onClick={() => setLocation("/messages")} className="mt-4">
              Back to Messages
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!serviceRequest || !clientSecret) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Payment information not found.</p>
            <Button onClick={() => setLocation("/messages")} className="mt-4">
              Back to Messages
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: 'stripe',
          },
        }}
      >
        <CheckoutForm serviceRequest={serviceRequest} clientSecret={clientSecret} />
      </Elements>
    </div>
  );
}