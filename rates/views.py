import math
from django.shortcuts import render, redirect
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import CustomerRateLane
from pricing.models import MarketSummary, LaneException, PricingAdjustment
from pricing.services.target_pricing import calculate_target_pay

from customers.decorators import resolve_user_organization, OrganizationRequiredError, OrganizationUnauthorizedError
from django.http import Http404

@login_required
def rate_directory(request):
    try:
        org = resolve_user_organization(request)
    except (OrganizationRequiredError, OrganizationUnauthorizedError):
        raise Http404("Organization required")

    lanes = CustomerRateLane.objects.filter(organization=org).order_by('-id')
    
    # Filters
    search_query = request.GET.get('search_query', '').strip().lower()
    selected_customer = request.GET.get('customer', 'all')
    status_filter = request.GET.get('status_filter', 'Active')
    
    # Target Benchmark Queries
    origin_query = request.GET.get('origin', '').strip().lower()
    dest_query = request.GET.get('dest', '').strip().lower()
    miles_query = request.GET.get('miles', '').strip()
    
    if search_query:
        lanes = lanes.filter(
            Q(origin_city__icontains=search_query) |
            Q(destination_city__icontains=search_query) |
            Q(lane_id__icontains=search_query) |
            Q(customer_name__icontains=search_query)
        )
    
    if selected_customer != 'all':
        lanes = lanes.filter(customer_name=selected_customer)
        
    lanes = lanes.filter(active_state=status_filter)
    
    # Extract unique customer names for dropdown
    all_customers = list(CustomerRateLane.objects.filter(organization=org).values_list('customer_name', flat=True).distinct())
    if not all_customers:
        all_customers = ['Amazon Logistics, Inc.', 'Walmart Distribution']
        
    # Target Benchmark Logic
    m_val = float(miles_query) if miles_query else 0
    active_target_benchmark = None
    
    if origin_query or dest_query or m_val:
        miles_number = m_val if m_val > 0 else 120
        target_pay = calculate_target_pay(miles_number, origin_query, dest_query)
        rate_per_mile = "{:.2f}".format(target_pay / miles_number) if miles_number else "0.00"
        
        # Determine source label
        from pricing.services.target_master_data import get_system_target_pay, get_city_location
        is_system = get_system_target_pay(origin_query, dest_query) is not None
        source_label = 'Forrest Master System Target Directory' if is_system else (
            f'Calculated Mileage Benchmark ($320 base + $3.80/mi)' if m_val > 0 else 'Regional Drayage Market Benchmark'
        )

        origin_location = get_city_location(origin_query)
        destination_location = get_city_location(dest_query)
        region_code = (origin_location or destination_location or {}).get('region', 'N/A')

        active_target_benchmark = {
            'originCity': origin_query.title() or 'Origin',
            'originState': (origin_location or {}).get('state', ''),
            'destinationCity': dest_query.title() or 'Destination',
            'destinationState': (destination_location or {}).get('state', ''),
            'targetCarrierPay': target_pay,
            'miles': miles_number,
            'ratePerMile': rate_per_mile,
            'sourceLabel': source_label,
            'regionCode': region_code
        }

    selected_lane_id = request.GET.get('lane_id')
    selected_lane = None
    if selected_lane_id:
        selected_lane = lanes.filter(id=selected_lane_id).first()
    elif lanes.exists():
        selected_lane = lanes.first()

    context = {
        'lanes': lanes,
        'search_query': search_query,
        'selected_customer': selected_customer,
        'status_filter': status_filter,
        'all_customers': all_customers,
        'origin_query': origin_query,
        'dest_query': dest_query,
        'miles_query': miles_query,
        'active_target_benchmark': active_target_benchmark,
        'selected_lane': selected_lane,
    }
    
    return render(request, 'rates/rate_directory.html', context)


from django.db import transaction

@login_required
@transaction.atomic
def add_rate_lane(request):
    try:
        org = resolve_user_organization(request)
    except (OrganizationRequiredError, OrganizationUnauthorizedError):
        raise Http404("Organization required")

    if request.method == 'POST':
        lane = CustomerRateLane.objects.create(
            organization=org,
            lane_id=request.POST.get('lane_id', 'AUTO-001'),
            customer_name=request.POST.get('customer_name'),
            origin_city=request.POST.get('origin_city'),
            origin_state=request.POST.get('origin_state', 'CA'),
            raw_origin=request.POST.get('origin_city'),
            destination_city=request.POST.get('destination_city'),
            destination_state=request.POST.get('destination_state', 'CA'),
            raw_destination=request.POST.get('destination_city'),
            base_rate=request.POST.get('base_rate'),
            equipment=request.POST.get('equipment', '53ft Dry Van'),
            service_type=request.POST.get('service_type', 'Standard'),
            miles=request.POST.get('miles', 100),
            effective_date='2026-07-01',
            expiration_date='2027-07-01',
            fuel_surcharge_percent=14.5,
            fuel_amount=float(request.POST.get('base_rate', 0)) * 0.145,
            total_billing=float(request.POST.get('base_rate', 0)) * 1.145
        )
        messages.success(request, f"Rate lane {lane.lane_id} added successfully.")
        return redirect('rate_directory')
    
    return render(request, 'rates/add_lane.html')
