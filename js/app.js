/* ============================================================
   NoiseDNA – Smart City Noise Intelligence Platform
   Application Script
   ============================================================ */

;(function() {
  'use strict';

  // ============================================================
  // CONSTANTS & CONFIGURATION
  // ============================================================

  function getCSSVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function getAccentColor() { return getCSSVar('--accent') || '#2997ff'; }
  function getAccentHover() { return getCSSVar('--accent-hover') || '#0066cc'; }
  function getTextMuted() { return getCSSVar('--text-muted') || '#707070'; }
  function getTextSecondary() { return getCSSVar('--text-secondary') || '#333'; }
  function getChartGrid() { return getCSSVar('--chart-grid') || 'rgba(0,0,0,0.06)'; }
  function getTooltipBg() { return getCSSVar('--tooltip-bg') || 'rgba(255,255,255,0.95)'; }
  function getTooltipBorder() { return getCSSVar('--tooltip-border') || 'rgba(0,0,0,0.1)'; }
  function getGaugeTrack() { return getCSSVar('--gauge-track') || 'rgba(0,0,0,0.06)'; }

  function chartTooltip() {
    const bg = getTooltipBg();
    const bd = getTooltipBorder();
    return {
      backgroundColor: bg,
      titleColor: getCSSVar('--text-primary') || '#1d1d1f',
      bodyColor: getCSSVar('--text-secondary') || '#333',
      borderColor: bd,
      borderWidth: 1,
      padding: 8,
    };
  }

  const COLORS = {
    cyan: '#06B6D4',
    emerald: '#10B981',
    amber: '#F59E0B',
    orange: '#F97316',
    red: '#EF4444',
    purple: '#A855F7',
    pink: '#EC4899',
  };

  const RISK_LEVELS = [
    { id: 'quiet', max: 50, label: 'Quiet', color: COLORS.emerald, icon: 'fa-volume-low' },
    { id: 'moderate', max: 65, label: 'Moderate', color: COLORS.amber, icon: 'fa-volume-low' },
    { id: 'loud', max: 80, label: 'Loud', color: COLORS.orange, icon: 'fa-volume-high' },
    { id: 'dangerous', max: 140, label: 'Dangerous', color: COLORS.red, icon: 'fa-volume-high' },
  ];

  const NOISE_SOURCE_LABELS = [
    { id: 'traffic', label: 'Traffic', color: '#06B6D4' },
    { id: 'construction', label: 'Construction', color: '#F59E0B' },
    { id: 'industrial', label: 'Industrial', color: '#EF4444' },
    { id: 'railway', label: 'Railway', color: '#A855F7' },
    { id: 'aircraft', label: 'Aircraft', color: '#EC4899' },
    { id: 'events', label: 'Events', color: '#10B981' },
    { id: 'gatherings', label: 'Public Gatherings', color: '#F97316' },
  ];

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
  function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

  function generateNoiseProfile(baseNoise, variance) {
    variance = variance || 5;
    return clamp(Math.round((baseNoise + rand(-variance, variance)) * 10) / 10, 20, 140);
  }

  function getRiskIndex(db) {
    if (db <= 50) return 0;
    if (db <= 65) return 1;
    if (db <= 80) return 2;
    return 3;
  }

  function getRiskLevel(db) { return RISK_LEVELS[getRiskIndex(db)]; }

  function formatTime(h) {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return h12 + ampm;
  }

  function generateHourlyData(baseNoise) {
    const hours = [];
    for (let h = 0; h < 24; h++) {
      let noise;
      if (h < 5) noise = baseNoise - 20 + rand(-3, 3);
      else if (h < 7) noise = baseNoise - 10 + rand(-4, 4);
      else if (h < 9) noise = baseNoise + 10 + rand(-4, 6);
      else if (h < 12) noise = baseNoise + 5 + rand(-5, 5);
      else if (h < 14) noise = baseNoise + 8 + rand(-4, 4);
      else if (h < 17) noise = baseNoise + 6 + rand(-5, 5);
      else if (h < 20) noise = baseNoise + 15 + rand(-5, 8);
      else if (h < 23) noise = baseNoise + 5 + rand(-4, 4);
      else noise = baseNoise - 5 + rand(-5, 5);
      hours.push({ hour: h, noise: clamp(Math.round(noise), 20, 140), time: formatTime(h) });
    }
    return hours;
  }

  function generateSourceDistribution() {
    const sources = NOISE_SOURCE_LABELS.map(s => ({ ...s, value: randInt(5, 50) }));
    const total = sources.reduce((a, s) => a + s.value, 0);
    sources.forEach(s => { s.pct = Math.round((s.value / total) * 100); });
    return sources;
  }

  function generateWeeklyData(baseNoise) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    return days.map((day, i) => {
      const isWeekend = i === 0 || i === 6;
      const low = baseNoise - 15 + (isWeekend ? -5 : 0) + randInt(-3, 3);
      const high = baseNoise + 12 + (isWeekend ? -8 : 0) + randInt(-4, 8);
      return { day, low: clamp(low, 20, 140), high: clamp(high, 20, 140), today: i === today };
    });
  }

  function generateMapHotspots() {
    const center = [40.7128, -74.0060];
    const zones = [
      { name: 'Downtown', latOff: 0.003, lngOff: -0.002, intensity: 0.9 },
      { name: 'Times Square', latOff: 0.002, lngOff: 0.006, intensity: 1.0 },
      { name: 'Central Park', latOff: 0.013, lngOff: -0.003, intensity: 0.2 },
      { name: 'Financial District', latOff: -0.008, lngOff: -0.001, intensity: 0.85 },
      { name: 'Midtown', latOff: 0.006, lngOff: 0.002, intensity: 0.8 },
      { name: 'Upper East Side', latOff: 0.018, lngOff: 0.001, intensity: 0.4 },
      { name: 'Brooklyn Bridge', latOff: -0.005, lngOff: 0.008, intensity: 0.7 },
      { name: 'Hudson Yards', latOff: 0.004, lngOff: -0.007, intensity: 0.75 },
      { name: 'East Village', latOff: 0.001, lngOff: 0.012, intensity: 0.65 },
      { name: 'Harlem', latOff: 0.022, lngOff: -0.002, intensity: 0.55 },
      { name: 'Chelsea', latOff: 0.007, lngOff: -0.005, intensity: 0.6 },
      { name: 'Greenwich Village', latOff: 0.002, lngOff: 0.003, intensity: 0.5 },
    ];
    const hotspots = [];
    zones.forEach(z => {
      const baseNoise = 55 + z.intensity * 40;
      const count = randInt(2, 5);
      for (let i = 0; i < count; i++) {
        hotspots.push({
          lat: z.latOff + center[0] + rand(-0.003, 0.003),
          lng: z.lngOff + center[1] + rand(-0.003, 0.003),
          intensity: z.intensity * rand(0.6, 1.0),
          noise: Math.round(baseNoise + rand(-10, 10)),
          name: z.name,
        });
      }
    });
    return hotspots;
  }

  // ============================================================
  // NOISE GAUGE (Canvas)
  // ============================================================

  function drawGauge(canvas, value) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h - 20;
    const r = Math.min(cx - 20, 80);
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const range = endAngle - startAngle;

    ctx.clearRect(0, 0, w, h);

    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.stroke();

    const pct = Math.min(value / 120, 1);
    const valAngle = startAngle + range * pct;
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, COLORS.emerald);
    grad.addColorStop(0.4, COLORS.amber);
    grad.addColorStop(0.7, COLORS.orange);
    grad.addColorStop(1, COLORS.red);

    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, valAngle);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.stroke();

    for (let i = 0; i <= 10; i++) {
      const tickAngle = startAngle + (range * i) / 10;
      const inner = r - 12;
      const outer = r - 5;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(tickAngle) * inner, cy + Math.sin(tickAngle) * inner);
      ctx.lineTo(cx + Math.cos(tickAngle) * outer, cy + Math.sin(tickAngle) * outer);
      ctx.strokeStyle = i % 5 === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = i % 5 === 0 ? 2 : 1;
      ctx.stroke();
    }
  }

  // ============================================================
  // BARRIER CANVAS
  // ============================================================

  function drawBarrier(canvas, type, height, width, density) {
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (parent) {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width || 400;
      canvas.height = rect.height || 260;
    } else {
      canvas.width = 400;
      canvas.height = 260;
    }

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#0F172A');
    skyGrad.addColorStop(0.6, '#1E293B');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#1a2a3a';
    ctx.fillRect(0, h * 0.75, w, h * 0.25);
    ctx.fillStyle = '#2a3a4a';
    ctx.fillRect(0, h * 0.72, w, h * 0.06);
    ctx.setLineDash([8, 12]);
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.75);
    ctx.lineTo(w, h * 0.75);
    ctx.stroke();
    ctx.setLineDash([]);

    const speakerX = Math.min(50, w * 0.1);
    const speakerY = h * 0.65;
    ctx.fillStyle = 'rgba(239,68,68,0.3)';
    ctx.beginPath();
    ctx.arc(speakerX, speakerY, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#EF4444';
    ctx.font = '18px "Font Awesome 6 Free"';
    ctx.textAlign = 'center';
    ctx.fillText('\uF028', speakerX, speakerY + 6);

    const barrierX = w * 0.32;
    const barrierTop = h * 0.75 - height * (h / 300) * 10;
    const barrierW = Math.max(30, width * (w / 300) * 12);
    const den = density / 100;

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(barrierX + 3, barrierTop + 3, barrierW, h * 0.75 - barrierTop);

    if (type === 'trees' || type === 'mixed') {
      const treeCount = Math.max(3, Math.floor(barrierW / 16));
      for (let i = 0; i < treeCount; i++) {
        const tx = barrierX + (i / treeCount) * barrierW + barrierW / treeCount / 2;
        const treeH = (height / 5) * 45 * (0.7 + rand(0, 0.3));
        ctx.fillStyle = `rgba(16,185,129,${0.25 + den * 0.45})`;
        ctx.beginPath();
        ctx.arc(tx, barrierTop + treeH * 0.3, treeH * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(tx - treeH * 0.15, barrierTop + treeH * 0.5, treeH * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(tx + treeH * 0.15, barrierTop + treeH * 0.5, treeH * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#5C4033';
        ctx.fillRect(tx - 2, barrierTop + treeH * 0.55, 4, treeH * 0.45);
      }
    }

    if (type === 'hedges' || type === 'mixed') {
      const hedgeHeight = h * 0.75 - barrierTop;
      ctx.fillStyle = `rgba(16,185,129,${0.15 + den * 0.4})`;
      ctx.fillRect(barrierX, barrierTop, barrierW, hedgeHeight);
      for (let i = 0; i < barrierW; i += 6) {
        ctx.fillStyle = `rgba(6,182,212,${0.08 + Math.random() * 0.12})`;
        const yOff = Math.sin(i * 0.5) * 4;
        ctx.fillRect(barrierX + i, barrierTop + 5 + yOff, 3, hedgeHeight - 10 - yOff);
      }
    }

    if (type === 'vertical') {
      const hedgeHeight = h * 0.75 - barrierTop;
      ctx.fillStyle = '#2a3a4a';
      ctx.fillRect(barrierX, barrierTop, barrierW, hedgeHeight);
      for (let i = 0; i < barrierW; i += 8) {
        for (let j = barrierTop; j < h * 0.75; j += 14) {
          ctx.fillStyle = `rgba(16,185,129,${0.15 + Math.random() * 0.35})`;
          ctx.beginPath();
          ctx.arc(barrierX + i + rand(2, 5), j + rand(2, 5), 2 + rand(1, 4), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = `${Math.max(9, w * 0.025)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('BARRIER', barrierX + barrierW / 2, barrierTop - 6);

    ctx.fillStyle = 'rgba(16,185,129,0.06)';
    ctx.fillRect(w * 0.32 + barrierW + 10, 0, w - w * 0.32 - barrierW - 10, h);
    ctx.fillStyle = 'rgba(16,185,129,0.3)';
    ctx.font = `${Math.max(8, w * 0.022)}px Inter, sans-serif`;
    ctx.fillText('QUIET ZONE', w * 0.7, 18);

    const bldgX = w * 0.78;
    const bldgW = Math.min(50, w * 0.1);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(bldgX, h * 0.3, bldgW, h * 0.45);
    ctx.fillRect(bldgX + bldgW + 5, h * 0.2, bldgW * 0.8, h * 0.55);
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)';
      ctx.fillRect(bldgX + 4, h * 0.3 + i * 22 + 4, bldgW - 8, 14);
    }
  }

  // ============================================================
  // NOISE CALCULATIONS
  // ============================================================

  function calculateBarrierReduction(type, height, width, density, distance, initialNoise) {
    let base = 3;
    if (type === 'trees') base = 3;
    else if (type === 'hedges') base = 5;
    else if (type === 'mixed') base = 6;
    else if (type === 'vertical') base = 4;

    const hf = Math.log2(Math.max(height, 1) + 1) * 1.5;
    const wf = Math.sqrt(width) * 1.2;
    const df = (density / 100) * 4;
    const distF = Math.log10(Math.max(distance, 1) + 1) * 2;
    const initF = ((initialNoise - 50) / 30) * 1.5;

    const reduction = Math.round((base + hf + wf + df + distF + initF) * 10) / 10;
    const finalNoise = clamp(Math.round((initialNoise - reduction) * 10) / 10, 20, 140);
    const actualReduction = Math.round((initialNoise - finalNoise) * 10) / 10;
    const pct = Math.round((actualReduction / initialNoise) * 1000) / 10;
    const loudness = actualReduction >= 15 ? '75% quieter' :
                     actualReduction >= 10 ? '50% quieter' :
                     actualReduction >= 5 ? '30% quieter' : '<10% quieter';
    const effectiveness = actualReduction >= 12 ? 'Very High' :
                         actualReduction >= 8 ? 'High' :
                         actualReduction >= 4 ? 'Moderate' : 'Low';

    return { reduction: actualReduction, finalNoise, pct, loudness, effectiveness };
  }

  function calculatePlannerImpact(interventions) {
    const tr = (interventions.trees / 1000) * 4;
    const wr = (interventions.walls / 20) * 8;
    const br = (interventions.bikes / 50) * 2;
    const tfr = (interventions.traffic / 40) * 6;
    const rr = (interventions.roofs / 100) * 3;

    const total = tr + wr + br + tfr + rr;
    const before = 78;
    const after = clamp(Math.round(before - total), 20, 140);
    const population = Math.round(50000 + (total / 20) * 400000);
    const cost = Math.round((0.5 +
      (interventions.trees / 1000) * 1.2 +
      (interventions.walls / 20) * 3 +
      (interventions.bikes / 50) * 0.5 +
      (interventions.traffic / 40) * 2 +
      (interventions.roofs / 100) * 1.5) * 10) / 10;

    return {
      before,
      after,
      reduction: Math.round(total * 10) / 10,
      population,
      cost,
      costPerDb: total > 0 ? Math.round((cost / total) * 100) / 100 : 0,
    };
  }

  function calculateBuildingNoise(buildingType, floors, proximity) {
    const base = { residential: 55, school: 50, hospital: 48, office: 58, library: 38 }[buildingType] || 50;
    const prox = { 'Direct (0\u201310m)': 20, 'Near (10\u201350m)': 10, 'Moderate (50\u2013200m)': 3, 'Far (200m+)': -5 }[proximity] || 10;
    const flr = { '1\u20133': 0, '4\u20138': 2, '9\u201315': 5, '16+': 8 }[floors] || 0;
    return clamp(Math.round(base + prox + flr + rand(-3, 3)), 20, 140);
  }

  function generateRecommendations(buildingType, noise) {
    const recDB = {
      school: [
        { name: 'Acoustic Wall Panels', desc: 'Install NRC 0.85 panels in classrooms and corridors', reduction: 8, icon: 'fa-table-cells', color: '#06B6D4' },
        { name: 'Green Roof', desc: 'Extensive green roof with sedum for sound absorption', reduction: 6, icon: 'fa-leaf', color: '#10B981' },
        { name: 'Sound-Absorbing Facade', desc: 'Ventilated facade with mineral wool insulation', reduction: 12, icon: 'fa-building', color: '#A855F7' },
        { name: 'Tree Barrier', desc: 'Double-row deciduous trees along property line', reduction: 5, icon: 'fa-tree', color: '#F59E0B' },
        { name: 'Acoustic Ceiling', desc: 'Suspended acoustic ceiling tiles in gymnasium', reduction: 4, icon: 'fa-square', color: '#EC4899' },
      ],
      hospital: [
        { name: 'Acoustic Wall Panels', desc: 'Hospital-grade soundproofing for patient rooms', reduction: 10, icon: 'fa-table-cells', color: '#06B6D4' },
        { name: 'Green Roof', desc: 'Intensive green roof with sound-absorbing substrate', reduction: 7, icon: 'fa-leaf', color: '#10B981' },
        { name: 'Noise Barrier Wall', desc: '4m high barrier near ER ambulance entrance', reduction: 15, icon: 'fa-grip', color: '#EF4444' },
        { name: 'Soundproof Windows', desc: 'STC 45 rated windows for ICU wing', reduction: 8, icon: 'fa-window-maximize', color: '#A855F7' },
        { name: 'HVAC Silencers', desc: 'Duct silencers on ventilation system', reduction: 3, icon: 'fa-fan', color: '#F59E0B' },
      ],
      residential: [
        { name: 'Double Glazing', desc: 'STC 40 rated double-pane windows', reduction: 8, icon: 'fa-window-maximize', color: '#06B6D4' },
        { name: 'Green Facade', desc: 'Climbing plants on exterior walls', reduction: 4, icon: 'fa-leaf', color: '#10B981' },
        { name: 'Acoustic Fence', desc: '2.5m absorptive fence along property', reduction: 6, icon: 'fa-border-all', color: '#F59E0B' },
        { name: 'Weatherstripping', desc: 'Seal gaps around doors and windows', reduction: 3, icon: 'fa-tape', color: '#A855F7' },
      ],
      office: [
        { name: 'Acoustic Ceiling Tiles', desc: 'NRC 0.90 ceiling tiles for open plans', reduction: 6, icon: 'fa-square', color: '#06B6D4' },
        { name: 'Carpet Installation', desc: 'Sound-absorbing carpet tiles throughout', reduction: 4, icon: 'fa-border-all', color: '#10B981' },
        { name: 'White Noise System', desc: 'Masking system for open office areas', reduction: 5, icon: 'fa-wave-square', color: '#A855F7' },
        { name: 'Acoustic Partitions', desc: 'Height-adjustable desk screens', reduction: 3, icon: 'fa-divide', color: '#F59E0B' },
      ],
      library: [
        { name: 'Acoustic Entrance', desc: 'Sound-lock vestibule at main entrance', reduction: 8, icon: 'fa-door-open', color: '#06B6D4' },
        { name: 'Bookshelf Barriers', desc: 'Tall bookshelves as sound diffusers', reduction: 5, icon: 'fa-book', color: '#10B981' },
        { name: 'Carpet & Padding', desc: 'Thick carpet with acoustic underlay', reduction: 4, icon: 'fa-border-all', color: '#A855F7' },
        { name: 'Acoustic Panels', desc: 'Fabric-wrapped panels for reading areas', reduction: 6, icon: 'fa-table-cells', color: '#F59E0B' },
      ],
    };
    return (recDB[buildingType] || recDB.residential).map(r => ({
      ...r,
      reduction: Math.round(r.reduction * (1 + (noise - 50) / 100) * 10) / 10,
    }));
  }

  function calculateRouteNoise(routeType) {
    const base = { fastest: 72, balanced: 58, quietest: 45 }[routeType] || 58;
    const time = { fastest: 18, balanced: 24, quietest: 32 }[routeType] || 24;
    const dist = { fastest: 4.2, balanced: 5.1, quietest: 6.8 }[routeType] || 5.1;
    const score = { fastest: 64, balanced: 82, quietest: 94 }[routeType] || 82;
    const pct = { fastest: 100, balanced: 72, quietest: 52 }[routeType] || 72;
    return { noise: base, time, dist, score, pct };
  }

  function recalculateRoutes() {
    ['fastest', 'balanced', 'quietest'].forEach(type => {
      const data = calculateRouteNoise(type);
      const card = document.querySelector(`.route-card.${type}`);
      if (!card) return;
      card.querySelector('.route-detail:nth-child(1) span').textContent = data.time + ' min';
      card.querySelector('.route-detail:nth-child(2) span').textContent = data.dist + ' km';
      card.querySelector('.route-detail:nth-child(3) span').textContent = data.noise + ' dB avg';
      card.querySelector('.route-detail:nth-child(4) span').textContent = 'Noise Score: ' + data.score;
      card.querySelector('.route-bar').style.setProperty('--pct', data.pct + '%');
    });
  }

  // ============================================================
  // APPLICATION STATE
  // ============================================================

  const state = {
    currentSection: 'dashboard',
    currentNoise: 67,
    hourlyData: [],
    sourceData: [],
    weeklyData: [],
    hotspots: [],
    forecastPeriod: 'today',
    selectedRoute: 'balanced',
    barrierType: 'mixed',
    barrierHeight: 5,
    barrierWidth: 3,
    barrierDensity: 80,
    barrierDist: 10,
    barrierInit: 78,
    buildingType: 'school',
    buildingFloors: '4\u20138',
    buildingProximity: 'Near (10\u201350m)',
    planner: { trees: 200, walls: 3, bikes: 8, traffic: 5, roofs: 15 },
    navMode: 'scroll',
    sliderIndex: 0,
  };

  let gaugeCanvas, gaugeValue;
  let sourceChartInstance, hourlyChartInstance, forecastChartInstance, barrierResultChartInstance, plannerChartInstance;
  let mapInstance;
  let updateInterval;
  const initializedSections = new Set();

  // ============================================================
  // INIT
  // ============================================================

  function init() {
    gaugeCanvas = document.getElementById('noiseGauge');
    gaugeValue = document.getElementById('gaugeValue');

    state.currentNoise = randInt(58, 72);
    state.hourlyData = generateHourlyData(state.currentNoise);
    state.sourceData = generateSourceDistribution();
    state.weeklyData = generateWeeklyData(state.currentNoise);
    state.hotspots = generateMapHotspots();

    initThemeSwitcher();
    initModeSwitcher();
    initNavigation();
    initMobileToggle();
    initRouteSwap();
    initRouteSelection();
    initRouteFind();
    initBarrierControls();
    initBuildingAdvisor();
    initPlannerControls();
    initForecastTabs();

    renderDashboard();
    renderForecast();
    renderBarrier();
    renderBuildingAdvisor();
    renderPlanner();

    setNavMode('scroll');

    setTimeout(initMap, 500);

    updateInterval = setInterval(() => {
      state.currentNoise = generateNoiseProfile(state.currentNoise, 2);
      updateDashboardValues();
    }, 5000);
  }

  // ============================================================
  // MODE SWITCHER
  // ============================================================

  function initModeSwitcher() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setNavMode(btn.dataset.mode);
      });
    });
  }

  function setNavMode(mode) {
    const body = document.body;
    body.classList.remove('mode-scroll', 'mode-slider', 'mode-hub');
    body.classList.add('mode-' + mode);

    // Destroy current mode
    if (state.navMode === 'slider') destroySliderMode();
    if (state.navMode === 'hub') destroyHubMode();
    if (state.navMode === 'scroll') destroyScrollMode();

    state.navMode = mode;

    // Init new mode
    if (mode === 'scroll') initScrollMode();
    else if (mode === 'slider') initSliderMode();
    else if (mode === 'hub') initHubMode();

    // Navigate to current section
    const activeNav = document.querySelector('.nav-item.active') || document.querySelector('.nav-item');
    if (activeNav) {
      const section = activeNav.dataset.section;
      navigateTo(section, true);
    }

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
    document.querySelector('.sidebar-overlay')?.remove();
  }

  // ============================================================
  // NAVIGATION
  // ============================================================

  function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        navigateTo(item.dataset.section);
        document.getElementById('sidebar').classList.remove('open');
        document.querySelector('.sidebar-overlay')?.remove();
      });
    });
  }

  function navigateTo(section, silent) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`.nav-item[data-section="${section}"]`)?.classList.add('active');
    state.currentSection = section;

    const mode = state.navMode;
    if (mode === 'scroll') {
      const target = document.getElementById('page-' + section);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      initSectionOnce(section);
    } else if (mode === 'slider') {
      const allSections = document.querySelectorAll('.page-section');
      let idx = 0;
      allSections.forEach((s, i) => {
        if (s.id === 'page-' + section) idx = i;
      });
      goToSlider(idx);
    } else if (mode === 'hub') {
      const overlay = document.getElementById('hubOverlay');
      if (overlay.classList.contains('open')) {
        closeHubOverlay();
        setTimeout(() => openHubSection(section), 300);
      } else {
        openHubSection(section);
      }
    }

    if (section === 'map' && mapInstance) {
      setTimeout(() => mapInstance.invalidateSize(), 300);
    }
  }

  function initSectionOnce(section) {
    if (initializedSections.has(section)) return;
    initializedSections.add(section);
  }

  // ============================================================
  // THEME SWITCHER
  // ============================================================

  function initThemeSwitcher() {
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setTheme(btn.dataset.theme);
      });
    });
  }

  function setTheme(theme) {
    document.body.classList.remove('theme-apple', 'theme-caldera');
    document.body.classList.add('theme-' + theme);
    reRenderThemeDependent();
  }

  function reRenderThemeDependent() {
    setTimeout(() => {
      // Re-render charts that depend on theme colors
      if (document.getElementById('sourceChart')) renderSourceChart();
      if (document.getElementById('hourlyChart')) renderHourlyChart();
      if (document.getElementById('forecastChart')) renderForecastChart();
      if (document.getElementById('barrierResultChart')) renderBarrierResultChart(
        parseFloat(document.getElementById('resultBefore')?.textContent) || 78,
        parseFloat(document.getElementById('resultAfter')?.textContent) || 68
      );
      if (document.getElementById('plannerChart')) renderPlanner();
      if (document.getElementById('noiseGauge')) drawGauge(document.getElementById('noiseGauge'), state.currentNoise);
    }, 50);
  }

  // ============================================================
  // MODE: SCROLL (IntersectionObserver)
  // ============================================================

  let scrollObserver = null;

  function initScrollMode() {
    scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const section = entry.target.id.replace('page-', '');
          document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
          document.querySelector(`.nav-item[data-section="${section}"]`)?.classList.add('active');
        }
      });
    }, { threshold: 0.2, rootMargin: '-80px 0px 0px 0px' });

    document.querySelectorAll('.page-section').forEach(s => scrollObserver.observe(s));
  }

  function destroyScrollMode() {
    if (scrollObserver) {
      scrollObserver.disconnect();
      scrollObserver = null;
    }
  }

  // ============================================================
  // MODE: SLIDER (Carousel)
  // ============================================================

  function initSliderMode() {
    const sections = document.querySelectorAll('.page-section');
    sections.forEach((s, i) => {
      s.classList.remove('slider-active', 'slider-exit-left', 'slider-exit-right');
    });
    state.sliderIndex = 0;
    if (sections.length > 0) sections[0].classList.add('slider-active');
    updateSliderControls();

    document.getElementById('sliderPrev').addEventListener('click', () => goToSlider(state.sliderIndex - 1));
    document.getElementById('sliderNext').addEventListener('click', () => goToSlider(state.sliderIndex + 1));

    document.addEventListener('keydown', sliderKeyHandler);
  }

  function destroySliderMode() {
    document.removeEventListener('keydown', sliderKeyHandler);
  }

  function sliderKeyHandler(e) {
    if (state.navMode !== 'slider') return;
    if (e.key === 'ArrowLeft') goToSlider(state.sliderIndex - 1);
    else if (e.key === 'ArrowRight') goToSlider(state.sliderIndex + 1);
  }

  function goToSlider(index) {
    const sections = document.querySelectorAll('.page-section');
    if (index < 0 || index >= sections.length) return;
    if (index === state.sliderIndex) return;

    const current = sections[state.sliderIndex];
    const next = sections[index];
    const goingForward = index > state.sliderIndex;

    current.classList.remove('slider-active');
    current.classList.add(goingForward ? 'slider-exit-left' : 'slider-exit-right');

    next.classList.remove('slider-exit-left', 'slider-exit-right');
    next.classList.add('slider-active');

    state.sliderIndex = index;
    updateSliderControls();

    const id = next.id.replace('page-', '');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`.nav-item[data-section="${id}"]`)?.classList.add('active');
    state.currentSection = id;

    if (id === 'map' && mapInstance) setTimeout(() => mapInstance.invalidateSize(), 200);

    // Cleanup exit classes after transition
    setTimeout(() => {
      current.classList.remove('slider-exit-left', 'slider-exit-right');
    }, 400);
  }

  function updateSliderControls() {
    const sections = document.querySelectorAll('.page-section');
    const dots = document.getElementById('sliderDots');
    dots.innerHTML = '';
    sections.forEach((s, i) => {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === state.sliderIndex ? ' active' : '');
      dot.addEventListener('click', () => goToSlider(i));
      dots.appendChild(dot);
    });

    document.getElementById('sliderPrev').disabled = state.sliderIndex === 0;
    document.getElementById('sliderNext').disabled = state.sliderIndex === sections.length - 1;
  }

  // ============================================================
  // MODE: HUB (Hub & Spoke)
  // ============================================================

  const HUB_SECTIONS = [
    { id: 'dashboard', icon: 'fa-gauge-high', title: 'Dashboard', desc: 'Real-time noise monitoring and analytics' },
    { id: 'map', icon: 'fa-map-location-dot', title: 'Live Map', desc: 'Interactive noise hotspot map' },
    { id: 'forecast', icon: 'fa-chart-line', title: 'Forecast', desc: 'AI-powered noise predictions' },
    { id: 'routes', icon: 'fa-route', title: 'Quiet Routes', desc: 'Find the quietest path through the city' },
    { id: 'greenbarrier', icon: 'fa-seedling', title: 'Green Barrier', desc: 'Simulate vegetation noise barriers' },
    { id: 'advisor', icon: 'fa-building', title: 'Building Advisor', desc: 'AI recommendations for buildings' },
    { id: 'zones', icon: 'fa-shield-halved', title: 'Sensitive Zones', desc: 'Protect schools, hospitals, libraries' },
    { id: 'planner', icon: 'fa-city', title: 'City Planner', desc: 'Test urban planning interventions' },
    { id: 'science', icon: 'fa-flask', title: 'Science Fair', desc: 'The science behind noise pollution' },
  ];

  let hubInit = false;

  function initHubMode() {
    const mainContent = document.getElementById('mainContent');
    let hubPage = document.querySelector('.hub-page');
    if (!hubPage) {
      hubPage = document.createElement('div');
      hubPage.className = 'hub-page';
      mainContent.prepend(hubPage);
    }

    hubPage.innerHTML = HUB_SECTIONS.map(s => `
      <div class="hub-card" data-section="${s.id}">
        <div class="hub-card-icon"><i class="fas ${s.icon}"></i></div>
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
      </div>
    `).join('');

    hubPage.querySelectorAll('.hub-card').forEach(card => {
      card.addEventListener('click', () => {
        navigateTo(card.dataset.section);
      });
    });

    document.getElementById('hubClose').addEventListener('click', closeHubOverlay);
    document.addEventListener('keydown', hubKeyHandler);
    hubInit = true;
  }

  function destroyHubMode() {
    document.removeEventListener('keydown', hubKeyHandler);
    closeHubOverlay();
  }

  function hubKeyHandler(e) {
    if (state.navMode !== 'hub') return;
    if (e.key === 'Escape') closeHubOverlay();
  }

  function openHubSection(section) {
    const overlay = document.getElementById('hubOverlay');
    const body = document.getElementById('hubBody');
    const title = document.getElementById('hubTitle');

    const info = HUB_SECTIONS.find(s => s.id === section);
    title.textContent = info ? info.title : 'Section';

    // Clone the section content into the overlay
    const source = document.getElementById('page-' + section);
    if (source) {
      body.innerHTML = source.innerHTML;
      // Replace map container with placeholder in overlay
      if (section === 'map') {
        const mapContainer = body.querySelector('.map-container');
        if (mapContainer) {
          mapContainer.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px;color:var(--text-muted)"><i class="fas fa-map-location-dot" style="font-size:3rem;color:var(--accent)"></i><p style="font-size:0.9rem">Interactive map available in Scroll or Slider mode</p></div>';
        }
      }
      // Re-render charts if needed
      if (section === 'dashboard') {
        setTimeout(() => {
          drawGauge(body.querySelector('#noiseGauge') || document.getElementById('noiseGauge'), state.currentNoise);
          renderSourceChart();
          renderHourlyChart();
        }, 100);
      }
      if (section === 'forecast') {
        setTimeout(() => { renderForecastChart(); renderForecastTimeline(); renderDailyCards(); }, 100);
      }
      if (section === 'greenbarrier') {
        setTimeout(() => renderBarrier(), 100);
      }
      if (section === 'planner') {
        setTimeout(() => renderPlanner(), 100);
      }
      if (section === 'advisor') {
        setTimeout(() => renderBuildingAdvisor(), 100);
      }
    }

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    initSectionOnce(section);
  }

  function closeHubOverlay() {
    const overlay = document.getElementById('hubOverlay');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function initMobileToggle() {
    document.getElementById('mobileToggle').addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar');
      sidebar.classList.toggle('open');
      if (sidebar.classList.contains('open')) {
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay show';
        overlay.addEventListener('click', () => {
          sidebar.classList.remove('open');
          overlay.remove();
        });
        document.body.appendChild(overlay);
      } else {
        document.querySelector('.sidebar-overlay')?.remove();
      }
    });
  }

  // ============================================================
  // ROUTES
  // ============================================================

  function initRouteSwap() {
    document.getElementById('routeSwap').addEventListener('click', () => {
      const s = document.getElementById('routeStart');
      const e = document.getElementById('routeEnd');
      [s.value, e.value] = [e.value, s.value];
    });
  }

  function initRouteSelection() {
    document.querySelectorAll('.route-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.route-card').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.route-select-btn').forEach(b => b.textContent = 'Select');
        card.classList.add('active');
        card.querySelector('.route-select-btn').textContent = 'Selected';
      });
    });
  }

  function initRouteFind() {
    document.getElementById('routeFindBtn').addEventListener('click', recalculateRoutes);
  }

  // ============================================================
  // DASHBOARD
  // ============================================================

  function renderDashboard() {
    drawGauge(gaugeCanvas, state.currentNoise);
    updateDashboardValues();
    renderSourceChart();
    renderHourlyChart();
  }

  function updateDashboardValues() {
    const noise = state.currentNoise;
    gaugeValue.textContent = Math.round(noise);
    drawGauge(gaugeCanvas, noise);

    const riskIdx = getRiskIndex(noise);
    document.querySelectorAll('.risk-ring-segment').forEach((seg, i) => {
      seg.classList.toggle('active', i <= riskIdx);
    });

    const risk = getRiskLevel(noise);
    const colorMap = [COLORS.emerald, COLORS.amber, COLORS.orange, COLORS.red];
    const iconMap = ['fa-volume-low', 'fa-volume-low', 'fa-volume-high', 'fa-volume-high'];
    const descs = [
      'Noise levels within safe limits',
      'Caution advised in high-traffic areas',
      'Prolonged exposure may cause health issues',
      'Immediate action recommended',
    ];

    document.getElementById('riskStatus').innerHTML = `
      <div class="risk-icon"><i class="fas ${iconMap[riskIdx]}" style="color:${colorMap[riskIdx]}"></i></div>
      <div class="risk-label" style="color:${colorMap[riskIdx]}">${risk.label}</div>
      <div class="risk-desc">${descs[riskIdx]}</div>
    `;

    const peak = Math.max(...state.hourlyData.map(d => d.noise));
    const low = Math.min(...state.hourlyData.map(d => d.noise));
    const avg = Math.round(state.hourlyData.reduce((a, d) => a + d.noise, 0) / state.hourlyData.length);
    document.getElementById('statPeak').textContent = peak;
    document.getElementById('statLow').textContent = low;
    document.getElementById('statAvg').textContent = avg;
  }

  // ============================================================
  // CHARTS
  // ============================================================

  function renderSourceChart() {
    const ctx = document.getElementById('sourceChart')?.getContext('2d');
    if (!ctx) return;
    if (sourceChartInstance) sourceChartInstance.destroy();

    const data = state.sourceData;
    sourceChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          data: data.map(d => d.value),
          backgroundColor: data.map(d => d.color + 'DD'),
          borderColor: data.map(d => d.color),
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: { display: false },
          tooltip: {
            ...chartTooltip(),
            callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed}%` },
          },
        },
      },
    });

    document.getElementById('sourceLegend').innerHTML = data.map(d =>
      `<span><span class="legend-color" style="background:${d.color}"></span> ${d.label} ${d.pct}%</span>`
    ).join('');
  }

  function renderHourlyChart() {
    const ctx = document.getElementById('hourlyChart')?.getContext('2d');
    if (!ctx) return;
    if (hourlyChartInstance) hourlyChartInstance.destroy();

    const data = state.hourlyData;
    hourlyChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.time),
        datasets: [{
          data: data.map(d => d.noise),
          borderColor: getAccentColor(),
          backgroundColor: (c) => {
            const ac = getAccentColor();
            const g = c.chart.ctx.createLinearGradient(0, 0, 0, 200);
            g.addColorStop(0, ac + '40');
            g.addColorStop(1, ac + '00');
          },
          pointBackgroundColor: getAccentColor(),

          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            ...chartTooltip(),
            callbacks: { label: ctx => `${ctx.parsed.y} dB` },
          },
        },
        scales: {
          x: { grid: { color: getChartGrid(), drawBorder: false }, ticks: { color: getTextMuted(), font: { size: 9 }, maxTicksLimit: 12 } },
          y: { grid: { color: getChartGrid(), drawBorder: false }, ticks: { color: getTextMuted(), font: { size: 9 } }, min: 20, max: 100 },
        },
      },
    });
  }

  function renderForecastChart() {
    const ctx = document.getElementById('forecastChart')?.getContext('2d');
    if (!ctx) return;
    if (forecastChartInstance) forecastChartInstance.destroy();

    const hours = state.forecastPeriod === 'today' ? state.hourlyData
      : generateHourlyData(state.currentNoise + rand(-3, 3));

    const values = hours.map(h => h.noise);
    const getColor = (v) => {
      if (v <= 50) return { bg: 'rgba(16,185,129,0.5)', bd: COLORS.emerald };
      if (v <= 65) return { bg: 'rgba(245,158,11,0.5)', bd: COLORS.amber };
      if (v <= 80) return { bg: 'rgba(249,115,22,0.5)', bd: COLORS.orange };
      return { bg: 'rgba(239,68,68,0.5)', bd: COLORS.red };
    };

    forecastChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: hours.map(h => h.time),
        datasets: [{
          data: values,
          backgroundColor: values.map(v => getColor(v).bg),
          borderColor: values.map(v => getColor(v).bd),
          borderWidth: 1,
          borderRadius: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            ...chartTooltip(),
            callbacks: { label: ctx => `${ctx.parsed.y} dB` },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: getTextMuted(), font: { size: 8 }, maxTicksLimit: 12 } },
          y: { grid: { color: getChartGrid(), drawBorder: false }, ticks: { color: getTextMuted(), font: { size: 9 } }, min: 20, max: 100 },
        },
      },
    });
  }

  // ============================================================
  // FORECAST
  // ============================================================

  function initForecastTabs() {
    document.querySelectorAll('.forecast-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.forecast-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.forecastPeriod = tab.dataset.period;
        renderForecast();
      });
    });
  }

  function renderForecast() {
    renderForecastTimeline();
    renderForecastChart();
    renderDailyCards();
  }

  function renderForecastTimeline() {
    const container = document.getElementById('forecastTimeline');
    if (!container) return;
    const hours = state.forecastPeriod === 'today' ? state.hourlyData
      : generateHourlyData(state.currentNoise + rand(-3, 3));

    container.innerHTML = hours.map(h => {
      const risk = getRiskLevel(h.noise);
      const pct = clamp(((h.noise - 20) / 100) * 100, 0, 100);
      return `<div class="forecast-hour">
        <span class="fh-time">${h.time}</span>
        <div class="fh-bar-wrap">
          <div class="fh-bar ${risk.id}" style="height:${pct}%"></div>
        </div>
        <span class="fh-label">${h.noise}</span>
      </div>`;
    }).join('');
  }

  function renderDailyCards() {
    const container = document.getElementById('dailyCards');
    if (!container) return;
    const data = state.weeklyData;

    container.innerHTML = data.map(d => {
      const avg = Math.round((d.low + d.high) / 2);
      const risk = getRiskLevel(avg);
      const pct = clamp(((avg - 20) / 100) * 100, 0, 100);
      return `<div class="daily-card" style="${d.today ? 'border:1px solid rgba(6,182,212,0.2);background:rgba(6,182,212,0.05)' : ''}">
        <span class="daily-name">${d.day}${d.today ? ' (Today)' : ''}</span>
        <div class="daily-range">
          <span class="daily-low">${d.low}</span>
          <div class="daily-range-bar">
            <div class="daily-range-fill ${risk.id}" style="width:${pct}%"></div>
          </div>
          <span class="daily-high">${d.high}</span>
        </div>
      </div>`;
    }).join('');
  }

  // ============================================================
  // MAP (Leaflet)
  // ============================================================

  function initMap() {
    const container = document.getElementById('noiseMap');
    if (!container || typeof L === 'undefined') return;

    mapInstance = L.map('noiseMap', {
      center: [40.7128, -74.0060],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(mapInstance);

    state.hotspots.forEach(h => {
      const radius = 50 + h.intensity * 150;
      const color = h.intensity > 0.7 ? COLORS.red : h.intensity > 0.5 ? COLORS.orange : h.intensity > 0.3 ? COLORS.amber : COLORS.emerald;
      L.circle([h.lat, h.lng], {
        radius,
        color,
        fillColor: color,
        fillOpacity: 0.12 + h.intensity * 0.25,
        weight: 1,
        opacity: 0.4,
      }).addTo(mapInstance).bindPopup(`<b>${h.name}</b><br>Noise: ${h.noise} dB`);

      L.circleMarker([h.lat, h.lng], {
        radius: 3 + h.intensity * 4,
        color,
        fillColor: color,
        fillOpacity: 0.8,
        weight: 1,
      }).addTo(mapInstance);
    });

    const sensitiveZones = [
      { name: 'PS 321 School', lat: 40.718, lng: -73.995, type: 'school', iconColor: '#06B6D4', icon: 'fa-school' },
      { name: 'NYU Langone Hospital', lat: 40.742, lng: -73.974, type: 'hospital', iconColor: '#EF4444', icon: 'fa-hospital' },
      { name: 'NY Public Library', lat: 40.752, lng: -73.982, type: 'library', iconColor: '#F59E0B', icon: 'fa-book' },
      { name: 'Columbia University', lat: 40.807, lng: -73.962, type: 'school', iconColor: '#06B6D4', icon: 'fa-school' },
      { name: 'Mount Sinai Hospital', lat: 40.790, lng: -73.952, type: 'hospital', iconColor: '#EF4444', icon: 'fa-hospital' },
      { name: 'Brooklyn Public Library', lat: 40.672, lng: -73.968, type: 'library', iconColor: '#F59E0B', icon: 'fa-book' },
    ];

    sensitiveZones.forEach(z => {
      const markerIcon = L.divIcon({
        html: `<i class="fas ${z.icon}" style="color:${z.iconColor};font-size:18px;text-shadow:0 0 8px ${z.iconColor}44"></i>`,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      L.marker([z.lat, z.lng], { icon: markerIcon })
        .addTo(mapInstance)
        .bindPopup(`<b>${z.name}</b><br>Protected Zone`);
    });

    document.querySelectorAll('.map-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    document.getElementById('mapHotspots').textContent = state.hotspots.length;
    document.getElementById('mapMax').textContent = Math.max(...state.hotspots.map(h => h.noise)) + ' dB';
    document.getElementById('mapSensors').textContent = '156';

    setTimeout(() => mapInstance.invalidateSize(), 300);
  }

  // ============================================================
  // GREEN BARRIER
  // ============================================================

  function initBarrierControls() {
    document.getElementById('barrierType').addEventListener('change', e => {
      state.barrierType = e.target.value;
      renderBarrier();
    });

    ['barrierHeight', 'barrierWidth', 'barrierDensity', 'barrierDist', 'barrierInit'].forEach(id => {
      const el = document.getElementById(id);
      const display = document.getElementById(id + 'Val');
      el.addEventListener('input', () => {
        const val = parseFloat(el.value);
        state[id] = val;
        if (display) display.textContent = val;
        renderBarrier();
      });
    });
  }

  function renderBarrier() {
    drawBarrier(
      document.getElementById('barrierCanvas'),
      state.barrierType, state.barrierHeight, state.barrierWidth, state.barrierDensity
    );

    const result = calculateBarrierReduction(
      state.barrierType, state.barrierHeight, state.barrierWidth,
      state.barrierDensity, state.barrierDist, state.barrierInit
    );

    document.getElementById('resultBefore').textContent = Math.round(state.barrierInit) + ' dB';
    document.getElementById('resultAfter').textContent = Math.round(result.finalNoise) + ' dB';
    document.getElementById('resultReduction').textContent = result.reduction + ' dB';
    document.getElementById('resultPct').textContent = result.pct + '%';
    document.getElementById('resultLoudness').textContent = result.loudness;
    document.getElementById('resultEffectiveness').textContent = result.effectiveness;

    renderBarrierResultChart(state.barrierInit, result.finalNoise);
  }

  function renderBarrierResultChart(before, after) {
    const ctx = document.getElementById('barrierResultChart')?.getContext('2d');
    if (!ctx) return;
    if (barrierResultChartInstance) barrierResultChartInstance.destroy();

    barrierResultChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Before', 'After'],
        datasets: [{
          data: [Math.round(before), Math.round(after)],
          backgroundColor: ['rgba(239,68,68,0.5)', 'rgba(16,185,129,0.5)'],
          borderColor: [COLORS.red, COLORS.emerald],
          borderWidth: 2,
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            ...chartTooltip(),
            callbacks: { label: ctx => `${ctx.parsed.y} dB` },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: getTextMuted(), font: { size: 10 } } },
          y: { grid: { color: getChartGrid(), drawBorder: false }, ticks: { color: getTextMuted(), font: { size: 9 } }, min: 0, max: 120 },
        },
      },
    });
  }

  // ============================================================
  // BUILDING ADVISOR
  // ============================================================

  function initBuildingAdvisor() {
    ['buildingType', 'buildingFloors', 'buildingProximity'].forEach(id => {
      document.getElementById(id).addEventListener('change', renderBuildingAdvisor);
    });
  }

  function renderBuildingAdvisor() {
    const type = document.getElementById('buildingType').value;
    const floors = document.getElementById('buildingFloors').value;
    const proximity = document.getElementById('buildingProximity').value;
    const noise = calculateBuildingNoise(type, floors, proximity);

    document.getElementById('buildingCurrentNoise').textContent = Math.round(noise) + ' dB';

    const recs = generateRecommendations(type, noise);
    document.getElementById('recsList').innerHTML = recs.map(r =>
      `<div class="rec-item">
        <div class="rec-icon" style="background:${r.color}22;color:${r.color}">
          <i class="fas ${r.icon}"></i>
        </div>
        <div>
          <div class="rec-name">${r.name}</div>
          <div class="rec-desc">${r.desc}</div>
        </div>
        <div class="rec-reduction">-${r.reduction} dB</div>
      </div>`
    ).join('');
  }

  // ============================================================
  // CITY PLANNER
  // ============================================================

  function initPlannerControls() {
    document.querySelectorAll('.planner-slider').forEach(slider => {
      slider.addEventListener('input', () => {
        const target = slider.dataset.target;
        state.planner[target] = parseFloat(slider.value);

        const displayMap = { trees: 'plannerTreesVal', walls: 'plannerWallsVal', bikes: 'plannerBikesVal', traffic: 'plannerTrafficVal', roofs: 'plannerRoofsVal' };
        const valMap = { trees: v => `${v} trees`, walls: v => `${v} km`, bikes: v => `${v} km`, traffic: v => `${v}% diverted`, roofs: v => `${v}% coverage` };

        const el = document.getElementById(displayMap[target]);
        if (el) el.textContent = valMap[target](parseFloat(slider.value));

        renderPlanner();
      });
    });
  }

  function renderPlanner() {
    const impact = calculatePlannerImpact(state.planner);
    document.getElementById('plannerBefore').textContent = impact.before + ' dB';
    document.getElementById('plannerAfter').textContent = impact.after + ' dB';
    document.getElementById('plannerReduction').textContent = impact.reduction + ' dB';
    document.getElementById('plannerPopulation').textContent = impact.population.toLocaleString();
    document.getElementById('plannerCost').textContent = '$' + impact.cost + 'M';
    document.getElementById('plannerCostPerDb').textContent = '$' + impact.costPerDb + 'M';
    renderPlannerChart(impact);
  }

  function renderPlannerChart(impact) {
    const ctx = document.getElementById('plannerChart')?.getContext('2d');
    if (!ctx) return;
    if (plannerChartInstance) plannerChartInstance.destroy();

    const contributions = [
      { label: 'Tree Planting', value: (state.planner.trees / 1000) * 4, color: '#10B981' },
      { label: 'Noise Barriers', value: (state.planner.walls / 20) * 8, color: '#06B6D4' },
      { label: 'Bike Lanes', value: (state.planner.bikes / 50) * 2, color: '#A855F7' },
      { label: 'Traffic Diversion', value: (state.planner.traffic / 40) * 6, color: '#F59E0B' },
      { label: 'Green Roofs', value: (state.planner.roofs / 100) * 3, color: '#EC4899' },
    ];

    plannerChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: contributions.map(c => c.label),
        datasets: [{
          data: contributions.map(c => Math.round(c.value * 10) / 10),
          backgroundColor: contributions.map(c => c.color + '66'),
          borderColor: contributions.map(c => c.color),
          borderWidth: 2,
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            ...chartTooltip(),
            callbacks: { label: ctx => `${ctx.parsed.x} dB reduction` },
          },
        },
        scales: {
          x: { grid: { color: getChartGrid(), drawBorder: false }, ticks: { color: getTextMuted(), font: { size: 9 } } },
          y: { grid: { display: false }, ticks: { color: getTextSecondary(), font: { size: 10 } } },
        },
      },
    });
  }

  // ============================================================
  // START
  // ============================================================

  document.addEventListener('DOMContentLoaded', init);

})();
