from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import transaction
from pricing.models import LaneException, PricingAdjustment
from rates.models import CustomerRateLane
from pricing.forms import LaneExceptionForm, PricingAdjustmentForm, CustomerRateLaneForm
from customers.decorators import require_organization, resolve_user_organization

@login_required
@require_organization
def data_management(request):
    org = resolve_user_organization(request)
    tab = request.GET.get('tab', 'lanes')
    
    # Base querysets
    lanes = CustomerRateLane.objects.filter(organization=org)
    adjustments = PricingAdjustment.objects.filter(organization=org)
    exceptions = LaneException.objects.filter(organization=org)
    
    context = {
        'tab': tab,
        'lanes': lanes,
        'adjustments': adjustments,
        'exceptions': exceptions,
    }
    return render(request, 'pricing/data_management.html', context)


@login_required
@require_organization
@transaction.atomic
def edit_lane(request, lane_id):
    org = resolve_user_organization(request)
    lane = get_object_or_404(CustomerRateLane, pk=lane_id, organization=org)
    if request.method == 'POST':
        form = CustomerRateLaneForm(request.POST, instance=lane)
        if form.is_valid():
            obj = form.save(commit=False)
            obj.organization = org
            obj.save()
            messages.success(request, 'Lane updated successfully.')
            return redirect('/pricing/data-management/?tab=lanes')
    else:
        form = CustomerRateLaneForm(instance=lane)
    
    return render(request, 'pricing/generic_form.html', {'form': form, 'title': 'Edit Lane', 'back_url': '/pricing/data-management/?tab=lanes'})

@login_required
@require_organization
def edit_adjustment(request, pk):
    org = resolve_user_organization(request)
    adjustment = get_object_or_404(PricingAdjustment, pk=pk, organization=org)
    if request.method == 'POST':
        form = PricingAdjustmentForm(request.POST, instance=adjustment)
        if form.is_valid():
            obj = form.save(commit=False)
            obj.organization = org
            obj.save()
            messages.success(request, 'Adjustment updated successfully.')
            return redirect('/pricing/data-management/?tab=adjustments')
    else:
        form = PricingAdjustmentForm(instance=adjustment)
        
    return render(request, 'pricing/generic_form.html', {'form': form, 'title': 'Edit Adjustment', 'back_url': '/pricing/data-management/?tab=adjustments'})

@login_required
@require_organization
def edit_exception(request, pk):
    org = resolve_user_organization(request)
    exception = get_object_or_404(LaneException, pk=pk, organization=org)
    if request.method == 'POST':
        form = LaneExceptionForm(request.POST, instance=exception)
        if form.is_valid():
            obj = form.save(commit=False)
            obj.organization = org
            obj.save()
            messages.success(request, 'Exception updated successfully.')
            return redirect('/pricing/data-management/?tab=exceptions')
    else:
        form = LaneExceptionForm(instance=exception)
        
    return render(request, 'pricing/generic_form.html', {'form': form, 'title': 'Edit Exception', 'back_url': '/pricing/data-management/?tab=exceptions'})

