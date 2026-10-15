import json
from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import TestCase

from .models import CarMake, CarModel


def post_json(client, url, payload):
    return client.post(
        url, data=json.dumps(payload), content_type="application/json")


class AuthTests(TestCase):
    def setUp(self):
        User.objects.create_user(username="arham", password="Pass12345!")

    def test_login_success(self):
        response = post_json(self.client, "/djangoapp/login", {
            "userName": "arham", "password": "Pass12345!"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {
            "userName": "arham", "status": "Authenticated"})

    def test_login_wrong_password(self):
        response = post_json(self.client, "/djangoapp/login", {
            "userName": "arham", "password": "wrong"})
        self.assertEqual(response.json(), {"userName": "arham"})

    def test_login_malformed_json(self):
        response = self.client.post(
            "/djangoapp/login", data="{not json",
            content_type="application/json")
        self.assertEqual(response.status_code, 400)

    def test_login_missing_fields(self):
        response = post_json(self.client, "/djangoapp/login", {})
        self.assertEqual(response.status_code, 400)

    def test_logout(self):
        self.client.login(username="arham", password="Pass12345!")
        response = self.client.get("/djangoapp/logout")
        self.assertEqual(response.json(), {"userName": ""})
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_register_new_and_duplicate(self):
        payload = {"userName": "newuser", "password": "Pass12345!",
                   "firstName": "New", "lastName": "User",
                   "email": "new@example.com"}
        response = post_json(self.client, "/djangoapp/register", payload)
        self.assertEqual(response.json(), {
            "userName": "newuser", "status": "Authenticated"})
        self.assertTrue(User.objects.filter(username="newuser").exists())
        response = post_json(self.client, "/djangoapp/register", payload)
        self.assertEqual(response.json()["error"], "Already Registered")

    def test_register_missing_field(self):
        response = post_json(self.client, "/djangoapp/register", {
            "userName": "x", "password": "Pass12345!"})
        self.assertEqual(response.status_code, 400)


class CarTests(TestCase):
    def test_get_cars_structure(self):
        make = CarMake.objects.create(name="Toyota", description="d")
        CarModel.objects.create(
            car_make=make, name="Camry", type="SEDAN", year=2023)
        response = self.client.get("/djangoapp/get_cars")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"CarModels": [
            {"CarModel": "Camry", "CarMake": "Toyota"}]})

    def test_get_cars_seeds_when_empty(self):
        response = self.client.get("/djangoapp/get_cars")
        self.assertGreater(len(response.json()["CarModels"]), 0)


class DealerProxyTests(TestCase):
    @patch("djangoapp.views.get_request")
    def test_get_dealers_all_and_by_state(self, mock_get):
        mock_get.return_value = [{"id": 1, "state": "Texas"}]
        response = self.client.get("/djangoapp/get_dealers")
        self.assertEqual(response.json(), {
            "status": 200, "dealers": [{"id": 1, "state": "Texas"}]})
        mock_get.assert_called_with("/fetchDealers")
        self.client.get("/djangoapp/get_dealers/Texas")
        mock_get.assert_called_with("/fetchDealers/Texas")

    @patch("djangoapp.views.get_request")
    def test_dealer_service_down(self, mock_get):
        mock_get.return_value = None
        response = self.client.get("/djangoapp/get_dealers")
        self.assertEqual(response.status_code, 502)

    @patch("djangoapp.views.analyze_review_sentiments")
    @patch("djangoapp.views.get_request")
    def test_reviews_include_sentiment(self, mock_get, mock_sentiment):
        mock_get.return_value = [{"id": 1, "review": "Great"}]
        mock_sentiment.return_value = {"sentiment": "positive"}
        response = self.client.get("/djangoapp/reviews/dealer/15")
        mock_get.assert_called_with("/fetchReviews/dealer/15")
        self.assertEqual(response.json()["reviews"][0]["sentiment"],
                         "positive")

    @patch("djangoapp.views.get_request")
    def test_dealer_details(self, mock_get):
        mock_get.return_value = [{"id": 15, "full_name": "X"}]
        response = self.client.get("/djangoapp/dealer/15")
        mock_get.assert_called_with("/fetchDealer/15")
        self.assertEqual(response.json()["status"], 200)


class AddReviewTests(TestCase):
    review = {"name": "a", "dealership": 1, "review": "ok",
              "purchase": True, "purchase_date": "2023-01-01",
              "car_make": "Audi", "car_model": "A4", "car_year": 2020}

    def test_anonymous_rejected(self):
        response = post_json(self.client, "/djangoapp/add_review",
                             self.review)
        self.assertEqual(response.json()["status"], 403)

    @patch("djangoapp.views.post_review")
    def test_logged_in_can_post(self, mock_post):
        User.objects.create_user(username="u", password="Pass12345!")
        self.client.login(username="u", password="Pass12345!")
        response = post_json(self.client, "/djangoapp/add_review",
                             self.review)
        self.assertEqual(response.json(), {"status": 200})
        mock_post.assert_called_once_with(self.review)
