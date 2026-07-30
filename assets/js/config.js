/* Carrel: pretotype landing page config (single source of truth).
 * Fake-door test: measures download-button taps + email signups.
 * Only headline / sub / benefits differ between variants a and b. */
window.CARREL_CONFIG = {
  appName: "Carrel",
  launchMonth: "Oktober 2026",

  // --- integrations (auto-activate when no longer 'REPLACE') --------------
  analytics: {
    plausibleDomain: "atlanticore09.github.io",
    plausibleSrc: "https://plausible.io/js/script.manual.js"
  },
  formspree: { endpoint: "https://formspree.io/f/mojgzqbz" },

  // Fake door: store buttons DON'T navigate. Tapping = counted, then reveal.
  storeUrls: { ios: "#", android: "#" },

  // --- shared copy (identical on both variants) --------------------------
  shared: {
    tagline: "Deine Lernzeit zählt sich von selbst.",
    everyLibrary: "Funktioniert in jeder Bibliothek, nicht nur im Philologicum.",
    downloadHeading: "Hol dir Carrel",
    downloadNote: "Kostenlos. In unter einer Minute eingerichtet.",

    how: {
      heading: "Einmal einrichten. Dann einfach reingehen.",
      sub: "Carrel nutzt das Geofencing deines Handys, um zu merken, wenn du deine Bibliothek betrittst. Dein einziger Job: durch die Tür gehen.",
      steps: [
        { icon: "geofence", title: "Bibliothek anpinnen", text: "Wähle deine Bibliothek einmal aus und leg den Radius fest." },
        { icon: "entry",    title: "Reingehen. Das war's.", text: "Die Sitzung startet automatisch beim Ankommen und endet beim Gehen." },
        { icon: "chart",    title: "Rhythmus wächst", text: "Streak, Wochenziel und Heatmap füllen sich ganz von selbst." }
      ]
    },

    features: {
      heading: "Mehr als nur Stunden zählen",
      sub: "Alles, was aus Lernzeit einen Rhythmus macht.",
      items: [
        { icon: "heatmap", title: "Heatmap", text: "Ein Semester Lernen in einem Bild. Jede Sitzung füllt ein Kästchen, im GitHub-Stil." },
        { icon: "chart",   title: "Analytics", text: "Beste Streak, Gesamtstunden, Wochenschnitt und Ø Sitzungsdauer auf einen Blick." },
        { icon: "trophy",  title: "Bestenlisten", text: "Miss dich mit anderen Lernenden und klettere in den Bestenlisten nach oben." },
        { icon: "friends", title: "Mit Freund:innen", text: "Verbinde dich mit Freund:innen, seht eure Streaks und pusht euch gegenseitig." }
      ]
    },

    faq: {
      heading: "Häufige Fragen",
      items: [
        { q: "Wie unterscheidet sich Carrel von anderen Lern-Trackern?",
          a: "Die meisten Tracker brauchen einen manuellen Tap zum Einchecken, und die Streak reißt genau an den Tagen, an denen du es vergisst. Carrel erkennt deine Bibliotheksbesuche automatisch per Standort." },
        { q: "Ich vergesse ständig, Dinge zu loggen. Klappt das trotzdem?",
          a: "Genau dafür ist es gebaut. Es gibt nichts zu merken. Die App erkennt, wenn du in der Bibliothek bist, und zeichnet die Sitzung selbst auf." },
        { q: "Zieht die Standorterkennung meinen Akku leer?",
          a: "Nein. Carrel nutzt das eingebaute Geofencing deines Handys, die App wird nur geweckt, wenn du die Grenze deiner Bibliothek überschreitst." },
        { q: "Funktioniert Carrel in jeder Bibliothek?",
          a: "Ja. Pinne jede Bibliothek weltweit an, auch mehrere. Das Philologicum ist nur der Anfang." },
        { q: "Was ist mit meiner Privatsphäre?",
          a: "Carrel merkt sich nur, dass du in der Bibliothek warst, keine durchgehende Standortverfolgung. Anonyme, datensparsame Auswertung, keine Cookies." }
      ]
    },

    reveal: {
      headline: "Fast fertig.",
      body: "Carrel startet im Oktober 2026 zum Semesterbeginn. Trag dich ein. Du bekommst als Erste:r Bescheid und früheren Zugang."
    },
    emailButton: "Benachrichtige mich",
    emailPlaceholder: "deine@uni-mail.de",
    optin: "Ich möchte einmalig zum Start benachrichtigt werden.",
    thanks: "Danke! Wir melden uns zum Start. 📚",
    footerDisclaimer: "Studierendenprojekt. Nicht mit der Universität oder der Bibliothek verbunden."
  },

  // --- per-variant (ONLY these differ) -----------------------------------
  variants: {
    a: {
      key: "a",
      headline: "Deine Lernstunden im Philologicum. Automatisch.",
      sub: "Kein Timer, kein Startknopf. Carrel erkennt, wenn du reinkommst, und zählt deine Lernzeit von selbst.",
      benefits: [
        { icon: "ic-entry", text: "Automatisch erfasst, sobald du die Bibliothek betrittst" },
        { icon: "ic-chart", text: "Deine Lernwoche auf einen Blick" },
        { icon: "ic-gear",  text: "Läuft im Hintergrund, ganz ohne Aufwand" }
      ]
    },
    b: {
      key: "b",
      headline: "Ist das Philologicum gerade voll?",
      sub: "Sieh die Live-Auslastung, bevor du losläufst. Und deine Lernzeit zählt sich automatisch mit.",
      benefits: [
        { icon: "gauge",     text: "Live-Auslastung, bevor du losläufst" },
        { icon: "ic-floors", text: "Sieh, welche Ebene noch Plätze hat" },
        { icon: "ic-cap",    text: "Von Studierenden, nicht von Sensoren" }
      ]
    }
  }
};
