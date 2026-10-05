/**
 * A small cookie the header can read to show who is signed in (name, email and kind of account).
 * It is only for display: the real sessions are the httpOnly cookies, which the browser cannot
 * read, and every protected page and action checks those — never this hint.
 *
 * Reading it in the browser keeps the header off the server, so pages that are built ahead of
 * time (like the homepage) stay that way.
 */

export const ACCOUNT_HINT_COOKIE = "bfly_account";

export type AccountKind = "ADMIN" | "VENDOR" | "CLIENT" | "NEW";
export type AccountHint = { name: string; email: string; kind: AccountKind; avatarUrl?: string | null };

export function encodeAccountHint(hint: AccountHint) {
  return encodeURIComponent(JSON.stringify(hint));
}

/** Browser only: the signed-in account according to the hint cookie, or null. */
export function readAccountHint(): AccountHint | null {
  const entry = document.cookie.split("; ").find((c) => c.startsWith(`${ACCOUNT_HINT_COOKIE}=`));
  if (!entry) return null;
  try {
    const hint = JSON.parse(decodeURIComponent(decodeURIComponent(entry.slice(ACCOUNT_HINT_COOKIE.length + 1))));
    return typeof hint?.name === "string" && typeof hint?.email === "string" ? hint : null;
  } catch {
    return null;
  }
}
