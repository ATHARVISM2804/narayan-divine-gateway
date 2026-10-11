import { Link, useLocation } from "react-router-dom";

const Logo = () => {
  const location = useLocation();

  const handleClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Link to="/" onClick={handleClick} className="flex min-w-0 items-center gap-1.5 sm:gap-2">
      <img
        src="https://res.cloudinary.com/dmhabztbf/image/upload/v1777712834/favicon-removebg-preview_kx4s41.png"
        alt="Narayan Kripa Logo Icon"
        width={64}
        height={64}
        fetchPriority="high"
        className="h-10 w-auto shrink-0 object-contain sm:h-11"
      />
      <img
        src="https://res.cloudinary.com/dmhabztbf/image/upload/v1777712826/Screenshot_2026-05-02_143432-removebg-preview_vqcmpo.png"
        alt="Narayan Kripa Text"
        width={120}
        height={48}
        fetchPriority="high"
        className="-ml-1 h-7 w-auto min-w-0 shrink object-contain sm:h-8"
      />
    </Link>
  );
};

export default Logo;
