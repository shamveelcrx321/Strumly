import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Flower2,
  Guitar,
  Heart,
  Landmark,
  Leaf,
  Music2,
  Search,
  Sparkles,
  Users,
  Waves,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { stats, suggestedSearches, musicQuotes } from "@/services/catalog";
import studioImage from "@/assets/strumly-studio.jpg";
import popImage from "@/assets/genre-pop.jpg";
import rockImage from "@/assets/genre-rock.jpg";
import acousticImage from "@/assets/genre-acoustic.jpg";
import indieImage from "@/assets/genre-indie.jpg";
import classicalImage from "@/assets/genre-classical.jpg";
import animeImage from "@/assets/genre-anime.jpg";
import malayalamImage from "@/assets/genre-malayalam.jpg";
import trendingImage from "@/assets/genre-trending.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Strumly — Songs, Chords & Guitar" },
      { name: "description", content: "Search songs, explore guitar chords, upload lyrics, and play every song your way." },
      { property: "og:title", content: "Strumly — Songs, Chords & Guitar" },
      { property: "og:description", content: "Search songs, explore guitar chords, upload lyrics, and play every song your way." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StrumlyHome,
});

const genres = [
  { name: "Pop", image: popImage, Icon: BarChart3 },
  { name: "Rock", image: rockImage, Icon: Zap },
  { name: "Acoustic", image: acousticImage, Icon: Guitar },
  { name: "Indie", image: indieImage, Icon: Leaf },
  { name: "Classical", image: classicalImage, Icon: Landmark },
  { name: "Anime", image: animeImage, Icon: Flower2 },
  { name: "Malayalam", image: malayalamImage, Icon: Waves },
  { name: "Trending", image: trendingImage, Icon: Sparkles },
];

const randomQuote = musicQuotes[Math.floor(Math.random() * musicQuotes.length)] || musicQuotes[0];

const StatIcon = ({ name }: { name: (typeof stats)[number]["icon"] }) => {
  if (name === "users") return <Users aria-hidden="true" />;
  if (name === "heart") return <Heart aria-hidden="true" fill="currentColor" />;
  return <Music2 aria-hidden="true" />;
};

function StrumlyHome() {
  const [query, setQuery] = useState("");
  const railRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const runSearch = (value = query) => {
    const cleaned = value.trim();
    if (!cleaned) return;
    void navigate({ to: "/search", search: { q: cleaned } });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative isolate min-h-screen overflow-hidden pb-5 lg:min-h-screen lg:pb-0">
        <img src={studioImage} alt="A warm acoustic guitar studio overlooking a sunset lake" className="absolute inset-0 -z-30 h-full w-full object-cover object-[58%_center]" width={1920} height={1080} />
        <div className="hero-vignette absolute inset-0 -z-20" />
        <div className="bottom-shade absolute inset-x-0 bottom-0 -z-10 h-[45%]" />

        <Navbar activeItem="Home" />

        <div className="relative z-10 mx-auto max-w-[1440px] px-5 pt-12 sm:px-8 lg:px-12 lg:pt-9">
          <div className="max-w-[770px]">
            <div className="animate-flow-2">
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-peach sm:text-sm">Chords bring people closer</p>
              <h1 className="mt-3 max-w-[720px] font-display text-5xl font-extrabold leading-[1.02] tracking-normal text-cream sm:text-6xl lg:text-[68px]">
                Every song is <span className="text-peach">closer</span><br className="hidden sm:block" /> than you think.
              </h1>
            </div>

            <div className="animate-flow-3">
              <p className="mt-4 max-w-[650px] text-base leading-7 text-cream/75 sm:text-lg">Search, explore, upload and play your favourite songs with chords.<br className="hidden sm:block" /> Turn lyrics into music, one strum at a time.</p>

              <form className="mt-7 flex h-[64px] items-center gap-3 rounded-[20px] border border-glass-border bg-glass p-2 pl-5 shadow-2xl backdrop-blur-lg" onSubmit={(event) => { event.preventDefault(); runSearch(); }}>
                <Search className="shrink-0 text-cream/70" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-cream outline-none placeholder:text-cream/50 sm:text-base" placeholder="Search songs, artists, chords..." aria-label="Search songs, artists, and chords" />
                <Button variant="warm" size="hero"  type="submit">Search <ArrowRight /></Button>
              </form>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-cream/60">
                <span className="mr-1">Try searching:</span>
                {suggestedSearches.map((item) => <Button key={item} type="button" variant="glass" size="sm" onClick={() => runSearch(item)}>{item}</Button>)}
              </div>
            </div>

          </div>
        </div>

        <div id="explore" className="relative z-20 mx-auto mt-12 max-w-[1440px] px-5 sm:px-8 lg:absolute lg:inset-x-0 lg:bottom-5 lg:mt-0 lg:px-12 animate-flow-4">
          <div className="mb-3 flex items-center gap-3">
            <h2 className="mr-2 text-lg font-bold">Explore by Genre</h2>
          </div>
          <div ref={railRef} className="no-scrollbar flex snap-x gap-3 overflow-x-auto pb-2">
            {genres.map(({ name, image, Icon }) => {
              const isGenreFilter = name !== "Trending";
              const target = isGenreFilter
                ? `/search?genre=${encodeURIComponent(name)}`
                : "/search";
              return (
                <a
                  key={name}
                  href={target}
                  onClick={(e) => {
                    e.preventDefault();
                    void navigate(
                      isGenreFilter
                        ? { to: "/search", search: { q: "", genre: name } }
                        : { to: "/search", search: { q: "", genre: "" } },
                    );
                  }}
                  className="group relative h-[102px] w-[148px] shrink-0 snap-start overflow-hidden rounded-xl border border-glass-border text-left shadow-xl transition duration-300 hover:-translate-y-1 hover:border-primary/70"
                  aria-label={`Explore ${name} songs`}
                >
                  <img src={image} alt="" loading="lazy" width={480} height={480} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                  <span className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
                  <span className="absolute inset-x-3 bottom-3 flex items-center gap-2 text-sm font-semibold text-cream"><Icon size={17} />{name}</span>
                </a>
              );
            })}
          </div>
          <div className="mt-3 grid items-end gap-5 lg:grid-cols-[1fr_auto]">
            <blockquote className="flex max-w-md gap-3 text-cream/80">
              <span className="font-display text-5xl leading-none text-peach">“</span>
              <p className="text-base leading-6">{randomQuote?.quote}    <br></br><span className="text-sm text-cream/55">— {randomQuote?.author}</span></p>
            </blockquote>
          </div>
        </div>
      </section>
    </main>
  );
}