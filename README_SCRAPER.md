# Rework Job Description Scraper - Setup & Usage

## Quick Start

### 1. Requirements
- Python 3.7 or higher
- `requests` and `beautifulsoup4` libraries

### 2. Install Dependencies
Open your terminal/command prompt and run:

```bash
pip install requests beautifulsoup4
```

### 3. Run the Scraper
Navigate to the folder where you saved `scrape_job_descriptions.py` and run:

```bash
python3 scrape_job_descriptions.py
```

Or on Windows:
```bash
python scrape_job_descriptions.py
```

### 4. What It Does
- Scrapes all 18 job descriptions from Rework
- Extracts the full content from each page
- Saves data to a file called `job_descriptions.json`
- Adds polite delays between requests (2 seconds)

### 5. Output
You'll see output like:
```
============================================================
🚀 Rework Job Description Scraper
============================================================
Total jobs to scrape: 18
Starting scrape... (please wait)

[1/18] 📄 Scraping: VP of Operations
   URL: https://resources.rework.com/...
   ✓ Success (2,345 chars)

[2/18] 📄 Scraping: Director of Operations
...
============================================================
✓ Scraping complete!
  Successful: 18/18
  Failed: 0/18
============================================================

💾 Data saved to: job_descriptions.json
```

### 6. Next Steps
Once you have `job_descriptions.json`:
1. Send it to me (or keep it for yourself)
2. We'll use it to build the assessment tool
3. The tool will reference this data to evaluate user responses

---

## Troubleshooting

### "ModuleNotFoundError: No module named 'requests'"
Run: `pip install requests beautifulsoup4`

### Script times out or can't connect
- Check your internet connection
- The script has 2-second delays between requests to be respectful
- Some networks block scraping - try a different network if issues persist

### "Connection refused" or "403 Forbidden"
- This shouldn't happen on your local machine, but if it does:
  - Your ISP/network may be blocking the domain
  - Try running on a mobile hotspot
  - Or try again later

---

## What the JSON File Looks Like

```json
[
  {
    "title": "Project Manager",
    "seniority": "Mid-Level",
    "type": "Project Management",
    "url": "https://resources.rework.com/...",
    "content": "[Full job description text here...]",
    "status": "success"
  },
  ...
]
```

Each job has all the raw text content from the page, which we'll parse further for the assessment tool.

---

**Questions?** Let me know if you run into any issues!
