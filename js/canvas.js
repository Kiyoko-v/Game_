/**
 * Reef Guardian - High-Fidelity Oceanic Canvas Simulator
 * Realistic underwater rendering: volumetric light caustics, organic corals,
 * anatomically authentic marine biology, and natural swimming physics.
 */

window.ReefCanvas = (function() {
  let canvas = null;
  let ctx = null;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let animationId = null;
  let lastTime = 0;
  let totalTime = 0;

  // Visual simulation entities
  const particles = [];
  const bubbles = [];
  const floatingDebris = [];
  const livingCreatures = [];
  const floatingTexts = [];
  const coralDecorations = [];
  const lightRays = [];

  // Environmental modifiers
  let isShaded = false;
  let shadeTimer = 0;
  let isUpwellingActive = false;
  let upwellingTimer = 0;

  // Interaction Callbacks
  let onCreatureClickCallback = null;
  let onDebrisClickCallback = null;
  let onCotsClickCallback = null;

  function init(canvasElement, onCreatureClick, onDebrisClick, onCotsClick) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    onCreatureClickCallback = onCreatureClick;
    onDebrisClickCallback = onDebrisClick;
    onCotsClickCallback = onCotsClick;

    handleResize();
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);

    initBackdropElements();
    lastTime = performance.now();
    startLoop();
  }

  function handleResize() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    generateReefStructure();
  }

  function initBackdropElements() {
    // Marine snow & organic suspended sediment
    particles.length = 0;
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.6,
        speedY: (Math.random() * 0.25 + 0.05) * (Math.random() > 0.4 ? 1 : -1),
        speedX: Math.random() * 0.2 - 0.1,
        alpha: Math.random() * 0.35 + 0.15
      });
    }

    // Soft volumetric sunbeams
    lightRays.length = 0;
    for (let i = 0; i < 6; i++) {
      lightRays.push({
        x: (width / 6) * (i + 0.5) + (Math.random() * 50 - 25),
        width: Math.random() * 110 + 60,
        alpha: Math.random() * 0.09 + 0.04,
        speed: Math.random() * 0.0015 + 0.0008,
        angleOffset: Math.random() * Math.PI * 2
      });
    }
  }

  function generateReefStructure() {
    coralDecorations.length = 0;
    const seabedY = height * 0.82;
    const coralCount = Math.max(14, Math.floor(width / 65));

    for (let i = 0; i < coralCount; i++) {
      const typeChoice = i % 4;
      const x = (width / coralCount) * (i + 0.5) + (Math.random() * 34 - 17);
      const baseHeight = 40 + Math.random() * 45;
      const coralType = typeChoice === 0 ? 'staghorn' :
                        typeChoice === 1 ? 'brain' :
                        typeChoice === 2 ? 'fan' : 'anemone';

      coralDecorations.push({
        x: x,
        y: seabedY + (Math.random() * 22 - 10),
        type: coralType,
        size: baseHeight,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.9 + Math.random() * 0.5,
        branchAngles: [
          -0.35 + (Math.random() * 0.1 - 0.05),
          0.38 + (Math.random() * 0.1 - 0.05),
          -0.22 + (Math.random() * 0.1 - 0.05),
          0.25 + (Math.random() * 0.1 - 0.05)
        ]
      });
    }
  }

  function spawnBubble(x, y, radius = 2.5 + Math.random() * 3.5) {
    bubbles.push({
      x: x || Math.random() * width,
      y: y || height + 10,
      radius: radius,
      speedY: Math.random() * 1.4 + 0.9,
      wobbleSpeed: Math.random() * 3 + 2,
      wobbleAmp: Math.random() * 1.5 + 0.8,
      seed: Math.random() * 10
    });
  }

  function spawnDebris(type = null) {
    const debrisTypes = ['bottle', 'bag', 'can', 'net'];
    const selected = type || debrisTypes[Math.floor(Math.random() * debrisTypes.length)];
    floatingDebris.push({
      id: 'deb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: selected,
      x: Math.random() * (width - 80) + 40,
      y: -25,
      targetY: height * (0.22 + Math.random() * 0.52),
      size: selected === 'net' ? 36 : 24,
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.015,
      driftSpeedX: (Math.random() - 0.5) * 0.35,
      driftSpeedY: Math.random() * 0.25 + 0.18,
      wobblePhase: Math.random() * Math.PI * 2
    });
  }

  function spawnCotsStarfish() {
    floatingDebris.push({
      id: 'cots_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: 'cots_starfish',
      x: Math.random() * (width - 100) + 50,
      y: height * 0.82 + (Math.random() * 18 - 8),
      size: 32,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: 0.003,
      driftSpeedX: (Math.random() - 0.5) * 0.08,
      driftSpeedY: 0
    });
  }

  function showFloatingText(text, x, y, color = '#00e5ff') {
    floatingTexts.push({
      text: text,
      x: x,
      y: y,
      color: color,
      alpha: 1.0,
      life: 0,
      maxLife: 45
    });
  }

  function syncCreatures(speciesList) {
    speciesList.forEach(sp => {
      if (!sp.unlocked || sp.population <= 0) {
        const idx = livingCreatures.findIndex(c => c.speciesId === sp.id);
        if (idx !== -1) livingCreatures.splice(idx, 1);
        return;
      }

      const targetReps = Math.min(3, Math.max(1, Math.ceil(sp.population / 30)));
      const existing = livingCreatures.filter(c => c.speciesId === sp.id);

      if (existing.length < targetReps) {
        for (let i = existing.length; i < targetReps; i++) {
          const depthMin = (sp.visual && sp.visual.depthMin) || 0.3;
          const depthMax = (sp.visual && sp.visual.depthMax) || 0.8;
          const startY = height * (depthMin + Math.random() * (depthMax - depthMin));
          const movingRight = Math.random() > 0.5;

          livingCreatures.push({
            id: sp.id + '_' + i,
            speciesId: sp.id,
            species: sp,
            x: Math.random() * width,
            y: startY,
            vx: (movingRight ? 1 : -1) * ((sp.visual && sp.visual.speed) || 1.1),
            vy: (Math.random() - 0.5) * 0.25,
            heading: movingRight ? 0 : Math.PI,
            size: (sp.visual && sp.visual.size) || 24,
            wigglePhase: Math.random() * Math.PI * 2,
            targetY: startY,
            changeCourseTimer: Math.random() * 140 + 80
          });
        }
      } else if (existing.length > targetReps) {
        const toRemove = existing.pop();
        const idx = livingCreatures.indexOf(toRemove);
        if (idx !== -1) livingCreatures.splice(idx, 1);
      }

      livingCreatures.forEach(c => {
        if (c.speciesId === sp.id) {
          c.species = sp;
        }
      });
    });
  }

  function startLoop() {
    function loop(currentTime) {
      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;
      totalTime += dt;

      update(dt);
      render();

      animationId = requestAnimationFrame(loop);
    }
    animationId = requestAnimationFrame(loop);
  }

  function update(dt) {
    if (isShaded && shadeTimer > 0) {
      shadeTimer -= dt;
      if (shadeTimer <= 0) isShaded = false;
    }
    if (isUpwellingActive && upwellingTimer > 0) {
      upwellingTimer -= dt;
      if (upwellingTimer <= 0) isUpwellingActive = false;
    }

    if (Math.random() < 0.16) {
      spawnBubble(Math.random() * width, height + 10);
    }
    if (isUpwellingActive && Math.random() < 0.5) {
      spawnBubble(width * 0.2 + (Math.random() * 50 - 25), height * 0.95, 3 + Math.random() * 3.5);
      spawnBubble(width * 0.8 + (Math.random() * 50 - 25), height * 0.95, 3 + Math.random() * 3.5);
    }

    // Bubbles
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.y -= b.speedY;
      b.x += Math.sin(totalTime * b.wobbleSpeed + b.seed) * 0.35;
      if (b.y < -10) bubbles.splice(i, 1);
    }

    // Marine snow
    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
    });

    // Debris & starfish
    for (let i = floatingDebris.length - 1; i >= 0; i--) {
      const d = floatingDebris[i];
      if (d.type !== 'cots_starfish') {
        if (d.y < d.targetY) {
          d.y += d.driftSpeedY;
        } else {
          d.y += Math.sin(totalTime * 1.2 + d.wobblePhase) * 0.18;
        }
        d.x += d.driftSpeedX;
        d.rotation += d.rotSpeed;
        if (d.x < -40) d.x = width + 20;
        if (d.x > width + 40) d.x = -20;
      } else {
        d.x += d.driftSpeedX;
        if (d.x < 30 || d.x > width - 30) d.driftSpeedX *= -1;
      }
    }

    // Living Creatures with natural motion damping
    livingCreatures.forEach(c => {
      c.wigglePhase += dt * 5.5; // Natural realistic fin beat
      c.changeCourseTimer -= dt * 60;

      if (c.changeCourseTimer <= 0) {
        c.changeCourseTimer = Math.random() * 200 + 120;
        const depthMin = (c.species.visual && c.species.visual.depthMin) || 0.3;
        const depthMax = (c.species.visual && c.species.visual.depthMax) || 0.8;
        c.targetY = height * (depthMin + Math.random() * (depthMax - depthMin));

        if (Math.random() < 0.25) {
          c.vx = -c.vx;
        }
      }

      c.y += (c.targetY - c.y) * 0.015;
      c.x += c.vx;

      if (c.x < 50 && c.vx < 0) {
        c.vx = Math.abs(c.vx);
      } else if (c.x > width - 50 && c.vx > 0) {
        c.vx = -Math.abs(c.vx);
      }

      c.heading = c.vx >= 0 ? 0 : Math.PI;
    });

    // Floating text
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.life++;
      ft.y -= 0.7;
      ft.alpha = 1 - (ft.life / ft.maxLife);
      if (ft.life >= ft.maxLife) {
        floatingTexts.splice(i, 1);
      }
    }
  }

  // ==========================================
  // MASTER RENDER
  // ==========================================
  function render() {
    if (!ctx) return;

    // 1. Realistic Deep Ocean Water Extinction Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#004b6e');    // Sunlit sub-surface cerulean
    bgGrad.addColorStop(0.25, '#003352'); // Upper photic zone
    bgGrad.addColorStop(0.65, '#011c33'); // Mesopelagic twilight blue
    bgGrad.addColorStop(1, '#010a16');    // Abyssal benthic darkness
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Volumetric God Rays & Surface Caustics
    renderSunbeams();
    renderCausticNetwork();

    // 3. Shading net overlay if active
    if (isShaded) {
      renderShadeNetOverlay();
    }

    // 4. Textured Bathymetric Seabed & Reef Bommies
    renderSeabed();

    // 5. Procedural Organic Corals & Invertebrates
    renderCorals();

    // 6. Upwelling plumes if active
    if (isUpwellingActive) {
      renderUpwellingJets();
    }

    // 7. Debris & Invasive Starfish
    renderDebrisAndStarfish();

    // 8. Anatomically Grounded Marine Creatures
    renderCreatures();

    // 9. Marine Snow & Micro Bubbles
    renderBubblesAndParticles();

    // 10. Depth Haze / Atmospheric Vignette
    renderAtmosphericVignette();

    // 11. Floating HUD Texts
    renderFloatingTexts();
  }

  // --- Volumetric Sunbeams ---
  function renderSunbeams() {
    ctx.save();
    lightRays.forEach(ray => {
      const currentAlpha = ray.alpha + Math.sin(totalTime * ray.speed * 1000 + ray.angleOffset) * 0.025;
      const rayGrad = ctx.createLinearGradient(ray.x, 0, ray.x + 35, height * 0.72);
      rayGrad.addColorStop(0, `rgba(180, 240, 255, ${Math.max(0, currentAlpha * 1.3)})`);
      rayGrad.addColorStop(0.4, `rgba(130, 220, 250, ${Math.max(0, currentAlpha * 0.5)})`);
      rayGrad.addColorStop(1, 'rgba(0, 50, 100, 0)');

      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(ray.x - ray.width * 0.25, 0);
      ctx.lineTo(ray.x + ray.width * 0.25, 0);
      ctx.lineTo(ray.x + ray.width * 0.85, height * 0.75);
      ctx.lineTo(ray.x - ray.width * 0.45, height * 0.75);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  }

  // --- Shimmering Caustic Light Web ---
  function renderCausticNetwork() {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = 'rgba(180, 245, 255, 0.08)';
    ctx.lineWidth = 2.5;

    // Organic caustic ripple bands along upper water
    const bandCount = 5;
    for (let b = 0; b < bandCount; b++) {
      const yBase = height * (0.08 + b * 0.12);
      ctx.beginPath();
      for (let x = 0; x <= width; x += 45) {
        const offset = Math.sin(x * 0.02 + totalTime * 1.4 + b) * 8 +
                       Math.cos(x * 0.035 - totalTime * 0.9) * 6;
        if (x === 0) ctx.moveTo(x, yBase + offset);
        else ctx.lineTo(x, yBase + offset);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- Realistic Bathymetric Seabed ---
  function renderSeabed() {
    ctx.save();
    const seabedY = height * 0.83;

    // Deep seabed gradient (calcareous sand & limestone sediment)
    const sandGrad = ctx.createLinearGradient(0, seabedY, 0, height);
    sandGrad.addColorStop(0, '#7d7a68');   // Upper lit sediment
    sandGrad.addColorStop(0.3, '#5c5747'); // Shadowed sand
    sandGrad.addColorStop(1, '#2c2921');   // Deep bedrock

    ctx.fillStyle = sandGrad;
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(0, seabedY);

    for (let x = 0; x <= width; x += 30) {
      const wave = Math.sin(x * 0.012) * 7 + Math.cos(x * 0.025) * 5;
      ctx.lineTo(x, seabedY + wave);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // Natural Limestone Reef Bommies (rocks encrusted with coralline algae)
    for (let x = 30; x < width; x += 130) {
      // Rock base
      ctx.fillStyle = '#3a3d40';
      ctx.beginPath();
      ctx.ellipse(x + 20, seabedY + 14, 38, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Encrusting coralline algae crusts (pale rose/lilac mineral layer)
      ctx.fillStyle = 'rgba(162, 85, 125, 0.45)';
      ctx.beginPath();
      ctx.ellipse(x + 18, seabedY + 8, 22, 9, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // Shadow crevices
      ctx.fillStyle = '#1c1e21';
      ctx.beginPath();
      ctx.ellipse(x + 24, seabedY + 16, 16, 6, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // --- Realistic Corals ---
  function renderCorals() {
    const isBleached = window.ReefSim && window.ReefSim.isBleachingActive();

    coralDecorations.forEach(coral => {
      ctx.save();
      ctx.translate(coral.x, coral.y);

      if (coral.type === 'staghorn') {
        renderRealisticStaghorn(coral, isBleached);
      } else if (coral.type === 'brain') {
        renderRealisticBrainCoral(coral, isBleached);
      } else if (coral.type === 'fan') {
        renderRealisticGorgonianFan(coral);
      } else if (coral.type === 'anemone') {
        renderRealisticSeaAnemone(coral);
      }

      ctx.restore();
    });
  }

  function renderRealisticStaghorn(c, bleached) {
    // Natural terracotta ochre coral or bone white skeletal limestone
    const trunkColor = bleached ? '#e2e8f0' : '#b85d3b';
    const shadeColor = bleached ? '#cbd5e1' : '#8c3d22';
    const tipColor = bleached ? '#ffffff' : '#e07a5f';

    ctx.lineCap = 'round';

    // Base trunk
    ctx.strokeStyle = shadeColor;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -c.size * 0.45);
    ctx.stroke();

    ctx.strokeStyle = trunkColor;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -c.size * 0.9);
    ctx.stroke();

    // Natural fractal branchlets
    const angles = c.branchAngles || [-0.35, 0.38, -0.22, 0.25];
    ctx.lineWidth = 3.5;

    // Left lower branch
    ctx.beginPath();
    ctx.moveTo(0, -c.size * 0.35);
    ctx.quadraticCurveTo(-12, -c.size * 0.5, -c.size * 0.38, -c.size * 0.75);
    ctx.stroke();

    // Left sub-branch
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-c.size * 0.22, -c.size * 0.55);
    ctx.lineTo(-c.size * 0.32, -c.size * 0.95);
    ctx.stroke();

    // Right branch
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, -c.size * 0.48);
    ctx.quadraticCurveTo(14, -c.size * 0.65, c.size * 0.35, -c.size * 0.85);
    ctx.stroke();

    // Right sub-branch
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(c.size * 0.18, -c.size * 0.68);
    ctx.lineTo(c.size * 0.3, -c.size * 1.08);
    ctx.stroke();

    // Axial polyp tips (calcifying active growth nodes)
    ctx.fillStyle = tipColor;
    [-c.size * 0.38, 0, -c.size * 0.32, c.size * 0.35, c.size * 0.3].forEach((tx, idx) => {
      const ty = idx === 0 ? -c.size * 0.75 :
                 idx === 1 ? -c.size * 0.9 :
                 idx === 2 ? -c.size * 0.95 :
                 idx === 3 ? -c.size * 0.85 : -c.size * 1.08;
      ctx.beginPath();
      ctx.arc(tx, ty, 2.2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function renderRealisticBrainCoral(c, bleached) {
    const domeColor = bleached ? '#cbd5e1' : '#8d734a';
    const shadeColor = bleached ? '#94a3b8' : '#574225';
    const grooveColor = bleached ? '#64748b' : '#3f301b';
    const rad = c.size * 0.45;

    // 3D Spherical Ambient Shading
    const domeGrad = ctx.createRadialGradient(-rad * 0.2, -rad * 0.5, rad * 0.1, 0, -rad * 0.2, rad);
    domeGrad.addColorStop(0, domeColor);
    domeGrad.addColorStop(0.7, shadeColor);
    domeGrad.addColorStop(1, '#231b10');

    ctx.fillStyle = domeGrad;
    ctx.beginPath();
    ctx.arc(0, 0, rad, Math.PI, 0);
    ctx.closePath();
    ctx.fill();

    // Labyrinthine convolutions (meandrine valleys)
    ctx.strokeStyle = grooveColor;
    ctx.lineWidth = 1.6;
    for (let r = rad * 0.25; r < rad * 0.9; r += 6) {
      ctx.beginPath();
      for (let a = Math.PI * 1.08; a <= Math.PI * 1.92; a += 0.18) {
        const wobble = Math.sin(a * 12 + r) * 2;
        const px = Math.cos(a) * (r + wobble);
        const py = Math.sin(a) * (r + wobble);
        if (a === Math.PI * 1.08) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }

  function renderRealisticGorgonianFan(c) {
    const sway = Math.sin(totalTime * c.swaySpeed + c.swayPhase) * 5;
    ctx.lineCap = 'round';

    // Flexible horny protein trunk (gorgonin)
    ctx.strokeStyle = '#6e2b34';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(sway * 0.3, -c.size * 0.4, sway * 0.7, -c.size * 0.85);
    ctx.stroke();

    // Reticulated sea fan mesh
    ctx.strokeStyle = '#b83b4b';
    ctx.lineWidth = 1.2;
    for (let i = 1; i <= 5; i++) {
      const h = -c.size * (i / 6);
      const span = 14 + i * 5;
      const curSway = sway * (i / 6);
      ctx.beginPath();
      ctx.moveTo(-span + curSway, h);
      ctx.quadraticCurveTo(curSway, h - 4, span + curSway, h);
      ctx.stroke();

      // Cross branchlets
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = '#c95d6a';
      for (let x = -span; x < span; x += 9) {
        ctx.beginPath();
        ctx.moveTo(x + curSway, h);
        ctx.lineTo(x + curSway + 2, h + 8);
        ctx.stroke();
      }
    }
  }

  function renderRealisticSeaAnemone(c) {
    const tentacleCount = 9;
    // Muscular pedal disc base
    ctx.fillStyle = '#6b3648';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Organic translucent flowing tentacles
    ctx.lineCap = 'round';
    for (let i = 0; i < tentacleCount; i++) {
      const angle = (i / tentacleCount) * Math.PI - Math.PI;
      const sway = Math.sin(totalTime * 2.2 + i * 0.8 + c.swayPhase) * 6;
      const tx = Math.cos(angle) * 18 + sway;
      const ty = Math.sin(angle) * 24;

      // Depth gradient along tentacle
      const tentGrad = ctx.createLinearGradient(0, 0, tx, ty);
      tentGrad.addColorStop(0, '#8e4157');
      tentGrad.addColorStop(0.7, '#c96480');
      tentGrad.addColorStop(1, '#e89ab0');

      ctx.strokeStyle = tentGrad;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo((i - tentacleCount / 2) * 3, 0);
      ctx.quadraticCurveTo((i - tentacleCount / 2) * 2, ty * 0.5, tx, ty);
      ctx.stroke();

      // Rounded bulbous tip
      ctx.fillStyle = '#fce4ec';
      ctx.beginPath();
      ctx.arc(tx, ty, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function renderShadeNetOverlay() {
    ctx.save();
    ctx.fillStyle = 'rgba(2, 14, 28, 0.55)';
    ctx.fillRect(0, 0, width, height * 0.22);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 15, height * 0.22);
      ctx.stroke();
    }
    ctx.restore();
  }

  function renderUpwellingJets() {
    ctx.save();
    [width * 0.2, width * 0.8].forEach(x => {
      ctx.fillStyle = '#263238';
      ctx.fillRect(x - 10, height * 0.88, 20, 36);

      const plumeGrad = ctx.createLinearGradient(x, height * 0.9, x, height * 0.45);
      plumeGrad.addColorStop(0, 'rgba(0, 229, 255, 0.3)');
      plumeGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.fillStyle = plumeGrad;
      ctx.beginPath();
      ctx.moveTo(x - 20, height * 0.9);
      ctx.lineTo(x + 20, height * 0.9);
      ctx.lineTo(x + 45, height * 0.45);
      ctx.lineTo(x - 45, height * 0.45);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  }

  // --- Debris & Invasive Starfish ---
  function renderDebrisAndStarfish() {
    floatingDebris.forEach(d => {
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rotation);

      if (d.type === 'bottle') {
        // Translucent PET plastic bottle with light refractions
        ctx.fillStyle = 'rgba(215, 240, 255, 0.45)';
        ctx.strokeStyle = 'rgba(100, 180, 220, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-5, -13, 10, 26, 2);
        ctx.fill();
        ctx.stroke();

        // Plastic cap
        ctx.fillStyle = '#0277bd';
        ctx.fillRect(-3, -16, 6, 3);
      } else if (d.type === 'bag') {
        // Billowing translucent polyethylene bag
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.strokeStyle = 'rgba(220, 230, 240, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, 13, 9, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (d.type === 'can') {
        // Corroding beverage can
        ctx.fillStyle = '#9e2a2b';
        ctx.fillRect(-6, -10, 12, 20);
        ctx.fillStyle = '#b0bec5';
        ctx.fillRect(-6, -10, 12, 3);
      } else if (d.type === 'net') {
        // Tattered monofilament ghost net
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.7)';
        ctx.lineWidth = 1.2;
        for (let i = -14; i <= 14; i += 7) {
          ctx.beginPath();
          ctx.moveTo(i, -14);
          ctx.lineTo(i + 3, 14);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-14, i);
          ctx.lineTo(14, i + 3);
          ctx.stroke();
        }
      } else if (d.type === 'cots_starfish') {
        renderRealisticCots(d.size);
      }

      ctx.restore();
    });
  }

  function renderRealisticCots(size) {
    const arms = 15;
    ctx.save();

    // Central disc
    ctx.fillStyle = '#370617';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.28, 0, Math.PI * 2);
    ctx.fill();

    // 15 Tapering radiating arms
    ctx.fillStyle = '#4a051d';
    for (let i = 0; i < arms; i++) {
      const angle = (i / arms) * Math.PI * 2;
      const ax = Math.cos(angle) * (size * 0.55);
      const ay = Math.sin(angle) * (size * 0.55);

      ctx.beginPath();
      ctx.moveTo(Math.cos(angle - 0.15) * (size * 0.25), Math.sin(angle - 0.15) * (size * 0.25));
      ctx.lineTo(ax, ay);
      ctx.lineTo(Math.cos(angle + 0.15) * (size * 0.25), Math.sin(angle + 0.15) * (size * 0.25));
      ctx.closePath();
      ctx.fill();

      // Sharp venomous spine tip
      ctx.strokeStyle = '#e63946';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(ax * 0.8, ay * 0.8);
      ctx.lineTo(ax * 1.15, ay * 1.15);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ==========================================
  // REALISTIC ANATOMICAL CREATURE RENDERING
  // ==========================================
  function renderCreatures() {
    livingCreatures.forEach(c => {
      ctx.save();
      ctx.translate(c.x, c.y);

      const isFacingLeft = c.vx < 0;
      if (isFacingLeft) {
        ctx.scale(-1, 1);
      }

      const visualType = (c.species.visual && c.species.visual.type) || 'fish';
      const sz = c.size;
      const wiggle = Math.sin(c.wigglePhase);

      switch (visualType) {
        case 'clownfish':
          renderRealisticClownfish(sz, wiggle);
          break;
        case 'parrotfish':
          renderRealisticParrotfish(sz, wiggle);
          break;
        case 'blue_tang':
          renderRealisticBlueTang(sz, wiggle);
          break;
        case 'turtle':
        case 'hawksbill':
          renderRealisticSeaTurtle(sz, wiggle, visualType === 'hawksbill');
          break;
        case 'shark':
          renderRealisticReefShark(sz, wiggle);
          break;
        case 'manta_ray':
          renderRealisticMantaRay(sz, wiggle);
          break;
        case 'whale_shark':
          renderRealisticWhaleShark(sz, wiggle);
          break;
        case 'cleaner_wrasse':
          renderRealisticCleanerWrasse(sz, wiggle);
          break;
        case 'giant_clam':
          renderRealisticGiantClam(sz);
          break;
        case 'triton_snail':
          renderRealisticTritonSnail(sz);
          break;
        case 'dugong':
          renderRealisticDugong(sz, wiggle);
          break;
        case 'seahorse':
          renderRealisticPygmySeahorse(sz, wiggle);
          break;
        default:
          renderRealisticGenericFish(sz, wiggle, c.species.visual);
          break;
      }

      ctx.restore();
    });
  }

  // 1. Ocellaris Clownfish (Amphiprion ocellaris)
  function renderRealisticClownfish(sz, wiggle) {
    // Natural warm orange body
    const bodyGrad = ctx.createLinearGradient(0, -sz * 0.4, 0, sz * 0.4);
    bodyGrad.addColorStop(0, '#d9531e');
    bodyGrad.addColorStop(0.5, '#ea580c');
    bodyGrad.addColorStop(1, '#c2410c');
    ctx.fillStyle = bodyGrad;

    ctx.beginPath();
    ctx.moveTo(sz * 0.7, 0); // Snout
    ctx.quadraticCurveTo(sz * 0.2, -sz * 0.45, -sz * 0.6, 0); // Dorsum
    ctx.quadraticCurveTo(sz * 0.2, sz * 0.42, sz * 0.7, 0); // Ventrum
    ctx.closePath();
    ctx.fill();

    // 3 Natural irregular white bars with fine black margins
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.8;
    ctx.fillStyle = '#f8fafc';

    // Head bar
    ctx.beginPath();
    ctx.ellipse(sz * 0.35, 0, sz * 0.08, sz * 0.38, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Mid-body bar (characteristic dorsal triangular bulge)
    ctx.beginPath();
    ctx.moveTo(0, -sz * 0.42);
    ctx.quadraticCurveTo(sz * 0.06, 0, 0, sz * 0.4);
    ctx.lineTo(-sz * 0.12, sz * 0.38);
    ctx.quadraticCurveTo(-sz * 0.04, 0, -sz * 0.14, -sz * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tail bar
    ctx.beginPath();
    ctx.ellipse(-sz * 0.45, 0, sz * 0.06, sz * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Anatomical spiny & soft dorsal fin
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(sz * 0.25, -sz * 0.38);
    ctx.quadraticCurveTo(-sz * 0.1, -sz * 0.6, -sz * 0.45, -sz * 0.25);
    ctx.lineTo(-sz * 0.4, -sz * 0.22);
    ctx.closePath();
    ctx.fill();

    // Rounded caudal fin with natural wiggle
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(-sz * 0.55, 0);
    ctx.quadraticCurveTo(-sz * 0.9, -sz * 0.35 + wiggle * 2, -sz * 0.95, wiggle * 2);
    ctx.quadraticCurveTo(-sz * 0.9, sz * 0.35 + wiggle * 2, -sz * 0.55, 0);
    ctx.closePath();
    ctx.fill();

    // Eye with amber iris
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(sz * 0.48, -sz * 0.1, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(sz * 0.5, -sz * 0.1, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Rainbow Parrotfish (Scarus guacamaia)
  function renderRealisticParrotfish(sz, wiggle) {
    // Deep robust reef grazer flank (turquoise-emerald with coral hues)
    const bodyGrad = ctx.createLinearGradient(0, -sz * 0.45, 0, sz * 0.45);
    bodyGrad.addColorStop(0, '#0284c7');
    bodyGrad.addColorStop(0.4, '#0d9488');
    bodyGrad.addColorStop(0.8, '#d97706');
    bodyGrad.addColorStop(1, '#059669');
    ctx.fillStyle = bodyGrad;

    ctx.beginPath();
    ctx.moveTo(sz * 0.8, 0);
    ctx.quadraticCurveTo(sz * 0.2, -sz * 0.5, -sz * 0.7, 0);
    ctx.quadraticCurveTo(sz * 0.2, sz * 0.45, sz * 0.8, 0);
    ctx.closePath();
    ctx.fill();

    // Fused dental plates (beak) for scraping coral rock
    ctx.fillStyle = '#fdba74';
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sz * 0.7, -sz * 0.1);
    ctx.lineTo(sz * 0.92, -0.5);
    ctx.lineTo(sz * 0.7, 0);
    ctx.lineTo(sz * 0.92, 0.5);
    ctx.lineTo(sz * 0.7, sz * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Continuous dorsal fin with fine fin rays
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(sz * 0.4, -sz * 0.38);
    ctx.lineTo(-sz * 0.55, -sz * 0.28);
    ctx.lineTo(-sz * 0.55, -sz * 0.15);
    ctx.closePath();
    ctx.fill();

    // Lunate / crescent caudal fin
    ctx.fillStyle = '#0d9488';
    ctx.beginPath();
    ctx.moveTo(-sz * 0.65, 0);
    ctx.lineTo(-sz * 1.1, -sz * 0.42 + wiggle * 3);
    ctx.lineTo(-sz * 0.85, 0);
    ctx.lineTo(-sz * 1.1, sz * 0.42 + wiggle * 3);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(sz * 0.55, -sz * 0.12, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(sz * 0.56, -sz * 0.12, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Blue Tang Surgeonfish (Paracanthurus hepatus)
  function renderRealisticBlueTang(sz, wiggle) {
    // Velvety royal cobalt blue compressed body
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.ellipse(0, 0, sz * 0.75, sz * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();

    // Natural black palette marking encircling a blue oval
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.ellipse(-sz * 0.12, -sz * 0.08, sz * 0.48, sz * 0.26, -0.25, 0, Math.PI * 2);
    ctx.fill();

    // Interior blue window inside palette
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.ellipse(-sz * 0.08, -sz * 0.06, sz * 0.22, sz * 0.12, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Canary yellow caudal fin triangle with dark upper/lower edges
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(-sz * 0.5, 0);
    ctx.lineTo(-sz * 1.05, -sz * 0.38 + wiggle * 2.5);
    ctx.lineTo(-sz * 0.95, 0);
    ctx.lineTo(-sz * 1.05, sz * 0.38 + wiggle * 2.5);
    ctx.closePath();
    ctx.fill();

    // Sharp caudal spine ("scalpel")
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-sz * 0.52, -1, 5, 2);

    // Eye
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(sz * 0.48, -sz * 0.1, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(sz * 0.5, -sz * 0.1, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Sea Turtles: Green Turtle & Hawksbill
  function renderRealisticSeaTurtle(sz, wiggle, isHawksbill = false) {
    // Hydrodynamic teardrop carapace (shell)
    const shellColor = isHawksbill ? '#78350f' : '#274b37';
    const scuteColor = isHawksbill ? '#b45309' : '#3d6e52';

    ctx.fillStyle = shellColor;
    ctx.beginPath();
    ctx.moveTo(sz * 0.6, 0);
    ctx.quadraticCurveTo(0, -sz * 0.48, -sz * 0.65, 0);
    ctx.quadraticCurveTo(0, sz * 0.48, sz * 0.6, 0);
    ctx.closePath();
    ctx.fill();

    // Scute growth lines
    ctx.strokeStyle = scuteColor;
    ctx.lineWidth = 1.2;
    for (let s = -sz * 0.35; s <= sz * 0.35; s += sz * 0.25) {
      ctx.beginPath();
      ctx.moveTo(s, -sz * 0.35);
      ctx.lineTo(s + sz * 0.1, 0);
      ctx.lineTo(s, sz * 0.35);
      ctx.stroke();
    }

    // Streamlined reptilian head
    ctx.fillStyle = isHawksbill ? '#92400e' : '#3f624d';
    ctx.beginPath();
    ctx.ellipse(sz * 0.78, 0, sz * 0.22, sz * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Raptor-like curved beak for Hawksbill
    if (isHawksbill) {
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(sz * 0.95, -sz * 0.05);
      ctx.lineTo(sz * 1.12, sz * 0.08);
      ctx.lineTo(sz * 0.9, sz * 0.1);
      ctx.closePath();
      ctx.fill();
    }

    // Wing-like fore-flippers with natural sculling stroke physics
    const flapAngle = Math.sin(totalTime * 1.8) * 0.35;

    // Top fore-flipper
    ctx.save();
    ctx.translate(sz * 0.32, -sz * 0.28);
    ctx.rotate(-flapAngle - 0.4);
    ctx.fillStyle = isHawksbill ? '#78350f' : '#2f523d';
    ctx.beginPath();
    ctx.ellipse(0, -sz * 0.36, sz * 0.14, sz * 0.42, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Bottom fore-flipper
    ctx.save();
    ctx.translate(sz * 0.32, sz * 0.28);
    ctx.rotate(flapAngle + 0.4);
    ctx.fillStyle = isHawksbill ? '#78350f' : '#2f523d';
    ctx.beginPath();
    ctx.ellipse(0, sz * 0.36, sz * 0.14, sz * 0.42, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Rear rudder flippers
    ctx.fillStyle = shellColor;
    ctx.beginPath();
    ctx.ellipse(-sz * 0.55, -sz * 0.25, sz * 0.12, sz * 0.18, -0.2, 0, Math.PI * 2);
    ctx.ellipse(-sz * 0.55, sz * 0.25, sz * 0.12, sz * 0.18, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Blacktip Reef Shark (Carcharhinus melanopterus)
  function renderRealisticReefShark(sz, wiggle) {
    // Sleek predatory fusiform body with natural countershading
    const sharkGrad = ctx.createLinearGradient(0, -sz * 0.25, 0, sz * 0.25);
    sharkGrad.addColorStop(0, '#475569'); // Slate brownish-grey dorsum
    sharkGrad.addColorStop(0.55, '#64748b');
    sharkGrad.addColorStop(1, '#f1f5f9'); // Crisp pale creamy belly
    ctx.fillStyle = sharkGrad;

    ctx.beginPath();
    ctx.moveTo(sz * 1.05, 0); // Pointed conical snout
    ctx.quadraticCurveTo(sz * 0.25, -sz * 0.32, -sz * 0.75, 0); // Arched back
    ctx.quadraticCurveTo(sz * 0.25, sz * 0.28, sz * 1.05, 0); // Belly line
    ctx.closePath();
    ctx.fill();

    // Falcate (sickle-shaped) First Dorsal Fin
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(sz * 0.05, -sz * 0.22);
    ctx.quadraticCurveTo(-sz * 0.08, -sz * 0.65, -sz * 0.14, -sz * 0.68);
    ctx.lineTo(-sz * 0.3, -sz * 0.18);
    ctx.closePath();
    ctx.fill();

    // Iconic jet-black apical tip on dorsal fin
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.moveTo(-sz * 0.08, -sz * 0.52);
    ctx.lineTo(-sz * 0.14, -sz * 0.68);
    ctx.lineTo(-sz * 0.22, -sz * 0.52);
    ctx.closePath();
    ctx.fill();

    // Streamlined pectoral fin with black tip
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(sz * 0.28, sz * 0.08);
    ctx.lineTo(sz * 0.05, sz * 0.52);
    ctx.lineTo(-sz * 0.08, sz * 0.12);
    ctx.closePath();
    ctx.fill();

    // Heterocercal caudal fin (upper lobe longer, with subterminal notch)
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(-sz * 0.75, 0);
    ctx.lineTo(-sz * 1.22, -sz * 0.52 + wiggle * 3.5);
    ctx.lineTo(-sz * 0.98, -sz * 0.12);
    ctx.lineTo(-sz * 1.1, sz * 0.28 + wiggle * 2.5);
    ctx.closePath();
    ctx.fill();

    // Gill slits array
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.9;
    for (let g = 0; g < 5; g++) {
      ctx.beginPath();
      ctx.moveTo(sz * 0.4 + g * 2.8, -sz * 0.08);
      ctx.lineTo(sz * 0.4 + g * 2.8, sz * 0.08);
      ctx.stroke();
    }

    // Predatory eye
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(sz * 0.82, -sz * 0.06, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. Reef Manta Ray (Mobula alfredi)
  function renderRealisticMantaRay(sz, wiggle) {
    const wingSpan = sz * 0.85;
    const flap = Math.sin(totalTime * 2.0) * 6;

    // Batoid diamond disc (charcoal slate dorsum)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(sz * 0.7, 0); // Head
    ctx.quadraticCurveTo(sz * 0.1, -wingSpan + flap, -sz * 0.4, -wingSpan * 0.25); // Left wing
    ctx.lineTo(-sz * 0.7, 0); // Tail root
    ctx.lineTo(-sz * 0.4, wingSpan * 0.25);
    ctx.quadraticCurveTo(sz * 0.1, wingSpan - flap, sz * 0.7, 0); // Right wing
    ctx.closePath();
    ctx.fill();

    // Pale shoulder chevron markings
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.beginPath();
    ctx.ellipse(sz * 0.25, -sz * 0.22, sz * 0.2, sz * 0.06, -0.4, 0, Math.PI * 2);
    ctx.ellipse(sz * 0.25, sz * 0.22, sz * 0.2, sz * 0.06, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Cephalic horn fins flanking terminal mouth
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(sz * 0.76, -sz * 0.14, sz * 0.14, sz * 0.06, -0.3, 0, Math.PI * 2);
    ctx.ellipse(sz * 0.76, sz * 0.14, sz * 0.14, sz * 0.06, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Slender whip-like tail
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-sz * 0.7, 0);
    ctx.lineTo(-sz * 1.55, wiggle * 4);
    ctx.stroke();
  }

  // 7. Whale Shark (Rhincodon typus)
  function renderRealisticWhaleShark(sz, wiggle) {
    // Massive broad shovel rostrum and fusiform flank
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(sz * 1.15, 0); // Broad flat head
    ctx.quadraticCurveTo(sz * 0.35, -sz * 0.36, -sz * 0.85, 0);
    ctx.quadraticCurveTo(sz * 0.35, sz * 0.36, sz * 1.15, 0);
    ctx.closePath();
    ctx.fill();

    // Starry constellation spots & vertical lines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    for (let dx = -sz * 0.55; dx < sz * 0.85; dx += sz * 0.14) {
      // Vertical bar trace
      ctx.fillRect(dx, -sz * 0.18, 1, sz * 0.36);
      for (let dy = -sz * 0.16; dy <= sz * 0.16; dy += sz * 0.08) {
        ctx.beginPath();
        ctx.arc(dx + Math.sin(dy) * 1.5, dy, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Powerful asymmetrical caudal fin
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-sz * 0.85, 0);
    ctx.lineTo(-sz * 1.3, -sz * 0.52 + wiggle * 2.5);
    ctx.lineTo(-sz * 1.05, 0);
    ctx.lineTo(-sz * 1.3, sz * 0.52 + wiggle * 2.5);
    ctx.closePath();
    ctx.fill();
  }

  // 8. Bluestreak Cleaner Wrasse (Labroides dimidiatus)
  function renderRealisticCleanerWrasse(sz, wiggle) {
    // Slender electric-blue body
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.ellipse(0, 0, sz * 0.8, sz * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Longitudinal widening wedge stripe
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.moveTo(sz * 0.7, 0);
    ctx.lineTo(-sz * 0.8, -sz * 0.18);
    ctx.lineTo(-sz * 0.8, sz * 0.18);
    ctx.closePath();
    ctx.fill();

    // Tail fin
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.moveTo(-sz * 0.8, 0);
    ctx.lineTo(-sz * 1.12, -sz * 0.18 + wiggle * 2);
    ctx.lineTo(-sz * 1.12, sz * 0.18 + wiggle * 2);
    ctx.closePath();
    ctx.fill();
  }

  // 9. Giant Clam (Tridacna gigas)
  function renderRealisticGiantClam(sz) {
    // Heavy calcified fluted shell
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.ellipse(0, 0, sz * 0.72, sz * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fleshy undulating mantle with micro iridocytes
    const mantleGrad = ctx.createLinearGradient(-sz * 0.5, 0, sz * 0.5, 0);
    mantleGrad.addColorStop(0, '#00bfa5');
    mantleGrad.addColorStop(0.5, '#0091ea');
    mantleGrad.addColorStop(1, '#00bfa5');
    ctx.fillStyle = mantleGrad;

    ctx.beginPath();
    ctx.ellipse(0, -sz * 0.04, sz * 0.58, sz * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Incurrent siphon aperture
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.ellipse(0, -sz * 0.04, sz * 0.1, sz * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 10. Giant Triton Snail (Charonia tritonis)
  function renderRealisticTritonSnail(sz) {
    // Elongated spiral spindle shell
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.moveTo(-sz * 0.8, sz * 0.08);
    ctx.lineTo(sz * 0.28, -sz * 0.28);
    ctx.lineTo(sz * 0.45, sz * 0.18);
    ctx.closePath();
    ctx.fill();

    // Buff variegated ridges
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Muscular crawling foot
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.ellipse(sz * 0.18, sz * 0.22, sz * 0.32, sz * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 11. Dugong (Dugong dugon)
  function renderRealisticDugong(sz, wiggle) {
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.ellipse(0, 0, sz * 0.82, sz * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Downward horseshoe rostrum
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.ellipse(sz * 0.72, sz * 0.14, sz * 0.22, sz * 0.18, 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Whale-like horizontal tail flukes
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(-sz * 0.72, 0);
    ctx.lineTo(-sz * 1.18, -sz * 0.32 + wiggle * 2.5);
    ctx.lineTo(-sz * 0.92, 0);
    ctx.lineTo(-sz * 1.18, sz * 0.32 + wiggle * 2.5);
    ctx.closePath();
    ctx.fill();
  }

  // 12. Bargibant's Pygmy Seahorse (Hippocampus bargibanti)
  function renderRealisticPygmySeahorse(sz, wiggle) {
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(0, -sz * 0.38);
    ctx.quadraticCurveTo(-sz * 0.18, 0, sz * 0.08, sz * 0.28);
    ctx.quadraticCurveTo(-sz * 0.18, sz * 0.65, -sz * 0.08, sz * 0.88 + wiggle * 1.5);
    ctx.stroke();

    // Calcareous mimicry tubercles
    ctx.fillStyle = '#ffffff';
    [-sz * 0.28, -sz * 0.08, sz * 0.12, sz * 0.38].forEach(ty => {
      ctx.beginPath();
      ctx.arc(Math.sin(ty) * 2.5, ty, 1.6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function renderRealisticGenericFish(sz, wiggle, visual) {
    ctx.fillStyle = (visual && visual.color) || '#d97706';
    ctx.beginPath();
    ctx.ellipse(0, 0, sz * 0.7, sz * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-sz * 0.65, 0);
    ctx.lineTo(-sz * 1.0, -sz * 0.25 + wiggle * 2.5);
    ctx.lineTo(-sz * 1.0, sz * 0.25 + wiggle * 2.5);
    ctx.closePath();
    ctx.fill();
  }

  // --- Depth Vignette & Atmospheric Fog ---
  function renderAtmosphericVignette() {
    ctx.save();
    const vigGrad = ctx.createRadialGradient(width * 0.5, height * 0.5, width * 0.3, width * 0.5, height * 0.5, width * 0.85);
    vigGrad.addColorStop(0, 'rgba(1, 8, 17, 0)');
    vigGrad.addColorStop(1, 'rgba(1, 8, 17, 0.45)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  function renderBubblesAndParticles() {
    ctx.save();
    // Marine snow (silt & plankton)
    ctx.fillStyle = '#e2e8f0';
    particles.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Bubbles
    bubbles.forEach(b => {
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 0.8;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  }

  function renderFloatingTexts() {
    ctx.save();
    ctx.font = '600 12px Space Grotesk, sans-serif';
    floatingTexts.forEach(ft => {
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
    });
    ctx.restore();
  }

  // --- Click & Interaction ---
  function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    for (let i = floatingDebris.length - 1; i >= 0; i--) {
      const d = floatingDebris[i];
      const dist = Math.hypot(clickX - d.x, clickY - d.y);
      if (dist < d.size + 15) {
        if (d.type === 'cots_starfish') {
          floatingDebris.splice(i, 1);
          if (onCotsClickCallback) onCotsClickCallback(d, clickX, clickY);
        } else {
          floatingDebris.splice(i, 1);
          if (onDebrisClickCallback) onDebrisClickCallback(d, clickX, clickY);
        }
        return;
      }
    }

    for (let i = livingCreatures.length - 1; i >= 0; i--) {
      const c = livingCreatures[i];
      const dist = Math.hypot(clickX - c.x, clickY - c.y);
      if (dist < c.size + 16) {
        if (onCreatureClickCallback) onCreatureClickCallback(c.species, clickX, clickY);
        return;
      }
    }

    spawnBubble(clickX, clickY, 6);
    if (window.ReefAudio) window.ReefAudio.playBubble(1.0);
  }

  function handleCanvasMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    let isHovering = false;

    for (let i = 0; i < floatingDebris.length; i++) {
      if (Math.hypot(mouseX - floatingDebris[i].x, mouseY - floatingDebris[i].y) < floatingDebris[i].size + 15) {
        isHovering = true;
        break;
      }
    }

    if (!isHovering) {
      for (let i = 0; i < livingCreatures.length; i++) {
        if (Math.hypot(mouseX - livingCreatures[i].x, mouseY - livingCreatures[i].y) < livingCreatures[i].size + 16) {
          isHovering = true;
          break;
        }
      }
    }

    canvas.style.cursor = isHovering ? 'pointer' : 'default';
  }

  function setShadingActive(durationSeconds = 45) {
    isShaded = true;
    shadeTimer = durationSeconds;
  }

  function setUpwellingActive(durationSeconds = 60) {
    isUpwellingActive = true;
    upwellingTimer = durationSeconds;
  }

  return {
    init: init,
    syncCreatures: syncCreatures,
    spawnDebris: spawnDebris,
    spawnCots: spawnCotsStarfish,
    showFloatingText: showFloatingText,
    setShadingActive: setShadingActive,
    setUpwellingActive: setUpwellingActive,
    get isShaded() { return isShaded; },
    get isUpwelling() { return isUpwellingActive; }
  };
})();
