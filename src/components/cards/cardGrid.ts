/**
 * Grid classes for puja/chadhava cards.
 *
 * Three or more cards: the usual 1 / 2 / 3 columns. With only one or two cards a
 * three-column row leaves an empty slot on laptops, so from lg up those cards
 * switch to a wide, horizontal layout (see BookingCard `wide`) that fills the row.
 * Below lg the classes are identical in every case.
 */
export const isWideGrid = (count: number): boolean => count > 0 && count <= 2;

export const cardGridClass = (count: number): string => {
  if (count === 1) return "grid gap-4 sm:grid-cols-2 lg:max-w-4xl lg:grid-cols-1";
  if (count === 2) return "grid gap-4 sm:grid-cols-2 lg:gap-6";
  return "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
};
