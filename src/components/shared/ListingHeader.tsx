import { cn } from "@/lib/utils";

/** Plain page header for listing and info pages: title, one promise.
    `centered`: title in capitals and centred, with the promise centred under it.
    `aside` fills the empty right side on laptops (hidden below lg); with
    `centered` it sits centred under the promise instead. */
const ListingHeader = ({
  title,
  subtitle,
  centered,
  aside,
}: {
  title: string;
  subtitle?: string;
  centered?: boolean;
  aside?: React.ReactNode;
}) => {
  return (
    <header className="border-b border-line bg-surface-muted/60">
      <div className={cn("container py-6 md:py-10 lg:py-12", !centered && "lg:flex lg:items-end lg:justify-between lg:gap-10")}>
        <div className="min-w-0">
          <h1
            className={cn(
              "text-[22px] font-bold text-ink md:text-[28px] lg:text-4xl lg:leading-tight",
              centered && "text-center uppercase tracking-wide",
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={cn(
                "mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-muted md:text-base lg:text-[17px]",
                centered && "mx-auto text-center",
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
        {aside && <div className={cn("hidden shrink-0", centered ? "lg:mt-6 lg:flex lg:justify-center" : "lg:block")}>{aside}</div>}
      </div>
    </header>
  );
};

export default ListingHeader;
