import { supabase, type Temple } from "@/lib/supabase";
import { useCatalog } from "@/lib/catalog";
import { templesFromSnapshot } from "@/lib/catalogQueries";
import fallbackTemple from "@/assets/hero-temple.jpg";
import imgShiva from "@/assets/puja-shiva.jpg";
import imgVishnu from "@/assets/puja-vishnu.jpg";
import imgGanesh from "@/assets/puja-ganesh.jpg";
import imgDurga from "@/assets/puja-durga.jpg";
import imgDarshan from "@/assets/hero-darshan.jpg";

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
