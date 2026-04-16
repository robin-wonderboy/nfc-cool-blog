#!/usr/bin/env python3
"""Build static HTML blog from markdown files with YAML frontmatter."""

import os
import re
import shutil
from pathlib import Path
from datetime import datetime

import yaml
import markdown

# Paths
ROOT = Path(__file__).parent
BLOG_DIR = ROOT / "Content" / "Blog"
PAGES_DIR = ROOT / "Content" / "Pages"
OUT = ROOT / "_Site"

# Clean output
if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir(parents=True)

def parse_md(path):
    """Parse markdown file with YAML frontmatter."""
    text = path.read_text(encoding="utf-8")
    m = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)', text, re.DOTALL)
    if not m:
        return {}, text
    meta = yaml.safe_load(m.group(1)) or {}
    body = m.group(2)
    return meta, body

def md_to_html(body):
    return markdown.markdown(body, extensions=["tables", "fenced_code", "toc", "smarty"])

def slugify(title):
    s = re.sub(r'[^\w\s-]', '', title.lower())
    return re.sub(r'[\s_]+', '-', s).strip('-')

# Category display names
CATEGORY_NAMES = {
    "guides": "Guides",
    "comparisons": "Comparisons",
    "nfc-tech": "NFC Tech",
    "industry": "Industry",
    "privacy": "Privacy",
}

def category_label(cat):
    return CATEGORY_NAMES.get(cat, cat.replace("-", " ").title())

# ── CSS ──
CSS = """
:root {
  --bg: #ffffff;
  --text: #212529;
  --header-bg: #212529;
  --header-text: #ffffff;
  --accent: #FFC700;
  --link: #1170CF;
  --link-hover: #0d5baa;
  --muted: #6c757d;
  --border: #dee2e6;
  --card-bg: #f8f9fa;
  --tag-bg: #e9ecef;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 17px; scroll-behavior: smooth; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: var(--text); line-height: 1.7; background: var(--bg); }
a { color: var(--link); text-decoration: none; transition: color .15s; }
a:hover { color: var(--link-hover); text-decoration: underline; }

/* Header */
.site-header { background: var(--header-bg); padding: 0; position: sticky; top: 0; z-index: 100; }
.header-inner { max-width: 960px; margin: 0 auto; padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between; }
.site-logo { text-decoration: none; display: flex; align-items: center; gap: 0.4rem; }
.site-logo:hover { color: var(--accent); text-decoration: none; }
.site-logo span { color: var(--header-text); font-weight: 300; font-size: 2.3rem; line-height: 1; }
nav a { color: var(--header-text); margin-left: 1.5rem; font-size: 0.9rem; font-weight: 500; opacity: .85; transition: opacity .15s; }
nav a:hover { opacity: 1; text-decoration: none; }

/* Main */
.container { max-width: 960px; margin: 0 auto; padding: 2rem 1.5rem; }
.page-title { font-size: 2rem; font-weight: 800; margin-bottom: 0.25rem; letter-spacing: -0.02em; }
.page-subtitle { color: var(--muted); margin-bottom: 2rem; font-size: 1rem; }

/* Category filters */
.categories { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 2rem; }
.cat-btn { display: inline-block; padding: 0.35rem 0.9rem; border-radius: 999px; font-size: 0.82rem; font-weight: 600; background: var(--tag-bg); color: var(--text); text-decoration: none; transition: all .15s; border: 2px solid transparent; }
.cat-btn:hover, .cat-btn.active { background: var(--accent); color: var(--header-bg); text-decoration: none; border-color: var(--accent); }

/* Article cards */
.article-list { display: flex; flex-direction: column; gap: 1.25rem; }
.article-card { background: var(--card-bg); border-radius: 10px; padding: 1.5rem; border: 1px solid var(--border); transition: transform .15s, box-shadow .15s; }
.article-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.08); }
.article-card h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.4rem; }
.article-card h2 a { color: var(--text); }
.article-card h2 a:hover { color: var(--link); text-decoration: none; }
.article-meta { font-size: 0.82rem; color: var(--muted); margin-bottom: 0.5rem; }
.article-meta .cat { background: var(--accent); color: var(--header-bg); padding: 0.15rem 0.5rem; border-radius: 4px; font-weight: 600; font-size: 0.75rem; margin-right: 0.5rem; }
.article-card p { color: #495057; font-size: 0.95rem; }

/* Article page */
.article-header { margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1.5rem; }
.article-header h1 { font-size: 2.2rem; font-weight: 800; line-height: 1.2; letter-spacing: -0.02em; }
.article-header .meta { color: var(--muted); margin-top: 0.75rem; font-size: 0.9rem; }
.article-content h1 { font-size: 1.6rem; margin: 2rem 0 0.75rem; font-weight: 700; }
.article-content h2 { font-size: 1.35rem; margin: 1.75rem 0 0.75rem; font-weight: 700; }
.article-content h3 { font-size: 1.15rem; margin: 1.5rem 0 0.5rem; font-weight: 600; }
.article-content p { margin-bottom: 1rem; }
.article-content ul, .article-content ol { margin: 0.75rem 0 1rem 1.5rem; }
.article-content li { margin-bottom: 0.35rem; }
.article-content code { background: var(--tag-bg); padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.88rem; }
.article-content pre { background: var(--header-bg); color: #e9ecef; padding: 1.25rem; border-radius: 8px; overflow-x: auto; margin: 1rem 0; }
.article-content pre code { background: none; padding: 0; color: inherit; }
.article-content blockquote { border-left: 4px solid var(--accent); padding: 0.75rem 1rem; margin: 1rem 0; background: var(--card-bg); border-radius: 0 8px 8px 0; }
.article-content table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
.article-content th, .article-content td { border: 1px solid var(--border); padding: 0.6rem 0.8rem; text-align: left; }
.article-content th { background: var(--card-bg); font-weight: 600; }
.back-link { display: inline-block; margin-bottom: 1.5rem; font-weight: 500; }

/* Footer */
.site-footer { border-top: 1px solid var(--border); margin-top: 3rem; padding: 2rem 1.5rem; text-align: center; color: var(--muted); font-size: 0.85rem; }
.site-footer a { color: var(--link); }

/* Responsive */
@media (max-width: 600px) {
  html { font-size: 16px; }
  .header-inner { flex-direction: column; gap: 0.5rem; }
  nav a { margin-left: 0; margin-right: 1rem; }
  .page-title { font-size: 1.6rem; }
  .article-header h1 { font-size: 1.7rem; }
}
"""

def page_html(title, body_html, active=""):
    nav_items = [("index.html", "Articles", "articles"), ("about.html", "About", "about")]
    nav = "".join(
        f'<a href="/{n[0]}" style="{"opacity:1;border-bottom:2px solid var(--accent);padding-bottom:2px" if n[2]==active else ""}">{n[1]}</a>'
        for n in nav_items
    )
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} — NFC.cool Blog</title>
<style>{CSS}</style>
</head>
<body>
<header class="site-header">
  <div class="header-inner">
    <a href="/" class="site-logo"><img src="/assets/logo-white.png" alt="NFC.cool" style="height: 32px;"> <span>Blog</span></a>
    <nav>{nav}</nav>
  </div>
</header>
{body_html}
<footer class="site-footer">
  <div class="container">
    &copy; 2026 <a href="https://nfc.cool">NFC.cool</a> &middot; Built with ❤️ in Coimbra, Portugal
  </div>
</footer>
</body>
</html>"""


# ── Parse all articles ──
articles = []
for f in sorted(BLOG_DIR.glob("*.md")):
    meta, body = parse_md(f)
    slug = slugify(meta.get("title", f.stem))
    articles.append({
        "title": meta.get("title", f.stem),
        "date": meta.get("date", datetime(2026, 1, 1)),
        "category": meta.get("category", ""),
        "summary": meta.get("summary", ""),
        "tags": meta.get("tags", []),
        "slug": slug,
        "html": md_to_html(body),
    })

# Sort newest first
articles.sort(key=lambda a: a["date"], reverse=True)

# Collect categories
categories = sorted(set(a["category"] for a in articles if a["category"]))

# ── Generate individual article pages ──
(OUT / "posts").mkdir(exist_ok=True)
for a in articles:
    date_str = a["date"].strftime("%B %d, %Y") if isinstance(a["date"], datetime) else str(a["date"])
    body = f"""
<div class="container">
  <a href="/" class="back-link">&larr; All Articles</a>
  <div class="article-header">
    <h1>{a["title"]}</h1>
    <div class="meta">{date_str} &middot; <span style="background:#FFC700;color:#212529;padding:0.15rem 0.5rem;border-radius:4px;font-weight:600;font-size:0.8rem">{category_label(a["category"])}</span></div>
  </div>
  <div class="article-content">{a["html"]}</div>
</div>"""
    html = page_html(a["title"], body)
    (OUT / "posts" / f"{a['slug']}.html").write_text(html, encoding="utf-8")

# ── Generate index page ──
def article_card(a):
    date_str = a["date"].strftime("%B %d, %Y") if isinstance(a["date"], datetime) else str(a["date"])
    return f"""<div class="article-card" data-category="{a["category"]}">
  <h2><a href="/posts/{a["slug"]}.html">{a["title"]}</a></h2>
  <div class="article-meta"><span class="cat">{category_label(a["category"])}</span> {date_str}</div>
  <p>{a["summary"]}</p>
</div>"""

cat_buttons = '<a href="#" class="cat-btn active" data-cat="all">All</a>'
for c in categories:
    cat_buttons += f' <a href="#" class="cat-btn" data-cat="{c}">{category_label(c)}</a>'

cards = "\n".join(article_card(a) for a in articles)

index_body = f"""
<div class="container">
  <h1 class="page-title">Articles</h1>
  <p class="page-subtitle">NFC guides, digital business card comparisons, and industry insights.</p>
  <div class="categories">{cat_buttons}</div>
  <div class="article-list">{cards}</div>
</div>
<script>
document.querySelectorAll('.cat-btn').forEach(btn => {{
  btn.addEventListener('click', e => {{
    e.preventDefault();
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    document.querySelectorAll('.article-card').forEach(card => {{
      card.style.display = (cat === 'all' || card.dataset.category === cat) ? '' : 'none';
    }});
  }});
}});
</script>"""

(OUT / "index.html").write_text(page_html("Articles", index_body, "articles"), encoding="utf-8")

# ── Generate about page ──
about_meta, about_body = parse_md(PAGES_DIR / "About.md")
about_html_content = md_to_html(about_body)
about_body_wrapped = f"""
<div class="container">
  <div class="article-content">{about_html_content}</div>
</div>"""
(OUT / "about.html").write_text(page_html("About", about_body_wrapped, "about"), encoding="utf-8")

# ── Summary ──
print(f"✅ Built {len(articles)} articles + index + about → {OUT}")
for a in articles:
    print(f"   📝 {a['slug']}.html ({a['category']})")
