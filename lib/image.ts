/**
 * Asks Cloudinary for a resized, auto-format (WebP/AVIF), auto-quality version of an uploaded
 * image instead of the original file. Non-Cloudinary URLs are returned unchanged.
 */
export function cldImage(url: string, width: number): string {
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) return url;
  return url.replace("/image/upload/", `/image/upload/f_auto,q_auto,c_limit,w_${width}/`);
}
