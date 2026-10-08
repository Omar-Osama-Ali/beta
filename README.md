# MYRIAM & AHMED — Wedding Invitation

Static, mobile-first wedding invitation inspired by the Saladin Citadel, Cairo.
Plain HTML, CSS and vanilla JavaScript. No backend, no build step, no API keys.
Deploys directly to GitHub Pages.

## Files
- `index.html` – structure and copy (English, LTR)
- `style.css` – design tokens at the top (`:root`), then each section
- `script.js` – all event details live in the `WEDDING_CONFIG` block at the top
- `assets/song.mp3` – the existing wedding music (unchanged)

## Edit the details
Open `script.js` and change `WEDDING_CONFIG`:
- `eventDate` – keep the `+02:00` so the countdown and calendar use Cairo time
- `mapsUrl` – Google Maps link
- `whatsappNumber` – digits only, international format (`201200140223`)
- `maxGuests` – highest number of guests per reply (including the guest)
- `dodgeLimit` – how many times the "No" button steps aside before it can be chosen
- `photos` – add real photographs, e.g. `{ src: "assets/photos/01.jpg", alt: "Myriam and Ahmed" }`.
  Until then the Moments section shows empty arched frames and a quiet note.

## RSVP
Pressing **Send RSVP** validates the form and opens WhatsApp Click-to-Chat with a
prepared message (mobile: `wa.me`, desktop: WhatsApp Web). The page only says the RSVP
is *ready* in WhatsApp — it can't know whether the guest pressed Send.

## GitHub Pages
Upload the whole folder to the repository root, then Settings → Pages → Deploy from branch → main / root.

## Optional
Add `og:url` and an `og:image` meta tag in `index.html` once the final URL and a share image exist.
