import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, MapPin, Clock, MessageSquare } from "lucide-react";
import type { ServiceRequest } from "@shared/schema";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800",
};

export default function Requests() {
  const { user, isAuthenticated } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current role from user context
  const currentRole = user?.role || 'organizer';

  console.log('Requests page - User:', user, 'Current role:', currentRole);

  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ["/api/service-requests", { role: currentRole, userId: user?.id }],
    queryFn: () => apiRequest(`/api/service-requests?role=${currentRole}`),
    enabled: isAuthenticated && !!user,
  });

  console.log('Service requests data:', requests, 'Loading:', isLoading, 'Error:', error);

  const respondMutation = useMutation({
    mutationFn: async ({ id, status, message }: { id: number; status: string; message?: string }) => {
      return apiRequest(`/api/service-requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, responseMessage: message }),
      });
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Response Sent",
        description: `Request ${variables.status === 'accepted' ? 'accepted' : 'declined'} successfully.`,
      });
      setSelectedRequest(null);
      setResponseMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to respond to request. Please try again.",
        variant: "destructive",
      });
      console.error("Error responding to request:", error);
    },
  });

  const handleRespond = (status: 'accepted' | 'declined') => {
    if (!selectedRequest) return;

    respondMutation.mutate({
      id: selectedRequest.id,
      status,
      message: responseMessage || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {currentRole === 'professional' ? 'Service Requests' : 'My Requests'}
          </h1>
          <p className="text-gray-600 mt-2">
            {currentRole === 'professional' 
              ? 'Requests from organizers seeking your services'
              : 'Your service requests to professionals'
            }
          </p>
        </div>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {currentRole === 'professional' ? 'No service requests yet' : 'No requests sent yet'}
              </h3>
              <p className="text-gray-500">
                {currentRole === 'professional' 
                  ? 'Service requests from organizers will appear here.'
                  : 'Your requests to professionals will appear here.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {requests.map((request: ServiceRequest) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-2">{request.eventTitle}</CardTitle>
                    <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    <div className="flex items-center mb-1">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                    {request.respondedAt && (
                      <div className="text-xs">
                        Responded: {new Date(request.respondedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {request.eventDate && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{new Date(request.eventDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  {request.eventLocation && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{request.eventLocation}</span>
                    </div>
                  )}

                  {request.eventDescription && (
                    <div>
                      <p className="font-medium mb-1">Event Description:</p>
                      <p className="text-gray-600">{request.eventDescription}</p>
                    </div>
                  )}

                  <div>
                    <p className="font-medium mb-1">Request Message:</p>
                    <p className="text-gray-600">{request.requestMessage}</p>
                  </div>

                  {request.responseMessage && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium mb-1">Response:</p>
                      <p className="text-gray-600">{request.responseMessage}</p>
                    </div>
                  )}

                  {currentRole === 'professional' && request.status === 'pending' && (
                    <div className="flex gap-2 pt-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            onClick={() => setSelectedRequest(request)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Accept
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Accept Service Request</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p>You're about to accept this service request for "{request.eventTitle}".</p>
                            <div className="space-y-2">
                              <Label htmlFor="response">Response Message (Optional)</Label>
                              <Textarea
                                id="response"
                                placeholder="Add a message for the organizer..."
                                value={responseMessage}
                                onChange={(e) => setResponseMessage(e.target.value)}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={() => handleRespond('accepted')}
                                disabled={respondMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {respondMutation.isPending ? "Accepting..." : "Accept Request"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline"
                            onClick={() => setSelectedRequest(request)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            Decline
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Decline Service Request</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p>You're about to decline this service request for "{request.eventTitle}".</p>
                            <div className="space-y-2">
                              <Label htmlFor="decline-response">Response Message (Optional)</Label>
                              <Textarea
                                id="decline-response"
                                placeholder="Let them know why you can't take this request..."
                                value={responseMessage}
                                onChange={(e) => setResponseMessage(e.target.value)}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={() => handleRespond('declined')}
                                disabled={respondMutation.isPending}
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                {respondMutation.isPending ? "Declining..." : "Decline Request"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}