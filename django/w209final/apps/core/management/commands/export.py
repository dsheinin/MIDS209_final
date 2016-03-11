from w209final.apps.core.models import *
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
import csv
import os

class Command(BaseCommand):
    help = 'Exports data to a CSV file in usable format with calculated fields'

    def handle(self, *args, **options):
        with open(os.path.join(settings.DATA_DIR,'proc_coverage.csv'), 'w') as csvfile:
            fieldnames = [
                'country_code',
                'country_name',
                'year_int',
                'year_date',
                'vaccine_code',
                'coverage',
                'change',
            ]
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

            writer.writeheader()
            for vac_estimate in VaccinationEstimate.objects.all():

                writer.writerow({
                    'country_code':vac_estimate.country.iso_code,
                    'country_name':vac_estimate.country.name,
                    'year_int':vac_estimate.year,
                    'year_date':"{0}-01-01".format(vac_estimate.year),
                    'vaccine_code':vac_estimate.vaccine.code,
                    'coverage':vac_estimate.coverage,
                    'change':vac_estimate.change(),
                })

        with open(os.path.join(settings.DATA_DIR,'proc_incidence.csv'), 'w') as csvfile:
            fieldnames = [
                'country_code',
                'country_name',
                'year_int',
                'year_date',
                'disease',
                'incidence_per_million',
                'change_per_million',
            ]
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

            writer.writeheader()
            for incidence in DiseaseIncidence.objects.all():

                writer.writerow({
                    'country_code':incidence.country.iso_code,
                    'country_name':incidence.country.name,
                    'year_int':incidence.year,
                    'year_date':"{0}-01-01".format(incidence.year),
                    'disease':incidence.disease.name,
                    'incidence_per_million':incidence.reports_per_million(),
                    'change_per_million':incidence.change_per_million(),
                })
