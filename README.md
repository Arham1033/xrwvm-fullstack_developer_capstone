# Cars Dealership Full Stack Capstone

IBM Developer Skills Network full stack capstone: Django + React + Node/Express/MongoDB + Flask sentiment service.

See **[docs/CAPSTONE_GUIDE.md](docs/CAPSTONE_GUIDE.md)** for how to run, test, deploy and capture the required screenshots.

| Folder | What it is | Port |
|---|---|---|
| `server/` | Django project (`djangoproj`, `djangoapp`), serves the API, static pages and the React build | 8000 |
| `server/frontend/` | React app (`src/`) and static pages (`static/`) | 3000 (dev only) |
| `server/database/` | Express + MongoDB dealer/review service | 3030 |
| `server/djangoapp/microservices/` | Flask sentiment analyzer | 5050 locally (5000 in Docker) |
