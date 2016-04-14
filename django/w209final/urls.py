import w209final.apps.core.views as core_views
from django.conf.urls import url
from django.contrib import admin

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^api/fetch/coverage/(?P<group_slug>[\w-]+)/$', core_views.fetch_coverage),
    url(r'^api/fetch/incidence/$', core_views.fetch_incidence),
]
