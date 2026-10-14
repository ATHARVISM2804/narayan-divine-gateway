import { useState } from "react";
import { imageSrcSet, optimizedImage } from "@/lib/imageUrl";

/**
 * Shows the COMPLETE image inside a box of any shape, never cropped.
 *
 * Uploaded artwork comes in several shapes (7:5 posters, 16:9 photos, square
 * package art), so a fixed box with object-cover cuts parts of it off. Here the
 * sharp image is object-contain'd, and a soft copy of the same image fills any
 * leftover space so it never shows empty bars.
 *
 * The soft copy is the 64-px version stretched to fill the box: the browser's
 * upscaling makes it look blurred for free. (It used to be the full image with a
 * CSS blur(24px), which phones had to redraw on every scroll frame and made the
 * listing and detail pages lag.) Images that can't be resized get a plain fill.
 *
 * Uploaded images are resized by Vercel (see lib/imageUrl.ts). If that ever
 * fails, the image falls back to the original file instead of showing broken.
 *
 * The parent must be `relative overflow-hidden` and have a size.
 */
interface FitImageProps {
  src: string;
  alt: string;
  /** Extra classes for the sharp foreground image (e.g. hover transitions). */
  className?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  /** About how wide the box is on screen, in CSS px (picks the image size). */
  width?: number;
  /** `sizes` attribute; defaults to `${width}px`. */
  sizes?: string;
}

const FitImage = ({ src, alt, className = "", loading = "lazy", fetchPriority, width = 400, sizes }: FitImageProps) => {
  const [failed, setFailed] = useState(false);
  const url = failed ? src : optimizedImage(src, width);
  const srcSet = failed ? undefined : imageSrcSet(src, width);
  const sizesAttr = srcSet ? sizes ?? `${width}px` : undefined;
  const onError = () => { if (!failed && url !== src) setFailed(true); };
  const tiny = optimizedImage(src, 64);

  return (
    <>
      {!failed && tiny !== src ? (
        <img
          src={tiny}
          alt=""
          aria-hidden="true"
          loading={loading}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 bg-cream" />
      )}
      <img
        src={url}
        srcSet={srcSet}
        sizes={sizesAttr}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        onError={onError}
        className={`absolute inset-0 h-full w-full object-contain ${className}`}
      />
    </>
  );
};

export default FitImage;
