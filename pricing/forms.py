from django import forms
from .models import LaneException, PricingAdjustment
from rates.models import CustomerRateLane

class LaneExceptionForm(forms.ModelForm):
    class Meta:
        model = LaneException
        exclude = ['created_at', 'updated_at', 'created_by', 'updated_by', 'organization']
        widgets = {
            'adjusted_date': forms.DateInput(attrs={'type': 'date'}),
        }

class PricingAdjustmentForm(forms.ModelForm):
    class Meta:
        model = PricingAdjustment
        exclude = ['created_at', 'updated_at', 'created_by', 'updated_by', 'organization']
        widgets = {
            'effective_date': forms.DateInput(attrs={'type': 'date'}),
        }

class CustomerRateLaneForm(forms.ModelForm):
    class Meta:
        model = CustomerRateLane
        exclude = ['created_at', 'updated_at', 'created_by', 'updated_by', 'organization']
        widgets = {
            'effective_date': forms.DateInput(attrs={'type': 'date'}),
            'expiration_date': forms.DateInput(attrs={'type': 'date'}),
            'review_date': forms.DateInput(attrs={'type': 'date'}),
        }
