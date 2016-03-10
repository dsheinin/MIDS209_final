# MIDS W209 Final Project

## How to get Django running

(paths relative to the django directory)

1. `pip install Django`, or however you install python modules. I use pip inside a virtualenv but the virtualenv isn't necessarily necessary.
2. copy w209final/settings.py.SAMPLE to w209final/settings.py. Modify the `DATA_DIR` setting at the bottom of settings.py to point to the data directory in this repo.
3. 
```
./manage.py migrate
./manage.py import
```
4. `./manage.py runserver` makes it available at localhost:8000 (but there's nothing to see there yet).

Import and export scripts are in w209final/apps/core/management/commands/ . If you run the export script (`./manage.py export`) it will generate csv data suitable for use in Tableau. Check out the script to get an idea of how Django can process and deliver data, e.g. as an AJAX call.