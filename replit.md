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

### Client-side Firebase Integration

- L'applicazione gira interamente nel browser: nessun server Node/Express necessario.
- Firebase Authentication gestisce il login con Google ed Apple direttamente lato client.
- Cloud Firestore viene utilizzato per sincronizzare statistiche, esercizi e leaderboard.
- In modalità ospite i dati continuano ad essere salvati in `localStorage` e vengono sincronizzati dopo l'accesso.
- La configurazione di Firebase viene letta da `client/public/firebase-config.js`, evitando l'uso di variabili `.env`.

### External Dependencies

- Firebase SDK web per Auth + Firestore.
- Radix UI, shadcn/ui, React Hook Form, Zod e TanStack Query per l'interfaccia e la gestione dello stato.
- Tailwind CSS e Vite come tool di build completamente client-side.

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