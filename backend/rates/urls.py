from django.urls import path
from . import views
from . import api

urlpatterns = [
    path('', views.rate_directory, name='rate_directory'),
    path('add/', views.add_rate_lane, name='add_rate_lane'),
    path('api/customer_rate_lanes/', api.get_customer_rate_lanes, name='api_rate_lanes'),
    path('api/customer_rate_lanes/<int:pk>/', api.get_customer_rate_lanes, name='api_rate_lanes_detail'),
    path('api/rates/lanes/', api.get_rates_lanes, name='api_rates_lanes'),
]