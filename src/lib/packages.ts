import pkgSingle from "@/assets/pkg-single.webp";
import pkgCouple from "@/assets/pkg-couple.webp";
import pkgFamily4 from "@/assets/pkg-family4.webp";
import pkgFamily6 from "@/assets/pkg-family6.webp";

/** Members in a pooja package, read from its label ("Family (4)", "Couple"…); null if unclear. */
export const tierMembers = (label: string): number | null => {
  const n = label.match(/\d+/);
  if (n) return Number(n[0]);
  const l = label.toLowerCase();
  if (l.includes("joint")) return 6;
  if (l.includes("family")) return 4;
  if (l.includes("couple")) return 2;
  if (l.includes("single") || l.includes("individual")) return 1;
  return null;
};

/** Package photo: one person, a couple, a family of 4 or of 6, read from the label. */
export const tierImage = (label: string): string => {
  const l = label.toLowerCase();
  if (l.includes("6") || l.includes("joint")) return pkgFamily6;
  if (l.includes("4") || l.includes("family")) return pkgFamily4;
  if (l.includes("couple") || l.includes("2")) return pkgCouple;
  return pkgSingle;
};

export interface TierTone {
  /** Member pill when the package isn't chosen. */
  pill: string;
  /** Price text. */
  price: string;
  /** Soft wash behind the price and photo. */
  wash: string;
}

/** Each package size gets its own colour, like Sri Mandir: 1 saffron, 2 rose, 4 green, 6 amber. */
export const tierTone = (label: string): TierTone => {
  switch (tierMembers(label)) {
    case 2:
      return { pill: "bg-rose-50 text-rose-700", price: "text-rose-700", wash: "from-rose-50" };
    case 4:
      return { pill: "bg-emerald-50 text-emerald-700", price: "text-emerald-700", wash: "from-emerald-50" };
    case 6:
      return { pill: "bg-amber-50 text-amber-700", price: "text-amber-700", wash: "from-amber-50" };
    default:
      return { pill: "bg-saffron-soft text-saffron-dark", price: "text-saffron-dark", wash: "from-saffron-soft" };
  }
};
