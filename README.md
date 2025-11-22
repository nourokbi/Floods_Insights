# Eye of Hapi

Eye of Hapi is a comprehensive web application for visualizing flood risk, environmental data, and community-driven disaster insights for selected map locations. It provides interactive map analysis, weather snapshots, earthquake info, historical flood statistics, community posts, saved reports, and exportable PDF reports.

## Features

- Interactive map with basemap switching, legend, and location search
- Select a point to run flood risk prediction (Weathering API)
- Current weather snapshot (Open‑Meteo) and hourly context
- Nearest earthquake details (USGS feed)
- Historical flood statistics from ArcGIS FeatureServer
- Community page for sharing, liking, and saving disaster reports
- Sidebar with most liked posts and quick actions
- Add, edit, and delete posts with comments and likes
- Save/bookmark posts and view them in the Saved page
- Responsive/mobile-friendly design for all pages
- Gallery and history pages with vertical mobile layouts
- Exportable analysis report (PDF) including map screenshot and charts
- User authentication and protected routes
- Real-time loading spinners and improved UX for API-driven features

## Technologies

- Frontend

  - React (JSX)
  - Vite (dev tooling)
  - Chart.js (react-chartjs-2) for charts
  - ArcGIS JavaScript API (map and `mapView.takeScreenshot()`)
  - jsPDF + html2canvas (client-side PDF export)
  - Lucide icons for UI icons
  - CSS modules / component styles
  - Axios for API calls
  - Responsive/mobile-first CSS

- Backend / Services

  - Weathering API (Node/Express) for flood predictions (`/api/predict`)
  - Open‑Meteo (weather data)
  - USGS earthquake feeds (nearest quake info)
  - ArcGIS FeatureServer (historical flood statistics)
  - Custom endpoints for community posts, likes, bookmarks, and comments

- Tooling
  - npm / Node.js
  - ESLint (linting)
  - git

## Project Structure (high-level)

- `Frontend/` — React app (Vite)

  - `src/components/` — UI components (map, panels, legend, switchers, community, auth)
  - `src/pages/` — top-level routes/pages (Analyze, Community, Saved, History, etc.)
  - `src/utils/` — helper utilities (report generator, formatters)
  - `public/` — static assets
  - `package.json`, `vite.config.js`, etc.

- `Backend/` — backend services (prediction API, community endpoints)

## Running Locally

Prerequisites: Node.js (14+), npm

1. Frontend

```bash
cd Frontend
npm install
npm run dev
```

2. Backend (Weathering API & Community Endpoints)

```bash
cd Backend
# follow backend README / install dependencies
npm install
npm run dev
# or start whatever server the backend exposes (check Backend/ README)
```

Notes:

- The frontend expects the Weathering API at `http://localhost:5000/api/predict` by default. Adjust `InfoSidebar.jsx` or environment config if your backend uses a different host/port.
- Community endpoints (posts, likes, bookmarks, comments) are expected at the same base URL (see `src/config/api.js`).
- ArcGIS and Open‑Meteo calls are made client-side; ensure network access and CORS settings if you host the app remotely.

## PDF Report Export

The app uses `jsPDF` and `html2canvas` to generate client-side PDF reports. The generator helper is at `src/utils/generateReportClean.js` and is invoked by `InfoSidebar.jsx` when a point has prediction data available.

To improve chart fidelity in the PDF, pass chart refs and use Chart.js's `toBase64Image()` to embed higher-quality images instead of DOM screenshots.

## Adding Images to README / Documentation

To add images:

- Create a folder: `docs/images/`
- Add image files (e.g., `screenshot-map.png`, `report-sample.png`)
- Reference them in this README using relative paths:
  ```md
  ![Map screenshot](docs/images/screenshot-map.png)
  ```

## Contributing

- Open an issue or PR for changes.
- Follow existing JS/React style and run linters/tests before committing.

## License

Specify project license here (e.g., MIT) or include a `LICENSE` file at repository root.

## Contact

Project owner: nourokbi1@gmail.com

---

## Contributors

These contributors were detected from the git history. If you'd like to add or correct names, tell me and I'll update this list.

- Nour Okbi [nourokbi](https://github.com/nourokbi)
- Mohamed Sultan (GitHub: Salt73)
- Marwan El-Mehy (GitHub: marwanelmehy422-gif)

If you'd like, I can:

- Add example images into `docs/images/` (please provide screenshots),
- Expand README with architecture diagrams, or
- Generate a `docs/` site using a simple static generator.
