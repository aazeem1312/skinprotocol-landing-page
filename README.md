# SkinProtocol — Waitlist Landing Page

A waitlist landing page for **SkinProtocol**, a skincare ingredient scanner built for Indian, Korean, and Gulf brands. Launching 2026.

## Stack

- **Frontend**: Plain HTML + CSS + JavaScript (single `index.html`)
- **Backend**: [Convex](https://convex.dev) for real-time waitlist storage
- **Deployment**: [Vercel](https://vercel.com) static hosting

---

## Project Structure

```
SK-Landing Page/
├── index.html          # Full landing page (all sections + Convex integration)
├── convex/
│   ├── schema.ts       # Waitlist table schema
│   └── waitlist.ts     # joinWaitlist mutation + getCount query
├── vercel.json         # Vercel static deployment config
├── .gitignore
└── README.md
```

---

## Getting Started

### 1. Install Convex CLI

```bash
npm install convex
```

### 2. Initialize Convex

Run this in the project root to authenticate and create your deployment:

```bash
npx convex dev
```

This will:
- Prompt you to log in to Convex (or create an account)
- Create a project on the Convex dashboard
- Generate `convex/_generated/` files
- Print your **Deployment URL** (looks like `https://your-name-123.convex.cloud`)
- Watch for schema/function changes in dev mode

### 3. Set Your Convex URL in index.html

Once you have the deployment URL, open `index.html` and replace the placeholder:

```js
const CONVEX_URL = window.CONVEX_URL || "https://YOUR_DEPLOYMENT.convex.cloud";
//                                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                                        Replace this with your actual URL
```

**Example:**
```js
const CONVEX_URL = window.CONVEX_URL || "https://loud-duck-123.convex.cloud";
```

### 4. Run Locally

Open `index.html` directly in your browser, or use a local server:

```bash
npx serve .
# or
npx http-server .
```

> **Note:** Keep `npx convex dev` running in a separate terminal while developing to sync backend changes.

---

## Deployment to Vercel

### Option A — Vercel CLI (recommended)

```bash
npm install -g vercel
vercel
```

Follow the prompts. Vercel will auto-detect the static site and use `vercel.json`.

### Option B — Vercel Dashboard

1. Push this repo to GitHub
2. Import the repository at [vercel.com/new](https://vercel.com/new)
3. Vercel will detect the static configuration automatically
4. Set the **Output Directory** to `.` (root) if prompted

### Setting CONVEX_URL via Environment Variable (optional)

You can inject the Convex URL at build time using Vercel's environment variable system. Add this snippet before the `<script>` block in `index.html`:

```html
<script>
  window.CONVEX_URL = "https://your-deployment.convex.cloud";
</script>
```

Or set it directly in the `const CONVEX_URL` line in the script.

---

## URL Source Tracking

Pass a `?source=` query parameter to track where users came from:

| URL | Source tracked |
|-----|---------------|
| `/` | `direct` |
| `/?source=tiktok` | `tiktok` |
| `/?source=instagram` | `instagram` |
| `/?source=twitter` | `twitter` |

The source is automatically read from the URL and passed to the `joinWaitlist` mutation.

---

## Convex Commands Reference

| Command | Description |
|---------|-------------|
| `npx convex dev` | Start local dev mode (watches for changes) |
| `npx convex deploy` | Deploy functions to production |
| `npx convex dashboard` | Open Convex web dashboard |
| `npx convex data` | Browse live database data |

---

## Waitlist Schema

```ts
// convex/schema.ts
waitlist: defineTable({
  email: v.string(),      // Normalized lowercase email
  source: v.string(),     // Traffic source (e.g., "tiktok", "direct")
  joinedAt: v.number(),   // Unix timestamp (Date.now())
}).index("by_email", ["email"])
```

---

## Features

- ✅ Real-time waitlist count via Convex `getCount` query subscription
- ✅ Duplicate email detection (returns `duplicate: true`)
- ✅ URL `?source=` parameter tracking
- ✅ Both forms sync — submitting one locks the other
- ✅ Graceful fallback if Convex isn't connected (demo mode)
- ✅ Mobile-first, max-width 480px centered on desktop
- ✅ Full accessibility (ARIA labels, live regions, semantic HTML)
- ✅ SEO meta tags included

---

## License

Private — SkinProtocol 2026
