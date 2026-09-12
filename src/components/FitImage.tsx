/**
 * Shows the COMPLETE image inside a box of any shape — never cropped.
 *
 * Uploaded artwork comes in several shapes (7:5 posters, 16:9 photos, square
 * package art), so a fixed box with object-cover cuts parts of it off. Here the
 * sharp image is object-contain'd, and a blurred, zoomed copy of the same image
 * fills any leftover space so it never shows empty bars. Both tags use the same
 * URL, so the browser downloads it only once.
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
}

const FitImage = ({ src, alt, className = "", loading = "lazy", fetchPriority }: FitImageProps) => (
  <>
    <img
      src={src}
      alt=""
      aria-hidden="true"
      loading={loading}
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover scale-110 blur-xl opacity-70"
    />
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      className={`absolute inset-0 h-full w-full object-contain ${className}`}
    />
  </>
);

export default FitImage;
