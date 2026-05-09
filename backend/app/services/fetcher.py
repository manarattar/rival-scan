import re
from datetime import datetime
from typing import Dict, List, Optional

import feedparser
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; RivalScan/1.0; +https://rivalscan.app)"
}


def fetch_updates(competitor) -> List[Dict]:
    """Try multiple sources in priority order."""
    # 1. RSS feed (most reliable + structured)
    if competitor.rss_url:
        updates = _fetch_rss(competitor.rss_url)
        if updates:
            return updates

    # 2. Auto-detect RSS from website
    detected = _detect_rss(competitor.website_url)
    if detected:
        updates = _fetch_rss(detected)
        if updates:
            return updates

    # 3. GitHub releases API
    if competitor.github_repo:
        updates = _fetch_github_releases(competitor.github_repo)
        if updates:
            return updates

    # 4. Scrape changelog page
    if competitor.changelog_url:
        return _scrape_changelog(competitor.changelog_url)

    return []


def _fetch_rss(url: str) -> List[Dict]:
    try:
        feed = feedparser.parse(url)
        if not feed.entries:
            return []
        updates = []
        for entry in feed.entries[:12]:
            published = None
            if hasattr(entry, "published_parsed") and entry.published_parsed:
                try:
                    published = datetime(*entry.published_parsed[:6])
                except Exception:
                    pass

            content = ""
            if hasattr(entry, "content") and entry.content:
                content = entry.content[0].value
            elif hasattr(entry, "summary"):
                content = entry.summary or ""

            soup = BeautifulSoup(content, "html.parser")
            content_text = soup.get_text(separator=" ", strip=True)[:2000]

            updates.append(
                {
                    "title": entry.get("title", "Update").strip(),
                    "content_raw": content_text,
                    "url": entry.get("link", ""),
                    "published_at": published,
                    "source_type": "rss",
                }
            )
        return updates
    except Exception as e:
        print(f"RSS fetch error for {url}: {e}")
        return []


def _detect_rss(website_url: str) -> Optional[str]:
    base = website_url.rstrip("/")
    common_paths = [
        "/feed",
        "/rss",
        "/feed.xml",
        "/rss.xml",
        "/blog/feed",
        "/blog/rss",
        "/blog/feed.xml",
        "/news/feed",
        "/news/rss",
        "/changelog/feed",
        "/atom.xml",
        "/feed/atom",
    ]
    for path in common_paths:
        try:
            r = requests.head(f"{base}{path}", timeout=5, allow_redirects=True)
            ct = r.headers.get("content-type", "")
            if r.status_code == 200 and any(x in ct for x in ["xml", "rss", "atom"]):
                return f"{base}{path}"
        except Exception:
            continue

    # Check homepage for <link rel="alternate"> feed
    try:
        r = requests.get(website_url, timeout=8, headers=HEADERS)
        soup = BeautifulSoup(r.text, "html.parser")
        link = soup.find("link", {"type": re.compile(r"application/(rss|atom)\+xml")})
        if link:
            href = link.get("href", "")
            return href if href.startswith("http") else f"{base}{href}"
    except Exception:
        pass

    return None


def _fetch_github_releases(repo: str) -> List[Dict]:
    try:
        url = f"https://api.github.com/repos/{repo}/releases"
        r = requests.get(
            url,
            timeout=10,
            headers={"Accept": "application/vnd.github.v3+json", **HEADERS},
        )
        if r.status_code != 200:
            return []

        updates = []
        for rel in r.json()[:12]:
            body = (rel.get("body") or "").strip()
            body_clean = re.sub(r"#{1,6}\s", "", body)[:2000]

            published = None
            if rel.get("published_at"):
                try:
                    published = datetime.fromisoformat(
                        rel["published_at"].replace("Z", "+00:00")
                    ).replace(tzinfo=None)
                except Exception:
                    pass

            updates.append(
                {
                    "title": (
                        rel.get("name") or rel.get("tag_name", "Release")
                    ).strip(),
                    "content_raw": body_clean,
                    "url": rel.get("html_url", ""),
                    "published_at": published,
                    "source_type": "github",
                }
            )
        return updates
    except Exception as e:
        print(f"GitHub fetch error for {repo}: {e}")
        return []


def _scrape_changelog(url: str) -> List[Dict]:
    try:
        r = requests.get(url, timeout=10, headers=HEADERS)
        soup = BeautifulSoup(r.text, "html.parser")
        for tag in soup(["nav", "footer", "script", "style", "header", "aside"]):
            tag.decompose()

        updates = []
        headings = soup.find_all(["h2", "h3"], limit=12)
        for h in headings:
            title = h.get_text(strip=True)
            if len(title) < 3 or len(title) > 200:
                continue
            parts = []
            for sib in h.next_siblings:
                if getattr(sib, "name", None) in ["h2", "h3"]:
                    break
                if hasattr(sib, "get_text"):
                    t = sib.get_text(separator=" ", strip=True)
                    if t:
                        parts.append(t)
            content = " ".join(parts)[:1500]
            updates.append(
                {
                    "title": title,
                    "content_raw": content,
                    "url": url,
                    "published_at": None,
                    "source_type": "scrape",
                }
            )
        return updates[:8]
    except Exception as e:
        print(f"Scrape error for {url}: {e}")
        return []
