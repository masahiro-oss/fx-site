import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";

export const GET: APIRoute = async ({ site }) => {
  const postsDir = path.resolve("content/posts");
  const files = fs.existsSync(postsDir)
    ? fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"))
    : [];

  const urls = [
    new URL("/", site).toString(),
    ...files.map((f) => new URL(`/posts/${f.replace(/\.md$/, "")}/`, site).toString()),
  ];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n") +
    `\n</urlset>\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
};