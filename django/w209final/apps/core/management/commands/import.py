from w209final.apps.core.models import *
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
import csv
import os

class Command(BaseCommand):
    help = 'Imports data from CSV files'

    def handle(self, *args, **options):
        # Vaccination Coverage
        with open(os.path.join(settings.DATA_DIR, 'coverage.csv')) as coverage_file:
            coverage_reader = csv.DictReader(coverage_file)
            for row in coverage_reader:
                if row['Region'] == 'AFR':

                    # Country
                    country, created = Country.objects.get_or_create(
                        iso_code=row['Country ISO Code'].decode('utf-8'),
                        defaults={'name':row['Country Name'].decode('utf-8')},
                    )

                    # Vaccine
                    vaccine, created = Vaccine.objects.get_or_create(
                        code=row['Vaccine'].decode('utf-8')
                    )

                    # Coverage estimate
                    for key in row.keys():
                        try:
                            year = int(key)
                            estimate = VaccinationEstimate.objects.get_or_create(
                                year = year,
                                vaccine = vaccine,
                                country = country,
                                defaults = {'coverage':int(row[key])}
                            )
                        except ValueError:
                            # Key was not an integer, so didn't represent a year, or value was null/invalid
                            pass

        # Disease Incidence
        with open(os.path.join(settings.DATA_DIR, 'incidence.csv')) as incidence_file:
            incidence_reader = csv.DictReader(incidence_file)
            for row in incidence_reader:
                if row['Region'] == 'AFR':
                    country = Country.objects.get(
                            iso_code=row['Country ISO Code'].decode('utf-8')
                    )

                    # Disease
                    disease, created = Disease.objects.get_or_create(
                        name=row['Disease'].decode('utf-8')
                    )

                    # Incidence
                    for key in row.keys():
                        try:
                            year = int(key)
                            incidence = DiseaseIncidence.objects.get_or_create(
                                    year = year,
                                    disease = disease,
                                    country = country,
                                    defaults = {'reports':int(row[key])}
                            )
                        except ValueError:
                            # Key was not an integer, so didn't represent a year, or value was null/invalid
                            pass

        # Population
        with open(os.path.join(settings.DATA_DIR, 'population.csv')) as population_file:
            population_reader = csv.DictReader(population_file)
            for row in population_reader:
                try:
                    country = Country.objects.get(
                            iso_code=row['Country Code'].decode('utf-8')
                    )

                    # Population
                    for key in row.keys():
                        try:
                            year = int(key)
                            population = PopulationMeasurement.objects.get_or_create(
                                    year = year,
                                    country = country,
                                    defaults = {'population':int(row[key])}
                            )
                        except ValueError:
                            # Key was not an integer, so didn't represent a year, or value was null/invalid
                            pass

                except Country.DoesNotExist:
                    # Only need population data for countries that have already been added
                    pass

