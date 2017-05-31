from bs4 import BeautifulSoup as bs
import json
import pyrebase
import requests as request

config = {
    "apiKey": "AIzaSyAIUfCu_oDohog-h4XaspHyvXkPy4MQ33g",
    "authDomain": "argos-f950e.firebaseapp.com",
    "databaseURL": "https://argos-f950e.firebaseio.com",
    "projectId": "argos-f950e",
    "storageBucket": "argos-f950e.appspot.com",
    "messagingSenderId": "9646149079"
}
firebase = pyrebase.initialize_app(config)

auth = firebase.auth()
user = auth.sign_in_with_email_and_password("jordan@test.com", "123456")

db = firebase.database()

url = "https://www.eia.gov/electricity/state/"

res = request.get(url)
body = res.text

parsed = bs(body, 'html.parser')

table = parsed.find("div", "main_col")

rows = table.find_all("tr")

state_data = {}

for r in rows:
    data = r.find_all("td")
    try:
        state = data[0].text
        price = data[1].text
        if (state != "U.S. Total"):
            state_data[str(state)] = str(price)
    except:
        continue

db.child("energy").set(state_data, user['idToken'])
