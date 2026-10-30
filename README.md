# Portfolio site

A single static page: `index.html`, `styles.css`, `main.js` and `assets/`. No build step, so you can open `index.html` straight from the folder.

## Editing content

- **Text:** everything lives in `index.html`, one `<section>` per block (Experience, Selected work, Skills, Recognition and certifications, Education and languages, Contact).
- **Career chart:** each role is an `<li class="role">` with `data-start` / `data-end` in `YYYY-MM` form (`data-end="present"` for the current job). `main.js` recalculates the bar lengths, durations and year axis from those dates every time the page loads. The inline `--from` / `--to` numbers are only a fallback for when JavaScript is off.
- **Résumé downloads:** the buttons expect exactly these two files in `assets/`:
  - `Hakeem_PA_Senior_Frontend_Engineer_Resume.pdf` (the main button)
  - `Hakeem_PA_Full_Stack_Engineer_Resume.pdf` (the "Full-stack version" links)
- **Photo:** replace `assets/photo.jpg` with a square-ish image about 600 px wide, compressed (for example with squoosh.app). The page shows it at 290 px, and a large file slows the first paint.
- **Colours and fonts:** they're the variables at the top of `styles.css`. The dark theme repeats the same variables twice, once for the system setting and once for the toggle, so change both blocks.

## Publishing (free)

**Netlify Drop:** go to https://app.netlify.com/drop and drag the whole `portfolio` folder onto the page. You get a live URL in seconds. Create a free account to keep the site and rename it.

**GitHub Pages:**
1. Create a public repository, for example `hakeempa.github.io`.
2. Upload the *contents* of this folder (so `index.html` sits at the repository root).
3. Open Settings → Pages, set Source to "Deploy from a branch", then pick `main` and `/ (root)`.
4. The site goes live at `https://<your-username>.github.io/` within a minute or two.

## After it's live

- In `index.html`, change `og:image` (and the JSON-LD `image`) to the full URL of the photo, e.g. `https://hakeempa.github.io/assets/photo.jpg`, so link previews on LinkedIn and WhatsApp show it.
- Add the site's URL to your résumé header and your LinkedIn profile.
