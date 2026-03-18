// =============================================================================
// UFORMULA — Season 2026 — DATA & CONFIG
// =============================================================================

const DRIVERS = [
    { id:'ver',name:'Max Verstappen',team:'Red Bull Racing',color:'#3671C6',pac:98,rac:99,awa:97,exp:95,ovr:97 },
    { id:'had',name:'Isack Hadjar',team:'Red Bull Racing',color:'#3671C6',pac:82,rac:78,awa:76,exp:68,ovr:76 },
    { id:'nor',name:'Lando Norris',team:'McLaren',color:'#FF8700',pac:96,rac:95,awa:93,exp:88,ovr:93 },
    { id:'pia',name:'Oscar Piastri',team:'McLaren',color:'#FF8700',pac:94,rac:92,awa:90,exp:82,ovr:90 },
    { id:'lec',name:'Charles Leclerc',team:'Ferrari',color:'#E8002D',pac:97,rac:94,awa:89,exp:88,ovr:92 },
    { id:'ham',name:'Lewis Hamilton',team:'Ferrari',color:'#E8002D',pac:91,rac:96,awa:95,exp:99,ovr:95 },
    { id:'rus',name:'George Russell',team:'Mercedes',color:'#27F4D2',pac:92,rac:90,awa:91,exp:85,ovr:90 },
    { id:'ant',name:'Kimi Antonelli',team:'Mercedes',color:'#27F4D2',pac:88,rac:82,awa:79,exp:70,ovr:80 },
    { id:'alo',name:'Fernando Alonso',team:'Aston Martin',color:'#229971',pac:87,rac:96,awa:96,exp:99,ovr:95 },
    { id:'str',name:'Lance Stroll',team:'Aston Martin',color:'#229971',pac:80,rac:79,awa:76,exp:84,ovr:80 },
    { id:'gas',name:'Pierre Gasly',team:'Alpine',color:'#FF87BC',pac:87,rac:86,awa:84,exp:86,ovr:86 },
    { id:'col',name:'Franco Colapinto',team:'Alpine',color:'#FF87BC',pac:83,rac:78,awa:75,exp:70,ovr:77 },
    { id:'alb',name:'Alex Albon',team:'Williams',color:'#64C4FF',pac:86,rac:85,awa:83,exp:84,ovr:85 },
    { id:'sai',name:'Carlos Sainz',team:'Williams',color:'#64C4FF',pac:90,rac:91,awa:90,exp:90,ovr:90 },
    { id:'law',name:'Liam Lawson',team:'Racing Bulls',color:'#6692FF',pac:84,rac:82,awa:80,exp:75,ovr:80 },
    { id:'lin',name:'Arvid Lindblad',team:'Racing Bulls',color:'#6692FF',pac:80,rac:76,awa:73,exp:65,ovr:74 },
    { id:'hul',name:'Nico Hülkenberg',team:'Audi',color:'#00E701',pac:84,rac:85,awa:88,exp:94,ovr:88 },
    { id:'bor',name:'Gabriel Bortoleto',team:'Audi',color:'#00E701',pac:82,rac:78,awa:76,exp:68,ovr:76 },
    { id:'oco',name:'Esteban Ocon',team:'Haas',color:'#B6BABD',pac:85,rac:84,awa:80,exp:86,ovr:84 },
    { id:'bea',name:'Oliver Bearman',team:'Haas',color:'#B6BABD',pac:83,rac:80,awa:78,exp:72,ovr:78 },
    { id:'bot',name:'Valtteri Bottas',team:'Cadillac',color:'#C8AA00',pac:86,rac:87,awa:88,exp:96,ovr:89 },
    { id:'per',name:'Sergio Pérez',team:'Cadillac',color:'#C8AA00',pac:84,rac:86,awa:85,exp:94,ovr:87 },
];

// Full 2026 Calendar — 24 races, each with unique track shape generator
// Tracks generate on a LARGE virtual canvas (S = scale multiplier)
const CALENDAR = [
    { id:'melbourne',   name:'Australian GP',    city:'Melbourne',   laps:3 },
    { id:'shanghai',    name:'Chinese GP',       city:'Shanghai',    laps:3 },
    { id:'suzuka',      name:'Japanese GP',      city:'Suzuka',      laps:3 },
    { id:'bahrain',     name:'Bahrain GP',       city:'Sakhir',      laps:3 },
    { id:'jeddah',      name:'Saudi Arabian GP', city:'Jeddah',      laps:3 },
    { id:'miami',       name:'Miami GP',         city:'Miami',       laps:3 },
    { id:'montreal',    name:'Canadian GP',      city:'Montreal',    laps:3 },
    { id:'monaco',      name:'Monaco GP',        city:'Monaco',      laps:3 },
    { id:'barcelona',   name:'Spanish GP',       city:'Barcelona',   laps:3 },
    { id:'spielberg',   name:'Austrian GP',      city:'Spielberg',   laps:3 },
    { id:'silverstone', name:'British GP',       city:'Silverstone', laps:3 },
    { id:'spa',         name:'Belgian GP',       city:'Spa',         laps:3 },
    { id:'budapest',    name:'Hungarian GP',     city:'Budapest',    laps:3 },
    { id:'zandvoort',   name:'Dutch GP',         city:'Zandvoort',   laps:3 },
    { id:'monza',       name:'Italian GP',       city:'Monza',       laps:3 },
    { id:'madrid',      name:'Madrid GP',        city:'Madrid',      laps:3 },
    { id:'baku',        name:'Azerbaijan GP',    city:'Baku',        laps:3 },
    { id:'singapore',   name:'Singapore GP',     city:'Singapore',   laps:3 },
    { id:'austin',      name:'US GP',            city:'Austin',      laps:3 },
    { id:'mexico',      name:'Mexico City GP',   city:'Mexico City', laps:3 },
    { id:'interlagos',  name:'Brazilian GP',     city:'São Paulo',   laps:3 },
    { id:'vegas',       name:'Las Vegas GP',     city:'Las Vegas',   laps:3 },
    { id:'lusail',      name:'Qatar GP',         city:'Lusail',      laps:3 },
    { id:'abudhabi',    name:'Abu Dhabi GP',     city:'Abu Dhabi',   laps:3 },
];

// Track generators — S = scale factor makes them BIG
function trackGen(id, W, H) {
    const S = 2.2; // Scale multiplier for bigger tracks
    const w = W * S, h = H * S;
    const cx = w/2, cy = h/2;
    const layouts = {
        melbourne:  [{x:.15,y:.8},{x:.5,y:.85},{x:.85,y:.75},{x:.9,y:.5},{x:.75,y:.3},{x:.85,y:.15},{x:.5,y:.1},{x:.3,y:.2},{x:.15,y:.35},{x:.1,y:.55}],
        shanghai:   [{x:.2,y:.8},{x:.5,y:.85},{x:.8,y:.7},{x:.85,y:.45},{x:.75,y:.25},{x:.6,y:.3},{x:.65,y:.15},{x:.4,y:.1},{x:.2,y:.2},{x:.15,y:.5}],
        suzuka:     [{x:.4,y:.85},{x:.85,y:.8},{x:.85,y:.5},{x:.7,y:.55},{x:.8,y:.2},{x:.4,y:.1},{x:.15,y:.12},{x:.1,y:.3},{x:.1,y:.6},{x:.2,y:.55},{x:.45,y:.45}],
        bahrain:    [{x:.2,y:.85},{x:.6,y:.9},{x:.85,y:.75},{x:.8,y:.5},{x:.9,y:.3},{x:.7,y:.15},{x:.45,y:.1},{x:.2,y:.2},{x:.1,y:.45},{x:.15,y:.65}],
        jeddah:     [{x:.15,y:.85},{x:.3,y:.9},{x:.5,y:.8},{x:.7,y:.85},{x:.85,y:.7},{x:.9,y:.4},{x:.85,y:.15},{x:.5,y:.1},{x:.2,y:.15},{x:.1,y:.5}],
        miami:      [{x:.2,y:.8},{x:.55,y:.85},{x:.8,y:.75},{x:.85,y:.55},{x:.7,y:.4},{x:.8,y:.2},{x:.55,y:.1},{x:.3,y:.15},{x:.15,y:.35},{x:.1,y:.6}],
        montreal:   [{x:.1,y:.7},{x:.3,y:.85},{x:.7,y:.9},{x:.9,y:.7},{x:.85,y:.45},{x:.7,y:.3},{x:.5,y:.35},{x:.3,y:.15},{x:.15,y:.2},{x:.1,y:.45}],
        monaco:     [{x:.2,y:.8},{x:.45,y:.88},{x:.7,y:.8},{x:.85,y:.65},{x:.8,y:.45},{x:.65,y:.35},{x:.55,y:.2},{x:.35,y:.12},{x:.2,y:.25},{x:.1,y:.5}],
        barcelona:  [{x:.15,y:.8},{x:.5,y:.88},{x:.85,y:.7},{x:.8,y:.45},{x:.65,y:.35},{x:.7,y:.15},{x:.45,y:.1},{x:.25,y:.2},{x:.15,y:.4},{x:.1,y:.6}],
        spielberg:  [{x:.25,y:.85},{x:.75,y:.85},{x:.85,y:.65},{x:.8,y:.35},{x:.65,y:.2},{x:.4,y:.15},{x:.2,y:.25},{x:.15,y:.55}],
        silverstone:[{x:.1,y:.7},{x:.5,y:.85},{x:.85,y:.7},{x:.85,y:.3},{x:.7,y:.15},{x:.55,y:.2},{x:.6,y:.35},{x:.45,y:.45},{x:.25,y:.4},{x:.15,y:.5}],
        spa:        [{x:.2,y:.85},{x:.7,y:.85},{x:.85,y:.65},{x:.9,y:.35},{x:.75,y:.15},{x:.5,y:.1},{x:.3,y:.2},{x:.15,y:.35},{x:.1,y:.55},{x:.12,y:.7}],
        budapest:   [{x:.2,y:.85},{x:.5,y:.9},{x:.8,y:.8},{x:.85,y:.55},{x:.75,y:.35},{x:.6,y:.25},{x:.4,y:.15},{x:.2,y:.2},{x:.1,y:.4},{x:.15,y:.65}],
        zandvoort:  [{x:.25,y:.82},{x:.6,y:.88},{x:.82,y:.7},{x:.85,y:.45},{x:.7,y:.25},{x:.5,y:.15},{x:.3,y:.2},{x:.15,y:.4},{x:.12,y:.6}],
        monza:      [{x:.3,y:.85},{x:.9,y:.82},{x:.88,y:.55},{x:.78,y:.55},{x:.72,y:.75},{x:.58,y:.78},{x:.58,y:.3},{x:.68,y:.2},{x:.82,y:.18},{x:.92,y:.1},{x:.12,y:.1},{x:.15,y:.25},{x:.22,y:.35},{x:.3,y:.6}],
        madrid:     [{x:.15,y:.82},{x:.45,y:.9},{x:.75,y:.8},{x:.88,y:.6},{x:.8,y:.35},{x:.6,y:.25},{x:.65,y:.12},{x:.4,y:.1},{x:.2,y:.2},{x:.1,y:.5}],
        baku:       [{x:.1,y:.8},{x:.25,y:.9},{x:.5,y:.85},{x:.85,y:.8},{x:.9,y:.5},{x:.88,y:.2},{x:.6,y:.1},{x:.3,y:.12},{x:.15,y:.25},{x:.1,y:.5}],
        singapore:  [{x:.2,y:.85},{x:.5,y:.88},{x:.8,y:.8},{x:.85,y:.6},{x:.75,y:.4},{x:.65,y:.25},{x:.45,y:.15},{x:.25,y:.2},{x:.15,y:.4},{x:.1,y:.65}],
        austin:     [{x:.2,y:.82},{x:.55,y:.88},{x:.82,y:.72},{x:.88,y:.45},{x:.75,y:.25},{x:.55,y:.18},{x:.35,y:.25},{x:.25,y:.15},{x:.15,y:.3},{x:.1,y:.55}],
        mexico:     [{x:.2,y:.85},{x:.6,y:.88},{x:.82,y:.75},{x:.85,y:.5},{x:.78,y:.3},{x:.6,y:.2},{x:.4,y:.12},{x:.2,y:.2},{x:.12,y:.4},{x:.15,y:.65}],
        interlagos: [{x:.3,y:.85},{x:.7,y:.88},{x:.85,y:.65},{x:.8,y:.35},{x:.6,y:.2},{x:.35,y:.15},{x:.2,y:.3},{x:.15,y:.55}],
        vegas:      [{x:.15,y:.85},{x:.4,y:.9},{x:.65,y:.82},{x:.85,y:.7},{x:.88,y:.4},{x:.8,y:.15},{x:.5,y:.1},{x:.25,y:.15},{x:.12,y:.35},{x:.1,y:.6}],
        lusail:     [{x:.2,y:.82},{x:.55,y:.88},{x:.8,y:.78},{x:.88,y:.55},{x:.82,y:.3},{x:.65,y:.15},{x:.4,y:.12},{x:.2,y:.22},{x:.12,y:.45},{x:.15,y:.65}],
        abudhabi:   [{x:.2,y:.85},{x:.5,y:.9},{x:.8,y:.8},{x:.88,y:.55},{x:.8,y:.3},{x:.6,y:.18},{x:.4,y:.15},{x:.2,y:.25},{x:.1,y:.45},{x:.15,y:.68}],
    };
    const pts = (layouts[id] || layouts.monza).map(p => ({x: p.x * w, y: p.y * h}));
    return { points: pts, virtualW: w, virtualH: h };
}

const UPGRADE_TIERS = {
    engine: [{cost:40000,bonus:3},{cost:120000,bonus:6},{cost:350000,bonus:9}],
    aero:   [{cost:35000,bonus:3},{cost:100000,bonus:6},{cost:300000,bonus:9}],
    brakes: [{cost:30000,bonus:3},{cost:80000,bonus:6},{cost:250000,bonus:9}],
};

const PAYOUTS = [60000,42000,30000,24000,20000,17000,15000,13000,11000,9000,7000,6500,6000,5500,5000,4000,3500,3000,2500,2000,1500,1000];
const POINTS_SYSTEM = [25,18,15,12,10,8,6,4,2,1,0,0,0,0,0,0,0,0,0,0,0,0];

const PHYSICS = {
    trackWidth: 140,
    baseTopSpeed: 4.5, paceFactor: 2.8,
    baseAccel: 0.018, accelFactor: 0.022,
    baseHandling: 0.028, handleFactor: 0.048,
    drsBonus: 1.14, drag: 0.997, tyreScrub: 0.003,
    offTrackGrip: 0.82, collisionRadius: 16, collisionForce: 2.0,
    steerSmoothing: 0.12, // How fast steering responds (lower = smoother)
    brakePower: 0.035,    // Progressive braking force
    gripLimit: 0.92,      // Grip budget factor
};
