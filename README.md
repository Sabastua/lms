# lms

An open-source, university-grade Learning Management System (LMS) inspired by Coursera and Open edX (OLX). Built with React, Vite, Node.js, Express, and SQLite.

## Overview

OpenLearn LMS connects open educational resource (OER) APIs into structured, university-style academic curricula. It features video lectures, timestamped notes, peer discussions, verified certificates of completion, course reviews, and an interactive AI study assistant.

## Features

- **University Curricula & Specializations:** 16 full courses across Harvard (CS50), MIT, Stanford, Oxford, Yale, Princeton, and Columbia, organized into multi-course specializations.
- **Coursera-Style Experience:**
  - Week-by-week curriculum navigation with lesson type tags (Video, Reading, Quiz).
  - Timestamped video lecture notes and interactive transcripts.
  - In-lesson discussion forums and course reviews/ratings.
  - Interactive AI Study Assistant (summaries, conceptual intuition, practice quizzes).
  - Verified Certificates of Completion with unique cryptographic verification hashes.
- **OER & Public API Integrations:**
  - YouTube (embedded video curricula with zero cookies)
  - Wikipedia REST API (academic articles, overviews, excerpts)
  - Project Gutenberg / Gutendex (70,000+ public-domain primary sources and literature)
  - REST Countries v3.1 (geography, geopolitical, and demographic fact sheets)
  - Open Trivia Database / OpenTDB (interactive practice quizzes with SQLite tracking)
- **Authentication & User Roles:**
  - JWT authentication with SQLite persistence.
  - Learner and Instructor workspaces with course authoring studio.
- **Clean Academic UI:** Minimalist publication-grade typography, subtle elevation, airy card grids, zero emojis, and responsive dark/light/sepia themes.

## Architecture

```
lms/
├── backend/
│   ├── data/
│   │   ├── coursesData.js       # Seeded university courses and modules
│   │   └── lms.sqlite           # SQLite database (auto-initialized)
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js              # Login, register, profile
│   │   ├── courses.js           # Courses, enrollments, lessons, progress
│   │   └── learning.js          # Notes, discussions, reviews, certificates
│   ├── db.js                    # SQLite schema and query methods
│   └── server.js                # Express REST API server (:3000)
├── src/
│   ├── api/
│   │   └── client.js            # Axios client with bearer token interception
│   ├── components/              # React view components
│   │   ├── LandingPage.jsx      # Public exploration landing page
│   │   ├── DashboardView.jsx    # Learner progress & certificate wallet
│   │   ├── CoursesView.jsx      # Course player, notes, AI tutor, reviews
│   │   ├── CertificateModal.jsx # Printable academic credential with hash
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.jsx      # Global user and session provider
│   └── styles/
│       └── global.css           # Minimalist CSS design system
└── vite.config.js               # Frontend build configuration (:5173)
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Backend API

```bash
npm run server
```
The API server will listen on `http://localhost:3000`.

### 3. Start the Frontend Development Server

```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Build for Production

```bash
npm run build
```

## Seed Accounts

- **Learner:** `student@openlearn.org` / `learner123`
- **Instructor:** `faculty@openlearn.org` / `instructor123`
