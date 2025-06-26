import { 
  users, 
  professionals, 
  conversations, 
  messages,
  professionalProfiles,
  organizerProfiles,
  serviceRequests,
  payments,
  feedback,
  type User, 
  type InsertUser, 
  type Professional, 
  type InsertProfessional,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type ProfessionalProfile,
  type InsertProfessionalProfile,
  type OrganizerProfile,
  type InsertOrganizerProfile,
  type ServiceRequest,
  type InsertServiceRequest,
  type Payment,
  type InsertPayment,
  type Feedback,
  type InsertFeedback
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, ilike } from "drizzle-orm";

export interface IStorage {
  getUser(id: string | number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string | number, updates: Partial<InsertUser>): Promise<User | undefined>;
  upsertUser(user: any): Promise<User>;
  
  // Professional profile methods
  getProfessionalProfile(userId: string | number): Promise<ProfessionalProfile | undefined>;
  createProfessionalProfile(profile: InsertProfessionalProfile): Promise<ProfessionalProfile>;
  updateProfessionalProfile(userId: string | number, updates: Partial<InsertProfessionalProfile>): Promise<ProfessionalProfile | undefined>;
  getAllProfessionalProfiles(filters?: {
    location?: string;
    service?: string;
    minRate?: number;
    maxRate?: number;
    search?: string;
  }): Promise<ProfessionalProfile[]>;
  
  // Organizer profile methods
  getOrganizerProfile(userId: string | number): Promise<OrganizerProfile | undefined>;
  createOrganizerProfile(profile: InsertOrganizerProfile): Promise<OrganizerProfile>;
  updateOrganizerProfile(userId: string | number, updates: Partial<InsertOrganizerProfile>): Promise<OrganizerProfile | undefined>;
  

  
  // Messaging methods
  getConversations(professionalId?: string, organizerEmail?: string): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversationStatus(id: number, status: string): Promise<Conversation | undefined>;
  
  getMessages(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(conversationId: number, senderType: string): Promise<void>;
  
  // Service request methods
  getServiceRequests(professionalId?: string | number, organizerId?: string | number): Promise<ServiceRequest[]>;
  getServiceRequest(id: number): Promise<ServiceRequest | undefined>;
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  updateServiceRequestStatus(id: number, status: string, responseMessage?: string): Promise<ServiceRequest | undefined>;
  updateServiceRequestPayment(id: number, paymentIntentId: string, paymentStatus: string): Promise<ServiceRequest | undefined>;
  
  // Payment methods
  getPayments(serviceRequestId?: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string): Promise<Payment | undefined>;
  
  // Feedback methods
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedback(): Promise<Feedback[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private professionalProfiles: Map<number, ProfessionalProfile>;
  private organizerProfiles: Map<number, OrganizerProfile>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private serviceRequests: Map<number, ServiceRequest>;
  private payments: Map<number, Payment>;
  private currentUserId: number;
  private currentProfileId: number;
  private currentConversationId: number;
  private currentMessageId: number;
  private currentServiceRequestId: number;
  private currentPaymentId: number;

  constructor() {
    this.users = new Map();
    this.professionalProfiles = new Map();
    this.organizerProfiles = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.serviceRequests = new Map();
    this.payments = new Map();
    this.currentUserId = 1;
    this.currentProfileId = 1;
    this.currentConversationId = 1;
    this.currentMessageId = 1;
    this.currentServiceRequestId = 1;
    this.currentPaymentId = 1;
    
    this.seedServiceRequests();
  }



  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      id,
      email: insertUser.email,
      password: insertUser.password,
      firstName: insertUser.firstName ?? null,
      lastName: insertUser.lastName ?? null,
      role: insertUser.role ?? "organizer",
      profileImageUrl: insertUser.profileImageUrl ?? null,
      isEmailVerified: insertUser.isEmailVerified ?? false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    
    const updated: User = { 
      ...existing, 
      ...updates,
      updatedAt: new Date()
    };
    this.users.set(id, updated);
    return updated;
  }

  async upsertUser(userData: any): Promise<User> {
    // For Replit Auth compatibility - find by string ID or create new user
    const stringId = userData.id;
    let existingUser = Array.from(this.users.values()).find(u => u.id.toString() === stringId);
    
    if (existingUser) {
      // Update existing user
      const updated: User = {
        ...existingUser,
        ...userData,
        updatedAt: new Date()
      };
      this.users.set(existingUser.id, updated);
      return updated;
    } else {
      // Create new user with string ID converted to number for storage
      const numericId = parseInt(stringId) || this.currentUserId++;
      const newUser: User = {
        id: numericId,
        email: userData.email,
        password: userData.password || '',
        role: userData.role || 'organizer',
        isEmailVerified: userData.isEmailVerified || false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.users.set(numericId, newUser);
      return newUser;
    }
  }



  // Messaging methods implementation
  async getConversations(professionalId?: number, organizerEmail?: string): Promise<Conversation[]> {
    const allConversations = Array.from(this.conversations.values());
    
    if (professionalId) {
      return allConversations.filter(conv => conv.professionalId === professionalId);
    }
    
    if (organizerEmail) {
      return allConversations.filter(conv => conv.organizerEmail === organizerEmail);
    }
    
    return allConversations;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentConversationId++;
    const conversation: Conversation = {
      id,
      organizerName: insertConversation.organizerName,
      organizerEmail: insertConversation.organizerEmail,
      professionalId: insertConversation.professionalId,
      eventTitle: insertConversation.eventTitle,
      eventDate: insertConversation.eventDate ?? null,
      eventLocation: insertConversation.eventLocation ?? null,
      eventDescription: insertConversation.eventDescription ?? null,
      status: insertConversation.status || "active",
      createdAt: new Date()
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversationStatus(id: number, status: string): Promise<Conversation | undefined> {
    const existing = this.conversations.get(id);
    if (!existing) return undefined;
    
    const updated: Conversation = { ...existing, status };
    this.conversations.set(id, updated);
    return updated;
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date(),
      isRead: false
    };
    this.messages.set(id, message);
    return message;
  }

  async markMessagesAsRead(conversationId: number, senderType: string): Promise<void> {
    Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId && msg.senderType !== senderType)
      .forEach(msg => {
        const updated = { ...msg, isRead: true };
        this.messages.set(msg.id, updated);
      });
  }

  private seedConversations() {
    // Conversations will be created when users interact
  }

  private seedMessagesForConversation(conversationId: number, organizerName: string) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return;

    // Legacy professional system removed

    const sampleMessages = [
      {
        conversationId,
        senderType: "organizer",
        senderName: organizerName,
        content: `Hi! I'm interested in your services for our upcoming event. Could you provide more details about your availability and pricing?`,
        isRead: true
      },
      {
        conversationId,
        senderType: "professional",
        senderName: "Professional",
        content: `Hello ${organizerName}! Thank you for reaching out. I'd be happy to help with your event. Could you tell me more about the date, guest count, and specific requirements?`,
        isRead: true
      },
      {
        conversationId,
        senderType: "organizer",
        senderName: organizerName,
        content: "The event details are in the initial request. We're looking at approximately " + (conversationId === 1 ? "300" : conversationId === 2 ? "150" : "200") + " guests. What would be your estimated cost for this event?",
        isRead: false
      }
    ];

    sampleMessages.forEach(msg => {
      const id = this.currentMessageId++;
      const message: Message = {
        ...msg,
        id,
        timestamp: new Date(Date.now() - (sampleMessages.length - sampleMessages.indexOf(msg)) * 60000)
      };
      this.messages.set(id, message);
    });
  }

  // Professional profile methods
  async getProfessionalProfile(userId: number): Promise<ProfessionalProfile | undefined> {
    return Array.from(this.professionalProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }

  async createProfessionalProfile(insertProfile: InsertProfessionalProfile): Promise<ProfessionalProfile> {
    const id = this.currentProfileId++;
    const profile: ProfessionalProfile = {
      id,
      userId: insertProfile.userId,
      firstName: insertProfile.firstName,
      lastName: insertProfile.lastName,
      displayName: insertProfile.displayName || null,
      email: insertProfile.email || null,
      phone: insertProfile.phone || null,
      location: insertProfile.location,
      services: insertProfile.services,
      hourlyRate: insertProfile.hourlyRate || null,
      bio: insertProfile.bio || null,
      experience: insertProfile.experience || null,
      profileImageUrl: insertProfile.profileImageUrl || null,
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.professionalProfiles.set(id, profile);
    return profile;
  }

  async updateProfessionalProfile(userId: number, updates: Partial<InsertProfessionalProfile>): Promise<ProfessionalProfile | undefined> {
    const existing = await this.getProfessionalProfile(userId);
    if (!existing) return undefined;

    const updated: ProfessionalProfile = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.professionalProfiles.set(existing.id, updated);
    return updated;
  }

  async getAllProfessionalProfiles(filters?: {
    location?: string;
    service?: string;
    minRate?: number;
    maxRate?: number;
    search?: string;
  }): Promise<ProfessionalProfile[]> {
    let profiles = Array.from(this.professionalProfiles.values());

    if (!filters) return profiles;

    // Filter by location
    if (filters.location) {
      profiles = profiles.filter(profile => 
        profile.location?.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    // Filter by service
    if (filters.service) {
      profiles = profiles.filter(profile => 
        profile.services?.some(service => 
          service.toLowerCase().includes(filters.service!.toLowerCase())
        )
      );
    }

    // Filter by price range
    if (filters.minRate !== undefined) {
      profiles = profiles.filter(profile => {
        if (!profile.hourlyRate) return false;
        const rate = parseFloat(profile.hourlyRate);
        return !isNaN(rate) && rate >= filters.minRate!;
      });
    }

    if (filters.maxRate !== undefined) {
      profiles = profiles.filter(profile => {
        if (!profile.hourlyRate) return false;
        const rate = parseFloat(profile.hourlyRate);
        return !isNaN(rate) && rate <= filters.maxRate!;
      });
    }

    // Search by name or bio
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      profiles = profiles.filter(profile => 
        `${profile.firstName} ${profile.lastName}`.toLowerCase().includes(searchTerm) ||
        profile.displayName?.toLowerCase().includes(searchTerm) ||
        profile.bio?.toLowerCase().includes(searchTerm)
      );
    }

    return profiles;
  }

  // Organizer profile methods
  async getOrganizerProfile(userId: number): Promise<OrganizerProfile | undefined> {
    return Array.from(this.organizerProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }

  async createOrganizerProfile(insertProfile: InsertOrganizerProfile): Promise<OrganizerProfile> {
    const id = this.currentProfileId++;
    const profile: OrganizerProfile = {
      id,
      userId: insertProfile.userId,
      firstName: insertProfile.firstName,
      lastName: insertProfile.lastName,
      companyName: insertProfile.companyName || null,
      email: insertProfile.email || null,
      phone: insertProfile.phone || null,
      location: insertProfile.location,
      eventTypes: insertProfile.eventTypes,
      bio: insertProfile.bio || null,
      profileImageUrl: insertProfile.profileImageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.organizerProfiles.set(id, profile);
    return profile;
  }

  async updateOrganizerProfile(userId: number, updates: Partial<InsertOrganizerProfile>): Promise<OrganizerProfile | undefined> {
    const existing = await this.getOrganizerProfile(userId);
    if (!existing) return undefined;

    const updated: OrganizerProfile = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.organizerProfiles.set(existing.id, updated);
    return updated;
  }

  // Service request methods
  async getServiceRequests(professionalId?: string | number, organizerId?: string | number): Promise<ServiceRequest[]> {
    const allRequests = Array.from(this.serviceRequests.values());
    console.log('Storage: All service requests:', allRequests);
    console.log('Storage: Filtering by professionalId:', professionalId, 'organizerId:', organizerId);
    
    if (professionalId) {
      // Convert to string for comparison since IDs are stored as strings
      const profIdStr = typeof professionalId === 'string' ? professionalId : professionalId.toString();
      const filtered = allRequests.filter(request => request.professionalId === profIdStr);
      console.log('Storage: Filtered requests for professional:', filtered);
      return filtered;
    }
    
    if (organizerId) {
      // Convert to string for comparison since IDs are stored as strings
      const orgIdStr = typeof organizerId === 'string' ? organizerId : organizerId.toString();
      const filtered = allRequests.filter(request => request.organizerId === orgIdStr);
      console.log('Storage: Filtered requests for organizer:', filtered);
      return filtered;
    }
    
    return allRequests;
  }

  async getServiceRequest(id: number): Promise<ServiceRequest | undefined> {
    return this.serviceRequests.get(id);
  }

  async createServiceRequest(insertRequest: InsertServiceRequest): Promise<ServiceRequest> {
    const id = this.currentServiceRequestId++;
    const request: ServiceRequest = {
      id,
      organizerId: typeof insertRequest.organizerId === 'string' ? insertRequest.organizerId : insertRequest.organizerId.toString(),
      professionalId: typeof insertRequest.professionalId === 'string' ? insertRequest.professionalId : insertRequest.professionalId.toString(),
      eventTitle: insertRequest.eventTitle,
      eventDate: insertRequest.eventDate || null,
      eventLocation: insertRequest.eventLocation || null,
      eventDescription: insertRequest.eventDescription || null,
      requestMessage: insertRequest.requestMessage,
      status: insertRequest.status || "pending",
      responseMessage: insertRequest.responseMessage || null,
      respondedAt: null,
      expiresAt: null,
      
      // Payment fields
      depositAmount: insertRequest.depositAmount || null,
      totalAmount: insertRequest.totalAmount || null,
      stripePaymentIntentId: null,
      paymentStatus: insertRequest.paymentStatus || "unpaid",
      paidAt: null,
      
      createdAt: new Date(),
    };
    this.serviceRequests.set(id, request);
    return request;
  }

  async updateServiceRequestStatus(id: number, status: string, responseMessage?: string): Promise<ServiceRequest | undefined> {
    const existing = this.serviceRequests.get(id);
    if (!existing) return undefined;

    const updated: ServiceRequest = {
      ...existing,
      status,
      responseMessage: responseMessage || existing.responseMessage,
      respondedAt: status !== "pending" ? new Date() : existing.respondedAt,
    };
    this.serviceRequests.set(id, updated);
    return updated;
  }

  async updateServiceRequestPayment(id: number, paymentIntentId: string, paymentStatus: string): Promise<ServiceRequest | undefined> {
    const existing = this.serviceRequests.get(id);
    if (!existing) return undefined;

    const updated: ServiceRequest = {
      ...existing,
      stripePaymentIntentId: paymentIntentId,
      paymentStatus,
      paidAt: paymentStatus === 'paid' ? new Date() : existing.paidAt,
      status: paymentStatus === 'paid' ? 'paid' : existing.status,
    };
    this.serviceRequests.set(id, updated);
    return updated;
  }

  async getPayments(serviceRequestId?: number): Promise<Payment[]> {
    const allPayments = Array.from(this.payments.values());
    if (serviceRequestId) {
      return allPayments.filter(payment => payment.serviceRequestId === serviceRequestId);
    }
    return allPayments;
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const payment: Payment = { 
      id, 
      ...insertPayment,
      status: insertPayment.status || "pending",
      stripeChargeId: insertPayment.stripeChargeId || null,
      platformFee: insertPayment.platformFee || null,
      professionalEarnings: insertPayment.professionalEarnings || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment | undefined> {
    const existing = this.payments.get(id);
    if (!existing) return undefined;

    const updated: Payment = {
      ...existing,
      status,
      updatedAt: new Date(),
    };
    this.payments.set(id, updated);
    return updated;
  }

  private seedServiceRequests(): void {
    // No sample data - real users will create service requests
  }

}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string | number): Promise<User | undefined> {
    const userId = typeof id === 'string' ? id : id.toString();
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        id: Date.now().toString(),
        email: insertUser.email,
        password: insertUser.password,
        role: insertUser.role || 'organizer',
        isEmailVerified: insertUser.isEmailVerified || false
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id.toString()))
      .returning();
    return user;
  }

  async upsertUser(userData: any): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Professional profile methods
  async getProfessionalProfile(userId: string | number): Promise<ProfessionalProfile | undefined> {
    const userIdStr = typeof userId === 'string' ? userId : userId.toString();
    const [profile] = await db
      .select()
      .from(professionalProfiles)
      .where(eq(professionalProfiles.userId, userIdStr));
    return profile;
  }

  async createProfessionalProfile(profile: InsertProfessionalProfile): Promise<ProfessionalProfile> {
    console.log('Creating professional profile with data:', JSON.stringify(profile, null, 2));
    
    // Construct name from available fields
    let name = 'Professional'; // Default fallback
    
    if (profile.displayName) {
      name = profile.displayName;
    } else if (profile.firstName || profile.lastName) {
      name = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
    }
    
    console.log('Constructed name:', name);
    
    const profileData = {
      ...profile,
      name: name
    };
    
    console.log('Final profile data for insertion:', JSON.stringify(profileData, null, 2));
    
    const [newProfile] = await db
      .insert(professionalProfiles)
      .values(profileData)
      .returning();
    return newProfile;
  }

  async updateProfessionalProfile(userId: string | number, updates: Partial<InsertProfessionalProfile>): Promise<ProfessionalProfile | undefined> {
    const [profile] = await db
      .update(professionalProfiles)
      .set(updates)
      .where(eq(professionalProfiles.userId, userId.toString()))
      .returning();
    return profile;
  }

  async getAllProfessionalProfiles(filters?: {
    location?: string;
    service?: string;
    minRate?: number;
    maxRate?: number;
    search?: string;
  }): Promise<ProfessionalProfile[]> {
    let query = db.select().from(professionalProfiles);
    
    if (filters) {
      const conditions = [];
      
      if (filters.location) {
        conditions.push(ilike(professionalProfiles.location, `%${filters.location}%`));
      }
      
      if (filters.service) {
        conditions.push(ilike(professionalProfiles.services, `%${filters.service}%`));
      }
      
      if (filters.search) {
        conditions.push(
          or(
            ilike(professionalProfiles.name, `%${filters.search}%`),
            ilike(professionalProfiles.bio, `%${filters.search}%`),
            ilike(professionalProfiles.services, `%${filters.search}%`)
          )
        );
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query;
  }

  // Organizer profile methods
  async getOrganizerProfile(userId: string | number): Promise<OrganizerProfile | undefined> {
    const userIdStr = typeof userId === 'string' ? userId : userId.toString();
    const [profile] = await db
      .select()
      .from(organizerProfiles)
      .where(eq(organizerProfiles.userId, userIdStr));
    return profile;
  }

  async createOrganizerProfile(profile: InsertOrganizerProfile): Promise<OrganizerProfile> {
    console.log('Creating organizer profile with data:', profile);
    
    // Construct the name field from firstName and lastName
    const profileWithName = {
      ...profile,
      name: `${profile.firstName} ${profile.lastName}`.trim()
    };
    
    console.log('Profile with constructed name:', profileWithName);
    
    const [newProfile] = await db
      .insert(organizerProfiles)
      .values(profileWithName)
      .returning();
    return newProfile;
  }

  async updateOrganizerProfile(userId: string | number, updates: Partial<InsertOrganizerProfile>): Promise<OrganizerProfile | undefined> {
    const userIdStr = typeof userId === 'string' ? userId : userId.toString();
    const [profile] = await db
      .update(organizerProfiles)
      .set(updates)
      .where(eq(organizerProfiles.userId, userIdStr))
      .returning();
    return profile;
  }

  // Messaging methods
  async getConversations(professionalId?: string, organizerEmail?: string): Promise<Conversation[]> {
    let query = db.select().from(conversations);
    
    if (professionalId) {
      query = query.where(eq(conversations.professionalId, professionalId));
    }
    
    if (organizerEmail) {
      query = query.where(eq(conversations.organizerEmail, organizerEmail));
    }
    
    return await query.orderBy(desc(conversations.createdAt));
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return conversation;
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db
      .insert(conversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async updateConversationStatus(id: number, status: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .update(conversations)
      .set({ status })
      .where(eq(conversations.id, id))
      .returning();
    return conversation;
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.timestamp);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async markMessagesAsRead(conversationId: number, senderType: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.senderType, senderType === 'professional' ? 'organizer' : 'professional')
        )
      );
  }

  // Service request methods
  async getServiceRequests(professionalId?: string | number, organizerId?: string | number): Promise<ServiceRequest[]> {
    let query = db.select().from(serviceRequests);
    
    if (professionalId) {
      // Convert to string to match the text field in database
      const profId = typeof professionalId === 'string' ? professionalId : professionalId.toString();
      query = query.where(eq(serviceRequests.professionalId, profId));
    }
    
    if (organizerId) {
      // Convert to string to match the text field in database
      const orgId = typeof organizerId === 'string' ? organizerId : organizerId.toString();
      query = query.where(eq(serviceRequests.organizerId, orgId));
    }
    
    return await query.orderBy(desc(serviceRequests.createdAt));
  }

  async getServiceRequest(id: number): Promise<ServiceRequest | undefined> {
    const [request] = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, id));
    return request;
  }

  async createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest> {
    const [newRequest] = await db
      .insert(serviceRequests)
      .values(request)
      .returning();
    return newRequest;
  }

  async updateServiceRequestStatus(id: number, status: string, responseMessage?: string): Promise<ServiceRequest | undefined> {
    const updates: any = { status };
    if (responseMessage) {
      updates.responseMessage = responseMessage;
    }
    if (status === 'accepted' || status === 'declined') {
      updates.respondedAt = new Date();
    }
    
    const [request] = await db
      .update(serviceRequests)
      .set(updates)
      .where(eq(serviceRequests.id, id))
      .returning();
    return request;
  }

  async updateServiceRequestPayment(id: number, paymentIntentId: string, paymentStatus: string): Promise<ServiceRequest | undefined> {
    const updates: any = {
      stripePaymentIntentId: paymentIntentId,
      paymentStatus
    };
    
    if (paymentStatus === 'paid') {
      updates.paidAt = new Date();
    }
    
    const [request] = await db
      .update(serviceRequests)
      .set(updates)
      .where(eq(serviceRequests.id, id))
      .returning();
    return request;
  }

  // Payment methods
  async getPayments(serviceRequestId?: number): Promise<Payment[]> {
    let query = db.select().from(payments);
    
    if (serviceRequestId) {
      query = query.where(eq(payments.serviceRequestId, serviceRequestId));
    }
    
    return await query.orderBy(desc(payments.createdAt));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db
      .insert(payments)
      .values(payment)
      .returning();
    return newPayment;
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment | undefined> {
    const [payment] = await db
      .update(payments)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db
      .insert(feedback)
      .values(feedbackData)
      .returning();
    return newFeedback;
  }

  async getFeedback(): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .orderBy(desc(feedback.createdAt));
  }
}

export const storage = new DatabaseStorage();
