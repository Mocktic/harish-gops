# Deploying to Vercel

The site is plain static files in `site/`, with no build step. `vercel.json` already tells Vercel to
serve that folder and to keep search engines out (`noindex`).

## 1. First deploy (about 2 minutes)

1. Go to **https://vercel.com/new** and sign in with GitHub.
2. Under **Import Git Repository**, pick **`Mocktic/harish-gops`** and click **Import**. If it isn't listed, click **Adjust GitHub App Permissions** and give Vercel access to the repo.
3. On the **Configure Project** screen:
   - **Project Name:** e.g. `gopika-weds-harish`. This becomes `gopika-weds-harish.vercel.app`.
   - **Framework Preset:** **Other**.
   - **Root Directory:** leave as `./`.
   - **Build and Output Settings:** leave **Build Command** and **Install Command** empty. Don't change **Output Directory**, because `vercel.json` sets it to `site`.
   - **Environment Variables:** none needed.
4. Click **Deploy**. When it finishes, open the link and check it on your phone: tap to open, the music starts, and the ride plays.

## 2. Custom domain (optional)

1. In the project, go to **Settings → Domains → Add**.
2. Type the address you want, e.g. `gopikaharish.justfilms.co.in`.
3. Vercel shows a DNS record to add, usually a **CNAME** pointing to `cname.vercel-dns.com`. Add it where the domain's DNS is managed. It goes live in a few minutes, with HTTPS automatically.

## 3. WhatsApp / Instagram link preview (do this once you know the final address)

WhatsApp only shows the preview card if the image link is a **full address**. In `site/index.html`, replace:

```html
<meta property="og:image" content="preview.jpg">
```

with your real address, for example:

```html
<meta property="og:image" content="https://gopikaharish.justfilms.co.in/preview.jpg">
<meta property="og:url" content="https://gopikaharish.justfilms.co.in/">
```

Commit and push. Vercel redeploys by itself.

WhatsApp remembers previews. If the old one (or none) keeps showing, share the link with `?v=2` on the end (then `?v=3`, …), e.g. `https://gopikaharish.justfilms.co.in/?v=2`.

## 4. Updating the invite later

Every push to `main` redeploys automatically, in about 30 seconds.

| Change | Where |
|---|---|
| Reception **time** for the countdown, venue, map link, names, chapter lengths | `site/config.js` |
| Words on screen | `site/app.js` (search for the text) |
| Colours, sizes, layout | `site/styles.css` |
| Couple video / pictures / music | Replace the raw file in the project folder, run `.venv/bin/python tools/prepare_assets.py`, then commit `site/media/` |

```bash
git add -A
git commit -m "Set the reception time"
git push
```

Each push to another branch gets its own **Preview** link, which is handy for trying changes before they go live.

## 5. Quick checks after deploying

- On an **iPhone (Safari)** and an **Android (Chrome)**: the opening screen → tap → music plays, the couple rides with no green edges, and the gantry sign drops in at the end.
- **Tap right / tap left / hold** move forward, back and pause.
- The **Directions** button opens Google Maps at The Savera.
- The countdown shows the right number of days.

## Notes

- **Privacy:** the raw files (`couples.jpeg`, the AI originals and the full song) are not in the repo. See `.gitignore`. Only the web-ready versions in `site/media/` are published.
- **Music:** `site/media/music.mp3` is a clip of *Mental Manadhil* (A.R. Rahman). Share the link privately, and keep the GitHub repo **private** too.
- **Sizes:** the whole site is about 7 MB, and the riding video is 4.5 MB of that. Vercel serves it from its CDN, so it loads quickly on mobile data.
