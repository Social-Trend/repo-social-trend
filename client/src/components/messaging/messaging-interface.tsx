import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ConversationList from "./conversation-list";
import MessageThread from "./message-thread";
import type { Conversation, Professional } from "@shared/schema";

interface MessagingInterfaceProps {
  userType: "organizer" | "professional";
  userName: string;
  userEmail?: string;
  professionalId?: number;
}

export default function MessagingInterface({
  userType,
  userName,
  userEmail,
  professionalId
}: MessagingInterfaceProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const { data: professionals = [] } = useQuery({
    queryKey: ["/api/professionals"],
    queryFn: async () => {
      const response = await fetch("/api/professionals");
      if (!response.ok) throw new Error("Failed to fetch professionals");
      return response.json() as Promise<Professional[]>;
    }
  });

  const getProfessional = (id: number) => {
    return professionals.find(p => p.id === id);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Messages
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {userType === "organizer" 
              ? "Communicate with professionals about your events" 
              : "Manage your client communications"
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Conversation List - Hidden on mobile when conversation is selected */}
          <div className={`lg:col-span-1 ${selectedConversation ? 'hidden lg:block' : ''}`}>
            <ConversationList
              userType={userType}
              userEmail={userEmail}
              professionalId={professionalId}
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversation?.id}
            />
          </div>

          {/* Message Thread or Empty State */}
          <div className={`lg:col-span-2 ${!selectedConversation ? 'hidden lg:block' : ''}`}>
            {selectedConversation ? (
              <div className="h-full">
                {/* Mobile back button */}
                <div className="lg:hidden mb-4">
                  <Button variant="ghost" onClick={handleBackToList}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Conversations
                  </Button>
                </div>
                
                <MessageThread
                  conversation={selectedConversation}
                  userType={userType}
                  userName={userName}
                  professional={getProfessional(selectedConversation.professionalId)}
                />
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <CardContent className="text-center">
                  <MessageCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-md">
                    Choose a conversation from the list to start messaging, or browse professionals to start a new conversation.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}