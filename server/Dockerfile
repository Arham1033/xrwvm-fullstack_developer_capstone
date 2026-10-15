# --- Stage 1: build the React frontend -------------------------------------
FROM node:18-bullseye-slim AS frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Django (serves the API, the static pages and the React build) -
FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV APP=/app

WORKDIR $APP

COPY requirements.txt $APP
RUN pip3 install --no-cache-dir -r requirements.txt

COPY . $APP
COPY --from=frontend /frontend/build $APP/frontend/build

EXPOSE 8000

RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/bin/bash", "/app/entrypoint.sh"]
CMD ["gunicorn", "--bind", ":8000", "--workers", "3", "djangoproj.wsgi"]
