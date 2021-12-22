import time
from email.mime.text import MIMEText
from pathlib import Path
from zipfile import ZipFile
import csv
import json
from datetime import datetime
import webbrowser
from email.mime.multipart import MIMEMultipart
import smtplib
import sqlite3
import shutil

path = Path("ecommerce/__init__.py")
print(path.exists())
path.is_dir()
path.is_file()
print(path.name)
print(path.stem)
print(path.suffix)
print(path.parent)
path = path.with_name("file.txt")
print(path.absolute())

#working with files
zip = ZipFile("files.zip", "w")
#working with csv files in python
with open("data.csv", "w") as file:
    writer = csv.writer(file)
    writer.writerow(["transaction_id", "product_id", "price"])
    writer.writerow([1000, 1, 5])
    writer.writerow([1001, 2, 15])

#working with JSON files
movies = [
    {"id": 1, "title": "Terminator", "year": 1989},
    {"id": 2, "title": "Romance", "year": 1993}
]

data = json.dumps(movies)
Path("movies.json").write_text(data)

#working with sqlite
# movies = json.loads(Path('movies.json').read_text())
# with sqlite3.connect("db.sqlite3") as conn:
#     command = "INSERT INTO Movies VALUES(?, ?, ?)"
#     for movie in movies:
#         conn.execute(command, tuple(movie.values()))

#working with timestamps using the time module
print(time.time())
#lets calculate the amount of time taken to execute a given function

def send_emails():
    for i in range(100000):
        pass


start = time.time()
send_emails()
end = time.time()
duration = end - start
print(f"duration taken is { duration }.")

#working with date and time
dt = datetime(2021, 12, 21)
print(dt)
dt = datetime.now()
print(dt)

 #Automating browser opening.
print("---OPening webbrowser after deployment---")
# webbrowser.open("http://stripe.com")

# sending Emails using python
message = MIMEMultipart()
message["from"] = "Muwonge Lawrence"
message["to"] = "muwongelawrence44@gmail.com"
message["subject"] = "This is a test"
message.attach(MIMEText("Body"))
with smtplib.SMTP(host="smtp.gmail.com", port=587) as smtp:
    smtp.ehlo()
    smtp.starttls()
    smtp.login("muwongelawrence44@gmail.com", "1234")
    smtp.send_message(message)
    print("Message sent...")