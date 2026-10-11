// Supabase returns at most 1000 rows per request (the project's max_rows) and says nothing
// when it cuts a list short, so admin lists that need every row load it page by page.
// The query must have a stable order (add an `id` tiebreak) or rows can repeat or go missing.

export const PAGE_SIZE = 1000;

type PageResult<T> = { data: T[] | null; error: unknown };

/** Calls `page(from, to)` (the query with `.range(from, to)`) until a short page comes back. */
export async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<PageResult<T>>,
): Promise<{ data: T[]; error: unknown }> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) return { data: rows, error };
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return { data: rows, error: null };
  }
}
