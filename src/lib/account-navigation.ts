/** Keep post-authentication navigation on this site, including browser URL normalization. */
export function accountReturnTo(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(value)) return "/account";
  try {
    const origin = "https://account.invalid";
    const url = new URL(value, origin);
    return url.origin === origin ? `${url.pathname}${url.search}${url.hash}` : "/account";
  } catch {
    return "/account";
  }
}
