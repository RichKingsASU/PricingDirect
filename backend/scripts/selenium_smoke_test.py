import selenium
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def run_smoke_test():
    print("Selenium Version:", selenium.__version__)
    print("Launching Chrome in headless mode...")
    
    options = Options()
    options.add_argument("--headless=new")
    
    try:
        driver = webdriver.Chrome(options=options)
        driver.get("data:,")
        print("Chrome launched successfully.")
        print("Title:", driver.title)
        driver.quit()
        print("CHROME SELENIUM: PASS")
    except Exception as e:
        print("CHROME SELENIUM: FAIL")
        print("Error:", str(e))

if __name__ == "__main__":
    run_smoke_test()
