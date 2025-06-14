import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Calendar, MapPin, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import type { Conversation, Message, Professional } from "@shared/schema";

interface MessageThreadProps {
  conversation: Conversation;
  userType: "organizer" | "professional";
  userName: string;
  professional?: Professional;
}

export default function MessageThread({ 
  conversation, 
  userType, 
  userName,
  professional 
}: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/conversations", conversation.id, "messages"],
    queryFn: async () => {
      const response = await fetch(`/api/conversations/${conversation.id}/messages`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json() as Promise<Message[]>;
    },
    refetchInterval: 5000 // Poll for new messages every 5 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderType: userType,
          senderName: userName,
          content
        })
      });
      
      if (!response.ok) throw new Error("Failed to send message");
      return response.json() as Promise<Message>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", conversation.id, "messages"] 
      });
      setNewMessage("");
      toast({
        title: "Message sent",
        description: "Your message has been delivered successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/conversations/${conversation.id}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderType: userType })
      });
      
      if (!response.ok) throw new Error("Failed to mark as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", conversation.id, "messages"] 
      });
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Mark messages as read when conversation is opened
    const unreadMessages = messages.filter(msg => 
      !msg.isRead && msg.senderType !== userType
    );
    
    if (unreadMessages.length > 0) {
      markAsReadMutation.mutate();
    }
  }, [messages, userType]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDisplayName = (senderType: string) => {
    if (senderType === "organizer") {
      return conversation.organizerName;
    } else {
      return professional?.name || "Professional";
    }
  };

  const getAvatar = (senderType: string) => {
    if (senderType === "professional") {
      return professional?.avatar;
    }
    return undefined;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Event Details Header */}
      <Card className="mb-4 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {conversation.eventTitle}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
                {conversation.eventDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Event Date: {conversation.eventDate}</span>
                  </div>
                )}
                {conversation.eventLocation && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Location: {conversation.eventLocation}</span>
                  </div>
                )}
              </div>
              
              {conversation.eventDescription && (
                <p className="mt-3 text-slate-700 dark:text-slate-300 text-sm">
                  {conversation.eventDescription}
                </p>
              )}
            </div>
            
            <Badge variant={conversation.status === "active" ? "default" : "secondary"}>
              {conversation.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card className="flex-1 flex flex-col border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex-1 p-4 overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
                    <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.senderType === userType;
                const displayName = getDisplayName(message.senderType);
                const avatar = getAvatar(message.senderType);
                
                return (
                  <div 
                    key={message.id} 
                    className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-slate-100 dark:ring-slate-800">
                      <AvatarImage src={avatar || undefined} alt={displayName} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex-1 max-w-xs md:max-w-md ${isOwnMessage ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {displayName}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div 
                        className={`p-3 rounded-lg text-sm ${
                          isOwnMessage 
                            ? 'bg-primary text-primary-foreground ml-8' 
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 mr-8'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4">
          <div className="flex gap-3">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 min-h-[60px] resize-none"
              disabled={sendMessageMutation.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              className="px-4"
            >
              {sendMessageMutation.isPending ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}