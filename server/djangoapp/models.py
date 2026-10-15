# Models for the dealership app
from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator


class CarMake(models.Model):
    """A car manufacturer, e.g. Toyota."""
    name = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.name


class CarModel(models.Model):
    """A car model that belongs to one CarMake (one make has many models)."""
    SEDAN = 'SEDAN'
    SUV = 'SUV'
    WAGON = 'WAGON'
    PICKUP = 'PICKUP'
    CAR_TYPES = [
        (SEDAN, 'Sedan'),
        (SUV, 'SUV'),
        (WAGON, 'Wagon'),
        (PICKUP, 'Pickup'),
    ]

    car_make = models.ForeignKey(
        CarMake, on_delete=models.CASCADE, related_name='models')
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=CAR_TYPES, default=SUV)
    year = models.IntegerField(
        default=2023,
        validators=[MaxValueValidator(2023), MinValueValidator(2015)])

    def __str__(self):
        return self.car_make.name + " " + self.name
