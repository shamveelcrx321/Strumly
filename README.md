# 🎸 Strumly

> **Every song is closer than you think.**

Strumly is a modern guitar-focused music platform designed for discovering songs, viewing lyrics and guitar chords, transposing chords into different keys, saving songs, uploading music, and eventually building a community-driven music library.

The project combines a premium acoustic-music interface with a Supabase-powered backend, PostgreSQL database, and authentication system.

---

# ✨ Features

## 🎵 Song Discovery

Strumly provides a searchable song catalog with:

- Song title search
- Artist search
- Genre search
- Album search
- Genre filtering
- Difficulty filtering
- Key filtering
- Capo filtering
- Popularity sorting
- Recently added sorting

Users can browse songs without creating an account.

---

## 🎸 Song Details

Each song can contain detailed guitar information including:

- Song title
- Artist
- Album
- Genre
- Difficulty
- Musical key
- Capo position
- Guitar tuning
- Chord count
- Song duration
- Chord information
- Song sections
- Lyrics
- Popularity information
- Cover image
- Custom artwork color

---

## 🔄 Chord Transposition

Strumly allows users to transpose guitar chords into different musical keys.

The purpose is to allow players to adjust a song to a key that is more comfortable for their voice or playing style.

---

## 🔐 Authentication

Strumly uses Supabase Authentication.

Current authentication functionality includes:

- Email/password signup
- Email/password login
- Persistent authentication sessions
- Logout
- Authentication state management
- User name stored through Supabase Auth metadata
- Protected personal routes
- Guest browsing
- Authentication-aware navigation

Google authentication is not currently implemented.

Password reset functionality is planned for a later stage.

---

## 👤 User Features

Authenticated users are intended to have access to personal features such as:

- My Music
- Favorites
- My Uploads
- Account Settings
- Profile controls
- Personal song management

User-specific database functionality is being implemented incrementally.

---

## 📤 Upload System

Strumly includes a song upload interface.

The intended upload architecture allows:

- Guests to browse public songs
- Authenticated users to upload songs
- Users to manage their own uploads
- Users to edit their own uploads
- Users to delete their own uploads

Ownership and user-specific permissions will be handled using Supabase authentication and Row Level Security.

---

# 🎨 Design System

Strumly uses a premium acoustic-music visual identity.

## Visual Direction

- Warm black and charcoal backgrounds
- Cream and beige surfaces
- Muted orange and peach accents
- Warm gold highlights
- Selective glassmorphism
- Soft shadows
- Rounded cards
- Cinematic guitar imagery
- Modern typography
- Warm and cozy atmosphere

The design intentionally avoids:

- Cyberpunk styling
- Neon-heavy interfaces
- Gaming aesthetics
- Excessive futuristic elements

The goal is to create a premium guitar-studio atmosphere.

---

# 🛠️ Technology Stack

## Frontend

- React
- TypeScript
- TanStack Start
- TanStack Router
- Tailwind CSS
- Vite

## Backend

- Supabase
- PostgreSQL
- Supabase Authentication
- Row Level Security

## Development Tools

- Node.js
- Bun
- Git
- GitHub
- Visual Studio Code
- Antigravity

---

# 🏗️ Application Architecture

The current application follows this general architecture:

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

Strumly uses **Supabase PostgreSQL** as its primary application database.

The main database table currently used by the application is:

```text
public.songs
```

---

# 📊 Songs Table

The current `songs` table contains the following fields:

| Column | Type | Description |
|---|---|---|
| id | uuid | Internal unique database identifier |
| slug | text | Application-level song identifier |
| title | text | Song title |
| artist | text | Artist name |
| author | text | Song author when available |
| genre | text | Song genre |
| difficulty | text | Guitar difficulty |
| song_key | text | Original musical key |
| capo | integer | Capo position |
| tuning | text | Guitar tuning |
| chord_count | integer | Number of chords |
| popularity | integer | Popularity value |
| album | text | Album name |
| art_color | text | Artwork/theme color |
| lyrics | text | Song lyrics/chord content |
| cover_image | text | Cover image reference |
| added_at | date | Date the song was added |
| duration | text | Song duration |
| chords | jsonb | Structured chord information |
| sections | jsonb | Structured song-section information |
| created_at | timestamptz | Database creation timestamp |
| updated_at | timestamptz | Last update timestamp |

---

# 🧩 Database Design

The `songs` table separates general song metadata from structured guitar information.

For example:

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

The `chords` and `sections` fields use PostgreSQL `jsonb` so structured song information can be stored without creating a large number of additional relational tables.

---

# 🔒 Database Security

Row Level Security (RLS) is enabled on the `songs` table.

Current access model:

### Public users

Guests are allowed to read public songs.

```text
SELECT
```

is available for anonymous and authenticated users.

### Authenticated users

Authenticated users can create songs.

```text
INSERT
```

is restricted to authenticated users.

Authenticated users can also update and delete songs according to the current database policies.

As user ownership functionality is developed, these policies will be tightened so users can only modify their own uploads.

---

# 🗂️ Database Migrations

Database schema changes are maintained inside:

```text
supabase/migrations/
```

For example:

```text
supabase/
└── migrations/
    └── 20260919_add_song_detail_columns.sql
```

The migration system allows database changes to be version-controlled together with the application source code.

The migration for song details adds fields such as:

```text
duration
chords
sections
```

and creates the appropriate database index for structured chord data.

---

# 🔐 SUPABASE CONFIGURATION

The project uses the Supabase JavaScript client.

The client is located at:

```text
src/lib/supabase.ts
```

The client reads its configuration from environment variables.

Example:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

---

# 🚨 SECURITY RULES

The `.env` file must never be committed to GitHub.

The following types of keys must never be placed in frontend environment variables:

```text
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_SECRET_KEY
Other server-side secret keys
```

Only the Supabase publishable/anonymous client key should be exposed to the frontend.

Server-side secret keys must remain private.

---

# 🔑 AUTHENTICATION ARCHITECTURE

Strumly uses Supabase Auth rather than creating a custom authentication system.

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

---

# 👥 USER ACCESS MODEL

## Guest Users

Guests can access public functionality without logging in.

They can:

- Open the homepage
- Explore songs
- Search songs
- Filter songs
- Sort songs
- Open song details
- View public song content
- Transpose chords where available

---

## Authenticated Users

Authenticated users can access personal functionality such as:

- My Music
- Favorites
- My Uploads
- Account Settings
- Profile controls
- Personal uploads

---

# 🔄 AUTHENTICATION FLOW

```text
User
 │
 ├── Browse Strumly
 │       │
 │       └── Public access
 │
 ├── Click personal feature
 │       │
 │       ▼
 │   Is user logged in?
 │       │
 │     ┌─┴─┐
 │     │   │
 │    YES  NO
 │     │   │
 │     │   ▼
 │     │ Login / Signup
 │     │
 │     ▼
 │ Personal feature
```

---

# 📧 AUTHENTICATION EMAILS

Strumly uses email/password authentication through Supabase.

Email confirmation may be required depending on the current Supabase Auth configuration.

During development, the default Supabase email service has a limited email-sending rate.

For production use, a custom SMTP provider should be configured for reliable authentication email delivery.

---

# 🎼 SONG DATA FLOW

Song information is stored in Supabase rather than relying permanently on frontend mock data.

The general flow is:

```text
User
  │
  ▼
Strumly Song Page
  │
  ▼
Song Service
  │
  ▼
Supabase Client
  │
  ▼
Supabase PostgreSQL
  │
  ▼
songs table
  │
  ▼
Song data returned to application
```

---

# 🔎 SEARCH FLOW

```text
User enters search
        │
        ▼
Search route
        │
        ▼
Catalog / Song Service
        │
        ▼
Supabase song data
        │
        ▼
Search + filtering
        │
        ▼
Matching songs
        │
        ▼
Search results UI
```

---

# 🎸 SONG DETAIL FLOW

```text
User selects a song
        │
        ▼
Song route
        │
        ▼
Song identifier / slug
        │
        ▼
Song Service
        │
        ▼
Supabase
        │
        ▼
Song metadata
+
Chords
+
Sections
+
Lyrics
        │
        ▼
Song Detail Page
```

---

# 🔄 CHORD TRANSPOSITION FLOW

```text
Original song key
        │
        ▼
Read chord data
        │
        ▼
User selects target key
        │
        ▼
Calculate interval
        │
        ▼
Transpose chords
        │
        ▼
Display updated chords
```

The underlying song data does not need to be permanently modified when the user transposes a song.

---

# 📤 UPLOAD ARCHITECTURE

The planned upload flow is:

```text
Authenticated User
        │
        ▼
Upload Page
        │
        ▼
Song Information
        │
        ├── Title
        ├── Artist
        ├── Genre
        ├── Difficulty
        ├── Key
        ├── Capo
        ├── Tuning
        └── Lyrics / Chords
        │
        ▼
Validation
        │
        ▼
Supabase
        │
        ▼
songs table
        │
        ▼
User-owned song
```

Future ownership information will allow the application to determine which songs belong to each authenticated user.

---

# ❤️ FAVORITES ARCHITECTURE

Favorites are planned as a user-specific relationship rather than a field inside the `songs` table.

Planned structure:

```text
users
  │
  └──── favorites
             │
             ├── user_id
             └── song_id
```

This prevents a single global `isFavorited` value from being shared between different users.

Each user will have their own favorite songs.

---

# 👤 MY MUSIC

The planned My Music section will combine user-specific content.

```text
My Music
│
├── Favorites
│     └── Songs saved by the user
│
└── My Uploads
      └── Songs uploaded by the user
```

This functionality will be implemented using Supabase authentication and user-specific database relationships.

---

# 🛡️ ROW LEVEL SECURITY

Supabase Row Level Security will be used to protect user-specific data.

The intended security model is:

```text
Public data
    │
    └── Readable by everyone

User-specific data
    │
    ├── User A → Can access User A data
    ├── User B → Can access User B data
    └── User C → Can access User C data
```

Users should not be able to modify another user's favorites, uploads, or private account data.

---

# 🚀 GETTING STARTED

## 1. Clone the Repository

```bash
git clone <your-github-repository-url>
```

---

## 2. Enter the Project

```bash
cd Strumly
```

---

## 3. Install Dependencies

Using Bun:

```bash
bun install
```

Or using npm:

```bash
npm install
```

---

## 4. Create Environment File

Create:

```text
.env
```

in the project root.

Add:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Do not commit this file.

---

## 5. Start Development Server

Using Bun:

```bash
bun run dev
```

Or using npm:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

---

# 🧪 DEVELOPMENT TESTING

Important routes to test:

```text
/
 /search
 /song/:id
 /upload
 /login
 /signup
 /my-music
 /settings
```

Authentication testing should include:

```text
Signup
  ↓
Email confirmation if enabled
  ↓
Login
  ↓
Session persistence
  ↓
Refresh page
  ↓
Profile state remains
  ↓
Logout
  ↓
Guest state restored
```

---

# 🧪 DATABASE TESTING

Database functionality should be verified through:

- Supabase Table Editor
- Supabase SQL Editor
- Application UI
- Browser console when necessary

Important checks include:

- Songs are stored correctly
- Song details are returned correctly
- Chords are returned correctly
- Sections are returned correctly
- Search works
- Filters work
- Sorting works
- Authentication works
- RLS policies behave correctly

---

# 🧹 PROJECT CLEANUP

Generated or tool-specific folders that are not required by the application are ignored through `.gitignore`.

Examples:

```text
.lovable/
.tanstack/
.output/
.wrangler/
node_modules/
```

These should not be committed unless the project specifically requires them.

---

# 🔒 GITIGNORE

Important ignored files/folders include:

```text
# Dependencies
node_modules/

# Environment variables
.env
.env.local
.env.*.local

# Build output
.output/
dist/
build/

# Generated / temporary framework files
.tanstack/
.wrangler/

# Lovable metadata
.lovable/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*
bun-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/

# Temporary files
*.tmp
*.temp
```

---

# 📦 VERSION CONTROL

GitHub is used for source-code version control.

Important files that should remain tracked include:

```text
src/
public/
supabase/
package.json
bun.lock
.gitignore
README.md
```

Database migration files are intentionally committed:

```text
supabase/migrations/
```

Environment files and secrets are intentionally excluded.

---

# 🛣️ DEVELOPMENT ROADMAP

## Phase 1 — Foundation

- [x] Strumly branding
- [x] Premium UI
- [x] Homepage
- [x] Navigation
- [x] Search
- [x] Explore
- [x] Song catalog
- [x] Filters
- [x] Sorting
- [x] Song detail pages
- [x] Chord information
- [x] Chord transposition

---

## Phase 2 — Backend

- [x] Supabase project
- [x] PostgreSQL database
- [x] Songs table
- [x] RLS configuration
- [x] Supabase client
- [x] Song catalog migration
- [x] Detailed song migration
- [x] Database migration files
- [x] Supabase as primary song-data source

---

## Phase 3 — Authentication

- [x] Login page
- [x] Signup page
- [x] Supabase Auth
- [x] Email/password authentication
- [x] Authentication state
- [x] Session persistence
- [x] Logout
- [x] Authentication-aware navigation
- [x] Protected personal routes
- [ ] Finalize authentication email configuration
- [ ] Production SMTP configuration

---

## Phase 4 — User Data

- [ ] Favorites table
- [ ] Favorite/unfavorite functionality
- [ ] My Music
- [ ] My Favorites
- [ ] My Uploads
- [ ] Upload ownership
- [ ] Edit own uploads
- [ ] Delete own uploads
- [ ] User-specific RLS policies

---

## Phase 5 — Profile

- [ ] Account settings
- [ ] Profile information
- [ ] Profile customization
- [ ] User preferences

---

## Phase 6 — Community

- [ ] Community page
- [ ] Public user uploads
- [ ] User contributions
- [ ] Community discovery
- [ ] Additional social functionality

---

## Phase 7 — Production

- [ ] Production environment configuration
- [ ] Production SMTP
- [ ] Production security review
- [ ] Database security review
- [ ] RLS review
- [ ] Performance optimization
- [ ] Production deployment
- [ ] Error monitoring

---

# 🧭 COMPLETE APPLICATION FLOW

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