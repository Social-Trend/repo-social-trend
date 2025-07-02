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
    console.log(`Marked conversation ${conversationId} as viewed`);
  } catch (error) {
    // Ignore localStorage errors
  }
};

// Clear all viewed conversations (for testing/reset)
export const clearAllViewedConversations = (): void => {
  try {
    localStorage.removeItem('viewedConversations');
    console.log('Cleared all viewed conversations');
  } catch (error) {
    // Ignore localStorage errors
  }
};

// Check if a conversation has new messages since last view
export const hasNewMessagesInConversation = (conversationId: number, lastMessageTime: string): boolean => {
  try {
    const lastViewKey = `lastView_${conversationId}`;
    const lastViewTime = localStorage.getItem(lastViewKey);
    
    if (!lastViewTime) {
      return true; // No previous view time, consider it new
    }
    
    const messageTime = new Date(lastMessageTime).getTime();
    const viewTime = parseInt(lastViewTime);
    
    return messageTime > viewTime;
  } catch (error) {
    return true; // Error checking, consider it new
  }
};

// Update last view time for a conversation
export const updateConversationViewTime = (conversationId: number): void => {
  try {
    const lastViewKey = `lastView_${conversationId}`;
    localStorage.setItem(lastViewKey, Date.now().toString());
    console.log(`Updated view time for conversation ${conversationId}`);
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

  // Count conversations with unread activity based on new messages since last view
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["/api/unread-conversations-count"],
    queryFn: async () => {
      if (!conversations.length) {
        return 0;
      }
      
      let conversationsWithActivity = 0;
      const userRole = (user as any)?.role;
      
      for (const conversation of conversations) {
        try {
          // Add cache busting parameter to ensure fresh data
          const cacheKey = `timestamp=${Date.now()}`;
          const messages: Message[] = await apiRequest(`/api/messages/${conversation.id}?${cacheKey}`);
          
          if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            
            // Check if there are new messages from the other party since last view
            const isFromOtherParty = userRole === 'professional' 
              ? lastMessage.senderType === 'organizer'
              : lastMessage.senderType === 'professional';
            
            // Use the new message checking function  
            const timestampStr = typeof lastMessage.timestamp === 'string' 
              ? lastMessage.timestamp 
              : lastMessage.timestamp.toISOString();
            const hasNewMessages = hasNewMessagesInConversation(conversation.id, timestampStr);
            
            if (isFromOtherParty && hasNewMessages) {
              conversationsWithActivity++;
            }
          }
        } catch (error) {
          console.error(`Error checking conversation ${conversation.id}:`, error);
          continue;
        }
      }
      
      return conversationsWithActivity;
    },
    enabled: isAuthenticated && !!user && conversations.length > 0,
    refetchInterval: 5000, // Check every 5 seconds for more responsive notifications
    staleTime: 0, // Always consider data stale to force fresh requests
  });

  // Function to clear notifications for a conversation and refresh count
  const clearNotificationForConversation = (conversationId: number) => {
    updateConversationViewTime(conversationId);
    // Invalidate the query to refresh the unread count immediately
    queryClient.invalidateQueries({ queryKey: ["/api/unread-conversations-count"] });
  };

  // Reset function to clear all notification state
  const resetNotifications = () => {
    clearAllViewedConversations();
    // Clear all view times
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('lastView_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      // Ignore localStorage errors
    }
    queryClient.invalidateQueries({ queryKey: ["/api/unread-conversations-count"] });
  };

  return {
    unreadCount,
    hasUnreadMessages: unreadCount > 0,
    clearNotificationForConversation,
    resetNotifications,
  };
}