/** The business WhatsApp number (+91 prefix, digits only). */
export const WA_NUMBER = "919286345941";

/** wa.me link, optionally with a pre-filled message. */
export const whatsappLink = (text?: string): string =>
  `https://wa.me/${WA_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
