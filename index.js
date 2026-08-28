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
    window.dispatchEvent(new CustomEvent('themechange'));
  });

  const TYPEWRITER_TEXT = "Broken link detected.";
  const textNode = document.createTextNode('');
  const cursor = document.createElement('span');
  let ti = 0;

  // add typewriter effect
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

// Matter.js cloth grid effect
(() => {
  const breakEnable = true;
  const breakStartDelay = 100;
  const breakInterval = 80;
  const breakCountMin = 2;
  const breakCountMax = 8;
  const breakProtectBorder = true;
  const breakMaxDetached = 800;

  const grid = document.querySelector('.grid-overlay');
  if (!grid || !window.Matter) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const engine = Matter.Engine.create();
  const world = engine.world;

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let startedAt = 0;
  let lastBreakAt = 0;
  let particles = [];
  let constraints = [];
  let tornConstraints = [];

  let gridSize = getGridSize();
  const gridThickness = 4;
  const particleRadius = 3;
  const influenceRadius = 140;
  const impulseStrength = 0.018;
  const clothStiffness = 0.08;
  const clothDamping = 0.08;

  engine.gravity.y = 0.28;
  canvas.className = 'grid-canvas';
  grid.appendChild(canvas);

  function resizeGrid() {
    pixelRatio = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    gridSize = getGridSize();
    buildCloth();
  }

  function getGridColor() {
    return getComputedStyle(document.documentElement).getPropertyValue('--grid-color').trim() || 'rgba(28,69,190,0.05)';
  }

  function getGridSize() {
    if (window.innerWidth <= 430) return 64;
    if (window.innerWidth <= 768) return 72;
    return 96;
  }

  function buildCloth() {
    Matter.Composite.clear(world, false);
    particles = [];
    constraints = [];
    tornConstraints = [];

    const columns = Math.ceil(width / gridSize) + 1;
    const rows = Math.ceil(height / gridSize) + 1;
    const group = Matter.Body.nextGroup(true);

    for (let row = 0; row < rows; row += 1) {
      particles[row] = [];

      for (let column = 0; column < columns; column += 1) {
        const isBorder = row === 0 || column === 0 || column === columns - 1 || row === rows - 1;
        const body = Matter.Bodies.circle(column * gridSize, row * gridSize, particleRadius, {
          collisionFilter: { group },
          friction: 0.00001,
          frictionAir: 0.035,
          inertia: Infinity,
          isStatic: breakProtectBorder ? isBorder : row === 0,
          render: { visible: false },
        });

        particles[row][column] = body;
        Matter.Composite.add(world, body);
      }
    }

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        if (column < columns - 1) {
          addConstraint(particles[row][column], particles[row][column + 1], row, column, 'h');
        }

        if (row < rows - 1) {
          addConstraint(particles[row][column], particles[row + 1][column], row, column, 'v');
        }
      }
    }
  }

  function addConstraint(bodyA, bodyB, row, column, axis) {
    const constraint = Matter.Constraint.create({
      bodyA,
      bodyB,
      length: gridSize,
      stiffness: clothStiffness,
      damping: clothDamping,
      render: { visible: false },
    });

    constraint.gridMeta = { row, column, axis };
    constraints.push(constraint);
    Matter.Composite.add(world, constraint);
  }

  function drawCloth(color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = gridThickness;
    ctx.lineCap = 'butt';

    constraints.forEach((constraint) => {
      const from = constraint.bodyA.position;
      const to = constraint.bodyB.position;

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    });
  }

  function distanceToConstraint(x, y, constraint) {
    const a = constraint.bodyA.position;
    const b = constraint.bodyB.position;
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const apx = x - a.x;
    const apy = y - a.y;
    const lengthSquared = abx * abx + aby * aby || 1;
    const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / lengthSquared));
    const closestX = a.x + abx * t;
    const closestY = a.y + aby * t;
    const dx = x - closestX;
    const dy = y - closestY;

    return Math.sqrt(dx * dx + dy * dy);
  }

  function canTear(constraint) {
    if (!breakProtectBorder) return true;

    return !constraint.bodyA.isStatic && !constraint.bodyB.isStatic;
  }

  function disturbCloth(x, y) {
    particles.flat().forEach((body) => {
      if (body.isStatic) return;

      const dx = body.position.x - x;
      const dy = body.position.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > influenceRadius) return;

      const force = (1 - distance / influenceRadius) * impulseStrength;
      Matter.Body.applyForce(body, body.position, {
        x: (dx / (distance || 1)) * force + (Math.random() - 0.5) * force,
        y: (dy / (distance || 1)) * force - force * 0.6,
      });
    });
  }

  function tearClothAt(x, y) {
    if (tornConstraints.length >= breakMaxDetached) return;

    const nearby = constraints
      .filter(canTear)
      .map((constraint) => ({ constraint, distance: distanceToConstraint(x, y, constraint) }))
      .filter((candidate) => candidate.distance <= influenceRadius)
      .sort((a, b) => a.distance - b.distance);

    const count = Math.min(
      nearby.length,
      breakCountMin + Math.floor(Math.random() * (breakCountMax - breakCountMin + 1)),
      breakMaxDetached - tornConstraints.length
    );

    for (let i = 0; i < count; i += 1) {
      const constraint = nearby[i].constraint;
      constraints = constraints.filter((active) => active !== constraint);
      tornConstraints.push(constraint);
      Matter.Composite.remove(world, constraint);
    }
  }

  function breakGridAt(x, y) {
    if (!breakEnable) return;

    const now = performance.now();
    if (!startedAt) startedAt = now;
    disturbCloth(x, y);
    if (now - startedAt < breakStartDelay || now - lastBreakAt < breakInterval) return;

    lastBreakAt = now;
    tearClothAt(x, y);
  }

  function draw() {
    Matter.Engine.update(engine, 1000 / 60);
    ctx.clearRect(0, 0, width, height);

    const color = getGridColor();
    drawCloth(color);

    requestAnimationFrame(draw);
  }

  window.startGridBreak = () => {
    startedAt = performance.now();
    lastBreakAt = 0;
  };

  window.breakGridAt = breakGridAt;
  window.addEventListener('resize', resizeGrid);

  resizeGrid();
  draw();
})();
