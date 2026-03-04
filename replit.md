# Cadet Colleges Test Preparation Portal

## Overview
A comprehensive web application for Pakistani students preparing for cadet college entrance exams. Features AI tutoring, MCQ practice, interview/medical preparation tips, and a full admin panel.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + wouter routing + framer-motion
- **Backend**: Express.js with session-based authentication
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Custom session-based auth with scrypt password hashing

## Key Features
- Public landing page with provinces, colleges, hero section, and free assessment CTAs
- Student registration/login via mobile number
- Student portal:
  - **Live Chat** (was "Start Preparation"): Interactive MCQ tutor with voice — opens with "Assalamo Alaikum", lets student pick subject (Math/English/Science/Urdu/GK), delivers MCQs one by one with instant right/wrong feedback, Math explanations, voice auto-read with ON/OFF toggle, subject switch prompt after 50 MCQs, Urdu essay/letter/story support
  - **MCQ Quizzes**: 25-question quiz per session with instant right/wrong feedback, progress bar, final score with percentage, restart with unique questions (tracks used IDs)
  - **Interview Prep**: 507 Q&A across 10 categories (Self-Intro, Family, GK, Pakistan Studies, Islamic, Cadet-Specific, Personality, Current Affairs, Academic, Misc) in expandable accordions; GK Quiz tab (20 random from 40 pool); Confidence & Body Language guide with 6 instruction cards
  - **PDF Papers**: Auto-generates 5 random MCQs (was 25) with watermark, answer key, branding; unique questions each time
  - Medical tips, profile management
- Public chatbot ("Shaheen Bot"): warm bilingual Urdu/English tone, uses "beta", gives admission info, promotes portal enrollment with package prices. Expanded topics: hostel/boarding life, scholarships/concessions, uniform, sports/activities, results/merit, rankings/comparisons, required documents, test dates, college-specific lookup. Unknown queries fallback to WhatsApp +923348480890
- Free Assessment Tools (public, no login required):
  - Personality Assessment: 14-trait Likert scale evaluation
  - Academic Assessment: 5-subject timed MCQ test (Intelligence, English, Science, Math, Urdu)
- Admin panel: manage users, provinces, colleges, packages, pages, blog posts, assessment question bank
- Trial system with configurable trial days
- CSV export for user data

## Database Schema
- `users` - Students and admins with mobile-based auth
- `provinces` - Provinces/states/regions with `country` field (Pakistan, India, Bangladesh, Turkey, UK, US, UAE, Saudi Arabia, Canada, Australia, Qatar, Malaysia)
- `colleges` - Cadet colleges/military schools linked to provinces (with feeStructure, contactNumber, admissionClasses) — includes international institutions
- `packages` - Subscription packages (trial, standard, premium)
- `syllabus` - Study material organized by level/subject
- `mcq_bank` - Multiple choice questions for practice
- `pages` - Static content pages (about, terms, privacy)
- `blog_posts` - Blog articles
- `assessment_questions` - Personality and academic assessment questions (316 seeded)
- `settings` - Key-value site settings (site_name, trial_days, hero_media, hero_media_type, bg_audio, force_boxes, cta_bg_image)

## Admin Credentials (Dev)
- Mobile: 03000000000
- Password: admin123

## File Structure
- `shared/schema.ts` - Database schema and types
- `server/db.ts` - Database connection
- `server/storage.ts` - Data access layer
- `server/routes.ts` - API routes
- `server/auth.ts` - Password hashing utilities
- `server/pdf.ts` - PDF generation with watermark (pdfkit)
- `server/seed.ts` - Seed data
- `uploads/` - User-uploaded files (images, audio, video) served statically at /uploads/
- `client/src/pages/` - All page components
- `client/src/components/` - Shared components
- `client/src/lib/auth.tsx` - Auth context provider

## SEO & Performance
- SeoHead component sets per-page title, meta description, OG tags, canonical URL
- ErrorBoundary wraps entire app for crash recovery
- All routes lazy-loaded with React.lazy + Suspense (spinner fallback)
- Query client configured with staleTime (5min), auto-retry for server errors, no retry for 4xx
- Google Fonts trimmed to only Open Sans (was loading 30+ fonts)
- index.html has structured data (JSON-LD), OG/Twitter meta, PWA manifest, apple-touch-icon
- Process-level uncaughtException/unhandledRejection handlers in server

## Running
- `npm run dev` starts Express + Vite dev server
- `npm run db:push` pushes schema to database
