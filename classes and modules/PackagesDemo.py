#building a web scrapper
import requests
from selenium import webdriver

# response = requests.get("https://stackoverflow.com")
browser = webdriver.Chrome()
browser.get("https://github.com")
# signin_link = browser.find_element("Sign in")
# signin_link.click()
# browser.quit()