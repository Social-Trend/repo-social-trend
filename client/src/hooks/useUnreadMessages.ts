import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";
import type { Conversation, Message } from "@shared/schema";

// Helper functions for tracking viewed conversations
const getViewedConversations = (): Set<number> => {
  try {
    const viewed = localStorage.getItem('viewedConversations');
    return viewed ? new Set(JSON.parse(viewed)) : new Set();
  } catch {
    return new Set();
  }
};

export const markConversationAsViewed = (conversationId: number): void => {
  try {
    const viewed = getViewedConversations();
    viewed.add(conversationId);
    const viewedArray: number[] = [];
    viewed.forEach(id => viewedArray.push(id));
    localStorage.setItem('viewedConversations', JSON.stringify(viewedArray));
  } catch (error) {
    // Ignore localStorage errors
  }
};

export function useUnreadMessages() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all conversations
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    enabled: isAuthenticated && !!user,
  });

  // Count conversations with unread activity (excluding viewed conversations)
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["/api/unread-conversations-count"],
    queryFn: async () => {
      if (!conversations.length) return 0;
      
      let conversationsWithActivity = 0;
      const userRole = (user as any)?.role;
      const now = Date.now();
      const recentThreshold = 60 * 60 * 1000; // 1 hour
      const viewedConversations = getViewedConversations();
      
      for (const conversation of conversations) {
        try {
          // Skip if this conversation has been viewed
          if (viewedConversations.has(conversation.id)) {
            continue;
          }
          
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

  // Function to clear notifications for a conversation and refresh count
  const clearNotificationForConversation = (conversationId: number) => {
    markConversationAsViewed(conversationId);
    // Invalidate the query to refresh the unread count immediately
    queryClient.invalidateQueries({ queryKey: ["/api/unread-conversations-count"] });
  };

  return {
    unreadCount,
    hasUnreadMessages: unreadCount > 0,
    clearNotificationForConversation,
  };
}