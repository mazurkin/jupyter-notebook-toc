(function() {
  // check we are in nbconvert html
  const nbconvert = document.querySelector('body.jp-Notebook'); 
  if (!nbconvert) return;
 
  // Create a slug from header text; allows alphanumerics, dashes, underscores and Unicode letters
  function slugify(text) {
    return text
      .replace(/[^a-zA-Z0-9-_ \u00A0-\uFFEF]+/g, '-')  // replace invalid characters with dashes
      .replace(/[\s-]+/g, '-')                         // collapse whitespace/double dashes
      .trim()
      .toLowerCase();
  }

  function buildFloatingNav() {
    // Collect all h1-h6 elements
    const headings = Array.from(document.body.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    if (!headings.length) return;  // Do nothing if there are no headings

    // Create style element for nav bar and active link styling
    const style = document.createElement('style');
    style.textContent = `
      #floatingNav {
        position: fixed;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255,255,255,0.75);
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 10px;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        font-family: sans-serif;
        font-size: 0.9em;
        z-index: 10000;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      }
      #floatingNav .toc-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        font-weight: bold;
        color: #333;
      }
      #floatingNav .toc-toggle {
        border: 1px solid #ccc;
        border-radius: 3px;
        background: #f7f7f7;
        color: #333;
        cursor: pointer;
        font-size: 1em;
        line-height: 1;
        padding: 2px 6px;
      }
      #floatingNav .toc-toggle:hover { background: #e8e8e8; }
      #floatingNav .toc-body {
        overflow-y: auto;
        margin-top: 8px;
      }
      #floatingNav.collapsed .toc-body { display: none; }
      #floatingNav ul { list-style: none; margin: 0; padding: 0; }
      #floatingNav li { margin: 2px 0; }
      #floatingNav a {
        color: #0077cc;
        text-decoration: none;
        display: block;
        padding: 2px 0;
      }
      #floatingNav a:hover { text-decoration: underline; }
      #floatingNav a.active {
        color: #001144;
      }
    `;
    document.head.appendChild(style);

    // Create nav container
    const nav = document.createElement('nav');
    nav.id = 'floatingNav';

    const list = document.createElement('ul');

    // Build list items for each heading
    headings.forEach(heading => {
      if (!heading.id) {
        // Generate an ID from the heading text if missing:contentReference[oaicite:2]{index=2}
        heading.id = 'h_' + slugify(heading.textContent);
      }

      const level = parseInt(heading.tagName.substring(1), 10);

      const li = document.createElement('li');
      li.style.marginLeft = ((level - 1) * 10) + 'px';

      const link = document.createElement('a');
      link.href = '#' + heading.id;
      link.textContent = heading.textContent.trim().replace(/¶/g, '');

      // Smooth scroll on click using scrollIntoView:contentReference[oaicite:3]{index=3}
      link.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById(heading.id).scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      });

      li.appendChild(link);
      list.appendChild(li);
    });

    // Header with fold/unfold toggle button
    const header = document.createElement('div');
    header.className = 'toc-header';

    const title = document.createElement('span');
    title.textContent = 'Contents';

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'toc-toggle';

    const body = document.createElement('div');
    body.className = 'toc-body';
    body.appendChild(list);

    function setCollapsed(collapsed) {
      nav.classList.toggle('collapsed', collapsed);
      toggle.textContent = collapsed ? '▸' : '▾';
      toggle.title = collapsed ? 'Unfold table of contents' : 'Fold table of contents';
      toggle.setAttribute('aria-expanded', String(!collapsed));
      try { localStorage.setItem('tocCollapsed', collapsed ? '1' : '0'); } catch (e) {}
    }

    toggle.addEventListener('click', () => setCollapsed(!nav.classList.contains('collapsed')));

    header.appendChild(title);
    header.appendChild(toggle);
    nav.appendChild(header);
    nav.appendChild(body);

    let startCollapsed = false;
    try { startCollapsed = localStorage.getItem('tocCollapsed') === '1'; } catch (e) {}
    setCollapsed(startCollapsed);

    document.body.appendChild(nav);

    // Highlight the active section using IntersectionObserver
    const navLinks = nav.querySelectorAll('a');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.classList.remove('active'));
          const active = nav.querySelector(`a[href="#${entry.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    }, { root: null, rootMargin: '0px 0px -70% 0px', threshold: 0 });

    headings.forEach(h => observer.observe(h));
  }

  // Build the navigation bar after the page is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildFloatingNav);
  } else {
    buildFloatingNav();
  }
})();