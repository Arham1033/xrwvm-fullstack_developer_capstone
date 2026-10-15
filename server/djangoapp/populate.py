from .models import CarMake, CarModel


def initiate():
    """Seed the database with car makes and models.

    Safe to call repeatedly: existing rows are reused, not duplicated.
    """
    car_make_data = [
        {"name": "NISSAN", "description": "Great cars. Japanese technology"},
        {"name": "Mercedes", "description": "Great cars. German technology"},
        {"name": "Audi", "description": "Great cars. German technology"},
        {"name": "Kia", "description": "Great cars. Korean technology"},
        {"name": "Toyota", "description": "Great cars. Japanese technology"},
    ]

    makes = {}
    for data in car_make_data:
        make, _ = CarMake.objects.get_or_create(
            name=data['name'],
            defaults={'description': data['description']})
        makes[data['name']] = make

    car_model_data = [
        {"name": "Pathfinder", "type": "SUV", "year": 2023,
         "car_make": "NISSAN"},
        {"name": "Qashqai", "type": "SUV", "year": 2023,
         "car_make": "NISSAN"},
        {"name": "XTRAIL", "type": "SUV", "year": 2023,
         "car_make": "NISSAN"},
        {"name": "A-Class", "type": "SUV", "year": 2023,
         "car_make": "Mercedes"},
        {"name": "C-Class", "type": "SUV", "year": 2023,
         "car_make": "Mercedes"},
        {"name": "E-Class", "type": "SUV", "year": 2023,
         "car_make": "Mercedes"},
        {"name": "A4", "type": "SUV", "year": 2023, "car_make": "Audi"},
        {"name": "A5", "type": "SUV", "year": 2023, "car_make": "Audi"},
        {"name": "A6", "type": "SUV", "year": 2023, "car_make": "Audi"},
        {"name": "Sorrento", "type": "PICKUP", "year": 2023,
         "car_make": "Kia"},
        {"name": "Carnival", "type": "SUV", "year": 2023,
         "car_make": "Kia"},
        {"name": "Cerato", "type": "SEDAN", "year": 2023,
         "car_make": "Kia"},
        {"name": "Corolla", "type": "SEDAN", "year": 2023,
         "car_make": "Toyota"},
        {"name": "Camry", "type": "SEDAN", "year": 2023,
         "car_make": "Toyota"},
        {"name": "Kluger", "type": "SUV", "year": 2023,
         "car_make": "Toyota"},
    ]

    for data in car_model_data:
        CarModel.objects.get_or_create(
            name=data['name'],
            car_make=makes[data['car_make']],
            defaults={'type': data['type'], 'year': data['year']})
