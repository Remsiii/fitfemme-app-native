# FitFemme - Women's Fitness & Productivity App

## Overview

FitFemme is a fitness and productivity app designed for women. The app combines AI-powered task prioritization with health and wellness features to help users maintain a balanced lifestyle. Users can track their workouts, integrate Apple Watch data, monitor water intake, and utilize other wellness tools tailored for women.

## Tech Stack 

Tech Stack:
Frontend: React Native with TypeScript, Expo, and Expo Router
Backend/Database: Supabase
UI Framework: React Native Paper
AI Processing: DeepSeek

## Core Features

### 1. Welcome & Authentication
- Clean, minimalistic welcome screen
- Sign up with email and password
- Login with credentials
- Personalized onboarding process:
  - Fitness goal setting
  - Basic information collection
  - Notification preferences

### 2. Main Dashboard
- AI-Powered Task Prioritization
- Apple Watch Integration
- Quick-access wellness tools
- Daily progress overview

### 3. Productivity Tools
- **Task Manager**
  - AI-based priority sorting
  - Task CRUD operations
  - Pomodoro timer
- **Focus Mode**
  - Distraction-free environment
  - Essential notifications only
  - Productivity analytics

### 4. Health & Wellness
- **Workout Tracking**
  - Custom workout logging
  - Pre-built routines
  - Apple Watch sync
- **Water Intake Monitor**
  - Customizable hydration goals
  - Smart reminders
- **Period Tracking**
  - Cycle prediction
  - Phase-based wellness tips
- **AI Wellness Insights**
  - Personalized recommendations
  - Data-driven health suggestions

### 5. Customization
- Profile management
- Goal adjustment
- Notification settings
- Theme customization (including dark mode)

### 6. Community Features
- Fitness communities
- Progress sharing
- User motivation system
- Comprehensive help center

## Technical Stack

### Frontend
- React Native (iOS & Android)
- HealthKit API integration

### Backend
- Firebase / Node.js with Express
- Firestore or PostgreSQL database

### AI/ML Integration
- TensorFlow.js
- OpenAI API for task prioritization

## Future Roadmap

- Gamification system
  - Achievement badges
  - Streak tracking
  - Reward mechanics
- Voice command integration
- Guided wellness exercises
  - Meditation
  - Stress management
  - Breathing techniques

## Project Structure

/fitfemme
├── api                     # Backend API server
│   ├── config             # Configuration files
│   ├── controllers        # Request handlers
│   ├── middleware        # Custom middleware
│   ├── models            # Database models
│   ├── routes            # API routes
│   ├── services          # Business logic
│   ├── utils             # Helper functions
│   └── validators        # Input validation
│
├── client                 # Frontend React application
│   ├── public            # Static files
│   ├── src
│   │   ├── assets        # Images, fonts, etc.
│   │   ├── components    # Reusable UI components
│   │   ├── contexts      # React contexts
│   │   ├── hooks         # Custom React hooks
│   │   ├── layouts       # Page layouts
│   │   ├── pages         # Page components
│   │   ├── services      # API integration
│   │   ├── styles        # Global styles
│   │   ├── types         # TypeScript types
│   │   └── utils         # Helper functions
│   │
│   └── tests             # Frontend tests
│
├── docs                   # Documentation
│   ├── api               # API documentation
│   └── database          # Database documentation
│
├── scripts               # Utility scripts
│   ├── database         # Database migration scripts
│   └── deployment       # Deployment scripts
│
└── shared               # Shared code between frontend and backend
    ├── constants        # Shared constants
    └── types           # Shared TypeScript types

## Implementation Progress

### Current Focus: Authentication System
- [x] Database schema setup
- [ ] Backend API endpoints for auth
- [ ] Frontend authentication screens
- [ ] User session management
- [ ] Password reset flow

### Next Steps:
1. User Profile Management
2. Workout Tracking System
3. Period Tracking Features
4. Water Intake Monitoring
5. AI Task Prioritization
6. Apple Watch Integration
7. Community Features

### Current Sprint Tasks:
1. Set up authentication API endpoints
   - Register endpoint
   - Login endpoint
   - Password reset
   - Email verification
2. Create authentication UI screens
   - Login screen
   - Registration screen
   - Forgot password screen
3. Implement session management
   - JWT token handling
   - Secure storage
   - Auto-logout

---

*This documentation serves as a comprehensive guide for the FitFemme development team, outlining core features, technical requirements, and future enhancements.*
