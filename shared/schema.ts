import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("organizer"), // "organizer" or "professional"
  profileImageUrl: text("profile_image_url"),
  isEmailVerified: boolean("is_email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const professionalProfiles = pgTable("professional_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  location: text("location").notNull(),
  services: text("services").array().notNull(),
  hourlyRate: text("hourly_rate"),
  bio: text("bio"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const organizerProfiles = pgTable("organizer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  location: text("location").notNull(),
  eventTypes: text("event_types").array().notNull(),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const professionals = pgTable("professionals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  location: text("location").notNull(),
  bio: text("bio"),
  services: text("services").array().notNull(),
  hourlyRate: text("hourly_rate"),
  experience: integer("experience"),
  avatar: text("avatar"),
  verified: boolean("verified").default(false),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerUserSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
  role: z.enum(["organizer", "professional"]).default("organizer"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Professional profile schemas
export const insertProfessionalProfileSchema = createInsertSchema(professionalProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  services: z.array(z.string()).min(1, "Please select at least one service"),
  hourlyRate: z.string().optional(),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
});

// Organizer profile schemas
export const insertOrganizerProfileSchema = createInsertSchema(organizerProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  eventTypes: z.array(z.string()).min(1, "Please select at least one event type"),
});

// Service options for professionals
export const serviceOptions = [
  "Bartender",
  "Chef", 
  "Waiter/Server",
  "Photographer",
  "DJ",
  "Event Coordinator",
  "Security",
  "Cleaning Staff",
  "Other"
] as const;

// Event type options for organizers
export const eventTypeOptions = [
  "Wedding",
  "Corporate Event",
  "Birthday Party",
  "Anniversary",
  "Baby Shower",
  "Graduation",
  "Holiday Party",
  "Fundraiser",
  "Other"
] as const;

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  organizerName: text("organizer_name").notNull(),
  organizerEmail: text("organizer_email").notNull(),
  professionalId: integer("professional_id").notNull(),
  eventTitle: text("event_title").notNull(),
  eventDate: text("event_date"),
  eventLocation: text("event_location"),
  eventDescription: text("event_description"),
  status: text("status").notNull().default("active"), // active, closed, archived
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  senderType: text("sender_type").notNull(), // organizer, professional
  senderName: text("sender_name").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  isRead: boolean("is_read").default(false),
});

export const insertProfessionalSchema = createInsertSchema(professionals).omit({
  id: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProfessional = z.infer<typeof insertProfessionalSchema>;
export type Professional = typeof professionals.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
