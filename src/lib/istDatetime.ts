/*
 * The countdown time is a `timestamptz` column, but the admin form uses a
 * `<input type="datetime-local">`, which has no time zone. The form used to save the
 * bare "2026-10-19T16:00", which Postgres reads as UTC, so the timer ended at 9:30 PM
 * IST instead of 4:00 PM, and the saved value ("…16:00:00+00:00") showed as a blank box
 * when the form was reopened. The admin always means India time.
 */

const IST_OFFSET_MS = 330 * 60 * 1000;
const LOCAL_INPUT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

/** A stored timestamp (or a value typed in the form) as "YYYY-MM-DDTHH:mm" in IST, for the input. */
export function toIstInput(value: string | null | undefined): string {
  if (!value) return "";
  if (LOCAL_INPUT.test(value)) return value.slice(0, 16); // typed in the form, already IST
  const t = new Date(value).getTime();
  if (Number.isNaN(t)) return "";
  return new Date(t + IST_OFFSET_MS).toISOString().slice(0, 16);
}

/** The form value as a timestamp with the IST offset, or null when empty. */
export function fromIstInput(value: string | null | undefined): string | null {
  const v = value?.trim();
  if (!v) return null;
  if (LOCAL_INPUT.test(v)) return `${v.slice(0, 16)}:00+05:30`;
  return v; // an untouched stored value already carries its zone
}
