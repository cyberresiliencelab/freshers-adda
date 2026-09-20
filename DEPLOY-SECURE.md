# Publishing Freshers Adda securely (with a passphrase)

## First, the one truth that shapes everything
The in-app passphrase is a **soft gate**, not real security. This is a static web app, so the
passphrase lives in the page's source code — anyone who opens the site can View Source and read it.
That's fine as a "keep it out of casual hands" lock, but it is **not** privacy on its own.

So there are two honest levels. Pick based on how private this needs to be:

| | Effort | Real privacy? | Use when |
|---|---|---|---|
| **A. GitHub Pages + in-app passphrase** | lowest | No — URL is public, passphrase is readable in source | Casual student group; you just don't want it indexed/wide-open |
| **B. Private repo + Cloudflare Access** | a bit more | **Yes** — server checks identity before the page loads | You want it genuinely restricted to known people |

Both keep the repo private on GitHub. The difference is whether the *live URL* is truly gated.

---

## Step 1 — Put the code on GitHub (private repo)

**Browser (no terminal):**
1. github.com → **New repository** → name `freshers-adda` → select **Private** → **Create**.
2. **Add file → Upload files** → drag in everything from the unzipped folder.
   ⚠️ Web upload sometimes skips the dot-folder `.github/`. If your workflows don't appear, add them
   manually: **Add file → Create new file**, type the path `.github/workflows/deploy.yml`, paste the
   file's contents, commit. Do the same for `.github/workflows/update-jobs.yml`.
3. Commit.
4. **Settings → Collaborators** → invite your group by GitHub username (they accept the invite).

**Terminal (one command):** from the unzipped folder, run `./deploy.sh` (needs the GitHub CLI and
`gh auth login` once). It creates the private repo and pushes.

---

## Step 2 — Set and rotate the passphrase
Open `index.html`, near the top of the script:
```js
const PASSPHRASE = "TSAP-FRESHERS-2026";   // change this
```
- Change it, commit, push. Share the new one **only** with your group (use a channel that isn't the
  repo — WhatsApp/Signal, not a committed file).
- **Rotating re-locks everyone:** the app remembers *which* passphrase unlocked a device, so when you
  change `PASSPHRASE` and push, every device is asked for the new one on next open. That's your
  "revoke access" lever — change it and don't share it with whoever you're removing.

---

## Step 3 — Go live

### Path A — GitHub Pages (simple)
1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. The included deploy workflow publishes; your URL shows there in ~1 minute.
3. **Reality:** Pages on a *private* repo needs a paid plan (Pro/Team). On the **free** plan the
   published page is **public** even though the repo stays private — so the only gate is the in-app
   passphrase (obscurity). `noindex` is already set so search engines skip it, but the URL is
   reachable by anyone who has it.

### Path B — Cloudflare Pages + Access (genuinely private, free)
1. Keep the GitHub repo **private**.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pick the repo.
   Build command: none. Output directory: `/` (root). Deploy.
3. **Zero Trust → Access → Applications → Add** the Pages URL. Add a policy: allow only specific
   **emails** (or a shared **PIN**/one-time code). Now the server checks identity *before* the page
   even loads — the app never reaches anyone outside your list.
4. Keep the in-app passphrase too, as a second layer.

(Netlify and Vercel also offer password protection, but on paid tiers; Cloudflare Access is the free
one for a small group.)

---

## Step 4 — Install on phones
Open the live URL in the browser →
- **Android (Chrome):** menu → **Add to Home screen**.
- **iOS (Safari):** Share → **Add to Home Screen**.
It then launches full-screen like a native app, with the FA icon, and works offline.

---

## Step 5 — Quick security checklist
- [ ] Repo is **Private**; only your group are collaborators.
- [ ] `PASSPHRASE` changed from the default and shared off-repo.
- [ ] If you need real privacy, you used **Path B** (Cloudflare Access) — not just the passphrase.
- [ ] No real personal phone numbers/emails committed in `JOBS` unless verified (see the contact rule).
- [ ] `REPORT` set to your admin email/WhatsApp so issue reports reach someone.
- [ ] Tested the live URL on one phone before sharing the link.

**Bottom line:** private repo protects the *code*; Cloudflare Access protects the *site*; the
passphrase is a convenient lock on top. Use the passphrase alone only when "not wide open" is enough,
and Path B when "actually restricted" is the requirement.
