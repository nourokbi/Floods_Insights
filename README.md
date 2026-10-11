# Eye of Hapi (Floods Insights)

A web app for exploring flood risk. You pick a point on the map and see a flood-risk prediction, current weather, the nearest recent earthquake and historical flood statistics, then export it all as a PDF report. A community section lets users post and discuss disaster reports.

**Live demo:** [floods-insights.vercel.app](https://floods-insights.vercel.app/)

This was a team project. The repo holds the React frontend, the Express community API and a small GIS chatbot service.

## Features

### Analyze
- ArcGIS map with basemap switching, a legend and location search
- Click a point to get a flood-risk prediction from the prediction API
- Current weather from Open-Meteo
- Nearest earthquake from the USGS feed
- Historical flood statistics from an ArcGIS FeatureServer, shown as Chart.js charts
- PDF report export with a map screenshot and the charts (jsPDF and html2canvas)

### Community
- Post disaster reports with images, then edit or delete them
- Like, comment on and bookmark reports
- Saved page for bookmarked reports, and a sidebar with the most-liked posts

### General
- Register and log in, with protected routes
- A GIS assistant chatbot
- History and about pages
- Responsive layout for mobile and desktop

## Tech stack

| Part | Tools |
|---|---|
| Frontend | React, Vite, React Router, ArcGIS Maps SDK for JavaScript, Chart.js, Axios, jsPDF, html2canvas, lucide-react |
| Community API | Node.js, Express 5, Knex, PostgreSQL, JWT, bcryptjs, Joi, Multer, Sharp, Cloudinary, Helmet, express-rate-limit |
| Chatbot | Node.js, Express, Google Gemini API |
| External data | Open-Meteo, USGS earthquake feed, ArcGIS FeatureServer, a separate flood prediction API |

## Community API

The API is split into routes, controllers, models, validation and middleware. Requests are validated with Joi, protected routes check a JWT, uploads go through Multer and Sharp to Cloudinary, and Helmet and a rate limiter are applied to all routes.

| Base path | What it covers |
|---|---|
| `/api/auth` | Register, login, logout, current user, profile update |
| `/api/reports` | List, read, create, update and delete reports, plus stats and the most-liked reports |
| `/api/comments` | Comments on a report |
| `/api/likes` | Toggle a like, like status, counts and who liked a report |
| `/api/bookmarks` | Toggle a bookmark, my bookmarks, bookmark status and counts |

`Backend/tests/` holds scripts that call a running API to check each feature end to end. They aren't connected to a test runner yet.

## Run locally

Requirements: Node.js 18+, npm, and PostgreSQL for the community API.

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

The frontend reads its API URLs from `src/config/api.js`. Each service has a local URL and a hosted URL, and you can override the community API with `VITE_API_BASE`.

### Community API

```bash
cd Backend
npm install
npm start
```

Create `Backend/.env`:

```env
PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/eye_of_hapi
JWT_SECRET=<long random string>
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

You can use `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` and `DB_PASSWORD` instead of `DATABASE_URL`.

### Chatbot

```bash
cd chat-Bot
npm install
node gis_chat_handler.js
```

The chatbot needs a Gemini API key. Read it from an environment variable rather than writing it in the code.

## Project structure

```
Frontend/
  src/pages/        Analyze, Community, Saved, History, About, Settings, auth pages
  src/components/   Map panels, community, dashboard, chatbot, layout
  src/utils/        PDF report generator, chart and map helpers, formatters
  src/config/       API base URLs
Backend/
  src/routes/       Express routers
  src/controllers/  Request handlers
  src/models/       Knex data access
  src/validations/  Joi schemas
  src/middleware/   Auth, upload, validation
  tests/            End-to-end check scripts
chat-Bot/           Gemini-based GIS assistant
```

## Team

- Nour Okbi ([@nourokbi](https://github.com/nourokbi))
- Mohamed Sultan ([@Salt73](https://github.com/Salt73))
- Marwan El-Mehy ([@marwanelmehy422-gif](https://github.com/marwanelmehy422-gif))
