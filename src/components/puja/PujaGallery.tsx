import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  images: string[];
  fallbackUrl: string | null;
  name: string;
}

const PujaGallery = ({ images, fallbackUrl, name }: Props) => {
  const allImages = images.length > 0 ? images : fallbackUrl ? [fallbackUrl] : [];
  const [active, setActive] = useState(0);

  if (allImages.length === 0) {
    return (
      <div className="w-full h-72 md:h-96 rounded-2xl bg-gradient-to-br from-sacred/30 to-gold/20 grid place-items-center border-2 border-gold/30">
        <span className="text-7xl drop-shadow-lg">🪔</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-gold/30 shadow-2xl aspect-[4/3] bg-gradient-to-br from-saffron/10 to-maroon/10">
        <img src={allImages[active]} alt={name} fetchPriority="high" decoding="async" className="w-full h-full object-cover transition-opacity duration-300" />
        {allImages.length > 1 && (
          <>
            <button onClick={() => setActive((active - 1 + allImages.length) % allImages.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-maroon-deep/60 text-white backdrop-blur-sm hover:bg-maroon transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setActive((active + 1) % allImages.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-maroon-deep/60 text-white backdrop-blur-sm hover:bg-maroon transition-colors">
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {allImages.map((_, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`h-2 rounded-full transition-all ${i === active ? "w-6 bg-gold" : "w-2 bg-white/50 hover:bg-white/80"}`} />
              ))}
            </div>
          </>
        )}
      </div>
      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((url, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`shrink-0 h-16 w-20 rounded-lg overflow-hidden border-2 transition-all ${i === active ? "border-saffron shadow-md" : "border-gold/20 opacity-60 hover:opacity-100"}`}>
              <img src={url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PujaGallery;
