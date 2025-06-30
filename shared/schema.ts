import { pgTable, text, serial, integer, boolean, decimal, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("organizer"), // "organizer" or "professional"
  isEmailVerified: boolean("is_email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const professionalProfiles = pgTable("professional_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(), // Display name for the professional
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  displayName: text("display_name"), // Optional professional business name
  email: text("email"), // Can be different from user email for business
  phone: text("phone"),
  location: text("location").notNull(),
  services: text("services").array().notNull(),
  hourlyRate: text("hourly_rate"),
  bio: text("bio"),
  experience: integer("experience"),
  profileImageUrl: text("profile_image_url"),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const organizerProfiles = pgTable("organizer_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(), // Constructed from firstName + lastName
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  companyName: text("company_name"), // Optional company/organization name
  email: text("email"), // Can be different from user email for business
  phone: text("phone"),
  location: text("location").notNull(),
  eventTypes: text("event_types").array().notNull(),
  bio: text("bio"), // Description of the organizer/company
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
  name: true, // Exclude name since it's constructed automatically on backend
  createdAt: true,
  updatedAt: true,
}).extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  displayName: z.string().optional(),
  email: z.string().email("Please enter a valid email").optional(),
  phone: z.string().optional(),
  services: z.array(z.string()).min(1, "Please select at least one service"),
  hourlyRate: z.string().optional(),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
  experience: z.number().min(0).optional(),
});

// Organizer profile schemas
export const insertOrganizerProfileSchema = createInsertSchema(organizerProfiles).omit({
  id: true,
  name: true, // Exclude name since it's constructed automatically on backend
  createdAt: true,
  updatedAt: true,
}).extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  companyName: z.string().optional(),
  email: z.string().email("Please enter a valid email").optional(),
  phone: z.string().optional(),
  eventTypes: z.array(z.string()).min(1, "Please select at least one event type"),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
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
  professionalId: text("professional_id").notNull().references(() => users.id),
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

// Service requests table for direct contact/booking requests
export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  organizerId: text("organizer_id").notNull().references(() => users.id),
  professionalId: text("professional_id").notNull().references(() => users.id),
  eventTitle: text("event_title").notNull(),
  eventDate: timestamp("event_date"),
  eventLocation: text("event_location"),
  eventDescription: text("event_description"),
  requestMessage: text("request_message").notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, declined, expired, paid, completed
  responseMessage: text("response_message"),
  respondedAt: timestamp("responded_at"),
  expiresAt: timestamp("expires_at"),
  
  // Payment fields
  depositAmount: integer("deposit_amount"), // Amount in cents
  totalAmount: integer("total_amount"), // Amount in cents
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paymentStatus: text("payment_status").default("unpaid"), // unpaid, pending, paid, refunded
  paidAt: timestamp("paid_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payments table for tracking transactions
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  serviceRequestId: integer("service_request_id").notNull().references(() => serviceRequests.id),
  organizerId: text("organizer_id").notNull().references(() => users.id),
  professionalId: text("professional_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // Amount in cents
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull(),
  stripeChargeId: text("stripe_charge_id"),
  status: text("status").notNull().default("pending"), // pending, succeeded, failed, refunded
  type: text("type").notNull(), // deposit, final_payment, refund
  platformFee: integer("platform_fee").default(0), // Platform commission in cents
  professionalEarnings: integer("professional_earnings"), // Amount professional receives
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Feedback table
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  rating: integer("rating"), // 1-5 star rating
  message: text("message"),
  category: varchar("category", { length: 50 }), // 'general', 'onboarding', 'messaging', 'search', etc.
  recommendationRating: integer("recommendation_rating"), // 1-5 scale: Would you recommend SocialTend to others?
  userIntent: text("user_intent"), // optional: What brought you here today?
  experienceRating: integer("experience_rating"), // 1-5 scale: How satisfied are you with the user experience?
  userAgent: text("user_agent"),
  currentPage: varchar("current_page", { length: 255 }),
  sessionDuration: integer("session_duration"), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
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

export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
  expiresAt: true,
  stripePaymentIntentId: true,
  paidAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
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
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

// New profile types
export type InsertProfessionalProfile = z.infer<typeof insertProfessionalProfileSchema>;
export type ProfessionalProfile = typeof professionalProfiles.$inferSelect;
export type InsertOrganizerProfile = z.infer<typeof insertOrganizerProfileSchema>;
export type OrganizerProfile = typeof organizerProfiles.$inferSelect;
