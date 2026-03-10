# LEADGEN_OS Architecture

## Overview
LEADGEN_OS is a high-performance AI-powered lead generation dashboard built with a "Dark Terminal" aesthetic. It combines real-time data management, AI-assisted workflows, and a secure multi-layer authentication system.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui + Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Realtime)
- **AI**: Gemini via Lovable AI Gateway (streaming SSE)
- **Icons**: Lucide React

## Architecture Layers

### 1. Authentication Layer
- **Supabase Auth**: Email/password signup and login
- **4-Digit PIN**: Secondary verification required on every login session
- **Session Management**: Persistent sessions with auto-refresh via `onAuthStateChange`

### 2. Frontend Structure
```
src/
├── hooks/useAuth.tsx          # Auth context + PIN state
├── components/
│   ├── AppSidebar.tsx         # Navigation sidebar (mobile-compatible)
│   ├── ProtectedLayout.tsx    # Layout wrapper with sidebar
│   ├── SystemStatus.tsx       # Bot/Apify status indicators
│   ├── LeadsTable.tsx         # Real-time leads data grid
│   ├── AIChatPanel.tsx        # Streaming AI chat interface
│   └── TerminalInput.tsx      # Command-line interface
├── pages/
│   ├── Auth.tsx               # Login/signup
│   ├── PinVerification.tsx    # PIN setup & verification
│   ├── Dashboard.tsx          # Overview with status + leads
│   ├── Leads.tsx              # Leads table + terminal
│   ├── Agent.tsx              # AI chat full page
│   ├── TerminalPage.tsx       # Terminal full page
│   └── Settings.tsx           # Profile, security, preferences, docs
```

### 3. Database Schema
| Table | Purpose |
|-------|---------|
| `leads` | Lead records (email, name, status, niche) |
| `profiles` | User profile data (display name, avatar) |
| `user_pins` | Hashed 4-digit PIN per user |
| `user_preferences` | User settings (notifications, sound) |

### 4. Security
- Row-Level Security (RLS) on all user tables
- PIN hashing with user-specific salt
- Auto-profile creation via database trigger on signup

### 5. Real-time Features
- Leads table subscribes to Postgres changes
- AI chat streams responses via SSE

## Route Map
| Route | Page | Auth Required |
|-------|------|---------------|
| `/` | Dashboard | ✅ + PIN |
| `/leads` | Leads Management | ✅ + PIN |
| `/agent` | AI Agent Chat | ✅ + PIN |
| `/terminal` | Terminal Interface | ✅ + PIN |
| `/settings` | User Settings | ✅ + PIN |
