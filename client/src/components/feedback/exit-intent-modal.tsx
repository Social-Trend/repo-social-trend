import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Heart, ArrowRight } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ExitIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedWithLogout?: () => void;
}

export default function ExitIntentModal({ isOpen, onClose, onProceedWithLogout }: ExitIntentModalProps) {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [recommendationRating, setRecommendationRating] = useState(0);
  const [hoveredRecommendation, setHoveredRecommendation] = useState(0);
  const [userIntent, setUserIntent] = useState("");
  const [experienceRating, setExperienceRating] = useState(0);
  const [hoveredExperience, setHoveredExperience] = useState(0);
  const [showThankYou, setShowThankYou] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const feedbackMutation = useMutation({
    mutationFn: async (data: { rating: number; message: string; category: string; recommendationRating: number; userIntent: string; experienceRating: number }) => {
      return apiRequest("/api/feedback", {
        method: "POST",
        body: {
          ...data,
          userAgent: navigator.userAgent,
          currentPage: window.location.pathname,
          sessionDuration: Math.floor((Date.now() - performance.timing.navigationStart) / 60000),
        },
      });
    },
    onSuccess: () => {
      setShowThankYou(true);
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      setTimeout(() => {
        if (onProceedWithLogout) {
          onProceedWithLogout();
        } else {
          handleClose();
        }
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. You can still leave without submitting.",
        variant: "destructive",
      });
      console.error("Exit feedback error:", error);
    },
  });

  const handleClose = () => {
    setRating(0);
    setMessage("");
    setHoveredRating(0);
    setRecommendationRating(0);
    setHoveredRecommendation(0);
    setUserIntent("");
    setExperienceRating(0);
    setHoveredExperience(0);
    setShowThankYou(false);
    onClose();
  };

  const handleExitWithoutFeedback = () => {
    setRating(0);
    setMessage("");
    setHoveredRating(0);
    setRecommendationRating(0);
    setHoveredRecommendation(0);
    setUserIntent("");
    setExperienceRating(0);
    setHoveredExperience(0);
    setShowThankYou(false);
    if (onProceedWithLogout) {
      onProceedWithLogout();
    } else {
      onClose();
    }
  };

  const handleQuickSubmit = (quickRating: number, quickMessage: string) => {
    feedbackMutation.mutate({
      rating: quickRating,
      message: quickMessage,
      category: "exit_intent",
      recommendationRating: quickRating, // Use same rating for quick exit
      userIntent: "",
      experienceRating: quickRating, // Use same rating for quick exit
    });
  };

  const handleDetailedSubmitWithLogout = () => {
    if (rating === 0 || recommendationRating === 0 || experienceRating === 0) return;
    
    feedbackMutation.mutate({
      rating,
      message: message.trim(),
      category: "exit_intent",
      recommendationRating,
      userIntent: userIntent.trim(),
      experienceRating,
    });
  };

  const handleDetailedSubmit = () => {
    if (rating === 0 || recommendationRating === 0 || experienceRating === 0) return;
    
    feedbackMutation.mutate({
      rating,
      message: message.trim(),
      category: "exit_intent",
      recommendationRating,
      userIntent: userIntent.trim(),
      experienceRating,
    });
  };

  if (showThankYou) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="py-6">
            <Heart className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Thank you!
            </h3>
            <p className="text-gray-600">
              Your feedback helps us build a better SocialTend for everyone.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Before you go...</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-center text-gray-600">
            Help us improve SocialTend! Your feedback takes just 30 seconds.
          </p>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleQuickSubmit(5, "Great experience overall!")}
              disabled={feedbackMutation.isPending}
              className="h-auto py-3 px-2 text-left"
            >
              <div>
                <div className="flex text-yellow-400 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-3 w-3 fill-current" />
                  ))}
                </div>
                <span className="text-xs font-medium">Great!</span>
              </div>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleQuickSubmit(3, "It was okay, but could be improved")}
              disabled={feedbackMutation.isPending}
              className="h-auto py-3 px-2 text-left"
            >
              <div>
                <div className="flex text-yellow-400 mb-1">
                  {[1, 2, 3].map((star) => (
                    <Star key={star} className="h-3 w-3 fill-current" />
                  ))}
                  {[4, 5].map((star) => (
                    <Star key={star} className="h-3 w-3 text-gray-300" />
                  ))}
                </div>
                <span className="text-xs font-medium">It's OK</span>
              </div>
            </Button>
          </div>

          <div className="text-center">
            <span className="text-xs text-gray-500">or give detailed feedback below</span>
          </div>

          {/* Detailed Rating */}
          <div className="text-center">
            <div className="flex justify-center gap-1 mb-2">
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
                    className={`h-6 w-6 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What's the main thing that would bring you back? (Optional)"
              className="min-h-[80px] resize-none text-sm"
              maxLength={200}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {message.length}/200
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={handleExitWithoutFeedback}
              className="flex-1"
              disabled={feedbackMutation.isPending}
            >
              {onProceedWithLogout ? "Leave Without Feedback" : "Skip"}
            </Button>
            <Button
              onClick={handleDetailedSubmitWithLogout}
              className="flex-1"
              disabled={rating === 0 || feedbackMutation.isPending}
            >
              {feedbackMutation.isPending ? (
                "Submitting..."
              ) : (
                <>
                  Submit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}