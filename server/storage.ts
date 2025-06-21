import { 
  users, 
  professionals, 
  conversations, 
  messages,
  professionalProfiles,
  organizerProfiles,
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
  serviceRequests,
  type ServiceRequest,
  type InsertServiceRequest
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Professional profile methods
  getProfessionalProfile(userId: number): Promise<ProfessionalProfile | undefined>;
  createProfessionalProfile(profile: InsertProfessionalProfile): Promise<ProfessionalProfile>;
  updateProfessionalProfile(userId: number, updates: Partial<InsertProfessionalProfile>): Promise<ProfessionalProfile | undefined>;
  getAllProfessionalProfiles(filters?: {
    location?: string;
    service?: string;
    minRate?: number;
    maxRate?: number;
    search?: string;
  }): Promise<ProfessionalProfile[]>;
  
  // Organizer profile methods
  getOrganizerProfile(userId: number): Promise<OrganizerProfile | undefined>;
  createOrganizerProfile(profile: InsertOrganizerProfile): Promise<OrganizerProfile>;
  updateOrganizerProfile(userId: number, updates: Partial<InsertOrganizerProfile>): Promise<OrganizerProfile | undefined>;
  

  
  // Messaging methods
  getConversations(professionalId?: number, organizerEmail?: string): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversationStatus(id: number, status: string): Promise<Conversation | undefined>;
  
  getMessages(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(conversationId: number, senderType: string): Promise<void>;
  
  // Service request methods
  getServiceRequests(professionalId?: number, organizerId?: number): Promise<ServiceRequest[]>;
  getServiceRequest(id: number): Promise<ServiceRequest | undefined>;
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  updateServiceRequestStatus(id: number, status: string, responseMessage?: string): Promise<ServiceRequest | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private professionalProfiles: Map<number, ProfessionalProfile>;
  private organizerProfiles: Map<number, OrganizerProfile>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private serviceRequests: Map<number, ServiceRequest>;
  private currentUserId: number;
  private currentProfileId: number;
  private currentConversationId: number;
  private currentMessageId: number;
  private currentServiceRequestId: number;

  constructor() {
    this.users = new Map();
    this.professionalProfiles = new Map();
    this.organizerProfiles = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.serviceRequests = new Map();
    this.currentUserId = 1;
    this.currentProfileId = 1;
    this.currentConversationId = 1;
    this.currentMessageId = 1;
    this.currentServiceRequestId = 1;
    
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
    const sampleConversations = [
      {
        organizerName: "Jennifer Smith",
        organizerEmail: "jennifer@eventpro.com",
        professionalId: 1,
        eventTitle: "Corporate Annual Gala",
        eventDate: "2024-07-15",
        eventLocation: "San Francisco Convention Center",
        eventDescription: "Annual company celebration with 300 guests, requiring photography and catering services.",
        status: "active"
      },
      {
        organizerName: "Michael Johnson",
        organizerEmail: "michael@weddingdreams.com",
        professionalId: 2,
        eventTitle: "Summer Wedding Reception",
        eventDate: "2024-08-20",
        eventLocation: "Napa Valley Vineyard",
        eventDescription: "Elegant outdoor wedding reception for 150 guests, need full catering service with wine pairing.",
        status: "active"
      },
      {
        organizerName: "Sarah Wilson",
        organizerEmail: "sarah@creativevents.com",
        professionalId: 5,
        eventTitle: "Product Launch Party",
        eventDate: "2024-06-30",
        eventLocation: "Downtown Rooftop Venue",
        eventDescription: "Tech company product launch with cocktail service for 200 attendees.",
        status: "active"
      }
    ];

    sampleConversations.forEach(conv => {
      const id = this.currentConversationId++;
      const conversation: Conversation = {
        ...conv,
        id,
        createdAt: new Date()
      };
      this.conversations.set(id, conversation);

      // Add sample messages for each conversation
      this.seedMessagesForConversation(id, conv.organizerName);
    });
  }

  private seedMessagesForConversation(conversationId: number, organizerName: string) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return;

    const professional = this.professionals.get(conversation.professionalId);
    if (!professional) return;

    const sampleMessages = [
      {
        conversationId,
        senderType: "organizer",
        senderName: organizerName,
        content: `Hi ${professional.name}! I'm interested in your services for our upcoming event. Could you provide more details about your availability and pricing?`,
        isRead: true
      },
      {
        conversationId,
        senderType: "professional",
        senderName: professional.name,
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
      name: insertProfile.name,
      location: insertProfile.location,
      services: insertProfile.services,
      hourlyRate: insertProfile.hourlyRate || null,
      bio: insertProfile.bio || null,
      profileImageUrl: insertProfile.profileImageUrl || null,
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
        profile.name?.toLowerCase().includes(searchTerm) ||
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
      name: insertProfile.name,
      location: insertProfile.location,
      eventTypes: insertProfile.eventTypes,
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
  async getServiceRequests(professionalId?: number, organizerId?: number): Promise<ServiceRequest[]> {
    const allRequests = Array.from(this.serviceRequests.values());
    console.log('Storage: All service requests:', allRequests);
    console.log('Storage: Filtering by professionalId:', professionalId, 'organizerId:', organizerId);
    
    if (professionalId) {
      const filtered = allRequests.filter(request => request.professionalId === professionalId);
      console.log('Storage: Filtered requests for professional:', filtered);
      return filtered;
    }
    
    if (organizerId) {
      const filtered = allRequests.filter(request => request.organizerId === organizerId);
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
      organizerId: insertRequest.organizerId,
      professionalId: insertRequest.professionalId,
      eventTitle: insertRequest.eventTitle,
      eventDate: insertRequest.eventDate || null,
      eventLocation: insertRequest.eventLocation || null,
      eventDescription: insertRequest.eventDescription || null,
      requestMessage: insertRequest.requestMessage,
      status: insertRequest.status || "pending",
      responseMessage: insertRequest.responseMessage || null,
      respondedAt: null,
      expiresAt: insertRequest.expiresAt || null,
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

  private seedServiceRequests(): void {
    // Add sample service requests for testing
    const sampleRequests = [
      {
        organizerId: 1,
        professionalId: 1,
        eventTitle: "Corporate Holiday Party",
        eventDate: new Date("2025-12-15"),
        eventLocation: "Downtown Convention Center",
        eventDescription: "Annual company holiday party for 150 employees",
        requestMessage: "We need a professional bartender for our holiday party. The event will run from 6 PM to 11 PM. We'll provide all alcohol and bar supplies. Looking for someone with experience in corporate events.",
        status: "pending" as const,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        organizerId: 2,
        professionalId: 1,
        eventTitle: "Wedding Reception",
        eventDate: new Date("2025-07-20"),
        eventLocation: "Sunset Gardens Venue",
        eventDescription: "Intimate wedding reception for 80 guests",
        requestMessage: "Looking for a skilled bartender for our wedding reception. We want specialty cocktails and professional service. The reception will be outdoors with a beautiful garden setting.",
        status: "pending" as const,
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      }
    ];

    sampleRequests.forEach(request => {
      const serviceRequest: ServiceRequest = {
        id: this.currentServiceRequestId++,
        organizerId: request.organizerId,
        professionalId: request.professionalId,
        eventTitle: request.eventTitle,
        eventDate: request.eventDate,
        eventLocation: request.eventLocation,
        eventDescription: request.eventDescription,
        requestMessage: request.requestMessage,
        status: request.status,
        responseMessage: null,
        respondedAt: null,
        expiresAt: request.expiresAt,
        createdAt: new Date(),
      };
      this.serviceRequests.set(serviceRequest.id, serviceRequest);
    });
  }

}

export const storage = new MemStorage();
