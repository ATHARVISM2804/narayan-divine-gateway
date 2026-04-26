import { Link } from "react-router-dom";

const Logo = ({ size = 32, color = "currentColor" }: { size?: number; color?: string }) => (
  <Link to="/" className="flex items-center gap-2 group">
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className="transition-transform group-hover:scale-105">
      {/* Lotus mark */}
      <g stroke={color} strokeWidth="2" fill="none">
        <path d="M32 50 C 18 38, 18 22, 32 14 C 46 22, 46 38, 32 50 Z" />
        <path d="M32 50 C 22 44, 14 30, 18 18 C 28 22, 34 34, 32 50 Z" />
        <path d="M32 50 C 42 44, 50 30, 46 18 C 36 22, 30 34, 32 50 Z" />
      </g>
      <circle cx="32" cy="34" r="3" fill="hsl(var(--saffron))" />
    </svg>
    <div className="flex flex-col leading-none">
      <span className="font-display text-lg font-semibold text-maroon">Narayan Kripa</span>
      <span className="font-serif italic text-[10px] text-gold tracking-wider">DEVOTION • TRADITION</span>
    </div>
  </Link>
);

export default Logo;
