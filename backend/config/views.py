from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def auth_me(request):
    return JsonResponse({'status': 'ok'})