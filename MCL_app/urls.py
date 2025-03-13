from django.urls import path
from .views import HomePageView, CBDHomeView, MCLHomeView

urlpatterns = [
    path("", HomePageView.as_view(), name="Mcl"),
    path("mcl/", CBDHomeView.as_view(), name="CBD-home"),
    path("mcl-dashboard/", MCLHomeView.as_view(), name="MCL-home"),
]
