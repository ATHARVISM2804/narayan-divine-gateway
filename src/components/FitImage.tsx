import { useState } from "react";
import { imageSrcSet, optimizedImage } from "@/lib/imageUrl";

/**
 * Shows the COMPLETE image inside a box of any shape — never cropped.
 *
 * Uploaded artwork comes in several shapes (7:5 posters, 16:9 photos, square
 * package art), so a fixed box with object-cover cuts parts of it off. Here the
 * sharp image is object-contain'd, and a blurred, zoomed copy of the same image
 * fills any leftover space so it never shows empty bars. Both tags use the same
 * URL, so the browser downloads it only once.
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

  return (
    <>
      <img
        src={url}
        srcSet={srcSet}
        sizes={sizesAttr}
        alt=""
        aria-hidden="true"
        loading={loading}
        decoding="async"
        onError={onError}
        className="absolute inset-0 h-full w-full object-cover scale-110 blur-xl opacity-70"
      />
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
