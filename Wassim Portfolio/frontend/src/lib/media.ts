/** Resolve cover/media URLs for the static public site. */
export function publicMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/")) return url;
  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith("/covers/")) {
      return `${parsed.pathname}${parsed.search}`;
    }
    if (parsed.pathname.startsWith("/uploads/")) {
      const file = parsed.pathname.split("/uploads/")[1];
      return file ? `/covers/${file}` : url;
    }
    return url;
  } catch {
    return url;
  }
}
