import { supabase, type Temple } from "@/lib/supabase";
import { useCatalog } from "@/lib/catalog";
import { templesFromSnapshot } from "@/lib/catalogQueries";
// 720-px WebP copies (about 40 KB each) of the photos the site originally shipped
// with; the full-size JPEGs were 106–238 KB each for a tile about 256 px wide.
import fallbackTemple from "@/assets/temples/jagannath-puri.webp";
import imgShiva from "@/assets/temples/mahakaleshwar.webp";
import imgVishnu from "@/assets/temples/tirupati-balaji.webp";
import imgGanesh from "@/assets/temples/siddhivinayak.webp";
import imgDurga from "@/assets/temples/vaishno-devi.webp";
import imgDarshan from "@/assets/temples/kashi-vishwanath.webp";

/* Fallback photo per seeded temple, used only until an admin uploads a real
   image_url. Matches the images the site originally shipped with. */
const SEED_IMAGES: Record<string, string> = {
  "Kashi Vishwanath": imgDarshan,
  "Tirupati Balaji": imgVishnu,
  Siddhivinayak: imgGanesh,
  "Vaishno Devi": imgDurga,
  "Jagannath Puri": fallbackTemple,
  Mahakaleshwar: imgShiva,
};

/** Uploaded image wins; else the seed image for that temple; else generic. */
export const templeImg = (tp: Temple) => tp.image_url || SEED_IMAGES[tp.name] || fallbackTemple;

/** Active temples in admin order. Shared by the home grid and the Temples page. */
export function useActiveTemples() {
  return useCatalog<Temple[]>(
    "temples:active",
    (signal) =>
      supabase
        .from("temples")
        .select("*")
        .eq("status", "active")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .retry(false)
        .abortSignal(signal)
        .returns<Temple[]>(),
    templesFromSnapshot,
  );
}
