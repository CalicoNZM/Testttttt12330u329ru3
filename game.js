// =============================================================================
// UFORMULA V2 — GAME ENGINE (Smooth Operator Edition)
// =============================================================================

let game = {}, race = {}, particles = [];
let userSettings = { keys: { gas:'ArrowUp', brake:'ArrowDown', left:'ArrowLeft', right:'ArrowRight', ovr:' ' }, use3D: false, useSepang: false, difficulty:'medium', sound:true, cameraZoom:1, showFPS:false };
try { const s = localStorage.getItem('uformula_settings'); if(s) { const parsed=JSON.parse(s); userSettings={...userSettings, ...parsed}; } } catch(e){}

function formatTime(ms) {
    if(!ms) return "--:--.---";
    const min = Math.floor(ms/60000), sec = Math.floor((ms%60000)/1000), milli = Math.floor(ms%1000);
    return min + ':' + sec.toString().padStart(2,'0') + '.' + milli.toString().padStart(3,'0');
}

function getCalendar() {
    if(userSettings.useSepang) return [...CALENDAR, { id:'sepang', name:'Malaysian GP', city:'Kuala Lumpur', laps:3, baseLap: 90000 }];
    return CALENDAR;
}

const $ = id => document.getElementById(id);
const screens = { 
    menu:$('main-menu-screen'), 
    startChoice:$('start-choice-screen'),
    onlineLobby:$('online-lobby-screen'),
    offlineLanding:$('offline-landing-screen'),
    typeChoice:$('career-type-screen'),
    choice:$('career-choice-screen'), 
    create:$('create-team-screen'), 
    selection:$('selection-screen'), 
    hub:$('career-hub-screen'), 
    race:$('race-screen') 
};
const hud = { pos:$('hud-pos'), lap:$('hud-lap'), time:$('hud-time'), speed:$('hud-speed'), prompt:$('race-prompt'), ovr:$('ovr-btn'), flag:$('flag-indicator'), dmgBar:$('damage-bar') };
const modal = { overlay:$('modal-overlay'), content:$('modal-content') };

let net = { peer:null, conn:null, isHost:false, players:[], myId:null, myName:'Driver' };
let joystick = { active: false, startX: 0, currentX: 0, value: 0 };

function showScreen(s) { Object.values(screens).forEach(el => el.classList.remove('active')); s.classList.add('active'); }
function showModal(html) { modal.content.innerHTML = html; modal.overlay.classList.remove('hidden'); }
function hideModal() { modal.overlay.classList.add('hidden'); }
window.hideModal = hideModal;
const sleep = ms => new Promise(r => setTimeout(r, ms));
function shadeColor(hex, amt) {
    let r=parseInt(hex.slice(1,3),16)+amt, g=parseInt(hex.slice(3,5),16)+amt, b=parseInt(hex.slice(5,7),16)+amt;
    return `rgb(${Math.max(0,Math.min(255,r))},${Math.max(0,Math.min(255,g))},${Math.max(0,Math.min(255,b))})`;
}

// --- SPLINE & TRACK ---
function generateSpline(layout) {
    const pts = [], detail = 12;
    for (let i = 0; i < layout.length; i++) {
        const p0=layout[(i-1+layout.length)%layout.length], p1=layout[i], p2=layout[(i+1)%layout.length], p3=layout[(i+2)%layout.length];
        for (let j = 0; j < detail; j++) {
            const t=j/detail, t2=t*t, t3=t2*t;
            pts.push({ x: 0.5*(p0.x*(-t3+2*t2-t)+p1.x*(3*t3-5*t2+2)+p2.x*(-3*t3+4*t2+t)+p3.x*(t3-t2)),
                        y: 0.5*(p0.y*(-t3+2*t2-t)+p1.y*(3*t3-5*t2+2)+p2.y*(-3*t3+4*t2+t)+p3.y*(t3-t2)) });
        }
    }
    for (let i = 0; i < pts.length; i++) {
        const a=pts[(i-5+pts.length)%pts.length], b=pts[i], c=pts[(i+5)%pts.length];
        let d = Math.atan2(c.y-b.y,c.x-b.x) - Math.atan2(b.y-a.y,b.x-a.x);
        while(d>Math.PI) d-=2*Math.PI; while(d<-Math.PI) d+=2*Math.PI;
        pts[i].curvature = Math.abs(d);
    }
    const path = new Path2D();
    path.moveTo(pts[0].x, pts[0].y);
    for (let i=1;i<pts.length;i++) path.lineTo(pts[i].x, pts[i].y);
    path.closePath();
    return { path, spline: pts };
}

function generateBillboards(spline) {
    const bbs = [], colors = ['#e10600','#3671C6','#FF8700','#27F4D2','#FFD700','#FF87BC','#229971','#C8AA00'];
    for (let i = 0; i < spline.length; i += 12) {
        const p=spline[i], n=spline[(i+1)%spline.length];
        const curv = p.curvature || 0;
        const ang = Math.atan2(n.y-p.y,n.x-p.x)+Math.PI/2;
        if (curv > 0.05) {
            bbs.push({ x:p.x+Math.cos(ang)*(PHYSICS.trackWidth/2+14), y:p.y+Math.sin(ang)*(PHYSICS.trackWidth/2+14), w:24, h:12, angle:ang+Math.PI/2, color:colors[i%colors.length], hit:false });
            bbs.push({ x:p.x-Math.cos(ang)*(PHYSICS.trackWidth/2+14), y:p.y-Math.sin(ang)*(PHYSICS.trackWidth/2+14), w:24, h:12, angle:ang+Math.PI/2, color:colors[(i+1)%colors.length], hit:false });
        } else if (i % 60 === 0 && Math.random() > 0.2) {
            const side = Math.random()>0.5?1:-1;
            bbs.push({ x:p.x+Math.cos(ang)*(PHYSICS.trackWidth/2+20+Math.random()*25)*side, y:p.y+Math.sin(ang)*(PHYSICS.trackWidth/2+20+Math.random()*25)*side, w:30+Math.random()*18, h:10, angle:ang+Math.PI/2, color:colors[Math.floor(Math.random()*colors.length)], hit:false });
        }
    }
    return bbs;
}


// --- PARTICLES ---
function spawnDebris(x,y,color,n) { for(let i=0;i<n;i++) particles.push({x,y,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5,life:35+Math.random()*25,color,size:1+Math.random()*2.5}); }
function drawParticles(ctx) {
    for(let i=particles.length-1;i>=0;i--) { const p=particles[i]; p.x+=p.vx;p.y+=p.vy;p.vx*=.96;p.vy*=.96;p.life--;
        if(p.life<=0){particles.splice(i,1);continue;} ctx.globalAlpha=p.life/50; ctx.fillStyle=p.color; ctx.fillRect(p.x,p.y,p.size,p.size); }
    ctx.globalAlpha=1;
}

// --- CAR DRAWING ---
function drawCar(ctx, car, isPlayer) {
    if(car.dnf && Math.random()>0.4) spawnDebris(car.x, car.y, '#555', 2);
    const dmg = car.damage||0;
    ctx.save(); ctx.translate(car.x,car.y); ctx.rotate(car.angle+Math.PI/2);
    const c=car.data.color, dark=shadeColor(c,-40), L=14, W=6;
    ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(1,1,W+1,L+1,0,0,Math.PI*2); ctx.fill();
    if(dmg<0.8){ctx.fillStyle=dark;ctx.fillRect(-W-1,L-4,2,6);ctx.fillRect(W-1,L-4,2,6);ctx.fillStyle=c;ctx.fillRect(-W-1,L+1,W*2+2,2);}
    ctx.fillStyle=c; ctx.beginPath(); ctx.moveTo(-W+1,L-2);ctx.lineTo(-W,L-6);ctx.lineTo(-W+1,-L+6);ctx.lineTo(-2,-L);ctx.lineTo(2,-L);ctx.lineTo(W-1,-L+6);ctx.lineTo(W,L-6);ctx.lineTo(W-1,L-2); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#1a1a1a'; ctx.beginPath(); ctx.ellipse(0,-2,3,4,0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#aaa';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,-4,2.5,Math.PI*0.8,Math.PI*2.2);ctx.stroke();
    if(dmg<0.6){ctx.fillStyle=dark;ctx.fillRect(-W-.5,-2,2,8);ctx.fillRect(W-1.5,-2,2,8);}
    if(dmg<0.4){ctx.fillStyle=c;ctx.fillRect(-W-2,-L+1,W*2+4,2);ctx.fillStyle=dark;ctx.fillRect(-W-2,-L-1,2,3);ctx.fillRect(W,-L-1,2,3);}
    ctx.fillStyle='#222'; ctx.fillRect(-W-2,-L+6,2,4);ctx.fillRect(W,-L+6,2,4);ctx.fillRect(-W-2,L-8,2,4);ctx.fillRect(W,L-8,2,4);
    if(dmg>0.2){ctx.strokeStyle=`rgba(255,80,0,${dmg*.6})`;ctx.lineWidth=.8;for(let i=0;i<Math.floor(dmg*6);i++){const sx=(Math.sin(i*73)*.5)*W*2-W,sy=(Math.cos(i*47)*.5)*L*2-L;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+Math.sin(i*31)*4,sy+Math.cos(i*19)*4);ctx.stroke();}}
    if(isPlayer){ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(0,-L-2,2.5,0,Math.PI*2);ctx.fill();}
    if(car.ovrActive){ctx.fillStyle='#3b82f6';ctx.fillRect(-W+2,L,W*2-4,2);}
    ctx.restore();
}

// --- CAREER SYSTEM ---
function getDrivers() { return game.drivers || DRIVERS; }
function getPlayerStats(d) {
    const eb=game.upgrades.engine>=0?UPGRADE_TIERS.engine[game.upgrades.engine].bonus:0;
    const ab=game.upgrades.aero>=0?UPGRADE_TIERS.aero[game.upgrades.aero].bonus:0;
    const bb=game.upgrades.brakes>=0?UPGRADE_TIERS.brakes[game.upgrades.brakes].bonus:0;
    return {pac:Math.min(100,d.pac+eb),rac:Math.min(100,d.rac+ab),awa:Math.min(100,d.awa+bb),exp:d.exp};
}
function save() { localStorage.setItem('uformula2026v2', JSON.stringify(game)); }
function statBar(label,base,total) {
    const b=total-base;
    return `<div class="stat-row"><label><span>${label}</span><span>${total}${b>0?` <span style="color:var(--green)">(+${b})</span>`:''}</span></label><div class="stat-bar"><div class="stat-fill" style="width:${base}%"></div>${b>0?`<div class="stat-upgrade" style="width:${b}%"></div>`:''}</div></div>`;
}

function initNewGame(selectedId, drivers) {
    const p = drivers.find(d => d.id === selectedId);
    game = { 
        selectedId, 
        drivers: JSON.parse(JSON.stringify(drivers)), 
        playerDriver: p,
        teamDrivers: (game.careerMode === 'champ') ? drivers.filter(d => d.team === p.team) : [p],
        currency:25000, 
        upgrades:{engine:0,aero:0,brakes:0}, 
        rep:0, round:0, standings:{},
        careerMode: game.careerMode || 'player'
    };
    drivers.forEach(dr => game.standings[dr.id] = 0);
    save(); showScreen(screens.hub); renderHub();
}

function renderSelection() { renderDriverGrid(); }

function renderHub() {
    const drivers = getDrivers();
    const d = drivers.find(dr => dr.id === game.selectedId);
    if (!d) return;
    const stats = getPlayerStats(d);
    const round = game.round || 0;
    const cal = getCalendar();
    const race = cal[Math.min(round, cal.length-1)];
    $('currency-display').textContent = `$${game.currency.toLocaleString()}`;
    $('season-info').textContent = `Round ${round+1} of ${cal.length} — ${race.city}`;
    
    // Hub Panels
    $('hub-driver-panel').innerHTML = `
        <div class="panel-header"><h3>DRIVER</h3></div>
        <p style="font-size:1.4rem; font-weight:900; color:${d.color}">${d.name}</p>
        <p class="text-muted" style="margin-bottom:1rem">${d.team}</p>
        <div class="stat-row"><label>PACE <span>${d.pac}</span></label><div class="stat-bar"><div class="stat-fill" style="width:${d.pac}%"></div></div></div>
        <div class="stat-row"><label>RACECRAFT <span>${d.rac}</span></label><div class="stat-bar"><div class="stat-fill" style="width:${d.rac}%"></div></div></div>
        <div class="stat-row"><label>AWARENESS <span>${d.awa}</span></label><div class="stat-bar"><div class="stat-fill" style="width:${d.awa}%"></div></div></div>
        <div class="ovr-big" style="text-align:center; margin-top:1rem; font-size:2.5rem; font-weight:900">${d.ovr}</div>
        ${game.careerMode==='player'?`<button class="btn btn-accent btn-small" style="width:100%; margin-top:1rem" onclick="simulateTraining()"><span>Sim Training</span></button>`:''}
    `;

    $('hub-car-panel').innerHTML = `
        <div class="panel-header"><h3>TEAM & TECH</h3></div>
        <p style="font-weight:700">Team Strategy: <span class="accent">${game.careerMode==='champ'?'Manager':'Contract'}</span></p>
        <div style="margin-top:1rem">
            ${game.careerMode==='champ' ? `
                <p class="text-muted" style="margin-bottom:0.8rem">Select race driver:</p>
                <div style="display:flex; flex-direction:column; gap:0.5rem">
                    ${game.teamDrivers.map((td,i) => `<button class="btn ${game.selectedId===td.id?'btn-primary':'btn-secondary'} btn-small" onclick="pickChampDriver(${i})"><span>${td.name}</span></button>`).join('')}
                </div>
                <button class="btn btn-green btn-small" style="width:100%; margin-top:1rem" onclick="showPromoteF2()"><span>↑ Promote F2 Driver</span></button>
            ` : `
                <p class="text-muted">Season Objective: Championship Win</p>
                <button class="btn btn-secondary btn-small" style="width:100%; margin-top:1rem" onclick="checkContracts()"><span>Check Contracts</span></button>
            `}
        </div>
    `;
}

function pickChampDriver(idx) {
    if(game.careerMode !== 'champ') return;
    game.selectedId = game.teamDrivers[idx].id;
    save(); renderHub();
}

function renderDriverGrid() {
    const grid = $('driver-grid');
    grid.innerHTML = DRIVERS.map(d => `<div class="driver-card" data-id="${d.id}"><div class="card-top"><span class="name">${d.name}</span><span class="ovr" style="color:${d.color}">${d.ovr}</span></div><div class="team">${d.team}</div></div>`).join('');
    grid.querySelectorAll('.driver-card').forEach(card => { card.onclick = () => { grid.querySelectorAll('.driver-card').forEach(c=>c.classList.remove('selected')); card.classList.add('selected'); game.tempSelect=card.dataset.id; $('confirm-driver-btn').disabled=false; }; });
}

function renderStandings() {
    const drivers = getDrivers();
    const sorted = drivers.slice().sort((a,b) => (game.standings[b.id]||0) - (game.standings[a.id]||0));
    let html = `<h2>Championship Standings</h2><table class="standings-table"><thead><tr><th>Pos</th><th>Driver</th><th>Team</th><th>Pts</th></tr></thead><tbody>`;
    sorted.forEach((d,i) => { const hl = d.id===game.selectedId?'highlight':''; html += `<tr class="${hl}"><td>${i+1}</td><td>${d.name}</td><td>${d.team}</td><td>${game.standings[d.id]||0}</td></tr>`; });
    html += `</tbody></table><div class="modal-buttons"><button class="btn btn-secondary" onclick="hideModal()"><span>Close</span></button></div>`;
    showModal(html);
}

function renderUpgradeShop() {
    let html = '<h2>Upgrades</h2><div class="upgrade-grid">';
    for (const type in UPGRADE_TIERS) {
        html += `<div class="upgrade-col"><h3>${type}</h3>`;
        UPGRADE_TIERS[type].forEach((t,i) => {
            const lvl = game.upgrades[type];
            if (lvl>=i) html += `<button class="btn btn-green btn-small" disabled><span>T${i+1} ✓</span></button>`;
            else if (lvl===i-1) { const ok=game.currency>=t.cost; html+=`<button class="btn ${ok?'btn-accent':'btn-secondary'} btn-small" ${ok?`onclick="buyUpgrade('${type}',${i},${t.cost})"`:' disabled'}><span>T${i+1} $${(t.cost/1000).toFixed(0)}k</span></button>`; }
            else html += `<button class="btn btn-secondary btn-small" disabled><span>T${i+1} 🔒</span></button>`;
        }); html += '</div>';
    }
    html += '</div><div class="modal-buttons"><button class="btn btn-secondary" onclick="hideModal()"><span>Close</span></button></div>';
    showModal(html);
}
window.buyUpgrade = (type,lvl,cost) => { game.currency-=cost; game.upgrades[type]=lvl; save(); renderHub(); renderUpgradeShop(); };

// --- CREATE TEAM ---
let allocPts = { total:10, pac:75, rac:75, awa:75 };
function setupCreateTeam() {
    allocPts = {total:10,pac:75,rac:75,awa:75};
    updateAllocUI();
    document.querySelectorAll('.alloc-btn').forEach(btn => {
        btn.onclick = () => {
            const stat=btn.dataset.stat, dir=parseInt(btn.dataset.dir);
            if(dir>0 && allocPts.total>0 && allocPts[stat]<90){allocPts[stat]++;allocPts.total--;}
            if(dir<0 && allocPts[stat]>65){allocPts[stat]--;allocPts.total++;}
            updateAllocUI();
        };
    });
}
function updateAllocUI() {
    ['pac','rac','awa'].forEach(s => $(`alloc-${s}`).textContent = allocPts[s]);
    $('points-left').textContent = `(${allocPts.total} pts remaining)`;
}
function confirmCreateTeam() {
    const dName=$('input-driver-name').value.trim(), tName=$('input-team-name').value.trim(), tColor=$('input-team-color').value;
    if(!dName||!tName){showModal('<h2>Error</h2><p style="text-align:center">Please fill in all fields.</p><div class="modal-buttons"><button class="btn btn-secondary" onclick="hideModal()"><span>OK</span></button></div>');return;}
    const drivers = JSON.parse(JSON.stringify(DRIVERS));
    const ovr = Math.round((allocPts.pac+allocPts.rac+allocPts.awa+70)/4);
    const player = {id:'player',name:dName,team:tName,color:tColor,pac:allocPts.pac,rac:allocPts.rac,awa:allocPts.awa,exp:70,ovr};
    const mate = {id:'teammate',name:'Reserve Driver',team:tName,color:tColor,pac:72,rac:70,awa:71,exp:65,ovr:70};
    // Remove last two drivers (Cadillac stays, replace Haas)
    const filtered = drivers.filter(d => d.team !== 'Haas');
    filtered.push(player, mate);
    initNewGame('player', filtered);
}

function simulateTraining() {
    if(game.careerMode !== 'player') return;
    const stats = ['pac', 'rac', 'awa'];
    const s = stats[Math.floor(Math.random()*stats.length)];
    game.playerDriver[s] = Math.min(99, (game.playerDriver[s]||70) + 1);
    game.playerDriver.ovr = Math.round((game.playerDriver.pac + game.playerDriver.rac + game.playerDriver.awa + (game.playerDriver.exp||70))/4);
    alert(`Training Complete! ${s.toUpperCase()} increased!`);
    renderHub();
    save();
}

function checkContracts() {
    if(game.careerMode !== 'player') return;
    if(game.round % 4 === 0) {
        const betterTeam = DRIVERS.find(d => d.ovr > game.playerDriver.ovr + 5);
        if(betterTeam && confirm(`Offer from ${betterTeam.team}! Do you want to switch teams?`)) {
            game.playerDriver.team = betterTeam.team;
            game.playerDriver.color = betterTeam.color;
            renderHub();
            save();
        }
    }
}

// --- RACE ENGINE ---
function createCar(driverData, isPlayer) {
    const s = isPlayer ? getPlayerStats(driverData) : driverData;
    const P = PHYSICS;
    return {
        data:driverData, isPlayer, x:0, y:0, speed:0, angle:0, steerAngle:0,
        lap:0, progress:0, position:0, targetIdx:1, lastTargetIdx:0, highestIdx:0,
        ovrAvailable:false, ovrActive:false, timeBehind:0,
        lastPos:{x:0,y:0}, offTimer:0, penalties:0, damage:0, isSpun:false, dnf:false,
        isPitting:false, pitTimer:0, isPittingNextLap:false,
        grip:1.0, slideAngle:0,
        topSpeed: P.baseTopSpeed + (s.pac/100)*P.paceFactor,
        accel: P.baseAccel + (s.pac/100)*P.accelFactor,
        handling: P.baseHandling + (s.rac/100)*P.handleFactor,
        awareness: (s.awa||80)/100,
    };
}

function pickChampDriver(idx) {
    if(game.careerMode !== 'champ' || !game.teamDrivers) return;
    game.playerDriver = game.teamDrivers[idx];
    alert(`Active Driver: ${game.playerDriver.name}`);
    renderHub();
    save();
}

function setupCanvas() {
    const container = screens.race, canvas=$('race-canvas');
    const hudH = $('race-hud').offsetHeight;
    const h=container.clientHeight-hudH, w=container.clientWidth;
    const ratio=16/9; let cw=w,ch=cw/ratio;
    if(ch>h){ch=h;cw=ch*ratio;}
    canvas.width=cw; canvas.height=ch; canvas.style.marginTop=hudH+'px';
    if(window.resize3D) window.resize3D(cw, ch, hudH);
}

function openSettings() {
    if(race.running) race.isPaused = true;
    let html = `<h2>Settings & Controls</h2><div class="settings-grid">`;
    for(const [act, key] of Object.entries(userSettings.keys)) {
        html += `<div class="settings-row"><span style="text-transform:uppercase">${act}</span><kbd id="bind-${act}" onclick="rebindKey('${act}')">${key===' '?'SPACE':key}</kbd></div>`;
    }
    html += `</div>
        <div style="margin-top:1rem; display:flex; flex-direction:column; gap:0.5rem">
            <label style="display:flex; justify-content:space-between; align-items:center; background:#111; padding:0.75rem; border:2px solid #fff">
                <span style="font-size:0.9rem; font-weight:900">ENABLE 3D RACING</span>
                <input type="checkbox" id="toggle-3d" ${userSettings.use3D ? 'checked' : ''} onchange="toggleSetting('use3D', this.checked)">
            </label>
            <label style="display:flex; justify-content:space-between; align-items:center; background:#111; padding:0.75rem; border:2px solid #fff">
                <span style="font-size:0.9rem; font-weight:900">DIFFICULTY</span>
                <select style="background:#000; color:#fff; border:2px solid #fff; padding:0.3rem 0.5rem; font-family:'Orbitron',sans-serif; font-size:0.75rem" onchange="toggleSetting('difficulty', this.value)">
                    <option value="easy" ${userSettings.difficulty==='easy'?'selected':''}>EASY</option>
                    <option value="medium" ${userSettings.difficulty==='medium'?'selected':''}>MEDIUM</option>
                    <option value="hard" ${userSettings.difficulty==='hard'?'selected':''}>HARD</option>
                </select>
            </label>
            <label style="display:flex; justify-content:space-between; align-items:center; background:#111; padding:0.75rem; border:2px solid #fff">
                <span style="font-size:0.9rem; font-weight:900">SOUND</span>
                <input type="checkbox" ${userSettings.sound ? 'checked' : ''} onchange="toggleSetting('sound', this.checked)">
            </label>
            <label style="display:flex; justify-content:space-between; align-items:center; background:#111; padding:0.75rem; border:2px solid #fff">
                <span style="font-size:0.9rem; font-weight:900">CAM ZOOM</span>
                <input type="range" min="0.6" max="1.5" step="0.1" value="${userSettings.cameraZoom}" style="width:100px" onchange="toggleSetting('cameraZoom', parseFloat(this.value))">
            </label>
            <label style="display:flex; justify-content:space-between; align-items:center; background:#111; padding:0.75rem; border:2px solid #fff">
                <span style="font-size:0.9rem; font-weight:900">SHOW FPS</span>
                <input type="checkbox" ${userSettings.showFPS ? 'checked' : ''} onchange="toggleSetting('showFPS', this.checked)">
            </label>
        </div>
        <div class="modal-buttons" style="flex-direction:column; gap:0.5rem">
            <button class="btn btn-primary" style="width:100%" onclick="closeSettings()"><span>Resume</span></button>
            <button class="btn btn-secondary btn-small" style="width:100%; opacity:0.6" onclick="resetCareer()"><span>Wipe Career Data</span></button>
        </div>`;
    showModal(html);
}
window.toggleSetting = (key, val) => {
    userSettings[key] = val;
    localStorage.setItem('uformula_settings', JSON.stringify(userSettings));
};
window.resetCareer = () => { if(confirm("Permanently wipe all career data?")) { localStorage.removeItem('uformula2026v2'); location.reload(); } };
function closeSettings() {
    hideModal();
    if(race.running) {
        race.isPaused = false;
        race.lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }
}
window.openSettings = openSettings;
window.closeSettings = closeSettings;

async function startRaceWeekend() {
    const round = game.round||0;
    const calList = getCalendar();
    if (round >= calList.length) {
        showModal(`<h2>Season Complete!</h2><p style="text-align:center;margin:1rem 0">Congratulations on completing the 2026 season!</p><div class="modal-buttons"><button class="btn btn-primary" onclick="hideModal();showScreen(screens.hub)"><span>View Standings</span></button></div>`);
        window.showScreen = showScreen; return;
    }
    const cal = calList[round];
    showModal(`<h2>${cal.name}</h2><p style="text-align:center" class="text-muted">${cal.city} — Round ${round+1} of ${calList.length}</p><p style="text-align:center;margin:1rem 0;font-weight:bold;color:var(--blue)">Free Practice 1 (FP1)</p><div class="modal-buttons"><button class="btn btn-primary" onclick="hideModal();runSession('${cal.id}','practice',2)"><span>Start FP1</span></button><button class="btn btn-secondary" onclick="hideModal();runSession('${cal.id}','quali',1)"><span>Skip Practice</span></button></div>`);
    window.runSession = runSession;
}

async function runSession(trackId, phase, laps, grid=null) {
    showScreen(screens.race); setupCanvas();
    const canvas=$('race-canvas');
    const {points,virtualW,virtualH} = trackGen(trackId, canvas.width, canvas.height);
    const {path,spline} = generateSpline(points);
    const p1=spline[0],p2=spline[1];
    const fa=Math.atan2(p2.y-p1.y,p2.x-p1.x)+Math.PI/2, hw=PHYSICS.trackWidth/2;

    race = {
        running:false, isPaused:false, phase, laps, trackId, path, spline, virtualW, virtualH,
        billboards:generateBillboards(spline),
        finishLine:{x1:p1.x-hw*Math.cos(fa),y1:p1.y-hw*Math.sin(fa),x2:p1.x+hw*Math.cos(fa),y2:p1.y+hw*Math.sin(fa)},
        ovrZone:{det:spline.length-120,start:spline.length-80,end:40},
        keys:{},camera:{x:0,y:0},flag:{status:'green',dur:0},
        player:null,ai:[],startTime:0,lapStart:0,grid,lastTime:0
    };

    const drivers = getDrivers();
    const playerData = drivers.find(d=>d.id===game.selectedId);
    race.player = createCar(playerData, true);

    if (phase === 'practice') {
        race.ai = [];
        race.player.x = p1.x; race.player.y = p1.y; race.player.angle = Math.atan2(p2.y-p1.y,p2.x-p1.x);
    } else {
        race.ai = drivers.filter(d=>d.id!==game.selectedId).map(d=>createCar(d,false));
        const allCars = [race.player,...race.ai];
        const sa = Math.atan2(p2.y-p1.y,p2.x-p1.x), pa=sa+Math.PI/2;
        if (phase === 'race' && grid) {
            grid.forEach((entry,i) => {
                const car = allCars.find(c=>c.data.id===entry.id);
                if(car){ car.x=p1.x-Math.cos(sa)*Math.floor(i/2)*44+Math.cos(pa)*(i%2?26:-26); car.y=p1.y-Math.sin(sa)*Math.floor(i/2)*44+Math.sin(pa)*(i%2?26:-26); car.angle=sa; }
            });
        } else {
            allCars.forEach((car,i)=>{ car.x=p1.x-Math.cos(sa)*Math.floor(i/2)*44+Math.cos(pa)*(i%2?26:-26); car.y=p1.y-Math.sin(sa)*Math.floor(i/2)*44+Math.sin(pa)*(i%2?26:-26); car.angle=sa; });
        }
    }

    if(window.init3D) window.init3D(race, canvas.width, canvas.height, $('race-hud').offsetHeight);

    particles=[];
    hud.prompt.textContent = phase==='race'?'RACE START':phase.toUpperCase(); await sleep(1500);
    hud.prompt.textContent='3'; await sleep(800);
    hud.prompt.textContent='2'; await sleep(800);
    hud.prompt.textContent='1'; await sleep(800);
    hud.prompt.textContent='GO!';
    race.running=true; race.startTime=performance.now(); race.lapStart=race.startTime; race.lastTime=race.startTime;
    requestAnimationFrame(gameLoop);
    await sleep(1500); hud.prompt.textContent='';
}

function gameLoop(ts) {
    if(!race.running) return;
    if(!race.isPaused) {
        race.lastTime = ts;
        update(ts);
        render();
        if(window.syncMultiplayerOutbound) syncMultiplayerOutbound();
        if(race.player.lap > race.laps) { 
            if(race.phase==='practice') finishPractice();
            else if(race.phase==='quali') finishQualifying(); 
            else finishRace(); 
            return; 
        }
    }
    requestAnimationFrame(gameLoop);
}

function finishPractice() {
    race.running = false;
    const pTime = performance.now() - race.startTime;
    game.rep = (game.rep||0) + 5;
    save();
    let html = `<h2>FP1 Complete</h2><p style="text-align:center;margin:1rem 0">Best Lap: ${formatTime(pTime/race.laps)}</p>`;
    html += `<p style="text-align:center;color:var(--green)">+5 Reputation</p>`;
    html += `<div class="modal-buttons"><button class="btn btn-primary" onclick="hideModal();runSession('${race.trackId}','quali',1)"><span>Start Qualifying</span></button></div>`;
    showModal(html);
}

function finishQualifying() {
    race.running = false;
    const drivers = getDrivers();
    const trackBase = getCalendar()[game.round||0].baseLap || 80000;
    const pTime = performance.now() - race.startTime;
    
    const grid = drivers.map(d => {
        const aiTime = trackBase + (100-d.pac)*150 + (100-d.exp)*20 + (Math.random()-.5)*300;
        return { id:d.id, time: d.id===game.selectedId ? pTime : aiTime };
    });
    grid.sort((a,b)=>a.time-b.time);

    const pPos = grid.findIndex(g=>g.id===game.selectedId)+1;
    let html = `<h2>Qualifying Results</h2><div class="results-list">`;
    grid.forEach((g,i)=>{ const d=drivers.find(dr=>dr.id===g.id); html+=`<p class="${g.id===game.selectedId?'highlight':''}">${i+1}. ${d.name} <span style="float:right;color:var(--muted)">${formatTime(g.time)}</span></p>`; });
    html += `</div><p style="text-align:center;font-size:1.1rem;margin-top:1rem;color:var(--green)">You qualified P${pPos}!</p>`;
    const raceLaps = getCalendar()[game.round||0].laps;
    html += `<div class="modal-buttons"><button class="btn btn-primary" onclick="hideModal();runSession('${race.trackId}','race',${raceLaps},qualiGrid)"><span>To Grid</span></button></div>`;
    window.qualiGrid = grid;
    showModal(html);
}

function finishRace() {
    race.running = false;
    const all = [race.player,...race.ai].sort((a,b) => {
        if(a.dnf && !b.dnf) return 1; if(b.dnf && !a.dnf) return -1;
        const aProg = a.progress - (a.penalties||0)*0.0125;
        const bProg = b.progress - (b.penalties||0)*0.0125;
        return bProg - aProg;
    });
    const pos = all.findIndex(c=>c.isPlayer)+1;
    const payout = PAYOUTS[pos-1]||0;
    const pts = POINTS_SYSTEM[pos-1]||0;
    
    game.currency += payout;
    if(game.careerMode === 'player') {
        game.playerDriver.exp = (game.playerDriver.exp||70) + Math.max(1, 4 - Math.floor(pos/4));
    }
    
    // Update Championship Standings
    all.forEach((car, i) => {
        const p = POINTS_SYSTEM[i] || 0;
        game.standings[car.data.id] = (game.standings[car.data.id] || 0) + p;
    });

    let html = `<h2>Race Finished!</h2><div class="results-list">`;
    all.forEach((c,i) => { 
        const penStr = (c.penalties||0)>0 ? ` <span style="color:#ef4444">+${c.penalties.toFixed(1)}s</span>` : '';
        html += `<p class="${c.isPlayer?'highlight':''}">${i+1}. ${c.data.name} ${c.dnf?'(DNF)':''} ${penStr}</p>`; 
    });
    html += `</div><p style="text-align:center;font-size:1.1rem;margin-top:1rem;color:var(--green)">P${pos} | +$${payout.toLocaleString()} | +${pts} pts</p>`;
    html += `<div class="modal-buttons"><button class="btn btn-primary" onclick="advanceSeasonFromRace()"><span>Return to Hub</span></button></div>`;
    window.advanceSeasonFromRace = () => {
        game.round++;
        const cal = getCalendar();
        if(game.round >= cal.length && game.careerMode !== 'quick') {
            // Season over! Trigger transfers
            const transfers = simulateTransfers();
            game.round = 0;
            Object.keys(game.standings).forEach(k => game.standings[k] = 0);
            save(); hideModal();
            let tHtml = `<h2>Season Over — Driver Market</h2><div style="max-height:250px; overflow-y:auto; margin:1rem 0">`;
            if(transfers && transfers.length > 0) transfers.forEach(t => tHtml += `<p style="padding:0.3rem 0; border-bottom:1px solid #333">${t}</p>`);
            else tHtml += `<p class="text-muted">No transfers this off-season.</p>`;
            tHtml += `</div><div class="modal-buttons"><button class="btn btn-primary" onclick="hideModal();showScreen(screens.hub);renderHub()"><span>Start New Season</span></button></div>`;
            showModal(tHtml);
        } else {
            save(); hideModal(); showScreen(screens.hub); renderHub();
        }
    };
    showModal(html);
}


// --- UPDATE LOOP ---
function update(ts) {
    if(race.flag.dur>0){race.flag.dur--;if(race.flag.dur<=0){race.flag.status='green';hud.flag.className='';hud.flag.style.display='none';}}
    const all=[race.player,...race.ai];
    all.sort((a,b)=>b.progress-a.progress);
    all.forEach((c,i)=>{c.position=i+1;c.timeBehind=i>0?(all[i-1].progress-c.progress)*.5:0;});
    all.forEach(c=>updateCar(c,ts));
    checkCollisions(all);
    checkBillboardHits(all);
    hud.pos.textContent=`${race.player.position}/${all.length}`;
    hud.lap.textContent=`${Math.max(1,Math.min(race.player.lap,race.laps))}/${race.laps}`;
    hud.speed.textContent=Math.round(race.player.speed*55);
    hud.time.textContent=formatTime(ts-race.lapStart);
    if($('hud-penalties')) $('hud-penalties').textContent = race.player.penalties > 0 ? `+${race.player.penalties.toFixed(1)}s` : '';
    if($('pit-btn')) $('pit-btn').classList.toggle('available', race.phase !== 'quali');
    const dp=Math.max(0,1-race.player.damage);
    hud.dmgBar.style.width=(dp*100)+'%';
    hud.dmgBar.style.background=dp>.6?'var(--green)':dp>.3?'#eab308':'var(--accent)';
    
    if($('ovr-btn')) $('ovr-btn').className='hud-action-btn'+(race.player.ovrActive?' active':race.player.ovrAvailable?' available':'');
}

function updateCar(car, ts) {
    if(car.dnf) { car.speed = 0; return; }
    if(car.isMultiplayerOpponent) return;
    car.lastPos={x:car.x,y:car.y};
    
    if(car.isPitting) {
        car.speed = car.topSpeed * 0.25; 
        car.steerAngle = 0;
        car.pitTimer--;
        if(car.pitTimer <= 0) {
            car.isPitting = false; car.damage = 0;
            if(car.isPlayer) { hud.prompt.textContent = 'GO GO GO'; setTimeout(()=>hud.prompt.textContent='',1000); }
        }
        car.targetIdx = car.targetIdx||0;
        const sp=race.spline;
        const ta=Math.atan2(sp[(car.targetIdx+5)%sp.length].y-car.y, sp[(car.targetIdx+5)%sp.length].x-car.x);
        car.angle = ta; car.x += Math.cos(car.angle)*car.speed; car.y += Math.sin(car.angle)*car.speed;
        car.progress = Math.max(car.lap, car.lap + car.targetIdx/sp.length);
        return;
    }

    let throttle=0,brake=0,steerInput=0;
    const sp=race.spline;

    // Find nearest spline point (for all cars)
    let best=Infinity,bi=car.targetIdx;
    for(let i=0;i<sp.length;i++){const d=Math.hypot(sp[i].x-car.x,sp[i].y-car.y);if(d<best){best=d;bi=i;}}
    car.targetIdx=bi;

    if(car.isPlayer) {
        const k=race.keys, s=userSettings.keys;
        if(k[s.gas]||k['ArrowUp']||k['w']) throttle=1;
        if(k[s.brake]||k['ArrowDown']||k['s']) brake=1;
        if(k['steering'] !== undefined) steerInput = k['steering'];
        else {
            if(k[s.left]||k['ArrowLeft']||k['a']) steerInput=-1;
            if(k[s.right]||k['ArrowRight']||k['d']) steerInput=1;
        }
    } else {
        if(car.damage > 0.45 && race.laps - car.lap > 1 && !car.isPittingNextLap) car.isPittingNextLap = true;
        // AI with adaptive lookahead
        const look=Math.max(15,Math.min(40,Math.round(car.speed*9)));
        const ti=(bi+look)%sp.length;
        const ta=Math.atan2(sp[ti].y-car.y,sp[ti].x-car.x);
        let ad=ta-car.angle; while(ad>Math.PI)ad-=2*Math.PI;while(ad<-Math.PI)ad+=2*Math.PI;
        steerInput=Math.max(-1,Math.min(1,ad*2.2));
        // Corner braking (Aggressive)
        const cl=Math.round(18+car.awareness*12), ci=(bi+cl)%sp.length;
        const ts2=car.topSpeed*Math.max(0.35,1-sp[ci].curvature*(1.2+car.awareness*.3));
        if(car.speed>ts2*1.02){throttle=0;brake=Math.min(1,(car.speed-ts2)*.35);}
        else throttle=Math.min(1,.85+car.awareness*.2);
        // Collision avoidance
        const allC=[race.player,...race.ai];
        for(const o of allC){if(o===car)continue;const dx=o.x-car.x,dy=o.y-car.y,dist=Math.hypot(dx,dy);
            if(dist<45&&dist>0){const aa=Math.atan2(dy,dx);let dd=aa-car.angle;while(dd>Math.PI)dd-=2*Math.PI;while(dd<-Math.PI)dd+=2*Math.PI;
                if(Math.abs(dd)<Math.PI/3){steerInput-=Math.sign(dd)*.3*(1-dist/45);if(dist<28)throttle*=.8;}}}
        if(race.flag.status==='yellow') throttle*=.55;
        steerInput=Math.max(-1,Math.min(1,steerInput));
    }

    // SMOOTH STEERING (momentum-based)
    car.steerAngle += (steerInput - car.steerAngle) * PHYSICS.steerSmoothing;
    const sr = car.speed/car.topSpeed;
    // Speed-dependent steering: faster = less responsive
    const steerFactor = car.handling * (1 - sr*0.7) * (1 + (1-sr)*0.3);
    if(car.speed>0.1 && !car.isSpun) car.angle += car.steerAngle * steerFactor;

    // PROGRESSIVE ACCELERATION & BRAKING
    const effTop = car.topSpeed*(1-car.damage*.4);
    const ovrBoost = car.ovrActive?PHYSICS.ovrBonus:1;
    const pen = (car.penalty||0)>0?.25:1;
    const accelCurve = car.accel * (1 + (1-sr)*0.5); // Faster accel at low speed
    car.speed += accelCurve * throttle * ovrBoost * pen;
    car.speed *= (1 - PHYSICS.brakePower*brake); // Progressive braking
    car.speed *= PHYSICS.drag;
    // Grip model: hard steering at speed costs more
    const gripCost = Math.abs(car.steerAngle) * sr * PHYSICS.tyreScrub;
    car.speed *= (1 - gripCost);
    car.speed = Math.max(0, Math.min(effTop*ovrBoost, car.speed));
    car.x += Math.cos(car.angle)*car.speed;
    car.y += Math.sin(car.angle)*car.speed;

    // OVR (Manual Override Mode)
    const inOVR = car.targetIdx>=race.ovrZone.start || car.targetIdx<=race.ovrZone.end;
    if(car.targetIdx===race.ovrZone.det) car.ovrAvailable=car.timeBehind<0.8&&car.position>1;
    if(!inOVR||brake>0) car.ovrActive=false;
    if(car.isPlayer&&(race.keys[userSettings.keys.ovr]||race.keys['ovr']||race.keys[' '])&&inOVR&&car.ovrAvailable) car.ovrActive=true;
    else if(!car.isPlayer&&inOVR&&car.ovrAvailable) car.ovrActive=true;

    // Track limits (Radius-based)
    if(best > PHYSICS.trackWidth / 2){
        car.speed*=PHYSICS.offTrackGrip; 
        car.offTimer=(car.offTimer||0)+1;
        if(car.offTimer>60){
            car.penalties = (car.penalties||0)+0.5;
            car.offTimer=0;
            if(car.isPlayer){
                hud.prompt.textContent='TRACK LIMITS!';
                setTimeout(()=>hud.prompt.textContent='',1500);
            }
        }
    } else car.offTimer=0;

    checkLap(car,ts);
    car.progress = Math.max(car.lap, car.lap + car.targetIdx/sp.length);
}

function checkCollisions(cars) {
    for(let i=0;i<cars.length;i++) for(let j=i+1;j<cars.length;j++) {
        const a=cars[i],b=cars[j];
        if(a.dnf||b.dnf)continue;
        const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
        if(d<PHYSICS.collisionRadius){
            const sd=Math.abs(a.speed-b.speed),dmg=sd*.04;
            a.damage=Math.min(1,a.damage+dmg);b.damage=Math.min(1,b.damage+dmg);
            if(a.damage>=1.0 && !a.dnf){a.dnf=true;if(a.isPlayer)hud.prompt.textContent='DNF';}
            if(b.damage>=1.0 && !b.dnf){b.dnf=true;if(b.isPlayer)hud.prompt.textContent='DNF';}
            const ang=Math.atan2(dy,dx),ov=PHYSICS.collisionRadius-d,f=ov*PHYSICS.collisionForce;
            a.x-=Math.cos(ang)*f/2;a.y-=Math.sin(ang)*f/2;b.x+=Math.cos(ang)*f/2;b.y+=Math.sin(ang)*f/2;
            spawnDebris((a.x+b.x)/2,(a.y+b.y)/2,a.data.color,4);
            if(sd>2&&race.flag.status==='green'){
                race.flag.status='yellow';race.flag.dur=300;hud.flag.className='yellow';hud.flag.style.display='block';hud.flag.textContent='⚠ YELLOW FLAG';
                const sp=a.speed>b.speed?b:a;sp.isSpun=true;sp.speed*=.15;sp.angle+=(Math.random()-.5)*Math.PI;
            }
        }
    }
}

function checkBillboardHits(cars) {
    for(const bb of race.billboards){
        if(bb.hit)continue;
        for(const car of cars){
            if(Math.hypot(car.x-bb.x,car.y-bb.y)<20){
                bb.hit=true;car.damage=Math.min(1,car.damage+.15);
                car.x-=Math.cos(car.angle)*15; car.y-=Math.sin(car.angle)*15; car.speed*=-0.1;
                spawnDebris(bb.x,bb.y,bb.color,8);
                if(car.isPlayer){hud.prompt.textContent='CRASH!';setTimeout(()=>hud.prompt.textContent='',1500);}
                break;
            }
        }
    }
}

function save() { game.lastSave = Date.now(); localStorage.setItem('uformula2026v2', JSON.stringify(game)); }
function load() { try { const d = localStorage.getItem('uformula2026v2'); if(d) { game = JSON.parse(d); return true; } } catch(e){} return false; }

function checkLap(car,ts) {
    if(car.dnf) return;
    const len = race.spline.length;
    if(car.lastTargetIdx > len*0.9 && car.targetIdx < len*0.1) {
        if(car.highestIdx > len*0.5) {
            car.lap++;
            if(car.isPlayer) {
                race.lapStart = ts;
                $('pit-btn').classList.remove('available');
                $('pit-btn').classList.add('hidden');
            }
            if(car.isPittingNextLap) {
                car.isPitting = true;
                car.pitTimer = 150;
                car.isPittingNextLap = false;
                if(car.isPlayer) { $('pit-btn').classList.remove('active'); hud.prompt.textContent = 'IN THE BOX'; }
            }
        }
        car.highestIdx = 0;
    }
    car.highestIdx = Math.max(car.highestIdx||0, car.targetIdx);
    car.lastTargetIdx = car.targetIdx;
}

// --- RENDERING ---
function render() {
    if(userSettings.use3D && window.render3D) { 
        $('race-canvas').style.display='none'; 
        window.render3D(race); 
        // We still need to draw minimap
        drawMinimap();
        return; 
    }
    else { 
        $('race-canvas').style.display='block'; 
        if(window.hide3D) window.hide3D(); 
    }

    const canvas=$('race-canvas'), ctx=canvas.getContext('2d');
    const cam=race.camera, target=race.player;
    cam.x+=((target.x-canvas.width/2)-cam.x)*.06; // Smoother camera!
    cam.y+=((target.y-canvas.height/2)-cam.y)*.06;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save(); ctx.translate(-cam.x,-cam.y);
    // Grass
    ctx.fillStyle='#166534'; ctx.fillRect(cam.x,cam.y,canvas.width,canvas.height);
    // Track
    ctx.strokeStyle='#555'; ctx.lineWidth=PHYSICS.trackWidth; ctx.lineJoin='round'; ctx.lineCap='round'; ctx.stroke(race.path);
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=2; ctx.stroke(race.path);
    // Kerbs
    const sp=race.spline; ctx.lineWidth=7;
    for(let i=0;i<sp.length;i++){if(sp[i].curvature>.04){const n=sp[(i+1)%sp.length],a=Math.atan2(n.y-sp[i].y,n.x-sp[i].x)+Math.PI/2;ctx.strokeStyle=i%4<2?'#FFF':'#e10600';ctx.beginPath();ctx.moveTo(sp[i].x+Math.cos(a)*(PHYSICS.trackWidth/2-5),sp[i].y+Math.sin(a)*(PHYSICS.trackWidth/2-5));ctx.lineTo(n.x+Math.cos(a)*(PHYSICS.trackWidth/2-5),n.y+Math.sin(a)*(PHYSICS.trackWidth/2-5));ctx.stroke();}}
    // Finish
    const f=race.finishLine; ctx.strokeStyle='#fff';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(f.x1,f.y1);ctx.lineTo(f.x2,f.y2);ctx.stroke();
    // Billboards
    for(const bb of race.billboards){if(bb.hit)continue;ctx.save();ctx.translate(bb.x,bb.y);ctx.rotate(bb.angle);ctx.fillStyle=bb.color;ctx.fillRect(-bb.w/2,-bb.h/2,bb.w,bb.h);ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.strokeRect(-bb.w/2,-bb.h/2,bb.w,bb.h);ctx.restore();}
    // Cars
    race.ai.forEach(c=>drawCar(ctx,c,false));
    drawCar(ctx,race.player,true);
    drawParticles(ctx);
    // Speed lines
    if(race.player.speed>race.player.topSpeed*.7){const int=(race.player.speed-race.player.topSpeed*.7)/(race.player.topSpeed*.3);ctx.strokeStyle=`rgba(255,255,255,${int*.12})`;ctx.lineWidth=1;for(let i=0;i<6;i++){const ox=race.player.x+(Math.random()-.5)*45,oy=race.player.y+(Math.random()-.5)*45;ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox-Math.cos(race.player.angle)*25,oy-Math.sin(race.player.angle)*25);ctx.stroke();}}
    ctx.restore();
    drawMinimap();
}

function drawMinimap() {
    const mc=$('minimap-canvas').getContext('2d'),mw=220,mh=140;
    const canvas=$('race-canvas');
    const vw=race.virtualW||canvas.width,vh=race.virtualH||canvas.height;
    const sc=Math.min(mw/vw,mh/vh)*.92;
    mc.clearRect(0,0,mw,mh);
    [race.player,...race.ai].forEach(c=>{mc.fillStyle=c.isPlayer?'#FFD700':c.data.color;mc.beginPath();mc.arc(c.x*sc+5,c.y*sc+5,c.isPlayer?4:2.5,0,Math.PI*2);mc.fill();});
}

// --- QUICK RACE ---
function quickRace() {
    game = {selectedId:'ver',drivers:JSON.parse(JSON.stringify(DRIVERS)),currency:0,upgrades:{engine:-1,aero:-1,brakes:-1},rep:0,round:0,standings:{}};
    DRIVERS.forEach(d=>game.standings[d.id]=0);
    const grid = DRIVERS.map(d=>({id:d.id,time:Math.random()*1000})).sort((a,b)=>a.time-b.time);
    startRaceFromGrid('monza',3,grid);
}

// --- INIT ---
function init() {
    // V6 Screen Transitions
    $('start-btn').onclick = () => showScreen(screens.startChoice);
    $('mode-offline-btn').onclick = () => showScreen(screens.offlineLanding);
    $('mode-online-btn').onclick = initMultiplayer;
    $('offline-career-btn').onclick = () => {
        if(load()) { showScreen(screens.hub); renderHub(); }
        else showScreen(screens.typeChoice);
    };
    $('type-player-btn').onclick = () => { game.careerMode='player'; showScreen(screens.choice); };
    $('type-champ-btn').onclick = () => { game.careerMode='champ'; showScreen(screens.choice); };
    
    // Multiplayer Listeners
    $('create-party-btn').onclick = createParty;
    $('join-party-btn').onclick = () => joinParty($('join-id-input').value.trim());
    $('leave-party-btn').onclick = leaveParty;
    $('start-multi-btn').onclick = startMultiplayerRace;

    $('career-real-btn').onclick = () => { game.customTeam=false; renderSelection(); showScreen(screens.selection); };
    $('career-custom-btn').onclick = () => { game.customTeam=true; showScreen(screens.create); setupCreateTeam(); };
    $('back-select-btn').onclick = () => showScreen(screens.choice);
    $('back-create-btn').onclick = () => showScreen(screens.choice);
    $('confirm-create-btn').onclick = confirmCreateTeam;
    $('confirm-driver-btn').onclick = () => { if(game.tempSelect) initNewGame(game.tempSelect, JSON.parse(JSON.stringify(DRIVERS))); };
    $('menu-from-hub-btn').onclick = () => showScreen(screens.menu);
    $('shop-btn').onclick = renderUpgradeShop;
    $('standings-btn').onclick = renderStandings;
    $('race-btn').onclick = startRaceWeekend;
    $('quick-race-btn').onclick = startQuickRace;

    let bindingAction = null;
    window.rebindKey = (action) => {
        bindingAction = action;
        document.querySelectorAll('kbd').forEach(k=>k.classList.remove('listening'));
        $(`bind-${action}`).classList.add('listening');
        $(`bind-${action}`).textContent = '...';
    };

    window.addEventListener('keydown', e => {
        if(bindingAction) {
            e.preventDefault();
            userSettings.keys[bindingAction] = e.key;
            localStorage.setItem('uformula_settings', JSON.stringify(userSettings));
            bindingAction = null;
            openSettings(); // Refresh
        } else if(race.keys) {
            race.keys[e.key] = true;
            race.keys[e.key.toLowerCase()] = true; // WASD fallback support
        }
    });
    window.addEventListener('keyup', e => {
        if(!bindingAction && race.keys) {
            race.keys[e.key] = false;
            race.keys[e.key.toLowerCase()] = false;
        }
    });
    // Mobile Slider & Buttons
    const sliderContainer = $('steering-slider-container'), sKnob = $('steering-slider-knob');
    if(sliderContainer && sKnob) {
        let maxTravel = 80; // (220 width - 44 knob)/2 roughly = ~88. We'll use 80 for padding
        const handleSlide = (e) => {
            const rect = sliderContainer.getBoundingClientRect();
            const touch = e.touches[0];
            let rawX = touch.clientX - rect.left - rect.width/2;
            let val = Math.max(-1, Math.min(1, rawX / maxTravel));
            sKnob.style.left = `calc(50% + ${val * maxTravel}px)`;
            if(race.keys) race.keys['steering'] = val;
        };
        sliderContainer.addEventListener('touchstart', e => { e.preventDefault(); handleSlide(e); }, {passive:false});
        sliderContainer.addEventListener('touchmove', e => { e.preventDefault(); handleSlide(e); }, {passive:false});
        window.addEventListener('touchend', e => {
            sKnob.style.left = '50%';
            if(race.keys) delete race.keys['steering'];
        });
    }

    const mBind = (id, key) => {
        const el = $(id);
        if(!el) return;
        el.addEventListener('touchstart', e => { e.preventDefault(); if(race.keys) race.keys[userSettings.keys[key]||key] = true; }, {passive:false});
        el.addEventListener('touchend', e => { e.preventDefault(); if(race.keys) race.keys[userSettings.keys[key]||key] = false; }, {passive:false});
    };
    mBind('touch-gas', 'gas');
    mBind('touch-brake', 'brake');

    $('ovr-btn').addEventListener('touchstart', e => { e.preventDefault(); if(race.keys) race.keys[userSettings.keys['ovr']||' '] = true; }, {passive:false});
    $('ovr-btn').addEventListener('touchend', e => { e.preventDefault(); if(race.keys) race.keys[userSettings.keys['ovr']||' '] = false; }, {passive:false});
    $('ovr-btn').addEventListener('mousedown', () => { if(race.keys) race.keys[userSettings.keys['ovr']||' '] = true; });
    $('ovr-btn').addEventListener('mouseup', () => { if(race.keys) race.keys[userSettings.keys['ovr']||' '] = false; });
    
    if($('pit-btn')) $('pit-btn').onclick = () => {
        if(race.running && race.player && !race.player.isPitting && race.phase !== 'quali') {
            race.player.isPittingNextLap = !race.player.isPittingNextLap;
            $('pit-btn').classList.toggle('active', race.player.isPittingNextLap);
        }
    };
    if($('settings-btn')) $('settings-btn').onclick = openSettings;
    if($('reset-career-btn')) $('reset-career-btn').onclick = () => { if(confirm("Are you sure you want to completely wipe your career?")) { localStorage.removeItem('uformula2026v2'); location.reload(); } };

    showScreen(screens.menu);
}



function startQuickRace() {
    game.careerMode = 'quick';
    // Show F1/F2 picker modal
    showModal(`<h2>Quick Race</h2>
        <p style="text-align:center;margin:1rem 0" class="text-muted">Pick your series</p>
        <div class="modal-buttons" style="flex-direction:column; gap:0.75rem">
            <button class="btn btn-primary" style="width:100%" onclick="hideModal();launchQuickRace('f1')"><span>FORMULA 1</span></button>
            <button class="btn btn-secondary" style="width:100%" onclick="hideModal();launchQuickRace('f2')"><span>FORMULA 2</span></button>
        </div>`);
    window.launchQuickRace = launchQuickRace;
}

function launchQuickRace(series) {
    const pool = series === 'f2' ? F2_DRIVERS : DRIVERS;
    const d = pool[Math.floor(Math.random()*pool.length)];
    const calList = getCalendar();
    const t = calList[Math.floor(Math.random()*calList.length)];
    game.series = series;
    initNewGame(d.id, JSON.parse(JSON.stringify(pool)));
    race.track = t;
    startRaceWeekend();
}

// --- CUSTOM DRIVER CREATION ---
function showCreateDriver() {
    showModal(`<h2>Create Your Driver</h2>
        <div style="display:flex; flex-direction:column; gap:1rem; margin:1rem 0">
            <div class="form-group"><label>DRIVER NAME</label><input type="text" id="custom-driver-name" placeholder="Enter name..." maxlength="24"></div>
            <div class="form-group"><label>TEAM</label>
                <select id="custom-driver-team" style="width:100%; background:#000; color:#fff; border:2px solid #fff; padding:0.8rem; font-family:'Orbitron',sans-serif; font-size:0.8rem">
                    ${[...new Set(DRIVERS.map(d=>d.team))].map(t=>`<option value="${t}">${t}</option>`).join('')}
                </select>
            </div>
        </div>
        <div class="modal-buttons">
            <button class="btn btn-secondary" onclick="hideModal()"><span>Cancel</span></button>
            <button class="btn btn-primary" onclick="confirmCreateDriver()"><span>Create</span></button>
        </div>`);
    window.confirmCreateDriver = confirmCreateDriver;
}
window.showCreateDriver = showCreateDriver;

function confirmCreateDriver() {
    const name = $('custom-driver-name').value.trim() || 'Custom Driver';
    const team = $('custom-driver-team').value;
    const teamColor = DRIVERS.find(d => d.team === team)?.color || '#FFFFFF';
    const customId = 'custom_' + Date.now();
    const customDriver = { id:customId, name, team, color:teamColor, pac:75, rac:75, awa:75, exp:60, ovr:72 };
    const pool = JSON.parse(JSON.stringify(DRIVERS));
    pool.push(customDriver);
    game.series = 'f1';
    hideModal();
    initNewGame(customId, pool);
}

// --- PRE-SEASON SETUP (Sepang toggle lives here now) ---
function showPreSeasonSetup(callback) {
    showModal(`<h2>Pre-Season Setup</h2>
        <div style="display:flex; flex-direction:column; gap:0.75rem; margin:1rem 0">
            <label style="display:flex; justify-content:space-between; align-items:center; background:#111; padding:0.75rem; border:2px solid #fff">
                <span style="font-size:0.9rem; font-weight:900">ADD SEPANG TO CALENDAR</span>
                <input type="checkbox" id="pre-sepang" ${userSettings.useSepang ? 'checked' : ''}>
            </label>
        </div>
        <div class="modal-buttons">
            <button class="btn btn-primary" style="width:100%" onclick="finalizePreSeason()"><span>Confirm & Start Season</span></button>
        </div>`);
    window.finalizePreSeason = () => {
        const sep = $('pre-sepang');
        if(sep) toggleSetting('useSepang', sep.checked);
        hideModal();
        if(callback) callback();
    };
}
window.showPreSeasonSetup = showPreSeasonSetup;

// --- MANAGER CAREER: PROMOTE F2 DRIVER ---
function showPromoteF2() {
    let html = `<h2>Promote F2 Driver to F1</h2><p class="text-muted" style="text-align:center;margin:0.5rem 0">Replace a driver on your team with an F2 talent</p>`;
    html += `<div style="max-height:300px; overflow-y:auto; display:flex; flex-direction:column; gap:0.5rem; margin:1rem 0">`;
    F2_DRIVERS.forEach(d => {
        html += `<div style="display:flex; justify-content:space-between; align-items:center; background:#111; padding:0.75rem; border:2px solid #333;">
            <div><strong style="color:${d.color}">${d.name}</strong><br><span class="text-muted" style="font-size:0.75rem">${d.team} | OVR ${d.ovr}</span></div>
            <button class="btn btn-small btn-green" onclick="doPromoteF2('${d.id}')"><span>PROMOTE</span></button>
        </div>`;
    });
    html += `</div><div class="modal-buttons"><button class="btn btn-secondary" onclick="hideModal()"><span>Cancel</span></button></div>`;
    showModal(html);
    window.doPromoteF2 = doPromoteF2;
}
window.showPromoteF2 = showPromoteF2;

function doPromoteF2(f2Id) {
    const f2Driver = F2_DRIVERS.find(d => d.id === f2Id);
    if(!f2Driver || !game.drivers) return;
    const playerTeam = game.drivers.find(d => d.id === game.selectedId)?.team;
    if(!playerTeam) return;
    // Find the weakest non-player driver on the team
    const teamDrivers = game.drivers.filter(d => d.team === playerTeam && d.id !== game.selectedId);
    if(teamDrivers.length === 0) return;
    teamDrivers.sort((a,b) => a.ovr - b.ovr);
    const replaced = teamDrivers[0];
    // Swap in the F2 driver
    const idx = game.drivers.findIndex(d => d.id === replaced.id);
    if(idx >= 0) {
        const promoted = { ...f2Driver, id: f2Driver.id, team: playerTeam, color: replaced.color };
        game.drivers[idx] = promoted;
        game.standings[promoted.id] = 0;
        delete game.standings[replaced.id];
        save();
        hideModal();
        showModal(`<h2>Driver Promoted!</h2><p style="text-align:center;margin:1rem 0"><strong style="color:${promoted.color}">${promoted.name}</strong> replaces ${replaced.name} at ${playerTeam}.</p><div class="modal-buttons"><button class="btn btn-primary" onclick="hideModal();renderHub()"><span>OK</span></button></div>`);
    }
}

// --- SEASON-END DRIVER TRANSFERS ---
function simulateTransfers() {
    if(!game.drivers) return;
    const teams = [...new Set(game.drivers.map(d => d.team))];
    const numSwaps = 2 + Math.floor(Math.random() * 3); // 2-4 swaps
    const transfers = [];
    
    for(let i = 0; i < numSwaps; i++) {
        const t1 = teams[Math.floor(Math.random() * teams.length)];
        const t2 = teams.filter(t => t !== t1)[Math.floor(Math.random() * (teams.length - 1))];
        if(!t2) continue;
        
        const d1Pool = game.drivers.filter(d => d.team === t1 && d.id !== game.selectedId);
        const d2Pool = game.drivers.filter(d => d.team === t2 && d.id !== game.selectedId);
        if(d1Pool.length === 0 || d2Pool.length === 0) continue;
        
        const d1 = d1Pool[Math.floor(Math.random() * d1Pool.length)];
        const d2 = d2Pool[Math.floor(Math.random() * d2Pool.length)];
        
        // Swap teams and colors
        const tmpTeam = d1.team, tmpColor = d1.color;
        d1.team = d2.team; d1.color = d2.color;
        d2.team = tmpTeam; d2.color = tmpColor;
        transfers.push(`${d1.name} → ${d1.team}`);
        transfers.push(`${d2.name} → ${d2.team}`);
    }
    
    // Random chance to promote an F2 driver (replace worst non-player driver on a random team)
    if(Math.random() > 0.5) {
        const randomTeam = teams[Math.floor(Math.random() * teams.length)];
        const worst = game.drivers.filter(d => d.team === randomTeam && d.id !== game.selectedId).sort((a,b) => a.ovr - b.ovr)[0];
        if(worst) {
            const f2Pick = F2_DRIVERS[Math.floor(Math.random() * F2_DRIVERS.length)];
            const idx = game.drivers.findIndex(d => d.id === worst.id);
            if(idx >= 0) {
                const promoted = { ...f2Pick, team: randomTeam, color: worst.color };
                game.drivers[idx] = promoted;
                game.standings[promoted.id] = 0;
                transfers.push(`${promoted.name} (F2) promoted to ${randomTeam}`);
            }
        }
    }
    
    save();
    return transfers;
}
window.simulateTransfers = simulateTransfers;

init();
