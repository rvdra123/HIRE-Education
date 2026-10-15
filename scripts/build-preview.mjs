import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
const root = process.cwd();
mkdirSync("downloads", { recursive: true });
const entry = `import React,{useEffect,useState} from 'react';import{createRoot}from'react-dom/client';import Home from './components/Home';import SiteHeader from './components/SiteHeader';import Catalogue from './components/opportunities/Catalogue';import EventsCalendar from './components/opportunities/EventsCalendar';import Reviewer from './components/resume/Reviewer';import PrivacyPage from './app/privacy/page';import PrivacyControls from './components/privacy/PrivacyControls';import './app/globals.css';
const actualFetch=window.fetch.bind(window);window.fetch=async(input,init)=>{const value=typeof input==='string'?input:input.url||String(input);if(value.startsWith('/api/')){if(value.startsWith('/api/resume-review'))return new Response(JSON.stringify({available:false}),{headers:{'Content-Type':'application/json'}});return new Response(JSON.stringify({items:[],total:0,page:1,pageSize:24,lastSuccessfulSync:null}),{headers:{'Content-Type':'application/json'}})}return actualFetch(input,init)};
function App(){const[route,setRoute]=useState('/');useEffect(()=>{function click(e){const link=e.target.closest?.('a[href]');const href=link?.getAttribute('href');if(!href?.startsWith('/'))return;e.preventDefault();const url=new URL(href,'https://preview.invalid');setRoute(url.pathname);requestAnimationFrame(()=>requestAnimationFrame(()=>{if(url.hash)document.getElementById(url.hash.slice(1))?.scrollIntoView();else window.scrollTo(0,0)}))}document.addEventListener('click',click);return()=>document.removeEventListener('click',click)},[]);return <><div className="offline-preview-note">Offline preview: live listings and AI reviews need the hosted website. All guides, practice tools, and privacy controls are available here.</div>{route==='/privacy'?<PrivacyPage/>:route==='/resume-reviewer'?<><SiteHeader/><main className="container feature-page"><div className="page-heading"><h1>AI resume reviewer for high school students</h1></div><Reviewer/></main></>:route==='/opportunities'?<><SiteHeader/><main className="container feature-page"><div className="page-heading"><h1>Student opportunities in Brampton</h1></div><Catalogue/><section id="events" className="events-section"><h2>Brampton youth events calendar</h2><EventsCalendar/></section></main></>:<Home/>}<PrivacyControls/></>};createRoot(document.getElementById('root')).render(<App/>);`;
const result = await build({
  stdin: {
    contents: entry,
    resolveDir: root,
    sourcefile: "preview-entry.tsx",
    loader: "tsx",
  },
  bundle: true,
  write: false,
  outfile: path.join(root, "downloads/preview.js"),
  minify: true,
  jsx: "automatic",
  platform: "browser",
  target: "es2020",
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.PRIVACY_CONTACT_EMAIL": '""',
    "process.env.SITE_OPERATOR_NAME": '"HIRE Education"',
  },
  plugins: [
    {
      name: "preview-links",
      setup(api) {
        api.onResolve({ filter: /^next\/(link|image)$/ }, (args) => ({
          path: args.path.endsWith("image") ? "image" : "link",
          namespace: "preview",
        }));
        api.onLoad({ filter: /.*/, namespace: "preview" }, (args) => ({
          contents:
            args.path === "image"
              ? "import React from 'react';export default function Image({priority:_,...props}){return React.createElement('img',props)}"
              : "import React from 'react';export default function Link({prefetch:_,...props}){return React.createElement('a',props)}",
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
const html = `<!doctype html><html lang="en-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>HIRE Education | Brampton student career resources</title><link rel="icon" href="${logo}"><style>@font-face{font-family:'Manrope Variable';font-style:normal;font-weight:200 800;font-display:swap;src:url(data:font/woff2;base64,${font}) format('woff2')}${css}.offline-preview-note{padding:10px 20px;background:#203b5b;color:#eef5ff;text-align:center;font:12px/1.7 Arial,sans-serif}</style></head><body><div id="root"></div><noscript>Enable JavaScript to use the interactive guides.</noscript><script>${js}</script></body></html>`;
writeFileSync("downloads/HIRE-Education.html", html);
console.log(
  `Offline preview built (${Math.round(Buffer.byteLength(html) / 1024)} KB). Live server features are explicitly unavailable in this version.`,
);
