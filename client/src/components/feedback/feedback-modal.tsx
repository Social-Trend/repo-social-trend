import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
}

export default function FeedbackModal({ isOpen, onClose, category }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const feedbackMutation = useMutation({
    mutationFn: async (data: { rating: number; message: string; category: string }) => {
      return apiRequest("POST", "/api/feedback", {
        ...data,
        userAgent: navigator.userAgent,
        currentPage: window.location.pathname,
        sessionDuration: Math.floor((Date.now() - performance.timing.navigationStart) / 60000), // minutes
      });
    },
    onSuccess: () => {
      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
      console.error("Feedback submission error:", error);
    },
  });

  const handleClose = () => {
    setRating(0);
    setMessage("");
    setHoveredRating(0);
    onClose();
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    feedbackMutation.mutate({
      rating,
      message: message.trim(),
      category,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Share Your Feedback</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Star Rating */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">How would you rate your experience?</p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {rating === 1 && "Poor - Needs significant improvement"}
                {rating === 2 && "Fair - Some issues to address"}
                {rating === 3 && "Good - Meets expectations"}
                {rating === 4 && "Great - Exceeds expectations"}
                {rating === 5 && "Excellent - Outstanding experience"}
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              What's the ONE thing we should improve first? (Optional)
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your feedback helps us build a better product..."
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {message.length}/500
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={feedbackMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={rating === 0 || feedbackMutation.isPending}
            >
              {feedbackMutation.isPending ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}