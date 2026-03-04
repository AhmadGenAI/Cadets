# Shaheen Forces Academy - Cadet College Prep Portal

## Overview
A comprehensive web application for Pakistani students preparing for cadet college entrance exams. Features AI tutoring, MCQ practice, interview/medical preparation tips, and a full admin panel.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + wouter routing + framer-motion
- **Backend**: Express.js with session-based authentication
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Custom session-based auth with scrypt password hashing

## Key Features
- Public landing page with provinces, colleges, and hero section
- Student registration/login via mobile number
- Student portal: AI tutor, MCQ quizzes, interview prep, medical tips, profile
- Admin panel: manage users, provinces, colleges, packages, pages, blog posts
- Trial system with configurable trial days
- CSV export for user data

## Database Schema
- `users` - Students and admins with mobile-based auth
- `provinces` - Pakistani provinces with images
- `colleges` - Cadet colleges linked to provinces
- `packages` - Subscription packages (trial, standard, premium)
- `syllabus` - Study material organized by level/subject
- `mcq_bank` - Multiple choice questions for practice
- `pages` - Static content pages (about, terms, privacy)
- `blog_posts` - Blog articles
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
- `server/seed.ts` - Seed data
- `client/src/pages/` - All page components
- `client/src/components/` - Shared components
- `client/src/lib/auth.tsx` - Auth context provider

## Running
- `npm run dev` starts Express + Vite dev server
- `npm run db:push` pushes schema to database
