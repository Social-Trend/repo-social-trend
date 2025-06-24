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
    
    console.log(`Checking conversation ${conversationId}: lastViewTime=${lastViewTime}, messageTime=${lastMessageTime}`);
    
    if (!lastViewTime) {
      console.log(`No view time found for conversation ${conversationId}, considering as new`);
      return true; // No previous view time, consider it new
    }
    
    const messageTime = new Date(lastMessageTime).getTime();
    const viewTime = parseInt(lastViewTime);
    
    const isNew = messageTime > viewTime;
    console.log(`Conversation ${conversationId}: messageTime=${messageTime}, viewTime=${viewTime}, isNew=${isNew}`);
    
    return isNew;
  } catch (error) {
    console.error(`Error checking conversation ${conversationId}:`, error);
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

// Mark all current conversations as viewed (for when user visits Messages page)
export const markAllConversationsAsViewed = (conversations: any[], userRole: string): void => {
  try {
    const currentTime = Date.now().toString();
    conversations.forEach(conversation => {
      const lastViewKey = `lastView_${conversation.id}`;
      localStorage.setItem(lastViewKey, currentTime);
    });
    console.log(`Marked all ${conversations.length} conversations as viewed for ${userRole}`);
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
      console.log(`Checking unread messages for ${userRole} user, ${conversations.length} conversations`);
      
      for (const conversation of conversations) {
        try {
          const messages: Message[] = await apiRequest(`/api/messages/${conversation.id}`);
          
          if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            
            // Check if there are new messages from the other party since last view
            const isFromOtherParty = userRole === 'professional' 
              ? lastMessage.senderType === 'organizer'
              : lastMessage.senderType === 'professional';
            
            console.log(`Conversation ${conversation.id}: Last message from ${lastMessage.senderType}, is from other party: ${isFromOtherParty}, userRole: ${userRole}`);
            
            if (isFromOtherParty) {
              // Use the new message checking function  
              const timestampStr = typeof lastMessage.timestamp === 'string' 
                ? lastMessage.timestamp 
                : lastMessage.timestamp.toISOString();
              const hasNewMessages = hasNewMessagesInConversation(conversation.id, timestampStr);
              
              console.log(`Conversation ${conversation.id}: Has new messages: ${hasNewMessages}, timestamp: ${timestampStr}`);
              
              if (hasNewMessages) {
                conversationsWithActivity++;
                console.log(`Added conversation ${conversation.id} to unread count`);
              }
            }
          }
        } catch (error) {
          console.error(`Error checking conversation ${conversation.id}:`, error);
          continue;
        }
      }
      
      console.log(`Total unread conversations: ${conversationsWithActivity}`);
      return conversationsWithActivity;
    },
    enabled: isAuthenticated && !!user,
    refetchInterval: 3000, // Check every 3 seconds for faster updates
  });

  // Function to clear notifications for a conversation and refresh count
  const clearNotificationForConversation = (conversationId: number) => {
    updateConversationViewTime(conversationId);
    // Invalidate the query to refresh the unread count immediately
    queryClient.invalidateQueries({ queryKey: ["/api/unread-conversations-count"] });
  };

  // Function to mark all conversations as viewed (when user visits Messages page)
  const markAllConversationsViewed = () => {
    if (conversations.length > 0 && user?.role) {
      markAllConversationsAsViewed(conversations, user.role);
      queryClient.invalidateQueries({ queryKey: ["/api/unread-conversations-count"] });
    }
  };

  // Reset function to clear all notification state (for testing/debug)
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

  // Debug function to clear all notification state
  const clearAllNotificationState = () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('lastView_') || key === 'viewedConversations') {
          localStorage.removeItem(key);
        }
      });
      console.log('Cleared all notification state');
      queryClient.invalidateQueries({ queryKey: ["/api/unread-conversations-count"] });
    } catch (error) {
      console.error('Error clearing notification state:', error);
    }
  };

  return {
    unreadCount,
    hasUnreadMessages: unreadCount > 0,
    clearNotificationForConversation,
    markAllConversationsViewed,
    resetNotifications,
    clearAllNotificationState,
  };
}