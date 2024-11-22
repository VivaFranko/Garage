# search/urls.py

from django.urls import path
from .views import search_applicant, generate_word_file

urlpatterns = [
    path('api/search_applicant/', search_applicant, name='search_applicant'),
    path('api/generate_word_file/', generate_word_file, name='generate_word_file'),
]
