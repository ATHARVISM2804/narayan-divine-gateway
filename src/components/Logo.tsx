import { Link } from "react-router-dom";

const Logo = () => (
  <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
    <img 
      src="https://res.cloudinary.com/dmhabztbf/image/upload/v1777712834/favicon-removebg-preview_kx4s41.png" 
      alt="Narayan Kripa Logo Icon" 
      width={64}
      height={64}
      fetchPriority="high"
      className="h-14 sm:h-16 w-auto object-contain transition-transform group-hover:scale-105"
    />
    <img 
      src="https://res.cloudinary.com/dmhabztbf/image/upload/v1777712826/Screenshot_2026-05-02_143432-removebg-preview_vqcmpo.png" 
      alt="Narayan Kripa Text" 
      width={120}
      height={48}
      fetchPriority="high"
      className="h-10 sm:h-12 w-auto object-contain -ml-1"
    />
  </Link>
);

export default Logo;
