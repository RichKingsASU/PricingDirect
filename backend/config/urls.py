from django.contrib import admin
from django.urls import path, include
from .views import auth_me

urlpatterns = [
    path('api/auth/me/', auth_me),
    path('admin/', admin.site.urls),
    path('accounts/', include('django.contrib.auth.urls')),
    path('rates/', include('rates.urls')),
    path('pricing/', include('pricing.urls')),
    path('', include('rates.urls')),  # default route
]