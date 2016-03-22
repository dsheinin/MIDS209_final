from w209final.apps.core.models import *
from django.contrib import admin

admin.site.register(Disease, admin.ModelAdmin)
admin.site.register(Vaccine, admin.ModelAdmin)
admin.site.register(VaccineGroup, admin.ModelAdmin)