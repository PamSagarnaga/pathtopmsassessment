#!/usr/bin/env python3
"""
Scraper for Rework Job Description Templates
Extracts all 18 job descriptions and outputs structured JSON
Run locally: python3 scrape_job_descriptions.py
"""

import requests
from bs4 import BeautifulSoup
import json
import time
from typing import Dict, List

# Browser-like headers to avoid blocks
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://resources.rework.com/',
    'Connection': 'keep-alive',
}

# All 18 job descriptions to scrape
JOB_URLS = [
    {
        'url': 'https://resources.rework.com/libraries/job-description-templates/vp-operations',
        'title': 'VP of Operations',
        'seniority': 'C-Level',
        'type': 'Operations'
    },
    {
        'url': 'https://resources.rework.com/libraries/job-description-templates/director-operations',
        'title': 'Director of Operations',
        'seniority': 'Executive',
        'type': 'Operations'
    },
    {
        'url': 'https://resources.rework.com/libraries/job-description-templates/senior-operations-manager',
        'title': 'Senior Operations Manager',
        'seniority': 'Senior',
        'type': 'Operations'
    },
    {
        'url': 'https://resources.rework.com/libraries/job-description-templates/operations-manager',
        'title': 'Operations Manager',
        'seniority': 'Mid-Level',
        'type': 'Operations'
    },
    {
        'url': 'https://resources.rework.com/libraries/job-description-templates/operations-coordinator',
        'title': 'Operations Coordinator',
        'seniority': 'Entry-Level',
        'type': 'Operations'
    },
    {
        'url': 'https://resources.rework.com/libraries/job-description-templates/operations-analyst',
        'title': 'Operations Analyst',
        'seniority': 'Entry-Level',
        'type': 'Operations'
    },
    {
        'url': 'https://resources.rework.com/libraries/job-description-templates/senior-operations-analyst',
        'title': 'Senior Operations Analyst',
        'seniority': 'Senior',
        'type': 'Operations'
    },
    {
        'url': 'https://resources.rework.com/libraries/job-description-templates/senior-project-manager',
        'title': 'Senior Project Manager',
        'seniority': 'Senior',
        'type': 'Project Management'
    },
    {
        'url': 'https://resources.rework.com/libraries/job-description-templates/project-manager',
        'title': 'Project Manager',
        'seniority': 'Mid-Level',
        'type': 'Project Management'
    },
    {
        'url': 'https://resources.rework.com/libraries/job-description-templates/junior-project-manager',
        'title': 'Junior Project Manager',
        'seniority': 'Entry-Level',
        'type': 'Project Management'
    },
    {
        'url': 'https://resources.rework.com/libraries/job-description-templates/project-coordinator',
        'title': 'Project Coordinator',
        'seniority': 'Entry-Level',
        'type': 'Project Management'
    },
    {
        'url': 'https://resources.rework.com/libraries/job-description-templates/technical-project-manager',
        'title': 'Technical Project Manager',
        'seniority': 'Mid-Level',
        'type': 'Project Management'
    },
    {
        'url': 'https://resources.rework.com/libraries/job-description-templates/it-project-manager',
        'title': 'IT Project Manager',
        'seniority': 'Mid-Level',
        'type': 'Project Management'
    },
    {
        'url': 'https://resources.rework.com/libraries/job-description-templates/construction-project-manager',
        'title': 'Construction Project Manager',
        'seniority': 'Mid-Level',
        'type': 'Project Management'
    },
    {
        'url': 'https://resources.rework.com/libraries/job-description-templates/senior-program-manager',
        'title': 'Senior Program Manager',
        'seniority': 'Senior',
        'type': 'Program Management'
    },
    {
        'url': 'https://resources.rework.com/libraries/job-description-templates/program-manager',
        'title': 'Program Manager',
        'seniority': 'Mid-Level',
        'type': 'Program Management'
    },
    {
        'url': 'https://resources.rework.com/libraries/job-description-templates/technical-program-manager',
        'title': 'Technical Program Manager',
        'seniority': 'Mid-Level',
        'type': 'Program Management'
    },
    {
        'url': 'https://resources.rework.com/libraries/job-description-templates/portfolio-manager',
        'title': 'Portfolio Manager',
        'seniority': 'Senior',
        'type': 'Program Management'
    },
]

def extract_text_sections(soup: BeautifulSoup) -> Dict[str, str]:
    """Extract key sections from the job description page"""
    sections = {
        'about': '',
        'responsibilities': '',
        'qualifications': '',
        'skills': '',
        'experience': '',
        'full_text': ''
    }
    
    # Get all text content
    body_text = soup.get_text(separator='\n', strip=True)
    sections['full_text'] = body_text
    
    # Try to extract main content area
    main_content = soup.find('main') or soup.find('article') or soup.find(class_='content')
    if main_content:
        sections['full_text'] = main_content.get_text(separator='\n', strip=True)
    
    return sections

def scrape_job_description(job_info: Dict) -> Dict:
    """Scrape a single job description page"""
    url = job_info['url']
    print(f"\n📄 Scraping: {job_info['title']}")
    print(f"   URL: {url}")
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        sections = extract_text_sections(soup)
        
        job_data = {
            'title': job_info['title'],
            'seniority': job_info['seniority'],
            'type': job_info['type'],
            'url': url,
            'content': sections['full_text'],
            'status': 'success'
        }
        
        print(f"   ✓ Success ({len(sections['full_text'])} chars)")
        return job_data
        
    except requests.exceptions.RequestException as e:
        print(f"   ✗ Error: {e}")
        return {
            'title': job_info['title'],
            'seniority': job_info['seniority'],
            'type': job_info['type'],
            'url': url,
            'content': '',
            'status': f'error: {str(e)}'
        }

def main():
    """Main scraper function"""
    print("=" * 60)
    print("🚀 Rework Job Description Scraper")
    print("=" * 60)
    print(f"Total jobs to scrape: {len(JOB_URLS)}")
    print("Starting scrape... (please wait)\n")
    
    job_descriptions = []
    
    for idx, job_info in enumerate(JOB_URLS, 1):
        print(f"[{idx}/{len(JOB_URLS)}]", end=" ")
        
        scraped_job = scrape_job_description(job_info)
        job_descriptions.append(scraped_job)
        
        # Be respectful - add delay between requests
        if idx < len(JOB_URLS):
            time.sleep(2)
    
    # Count successes
    successful = sum(1 for job in job_descriptions if job['status'] == 'success')
    failed = len(job_descriptions) - successful
    
    print("\n" + "=" * 60)
    print(f"✓ Scraping complete!")
    print(f"  Successful: {successful}/{len(JOB_URLS)}")
    print(f"  Failed: {failed}/{len(JOB_URLS)}")
    print("=" * 60)
    
    # Save to JSON
    output_file = 'job_descriptions.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(job_descriptions, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Data saved to: {output_file}")
    print(f"   File size: {len(json.dumps(job_descriptions))} bytes")
    print(f"\n✨ Ready to use with your assessment tool!")

if __name__ == '__main__':
    main()
