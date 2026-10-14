import { Suspense, useEffect, useRef } from "react";
import { lazyPage } from "@/lib/chunkReload";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useSearchParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { captureFbclid, trackPageView } from "@/lib/metaPixel";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileCartBar from "@/components/MobileCartBar";
import WhatsAppButton from "@/components/WhatsAppButton";
import { usePendingPaymentRecovery } from "@/hooks/usePendingPaymentRecovery";

// Eager: Home (landing page, always needed first)
import Home from "./pages/Home";

// ── Lazy: All other pages (code-split by route) ──
const Puja = lazyPage(() => import("./pages/Puja"));
const PujaDetail = lazyPage(() => import("./pages/PujaDetail"));
const Chadhava = lazyPage(() => import("./pages/Chadhava"));
const ChadhavaDetail = lazyPage(() => import("./pages/ChadhavaDetail"));
const Astrology = lazyPage(() => import("./pages/Astrology"));
const Temples = lazyPage(() => import("./pages/Temples"));
const Contact = lazyPage(() => import("./pages/Contact"));
const About = lazyPage(() => import("./pages/About"));
const Cart = lazyPage(() => import("./pages/Cart"));
const Checkout = lazyPage(() => import("./pages/Checkout"));
const OrderSuccess = lazyPage(() => import("./pages/OrderSuccess"));
const Login = lazyPage(() => import("./pages/Login"));
const MyOrders = lazyPage(() => import("./pages/MyOrders"));
const Privacy = lazyPage(() => import("./pages/Privacy"));
const Terms = lazyPage(() => import("./pages/Terms"));
const Grievance = lazyPage(() => import("./pages/Grievance"));
const Refund = lazyPage(() => import("./pages/Refund"));
const Shipping = lazyPage(() => import("./pages/Shipping"));
const NotFound = lazyPage(() => import("./pages/NotFound"));

// ── Lazy: Admin (never needed on public site) ──
const AdminLogin = lazyPage(() => import("./pages/admin/AdminLogin"));
const AdminPanel = lazyPage(() => import("./pages/admin/AdminPanel"));
import ErrorBoundary from "@/components/ErrorBoundary";

/* Keeps ?lang= in the address bar across route changes, since React Router
   <Link>s navigate to a bare path and drop existing query params. This makes the
   current URL always shareable in the language the visitor is viewing. */
const LanguageUrlSync = () => {
  const { lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("lang") !== lang) {
      const next = new URLSearchParams(searchParams);
      next.set("lang", lang);
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, lang, setSearchParams]);

  return null;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Jump, don't glide: html has scroll-behavior: smooth (for in-page links), and an
    // animated scroll on every page change made taps feel laggy.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    // Track Meta Pixel pageview on route change (skip first render as it's tracked in index.html)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Landing URL: keep any Meta ad click id before SPA navigation drops it.
      captureFbclid();
    } else {
      trackPageView();
    }
  }, [pathname]);
  return null;
};

/* Finishes a booking whose payment completed while the customer was in their UPI app. */
const PendingPaymentRecovery = () => {
  usePendingPaymentRecovery();
  return null;
};

/* Route loading fallback */
const PageLoader = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-line border-t-saffron" role="status" aria-label="Loading" />
  </div>
);

/* Guards the /admin route: redirects before rendering AdminPanel at all */
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
  if (loading) return <PageLoader />;
  // Remember the tab (/admin/orders…) so signing in returns to it.
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />;
  if (!ADMIN_EMAIL || user.email !== ADMIN_EMAIL) return <Navigate to="/" replace />;
  return <>{children}</>;
};

/* Public layout: Navbar + Footer wrap all public pages */
const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isCheckout = location.pathname === "/checkout";
  
  return (
    <>
      <Navbar />
      <ErrorBoundary resetKey={location.pathname}>
        <Suspense fallback={<PageLoader />}>
          {children}
        </Suspense>
      </ErrorBoundary>
      {!isCheckout && <Footer />}
      <MobileCartBar />
      <WhatsAppButton />
    </>
  );
};

const App = () => (
  <>
      <Sonner />
      <LanguageProvider>
      <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <LanguageUrlSync />
          <ScrollToTop />
          <PendingPaymentRecovery />
          <Routes>
            {/* Admin routes (standalone, no Navbar/Footer) */}
            <Route path="/admin/login" element={<ErrorBoundary><Suspense fallback={<PageLoader />}><AdminLogin /></Suspense></ErrorBoundary>} />
            {/* :section is the open tab (/admin/orders…), so a reload stays on it */}
            <Route path="/admin/:section?" element={<ProtectedAdminRoute><ErrorBoundary><Suspense fallback={<PageLoader />}><AdminPanel /></Suspense></ErrorBoundary></ProtectedAdminRoute>} />

            {/* Public routes */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/puja" element={<PublicLayout><Puja /></PublicLayout>} />
            <Route path="/puja/:id" element={<PublicLayout><PujaDetail /></PublicLayout>} />
            <Route path="/chadhava" element={<PublicLayout><Chadhava /></PublicLayout>} />
            <Route path="/chadhava/:id" element={<PublicLayout><ChadhavaDetail /></PublicLayout>} />
            <Route path="/astrology" element={<PublicLayout><Astrology /></PublicLayout>} />
            <Route path="/temples" element={<PublicLayout><Temples /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
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
  </>
);

export default App;
