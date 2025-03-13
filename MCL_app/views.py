from django.shortcuts import render, redirect
from django.views.generic import TemplateView, View
from django.contrib.auth.mixins import LoginRequiredMixin
from MCL_project.local_settings import geoserver_url

# Home Page View - Redirects to CBD-home
class HomePageView(TemplateView):
    template_name = "project_res.html"

    def get(self, request, *args, **kwargs):
        return redirect("CBD-home")

# CBD Home View - Requires login
class CBDHomeView(LoginRequiredMixin, View):
    login_url = "/login/"
    redirect_field_name = "next"

    def get(self, request, *args, **kwargs):
        return render(request, "Mcl/MCL.html", {"geoserver_url": geoserver_url})

# Leaflet Home View - Requires login (Fixed indentation)
class MCLHomeView(LoginRequiredMixin, View):
    login_url = "/login/"
    redirect_field_name = "next"

    def get(self, request, *args, **kwargs):
        return render(request, "Mcl/MCL.html", {"geoserver_url": geoserver_url})
