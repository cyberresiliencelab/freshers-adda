# Freshers Adda — Daily IT jobs for Telangana &amp; Andhra Pradesh freshers

A lightweight, installable **mobile app (PWA)** that works on **iOS and Android**. It is a daily
classified of **internship, trainee and full-time** openings for engineering freshers in
**IT / Software, Cybersecurity, Telecom / Networks and Client Systems / Support**, scoped to
**Telangana &amp; Andhra Pradesh**.

- **No sign-up. No personal data (PII).** Students search and filter freely; nothing they type
  leaves their device. They apply directly on each employer's official site.
- **Every listing links to a real, working page** — an official careers page or a live job-board
  search that stays valid. A "Live boards" section is always fresh even if a specific card ages out.
- **Private to a known group** via a passphrase gate + a private GitHub repo.

> ⚠️ **Honesty note:** company career-portal links are stable, but a specific job posting can
> close any day. Treat every card as a *lead* and always confirm eligibility, batch year and the
> last date on the employer's own site. The board never charges a fee — genuine fresher hiring is free.

---

## Files
| File | Purpose |
|---|---|
| `index.html` | The whole app — UI, the editable `JOBS` list, and all logic. **This is the file you edit daily.** |
| `add-job.html` | Team form that generates a ready-to-paste `JOBS` entry (no hand-editing). Linked from the app's footer. |
| `jobs.json` | Auto-generated live listings the app merges with the curated ones. Starts as `[]`. |
| `scripts/update-jobs.mjs` | The scheduled fetcher — pulls fresher roles from official ATS APIs. Configure `SOURCES`. |
| `manifest.webmanifest` | Makes it installable to the home screen (iOS/Android). |
| `service-worker.js` | Offline caching so it opens without a network. |
| `icons/` | Home-screen icons (192, 512, 512-maskable, apple-touch, favicon). |
| `README.md` | This file. |
| `LICENSE` | MIT. |

### Two settings to configure (top of the script in `index.html`)
```js
const PASSPHRASE = "TSAP-FRESHERS-2026";   // group passphrase — change it
const REPORT = { email:"", whatsapp:"" };  // where "Report an issue" sends the message
```
- **Report button:** every card has *"⚑ Report broken link / wrong venue"*. Set `REPORT.email`
  (opens a pre-filled email) **or** `REPORT.whatsapp` (full number, country code, digits only —
  e.g. `"919876543210"` — opens a pre-filled WhatsApp chat). If both are blank it falls back to the
  phone's native Share sheet or copy-to-clipboard, so it still works with nothing configured.
- **Auto-hide expired listings:** any job whose `last` deadline has passed disappears automatically,
  and the hero's live count only counts active listings. Cards within 3 days of `last` show a
  *"⏳ Closes …"* flag. Just keep `last` accurate; no manual deletion needed for dated drives.

---

## 1) Set the group passphrase
Open `index.html`, near the top of the `<script>`:

```js
const PASSPHRASE = "TSAP-FRESHERS-2026";   // <-- change this, then share it with your group
```

**What the passphrase is and isn't:** it's a *soft gate* to keep the board within a trusted circle,
not real security (client-side code can always be read by a determined person). The real access
control is keeping the **GitHub repo private** and only inviting your known network. Use both together.

---

## 2) Create the private GitHub repo &amp; share it with your group

**Option A — GitHub website (no terminal):**
1. github.com → **New repository** → name it e.g. `freshers-adda` → set **Private** → Create.
2. **Add file → Upload files** → drag in all the files above → **Commit**.
3. **Settings → Collaborators →** invite your group by GitHub username (they accept the invite).

**Option B — terminal:**
```bash
# inside the folder that has index.html
git init
git add .
git commit -m "Freshers Adda: initial board"
gh repo create freshers-adda --private --source=. --push   # needs the GitHub CLI (gh)
# then add your group:
gh repo add-collaborator <their-github-username>            # repeat per person
```

Only invited collaborators can see or edit a private repo. Combined with the passphrase, that keeps
it inside your known network.

---

## 3) Put it online (so phones can install it)
A private repo's code is hidden, but the *app* needs a URL to run on phones. Pick one:

- **GitHub Pages (simplest):** Settings → Pages → deploy from `main` / root. Note: Pages on a
  private repo is available on paid GitHub plans; on a free plan the page becomes public even though
  the source stays private — that's fine because the passphrase still gates entry, or…
- **Keep it fully private:** deploy to **Cloudflare Pages**, **Netlify** or **Vercel** and enable
  their built-in **password / access protection**, or restrict by email. Point it at this repo.

**Install on a phone:** open the URL in the browser →
- **Android (Chrome):** menu → *Add to Home screen*.
- **iOS (Safari):** Share → *Add to Home Screen*.

It then launches full-screen like a native app and works offline.

---

## 4) Update the board every day (the "daily classified")
In `index.html`, edit the `JOBS` array. One entry looks like:

```js
{
  co:"TCS",                                      // company
  role:"Assistant System Engineer (TCS NQT)",    // position
  dept:"apps",                                   // department key (see the 12 below)
  sub:"Application Development",                  // exact sub-department string
  type:"Trainee",                                // Internship | Trainee | Full-time
  state:"TS",                                    // TS = Telangana, AP = Andhra Pradesh
  city:"Hyderabad",
  vac:"Bulk hiring",                             // a number (5) or text ("Multiple","Bulk hiring")
  note:"Short, factual description of who can apply.",
  apply:"https://www.tcs.com/careers",           // REAL, working link — always test it
  posted:"2026-09-18",                           // YYYY-MM-DD
  last:"2026-09-30",                             // optional deadline (YYYY-MM-DD)
  interview:{
    mode:"Online",                               // Online | In-person | Walk-in | Hybrid | Varies
    venue:"Company office, area, city (confirm in notification)", // "" when Online/Varies
    venueQuery:"Tech Mahindra Rushikonda Visakhapatnam"           // what Maps searches → "Directions" link
  },
  contact:{ name:"Talent Acquisition — Fresher Hiring", title:"", phone:"", email:"" }
},
```

**Departments (`dept` keys):** `leadership, infra, network, euc, cyber, grc, apps, cloud, data,
itsm, asset, bcr`. Each has its exact sub-department list inside the `DEPTS` object at the top of
the script — copy the `sub` string from there so the sub-department filter works.

**Interview & directions:** set `mode`. For `In-person` / `Walk-in` / `Hybrid`, fill `venueQuery`
with `Company + area + city` — the app turns it into a working Google Maps **Directions** link. For
`Online` / `Varies`, leave `venue` and `venueQuery` empty.

> **Contact rule — read this.** Only put a real `phone`/`email` when you have **verified** it with
> the employer. Leave them `""` and the card automatically shows *"Apply / enquire on official
> page"*. **Never publish an unverified or made-up phone number or personal email** — it misleads
> students and can expose real people. Generic *"Talent Acquisition — Fresher Hiring"* pointing to
> the official portal is the safe default.

Daily routine: add new openings at the top, **delete anything past its `last` date or already
closed**, test each `apply` link, then commit &amp; push. Bump the `CACHE` version in
`service-worker.js` so everyone gets the update.

**Easy way — the Add-a-job form:** open `add-job.html` (also linked from the app footer), fill the
fields, tap **Add entry** (add several if you like), then **Copy** and paste the block at the top of
the `JOBS` array in `index.html`. It mirrors the 12-department taxonomy, validates the apply link,
auto-fills the Maps directions query, and keeps the contact-honesty rule — so no raw JS editing.

**Keep links honest:** prefer official careers pages (stable) or a filtered board search URL over a
single expiring posting. A dead "Apply" button is worse than no card.

---

## Auto-updating listings on a timer
The app shows two kinds of listing together:

1. **Curated leads** — the `JOBS` array in `index.html`, edited by hand or via `add-job.html`.
   This is where the big MNCs live (TCS, Infosys, Wipro, Cognizant, Accenture …), because they run
   Workday / custom career portals with **no open feed**, so they can't be auto-imported for free.
2. **Auto-fetched roles** — `jobs.json`, rebuilt on a schedule by `scripts/update-jobs.mjs` and
   loaded by the app at startup (curated + auto, de-duplicated). Expired ones auto-hide by `last`.

**What the auto-updater can and can't do — read this.** It only pulls from companies that publish an
**official public jobs API**: Greenhouse, Lever, Ashby, SmartRecruiters. Many startups and mid-size
firms use these; most large Indian IT MNCs do not. It **does not scrape** LinkedIn, Naukri or Indeed
— that breaks their terms and their layouts change constantly, so a scraper would silently fail.
Honest coverage beats fake coverage.

**To turn it on:**
1. Find companies that (a) hire TG/AP freshers and (b) use one of those ATSs — the platform shows in
   their careers-page URL (e.g. `boards.greenhouse.io/COMPANY`, `jobs.lever.co/COMPANY`,
   `jobs.ashbyhq.com/COMPANY`). The last path segment is the `slug`.
2. Add them to the `SOURCES` array at the top of `scripts/update-jobs.mjs`:
   ```js
   { co:"Example Co", ats:"greenhouse", slug:"exampleco", deptDefault:"apps" },
   ```
3. Commit & push. The `Auto-update job listings` workflow runs daily (06:00 IST — edit the cron in
   `.github/workflows/update-jobs.yml`), rebuilds `jobs.json`, and that commit re-triggers the Pages
   deploy, so the live app refreshes on its own. You can also run it any time from the **Actions** tab.

The fetcher keeps only Telangana/AP + fresher-level titles, guesses the department from the title
(best-effort — hand-added entries are more precise), sets a 30-day `last` so stale ones disappear,
and caps the file at 200 entries.
