import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Calendar, Clock, MessageSquare, AlertCircle, CheckCircle, Briefcase, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import type { Professional, ServiceRequest, ProfessionalProfile } from "@shared/schema";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800",
};

export default function ProfessionalDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { hasProfile, isLoading: profileLoading } = useProfile();
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [responseType, setResponseType] = useState<'accept' | 'decline'>('accept');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch professional profile
  const { data: professionalProfile } = useQuery({
    queryKey: ["/api/profiles/professional", user?.id],
    queryFn: () => apiRequest(`/api/profiles/professional/${user?.id}`),
    enabled: isAuthenticated && !!user,
  });

  // Fetch service requests for professional
  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/service-requests", { role: 'professional', userId: user?.id }],
    queryFn: () => apiRequest(`/api/service-requests?role=professional`),
    enabled: isAuthenticated && !!user && hasProfile,
  });

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
      setShowResponseDialog(false);
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



  const handleRespond = (request: ServiceRequest, type: 'accept' | 'decline') => {
    setSelectedRequest(request);
    setResponseType(type);
    setShowResponseDialog(true);
  };

  const submitResponse = () => {
    if (!selectedRequest) return;
    
    respondMutation.mutate({
      id: selectedRequest.id,
      status: responseType === 'accept' ? 'accepted' : 'declined',
      message: responseMessage || undefined,
    });
  };

  // Show loading state while profile is being fetched
  if (profileLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  // Only show profile setup if profile is definitely not found (not loading)
  if (!profileLoading && !hasProfile) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            Complete Your Professional Profile
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            Set up your profile to start receiving service requests from event organizers.
          </p>
          <Link href="/onboarding">
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              <Briefcase className="h-5 w-5 mr-2" />
              Complete Profile Setup
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter((req: ServiceRequest) => req.status === 'pending');
  const acceptedRequests = requests.filter((req: ServiceRequest) => req.status === 'accepted');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Professional Dashboard
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Welcome back{professionalProfile?.firstName ? `, ${professionalProfile.firstName}` : ''}! Manage your communications and bookings in one place.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link href="/messages">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Pending Requests</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {pendingRequests.length} new requests awaiting your response
                  </p>
                </div>
                <MessageSquare className="h-5 w-5 text-slate-400 ml-auto" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/messages">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Active Conversations</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {acceptedRequests.length} confirmed bookings to coordinate
                  </p>
                </div>
                <MessageSquare className="h-5 w-5 text-slate-400 ml-auto" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Service Requests Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Service Requests
        </h2>
        
        {requestsLoading ? (
          <div className="text-center py-8">Loading requests...</div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No service requests yet</h3>
                <p className="text-gray-500">
                  Service requests from organizers will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
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
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
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

                    <div>
                      <p className="font-medium mb-1">Request Details:</p>
                      <p className="text-gray-600">{request.requestMessage}</p>
                    </div>

                    {request.responseMessage && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium mb-1">Your Response:</p>
                        <p className="text-gray-600">{request.responseMessage}</p>
                      </div>
                    )}

                    {request.status === 'pending' && (
                      <div className="flex gap-2 pt-3">
                        <Button 
                          onClick={() => handleRespond(request, 'accept')}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={respondMutation.isPending}
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleRespond(request, 'decline')}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          disabled={respondMutation.isPending}
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {responseType === 'accept' ? 'Accept' : 'Decline'} Service Request
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              You're about to {responseType} the service request for "{selectedRequest?.eventTitle}".
            </p>
            <div className="space-y-2">
              <Label htmlFor="response">Response Message (Optional)</Label>
              <Textarea
                id="response"
                placeholder={
                  responseType === 'accept' 
                    ? "Add a message for the organizer..." 
                    : "Let them know why you can't take this request..."
                }
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowResponseDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={submitResponse}
                disabled={respondMutation.isPending}
                className={responseType === 'accept' ? "bg-green-600 hover:bg-green-700" : ""}
                variant={responseType === 'decline' ? "outline" : "default"}
              >
                {respondMutation.isPending 
                  ? `${responseType === 'accept' ? 'Accepting' : 'Declining'}...` 
                  : `${responseType === 'accept' ? 'Accept' : 'Decline'} Request`
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}