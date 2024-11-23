# users/views.py

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView  # Додано імпорт APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .models import User
from .serializers import UserSerializer

class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class GreetingView(APIView):  # Використовуємо APIView для створення кастомної view
    permission_classes = [IsAuthenticated]  # Перевіряємо, що користувач авторизований

    def get(self, request):
        # Витягуємо роль користувача
        user = request.user
        role = user.role
        # Повертаємо привітання з роллю
        return Response({"message": f"Привіт, {role}"})
