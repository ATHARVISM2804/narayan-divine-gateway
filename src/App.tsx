import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileCartBar from "@/components/MobileCartBar";

// ── Eager: Home (landing page — always needed first) ──
import Home from "./pages/Home";

// ── Lazy: All other pages (code-split by route) ──
const Puja = lazy(() => import("./pages/Puja"));
const PujaDetail = lazy(() => import("./pages/PujaDetail"));
const Chadhava = lazy(() => import("./pages/Chadhava"));
const ChadhavaDetail = lazy(() => import("./pages/ChadhavaDetail"));
const Astrology = lazy(() => import("./pages/Astrology"));
const Temples = lazy(() => import("./pages/Temples"));
const Contact = lazy(() => import("./pages/Contact"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const Login = lazy(() => import("./pages/Login"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Grievance = lazy(() => import("./pages/Grievance"));
const Refund = lazy(() => import("./pages/Refund"));
const Shipping = lazy(() => import("./pages/Shipping"));
const NotFound = lazy(() => import("./pages/NotFound"));

// ── Lazy: Admin (never needed on public site) ──
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminPanel = lazy(() => import("./pages/admin/AdminPanel"));

// ── QueryClient with sensible caching ──
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 min — avoid refetching static-ish data on every focus
      retry: 1,
    },
  },
});

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

/* ── Route loading fallback — branded spinner ── */
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-saffron" />
      <p className="text-sm text-brown/50 font-serif italic">Loading…</p>
    </div>
  </div>
);

/* Public layout — Navbar + Footer wrap all public pages */
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
    <Footer />
    <MobileCartBar />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LanguageProvider>
      <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* ── Admin routes (standalone — no Navbar/Footer) ── */}
            <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><AdminLogin /></Suspense>} />
            <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminPanel /></Suspense>} />

            {/* ── Public routes ── */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/puja" element={<PublicLayout><Puja /></PublicLayout>} />
            <Route path="/puja/:id" element={<PublicLayout><PujaDetail /></PublicLayout>} />
            <Route path="/chadhava" element={<PublicLayout><Chadhava /></PublicLayout>} />
            <Route path="/chadhava/:id" element={<PublicLayout><ChadhavaDetail /></PublicLayout>} />
            <Route path="/astrology" element={<PublicLayout><Astrology /></PublicLayout>} />
            <Route path="/temples" element={<PublicLayout><Temples /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
            <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
            <Route path="/order-success" element={<PublicLayout><OrderSuccess /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
            <Route path="/my-orders" element={<PublicLayout><MyOrders /></PublicLayout>} />
            <Route path="/privacy-policy" element={<PublicLayout><Privacy /></PublicLayout>} />
            <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
            <Route path="/grievance" element={<PublicLayout><Grievance /></PublicLayout>} />
            <Route path="/refund-policy" element={<PublicLayout><Refund /></PublicLayout>} />
            <Route path="/shipping-policy" element={<PublicLayout><Shipping /></PublicLayout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
      </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
