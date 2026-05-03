import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileCartBar from "@/components/MobileCartBar";
import Home from "./pages/Home";
import Puja from "./pages/Puja";
import Chadhava from "./pages/Chadhava";
import Astrology from "./pages/Astrology";
import Temples from "./pages/Temples";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Grievance from "./pages/Grievance";
import AdminPanel from "./pages/admin/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

/** Wraps public pages with Navbar + Footer; admin gets its own shell */
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    {children}
    <Footer />
    <MobileCartBar />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Admin — standalone, no Navbar/Footer */}
            <Route path="/admin" element={<AdminPanel />} />

            {/* Public pages — wrapped with Navbar + Footer */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/puja" element={<PublicLayout><Puja /></PublicLayout>} />
            <Route path="/chadhava" element={<PublicLayout><Chadhava /></PublicLayout>} />
            <Route path="/astrology" element={<PublicLayout><Astrology /></PublicLayout>} />
            <Route path="/temples" element={<PublicLayout><Temples /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
            <Route path="/privacy-policy" element={<PublicLayout><Privacy /></PublicLayout>} />
            <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
            <Route path="/grievance" element={<PublicLayout><Grievance /></PublicLayout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
