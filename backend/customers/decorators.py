from django.http import JsonResponse
from functools import wraps
from django.core.exceptions import ValidationError

class OrganizationRequiredError(Exception):
    pass

class OrganizationUnauthorizedError(Exception):
    pass

def require_organization(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        try:
            return view_func(request, *args, **kwargs)
        except (OrganizationRequiredError, OrganizationUnauthorizedError, ValueError) as e:
            return JsonResponse({'error': str(e)}, status=404)
    return _wrapped_view

def resolve_user_organization(request, supplied_org_id=None):
    """
    Authoritatively resolves a single organization for the authenticated user.
    """
    if not request.user.is_authenticated:
        raise OrganizationUnauthorizedError("Not authenticated")
        
    user_orgs = request.user.organizations.all()
    
    if supplied_org_id:
        try:
            org = user_orgs.filter(id=supplied_org_id).first()
        except ValidationError:
            raise OrganizationRequiredError("Invalid organization ID format")
        if not org:
            raise OrganizationUnauthorizedError("Unauthorized or invalid organization")
        return org
        
    count = user_orgs.count()
    if count == 1:
        return user_orgs.first()
    elif count > 1:
        raise OrganizationRequiredError("Explicit organization selection required")
    else:
        raise OrganizationUnauthorizedError("User has no authorized organizations")
