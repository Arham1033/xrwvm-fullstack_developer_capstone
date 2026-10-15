import logging
import os
from urllib.parse import quote

import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

backend_url = os.getenv(
    'backend_url', default="http://localhost:3030")
sentiment_analyzer_url = os.getenv(
    'sentiment_analyzer_url',
    default="http://localhost:5050/")

REQUEST_TIMEOUT = 10


def get_request(endpoint, **kwargs):
    """GET `endpoint` from the Node/Express dealer service.

    Extra keyword arguments are sent as query-string parameters.
    Returns the decoded JSON, or None if the service cannot be reached.
    """
    request_url = backend_url.rstrip('/') + endpoint
    try:
        response = requests.get(
            request_url, params=kwargs, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        return response.json()
    except Exception as err:
        logger.error("GET %s failed: %s (%s)", request_url, err, type(err))
        return None


def analyze_review_sentiments(text):
    """Ask the sentiment microservice to classify `text`.

    Returns a dict like {"sentiment": "positive"}. If the service is
    unreachable, {"sentiment": "unknown"} is returned so that a review
    page can still be displayed.
    """
    request_url = (sentiment_analyzer_url.rstrip('/') + "/analyze/" +
                   quote(str(text), safe=''))
    try:
        response = requests.get(request_url, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        return response.json()
    except Exception as err:
        logger.error("Sentiment request failed: %s (%s)", err, type(err))
        return {"sentiment": "unknown"}


def post_review(data_dict):
    """POST a review to the Node/Express service (`/insert_review`)."""
    request_url = backend_url.rstrip('/') + "/insert_review"
    response = requests.post(
        request_url, json=data_dict, timeout=REQUEST_TIMEOUT)
    response.raise_for_status()
    return response.json()
