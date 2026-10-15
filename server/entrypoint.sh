#!/bin/sh

# Make migrations, apply them and collect the static files, then start
# the server command passed to the container.
python manage.py makemigrations --noinput
python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec "$@"
