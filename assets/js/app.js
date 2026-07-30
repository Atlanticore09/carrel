/* Carrel landing logic: variant attribution, event tracking, reveal, email. */
(function () {
  "use strict";
  var CFG = window.CARREL_CONFIG;
  // A config value counts as "live" once it's no longer the REPLACE placeholder.
  function isSet(v) { return typeof v === "string" && v && v.indexOf("REPLACE") === -1; }

  /* ---------- variant (never silently default to A) ---------------------- */
  var raw = new URLSearchParams(location.search).get("v");
  var v = (raw === "a" || raw === "b") ? raw : null;
  var analyticsVariant = v || "unknown";      // what we TAG events with
  var renderKey = v || "a";                    // what we SHOW (fallback visual only)
  var V = CFG.variants[renderKey];

  /* ---------- OS detection (separate fact from button tapped) ------------ */
  function detectOS() {
    var ua = navigator.userAgent || "";
    if (/android/i.test(ua)) return "android";
    if (/iphone|ipad|ipod/i.test(ua)) return "ios";
    if (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return "ios"; // iPadOS
    return "other";
  }
  var OS = detectOS();

  /* ---------- session-scoped dedup (no cookies, no cross-session id) ------ */
  var mem = {};
  function once(key) {
    var k = "carrel_" + key;
    try { if (sessionStorage.getItem(k)) return false; sessionStorage.setItem(k, "1"); return true; }
    catch (e) { if (mem[k]) return false; mem[k] = 1; return true; }
  }

  /* ---------- event tracking --------------------------------------------- */
  window.__events = window.__events || [];
  function track(name, props) {
    var payload = Object.assign({ event: name, variant: analyticsVariant, os: OS, ts: new Date().toISOString() }, props || {});
    window.__events.push(payload);
    // Visible in console for verification and local capture.
    try { console.log("[carrel-event] " + JSON.stringify(payload)); } catch (e) {}
    // Plausible (cookieless). Manual pageview so the denominator carries variant.
    if (isSet(CFG.analytics.plausibleDomain) && typeof window.plausible === "function") {
      if (name === "page_view") window.plausible("pageview", { props: props });
      else window.plausible(name, { props: props });
    }
  }

  /* ---------- rendering (structure identical; only content swaps) --------- */
  function el(id) { return document.getElementById(id); }
  function gaugeSVG(pct, cls) {
    var hot = pct >= 66, col = hot ? "#C4453F" : (pct >= 40 ? "#E8A44C" : "#3A6B5C");
    return '<svg viewBox="0 0 120 66" class="' + (cls || "") + '" aria-hidden="true">' +
      '<path d="M8 60 A52 52 0 0 1 112 60" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="10" stroke-linecap="round" pathLength="100"/>' +
      '<path d="M8 60 A52 52 0 0 1 112 60" fill="none" stroke="' + col + '" stroke-width="10" stroke-linecap="round" pathLength="100" stroke-dasharray="' + pct + ' 100"/>' +
      '</svg>';
  }
  function spr(src) { return '<img class="spr pixel" src="' + src + '" alt="">'; }

  var SCREENS = {
    checkin: function () {
      return screenShell(
        '<div class="card"><div class="row"><div class="chk">✓</div>' +
        '<div><div class="lbl">Eingecheckt · Philologicum</div><div style="font-weight:700">seit 13:42</div></div></div></div>' +
        '<div class="card"><div class="lbl">Heute</div><div class="big">2h 14m</div>' +
        '<div class="row" style="margin-top:6px">' + spr("assets/img/ic-clock.png") +
        '<span style="font-size:12px;color:#b6a9c9">Läuft automatisch weiter</span></div></div>');
    },
    week: function () {
      var days = ["M", "D", "M", "D", "F", "S", "S"], h = [60, 80, 45, 95, 70, 30, 20];
      var bars = h.map(function (x, i) { return '<i class="' + (i > 4 ? "q" : "") + '" style="height:' + x + '%"></i>'; }).join("");
      var lbls = days.map(function (d) { return '<span style="flex:1;text-align:center;font-size:10px;color:#b6a9c9">' + d + '</span>'; }).join("");
      return screenShell(
        '<div class="card"><div class="lbl">Diese Woche</div><div class="big">11h 30m</div>' +
        '<div class="bars">' + bars + '</div><div class="row" style="margin-top:4px">' + lbls + '</div></div>');
    },
    occupancy: function () {
      return screenShell(
        '<div class="card gauge">' + gaugeSVG(72) +
        '<div class="g-val">72%</div><span class="pill full">ziemlich voll</span></div>' +
        '<div class="card"><div class="lbl">Bester Zeitpunkt heute</div><div style="font-weight:700;margin-top:2px">nach 18:00 Uhr</div></div>');
    },
    floors: function () {
      var f = [["EG", 40, "12 frei"], ["1. OG", 88, "2 frei"], ["2. OG", 62, "8 frei"], ["3. OG", 25, "19 frei"]];
      var rows = f.map(function (r) {
        return '<div class="floor"><span style="min-width:42px">' + r[0] + '</span>' +
          '<span class="meter"><span class="' + (r[1] >= 80 ? "hot" : "") + '" style="width:' + r[1] + '%"></span></span>' +
          '<span class="n">' + r[2] + '</span></div>';
      }).join("");
      return screenShell('<div class="card"><div class="lbl">Freie Plätze je Ebene</div>' +
        '<div style="display:flex;flex-direction:column;gap:11px;margin-top:10px">' + rows + '</div></div>');
    }
  };
  function screenShell(inner) {
    return '<div class="screen"><div class="sbar"><span class="app">' + CFG.appName +
      '</span><span>9:41</span></div><div class="body">' + inner + '</div></div>';
  }

  function render() {
    document.documentElement.lang = "de";
    el("appName").textContent = CFG.appName;
    el("logo").src = "assets/img/logo.png";
    el("hero-art").src = V.hero;
    el("hero-art").alt = CFG.appName;
    el("headline").textContent = V.headline;
    el("sub").textContent = V.sub;

    el("benefits").innerHTML = V.benefits.map(function (b) {
      var icon = /\.png$/.test(b.icon)
        ? '<img src="' + b.icon + '" alt="">'
        : gaugeSVG(72, "ic-gauge"); // ic-gauge placeholder → inline svg
      return '<div class="benefit"><span class="ic">' + icon + '</span><p>' + b.text + '</p></div>';
    }).join("");

    el("phones").innerHTML = V.screens.map(function (s) { return '<div class="phone">' + SCREENS[s]() + "</div>"; }).join("");

    el("dlHeading").textContent = CFG.shared.downloadHeading;
    el("revealHead").textContent = CFG.shared.reveal.headline;
    el("revealBody").textContent = CFG.shared.reveal.body;
    el("email").placeholder = CFG.shared.emailPlaceholder;
    el("optinLabel").textContent = CFG.shared.optin;
    el("emailBtn").textContent = CFG.shared.emailButton;
    el("thanks").textContent = CFG.shared.thanks;
    el("disc").textContent = CFG.shared.footerDisclaimer;
  }

  /* ---------- interactions ----------------------------------------------- */
  function onDownload(btn) {
    var button = btn.getAttribute("data-store"); // ios | android
    // Fire the PRIMARY metric before anything changes the view.
    if (once("dl_" + button)) track("download_tap", { button: button, os: OS, variant: analyticsVariant });
    var reveal = el("reveal");
    reveal.hidden = false;
    // Short delay so the beacon/plausible call is dispatched before scroll/paint.
    setTimeout(function () { reveal.scrollIntoView({ behavior: "smooth", block: "start" }); }, 150);
  }

  function onSubmit(e) {
    e.preventDefault();
    var email = el("email"), optin = el("optin"), err = el("emailErr");
    if (!email.value || !email.checkValidity()) { err.textContent = "Bitte gib eine gültige E-Mail-Adresse ein."; err.style.display = "block"; return; }
    if (!optin.checked) { err.textContent = "Bitte bestätige die Benachrichtigung."; err.style.display = "block"; return; }
    err.style.display = "none";
    function done() {
      if (once("em")) track("email_submit", { variant: analyticsVariant, os: OS });
      el("form").style.display = "none";
      el("thanks").style.display = "block";
    }
    if (isSet(CFG.formspree.endpoint)) {
      var fd = new FormData();
      fd.append("email", email.value);
      fd.append("variant", analyticsVariant);
      fd.append("os", OS);
      fd.append("_subject", "Carrel launch-notify (" + analyticsVariant + ")");
      fetch(CFG.formspree.endpoint, { method: "POST", body: fd, headers: { Accept: "application/json" } })
        .then(function (r) { if (r.ok) done(); else { err.textContent = "Etwas ist schiefgelaufen. Bitte später erneut versuchen."; err.style.display = "block"; } })
        .catch(function () { err.textContent = "Netzwerkfehler. Bitte später erneut versuchen."; err.style.display = "block"; });
    } else {
      done(); // local/dev: no backend wired yet
    }
  }

  function initScroll() {
    function depth() {
      var h = document.documentElement, sc = h.scrollTop || document.body.scrollTop;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? (sc / max) * 100 : 100;
      if (p >= 50 && once("sc50")) track("scroll_50", { variant: analyticsVariant });
      if (p >= 90 && once("sc90")) track("scroll_90", { variant: analyticsVariant });
    }
    var t;
    window.addEventListener("scroll", function () { clearTimeout(t); t = setTimeout(depth, 120); }, { passive: true });
  }

  function loadPlausible() {
    if (!isSet(CFG.analytics.plausibleDomain)) return; // no external call until a real domain is set
    window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments); };
    var s = document.createElement("script");
    s.defer = true; s.src = CFG.analytics.plausibleSrc;
    s.setAttribute("data-domain", CFG.analytics.plausibleDomain);
    document.head.appendChild(s);
  }

  /* ---------- boot -------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    loadPlausible();
    render();
    Array.prototype.forEach.call(document.querySelectorAll("[data-store]"), function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); onDownload(b); });
    });
    el("form").addEventListener("submit", onSubmit);
    initScroll();
    // Denominator: one attributed page_view per session.
    if (once("pv")) track("page_view", { variant: analyticsVariant, os: OS, referrer: document.referrer || "" });
    document.body.setAttribute("data-variant", analyticsVariant);
  });
})();
