(() => {
  "use strict";

  // ---------------------------------------------------------------------------
  // Event details (edit here)
  // ---------------------------------------------------------------------------
  const CONFIG = {
    // Reception: Tuesday, 19 January 2027, Savera Hotel, Chennai (IST).
    // Time of day is a placeholder until confirmed.
    eventStart: "2027-01-19T19:00:00+05:30",
    musicVolume: 0.7,
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const SVGNS = "http://www.w3.org/2000/svg";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rand = (a, b) => a + Math.random() * (b - a);

  const stage = $("#stage");
  const pano = $("#pano");
  const canvas = $("#trail");
  const ctx = canvas.getContext("2d");
  const heart = $("#trailHeart");
  const music = $("#music");
  const btnSound = $("#btnSound");
  const btnReplay = $("#btnReplay");
  const controls = $("#controls");

  let W = 0, H = 0;

  // ---------------------------------------------------------------------------
  // Dotted journey trail (drawn on a canvas that spans the whole panorama)
  // Points are in stage units: x in widths (0..3), y in heights (0..1).
  // ---------------------------------------------------------------------------
  const TRAIL_POINTS = [
    [0.47, 0.355], [0.66, 0.40], [0.86, 0.375], [0.93, 0.45], [0.83, 0.50],
    [0.74, 0.44], [0.86, 0.395], [1.05, 0.44],
    [1.18, 0.535], [1.42, 0.565], [1.66, 0.535], [1.8, 0.47], [1.74, 0.4],
    [1.66, 0.45], [1.86, 0.44], [2.04, 0.5], [2.2, 0.585], [2.33, 0.56], [2.405, 0.527],
  ];
  const trail = { p: 0, pts: [], lens: [], total: 0 };

  function catmullRom(points, samplesPerSeg = 40) {
    const out = [];
    const P = [points[0], ...points, points[points.length - 1]];
    for (let i = 1; i < P.length - 2; i++) {
      const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
      for (let s = 0; s < samplesPerSeg; s++) {
        const t = s / samplesPerSeg, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map((k) => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t +
          (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 +
          (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
      }
    }
    out.push(points[points.length - 1]);
    return out;
  }

  function layoutTrail() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(3 * W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    trail.pts = catmullRom(TRAIL_POINTS).map(([x, y]) => [x * W, y * H]);
    trail.lens = [0];
    for (let i = 1; i < trail.pts.length; i++) {
      const [ax, ay] = trail.pts[i - 1], [bx, by] = trail.pts[i];
      trail.lens.push(trail.lens[i - 1] + Math.hypot(bx - ax, by - ay));
    }
    trail.total = trail.lens[trail.lens.length - 1];
    drawTrail();
  }

  // Fraction of the trail at which it first reaches x (in stage widths)
  function trailFractionAtX(xUnits) {
    const x = xUnits * W;
    const i = trail.pts.findIndex((p) => p[0] >= x);
    return i < 0 ? 1 : trail.lens[i] / trail.total;
  }

  function drawTrail() {
    ctx.clearRect(0, 0, 3 * W, H);
    const L = trail.p * trail.total;
    if (L <= 0.5) { heart.style.opacity = 0; return; }
    const dash = Math.max(4, W * 0.016);
    ctx.setLineDash([dash, dash * 0.85]);
    ctx.lineWidth = Math.max(1.3, W * 0.0042);
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(52, 58, 40, .78)";
    ctx.beginPath();
    ctx.moveTo(...trail.pts[0]);
    let tip = trail.pts[0];
    for (let i = 1; i < trail.pts.length; i++) {
      if (trail.lens[i] <= L) { ctx.lineTo(...trail.pts[i]); tip = trail.pts[i]; continue; }
      const seg = trail.lens[i] - trail.lens[i - 1];
      const t = seg ? (L - trail.lens[i - 1]) / seg : 0;
      const [ax, ay] = trail.pts[i - 1], [bx, by] = trail.pts[i];
      tip = [ax + (bx - ax) * t, ay + (by - ay) * t];
      ctx.lineTo(...tip);
      break;
    }
    ctx.stroke();
    heart.style.opacity = 1;
    heart.style.left = tip[0] + "px";
    heart.style.top = tip[1] + "px";
  }

  // ---------------------------------------------------------------------------
  // Thoranam: mango leaves on a rope + jasmine strands with bells (SVG, in px)
  // ---------------------------------------------------------------------------
  function buildGarland() {
    const svg = $("#garland");
    const gh = H * 0.36;
    svg.setAttribute("viewBox", `0 0 ${W} ${gh}`);
    svg.innerHTML = `
      <defs>
        <linearGradient id="leafA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f9a3a"/><stop offset="1" stop-color="#3d6a26"/></linearGradient>
        <linearGradient id="leafB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8db04a"/><stop offset="1" stop-color="#4f7d2c"/></linearGradient>
        <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0cf7a"/><stop offset=".5" stop-color="#c3913a"/><stop offset="1" stop-color="#7e5a1e"/></linearGradient>
      </defs>`;
    const ropeY = (x) => 3 + 5 * Math.pow(Math.sin((x / W) * Math.PI * 4), 2);
    const el = (tag, attrs, parent = svg) => {
      const n = document.createElementNS(SVGNS, tag);
      for (const k in attrs) n.setAttribute(k, attrs[k]);
      parent.appendChild(n);
      return n;
    };

    // rope
    let d = `M -4 ${ropeY(-4)}`;
    for (let x = 0; x <= W + 4; x += 4) d += ` L ${x} ${ropeY(x).toFixed(2)}`;
    el("path", { d, fill: "none", stroke: "#8a6a3c", "stroke-width": 1.2, opacity: 0.8 });

    // jasmine strands (behind leaves)
    const budR = Math.max(2.1, H * 0.0052);
    const strands = [
      [0.03, 0.21, true], [0.08, 0.15, false], [0.13, 0.1, true], [0.18, 0.055, false],
      [0.82, 0.055, false], [0.87, 0.1, true], [0.92, 0.15, false], [0.97, 0.21, true],
    ];
    strands.forEach(([fx, fl, bell], si) => {
      const x = fx * W, y0 = ropeY(x), len = fl * H;
      const g = el("g", { class: "sway", style: `--d:${rand(3.8, 6).toFixed(2)}s;--dl:${(-rand(0, 4)).toFixed(2)}s` });
      el("line", { x1: x, y1: y0, x2: x, y2: y0 + len, stroke: "#9b8a6a", "stroke-width": 0.6 }, g);
      const step = budR * 1.9;
      let i = 0;
      for (let y = y0 + step; y < y0 + len; y += step, i++) {
        const accent = (i + si) % 9 === 4 ? "#f08a25" : (i + si * 3) % 14 === 7 ? "#b5223a" : null;
        if (accent) {
          el("circle", { cx: x - budR * 0.9, cy: y, r: budR * 0.95, fill: accent }, g);
          el("circle", { cx: x + budR * 0.9, cy: y, r: budR * 0.95, fill: accent }, g);
        } else {
          el("ellipse", { cx: x + (i % 2 ? 0.6 : -0.6), cy: y, rx: budR * 0.9, ry: budR * 1.15, fill: "#fffbf1", stroke: "#e2d6bb", "stroke-width": 0.6 }, g);
        }
      }
      const yEnd = y0 + len;
      if (bell) {
        const b = budR * 4.2;
        el("path", { d: `M ${x} ${yEnd} q ${b * 0.55} ${b * 0.1} ${b * 0.6} ${b * 0.85} l ${b * 0.18} ${b * 0.3} h ${-b * 1.56} l ${b * 0.18} ${-b * 0.3} q ${b * 0.05} ${-b * 0.75} ${b * 0.6} ${-b * 0.85} z`, fill: "url(#brass)", stroke: "#6e4c17", "stroke-width": 0.5 }, g);
        el("circle", { cx: x, cy: yEnd + b * 1.25, r: b * 0.16, fill: "#7e5a1e" }, g);
      } else {
        el("circle", { cx: x, cy: yEnd + budR, r: budR * 1.5, fill: "#f08a25" }, g);
      }
    });

    // mango leaves + marigolds
    const n = Math.max(12, Math.round(W / 26));
    const L = Math.min(H * 0.058, W * 0.11), w = L * 0.36;
    for (let i = 0; i < n; i++) {
      const x = (i + 0.5) * (W / n), y = ropeY(x);
      const g = el("g", { class: "sway", style: `--d:${rand(3, 5).toFixed(2)}s;--dl:${(-rand(0, 3)).toFixed(2)}s` });
      const leaf = el("g", { transform: `translate(${x} ${y}) rotate(${rand(-10, 10).toFixed(1)})` }, g);
      el("path", { d: `M0 0 C ${w * 0.75} ${L * 0.2}, ${w * 0.6} ${L * 0.72}, 0 ${L} C ${-w * 0.6} ${L * 0.72}, ${-w * 0.75} ${L * 0.2}, 0 0 Z`, fill: `url(#leaf${i % 2 ? "A" : "B"})` }, leaf);
      el("path", { d: `M0 ${L * 0.05} L0 ${L * 0.92}`, stroke: "rgba(255,255,255,.35)", "stroke-width": 0.7 }, leaf);
      if (i % 2 === 0 && i < n - 1) {
        const mx = (i + 1) * (W / n), my = ropeY(mx) + L * 0.12, r = L * 0.17;
        el("circle", { cx: mx, cy: my, r, fill: "#ef8f1c" });
        el("circle", { cx: mx, cy: my, r: r * 0.55, fill: "#f7b13a" });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Decorative bits
  // ---------------------------------------------------------------------------
  function buildSparkles() {
    const box = $("#sparkles");
    box.innerHTML = "";
    for (let i = 0; i < 46; i++) {
      const s = document.createElement("i");
      s.style.cssText = `left:${rand(6, 94)}%;top:${rand(11, 52)}%;--s:${rand(2, 5.5).toFixed(1)}px;--d:${rand(1.6, 3.4).toFixed(2)}s;--dl:${(-rand(0, 3)).toFixed(2)}s`;
      box.appendChild(s);
    }
  }

  function buildPetals() {
    const box = $("#petals");
    for (let i = 0; i < 11; i++) {
      const p = document.createElement("i");
      p.style.cssText = `left:${rand(4, 96)}%;--s:${rand(7, 12).toFixed(1)}px;--x:${rand(-18, 18).toFixed(1)}cqw;--d:${rand(10, 16).toFixed(1)}s;--dl:${rand(0, 12).toFixed(1)}s`;
      box.appendChild(p);
    }
  }

  function buildKolam() {
    const petals = $("#kolamPetals"), dots = $("#kolamDots");
    const mk = (tag, attrs, parent) => {
      const n = document.createElementNS(SVGNS, tag);
      for (const k in attrs) n.setAttribute(k, attrs[k]);
      parent.appendChild(n);
      return n;
    };
    for (let i = 0; i < 8; i++) {
      mk("path", { class: "k-petal", pathLength: 1, transform: `translate(100 100) rotate(${i * 45})`, d: "M0 -24 C 20 -40, 15 -66, 0 -80 C -15 -66, -20 -40, 0 -24 Z" }, petals);
      mk("path", { class: "k-petal g", pathLength: 1, transform: `translate(100 100) rotate(${i * 45 + 22.5})`, d: "M0 -24 C 11 -34, 9 -48, 0 -56 C -9 -48, -11 -34, 0 -24 Z" }, petals);
    }
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + Math.PI / 16;
      mk("circle", { class: "k-dot", cx: 100 + Math.cos(a) * 70, cy: 100 + Math.sin(a) * 70, r: 1.8 }, dots);
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      mk("circle", { class: "k-dot", cx: 100 + Math.cos(a) * 95, cy: 100 + Math.sin(a) * 95, r: 2.4 }, dots);
    }
    mk("circle", { class: "k-dot", cx: 100, cy: 100, r: 3 }, dots);
  }

  // ---------------------------------------------------------------------------
  // Countdown
  // ---------------------------------------------------------------------------
  const target = new Date(CONFIG.eventStart).getTime();
  const cdEls = Object.fromEntries($$("#countdown b").map((b) => [b.dataset.k, b]));
  const cdState = { rolling: false };

  function remaining() {
    const ms = Math.max(0, target - Date.now());
    const s = Math.floor(ms / 1000);
    return { ms, d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
  }
  const pad = (n, k) => (k === "d" ? String(n) : String(n).padStart(2, "0"));

  function renderCountdown(force) {
    const r = remaining();
    if (r.ms <= 0) {
      $("#countdown").hidden = true;
      const done = $("#cdDone");
      done.hidden = false;
      done.textContent = Date.now() - target < 86400000 ? "Today’s the day!" : "Thank you for celebrating with us";
      return;
    }
    if (cdState.rolling && !force) return;
    for (const k of ["d", "h", "m", "s"]) {
      const v = pad(r[k], k);
      if (cdEls[k].textContent !== v) {
        cdEls[k].textContent = v;
        if (!force && !reduceMotion) gsap.fromTo(cdEls[k], { yPercent: -18, opacity: 0.35 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: "power2.out" });
      }
    }
  }

  // Count up from zero to the live values (k: 0 → 1), then hand back to the ticker
  const roll = { k: 1 };
  function renderRoll() {
    cdState.rolling = roll.k < 1;
    const r = remaining();
    if (r.ms <= 0) return;
    for (const k of ["d", "h", "m", "s"]) cdEls[k].textContent = pad(Math.round(r[k] * roll.k), k);
  }

  // ---------------------------------------------------------------------------
  // Main timeline
  // ---------------------------------------------------------------------------
  const A = (k) => $(`[data-a="${k}"]`);
  let tl;

  function buildTimeline() {
    const f1 = trailFractionAtX(1.0);
    const f2 = trailFractionAtX(1.76);
    const panTo = (i) => ({ xPercent: (-100 / 3) * i });
    const waterTex = $("#waterTex");

    tl = gsap.timeline({
      paused: true,
      defaults: { ease: "power2.out" },
      onUpdate: () => {
        const x = gsap.getProperty(pano, "xPercent") / 100 * pano.offsetWidth;
        waterTex.style.backgroundPositionX = `${x * 0.85}px`;
      },
    });

    // --- Scene 1: Trichy ----------------------------------------------------
    tl.from("#garland", { yPercent: -60, opacity: 0, duration: 1.6, ease: "power3.out" }, 0)
      .fromTo(".mono-ring circle", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8, ease: "power2.inOut" }, 0.2)
      .from(".mono-text", { autoAlpha: 0, scale: 0.86, duration: 1.1 }, 0.7)
      .from(".sprig", { autoAlpha: 0, x: -6, duration: 0.9 }, 1.1)
      .from(".tagline .caps", { autoAlpha: 0, y: 10, stagger: 0.25, duration: 0.9 }, 1.3)
      .fromTo(".trichy-sketch", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 2.8, ease: "power1.inOut" }, 0.5)
      .from(A("trichyLabel"), { autoAlpha: 0, y: -16, duration: 0.8, ease: "back.out(2.2)" }, 1.8)
      .to(".trichy-colour", { opacity: 0.42, duration: 2.4, ease: "sine.inOut" }, 3.0)
      .to(".trichy-sketch", { opacity: 0.9, duration: 2.4, ease: "sine.inOut" }, 3.0)
      .to(trail, { p: f1, duration: 3.8, ease: "sine.inOut", onUpdate: drawTrail }, 2.4);

    // --- Pan 1 → names + Chennai (river meets the sea) ----------------------
    tl.to(pano, { ...panTo(1), duration: 4.4, ease: "power2.inOut" }, 6.8)
      .to(trail, { p: f2, duration: 4.8, ease: "sine.inOut", onUpdate: drawTrail }, 6.8)
      .to(stage, { "--bx": 9, duration: 4.4, ease: "sine.inOut" }, 6.8)
      .to("#sea", { opacity: 1, duration: 4, ease: "sine.inOut" }, 7.4)
      .from(A("temple"), { y: "22%", autoAlpha: 0, duration: 2.4, ease: "power3.out" }, 8.9)
      .from("#sparkles", { autoAlpha: 0, duration: 1.4 }, 9.4)
      .fromTo(A("n1"), { clipPath: "inset(-20% 100% -20% 0%)" }, { clipPath: "inset(-20% 0% -20% 0%)", duration: 1.4, ease: "power1.inOut" }, 9.6)
      .from(A("amp"), { autoAlpha: 0, y: 6, duration: 0.7 }, 10.6)
      .fromTo(A("n2"), { clipPath: "inset(-20% 100% -20% 0%)" }, { clipPath: "inset(-20% 0% -20% 0%)", duration: 1.4, ease: "power1.inOut" }, 10.9)
      .from(A("nta"), { autoAlpha: 0, y: 10, duration: 0.9 }, 12.1)
      .from(A("knot"), { autoAlpha: 0, y: 10, letterSpacing: "0.4em", duration: 1.1 }, 12.5)
      .from(A("chennaiLabel"), { autoAlpha: 0, y: -16, duration: 0.8, ease: "back.out(2.2)" }, 12.9);

    // --- Pan 2 → save the date at The Savera -------------------------------
    tl.to(pano, { ...panTo(2), duration: 4.6, ease: "power2.inOut" }, 15.2)
      .to(trail, { p: 1, duration: 5.4, ease: "sine.inOut", onUpdate: drawTrail }, 15.2)
      .to(stage, { "--bx": 30, duration: 6, ease: "sine.inOut" }, 15.2)
      .fromTo(".savera-sketch", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 2.8, ease: "power1.inOut" }, 17.0)
      .to(".savera-colour", { opacity: 0.38, duration: 2.2, ease: "sine.inOut" }, 19.6)
      .from(["d1", "d2", "d3", "d4", "d5", "d6"].map(A), { autoAlpha: 0, y: 14, stagger: 0.3, duration: 0.9 }, 18.4)
      .fromTo(roll, { k: 0 }, { k: 1, duration: 1.8, ease: "power3.out", onUpdate: renderRoll, immediateRender: false }, 19.4)
      .to(heart, { scale: 1.25, duration: 0.5, yoyo: true, repeat: 3, ease: "sine.inOut", transformOrigin: "50% 50%" }, 20.6)
      .to("#directions", { autoAlpha: 1, duration: 0.8 }, 21);

    tl.call(() => controls.classList.add("on"), null, 3);
  }

  // ---------------------------------------------------------------------------
  // Layout + resize
  // ---------------------------------------------------------------------------
  function layout() {
    W = stage.clientWidth;
    H = stage.clientHeight;
    buildGarland();
    layoutTrail();
  }

  let rT;
  window.addEventListener("resize", () => {
    clearTimeout(rT);
    rT = setTimeout(() => {
      const nw = stage.clientWidth, nh = stage.clientHeight;
      if (nw === W && Math.abs(nh - H) < 2) return;
      layout();
    }, 150);
  });

  // ---------------------------------------------------------------------------
  // Intro, audio, controls
  // ---------------------------------------------------------------------------
  let opened = false;

  function fadeMusicIn() {
    music.volume = 0;
    const p = music.play();
    if (p && p.catch) p.catch(() => {});
    gsap.to(music, { volume: CONFIG.musicVolume, duration: 2.5, ease: "sine.in" });
  }

  function open() {
    if (opened) return;
    opened = true;
    fadeMusicIn();
    buildPetals();
    const intro = $("#intro");
    gsap.timeline({ onComplete: () => { intro.style.display = "none"; } })
      .to(".intro-card", { autoAlpha: 0, scale: 1.04, duration: 0.6, ease: "power2.in" }, 0)
      .to(".door-l", { xPercent: -102, duration: 1.5, ease: "power3.inOut" }, 0.35)
      .to(".door-r", { xPercent: 102, duration: 1.5, ease: "power3.inOut" }, 0.35);
    if (reduceMotion) {
      tl.progress(1);
      controls.classList.add("on");
    } else {
      gsap.delayedCall(0.8, () => tl.play(0));
    }
  }

  $("#btnOpen").addEventListener("click", open);

  btnSound.addEventListener("click", () => {
    const muted = !music.muted;
    music.muted = muted;
    if (!muted && music.paused) fadeMusicIn();
    btnSound.classList.toggle("muted", muted);
    btnSound.setAttribute("aria-pressed", String(muted));
    btnSound.setAttribute("aria-label", muted ? "Play music" : "Mute music");
  });

  btnReplay.addEventListener("click", () => {
    if (reduceMotion) return;
    tl.restart();
  });

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------
  function boot() {
    stage.style.setProperty("--bx", 4);
    layout();
    buildSparkles();
    buildKolam();
    buildTimeline();
    renderCountdown(true);
    setInterval(() => renderCountdown(false), 1000);

    gsap.timeline({ delay: 0.2 })
      .to(".kolam .k-line", { strokeDashoffset: 0, duration: 1.6, stagger: 0.2, ease: "power2.inOut" }, 0)
      .to(".kolam .k-petal", { strokeDashoffset: 0, duration: 1.2, stagger: 0.06, ease: "power1.inOut" }, 0.3)
      .to(".kolam .k-dot", { opacity: 0.85, duration: 0.5, stagger: 0.03 }, 1.2)
      .to(".kolam", { rotation: 360, duration: 120, repeat: -1, ease: "none", transformOrigin: "50% 50%" }, 0);

    // Debug/preview hook: ?t=12 jumps to a moment, ?open skips the doors
    const q = new URLSearchParams(location.search);
    if (q.has("open") || q.has("t")) {
      $("#intro").style.display = "none";
      opened = true;
      controls.classList.add("on");
      if (q.has("t")) tl.pause().seek(parseFloat(q.get("t")) || 0, false);
      else tl.play(0);
    }
    window.__tl = tl;
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot);
  else window.addEventListener("load", boot);
})();
