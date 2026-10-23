/** Keep post-authentication navigation on this site, including browser URL normalization. */
export function accountReturnTo(value: string | null, siteOrigin = "https://account.invalid"): string {
  if (!value || value.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(value)) return "/account";
  if (!value.startsWith("/") && !/^https?:\/\//.test(value)) return "/account";
  try {
    const origin = new URL(siteOrigin).origin;
    const url = new URL(value, origin);
    return url.origin === origin ? `${url.pathname}${url.search}${url.hash}` : "/account";
  } catch {
    return "/account";
  }
}
