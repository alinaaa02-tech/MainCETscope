import requests
from bs4 import BeautifulSoup

def run_scraper(url: str):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        print(f"[+] Successfully fetched {url}")
        print(f"Page Title: {soup.title.string if soup.title else 'No title found'}")
        
        # Add custom extraction logic here
        return soup

    except requests.exceptions.RequestException as e:
        print(f"[-] Error fetching data: {e}")
        return None
