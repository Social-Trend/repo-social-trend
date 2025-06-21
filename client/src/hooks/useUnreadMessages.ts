import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";
import type { Conversation, Message } from "@shared/schema";

export function useUnreadMessages() {
  const { user, isAuthenticated } = useAuth();

  // Fetch all conversations
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    enabled: isAuthenticated && !!user,
  });

  // For simplicity, we'll count conversations with recent activity as having unread messages
  // This provides immediate notification functionality without complex read tracking
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["/api/unread-conversations-count"],
    queryFn: async () => {
      if (!conversations.length) return 0;
      
      let conversationsWithActivity = 0;
      const userRole = (user as any)?.role;
      const now = Date.now();
      const recentThreshold = 60 * 60 * 1000; // 1 hour
      
      for (const conversation of conversations) {
        try {
          const messages: Message[] = await apiRequest(`/api/messages/${conversation.id}`);
          
          if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            const messageTime = new Date(lastMessage.timestamp).getTime();
            const isRecent = now - messageTime < recentThreshold;
            
            // Count as unread if there's recent activity from the other party
            const isFromOtherParty = userRole === 'professional' 
              ? lastMessage.senderType === 'organizer'
              : lastMessage.senderType === 'professional';
            
            if (isRecent && isFromOtherParty) {
              conversationsWithActivity++;
            }
          }
        } catch (error) {
          continue;
        }
      }
      
      return conversationsWithActivity;
    },
    enabled: isAuthenticated && !!user && conversations.length > 0,
    refetchInterval: 10000, // Check every 10 seconds
  });

  return {
    unreadCount,
    hasUnreadMessages: unreadCount > 0,
  };
}