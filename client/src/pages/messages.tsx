import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Calendar, Clock, CheckCircle, XCircle, User, DollarSign, Send, ChevronDown, ChevronUp } from "lucide-react";
import PaymentButton from "@/components/payment/payment-button";
import type { ServiceRequest, Conversation, Message } from "@shared/schema";

export default function Messages() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch service requests (now part of unified communication)
  const { data: serviceRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/service-requests", { userId: user?.id, role: user?.role }],
    queryFn: () => apiRequest(`/api/service-requests?role=${user?.role}`),
    enabled: isAuthenticated && !!user,
  });

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/conversations", { userId: user?.id }],
    queryFn: () => apiRequest("/api/conversations"),
    enabled: isAuthenticated && !!user,
  });

  // Mutation for updating service request status
  const updateRequestStatus = useMutation({
    mutationFn: async ({ requestId, status, responseMessage }: { requestId: number; status: string; responseMessage?: string }) => {
      return await apiRequest(`/api/service-requests/${requestId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          responseMessage
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests"] });
      toast({
        title: "Request Updated",
        description: "Service request status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update service request",
        variant: "destructive",
      });
    },
  });

  // Mutation for creating/finding conversations
  const createConversation = useMutation({
    mutationFn: async (serviceRequest: ServiceRequest) => {
      return await apiRequest("/api/conversations", {
        method: "POST",
        body: JSON.stringify({
          professionalId: serviceRequest.professionalId,
          organizerName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email,
          organizerEmail: user.email,
          eventTitle: serviceRequest.eventTitle,
          eventDate: serviceRequest.eventDate,
          eventLocation: serviceRequest.eventLocation,
          eventDescription: serviceRequest.eventDescription,
          status: "active"
        })
      });
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      // Scroll to conversations section
      const conversationsSection = document.getElementById("conversations-section");
      conversationsSection?.scrollIntoView({ behavior: "smooth" });
      toast({
        title: "Conversation Started",
        description: "You can now message about this service request.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Start Conversation",
        description: error.message || "Could not create conversation",
        variant: "destructive",
      });
    },
  });

  const [openConversations, setOpenConversations] = useState<Set<number>>(new Set());
  const [messageInputs, setMessageInputs] = useState<Record<number, string>>({});

  const handleStartConversation = (serviceRequest: ServiceRequest) => {
    // Check if conversation already exists
    const existingConversation = conversations.find((conv: Conversation) => 
      conv.professionalId === serviceRequest.professionalId
    );
    
    if (existingConversation) {
      // Scroll to existing conversation
      const conversationsSection = document.getElementById("conversations-section");
      conversationsSection?.scrollIntoView({ behavior: "smooth" });
      toast({
        title: "Conversation Found",
        description: "Scrolling to your existing conversation.",
      });
    } else {
      // Create new conversation
      createConversation.mutate(serviceRequest);
    }
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    declined: "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-800",
    paid: "bg-blue-100 text-blue-800",
    completed: "bg-purple-100 text-purple-800",
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'accepted': return <CheckCircle className="h-3 w-3" />;
      case 'declined': return <XCircle className="h-3 w-3" />;
      case 'paid': return <DollarSign className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      default: return <MessageCircle className="h-3 w-3" />;
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to view messages</h3>
              <p className="text-gray-500">
                Connect with professionals and manage your communications.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Messages & Requests
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          All your communications in one place - manage conversations and service requests
        </p>
      </div>

      {/* Service Requests Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            {user.role === 'professional' ? 'Incoming Requests' : 'My Requests'}
          </h2>
          <Badge variant="secondary" className="text-sm">
            {serviceRequests.length} total
          </Badge>
        </div>

        {requestsLoading ? (
          <div className="text-center py-8">Loading requests...</div>
        ) : serviceRequests.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <MessageCircle className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                <p className="text-gray-500">
                  {user.role === 'professional' 
                    ? 'No service requests yet. Your profile will appear to organizers looking for professionals.'
                    : 'No requests sent yet. Browse professionals to start connecting.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 mb-8">
            {serviceRequests.map((request: ServiceRequest) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                          {request.eventTitle}
                        </h3>
                        <Badge className={`${statusColors[request.status as keyof typeof statusColors]} flex items-center gap-1`}>
                          {getStatusIcon(request.status)}
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {request.eventDate && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{new Date(request.eventDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        <p className="text-gray-600 text-sm line-clamp-2">{request.requestMessage}</p>
                        
                        {request.responseMessage && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mt-3">
                            <p className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">
                              {user.role === 'professional' ? 'Your Response:' : 'Professional Response:'}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{request.responseMessage}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 ml-4">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Action Buttons for Professionals */}
                  {user.role === 'professional' && request.status === 'pending' && (
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        variant="default"
                        disabled={updateRequestStatus.isPending}
                        onClick={() => updateRequestStatus.mutate({
                          requestId: request.id,
                          status: 'accepted',
                          responseMessage: 'Request accepted! Looking forward to working with you.'
                        })}
                      >
                        Accept & Message
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={updateRequestStatus.isPending}
                        onClick={() => updateRequestStatus.mutate({
                          requestId: request.id,
                          status: 'declined',
                          responseMessage: 'Thank you for considering me, but I am not available for this event.'
                        })}
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                  
                  {/* Payment and Message Actions for Accepted Requests */}
                  {request.status === 'accepted' && (
                    <div className="flex gap-2 mt-4">
                      {user.role === 'organizer' && (
                        <>
                          {request.paymentStatus !== 'paid' && request.paymentStatus !== 'pending' && (
                            <PaymentButton 
                              serviceRequest={request}
                              onPaymentSuccess={() => {
                                // Refresh the requests list after payment
                                window.location.reload();
                              }}
                              size="sm"
                            />
                          )}
                          {request.paymentStatus === 'pending' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              disabled={true}
                              className="flex items-center gap-2"
                            >
                              <DollarSign className="h-4 w-4" />
                              Processing Payment...
                            </Button>
                          )}
                          {request.paymentStatus === 'paid' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              disabled={true}
                              className="flex items-center gap-2 text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-900/20"
                            >
                              <DollarSign className="h-4 w-4" />
                              Deposit Paid
                            </Button>
                          )}
                        </>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={() => handleStartConversation(request)}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Continue Conversation
                      </Button>
                    </div>
                  )}
                  
                  {/* Payment Status Display */}
                  {request.paymentStatus === 'paid' && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm font-medium">Payment Confirmed</span>
                      </div>
                      {request.depositAmount && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Deposit: ${(request.depositAmount / 100).toFixed(2)}
                          {request.totalAmount && (
                            <span> | Total: ${(request.totalAmount / 100).toFixed(2)}</span>
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Conversations Section */}
      <div id="conversations-section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            Ongoing Conversations
          </h2>
          <Badge variant="secondary" className="text-sm">
            {conversations.length} active
          </Badge>
        </div>

        {conversationsLoading ? (
          <div className="text-center py-8">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <User className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                <p className="text-gray-500">
                  No active conversations. Start by sending a service request or responding to incoming requests.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {conversations.map((conversation: Conversation) => (
              <Card key={conversation.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
                        {user.role === 'professional' 
                          ? `${conversation.organizerName} - ${conversation.eventTitle}`
                          : `Professional ID ${conversation.professionalId} - ${conversation.eventTitle}`
                        }
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {conversation.status}
                      </p>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(conversation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const newOpenConversations = new Set(openConversations);
                        if (openConversations.has(conversation.id)) {
                          newOpenConversations.delete(conversation.id);
                        } else {
                          newOpenConversations.add(conversation.id);
                        }
                        setOpenConversations(newOpenConversations);
                      }}
                    >
                      {openConversations.has(conversation.id) ? (
                        <ChevronUp className="h-4 w-4 mr-2" />
                      ) : (
                        <ChevronDown className="h-4 w-4 mr-2" />
                      )}
                      {openConversations.has(conversation.id) ? 'Close Chat' : 'Open Chat'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}