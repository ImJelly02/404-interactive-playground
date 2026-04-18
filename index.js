(() => {
  const { Engine, Render, Runner, Bodies, Body, World, Mouse, MouseConstraint, Events, Composite } = Matter;

  const html = document.documentElement;
  const toggleBtn = document.getElementById('themeToggle');

  const SUN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  const MOON_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

  toggleBtn.innerHTML = SUN_ICON;

  toggleBtn.addEventListener('click', () => {
    const isDark = html.dataset.theme === 'dark';
    html.dataset.theme = isDark ? 'light' : 'dark';
    toggleBtn.innerHTML = isDark ? SUN_ICON : MOON_ICON;
    initMatter();
  });

  // Typewriter
  const TYPEWRITER_TEXT = "Broken link detected \u00B7 URL unresolved \u00B7 Rebooting navigation";
  const heroSub = document.getElementById('heroSub');
  let ti = 0;

  const textNode = document.createTextNode('');
  heroSub.appendChild(textNode);

  function type() {
    if (ti < TYPEWRITER_TEXT.length) {
      textNode.nodeValue += TYPEWRITER_TEXT.charAt(ti++);
      setTimeout(type, 35);
    } else {
      const cursor = document.createElement('span');
      cursor.className = 't-cursor';
      heroSub.appendChild(cursor);
    }
  }

  setTimeout(type, 900);

  // Matter.js
  const LIGHT_PALETTE = ['#1d4ed8','#302f2c','#a8c9f0','#60a5fa','#93c5fd','#1e40af','#dbeafe'];
  const DARK_PALETTE  = ['#c8f135','#efede3','#7eb8f0','#93c5fd','#60a5fa','#bfdbfe','#1d4ed8'];

  function getPalette() {
    return html.dataset.theme === 'dark' ? DARK_PALETTE : LIGHT_PALETTE;
  }

  const TAGS = [
    '404', 'LOST', 'ERR', 'NULL', 'VOID', 'NaN', 'DRIFT', 'GONE',
    'ROUTE?', '~/404', 'undefined', 'OOPS', '{ }', 'BREAK', 'NULL_PTR'
  ];

  let engine, matterRender, runner, mouseConstraint;

  function spawnBody(W, H, palette, engineRef) {
    const tag   = TAGS[Math.floor(Math.random() * TAGS.length)];
    const color = palette[Math.floor(Math.random() * palette.length)];
    const x = 60 + Math.random() * (W - 120);
    const y = -60 - Math.random() * 200;
    const type = Math.random();

    let body;
    if (type < 0.45) {
      body = Bodies.circle(x, y, 28 + Math.random() * 30, {
        restitution: 0.55, friction: 0.05, frictionAir: 0.01,
        label: tag,
        render: { fillStyle: color, strokeStyle: 'transparent', lineWidth: 0 }
      });
    } else if (type < 0.70) {
      const w = 80 + Math.random() * 60, h = 36 + Math.random() * 20;
      body = Bodies.rectangle(x, y, w, h, {
        chamfer: { radius: Math.min(w, h) / 2 - 2 },
        restitution: 0.45, friction: 0.05, frictionAir: 0.012,
        label: tag,
        render: { fillStyle: color, strokeStyle: 'transparent', lineWidth: 0 }
      });
    } else {
      body = Bodies.polygon(x, y, 6, 28 + Math.random() * 20, {
        restitution: 0.5, friction: 0.05, frictionAir: 0.01,
        label: tag,
        render: { fillStyle: color, strokeStyle: 'transparent', lineWidth: 0 }
      });
    }

    Body.setVelocity(body, { x: (Math.random() - 0.5) * 4, y: Math.random() * 3 });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.1);
    World.add(engineRef.world, body);
  }

  function isLightColor(hex) {
    if (!hex || hex[0] !== '#') return true;
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128;
  }

  function initMatter() {
    if (runner) Runner.stop(runner);
    if (matterRender) {
      Render.stop(matterRender);
      matterRender.canvas.remove();
      matterRender.textures = {};
    }

    const well = document.querySelector('.canvas-well');
    const canvas = document.getElementById('matter-canvas');
    const { width: W, height: H } = well.getBoundingClientRect();

    canvas.width  = Math.floor(W);
    canvas.height = Math.floor(H);

    engine = Engine.create({ gravity: { y: 0.9 } });

    matterRender = Render.create({
      canvas,
      engine,
      options: {
        width:      Math.floor(W),
        height:     Math.floor(H),
        wireframes: false,
        background: 'transparent'
      }
    });

    const thickness = 60;
    const walls = [
      Bodies.rectangle(W / 2, H + thickness / 2, W + 200, thickness, { isStatic: true, render: { fillStyle: 'transparent' } }),
      Bodies.rectangle(-thickness / 2, H / 2, thickness, H * 2, { isStatic: true, render: { fillStyle: 'transparent' } }),
      Bodies.rectangle(W + thickness / 2, H / 2, thickness, H * 2, { isStatic: true, render: { fillStyle: 'transparent' } })
    ];
    World.add(engine.world, walls);

    const palette = getPalette();
    for (let i = 0; i < 10; i++) {
      spawnBody(W, H, palette, engine);
    }

    const mouse = Mouse.create(canvas);
    mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } }
    });
    World.add(engine.world, mouseConstraint);
    matterRender.mouse = mouse;

    Events.on(engine, 'afterUpdate', () => {
      const mx = mouse.position.x;
      const my = mouse.position.y;
      const bodies = Composite.allBodies(engine.world).filter(b => !b.isStatic);

      for (const b of bodies) {
        const dx = b.position.x - mx;
        const dy = b.position.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80 && dist > 0) {
          const f = (1 - dist / 80) * 0.004;
          Body.applyForce(b, b.position, { x: dx * f, y: dy * f });
        }
        if (b.position.y > H + 200) {
          World.remove(engine.world, b);
        }
      }
    });

    Events.on(matterRender, 'afterRender', () => {
      const ctx = matterRender.context;
      const bodies = Composite.allBodies(engine.world).filter(b => !b.isStatic);
      for (const b of bodies) {
        if (!b.label || b.label === 'Body') continue;
        ctx.save();
        ctx.translate(b.position.x, b.position.y);
        ctx.rotate(b.angle);
        const fontSize = b.circleRadius
          ? Math.max(10, b.circleRadius * 0.38)
          : 11;
        ctx.font = `bold ${fontSize}px 'Space Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isLightColor(b.render.fillStyle) ? '#1a1a18' : '#efede3';
        ctx.fillText(b.label, 0, 0);
        ctx.restore();
      }
    });

    runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(matterRender);

    // Click on canvas to spawn at cursor
    canvas.addEventListener('click', e => {
      if (mouseConstraint && mouseConstraint.body) return;
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const pal = getPalette();
      const color = pal[Math.floor(Math.random() * pal.length)];
      const r = 24 + Math.random() * 22;
      const body = Bodies.circle(x, y - 10, r, {
        restitution: 0.6, friction: 0.04, frictionAir: 0.01,
        label: TAGS[Math.floor(Math.random() * TAGS.length)],
        render: { fillStyle: color, strokeStyle: 'transparent', lineWidth: 0 }
      });
      Body.setVelocity(body, { x: (Math.random() - 0.5) * 6, y: -Math.random() * 4 });
      World.add(engine.world, body);
    });
  }

  document.getElementById('spawnBtn').addEventListener('click', () => {
    const well = document.querySelector('.canvas-well');
    const { width: W, height: H } = well.getBoundingClientRect();
    const palette = getPalette();
    for (let i = 0; i < 3; i++) {
      setTimeout(() => spawnBody(W, H, palette, engine), i * 80);
    }
  });

  window.addEventListener('resize', () => { initMatter(); }, { passive: true });

  window.addEventListener('load', () => { initMatter(); });
})();
