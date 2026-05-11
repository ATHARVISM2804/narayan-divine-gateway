import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "en" | "hi";

const EN = {
  // ── Navbar ──
  nav_home: "Home", nav_puja: "Puja", nav_chadhava: "Chadhava",
  nav_astrology: "Astrology", nav_temples: "Temples", nav_contact: "Contact",
  nav_login: "Login", nav_logout: "Logout", nav_my_orders: "My Orders",
  nav_book_now: "Book Now",

  // ── Buttons ──
  btn_add_cart: "Add to Cart", btn_buy_now: "Buy Now",
  btn_offer_now: "Offer Now", btn_added: "Added to Cart!",
  btn_read_more: "Read More", btn_read_less: "Read Less",
  btn_participate: "Participate Now", btn_explore_puja: "Explore Pujas",
  btn_view_chadhava: "View Chadhava", btn_book_puja: "Book a Puja",
  btn_proceed_checkout: "Proceed to Checkout",

  // ── Timer ──
  timer_label: "⏳ Puja booking will close in",
  timer_days: "Days", timer_hours: "Hours", timer_mins: "Mins", timer_secs: "Secs",
  timer_expired: "🔴 Puja booking is closed",

  // ── Puja Detail ──
  starting_from: "Starting from",
  select_package: "🪔 SELECT PUJA PACKAGE",
  select_package_sub: "Choose the package that best suits your family",
  selected_package: "Selected Package",
  tap_to_select: "👆 Tap on a package above to select",
  trust_rituals: "Authentic Rituals", trust_prasad_del: "Prasad Delivery",
  trust_secure: "Secure Payment", trust_pandits: "Verified Experienced Pandits",
  trust_support: "Live Updates & Support",
  what_receive: "What You Receive",
  rcv1: "Complete puja performed by experienced, verified pandits",
  rcv2: "Sankalp taken in your name and gotra",
  rcv3: "Sacred prasad & energized items delivered to your address",
  rcv4: "Photo/video updates of the puja ceremony",
  rcv5: "Puja completion certificate with mantra count",
  how_works: "How It Works",
  step1t: "Book & Pay", step1d: "Choose your package and complete secure payment",
  step2t: "Puja Performed", step2d: "Expert pandits perform at the sacred location",
  step3t: "Prasad Delivered", step3d: "Receive blessed prasad at your doorstep",
  secure_pay: "🔒 Secure payment via Razorpay",

  // ── Puja Listing ──
  puja_hero_title: "Sacred Pujas for Every Need",
  puja_hero_sub: "Verified pandits, authentic rituals, divine blessings",
  puja_empty: "No pujas available right now.",
  puja_starting: "Starting from",

  // ── Chadhava Detail ──
  breadcrumb_chadhava: "Chadhava",
  sacred_at: "Sacred offering at",
  per_offering: "per offering",
  offering_price: "Offering Price",
  inclusive: "Inclusive of all rituals & prasad delivery",
  whats_included: "✦ What's Included",
  devotees_served: "Devotees Served",
  authentic: "Authentic Rituals",
  avg_rating: "Average Rating",
  trust_temple: "Authentic Temple Offering",
  trust_priests: "Verified Temple Priests",
  trust_prasad_home: "Prasad Home Delivery",
  trust_cert: "Blessings Certificate",
  inc1: "Offering performed by verified temple priests",
  inc2: "Sankalp taken in your name & gotra",
  inc3: "Blessed prasad delivered to your doorstep",
  inc4: "Photo/video proof of the ceremony",
  inc5: "Personalised blessings certificate",
  ch_step1t: "Book & Pay", ch_step1d: "Complete secure online payment",
  ch_step2t: "Offering Made", ch_step2d: "Priests perform chadhava at the temple",
  ch_step3t: "Prasad Sent", ch_step3d: "Blessed prasad delivered to your door",
  tap_offering: "👆 Tap the card above to select this offering",

  // ── Chadhava Listing ──
  chadhava_hero_title: "Offer Chadhava at Sacred Temples",
  chadhava_hero_sub: "Your devotion, our sacred delivery",
  chadhava_section_title: "Special Chadhava Offerings",
  chadhava_section_sub: "Curated offerings for every devotee",
  chadhava_empty: "No chadhava offerings available right now.",

  // ── Cart ──
  cart_empty_title: "Your Cart is Empty",
  cart_empty_sub: "Begin your spiritual journey — add sacred pujas or chadhava offerings to your cart.",
  cart_title: "Your Sacred Cart",
  cart_subtitle: "Review your offerings before checkout",
  cart_continue: "Continue Shopping",
  cart_item: "Item", cart_qty: "Quantity", cart_subtotal: "Subtotal",
  cart_clear: "Clear entire cart",
  cart_order_summary: "Order Summary",
  cart_total: "Total",
  cart_secure: "Secure checkout • Prasad delivered to your doorstep",

  // ── Footer ──
  footer_tagline: "Where Devotion Meets Tradition",
  footer_quick_links: "Quick Links",
  footer_services: "Services",
  footer_connect: "Connect",
  footer_copyright: "© 2025 Narayan Kripa. All rights reserved.",
  footer_privacy: "Privacy Policy",
  footer_terms: "Terms",
  footer_grievance: "Grievance",
  svc_darshan: "Daily Darshan",
  svc_pandit: "Pandit Consultation",
  svc_store: "Sacred Store",
  svc_panchang: "Panchang",
  svc_horoscope: "Horoscope",
  svc_tours: "Temple Tours",
} as const;

type TKey = keyof typeof EN;

const HI: Record<TKey, string> = {
  // ── Navbar ──
  nav_home: "होम", nav_puja: "पूजा", nav_chadhava: "चढ़ावा",
  nav_astrology: "ज्योतिष", nav_temples: "मंदिर", nav_contact: "संपर्क",
  nav_login: "लॉगिन", nav_logout: "लॉगआउट", nav_my_orders: "मेरे ऑर्डर",
  nav_book_now: "अभी बुक करें",

  // ── Buttons ──
  btn_add_cart: "कार्ट में जोड़ें", btn_buy_now: "अभी खरीदें",
  btn_offer_now: "चढ़ावा चढ़ाएं", btn_added: "कार्ट में जोड़ा गया!",
  btn_read_more: "और पढ़ें", btn_read_less: "कम पढ़ें",
  btn_participate: "अभी सहभागी हों", btn_explore_puja: "पूजाएं देखें",
  btn_view_chadhava: "चढ़ावा देखें", btn_book_puja: "पूजा बुक करें",
  btn_proceed_checkout: "चेकआउट करें",

  // ── Timer ──
  timer_label: "⏳ पूजा बुकिंग बंद होगी",
  timer_days: "दिन", timer_hours: "घंटे", timer_mins: "मिनट", timer_secs: "सेकंड",
  timer_expired: "🔴 पूजा बुकिंग बंद हो गई",

  // ── Puja Detail ──
  starting_from: "शुरुआत",
  select_package: "🪔 पूजा पैकेज चुनें",
  select_package_sub: "अपने परिवार के लिए उपयुक्त पैकेज चुनें",
  selected_package: "चुना गया पैकेज",
  tap_to_select: "👆 पैकेज चुनने के लिए टैप करें",
  trust_rituals: "प्रामाणिक अनुष्ठान", trust_prasad_del: "प्रसाद डिलीवरी",
  trust_secure: "सुरक्षित भुगतान", trust_pandits: "अनुभवी पंडित",
  trust_support: "लाइव अपडेट और सहायता",
  what_receive: "आपको क्या मिलेगा",
  rcv1: "अनुभवी पंडितों द्वारा संपूर्ण पूजा",
  rcv2: "आपके नाम और गोत्र में संकल्प",
  rcv3: "पवित्र प्रसाद आपके घर पहुंचाया जाएगा",
  rcv4: "पूजा समारोह की फोटो/वीडियो",
  rcv5: "मंत्र गणना के साथ पूजा प्रमाणपत्र",
  how_works: "यह कैसे काम करता है",
  step1t: "बुक करें", step1d: "पैकेज चुनें और सुरक्षित भुगतान करें",
  step2t: "पूजा संपन्न", step2d: "पंडित पवित्र स्थान पर पूजा करेंगे",
  step3t: "प्रसाद वितरण", step3d: "आपके घर पर प्रसाद पहुंचाया जाएगा",
  secure_pay: "🔒 Razorpay द्वारा सुरक्षित भुगतान",

  // ── Puja Listing ──
  puja_hero_title: "हर जरूरत के लिए पवित्र पूजाएं",
  puja_hero_sub: "सत्यापित पंडित, प्रामाणिक अनुष्ठान, दिव्य आशीर्वाद",
  puja_empty: "अभी कोई पूजा उपलब्ध नहीं है।",
  puja_starting: "शुरुआत",

  // ── Chadhava Detail ──
  breadcrumb_chadhava: "चढ़ावा",
  sacred_at: "में पवित्र चढ़ावा",
  per_offering: "प्रति चढ़ावा",
  offering_price: "चढ़ावा मूल्य",
  inclusive: "सभी अनुष्ठान और प्रसाद डिलीवरी सहित",
  whats_included: "✦ क्या शामिल है",
  devotees_served: "भक्त सेवित",
  authentic: "प्रामाणिक अनुष्ठान",
  avg_rating: "औसत रेटिंग",
  trust_temple: "प्रामाणिक मंदिर चढ़ावा",
  trust_priests: "सत्यापित मंदिर पुजारी",
  trust_prasad_home: "प्रसाद होम डिलीवरी",
  trust_cert: "आशीर्वाद प्रमाणपत्र",
  inc1: "सत्यापित पुजारियों द्वारा चढ़ावा",
  inc2: "आपके नाम और गोत्र में संकल्प",
  inc3: "पवित्र प्रसाद आपके घर पहुंचाया जाएगा",
  inc4: "समारोह का फोटो/वीडियो प्रमाण",
  inc5: "व्यक्तिगत आशीर्वाद प्रमाणपत्र",
  ch_step1t: "बुक करें", ch_step1d: "सुरक्षित ऑनलाइन भुगतान करें",
  ch_step2t: "चढ़ावा अर्पित", ch_step2d: "पुजारी मंदिर में चढ़ावा करेंगे",
  ch_step3t: "प्रसाद भेजा गया", ch_step3d: "आपके दरवाजे पर प्रसाद पहुंचाया जाएगा",
  tap_offering: "👆 चुनने के लिए ऊपर टैप करें",

  // ── Chadhava Listing ──
  chadhava_hero_title: "पवित्र मंदिरों में चढ़ावा चढ़ाएं",
  chadhava_hero_sub: "आपकी श्रद्धा, हमारी पवित्र सेवा",
  chadhava_section_title: "विशेष चढ़ावा अर्पण",
  chadhava_section_sub: "हर भक्त के लिए चुनिंदा चढ़ावा",
  chadhava_empty: "अभी कोई चढ़ावा उपलब्ध नहीं है।",

  // ── Cart ──
  cart_empty_title: "आपका कार्ट खाली है",
  cart_empty_sub: "अपनी आध्यात्मिक यात्रा शुरू करें — पूजा या चढ़ावा कार्ट में जोड़ें।",
  cart_title: "आपका पवित्र कार्ट",
  cart_subtitle: "चेकआउट से पहले अपनी अर्पण समीक्षा करें",
  cart_continue: "खरीदारी जारी रखें",
  cart_item: "आइटम", cart_qty: "मात्रा", cart_subtotal: "उप-कुल",
  cart_clear: "पूरा कार्ट खाली करें",
  cart_order_summary: "ऑर्डर सारांश",
  cart_total: "कुल",
  cart_secure: "सुरक्षित चेकआउट • प्रसाद आपके घर पहुंचाया जाएगा",

  // ── Footer ──
  footer_tagline: "जहाँ भक्ति मिलती है परंपरा से",
  footer_quick_links: "त्वरित लिंक",
  footer_services: "सेवाएं",
  footer_connect: "संपर्क करें",
  footer_copyright: "© 2025 नारायण कृपा। सर्वाधिकार सुरक्षित।",
  footer_privacy: "गोपनीयता नीति",
  footer_terms: "नियम एवं शर्तें",
  footer_grievance: "शिकायत",
  svc_darshan: "दैनिक दर्शन",
  svc_pandit: "पंडित परामर्श",
  svc_store: "पवित्र भंडार",
  svc_panchang: "पंचांग",
  svc_horoscope: "राशिफल",
  svc_tours: "मंदिर भ्रमण",
};

const TRANSLATIONS = { en: EN, hi: HI };

interface LangCtx { lang: Lang; setLang: (l: Lang) => void; t: (k: TKey) => string; }
const LanguageContext = createContext<LangCtx>({ lang: "en", setLang: () => {}, t: (k) => EN[k] });

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("nk_lang") as Lang) || "en");
  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem("nk_lang", l); };
  const t = (k: TKey): string => TRANSLATIONS[lang][k] ?? EN[k];
  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
