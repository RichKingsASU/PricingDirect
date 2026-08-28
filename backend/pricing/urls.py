from django.urls import path
from .views.control_tower import control_tower
from .views.data_management import data_management, edit_lane, edit_adjustment, edit_exception

urlpatterns = [
    path('control-tower/', control_tower, name='control_tower'),
    path('data-management/', data_management, name='data_management'),
    path('data-management/lane/<int:lane_id>/edit/', edit_lane, name='edit_lane_data'),
    path('data-management/adjustment/<int:pk>/edit/', edit_adjustment, name='edit_adjustment'),
    path('data-management/exception/<int:pk>/edit/', edit_exception, name='edit_exception'),
]
