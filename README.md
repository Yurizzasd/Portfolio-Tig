# Tig — Portfolio

Portfolio of **Tig (Tiago Pires)** — video editor & motion designer.
Static site: no build step, no dependencies, native JS only.

## Structure

```
index.html            single page (Hero, Work, About, Services, Contact)
assets/css/main.css   design system + layout + motion
assets/js/main.js     nav, menu, reveals, modal player, copy email
assets/img/           icons, OG image, work thumbnails
photo.jpg / icon.png  original portrait + channel mascot
```

## Run locally

Any static server works from the project root:

```
python -m http.server 8000
# or
npx serve .
```

Open http://localhost:8000

## Deploy — GitHub Pages

1. Push this repo to GitHub (currently hosted as `Portfolio-Tig` under
   `Yurizzasd`; Settings → Pages → Deploy from branch `main`, root `/`).
2. To move it to Tiago's account: repo **Settings → General → Transfer
   ownership** to `tiagopiressantos-lgtm`, then recreate Pages on that
   account (`tiagopiressantos-lgtm.github.io/Portfolio` stays available
   by pointing the old repo to a redirect or re-uploading).

## Deploy — Cloudflare Pages

```
npx wrangler pages deploy . --project-name tig-portfolio --branch main
```

Live at: https://tig-portfolio.pages.dev
(Main deploys may use a hash subdomain if the project was first created
via direct upload; the canonical URL is set in `index.html`.)

## Notes

- Video embeds are click-to-load (`<dialog>` + facade). YouTube loads
  only when a project opens in the modal player.
- `prefers-reduced-motion` disables the timecode ticker, load-in and
  scroll reveals.
- Update canonical/og URLs in `index.html` if the deployment address
  changes.
