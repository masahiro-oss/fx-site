import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

const readCsv = (p) =>
  parse(fs.readFileSync(p, "utf-8"), {
    columns: true,
    skip_empty_lines: true,
  });

const pages = readCsv("data/pages.csv");
const ctas = Object.fromEntries(
  readCsv("data/cta.csv").map((r) => [r.cv_type, r])
);
const dict = readCsv("data/dictionary.csv");
const links = readCsv("data/internal_links.csv");

const postsDir = path.resolve("content/posts");
fs.mkdirSync(postsDir, { recursive: true });

const noDoubleQuotes = (s) => s.replaceAll("\"", "");

const rewriteByDict = (s) => {
  let out = s;
  for (const { term, rewrite } of dict) {
    out = out.split(term).join(rewrite);
  }
  return out;
};

const internalLinkBlock = (slug) => {
  const outs = links.filter((l) => l.from_slug === slug);
  if (!outs.length) return "";
  const lines = outs.map(
    (l) => `- [${l.anchor}](/posts/${l.to_slug}/)`
  );
  return `\n## 関連ページ\n${lines.join("\n")}\n`;
};

for (const p of pages) {
  const slug = p.page_slug.trim();
  const title = `${p.primary_kw}｜構造と結論`;
  const primary_kw = p.primary_kw;
  const secondary_kw = p.secondary_kw;
  const intent = p.search_intent;
  const h2s = p.h2_list.split("|").map((s) => s.trim()).filter(Boolean);
  const h3Map = {};
  for (const part of p.h3_map.split("|")) {
    const [h2, h3s] = part.split(":");
    if (!h2 || !h3s) continue;
    h3Map[h2.trim()] = h3s
      .split("/")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const cta = ctas[p.cv_type] ?? {
    cta_title: "次の行動",
    cta_steps:
      "ステップ1 情報整理|ステップ2 検証|ステップ3 小さく実行",
  };
  const ctaSteps = cta.cta_steps
    .split("|")
    .map((s) => `- ${s.trim()}`)
    .join("\n");

  let body = `---\n`;
  body += `title: ${title}\n`;
  body += `slug: ${slug}\n`;
  body += `primary_kw: ${primary_kw}\n`;
  body += `secondary_kw: ${secondary_kw}\n`;
  body += `intent: ${intent}\n`;
  body += `---\n\n`;
  body += `# ${primary_kw}\n\n`;
  body += `- 検索意図: ${intent}\n`;
  body += `- 関連: ${secondary_kw}\n\n`;
  for (const h2 of h2s) {
    body += `## ${h2}\n\n`;
    const h3s = h3Map[h2] ?? [];
    if (h3s.length) {
      for (const h3 of h3s) {
        body += `### ${h3}\n\n`;
        body += `- 要点\n`;
        body += `- チェック\n`;
        body += `- 行動\n\n`;
      }
    } else {
      body += `- 要点\n- チェック\n- 行動\n\n`;
    }
  }
  body += `## ${cta.cta_title}\n\n${ctaSteps}\n`;
  body += internalLinkBlock(slug);
  body = rewriteByDict(body);
  body = noDoubleQuotes(body);
  fs.writeFileSync(
    path.join(postsDir, `${slug}.md`),
    body,
    "utf-8",
  );
}
console.log(`generated: ${pages.length} pages -> content/posts`);