# users/urls.py

from django.urls import path
from .views import RegisterUserView, GreetingView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # логін
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # оновлення токену
    path('greeting/', GreetingView.as_view(), name='greeting'),  # новий маршрут для привітання
]
