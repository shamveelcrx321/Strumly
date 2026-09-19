# 🎸 Strumly

> **Every song is closer than you think.**

Strumly is a premium platform for discovering guitar chords, lyrics, and song arrangements, with transposition, music discovery, and a community-driven experience.

The project combines a premium acoustic-music interface with a Supabase-powered backend, PostgreSQL database, and authentication system.

--- 

## ✨ Features

- **🎵 Song Discovery:** Browse a comprehensive catalog with advanced search, filtering (genre, difficulty, key, capo), and sorting options (popularity, recently added).
- **🎸 Song Details:** View detailed song information including title, artist, album, genre, difficulty, key, capo, tuning, chord count, duration, lyrics, chords, and artwork.
- **🔄 Chord Transposition:** Easily transpose chords to different keys for a more comfortable playing experience.
- **🔐 Authentication:** Secure email/password authentication via Supabase Auth, with persistent sessions, state management, and protected routes.
- **👤 User Features:** (Planned) My Music, Favorites, My Uploads, Account Settings, and Profile controls.
- **📤 Upload System:** Interface for users to upload, manage, edit, and delete their own song arrangements.
- **🎨 Premium Design:** A warm, acoustic-music inspired visual identity with a focus on a premium guitar-studio atmosphere, avoiding cyberpunk or neon aesthetics.

--- 

## 🛠️ Tech Stack

### Frontend

- **Framework:** React
- **Language:** TypeScript
- **Routing:** TanStack Start & TanStack Router
- **Styling:** Tailwind CSS
- **Bundler:** Vite

### Backend

- **BaaS:** Supabase
- **Database:** PostgreSQL
- **Authentication:** Supabase Authentication
- **Security:** Row Level Security (RLS)

### Development Tools

- **Runtime:** Node.js / Bun
- **Version Control:** Git / GitHub
- **Editor:** Visual Studio Code
- **Linting/Formatting:** ESLint, Prettier

--- 

# 🏗️ Application Architecture

The application follows a modern frontend architecture leveraging TanStack Start for server-side rendering and routing, interacting with Supabase for backend services.

```text
                    ┌─────────────────────────┐
                    │       Strumly UI        │
                    │    React + TypeScript   │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     TanStack Start      │
                    │     TanStack Router     │
                    └────────────┬────────────┘
                                 │
                  ┌──────────────┴──────────────┐
                  │                             │
                  ▼                             ▼
        ┌────────────────────┐        ┌────────────────────┐
        │   Song Services    │        │  Supabase Client   │
        │     & Catalog      │        │      + Auth        │
        └──────────┬─────────┘        └──────────┬─────────┘
                   │                             │
                   │                             ▼
                   │                    ┌────────────────────┐
                   │                    │  Supabase Auth     │
                   │                    └────────────────────┘
                   │
                   ▼
        ┌────────────────────────────────────────────┐
        │             Supabase PostgreSQL            │
        │                                            │
        │                  songs                     │
        │                                            │
        │        Future user-specific tables         │
        └────────────────────────────────────────────┘
```

--- 

# 📁 Project Structure

The project follows a standard TanStack Start directory structure:

```text
Strumly/
│
├── public/
│   └── Static public assets
│
├── src/
│   │
│   ├── assets/
│   │   └── Images and visual assets
│   │
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── AccountDropdown.tsx
│   │   └── Other reusable UI components
│   │
│   ├── hooks/
│   │   └── Reusable React hooks
│   │
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── auth-context.tsx
│   │
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   ├── search.tsx
│   │   ├── song.$id.tsx
│   │   ├── upload.tsx
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── my-music.tsx
│   │   └── settings.tsx
│   │
│   ├── services/
│   │   ├── catalog.ts
│   │   └── song-service.ts
│   │
│   ├── router.ts
│   ├── routeTree.gen.ts
│   ├── server.ts
│   ├── start.ts
│   └── styles.css
│
├── supabase/
│   └── migrations/
│       └── Database migration files
│
├── .gitignore
├── package.json
├── bun.lock
└── README.md
```

--- 

# 🗄️ DATABASE

Strumly utilizes **Supabase PostgreSQL** as its primary data store.

- **Primary Table:** `public.songs`

--- 

# 📊 `public.songs` Table Schema

The `songs` table is designed to hold comprehensive song data:

| Column        | Type      | Description                                  |
|---------------|-----------|----------------------------------------------|
| id            | `uuid`    | Internal unique database identifier          |
| slug          | `text`    | Application-level song identifier            |
| title         | `text`    | Song title                                   |
| artist        | `text`    | Artist name                                  |
| author        | `text`    | Song author when available                   |
| genre         | `text`    | Song genre                                   |
| difficulty    | `text`    | Guitar difficulty                            |
| song_key      | `text`    | Original musical key                         |
| capo          | `integer` | Capo position                                |
| tuning        | `text`    | Guitar tuning                                |
| chord_count   | `integer` | Number of unique chords                      |
| popularity    | `integer` | Popularity value (for sorting)               |
| album         | `text`    | Album name                                   |
| art_color     | `text`    | Primary color derived from artwork           |
| lyrics        | `text`    | Song lyrics (raw text)                       |
| cover_image   | `text`    | Reference to cover image URL                 |
| added_at      | `date`    | Date the song was added                      |
| duration      | `text`    | Song duration (e.g., '3:45')                 |
| chords        | `jsonb`   | Structured list of unique chords             |
| sections      | `jsonb`   | Structured lyrics with inline chord data     |
| created_at    | `timestamptz` | Database record creation timestamp           |
| updated_at    | `timestamptz` | Last database record update timestamp        |

--- 

# 🧩 Database Design

- **Metadata vs. Structured Data:** General song metadata is stored in standard columns, while structured lyric and chord information is handled efficiently using PostgreSQL's `jsonb` type for `sections` and `chords`.
- **`jsonb` for Flexibility:** This design avoids creating numerous relational tables for chords or lyric segments, allowing for flexible storage of song content.

```text
Song
│
├── title
├── artist
├── album
├── genre
├── difficulty
├── song_key
├── capo
├── tuning
├── popularity
│
├── chords
│     └── JSON structured chord information
│
└── sections
      └── JSON structured song sections
```

--- 

# 🔒 Database Security

- **Row Level Security (RLS):** Enabled on the `songs` table to enforce granular access controls.
- **Public Access:** `SELECT` operations are permitted for all users (guests and authenticated).
- **Authenticated User Permissions:** `INSERT` operations are restricted to authenticated users. Future updates will tighten `UPDATE` and `DELETE` policies to user-specific ownership.

--- 

# 🔐 Supabase Configuration

Supabase client configuration is managed via environment variables in `.env`.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

**Security Note:** Never commit `.env` files or server-side secret keys to public repositories.

--- 

# 🔑 Authentication Architecture

Strumly leverages Supabase Auth for authentication management.

```text
                    ┌─────────────────────┐
                    │      Strumly UI     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Supabase Auth Client│
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Supabase Auth     │
                    │                     │
                    │ Email + Password    │
                    └─────────────────────┘
```

- **User Access Model:**
  - **Guest Users:** Can browse, search, filter, sort, and transpose songs.
  - **Authenticated Users:** Gain access to personal features like favorites, uploads, and account settings.

--- 

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/shamveelcrx321/Strumly.git
```

## 2. Navigate to the Project Directory

```bash
cd Strumly
```

## 3. Install Dependencies

Using Bun (recommended):

```bash
bun install
```

Or using npm:

```bash
npm install
```

## 4. Environment Variables

Create a `.env` file in the project root and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

**Important:** Do not commit `.env` files to version control.

## 5. Start the Development Server

Using Bun:

```bash
bun run dev
```

Or using npm:

```bash
npm run dev
```

Open your browser to the local URL provided in the terminal (usually `http://localhost:5173`).

--- 

# 🧪 Development & Testing

## Key Routes to Test

- `/` (Homepage)
- `/search` (Song Discovery)
- `/song/:id` (Song Detail)
- `/upload` (Song Upload)
- `/login` (Login Page)
- `/signup` (Signup Page)
- `/my-music` (User's Music Library)
- `/settings` (Account Settings)

## Authentication Flow Testing

1.  **Signup:** Test user registration.
2.  **Email Confirmation:** (If enabled) Verify email confirmation flow.
3.  **Login:** Test successful login.
4.  **Session Persistence:** Ensure session persists across page refreshes.
5.  **Logout:** Verify user is logged out and guest state is restored.

## Database Testing

Use the Supabase dashboard (Table Editor, SQL Editor) and the application UI to verify:

- Correct data storage and retrieval for songs.
- Functionality of search, filters, and sorting.
- Authentication state management.
- Row Level Security (RLS) policy enforcement.

--- 

# 🧹 Project Cleanup & Version Control

- **Gitignore:** Essential files and directories like `node_modules/`, `.env*`, build outputs (`.output/`, `dist/`), and temporary framework files are ignored.
- **Version Control:** `src/`, `public/`, `supabase/migrations/`, `package.json`, `bun.lock`, `.gitignore`, and `README.md` are tracked. Environment files (`.env`) are excluded.

--- 

# 🛣️ Development Roadmap

## Phase 1 — Foundation

- [x] Strumly branding
- [x] Premium UI
- [x] Homepage & Navigation
- [x] Search & Explore functionality
- [x] Song catalog & details
- [x] Chord information & transposition

## Phase 2 — Backend Integration

- [x] Supabase project setup
- [x] PostgreSQL database schema (`songs` table)
- [x] RLS configuration
- [x] Supabase client integration
- [x] Database migrations for song data

## Phase 3 — Authentication

- [x] Login & Signup pages
- [x] Supabase Auth implementation (email/password)
- [x] Authentication state management & session persistence
- [x] Navigation aware of auth state
- [ ] Finalize email configuration & production SMTP setup

## Phase 4 — User Data

- [ ] Favorites management (table & UI)
- [ ] My Music section (combining Favorites & Uploads)
- [ ] Upload ownership & management
- [ ] User-specific RLS policies

## Phase 5 — Profile & Settings

- [ ] Account settings interface
- [ ] Profile customization
- [ ] User preferences

## Phase 6 — Community Features

- [ ] Community page
- [ ] Public user contributions
- [ ] Social interactions (e.g., comments, likes)

## Phase 7 — Production Readiness

- [ ] Production environment configuration
- [ ] Security & RLS reviews
- [ ] Performance optimization
- [ ] Error monitoring setup
- [ ] Production deployment

--- 

# 🧭 Complete Application Flow

```text
                         STRUMLY
                            │
                            ▼
                     ┌─────────────┐
                     │   Homepage  │
                     └──────┬──────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
          Explore         Search       Top Charts
              │             │             │
              └─────────────┼─────────────┘
                            │
                            ▼
                       Song Detail
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
           Lyrics        Chords       Transpose
                            │
                            ▼
                    Personal Features
                            │
                      Is user logged in?
                       /             \
                     NO               YES
                     │                 │
                     ▼                 ▼
                  Login        
```


---
**<p align="center">Generated by [ReadmeCodeGen](https://www.readmecodegen.com/)</p>**