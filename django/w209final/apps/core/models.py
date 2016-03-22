from __future__ import unicode_literals

from django.db import models

class Country(models.Model):
    iso_code = models.CharField(max_length=3)
    name = models.CharField(max_length=100)

class PopulationMeasurement(models.Model):
    year = models.IntegerField()
    country = models.ForeignKey(Country)
    population = models.IntegerField()

class VaccineGroup(models.Model):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=20)

    def __unicode__(self):
        return self.name

class Disease(models.Model):
    name = models.CharField(max_length=100)
    group = models.ForeignKey(VaccineGroup, related_name="diseases", null=True)

    def __unicode__(self):
        return self.name

class DiseaseIncidence(models.Model):
    year = models.IntegerField()
    disease = models.ForeignKey(Disease)
    country = models.ForeignKey(Country)
    reports = models.IntegerField()

    def reports_per_million(self):
        try:
            population = PopulationMeasurement.objects.get(
                    year=self.year,
                    country=self.country,
            ).population
            return self.reports * 1000000 / population
        except PopulationMeasurement.DoesNotExist:
            return None

    def change_per_million(self):
        try:
            prev_incidence= DiseaseIncidence.objects.get(
                    disease=self.disease,
                    country=self.country,
                    year=self.year - 1
            )
            return self.reports_per_million() - prev_incidence.reports_per_million()
        except DiseaseIncidence.DoesNotExist:
            return None

class Vaccine(models.Model):
    code = models.CharField(max_length=20)
    group = models.ForeignKey(VaccineGroup, related_name="vaccines", null=True)

    def __unicode__(self):
        return self.code

class VaccinationEstimate(models.Model):
    year = models.IntegerField()
    vaccine = models.ForeignKey(Vaccine, related_name="vaccination_estimates")
    country = models.ForeignKey(Country)
    coverage = models.IntegerField()

    def change(self):
        try:
            prev_estimate = VaccinationEstimate.objects.get(
                    vaccine=self.vaccine,
                    country=self.country,
                    year=self.year - 1
            )
            return self.coverage - prev_estimate.coverage
        except VaccinationEstimate.DoesNotExist:
            return None

class VaccineIntroduction(models.Model):
    year = models.IntegerField()
    vaccine = models.ForeignKey(Vaccine)
    country = models.ForeignKey(Country)
