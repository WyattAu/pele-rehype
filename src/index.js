/**
 * pele-rehype — a rehype plugin that prepares ```mermaid fences for
 * [Pele](https://pele.run), the fast Mermaid-to-SVG renderer with
 * CSS-variable theming.
 *
 * remark-rehype turns a ```mermaid fence into:
 *
 *     <pre><code class="language-mermaid">graph TD; A-->B</code></pre>
 *
 * This plugin rewrites that to Pele's mount target:
 *
 *     <pre class="mermaid">graph TD; A-->B</pre>
 *
 * and — with `loader: true` (default) — appends a single lazy module
 * script that imports Pele from a CDN and mounts every `pre.mermaid`
 * on the page. Sites that self-host Pele can set `loader: false` and
 * call `pele.mount` themselves.
 *
 * @typedef {Object} Options
 * @property {boolean} [loader=true] Append the CDN loader script.
 * @property {string} [cdn="https://cdn.jsdelivr.net/npm/pele@1/dist/pele.global.js"]
 *   Loader script source (only when `loader` is true).
 * @property {string} [className="mermaid"] Mount-target class name.
 */

const DEFAULT_CDN = "https://cdn.jsdelivr.net/npm/pele@1/dist/pele.global.js";

function loaderScript(cdn, className) {
  return (
    '<script type="module">' +
    `import pele from "${cdn}";` +
    `for (const el of document.querySelectorAll("pre.${className}")) pele.mount(el, el.textContent);` +
    "</script>"
  );
}

/** Is this element node a `<code class="language-mermaid">`? */
function isMermaidCode(node) {
  return (
    node.tagName === "code" &&
    Array.isArray(node.properties?.className) &&
    node.properties.className.includes("language-mermaid")
  );
}

/** Flatten a node's text content (handles nested text + elements). */
function textContent(node) {
  if (node.type === "text") return node.value;
  if (Array.isArray(node.children)) return node.children.map(textContent).join("");
  return "";
}

/**
 * The rehype plugin. Factory form: `rehypePlugins: [[peleRehype, options]]`.
 * @param {Options} [options]
 */
export function peleRehype(options = {}) {
  const {
    loader = true,
    cdn = DEFAULT_CDN,
    className = "mermaid",
  } = options;

  return (tree) => {
    let count = 0;
    visitPreCode(tree);

    function visitPreCode(node) {
      if (!Array.isArray(node.children)) return;
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.tagName === "pre" && Array.isArray(child.children)) {
          const code = child.children.find(isMermaidCode);
          if (code) {
            const source = textContent(code);
            child.properties = { ...(child.properties || {}), className: [className] };
            child.children = [{ type: "text", value: source }];
            count++;
            continue;
          }
        }
        visitPreCode(child);
      }
    }

    if (loader && count > 0) {
      tree.children.push({
        type: "raw",
        value: loaderScript(cdn, className),
      });
    }
    return tree;
  };
}

/** The loader snippet, for sites that self-manage injection. */
export function loaderSnippet(options = {}) {
  const { cdn = DEFAULT_CDN, className = "mermaid" } = options;
  return loaderScript(cdn, className);
}
