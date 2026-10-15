# Capstone guide: status, commands, evidence

Paths are relative to the repository root (the folder that contains `server/` and `.github/`).

## 0. Read this first: what was and was not verified

The starter you uploaded was an **unfinished IBM template**, not a nearly-finished app. Before my changes it had no `Register.jsx`, no `.github/workflows`, no Contact page, no Django models/migrations/`get_cars`/dealer views, no Express dealer routes, and an empty `Home.html` logout.

My work environment had **no access to PyPI or npm**, so I could not install Django, React, Mongoose or jshint. What that means:

| Check | Result |
|---|---|
| `flake8 server` (same command the workflow runs) | **Passed** locally |
| Python syntax compile of every `.py` file | **Passed** |
| JSX/JS syntax parse of every file in `frontend/src` | **Passed** (syntax only, not a build) |
| Express routes, run against an in-memory **stub** of mongoose and express, with your real `reviews.json`/`dealerships.json` | **Passed** (50 dealers, state filter, dealer by id, reviews with flat fields, insert, malformed body). Not a real MongoDB run |
| Flask sentiment routes with a **stub** analyzer | Route/JSON/slash handling passed. Real VADER scores **not run** |
| Django `check`, `migrate`, `test`, `runserver` | **NOT RUN** (Django not installable here) |
| `npm run build`, browser behaviour, console errors | **NOT RUN** |
| Real MongoDB, real GitHub Actions run, deployment | **NOT RUN** (needs you) |

So nothing below is claimed to "pass" on a running system. Sections 3 and 4 give the exact commands that will confirm each item on your machine. I also wrote 15 Django tests in `server/djangoapp/tests.py`; **they have never been executed**, so if one fails, send me the output.

## 1. Files changed

| File | Change |
|---|---|
| `server/djangoapp/models.py` | `CarMake`, `CarModel` (FK, type choices, year 2015-2023) |
| `server/djangoapp/migrations/0001_initial.py` | Hand-written initial migration (Django wasn't available to generate it; run `makemigrations --check` to confirm it matches) |
| `server/djangoapp/admin.py` | Admin for both models, `CarModel` inline on `CarMake` |
| `server/djangoapp/populate.py` | `initiate()` seeds 5 makes / 15 models, idempotent |
| `server/djangoapp/views.py` | `login_user` (malformed JSON -> 400), `logout_request`, `registration`, `get_cars`, `get_dealerships`, `get_dealer_details`, `get_dealer_reviews` (adds sentiment), `add_review` |
| `server/djangoapp/restapis.py` | `get_request`, `analyze_review_sentiments` (URL-quoted), `post_review` |
| `server/djangoapp/urls.py` | `register`, `login`, `logout`, `get_cars`, `get_dealers[/state]`, `dealer/<id>`, `reviews/dealer/<id>`, `add_review` |
| `server/djangoapp/tests.py` | New Django tests |
| `server/djangoproj/urls.py` | Routes for `/about/`, `/contact/` and the React pages (`/login/`, `/register/`, `/dealers/`, `/dealer/<id>`, `/postreview/<id>`) |
| `server/djangoproj/settings.py` | Template/static dirs for `frontend/static` and `frontend/build`; `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, secret key and debug read from environment; two pre-existing flake8 errors fixed |
| `server/database/app.js` | Implemented `fetchDealers`, `fetchDealers/:state`, `fetchDealer/:id`; `MONGO_URL` override; fixtures found in `./data`; safer `insert_review`; removed a broken `res` reference at startup |
| `server/database/.jshintrc` | New, for the JavaScript lint job |
| `server/djangoapp/microservices/app.py`, `Dockerfile` | `/analyze/<path:text>` (slashes allowed), real JSON content type; Dockerfile now installs the VADER lexicon zip for NLTK |
| `server/frontend/src/components/Register/Register.jsx` | **New** (the starter only had `Register.css`) |
| `server/frontend/src/App.js` | Routes for register, dealers, dealer, postreview |
| `server/frontend/src/config.js` | New: `apiUrl()` (same-origin by default) and `readJson()` |
| `server/frontend/src/components/Login/Login.jsx` | Error handling (inline message, network failure, bad JSON), no redirect-in-render |
| `server/frontend/src/components/Header/Header.jsx` | Working logout, Login/Register links when logged out, `class`->`className`, `<text>`->`<span>` (removes React console warnings) |
| `server/frontend/src/components/Dealers/Dealers.jsx` | Fixed stray `;`, keys, tbody, error message, filter URL |
| `server/frontend/src/components/Dealers/Dealer.jsx` | URL built from origin (the old `indexOf("dealer")` trick breaks on hostnames containing "dealer"), error states |
| `server/frontend/src/components/Dealers/PostReview.jsx` | Same URL fix; make/model chosen by index (old code split on spaces), `type="number"` year, validation, inline errors, handles 403/failed post |
| `server/frontend/package.json` | `"proxy": "http://localhost:8000"` so `npm start` can reach Django |
| `server/frontend/static/Contact.html` | **New**: `/static/style.css`, `/static/bootstrap.min.css`, `/static/cars.jpeg`, `/static/contactus.png`, Contact Us nav item `active` |
| `server/frontend/static/About.html` | Stylesheet links, header text, role-based team cards (replace with your own details) |
| `server/frontend/static/Home.html` | Working `logout()`, absolute `/static/...` paths |
| `.github/workflows/main.yml` | New: jobs **Lint Python Files** and **Lint JavaScript Files** |
| `.flake8`, `.gitignore` | flake8 config; ignore `node_modules`, build output, `.env` |
| `server/Dockerfile`, `entrypoint.sh`, `.dockerignore`, `deployment.yaml` | New deployment files (see section 7) |
| `server/djangoapp/.env.example` | New. The shipped `.env` held only placeholder text and was removed |

Not touched: `server/database/inventory.js` and `data/car_records.json` ship in the starter but nothing uses them, and your brief doesn't ask for inventory, so I left them as they are.

## 2. Rubric checklist

Status key: **Implemented** = code written. **Verified (partial)** = checked as described in section 0. **Needs your run** = confirm with the commands below.

| # | Requirement | Implementation | Status |
|---|---|---|---|
| 1 | Register page at `server/frontend/src/components/Register/Register.jsx` | Fields, validation, POST `/djangoapp/register`, messages | Implemented; syntax OK; needs your run |
| 2 | Login `POST /djangoapp/login` -> `{"userName": "...", "status": "Authenticated"}` | `views.login_user` | Implemented; tested by `tests.py`; needs your run |
| 3 | Invalid credentials / malformed JSON | Wrong password -> `{"userName": ...}` (starter behaviour); malformed JSON, missing fields -> 400 JSON | Implemented; needs your run |
| 4 | Logout `GET /djangoapp/logout` -> `{"userName": ""}` | `views.logout_request` + Header/Home logout | Implemented; needs your run |
| 5 | `get_cars` -> `{"CarModels": [{"CarModel", "CarMake"}]}` | `views.get_cars` (seeds if empty). Key names match what the starter's `PostReview.jsx` reads (`carmodel.CarMake`, `carmodel.CarModel`) | Implemented; needs your run |
| 6 | Sentiment `GET /analyze/<text>` -> `{"sentiment": ...}` | `microservices/app.py` | Routing verified with stub; VADER scoring needs your run |
| 7 | Django admin, superuser `root` | Models registered; section 5 | Needs your run |
| 8 | `GET /fetchReviews/dealer/<id>` with `purchase_date`, flat `car_make/car_model/car_year` | Starter schema and fixtures already flat; no nested `car` | Verified with stub on real fixture; real Mongo needs your run |
| 9 | `fetchDealers`, `fetchDealers/:state`, `fetchDealer/:id` | `app.js` | Verified with stub; real Mongo needs your run |
| 10 | Dealer list shows ID, name, city, address, zip, state | `Dealers.jsx` | Implemented; needs your run |
| 11 | Dealer page: dealer + reviews + sentiment icon | `Dealer.jsx`, `get_dealer_reviews` | Implemented; needs your run |
| 12 | Review form: text, purchase date, car make dropdown, car year, Post Review | `PostReview.jsx` | Implemented; needs your run |
| 13 | New review appears after posting | Redirects to `/dealer/<id>` which reloads reviews | Needs your run |
| 14 | Contact page with the 2 stylesheets, `cars.jpeg`, `contactus.png`, Contact Us active | `Contact.html` (the 4 assets already existed in the ZIP) | Implemented; needs your run |
| 15 | Workflow shows "Lint Python Files" and "Lint JavaScript Files" | `main.yml` | `flake8` passed locally; jshint and the real run need you |
| 16 | Deployment URL | Cannot be invented | Needs you (section 7) |

Unresolved ambiguities (I did not invent rules):
- **Purchase date format.** Fixtures use `MM/DD/YYYY`; the date input sends `YYYY-MM-DD`. The starter stores both as plain strings; I kept that.
- **Car year range 2015-2023** comes from the starter's model hint and form; the fixture reviews contain older years.
- **Sentiment when the service is down** returns `"unknown"` (shown with the neutral icon) so the page still loads.

## 3. Run locally (Windows PowerShell)

Prerequisites: Python 3.10+, Node 18+, Docker Desktop (easiest way to get MongoDB).

**Terminal 1: Express + MongoDB**
```powershell
cd server\database
docker build . -t nodeapp
docker compose up
```
(Without Docker: run your own MongoDB and use `$env:MONGO_URL="mongodb://localhost:27017/"; npm install; node app.js`.)

**Terminal 2: sentiment service**
```powershell
cd server\djangoapp\microservices
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
New-Item -ItemType Directory -Force nltk_data\sentiment | Out-Null
Copy-Item sentiment\vader_lexicon.zip nltk_data\sentiment\
$env:NLTK_DATA = "$PWD\nltk_data"
flask --app app run --port 5050
```

**Terminal 3: Django + React build**
```powershell
cd server
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item djangoapp\.env.example djangoapp\.env
python manage.py makemigrations --check   # expect "No changes detected"
python manage.py migrate
python manage.py check
python manage.py test djangoapp
cd frontend
npm install
npm run build
cd ..
python manage.py runserver 8000
```
Open http://localhost:8000. After changing React code, run `npm run build` again.

## 4. curl tests (use `curl.exe` in PowerShell)

Create the request file once, because PowerShell mangles inline JSON quotes:
```powershell
'{"userName":"arham","password":"YOUR_PASSWORD"}' | Set-Content -Encoding ascii login.json
'{"userName":"arham2","password":"Passw0rd!23","firstName":"A","lastName":"B","email":"a@example.com"}' | Set-Content -Encoding ascii register.json
```
```powershell
# Register a user, then log in (cookie jar keeps the session)
curl.exe -i -X POST http://localhost:8000/djangoapp/register -H "Content-Type: application/json" --data-binary "@register.json"
curl.exe -i -c cj.txt -X POST http://localhost:8000/djangoapp/login -H "Content-Type: application/json" --data-binary "@login.json"
#   expect: {"userName": "arham", "status": "Authenticated"}
curl.exe -i -X POST http://localhost:8000/djangoapp/login -H "Content-Type: application/json" --data-raw "{bad"
#   expect: HTTP 400 {"status": 400, "message": "Malformed JSON"}
curl.exe -i http://localhost:8000/djangoapp/logout          #   {"userName": ""}

# Django endpoints
curl.exe http://localhost:8000/djangoapp/get_cars           # {"CarModels": [{"CarModel": ..., "CarMake": ...}, ...]}
curl.exe http://localhost:8000/djangoapp/get_dealers
curl.exe http://localhost:8000/djangoapp/get_dealers/Texas
curl.exe http://localhost:8000/djangoapp/dealer/15
curl.exe http://localhost:8000/djangoapp/reviews/dealer/15  # each review has "sentiment"

# Post a review (needs the logged-in cookie jar from above)
'{"name":"arham","dealership":15,"review":"Great service","purchase":true,"purchase_date":"2023-05-01","car_make":"Audi","car_model":"A4","car_year":2020}' | Set-Content -Encoding ascii review.json
curl.exe -b cj.txt -X POST http://localhost:8000/djangoapp/add_review -H "Content-Type: application/json" --data-binary "@review.json"   # {"status": 200}
curl.exe -X POST http://localhost:8000/djangoapp/add_review -H "Content-Type: application/json" --data-binary "@review.json"            # {"status": 403, ...}

# Express service directly
curl.exe http://localhost:3030/fetchDealers
curl.exe http://localhost:3030/fetchDealer/15
curl.exe http://localhost:3030/fetchReviews/dealer/15       # check purchase_date, car_make, car_model, car_year

# Sentiment service
curl.exe http://localhost:5050/analyze/Fantastic%20service
curl.exe http://localhost:5050/analyze/This%20was%20terrible

# Static assets (expect HTTP 200)
curl.exe -I http://localhost:8000/static/style.css
curl.exe -I http://localhost:8000/static/bootstrap.min.css
curl.exe -I http://localhost:8000/static/cars.jpeg
curl.exe -I http://localhost:8000/static/contactus.png
curl.exe -I http://localhost:8000/contact/
```

## 5. Admin user `root`

```powershell
cd server
python manage.py createsuperuser --username root --email you@example.com
```
Type your own password when prompted (never put it in code). To reset it: `python manage.py changepassword root`. Log in at http://localhost:8000/admin/. The database `db.sqlite3` is local and git-ignored, so create the user in **the same environment** you screenshot.

## 6. GitHub Actions

1. Create a GitHub repository and push this folder as the repo root (`.github/` must be at the top level).
   ```powershell
   git init
   git add .
   git commit -m "Complete capstone"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
2. Open the repo, then the **Actions** tab, then the **Lint Code** run. It has two jobs, **Lint Python Files** and **Lint JavaScript Files**.
3. Both must show green checks. To re-run: **Actions > Lint Code > Run workflow** (it has `workflow_dispatch`) or push a new commit.
4. If **Lint JavaScript Files** fails, open the log and send it to me; jshint could not be run here. Check locally with `npm install -g jshint; jshint server/database/app.js server/database/review.js server/database/dealership.js server/database/inventory.js`.
5. Check Python locally first: `pip install flake8; flake8 server`.

## 7. Deployment (your environment, not an invented URL)

- The grader wants the **learner-specific hostname that your IBM Skills Network environment gives you**. I cannot know it. Copy it from the address bar of your running app, or from the lab's "launch application"/port link for port 8000.
- Put that hostname into `server/djangoapp/.env` or the container environment:
  ```
  ALLOWED_HOSTS=localhost,127.0.0.1,<your-hostname-without-https>
  CSRF_TRUSTED_ORIGINS=https://<your-hostname>
  backend_url=<URL of your Express service, port 3030>
  sentiment_analyzer_url=<URL of your sentiment service>
  ```
- If you get "DisallowedHost" the hostname is missing from `ALLOWED_HOSTS`.
- Services and ports: Django 8000, Express 3030, sentiment 5000 in Docker (5050 locally).
- Docker route: `server/Dockerfile` builds the React app and Django into one image (`docker build -t dealership server`), then follow your lab's instructions to push it to **your** registry namespace and edit `server/deployment.yaml` (the image line is a placeholder).
- With `DEBUG=True` (the starter default) Django serves `/static/` itself. If you turn debug off you need a static file server in front.

## 8. Screenshot checklist (take each one yourself from the running app)

| # | Screenshot | Open | Must be visible |
|---|---|---|---|
| 1 | Logged-out homepage | `/` | "Dealerships" navbar, Login and Register links, "Welcome to our Dealerships!" banner, address bar |
| 2 | Dealer IDs and info | `/dealers` | Table headers ID / Dealer Name / City / Address / Zip / State, with several rows |
| 3 | Dealer list after login | `/dealers` while logged in | Your username and Logout in the navbar, a "Review Dealer" column |
| 4 | Dealer filter | `/dealers`, choose a state from the State dropdown | The dropdown with the chosen state and only that state's rows |
| 5 | Dealer details and reviews | `/dealer/15` | Dealer name and address line, review cards with sentiment icons, reviewer name and car make/model/year |
| 6 | Post Review form (before submitting) | `/postreview/15` | Review text box, Purchase Date, Car Make dropdown, Car Year, **Post Review** button, with your inputs filled in |
| 7 | Posted review and sentiment | `/dealer/15` right after posting | Your new review card with its sentiment icon |
| 8 | Django admin with `root` | `/admin/` > Users | Logged in as `root` and the Users list (or the "WELCOME, ROOT" header) |
| 9 | GitHub Actions success | Actions tab, the run page | Both jobs, **Lint Python Files** and **Lint JavaScript Files**, with green checks |
| 10 | Deployed app | Your assigned URL | The browser address bar with your learner-specific hostname, plus the app page |
| 11 | Contact page (if requested) | `/contact/` | Contact Us nav item highlighted, `cars.jpeg` banner, `contactus.png` icon |

Frame the whole browser window with the address bar in every shot. Dealer 15 has real fixture reviews; dealers with no reviews show "No reviews yet!".

## 9. Things only you can do

1. Run sections 3 and 4 and send me any failing output (Django `test`, `npm run build`, console errors).
2. Create the `root` superuser and take the admin screenshot.
3. Push to GitHub and confirm both lint jobs pass.
4. Take all screenshots from your own running app.
5. Get your real deployment hostname/URL from your assigned environment and set the environment variables.
6. Replace the placeholder contact details in `Contact.html` and the team cards in `About.html` with your own.
