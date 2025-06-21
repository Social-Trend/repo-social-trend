# SocialTend - Event Professional Marketplace

## Overview

SocialTend is a full-stack web application that connects event organizers with hospitality professionals including bartenders, chefs, photographers, DJs, and event coordinators. The platform enables browsing professional profiles, initiating conversations, and managing event-related communications through an integrated messaging system.

## System Architecture

**Frontend:** React with TypeScript using Vite as the build tool
**Backend:** Node.js with Express.js
**Database:** PostgreSQL with Drizzle ORM
**UI Framework:** shadcn/ui components with Tailwind CSS
**State Management:** TanStack Query for server state
**Routing:** Wouter for client-side routing
**Deployment:** Replit with autoscale deployment

## Key Components

### Frontend Architecture
- **Component-based React structure** with modular UI components
- **Route-based navigation** using Wouter with dedicated page components
- **Form handling** with React Hook Form and Zod validation
- **Responsive design** with mobile-first approach using Tailwind CSS
- **Component library** based on Radix UI primitives styled with shadcn/ui

### Backend Architecture
- **RESTful API** built with Express.js
- **Modular route structure** with centralized route registration
- **Storage abstraction layer** with in-memory implementation (ready for database integration)
- **Middleware integration** for request logging and error handling

### Database Schema
- **Users table** for authentication (username/password)
- **Professionals table** storing profile information, services, rates, and verification status
- **Conversations table** tracking communication threads between organizers and professionals
- **Messages table** storing individual messages with read status and sender identification

## Data Flow

1. **Professional Discovery**: Organizers browse and filter professionals by service type, location, and other criteria
2. **Contact Initiation**: Organizers submit contact forms which create conversation threads
3. **Message Exchange**: Real-time messaging between organizers and professionals within conversation contexts
4. **Profile Management**: Professionals can create and update their profiles with services, rates, and portfolio information

## External Dependencies

### Core Framework Dependencies
- **React ecosystem**: React 18, React DOM, React Hook Form
- **Build tools**: Vite, TypeScript, ESBuild
- **Database**: Drizzle ORM, PostgreSQL driver (@neondatabase/serverless)
- **UI components**: Radix UI primitives, Tailwind CSS, Lucide icons

### Development Dependencies
- **Validation**: Zod for schema validation
- **HTTP client**: TanStack Query for data fetching
- **Session management**: connect-pg-simple for PostgreSQL sessions
- **Date handling**: date-fns for date manipulation

## Deployment Strategy

**Environment**: Replit with Node.js 20 runtime
**Build process**: 
- Development: `npm run dev` (concurrent frontend/backend development)
- Production: `npm run build` (Vite build + ESBuild server compilation)
- Start: `npm run start` (production server)

**Database setup**: PostgreSQL 16 module with Drizzle migrations
**Port configuration**: Internal port 5000 mapped to external port 80
**Auto-scaling**: Configured for autoscale deployment target

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- June 21, 2025: **COMPLETED** Stripe payment integration for booking deposits
  - ✓ Payment schema added with deposit amounts, total amounts, and payment status tracking
  - ✓ Server-side payment processing endpoints with Stripe infrastructure
  - ✓ Payment storage methods for transaction history and status management
  - ✓ PaymentForm component with deposit calculation and payment confirmation
  - ✓ PaymentButton component integrated into service request workflow
  - ✓ Messages page enhanced with payment status display and payment actions
  - ✓ StripeCheckout component for secure payment processing
  - ✓ Authentication middleware fixed to properly extract user ID from JWT tokens
  - ✓ Public API endpoint added for payment checkout page service request data
  - ✓ End-to-end payment flow working with user's test Stripe keys
  - ✓ User successfully tested payment processing from service request to Stripe checkout
  - ✓ Payment confirmation system implemented to update status from "pending" to "paid"
  - ✓ Button states working correctly: "Pay Deposit" → "Processing Payment..." → "Deposit Paid" (green)

- June 21, 2025: **COMPLETED** advanced search and filtering system for professional marketplace
  - ✓ Added comprehensive service type dropdown with predefined categories (Photography, DJ Services, Event Planning, Catering, etc.)
  - ✓ Implemented custom service input field for services not in predefined list
  - ✓ Added price range filtering with min/max hourly rate inputs
  - ✓ Created collapsible advanced filters panel for clean interface
  - ✓ Added active filter badges with individual remove functionality
  - ✓ Implemented clear all filters capability
  - ✓ Enhanced professional discovery with multiple filtering dimensions

- June 21, 2025: **COMPLETED** unified communication hub and navigation simplification
  - ✓ Consolidated navigation from 4+ items to clean 3-item layout: Home | Find Professionals | Messages
  - ✓ Moved role switcher into user profile dropdown to reduce top-level clutter
  - ✓ Unified service requests and messaging into single "Messages & Requests" hub
  - ✓ Eliminated duplicate "My Requests" navigation for professionals - all communication now in Messages
  - ✓ Professional and organizer dashboards now direct users to unified Messages section
  - ✓ Simplified user experience with single communication point for all interactions

- June 21, 2025: **COMPLETED** cleanup of dual professional workflow
  - ✓ Removed legacy professional system causing duplicate profile prompts
  - ✓ Unified all professional functionality to use single profile system
  - ✓ Professional dashboard now properly redirects to unified onboarding flow
  - ✓ Role switching triggers single profile completion check only
  - ✓ Eliminated duplicate API endpoints and storage methods for professionals

- June 21, 2025: **COMPLETED** in-app service request system
  - ✓ Built service request form for organizers to contact professionals directly within the app
  - ✓ Created service request management dashboard with accept/decline functionality for professionals
  - ✓ Implemented real-time status tracking (pending/accepted/declined/expired) with timestamps
  - ✓ Added "Requests" navigation link integrated into main app routing system
  - ✓ All communication stays within SocialTend - no external email/phone contact required
  - ✓ Sample service requests seeded for testing professional dashboard functionality

- June 21, 2025: **COMPLETED** dual role profile switching system
  - ✓ Role switcher component in navigation showing current role with easy switching
  - ✓ Backend API endpoint for role switching with proper authentication
  - ✓ Updated profile system to fetch both organizer and professional profiles simultaneously
  - ✓ Profile completion tracking for both roles with visual indicators
  - ✓ Fixed pricing display formatting in professional directory
  - ✓ Users can now be both Event Organizers and Professional Tenders seamlessly

- June 21, 2025: **COMPLETED** professional directory with real user profiles
  - ✓ Created API endpoint for professional profiles with search and filter capabilities
  - ✓ Built storage methods to fetch real professional profiles with location, service, and price filtering
  - ✓ Updated professionals page to display authentic user profiles from completed registrations
  - ✓ Added search functionality by name, location, and service type
  - ✓ Fixed Select component errors preventing page loading
  - ✓ Implemented contact form integration for connecting with real professionals

- June 21, 2025: **COMPLETED** full authentication and profile management system
  - ✓ JWT-based login/registration with role selection 
  - ✓ Role-specific onboarding flow with automatic redirect after registration
  - ✓ Professional and organizer profile creation forms with photo upload
  - ✓ Profile completion tracking and navigation status indicators
  - ✓ Form validation, service/event type selection, and custom options
  - ✓ Comprehensive testing confirmed profile forms display and submit correctly
  - **Issue identified**: Authentication token persistence needs improvement for production use
- Fixed duplicate navigation bars issue by removing extra Navigation component from home page  
- Implemented role-specific default selection: "Sign up/Log in" defaults to organizer, "Become a Tender" defaults to professional
- Added authentication modal with user avatar dropdown, secure token handling, and protected routes

## Changelog

Changelog:
- June 14, 2025. Initial setup