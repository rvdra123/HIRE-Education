import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
const root = process.cwd();
const pages = process.argv.includes("--pages");
const outputDirectory = pages ? "docs" : "downloads";
mkdirSync(outputDirectory, { recursive: true });
const entry = `import React from 'react';import{createRoot}from'react-dom/client';import StaticSite from './components/static/StaticSite';import './app/globals.css';createRoot(document.getElementById('root')).render(<StaticSite preview={${!pages}}/>);`;
const result = await build({
  stdin: {
    contents: entry,
    resolveDir: root,
    sourcefile: "preview-entry.tsx",
    loader: "tsx",
  },
  bundle: true,
  write: false,
  outfile: path.join(root, outputDirectory, "static-site.js"),
  minify: true,
  jsx: "automatic",
  platform: "browser",
  target: "es2020",
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.PRIVACY_CONTACT_EMAIL": JSON.stringify(
      process.env.PRIVACY_CONTACT_EMAIL || "",
    ),
    "process.env.SITE_OPERATOR_NAME": JSON.stringify(
      process.env.SITE_OPERATOR_NAME || "HIRE Education",
    ),
  },
  plugins: [
    {
      name: "preview-links",
      setup(api) {
        api.onLoad({ filter: /lib[\\/]resume[\\/]extract\.ts$/ }, (args) => {
          const worker = readFileSync(
            "node_modules/pdfjs-dist/build/pdf.worker.min.mjs",
            "utf8",
          );
          return {
            contents: readFileSync(args.path, "utf8").replace(
              /new URL\(\s*"pdfjs-dist\/build\/pdf\.worker\.min\.mjs",\s*import\.meta\.url,?\s*\)/,
              () =>
                `URL.createObjectURL(new Blob([${JSON.stringify(worker)}], {type: "text/javascript"}))`,
            ),
            loader: "ts",
          };
        });
        api.onResolve({ filter: /^next\/(link|image)$/ }, (args) => ({
          path: args.path.endsWith("image") ? "image" : "link",
          namespace: "preview",
        }));
        api.onLoad({ filter: /.*/, namespace: "preview" }, (args) => ({
          contents:
            args.path === "image"
              ? "import React from 'react';export default function Image({priority:_,...props}){return React.createElement('img',props)}"
              : "import React from 'react';import{staticHref}from'@/lib/static-site/routing';export default function Link({prefetch:_,href,...props}){return React.createElement('a',{...props,href:typeof href==='string'?staticHref(href):href})}",
          loader: "jsx",
          resolveDir: root,
        }));
      },
    },
  ],
});
const logo = `data:image/png;base64,${readFileSync("public/brand/hire-education.png").toString("base64")}`;
const js = result.outputFiles
  .find((f) => f.path.endsWith(".js"))
  .text.replaceAll("/brand/hire-education.png", logo)
  .replace(/<\/script/gi, "<\\/script");
const css = result.outputFiles.find((f) => f.path.endsWith(".css")).text;
const font = readFileSync(
  "node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",
).toString("base64");
const html = `<!doctype html><html lang="en-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>HIRE Education | Peel and GTA student career resources</title><link rel="icon" href="${logo}"><style>@font-face{font-family:'Manrope Variable';font-style:normal;font-weight:200 800;font-display:swap;src:url(data:font/woff2;base64,${font}) format('woff2')}${css}.offline-preview-note{padding:10px 20px;background:#203b5b;color:#eef5ff;text-align:center;font:12px/1.7 Arial,sans-serif}</style></head><body><div id="root"></div><noscript>Enable JavaScript to use the interactive guides.</noscript><script>${js}</script></body></html>`;
writeFileSync(
  path.join(outputDirectory, pages ? "index.html" : "HIRE-Education.html"),
  html,
);
if (pages) writeFileSync(path.join(outputDirectory, ".nojekyll"), "");
console.log(
  `${pages ? "GitHub Pages site" : "Offline edition"} built (${Math.round(Buffer.byteLength(html) / 1024)} KB). Resume checking and resources work locally; live opening and event status comes from the linked official sources.`,
);
