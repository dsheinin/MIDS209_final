from w209final.apps.core.models import Country, Disease, Vaccine, VaccineGroup
from django.contrib import admin

admin.site.register(Country, admin.ModelAdmin)
admin.site.register(Disease, admin.ModelAdmin)
admin.site.register(Vaccine, admin.ModelAdmin)
admin.site.register(VaccineGroup, admin.ModelAdmin)