/**
 * In-app browsers (Facebook, Instagram, WhatsApp… and other Android WebViews).
 * Most of our traffic arrives from Meta ads inside these. They can't open Razorpay's
 * popup payment methods, and they often reload or kill the page while the customer is
 * in their UPI app — so checkout runs in redirect mode there.
 */
const IN_APP_RE = /FBAN|FBAV|FB_IAB|FBIOS|FB4A|Instagram|WhatsApp|Snapchat|Line\/|; wv\)/i;

export function isInAppBrowser(ua: string = typeof navigator !== "undefined" ? navigator.userAgent : ""): boolean {
  return IN_APP_RE.test(ua || "");
}

export function isIOS(ua: string = typeof navigator !== "undefined" ? navigator.userAgent : ""): boolean {
  return /iPhone|iPad|iPod/i.test(ua || "");
}
