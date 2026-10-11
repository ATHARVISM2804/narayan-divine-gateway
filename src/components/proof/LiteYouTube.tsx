import { useState } from "react";
import { Play } from "lucide-react";
import { youTubeId } from "@/lib/proof";
import { cn } from "@/lib/utils";

/** YouTube thumbnail that only loads the real player after a tap, so pages
    stay fast and nothing is served from Supabase. */
const LiteYouTube = ({
  url,
  title,
  className,
  vertical = false,
}: {
  url: string;
  title: string;
  className?: string;
  /** 9:16 for Shorts-style testimonials, 16:9 otherwise. */
  vertical?: boolean;
}) => {
  const id = youTubeId(url);
  const [playing, setPlaying] = useState(false);
  if (!id) return null;

  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-ink", vertical ? "aspect-[9/16]" : "aspect-video", className)}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`}
          title={title}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button onClick={() => setPlaying(true)} className="group absolute inset-0 h-full w-full" aria-label={title}>
          <img
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
          />
          <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-maroon shadow-card transition-transform group-hover:scale-105">
            <Play size={22} fill="currentColor" className="ml-0.5" />
          </span>
        </button>
      )}
    </div>
  );
};

export default LiteYouTube;
