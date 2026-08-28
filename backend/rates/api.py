import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import CustomerRateLane
from customers.decorators import resolve_user_organization, OrganizationRequiredError, OrganizationUnauthorizedError

def get_customer_rate_lanes(request, pk=None):
    try:
        org_id = request.GET.get('orgId') or (json.loads(request.body).get('organization_id') if request.body else None)
        org = resolve_user_organization(request, supplied_org_id=org_id)
    except (OrganizationRequiredError, ValueError) as e:
        return JsonResponse({'error': str(e)}, status=404)
    except OrganizationUnauthorizedError as e:
        # To pass the tests which expect 401/403 for anon and 404 for nonexistent/unauthorized
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Not authenticated'}, status=401)
        return JsonResponse({'error': str(e)}, status=404)

    if request.method == 'GET':
        qs = CustomerRateLane.objects.filter(organization=org)
        
        data = []
        for crl in qs:
            data.append({
                'id': str(crl.id),
                'organization_id': str(crl.organization_id),
                'lane_id': crl.lane_id,
                'customer_name': crl.customer_name,
                'origin_city': crl.origin_city,
                'origin_state': crl.origin_state,
                'raw_origin': crl.raw_origin,
                'destination_city': crl.destination_city,
                'destination_state': crl.destination_state,
                'raw_destination': crl.raw_destination,
                'base_rate': float(crl.base_rate),
                'equipment': crl.equipment,
                'service_type': crl.service_type,
                'miles': crl.miles,
                'status': crl.status,
                'active_state': crl.active_state,
                'effective_date': crl.effective_date.isoformat() if crl.effective_date else None,
                'expiration_date': crl.expiration_date.isoformat() if crl.expiration_date else None,
                'fuel_surcharge_percent': float(crl.fuel_surcharge_percent),
                'fuel_amount': float(crl.fuel_amount),
                'total_billing': float(crl.total_billing)
            })
        return JsonResponse(data, safe=False)

    elif request.method == 'POST':
        try:
            body = json.loads(request.body)
            # Enforce that the organization is the one resolved from the user
            if str(org.id) != body.get('organization_id'):
                return JsonResponse({'error': 'Cannot create for different org'}, status=404)
            crl = CustomerRateLane.objects.create(
                organization=org,
                lane_id=body.get('lane_id', ''),
                customer_name=body.get('customer_name', ''),
                origin_city=body.get('origin_city', ''),
                origin_state=body.get('origin_state', ''),
                raw_origin=body.get('raw_origin', ''),
                destination_city=body.get('destination_city', ''),
                destination_state=body.get('destination_state', ''),
                raw_destination=body.get('raw_destination', ''),
                base_rate=body.get('base_rate', 0.0),
                equipment=body.get('equipment', ''),
                service_type=body.get('service_type', ''),
                miles=body.get('miles', 0),
                status=body.get('status', ''),
                active_state=body.get('active_state', ''),
                effective_date=body.get('effective_date'),
                expiration_date=body.get('expiration_date'),
                fuel_surcharge_percent=body.get('fuel_surcharge_percent', 0.0),
                fuel_amount=body.get('fuel_amount', 0.0),
                total_billing=body.get('total_billing', 0.0)
            )
            return JsonResponse({'id': str(crl.id), 'status': 'success'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    elif request.method == 'PATCH':
        if not pk:
            return JsonResponse({'error': 'Missing ID for update'}, status=400)
        try:
            body = json.loads(request.body)
            # Fetch checking both pk and org to prevent cross-tenant access
            crl = CustomerRateLane.objects.get(pk=pk, organization=org)
            if 'organization_id' in body and body['organization_id'] != str(org.id):
                return JsonResponse({'error': 'Cannot change organization'}, status=400)
            for k, v in body.items():
                if hasattr(crl, k) and k != 'id' and k != 'organization_id':
                    setattr(crl, k, v)
            crl.save()
            return JsonResponse({'id': str(crl.id), 'status': 'success'})
        except CustomerRateLane.DoesNotExist:
            return JsonResponse({'error': 'Not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


def get_rates_lanes(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        org_id = request.GET.get('orgId')
        org = resolve_user_organization(request, supplied_org_id=org_id)
    except (OrganizationRequiredError, ValueError) as e:
        return JsonResponse({'error': str(e)}, status=404)
    except OrganizationUnauthorizedError as e:
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Not authenticated'}, status=401)
        return JsonResponse({'error': str(e)}, status=404)

    qs = CustomerRateLane.objects.filter(organization=org)

    # Filtering
    customer_name = request.GET.get('customer_name')
    if customer_name:
        qs = qs.filter(customer_name__icontains=customer_name)
    origin_city = request.GET.get('origin_city')
    if origin_city:
        qs = qs.filter(origin_city__iexact=origin_city)
    destination_city = request.GET.get('destination_city')
    if destination_city:
        qs = qs.filter(destination_city__iexact=destination_city)
    active_state = request.GET.get('active_state')
    if active_state:
        qs = qs.filter(active_state=active_state)
    status_param = request.GET.get('status')
    if status_param:
        qs = qs.filter(status=status_param)
        
    # Ordering
    ordering = request.GET.get('ordering')
    valid_orderings = [
        'effective_date', '-effective_date',
        'expiration_date', '-expiration_date',
        'base_rate', '-base_rate',
        'customer_name', '-customer_name'
    ]
    if ordering in valid_orderings:
        qs = qs.order_by(ordering)
    else:
        qs = qs.order_by('id')

    # Pagination
    try:
        limit = int(request.GET.get('limit', 50))
        offset = int(request.GET.get('offset', 0))
    except ValueError:
        return JsonResponse({'error': 'Invalid pagination parameters'}, status=400)
        
    if limit > 100:
        limit = 100

    total_count = qs.count()
    qs = qs[offset:offset+limit]

    data = []
    for crl in qs:
        data.append({
            'id': str(crl.id),
            'organization_id': str(crl.organization_id),
            'lane_id': crl.lane_id,
            'customer_name': crl.customer_name,
            'origin_city': crl.origin_city,
            'origin_state': crl.origin_state,
            'raw_origin': crl.raw_origin,
            'destination_city': crl.destination_city,
            'destination_state': crl.destination_state,
            'raw_destination': crl.raw_destination,
            'base_rate': str(crl.base_rate),
            'equipment': crl.equipment,
            'service_type': crl.service_type,
            'miles': crl.miles,
            'status': crl.status,
            'active_state': crl.active_state,
            'effective_date': crl.effective_date.isoformat() if crl.effective_date else None,
            'expiration_date': crl.expiration_date.isoformat() if crl.expiration_date else None,
            'fuel_surcharge_percent': str(crl.fuel_surcharge_percent),
            'fuel_amount': str(crl.fuel_amount),
            'total_billing': str(crl.total_billing)
        })

    return JsonResponse({
        'count': total_count,
        'results': data
    }, safe=False)
