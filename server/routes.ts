import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginUserSchema, 
  registerUserSchema, 
  insertProfessionalProfileSchema,
  insertOrganizerProfileSchema,
  insertProfessionalSchema, 
  insertConversationSchema, 
  insertMessageSchema 
} from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

// Authentication middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = registerUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.issues });
      }

      const { email, password, firstName, lastName, role } = result.data;

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
        firstName: firstName || null,
        lastName: lastName || null,
        role,
        profileImageUrl: null,
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

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
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
      
      const updatedUser = await storage.updateUser(req.user.userId, { role });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error switching role:", error);
      res.status(500).json({ message: "Failed to switch role" });
    }
  });

  // Profile routes
  app.get("/api/profiles/professional/:userId", authenticateToken, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

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
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

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
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

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
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

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

  app.get("/api/professionals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid professional ID" });
      }
      
      const professional = await storage.getProfessional(id);
      if (!professional) {
        return res.status(404).json({ error: "Professional not found" });
      }
      
      res.json(professional);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch professional" });
    }
  });

  app.post("/api/professionals", async (req, res) => {
    try {
      const validatedData = insertProfessionalSchema.parse(req.body);
      const professional = await storage.createProfessional(validatedData);
      res.status(201).json(professional);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid professional data", details: error });
      }
      res.status(500).json({ error: "Failed to create professional" });
    }
  });

  app.patch("/api/professionals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid professional ID" });
      }
      
      const updates = insertProfessionalSchema.partial().parse(req.body);
      const professional = await storage.updateProfessional(id, updates);
      
      if (!professional) {
        return res.status(404).json({ error: "Professional not found" });
      }
      
      res.json(professional);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid professional data", details: error });
      }
      res.status(500).json({ error: "Failed to update professional" });
    }
  });

  // Conversation routes
  app.get("/api/conversations", async (req, res) => {
    try {
      const { professionalId, organizerEmail } = req.query;
      const conversations = await storage.getConversations(
        professionalId ? parseInt(professionalId as string) : undefined,
        organizerEmail as string
      );
      res.json(conversations);
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
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.status(201).json(conversation);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid conversation data", details: error });
      }
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Message routes
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

  app.post("/api/conversations/:id/messages", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
