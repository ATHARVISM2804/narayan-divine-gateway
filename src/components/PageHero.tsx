import ListingHeader from "@/components/shared/ListingHeader";

/** Page title block. Kept as a wrapper so older pages keep their call sites;
    the decorative image heroes are retired in favour of a plain, fast header.
    `variant` and `bgImage` are accepted and ignored. */
const PageHero = ({
  title,
  subtitle,
  breadcrumb,
}: {
  title: string;
  subtitle?: string;
  variant?: "maroon" | "saffron" | "brown" | "ivory";
  breadcrumb?: string;
  bgImage?: string;
}) => <ListingHeader title={title} subtitle={subtitle} crumb={breadcrumb ?? title} />;

export default PageHero;
