from django.shortcuts import render, redirect
from django.views import View
from django.contrib.auth import authenticate, login, logout

# Create your views here.


class LoginView(View):
    def get(self, request):
        if request.user.is_authenticated:
            return redirect("/")
        next_url = request.GET.get("next", "pulse")
        return render(request, "accounts/login.html", {"next": next_url})

    def post(self, request):
        if request.user.is_authenticated:
            return redirect("/")
        username = request.POST.get("username", None)
        password = request.POST.get("password", None)

        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect(request.POST.get("next", "pulse"))
        return render(
            request,
            "accounts/login.html",
            {"message": "Enter a valid username and password"},
        )


class LogoutView(View):
    def get(self, request):
        if request.user.is_authenticated:
            logout(request)
        return redirect("/")
