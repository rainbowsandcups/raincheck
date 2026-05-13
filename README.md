# Raincheck — Zürich Oerlikon

A tiny, single-file web app that tells you **GO OUT** or **STAY HOME** based on the current weather in Zürich Oerlikon.

## Decision logic

- 🟢 **GO OUT** — temperature ≥ 15 °C **and** no rain/snow
- 🔴 **STAY HOME** — anything colder, or any precipitation

## Tech

Plain HTML + CSS + JavaScript. No build step, no dependencies.

Default data source: **[Open-Meteo](https://open-meteo.com/)** — free, no API key, accurate coverage for Switzerland. Optional: OpenWeatherMap (requires a key).

## Run locally

The simplest way — just open the file:

```bash
open index.html
```

Or serve it with any static server (recommended; avoids any browser quirks with `file://`):

```bash
# Python (built into macOS)
python3 -m http.server 8000

# or Node
npx serve .
```

Then visit <http://localhost:8000>.

## Switching to OpenWeatherMap (optional)

Open `index.html` and find the `CONFIG` block near the top of the `<script>`:

```js
const USE_OPENWEATHER = false;
const OPENWEATHER_API_KEY = "YOUR_OPENWEATHER_API_KEY_HERE";
```

1. Get a free key at <https://home.openweathermap.org/api_keys>
2. Set `USE_OPENWEATHER = true`
3. Paste your key into `OPENWEATHER_API_KEY`

## Deploy

It's one HTML file — drop it on any static host:

- **Vercel**: `vercel deploy` in this folder
- **GitHub Pages**: push to a repo and enable Pages
- **Netlify drop**: drag the folder onto <https://app.netlify.com/drop>

## Features

- Auto-refresh every 10 minutes (plus a manual Refresh button)
- Weather emoji icon based on conditions
- Mobile-friendly responsive layout
- Background color and theme-color metadata update with the verdict
