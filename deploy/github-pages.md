# Publish with GitHub Pages

The ready-to-publish site is in `docs/index.html`. It includes its styles, font,
logo, scripts, and PDF-reading worker. No npm installation or secret is needed
on GitHub Pages. `docs/.nojekyll` tells Pages to serve these files directly.

In this repository's **Settings → Pages**:

1. Under Build and deployment, select **Deploy from a branch**.
2. Select branch **hire-education-launch**, folder **/docs**, and **Save**.
3. Wait for the Pages deployment to finish. GitHub shows the actual published
   URL and a Visit site button on this settings page.

For the current repository, the expected default address is:

`https://rvdra123.github.io/HIRE-Education/`

The checker has a shareable link at:

`https://rvdra123.github.io/HIRE-Education/#/resume-reviewer`

These addresses are usable after Pages has been enabled and deployed. A Git
push alone does not enable a repository's Pages setting. Custom-domain settings
can change the address; use the URL shown by GitHub if one is configured.

## What works

The site includes the employer/program directory, free-learning catalogue,
resume and cover-letter guides, local PDF/DOCX/TXT resume checker, interview
practice, resources, privacy policy, and optional browser storage controls.
Navigation uses hash routes so links, reloads, and back/forward navigation work
inside the repository URL without server rewrites.

GitHub Pages does not run the Next.js API or database. This edition links to
official sources for current vacancies and event dates. It does not publish
invented verified listings or claim that live feeds are running. The full
Next.js/server edition remains available for Vercel or another server host.

## Update the published site

After changing source components or resource data:

```sh
npm ci
npm run build:pages
npm run test:pages
git add docs
```

Commit and push the source changes together with `docs`. GitHub Pages then
publishes the updated folder. The generated HTML does not automatically change
when source files alone change. The browser smoke check uses Chromium at
`/usr/bin/chromium`; adjust that path for another development machine.

Only the named public privacy contact and site operator environment values are
compiled into this static edition when supplied to the build. API credentials
are not used or included. Publish a working privacy contact for the operator.
