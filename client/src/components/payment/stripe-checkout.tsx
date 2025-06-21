import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { ServiceRequest } from "@shared/schema";

// Initialize Stripe (will be enabled when API keys are provided)
const stripePromise = typeof window !== "undefined" && import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

interface StripeCheckoutFormProps {
  clientSecret: string;
  serviceRequest: ServiceRequest;
  onSuccess: () => void;
  onCancel: () => void;
}

function StripeCheckoutForm({ clientSecret, serviceRequest, onSuccess, onCancel }: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
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
          return_url: window.location.origin + "/messages",
        },
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
        onSuccess();
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
    <Card>
      <CardHeader>
        <CardTitle>Complete Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement />
          <div className="flex gap-2">
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

interface StripeCheckoutProps {
  clientSecret: string;
  serviceRequest: ServiceRequest;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StripeCheckout({ clientSecret, serviceRequest, onSuccess, onCancel }: StripeCheckoutProps) {
  if (!stripePromise) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              Stripe integration will be activated once API keys are configured.
            </p>
            <Button onClick={onSuccess} className="mt-4">
              Continue (Demo Mode)
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Elements 
      stripe={stripePromise} 
      options={{ 
        clientSecret,
        appearance: {
          theme: 'stripe',
        },
      }}
    >
      <StripeCheckoutForm 
        clientSecret={clientSecret}
        serviceRequest={serviceRequest}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
}