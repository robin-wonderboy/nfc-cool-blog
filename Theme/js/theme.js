document.addEventListener('DOMContentLoaded', function () {
   // Syntax highlighting (if highlight.js is loaded)
   if (typeof hljs !== 'undefined') {
      hljs.highlightAll();
   }

   // Logo dark/light mode: add a second logo image for the alternate theme
   var logoContainer = document.querySelector('.sk-site-logo');
   if (logoContainer) {
      var existingImg = logoContainer.querySelector('img');
      if (existingImg) {
         // Resolve theme image paths relative to the theme assets
         var themeBase = '';
         var cssLink = document.querySelector('link[href*="theme/css/"]');
         if (cssLink) {
            themeBase = cssLink.href.replace(/css\/.*$/, 'images/');
         }
         var darkLogoSrc = themeBase + 'nfc-cool-logo-dark.svg';
         var lightLogoSrc = themeBase + 'nfc-cool-logo-light.svg';

         // Existing image becomes the light-mode logo (dark logo on light bg)
         existingImg.classList.add('sk-logo-dark');
         existingImg.src = darkLogoSrc;

         // Create light logo for dark mode
         var lightImg = document.createElement('img');
         lightImg.src = lightLogoSrc;
         lightImg.alt = existingImg.alt || 'NFC.cool';
         lightImg.classList.add('sk-logo-light');
         existingImg.parentNode.insertBefore(lightImg, existingImg.nextSibling);
      }
   }

   // Theme toggle (dark/light)
   var toggle = document.querySelector('.sk-theme-toggle');
   if (toggle) {
      toggle.addEventListener('click', function () {
         var current = document.documentElement.getAttribute('data-theme');
         var next = current === 'dark' ? 'light' : 'dark';
         document.documentElement.setAttribute('data-theme', next);
         localStorage.setItem('theme', next);
      });
   }

   // Mobile nav toggle
   var navToggle = document.querySelector('.sk-nav-toggle');
   var navList = document.querySelector('.sk-nav-list');
   if (navToggle && navList) {
      navToggle.addEventListener('click', function () {
         navList.classList.toggle('sk-nav-open');
         var expanded = navToggle.getAttribute('aria-expanded') === 'true';
         navToggle.setAttribute('aria-expanded', !expanded);
      });
   }

   // Search modal
   var searchBtn = document.querySelector('.sk-search-btn');
   if (searchBtn) {
      var searchData = null;
      var fullTextData = null;
      var fullTextLoading = false;
      var searchOverlay = null;
      var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
      var shortcutLabel = isMac ? '\u2318K' : 'Ctrl+K';

      // Add tooltip to search button
      var tooltip = document.createElement('span');
      tooltip.className = 'sk-tooltip';
      tooltip.textContent = 'Search (' + shortcutLabel + ')';
      searchBtn.appendChild(tooltip);

      // Detect base path from <base> tag or current page
      var basePath = (function() {
         var base = document.querySelector('base');
         if (base) return base.getAttribute('href').replace(/\/$/, '');
         // Fallback: detect from logo link
         var logo = document.querySelector('.sk-site-logo');
         if (logo && logo.getAttribute('href')) {
            return logo.getAttribute('href').replace(/\/$/, '');
         }
         return '';
      })();

      function tagURL(slug) {
         return basePath + '/tags/' + slug + '/';
      }

      function highlightMatch(text, query) {
         if (!query) return escapeHTML(text);
         var escaped = escapeHTML(text);
         var idx = escaped.toLowerCase().indexOf(query.toLowerCase());
         if (idx === -1) return escaped;
         return escaped.substring(0, idx) +
            '<mark class="sk-search-highlight">' + escaped.substring(idx, idx + query.length) + '</mark>' +
            escaped.substring(idx + query.length);
      }

      function escapeHTML(str) {
         var div = document.createElement('div');
         div.textContent = str;
         return div.innerHTML;
      }

      function truncateAround(text, query, maxLen) {
         if (!text) return '';
         var lower = text.toLowerCase();
         var idx = query ? lower.indexOf(query.toLowerCase()) : -1;
         if (idx > 30) {
            var start = text.lastIndexOf(' ', idx - 15);
            if (start === -1) start = idx - 20;
            text = '\u2026' + text.substring(Math.max(0, start));
         }
         if (text.length > maxLen) {
            text = text.substring(0, maxLen) + '\u2026';
         }
         return text;
      }

      function articleURL(url) {
         // If URL already starts with basePath, return as-is
         if (basePath && url.indexOf(basePath) === 0) return url;
         return basePath + url;
      }

      function renderArticle(a, query, useText) {
         var preview = '';
         if (useText) {
            preview = truncateAround(a.text || '', query, 120);
         } else {
            preview = truncateAround(a.summary || '', query, 100);
         }
         return '<a class="sk-search-post" href="' + articleURL(a.url) + '">' +
            '<span class="sk-search-post-title">' + highlightMatch(a.title, query) + '</span>' +
            (preview ? '<span class="sk-search-post-summary">' + highlightMatch(preview, query) + '</span>' : '') +
            '</a>';
      }

      // Loading state management
      var activeLoads = 0;
      function setLoading(loading) {
         activeLoads += loading ? 1 : -1;
         if (activeLoads < 0) activeLoads = 0;
         var spinner = searchOverlay && searchOverlay.querySelector('.sk-search-header-spinner');
         if (spinner) spinner.style.display = activeLoads > 0 ? 'block' : 'none';
      }

      function createModal() {
         searchOverlay = document.createElement('div');
         searchOverlay.className = 'sk-search-overlay';
         searchOverlay.innerHTML =
            '<div class="sk-search-modal">' +
               '<div class="sk-search-header">' +
                  '<button class="sk-search-close" aria-label="Close">\u00d7</button>' +
                  '<input class="sk-search-input" type="text" placeholder="Search articles, tags\u2026" autocomplete="off"/>' +
                  '<div class="sk-search-spinner sk-search-header-spinner" style="display:none"></div>' +
                  '<kbd class="sk-search-kbd">Esc</kbd>' +
               '</div>' +
               '<div class="sk-search-results"></div>' +
            '</div>';
         document.body.appendChild(searchOverlay);

         var input = searchOverlay.querySelector('.sk-search-input');
         var results = searchOverlay.querySelector('.sk-search-results');
         var closeBtn = searchOverlay.querySelector('.sk-search-close');

         closeBtn.addEventListener('click', closeSearch);
         searchOverlay.addEventListener('click', function(e) {
            if (e.target === searchOverlay) closeSearch();
         });

         var fullTextTimer = null;
         input.addEventListener('input', function() {
            var query = input.value.trim();
            if (fullTextTimer) clearTimeout(fullTextTimer);
            if (!query) {
               results.innerHTML = '';
               return;
            }
            if (searchData) {
               renderInstantResults(results, query);
            }
            fullTextTimer = setTimeout(function() {
               triggerFullTextSearch(results, query);
            }, 300);
         });

         return searchOverlay;
      }

      // Build tags map from articles (SiteKit format: tags are inline in articles)
      function buildTagsMap(articles) {
         var tags = {};
         (articles || []).forEach(function(a) {
            (a.tags || []).forEach(function(tag) {
               if (!tags[tag]) {
                  tags[tag] = tag.replace(/-/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); })
                     .replace(/\bNfc\b/g, 'NFC').replace(/\bQr\b/g, 'QR').replace(/\bGdpr\b/g, 'GDPR')
                     .replace(/\bEu\b/g, 'EU').replace(/\bIphone\b/g, 'iPhone');
               }
            });
         });
         return tags;
      }

      function renderInstantResults(container, query) {
         var html = '';
         var lower = query.toLowerCase();

         // Build tags from articles if not already present
         var tags = searchData.tags || buildTagsMap(searchData.articles);

         // Match tags
         var matchedTags = [];
         for (var slug in tags) {
            if (slug.indexOf(lower) !== -1 || tags[slug].toLowerCase().indexOf(lower) !== -1) {
               matchedTags.push({ slug: slug, name: tags[slug] });
            }
         }

         if (matchedTags.length > 0) {
            html += '<div class="sk-search-section">TAGS</div>';
            matchedTags.slice(0, 5).forEach(function(tag) {
               html += '<a class="sk-search-tag" href="' + tagURL(tag.slug) + '">' + highlightMatch(tag.name, query) + '</a>';
            });
         }

         // Match articles by title + summary
         var articles = searchData.articles || [];
         var matched = articles.filter(function(a) {
            return a.title.toLowerCase().indexOf(lower) !== -1 ||
                   (a.summary && a.summary.toLowerCase().indexOf(lower) !== -1);
         });

         if (matched.length > 0) {
            html += '<div class="sk-search-section">ARTICLES</div>';
            matched.slice(0, 10).forEach(function(a) {
               html += renderArticle(a, query, false);
            });
         }

         if (!matchedTags.length && !matched.length) {
            html += '<div class="sk-search-no-results">No results found.</div>';
         }

         container.innerHTML = html;
      }

      function triggerFullTextSearch(container, query) {
         if (!searchData) return;
         var lower = query.toLowerCase();

         var instantSlugs = new Set();
         (searchData.articles || []).forEach(function(a) {
            if (a.title.toLowerCase().indexOf(lower) !== -1 ||
                (a.summary && a.summary.toLowerCase().indexOf(lower) !== -1)) {
               instantSlugs.add(a.slug);
            }
         });

         function doFullTextSearch() {
            if (!fullTextData) return;
            var currentQuery = searchOverlay.querySelector('.sk-search-input').value.trim();
            if (currentQuery !== query) return;

            var navMap = {};
            (searchData.articles || []).forEach(function(a) { navMap[a.slug] = a; });

            var fullMatches = fullTextData.filter(function(entry) {
               if (instantSlugs.has(entry.slug)) return false;
               return entry.text && entry.text.toLowerCase().indexOf(lower) !== -1;
            }).map(function(entry) {
               var nav = navMap[entry.slug] || {};
               return {
                  slug: entry.slug,
                  url: entry.url || nav.url || '',
                  title: entry.title || nav.title || entry.slug,
                  text: entry.text
               };
            });

            setLoading(false);

            if (fullMatches.length > 0) {
               var prev = container.querySelector('.sk-search-fulltext');
               if (prev) prev.remove();

               var fulltextHTML = '<div class="sk-search-section">FULL TEXT</div>';
               fullMatches.slice(0, 10).forEach(function(a) {
                  fulltextHTML += renderArticle(a, query, true);
               });
               var wrapper = document.createElement('div');
               wrapper.className = 'sk-search-fulltext';
               wrapper.innerHTML = fulltextHTML;
               container.appendChild(wrapper);
            }
         }

         if (fullTextData) {
            setLoading(true);
            requestAnimationFrame(function() {
               doFullTextSearch();
            });
         } else if (!fullTextLoading) {
            setLoading(true);
            fullTextLoading = true;
            fetch(basePath + '/assets/search-index.json')
               .then(function(res) { return res.json(); })
               .then(function(data) {
                  fullTextData = data;
                  fullTextLoading = false;
                  doFullTextSearch();
               })
               .catch(function() {
                  fullTextLoading = false;
                  setLoading(false);
               });
         }
      }

      function ensureSearchData(callback) {
         if (searchData) { callback(); return; }
         setLoading(true);
         fetch(basePath + '/assets/nav-index.json')
            .then(function(res) { return res.json(); })
            .then(function(data) {
               searchData = data;
               setLoading(false);
               callback();
            })
            .catch(function() { setLoading(false); });
      }

      function openSearch() {
         if (!searchOverlay) createModal();
         searchOverlay.style.display = 'flex';
         requestAnimationFrame(function() {
            searchOverlay.classList.add('sk-search-visible');
         });
         var input = searchOverlay.querySelector('.sk-search-input');
         input.value = '';
         searchOverlay.querySelector('.sk-search-results').innerHTML = '';
         input.focus();
         document.body.style.overflow = 'hidden';

         ensureSearchData(function() {
            var query = input.value.trim();
            if (query) {
               renderInstantResults(searchOverlay.querySelector('.sk-search-results'), query);
            }
         });
      }

      function closeSearch() {
         if (!searchOverlay) return;
         searchOverlay.classList.remove('sk-search-visible');
         document.body.style.overflow = '';
         setTimeout(function() {
            searchOverlay.style.display = 'none';
         }, 150);
      }

      searchBtn.addEventListener('click', openSearch);

      document.addEventListener('keydown', function(e) {
         if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            openSearch();
         }
         if (e.key === 'Escape') {
            closeSearch();
         }
      });

      var searchParam = new URLSearchParams(window.location.search).get('q');
      if (searchParam) {
         ensureSearchData(function() {
            openSearch();
            var input = searchOverlay.querySelector('.sk-search-input');
            input.value = searchParam;
            input.dispatchEvent(new Event('input'));
         });
      }
   }
});

   // Language picker — reads hreflang tags for correct cross-language URLs
   var langPicker = document.querySelector('.sk-lang-picker');
   if (langPicker) {
      var langBtn = langPicker.querySelector('.sk-lang-btn');
      var langMenu = langPicker.querySelector('.sk-lang-menu');

      var hreflangMap = {};
      document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(function(link) {
         var lang = link.getAttribute('hreflang');
         if (lang && lang !== 'x-default') {
            hreflangMap[lang] = link.getAttribute('href');
         }
      });

      var labels = { en: 'English', ja: '日本語' };
      var currentPath = location.pathname;
      var currentLang = currentPath.indexOf('/ja/') === 0 ? 'ja' : 'en';

      Object.keys(hreflangMap).forEach(function(lang) {
         var a = document.createElement('a');
         a.className = 'sk-lang-option';
         a.textContent = labels[lang] || lang.toUpperCase();
         a.href = hreflangMap[lang];
         a.addEventListener('click', function() {
            try { localStorage.setItem('preferredLang', lang); } catch(e) {}
         });
         if (lang === currentLang) a.classList.add('sk-lang-active');
         langMenu.appendChild(a);
      });

      langBtn.addEventListener('click', function(e) {
         e.stopPropagation();
         langPicker.classList.toggle('sk-lang-open');
      });
      document.addEventListener('click', function() {
         langPicker.classList.remove('sk-lang-open');
      });
   }
