# NFC.cool Blog

SEO content blog for [NFC.cool](https://nfc.cool), live at [blog.nfc.cool](https://blog.nfc.cool).

Built with [SiteKit](https://github.com/FlineDev/SiteKit-Plugin) — a Swift static site generator.

## Local Development

Requires Swift 6.2 and macOS 26+.

```bash
swift run Site build    # Build the site to _Site/
swift run Site serve    # Build & serve locally
```

## Deployment

Automatically deploys to GitHub Pages via GitHub Actions on push to `main`.

Custom domain: `blog.nfc.cool` (configured via CNAME).

## Structure

```
Content/
├── Blog/       # Blog posts (Markdown)
├── Pages/      # Static pages (About, Home)
Theme/
├── css/        # Custom CSS (NFC.cool brand theme)
├── js/         # Theme JavaScript
├── fonts/      # Titillium Web + Caveat
├── images/     # Logo SVGs
```
