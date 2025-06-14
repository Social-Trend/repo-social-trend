import { useState } from "react";
import MessagingInterface from "@/components/messaging/messaging-interface";

export default function Messages() {
  // For demo purposes, using static user data
  // In a real app, this would come from authentication context
  const [userType] = useState<"organizer" | "professional">("organizer");
  const [userName] = useState("Demo User");
  const [userEmail] = useState("demo@example.com");

  return (
    <MessagingInterface
      userType={userType}
      userName={userName}
      userEmail={userEmail}
    />
  );
}