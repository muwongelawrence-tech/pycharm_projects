import requests
import time

# URL to be pinged
url = "https://prechohub-server.onrender.com"

def ping_url():
    try:
        response = requests.get(url)
        if response.status_code == 200:
            print(f"[{time.ctime()}] Successfully pinged {url}. Status: {response.status_code}")
        else:
            print(f"[{time.ctime()}] Ping failed. Status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"[{time.ctime()}] Error pinging {url}: {e}")

if __name__ == "__main__":
    print("Starting URL pinger...")
    while True:
        ping_url()
        time.sleep(120)  # Wait for 2 minutes (120 seconds) before the next ping
