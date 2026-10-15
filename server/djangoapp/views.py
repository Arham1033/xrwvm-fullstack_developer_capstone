import json
import logging

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import CarMake, CarModel
from .populate import initiate
from .restapis import (
    analyze_review_sentiments,
    get_request,
    post_review,
)

# Get an instance of a logger
logger = logging.getLogger(__name__)


def _parse_json_body(request):
    """Return the decoded JSON object in the request body, or None."""
    try:
        data = json.loads(request.body)
    except (ValueError, UnicodeDecodeError):
        return None
    return data if isinstance(data, dict) else None


# Create a `login_request` view to handle sign in request
@csrf_exempt
def login_user(request):
    if request.method != "POST":
        return JsonResponse(
            {"status": 405, "message": "POST required"}, status=405)
    data = _parse_json_body(request)
    if data is None:
        return JsonResponse(
            {"status": 400, "message": "Malformed JSON"}, status=400)
    username = data.get('userName')
    password = data.get('password')
    if not username or not password:
        return JsonResponse(
            {"status": 400,
             "message": "userName and password are required"},
            status=400)
    # Try to check if provided credentials can be authenticated
    user = authenticate(username=username, password=password)
    data = {"userName": username}
    if user is not None:
        # If user is valid, call login method to login current user
        login(request, user)
        data = {"userName": username, "status": "Authenticated"}
    return JsonResponse(data)


# Create a `logout_request` view to handle sign out request
def logout_request(request):
    logout(request)
    return JsonResponse({"userName": ""})


# Create a `registration` view to handle sign up request
@csrf_exempt
def registration(request):
    if request.method != "POST":
        return JsonResponse(
            {"status": 405, "message": "POST required"}, status=405)
    data = _parse_json_body(request)
    if data is None:
        return JsonResponse(
            {"status": 400, "message": "Malformed JSON"}, status=400)
    try:
        username = data['userName']
        password = data['password']
        first_name = data['firstName']
        last_name = data['lastName']
        email = data['email']
    except KeyError as missing:
        return JsonResponse(
            {"status": 400, "message": "Missing field: %s" % missing},
            status=400)
    if not username or not password:
        return JsonResponse(
            {"status": 400,
             "message": "userName and password are required"},
            status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse(
            {"userName": username, "error": "Already Registered"})

    # Create user in auth_user table and log them in
    user = User.objects.create_user(
        username=username, first_name=first_name, last_name=last_name,
        password=password, email=email)
    login(request, user)
    return JsonResponse({"userName": username, "status": "Authenticated"})


def get_cars(request):
    """Return all car makes/models as
    {"CarModels": [{"CarModel": "...", "CarMake": "..."}, ...]}"""
    if CarMake.objects.count() == 0:
        initiate()
    car_models = CarModel.objects.select_related('car_make')
    cars = [{"CarModel": car_model.name,
             "CarMake": car_model.car_make.name}
            for car_model in car_models]
    return JsonResponse({"CarModels": cars})


# Render the list of dealerships, all or by state
def get_dealerships(request, state="All"):
    if state == "All":
        endpoint = "/fetchDealers"
    else:
        endpoint = "/fetchDealers/" + state
    dealerships = get_request(endpoint)
    if dealerships is None:
        return JsonResponse(
            {"status": 502, "message": "Dealer service unavailable"},
            status=502)
    return JsonResponse({"status": 200, "dealers": dealerships})


# Render the reviews of a dealer, each with its sentiment
def get_dealer_reviews(request, dealer_id):
    if not dealer_id:
        return JsonResponse({"status": 400, "message": "Bad Request"})
    reviews = get_request("/fetchReviews/dealer/" + str(dealer_id))
    if reviews is None:
        return JsonResponse(
            {"status": 502, "message": "Dealer service unavailable"},
            status=502)
    for review_detail in reviews:
        response = analyze_review_sentiments(review_detail['review'])
        review_detail['sentiment'] = response.get('sentiment', 'unknown')
    return JsonResponse({"status": 200, "reviews": reviews})


# Render the details of one dealer
def get_dealer_details(request, dealer_id):
    if not dealer_id:
        return JsonResponse({"status": 400, "message": "Bad Request"})
    dealership = get_request("/fetchDealer/" + str(dealer_id))
    if dealership is None:
        return JsonResponse(
            {"status": 502, "message": "Dealer service unavailable"},
            status=502)
    return JsonResponse({"status": 200, "dealer": dealership})


# Submit a review (logged-in users only)
@csrf_exempt
def add_review(request):
    if request.user.is_anonymous:
        return JsonResponse({"status": 403, "message": "Unauthorized"})
    data = _parse_json_body(request)
    if data is None:
        return JsonResponse({"status": 400, "message": "Malformed JSON"})
    try:
        post_review(data)
        return JsonResponse({"status": 200})
    except Exception as err:
        logger.error("Error in posting review: %s", err)
        return JsonResponse(
            {"status": 401, "message": "Error in posting review"})
