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