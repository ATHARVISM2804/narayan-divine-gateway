import { Link } from "react-router-dom";

const PageHero = ({
  title,
  subtitle,
  variant = "maroon",
  breadcrumb,
}: {
  title: string;
  subtitle?: string;
  variant?: "maroon" | "saffron" | "brown" | "ivory";
  breadcrumb?: string;
}) => {
  const styles = {
    maroon: "bg-maroon text-cream",
    saffron: "bg-gradient-to-br from-saffron to-maroon text-white",
    brown: "bg-brown text-cream",
    ivory: "bg-ivory text-maroon",
  }[variant];

  return (
    <section className={`relative overflow-hidden ${styles}`}>
      {variant === "brown" && (
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(hsl(var(--gold)) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      )}
      <div className="container relative py-16 text-center md:py-20">
        {breadcrumb && (
          <nav className="mb-3 text-xs opacity-80">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">›</span>
            <span>{breadcrumb}</span>
          </nav>
        )}
        <h1 className={`font-display text-4xl md:text-5xl ${variant === "maroon" || variant === "brown" ? "text-gold" : variant === "ivory" ? "text-maroon" : "text-white"}`}>
          {title}
        </h1>
        {subtitle && <p className="mx-auto mt-3 max-w-2xl font-serif italic opacity-90">{subtitle}</p>}
      </div>
    </section>
  );
};

export default PageHero;
