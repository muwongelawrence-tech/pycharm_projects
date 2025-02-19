# import requests
# import time

# # URL to be pinged
# url = "https://prechohub-server.onrender.com"

# def ping_url():
#     try:
#         response = requests.get(url)
#         if response.status_code == 200:
#             print(f"[{time.ctime()}] Successfully pinged {url}. Status: {response.status_code}")
#         else:
#             print(f"[{time.ctime()}] Ping failed. Status: {response.status_code}")
#     except requests.exceptions.RequestException as e:
#         print(f"[{time.ctime()}] Error pinging {url}: {e}")

# if __name__ == "__main__":
#     print("Starting URL pinger...")
#     while True:
#         ping_url()
#         time.sleep(600)  # Wait for 10 minutes (600 seconds) before the next ping

# run script in your terminal using ::--> python3 Test_backend.py 

import requests
import time

# URLs to be pinged
urls = [
    "https://prechohub-server.onrender.com",
]

def ping_url(url):
    try:
        response = requests.get(url)
        if response.status_code == 200:
            print(f"[{time.ctime()}] Successfully pinged {url}. Status: {response.status_code}")
        else:
            print(f"[{time.ctime()}] Ping failed for {url}. Status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"[{time.ctime()}] Error pinging {url}: {e}")

if __name__ == "__main__":
    print("Starting URL pinger...")
    while True:
        for url in urls:
            ping_url(url)
        time.sleep(600)  # Wait for 10 minutes (600 seconds) before the next round




