// =============================================================================
// UFORMULA V8 — MULTIPLAYER ENGINE (PeerJS)
// =============================================================================

function initMultiplayer() {
    if(!window.Peer) { alert("PeerJS not loaded!"); return; }
    showScreen(screens.onlineLobby);
    if(net.peer) return;
    net.peer = new Peer();
    net.peer.on('open', id => { net.myId = id; console.log("My Peer ID:", id); $('party-id-display').textContent = id; });
    net.peer.on('connection', conn => {
        if(!net.isHost) return;
        setupConn(conn);
    });
}

function createParty() {
    net.isHost = true;
    net.myName = $('lobby-name-input').value || 'Host';
    $('lobby-setup').classList.add('hidden');
    $('lobby-active').classList.remove('hidden');
    $('party-id-display').textContent = net.myId || 'Connecting...';
    $('start-multi-btn').classList.remove('hidden');
    updatePlayerList([{name:net.myName, id:net.myId}]);
}

function joinParty(id) {
    if(!id) return;
    net.myName = $('lobby-name-input').value || 'Guest';
    const conn = net.peer.connect(id);
    setupConn(conn);
    $('lobby-setup').classList.add('hidden');
    $('lobby-active').classList.remove('hidden');
    $('party-id-display').textContent = id;
}

function setupConn(conn) {
    net.conn = conn;
    conn.on('open', () => {
        if(!net.isHost) conn.send({type:'join', name:net.myName, id:net.myId});
    });
    conn.on('data', data => {
        if(data.type === 'join' && net.isHost) {
            net.players.push({name:data.name, id:data.id, conn:conn});
            updatePlayerList(net.players);
            // Broadcast new list to everyone
            net.players.forEach(p => { if(p.conn && p.conn.open) p.conn.send({type:'list', players: net.players.map(x=>({name:x.name, id:x.id}))}); });
        }
        else if(data.type === 'list') {
            updatePlayerList(data.players);
        }
        else if(data.type === 'start') {
            startMultiplayerSession(data.track);
        }
        else if(data.type === 'sync') {
            receiveMultiplayerSync(data);
        }
    });
    conn.on('close', () => leaveParty());
}

function leaveParty() { location.reload(); }

function updatePlayerList(players) {
    if(net.isHost && players.length === 0) players = [{name:net.myName, id:net.myId}];
    net.players = players;
    const list = $('player-list');
    list.innerHTML = players.map(p => `<div class="player-item ${p.id===net.myId?'is-me':''}">${p.name}</div>`).join('');
}

function startMultiplayerRace() {
    if(!net.isHost) return;
    const calList = getCalendar();
    const t = calList[Math.floor(Math.random()*calList.length)]; // Random track for now
    
    // Tell guests to start
    net.players.forEach(p => {
        if(p.conn && p.conn.open) p.conn.send({type:'start', track:t});
    });
    // Host starts
    startMultiplayerSession(t);
}

function startMultiplayerSession(track) {
    game.careerMode = 'multiplayer';
    
    // Pick unique drivers for Host and Guest
    const d1 = DRIVERS[0]; // Host
    const d2 = DRIVERS[1]; // Guest
    
    if(net.isHost) {
        initNewGame(d1.id, JSON.parse(JSON.stringify(DRIVERS)));
    } else {
        initNewGame(d2.id, JSON.parse(JSON.stringify(DRIVERS)));
    }
    
    race.track = track;
    // Bypass the modal, jump straight to the race
    runSession(track.id, 'race', 3, null);
}

// Called every frame from gameLoop in game.js
function syncMultiplayerOutbound() {
    if(!race.running || !race.player) return;
    
    const payload = {
        type: 'sync',
        id: net.myId,
        x: race.player.x,
        y: race.player.y,
        angle: race.player.angle,
        speed: race.player.speed
    };
    
    if(net.isHost) {
        net.players.forEach(p => { if(p.conn && p.conn.open) p.conn.send(payload); });
    } else if(net.conn && net.conn.open) {
        net.conn.send(payload);
    }
}

function receiveMultiplayerSync(data) {
    if(!race.running || !race.ai || race.ai.length === 0) return;
    
    // The other player is the first AI car in our array
    // (In a 1v1, there's only 1 AI car anyway if configured right, or we just override the first one)
    const opponentCar = race.ai[0];
    if(opponentCar) {
        // Simple linear interpolation could go here, but absolute override is fine for a fast loop
        opponentCar.x = data.x;
        opponentCar.y = data.y;
        opponentCar.angle = data.angle;
        opponentCar.speed = data.speed;
        opponentCar.isMultiplayerOpponent = true; // Flag to stop local AI from controlling it
    }
}
