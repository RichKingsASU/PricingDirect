from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.db.models import Sum, F, Q
from pricing.models import MarketSummary, LaneException, PricingAdjustment
from rates.models import CustomerRateLane

from customers.decorators import require_organization, resolve_user_organization

@login_required
@require_organization
def control_tower(request):
    org = resolve_user_organization(request)
    
    # Filters
    selected_region = request.GET.get('region', 'all')
    selected_market_id = request.GET.get('market', 'all')
    kpi_filter = request.GET.get('kpi', 'all')
    
    # Querysets
    markets = MarketSummary.objects.filter(organization=org)
    exceptions = LaneException.objects.filter(organization=org)
    adjustments = PricingAdjustment.objects.filter(organization=org, status='Pending Approval') # or Scheduled
    
    if selected_region != 'all':
        markets = markets.filter(region=selected_region)
        exceptions = exceptions.filter(market=selected_region) # Assuming market matches region in exception for now

    # KPI Calculation from Exceptions
    # In legacy, exceptions had var_percent and loads. We use that.
    total_loads = exceptions.aggregate(total=Sum('loads'))['total'] or 0
    
    at_under_loads = exceptions.filter(var_percent__lte=0).aggregate(total=Sum('loads'))['total'] or 0
    over_0to5_loads = exceptions.filter(var_percent__gt=0, var_percent__lte=5).aggregate(total=Sum('loads'))['total'] or 0
    over_5plus_loads = exceptions.filter(var_percent__gt=5).aggregate(total=Sum('loads'))['total'] or 0

    safe_pct = lambda val: round((val / total_loads) * 100) if total_loads > 0 else 0

    kpis = {
        'atUnderTarget': at_under_loads,
        'atUnderTargetPercent': safe_pct(at_under_loads),
        'overTarget0to5': over_0to5_loads,
        'overTarget0to5Percent': safe_pct(over_0to5_loads),
        'overTarget5Plus': over_5plus_loads,
        'overTarget5PlusPercent': safe_pct(over_5plus_loads),
        'totalLoads': total_loads
    }
    
    # Apply KPI filter if clicked
    if kpi_filter == 'atUnderTarget':
        exceptions = exceptions.filter(var_percent__lte=0)
    elif kpi_filter == 'overTarget0to5':
        exceptions = exceptions.filter(var_percent__gt=0, var_percent__lte=5)
    elif kpi_filter == 'overTarget5Plus':
        exceptions = exceptions.filter(var_percent__gt=5)
        
    context = {
        'kpis': kpis,
        'markets': markets,
        'exceptions': exceptions,
        'adjustments': adjustments,
        'selected_region': selected_region,
        'selected_market_id': selected_market_id,
        'kpi_filter': kpi_filter,
    }
    
    return render(request, 'pricing/control_tower.html', context)
