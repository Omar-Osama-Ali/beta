/* ==========================================================================
   MYRIAM & AHMED — invitation script (vanilla JS, no backend)
   Edit the details here only.
   ========================================================================== */
const WEDDING_CONFIG = {
  eventDate: "2026-12-31T20:00:00+02:00",   // 31 Dec 2026, 8:00 PM Cairo time (UTC+2)
  timeZone: "Africa/Cairo",
  eventDurationMinutes: 180,
  venueName: "Saladin Citadel",
  venueCity: "Cairo, Egypt",
  mapsUrl: "https://maps.app.goo.gl/uzpyK4hZpvjFcDH76",
  whatsappNumber: "201200140223",           // +20 120 014 0223, international format, digits only
  maxGuests: 6,                             // total people per reply, including the guest
  dodgeLimit: 3,                            // how many times the "No" button steps aside
  // Add real photographs here, e.g. { src: "assets/photos/01.jpg", alt: "Myriam and Ahmed" }
  photos: []
};

(() => {
  "use strict";

  const C = WEDDING_CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const eventDate = new Date(C.eventDate);

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (_) { /* ignore */ }
      ta.remove();
      return ok;
    }
  }

  /* ---------- date text (always shown in Cairo time) ---------- */
  function fmt(opts) {
    return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: C.timeZone }).format(eventDate);
  }
  function initDates() {
    const map = {
      dateLong: fmt({ day: "numeric", month: "long", year: "numeric" }),
      dateShort: fmt({ day: "numeric", month: "long", year: "numeric" }),
      weekday: fmt({ weekday: "long" }),
      time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: C.timeZone }).format(eventDate)
    };
    document.querySelectorAll("[data-bind]").forEach(el => {
      const v = map[el.dataset.bind];
      if (v) el.textContent = v;
    });
    $("#mapsBtn").href = C.mapsUrl;
  }

  /* ---------- countdown ---------- */
  function initCountdown() {
    const ids = { d: $("#cDays"), h: $("#cHours"), m: $("#cMinutes"), s: $("#cSeconds") };
    const note = $("#countNote");
    const pad = n => String(n).padStart(2, "0");
    function tick() {
      let diff = eventDate.getTime() - Date.now();
      if (diff <= 0) {
        diff = 0;
        const endsAt = eventDate.getTime() + C.eventDurationMinutes * 60000;
        note.textContent = Date.now() < endsAt ? "The celebration has begun." : "Thank you for celebrating with us.";
        note.hidden = false;
      }
      ids.d.textContent = pad(Math.floor(diff / 864e5));
      ids.h.textContent = pad(Math.floor(diff % 864e5 / 36e5));
      ids.m.textContent = pad(Math.floor(diff % 36e5 / 6e4));
      ids.s.textContent = pad(Math.floor(diff % 6e4 / 1e3));
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- music ---------- */
  const music = (() => {
    const audio = $("#bgMusic"), btn = $("#musicBtn"), label = $("#musicText");
    let wanted = false, userPaused = false, retryArmed = false;

    function paint() {
      const on = !audio.paused;
      btn.dataset.state = on ? "on" : "off";
      btn.setAttribute("aria-pressed", String(on));
      label.textContent = on ? "Music on" : "Music off";
    }
    function armRetry() {
      if (retryArmed) return;
      retryArmed = true;
      const evts = ["pointerdown", "keydown", "touchend"];
      const go = () => {
        evts.forEach(e => document.removeEventListener(e, go, true));
        retryArmed = false;
        if (wanted && !userPaused && audio.paused) audio.play().then(paint).catch(() => {});
      };
      evts.forEach(e => document.addEventListener(e, go, true));
    }
    async function start() {
      wanted = true;
      userPaused = false;
      try { await audio.play(); } catch (_) { armRetry(); }
      paint();
    }
    btn.addEventListener("click", () => {
      if (audio.paused) { start(); }
      else { userPaused = true; audio.pause(); paint(); }
    });
    audio.addEventListener("play", paint);
    audio.addEventListener("pause", paint);
    paint();
    return { start };
  })();

  /* ---------- entrance ---------- */
  function initGate() {
    const gate = $("#gate"), btn = $("#enterBtn"), page = $("#page"), title = $("#mainTitle");
    page.inert = true;
    btn.focus({ preventScroll: true });
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    let opened = false;
    btn.addEventListener("click", () => {
      if (opened) return;
      opened = true;
      music.start();                               // runs inside the click, so the browser allows sound
      gate.classList.add("is-leaving");
      const wait = reduceMotion ? 0 : 380;
      setTimeout(() => {
        gate.classList.add("is-open");
        document.body.classList.remove("is-locked");
        document.body.classList.add("is-revealed");
        page.inert = false;
        title.focus({ preventScroll: true });
        if (location.hash && $(location.hash)) $(location.hash).scrollIntoView();
      }, wait);
      setTimeout(() => { gate.hidden = true; }, reduceMotion ? 120 : wait + 1250);
    });
  }

  /* ---------- calendar ---------- */
  function initCalendar() {
    const stamp = d => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const start = eventDate, end = new Date(start.getTime() + C.eventDurationMinutes * 60000);
    const title = "Myriam & Ahmed — Wedding";
    const where = `${C.venueName}, ${C.venueCity}`;

    $("#gcalBtn").addEventListener("click", () => {
      const url = "https://calendar.google.com/calendar/render?action=TEMPLATE"
        + `&text=${encodeURIComponent(title)}`
        + `&dates=${stamp(start)}/${stamp(end)}`
        + `&details=${encodeURIComponent("Wedding invitation — Myriam & Ahmed\n" + C.mapsUrl)}`
        + `&location=${encodeURIComponent(where)}`;
      window.open(url, "_blank", "noopener");
    });

    $("#icsBtn").addEventListener("click", () => {
      const esc = s => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
      const ics = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Myriam and Ahmed//Wedding Invitation//EN", "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        `UID:myriam-ahmed-${stamp(start)}@wedding-invitation`,
        `DTSTAMP:${stamp(new Date())}`,
        `DTSTART:${stamp(start)}`,
        `DTEND:${stamp(end)}`,
        `SUMMARY:${esc(title)}`,
        `LOCATION:${esc(where)}`,
        `DESCRIPTION:${esc("Wedding invitation — Myriam & Ahmed\nMap: " + C.mapsUrl)}`,
        "END:VEVENT", "END:VCALENDAR"
      ].join("\r\n");
      const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url; a.download = "myriam-and-ahmed-wedding.ics";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast("Calendar file downloaded");
    });
  }

  /* ---------- share ---------- */
  function initShare() {
    const link = () => location.href.split("#")[0];
    $("#shareBtn").addEventListener("click", async () => {
      if (navigator.share) {
        try {
          await navigator.share({ title: "MYRIAM & AHMED — Wedding Invitation", text: "You are invited to the wedding of Myriam & Ahmed.", url: link() });
        } catch (_) { /* dismissed */ }
      } else {
        toast((await copyText(link())) ? "Invitation link copied" : "Copy the link from your browser's address bar");
      }
    });
    $("#copyBtn").addEventListener("click", async () => {
      toast((await copyText(link())) ? "Invitation link copied" : "Copy the link from your browser's address bar");
    });
  }

  /* ---------- photographs (only real ones, supplied through the config) ---------- */
  function initPhotos() {
    if (!C.photos || !C.photos.length) return;
    const wrap = $("#niches");
    wrap.textContent = "";
    C.photos.forEach(p => {
      const d = document.createElement("div");
      d.className = "niche";
      const img = document.createElement("img");
      img.src = p.src; img.alt = p.alt || ""; img.loading = "lazy"; img.decoding = "async";
      d.appendChild(img);
      wrap.appendChild(d);
    });
    $("#nicheNote").hidden = true;
  }

  /* ---------- RSVP ---------- */
  function initRSVP() {
    const form = $("#rsvpForm"), sent = $("#sent");
    const nameIn = $("#fullName"), guestsIn = $("#guests"), msgIn = $("#message");
    const yes = $("#yesBtn"), no = $("#noBtn"), stage = $("#stage"), nudge = $("#nudge");
    const minus = $("#guestsMinus"), plus = $("#guestsPlus");
    const err = { name: $("#nameError"), attend: $("#attendError"), guests: $("#guestsError") };
    const YES_TEXT = "Yes, I'll be there", NO_TEXT = "No, I can't attend";
    guestsIn.max = String(C.maxGuests);

    let attendance = null;       // "yes" | "no"
    let lastMessage = "";

    /* attendance */
    function setAttendance(v) {
      attendance = v;
      yes.setAttribute("aria-pressed", String(v === "yes"));
      no.setAttribute("aria-pressed", String(v === "no"));
      const attending = v === "yes";
      guestsIn.disabled = minus.disabled = plus.disabled = !attending;
      if (v === "no") guestsIn.value = "0";
      if (attending && (!Number(guestsIn.value) || Number(guestsIn.value) < 1)) guestsIn.value = "1";
      clearError("attend");
      clearError("guests");
    }
    yes.addEventListener("click", () => setAttendance("yes"));

    /* evasive "No" button */
    let dodges = 0, settled = reduceMotion, tx = 0, ty = 0, lastDodgeAt = 0, nudgeTimer;

    function overlaps(a, b, m) {
      return a.left < b.right + m && a.right > b.left - m && a.top < b.bottom + m && a.bottom > b.top - m;
    }
    function moveAway(px, py) {
      const s = stage.getBoundingClientRect();
      const n = no.getBoundingClientRect();
      const y = yes.getBoundingClientRect();
      const vw = document.documentElement.clientWidth, vh = window.innerHeight, pad = 8;
      const minX = Math.max(s.left, pad), maxX = Math.min(s.right, vw - pad) - n.width;
      const minY = Math.max(s.top, pad), maxY = Math.min(s.bottom, vh - pad) - n.height;
      if (maxX < minX || maxY < minY) return false;

      // Strict pass first (clear of the pointer, visibly displaced), then a relaxed pass.
      const passes = [{ gap: 10, keep: 24, minMove: 48 }, { gap: 6, keep: 6, minMove: 24 }];
      for (const rule of passes) {
        let best = null, bestScore = Infinity;
        for (let i = 0; i < 60; i++) {
          const left = minX + Math.random() * (maxX - minX);
          const top = minY + Math.random() * (maxY - minY);
          const r = { left, top, right: left + n.width, bottom: top + n.height };
          if (overlaps(r, y, rule.gap)) continue;
          if (px != null && px >= r.left - rule.keep && px <= r.right + rule.keep && py >= r.top - rule.keep && py <= r.bottom + rule.keep) continue;
          const dist = Math.hypot(left - n.left, top - n.top);
          if (dist < rule.minMove) continue;
          const score = Math.abs(dist - 110);        // prefer a nearby hop
          if (score < bestScore) { bestScore = score; best = { left, top }; }
        }
        if (best) {
          tx += best.left - n.left;
          ty += best.top - n.top;
          no.style.transform = `translate(${tx}px, ${ty}px)`;
          return true;
        }
      }
      return false;
    }
    function attemptDodge(e) {
      if (settled) return false;
      const now = performance.now();
      if (now - lastDodgeAt < 450) return true;       // one attempt per hop
      if (dodges >= C.dodgeLimit) { settled = true; return false; }
      lastDodgeAt = now;
      const moved = moveAway(e && e.clientX, e && e.clientY);
      if (!moved) { settled = true; return false; }   // no room to move: behave like a normal button
      dodges++;
      if (dodges >= 2) {
        nudge.textContent = "Are you sure?";
        clearTimeout(nudgeTimer);
        nudgeTimer = setTimeout(() => { nudge.textContent = ""; }, 2600);
      }
      return true;
    }
    let lastTouchAt = -1e9;
    no.addEventListener("pointerdown", e => {
      if (e.pointerType !== "mouse") lastTouchAt = performance.now();
      if (attemptDodge(e)) e.preventDefault();
    });
    no.addEventListener("pointerenter", e => {
      // Hover only applies to real mice; ignore the compatibility events that follow a touch.
      if (e.pointerType === "mouse" && performance.now() - lastTouchAt > 1000) attemptDodge(e);
    });
    no.addEventListener("click", e => {
      // A click that follows a dodge (finger lifted over the old spot) must not select "No".
      if (e.detail > 0 && performance.now() - lastDodgeAt < 700 && !settled) { e.preventDefault(); return; }
      // Keyboard and assistive-technology activation (detail === 0) always works.
      setAttendance("no");
      no.style.transform = "";
      tx = ty = 0;
      nudge.textContent = "";
    });
    window.addEventListener("resize", () => { no.style.transform = ""; tx = ty = 0; });

    /* guests stepper */
    const clampGuests = n => Math.min(C.maxGuests, Math.max(1, n));
    minus.addEventListener("click", () => { guestsIn.value = clampGuests((Number(guestsIn.value) || 1) - 1); clearError("guests"); });
    plus.addEventListener("click", () => { guestsIn.value = clampGuests((Number(guestsIn.value) || 0) + 1); clearError("guests"); });
    guestsIn.addEventListener("input", () => clearError("guests"));
    nameIn.addEventListener("input", () => clearError("name"));

    /* validation */
    function showError(key, msg, input) {
      err[key].textContent = msg;
      if (input) input.setAttribute("aria-invalid", "true");
      if (key === "attend") $("#attendLabel").closest(".field").classList.add("has-error");
    }
    function clearError(key) {
      err[key].textContent = "";
      if (key === "name") nameIn.removeAttribute("aria-invalid");
      if (key === "guests") guestsIn.removeAttribute("aria-invalid");
      if (key === "attend") $("#attendLabel").closest(".field").classList.remove("has-error");
    }
    function validate() {
      ["name", "attend", "guests"].forEach(clearError);
      let first = null;
      const name = nameIn.value.trim().replace(/\s+/g, " ");
      if (name.length < 2) { showError("name", "Please enter your full name.", nameIn); first = first || nameIn; }
      if (!attendance) { showError("attend", "Please choose whether you can attend.", null); first = first || yes; }
      let guests = 0;
      if (attendance === "yes") {
        const raw = guestsIn.value.trim(), n = Number(raw);
        if (raw === "" || !Number.isInteger(n) || n < 1 || n > C.maxGuests) {
          showError("guests", `Enter a number of guests from 1 to ${C.maxGuests}.`, guestsIn);
          first = first || guestsIn;
        } else guests = n;
      }
      return { ok: !first, first, name, guests };
    }

    /* WhatsApp */
    const isMobile = () =>
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints > 1 && window.matchMedia("(pointer: coarse)").matches);

    function buildMessage(name, guests) {
      const lines = [
        "Wedding RSVP", "",
        `Name: ${name}`,
        `Attendance: ${attendance === "yes" ? YES_TEXT : NO_TEXT}`,
        `Guests: ${guests}`
      ];
      const note = msgIn.value.trim();
      if (note) lines.push(`Message: ${note}`);
      return lines.join("\n");
    }
    const waUrl = (text, mobile) => mobile
      ? `https://wa.me/${C.whatsappNumber}?text=${encodeURIComponent(text)}`
      : `https://web.whatsapp.com/send?phone=${C.whatsappNumber}&text=${encodeURIComponent(text)}`;

    form.addEventListener("submit", e => {
      e.preventDefault();
      const v = validate();
      if (!v.ok) { v.first.focus(); return; }

      lastMessage = buildMessage(v.name, v.guests);
      const mobile = isMobile();
      const url = waUrl(lastMessage, mobile);

      const w = window.open(url, "_blank");           // inside the submit gesture, so it isn't blocked
      if (w) { try { w.opener = null; } catch (_) { /* ignore */ } }

      $("#waLink").href = `https://wa.me/${C.whatsappNumber}?text=${encodeURIComponent(lastMessage)}`;
      $("#preview").textContent = lastMessage;
      form.hidden = true;
      sent.hidden = false;
      sent.focus({ preventScroll: true });
      sent.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
    });

    $("#copyMsgBtn").addEventListener("click", async () => {
      toast((await copyText(lastMessage)) ? "Message copied" : "Select the message and copy it");
    });
    $("#editBtn").addEventListener("click", () => {
      sent.hidden = true;
      form.hidden = false;
      nameIn.focus();
    });
  }

  /* ---------- go ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    initDates();
    initCountdown();
    initPhotos();
    initCalendar();
    initShare();
    initRSVP();
    initGate();
  });
})();
