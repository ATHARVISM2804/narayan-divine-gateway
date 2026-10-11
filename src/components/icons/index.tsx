/* Devotional icons that lucide does not ship, drawn on lucide's 24px grid with
   the same 1.75 stroke so they sit next to lucide icons without looking foreign. */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const Base = ({ size = 20, children, ...rest }: IconProps & { children: React.ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

/** Oil lamp (diya) with flame. */
export const DiyaIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3c1.6 1.8 2.2 3.3 2.2 4.5a2.2 2.2 0 0 1-4.4 0C9.8 6.3 10.4 4.8 12 3Z" />
    <path d="M3 13h18c-.6 3.6-4.2 6-9 6s-8.4-2.4-9-6Z" />
    <path d="M9 21h6" />
  </Base>
);

/** Temple with shikhara and flag. */
export const TempleIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 2v3" />
    <path d="M12 2.5 15 3.5 12 4.5" />
    <path d="M12 5 7.5 11h9L12 5Z" />
    <path d="M5 11h14" />
    <path d="M6 11v10M18 11v10" />
    <path d="M4 21h16" />
    <path d="M10 21v-4a2 2 0 0 1 4 0v4" />
  </Base>
);

/** Kalash (sacred pot) with mango leaves and coconut. */
export const KalashIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="5" r="2" />
    <path d="M8 8c1.2-.6 2.5-.9 4-.9s2.8.3 4 .9" />
    <path d="M9 8.5 8 10h8l-1-1.5" />
    <path d="M8 10c-2.5 1.5-3.5 3.5-3.5 5.5C4.5 18.5 7.8 21 12 21s7.5-2.5 7.5-5.5c0-2-1-4-3.5-5.5" />
    <path d="M7 15h10" />
  </Base>
);

/** Folded hands (namaste). */
export const NamasteIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21V9.5c0-1.4-.4-2.8-1.2-4L9.6 3.8a1 1 0 0 0-1.8.6V11" />
    <path d="M12 21V9.5c0-1.4.4-2.8 1.2-4l1.2-1.7a1 1 0 0 1 1.8.6V11" />
    <path d="M7.8 11 5.5 14a3 3 0 0 0 .4 4l2.6 2.2c.5.5 1.2.8 2 .8H12" />
    <path d="M16.2 11l2.3 3a3 3 0 0 1-.4 4l-2.6 2.2c-.5.5-1.2.8-2 .8H12" />
  </Base>
);

/** Prasad / blessing box with ribbon. */
export const PrasadBoxIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="9" width="17" height="11.5" rx="1.5" />
    <path d="M2.5 9h19V6.5h-19V9Z" />
    <path d="M12 6.5v14" />
    <path d="M12 6.5C10.5 3.5 7.5 3.8 8 5.6c.3 1 2.3.9 4 .9Z" />
    <path d="M12 6.5c1.5-3 4.5-2.7 4-.9-.3 1-2.3.9-4 .9Z" />
  </Base>
);

/** Sacred thread / sankalp (name and gotra recited). */
export const SankalpIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 4h10l4 4v12H5V4Z" />
    <path d="M15 4v4h4" />
    <path d="M8.5 12h7M8.5 15.5h5" />
  </Base>
);
