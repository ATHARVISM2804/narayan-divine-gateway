/** Every pooja and chadhava poster is designed at this size; cards, the home slider
    and the detail gallery all use a box of exactly this shape. */
export const POSTER_WIDTH = 1483;
export const POSTER_HEIGHT = 1061;

/** Same shape as the standard poster, within 1% (any size: 2966 x 2122 is fine too). */
export const isPosterShape = (width: number, height: number): boolean =>
  width > 0 && height > 0 && Math.abs(width / height / (POSTER_WIDTH / POSTER_HEIGHT) - 1) <= 0.01;
