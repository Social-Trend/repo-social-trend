import { users, professionals, type User, type InsertUser, type Professional, type InsertProfessional } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getProfessional(id: number): Promise<Professional | undefined>;
  getProfessionals(): Promise<Professional[]>;
  createProfessional(professional: InsertProfessional): Promise<Professional>;
  updateProfessional(id: number, professional: Partial<InsertProfessional>): Promise<Professional | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private professionals: Map<number, Professional>;
  private currentUserId: number;
  private currentProfessionalId: number;

  constructor() {
    this.users = new Map();
    this.professionals = new Map();
    this.currentUserId = 1;
    this.currentProfessionalId = 1;
    
    // Add sample professionals
    this.seedProfessionals();
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

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
}

export const storage = new MemStorage();
