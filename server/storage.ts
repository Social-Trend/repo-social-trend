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
    this.professionals = new Map();
    this.professionalProfiles = new Map();
    this.organizerProfiles = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.serviceRequests = new Map();
    this.currentUserId = 1;
    this.currentProfessionalId = 1;
    this.currentProfileId = 1;
    this.currentConversationId = 1;
    this.currentMessageId = 1;
    this.currentServiceRequestId = 1;
    
    // Add sample professionals
    this.seedProfessionals();
    this.seedConversations();
    this.seedServiceRequests();
  }

  private seedProfessionals() {
    const sampleProfessionals = [
      {
        name: "Sarah Chen",
        email: "sarah.chen@email.com",
        phone: "+1 (555) 123-4567",
        location: "San Francisco, CA",
        bio: "Award-winning event photographer with 8 years of experience capturing life's most precious moments. Specializing in weddings, corporate events, and social gatherings.",
        services: ["Photography", "Wedding Photography", "Corporate Events", "Portrait Sessions"],
        hourlyRate: "150.00",
        experience: 8,
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
        verified: true
      },
      {
        name: "Marcus Rodriguez",
        email: "marcus@finecatering.com",
        phone: "+1 (555) 987-6543",
        location: "Los Angeles, CA",
        bio: "Executive chef and catering specialist with over 12 years in the hospitality industry. Known for creative menus and exceptional service for events of all sizes.",
        services: ["Catering", "Chef", "Private Chef Services", "Menu Planning"],
        hourlyRate: "200.00",
        experience: 12,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
        verified: true
      },
      {
        name: "Emily Thompson",
        email: "emily@bloomdesigns.com",
        phone: "+1 (555) 456-7890",
        location: "Austin, TX",
        bio: "Creative floral designer and event decorator with a passion for transforming spaces. Specializing in elegant weddings and sophisticated corporate events.",
        services: ["Decoration", "Floral Design", "Event Planning", "Venue Styling"],
        hourlyRate: "125.00",
        experience: 6,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
        verified: true
      },
      {
        name: "David Kim",
        email: "david@soundwaveentertainment.com",
        phone: "+1 (555) 321-0987",
        location: "Miami, FL",
        bio: "Professional DJ and entertainment coordinator bringing energy and excitement to events. Experienced in weddings, parties, and corporate functions.",
        services: ["DJ Services", "Entertainment", "Sound Equipment", "MC Services"],
        hourlyRate: "175.00",
        experience: 10,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        verified: true
      },
      {
        name: "James Mitchell",
        email: "james@premiumbar.com",
        phone: "+1 (555) 234-5678",
        location: "New York, NY",
        bio: "Professional bartender and mixologist with expertise in craft cocktails and beverage service. Specializing in upscale events and wedding receptions.",
        services: ["Bartending", "Mixology", "Beverage Service", "Bar Setup"],
        hourlyRate: "85.00",
        experience: 7,
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
        verified: true
      },
      {
        name: "Lisa Chang",
        email: "lisa@stellarwaitstaff.com",
        phone: "+1 (555) 345-6789",
        location: "Chicago, IL",
        bio: "Experienced waitstaff coordinator and service professional. Leading teams to deliver exceptional dining experiences at high-end events and galas.",
        services: ["Waitstaff", "Server", "Service Coordination", "Event Staff Management"],
        hourlyRate: "45.00",
        experience: 5,
        avatar: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=400&fit=crop&crop=face",
        verified: true
      },
      {
        name: "Antonio Silva",
        email: "antonio@epicflavors.com",
        phone: "+1 (555) 456-7891",
        location: "Phoenix, AZ",
        bio: "Culinary artist and private chef specializing in Mediterranean and Latin cuisine. Creating memorable dining experiences for intimate gatherings and large events.",
        services: ["Chef", "Private Chef", "Culinary Arts", "Menu Development"],
        hourlyRate: "120.00",
        experience: 9,
        avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=400&fit=crop&crop=face",
        verified: true
      },
      {
        name: "Rachel Adams",
        email: "rachel@eventcoordination.com",
        phone: "+1 (555) 567-8912",
        location: "Seattle, WA",
        bio: "Detail-oriented event coordinator with a talent for seamless execution. Specializing in corporate functions, product launches, and milestone celebrations.",
        services: ["Event Planning", "Event Coordination", "Project Management", "Vendor Coordination"],
        hourlyRate: "95.00",
        experience: 6,
        avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face",
        verified: true
      }
    ];

    sampleProfessionals.forEach(prof => {
      const id = this.currentProfessionalId++;
      const professional: Professional = { 
        ...prof, 
        id
      };
      this.professionals.set(id, professional);
    });
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

  async getProfessional(id: number): Promise<Professional | undefined> {
    return this.professionals.get(id);
  }

  async getProfessionals(): Promise<Professional[]> {
    return Array.from(this.professionals.values());
  }

  async createProfessional(insertProfessional: InsertProfessional): Promise<Professional> {
    const id = this.currentProfessionalId++;
    const professional: Professional = { 
      id,
      name: insertProfessional.name,
      email: insertProfessional.email,
      phone: insertProfessional.phone || null,
      location: insertProfessional.location,
      bio: insertProfessional.bio || null,
      services: insertProfessional.services,
      hourlyRate: insertProfessional.hourlyRate || null,
      experience: insertProfessional.experience || null,
      avatar: insertProfessional.avatar || null,
      verified: insertProfessional.verified || false
    };
    this.professionals.set(id, professional);
    return professional;
  }

  async updateProfessional(id: number, updates: Partial<InsertProfessional>): Promise<Professional | undefined> {
    const existing = this.professionals.get(id);
    if (!existing) return undefined;
    
    const updated: Professional = { ...existing, ...updates };
    this.professionals.set(id, updated);
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
