from w209final.apps.core.models import DiseaseIncidence, VaccinationEstimate, Country, Vaccine
from django.http import JsonResponse

def fetch_coverage(request, group_slug):

    country_data = []
    for country in Country.objects.all():
        vaccine_data = []
        for vaccine in Vaccine.objects.filter(group__slug=group_slug):
            coverage_data = []
            for vac_estimate in VaccinationEstimate.objects.filter(country=country, vaccine=vaccine):
                coverage_data.append({
                    'year':vac_estimate.year,
                    'coverage':vac_estimate.coverage,
                })
            vaccine_data.append({
                'vaccine':vaccine.code,
                'coverage_by_year':coverage_data,
            })
        country_data.append({
            'name':country.name,
            'vaccines':vaccine_data,
        })

    return JsonResponse({'countries':country_data})