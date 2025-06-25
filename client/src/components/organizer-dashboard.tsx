import { Search, MessageSquare, Clock, CheckCircle, AlertCircle, ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";
import type { ServiceRequest, OrganizerProfile } from "@shared/schema";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800", 
  declined: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800",
};

export default function OrganizerDashboard() {
  const { user, isAuthenticated } = useAuth();

  // Fetch organizer profile
  const { data: organizerProfile } = useQuery({
    queryKey: ["/api/profiles/organizer", user?.id],
    queryFn: () => apiRequest(`/api/profiles/organizer/${user?.id}`),
    enabled: isAuthenticated && !!user,
  });

  // Fetch service requests for organizer
  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/service-requests", { role: 'organizer', userId: user?.id }],
    queryFn: () => apiRequest(`/api/service-requests?role=organizer`),
    enabled: isAuthenticated && !!user,
  });

  const pendingRequests = requests.filter((req: ServiceRequest) => req.status === 'pending');
  const acceptedRequests = requests.filter((req: ServiceRequest) => req.status === 'accepted');
  const declinedRequests = requests.filter((req: ServiceRequest) => req.status === 'declined');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Event Organizer Dashboard
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Welcome back{organizerProfile?.firstName ? `, ${organizerProfile.firstName}` : ''}! Manage your events and professional connections.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link href="/professionals">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Find Professionals</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Browse and connect with event professionals</p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 ml-auto" />
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
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Messages</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Chat with your professional contacts</p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 ml-auto" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Service Request Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-yellow-700 dark:text-yellow-400 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
              {pendingRequests.length}
            </div>
            <CardDescription>
              Awaiting professional responses
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-700 dark:text-green-400 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Accepted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {acceptedRequests.length}
            </div>
            <CardDescription>
              Confirmed bookings
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-red-700 dark:text-red-400 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Declined
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
              {declinedRequests.length}
            </div>
            <CardDescription>
              Requests not accepted
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-700 dark:text-blue-400 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {requests.length}
            </div>
            <CardDescription>
              All service requests sent
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Recent Service Requests */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
            Recent Service Requests
          </h2>
          <Link href="/requests">
            <Button variant="outline">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        {requestsLoading ? (
          <div className="text-center py-8">Loading requests...</div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No service requests yet</h3>
                <p className="text-gray-500 mb-4">
                  Start by browsing professionals and sending your first request.
                </p>
                <Link href="/professionals">
                  <Button>
                    <Search className="h-4 w-4 mr-2" />
                    Find Professionals
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.slice(0, 3).map((request: ServiceRequest) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                        {request.eventTitle}
                      </h3>
                      <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {request.eventDate && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(request.eventDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    <p className="text-gray-600 line-clamp-2">{request.requestMessage}</p>
                    
                    {request.responseMessage && (
                      <div className="bg-gray-50 p-3 rounded-lg mt-3">
                        <p className="font-medium text-sm text-gray-700 mb-1">Professional Response:</p>
                        <p className="text-gray-600 text-sm">{request.responseMessage}</p>
                      </div>
                    )}
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