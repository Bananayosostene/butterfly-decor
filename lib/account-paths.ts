/** Where an account goes after signing in. Clients never see the dashboard. */
export function homeFor(role: string | null | undefined) {
  if (role === "VENDOR") return "/account/my-gallery";
  if (role === "CLIENT") return "/vendors";
  // New accounts first answer "Are you a vendor?".
  return "/account/welcome";
}

/** Dashboard pages a vendor may open; everything else under /admin is for the site admin. */
export const VENDOR_DASHBOARD_PATHS = ["/account/my-gallery", "/account/my-profile"];
