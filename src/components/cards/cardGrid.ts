/**
 * Grid classes for puja/chadhava cards: 1 / 2 / 3 columns for any count.
 *
 * One or two cards keep the normal card size (poster on top) instead of a wide
 * side-by-side layout: a side-by-side poster box is taller than the poster, which
 * left blurred filler above and below it.
 */
export const cardGridClass = (_count?: number): string => "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";
