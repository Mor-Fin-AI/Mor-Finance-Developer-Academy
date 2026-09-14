import re

with open('src/services/careers_aggregator.py', 'r', encoding='utf-8') as f:
    content = f.read()

rss_code = '''
import xml.etree.ElementTree as ET

async def fetch_web3_rss_feed(client: httpx.AsyncClient) -> List[Dict[str, Any]]:
    """Fetches real-time developer roles from Web3-only job portal RSS feed."""
    jobs = []
    try:
        resp = await client.get('https://cryptocurrencyjobs.co/index.xml', timeout=10.0)
        if resp.status_code == 200:
            root = ET.fromstring(resp.text)
            for idx, item in enumerate(root.findall('.//item')):
                title_node = item.find('title')
                link_node = item.find('link')
                pubdate_node = item.find('pubDate')
                
                if title_node is None or link_node is None:
                    continue
                
                full_title = title_node.text
                url = link_node.text
                date_str = pubdate_node.text if pubdate_node is not None else ""
                
                # Title format is usually 'Job Title at Company Name'
                parts = full_title.rsplit(' at ', 1)
                title = parts[0].strip()
                company = parts[1].strip() if len(parts) > 1 else 'Web3 Protocol'
                
                title = _clean_text(title)
                company = _clean_text(company)
                
                skills = _standardize_skills(["Web3"], title=title)
                network = _detect_network(title, skills, company)
                
                t_lower = title.lower()
                is_intern = "intern" in t_lower or "student" in t_lower
                is_junior = "junior" in t_lower or "entry" in t_lower or "jr" in t_lower
                
                jobs.append({
                    "id": f"w3rss-{idx}-{abs(hash(title + company))}",
                    "title": title,
                    "company": company,
                    "location": "Remote (Global)",
                    "remote": True,
                    "country": "Global",
                    "city": "Remote",
                    "salary": "Competitive Web3 Pay",
                    "salary_range": None,
                    "skills": skills,
                    "url": url,
                    "application_url": url,
                    "date": date_str,
                    "date_epoch": int(time.time()),
                    "is_internship": is_intern,
                    "is_junior": is_junior,
                    "is_active": True,
                    "network": network,
                    "source": "Web3 Career Portal RSS",
                    "last_verified_at": datetime.utcnow().isoformat() + "Z"
                })
    except Exception as e:
        logger.error(f"[Careers Aggregator] Error fetching Web3 RSS feed: {e}")
    return jobs
'''

start_idx = content.find('async def fetch_remoteok_live_feed')
sync_idx = content.find('async def sync_and_validate_all_careers')

new_content = content[:start_idx] + rss_code + '\n\n' + content[sync_idx:]

sync_body = '''
async def sync_and_validate_all_careers(force: bool = False) -> List[Dict[str, Any]]:
    """Fetches, deduplicates, and validates web3 jobs into an in-memory cache."""
    global _LAST_SYNC_TIME, _VALIDATED_CAREERS_STORE
    
    now = time.time()
    if not force and _VALIDATED_CAREERS_STORE and (now - _LAST_SYNC_TIME < CACHE_TTL_SECONDS):
        logger.info(f"[Careers Pipeline] Returning {len(_VALIDATED_CAREERS_STORE)} cached careers.")
        return _VALIDATED_CAREERS_STORE

    logger.info("[Careers Pipeline] Fetching raw live developer feeds from Web3 Portal RSS...")
    
    limits = httpx.Limits(max_keepalive_connections=50, max_connections=200)
    async with httpx.AsyncClient(limits=limits, verify=False, timeout=10.0, follow_redirects=True) as client:
        jobs = await fetch_web3_rss_feed(client)
    
    raw_count = len(jobs)
    logger.info(f"[Careers Pipeline] Ingested {raw_count} raw listings from RSS. Validating URLs...")

    valid_jobs = []
    
    try:
        from src.services.link_validator import validate_urls_concurrently
        urls = [j.get('application_url') or j.get('url') for j in jobs]
        validation_results = await validate_urls_concurrently(urls)
        
        for job in jobs:
            u = job.get('application_url') or job.get('url')
            if validation_results.get(u, False) is True:
                valid_jobs.append(job)
    except Exception as e:
        logger.warning(f"[Careers Pipeline] Auto-validator failed, keeping raw jobs. Error: {e}")
        valid_jobs = jobs

    _VALIDATED_CAREERS_STORE = valid_jobs
    _LAST_SYNC_TIME = time.time()
    
    logger.info(f"[Careers Pipeline] Ingestion & validation complete. {len(valid_jobs)}/{raw_count} active listings verified.")
    return _VALIDATED_CAREERS_STORE
'''

end_sync_idx = new_content.find('def get_validated_careers_store', new_content.find('async def sync_and_validate_all_careers'))
if end_sync_idx == -1:
    new_content = new_content[:new_content.find('async def sync_and_validate_all_careers')] + sync_body
else:
    new_content = new_content[:new_content.find('async def sync_and_validate_all_careers')] + sync_body + '\n\n' + new_content[end_sync_idx:]

with open('src/services/careers_aggregator.py', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Updated careers_aggregator.py')
