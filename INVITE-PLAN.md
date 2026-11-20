# Gopika ❤ Harish: Bike-Ride Save the Date (v2 plan)

The animated invite becomes a **cartoon bike ride from Trichy to Chennai**. It plays like **Instagram stories**: 3 short chapters, about **13.5 seconds** in total, with music looping in the background.

> ## ✅ Status (21 Nov 2026): built, running at http://localhost:5190
> - Uses A `bike-couple.png`, B `bike-couple-ride.mp4` and C `bike-couple-parked`.
> - The video's zoom-out jump at 3 s, its green background and shadow, and the KlingAI watermark are all fixed in code, so the video works and doesn't need regenerating.
> - **Still needed from you:** see section 8 at the bottom.

This file has everything needed to make it:
1. The final concept and timing
2. The exact AI prompts for the couple and bike artwork (**your part**)
3. Where to put the files, and what happens after

---

## 1. Event details (used in the invite)

| | |
|---|---|
| Event | **Reception** · திருமண வரவேற்பு |
| Date | **Tuesday, 19 January 2027** |
| Time | **To confirm.** The countdown currently uses 7:00 PM IST. |
| Venue | **The Savera**, Dr. Radhakrishnan Salai, Mylapore, Chennai |
| Map link | https://maps.app.goo.gl/kBxr4ChZmVJtroEg8 |
| Groom | Harish, from **Trichy** (திருச்சி) |
| Bride | Gopika, from **Chennai** (சென்னை) |

---

## 2. The story: 3 chapters, ~13.5 s total

**One continuous ride.** The couple stays in place on the bike near the centre of the screen while the world scrolls past behind them. Nothing cuts between chapters, so the road, roadside and landmarks carry straight on into the next one.

| # | Chapter | Duration | Background passing by | Text on screen |
|---|---|---|---|---|
| 1 | **Trichy** (intro) | 0 – 4 s | Rockfort pencil sketch (Kaveri bank) | G♥H monogram · "Two hearts, one journey" · 📍 *Trichy · திருச்சி · Harish's hometown* |
| 2 | **Chennai** (names) | 4 – 8.5 s | Temple-by-the-sea watercolour | *Gopika* and *Harish* · கோபிகா ♥ ஹரீஷ் · "are tying the knot" · 📍 *Chennai · சென்னை · Gopika's hometown* |
| 3 | **The Savera** (save the date) | 8.5 – 13.5 s, then **holds** | The Savera pen sketch. The bike slows and **stops in front of the hotel**. | **Save the Date** · Reception · Tuesday · Jan 19th · 2027 · The Savera, Mylapore · **live countdown** (days · hours · mins · secs) · Directions button |

- After chapter 3 finishes, the screen **stays on Save the Date**. The countdown keeps ticking and the music keeps looping.
- Nice coincidence: the song's beat drop (about 10 s into the clip) lands just as Save the Date appears.

### What moves (layers, back to front)
1. **Sky / paper wash:** soft, barely moving.
2. **Landmarks (far):** Trichy Rockfort sketch → Chennai temple watercolour → The Savera pen sketch. They drift by slowly.
3. **Roadside (middle):** coconut palms, lamp posts, and yellow-topped Tamil Nadu milestones counting down: *சென்னை 330 → 120 → 0 km*. These pass faster.
4. **Road (front):** asphalt with moving white lane dashes. Fastest.
5. **The couple on the bike:** fixed in place, with spinning wheels, a slight suspension bounce, and the pallu and jasmine fluttering.
6. **Top garland:** mango-leaf thoranam, jasmine strands and brass bells (from the current version).

Speed: the ride cruises through chapters 1–2, eases off during chapter 3, and comes to a **stop** at The Savera. The parked pose is optional (asset C).

---

## 3. Controls (Instagram-stories style)

| Gesture | What happens |
|---|---|
| **First tap** ("Tap to start" screen) | Opens the invite and starts the music. Phones need one tap before sound can play. |
| **Tap right side** | Next chapter |
| **Tap left side** | Previous chapter, or restart the current one if more than 1 s in |
| **Tap & hold** | Pauses the story (the ride, the text animations and the progress bar). Release to resume. |
| **Progress bars** | 3 thin bars at the top fill up as each chapter plays |
| Buttons (end screen) | 🔊 mute / unmute · ⟲ replay · 📍 Directions |
| Desktop | Same taps with the mouse, plus ← / → keys and Space to pause |

### Music rules
- **Track:** `Mental Manadhil.mp3`, using **0:02 → 0:35** of the song (33 s, instrumental, skipping the 2 s of silence at the start).
- **Plays as one continuous loop.** It starts on the first tap and loops 0:02 → 0:35 → 0:02… with a short crossfade at the loop point.
- **Navigation never touches the music.** Tapping next/previous or replaying changes only the story; the music carries on uninterrupted.
- **Hold-to-pause also leaves the music playing.** Only the 🔊 button stops it. (If you'd rather it paused on hold like Instagram, that's a one-line change.)
- This is a film song (A.R. Rahman, *OK Kanmani*), so **share the link privately only**. Don't post it publicly.

---

## 4. Assets

### Already done (in `assets/`)
| File | What it is |
|---|---|
| `trichy-sketch.webp`, `trichy-colour.webp` | Rockfort on the Kaveri. Pencil sketch plus a light wash (from the public-domain 1797 Daniell painting). |
| `chennai-temple.webp` | Your temple-by-the-sea watercolour (cropped) |
| `savera-sketch.webp`, `savera-colour.webp` | The Savera pen sketch plus a light wash |
| `og.jpg` | WhatsApp link preview (crop of your poster) |

### Your part: the cartoon couple on the bike
| | File name to save | Needed? |
|---|---|---|
| **A** | `bike-couple.png` | **Required** |
| **B** | `bike-couple-ride.mp4` | Recommended (makes the ride feel alive) |
| **C** | `bike-couple-parked.png` | Optional (the ending pose at The Savera) |

**Put all three in the project folder** (`harish-gopika/`, next to this file). Use exactly these names.

---

## 5. How to generate the artwork

### Ground rules (for every asset)
- **Background must be pure flat green `#00FF00`.** I remove it automatically, so it must be one even colour with no shadows, no floor and no gradient.
- **Nothing green on the people or the bike.** No green leaves, clothing, reflections or bangles, or those parts will turn see-through.
- **Bike facing RIGHT, exact side view**, so the wheels look like perfect circles.
- **Whole bike and both people fully in frame**, with empty space around them.
- **No motion blur, no text, no watermark.**
- **Download the highest resolution** the tool gives you.

---

### Asset A: `bike-couple.png` (still image, REQUIRED)

**Tool:** ChatGPT (image generation) **or** Google Gemini (Nano Banana). Both keep faces from a photo well.
**Upload:** `couples.jpeg`, then paste this prompt:

```
Using the two people in the attached photo as the exact likeness reference, create a cartoon illustration of them riding a Royal Enfield Classic 350 motorcycle together.

STYLE: modern Indian wedding-invite caricature, clean digital illustration, flat colours with soft cel shading, crisp dark outlines, friendly slightly exaggerated features with big happy smiles. Keep their real faces recognisable:
- Man (rider, in front): round thin wire-frame glasses, short black hair, full neatly trimmed black beard, medium-brown skin.
- Woman (pillion, behind him): long black hair in a loose braid, soft round face, medium-brown skin, small gold earrings.

OUTFITS:
- Man: cream silk kurta, white veshti with a thin gold border, brown leather sandals. Both hands on the handlebar.
- Woman: magenta-pink Kanchipuram silk saree with a wide gold zari border, gold temple-jewellery necklace, gold jhumkas, bangles, a string of white jasmine flowers in her hair. She sits SIDE-SADDLE on the pillion seat, both legs on the side facing the viewer, one arm around his waist. The saree pallu and her hair flow backwards in the wind.
- Both are looking toward the viewer, smiling.

MOTORCYCLE: Royal Enfield Classic 350, deep maroon with chrome details, round headlamp, spoked wheels. EXACT side profile, bike facing RIGHT, so both wheels appear as perfect circles (not ellipses). The whole bike and both riders fully inside the frame with generous empty margin on all sides.

BACKGROUND: solid, flat, pure chroma-key green (#00FF00), perfectly uniform. No floor, no road, no shadow, no gradient, no vignette. Nothing green on the people or the bike: no green leaves, no green clothing, no green reflections.

Sharp clean edges, no motion blur, no text, no watermark, no logo. Landscape 3:2, highest resolution available.
```

**Tips**
- Generate **4–6 versions** and pick the one where both faces look most like you.
- To fix a face, reply in the same chat: *"Keep everything exactly the same, but make his face (or her face) match the photo more closely."*
- To fix the pose or bike: *"Keep the faces and outfits exactly the same; make the bike an exact side view facing right with perfectly round wheels."*
- **Keep this chat open.** You'll reuse it for asset C so the characters stay consistent.
- Save the best one as **`bike-couple.png`**.

---

### Asset B: `bike-couple-ride.mp4` (riding loop, RECOMMENDED)

**Tool:** any one of **Kling AI** · **Runway (Gen-4)** · **Google Veo (Flow)** · **Sora**, in **image-to-video** mode.
**Start frame:** upload `bike-couple.png` (asset A).
**Settings:** **5 seconds**, **1080p**, **no audio**, aspect ratio the same as the image (3:2 or 16:9).

**Prompt:**
```
Static locked-off camera, no camera movement at all. The couple rides the motorcycle in place: the bike stays exactly centred in the frame and never moves across it. Both wheels spin forward continuously, the bike bounces gently on its suspension, her saree pallu, hair and jasmine string flutter backwards in the wind, his kurta ripples slightly. They keep smiling; she leans her head lightly toward his shoulder. Background remains pure flat chroma-key green #00FF00 for the entire clip. No zoom, no pan, no road, no scenery, no shadow, no new objects.
```

**Negative prompt** (if the tool has this field):
```
camera movement, zoom, pan, background change, road, scenery, shadow, motion blur, text, extra people, face change, deformed hands, bike moving out of frame
```

**Check before saving**
- The bike stays in the same spot for the whole clip.
- The faces don't change partway through.
- The background stays pure green, with no shadows appearing under the bike.

If it fails these checks after 2–3 tries, **skip it**. I'll animate asset A in code instead (spinning wheels, bounce, fluttering pallu).
Save the best one as **`bike-couple-ride.mp4`**.

---

### Asset C: `bike-couple-parked.png` (ending pose, OPTIONAL)

**Tool:** the **same chat** you used for asset A, so the characters match.
**Prompt:**
```
Same two characters, same outfits, same maroon Royal Enfield, same art style and same pure #00FF00 green background. Now the bike is parked on its side stand, facing right. He stands beside the bike and she stands next to him holding his arm; both wave happily at the viewer. Full bodies and the whole bike in frame with margin, no shadow, no text.
```
Save as **`bike-couple-parked.png`**. At the end, the bike pulls up at The Savera and switches to this pose. Without it, the couple simply stays on the stopped bike.

---

## 6. Your checklist

- [ ] Generate **A** `bike-couple.png` and put it in the project folder
- [ ] (Recommended) Generate **B** `bike-couple-ride.mp4` and put it in the project folder
- [ ] (Optional) Generate **C** `bike-couple-parked.png` and put it in the project folder
- [ ] Confirm the **reception time** for the countdown
- [ ] Tell Claude the files are ready

## 7. What Claude does after that

1. Removes the green screen from A / B / C.
2. Converts the riding loop into a transparent animation that plays on **both iPhone and Android**.
3. Trims `Mental Manadhil.mp3` to 0:02–0:35 and sets it up as a seamless loop.
4. Builds the road world: parallax layers, palms, lamp posts, milestones and lane dashes. The river and boat are removed.
5. Builds the stories engine: progress bars, tap left/right, hold to pause, and holding on the final screen.
6. Fits in the 3 chapters with the existing text, Tamil touches, garland, countdown and Directions button.
7. Tests it on phone and desktop sizes, then deploys it to a shareable link on Vercel (with your OK).

> If you'd like to see the ride and timing before your artwork is ready, Claude can build everything with a **placeholder bike** first. Your files then just drop in.

---

## 8. Still needed from you

| # | What | Why | Placeholder right now |
|---|---|---|---|
| 1 | **Reception time** | The countdown targets it | 7:00 PM IST (`start` in `site/config.js`) |
| 2 | **Where to host it** (a new Vercel project, plus a sub-domain if you'd like one, as with the last invite) | So friends get a link | Runs only on your Mac / Wi-Fi |
| 3 | **The full site address** once it's hosted | WhatsApp needs it for the preview card (`og:image` in `site/index.html`) | Relative path, so no preview card yet |
| 4 | Read through the wording: "are getting married!", "Two hearts · one journey / from Trichy to Chennai", "are tying the knot", and the Tamil lines | To make sure you're happy with it | As shown |
| 5 | *(Optional)* A cleaner riding video: pure `#00FF00` background, no camera move, no watermark, 1080p | Slightly crisper edges | The current one is fixed in code and works |

