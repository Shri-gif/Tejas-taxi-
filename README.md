# Tejas Taxi Complete Source

Customer website + admin panel + Supabase integration.

## Structure
index.html
css/style.css
js/supabase.js, website.js, booking.js
admin/index.html
admin/css/admin.css
admin/js/auth.js, dashboard.js, cars.js, routes.js, services.js, reviews.js, bookings.js, settings.js
images/
.github/workflows/deploy.yml
supabase-setup.sql

## Setup
1. Your Supabase project and Auth user are already created.
2. If the tables/policies are not present, run supabase-setup.sql in SQL Editor.
3. Push all files to GitHub main branch.
4. Enable GitHub Pages -> GitHub Actions.
5. Open /admin/ and log in with the Supabase Auth account.

The browser uses the Supabase publishable key only. Never add a service-role/secret key.

## Current image behavior
Admin -> Cars uses an image URL. A later Storage upload can replace this without changing the database design.
