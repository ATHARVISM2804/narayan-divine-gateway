import HeroCarousel from "@/components/home/HeroCarousel";
import StatsBar from "@/components/home/StatsBar";
import FeaturedPujas from "@/components/home/FeaturedPujas";
import TemplePartners from "@/components/home/TemplePartners";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import AppDownload from "@/components/home/AppDownload";

const Home = () => {
  return (
    <main>
      <title>Narayan Kripa — Pujas, Chadhava & Sacred Temple Services</title>
      <meta name="description" content="Book Vedic pujas, offer chadhava at 50+ sacred temples, consult expert pandits and watch live darshan — all from home. Trusted by 2 lakh+ devotees." />
      <link rel="canonical" href="/" />
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
