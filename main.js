/* =====================================================================
   Iceberg Partners LLC — scroll choreography
   Sticky stage + normalized progress p∈[0,1] drives every animation.
   Animate only transform / opacity (ANIMATION_SPEC §7).
   ===================================================================== */
(function () {
  "use strict";

  var html = document.documentElement;
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- small math helpers (ANIMATION_SPEC §2) ---------- */
  var clamp01 = function (t) { return t < 0 ? 0 : t > 1 ? 1 : t; };
  var sub = function (p, s, e) { return clamp01((p - s) / (e - s)); };          // local t in a sub-window
  var easeEmerge = function (t) { return 1 - Math.pow(1 - t, 3); };             // expo-ish out (discrete reveals)
  var easeInOut  = function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };

  // piecewise-linear interpolation across [p, value] anchors (camera-like, near-linear)
  function trackAnchors(p, stops) {
    if (p <= stops[0][0]) return stops[0][1];
    for (var i = 0; i < stops.length - 1; i++) {
      var a = stops[i], b = stops[i + 1];
      if (p <= b[0]) {
        var t = (p - a[0]) / (b[0] - a[0]);
        return a[1] + (b[1] - a[1]) * t;
      }
    }
    return stops[stops.length - 1][1];
  }

  /* =====================================================================
     Reduced motion: calm, naturally-scrolling layout. Fade in by view.
     ===================================================================== */
  if (prefersReduced) {
    html.classList.add("reduced");
    var faders = document.querySelectorAll(".anim");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { threshold: 0.18 });
      faders.forEach(function (el) { io.observe(el); });
    } else {
      faders.forEach(function (el) { el.classList.add("in"); });
    }
    return;   // no scroll choreography
  }

  /* =====================================================================
     Full motion path
     ===================================================================== */
  html.classList.add("js");

  var track    = document.getElementById("track");
  var stage    = document.getElementById("stage");
  var shafts   = document.getElementById("shafts");
  var vignette = document.getElementById("vignette");
  var cue      = document.getElementById("cue");

  // cache the animated elements
  function el(name) { return document.querySelector('[data-el="' + name + '"]'); }
  var $tip       = el("tip");
  var $mass      = el("mass");
  var $waterline = el("waterline");
  var $wordmark  = el("wordmark");
  var $lockup    = document.querySelector(".lockup");
  var $eyebrow   = el("eyebrow");
  var $lead      = el("lead");
  var $body      = el("body");
  var $footer    = el("footer");

  var vh = window.innerHeight;
  function onResize() { vh = window.innerHeight; }
  window.addEventListener("resize", onResize, { passive: true });

  /* ---------- background navy descent (DESIGN_SYSTEM §2.1) ---------- */
  var STOPS = [
    [0.00, [31, 43, 72], [27, 38, 65]],   // #1F2B48 / #1B2641  brand surface
    [0.25, [26, 36, 64], [22, 31, 55]],   // #1A2440 / #161F37  waterline
    [0.45, [20, 28, 50], [16, 24, 44]],   // #141C32 / #10182C  upper deep
    [0.70, [13, 20, 38], [10, 16, 32]],   // #0D1426 / #0A1020  deep
    [1.00, [8, 14, 28],  [6, 10, 22]]     // #080E1C / #060A16  abyss
  ];
  function lerpRGB(a, b, t) {
    return "rgb(" +
      Math.round(a[0] + (b[0] - a[0]) * t) + "," +
      Math.round(a[1] + (b[1] - a[1]) * t) + "," +
      Math.round(a[2] + (b[2] - a[2]) * t) + ")";
  }
  function bgAt(p) {
    for (var i = 0; i < STOPS.length - 1; i++) {
      var s0 = STOPS[i], s1 = STOPS[i + 1];
      if (p <= s1[0]) {
        var t = (p - s0[0]) / (s1[0] - s0[0]);
        return [lerpRGB(s0[1], s1[1], t), lerpRGB(s0[2], s1[2], t)];
      }
    }
    var last = STOPS[STOPS.length - 1];
    return [lerpRGB(last[1], last[1], 0), lerpRGB(last[2], last[2], 0)];
  }

  /* =====================================================================
     Marine motes — sparse pale-gold flecks, below water only (§4.9)
     ===================================================================== */
  var motes = (function () {
    var canvas = document.getElementById("motes");
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    var isMobile = window.matchMedia("(max-width: 640px)").matches;
    var COUNT = isMobile ? 22 : 46;
    var particles = [];

    function size() {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function seed() {
      particles.length = 0;
      for (var i = 0; i < COUNT; i++) {
        var far = Math.random() < 0.5;               // two parallax depths
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: far ? 0.7 + Math.random() * 0.7 : 1.1 + Math.random() * 1.2,
          spd: (far ? 6 : 12) + Math.random() * 10,  // px/sec downward drift
          sway: 0.3 + Math.random() * 0.6,
          phase: Math.random() * Math.PI * 2,
          baseA: far ? 0.06 + Math.random() * 0.03 : 0.08 + Math.random() * 0.04
        });
      }
    }
    size(); seed();
    window.addEventListener("resize", function () { size(); seed(); }, { passive: true });

    var last = performance.now();
    return {
      density: 0,   // 0→1, set from p
      render: function (now) {
        var dt = Math.min((now - last) / 1000, 0.05); last = now;
        ctx.clearRect(0, 0, W, H);
        if (this.density <= 0.001) return;
        for (var i = 0; i < particles.length; i++) {
          var p = particles[i];
          p.y += p.spd * dt;
          p.phase += dt * p.sway;
          if (p.y - p.r > H) { p.y = -p.r; p.x = Math.random() * W; }
          var x = p.x + Math.sin(p.phase) * 8;
          ctx.beginPath();
          ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(207, 196, 140, " + (p.baseA * this.density).toFixed(3) + ")";
          ctx.fill();
        }
      }
    };
  })();

  /* =====================================================================
     The frame: compute p, drive everything
     ===================================================================== */
  var lastP = -1;
  var forcedP = null;   // dev-only: ?debug + window.__frameAt(p) to inspect a fixed state

  function frame(now) {
    // normalized scroll progress across the track (ANIMATION_SPEC §9)
    var total = track.offsetHeight - vh;
    var rectTop = track.getBoundingClientRect().top;
    var p = total > 0 ? clamp01(-rectTop / total) : 0;
    if (forcedP !== null) p = forcedP;

    // ambient layers (motes drift) need every frame; scene only on change
    motes.render(now);

    if (Math.abs(p - lastP) > 0.0001) {
      lastP = p;
      stage.style.setProperty("--p", p.toFixed(4));

      /* --- background navy descent (§4.1) --- */
      var bg = bgAt(p);
      stage.style.background = "linear-gradient(180deg," + bg[0] + " 0%," + bg[1] + " 100%)";

      /* --- gold waterline / surface (§4.2): deliberate, eased threshold pass --- */
      var wlT = easeInOut(sub(p, 0.08, 0.30));               // --ease-surface across the crossing
      var wlY = 32 + wlT * (-12 - 32);                       // 32vh → -12vh, eased
      $waterline.style.transform = "translateY(" + wlY.toFixed(2) + "vh)";
      $waterline.style.opacity = (1 - sub(p, 0.22, 0.30)).toFixed(3);

      /* --- iceberg tip (§4.3): rest -20vh, rises and exits --- */
      var tipY = trackAnchors(p, [[0, -20], [0.30, -50], [0.46, -84]]);
      var tipOp = 1 - sub(p, 0.30, 0.46);
      $tip.style.transform = "translateY(" + tipY + "vh)";
      $tip.style.opacity = tipOp;

      /* --- iceberg mass (§4.4): the reveal --- */
      var massY  = trackAnchors(p, [[0.30, 70], [0.40, 34], [0.62, 0], [0.88, -18]]);
      var massSc = trackAnchors(p, [[0.30, 1], [0.40, 1.04], [0.62, 1.15], [0.88, 1.18]]);
      var massOp = trackAnchors(p, [[0.30, 0], [0.40, 1], [0.62, 1], [0.88, 0.25], [1, 0.18]]);
      $mass.style.transform = "translateY(" + massY + "vh) scale(" + massSc.toFixed(3) + ")";
      $mass.style.opacity = massOp;

      /* --- wordmark: gleam, then drift-up dissolve (§4.5) --- */
      var gleam = easeInOut(sub(p, 0.18, 0.30));            // 0→1 sweep
      var gleamPos = (-15 + gleam * 130).toFixed(1) + "%";
      $lockup.style.setProperty("--gleam-pos", gleamPos);

      var out = easeEmerge(sub(p, 0.30, 0.46));
      $wordmark.style.opacity = (1 - out).toFixed(3);
      $wordmark.style.transform =
        "translateY(" + (-2 + out * -40) + "vh) scale(" + (1 - out * 0.04).toFixed(3) + ")";

      /* --- mission eyebrow + sentence 1 (§4.6) --- */
      var eye = easeEmerge(sub(p, 0.55, 0.70));
      $eyebrow.style.opacity = eye.toFixed(3);
      $eyebrow.style.transform = "translateY(" + ((1 - eye) * 16) + "px)";

      var s1 = easeEmerge(sub(p, 0.58, 0.74));
      $lead.style.opacity = s1.toFixed(3);
      $lead.style.transform = "translateY(" + ((1 - s1) * 28) + "px)";
      $lead.style.filter = "blur(" + ((1 - s1) * 8).toFixed(2) + "px)";

      /* --- mission sentence 2 (§4.7) --- */
      var s2 = easeEmerge(sub(p, 0.66, 0.84));
      $body.style.opacity = s2.toFixed(3);
      $body.style.transform = "translateY(" + ((1 - s2) * 20) + "px)";
      $body.style.filter = "blur(" + ((1 - s2) * 6).toFixed(2) + "px)";

      /* --- gold light shafts (§4.8) --- */
      shafts.style.opacity = trackAnchors(p, [[0.18, 0], [0.32, 0.18], [0.62, 0.12], [0.90, 0.06], [1, 0.05]]).toFixed(3);

      /* --- marine motes density (§4.9) --- */
      motes.density = clamp01(sub(p, 0.32, 0.55));
      document.getElementById("motes").style.opacity = motes.density > 0 ? 1 : 0;

      /* --- vignette (§4.12) --- */
      vignette.style.opacity = (clamp01(p) * 0.5).toFixed(3);

      /* --- footer (§4.11) --- */
      var f = easeEmerge(sub(p, 0.90, 1.0));
      $footer.style.opacity = f.toFixed(3);
      $footer.style.transform = "translateX(-50%) translateY(" + ((1 - f) * 12) + "px)";

      /* --- scroll cue: visible only at the very top (§4.10) --- */
      cue.style.opacity = (1 - sub(p, 0.02, 0.08)).toFixed(3);
    }
  }

  /* ---------- drive loop: Lenis if present, else native scroll ---------- */
  var lenis = null;
  if (typeof window.Lenis === "function") {
    lenis = new window.Lenis({ lerp: 0.09 });
    // dev-only handle for deep-linking to a scroll position (e.g. ?debug + console)
    if (location.search.indexOf("debug") > -1) window.__lenis = lenis;
  }
  if (location.search.indexOf("debug") > -1) {
    window.__frameAt = function (p) { forcedP = p; lastP = -1; };
  }

  function raf(now) {
    if (lenis) lenis.raf(now);
    frame(now);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // calm page load-in (ANIMATION_SPEC §6.1): fade the whole stage up once
  stage.style.opacity = "0";
  stage.style.transition = "opacity 600ms ease-out";
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { stage.style.opacity = "1"; });
  });
})();
