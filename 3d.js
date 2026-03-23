// =============================================================================
// UFORMULA — 3D RENDERING ENGINE (WebGL / Three.js Extension)
// =============================================================================

let scene3d, camera3d, renderer3d, carMeshes = [], trackMesh;

window.init3D = function(raceData, w, h, hudH) {
    if(!window.THREE) {
        console.warn("Three.js not loaded.");
        return;
    }
    
    let canvas3d = document.getElementById('race-3d-canvas');
    if(!canvas3d) {
        canvas3d = document.createElement('canvas');
        canvas3d.id = 'race-3d-canvas';
        const raceScreen = document.getElementById('race-screen');
        const raceCanvas = document.getElementById('race-canvas');
        raceScreen.insertBefore(canvas3d, raceCanvas);
        
        renderer3d = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: true });
        renderer3d.shadowMap.enabled = true;
    }
    canvas3d.style.display = 'block';
    canvas3d.style.marginTop = hudH + 'px';
    renderer3d.setSize(w, h);
    
    scene3d = new THREE.Scene();
    scene3d.background = new THREE.Color(0x87CEEB); // Sky blue
    scene3d.fog = new THREE.Fog(0x87CEEB, 300, 1500);
    
    camera3d = new THREE.PerspectiveCamera(65, w/h, 1, 3000);
    
    // Lighting
    const amb = new THREE.AmbientLight(0xffffff, 0.7);
    scene3d.add(amb);
    const dir = new THREE.DirectionalLight(0xfff5e6, 1.0);
    dir.position.set(200, 400, 100);
    dir.castShadow = true;
    dir.shadow.camera.left = -500;
    dir.shadow.camera.right = 500;
    dir.shadow.camera.top = 500;
    dir.shadow.camera.bottom = -500;
    dir.shadow.mapSize.width = 2048;
    dir.shadow.mapSize.height = 2048;
    scene3d.add(dir);
    
    // Ground Plane
    const groundGeo = new THREE.PlaneGeometry(20000, 20000);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x166534 }); // Grass green
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene3d.add(ground);
    
    // Track Geometry (Tube Extrusion)
    const points3d = raceData.spline.map(p => new THREE.Vector3(p.x, 0, p.y));
    const curve = new THREE.CatmullRomCurve3(points3d);
    curve.closed = true;
    
    const tubeRadius = PHYSICS.trackWidth / 2;
    const trackGeo = new THREE.TubeGeometry(curve, raceData.spline.length, tubeRadius, 8, true);
    const trackMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.scale.y = 0.02; // Flatten it almost flat!
    trackMesh.receiveShadow = true;
    scene3d.add(trackMesh);
    
    // Create Car Meshes
    carMeshes.forEach(m => scene3d.remove(m.mesh));
    carMeshes = [];
    const allCars = [raceData.player, ...raceData.ai];
    
    allCars.forEach(car => {
        // Car Body
        const cGeo = new THREE.BoxGeometry(28, 6, 12); 
        const material = new THREE.MeshLambertMaterial({ color: car.data.color });
        const mesh = new THREE.Mesh(cGeo, material);
        mesh.castShadow = true;
        
        // F1 details (Cockpit, wings)
        const cockpitGeo = new THREE.BoxGeometry(10, 4, 8);
        const cockpitMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
        cockpit.position.y = 5;
        mesh.add(cockpit);
        
        const frontWingGeo = new THREE.BoxGeometry(4, 1, 14);
        const frontWing = new THREE.Mesh(frontWingGeo, material);
        frontWing.position.set(13, -2, 0);
        mesh.add(frontWing);
        
        const rearWingGeo = new THREE.BoxGeometry(4, 6, 14);
        const rearWingMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const rearWing = new THREE.Mesh(rearWingGeo, rearWingMat);
        rearWing.position.set(-12, 4, 0);
        mesh.add(rearWing);

        scene3d.add(mesh);
        carMeshes.push({ logicCar: car, mesh: mesh });
    });
};

window.render3D = function(raceData) {
    if(!scene3d || !renderer3d) return;
    document.getElementById('race-3d-canvas').style.display = 'block';
    
    // Sync Car Transforms
    carMeshes.forEach(c => {
        const tr = tubeRadiusScaleHeight();
        c.mesh.position.set(c.logicCar.x, tr + 3, c.logicCar.y);
        
        // 2D Physics Angle mapping to 3D.
        // In 2D: Atan2(y, x). X is right, Y is down.
        // In 3D: X is right, Z is down/forward.
        c.mesh.rotation.y = -c.logicCar.angle;
    });
    
    // Update Camera
    const p = raceData.player;
    const followDist = 70 + (p.speed * 2); // Dynamic follow dist
    const height = 25;
    
    const tX = p.x - Math.cos(p.angle) * followDist;
    const tZ = p.y - Math.sin(p.angle) * followDist;
    
    if(!camera3d.position.x && !camera3d.position.z) {
        camera3d.position.set(tX, height, tZ);
    } else {
        camera3d.position.lerp(new THREE.Vector3(tX, height, tZ), 0.15); // Smooth chase
    }
    
    // Look ahead of player
    const lX = p.x + Math.cos(p.angle) * 40;
    const lZ = p.y + Math.sin(p.angle) * 40;
    camera3d.lookAt(lX, tubeRadiusScaleHeight(), lZ);
    
    renderer3d.render(scene3d, camera3d);
};

window.hide3D = function() {
    const c = document.getElementById('race-3d-canvas');
    if(c) c.style.display = 'none';
};

window.resize3D = function(w, h, hudH) {
    const c = document.getElementById('race-3d-canvas');
    if(c) {
        c.style.marginTop = hudH + 'px';
    }
    if(renderer3d && camera3d) {
        renderer3d.setSize(w, h);
        camera3d.aspect = w/h;
        camera3d.updateProjectionMatrix();
    }
};

function tubeRadiusScaleHeight() {
    return (PHYSICS.trackWidth / 2) * 0.02;
}
