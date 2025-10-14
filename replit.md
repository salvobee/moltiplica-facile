# Moltiplicazioni in Colonna - Educational App

## Overview

An educational web application designed for Italian elementary school students to learn and practice column multiplication (moltiplicazioni in colonna). The app provides guided step-by-step exercises and random practice with immediate feedback, gamification elements, and progress tracking. The interface is designed to resemble a school notebook with a grid background, creating a familiar learning environment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for UI components
- Vite as build tool and development server
- Wouter for client-side routing
- TanStack Query for data fetching and caching
- Tailwind CSS with shadcn/ui component library
- Custom design system inspired by educational apps (Khan Academy Kids, Duolingo)

**Design System:**
- Color palette featuring primary blue (210 85% 45%), success green, accent yellow for gamification
- Typography using Comic Neue for friendly readability and Roboto Mono for number alignment
- Notebook-style background (35 20% 96%) with grid lines
- Mobile-first responsive design with touch-optimized interactions

**Key Components:**
- `GuidedExercise`: Step-by-step multiplication solver with hints and validation
- `DifficultySelector`: Three difficulty levels (1-digit × 2-digit, 2-digit × 2-digit, 3-digit × 2-digit)
- `MultiplicationDisplay`: Visual representation of column multiplication with partial products
- `NumberInput`: Single-digit input with visual feedback (shake on error, bounce on success)
- `CompletionCelebration`: Gamified success screen with confetti animation and score display

**Routing Structure:**
- `/` - Guided mode (custom number input)
- `/random` - Random exercises by difficulty
- `/stats` - User statistics and progress tracking

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- HTTP server for API endpoints
- Development mode with Vite middleware integration
- Production static file serving

**Storage Strategy:**
- Memory-based storage implementation (MemStorage) for development
- Interface-based design (IStorage) allowing easy migration to database
- Guest mode uses localStorage for offline functionality
- Cloud sync capability when user authenticates

**Data Models:**
- Exercise: Tracks individual multiplication problems with score, errors, timestamp
- UserStats: Aggregates total exercises, scores, and difficulty-level breakdowns
- LeaderboardEntry: User ranking data for competitive features

### External Dependencies

**Authentication & Database:**
- Firebase Authentication for user login (Google and Apple providers)
- Cloud Firestore for user data persistence and real-time sync
- Local storage fallback for guest users

**UI Component Library:**
- Radix UI primitives for accessible components (dialogs, dropdowns, tooltips, etc.)
- shadcn/ui design system (New York style variant)
- React Hook Form with Zod validation for forms
- React Icons for icon library

**Development & Build Tools:**
- TypeScript for type safety
- ESBuild for server bundling
- PostCSS with Tailwind for styling
- tsx for development server execution

**Database Configuration:**
- Drizzle ORM configured for PostgreSQL (via @neondatabase/serverless)
- Schema defined in shared/schema.ts
- Migration support through drizzle-kit
- Note: Database is configured but not actively used; migration path available

**Gamification Features:**
- Score calculation based on speed, accuracy, and hint usage
- Visual celebrations with confetti animations
- Progress tracking across difficulty levels
- Potential leaderboard integration (schema defined)

**PWA Support:**
- Web app manifest for installability
- Mobile-optimized with appropriate meta tags
- Portrait-primary orientation lock
- Italian language localization