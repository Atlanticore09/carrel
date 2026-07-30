/* Carrel — pretotype landing page config (single source of truth).
 * Everything an owner needs to change lives here. Values marked REPLACE
 * must be filled before go-live; the page runs locally without them. */
window.CARREL_CONFIG = {
  appName: "Carrel",
  launchMonth: "Oktober 2026",       // stated launch; edit reveal.body too if changed

  // --- integrations (paste one value each; each auto-activates when set) ---
  analytics: {
    // Plausible, cookieless, MANUAL mode so we attach variant/os to the pageview
    // and never fire an automatic (unattributed) pageview.
    plausibleDomain: "REPLACE.example.com",           // your site domain in Plausible
    plausibleSrc: "https://plausible.io/js/script.manual.js"
  },
  formspree: {
    // Your Formspree form endpoint — the only email step. e.g. https://formspree.io/f/xayzabcd
    endpoint: "https://formspree.io/f/REPLACE"
  },

  // Store buttons are the DOWNLOAD CTA. In the fake door they do NOT navigate —
  // tapping fires download_tap then reveals the "launching" message. These URLs
  // are kept for post-launch only.
  storeUrls: { ios: "REPLACE", android: "REPLACE" },

  // --- shared copy (identical on both variants) ---------------------------
  shared: {
    reveal: {
      headline: "Noch nicht ganz fertig.",
      body: "Wir starten im Oktober 2026 zum Semesterbeginn. Trag dich ein und du bekommst als Erste:r Bescheid."
    },
    emailButton: "Benachrichtige mich",
    emailPlaceholder: "deine@uni-mail.de",
    optin: "Ich möchte einmalig zum Start benachrichtigt werden.",
    thanks: "Danke! Wir melden uns zum Start.",
    footerDisclaimer: "Studierendenprojekt. Nicht mit der Universität oder der Bibliothek verbunden.",
    downloadHeading: "Jetzt vormerken"
  },

  // --- per-variant copy + art (ONLY these differ) -------------------------
  variants: {
    a: {
      key: "a",
      hero: "assets/img/hero-a.png",
      headline: "Deine Lernstunden im Philologicum — automatisch.",
      sub: "Kein Timer. Kein Startknopf. Einfach reinkommen.",
      benefits: [
        { icon: "assets/img/ic-entry.png", text: "Automatisch erfasst, sobald du die Bibliothek betrittst" },
        { icon: "assets/img/ic-chart.png", text: "Deine Lernwoche auf einen Blick" },
        { icon: "assets/img/ic-gear.png",  text: "Läuft im Hintergrund — kein Aufwand" }
      ],
      // which mock-UI screens to show (rendered in app.js, no generated text)
      screens: ["checkin", "week"]
    },
    b: {
      key: "b",
      hero: "assets/img/hero-b.png",
      headline: "Ist das Philologicum gerade voll?",
      sub: "Schau nach, bevor du losläufst.",
      benefits: [
        { icon: "assets/img/ic-gauge",     text: "Live-Auslastung, bevor du losfährst" },   // gauge rendered in CSS
        { icon: "assets/img/ic-floors.png", text: "Sieh, welche Ebene noch Plätze hat" },
        { icon: "assets/img/ic-cap.png",    text: "Von Studierenden, nicht von Sensoren" }
      ],
      screens: ["occupancy", "floors"]
    }
  }
};
