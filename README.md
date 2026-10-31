# pele-rehype

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Render ```mermaid fences with [**Pele**](https://pele.run); the fast,
synchronous Mermaid-to-SVG renderer with CSS-variable theming; in
**Astro**, **Starlight**, and any unified/rehype pipeline.

Built with the Pele author's blessing ([issue #17](https://github.com/obsidianmd/pele/issues/17)).

## Why

Starlight's built-in Mermaid ships the full Mermaid bundle to every
visitor. Pele is small, synchronous, dependency-free, and themes through
CSS variables; a better default for static docs.

## Install

```sh
bun add pele-rehype        # or: npm install pele-rehype
```

## Use (Astro / Starlight)

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { peleRehype } from "pele-rehype";

export default defineConfig({
  integrations: [starlight()],
  markdown: {
    rehypePlugins: [[peleRehype, { loader: true }]],
  },
});
```

That's it: every ```mermaid fence becomes a Pele mount target, and one
lazy module script loads Pele from the CDN and mounts all diagrams.

- Self-hosting Pele? Set `loader: false` and call
  `pele.mount(el, el.textContent)` yourself.
- Different CDN or class? `{ cdn: "...", className: "diagram" }`.
- Theming: Pele renders with CSS variables, so diagrams follow your
  Starlight dark/light theme automatically when you map the variables.

## API

```js
peleRehype(options?)          // rehype plugin
loaderSnippet(options?)       // the loader <script> string, for manual injection
```

| Option       | Default                                    | Meaning                       |
| ------------ | ------------------------------------------ | ----------------------------- |
| `loader`     | `true`                                     | Append the CDN loader script  |
| `cdn`        | jsDelivr `pele@1`                          | Loader script source          |
| `className`  | `"mermaid"`                                | Mount-target class name       |

## License

MIT; Pele itself is MIT too.
