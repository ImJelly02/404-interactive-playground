(() => {
  const html = document.documentElement;
  const toggleBtn = document.getElementById('themeToggle');
  const heroSub = document.getElementById('heroSub');

  const SUN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  const MOON_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

  toggleBtn.innerHTML = SUN_ICON;

  toggleBtn.addEventListener('click', () => {
    const isDark = html.dataset.theme === 'dark';
    html.dataset.theme = isDark ? 'light' : 'dark';
    toggleBtn.innerHTML = isDark ? SUN_ICON : MOON_ICON;
  });

  const TYPEWRITER_TEXT = "Broken link detected \u00B7 URL unresolved";
  const textNode = document.createTextNode('');
  const cursor = document.createElement('span');
  let ti = 0;

  cursor.className = 't-cursor';
  heroSub.appendChild(textNode);
  heroSub.appendChild(cursor);

  function type() {
    if (ti < TYPEWRITER_TEXT.length) {
      textNode.nodeValue += TYPEWRITER_TEXT.charAt(ti);
      ti += 1;
      setTimeout(type, 180);
      return;
    }

    setTimeout(erase, 900);
  }

  function erase() {
    if (ti > 0) {
      ti -= 1;
      textNode.nodeValue = TYPEWRITER_TEXT.slice(0, ti);
      setTimeout(erase, 25);
      return;
    }

    setTimeout(type, 450);
  }

  setTimeout(type, 900);
})();
