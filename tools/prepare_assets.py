"""Turn the raw files into web-ready media for the invite (site/media/).

    bike-couple-ride.mp4        green-screen riding video -> ride.mp4 (colour | alpha side by side) + ride-poster.webp
    bike-couple-parked(.png)    green-screen parked still -> parked.webp (lined up with the bike in the video)
    bike-couple.png             green-screen riding still -> ride-still.webp (shown if there's no WebGL)
    source/landmarks/*          Trichy / temple / Savera art -> transparent webp
    Mental Manadhil.mp3         the song -> music.mp3 (0:02-0:35, loops smoothly)

Run it again after replacing any of those files:

    python3 -m venv .venv && .venv/bin/pip install pillow numpy scipy   # first time only
    .venv/bin/python tools/prepare_assets.py

Needs ffmpeg (brew install ffmpeg).
"""
import json
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
LANDMARKS = ROOT / 'source' / 'landmarks'
OUT = ROOT / 'site' / 'media'

RIDE = ROOT / 'bike-couple-ride.mp4'
PARKED = next((p for p in [ROOT / 'bike-couple-parked.png', ROOT / 'bike-couple-parked'] if p.exists()), None)
STILL = ROOT / 'bike-couple.png'
SONG = ROOT / 'Mental Manadhil.mp3'
SONG_START, SONG_END = 2.0, 35.0

# The Kling video jumps (zooms out) at frame 73: before it the bike is 1/0.85 bigger. Frames before
# the jump are scaled by ZOOM around the front wheel so the whole clip has one steady framing.
ZOOM_CUT, ZOOM = 73, 0.85
WHEEL_TO = (1045, 659)           # front-wheel right edge / tyre bottom after the jump (1280x720 frame)
WATERMARK = (1110, 660, 1265, 710)  # "KlingAI 4.0" box, x0 y0 x1 y1
CROP = (150, 50, 1080, 680)      # the couple + bike, in the steady framing
OUT_W, OUT_H = 868, 588          # each half of ride.mp4
FILL = (238, 214, 186)           # colour behind fully transparent pixels (warm road/sky tone)
HEADROOM = 150                   # extra px above the stills (standing people are taller than riders)


def key(rgb):
    """Alpha matte + despilled colour for a green-screen picture. Works for the pure #00FF00 stills
    and the duller green (and its darker shadow) of the Kling video: anything whose colour is
    mostly green counts as screen, however bright or dark it is."""
    a = rgb.astype(np.int16)
    spill = a[..., 1] - np.maximum(a[..., 0], a[..., 2])
    ratio = a[..., 1] / (a.sum(-1) + 1)
    core = (spill > 38) & (ratio > 0.42)
    labels, count = ndimage.label(core)
    edge_ids = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    # enclosed gaps (between spokes, arm and body) that are clearly screen-green are background too
    ids = np.arange(1, count + 1)
    if count:
        sizes = ndimage.sum(core, labels, ids)
        med = ndimage.median(spill, labels, ids)
        gaps = ids[(sizes > 4) & (med > 34)]
    else:
        gaps = []
    bg = np.isin(labels, np.union1d(edge_ids[edge_ids > 0], gaps))
    near = ndimage.binary_dilation(bg, iterations=3)
    soft = 1 - np.clip((spill - 10) / 45, 0, 1)
    alpha = np.where(bg, 0.0, np.where(near, soft, 1.0))
    alpha = ndimage.uniform_filter(alpha, 2)  # smooth the cut-out edge a touch
    out = a.copy()
    out[..., 1] = np.where(near, np.minimum(a[..., 1], np.maximum(a[..., 0], a[..., 2]) + 6), a[..., 1])
    return out.clip(0, 255).astype(np.uint8), alpha.clip(0, 1)


def frames(path):
    w, h = probe_size(path)
    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', str(path), '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    while True:
        buf = dec.stdout.read(w * h * 3)
        if len(buf) < w * h * 3:
            break
        yield np.frombuffer(buf, np.uint8).reshape(h, w, 3).copy()
    dec.wait()


def probe_size(path):
    return tuple(int(v) for v in subprocess.check_output(
        ['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', str(path)]
    ).decode().strip().split(','))


def front_wheel_x(alpha):
    """Right-most solid pixel in the wheel band: the front tyre's edge, a steady anchor."""
    band = alpha[430:716] > 0.5
    cols = np.nonzero(band.any(0))[0]
    return int(cols.max()) if len(cols) else 1140


def steady(rgba, n):
    """Undo the zoom jump: scale the early frames about the front wheel onto the later framing."""
    if n >= ZOOM_CUT:
        return rgba
    x1 = front_wheel_x(rgba[..., 3] / 255)
    img = Image.fromarray(rgba, 'RGBA')
    big = img.resize((round(img.width * ZOOM), round(img.height * ZOOM)), Image.LANCZOS)
    canvas = Image.new('RGBA', img.size, (0, 0, 0, 0))
    canvas.paste(big, (round(WHEEL_TO[0] - x1 * ZOOM), round(WHEEL_TO[1] - 716 * ZOOM)))
    return np.asarray(canvas)


def cut(rgb, n=None):
    rgb, alpha = key(rgb)
    x0, y0, x1, y1 = WATERMARK
    alpha[y0:y1, x0:x1] = 0
    rgba = np.dstack([rgb, (alpha * 255).round().astype(np.uint8)])
    if n is not None:
        rgba = steady(rgba, n)
    l, t, r, b = CROP
    img = Image.fromarray(rgba[t:b, l:r], 'RGBA').resize((OUT_W, OUT_H), Image.LANCZOS)
    return np.asarray(img).astype(np.float32)


def ride():
    if not RIDE.exists():
        return None
    shots = [cut(f, n) for n, f in enumerate(frames(RIDE))]
    # Loop forwards then backwards: the wind in her hair and pallu looks just as natural in
    # reverse, and there is never a jump or a cross-fade ghost at the loop point.
    loop = shots + shots[-2:0:-1]
    length = len(loop)
    enc = subprocess.Popen(
        ['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{OUT_W * 2}x{OUT_H}', '-r', '24', '-i', '-',
         '-vf', 'scale=out_color_matrix=bt709:out_range=tv', '-c:v', 'libx264', '-preset', 'slow', '-crf', '23',
         '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
         '-movflags', '+faststart', '-an', str(OUT / 'ride.mp4')],
        stdin=subprocess.PIPE)
    fill = np.array(FILL, np.float32)
    for f in loop:
        a = f[..., 3:] / 255
        colour = np.where(a > 0.004, f[..., :3], fill)
        matte = np.repeat(f[..., 3:], 3, axis=2)
        enc.stdin.write(np.concatenate([colour, matte], axis=1).clip(0, 255).astype(np.uint8).tobytes())
    enc.stdin.close()
    enc.wait()
    Image.fromarray(loop[0].clip(0, 255).astype(np.uint8), 'RGBA').save(OUT / 'ride-poster.webp', quality=88, method=6)
    return {'frames': length, 'fps': 24, 'reference': loop[100]}


def wheels(alpha):
    """Front tyre's right edge, rear end's left edge and the tyre bottom, read from the lowest
    band of the picture (tyres, exhaust), which is the same bike in every picture."""
    solid = alpha > 0.5
    rows = np.nonzero(solid.any(1))[0]
    top, bottom = rows.min(), rows.max()
    band = solid[bottom - int((bottom - top) * 0.2):bottom + 1]
    cols = np.nonzero(band.any(0))[0]
    return cols.min(), cols.max(), bottom


def lined_up(path, reference):
    """Key a green-screen still and place it on the ride video's canvas so its bike sits exactly
    where the video's bike is: same length (rear end to front tyre) and same front-tyre position."""
    rgb, alpha = key(np.asarray(Image.open(path).convert('RGB')))
    rgba = Image.fromarray(np.dstack([rgb, (alpha * 255).round().astype(np.uint8)]), 'RGBA')
    rl, rr, rb = wheels(reference[..., 3] / 255)
    sl, sr, sb = wheels(alpha)
    s = (rr - rl) / (sr - sl)
    scaled = rgba.resize((round(rgba.width * s), round(rgba.height * s)), Image.LANCZOS)
    canvas = Image.new('RGBA', (OUT_W, OUT_H + HEADROOM), (0, 0, 0, 0))
    canvas.paste(scaled, (round(rr - sr * s), round(rb - sb * s) + HEADROOM), scaled)
    return canvas


def landmarks():
    """Sketches become ink on transparent; colour washes keep colour only where the picture is
    darker than the paper, so they tint the sky instead of covering it."""
    def ink(name, out, strength=1.35, tint=(52, 50, 46)):
        g = np.asarray(Image.open(LANDMARKS / name).convert('L'), np.float32) / 255
        a = np.clip((1 - g) * strength, 0, 1)
        if name.startswith('savera'):  # already transparent: keep its own alpha
            a = np.asarray(Image.open(LANDMARKS / name).convert('RGBA'))[..., 3] / 255
        img = np.zeros(g.shape + (4,), np.uint8)
        img[..., :3] = tint
        img[..., 3] = (a * 255).astype(np.uint8)
        Image.fromarray(img, 'RGBA').save(OUT / out, quality=90, method=6)

    def wash(name, out, lift=0.82):
        im = Image.open(LANDMARKS / name).convert('RGBA')
        arr = np.asarray(im).astype(np.float32)
        lum = arr[..., :3].mean(-1) / 255
        a = np.clip((lift - lum) / 0.35, 0, 1) * (arr[..., 3] / 255)
        arr[..., 3] = a * 255
        Image.fromarray(arr.astype(np.uint8), 'RGBA').save(OUT / out, quality=86, method=6)

    ink('trichy-sketch.webp', 'trichy-sketch.webp')
    wash('trichy-colour.webp', 'trichy-colour.webp')
    ink('savera-sketch.webp', 'savera-sketch.webp')
    Image.open(LANDMARKS / 'savera-colour.webp').save(OUT / 'savera-colour.webp', quality=86, method=6)
    Image.open(LANDMARKS / 'chennai-temple.webp').save(OUT / 'chennai-temple.webp', quality=88, method=6)
    Image.open(LANDMARKS / 'paper.webp').save(OUT / 'paper.webp', quality=82)


def music():
    if not SONG.exists():
        return
    length = SONG_END - SONG_START
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(SONG_START), '-t', str(length), '-i', str(SONG),
                    '-af', f'afade=t=in:d=0.25,afade=t=out:st={length - 1.6:.2f}:d=1.6',
                    '-c:a', 'libmp3lame', '-b:a', '160k', str(OUT / 'music.mp3')], check=True)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = {'ride': False, 'parked': False}
    info = ride()
    if info:
        manifest.update(ride=True, rideFrames=info['frames'], rideFps=info['fps'], rideSize=[OUT_W, OUT_H], headroom=HEADROOM)
        if PARKED:
            lined_up(PARKED, info['reference']).save(OUT / 'parked.webp', quality=88, method=6)
            manifest['parked'] = True
        if STILL.exists():
            lined_up(STILL, info['reference']).save(OUT / 'ride-still.webp', quality=88, method=6)
    landmarks()
    music()
    (OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(json.dumps(manifest))


if __name__ == '__main__':
    main()
