import { describe, expect, test } from "bun:test";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { loaderSnippet, peleRehype } from "../src/index.js";

const MD = ["# Doc", "", "```mermaid", "graph TD; A-->B", "```", "", "done."].join("\n");

const pipeline = (plugin) =>
  unified().use(remarkParse).use(remarkRehype).use(plugin).use(rehypeStringify, { allowDangerousHtml: true });

test("rewrites mermaid fences to the pele mount target + loader", () => {
  const html = pipeline([[peleRehype]]).processSync(MD).toString();
  expect(html).toContain(`<pre class="mermaid">graph TD; A-->B`);
  expect(html).not.toContain("language-mermaid");
  expect(html).toContain('import pele from "https://cdn.jsdelivr.net/npm/pele@1/dist/pele.global.js"');
  expect(html).toContain('querySelectorAll("pre.mermaid")');
});

test("loader: false keeps the output static", () => {
  const html = pipeline([[peleRehype, { loader: false }]]).processSync(MD).toString();
  expect(html).toContain('<pre class="mermaid">');
  expect(html).not.toContain("<script");
});

test("custom cdn and className are honored", () => {
  const html = pipeline([
    [peleRehype, { loader: true, cdn: "https://example.com/pele.js", className: "diagram" }],
  ])
    .processSync(MD)
    .toString();
  expect(html).toContain('<pre class="diagram">');
  expect(html).toContain('import pele from "https://example.com/pele.js"');
});

test("non-mermaid fences are untouched", () => {
  const md = ["```rust", "fn main() {}", "```"].join("\n");
  const html = pipeline([[peleRehype]]).processSync(md).toString();
  expect(html).toContain("language-rust");
  expect(html).not.toContain("pele.global.js");
});

test("loaderSnippet returns the injection string", () => {
  expect(loaderSnippet()).toContain("pele.mount(el, el.textContent)");
});

test("no mermaid fences means no loader is appended", () => {
  const html = pipeline([[peleRehype]]).processSync("# plain").toString();
  expect(html).not.toContain("<script");
});
