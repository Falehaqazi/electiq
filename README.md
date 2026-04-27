# ElectIQ — India Election Process Education Assistant

> An interactive AI-powered guide that makes India's democratic process accessible to every citizen.

**Built for Google PromptWars Challenge 2 · Powered by Google Antigravity + Gemini 2.0 Flash + Google Cloud Run**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Cloud%20Run-4285F4?style=flat&logo=google-cloud)](YOUR_CLOUD_RUN_URL)
[![GitHub](https://img.shields.io/badge/GitHub-electiq-181717?style=flat&logo=github)](https://github.com/Falehaqazi/electiq)
[![Gemini](https://img.shields.io/badge/Gemini-2.0%20Flash-4285F4?style=flat&logo=google)](https://ai.google.dev)

---

## Problem Statement

India has 960+ million registered voters, yet civic literacy about the election process remains low. Many first-time voters don't know the difference between nomination filing and campaigning, or what the Model Code of Conduct actually restricts. ElectIQ solves this by making the election process interactive, visual, and conversational.

## Solution

ElectIQ is a single-page web application that guides citizens through India's 7-phase election process with:

- **Interactive Timeline** — visual step-by-step breakdown of every election phase from announcement to result declaration, with expandable detail panels and key constitutional facts
- **Knowledge Quiz** — 6 graded questions with instant feedback, progress tracking, and explanations sourced from the Constitution of India and ECI guidelines
- **Gemini AI Assistant** — real-time conversational Q&A powered by Gemini 2.0 Flash, grounded in election-specific context via system prompting

## Google Services Used

| Service | Usage |
|---|---|
| **Gemini 2.0 Flash API** | Powers the AI assistant for real-time election Q&A |
| **Google Cloud Run** | Serverless deployment — scales to zero, pay-per-use |
| **Google Artifact Registry** | Hosts the Docker container image |
| **Google Cloud Build** | CI/CD pipeline for container builds |
| **Google Antigravity** | Agentic IDE used to scaffold and iterate the application |

## Accessibility (WCAG 2.1 AA Compliant)

ElectIQ is built with full accessibility support:

- **Skip navigation link** — keyboard users can jump directly to main content
- **ARIA labels** — every interactive element has a descriptive `aria-label`
- **ARIA live regions** — `aria-live="polite"` on chat log for screen reader announcements
- **aria-expanded** — accordion phase panels announce open/close state
- **role="progressbar"** — quiz progress bar is screen reader accessible
- **role="log"** — chat message container correctly identified for assistive technology
- **aria-live announcer** — hidden div announces quiz correct/incorrect answers
- **Focus management** — chat input refocuses after each message
- **Keyboard navigation** — all interactive elements reachable via Tab key
- **Focus visible** — custom `focus-visible` outline on all buttons and links
- **prefers-reduced-motion** — animations disabled for users who prefer reduced motion
- **Semantic HTML** — correct use of `<header>`, `<nav>`, `<main>`, `<footer>`, `<h1>`, `<h2>`
- **Color contrast** — all text meets WCAG AA contrast ratio requirements

## Technical Architecture

```
┌─────────────────────────────────────────────────┐
│                  React Frontend                  │
│  ┌────────────┐ ┌──────────┐ ┌───────────────┐  │
│  │  Timeline  │ │   Quiz   │ │  Chat (AI)    │  │
│  │  7 Phases  │ │ 6 Q&A    │ │  Gemini 2.0   │  │
│  └────────────┘ └──────────┘ └───────────────┘  │
└──────────────────────┬──────────────────────────┘
                       │ HTTPS
              ┌────────▼────────┐
              │  Gemini 2.0     │
              │  Flash API      │
              │  (Google AI)    │
              └─────────────────┘
                       
┌─────────────────────────────────────────────────┐
│              Google Cloud Run                    │
│   Nginx (Alpine) · Port 8080 · Auto-scaling     │
│   Docker multi-stage build · Gzip compression   │
└─────────────────────────────────────────────────┘
```

## Performance & Efficiency

- **React.memo** on PhaseItem component — prevents unnecessary re-renders
- **useCallback** on all event handlers — stable references across renders
- **Vite code splitting** — React bundle separated from app code
- **Nginx gzip compression** — reduces transfer size by ~70%
- **1-year cache headers** on static assets — instant repeat loads
- **Lazy scroll** — chat messages use `scrollIntoView` only when needed
- **Debounced API calls** — retry logic with exponential backoff on rate limits
- **Multi-stage Docker build** — production image is minimal Alpine-based Nginx

## Code Quality

- Clean component separation: `PhaseItem`, `Quiz`, `Chat`, `App`
- All async operations wrapped in try/catch with meaningful error messages
- React StrictMode enabled for development best practices
- No prop drilling — each component manages its own state
- Consistent styling via inline style objects (no CSS-in-JS overhead)
- ESLint-compatible code structure

## Security

- No sensitive data stored client-side
- API key injected at build time via Vite environment variables
- Nginx security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- External links use `rel="noopener noreferrer"`
- No third-party tracking or analytics scripts

## Local Development

```bash
# Clone
git clone https://github.com/Falehaqazi/electiq.git
cd electiq

# Install
npm install

# Configure
cp .env.example .env
# Add your Gemini API key from https://aistudio.google.com/app/apikey

# Run
npm run dev
# Open http://localhost:5173
```

## Deploy to Google Cloud Run

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Build and push
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/electiq \
  --build-arg VITE_GEMINI_API_KEY=YOUR_GEMINI_KEY

# Deploy
gcloud run deploy electiq \
  --image gcr.io/YOUR_PROJECT_ID/electiq \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --port 8080
```

## Project Structure

```
electiq/
├── src/
│   ├── App.jsx          # Main app — Timeline, Quiz, Chat components
│   └── main.jsx         # React entry point with StrictMode
├── index.html           # Accessible HTML shell with meta tags
├── Dockerfile           # Multi-stage build (Node builder + Nginx)
├── nginx.conf           # SPA routing + security headers + gzip
├── vite.config.js       # Code splitting + build optimisation
├── package.json         # Dependencies
└── .env.example         # Environment variable template
```

## Built With

- **React 18** — UI framework
- **Vite 5** — build tool with HMR and code splitting
- **Gemini 2.0 Flash API** — Google AI for conversational Q&A
- **Google Cloud Run** — serverless container deployment
- **Google Cloud Build** — container image CI/CD
- **Google Artifact Registry** — container registry
- **Google Antigravity** — agentic IDE for AI-assisted development
- **Nginx Alpine** — production static file server

## About

Built by **Faleha Qazi** for Google PromptWars Challenge 2 — Election Process Education.

The goal: help every Indian citizen understand their democratic rights and the election process, powered by Google AI.

---

*ElectIQ — making democracy accessible, one question at a time.* 🗳️