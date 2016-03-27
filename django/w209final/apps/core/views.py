from w209final.apps.core.models import DiseaseIncidence, VaccinationEstimate, Country, Vaccine
from django.http import JsonResponse

def fetch_coverage(request, group_slug):

    """
    Returns JSON coverage data in the following format:
    {
        'years': [1984, 1985, 1986],
        'countries': [
            {
                'name':'Algeria',
                'years': [
                    {
                        'year': 1984,
                        'coverage': {
                            'DTP1': None,
                            'DTP3': 47
                        }
                    },
                ]
            }
        ]
    }
    """

    estimate_qs = VaccinationEstimate.objects.filter(vaccine__group__slug=group_slug).order_by('year')
    years = list(estimate_qs.values_list('year', flat=True).distinct())
    countries = []

    for country in Country.objects.all():

        # This is a straightforward way of getting the data, but slow--1 DB query per year per country
        #country_data = {'name': country.name, 'years':[]}
        #for year in years:
        #    year_data = {'year':year, 'coverage':{}}
        #    for estimate in estimate_qs.filter(country=country, year=year):
        #        year_data['coverage'][estimate.vaccine.code] = estimate.coverage
        #    country_data['years'].append(year_data)

        # This is faster--ony 1 DB query per country. Requires that estimates and years be ordered by year
        country_data = {'name': country.name, 'years':[{'year':year, 'coverage':{}} for year in years]}
        for estimate in estimate_qs.filter(country=country):
            country_data['years'][years.index(estimate.year)]['coverage'][estimate.vaccine.code] = estimate.coverage

        countries.append(country_data)

    return JsonResponse({'years':years, 'countries':countries})

