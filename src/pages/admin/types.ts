// ─── Admin Panel Type Definitions ───────────────────────────────

export interface PujaProduct {
  id: number;
  name: string;
  deity: string;
  purpose: string;
  language: string;
  duration: number;
  price: number;
  discountedPrice?: number;
  status: 'active' | 'inactive' | 'coming_soon';
  featured: boolean;
  rating: number;
  reviews: number;
  shortDescription: string;
  benefits: string[];
  included: string[];
  primaryImage: string;
  additionalImages: string[];
  altText: string;
  videoDelivery: string;
  prasadDelivery: boolean;
  prasadEstimate: string;
  digitalCertificate: boolean;
  nameGotra: boolean;
  lastModified: string;
}

export interface ChadhavaProduct {
  id: number;
  temple: string;
  city: string;
  state: string;
  deity: string;
  offering: string;
  price: number;
  discountedPrice?: number;
  status: 'active' | 'inactive';
  shortDescription: string;
  significance: string;
  devoteeReceives: string[];
  primaryImage: string;
  additionalImages: string[];
  altText: string;
  videoDelivery: string;
  certificateIncluded: boolean;
  nameGotra: boolean;
  lastModified: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  whatsappNo: string;
  contactEmail: string;
  businessHours: string;
  defaultPujaIncludes: string[];
  defaultPujaDelivery: string;
  defaultChadhavaReceives: string[];
  defaultChadhavaDelivery: string;
  showComingSoon: boolean;
  showDiscountedPrice: boolean;
  showRatings: boolean;
  defaultSort: string;
}

export interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export type NavSection = 'dashboard' | 'puja' | 'chadhava' | 'media' | 'settings';
