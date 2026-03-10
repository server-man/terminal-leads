# LEADGEN_OS

> AI-powered lead generation dashboard with a Dark Terminal aesthetic.

![Status](https://img.shields.io/badge/status-active-brightgreen) ![React](https://img.shields.io/badge/React-18-blue) ![Supabase](https://img.shields.io/badge/Supabase-connected-green)

## Features

- **🔐 Dual Authentication** — Email/password login + 4-digit PIN verification on every session
- **📊 Real-time Leads Table** — Glass-morphism styled table with live Supabase subscriptions
- **🤖 AI Agent Chat** — Streaming AI assistant for lead gen workflows and email templates
- **💻 Terminal Interface** — Command-line input supporting `/scrape`, `/help`, `/clear`
- **📡 System Status** — Live indicators for Bot and Apify connection status
- **⚙️ Settings** — Profile management, PIN security, preferences, and built-in documentation
- **📱 Mobile Compatible** — Responsive sidebar navigation with collapsible icon mode

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth, PostgreSQL, Edge Functions, Realtime)
- **AI**: Gemini via streaming Edge Function
- **Design**: Dark Terminal theme (JetBrains Mono + Space Grotesk)

## Getting Started

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run dev
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system design.

## Project Info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID
