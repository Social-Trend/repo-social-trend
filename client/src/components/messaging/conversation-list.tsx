import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Clock, User, Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import type { Conversation, Professional } from "@shared/schema";

interface ConversationListProps {
  userType: "organizer" | "professional";
  userEmail?: string;
  professionalId?: number;
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: number;
}

export default function ConversationList({
  userType,
  userEmail,
  professionalId,
  onSelectConversation,
  selectedConversationId
}: ConversationListProps) {
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["/api/conversations", { professionalId, organizerEmail: userEmail }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (professionalId) params.append("professionalId", professionalId.toString());
      if (userEmail) params.append("organizerEmail", userEmail);
      
      const response = await fetch(`/api/conversations?${params}`);
      if (!response.ok) throw new Error("Failed to fetch conversations");
      return response.json() as Promise<Conversation[]>;
    }
  });

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card className="p-8 text-center border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardContent>
          <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No conversations yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {userType === "organizer" 
              ? "Start a conversation with a professional to discuss your event needs."
              : "Event organizers will contact you about their events."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Conversations
        </h3>
        <Badge variant="secondary" className="text-xs">
          {conversations.length}
        </Badge>
      </div>
      
      {conversations.map((conversation) => {
        const professional = getProfessional(conversation.professionalId);
        const isSelected = selectedConversationId === conversation.id;
        const displayName = userType === "organizer" ? professional?.name : conversation.organizerName;
        const displayAvatar = userType === "organizer" ? professional?.avatar : undefined;
        
        return (
          <Card 
            key={conversation.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-md border-slate-200 dark:border-slate-700 ${
              isSelected ? 'ring-2 ring-primary bg-slate-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-900'
            }`}
            onClick={() => onSelectConversation(conversation)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-slate-100 dark:ring-slate-800">
                  <AvatarImage src={displayAvatar || undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {displayName ? getInitials(displayName) : "?"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {displayName || "Unknown"}
                    </h4>
                    <Badge 
                      variant={conversation.status === "active" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {conversation.status}
                    </Badge>
                  </div>
                  
                  <h5 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-2 truncate">
                    {conversation.eventTitle}
                  </h5>
                  
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    {conversation.eventDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{conversation.eventDate}</span>
                      </div>
                    )}
                    {conversation.eventLocation && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{conversation.eventLocation}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(conversation.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}