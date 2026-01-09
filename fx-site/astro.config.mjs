import { defineConfig } from "astro/config";

// Configure Astro to work both locally and on GitHub Pages.
// When running on GitHub Actions, use the repository name as the base.
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "fx-site";
const isGhPages = process.env.GITHUB_ACTIONS === "true";

export default defineConfig({
  site: isGhPages ? `https://example.github.io/${repo}/` : "http://localhost:4321/",
  base: isGhPages ? `/${repo}` : "/",
  output: "static",
});