# 🎸 Strumly

### Play More. Feel More. 🎶

> **Every song is closer than you think.**

Strumly is a modern, premium music platform designed for guitarists and music lovers to discover **guitar chords, lyrics, song arrangements, and music-related content** in one beautiful experience.

Built with a focus on simplicity, discoverability, and a warm cinematic interface, Strumly aims to make finding and playing songs feel as enjoyable as listening to them.

---

## ✨ Features

### 🔎 Discover Songs

Search for songs, artists, genres, and music-related content through a clean and intuitive search experience.

### 🎸 Guitar Chords & Lyrics

Explore songs with guitar chords and lyrics arranged for an easy playing experience.

### 🔄 Chord Transposition

Transpose chords into different keys to match your preferred playing style and vocal range.

### 🎼 Interactive Guitar

An interactive guitar experience allows users to explore notes and sounds directly through the interface.

### 📤 Upload & Convert

Upload lyrics or song content and prepare them for a structured chord-and-lyrics experience.

### ❤️ My Music

Keep track of your favorite songs, recently played songs, uploads, and personal playlists.

### 👥 Community

Discover arrangements, uploads, and contributions from other music lovers.

### 🎨 Premium Music-Focused UI

Strumly uses a warm, cinematic visual language inspired by:

- Acoustic guitar
- Cozy music studios
- Golden-hour lighting
- Warm gradients
- Glassmorphism
- Minimal premium interfaces

---

## 🖥️ Current Pages

### 🏠 Home

The Strumly landing experience featuring:

- Hero section
- Song search
- Genre discovery
- Popular songs
- Feature highlights
- Interactive guitar
- Community CTA

### 🔍 Explore / Search

The Explore page provides:

- Song search
- Search results
- Genre filtering
- Difficulty filtering
- Key filtering
- Capo filtering
- Content type filtering
- Sorting
- Song cards
- Fixed cinematic background
- Scrollable song results
- Glassmorphism dropdown menus

### 🎵 Song Experience

Planned/ongoing functionality includes:

- Chorded lyrics
- Key transposition
- Capo information
- Tuning
- Chord diagrams
- Auto-scroll
- Font-size controls
- Interactive guitar

---

## 🛠️ Tech Stack

### Frontend

- ⚛️ React
- 🟦 TypeScript
- 🧭 TanStack Router
- 🎨 Tailwind CSS
- 🧩 shadcn/ui
- 🎸 Lucide Icons
- ⚡ Vite / TanStack Start architecture

### Backend

The Strumly backend is being developed separately and will provide the APIs required for:

- Authentication
- Song data
- Lyrics
- Chords
- Upload processing
- Transposition
- Favorites
- User data
- Community features

The frontend is structured to connect with the backend through a dedicated service/API layer.

---

## 🏗️ Project Structure

```text
Strumly/
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │   └── search.jpeg
│   │
│   ├── components/
│   │   └── ui/
│   │
│   ├── routes/
│   │   ├── index.tsx
│   │   ├── search.tsx
│   │   └── ...
│   │
│   ├── services/
│   │   └── catalog.ts
│   │
│   ├── styles.css
│   └── ...
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
