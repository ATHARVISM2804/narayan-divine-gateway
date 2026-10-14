import { supabase } from "@/lib/supabase";

/*
 * Admin writes that cannot report "saved" when nothing was saved.
 *
 * Supabase answers an UPDATE or DELETE that matched no row with success and no error.
 * That happens when the login has expired (the request goes out as a visitor and the
 * database rules hide every row), when the row was deleted on another device, and —
 * with `version` — when someone saved the item after this form was opened. The admin
 * panel used to toast "updated" in all of those cases and the old value came back.
 * Every write here asks for the written rows back and treats none as a failure.
 */

export type AdminTable = "pujas" | "puja_offerings" | "chadhavas" | "chadhava_offerings" | "temples" | "reviews";

type Row = Record<string, unknown>;
interface Res { data: Row[] | Row | null; error: { message: string } | null }
interface Query extends PromiseLike<Res> {
  eq(column: string, value: unknown): Query;
  select(columns?: string): Query;
  maybeSingle(): PromiseLike<Res>;
}
/** The part of the Supabase client these helpers use (a fake one in tests). */
export interface WriteClient {
  from(table: string): {
    update(values: Row): Query;
    insert(values: Row): Query;
    delete(): Query;
    select(columns?: string): Query;
  };
}

export const MSG_CONFLICT =
  "Not saved: this was changed on another device after you opened it. Close it and open it again to see the latest, then make your change.";
export const MSG_GONE = "Not saved: this item no longer exists (it may have been deleted on another device). Close it and reload.";
export const MSG_LOGIN = "Not saved: your login has probably expired. Log out, log in again and retry.";
export const MSG_NETWORK = "Not saved: could not reach the server. Check the connection and try again.";

export class SaveError extends Error {}

const rows = (data: Res["data"]): Row[] => (Array.isArray(data) ? data : data ? [data] : []);

/** Works out why a write matched no row. */
async function explainNoRow(client: WriteClient, table: AdminTable, id: string, version?: string | null): Promise<string> {
  const { data, error } = await client.from(table).select("*").eq("id", id).maybeSingle();
  if (error) return MSG_NETWORK;
  const row = rows(data)[0];
  if (!row) return MSG_GONE;
  if (version && row.updated_at !== version) return MSG_CONFLICT;
  return MSG_LOGIN;
}

export interface UpdateOptions {
  /**
   * The row's `updated_at` when the form was opened. The save is refused if the row has
   * been saved since, so an old copy on another device can't overwrite newer values.
   */
  version?: string | null;
}

/** Updates one row and returns it as saved. Throws SaveError if nothing was written. */
export async function updateRow<T = Row>(
  table: AdminTable, id: string, values: Row, opts: UpdateOptions = {}, client: WriteClient = supabase as unknown as WriteClient,
): Promise<T> {
  let q = client.from(table).update(values).eq("id", id);
  if (opts.version) q = q.eq("updated_at", opts.version);
  const { data, error } = await q.select();
  if (error) throw new SaveError(error.message);
  const saved = rows(data)[0];
  if (!saved) throw new SaveError(await explainNoRow(client, table, id, opts.version));
  return saved as T;
}

/** Inserts one row and returns it as saved. */
export async function insertRow<T = Row>(
  table: AdminTable, values: Row, client: WriteClient = supabase as unknown as WriteClient,
): Promise<T> {
  const { data, error } = await client.from(table).insert(values).select();
  if (error) throw new SaveError(error.message);
  const saved = rows(data)[0];
  if (!saved) throw new SaveError(MSG_LOGIN);
  return saved as T;
}

/** Deletes one row. A row that is already gone counts as deleted. */
export async function deleteRow(
  table: AdminTable, id: string, client: WriteClient = supabase as unknown as WriteClient,
): Promise<void> {
  const { data, error } = await client.from(table).delete().eq("id", id).select("id");
  if (error) throw new SaveError(error.message);
  if (rows(data).length) return;
  const why = await explainNoRow(client, table, id);
  if (why !== MSG_GONE) throw new SaveError(why);
}

/** The message to show for a failed admin write. */
export const saveErrorMessage = (e: unknown): string =>
  e instanceof SaveError ? e.message : e instanceof Error && /fetch|network/i.test(e.message) ? MSG_NETWORK : e instanceof Error ? e.message : String(e);
