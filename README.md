# Tejas Taxi Website

A mobile-first taxi website inspired by the supplied reference screenshots.

## Files
- `index.html` — all website sections
- `style.css` — complete responsive styling
- `script.js` — business details, mobile menu and WhatsApp booking
- `images/` — car images
- `.github/workflows/deploy.yml` — automatic GitHub Pages deployment

## Before publishing
Open `script.js` and change:
- businessName
- phone
- whatsapp
- email
- address

## GitHub Pages
1. Create a GitHub repository.
2. Upload all files/folders from this project.
3. Commit to the `main` branch.
4. GitHub → Settings → Pages → Source: GitHub Actions.
5. The included workflow will deploy the site.

The booking form requires no backend: it opens WhatsApp with the booking details.
