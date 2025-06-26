import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, X, Phone, Video, MoreVertical, Smile } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth-context";
import type { Conversation, Message } from "@shared/schema";

interface ChatModalProps {
  conversation: Conversation | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ conversation, isOpen, onClose }: ChatModalProps) {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState("");
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
          senderName: (user as any).firstName ? `${(user as any).firstName} ${(user as any).lastName || ''}`.trim() : (user as any).email || 'Unknown',
          content: messageData.content,
        }),
      });
    },
    onSuccess: () => {
      setMessageText("");
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ["/api/messages", conversation?.id] });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !conversation) return;
    
    sendMessage.mutate({
      conversationId: conversation.id,
      content: messageText.trim(),
    });
  };

  if (!conversation) return null;

  const isUserProfessional = (user as any)?.role === 'professional';
  const otherPartyName = isUserProfessional ? conversation.organizerName : 'Professional';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {otherPartyName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-lg">{otherPartyName}</DialogTitle>
              <p className="text-sm text-gray-500">{conversation.eventTitle}</p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message: Message) => {
              const isOwnMessage = (
                (isUserProfessional && message.senderType === 'professional') ||
                (!isUserProfessional && message.senderType === 'organizer')
              );

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 ${
                      isOwnMessage
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              disabled={sendMessage.isPending}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!messageText.trim() || sendMessage.isPending}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}