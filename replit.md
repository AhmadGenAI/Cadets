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
- Student portal: AI tutor (warm human-like personal tutor with student name), MCQ quizzes, interview prep, medical tips, PDF paper generator, profile
- Public chatbot ("Shaheen Bot"): warm bilingual Urdu/English tone, uses "beta", gives admission info, promotes portal enrollment with package prices
- Free Assessment Tools (public, no login required):
  - Personality Assessment: 14-trait Likert scale evaluation
  - Academic Assessment: 5-subject timed MCQ test (Intelligence, English, Science, Math, Urdu)
- Admin panel: manage users, provinces, colleges, packages, pages, blog posts, assessment question bank
- Trial system with configurable trial days
- CSV export for user data

## Database Schema
- `users` - Students and admins with mobile-based auth
- `provinces` - Pakistani provinces with images
- `colleges` - Cadet colleges linked to provinces (with feeStructure, contactNumber, admissionClasses)
- `packages` - Subscription packages (trial, standard, premium)
- `syllabus` - Study material organized by level/subject
- `mcq_bank` - Multiple choice questions for practice
- `pages` - Static content pages (about, terms, privacy)
- `blog_posts` - Blog articles
- `assessment_questions` - Personality and academic assessment questions (316 seeded)
- `settings` - Key-value site settings

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
