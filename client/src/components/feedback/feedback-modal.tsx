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
  const [recommendationRating, setRecommendationRating] = useState(0);
  const [hoveredRecommendation, setHoveredRecommendation] = useState(0);
  const [userIntent, setUserIntent] = useState("");
  const [experienceRating, setExperienceRating] = useState(0);
  const [hoveredExperience, setHoveredExperience] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const feedbackMutation = useMutation({
    mutationFn: async (data: { 
      rating: number; 
      message: string; 
      category: string;
      recommendationRating: number;
      userIntent: string;
      experienceRating: number;
    }) => {
      return apiRequest("/api/feedback", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          userAgent: navigator.userAgent,
          currentPage: window.location.pathname,
          sessionDuration: Math.floor((Date.now() - performance.timing.navigationStart) / 60000), // minutes
        }),
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
    setRecommendationRating(0);
    setHoveredRecommendation(0);
    setUserIntent("");
    setExperienceRating(0);
    setHoveredExperience(0);
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

    if (recommendationRating === 0) {
      toast({
        title: "Recommendation Rating Required",
        description: "Please rate how likely you are to recommend SocialTend.",
        variant: "destructive",
      });
      return;
    }

    if (experienceRating === 0) {
      toast({
        title: "Experience Rating Required",
        description: "Please rate your satisfaction with the user experience.",
        variant: "destructive",
      });
      return;
    }

    feedbackMutation.mutate({
      rating,
      message: message.trim(),
      category,
      recommendationRating,
      userIntent: userIntent.trim(),
      experienceRating,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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

          {/* Recommendation Rating */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Would you recommend SocialTend to others?</p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRecommendationRating(star)}
                  onMouseEnter={() => setHoveredRecommendation(star)}
                  onMouseLeave={() => setHoveredRecommendation(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= (hoveredRecommendation || recommendationRating)
                        ? "fill-blue-400 text-blue-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {recommendationRating > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {recommendationRating === 1 && "Definitely not"}
                {recommendationRating === 2 && "Probably not"}
                {recommendationRating === 3 && "Maybe"}
                {recommendationRating === 4 && "Probably yes"}
                {recommendationRating === 5 && "Definitely yes"}
              </p>
            )}
          </div>

          {/* Experience Rating */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">How satisfied are you with the user experience?</p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setExperienceRating(star)}
                  onMouseEnter={() => setHoveredExperience(star)}
                  onMouseLeave={() => setHoveredExperience(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= (hoveredExperience || experienceRating)
                        ? "fill-green-400 text-green-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {experienceRating > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {experienceRating === 1 && "Very unsatisfied"}
                {experienceRating === 2 && "Unsatisfied"}
                {experienceRating === 3 && "Neutral"}
                {experienceRating === 4 && "Satisfied"}
                {experienceRating === 5 && "Very satisfied"}
              </p>
            )}
          </div>

          {/* User Intent (Optional) */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              What brought you here today? (Optional)
            </label>
            <Textarea
              value={userIntent}
              onChange={(e) => setUserIntent(e.target.value)}
              placeholder="e.g., Looking for a DJ for my wedding, exploring catering options..."
              className="min-h-[60px] resize-none"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {userIntent.length}/200
            </p>
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
              disabled={rating === 0 || recommendationRating === 0 || experienceRating === 0 || feedbackMutation.isPending}
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