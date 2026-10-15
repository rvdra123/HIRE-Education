# Cloud development configuration

The public resume checker now runs entirely in the browser. It needs no API
credential, billing, privacy-contact gate, rate-limit secret, or model-access
configuration. The former resume POST endpoint is disabled. The credential
instructions below describe legacy development setup only and do not activate
external resume analysis. Keep a working privacy contact for the website itself.

A reusable configuration draft has been saved for this task. It requests the exact official-source domains used by the application and verification work, an OpenAI credential binding, the database location, the privacy contact, and the private local service settings. It also saves the tested dependency-installation and application-start instructions.

Review and save the draft in environment settings, enter the missing values securely, and publish the environment. A saved draft does not apply runtime changes, and publishing this development environment does not publish the website to a public URL.

The cloud platform reserves secret target names beginning `OPENAI_`, so its credential field is named `HIRE_OPENAI_API_KEY`. The saved startup instructions map that binding to the application's normal server-only variable without printing it:

```sh
if [ -n "${HIRE_OPENAI_API_KEY:-}" ] && [ -z "${OPENAI_API_KEY:-}" ]; then
  export OPENAI_API_KEY="$HIRE_OPENAI_API_KEY"
fi
```

For a normal public hosting provider, set `OPENAI_API_KEY` directly in the server's secret settings. Do not put it in a `NEXT_PUBLIC_` variable or paste it in chat.

Scheduled and developer endpoints require their separate `CRON_SECRET` and `ADMIN_SECRET`. Keep the raw local service secrets private; they are not outbound API credentials.

Network access permits research and authorized collection. It does not establish a source's terms or grant scraping permission. Candidate sources stay disabled until their actual feeds, reuse permissions and robots rules are checked. The source configuration records what remains unverified.

After configuration changes are published, restart the service using the saved startup instructions, verify the real feed sources, and enable only approved adapters. Browser checking uses fictional fixtures for validation and never needs a provider call. No currently open listing has been fabricated to stand in for source verification.
