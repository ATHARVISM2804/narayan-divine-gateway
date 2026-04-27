import { usePageTitle } from "@/hooks/use-page-title";
import HeroCarousel from "@/components/home/HeroCarousel";
import StatsBar from "@/components/home/StatsBar";
import FeaturedPujas from "@/components/home/FeaturedPujas";
import TemplePartners from "@/components/home/TemplePartners";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import AppDownload from "@/components/home/AppDownload";

const Home = () => {
  usePageTitle("Narayan Kripa — Pujas, Chadhava & Sacred Temple Services");

  return (
    <main>
      <HeroCarousel />
      <StatsBar />
      <FeaturedPujas />
      <TemplePartners />
      <HowItWorks />
      <Testimonials />
      <AppDownload />
    </main>
  );
};

export default Home;
