import { useState, type ImgHTMLAttributes } from "react";
import { imageSrcSet, optimizedImage } from "@/lib/imageUrl";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & {
  src: string;
  /** About how wide the image is on screen, in CSS px (picks the image size). */
  width: number;
  /** One size only, no srcset (e.g. a faint blurred background). */
  fixed?: boolean;
};

/**
 * `<img>` for uploaded images: served resized by Vercel (lib/imageUrl.ts), and
 * falls back to the original file if the resized one fails to load.
 */
const StorageImage = ({ src, width, fixed = false, sizes, onError, ...rest }: Props) => {
  const [failed, setFailed] = useState(false);
  const url = failed ? src : optimizedImage(src, width);
  const srcSet = failed || fixed ? undefined : imageSrcSet(src, width);
  return (
    <img
      {...rest}
      src={url}
      srcSet={srcSet}
      sizes={srcSet ? sizes ?? `${width}px` : undefined}
      onError={(e) => {
        if (!failed && url !== src) setFailed(true);
        onError?.(e);
      }}
    />
  );
};

export default StorageImage;
