export interface DiffExample {
  id: string;
  label: string;
  category: string;
  languageId: string;
  leftFilename: string;
  rightFilename: string;
  left: string;
  right: string;
}

const TEXT_LEFT = `Release Notes -- Aurora Client, Internal Draft

Overview
Aurora is our cross-platform desktop client for the Meridian analytics platform. This document summarizes the changes planned for the upcoming 4.2 release, gathered from the engineering, design, and support teams during the September planning cycle. Please read through the whole document before the Thursday sync so we can finalize scope together.

Highlights
- Faster startup time on Windows and macOS thanks to the new lazy-loading module graph introduced by the platform team in August, which defers loading of rarely used panels until they are first opened by the user.
- Redesigned sidebar navigation with collapsible sections, recently visited workspaces, and a quick switcher that can be triggered with Ctrl+K or Cmd+K depending on the operating system in use.
- The offline cache now persists up to 30 days of history instead of 7, and compresses older entries using the same delta encoding scheme used by the sync engine to keep local disk usage reasonable for laptop users.
- Support for custom keyboard shortcut profiles, including presets that mimic popular editors so users coming from other tools feel at home immediately without having to relearn muscle memory.

Known Issues
- On some high-DPI external monitors, the tooltip for the export button can render slightly offset from the cursor position, especially when the monitor is rotated to portrait orientation.
- The CSV export occasionally drops the timezone suffix when the source data spans a daylight saving time transition, which the data team is tracking separately as ticket AUR-4471.
- Large workspaces with more than 50,000 rows can take noticeably longer to open on first launch after an update, because the local index has to be rebuilt from scratch the first time.

Migration Notes
Users upgrading from 3.x will see a one-time migration dialog that walks through re-authenticating with their identity provider and re-downloading any pinned dashboards, since the storage format for pinned items changed in this release to support the new folder hierarchy feature that design has been asking for since early this year.

Support Team Notes
Please expect an increase in tickets related to the new quick switcher shortcut conflicting with existing OS-level shortcuts on some Linux window managers, particularly i3 and sway, where Ctrl+K is sometimes bound to line-kill in terminal emulators embedded in the client.

Timeline
- Code freeze: end of next week
- Internal beta: two weeks from now, rolled out to the internal dogfooding channel first
- Public release: pending sign-off from the support and design leads, targeted for the following month assuming no major regressions are found during the internal beta window

Open Questions
1. Should the quick switcher default shortcut differ per platform to avoid the Linux terminal conflict mentioned above, or should we just document the override path more clearly in the release notes and settings page?
2. Do we want to ship the new keyboard shortcut presets as opt-in during onboarding, or silently apply the closest match based on the user's previously installed editors detected on first launch?
3. Is 30 days the right default for the offline cache retention window, or should it be configurable per workspace given that some enterprise customers have expressed concerns about local storage usage on managed devices?

Thanks everyone for the input so far -- see you at the sync.
`;

const TEXT_RIGHT = `Release Notes -- Aurora Client, v4.2

Overview
Aurora is our cross-platform desktop client for the Meridian analytics platform. This document summarizes the confirmed changes for the 4.2 release, gathered from the engineering, design, and support teams during the September planning cycle and finalized during the Thursday sync. Thanks to everyone who contributed feedback before the deadline.

Highlights
- Faster startup time on Windows, macOS, and Linux thanks to the new lazy-loading module graph introduced by the platform team in August, which defers loading of rarely used panels until they are first opened by the user.
- Redesigned sidebar navigation with collapsible sections, recently visited workspaces, favorites pinning, and a quick switcher that can be triggered with Ctrl+K or Cmd+K depending on the operating system in use, with a documented override for conflicting shortcuts.
- The offline cache now persists up to 30 days of history instead of 7, and compresses older entries using the same delta encoding scheme used by the sync engine to keep local disk usage reasonable for laptop users. Enterprise admins can override the retention window from the admin console.
- Support for custom keyboard shortcut profiles, including presets that mimic popular editors so users coming from other tools feel at home immediately without having to relearn muscle memory. Presets are now opt-in during onboarding rather than auto-applied.
- New: workspace folders, allowing pinned dashboards to be organized into nested groups, which required the storage format migration described below.

Known Issues
- On some high-DPI external monitors, the tooltip for the export button can render slightly offset from the cursor position, especially when the monitor is rotated to portrait orientation. A fix is scheduled for 4.2.1.
- The CSV export occasionally drops the timezone suffix when the source data spans a daylight saving time transition, tracked as ticket AUR-4471, targeted for 4.2.1 as well.
- Large workspaces with more than 50,000 rows can take noticeably longer to open on first launch after an update, because the local index has to be rebuilt from scratch the first time. A progress indicator has been added so this is at least visible to the user now.

Migration Notes
Users upgrading from 3.x will see a one-time migration dialog that walks through re-authenticating with their identity provider and re-downloading any pinned dashboards, since the storage format for pinned items changed in this release to support the new folder hierarchy feature that design has been asking for since early this year. The migration is resumable if interrupted.

Support Team Notes
The quick switcher default shortcut now falls back automatically on Linux window managers where Ctrl+K is already bound at the OS level, and a settings page section documents how to rebind it manually if the automatic fallback picks the wrong combination.

Timeline
- Code freeze: complete
- Internal beta: complete, no major regressions found
- Public release: this Friday, rolling out region by region starting with North America

Resolved Questions
1. The quick switcher shortcut now auto-detects conflicts per platform and falls back to Ctrl+Shift+K on affected Linux window managers, with the override documented in Settings > Keyboard Shortcuts.
2. Keyboard shortcut presets ship as opt-in during onboarding, presented as a single "Import shortcuts from..." step rather than silently applied.
3. The 30 day offline cache retention window is now configurable per workspace from the admin console, addressing the enterprise storage concerns raised during planning.

Thanks everyone for shipping this together.
`;

const JSON_LEFT = `{
  "name": "meridian-api-gateway",
  "version": "2.4.0",
  "private": true,
  "description": "Edge gateway for the Meridian platform, handling auth, rate limiting, and request routing to internal services.",
  "engines": {
    "node": ">=18.17.0"
  },
  "scripts": {
    "dev": "node --watch src/server.js",
    "build": "esbuild src/server.js --bundle --platform=node --outfile=dist/server.js",
    "start": "node dist/server.js",
    "test": "vitest run",
    "lint": "eslint src --ext .js,.ts"
  },
  "dependencies": {
    "express": "^4.19.2",
    "helmet": "^7.1.0",
    "ioredis": "^5.3.2",
    "jsonwebtoken": "^9.0.2",
    "pino": "^8.19.0",
    "prom-client": "^15.1.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "esbuild": "^0.20.1",
    "eslint": "^8.57.0",
    "vitest": "^1.3.1"
  },
  "config": {
    "rateLimit": {
      "windowMs": 60000,
      "maxRequests": 120,
      "keyGenerator": "ip",
      "trustProxyDepth": 1
    },
    "routes": [
      { "prefix": "/v1/accounts", "target": "http://accounts-service.internal:8081", "timeoutMs": 5000, "retries": 1 },
      { "prefix": "/v1/billing", "target": "http://billing-service.internal:8082", "timeoutMs": 8000, "retries": 0 },
      { "prefix": "/v1/reports", "target": "http://reports-service.internal:8083", "timeoutMs": 15000, "retries": 2 },
      { "prefix": "/v1/notifications", "target": "http://notify-service.internal:8084", "timeoutMs": 4000, "retries": 1 }
    ],
    "cors": {
      "allowedOrigins": ["https://app.meridian.io", "https://admin.meridian.io"],
      "allowCredentials": true
    },
    "featureFlags": {
      "enableGraphqlProxy": false,
      "enableWebsocketUpgrade": true,
      "enableRequestSigning": false
    }
  },
  "logging": {
    "level": "info",
    "redactPaths": ["req.headers.authorization", "req.body.password"],
    "destination": "stdout"
  }
}
`;

const JSON_RIGHT = `{
  "name": "meridian-api-gateway",
  "version": "2.5.0",
  "private": true,
  "description": "Edge gateway for the Meridian platform, handling auth, rate limiting, request routing, and now request signing for internal services.",
  "engines": {
    "node": ">=20.11.0"
  },
  "scripts": {
    "dev": "node --watch src/server.js",
    "build": "esbuild src/server.js --bundle --platform=node --outfile=dist/server.js --minify",
    "start": "node dist/server.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src --ext .js,.ts"
  },
  "dependencies": {
    "express": "^4.19.2",
    "helmet": "^7.1.0",
    "ioredis": "^5.3.2",
    "jsonwebtoken": "^9.0.2",
    "pino": "^8.19.0",
    "prom-client": "^15.1.0",
    "zod": "^3.22.4",
    "undici": "^6.10.1"
  },
  "devDependencies": {
    "esbuild": "^0.20.1",
    "eslint": "^8.57.0",
    "vitest": "^1.3.1",
    "supertest": "^6.3.4"
  },
  "config": {
    "rateLimit": {
      "windowMs": 60000,
      "maxRequests": 200,
      "keyGenerator": "ip",
      "trustProxyDepth": 2
    },
    "routes": [
      { "prefix": "/v1/accounts", "target": "http://accounts-service.internal:8081", "timeoutMs": 5000, "retries": 1 },
      { "prefix": "/v1/billing", "target": "http://billing-service.internal:8082", "timeoutMs": 8000, "retries": 1 },
      { "prefix": "/v1/reports", "target": "http://reports-service.internal:8083", "timeoutMs": 20000, "retries": 2 },
      { "prefix": "/v1/notifications", "target": "http://notify-service.internal:8084", "timeoutMs": 4000, "retries": 1 },
      { "prefix": "/v1/search", "target": "http://search-service.internal:8085", "timeoutMs": 6000, "retries": 1 }
    ],
    "cors": {
      "allowedOrigins": ["https://app.meridian.io", "https://admin.meridian.io", "https://partners.meridian.io"],
      "allowCredentials": true
    },
    "featureFlags": {
      "enableGraphqlProxy": false,
      "enableWebsocketUpgrade": true,
      "enableRequestSigning": true
    }
  },
  "logging": {
    "level": "info",
    "redactPaths": ["req.headers.authorization", "req.body.password", "req.body.cardNumber"],
    "destination": "stdout",
    "sampling": { "enabled": true, "rate": 0.25 }
  }
}
`;

const HTML_LEFT = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Meridian -- Analytics for growing teams</title>
  <meta name="description" content="Meridian gives your whole team a single, shared view of the metrics that matter, updated in real time." />
  <link rel="stylesheet" href="/assets/site.css" />
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/">Meridian</a>
    <nav>
      <a href="/product">Product</a>
      <a href="/pricing">Pricing</a>
      <a href="/docs">Docs</a>
      <a href="/blog">Blog</a>
    </nav>
    <a class="cta" href="/signup">Start free trial</a>
  </header>

  <main>
    <section class="hero">
      <h1>One dashboard for every metric that matters</h1>
      <p>Meridian connects to the tools you already use and turns raw events into dashboards your whole team can trust, without waiting on a data engineer.</p>
      <div class="hero-actions">
        <a class="button primary" href="/signup">Start free trial</a>
        <a class="button secondary" href="/demo">Watch a 2 minute demo</a>
      </div>
    </section>

    <section class="logos">
      <p>Trusted by teams at</p>
      <ul>
        <li><img src="/logos/acme.svg" alt="Acme" /></li>
        <li><img src="/logos/globex.svg" alt="Globex" /></li>
        <li><img src="/logos/initech.svg" alt="Initech" /></li>
      </ul>
    </section>

    <section class="features">
      <article>
        <h2>Real-time by default</h2>
        <p>Every dashboard updates as new events arrive, so nobody is ever looking at yesterday's numbers.</p>
      </article>
      <article>
        <h2>Built for collaboration</h2>
        <p>Comment directly on charts, tag teammates, and turn a spike in the data into a resolved incident in minutes.</p>
      </article>
      <article>
        <h2>Governed access</h2>
        <p>Row-level permissions mean everyone sees the numbers they need, and nothing they don't.</p>
      </article>
    </section>
  </main>

  <footer class="site-footer">
    <p>&copy; 2026 Meridian, Inc. All rights reserved.</p>
  </footer>
</body>
</html>
`;

const HTML_RIGHT = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Meridian -- Real-time analytics for growing teams</title>
  <meta name="description" content="Meridian gives your whole team a single, shared view of the metrics that matter, updated in real time, with governed access built in." />
  <link rel="stylesheet" href="/assets/site.css" />
  <link rel="preconnect" href="https://cdn.meridian.io" />
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/">Meridian</a>
    <nav>
      <a href="/product">Product</a>
      <a href="/pricing">Pricing</a>
      <a href="/customers">Customers</a>
      <a href="/docs">Docs</a>
      <a href="/blog">Blog</a>
    </nav>
    <a class="cta" href="/signup">Start free trial</a>
  </header>

  <main>
    <section class="hero">
      <h1>One dashboard for every metric that matters</h1>
      <p>Meridian connects to the tools you already use and turns raw events into dashboards your whole team can trust, without waiting on a data engineer. Now with row-level governance built in from day one.</p>
      <div class="hero-actions">
        <a class="button primary" href="/signup">Start free trial</a>
        <a class="button secondary" href="/demo">Watch a 2 minute demo</a>
        <a class="button ghost" href="/pricing">See pricing</a>
      </div>
    </section>

    <section class="logos">
      <p>Trusted by over 4,000 teams, including</p>
      <ul>
        <li><img src="/logos/acme.svg" alt="Acme" loading="lazy" /></li>
        <li><img src="/logos/globex.svg" alt="Globex" loading="lazy" /></li>
        <li><img src="/logos/initech.svg" alt="Initech" loading="lazy" /></li>
        <li><img src="/logos/umbrella.svg" alt="Umbrella" loading="lazy" /></li>
      </ul>
    </section>

    <section class="features">
      <article>
        <h2>Real-time by default</h2>
        <p>Every dashboard updates as new events arrive, so nobody is ever looking at yesterday's numbers. Median event-to-dashboard latency is under 4 seconds.</p>
      </article>
      <article>
        <h2>Built for collaboration</h2>
        <p>Comment directly on charts, tag teammates, and turn a spike in the data into a resolved incident in minutes, with a full audit trail attached.</p>
      </article>
      <article>
        <h2>Governed access</h2>
        <p>Row-level permissions mean everyone sees the numbers they need, and nothing they don't, enforced consistently across every dashboard and export.</p>
      </article>
      <article>
        <h2>Open API</h2>
        <p>Pull any metric into your own tools with a documented REST and GraphQL API, or push events in from anywhere with a single HTTP call.</p>
      </article>
    </section>
  </main>

  <footer class="site-footer">
    <p>&copy; 2026 Meridian, Inc. All rights reserved.</p>
    <nav>
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
    </nav>
  </footer>
</body>
</html>
`;

const CSS_LEFT = `/* Design tokens for the Meridian marketing site. Generated from Figma variables -- do not edit color values directly, update the source file and re-run the export script instead. */
:root {
  --color-bg: #0b0d10;
  --color-surface: #14171c;
  --color-border: #23262c;
  --color-text: #e8eaed;
  --color-muted: #9aa0a6;
  --color-primary: #6ee7b7;
  --color-primary-hover: #5bd6a4;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 40px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
  line-height: 1.5;
}

.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  background: rgba(11, 13, 16, 0.85);
  backdrop-filter: blur(8px);
}

.site-header nav {
  display: flex;
  gap: var(--space-4);
}

.site-header nav a {
  color: var(--color-muted);
  text-decoration: none;
  font-size: 14px;
}

.site-header nav a:hover {
  color: var(--color-text);
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.button.primary {
  background: var(--color-primary);
  color: #04140d;
}

.button.primary:hover {
  background: var(--color-primary-hover);
}

.button.secondary {
  background: transparent;
  border-color: var(--color-border);
  color: var(--color-text);
}

.hero {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-5) var(--space-4);
  text-align: center;
}

.hero h1 {
  font-size: 40px;
  line-height: 1.15;
  margin: 0 0 var(--space-3);
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 var(--space-4) var(--space-5);
}
`;

const CSS_RIGHT = `/* Design tokens for the Meridian marketing site. Generated from Figma variables -- do not edit color values directly, update the source file and re-run the export script instead. */
:root {
  --color-bg: #0b0d10;
  --color-surface: #14171c;
  --color-border: #23262c;
  --color-text: #e8eaed;
  --color-muted: #9aa0a6;
  --color-primary: #6ee7b7;
  --color-primary-hover: #5bd6a4;
  --color-danger: #f87171; /* used for destructive actions, error banners, and the low-balance warning in the billing widget */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 40px;
  --space-6: 64px;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
}

.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(11, 13, 16, 0.9);
  backdrop-filter: blur(10px);
}

.site-header nav {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.site-header nav a {
  color: var(--color-muted);
  text-decoration: none;
  font-size: 14px;
}

.site-header nav a:hover,
.site-header nav a:focus-visible {
  color: var(--color-text);
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
}

.button:active {
  transform: translateY(1px);
}

.button.primary {
  background: var(--color-primary);
  color: #04140d;
}

.button.primary:hover {
  background: var(--color-primary-hover);
}

.button.secondary {
  background: transparent;
  border-color: var(--color-border);
  color: var(--color-text);
}

.button.ghost {
  background: transparent;
  color: var(--color-muted);
}

.hero {
  max-width: 780px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
  text-align: center;
}

.hero h1 {
  font-size: 44px;
  line-height: 1.1;
  margin: 0 0 var(--space-3);
  letter-spacing: -0.02em;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-4);
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 var(--space-4) var(--space-6);
}
`;

const JS_LEFT = `// Small collection of formatting and math helpers shared across the Meridian dashboard widgets.
function greet(name) {
  console.log("Hello, " + name + "!");
}

function add(a, b) {
  return a + b;
}

function subtractAll(numbers) {
  return numbers.reduce((total, n) => total - n);
}

function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function formatCurrency(amount, currency) {
  return currency + " " + amount.toFixed(2);
}

function formatPercent(value) {
  return Math.round(value * 100) + "%";
}

function debounce(fn, waitMs) {
  let timer = null;
  return function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), waitMs);
  };
}

function chunk(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

function unique(array) {
  return Array.from(new Set(array));
}

function sum(array) {
  return array.reduce((total, n) => total + n, 0);
}

function average(array) {
  return array.length === 0 ? 0 : sum(array) / array.length;
}

const TIMEOUT_MS = 3000;
const RETRY_LIMIT = 3;

module.exports = {
  greet,
  add,
  subtractAll,
  clamp,
  formatCurrency,
  formatPercent,
  debounce,
  chunk,
  unique,
  sum,
  average,
};
`;

const JS_RIGHT = `// Small collection of formatting and math helpers shared across the Meridian dashboard widgets, now with locale-aware currency formatting.
function greet(name) {
  // Use a template literal for readability
  console.log(\`Hello, \${name}!\`);
}

function add(a, b, c = 0) {
  return a + b + c;
}

function subtract(a, b) {
  return a - b;
}

function subtractAll(numbers) {
  return numbers.reduce((total, n) => total - n);
}

function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function formatCurrency(amount, currency, locale = "en-US") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
}

function formatPercent(value, fractionDigits = 0) {
  return (value * 100).toFixed(fractionDigits) + "%";
}

function debounce(fn, waitMs) {
  let timer = null;
  return function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), waitMs);
  };
}

function throttle(fn, waitMs) {
  let last = 0;
  return function throttled(...args) {
    const now = Date.now();
    if (now - last >= waitMs) {
      last = now;
      fn.apply(this, args);
    }
  };
}

function chunk(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

function unique(array) {
  return Array.from(new Set(array));
}

function sum(array) {
  return array.reduce((total, n) => total + n, 0);
}

function average(array) {
  return array.length === 0 ? 0 : sum(array) / array.length;
}

function median(array) {
  const sorted = [...array].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

const TIMEOUT_MS = 5000;
const RETRY_LIMIT = 5;

module.exports = {
  greet,
  add,
  subtract,
  subtractAll,
  clamp,
  formatCurrency,
  formatPercent,
  debounce,
  throttle,
  chunk,
  unique,
  sum,
  average,
  median,
};
`;

const PYTHON_LEFT = `# HTTP client with exponential backoff retries, used by every internal service that talks to the Meridian ingest API over the private network.
import time
from dataclasses import dataclass, field


@dataclass
class RetryPolicy:
    max_attempts: int = 3
    base_delay: float = 0.5
    max_delay: float = 8.0

    def delay_for(self, attempt: int) -> float:
        delay = self.base_delay * (2 ** attempt)
        return min(delay, self.max_delay)


class HttpClient:
    def __init__(self, base_url, timeout=10, retry_policy=None):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.retry_policy = retry_policy or RetryPolicy()
        self._session_headers = {"User-Agent": "meridian-client/1.0"}

    def get(self, path, params=None):
        return self._request("GET", path, params=params)

    def post(self, path, json_body=None):
        return self._request("POST", path, json_body=json_body)

    def _request(self, method, path, params=None, json_body=None):
        url = f"{self.base_url}/{path.lstrip('/')}"
        last_error = None

        for attempt in range(self.retry_policy.max_attempts):
            try:
                return self._send(method, url, params, json_body)
            except ConnectionError as exc:
                last_error = exc
                time.sleep(self.retry_policy.delay_for(attempt))

        raise last_error

    def _send(self, method, url, params, json_body):
        print(f"{method} {url} params={params} body={json_body}")
        return {"status": 200, "url": url}


def build_default_client():
    return HttpClient("https://api.meridian.internal", timeout=5)
`;

const PYTHON_RIGHT = `import logging
import time
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class RetryPolicy:
    max_attempts: int = 5
    base_delay: float = 0.5
    max_delay: float = 8.0
    jitter: float = 0.1

    def delay_for(self, attempt: int) -> float:
        delay = self.base_delay * (2 ** attempt)
        delay = min(delay, self.max_delay)
        return delay + (self.jitter * attempt)


class HttpClient:
    def __init__(self, base_url, timeout=10, retry_policy=None, headers=None):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.retry_policy = retry_policy or RetryPolicy()
        self._session_headers = {"User-Agent": "meridian-client/2.0", **(headers or {})}

    def get(self, path, params=None):
        return self._request("GET", path, params=params)

    def post(self, path, json_body=None):
        return self._request("POST", path, json_body=json_body)

    def delete(self, path):
        return self._request("DELETE", path)

    def _request(self, method, path, params=None, json_body=None):
        url = f"{self.base_url}/{path.lstrip('/')}"
        last_error = None

        for attempt in range(self.retry_policy.max_attempts):
            try:
                return self._send(method, url, params, json_body)
            except ConnectionError as exc:
                last_error = exc
                logger.warning("request failed, retrying: %s", exc)
                time.sleep(self.retry_policy.delay_for(attempt))

        logger.error("request permanently failed after %d attempts", self.retry_policy.max_attempts)
        raise last_error

    def _send(self, method, url, params, json_body):
        logger.debug("%s %s params=%s body=%s", method, url, params, json_body)
        return {"status": 200, "url": url}


def build_default_client():
    return HttpClient("https://api.meridian.internal", timeout=8, headers={"X-Client-Region": "us-east-1"})
`;

const JAVA_LEFT = `// Simple in-memory sliding-window rate limiter, keyed by client identifier (API key or IP address depending on the calling service's configuration).
package io.meridian.gateway;

import java.util.HashMap;
import java.util.Map;

public class RateLimiter {
    private final int maxRequests;
    private final long windowMillis;
    private final Map<String, Window> windows = new HashMap<>();

    public RateLimiter(int maxRequests, long windowMillis) {
        this.maxRequests = maxRequests;
        this.windowMillis = windowMillis;
    }

    public synchronized boolean allow(String key) {
        long now = System.currentTimeMillis();
        Window window = windows.get(key);

        if (window == null || now - window.start > windowMillis) {
            window = new Window(now);
            windows.put(key, window);
        }

        if (window.count >= maxRequests) {
            return false;
        }

        window.count++;
        return true;
    }

    private static class Window {
        final long start;
        int count;

        Window(long start) {
            this.start = start;
            this.count = 0;
        }
    }
}
`;

const JAVA_RIGHT = `// Thread-safe sliding-window rate limiter, keyed by client identifier (API key or IP address depending on the calling service's configuration).
package io.meridian.gateway;

import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import java.util.function.Supplier;

public class RateLimiter {
    private final int maxRequests;
    private final long windowMillis;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();
    private final Supplier<Long> clock;

    public RateLimiter(int maxRequests, long windowMillis) {
        this(maxRequests, windowMillis, System::currentTimeMillis);
    }

    public RateLimiter(int maxRequests, long windowMillis, Supplier<Long> clock) {
        this.maxRequests = maxRequests;
        this.windowMillis = windowMillis;
        this.clock = clock;
    }

    public boolean allow(String key) {
        long now = clock.get();
        Window window = windows.compute(key, (k, existing) -> {
            if (existing == null || now - existing.start > windowMillis) {
                return new Window(now);
            }
            return existing;
        });

        return window.tryIncrement(maxRequests);
    }

    private static class Window {
        final long start;
        final java.util.concurrent.atomic.AtomicInteger count = new java.util.concurrent.atomic.AtomicInteger();

        Window(long start) {
            this.start = start;
        }

        boolean tryIncrement(int max) {
            return count.incrementAndGet() <= max;
        }
    }
}
`;

const GO_LEFT = `// Package main implements the meridian-gateway HTTP entrypoint. This is the minimal version before graceful shutdown, structured logging, and signal handling were added -- see meridian/rfc-0042-graceful-shutdown.md for the full design discussion.
package main

import (
	"fmt"
	"net/http"
	"time"
)

type Server struct {
	addr    string
	started time.Time
}

func NewServer(addr string) *Server {
	return &Server{addr: addr}
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "ok, uptime=%s", time.Since(s.started))
}

func (s *Server) handleRoot(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "meridian gateway")
}

func (s *Server) Run() error {
	s.started = time.Now()
	mux := http.NewServeMux()
	mux.HandleFunc("/health", s.handleHealth)
	mux.HandleFunc("/", s.handleRoot)
	return http.ListenAndServe(s.addr, mux)
}

func main() {
	server := NewServer(":8080")
	if err := server.Run(); err != nil {
		panic(err)
	}
}
`;

const GO_RIGHT = `// Package main implements the meridian-gateway HTTP entrypoint. This version adds graceful shutdown, structured logging, and signal handling -- see meridian/rfc-0042-graceful-shutdown.md for the full design discussion.
package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os/signal"
	"syscall"
	"time"
)

type Server struct {
	addr    string
	started time.Time
	logger  *slog.Logger
}

func NewServer(addr string, logger *slog.Logger) *Server {
	return &Server{addr: addr, logger: logger}
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "ok, uptime=%s", time.Since(s.started))
}

func (s *Server) handleRoot(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "meridian gateway v2")
}

func (s *Server) Run(ctx context.Context) error {
	s.started = time.Now()
	mux := http.NewServeMux()
	mux.HandleFunc("/health", s.handleHealth)
	mux.HandleFunc("/", s.handleRoot)

	httpServer := &http.Server{Addr: s.addr, Handler: mux}

	go func() {
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		httpServer.Shutdown(shutdownCtx)
	}()

	s.logger.Info("server starting", "addr", s.addr)
	return httpServer.ListenAndServe()
}

func main() {
	logger := slog.Default()
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	server := NewServer(":8080", logger)
	if err := server.Run(ctx); err != nil && err != http.ErrServerClosed {
		logger.Error("server failed", "error", err)
	}
}
`;

const MARKDOWN_LEFT = `# Meridian CLI

Command line tool for interacting with the Meridian analytics platform from your terminal.

## Installation

\`\`\`sh
npm install -g @meridian/cli
\`\`\`

## Quick start

1. Authenticate with your Meridian account.
2. Point the CLI at a workspace.
3. Run a query.

\`\`\`sh
meridian login
meridian workspace use acme-prod
meridian query "select count(*) from events where name = 'signup'"
\`\`\`

## Commands

| Command | Description |
| --- | --- |
| \`login\` | Authenticate with your Meridian account |
| \`workspace list\` | List workspaces you have access to |
| \`workspace use <id>\` | Set the active workspace |
| \`query <sql>\` | Run a SQL query against the active workspace |
| \`export <query-id>\` | Export the results of a saved query as CSV |

## Configuration

The CLI reads configuration from \`~/.meridian/config.json\`. You can override any value with an environment variable prefixed with \`MERIDIAN_\`.

## Support

File issues at the internal tracker, or reach out in #meridian-cli on Slack.
`;

const MARKDOWN_RIGHT = `# Meridian CLI

Command line tool for interacting with the Meridian analytics platform from your terminal, scripts, and CI pipelines.

## Installation

\`\`\`sh
npm install -g @meridian/cli
# or
brew install meridian-cli
\`\`\`

## Quick start

1. Authenticate with your Meridian account.
2. Point the CLI at a workspace.
3. Run a query, or start a watch session.

\`\`\`sh
meridian login
meridian workspace use acme-prod
meridian query "select count(*) from events where name = 'signup'"
meridian watch "select count(*) from events where name = 'signup'" --interval 30s
\`\`\`

## Commands

| Command | Description |
| --- | --- |
| \`login\` | Authenticate with your Meridian account |
| \`workspace list\` | List workspaces you have access to |
| \`workspace use <id>\` | Set the active workspace |
| \`query <sql>\` | Run a SQL query against the active workspace |
| \`watch <sql>\` | Re-run a query on an interval and print only changes |
| \`export <query-id>\` | Export the results of a saved query as CSV or JSON |
| \`whoami\` | Print the currently authenticated user and active workspace |

## Configuration

The CLI reads configuration from \`~/.meridian/config.json\`. You can override any value with an environment variable prefixed with \`MERIDIAN_\`. In CI, set \`MERIDIAN_API_TOKEN\` instead of running \`meridian login\` interactively.

## Support

File issues at the internal tracker, or reach out in #meridian-cli on Slack. Response time during business hours is typically under an hour.
`;

const TOML_LEFT = `[package]
name = "meridian-agent"
version = "0.6.2"
edition = "2021"
description = "Lightweight metrics collection agent for the Meridian platform"
license = "Apache-2.0"

[dependencies]
tokio = { version = "1.36", features = ["rt-multi-thread", "macros", "net", "time"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
reqwest = { version = "0.11", features = ["json"] }
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }
clap = { version = "4.5", features = ["derive"] }

[dependencies.uuid]
version = "1.7"
features = ["v4", "serde"]

[profile.release]
opt-level = 3
lto = true
codegen-units = 1
panic = "abort"

[[bin]]
name = "meridian-agent"
path = "src/main.rs"

[agent]
poll_interval_seconds = 15
batch_size = 200
endpoint = "https://ingest.meridian.io/v1/metrics"

[agent.buffer]
max_size_mb = 64
flush_on_shutdown = true
`;

const TOML_RIGHT = `[package]
name = "meridian-agent"
version = "0.7.0"
edition = "2021"
description = "Lightweight metrics and log collection agent for the Meridian platform"
license = "Apache-2.0"
repository = "https://github.com/meridian-io/agent"

[dependencies]
tokio = { version = "1.37", features = ["rt-multi-thread", "macros", "net", "time", "signal"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
reqwest = { version = "0.12", features = ["json", "gzip"] }
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter", "json"] }
clap = { version = "4.5", features = ["derive", "env"] }
backoff = { version = "0.4", features = ["tokio"] }

[dependencies.uuid]
version = "1.8"
features = ["v4", "serde"]

[profile.release]
opt-level = 3
lto = true
codegen-units = 1
panic = "abort"
strip = true

[[bin]]
name = "meridian-agent"
path = "src/main.rs"

[[bin]]
name = "meridian-agent-ctl"
path = "src/bin/ctl.rs"

[agent]
poll_interval_seconds = 10
batch_size = 500
endpoint = "https://ingest.meridian.io/v1/metrics"
logs_endpoint = "https://ingest.meridian.io/v1/logs"

[agent.buffer]
max_size_mb = 128
flush_on_shutdown = true
flush_interval_seconds = 5
`;

const SHELL_LEFT = `#!/usr/bin/env bash
set -euo pipefail

APP_NAME="meridian-gateway"
ENVIRONMENT="\${1:-staging}"
IMAGE_TAG="\${2:-latest}"
REGISTRY="registry.meridian.internal"

echo "Deploying \${APP_NAME} to \${ENVIRONMENT} with tag \${IMAGE_TAG}"

if [[ "\${ENVIRONMENT}" != "staging" && "\${ENVIRONMENT}" != "production" ]]; then
  echo "Unknown environment: \${ENVIRONMENT}" >&2
  exit 1
fi

echo "Pulling image..."
docker pull "\${REGISTRY}/\${APP_NAME}:\${IMAGE_TAG}"

echo "Running database migrations..."
docker run --rm --network host \\
  -e DATABASE_URL="\${DATABASE_URL}" \\
  "\${REGISTRY}/\${APP_NAME}:\${IMAGE_TAG}" \\
  npm run migrate

echo "Stopping old container..."
docker stop "\${APP_NAME}" 2>/dev/null || true
docker rm "\${APP_NAME}" 2>/dev/null || true

echo "Starting new container..."
docker run -d --name "\${APP_NAME}" \\
  --restart unless-stopped \\
  -p 8080:8080 \\
  -e NODE_ENV="\${ENVIRONMENT}" \\
  -e DATABASE_URL="\${DATABASE_URL}" \\
  "\${REGISTRY}/\${APP_NAME}:\${IMAGE_TAG}"

echo "Waiting for health check..."
for i in \$(seq 1 10); do
  if curl -sf http://localhost:8080/health > /dev/null; then
    echo "Deploy succeeded"
    exit 0
  fi
  sleep 3
done

echo "Health check failed after deploy" >&2
exit 1
`;

const SHELL_RIGHT = `#!/usr/bin/env bash
set -euo pipefail

APP_NAME="meridian-gateway"
ENVIRONMENT="\${1:-staging}"
IMAGE_TAG="\${2:-latest}"
REGISTRY="registry.meridian.internal"
SLACK_WEBHOOK="\${SLACK_WEBHOOK_URL:-}"

log() {
  echo "[\$(date -u +%Y-%m-%dT%H:%M:%SZ)] \$*"
}

notify_slack() {
  if [[ -n "\${SLACK_WEBHOOK}" ]]; then
    curl -sf -X POST -H 'Content-Type: application/json' \\
      -d "{\\"text\\": \\"\$1\\"}" "\${SLACK_WEBHOOK}" > /dev/null || true
  fi
}

log "Deploying \${APP_NAME} to \${ENVIRONMENT} with tag \${IMAGE_TAG}"

if [[ "\${ENVIRONMENT}" != "staging" && "\${ENVIRONMENT}" != "production" && "\${ENVIRONMENT}" != "canary" ]]; then
  log "Unknown environment: \${ENVIRONMENT}" >&2
  exit 1
fi

log "Pulling image..."
docker pull "\${REGISTRY}/\${APP_NAME}:\${IMAGE_TAG}"

log "Running database migrations..."
docker run --rm --network host \\
  -e DATABASE_URL="\${DATABASE_URL}" \\
  "\${REGISTRY}/\${APP_NAME}:\${IMAGE_TAG}" \\
  npm run migrate

log "Stopping old container..."
docker stop "\${APP_NAME}" 2>/dev/null || true
docker rm "\${APP_NAME}" 2>/dev/null || true

log "Starting new container..."
docker run -d --name "\${APP_NAME}" \\
  --restart unless-stopped \\
  -p 8080:8080 \\
  --health-cmd="curl -sf http://localhost:8080/health || exit 1" \\
  --health-interval=10s \\
  -e NODE_ENV="\${ENVIRONMENT}" \\
  -e DATABASE_URL="\${DATABASE_URL}" \\
  "\${REGISTRY}/\${APP_NAME}:\${IMAGE_TAG}"

log "Waiting for health check..."
for i in \$(seq 1 20); do
  if curl -sf http://localhost:8080/health > /dev/null; then
    log "Deploy succeeded"
    notify_slack "Deploy of \${APP_NAME} to \${ENVIRONMENT} (\${IMAGE_TAG}) succeeded"
    exit 0
  fi
  sleep 3
done

log "Health check failed after deploy" >&2
notify_slack "Deploy of \${APP_NAME} to \${ENVIRONMENT} (\${IMAGE_TAG}) FAILED health check"
exit 1
`;

export const DIFF_EXAMPLES: DiffExample[] = [
  {
    id: "text",
    label: "Prose / release notes",
    category: "Text",
    languageId: "plaintext",
    leftFilename: "release-notes-draft.txt",
    rightFilename: "release-notes-final.txt",
    left: TEXT_LEFT,
    right: TEXT_RIGHT,
  },
  {
    id: "json",
    label: "API gateway config",
    category: "JSON",
    languageId: "json",
    leftFilename: "package.json",
    rightFilename: "package.json",
    left: JSON_LEFT,
    right: JSON_RIGHT,
  },
  {
    id: "html",
    label: "Marketing landing page",
    category: "HTML",
    languageId: "html",
    leftFilename: "index.html",
    rightFilename: "index.html",
    left: HTML_LEFT,
    right: HTML_RIGHT,
  },
  {
    id: "css",
    label: "Design tokens & layout",
    category: "CSS",
    languageId: "css",
    leftFilename: "site.css",
    rightFilename: "site.css",
    left: CSS_LEFT,
    right: CSS_RIGHT,
  },
  {
    id: "javascript",
    label: "Utility module",
    category: "Programming languages",
    languageId: "javascript",
    leftFilename: "original.js",
    rightFilename: "changed.js",
    left: JS_LEFT,
    right: JS_RIGHT,
  },
  {
    id: "python",
    label: "HTTP client with retries",
    category: "Programming languages",
    languageId: "python",
    leftFilename: "http_client.py",
    rightFilename: "http_client.py",
    left: PYTHON_LEFT,
    right: PYTHON_RIGHT,
  },
  {
    id: "java",
    label: "Rate limiter class",
    category: "Programming languages",
    languageId: "java",
    leftFilename: "RateLimiter.java",
    rightFilename: "RateLimiter.java",
    left: JAVA_LEFT,
    right: JAVA_RIGHT,
  },
  {
    id: "go",
    label: "HTTP server",
    category: "Programming languages",
    languageId: "go",
    leftFilename: "main.go",
    rightFilename: "main.go",
    left: GO_LEFT,
    right: GO_RIGHT,
  },
  {
    id: "markdown",
    label: "CLI README",
    category: "Markdown",
    languageId: "markdown",
    leftFilename: "README.md",
    rightFilename: "README.md",
    left: MARKDOWN_LEFT,
    right: MARKDOWN_RIGHT,
  },
  {
    id: "toml",
    label: "Cargo manifest",
    category: "TOML",
    languageId: "toml",
    leftFilename: "Cargo.toml",
    rightFilename: "Cargo.toml",
    left: TOML_LEFT,
    right: TOML_RIGHT,
  },
  {
    id: "shell",
    label: "Deploy script",
    category: "Shell",
    languageId: "shell",
    leftFilename: "deploy.sh",
    rightFilename: "deploy.sh",
    left: SHELL_LEFT,
    right: SHELL_RIGHT,
  },
];

export const DIFF_EXAMPLE_CATEGORIES = Array.from(new Set(DIFF_EXAMPLES.map((e) => e.category)));

export function getDiffExample(id: string): DiffExample | undefined {
  return DIFF_EXAMPLES.find((e) => e.id === id);
}
