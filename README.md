# BijliCheck — Deployment Guide (with AI/RAG feature)

This version adds a real Retrieval-Augmented Generation feature: the "Ask
about your bill" box on the Bill Checker page. It works like this:

1. **Retrieve** — your question is matched against a small local knowledge
   base of slab rules and billing facts (keyword-based matching, runs
   instantly in the browser, no API call needed for this step).
2. **Augment** — those matched facts, plus your own computed bill numbers
   (units, category, rate, total), are combined into a prompt.
3. **Generate** — that prompt is sent to a free LLM (Groq) which writes a
   plain-English, grounded answer — not a generic guess, and not allowed to
   invent tariff numbers that weren't given to it.

This needs a tiny backend (one serverless function) so the API key stays
secret. GitHub Pages alone can't run that — so this version deploys via
**Vercel**, which still connects directly to your GitHub repo and is free.

Total setup time: ~15 minutes, $0 cost, forever (Groq's free tier has no
expiry, just fair-use rate limits — plenty for a hackathon demo).

---

## 1. Get a free Groq API key

1. Go to **https://console.groq.com** → sign up (no credit card required).
2. **API Keys** in the sidebar → **Create API Key** → copy it.

## 2. Push this project to GitHub

1. Create a new repo (e.g. `bijli-check`).
2. Upload everything in this folder — `index.html`, `calculator.html`,
   `guide.html`, the `api/` folder, and `package.json` — to the repo root.

## 3. Import into Vercel

1. Go to **https://vercel.com** → sign up with GitHub (free).
2. **Add New → Project** → select your repo → **Import** → **Deploy**
   (default settings, no framework needed). The site will deploy now; the
   Ask-AI feature won't work yet until step 4.

## 4. Add your Groq key as a secret

1. Project → **Settings → Environment Variables**.
2. Add `GROQ_API_KEY` = your key from step 1 → apply to all environments →
   **Save**.
3. Go to **Deployments** → **⋯** on the latest one → **Redeploy** (so it
   picks up the new variable).

## 5. Test it

- Open the Vercel URL → go to **Bill Checker** → fill in your usage and
  click **Check my bill**.
- In the "Ask about your bill" box, type something like *"why did my bill
  jump so much?"* or *"how do I avoid this next time?"*.
- You should see the retrieved reference facts listed, then a generated
  answer using your actual numbers.

## Sharing with your team / for the demo

Send everyone the Vercel URL — no download, no local setup. Use this live
URL for the actual hackathon demo so the real retrieval + generation runs,
not the offline fallback.

## If the Ask box says "offline mode"

That means `/api/ask` isn't reachable — check that `GROQ_API_KEY` is spelled
exactly right in step 4 and that you redeployed after adding it.
