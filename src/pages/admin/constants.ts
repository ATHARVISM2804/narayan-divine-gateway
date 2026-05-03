import type { PujaProduct, ChadhavaProduct, SiteSettings } from './types';

// ─── Constants ──────────────────────────────────────────────────

export const DEITIES = ['Ganesh', 'Shiva', 'Vishnu', 'Durga', 'Lakshmi', 'Hanuman', 'Navgraha', 'Saraswati', 'Shani Dev', 'Other'];
export const PURPOSES = ['Prosperity', 'Health', 'Marriage', 'Protection', 'Career', 'Education', 'Other'];
export const LANGUAGES = ['Hindi', 'Sanskrit', 'Both'];
export const STATUSES_PUJA = ['active', 'inactive', 'coming_soon'] as const;
export const STATUSES_CHADHAVA = ['active', 'inactive'] as const;
export const STATES_INDIA = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];
export const DELIVERY_OPTIONS = ['Within 24-48 hours', 'Within 3-5 days', 'Within 7 days', 'Same Day'];
export const SORT_OPTIONS = ['Newest First', 'Oldest First', 'Price: Low to High', 'Price: High to Low', 'Name: A-Z'];

// ─── Mock Puja Data ─────────────────────────────────────────────

export const INITIAL_PUJAS: PujaProduct[] = [
  {
    id: 1, name: 'Ganesh Puja', deity: 'Ganesh', purpose: 'Prosperity',
    language: 'Hindi', duration: 2, price: 1100, status: 'active',
    featured: true, rating: 4.9, reviews: 120,
    shortDescription: 'Invoke Lord Ganesh for removal of obstacles and new beginnings.',
    benefits: ['Removes obstacles from life', 'Blesses new ventures', 'Brings prosperity and wisdom'],
    included: ['HD Puja Video on WhatsApp', 'Digital Certificate', 'Prasad Delivery', 'Sankalp in your Name & Gotra', 'Certified Pandit'],
    primaryImage: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400',
    additionalImages: [], altText: 'Ganesh Puja ceremony',
    videoDelivery: 'Within 24-48 hours', prasadDelivery: true, prasadEstimate: '5-7 business days',
    digitalCertificate: true, nameGotra: true, lastModified: '2026-05-03T10:00:00Z',
  },
  {
    id: 2, name: 'Lakshmi Puja', deity: 'Lakshmi', purpose: 'Prosperity',
    language: 'Sanskrit', duration: 3, price: 2100, status: 'active',
    featured: true, rating: 4.9, reviews: 120,
    shortDescription: 'Invoke Goddess Lakshmi for wealth and abundance.',
    benefits: ['Attracts wealth and fortune', 'Brings financial stability', 'Blesses household with abundance'],
    included: ['HD Puja Video on WhatsApp', 'Digital Certificate', 'Prasad Delivery', 'Sankalp in your Name & Gotra', 'Certified Pandit'],
    primaryImage: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400',
    additionalImages: [], altText: 'Lakshmi Puja ceremony',
    videoDelivery: 'Within 24-48 hours', prasadDelivery: true, prasadEstimate: '5-7 business days',
    digitalCertificate: true, nameGotra: true, lastModified: '2026-05-02T14:00:00Z',
  },
  {
    id: 3, name: 'Maha Rudrabhishek', deity: 'Shiva', purpose: 'Health',
    language: 'Sanskrit', duration: 4, price: 5100, status: 'active',
    featured: false, rating: 4.9, reviews: 120,
    shortDescription: 'Sacred Rudra Abhishek for Lord Shiva\'s blessings.',
    benefits: ['Promotes physical and mental health', 'Removes negative energies', 'Brings inner peace'],
    included: ['HD Puja Video on WhatsApp', 'Digital Certificate', 'Prasad Delivery', 'Sankalp in your Name & Gotra', 'Certified Pandit'],
    primaryImage: 'https://images.unsplash.com/photo-1545468800-85cc9bc6ecf7?w=400',
    additionalImages: [], altText: 'Maha Rudrabhishek ceremony',
    videoDelivery: 'Within 24-48 hours', prasadDelivery: true, prasadEstimate: '5-7 business days',
    digitalCertificate: true, nameGotra: true, lastModified: '2026-05-01T09:00:00Z',
  },
  {
    id: 4, name: 'Satyanarayan Katha', deity: 'Vishnu', purpose: 'Prosperity',
    language: 'Hindi', duration: 3, price: 1500, status: 'active',
    featured: false, rating: 4.8, reviews: 120,
    shortDescription: 'Narrate the sacred katha of Lord Satyanarayan.',
    benefits: ['Fulfills wishes', 'Brings family harmony', 'Removes financial troubles'],
    included: ['HD Puja Video on WhatsApp', 'Digital Certificate', 'Prasad Delivery', 'Sankalp in your Name & Gotra', 'Certified Pandit'],
    primaryImage: 'https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?w=400',
    additionalImages: [], altText: 'Satyanarayan Katha',
    videoDelivery: 'Within 24-48 hours', prasadDelivery: true, prasadEstimate: '5-7 business days',
    digitalCertificate: true, nameGotra: true, lastModified: '2026-04-30T16:00:00Z',
  },
  {
    id: 5, name: 'Durga Saptashati Path', deity: 'Durga', purpose: 'Protection',
    language: 'Sanskrit', duration: 4, price: 2500, status: 'coming_soon',
    featured: false, rating: 4.9, reviews: 120,
    shortDescription: 'Recitation of the 700 verses for Maa Durga.',
    benefits: ['Divine protection from enemies', 'Courage and strength', 'Victory in legal matters'],
    included: ['HD Puja Video on WhatsApp', 'Digital Certificate', 'Sankalp in your Name & Gotra', 'Certified Pandit'],
    primaryImage: 'https://images.unsplash.com/photo-1623070755017-075d6f2e3a5b?w=400',
    additionalImages: [], altText: 'Durga Saptashati Path',
    videoDelivery: 'Within 24-48 hours', prasadDelivery: false, prasadEstimate: '',
    digitalCertificate: true, nameGotra: true, lastModified: '2026-04-28T11:00:00Z',
  },
  {
    id: 6, name: 'Hanuman Chalisa Path', deity: 'Hanuman', purpose: 'Protection',
    language: 'Hindi', duration: 1, price: 501, status: 'active',
    featured: true, rating: 5.0, reviews: 120,
    shortDescription: 'Powerful recitation of Hanuman Chalisa by certified pandits.',
    benefits: ['Protection from evil spirits', 'Boosts courage', 'Removes fear and anxiety'],
    included: ['HD Puja Video on WhatsApp', 'Digital Certificate', 'Sankalp in your Name & Gotra', 'Certified Pandit'],
    primaryImage: 'https://images.unsplash.com/photo-1567591370504-cc795e2e5b84?w=400',
    additionalImages: [], altText: 'Hanuman Chalisa Path',
    videoDelivery: 'Within 24-48 hours', prasadDelivery: false, prasadEstimate: '',
    digitalCertificate: true, nameGotra: true, lastModified: '2026-04-27T08:00:00Z',
  },
  {
    id: 7, name: 'Kaal Sarp Dosh Puja', deity: 'Shiva', purpose: 'Health',
    language: 'Sanskrit', duration: 2.5, price: 2100, status: 'active',
    featured: false, rating: 4.8, reviews: 120,
    shortDescription: 'Nullify the effects of Kaal Sarp Dosh in your kundali.',
    benefits: ['Neutralizes Kaal Sarp Dosh', 'Improves career prospects', 'Brings mental peace'],
    included: ['HD Puja Video on WhatsApp', 'Digital Certificate', 'Prasad Delivery', 'Sankalp in your Name & Gotra', 'Certified Pandit'],
    primaryImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    additionalImages: [], altText: 'Kaal Sarp Dosh Puja',
    videoDelivery: 'Within 24-48 hours', prasadDelivery: true, prasadEstimate: '5-7 business days',
    digitalCertificate: true, nameGotra: true, lastModified: '2026-04-25T12:00:00Z',
  },
  {
    id: 8, name: 'Saraswati Puja', deity: 'Saraswati', purpose: 'Education',
    language: 'Sanskrit', duration: 2, price: 1100, status: 'inactive',
    featured: false, rating: 4.7, reviews: 120,
    shortDescription: 'Seek blessings of Maa Saraswati for knowledge.',
    benefits: ['Enhances learning ability', 'Success in exams', 'Artistic and creative growth'],
    included: ['HD Puja Video on WhatsApp', 'Digital Certificate', 'Sankalp in your Name & Gotra', 'Certified Pandit'],
    primaryImage: 'https://images.unsplash.com/photo-1590650046871-92c51d0d3289?w=400',
    additionalImages: [], altText: 'Saraswati Puja ceremony',
    videoDelivery: 'Within 24-48 hours', prasadDelivery: false, prasadEstimate: '',
    digitalCertificate: true, nameGotra: true, lastModified: '2026-04-20T15:00:00Z',
  },
];

// ─── Mock Chadhava Data ─────────────────────────────────────────

export const INITIAL_CHADHAVAS: ChadhavaProduct[] = [
  {
    id: 1, temple: 'Kashi Vishwanath', city: 'Varanasi', state: 'Uttar Pradesh',
    deity: 'Shiva', offering: 'Bel Patra & Dhatura', price: 251, status: 'active',
    shortDescription: 'Traditional offering at the holiest Shiva temple.',
    significance: 'Bel Patra is considered the most sacred leaf for Lord Shiva.',
    devoteeReceives: ['HD Chadhava Video on WhatsApp', 'Offering Certificate', 'Name & Gotra chanted by Panditji'],
    primaryImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400',
    additionalImages: [], altText: 'Kashi Vishwanath Temple',
    videoDelivery: 'Within 24-48 hours', certificateIncluded: true, nameGotra: true,
    lastModified: '2026-05-03T09:00:00Z',
  },
  {
    id: 2, temple: 'Tirupati Balaji', city: 'Tirupati', state: 'Andhra Pradesh',
    deity: 'Vishnu', offering: 'Tulsi Mala & Laddu Prasad', price: 501, status: 'active',
    shortDescription: 'Sacred offering at the richest Hindu temple.',
    significance: 'Tulsi is the most sacred plant associated with Lord Vishnu.',
    devoteeReceives: ['HD Chadhava Video on WhatsApp', 'Offering Certificate', 'Name & Gotra chanted by Panditji'],
    primaryImage: 'https://images.unsplash.com/photo-1585136917228-44d4e9e2e049?w=400',
    additionalImages: [], altText: 'Tirupati Balaji Temple',
    videoDelivery: 'Within 24-48 hours', certificateIncluded: true, nameGotra: true,
    lastModified: '2026-05-02T11:00:00Z',
  },
  {
    id: 3, temple: 'Siddhivinayak', city: 'Mumbai', state: 'Maharashtra',
    deity: 'Ganesh', offering: 'Modak & Red Hibiscus', price: 351, status: 'active',
    shortDescription: 'Beloved offering to Ganpati Bappa in Mumbai.',
    significance: 'Modak is the favorite sweet of Lord Ganesh.',
    devoteeReceives: ['HD Chadhava Video on WhatsApp', 'Offering Certificate', 'Name & Gotra chanted by Panditji'],
    primaryImage: 'https://images.unsplash.com/photo-1577083288073-40892c0860a4?w=400',
    additionalImages: [], altText: 'Siddhivinayak Temple',
    videoDelivery: 'Within 24-48 hours', certificateIncluded: true, nameGotra: true,
    lastModified: '2026-05-01T13:00:00Z',
  },
  {
    id: 4, temple: 'Hanumangarhi', city: 'Ayodhya', state: 'Uttar Pradesh',
    deity: 'Hanuman', offering: 'Sindoor & Jasmine Garland', price: 251, status: 'active',
    shortDescription: 'Offer at the sacred hill temple in Ayodhya.',
    significance: 'Sindoor is considered auspicious for Lord Hanuman.',
    devoteeReceives: ['HD Chadhava Video on WhatsApp', 'Offering Certificate', 'Name & Gotra chanted by Panditji'],
    primaryImage: 'https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?w=400',
    additionalImages: [], altText: 'Hanumangarhi Temple',
    videoDelivery: 'Within 24-48 hours', certificateIncluded: true, nameGotra: true,
    lastModified: '2026-04-29T10:00:00Z',
  },
  {
    id: 5, temple: 'Shani Shingnapur', city: 'Ahmednagar', state: 'Maharashtra',
    deity: 'Shani Dev', offering: 'Mustard Oil & Black Sesame', price: 199, status: 'active',
    shortDescription: 'Appease Lord Shani for relief from Sade Sati.',
    significance: 'Mustard oil pacifies the malefic effects of Shani.',
    devoteeReceives: ['HD Chadhava Video on WhatsApp', 'Offering Certificate', 'Name & Gotra chanted by Panditji'],
    primaryImage: 'https://images.unsplash.com/photo-1545468800-85cc9bc6ecf7?w=400',
    additionalImages: [], altText: 'Shani Shingnapur Temple',
    videoDelivery: 'Within 24-48 hours', certificateIncluded: true, nameGotra: true,
    lastModified: '2026-04-26T14:00:00Z',
  },
  {
    id: 6, temple: 'Mahalakshmi Temple', city: 'Kolhapur', state: 'Maharashtra',
    deity: 'Lakshmi', offering: 'Lotus Flowers & Coconut', price: 301, status: 'inactive',
    shortDescription: 'Auspicious offering at one of the Shakti Peethas.',
    significance: 'Lotus is the seat of Goddess Lakshmi, symbolizing purity.',
    devoteeReceives: ['HD Chadhava Video on WhatsApp', 'Offering Certificate', 'Name & Gotra chanted by Panditji'],
    primaryImage: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400',
    additionalImages: [], altText: 'Mahalakshmi Temple Kolhapur',
    videoDelivery: 'Within 24-48 hours', certificateIncluded: true, nameGotra: true,
    lastModified: '2026-04-22T16:00:00Z',
  },
];

// ─── Initial Settings ───────────────────────────────────────────

export const INITIAL_SETTINGS: SiteSettings = {
  siteName: 'Narayan Kripa',
  tagline: 'Where Devotion Meets Tradition',
  logoUrl: '',
  whatsappNo: '+91 92863 49341',
  contactEmail: 'contact@narayankripa.in',
  businessHours: 'Mon–Sat, 9 AM – 7 PM IST',
  defaultPujaIncludes: [
    'HD Puja Video on WhatsApp',
    'Digital Certificate',
    'Prasad Delivery',
    'Sankalp in your Name & Gotra',
    'Certified Pandit',
  ],
  defaultPujaDelivery: 'Within 24-48 hours',
  defaultChadhavaReceives: [
    'HD Chadhava Video on WhatsApp',
    'Offering Certificate',
    'Name & Gotra chanted by Panditji',
  ],
  defaultChadhavaDelivery: 'Within 24-48 hours',
  showComingSoon: true,
  showDiscountedPrice: true,
  showRatings: true,
  defaultSort: 'Newest First',
};
