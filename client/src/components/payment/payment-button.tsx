import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, DollarSign } from "lucide-react";
import PaymentForm from "./payment-form";
import type { ServiceRequest } from "@shared/schema";

interface PaymentButtonProps {
  serviceRequest: ServiceRequest;
  onPaymentSuccess?: () => void;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export default function PaymentButton({ 
  serviceRequest, 
  onPaymentSuccess, 
  variant = "default",
  size = "default",
  className = ""
}: PaymentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePaymentSuccess = () => {
    setIsOpen(false);
    onPaymentSuccess?.();
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  // Show different button text based on payment status
  const getButtonText = () => {
    if (serviceRequest.paymentStatus === "paid") {
      return "Payment Complete";
    }
    if (serviceRequest.paymentStatus === "pending") {
      return "Payment Processing";
    }
    return "Pay Deposit";
  };

  const getButtonIcon = () => {
    if (serviceRequest.paymentStatus === "paid") {
      return <DollarSign className="mr-2 h-4 w-4" />;
    }
    return <CreditCard className="mr-2 h-4 w-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          disabled={serviceRequest.paymentStatus === "paid" || serviceRequest.paymentStatus === "pending"}
        >
          {getButtonIcon()}
          {getButtonText()}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Secure Payment</DialogTitle>
        </DialogHeader>
        <PaymentForm 
          serviceRequest={serviceRequest}
          onSuccess={handlePaymentSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}