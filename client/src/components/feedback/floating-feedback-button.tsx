import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, X } from "lucide-react";
import FeedbackModal from "./feedback-modal";

export default function FloatingFeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          size="sm"
          className="rounded-full h-12 w-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">Feedback</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Help us improve SocialTend! Your feedback matters.
          </p>
          <Button
            onClick={() => setIsOpen(true)}
            size="sm"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Give Feedback
          </Button>
        </div>
      </div>

      <FeedbackModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        category="general"
      />
    </>
  );
}