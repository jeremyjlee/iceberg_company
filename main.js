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
  var $mass      = el("mass");
  var $surface   = document.getElementById("surface");      // the gold line SVG
  var $surfPath  = document.getElementById("surfacePath");  // its path
  var $wordmark  = el("wordmark");
  var $lockup    = document.querySelector(".lockup");
  var $eyebrow   = el("eyebrow");
  var $lead      = el("lead");
  var $body      = el("body");
  var $footer    = el("footer");

  var vh = window.innerHeight;
  // mirrors the .berg--mass width in styles.css (clamp, with the mobile override)
  function massWidth() {
    var w = window.innerWidth;
    return w <= 640 ? 0.78 * w : Math.max(320, Math.min(0.56 * w, 620));
  }
  var massW = massWidth();
  function onResize() { vh = window.innerHeight; massW = massWidth(); }
  window.addEventListener("resize", onResize, { passive: true });

  /* ---------- background navy descent (DESIGN_SYSTEM §2.1) ----------
     Stacked gradient layers, cross-faded by opacity (compositor-only) so we
     never repaint a full-screen gradient on scroll. s4 (abyss) stays opaque. */
  var bgEls = [
    document.querySelector(".bg-layer.s0"),
    document.querySelector(".bg-layer.s1"),
    document.querySelector(".bg-layer.s2"),
    document.querySelector(".bg-layer.s3")
  ];
  var BG_ZONES = [[0, 0.25], [0.25, 0.45], [0.45, 0.70], [0.70, 1.0]];

  var coarse = window.matchMedia("(pointer: coarse)").matches;   // touch / mobile

  /* ---------- gold surface line: straight waterline -> iceberg rim ----------
     7 control points morph between a wide flat line (FLAT_*) and the iceberg's
     top-shoulder profile (SH_F* = fractions of the mass SVG's viewBox), whose
     live screen position we read from the mass's bounding rect each frame. */
  var FLAT_X = [6, 20, 35, 50, 65, 80, 94];   // %vw, wide
  var FLAT_Y = 82;                             // %vh, calm surface — just above the scroll cue
  var SH_FX  = [0.061, 0.268, 0.382, 0.536, 0.689, 0.839, 0.943];
  var SH_FY  = [0.040, 0.017, 0.049, 0.011, 0.043, 0.026, 0.063];

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

    if (Math.abs(p - lastP) > 0.0001) {
      lastP = p;
      stage.style.setProperty("--p", p.toFixed(4));

      /* --- background navy descent (§4.1): cross-fade the stacked layers --- */
      for (var bi = 0; bi < bgEls.length; bi++) {
        bgEls[bi].style.opacity = (1 - sub(p, BG_ZONES[bi][0], BG_ZONES[bi][1])).toFixed(3);
      }

      /* --- iceberg mass (§4.4): the reveal --- */
      var massY  = trackAnchors(p, [[0.30, 70], [0.40, 34], [0.62, 0], [0.88, -18]]);
      var massSc = trackAnchors(p, [[0.30, 1], [0.40, 1.04], [0.62, 1.15], [0.88, 1.18]]);
      var massOp = trackAnchors(p, [[0.30, 0], [0.40, 1], [0.62, 1], [0.88, 0.25], [1, 0.18]]);
      $mass.style.transform = "translateY(" + massY + "vh) scale(" + massSc.toFixed(3) + ")";
      $mass.style.opacity = massOp;

      /* --- gold surface line: straight waterline → iceberg rim (§4.2).
             The shoulder's screen position is derived analytically from the mass
             transform (no getBoundingClientRect → no 1-frame lag, no reflow).
             Decoupled so the line never lags the rising mass:
               • baseline rides the shoulder's average height (ride)
               • jaggedness + width-narrowing grow separately (jag / wid) */
      var iw = window.innerWidth || 1;
      var massH = massW * (700 / 560);
      var bL = iw / 2 - (massW * massSc) / 2;                 // mass box left  (px)
      var bT = vh / 2 + (massY / 100) * vh - (massH * massSc) / 2;  // mass box top (px)
      var jx = [], jy = [], avgY = 0;
      for (var li = 0; li < 7; li++) {
        jx[li] = (bL + SH_FX[li] * massW * massSc) / iw * 100;
        jy[li] = (bT + SH_FY[li] * massH * massSc) / vh * 100;
        avgY += jy[li];
      }
      avgY /= 7;
      var ride = easeInOut(sub(p, 0.31, 0.44));              // flat → ride the shoulder
      var jag  = easeInOut(sub(p, 0.33, 0.52));              // bumps grow
      var wid  = easeInOut(sub(p, 0.31, 0.50));              // narrow to the iceberg
      var baseY = FLAT_Y + (avgY - FLAT_Y) * ride;
      var d = "";
      for (li = 0; li < 7; li++) {
        var x = FLAT_X[li] + (jx[li] - FLAT_X[li]) * wid;
        var y = baseY + (jy[li] - avgY) * jag;
        d += (li ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2) + " ";
      }
      $surfPath.setAttribute("d", d);
      $surface.style.opacity = (1 - sub(p, 0.88, 1.0) * 0.85).toFixed(3);

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
      if (!coarse) $lead.style.filter = "blur(" + ((1 - s1) * 8).toFixed(2) + "px)";

      /* --- mission sentence 2 (§4.7) --- */
      var s2 = easeEmerge(sub(p, 0.66, 0.84));
      $body.style.opacity = s2.toFixed(3);
      $body.style.transform = "translateY(" + ((1 - s2) * 20) + "px)";
      if (!coarse) $body.style.filter = "blur(" + ((1 - s2) * 6).toFixed(2) + "px)";

      /* --- gold light shafts (§4.8) --- */
      shafts.style.opacity = trackAnchors(p, [[0.18, 0], [0.32, 0.18], [0.62, 0.12], [0.90, 0.06], [1, 0.05]]).toFixed(3);

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

  /* ---------- drive loop: Lenis on pointer devices only.
       On touch/mobile, smooth-scroll libraries fight native momentum and cause
       jank — use native scroll there (the frame loop still drives the visuals). */
  var lenis = null;
  if (!coarse && typeof window.Lenis === "function") {
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
