import ListingHeader from "@/components/shared/ListingHeader";

/** Page title block. Kept as a wrapper so older pages keep their call sites;
    the decorative image heroes are retired in favour of a plain, fast header.
    `variant` and `bgImage` are accepted and ignored. */
const PageHero = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
  variant?: "maroon" | "saffron" | "brown" | "ivory";
  bgImage?: string;
}) => <ListingHeader title={title} subtitle={subtitle} />;

export default PageHero;
