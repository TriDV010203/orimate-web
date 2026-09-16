"use client";

// Global Next.js Image loader — configured via images.loaderFile in next.config.ts.
// Next.js 16 requires loaderFile modules to be Client Components since the
// function must be serialized to run in the browser.
export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  if (!src.includes("res.cloudinary.com")) return src;
  const params = `f_auto,c_limit,w_${width},q_${quality || 80}`;
  return src.replace("/image/upload/", `/image/upload/${params}/`);
}
