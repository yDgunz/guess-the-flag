# Guess the Flag

A World Cup–themed flag-guessing game built for a 6-year-old flag enthusiast.

## Play locally

    python3 -m http.server 8000

Then open http://localhost:8000

## Run tests

    node --test

## Deploy

Push to GitHub and enable GitHub Pages (Settings → Pages → Deploy from branch → main → /root).
Add the resulting URL to the iPad's home screen via Safari's Share → "Add to Home Screen" for a full-screen app feel.

## Third-party assets

- Flag SVGs: [flag-icons](https://github.com/lipis/flag-icons) (MIT), vendored in `vendor/flag-icons/`.
- World map SVG: [svg-maps](https://github.com/VictorCazanave/svg-maps) (CC BY 4.0), vendored in `vendor/svg-maps-world/`.
