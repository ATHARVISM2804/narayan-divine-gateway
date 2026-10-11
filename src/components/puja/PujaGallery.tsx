import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FitImage from "@/components/FitImage";
import StorageImage from "@/components/StorageImage";
import { TempleIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

interface Props {
  images: string[];
  fallbackUrl: string | null;
  name: string;
}

/** Puja/chadhava artwork. The box matches the 1483x1061 poster size the
    marketing team designs at; FitImage never crops the poster. Swipe on touch. */
const PujaGallery = ({ images, fallbackUrl, name }: Props) => {
  const allImages = images.length > 0 ? images : fallbackUrl ? [fallbackUrl] : [];
  const [active, setActive] = useState(0);
  const touchX = useRef<number | null>(null);

  if (allImages.length === 0) {
    return (
      <div className="grid aspect-[1483/1061] w-full place-items-center rounded-xl bg-surface-muted text-ink-soft">
        <TempleIcon size={40} />
      </div>
    );
  }

  const go = (d: number) => setActive((i) => (i + d + allImages.length) % allImages.length);
  const many = allImages.length > 1;

  return (
    <div className="space-y-2.5">
      <div
        className="relative aspect-[1483/1061] overflow-hidden rounded-xl bg-surface-muted"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current == null || !many) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <FitImage
          src={allImages[active]}
          alt={name}
          loading="eager"
          fetchPriority={active === 0 ? "high" : undefined}
          width={640}
          sizes="(min-width: 1024px) 640px, 100vw"
        />
        {many && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-card transition-colors hover:bg-white sm:grid"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-card transition-colors hover:bg-white sm:grid"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-ink/30 px-2 py-1">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Image ${i + 1}`}
                  aria-current={i === active ? "true" : undefined}
                  className={cn("h-1.5 rounded-full transition-all", i === active ? "w-5 bg-white" : "w-1.5 bg-white/60")}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {many && (
        <div className="hidden gap-2 overflow-x-auto md:flex">
          {allImages.map((url, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active ? "true" : undefined}
              className={cn(
                "h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                i === active ? "border-saffron" : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              <StorageImage src={url} width={64} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PujaGallery;
