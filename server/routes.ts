import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { authRateLimit, messageRateLimit } from "./middleware/rateLimiter";
import { 
  loginUserSchema, 
  registerUserSchema, 
  insertProfessionalProfileSchema,
  insertOrganizerProfileSchema,
  insertProfessionalSchema, 
  insertConversationSchema, 
  insertMessageSchema,
  insertServiceRequestSchema,
  insertFeedbackSchema 
} from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationEmail, sendPasswordResetEmail, generateVerificationToken } from "./emailService";

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

// Authentication middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = { id: decoded.userId, email: decoded.email, role: decoded.role };
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Authentication routes
  app.post("/api/auth/register", authRateLimit, async (req, res) => {
    try {
      const result = registerUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.issues });
      }

      const { email, password, role } = result.data;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        role,
        isEmailVerified: false
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.issues });
      }

      const { email, password } = result.data;

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Email verification route
  app.get("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: "Invalid verification token" });
      }

      // Find user with this verification token
      const users = await storage.getAllUsers?.() || [];
      const user = users.find(u => u.emailVerificationToken === token && 
                              u.emailVerificationExpires && 
                              new Date(u.emailVerificationExpires) > new Date());

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }

      // Update user as verified
      await storage.updateUser(user.id, {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      });

      res.json({ message: "Email verified successfully!" });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });

  // Request password reset
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists for security
        return res.json({ message: "If an account with that email exists, a password reset link has been sent." });
      }

      const resetToken = generateVerificationToken();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await storage.updateUser(user.id, {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      });

      const baseUrl = req.protocol + '://' + req.get('host');
      await sendPasswordResetEmail(email, resetToken, baseUrl);

      res.json({ message: "If an account with that email exists, a password reset link has been sent." });
    } catch (error) {
      console.error("Password reset request error:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });

  // Reset password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const users = await storage.getAllUsers?.() || [];
      const user = users.find(u => u.passwordResetToken === token && 
                              u.passwordResetExpires && 
                              new Date(u.passwordResetExpires) > new Date());

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      await storage.updateUser(user.id, {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      });

      res.json({ message: "Password reset successfully!" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Role switching endpoint
  app.post("/api/auth/switch-role", authenticateToken, async (req: any, res) => {
    try {
      const { role } = req.body;
      
      if (!role || !['organizer', 'professional'].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be 'organizer' or 'professional'" });
      }
      
      const updatedUser = await storage.updateUser(req.user.id, { role });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Generate new JWT token with updated role
      const newToken = jwt.sign(
        { userId: updatedUser.id, email: updatedUser.email, role: updatedUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json({
        user: userWithoutPassword,
        token: newToken
      });
    } catch (error) {
      console.error("Error switching role:", error);
      res.status(500).json({ message: "Failed to switch role" });
    }
  });

  // Profile routes
  app.get("/api/profiles/professional/:userId", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.params.userId;
      
      const profile = await storage.getProfessionalProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      res.json(profile);
    } catch (error) {
      console.error("Error fetching professional profile:", error);
      res.status(500).json({ message: "Failed to fetch professional profile" });
    }
  });

  app.post("/api/profiles/professional", authenticateToken, async (req: any, res) => {
    try {
      const result = insertProfessionalProfileSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.issues });
      }

      const profile = await storage.createProfessionalProfile(result.data);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating professional profile:", error);
      res.status(500).json({ message: "Failed to create professional profile" });
    }
  });

  app.put("/api/profiles/professional/:userId", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.params.userId;

      const result = insertProfessionalProfileSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.issues });
      }

      const profile = await storage.updateProfessionalProfile(userId, result.data);
      if (!profile) {
        return res.status(404).json({ message: "Professional profile not found" });
      }

      res.json(profile);
    } catch (error) {
      console.error("Error updating professional profile:", error);
      res.status(500).json({ message: "Failed to update professional profile" });
    }
  });

  app.get("/api/profiles/organizer/:userId", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.params.userId;

      const profile = await storage.getOrganizerProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Organizer profile not found" });
      }

      res.json(profile);
    } catch (error) {
      console.error("Error fetching organizer profile:", error);
      res.status(500).json({ message: "Failed to fetch organizer profile" });
    }
  });

  app.post("/api/profiles/organizer", authenticateToken, async (req: any, res) => {
    try {
      const result = insertOrganizerProfileSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.issues });
      }

      const profile = await storage.createOrganizerProfile(result.data);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating organizer profile:", error);
      res.status(500).json({ message: "Failed to create organizer profile" });
    }
  });

  app.put("/api/profiles/organizer/:userId", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.params.userId;

      const result = insertOrganizerProfileSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.issues });
      }

      const profile = await storage.updateOrganizerProfile(userId, result.data);
      if (!profile) {
        return res.status(404).json({ message: "Organizer profile not found" });
      }

      res.json(profile);
    } catch (error) {
      console.error("Error updating organizer profile:", error);
      res.status(500).json({ message: "Failed to update organizer profile" });
    }
  });

  // Professional directory - get all real professional profiles
  app.get("/api/professionals", async (req, res) => {
    try {
      const { location, service, minRate, maxRate, search } = req.query;
      const professionals = await storage.getAllProfessionalProfiles({
        location: location as string,
        service: service as string,
        minRate: minRate ? parseFloat(minRate as string) : undefined,
        maxRate: maxRate ? parseFloat(maxRate as string) : undefined,
        search: search as string,
      });
      res.json(professionals);
    } catch (error) {
      console.error("Error fetching professional profiles:", error);
      res.status(500).json({ error: "Failed to fetch professionals" });
    }
  });



  // Conversation routes
  app.get("/api/conversations", async (req, res) => {
    try {
      const { professionalId, organizerEmail } = req.query;
      const conversations = await storage.getConversations(
        professionalId as string,
        organizerEmail as string
      );
      // Filter out closed conversations
      const activeConversations = conversations.filter(conv => conv.status !== "closed");
      res.json(activeConversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const conversation = await storage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      console.log("Creating conversation with data:", req.body);
      const validatedData = insertConversationSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      const conversation = await storage.createConversation(validatedData);
      console.log("Created conversation:", conversation);
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Conversation creation error:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid conversation data", details: error });
      }
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Delete conversation endpoint
  app.delete("/api/conversations/:id", authenticateToken, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      // Check if conversation exists
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      // For now, we'll mark the conversation as inactive instead of deleting
      // This preserves data integrity while hiding it from the user
      await storage.updateConversationStatus(conversationId, "closed");
      
      res.json({ success: true, message: "Conversation closed successfully" });
    } catch (error) {
      console.error("Error closing conversation:", error);
      res.status(500).json({ error: "Failed to close conversation" });
    }
  });

  // Message routes
  app.get("/api/messages/:conversationId", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      if (isNaN(conversationId)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const messages = await storage.getMessages(conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", messageRateLimit, async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid message data", details: error });
      }
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const messages = await storage.getMessages(conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", messageRateLimit, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }
      
      const messageData = { ...req.body, conversationId };
      const validatedData = insertMessageSchema.parse(messageData);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid message data", details: error });
      }
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  app.patch("/api/conversations/:id/read", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { senderType } = req.body;
      
      if (isNaN(conversationId) || !senderType) {
        return res.status(400).json({ error: "Invalid request data" });
      }
      
      await storage.markMessagesAsRead(conversationId, senderType);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark messages as read" });
    }
  });

  // Service request endpoints
  app.get('/api/service-requests', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { role } = req.query;
      
      let requests;
      if (role === 'professional') {
        // For professionals, find requests where professionalId matches the user's ID
        requests = await storage.getServiceRequests(userId);
      } else {
        // For organizers, find requests where organizerId matches the user's ID
        requests = await storage.getServiceRequests(undefined, userId);
      }
      
      console.log(`Fetching service requests for user ${userId} with role ${role}:`, requests);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      res.status(500).json({ message: "Failed to fetch service requests" });
    }
  });

  app.post('/api/service-requests', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const requestData = { ...req.body, organizerId: userId };
      
      // Convert date strings to Date objects if they exist
      if (requestData.eventDate && typeof requestData.eventDate === 'string') {
        requestData.eventDate = new Date(requestData.eventDate);
      }
      if (requestData.expiresAt && typeof requestData.expiresAt === 'string') {
        requestData.expiresAt = new Date(requestData.expiresAt);
      }
      
      // Validate the data using the schema
      const validatedData = insertServiceRequestSchema.parse(requestData);
      
      const request = await storage.createServiceRequest(validatedData);
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating service request:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid request data", errors: error });
      }
      res.status(500).json({ message: "Failed to create service request" });
    }
  });

  app.patch('/api/service-requests/:id', authenticateToken, async (req: any, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const { status, responseMessage } = req.body;
      
      const request = await storage.updateServiceRequestStatus(requestId, status, responseMessage);
      if (!request) {
        return res.status(404).json({ message: "Service request not found" });
      }
      
      res.json(request);
    } catch (error) {
      console.error("Error updating service request:", error);
      res.status(500).json({ message: "Failed to update service request" });
    }
  });

  // Public endpoint for fetching individual service requests (used by payment checkout)
  app.get('/api/service-requests/:id', async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      if (isNaN(requestId)) {
        return res.status(400).json({ message: "Invalid service request ID" });
      }
      
      const request = await storage.getServiceRequest(requestId);
      if (!request) {
        return res.status(404).json({ message: "Service request not found" });
      }
      
      res.json(request);
    } catch (error) {
      console.error("Error fetching service request:", error);
      res.status(500).json({ message: "Failed to fetch service request" });
    }
  });

  // Test route for quick payment testing
  app.get('/test-payment', (req, res) => {
    const clientSecret = 'pi_test_1234567890_secret_test123';
    const serviceRequestId = '1';
    res.redirect(`/payment-checkout?client_secret=${clientSecret}&service_request_id=${serviceRequestId}`);
  });

  // Payment routes (Stripe integration)
  app.post("/api/create-payment-intent", authenticateToken, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ error: "Stripe configuration missing" });
      }

      const { serviceRequestId, amount, totalAmount } = req.body;
      
      if (!serviceRequestId || !amount) {
        return res.status(400).json({ error: "Service request ID and amount required" });
      }

      // Get service request details
      const serviceRequest = await storage.getServiceRequest(serviceRequestId);
      if (!serviceRequest) {
        return res.status(404).json({ error: "Service request not found" });
      }

      // Verify user owns this request
      const userId = req.user.id;
      if (serviceRequest.organizerId !== userId.toString()) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount, // Amount in cents
        currency: "usd",
        metadata: {
          serviceRequestId: serviceRequestId.toString(),
          organizerId: userId.toString(),
          professionalId: serviceRequest.professionalId.toString(),
        },
        description: `Deposit for ${serviceRequest.eventTitle}`,
      });

      // Update service request with payment details
      await storage.updateServiceRequestPayment(
        serviceRequestId,
        paymentIntent.id,
        "pending"
      );

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error("Payment intent creation error:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  app.post("/api/confirm-payment", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ error: "Stripe configuration missing" });
      }

      const { serviceRequestId, paymentIntentId } = req.body;
      
      const serviceRequest = await storage.getServiceRequest(serviceRequestId);
      if (!serviceRequest) {
        return res.status(404).json({ error: "Service request not found" });
      }

      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      // Verify this payment intent belongs to this service request (security check)
      if (paymentIntent.metadata.serviceRequestId !== serviceRequestId.toString()) {
        return res.status(403).json({ error: "Payment intent does not match service request" });
      }
      
      if (paymentIntent.status === 'succeeded') {
        // Update service request with payment info
        const updatedRequest = await storage.updateServiceRequestPayment(
          serviceRequestId,
          paymentIntentId,
          'paid'
        );

        // Create payment record
        await storage.createPayment({
          serviceRequestId,
          organizerId: serviceRequest.organizerId,
          professionalId: serviceRequest.professionalId,
          amount: paymentIntent.amount,
          stripePaymentIntentId: paymentIntentId,
          type: 'deposit',
          status: 'succeeded'
        });

        res.json({
          success: true,
          serviceRequest: updatedRequest
        });
      } else {
        res.status(400).json({ error: "Payment not completed" });
      }
    } catch (error) {
      console.error("Payment confirmation error:", error);
      res.status(500).json({ error: "Failed to confirm payment" });
    }
  });

  // Feedback endpoints
  app.post("/api/feedback", async (req, res) => {
    try {
      const validatedData = insertFeedbackSchema.parse(req.body);
      const feedback = await storage.createFeedback(validatedData);
      res.status(201).json(feedback);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid feedback data", details: error });
      }
      console.error("Error creating feedback:", error);
      res.status(500).json({ error: "Failed to create feedback" });
    }
  });

  app.get("/api/feedback", async (req, res) => {
    try {
      const feedbacks = await storage.getFeedback();
      res.json(feedbacks);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
