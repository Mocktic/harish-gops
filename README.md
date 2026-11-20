# Gopika ❤ Harish · Save the Date

A phone-first invite that plays like a story: Gopika and Harish ride a Royal Enfield from **Trichy**
(Harish's hometown) to **Chennai** (Gopika's), and pull up at **The Savera** for the Save the Date
with a live countdown. It's one continuous ride in three chapters, about 13.5 s in total, with
*Mental Manadhil* (0:02–0:35) looping underneath.

Tap right to skip, tap left to go back, press and hold to pause. The music never jumps. On a laptop
it shows as a phone-width column (← → and Space work too).

## Run it

```bash
python3 tools/serve.py 5190     # http://localhost:5190, also from your phone on the same Wi-Fi
```

`site/` is the whole website: plain static files, no build step. Previews: `/?t=9` freezes the
story at 9 s, and `/?play` skips the opening screen.

## Changing content

Names, the event (date, **time for the countdown**, venue, map link), chapter lengths and the
music volume are all in **`site/config.js`**.

## Media

`tools/prepare_assets.py` turns the raw files in the project folder into `site/media/`:

| Raw file | Becomes |
|---|---|
| `bike-couple-ride.mp4` | `ride.mp4`: green screen removed, Kling's zoom jump and watermark removed, played forwards then backwards so it loops without a jump. Colour and transparency are side by side; `site/alpha-video.js` recombines them. |
| `bike-couple-parked.png` | `parked.webp`, lined up with the bike in the video (the pose at the end) |
| `bike-couple.png` | `ride-still.webp`, shown if a phone can't play the video |
| `source/landmarks/*` | Trichy, temple and Savera art, transparent |
| `Mental Manadhil.mp3` | `music.mp3`, 0:02–0:35 with fades so the loop is smooth |

```bash
python3 -m venv .venv && .venv/bin/pip install pillow numpy scipy   # first time only
.venv/bin/python tools/prepare_assets.py                           # needs ffmpeg
```

## Deploy (Vercel)

Step-by-step guide: **[DEPLOY.md](DEPLOY.md)**. In short:

Import the repo with Framework Preset **Other** and no build command. `vercel.json` serves `site/`
and keeps search engines out. After the site has its address, set the full URL of `preview.jpg` in
the `og:image` tag in `site/index.html`, so WhatsApp shows the preview card.

The previous boat version is kept in `archive/v1-boat/`.
