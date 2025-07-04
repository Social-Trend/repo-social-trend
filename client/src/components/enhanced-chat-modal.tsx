import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, X, Phone, Video, MoreVertical, Smile } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth-context";
import type { Conversation, Message } from "@shared/schema";

interface EnhancedChatModalProps {
  conversation: Conversation | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EnhancedChatModal({ conversation, isOpen, onClose }: EnhancedChatModalProps) {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch messages for the conversation
  const { data: messages = [], refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages", conversation?.id],
    queryFn: () => apiRequest(`/api/messages/${conversation?.id}`),
    enabled: !!conversation?.id && isOpen,
    refetchInterval: 2000, // Poll every 2 seconds for new messages
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (messageData: { conversationId: number; content: string }) => {
      if (!user) throw new Error("User not authenticated");
      
      return await apiRequest("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          conversationId: messageData.conversationId,
          senderType: (user as any).role === 'professional' ? 'professional' : 'organizer',
          senderName: (user as any).email || 'Unknown',
          content: messageData.content,
        }),
      });
    },
    onSuccess: () => {
      setMessageText("");
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Track when conversation is viewed
  useEffect(() => {
    if (conversation?.id && isOpen) {
      console.log(`Updated view time for conversation ${conversation.id}`);
    }
  }, [conversation?.id, isOpen]);

  const handleSendMessage = () => {
    if (messageText.trim() && conversation) {
      sendMessage.mutate({
        conversationId: conversation.id,
        content: messageText.trim(),
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    
    // Show typing indicator simulation
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    } else if (isTyping && e.target.value.length === 0) {
      setIsTyping(false);
    }
  };

  const formatMessageTime = (timestamp: string | Date) => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getOtherPartyName = () => {
    if ((user as any)?.role === 'professional') {
      return (conversation as any)?.organizerDisplayName || conversation?.organizerName || 'Event Organizer';
    } else {
      return (conversation as any)?.professionalDisplayName || 'Professional Tender';
    }
  };

  const getOtherPartyInitials = () => {
    const name = getOtherPartyName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!conversation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0 gap-0 [&>button]:hidden">
        {/* Enhanced Header */}
        <DialogHeader className="p-4 border-b bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {getOtherPartyInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <DialogTitle className="text-lg">{getOtherPartyName()}</DialogTitle>
                <DialogDescription className="sr-only">
                  Chat conversation for {conversation.eventTitle} event
                </DialogDescription>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500">{conversation.eventTitle}</p>
                  <Badge variant="secondary" className="text-xs">
                    {conversation.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isMyMessage = message.senderType === (user as any)?.role;
              const showTimestamp = index === 0 || 
                new Date(message.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() > 300000; // 5 minutes
              
              return (
                <div key={message.id}>
                  {showTimestamp && (
                    <div className="text-center text-xs text-gray-400 my-2">
                      {formatMessageTime(message.timestamp)}
                    </div>
                  )}
                  <div className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] group`}>
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isMyMessage
                            ? "bg-blue-600 text-white rounded-br-md"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                      <div className={`flex items-center mt-1 text-xs text-gray-400 ${
                        isMyMessage ? "justify-end" : "justify-start"
                      }`}>
                        <span>{formatMessageTime(message.timestamp)}</span>
                        {isMyMessage && (
                          <span className="ml-1">✓✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {sendMessage.isPending && (
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-2 opacity-70">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Enhanced Input Area */}
        <div className="p-4 border-t bg-gray-50 dark:bg-gray-800">
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <Input
                value={messageText}
                onChange={handleInputChange}
                placeholder="Type your message..."
                onKeyPress={handleKeyPress}
                disabled={sendMessage.isPending}
                className="pr-12 resize-none rounded-full border-gray-300 focus:border-blue-500"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || sendMessage.isPending}
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 rounded-full"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}