import { supabase } from "@/lib/supabase";
import type {
  SongDetail,
  SongSummary,
  Song,
  Genre,
  Difficulty,
} from "./song-types";

// ─── 32 Mock Songs Database ───────────────────────────────────────────────────

export const mockSongDetails: SongDetail[] = [
  // 1. Until I Found You — Stephen Sanchez
  {
    id: "until-i-found-you",
    title: "Until I Found You",
    artist: "Stephen Sanchez",
    album: "Easy On My Eyes",
    genre: "Indie",
    difficulty: "Beginner",
    key: "A#",
    capo: 3,
    tuning: "Standard",
    duration: "2:57",
    popularity: 92,
    artColor: "from-stone-700 to-amber-900",
    chords: ["G", "Em", "C", "D", "Cm"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Acoustic rhythm with 50s doo-wop feel]", chords: ["G", "Em", "C", "D"] },
          { text: "Oh, Georgia, wrap me up in all your...", chords: ["G", "Em", "C", "D"] },
        ],
      },
      {
        name: "Verse 1",
        lines: [
          { text: "Georgia, wrap me up in all your...", chords: ["G", "Em"] },
          { text: "Love, dirt and hurts around you", chords: ["C", "D"] },
          { text: "I would never fall in love until I found her", chords: ["G", "Em"] },
          { text: "I said, 'I would never fall unless it's you I fall into'", chords: ["C", "D"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "I would never fall in love until I found her", chords: ["G", "Em"] },
          { text: "I said, 'I would never fall unless it's you I fall into'", chords: ["C", "Cm"] },
          { text: "Lost within the darkness, but then I found her", chords: ["G", "Em"] },
          { text: "I found you...", chords: ["C", "D", "G"] },
        ],
      },
      {
        name: "Outro",
        lines: [
          { text: "I would never fall until I found you...", chords: ["G", "Em", "C", "Cm", "G"] },
        ],
      },
    ],
  },

  // 2. Perfect — Ed Sheeran
  {
    id: "perfect",
    title: "Perfect",
    artist: "Ed Sheeran",
    album: "÷ (Divide)",
    genre: "Pop",
    difficulty: "Beginner",
    key: "G",
    capo: 1,
    tuning: "Standard",
    duration: "4:23",
    popularity: 98,
    artColor: "from-amber-800 to-orange-900",
    chords: ["G", "Em", "C", "D"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Fingerpicking in 12/8 time]", chords: ["G"] },
        ],
      },
      {
        name: "Verse 1",
        lines: [
          { text: "I found a love for me", chords: ["G", "Em"] },
          { text: "Darling, just dive right in and follow my lead", chords: ["C", "D"] },
          { text: "Well, I found a girl, beautiful and sweet", chords: ["G", "Em"] },
          { text: "I never knew you were the someone waiting for me", chords: ["C", "D"] },
        ],
      },
      {
        name: "Pre-Chorus",
        lines: [
          { text: "'Cause we were just kids when we fell in love", chords: ["G", "Em"] },
          { text: "Not knowing what it was, I will not give you up this time", chords: ["C", "G", "D"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "Baby, I'm dancing in the dark with you between my arms", chords: ["Em", "C", "G", "D"] },
          { text: "Barefoot on the grass, listening to our favourite song", chords: ["Em", "C", "G", "D"] },
          { text: "When you said you looked a mess, I whispered underneath my breath", chords: ["Em", "C", "G", "D"] },
          { text: "You heard it, darling, you look perfect tonight", chords: ["C", "D", "G"] },
        ],
      },
    ],
  },

  // 3. Die With A Smile — Lady Gaga & Bruno Mars
  {
    id: "die-with-a-smile",
    title: "Die With A Smile",
    artist: "Lady Gaga & Bruno Mars",
    album: "Single",
    genre: "Pop",
    difficulty: "Intermediate",
    key: "Ab",
    capo: 1,
    tuning: "Standard",
    duration: "4:11",
    popularity: 97,
    artColor: "from-rose-900 to-orange-900",
    chords: ["G", "Em", "C", "D", "Bm", "Am"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Warm soul guitar strums]", chords: ["G", "Em", "C", "D"] },
        ],
      },
      {
        name: "Verse 1",
        lines: [
          { text: "I, I just woke up from a dream", chords: ["G", "Em"] },
          { text: "Where you and I had to say goodbye", chords: ["C", "D"] },
          { text: "And I don't know what it all means", chords: ["G", "Em"] },
          { text: "But since I survived, I realized", chords: ["C", "D"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "If the world was ending, I'd wanna be next to you", chords: ["G", "Bm", "C", "D"] },
          { text: "If the party was over and our time on Earth was through", chords: ["G", "Bm", "C", "D"] },
          { text: "I'd wanna hold you just for a while and die with a smile", chords: ["Em", "D", "C", "Cm"] },
          { text: "If the world was ending, I'd wanna be next to you", chords: ["G"] },
        ],
      },
    ],
  },

  // 4. A Sky Full of Stars — Coldplay
  {
    id: "a-sky-full-of-stars",
    title: "A Sky Full of Stars",
    artist: "Coldplay",
    album: "Ghost Stories",
    genre: "Pop",
    difficulty: "Intermediate",
    key: "E",
    capo: 0,
    tuning: "Standard",
    duration: "4:28",
    popularity: 91,
    artColor: "from-indigo-900 to-purple-900",
    chords: ["Ebm", "B", "Gb", "Db", "Abm"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Piano driven rhythm chords]", chords: ["Ebm", "B", "Gb", "Db"] },
        ],
      },
      {
        name: "Verse 1",
        lines: [
          { text: "'Cause you're a sky, 'cause you're a sky full of stars", chords: ["Ebm", "B", "Gb", "Db"] },
          { text: "I'm gonna give you my heart", chords: ["Ebm", "B", "Gb", "Db"] },
          { text: "'Cause you're a sky, 'cause you're a sky full of stars", chords: ["Ebm", "B", "Gb", "Db"] },
          { text: "'Cause you light up the path", chords: ["Ebm", "B", "Gb", "Db"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "I don't care, go on and tear me apart", chords: ["Ebm", "B", "Gb", "Db"] },
          { text: "I don't care if you do, ooh", chords: ["Ebm", "B", "Gb", "Db"] },
          { text: "'Cause in a sky, 'cause in a sky full of stars", chords: ["Abm", "B", "Db"] },
          { text: "I think I saw you...", chords: ["Gb"] },
        ],
      },
    ],
  },

  // 5. Creep — Radiohead
  {
    id: "creep",
    title: "Creep",
    artist: "Radiohead",
    album: "Pablo Honey",
    genre: "Alternative",
    difficulty: "Beginner",
    key: "G",
    capo: 0,
    tuning: "Standard",
    duration: "3:58",
    popularity: 88,
    artColor: "from-slate-800 to-zinc-900",
    chords: ["G", "B", "C", "Cm"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Arpeggiated clean guitar progression]", chords: ["G", "B", "C", "Cm"] },
        ],
      },
      {
        name: "Verse 1",
        lines: [
          { text: "When you were here before, couldn't look you in the eye", chords: ["G", "B"] },
          { text: "You're just like an angel, your skin makes me cry", chords: ["C", "Cm"] },
          { text: "You float like a feather in a beautiful world", chords: ["G", "B"] },
          { text: "I wish I was special, you're so very special", chords: ["C", "Cm"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "But I'm a creep, I'm a weirdo", chords: ["G", "B"] },
          { text: "What the hell am I doing here? I don't belong here", chords: ["C", "Cm"] },
        ],
      },
    ],
  },

  // 6. Tu Hai Kahan — AUR
  {
    id: "tu-hai-kahan",
    title: "Tu Hai Kahan",
    artist: "AUR",
    album: "Single",
    genre: "Indie",
    difficulty: "Beginner",
    key: "D",
    capo: 2,
    tuning: "Standard",
    duration: "4:07",
    popularity: 95,
    artColor: "from-teal-800 to-emerald-900",
    chords: ["C", "Em", "F", "G", "Am"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Mellow acoustic acoustic pluck]", chords: ["C", "Em", "F", "G"] },
        ],
      },
      {
        name: "Verse 1",
        lines: [
          { text: "Behka main behka woh baatein saari", chords: ["C", "Em"] },
          { text: "Rakh di jo tune nigaahein hum pe", chords: ["F", "G"] },
          { text: "Bolo na bolo na kaise karun main bayan", chords: ["Am", "Em", "F", "G"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "Tu hai kahan, meri duaon mein tu hai kahan", chords: ["C", "Em", "F", "G"] },
          { text: "Dekho to aasman rooth gaya hai yahan", chords: ["Am", "Em", "F", "G"] },
        ],
      },
    ],
  },

  // 7. Kesariya — Arijit Singh
  {
    id: "kesariya",
    title: "Kesariya",
    artist: "Arijit Singh",
    album: "Brahmāstra",
    genre: "Bollywood",
    difficulty: "Intermediate",
    key: "C",
    capo: 0,
    tuning: "Standard",
    duration: "4:28",
    popularity: 96,
    artColor: "from-yellow-800 to-amber-900",
    chords: ["C", "F", "G", "Am", "Dm"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Melodic acoustic progression]", chords: ["C", "F", "G", "Am"] },
        ],
      },
      {
        name: "Verse 1",
        lines: [
          { text: "Mujhko itna bataye koi, kaise tujhse dil na lagaye koi", chords: ["C", "F", "G", "Am"] },
          { text: "Rabba ne tujhko banane mein kardi hai husn ki khaali tijoriyan", chords: ["C", "F", "G"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "Kesariya tera ishq hai piya, rang jaaun jo main haath lagaun", chords: ["C", "Am", "F", "G"] },
          { text: "Din beete saara teri fikr mein, rain saari teri khair manaun", chords: ["C", "Am", "F", "G"] },
        ],
      },
    ],
  },

  // 8. Tum Hi Ho — Arijit Singh
  {
    id: "tum-hi-ho",
    title: "Tum Hi Ho",
    artist: "Arijit Singh",
    album: "Aashiqui 2",
    genre: "Bollywood",
    difficulty: "Beginner",
    key: "Db",
    capo: 1,
    tuning: "Standard",
    duration: "4:22",
    popularity: 94,
    artColor: "from-pink-900 to-rose-900",
    chords: ["Em", "Am", "D", "B", "C"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Soulful minor arpeggio]", chords: ["Em", "Am", "D", "Em"] },
        ],
      },
      {
        name: "Verse 1",
        lines: [
          { text: "Hum tere bin ab reh nahi sakte, tere bina kya wajood mera", chords: ["Em", "Am", "D", "Em"] },
          { text: "Tujhse juda agar ho jaayenge, toh khud se hi ho jaayenge judaa", chords: ["Em", "Am", "D", "Em"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "Kyunki tum hi ho, ab tum hi ho, zindagi ab tum hi ho", chords: ["Em", "Am", "D", "B", "C"] },
          { text: "Chain bhi, mera dard bhi, meri aashiqui ab tum hi ho", chords: ["Am", "D", "Em"] },
        ],
      },
    ],
  },

  // 9. Believer — Imagine Dragons
  {
    id: "believer",
    title: "Believer",
    artist: "Imagine Dragons",
    album: "Evolve",
    genre: "Rock",
    difficulty: "Intermediate",
    key: "E",
    capo: 0,
    tuning: "Standard",
    duration: "3:24",
    popularity: 90,
    artColor: "from-red-900 to-orange-900",
    chords: ["Am", "F", "E", "G"],
    sections: [
      {
        name: "Verse 1",
        lines: [
          { text: "First things first, I'ma say all the words inside my head", chords: ["Am"] },
          { text: "I'm fired up and tired of the way that things have been, oh-ooh", chords: ["F", "E"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "Pain! You made me a, you made me a believer, believer", chords: ["Am", "F", "E"] },
          { text: "Pain! You break me down, you build me up, believer, believer", chords: ["Am", "F", "E"] },
        ],
      },
    ],
  },

  // 10. Let Her Go — Passenger
  {
    id: "let-her-go",
    title: "Let Her Go",
    artist: "Passenger",
    album: "All the Little Lights",
    genre: "Acoustic",
    difficulty: "Beginner",
    key: "G",
    capo: 7,
    tuning: "Standard",
    duration: "4:12",
    popularity: 89,
    artColor: "from-amber-700 to-stone-800",
    chords: ["G", "D", "Em", "C", "Am"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Signature acoustic picking pattern with Capo 7]", chords: ["C", "D", "Em", "C", "D"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "Well you only need the light when it's burning low", chords: ["C", "G", "D", "Em"] },
          { text: "Only miss the sun when it starts to snow", chords: ["C", "G", "D"] },
          { text: "Only know you love her when you let her go", chords: ["C", "G", "D", "Em", "C", "D", "G"] },
        ],
      },
    ],
  },

  // 11. Yellow — Coldplay
  {
    id: "yellow",
    title: "Yellow",
    artist: "Coldplay",
    album: "Parachutes",
    genre: "Pop",
    difficulty: "Beginner",
    key: "B",
    capo: 0,
    tuning: "Standard",
    duration: "4:29",
    popularity: 93,
    artColor: "from-yellow-700 to-amber-800",
    chords: ["B", "F#", "E", "G#m"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Acoustic strums with open ringing strings]", chords: ["B", "F#", "E"] },
        ],
      },
      {
        name: "Verse 1",
        lines: [
          { text: "Look at the stars, look how they shine for you", chords: ["B", "F#"] },
          { text: "And everything you do, yeah they were all yellow", chords: ["E", "B"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "Your skin, oh yeah, your skin and bones", chords: ["E", "G#m", "F#"] },
          { text: "Turn into something beautiful", chords: ["E", "G#m", "F#"] },
          { text: "Do you know you know I love you so?", chords: ["E", "B"] },
        ],
      },
    ],
  },

  // 12. Fix You — Coldplay
  {
    id: "fix-you",
    title: "Fix You",
    artist: "Coldplay",
    album: "X&Y",
    genre: "Rock",
    difficulty: "Intermediate",
    key: "Eb",
    capo: 3,
    tuning: "Standard",
    duration: "4:55",
    popularity: 91,
    artColor: "from-sky-900 to-blue-900",
    chords: ["C", "Em", "Am", "G", "F"],
    sections: [
      {
        name: "Verse 1",
        lines: [
          { text: "When you try your best, but you don't succeed", chords: ["C", "Em", "Am", "G"] },
          { text: "When you get what you want, but not what you need", chords: ["C", "Em", "Am", "G"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "Lights will guide you home", chords: ["F", "C", "G"] },
          { text: "And ignite your bones, and I will try to fix you", chords: ["F", "C", "G", "C"] },
        ],
      },
    ],
  },

  // 13. Enna Sona — Arijit Singh
  {
    id: "enna-sona",
    title: "Enna Sona",
    artist: "Arijit Singh",
    album: "OK Jaanu",
    genre: "Bollywood",
    difficulty: "Intermediate",
    key: "G",
    capo: 2,
    tuning: "Standard",
    duration: "3:33",
    popularity: 87,
    artColor: "from-orange-800 to-red-900",
    chords: ["Em", "D", "C", "G", "Am"],
    sections: [
      {
        name: "Chorus",
        lines: [
          { text: "Enna sona kyun rab ne banaya", chords: ["Em", "D", "C", "G"] },
          { text: "Aavan javan te main yaara nu manavan", chords: ["Am", "D", "Em"] },
          { text: "Kol hove te sekh lagda ae, door jave te dil jalda ae", chords: ["Em", "D", "C", "G"] },
        ],
      },
    ],
  },

  // 14. Nenjukkul Naadaina — Vijay Srinivasan
  {
    id: "nenjukkul-naadaina",
    title: "Nenjukkul Naadaina",
    artist: "Vijay Srinivasan",
    album: "Southern Echoes",
    genre: "Malayalam",
    difficulty: "Intermediate",
    key: "G",
    capo: 0,
    tuning: "Standard",
    duration: "4:02",
    popularity: 85,
    artColor: "from-green-800 to-teal-900",
    chords: ["G", "Em", "C", "D", "Bm"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Warm classical south Indian acoustic guitar]", chords: ["G", "Em", "C", "D"] },
        ],
      },
      {
        name: "Verse 1",
        lines: [
          { text: "Nenjukkul naadaina kanavugal thondrum neram", chords: ["G", "Em"] },
          { text: "Kaatrodu pesidum varigalil mounam thedum", chords: ["C", "D"] },
        ],
      },
    ],
  },

  // 15. Raasaathi Sithiramam — K. J. Yesudas
  {
    id: "raasaathi-sithiramam",
    title: "Raasaathi Sithiramam",
    artist: "K. J. Yesudas",
    album: "Classic Melodies",
    genre: "Classical",
    difficulty: "Advanced",
    key: "Am",
    capo: 0,
    tuning: "Standard",
    duration: "4:45",
    popularity: 86,
    artColor: "from-violet-900 to-purple-900",
    chords: ["Am", "Dm", "E", "G", "F"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Raga based acoustic arrangement]", chords: ["Am", "Dm", "E"] },
        ],
      },
      {
        name: "Verse",
        lines: [
          { text: "Raasaathi sithiramam kanden en nenjil", chords: ["Am", "Dm", "E", "Am"] },
          { text: "Kavithai pol virindha kaalam idhuvo", chords: ["F", "G", "Am"] },
        ],
      },
    ],
  },

  // 16. Guruvayurappan — K. J. Yesudas
  {
    id: "guruvayurappan",
    title: "Guruvayurappan",
    artist: "K. J. Yesudas",
    album: "Devotional Strains",
    genre: "Classical",
    difficulty: "Advanced",
    key: "C",
    capo: 0,
    tuning: "Standard",
    duration: "5:12",
    popularity: 82,
    artColor: "from-amber-900 to-yellow-900",
    chords: ["C", "F", "G", "Am", "Em"],
    sections: [
      {
        name: "Pallavi",
        lines: [
          { text: "Guruvayurappa ninte thiruvadi thozhuthen", chords: ["C", "F", "G", "C"] },
          { text: "Aananda roopanaya deva sharanam", chords: ["Am", "Em", "F", "G", "C"] },
        ],
      },
    ],
  },

  // 17. Untravel — T. K. Prem
  {
    id: "untravel",
    title: "Untravel",
    artist: "T. K. Prem",
    album: "Solitude",
    genre: "Indie",
    difficulty: "Advanced",
    key: "Am",
    capo: 0,
    tuning: "Standard",
    duration: "3:48",
    popularity: 88,
    artColor: "from-slate-900 to-zinc-800",
    chords: ["Am", "F", "C", "G", "Dm"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Fingerpicked fast indie progression]", chords: ["Am", "F", "C", "G"] },
        ],
      },
      {
        name: "Verse 1",
        lines: [
          { text: "Untravel the roads that lead into the grey", chords: ["Am", "F"] },
          { text: "Leave every shadowed memory where it lay", chords: ["C", "G"] },
        ],
      },
    ],
  },

  // 18. Lin — Tosca
  {
    id: "lin",
    title: "Lin",
    artist: "Tosca",
    album: "Acoustic Lounge",
    genre: "Indie",
    difficulty: "Intermediate",
    key: "Dm",
    capo: 0,
    tuning: "Standard",
    duration: "4:05",
    popularity: 81,
    artColor: "from-teal-900 to-slate-900",
    chords: ["Dm", "Bb", "F", "C"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Ambient guitar with warm reverb]", chords: ["Dm", "Bb", "F", "C"] },
        ],
      },
      {
        name: "Theme",
        lines: [
          { text: "Whispers across the shoreline, fading into night", chords: ["Dm", "Bb"] },
          { text: "Echoes of timeless strings under glowing light", chords: ["F", "C"] },
        ],
      },
    ],
  },

  // 19. Sager — Gurang
  {
    id: "sager",
    title: "Sager",
    artist: "Gurang",
    album: "Wanderer",
    genre: "Acoustic",
    difficulty: "Beginner",
    key: "C",
    capo: 0,
    tuning: "Standard",
    duration: "3:15",
    popularity: 79,
    artColor: "from-stone-800 to-amber-900",
    chords: ["C", "G", "Am", "F"],
    sections: [
      {
        name: "Verse 1",
        lines: [
          { text: "Through quiet mountain paths where morning sunlight gleams", chords: ["C", "G"] },
          { text: "We trace the peaceful rhythm of forgotten dreams", chords: ["Am", "F"] },
        ],
      },
    ],
  },

  // 20. Gurang — Lisa
  {
    id: "gurang",
    title: "Gurang",
    artist: "Lisa",
    album: "Crimson Flower",
    genre: "Anime",
    difficulty: "Intermediate",
    key: "D",
    capo: 0,
    tuning: "Standard",
    duration: "3:56",
    popularity: 90,
    artColor: "from-rose-800 to-pink-900",
    chords: ["D", "A", "Bm", "G", "Em"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Energetic anime acoustic intro]", chords: ["D", "A", "Bm", "G"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "Tsuyoku nareru riyuu wo shitta, boku wo tsurete susume", chords: ["D", "A", "Bm", "G"] },
          { text: "Dorodarake no soumatou ni yowareru koto naku", chords: ["Em", "A", "D"] },
        ],
      },
    ],
  },

  // 21. Blue Bird — Ikimono-gakari
  {
    id: "blue-bird",
    title: "Blue Bird",
    artist: "Ikimono-gakari",
    album: "My Song Your Song",
    genre: "Anime",
    difficulty: "Intermediate",
    key: "A",
    capo: 0,
    tuning: "Standard",
    duration: "3:36",
    popularity: 87,
    artColor: "from-cyan-800 to-sky-900",
    chords: ["A", "E", "F#m", "D", "Bm"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Upbeat harmonic strums]", chords: ["A", "E", "F#m", "D"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "Habataitara modoranai to itte, mezashita no wa aoi aoi ano sora", chords: ["A", "E", "F#m", "D"] },
          { text: "Kanashimi wa mada oboerezu, setsunasa wa ima tsukami hajimeta", chords: ["Bm", "E", "A"] },
        ],
      },
    ],
  },

  // 22. Photograph — Ed Sheeran
  {
    id: "photograph",
    title: "Photograph",
    artist: "Ed Sheeran",
    album: "x (Multiply)",
    genre: "Pop",
    difficulty: "Beginner",
    key: "E",
    capo: 0,
    tuning: "Standard",
    duration: "4:19",
    popularity: 92,
    artColor: "from-amber-700 to-orange-800",
    chords: ["E", "C#m", "B", "A"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Gentle open string acoustic arpeggio]", chords: ["E", "C#m", "B", "A"] },
        ],
      },
      {
        name: "Verse 1",
        lines: [
          { text: "Loving can hurt, loving can hurt sometimes", chords: ["E", "C#m"] },
          { text: "But it's the only thing that I know", chords: ["B", "A"] },
          { text: "When it gets hard, you know it can get hard sometimes", chords: ["E", "C#m"] },
          { text: "It is the only thing that makes us feel alive", chords: ["B", "A"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "So you can keep me inside the pocket of your ripped jeans", chords: ["E", "B", "C#m", "A"] },
          { text: "Holding me closer 'til our eyes meet, you won't ever be alone", chords: ["E", "B", "C#m", "A"] },
        ],
      },
    ],
  },

  // 23. Hotel California — Eagles
  {
    id: "hotel-california",
    title: "Hotel California",
    artist: "Eagles",
    album: "Hotel California",
    genre: "Rock",
    difficulty: "Advanced",
    key: "Am",
    capo: 0,
    tuning: "Standard",
    duration: "6:30",
    popularity: 94,
    artColor: "from-stone-700 to-amber-800",
    chords: ["Am", "E7", "G", "D", "F", "C", "Dm"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Iconic 12-string acoustic arpeggios with fingerstyle accents]", chords: ["Am", "E7", "G", "D", "F", "C", "Dm", "E7"] },
        ],
      },
      {
        name: "Verse 1",
        lines: [
          { text: "On a dark desert highway, cool wind in my hair", chords: ["Am", "E7"] },
          { text: "Warm smell of colitas, rising up through the air", chords: ["G", "D"] },
          { text: "Up ahead in the distance, I saw a shimmering light", chords: ["F", "C"] },
          { text: "My head grew heavy and my sight grew dim, I had to stop for the night", chords: ["Dm", "E7"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "Welcome to the Hotel California", chords: ["F", "C"] },
          { text: "Such a lovely place (such a lovely place), such a lovely face", chords: ["E7", "Am"] },
          { text: "Plenty of room at the Hotel California", chords: ["F", "C"] },
          { text: "Any time of year (any time of year), you can find it here", chords: ["Dm", "E7"] },
        ],
      },
    ],
  },

  // 24. Kaun Tujhe — Palak Muchhal
  {
    id: "kaun-tujhe",
    title: "Kaun Tujhe",
    artist: "Palak Muchhal",
    album: "M.S. Dhoni",
    genre: "Bollywood",
    difficulty: "Beginner",
    key: "E",
    capo: 0,
    tuning: "Standard",
    duration: "4:01",
    popularity: 84,
    artColor: "from-pink-800 to-rose-900",
    chords: ["E", "B", "C#m", "A", "F#m"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Warm melodious picking]", chords: ["E", "B", "C#m", "A"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "Kaun tujhe yoon pyar karega, jaise main karti hoon", chords: ["E", "B", "C#m", "A"] },
          { text: "Meri nazar ka safar, tujhpe hi aake ruke", chords: ["F#m", "B", "E"] },
        ],
      },
    ],
  },

  // 25. Channa Mereya — Arijit Singh
  {
    id: "channa-mereya",
    title: "Channa Mereya",
    artist: "Arijit Singh",
    album: "Ae Dil Hai Mushkil",
    genre: "Bollywood",
    difficulty: "Intermediate",
    key: "G",
    capo: 3,
    tuning: "Standard",
    duration: "4:49",
    popularity: 93,
    artColor: "from-orange-700 to-amber-800",
    chords: ["Em", "C", "D", "G", "Am"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Heartfelt guitar strumming rhythm]", chords: ["Em", "C", "D", "G"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "Accha chalta hoon duaon mein yaad rakhna", chords: ["Em", "C", "D", "G"] },
          { text: "Mere zikr ka zubaan pe swaad rakhna", chords: ["Em", "C", "D", "G"] },
          { text: "Dil ke sandookon mein mere acche kaam rakhna", chords: ["Am", "D", "Em"] },
          { text: "O channa mereya mereya, o channa mereya mereya", chords: ["C", "D", "G"] },
        ],
      },
    ],
  },

  // 26. Blinding Lights — The Weeknd
  {
    id: "blinding-lights",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    genre: "Pop",
    difficulty: "Intermediate",
    key: "F",
    capo: 3,
    tuning: "Standard",
    duration: "3:20",
    popularity: 97,
    artColor: "from-red-800 to-pink-900",
    chords: ["Dm", "Am", "C", "G"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Driving acoustic synth-bass simulation]", chords: ["Dm", "Am", "C", "G"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "I said, ooh, I'm blinded by the lights", chords: ["Dm", "Am", "C", "G"] },
          { text: "No, I can't sleep until I feel your touch", chords: ["Dm", "Am", "C", "G"] },
          { text: "I said, ooh, I'm drowning in the night", chords: ["Dm", "Am", "C", "G"] },
          { text: "Oh, when I'm like this, you're the one I trust", chords: ["Dm", "Am", "C", "G"] },
        ],
      },
    ],
  },

  // 27. Numb — Linkin Park
  {
    id: "numb",
    title: "Numb",
    artist: "Linkin Park",
    album: "Meteora",
    genre: "Rock",
    difficulty: "Intermediate",
    key: "Em",
    capo: 0,
    tuning: "Standard",
    duration: "3:07",
    popularity: 96,
    artColor: "from-slate-700 to-zinc-900",
    chords: ["Em", "C", "G", "D", "Am"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Signature synth lead translated to acoustic picking]", chords: ["Em", "C", "G", "D"] },
        ],
      },
      {
        name: "Verse 1",
        lines: [
          { text: "I'm tired of being what you want me to be", chords: ["Em", "C"] },
          { text: "Feeling so faithless, lost under the surface", chords: ["G", "D"] },
          { text: "Don't know what you're expecting of me", chords: ["Em", "C"] },
          { text: "Put under the pressure of walking in your shoes", chords: ["G", "D"] },
        ],
      },
      {
        name: "Pre-Chorus",
        lines: [
          { text: "(Caught in the undertow, just caught in the undertow)", chords: ["C", "D"] },
          { text: "Every step that I take is another mistake to you", chords: ["Em", "D"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "I've become so numb, I can't feel you there", chords: ["Em", "C", "G", "D"] },
          { text: "Become so tired, so much more aware", chords: ["Em", "C", "G", "D"] },
          { text: "I'm becoming this, all I want to do", chords: ["Em", "C", "G", "D"] },
          { text: "Is be more like me and be less like you", chords: ["Em", "C", "G", "D"] },
        ],
      },
      {
        name: "Bridge",
        lines: [
          { text: "And I know I may end up failing too", chords: ["C", "D", "Em"] },
          { text: "But I know you were just like me with someone disappointed in you", chords: ["C", "D", "B"] },
        ],
      },
    ],
  },

  // 28. In the End — Linkin Park
  {
    id: "in-the-end",
    title: "In the End",
    artist: "Linkin Park",
    album: "Hybrid Theory",
    genre: "Rock",
    difficulty: "Beginner",
    key: "Cm",
    capo: 0,
    tuning: "Standard",
    duration: "3:36",
    popularity: 97,
    artColor: "from-stone-700 to-slate-900",
    chords: ["Em", "D", "C", "Am", "B"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Famous piano melody adapted for acoustic arpeggio]", chords: ["Em", "D", "C", "D"] },
        ],
      },
      {
        name: "Verse 1",
        lines: [
          { text: "It starts with one thing, I don't know why", chords: ["Em", "D"] },
          { text: "It doesn't even matter how hard you try", chords: ["C", "D"] },
          { text: "Keep that in mind, I designed this rhyme to explain in due time", chords: ["Em", "D"] },
          { text: "All I know: time is a valuable thing", chords: ["C", "D"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "I tried so hard and got so far", chords: ["Em", "G", "D", "C"] },
          { text: "But in the end, it doesn't even matter", chords: ["Em", "G", "D", "C"] },
          { text: "I had to fall to lose it all", chords: ["Em", "G", "D", "C"] },
          { text: "But in the end, it doesn't even matter", chords: ["Em", "G", "D", "C"] },
        ],
      },
    ],
  },

  // 29. What I've Done — Linkin Park
  {
    id: "what-ive-done",
    title: "What I've Done",
    artist: "Linkin Park",
    album: "Minutes to Midnight",
    genre: "Rock",
    difficulty: "Intermediate",
    key: "Gm",
    capo: 0,
    tuning: "Standard",
    duration: "3:25",
    popularity: 91,
    artColor: "from-zinc-700 to-stone-900",
    chords: ["Gm", "Bb", "F", "C", "Eb"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Driving piano motif over heavy acoustic strums]", chords: ["Gm", "Bb", "F", "C"] },
        ],
      },
      {
        name: "Verse 1",
        lines: [
          { text: "In this farewell, there's no blood, there's no alibi", chords: ["Gm", "Bb", "F", "C"] },
          { text: "'Cause I've drawn regret from the truth of a thousand lies", chords: ["Gm", "Bb", "F", "C"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "So let mercy come and wash away", chords: ["Gm", "Bb", "F", "C"] },
          { text: "What I've done, I'll face myself to cross out what I've become", chords: ["Gm", "Bb", "F", "C"] },
          { text: "Erase myself and let go of what I've done", chords: ["Eb", "F", "Gm"] },
        ],
      },
    ],
  },

  // 30. Somewhere I Belong — Linkin Park
  {
    id: "somewhere-i-belong",
    title: "Somewhere I Belong",
    artist: "Linkin Park",
    album: "Meteora",
    genre: "Rock",
    difficulty: "Intermediate",
    key: "Am",
    capo: 0,
    tuning: "Standard",
    duration: "3:33",
    popularity: 90,
    artColor: "from-neutral-700 to-slate-900",
    chords: ["Am", "C", "G", "F", "Em"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Reversed sample acoustics & melodic intro]", chords: ["Am", "C", "G", "F"] },
        ],
      },
      {
        name: "Verse 1",
        lines: [
          { text: "When this began, I had nothing to say", chords: ["Am", "C"] },
          { text: "And I'd get lost in the nothingness inside of me", chords: ["G", "F"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "I wanna heal, I wanna feel what I thought was never real", chords: ["Am", "C", "G", "F"] },
          { text: "I wanna let go of the pain I've felt so long", chords: ["Am", "C", "G", "F"] },
          { text: "I wanna find something I wanted all along, somewhere I belong", chords: ["Am", "C", "G", "F"] },
        ],
      },
    ],
  },

  // 31. Breaking the Habit — Linkin Park
  {
    id: "breaking-the-habit",
    title: "Breaking the Habit",
    artist: "Linkin Park",
    album: "Meteora",
    genre: "Rock",
    difficulty: "Advanced",
    key: "Dm",
    capo: 0,
    tuning: "Standard",
    duration: "3:16",
    popularity: 89,
    artColor: "from-slate-800 to-zinc-900",
    chords: ["Dm", "Bb", "C", "Am", "F"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Strings and acoustic arpeggios]", chords: ["Dm", "Bb", "C", "Am"] },
        ],
      },
      {
        name: "Verse 1",
        lines: [
          { text: "Memories consume like opening the wound", chords: ["Dm", "Bb"] },
          { text: "I'm picking me apart again, you all assume", chords: ["C", "Am"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "I don't know what's worth fighting for", chords: ["Dm", "Bb"] },
          { text: "Or why I have to scream", chords: ["C", "Am"] },
          { text: "I don't know how I got this way", chords: ["Dm", "Bb"] },
          { text: "I'll never be alright, so I'm breaking the habit tonight", chords: ["C", "Am", "Dm"] },
        ],
      },
    ],
  },

  // 32. Faint — Linkin Park
  {
    id: "faint",
    title: "Faint",
    artist: "Linkin Park",
    album: "Meteora",
    genre: "Rock",
    difficulty: "Intermediate",
    key: "Fm",
    capo: 0,
    tuning: "Standard",
    duration: "2:42",
    popularity: 88,
    artColor: "from-zinc-800 to-neutral-900",
    chords: ["Em", "G", "C", "D", "Am"],
    sections: [
      {
        name: "Intro",
        lines: [
          { text: "[Rapid acoustic power strums]", chords: ["Em", "G", "C", "D"] },
        ],
      },
      {
        name: "Chorus",
        lines: [
          { text: "I am a little bit of loneliness, a little bit of disregard", chords: ["Em", "G"] },
          { text: "Handful of complaints but I can't help the fact", chords: ["C", "D"] },
          { text: "That everyone can see these scars", chords: ["Em", "G"] },
          { text: "I am what I want you to want, more I am", chords: ["C", "D"] },
          { text: "Don't turn your back on me, I won't be ignored!", chords: ["Em", "C", "D"] },
        ],
      },
    ],
  },
];

import { songStorage } from "./song-storage";

export interface CreateSongInput {
  title: string;
  artist: string;
  author: string;
  genre: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  key?: string;
  capo?: number;
  tuning?: string;
  lyricsText: string;
}

export interface SongService {
  getSongs(forceRefresh?: boolean): Promise<Song[]>;
  getSong(id: string): Promise<SongDetail | null>;
  getRelatedSongs(currentSong: SongDetail, limit?: number): Promise<SongSummary[]>;
  getAllSongs(): Promise<SongSummary[]>;
  createSong(input: CreateSongInput): Promise<string>;
}

function parseLyricsIntoSections(lyricsText: string): {
  sections: SongDetail["sections"];
  chords: string[];
} {
  const lines = lyricsText.split("\n");
  const sections: SongDetail["sections"] = [];
  const foundChords = new Set<string>();

  let currentSectionName = "Lyrics";
  let currentLines: SongDetail["sections"][0]["lines"] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    // Check if line is a section heading like [Verse 1] or [Chorus]
    const headingMatch = trimmed.match(/^\[([a-zA-Z0-9\s-_]+)\]$/);
    if (headingMatch) {
      if (currentLines.length > 0) {
        sections.push({ name: currentSectionName, lines: currentLines });
        currentLines = [];
      }
      currentSectionName = headingMatch[1] || "Section";
      continue;
    }

    if (!trimmed) {
      continue;
    }

    // Check for inline bracketed chords like [C] or [Am]
    const lineChords: string[] = [];
    const chordMatches = trimmed.match(/\[([A-G][#b]?[a-zA-Z0-9/]*)\]/g);
    if (chordMatches) {
      for (const m of chordMatches) {
        const chordName = m.slice(1, -1);
        lineChords.push(chordName);
        foundChords.add(chordName);
      }
    }

    // Clean text by removing the inline chord markers for clean lyric rendering
    const cleanText = trimmed
      .replace(/\[([A-G][#b]?[a-zA-Z0-9/]*)\]\s*/g, "")
      .trim();

    currentLines.push({
      text: cleanText || trimmed,
      chords: lineChords.length > 0 ? lineChords : undefined,
    });
  }

  if (currentLines.length > 0 || sections.length === 0) {
    sections.push({
      name: currentSectionName,
      lines:
        currentLines.length > 0
          ? currentLines
          : [{ text: lyricsText.trim() }],
    });
  }

  return { sections, chords: Array.from(foundChords) };
}

class SupabaseSongService implements SongService {
  private cachedSongs: Song[] | null = null;

  /**
   * Fetches main catalog songs from Supabase PostgreSQL (public.songs).
   * Maps snake_case database schema to frontend Song model.
   */
  async getSongs(forceRefresh = false): Promise<Song[]> {
    if (!forceRefresh && this.cachedSongs) {
      return this.cachedSongs;
    }

    try {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .order("title", { ascending: true });

      if (error) {
        console.error("Failed to fetch songs from Supabase:", error.message);
        if (this.cachedSongs) return this.cachedSongs;
        return this.getFallbackCatalogSongs();
      }

      if (!data || data.length === 0) {
        return this.getFallbackCatalogSongs();
      }

      const mapped: Song[] = data.map((row) => ({
        id: row.slug,
        title: row.title ?? "",
        artist: row.artist ?? "",
        genre: (row.genre as Genre) || "Pop",
        key: row.song_key ?? "C",
        capo: typeof row.capo === "number" ? row.capo : 0,
        difficulty: (row.difficulty as Difficulty) || "Intermediate",
        chordCount: typeof row.chord_count === "number" ? row.chord_count : 0,
        popularity: typeof row.popularity === "number" ? row.popularity : 0,
        addedAt:
          row.added_at ||
          (row.created_at
            ? row.created_at.split("T")[0]
            : new Date().toISOString().split("T")[0]),
        isFavorited: false,
        album: row.album || undefined,
        artColor: row.art_color || "from-stone-700 to-amber-900",
      }));

      this.cachedSongs = mapped;
      return mapped;
    } catch (err) {
      console.error("Unexpected error fetching songs from Supabase:", err);
      if (this.cachedSongs) return this.cachedSongs;
      return this.getFallbackCatalogSongs();
    }
  }

  private getFallbackCatalogSongs(): Song[] {
    return mockSongDetails.map((s) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      genre: (s.genre as Genre) || "Pop",
      key: s.key,
      capo: s.capo,
      difficulty: s.difficulty,
      chordCount: s.chords.length,
      popularity: s.popularity ?? 85,
      addedAt: "2024-01-01",
      isFavorited: false,
      album: s.album,
      artColor: s.artColor || "from-stone-700 to-amber-900",
    }));
  }

  /**
   * Retrieves song detail by slug or ID.
   * Supabase public.songs provides metadata; mockSongDetails serves as the temporary
   * fallback for structured chord arrays, lyric line alignments, and section data.
   */
  async getSong(id: string): Promise<SongDetail | null> {
    const normalized = id.toLowerCase().trim();

    // 1. Check if user-uploaded locally stored song exists
    const stored = songStorage.getStoredSongs();
    const storedMatch = stored.find(
      (s) =>
        s.id.toLowerCase() === normalized ||
        s.title.toLowerCase().replace(/[^a-z0-9]/g, "-") === normalized
    );
    if (storedMatch) {
      return JSON.parse(JSON.stringify(storedMatch));
    }

    // 2. Check numeric ID fallback (1-32)
    const numericIndex = parseInt(normalized, 10);
    if (
      !isNaN(numericIndex) &&
      numericIndex >= 1 &&
      numericIndex <= mockSongDetails.length
    ) {
      return JSON.parse(JSON.stringify(mockSongDetails[numericIndex - 1]));
    }

    // 3. Query Supabase using slug (source of truth for song metadata)
    try {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("slug", normalized)
        .maybeSingle();

      if (error) {
        console.warn("Supabase query error for song detail:", error.message);
      }

      if (data) {
        // Find detailed chord/section fallback in mockSongDetails
        // TODO: Migrate detailed chords, sections, and duration to Supabase table/columns in a future migration.
        const mockDetail = mockSongDetails.find(
          (s) =>
            s.id.toLowerCase() === data.slug.toLowerCase() ||
            s.title.toLowerCase().replace(/[^a-z0-9]/g, "-") ===
              data.slug.toLowerCase()
        );

        let sections: SongDetail["sections"] = [];
        let chords: string[] = [];

        if (mockDetail) {
          sections = mockDetail.sections;
          chords = mockDetail.chords;
        } else if (data.lyrics) {
          const parsed = parseLyricsIntoSections(data.lyrics);
          sections = parsed.sections;
          chords = parsed.chords;
        }

        const songDetail: SongDetail = {
          id: data.slug,
          title: data.title ?? (mockDetail?.title || ""),
          artist: data.artist ?? (mockDetail?.artist || ""),
          author: data.author ?? mockDetail?.author,
          album: data.album ?? mockDetail?.album,
          genre: data.genre ?? (mockDetail?.genre || "Pop"),
          difficulty:
            (data.difficulty as "Beginner" | "Intermediate" | "Advanced") ||
            mockDetail?.difficulty ||
            "Intermediate",
          key: data.song_key ?? (mockDetail?.key || "C"),
          capo:
            typeof data.capo === "number"
              ? data.capo
              : (mockDetail?.capo ?? 0),
          tuning: data.tuning ?? (mockDetail?.tuning || "Standard"),
          duration: mockDetail?.duration,
          popularity:
            typeof data.popularity === "number"
              ? data.popularity
              : mockDetail?.popularity,
          artColor:
            data.art_color ||
            mockDetail?.artColor ||
            "from-stone-700 to-amber-900",
          chordCount:
            typeof data.chord_count === "number"
              ? data.chord_count
              : chords.length || mockDetail?.chordCount,
          chords,
          sections,
        };

        return songDetail;
      }
    } catch (err) {
      console.warn("Error retrieving song from Supabase:", err);
    }

    // 4. Fallback to mockSongDetails if database is unavailable or not found
    const fallback = mockSongDetails.find(
      (s) =>
        s.id.toLowerCase() === normalized ||
        s.title.toLowerCase().replace(/[^a-z0-9]/g, "-") === normalized
    );

    return fallback ? JSON.parse(JSON.stringify(fallback)) : null;
  }

  async getRelatedSongs(
    currentSong: SongDetail,
    limit = 4
  ): Promise<SongSummary[]> {
    const all = await this.getAllSongs();
    const candidates = all.filter((s) => s.id !== currentSong.id);

    const sameArtist = candidates.filter(
      (s) => s.artist.toLowerCase() === currentSong.artist.toLowerCase()
    );

    const sameGenre = candidates.filter(
      (s) =>
        s.artist.toLowerCase() !== currentSong.artist.toLowerCase() &&
        s.genre === currentSong.genre
    );

    const others = candidates.filter(
      (s) =>
        s.artist.toLowerCase() !== currentSong.artist.toLowerCase() &&
        s.genre !== currentSong.genre
    );

    return [...sameArtist, ...sameGenre, ...others].slice(0, limit);
  }

  async getAllSongs(): Promise<SongSummary[]> {
    const databaseSongs = await this.getSongs();
    const stored = songStorage.getStoredSongs();

    const storedSummaries: SongSummary[] = stored.map((s) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      genre: s.genre,
      key: s.key,
      capo: s.capo,
      difficulty: s.difficulty,
      chordCount: s.chords.length,
      artColor: s.artColor || "from-stone-700 to-amber-900",
    }));

    const dbSummaries: SongSummary[] = databaseSongs.map((s) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      genre: s.genre,
      key: s.key,
      capo: s.capo,
      difficulty: s.difficulty,
      chordCount: s.chordCount,
      artColor: s.artColor || "from-stone-700 to-amber-900",
    }));

    const seen = new Set<string>();
    const combined: SongSummary[] = [];
    for (const item of [...storedSummaries, ...dbSummaries]) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        combined.push(item);
      }
    }
    return combined;
  }

  async createSong(input: CreateSongInput): Promise<string> {
    const rawSlug = `${input.title}-${input.artist}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Ensure unique slug
    const existing = await this.getAllSongs();
    let finalId = rawSlug || `song-${Date.now()}`;
    if (existing.some((s) => s.id === finalId)) {
      finalId = `${finalId}-${Math.floor(Math.random() * 1000)}`;
    }

    const { sections, chords } = parseLyricsIntoSections(input.lyricsText);

    const newSong: SongDetail = {
      id: finalId,
      title: input.title.trim(),
      artist: input.artist.trim(),
      author: input.author.trim(),
      genre: input.genre || "Pop",
      difficulty: input.difficulty || "Intermediate",
      key: input.key || "C",
      capo: input.capo ?? 0,
      tuning: input.tuning || "Standard",
      popularity: 88,
      artColor: "from-amber-800 to-orange-950",
      chordCount: chords.length,
      chords,
      sections,
    };

    songStorage.saveStoredSong(newSong);
    this.cachedSongs = null; // Invalidate catalog cache
    return finalId;
  }
}

export const songService: SongService = new SupabaseSongService();


