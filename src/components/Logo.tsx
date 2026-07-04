import { Link, useLocation } from "react-router-dom";

const Logo = () => {
  const location = useLocation();

  const handleClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Link to="/" onClick={handleClick} className="flex items-center gap-1.5 sm:gap-3 group min-w-0">
      <img
        src="https://res.cloudinary.com/dmhabztbf/image/upload/v1777712834/favicon-removebg-preview_kx4s41.png"
        alt="Narayan Kripa Logo Icon"
        width={64}
        height={64}
        fetchPriority="high"
        className="h-11 xs:h-12 sm:h-16 w-auto object-contain transition-transform group-hover:scale-105 shrink-0"
      />
      <img
        src="https://res.cloudinary.com/dmhabztbf/image/upload/v1777712826/Screenshot_2026-05-02_143432-removebg-preview_vqcmpo.png"
        alt="Narayan Kripa Text"
        width={120}
        height={48}
        fetchPriority="high"
        className="h-8 xs:h-9 sm:h-12 w-auto object-contain -ml-1 min-w-0 shrink"
      />
    </Link>
  );
};

export default Logo;
