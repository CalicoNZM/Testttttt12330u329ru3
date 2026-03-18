// =============================================================================
// UFORMULA — Season 2026 Racing Game
// =============================================================================

// --- 2026 DRIVER & TEAM DATA ---
const DRIVERS = [
    // Red Bull Racing
    { id: 'ver', name: 'Max Verstappen', team: 'Red Bull Racing', color: '#3671C6', pac: 98, rac: 99, awa: 97, exp: 95, ovr: 97 },
    { id: 'had', name: 'Isack Hadjar', team: 'Red Bull Racing', color: '#3671C6', pac: 82, rac: 78, awa: 76, exp: 68, ovr: 76 },
    // McLaren
    { id: 'nor', name: 'Lando Norris', team: 'McLaren', color: '#FF8700', pac: 96, rac: 95, awa: 93, exp: 88, ovr: 93 },
    { id: 'pia', name: 'Oscar Piastri', team: 'McLaren', color: '#FF8700', pac: 94, rac: 92, awa: 90, exp: 82, ovr: 90 },
    // Ferrari
    { id: 'lec', name: 'Charles Leclerc', team: 'Ferrari', color: '#E8002D', pac: 97, rac: 94, awa: 89, exp: 88, ovr: 92 },
    { id: 'ham', name: 'Lewis Hamilton', team: 'Ferrari', color: '#E8002D', pac: 91, rac: 96, awa: 95, exp: 99, ovr: 95 },
    // Mercedes
    { id: 'rus', name: 'George Russell', team: 'Mercedes', color: '#27F4D2', pac: 92, rac: 90, awa: 91, exp: 85, ovr: 90 },
    { id: 'ant', name: 'Kimi Antonelli', team: 'Mercedes', color: '#27F4D2', pac: 88, rac: 82, awa: 79, exp: 70, ovr: 80 },
    // Aston Martin
    { id: 'alo', name: 'Fernando Alonso', team: 'Aston Martin', color: '#229971', pac: 87, rac: 96, awa: 96, exp: 99, ovr: 95 },
    { id: 'str', name: 'Lance Stroll', team: 'Aston Martin', color: '#229971', pac: 80, rac: 79, awa: 76, exp: 84, ovr: 80 },
    // Alpine
    { id: 'gas', name: 'Pierre Gasly', team: 'Alpine', color: '#FF87BC', pac: 87, rac: 86, awa: 84, exp: 86, ovr: 86 },
    { id: 'col', name: 'Franco Colapinto', team: 'Alpine', color: '#FF87BC', pac: 83, rac: 78, awa: 75, exp: 70, ovr: 77 },
    // Williams
    { id: 'alb', name: 'Alex Albon', team: 'Williams', color: '#64C4FF', pac: 86, rac: 85, awa: 83, exp: 84, ovr: 85 },
    { id: 'sai', name: 'Carlos Sainz', team: 'Williams', color: '#64C4FF', pac: 90, rac: 91, awa: 90, exp: 90, ovr: 90 },
    // Racing Bulls
    { id: 'law', name: 'Liam Lawson', team: 'Racing Bulls', color: '#6692FF', pac: 84, rac: 82, awa: 80, exp: 75, ovr: 80 },
    { id: 'lin', name: 'Arvid Lindblad', team: 'Racing Bulls', color: '#6692FF', pac: 80, rac: 76, awa: 73, exp: 65, ovr: 74 },
    // Audi
    { id: 'hul', name: 'Nico Hülkenberg', team: 'Audi', color: '#00E701', pac: 84, rac: 85, awa: 88, exp: 94, ovr: 88 },
    { id: 'bor', name: 'Gabriel Bortoleto', team: 'Audi', color: '#00E701', pac: 82, rac: 78, awa: 76, exp: 68, ovr: 76 },
    // Haas
    { id: 'oco', name: 'Esteban Ocon', team: 'Haas', color: '#B6BABD', pac: 85, rac: 84, awa: 80, exp: 86, ovr: 84 },
    { id: 'bea', name: 'Oliver Bearman', team: 'Haas', color: '#B6BABD', pac: 83, rac: 80, awa: 78, exp: 72, ovr: 78 },
    // Cadillac
    { id: 'bot', name: 'Valtteri Bottas', team: 'Cadillac', color: '#C8AA00', pac: 86, rac: 87, awa: 88, exp: 96, ovr: 89 },
    { id: 'per', name: 'Sergio Pérez', team: 'Cadillac', color: '#C8AA00', pac: 84, rac: 86, awa: 85, exp: 94, ovr: 87 },
];

const TRACKS = {
    monza: { name: 'Monza', gen: (w, h) => { const m=120; return [{x:w*0.3,y:h-m},{x:w*0.9,y:h-m},{x:w*0.88,y:h-m*1.6},{x:w*0.78,y:h-m*1.6},{x:w*0.72,y:h-m},{x:w*0.58,y:h-m},{x:w*0.58,y:m*2.2},{x:w*0.68,y:m*1.6},{x:w*0.82,y:m*1.5},{x:w*0.92,y:m},{x:w*0.12,y:m},{x:w*0.15,y:m*2},{x:w*0.22,y:m*2.6},{x:w*0.3,y:h-m*3.2}]; }},
    silverstone: { name: 'Silverstone', gen: (w, h) => { const m=120; return [{x:m,y:h-m},{x:w/2,y:h-m},{x:w-m,y:h-m*1.5},{x:w-m,y:m},{x:w-m*2,y:m},{x:w-m*2.5,y:m*1.5},{x:w-m*2,y:m*2},{x:w-m*2.5,y:m*2.5},{x:w/2,y:h/2},{x:m*2,y:h/2+m},{x:m,y:h/2}]; }},
    suzuka: { name: 'Suzuka', gen: (w, h) => { const m=120; return [{x:w*0.4,y:h-m},{x:w-m,y:h-m},{x:w-m,y:h*0.5},{x:w*0.7,y:h*0.6},{x:w*0.8,y:h*0.2},{x:w*0.4,y:m},{x:m*1.5,y:m},{x:m,y:m*2},{x:m,y:h*0.6},{x:m*1.8,y:h*0.55},{x:w*0.45,y:h*0.45}]; }},
    spa: { name: 'Spa', gen: (w, h) => { const m=100; return [{x:w*0.2,y:h-m},{x:w*0.7,y:h-m},{x:w*0.85,y:h-m*2},{x:w*0.9,y:h*0.4},{x:w*0.75,y:m*1.5},{x:w*0.5,y:m},{x:w*0.3,y:m*1.5},{x:w*0.15,y:m*2.5},{x:m,y:h*0.5},{x:m*1.2,y:h*0.7}]; }},
};

const UPGRADE_TIERS = {
    engine: [{cost:40000,bonus:3},{cost:120000,bonus:6},{cost:350000,bonus:9}],
    aero:   [{cost:35000,bonus:3},{cost:100000,bonus:6},{cost:300000,bonus:9}],
    brakes: [{cost:30000,bonus:3},{cost:80000,bonus:6},{cost:250000,bonus:9}],
};
const PAYOUTS = [60000,42000,30000,24000,20000,17000,15000,13000,11000,9000,7000,6500,6000,5500,5000,4000,3500,3000,2500,2000,1500,1000];
const PHYSICS = {
    trackWidth: 130,
    baseTopSpeed: 4.2, paceFactor: 2.6,
    baseAccel: 0.032, accelFactor: 0.028,
    baseHandling: 0.032, handleFactor: 0.055,
    drsBonus: 1.15, drag: 0.9965, tyreScrub: 0.004,
    offTrackGrip: 0.82, collisionRadius: 16, collisionForce: 2.0,
};

// --- STATE ---
let game = {}, race = {}, settings = { sound: false };

// --- DOM ---
const $ = id => document.getElementById(id);
const screens = { menu: $('main-menu-screen'), selection: $('selection-screen'), hub: $('career-hub-screen'), race: $('race-screen') };
const hud = { pos: $('hud-pos'), lap: $('hud-lap'), time: $('hud-time'), speed: $('hud-speed'), prompt: $('race-prompt'), drs: $('drs-btn'), flag: $('flag-indicator'), dmgBar: $('damage-bar') };
const modal = { overlay: $('modal-overlay'), content: $('modal-content') };

function showScreen(s) { Object.values(screens).forEach(el => { el.classList.remove('active'); }); s.classList.add('active'); }
function showModal(html) { modal.content.innerHTML = html; modal.overlay.classList.remove('hidden'); }
function hideModal() { modal.overlay.classList.add('hidden'); }

// --- CAR DRAWING (2D detailed model) ---
function drawCar(ctx, car, isPlayer) {
    const dmg = car.damage || 0;
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle + Math.PI/2);
    const c = car.data.color;
    const dark = shadeColor(c, -40);
    // Scale: car is ~28px long, ~12px wide
    const L = 14, W = 6;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(1, 1, W+1, L+1, 0, 0, Math.PI*2);
    ctx.fill();
    // Rear wing (if not destroyed)
    if (dmg < 0.8) {
        ctx.fillStyle = dark;
        ctx.fillRect(-W-1, L-4, 2, 6);
        ctx.fillRect(W-1, L-4, 2, 6);
        ctx.fillStyle = c;
        ctx.fillRect(-W-1, L+1, W*2+2, 2);
    }
    // Body
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(-W+1, L-2);
    ctx.lineTo(-W, L-6);
    ctx.lineTo(-W+1, -L+6);
    ctx.lineTo(-2, -L);
    ctx.lineTo(2, -L);
    ctx.lineTo(W-1, -L+6);
    ctx.lineTo(W, L-6);
    ctx.lineTo(W-1, L-2);
    ctx.closePath();
    ctx.fill();
    // Cockpit/halo
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(0, -2, 3, 4, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, -4, 2.5, Math.PI*0.8, Math.PI*2.2);
    ctx.stroke();
    // Sidepods
    if (dmg < 0.6) {
        ctx.fillStyle = dark;
        ctx.fillRect(-W-0.5, -2, 2, 8);
        ctx.fillRect(W-1.5, -2, 2, 8);
    }
    // Front wing (if not destroyed)
    if (dmg < 0.4) {
        ctx.fillStyle = c;
        ctx.fillRect(-W-2, -L+1, W*2+4, 2);
        ctx.fillStyle = dark;
        ctx.fillRect(-W-2, -L-1, 2, 3);
        ctx.fillRect(W, -L-1, 2, 3);
    }
    // Wheels (4)
    ctx.fillStyle = '#222';
    const ww = 2, wh = 4;
    ctx.fillRect(-W-ww, -L+6, ww, wh); // FL
    ctx.fillRect(W, -L+6, ww, wh);      // FR
    ctx.fillRect(-W-ww, L-8, ww, wh);   // RL
    ctx.fillRect(W, L-8, ww, wh);        // RR
    // Damage cracks overlay
    if (dmg > 0.2) {
        ctx.strokeStyle = `rgba(255,80,0,${dmg*0.6})`;
        ctx.lineWidth = 0.8;
        for (let i = 0; i < Math.floor(dmg * 6); i++) {
            const sx = (Math.sin(i*73)*0.5)*W*2 - W;
            const sy = (Math.cos(i*47)*0.5)*L*2 - L;
            ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + (Math.sin(i*31))*4, sy + (Math.cos(i*19))*4); ctx.stroke();
        }
    }
    // Player marker (yellow dot on nose)
    if (isPlayer) {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath(); ctx.arc(0, -L-2, 2.5, 0, Math.PI*2); ctx.fill();
    }
    // DRS flap
    if (car.drsActive) {
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(-W+2, L, W*2-4, 2);
    }
    ctx.restore();
}

function shadeColor(hex, amt) {
    let r = parseInt(hex.slice(1,3),16)+amt, g = parseInt(hex.slice(3,5),16)+amt, b = parseInt(hex.slice(5,7),16)+amt;
    r = Math.max(0,Math.min(255,r)); g = Math.max(0,Math.min(255,g)); b = Math.max(0,Math.min(255,b));
    return `rgb(${r},${g},${b})`;
}

// --- DEBRIS PARTICLES ---
let particles = [];
function spawnDebris(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({ x, y, vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4, life: 40+Math.random()*30, color, size: 1+Math.random()*2 });
    }
}
function updateParticles(ctx) {
    for (let i = particles.length-1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.vx *= 0.96; p.vy *= 0.96; p.life--;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = p.life / 60;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
}

// --- BILLBOARDS ---
function generateBillboards(splinePath) {
    const billboards = [];
    const colors = ['#e10600','#3671C6','#FF8700','#27F4D2','#FFD700','#FF87BC','#229971'];
    const tw = PHYSICS.trackWidth;
    for (let i = 0; i < splinePath.length; i += 40) {
        if (Math.random() > 0.4) continue;
        const p = splinePath[i];
        const next = splinePath[(i+1) % splinePath.length];
        const angle = Math.atan2(next.y - p.y, next.x - p.x) + Math.PI/2;
        const side = Math.random() > 0.5 ? 1 : -1;
        const dist = tw/2 + 15 + Math.random()*20;
        billboards.push({
            x: p.x + Math.cos(angle)*dist*side,
            y: p.y + Math.sin(angle)*dist*side,
            w: 25 + Math.random()*15, h: 8,
            angle: angle + Math.PI/2,
            color: colors[Math.floor(Math.random()*colors.length)],
            hit: false
        });
    }
    return billboards;
}

// --- TRACK GENERATION ---
function generateSpline(layout) {
    const pts = [];
    const detail = 10;
    for (let i = 0; i < layout.length; i++) {
        const p0 = layout[(i-1+layout.length)%layout.length], p1 = layout[i];
        const p2 = layout[(i+1)%layout.length], p3 = layout[(i+2)%layout.length];
        for (let j = 0; j < detail; j++) {
            const t = j/detail, t2=t*t, t3=t2*t;
            pts.push({
                x: 0.5*(p0.x*(-t3+2*t2-t) + p1.x*(3*t3-5*t2+2) + p2.x*(-3*t3+4*t2+t) + p3.x*(t3-t2)),
                y: 0.5*(p0.y*(-t3+2*t2-t) + p1.y*(3*t3-5*t2+2) + p2.y*(-3*t3+4*t2+t) + p3.y*(t3-t2)),
            });
        }
    }
    for (let i = 0; i < pts.length; i++) {
        const a = pts[(i-5+pts.length)%pts.length], b = pts[i], c = pts[(i+5)%pts.length];
        let d = Math.atan2(c.y-b.y,c.x-b.x) - Math.atan2(b.y-a.y,b.x-a.x);
        while(d>Math.PI) d-=2*Math.PI; while(d<-Math.PI) d+=2*Math.PI;
        pts[i].curvature = Math.abs(d);
    }
    const path = new Path2D();
    path.moveTo(pts[0].x, pts[0].y);
    for (let i=1; i<pts.length; i++) path.lineTo(pts[i].x, pts[i].y);
    path.closePath();
    return { path, spline: pts };
}

// --- CAREER SYSTEM ---
function initCareer(saved) {
    if (saved) { game = JSON.parse(saved); showScreen(screens.hub); renderHub(); return; }
    showScreen(screens.selection); renderDriverGrid();
}

function renderDriverGrid() {
    const grid = $('driver-grid');
    grid.innerHTML = DRIVERS.map(d => `
        <div class="driver-card" data-id="${d.id}">
            <div class="card-top"><span class="name">${d.name}</span><span class="ovr" style="color:${d.color}">${d.ovr}</span></div>
            <div class="team">${d.team}</div>
        </div>`).join('');
    grid.querySelectorAll('.driver-card').forEach(card => {
        card.onclick = () => {
            grid.querySelectorAll('.driver-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            game.selectedId = card.dataset.id;
            $('confirm-driver-btn').disabled = false;
        };
    });
}

function renderHub() {
    const d = (game.drivers||DRIVERS).find(dr => dr.id === game.selectedId);
    if (!d) return;
    const stats = getPlayerStats(d);
    $('currency-display').textContent = `$${game.currency.toLocaleString()}`;
    $('hub-driver-panel').innerHTML = `
        <h2 style="color:${d.color};font-size:1.1rem;">${d.name}</h2>
        <p class="text-muted" style="font-size:0.8rem;">${d.team}</p>
        <p class="text-muted" style="font-size:0.7rem;margin-top:0.5rem;">Rep: ${game.rep||0}</p>`;
    $('hub-car-panel').innerHTML = `<h2 style="font-size:1rem;margin-bottom:0.75rem;">Car Performance</h2>` +
        statBar('Engine (Pace)', d.pac, stats.pac) + statBar('Aero (Racecraft)', d.rac, stats.rac) + statBar('Brakes (Awareness)', d.awa, stats.awa);
}

function statBar(label, base, total) {
    const bonus = total - base;
    return `<div class="stat-row"><label><span>${label}</span><span>${total}${bonus>0?` <span style="color:var(--green)">(+${bonus})</span>`:''}</span></label>
    <div class="stat-bar"><div class="stat-fill" style="width:${base}%"></div>${bonus>0?`<div class="stat-upgrade" style="width:${bonus}%"></div>`:''}</div></div>`;
}

function getPlayerStats(d) {
    const eb = game.upgrades.engine>=0 ? UPGRADE_TIERS.engine[game.upgrades.engine].bonus : 0;
    const ab = game.upgrades.aero>=0 ? UPGRADE_TIERS.aero[game.upgrades.aero].bonus : 0;
    const bb = game.upgrades.brakes>=0 ? UPGRADE_TIERS.brakes[game.upgrades.brakes].bonus : 0;
    return { pac: Math.min(100,d.pac+eb), rac: Math.min(100,d.rac+ab), awa: Math.min(100,d.awa+bb), exp: d.exp };
}

function save() { localStorage.setItem('uformula2026', JSON.stringify(game)); }

function renderUpgradeShop() {
    let html = '<h2>Upgrade Shop</h2><div class="upgrade-grid">';
    for (const type in UPGRADE_TIERS) {
        html += `<div class="upgrade-col"><h3>${type}</h3>`;
        UPGRADE_TIERS[type].forEach((t, i) => {
            const lvl = game.upgrades[type];
            if (lvl >= i) html += `<button class="btn btn-green btn-small" disabled><span>T${i+1} ✓</span></button>`;
            else if (lvl === i-1) {
                const ok = game.currency >= t.cost;
                html += `<button class="btn ${ok?'btn-accent':'btn-secondary'} btn-small" ${ok?`onclick="buyUpgrade('${type}',${i},${t.cost})"`:' disabled'}><span>T${i+1} $${(t.cost/1000).toFixed(0)}k</span></button>`;
            } else html += `<button class="btn btn-secondary btn-small" disabled><span>T${i+1} 🔒</span></button>`;
        });
        html += '</div>';
    }
    html += '</div><div class="modal-buttons"><button class="btn btn-secondary" onclick="hideModal()"><span>Close</span></button></div>';
    showModal(html);
}
window.buyUpgrade = (type, lvl, cost) => { game.currency -= cost; game.upgrades[type] = lvl; save(); renderHub(); renderUpgradeShop(); };
window.hideModal = hideModal;

// --- RACE ENGINE ---
function createCar(driverData, isPlayer) {
    const s = isPlayer ? getPlayerStats(driverData) : driverData;
    const P = PHYSICS;
    return {
        data: driverData, isPlayer, x:0, y:0, speed:0, angle:0,
        lap:0, progress:0, position:0, targetIdx:1, drsAvailable:false, drsActive:false, timeBehind:0,
        lastPos:{x:0,y:0}, crossed:false, offTimer:0, penalty:0, damage:0, isSpun:false,
        topSpeed: P.baseTopSpeed + (s.pac/100)*P.paceFactor,
        accel: P.baseAccel + (s.pac/100)*P.accelFactor,
        handling: P.baseHandling + (s.rac/100)*P.handleFactor,
        awareness: s.awa/100,
        skill: { pac: s.pac + (Math.random()-0.5)*3, rac: s.rac + (Math.random()-0.5)*3, awa: s.awa + (Math.random()-0.5)*3 },
    };
}

function setupRaceCanvas() {
    const container = screens.race;
    const canvas = $('race-canvas');
    const hudH = $('race-hud').offsetHeight;
    const h = container.clientHeight - hudH;
    const w = container.clientWidth;
    const ratio = 16/9;
    let cw = w, ch = cw/ratio;
    if (ch > h) { ch = h; cw = ch*ratio; }
    canvas.width = cw; canvas.height = ch;
    canvas.style.marginTop = hudH + 'px';
}

async function startRace(trackId, laps) {
    showScreen(screens.race);
    setupRaceCanvas();
    const canvas = $('race-canvas');
    const layout = TRACKS[trackId].gen(canvas.width, canvas.height);
    const { path, spline } = generateSpline(layout);
    const p1 = spline[0], p2 = spline[1];
    const fa = Math.atan2(p2.y-p1.y,p2.x-p1.x)+Math.PI/2;
    const hw = PHYSICS.trackWidth/2;

    race = {
        running: false, laps, trackId, path, spline, billboards: generateBillboards(spline),
        finishLine: { x1:p1.x-hw*Math.cos(fa),y1:p1.y-hw*Math.sin(fa), x2:p1.x+hw*Math.cos(fa),y2:p1.y+hw*Math.sin(fa) },
        drsZone: { det: spline.length-120, start: spline.length-80, end: 40 },
        keys: {}, camera: {x:0,y:0}, flag: {status:'green',dur:0},
        player: null, ai: [], startTime: 0, lapStart: 0,
    };

    const drivers = game.drivers || DRIVERS;
    const playerData = drivers.find(d => d.id === game.selectedId);
    race.player = createCar(playerData, true);
    race.ai = drivers.filter(d => d.id !== game.selectedId).map(d => createCar(d, false));

    const all = [race.player, ...race.ai];
    all.forEach((car, i) => {
        const sa = Math.atan2(p2.y-p1.y,p2.x-p1.x);
        const pa = sa+Math.PI/2;
        car.x = p1.x - Math.cos(sa)*Math.floor(i/2)*42 + Math.cos(pa)*(i%2===1?25:-25);
        car.y = p1.y - Math.sin(sa)*Math.floor(i/2)*42 + Math.sin(pa)*(i%2===1?25:-25);
        car.angle = sa;
    });

    particles = [];
    hud.prompt.textContent = 'READY';
    await sleep(1200);
    hud.prompt.textContent = '3'; await sleep(800);
    hud.prompt.textContent = '2'; await sleep(800);
    hud.prompt.textContent = '1'; await sleep(800);
    hud.prompt.textContent = 'GO!';
    race.running = true;
    race.startTime = performance.now();
    race.lapStart = race.startTime;
    requestAnimationFrame(loop);
    await sleep(1500);
    hud.prompt.textContent = '';
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function loop(ts) {
    if (!race.running) return;
    update(ts);
    render();
    const all = [race.player, ...race.ai];
    if (race.player.lap > race.laps) { endRace(all); return; }
    // Check if all AI finished too
    const allFinished = all.every(c => c.lap > race.laps);
    if (allFinished) { endRace(all); return; }
    requestAnimationFrame(loop);
}

function update(ts) {
    if (race.flag.dur > 0) { race.flag.dur--; if (race.flag.dur <= 0) { race.flag.status='green'; hud.flag.className=''; hud.flag.style.display='none'; } }
    const all = [race.player, ...race.ai];
    all.sort((a,b) => b.progress - a.progress);
    all.forEach((c,i) => { c.position = i+1; c.timeBehind = i>0 ? (all[i-1].progress-c.progress)*0.5 : 0; });

    all.forEach(c => updateCar(c, ts));
    checkCollisions(all);
    checkBillboardCollisions(all);

    // HUD
    hud.pos.textContent = `${race.player.position}/${all.length}`;
    hud.lap.textContent = `${Math.min(race.player.lap, race.laps)}/${race.laps}`;
    hud.speed.textContent = Math.round(race.player.speed * 55);
    hud.time.textContent = ((ts - race.lapStart)/1000).toFixed(1);
    const dmgPct = Math.max(0, 1 - race.player.damage);
    hud.dmgBar.style.width = (dmgPct*100) + '%';
    hud.dmgBar.style.background = dmgPct > 0.6 ? 'var(--green)' : dmgPct > 0.3 ? '#eab308' : 'var(--accent)';
    hud.drs.className = 'drs-indicator' + (race.player.drsActive ? ' active' : race.player.drsAvailable ? ' available' : '');
}

function updateCar(car, ts) {
    if (car.isSpun && car.speed < 0.1) car.isSpun = false;
    if (car.penalty > 0) car.penalty--;
    car.lastPos = {x:car.x, y:car.y};

    let throttle=0, brake=0, turn=0;
    const sp = race.spline;

    if (car.isPlayer) {
        const k = race.keys;
        if (k['ArrowUp']||k['w']||k['gas']) throttle=1;
        if (k['ArrowDown']||k['s']||k['brake']) brake=1;
        if (k['ArrowLeft']||k['a']||k['left']) turn=-1;
        if (k['ArrowRight']||k['d']||k['right']) turn=1;
        // Track player position on spline for DRS/lap detection
        let best=Infinity, bi=car.targetIdx;
        for (let i=0; i<sp.length; i++) { const d=Math.hypot(sp[i].x-car.x,sp[i].y-car.y); if(d<best){best=d;bi=i;} }
        car.targetIdx = bi;
    } else {
        // AI: find nearest spline point and steer toward lookahead
        let best=Infinity, bi=car.targetIdx;
        for (let i=0; i<sp.length; i++) { const d=Math.hypot(sp[i].x-car.x,sp[i].y-car.y); if(d<best){best=d;bi=i;} }
        car.targetIdx = bi;

        // Adaptive lookahead based on speed
        const look = Math.max(12, Math.min(35, Math.round(car.speed * 8)));
        const ti = (bi+look) % sp.length;
        const target = sp[ti];
        const ta = Math.atan2(target.y-car.y, target.x-car.x);
        let ad = ta - car.angle;
        while(ad>Math.PI) ad-=2*Math.PI; while(ad<-Math.PI) ad+=2*Math.PI;
        turn = Math.max(-1, Math.min(1, ad*2.5));

        // Corner braking with awareness-based skill
        const cornerLook = Math.round(20 + car.awareness*15);
        const ci = (bi+cornerLook) % sp.length;
        const curv = sp[ci].curvature;
        const targetSpd = car.topSpeed * Math.max(0.25, 1 - curv*(1.5 + car.awareness*0.5));

        if (car.speed > targetSpd*1.05) { throttle=0; brake=Math.min(1,(car.speed-targetSpd)*0.25); }
        else { throttle = Math.min(1, 0.7 + car.awareness*0.3); }

        // Collision avoidance
        const allCars = [race.player, ...race.ai];
        for (const other of allCars) {
            if (other === car) continue;
            const dx=other.x-car.x, dy=other.y-car.y, dist=Math.hypot(dx,dy);
            if (dist < 40 && dist > 0) {
                const avoidAngle = Math.atan2(dy,dx);
                let avoidDiff = avoidAngle - car.angle;
                while(avoidDiff>Math.PI) avoidDiff-=2*Math.PI; while(avoidDiff<-Math.PI) avoidDiff+=2*Math.PI;
                if (Math.abs(avoidDiff) < Math.PI/3) {
                    turn -= Math.sign(avoidDiff) * 0.3 * (1 - dist/40);
                    if (dist < 25) throttle *= 0.8;
                }
            }
        }

        // Yellow flag respect
        if (race.flag.status === 'yellow') { throttle *= 0.6; }

        turn = Math.max(-1, Math.min(1, turn));
    }

    // Physics
    const sr = car.speed / car.topSpeed;
    if (car.speed > 0.15 && !car.isSpun) car.angle += turn * car.handling * (1 - sr*0.65);
    const effTop = car.topSpeed * (1 - car.damage*0.4);
    const drs = car.drsActive ? PHYSICS.drsBonus : 1;
    const pen = car.penalty > 0 ? 0.25 : 1;
    car.speed += car.accel * throttle * drs * pen;
    car.speed *= (1 - 0.04*brake);
    car.speed *= PHYSICS.drag;
    if (Math.abs(turn) > 0.1) car.speed *= (1 - PHYSICS.tyreScrub*sr*Math.abs(turn));
    car.speed = Math.max(0, Math.min(effTop*drs, car.speed));
    car.x += Math.cos(car.angle)*car.speed;
    car.y += Math.sin(car.angle)*car.speed;

    // DRS
    const inDRS = car.targetIdx >= race.drsZone.start || car.targetIdx <= race.drsZone.end;
    if (car.targetIdx === race.drsZone.det) car.drsAvailable = car.timeBehind < 0.8 && car.position > 1;
    if (!inDRS || brake > 0) car.drsActive = false;
    if (car.isPlayer && (race.keys['r']||race.keys['drs']||race.keys[' ']) && inDRS && car.drsAvailable) car.drsActive = true;
    else if (!car.isPlayer && inDRS && car.drsAvailable) car.drsActive = true;

    // Track limits
    const ctx = $('race-canvas').getContext('2d');
    ctx.lineWidth = PHYSICS.trackWidth;
    if (!ctx.isPointInStroke(race.path, car.x, car.y)) {
        car.speed *= PHYSICS.offTrackGrip;
        car.offTimer++;
        if (car.offTimer > 100) {
            car.penalty = 180; car.offTimer = 0;
            if (car.isPlayer) { hud.prompt.textContent='TRACK LIMITS!'; setTimeout(()=>hud.prompt.textContent='',2000); }
        }
    } else car.offTimer = 0;

    // Lap check
    checkLap(car, ts);
    car.progress = car.lap + car.targetIdx / race.spline.length;
}

function checkCollisions(cars) {
    for (let i=0; i<cars.length; i++) for (let j=i+1; j<cars.length; j++) {
        const a=cars[i], b=cars[j];
        const dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy);
        if (d < PHYSICS.collisionRadius) {
            const sd = Math.abs(a.speed-b.speed);
            const dmg = sd * 0.04;
            a.damage = Math.min(1, a.damage+dmg);
            b.damage = Math.min(1, b.damage+dmg);
            const ang = Math.atan2(dy,dx), ov = PHYSICS.collisionRadius-d, f=ov*PHYSICS.collisionForce;
            a.x -= Math.cos(ang)*f/2; a.y -= Math.sin(ang)*f/2;
            b.x += Math.cos(ang)*f/2; b.y += Math.sin(ang)*f/2;
            spawnDebris((a.x+b.x)/2, (a.y+b.y)/2, a.data.color, 4);
            if (sd > 2 && race.flag.status==='green') {
                race.flag.status='yellow'; race.flag.dur=300;
                hud.flag.className='yellow'; hud.flag.style.display='block'; hud.flag.textContent='⚠ YELLOW FLAG';
                const spinner = a.speed>b.speed ? b : a;
                spinner.isSpun=true; spinner.speed*=0.15; spinner.angle+=(Math.random()-0.5)*Math.PI;
            }
        }
    }
}

function checkBillboardCollisions(cars) {
    for (const bb of race.billboards) {
        if (bb.hit) continue;
        for (const car of cars) {
            if (Math.hypot(car.x-bb.x, car.y-bb.y) < 18) {
                bb.hit = true;
                car.damage = Math.min(1, car.damage + 0.15);
                car.speed *= 0.6;
                spawnDebris(bb.x, bb.y, bb.color, 8);
                if (car.isPlayer) { hud.prompt.textContent='BILLBOARD HIT!'; setTimeout(()=>hud.prompt.textContent='',1500); }
                break;
            }
        }
    }
}

function checkLap(car, ts) {
    const f = race.finishLine;
    const cross = ((f.y1-f.y2)*(car.lastPos.x-f.x1)+(f.x2-f.x1)*(car.lastPos.y-f.y1)) *
                  ((f.y1-f.y2)*(car.x-f.x1)+(f.x2-f.x1)*(car.y-f.y1)) < 0 &&
                  ((car.lastPos.y-car.y)*(f.x1-car.lastPos.x)+(car.x-car.lastPos.x)*(f.y1-car.lastPos.y)) *
                  ((car.lastPos.y-car.y)*(f.x2-car.lastPos.x)+(car.x-car.lastPos.x)*(f.y2-car.lastPos.y)) < 0;
    if (cross && !car.crossed && car.targetIdx > race.spline.length*0.85) {
        car.lap++;
        car.crossed = true;
        if (car.isPlayer) race.lapStart = ts;
    } else if (car.targetIdx < race.spline.length*0.1) car.crossed = false;
}

function render() {
    const canvas = $('race-canvas');
    const ctx = canvas.getContext('2d');
    const cam = race.camera;
    const target = race.player;
    cam.x += ((target.x - canvas.width/2) - cam.x)*0.08;
    cam.y += ((target.y - canvas.height/2) - cam.y)*0.08;

    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();
    ctx.translate(-cam.x, -cam.y);

    // Grass
    ctx.fillStyle = '#166534';
    ctx.fillRect(cam.x, cam.y, canvas.width, canvas.height);

    // Track
    ctx.strokeStyle = '#555';
    ctx.lineWidth = PHYSICS.trackWidth; ctx.lineJoin='round'; ctx.lineCap='round';
    ctx.stroke(race.path);

    // Racing line (center stripe)
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 2;
    ctx.stroke(race.path);

    // Kerbs
    const sp = race.spline;
    ctx.lineWidth = 6;
    for (let i=0; i<sp.length; i++) {
        if (sp[i].curvature > 0.04) {
            const n = sp[(i+1)%sp.length], a = Math.atan2(n.y-sp[i].y,n.x-sp[i].x)+Math.PI/2;
            ctx.strokeStyle = i%4<2 ? '#FFF' : '#e10600';
            ctx.beginPath();
            ctx.moveTo(sp[i].x+Math.cos(a)*(PHYSICS.trackWidth/2-4), sp[i].y+Math.sin(a)*(PHYSICS.trackWidth/2-4));
            ctx.lineTo(n.x+Math.cos(a)*(PHYSICS.trackWidth/2-4), n.y+Math.sin(a)*(PHYSICS.trackWidth/2-4));
            ctx.stroke();
        }
    }

    // Finish line
    const f = race.finishLine;
    ctx.strokeStyle='#fff'; ctx.lineWidth=8;
    ctx.beginPath(); ctx.moveTo(f.x1,f.y1); ctx.lineTo(f.x2,f.y2); ctx.stroke();

    // Billboards
    for (const bb of race.billboards) {
        if (bb.hit) continue;
        ctx.save();
        ctx.translate(bb.x, bb.y); ctx.rotate(bb.angle);
        ctx.fillStyle = bb.color;
        ctx.fillRect(-bb.w/2, -bb.h/2, bb.w, bb.h);
        ctx.strokeStyle = '#fff'; ctx.lineWidth=1;
        ctx.strokeRect(-bb.w/2, -bb.h/2, bb.w, bb.h);
        ctx.restore();
    }

    // Cars
    race.ai.forEach(c => drawCar(ctx, c, false));
    drawCar(ctx, race.player, true);

    // Particles
    updateParticles(ctx);

    // Speed lines for player at high speed
    if (race.player.speed > race.player.topSpeed * 0.7) {
        const intensity = (race.player.speed - race.player.topSpeed*0.7) / (race.player.topSpeed*0.3);
        ctx.strokeStyle = `rgba(255,255,255,${intensity*0.15})`;
        ctx.lineWidth = 1;
        for (let i=0; i<5; i++) {
            const ox = race.player.x + (Math.random()-0.5)*40;
            const oy = race.player.y + (Math.random()-0.5)*40;
            ctx.beginPath();
            ctx.moveTo(ox, oy);
            ctx.lineTo(ox - Math.cos(race.player.angle)*20, oy - Math.sin(race.player.angle)*20);
            ctx.stroke();
        }
    }

    ctx.restore();

    // Minimap
    const mc = $('minimap-canvas').getContext('2d');
    const mw = 220, mh = 140;
    const sx = mw/canvas.width*0.85, sy = mh/canvas.height*0.85;
    const sc = Math.min(sx,sy);
    mc.clearRect(0,0,mw,mh);
    const all = [race.player, ...race.ai];
    all.forEach(c => {
        mc.fillStyle = c.isPlayer ? '#FFD700' : c.data.color;
        mc.beginPath(); mc.arc(c.x*sc+10, c.y*sc+10, c.isPlayer?4:2.5, 0, Math.PI*2); mc.fill();
    });
}

function endRace(allCars) {
    race.running = false;
    allCars.sort((a,b) => b.progress - a.progress);
    const pos = allCars.findIndex(c => c.isPlayer) + 1;
    const payout = PAYOUTS[pos-1] || 0;
    if (game.currency !== undefined) {
        game.currency += payout;
        game.rep = (game.rep||0) + Math.max(0, 12-pos);
        save();
    }
    let html = `<h2>Race Results</h2><div class="results-list">`;
    allCars.forEach((c,i) => {
        html += `<p class="${c.isPlayer?'highlight':''}">${i+1}. ${c.data.name}${c.damage>0.3?' 🔧':''}</p>`;
    });
    html += `</div><p style="text-align:center;font-size:1.2rem;margin-top:1rem;color:var(--green);font-family:'Orbitron'">+$${payout.toLocaleString()}</p>`;
    html += `<div class="modal-buttons"><button class="btn btn-primary" onclick="backToHub()"><span>Continue</span></button></div>`;
    showModal(html);
}
window.backToHub = () => { hideModal(); showScreen(screens.hub); renderHub(); };

// --- QUICK RACE ---
function quickRace() {
    game = { selectedId: 'ver', currency: 0, upgrades:{engine:-1,aero:-1,brakes:-1}, rep:0 };
    startRace('monza', 3);
}

// --- TRACK SELECT ---
function populateTracks() {
    const sel = $('track-select');
    sel.innerHTML = '';
    for (const id in TRACKS) {
        const opt = document.createElement('option');
        opt.value = id; opt.textContent = TRACKS[id].name;
        sel.appendChild(opt);
    }
}

// --- INIT ---
function init() {
    populateTracks();

    // Main menu
    $('career-mode-btn').onclick = () => initCareer(localStorage.getItem('uformula2026'));
    $('quick-race-btn').onclick = () => quickRace();
    $('back-to-menu-btn').onclick = () => showScreen(screens.menu);
    $('confirm-driver-btn').onclick = () => {
        if (!game.selectedId) return;
        const d = DRIVERS.find(dr => dr.id === game.selectedId);
        game = { selectedId: game.selectedId, selectedTeam: d.team, currency: 25000, upgrades:{engine:-1,aero:-1,brakes:-1}, rep:0, track:'monza' };
        save();
        showScreen(screens.hub); renderHub();
    };
    $('menu-from-hub-btn').onclick = () => showScreen(screens.menu);
    $('shop-btn').onclick = () => renderUpgradeShop();
    $('race-btn').onclick = () => {
        const trackId = $('track-select').value || 'monza';
        game.track = trackId;
        startRace(trackId, 3);
    };

    // Keyboard
    window.addEventListener('keydown', e => { if(race.keys) race.keys[e.key]=true; });
    window.addEventListener('keyup', e => { if(race.keys) race.keys[e.key]=false; });

    // Touch
    const bind = (el, key) => {
        if (!el) return;
        el.addEventListener('touchstart', e => { e.preventDefault(); if(race.keys) race.keys[key]=true; }, {passive:false});
        el.addEventListener('touchend', e => { e.preventDefault(); if(race.keys) race.keys[key]=false; }, {passive:false});
    };
    bind($('touch-gas'),'gas'); bind($('touch-brake'),'brake');
    bind($('touch-left'),'left'); bind($('touch-right'),'right');
    bind($('drs-btn'),'drs');

    // DRS button click
    $('drs-btn').addEventListener('mousedown', () => { if(race.keys) race.keys['drs']=true; });
    $('drs-btn').addEventListener('mouseup', () => { if(race.keys) race.keys['drs']=false; });

    showScreen(screens.menu);
}

init();
