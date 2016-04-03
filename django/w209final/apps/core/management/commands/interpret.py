from w209final.apps.core.models import VaccinationEstimate, Country, Vaccine
from django.core.management.base import BaseCommand, CommandError
from django.db.models import Min

class Command(BaseCommand):
    help = 'Interprets and adjusts imported data'

    def handle(self, *args, **options):

        # Which missing coverage values represent 0? There are no 0s in the coverage data, only blanks. Some
        # of those blanks probably represent the time before a vaccine was introduced and others represent
        # missing data. It's impossible to know which are which, but leaving real 0s out has weird affects
        # on the graph (e.g. country averages appear higher early on because only taking into account countries
        # where the coverage is non-0). So, guess. The initial idea was to use vaccine introduction data for this
        # but it's far from complete.

        for vaccine in Vaccine.objects.all():
            estimate_qs = VaccinationEstimate.objects.filter(vaccine=vaccine)
            min_year_vac = estimate_qs.aggregate(Min('year'))['year__min']

            for country in Country.objects.all():

                # We'll only deal with estimates prior to the first one recorded, not gaps in the middle
                min_year_country = estimate_qs.filter(country=country).aggregate(Min('year'))['year__min']

                # First test: other countries have records that go back further than this country
                if min_year_country > min_year_vac:

                    # Second test: coverage records begin at less than 50%, indicating that this might be
                    # the beginning of coverage rather than simply the beginning of recorded data
                    # (50% is an arbitrary cutoff and an be adjusted, but )
                    if estimate_qs.get(country=country, year=min_year_country).coverage < 50:

                        print "Adding 0s for %s in %s from %d to %d" % (vaccine.code, country.name, min_year_vac, min_year_country - 1)

                        # Add 0s for the years back to the first recorded number in other countries
                        for year in range(min_year_vac, min_year_country):
                            VaccinationEstimate(country=country, vaccine=vaccine, year=year, coverage=0).save()