import os

Database = {
    "default": {
        # "ENGINE": "django.db.backends.postgresql_psycopg2",
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "NAME": "wasa_db",
        "USER": "postgres",
        "PASSWORD": "arshad",
        "HOST": "10.0.4.58",
        # "HOST": "10.0.4.80",
        #  "PORT": "5432",
        "PORT": "5433",
    }
}


media_root = "D:/pulse/"

environment = "development"


efn = ".env.dev"

geoserver_url = "localhost:8080"
# geoserver_url = "10.0.4.80:8081"
