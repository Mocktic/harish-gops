import config from './config.js';
import { createAlphaVideo } from './alpha-video.js';

const app = document.getElementById('app');
const music = document.getElementById('music');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const manifest = await fetch('media/manifest.json').then((r) => r.json()).catch(() => ({}));
const { bride, groom, event } = config;

// ---------- story clock ----------
// Everything on screen is a function of one story time `t` (seconds), so pausing, skipping and
// going back are just changes to t, and the ride always stays one continuous scene.
const CH = config.chapters;
const STARTS = CH.map((_, i) => CH.slice(0, i).reduce((a, b) => a + b, 0));
const END = STARTS[CH.length - 1] + CH[CH.length - 1];
const [, C1, C2] = STARTS;

// ---------- the ride ----------
// Speed in screen-widths per second of the far layer: a steady cruise, a burst between chapters,
// and braking to a stop in front of The Savera. Landmarks are placed where the ride puts them.
const V0 = 0.14;            // cruise
const SPACING = 1.6;        // screen widths between landmarks
const PARALLAX = { clouds: 0.22, trees: 0.55, far: 1, mid: 2.6, road: 3.6 };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const bump = (t, c, d) => (Math.abs(t - c) < d / 2 ? 0.5 * (1 - Math.cos((2 * Math.PI * (t - c + d / 2)) / d)) : 0);
const B1 = [C1 - 0.1, 1.3];
const B2 = [C2 - 0.1, 1.4];
const STOP_FROM = C2 + 2.3;
const STOP_AT = END - 0.6;
const brake = (t) => 1 - smooth(STOP_FROM, STOP_AT, t);
const FOCUS = [CH[0] * 0.45, C1 + CH[1] * 0.5, END];

function integrate(fn, a, b, dt = 1 / 240) {
  let s = 0;
  for (let x = a; x < b; x += dt) s += fn(x + dt / 2) * dt;
  return s;
}
const A1 = (SPACING - V0 * integrate(brake, FOCUS[0], FOCUS[1])) / integrate((x) => brake(x) * bump(x, ...B1), FOCUS[0], FOCUS[1]);
const A2 = (SPACING - V0 * integrate(brake, FOCUS[1], FOCUS[2]) - A1 * integrate((x) => brake(x) * bump(x, ...B1), FOCUS[1], FOCUS[2]))
  / integrate((x) => brake(x) * bump(x, ...B2), FOCUS[1], FOCUS[2]);
const speedAt = (t) => (t >= END ? 0 : brake(t) * (V0 + A1 * bump(t, ...B1) + A2 * bump(t, ...B2)));

const STEP = 1 / 120;
const TABLE = [0];
for (let i = 1; i <= Math.ceil(END / STEP); i++) TABLE.push(TABLE[i - 1] + speedAt((i - 0.5) * STEP) * STEP);
function travel(t) {
  const x = clamp(t, 0, END) / STEP, i = Math.floor(x);
  return i >= TABLE.length - 1 ? TABLE[TABLE.length - 1] : TABLE[i] + (TABLE[i + 1] - TABLE[i]) * (x - i);
}
const LANDMARK_AT = FOCUS.map((f) => travel(f) + 0.5);

// ---------- dates ----------
const target = new Date(`${event.date}T${event.start}:00+05:30`).getTime();
const day = new Date(`${event.date}T12:00:00+05:30`);
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ord = (n) => (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th');

// ---------- small drawings ----------
const pinSvg = '<svg class="pin__icon" viewBox="0 0 24 32" aria-hidden="true"><path d="M12 31s10-11.2 10-18.5C22 6.2 17.5 2 12 2S2 6.2 2 12.5C2 19.8 12 31 12 31z"/><circle cx="12" cy="12.5" r="3.8"/></svg>';
const pin = (cls, name, ta, who) => `<div class="pin ${cls}">${pinSvg}<span class="pin__name">${name}</span><span class="pin__ta" lang="ta">${ta}</span><span class="pin__who">${who}</span></div>`;
const PALM = `<svg class="palm" viewBox="0 0 120 200" aria-hidden="true">
  <path d="M58 198 C 56 150, 52 100, 62 44" fill="none" stroke="#5b3a22" stroke-width="9" stroke-linecap="round"/>
  <path d="M58 198 C 56 150, 52 100, 62 44" fill="none" stroke="#9a6a3c" stroke-width="5.5" stroke-linecap="round" stroke-dasharray="3 7"/>
  <g fill="#3f8a3a" stroke="#244d22" stroke-width="1.6" stroke-linejoin="round">
    <path d="M62 44 C 40 26, 14 30, 2 56 C 22 44, 40 44, 62 46 Z"/>
    <path d="M62 44 C 46 40, 24 56, 18 84 C 32 64, 46 54, 62 47 Z"/>
    <path d="M62 44 C 56 20, 38 6, 16 6 C 36 16, 50 28, 61 45 Z"/>
    <path d="M62 44 C 70 18, 90 6, 112 10 C 92 18, 76 30, 63 45 Z"/>
    <path d="M62 44 C 86 30, 108 36, 118 60 C 98 48, 82 46, 63 47 Z"/>
    <path d="M62 44 C 82 46, 98 62, 100 88 C 88 68, 76 56, 63 48 Z"/>
  </g>
  <g fill="#6a4a2a"><circle cx="58" cy="50" r="4.5"/><circle cx="66" cy="51" r="4.5"/><circle cx="62" cy="56" r="4.5"/></g>
</svg>`;
const LAMP = `<svg class="lamp" viewBox="0 0 60 200" aria-hidden="true">
  <path d="M28 198 V 30 C 28 16, 38 12, 50 14" fill="none" stroke="#4a4f57" stroke-width="5" stroke-linecap="round"/>
  <rect x="22" y="188" width="12" height="10" rx="2" fill="#4a4f57"/>
  <path d="M42 12 h18 l-4 8 h-10 z" fill="#4a4f57"/><ellipse cx="51" cy="21" rx="6" ry="2.6" fill="#ffe7a8"/>
</svg>`;
const BUSH = `<svg class="bush" viewBox="0 0 120 60" aria-hidden="true">
  <path d="M4 58 C 0 40, 16 28, 30 34 C 34 16, 60 12, 68 30 C 80 18, 104 22, 106 40 C 118 40, 122 54, 116 58 Z" fill="#5f9a46" stroke="#2f5a26" stroke-width="2" stroke-linejoin="round"/>
  <g fill="#f2a12c"><circle cx="34" cy="40" r="3"/><circle cx="62" cy="34" r="3"/><circle cx="88" cy="42" r="3"/></g>
</svg>`;
const milestone = (ta, en, km) => `<div class="stone" aria-hidden="true"><div class="stone__cap"><span lang="ta">${ta}</span></div><div class="stone__body"><span class="stone__en">${en}</span><b>${km}</b></div></div>`;
const RING = `<svg class="mono__ring" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="55" pathLength="1"/>
  <g class="mono__sprig" transform="translate(4 92) rotate(-58)"><path d="M0 0 C 10 -4, 22 -4, 34 0"/><ellipse cx="8" cy="-4" rx="5" ry="2.2" transform="rotate(-30 8 -4)"/><ellipse cx="16" cy="-6" rx="5" ry="2.2" transform="rotate(-25 16 -6)"/><ellipse cx="24" cy="-6" rx="5" ry="2.2" transform="rotate(-15 24 -6)"/><ellipse cx="10" cy="3" rx="5" ry="2.2" transform="rotate(25 10 3)"/><ellipse cx="19" cy="3" rx="5" ry="2.2" transform="rotate(20 19 3)"/></g></svg>`;
const SOUND = `<svg class="sound__on" viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
  <svg class="sound__off" viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 9.5l5 5m0-5l-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

const ARROW_UP = '<svg class="sign__arrow" viewBox="0 0 40 48" aria-hidden="true"><path d="M20 2 L38 22 H26 V46 H14 V22 H2 Z"/></svg>';
const ARROW_RIGHT = '<svg class="sign__arrow sign__arrow--right" viewBox="0 0 48 40" aria-hidden="true"><path d="M46 20 L26 38 V27 H2 V13 H26 V2 Z"/></svg>';

// ---------- page ----------
const hasRide = manifest.ride;
const headroom = manifest.headroom ? (manifest.rideSize[1] + manifest.headroom) / manifest.rideSize[1] : 1.255;
app.innerHTML = `
  <div class="world" aria-hidden="true">
    <div class="sky"></div>
    <div class="sun"></div>
    <div class="clouds"><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <div class="trees"></div>
    <div class="far">
      <div class="lm lm--trichy" data-at="0">
        <img class="lm__wash" src="media/trichy-colour.webp" alt="">
        <img class="lm__ink" src="media/trichy-sketch.webp" alt="">
        ${pin('pin--trichy', groom.home, groom.homeTa, `${groom.name}’s hometown`)}
      </div>
      <div class="lm lm--temple" data-at="1">
        <img class="lm__art" src="media/chennai-temple.webp" alt="">
        ${pin('pin--chennai', bride.home, bride.homeTa, `${bride.name}’s hometown`)}
      </div>
      <div class="lm lm--savera" data-at="2">
        <img class="lm__wash" src="media/savera-colour.webp" alt="">
        <img class="lm__ink" src="media/savera-sketch.webp" alt="">
        <div class="lm__glow"></div>
      </div>
      <div class="lm lm--sign" data-at="2">
        <div class="sign" role="group" aria-label="Save the date">
          <div class="sign__poles"><i></i><i></i></div>
          <div class="sign__truss"></div>
          <div class="sign__hangers"><i></i><i></i></div>
          <div class="sign__board">
            <i class="rivet"></i><i class="rivet"></i><i class="rivet"></i><i class="rivet"></i>
            <div class="sign__head">${ARROW_UP}<span>Save the Date</span></div>
            <div class="sign__event"><span lang="ta">${event.titleTa}</span><span>${event.title}</span></div>
            <div class="sign__date">
              <span class="shield"><small>${MONTHS[day.getMonth()]}</small><b>${day.getDate()}</b></span>
              <span class="sign__when"><b>${DAYS[day.getDay()]}</b><span>${MONTHS_LONG[day.getMonth()]} ${day.getFullYear()}</span></span>
            </div>
            <div class="sign__dest">
              <span class="sign__venue"><b>${event.venue}</b><small>${event.area}</small></span>
              ${ARROW_RIGHT}
              <span class="sign__km"><b>0</b><small>km</small></span>
            </div>
            <div class="vms">
              <div class="count" role="timer">
                <div><b data-k="d">0</b><span>Days</span><i lang="ta">நாட்கள்</i></div>
                <div><b data-k="h">0</b><span>Hrs</span><i lang="ta">மணி</i></div>
                <div><b data-k="m">0</b><span>Min</span><i lang="ta">நிமிடம்</i></div>
                <div><b data-k="s">0</b><span>Sec</span><i lang="ta">நொடி</i></div>
              </div>
              <p class="count__done" hidden></p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="verge"></div>
    <div class="mid"></div>
    <div class="road"><div class="road__dash"></div><div class="road__edge"></div></div>
    <canvas class="fx"></canvas>
    <div class="bike">
      <div class="bike__shadow"></div>
      <img class="bike__still" src="media/${hasRide ? 'ride-poster' : 'ride-still'}.webp" alt="">
      <canvas class="bike__ride"></canvas>
      ${manifest.parked ? `<img class="bike__parked" src="media/parked.webp" alt="" style="height:${(headroom * 100).toFixed(2)}%">` : ''}
      <video class="bike__video" src="media/ride.mp4" muted playsinline loop preload="auto"></video>
    </div>
    <div class="paper"></div>
  </div>

  <section class="copy c1" aria-label="Wedding invitation">
    <p class="c1__ta" lang="ta">திருமண அழைப்பிதழ்</p>
    <div class="mono">${RING}<span class="mono__text">${bride.name[0]}<i>♥</i>${groom.name[0]}</span></div>
    <p class="c1__line">Two hearts · one journey</p>
    <p class="c1__sub">from ${groom.home} to ${bride.home}</p>
  </section>

  <section class="copy c2" aria-label="${bride.name} and ${groom.name} are tying the knot">
    <h1 class="names"><span class="names__a">${bride.name}</span><span class="names__and">and</span><span class="names__b">${groom.name}</span></h1>
    <p class="names__ta" lang="ta">${bride.ta} <span>♥</span> ${groom.ta}</p>
    <p class="names__knot">are tying the knot</p>
  </section>


  <svg class="garland" aria-hidden="true"></svg>
  <div class="bars" aria-hidden="true">${'<span class="bar"><i></i></span>'.repeat(CH.length)}</div>
  <button type="button" class="sound no-tap" aria-label="Mute music">${SOUND}</button>
  <div class="end">
    <a class="pill no-tap" href="${event.map}" target="_blank" rel="noopener">${pinSvg}<span>Directions</span></a>
    <button type="button" class="pill pill--ghost replay no-tap" aria-label="Watch again"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M3 3.5v5h5z" fill="currentColor"/></svg><span>Replay</span></button>
  </div>
  <p class="hint" aria-hidden="true">tap ›  next  ·  hold to pause</p>

  <section class="gate">
    <img class="gate__couple" src="media/${manifest.parked ? 'parked' : 'ride-still'}.webp" alt="${bride.name} and ${groom.name} by their Royal Enfield">
    <p class="gate__ta" lang="ta">திருமண அழைப்பிதழ்</p>
    <p class="gate__names">${bride.name} <span>&amp;</span> ${groom.name}</p>
    <p class="gate__sub">are getting married!</p>
    <button type="button" class="gate__open">Tap to open</button>
    <p class="gate__hint">♫ best with sound on</p>
  </section>`;

const $ = (s) => app.querySelector(s);
const $$ = (s) => [...app.querySelectorAll(s)];
const el = {
  sky: $('.sky'), sun: $('.sun'), clouds: $('.clouds'), trees: $('.trees'), far: $('.far'), verge: $('.verge'),
  mid: $('.mid'), dash: $('.road__dash'), fx: $('.fx'), bike: $('.bike'), video: $('.bike__video'),
  still: $('.bike__still'), ride: $('.bike__ride'), parked: $('.bike__parked'), bars: $$('.bar i'),
  sound: $('.sound'), gate: $('.gate'), end: $('.end'), hint: $('.hint'), garland: $('.garland'),
  lms: $$('.lm'), count: Object.fromEntries($$('.count b').map((b) => [b.dataset.k, b])),
};

// ---------- layout (sizes depend on the screen) ----------
let W = 0, H = 0;
const roadside = [];
function layout() {
  W = app.clientWidth;
  H = app.clientHeight;
  el.lms.forEach((lm) => { lm.style.left = `${LANDMARK_AT[+lm.dataset.at] * W}px`; });
  buildRoadside();
  buildGarland();
  el.fx.width = W * Math.min(devicePixelRatio || 1, 2);
  el.fx.height = H * Math.min(devicePixelRatio || 1, 2);
}

// Roadside things on the mid layer: milestones counting down to Chennai, then Mylapore, with
// palms, lamp posts and bushes in between (same every time, so going back looks the same).
function buildRoadside() {
  const P = PARALLAX.mid;
  const at = (t, x = 0.8) => (travel(t) * P + x);
  const stones = [
    [0.7, 'சென்னை', 'CHENNAI', '330'],
    [C1 - 0.45, 'சென்னை', 'CHENNAI', '160'],
    [C1 + 2.7, 'மயிலாப்பூர்', 'MYLAPORE', '4'],
    [C2 + 0.2, 'மயிலாப்பூர்', 'MYLAPORE', '1'],
  ].map(([t, ta, en, km]) => ({ x: at(t), html: milestone(ta, en, km), kind: 'stone' }));
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const items = [...stones];
  const last = travel(END) * P;
  for (let x = -0.3; x < last + 1.4; x += 0.34 + rnd() * 0.22) {
    if (stones.some((s) => Math.abs(s.x - x) < 0.16)) continue;
    const r = rnd();
    // keep the middle of the view clear while each landmark is in focus (only low bushes there)
    const blocked = FOCUS.some((f) => x > travel(f) * P + 0.14 && x < travel(f) * P + 0.86);
    if (blocked && r < 0.78) continue;
    items.push({ x, kind: r < 0.5 ? 'palm' : r < 0.78 ? 'lamp' : 'bush', s: 0.82 + rnd() * 0.36, html: r < 0.5 ? PALM : r < 0.78 ? LAMP : BUSH });
  }
  el.mid.innerHTML = items.map((it) => `<div class="rs rs--${it.kind}" style="left:${(it.x * W).toFixed(1)}px;${it.s ? `--s:${it.s.toFixed(2)}` : ''}">${it.html}</div>`).join('');
  roadside.length = 0;
}

function buildGarland() {
  const g = el.garland, gw = W, gh = H * 0.2;
  g.setAttribute('viewBox', `0 0 ${gw} ${gh}`);
  const ropeY = (x) => 3 + 4 * Math.sin((x / gw) * Math.PI * 4) ** 2;
  let out = `<defs><linearGradient id="lfA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f9a3a"/><stop offset="1" stop-color="#3d6a26"/></linearGradient>
    <linearGradient id="lfB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8db04a"/><stop offset="1" stop-color="#4f7d2c"/></linearGradient>
    <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0cf7a"/><stop offset=".5" stop-color="#c3913a"/><stop offset="1" stop-color="#7e5a1e"/></linearGradient></defs>`;
  let d = `M -4 ${ropeY(-4)}`;
  for (let x = 0; x <= gw + 4; x += 4) d += ` L ${x} ${ropeY(x).toFixed(2)}`;
  out += `<path d="${d}" fill="none" stroke="#8a6a3c" stroke-width="1.2" opacity=".8"/>`;
  const bud = Math.max(2, H * 0.0048);
  [[0.035, 0.15, 1], [0.09, 0.1, 0], [0.91, 0.1, 0], [0.965, 0.15, 1]].forEach(([fx, fl, bell], si) => {
    const x = fx * gw, y0 = ropeY(x), len = fl * H;
    out += `<g class="sway strand" style="--d:${(4 + si * 0.6).toFixed(1)}s">`;
    out += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0 + len}" stroke="#9b8a6a" stroke-width=".6"/>`;
    let i = 0;
    for (let y = y0 + bud * 1.9; y < y0 + len; y += bud * 1.9, i++) {
      out += (i + si) % 8 === 4
        ? `<circle cx="${x - bud * 0.9}" cy="${y}" r="${bud}" fill="#f08a25"/><circle cx="${x + bud * 0.9}" cy="${y}" r="${bud}" fill="#f08a25"/>`
        : `<ellipse cx="${x}" cy="${y}" rx="${bud * 0.9}" ry="${bud * 1.15}" fill="#fffbf1" stroke="#e2d6bb" stroke-width=".6"/>`;
    }
    const ye = y0 + len, b = bud * 4;
    out += bell
      ? `<path d="M ${x} ${ye} q ${b * 0.55} ${b * 0.1} ${b * 0.6} ${b * 0.85} l ${b * 0.18} ${b * 0.3} h ${-b * 1.56} l ${b * 0.18} ${-b * 0.3} q ${b * 0.05} ${-b * 0.75} ${b * 0.6} ${-b * 0.85} z" fill="url(#brass)" stroke="#6e4c17" stroke-width=".5"/>`
      : `<circle cx="${x}" cy="${ye + bud}" r="${bud * 1.5}" fill="#f08a25"/>`;
    out += '</g>';
  });
  const n = Math.max(12, Math.round(gw / 28)), L = Math.min(H * 0.05, gw * 0.1), w = L * 0.36;
  for (let i = 0; i < n; i++) {
    const x = (i + 0.5) * (gw / n), y = ropeY(x), r = ((i * 37) % 17) - 8;
    out += `<g class="sway" style="--d:${(3 + (i % 5) * 0.4).toFixed(1)}s"><g transform="translate(${x} ${y}) rotate(${r})">
      <path d="M0 0 C ${w * 0.75} ${L * 0.2}, ${w * 0.6} ${L * 0.72}, 0 ${L} C ${-w * 0.6} ${L * 0.72}, ${-w * 0.75} ${L * 0.2}, 0 0 Z" fill="url(#lf${i % 2 ? 'A' : 'B'})"/>
      <path d="M0 ${L * 0.05} L0 ${L * 0.92}" stroke="rgba(255,255,255,.35)" stroke-width=".7"/></g></g>`;
    if (i % 2 === 0 && i < n - 1) {
      const mx = (i + 1) * (gw / n), my = ropeY(mx) + L * 0.12, rr = L * 0.17;
      out += `<circle cx="${mx}" cy="${my}" r="${rr}" fill="#ef8f1c"/><circle cx="${mx}" cy="${my}" r="${rr * 0.55}" fill="#f7b13a"/>`;
    }
  }
  g.innerHTML = out;
}

// ---------- words & reveals (GSAP timeline, scrubbed by t) ----------
const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out', duration: 0.8 } });
const show = (sel, at, from = { autoAlpha: 0, y: 14 }, opts = {}) => tl.fromTo(sel, from, { autoAlpha: 1, y: 0, x: 0, scale: 1, ...opts }, at);
const hide = (sel, at) => tl.to(sel, { autoAlpha: 0, y: -18, duration: 0.45, ease: 'power2.in' }, at);
// chapter 1 · Trichy
tl.fromTo('.lm--trichy .lm__ink', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.8, ease: 'power1.inOut' }, 0.05)
  .fromTo('.lm--trichy .lm__wash', { opacity: 0 }, { opacity: 0.55, duration: 1.4, ease: 'sine.inOut' }, 1.2);
show('.c1__ta', 0.25);
show('.mono', 0.45, { autoAlpha: 0, scale: 0.7 }, { ease: 'back.out(1.8)', duration: 0.9 });
tl.fromTo('.mono__ring circle', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut' }, 0.4);
show('.c1__line', 1.0);
show('.c1__sub', 1.25);
show('.pin--trichy', 1.15, { autoAlpha: 0, y: -18, scale: 0.6 }, { ease: 'back.out(2.4)', duration: 0.7 });
hide('.c1', C1 - 0.5);
// chapter 2 · Chennai
show('.lm--temple .lm__art', C1 - 1.0, { autoAlpha: 0, y: 30 }, { duration: 1.3, ease: 'power3.out' });
tl.set('.names', { autoAlpha: 1 }, C1 + 0.1);
tl.fromTo('.names__a', { clipPath: 'inset(-30% 100% -30% 0%)', autoAlpha: 1 }, { clipPath: 'inset(-30% 0% -30% 0%)', duration: 0.9, ease: 'power1.inOut' }, C1 + 0.15);
show('.names__and', C1 + 0.75, { autoAlpha: 0, scale: 0.6 }, { ease: 'back.out(2)', duration: 0.5 });
tl.fromTo('.names__b', { clipPath: 'inset(-30% 100% -30% 0%)', autoAlpha: 1 }, { clipPath: 'inset(-30% 0% -30% 0%)', duration: 0.9, ease: 'power1.inOut' }, C1 + 0.95);
show('.names__ta', C1 + 1.7);
show('.names__knot', C1 + 2.0, { autoAlpha: 0, y: 10, letterSpacing: '0.5em' }, { letterSpacing: '0.24em', duration: 1 });
show('.pin--chennai', C1 + 1.4, { autoAlpha: 0, y: -18, scale: 0.6 }, { ease: 'back.out(2.4)', duration: 0.7 });
hide('.c2', C2 - 0.5);
// chapter 3 · The Savera
tl.fromTo('.lm--savera .lm__ink', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 2, ease: 'power1.inOut' }, C2 - 0.5)
  .fromTo('.lm--savera .lm__wash', { opacity: 0 }, { opacity: 0.3, duration: 1.6, ease: 'sine.inOut' }, C2 + 1.2)
  .fromTo('.lm__glow', { opacity: 0 }, { opacity: 1, duration: 2, ease: 'sine.inOut' }, C2 + 1.6);
// the jasmine strands step aside for the gantry (the leaf thoranam stays, as if tied to its beam)
tl.fromTo('.garland', { '--strands': 1 }, { '--strands': 0, duration: 0.6, ease: 'sine.inOut' }, C2 - 0.6);
// overhead gantry: posts rise, the beam settles on them, then the board swings down from it
show('.sign__poles', C2 - 0.7, { autoAlpha: 0, scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.55, ease: 'power3.out' });
show('.sign__truss', C2 - 0.25, { autoAlpha: 0, y: -24 }, { duration: 0.45, ease: 'power3.out' });
show('.sign__hangers', C2 + 0.1, { autoAlpha: 0, scaleY: 0, transformOrigin: '50% 0%' }, { scaleY: 1, duration: 0.25 });
show('.sign__board', C2 + 0.15, { autoAlpha: 0, rotateX: 88, transformOrigin: '50% 0%' }, { rotateX: 0, duration: 1.4, ease: 'elastic.out(1, 0.45)' });
show('.sign__head', C2 + 0.5);
show('.sign__event', C2 + 0.75);
show('.sign__date', C2 + 1.0);
show('.sign__dest', C2 + 1.25);
show('.vms', C2 + 1.45, { autoAlpha: 0 }, { duration: 0.25, ease: 'steps(3)' });
show('.end', END - 0.3, { autoAlpha: 0, y: 16 });
tl.set({}, {}, END);

// ---------- countdown ----------
const pad = (n, k) => (k === 'd' ? String(n) : String(n).padStart(2, '0'));
function remaining() {
  const ms = Math.max(0, target - Date.now());
  const s = Math.floor(ms / 1000);
  return { ms, d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}
const ROLL = [C2 + 1.5, C2 + 3.1];
function renderCount(t) {
  const r = remaining();
  if (r.ms <= 0) {
    $('.count').hidden = true;
    const done = $('.count__done');
    done.hidden = false;
    done.textContent = Date.now() - target < 864e5 ? 'Today’s the day!' : 'Thank you for celebrating with us';
    return;
  }
  const k = t >= ROLL[1] ? 1 : 1 - (1 - smooth(ROLL[0], ROLL[1], t)) ** 3;
  for (const key of ['d', 'h', 'm', 's']) {
    const v = pad(Math.round(r[key] * k), key);
    if (el.count[key].textContent !== v) el.count[key].textContent = v;
  }
}

// ---------- the bike ----------
let alpha = null;
if (hasRide) {
  alpha = createAlphaVideo(el.video, el.ride, () => el.bike.classList.add('is-riding'));
}
if (!alpha) el.bike.classList.add('no-video');

let rate = 1;
function driveBike(t, speed, held) {
  // rides in from the left at the start, parks at the end
  const enter = 1 - (1 - smooth(0, 1.15, t)) ** 2;
  el.bike.style.setProperty('--enter', (1 - enter).toFixed(4));
  const park = smooth(END - 0.55, END - 0.15, t);
  el.bike.style.setProperty('--park', park.toFixed(4));
  if (!alpha) return;
  const moving = t < STOP_AT - 0.02 && !held && started && !document.hidden;
  if (moving && el.video.paused) el.video.play().catch(() => {});
  if (!moving && !el.video.paused) el.video.pause();
  const want = clamp(0.92 + 0.06 * (speed / V0), 0.75, 1.7);
  if (Math.abs(want - rate) > 0.06) { rate = want; el.video.playbackRate = rate; }
}

// ---------- particles: jasmine petals from her hair + wind streaks ----------
const fx = el.fx.getContext('2d');
const petals = [];
const streaks = [];
function particles(dt, speed, held) {
  const dpr = el.fx.width / W;
  fx.setTransform(dpr, 0, 0, dpr, 0, 0);
  fx.clearRect(0, 0, W, H);
  if (reduceMotion) return;
  const road = speed * PARALLAX.road * W; // px/s the road moves
  if (!held && started) {
    const b = el.bike.getBoundingClientRect(), a = app.getBoundingClientRect();
    const hx = b.left - a.left + b.width * 0.33, hy = b.top - a.top + b.height * 0.2;
    if (speed > 0.02 && Math.random() < dt * (2.2 + speed * 10)) {
      petals.push({ x: hx, y: hy + Math.random() * b.height * 0.12, vx: -40 - Math.random() * 50, vy: -8 + Math.random() * 24, r: 2.2 + Math.random() * 2.2, a: Math.random() * 6, va: (Math.random() - 0.5) * 7, life: 0, orange: Math.random() < 0.18 });
    }
    const gust = clamp((speed - V0 * 1.6) / (V0 * 6));
    if (gust > 0 && Math.random() < dt * 28 * gust) {
      streaks.push({ x: W + 20, y: H * (0.36 + Math.random() * 0.58), len: W * (0.12 + Math.random() * 0.3), life: 0, alpha: 0.25 + Math.random() * 0.35 });
    }
  }
  for (let i = petals.length - 1; i >= 0; i--) {
    const p = petals[i];
    if (!held) { p.life += dt; p.x += (p.vx - road * 0.35) * dt; p.y += (p.vy + 18 * p.life) * dt; p.a += p.va * dt; }
    if (p.life > 3 || p.x < -20) { petals.splice(i, 1); continue; }
    fx.save();
    fx.globalAlpha = Math.min(1, 3 - p.life);
    fx.translate(p.x, p.y);
    fx.rotate(p.a);
    fx.fillStyle = p.orange ? '#f4962e' : '#fffdf5';
    fx.strokeStyle = 'rgba(150,120,80,.35)';
    fx.lineWidth = 0.6;
    fx.beginPath();
    fx.ellipse(0, 0, p.r * 1.35, p.r * 0.8, 0, 0, Math.PI * 2);
    fx.fill();
    fx.stroke();
    fx.restore();
  }
  for (let i = streaks.length - 1; i >= 0; i--) {
    const s = streaks[i];
    if (!held) { s.life += dt; s.x -= (road * 1.4 + 600) * dt; }
    if (s.x + s.len < -20) { streaks.splice(i, 1); continue; }
    const g = fx.createLinearGradient(s.x, 0, s.x + s.len, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.5, `rgba(255,255,255,${s.alpha})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    fx.strokeStyle = g;
    fx.lineWidth = 1.6;
    fx.beginPath();
    fx.moveTo(s.x, s.y);
    fx.lineTo(s.x + s.len, s.y);
    fx.stroke();
  }
}

// ---------- sky (morning in Trichy → bright day in Chennai → golden evening at the reception) ----------
const SKY = [
  [0, ['#fbe2cc', '#fbeee0', '#f5c9a0']],
  [C1 + 1, ['#d6ebf3', '#f1f3ec', '#f6dcb8']],
  [C2 + 1.5, ['#e9d3ea', '#fae3d5', '#f6b07e']],
];
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const SKY_RGB = SKY.map(([at, cols]) => [at, cols.map(hex)]);
function skyAt(t) {
  let i = 0;
  while (i < SKY_RGB.length - 2 && t > SKY_RGB[i + 1][0]) i++;
  const [a, ca] = SKY_RGB[i], [b, cb] = SKY_RGB[i + 1];
  const k = smooth(a, b, t);
  return ca.map((c, j) => `rgb(${c.map((v, n) => Math.round(v + (cb[j][n] - v) * k)).join(',')})`);
}

// ---------- render one moment ----------
let lastT = -1;
function render(t, dt = 0) {
  const X = travel(t) * W;
  const speed = speedAt(t);
  el.far.style.transform = `translate3d(${(-X).toFixed(1)}px,0,0)`;
  el.mid.style.transform = `translate3d(${(-X * PARALLAX.mid).toFixed(1)}px,0,0)`;
  el.trees.style.backgroundPositionX = `${(-X * PARALLAX.trees).toFixed(1)}px`;
  el.verge.style.backgroundPositionX = `${(-X * PARALLAX.mid).toFixed(1)}px`;
  el.clouds.style.transform = `translate3d(${(-X * PARALLAX.clouds - t * 6).toFixed(1)}px,0,0)`;
  el.dash.style.backgroundPositionX = `${(-X * PARALLAX.road).toFixed(1)}px`;
  const [top, mid, low] = skyAt(t);
  el.sky.style.background = `linear-gradient(to bottom, ${top} 0%, ${mid} 52%, ${low} 66%)`;
  el.sun.style.opacity = (0.25 + 0.75 * smooth(C2, END, t)).toFixed(3);
  tl.time(t);
  renderCount(t);
  const chapter = t >= END ? CH.length : STARTS.findLastIndex((s) => t >= s);
  el.bars.forEach((b, i) => {
    const fill = i < chapter ? 1 : i === chapter ? clamp((t - STARTS[i]) / CH[i]) : 0;
    b.style.transform = `scaleX(${fill.toFixed(4)})`;
  });
  el.hint.classList.toggle('on', started && t > 1.2 && t < C1 - 0.6 && !hintSeen);
  driveBike(t, speed, held);
  particles(dt, speed, held);
  if (lastT < END - 0.5 && t >= END - 0.5 && dt > 0) celebrate();
  lastT = t;
}

// ---------- playback ----------
const state = { t: 0 };
let started = false, held = false, seeking = null, hintSeen = false;
let prev = 0;
function frame(now) {
  const dt = prev ? Math.min((now - prev) / 1000, 0.1) : 0;
  prev = now;
  if (started && !held && !seeking && !document.hidden && state.t < END) state.t = Math.min(END, state.t + dt);
  render(state.t, held || document.hidden ? 0 : dt);
  requestAnimationFrame(frame);
}

let seekTo = null;
function seek(to) {
  to = clamp(to, 0, END);
  seeking?.kill();
  if (reduceMotion) { state.t = to; seeking = null; return; }
  seekTo = to;
  seeking = gsap.to(state, { t: to, duration: Math.min(0.9, 0.35 + Math.abs(to - state.t) * 0.08), ease: 'power2.inOut', onComplete: () => { seeking = null; seekTo = null; } });
}
const chapterOf = (t) => (t >= END ? CH.length - 1 : STARTS.findLastIndex((s) => t >= s));
// while a skip is still animating, the next tap counts from where that skip is going
const now = () => (seeking ? seekTo : state.t);
function next() {
  hintSeen = true;
  const c = chapterOf(now());
  seek(c + 1 < CH.length ? STARTS[c + 1] : END);
}
function back() {
  hintSeen = true;
  const t = now(), c = chapterOf(t);
  seek(t - STARTS[c] > 1 || c === 0 ? STARTS[c] : STARTS[c - 1]);
}

// Tap right for next, tap left to go back, press and hold to pause (like stories)
let holdTimer = 0, pressed = false;
app.addEventListener('pointerdown', (ev) => {
  if (!started || ev.target.closest('.no-tap, .gate')) return;
  pressed = true;
  holdTimer = setTimeout(() => { held = true; app.classList.add('is-held'); }, 220);
});
app.addEventListener('pointerup', (ev) => {
  if (!pressed) return;
  pressed = false;
  clearTimeout(holdTimer);
  if (held) { held = false; app.classList.remove('is-held'); return; }
  const r = app.getBoundingClientRect();
  if (ev.clientX - r.left < r.width * 0.3) back(); else next();
});
app.addEventListener('pointercancel', () => { pressed = false; clearTimeout(holdTimer); held = false; app.classList.remove('is-held'); });
app.addEventListener('contextmenu', (ev) => { if (started) ev.preventDefault(); });
addEventListener('keydown', (ev) => {
  if (!started) return;
  if (ev.key === 'ArrowRight') next();
  else if (ev.key === 'ArrowLeft') back();
  else if (ev.key === ' ') { ev.preventDefault(); held = !held; app.classList.toggle('is-held', held); }
});

// ---------- opening ----------
function open() {
  if (started) return;
  music.volume = config.musicVolume;
  music.play().then(() => setSound(true)).catch(() => setSound(false));
  el.video.play().catch(() => {});
  started = true;
  state.t = 0;
  el.gate.classList.add('is-leaving');
  setTimeout(() => el.gate.remove(), 900);
}
el.gate.querySelector('.gate__open').addEventListener('click', open);

function setSound(on) {
  el.sound.classList.toggle('is-off', !on);
  el.sound.setAttribute('aria-label', on ? 'Mute music' : 'Play music');
}
el.sound.addEventListener('click', () => {
  if (music.paused) music.play().then(() => setSound(true)).catch(() => {});
  else { music.pause(); setSound(false); }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) music.pause();
  else if (started && !el.sound.classList.contains('is-off')) music.play().catch(() => {});
});
$('.replay').addEventListener('click', () => { lastT = -1; seek(0); });

function celebrate() {
  if (reduceMotion || typeof window.confetti !== 'function') return;
  const colors = ['#f29a1f', '#fffaf0', '#d81b60', '#e8b84a', '#8e2133'];
  const r = app.getBoundingClientRect();
  const origin = (x) => ({ x: (r.left + r.width * x) / innerWidth, y: (r.top + r.height * 0.62) / innerHeight });
  window.confetti({ particleCount: 70, spread: 70, startVelocity: 38, origin: origin(0.12), angle: 62, colors, scalar: 0.9, ticks: 220 });
  window.confetti({ particleCount: 70, spread: 70, startVelocity: 38, origin: origin(0.88), angle: 118, colors, scalar: 0.9, ticks: 220 });
}

// ---------- boot ----------
layout();
let resizeTimer = 0;
addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(layout, 120); });

// preview hook: ?t=9 shows that moment (no gate), ?play starts without the gate
const q = new URLSearchParams(location.search);
if (q.has('t') || q.has('play')) {
  el.gate.remove();
  started = true;
  if (q.has('t')) { state.t = clamp(parseFloat(q.get('t')) || 0, 0, END); held = true; }
}
requestAnimationFrame(frame);
window.__invite = { state, END, STARTS, seek };
