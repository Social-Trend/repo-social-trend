import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  Users, 
  Zap,
  ArrowRight,
  Star,
  Phone,
  Video,
  Smile,
  Send
} from "lucide-react";
import QuickStart from "@/components/onboarding/quick-start";
import EnhancedChatModal from "@/components/enhanced-chat-modal";

export default function Demo() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<"onboarding" | "chat" | null>(null);

  // Mock conversation for demo
  const mockConversation = {
    id: 1,
    organizerName: "Sarah Johnson",
    organizerEmail: "sarah@example.com",
    professionalId: "123",
    eventTitle: "Corporate Holiday Party",
    eventDate: "2025-07-15",
    eventLocation: "Downtown Convention Center",
    eventDescription: "Annual company celebration for 200 employees",
    status: "active",
    createdAt: new Date()
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setSelectedDemo(null);
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    setSelectedDemo(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ✨ UX Enhancement Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Experience the improved user flow with streamlined onboarding and modern chat interface
          </p>
        </div>

        {/* Demo Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Onboarding Demo */}
          <Card className="border-2 hover:border-blue-300 transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedDemo("onboarding")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Quick Onboarding</CardTitle>
                    <p className="text-sm text-gray-500">Reduced from 10+ to 2-3 minutes</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  New
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Before/After Comparison */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-red-600 mb-2">Before</p>
                    <ul className="space-y-1 text-gray-600">
                      <li>• 20+ form fields</li>
                      <li>• Single long page</li>
                      <li>• No progress tracking</li>
                      <li>• High drop-off rate</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-green-600 mb-2">After</p>
                    <ul className="space-y-1 text-gray-600">
                      <li>• 3-step progressive flow</li>
                      <li>• Essential fields only</li>
                      <li>• Progress indicators</li>
                      <li>• "Skip for now" options</li>
                    </ul>
                  </div>
                </div>
                
                {/* Progress Demo */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Setup Progress</span>
                    <span className="text-sm text-gray-500">2-3 min remaining</span>
                  </div>
                  <Progress value={60} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Basic Info</span>
                    <span>Services</span>
                    <span>Complete</span>
                  </div>
                </div>

                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDemo("onboarding");
                    setShowOnboarding(true);
                  }}
                  className="w-full"
                >
                  Try Quick Setup <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Chat Demo */}
          <Card className="border-2 hover:border-blue-300 transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedDemo("chat")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Enhanced Chat</CardTitle>
                    <p className="text-sm text-gray-500">Modern messaging experience</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Improved
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Chat Features */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-blue-600 mb-2">New Features</p>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Message bubbles</li>
                      <li>• Smart timestamps</li>
                      <li>• Typing indicators</li>
                      <li>• Read receipts</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-blue-600 mb-2">UX Improvements</p>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Online status</li>
                      <li>• Action buttons</li>
                      <li>• Better spacing</li>
                      <li>• WhatsApp-style design</li>
                    </ul>
                  </div>
                </div>

                {/* Chat Preview */}
                <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">SJ</AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-400 border border-white rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Sarah Johnson</p>
                      <p className="text-xs text-gray-500">Corporate Holiday Party • active</p>
                    </div>
                    <div className="flex space-x-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <Video className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Sample Messages */}
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-start">
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-md px-3 py-2 max-w-[80%]">
                        <p className="text-xs">Hi! I'm interested in your catering services</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-3 py-2 max-w-[80%]">
                        <p className="text-xs">I'd love to help with your event! ✓✓</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Input Area */}
                  <div className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-900 rounded-full border">
                    <Smile className="h-4 w-4 text-gray-400" />
                    <div className="flex-1 text-xs text-gray-500">Type your message...</div>
                    <Send className="h-4 w-4 text-blue-600" />
                  </div>
                </div>

                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDemo("chat");
                    setShowChat(true);
                  }}
                  className="w-full"
                >
                  Open Chat Demo <MessageCircle className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Impact & Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Faster Setup</h3>
                <p className="text-sm text-gray-600">70% reduction in onboarding time</p>
              </div>
              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Better Retention</h3>
                <p className="text-sm text-gray-600">Reduced drop-off during signup</p>
              </div>
              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Enhanced UX</h3>
                <p className="text-sm text-gray-600">Intuitive messaging experience</p>
              </div>
              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold">Modern Feel</h3>
                <p className="text-sm text-gray-600">Contemporary app patterns</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  Onboarding Enhancements
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Progressive disclosure pattern</li>
                  <li>• Smart form validation</li>
                  <li>• Progress tracking component</li>
                  <li>• Skip options for non-critical fields</li>
                  <li>• Time estimates for each step</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  Chat Interface Updates
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Modern message bubble design</li>
                  <li>• Contextual timestamp display</li>
                  <li>• Enhanced header with actions</li>
                  <li>• Improved input area styling</li>
                  <li>• Better visual hierarchy</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Quick Setup Demo</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowOnboarding(false)}>
                ✕
              </Button>
            </div>
            <QuickStart 
              role="professional"
              onComplete={handleOnboardingComplete}
              onSkip={handleOnboardingSkip}
            />
          </div>
        </div>
      )}

      <EnhancedChatModal 
        conversation={showChat ? mockConversation : null}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />
    </div>
  );
}