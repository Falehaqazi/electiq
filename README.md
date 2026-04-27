# ElectIQ — India Election Process Education Assistant

**Built for Google PromptWars Challenge 2 · Powered by Google Antigravity + Gemini 2.0 Flash**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Cloud%20Run-blue)](YOUR_CLOUD_RUN_URL)

## Overview

ElectIQ is an interactive AI-powered guide that helps citizens understand India's election process — from the initial announcement through result declaration. It combines a visual 7-phase timeline, a graded knowledge quiz, and a real-time Gemini-powered chat assistant.

### Features

- **Interactive Timeline** — 7 phases of the Indian election process with expandable details and key facts
- **Knowledge Quiz** — 6 graded questions with instant feedback and explanations
- **Gemini AI Assistant** — Real-time answers to election questions powered by Gemini 2.0 Flash
- **Full Accessibility** — ARIA labels, keyboard navigation, screen reader support, skip links, focus management
- **Responsive Design** — Works on mobile and desktop

### Google Services Used

- **Gemini 2.0 Flash API** — AI assistant for election Q&A
- **Google Cloud Run** — Serverless deployment
- **Google Artifact Registry** — Container image hosting

## Local Development

```bash
# 1. Clone the repo
git clone https://github.com/Falehaqazi/electiq
cd electiq

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Add your Gemini API key (free at https://aistudio.google.com/app/apikey)

# 4. Run locally
npm run dev
```

## Deploy to Google Cloud Run

```bash
# 1. Set your project
gcloud config set project YOUR_PROJECT_ID

# 2. Build and push image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/electiq \
  --build-arg VITE_GEMINI_API_KEY=YOUR_KEY

# 3. Deploy to Cloud Run
gcloud run deploy electiq \
  --image gcr.io/YOUR_PROJECT_ID/electiq \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --port 8080
```

## Accessibility

ElectIQ meets WCAG 2.1 AA standards:
- Skip navigation link
- All interactive elements have ARIA labels
- `aria-live` regions for dynamic chat content
- `aria-expanded` for accordion phases
- `role="progressbar"` on quiz progress
- `prefers-reduced-motion` respected
- Full keyboard navigability

## Project Structure

```
electiq/
├── src/
│   ├── App.jsx          # Main app with Timeline, Quiz, Chat
│   └── main.jsx         # React entry point
├── index.html           # Accessible HTML shell
├── Dockerfile           # Multi-stage build for Cloud Run
├── nginx.conf           # SPA routing + security headers
├── vite.config.js       # Build config with code splitting
└── package.json
```

## Built With

- React 18 + Vite
- Gemini 2.0 Flash API (Google AI Studio)
- Google Cloud Run
- Google Antigravity (agentic IDE)
- Nginx (Alpine)

---

*ElectIQ — making democracy accessible, one question at a time.*
