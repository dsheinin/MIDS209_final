from w209final.apps.core.models import VaccinationEstimate, VaccineGroup, Country, DiseaseIncidence
from django.http import JsonResponse
from django.views.decorators.cache import cache_page

@cache_page(60*60*24*7)
def fetch_incidence(request):

    """
    Returns JSON reported incidence per million (for all diseases) in the following format:
    {
        'years': [1984, 1985, 1986],
        'countries': [
            {
                'name':'Algeria',
                'iso_code':'DZA',
                'years': [
                    {
                        'year': 1984,
                        'disease': {
                            'diphtheria': 116,
                            'pertussis': 710,
                            'ttetanus': 86
                        }
                    },
                ]
            }
        ],
        'average_years':  [
                {
                    'year': 1984,
                    'disease': {
                        'diphtheria': 210,
                        'pertussis': 110,
                        'ttetanus': 329
                    }
                },
            ]
    }
    """

    incidence_qs = DiseaseIncidence.objects.order_by('year')
    years = list(incidence_qs.values_list('year', flat=True).distinct())
    average_years = [{'year':year, 'disease':{}} for year in years]
    countries = []

    for country in Country.objects.all().order_by('name'):
        country_data = {
            'name': country.name,
            'iso_code': country.iso_code,
            'years':[{'year':year, 'disease':{}} for year in years]
        }

        for incidence in incidence_qs.filter(country=country):
            reports_per_million = incidence.reports_per_million()
            disease_name = incidence.disease.name
            year_index = years.index(incidence.year)

            # add incidence to data for this country
            country_data['years'][year_index]['disease'][disease_name] = reports_per_million

            # add to average data
            if disease_name not in average_years[year_index]['disease']:
                # store averages as (total, count) tuples while incrementing
                average_years[year_index]['disease'][disease_name] = (reports_per_million, 1)
            else:
                total, count = average_years[year_index]['disease'][disease_name]
                average_years[year_index]['disease'][disease_name] = (total + reports_per_million, count + 1)

        countries.append(country_data)

    # calculate averages from (total, count) tuples
    for year_avg in average_years:
        for disease_name in year_avg['disease']:
            total, count = year_avg['disease'][disease_name]
            year_avg['disease'][disease_name] = total / count

    return JsonResponse({
        'years':years,
        'countries':countries,
        'average_years':average_years
    })

@cache_page(60*60*24*7)
def fetch_coverage(request, group_slug):

    """
    Returns JSON coverage data in the following format:
    {
        'group_slug': 'measles',
        'group_name': 'Measles',
        'group_description': '...',
        'years': [1984, 1985, 1986],
        'countries': [
            {
                'name':'Algeria',
                'iso_code':'DZA',
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
        ],
        'average_years':  [
                {
                    'year': 1984,
                    'coverage': {
                        'DTP1': None,
                        'DTP3': 47
                    }
                },
            ]
    }
    """

    group = VaccineGroup.objects.get(slug=group_slug);
    estimate_qs = VaccinationEstimate.objects.filter(vaccine__group__slug=group.slug).order_by('year')
    years = list(estimate_qs.values_list('year', flat=True).distinct())
    countries = []
    average_years = [{'year':year, 'coverage':{}, 'disease':{}} for year in years]

    for country in Country.objects.all().order_by('name'):

        if estimate_qs.filter(country=country).exists():

            # This is a straightforward way of getting the data, but slow--1 DB query per year per country
            #country_data = {'name': country.name, 'years':[]}
            #for year in years:
            #    year_data = {'year':year, 'coverage':{}}
            #    for estimate in estimate_qs.filter(country=country, year=year):
            #        year_data['coverage'][estimate.vaccine.code] = estimate.coverage
            #    country_data['years'].append(year_data)

            # This is faster--ony 1 DB query per country. Requires that estimates and years be ordered by year
            country_data = {
                'name': country.name,
                'iso_code': country.iso_code,
                'years':[{'year':year, 'coverage':{}} for year in years]
            }
            for estimate in estimate_qs.filter(country=country):
                vac_code = estimate.vaccine.code
                year_index = years.index(estimate.year)
                # add estimate to date for this country
                country_data['years'][year_index]['coverage'][vac_code] = estimate.coverage

                # add to average data
                if vac_code not in average_years[year_index]['coverage']:
                    # store averages as (total, count) tuples while incrementing
                    average_years[year_index]['coverage'][vac_code] = (estimate.coverage, 1)
                else:
                    total, count = average_years[year_index]['coverage'][vac_code]
                    average_years[year_index]['coverage'][vac_code] = (total + estimate.coverage, count + 1)

            countries.append(country_data)

    # calculate averages from (total, count) tuples
    for year_avg in average_years:
        for vac_code in year_avg['coverage']:
            total, count = year_avg['coverage'][vac_code]
            year_avg['coverage'][vac_code] = total / count

    return JsonResponse({
        'group_slug': group.slug,
        'group_name': group.name,
        'group_description': group.description,
        'years':years,
        'countries':countries,
        'average_years':average_years
    })
