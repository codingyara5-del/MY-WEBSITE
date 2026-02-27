/*
    hot_ice.js
    Advanced interactive sodium acetate crystallization simulation
    Uses Three.js for 3D rendering and procedural crystal growth.
*/

let scene, camera, renderer, clock;
let composer, bokehPass;
let crystalGroup, walkers = [];
let nucleationPoint;
let isGrowing = false;
let growthInterval;
let analysisMode = false;
let cameraInitialPos;
let cameraTargetPos;
let light, ambient;

// Camera animation state
let cameraAnimating = false;
let cameraAnimStart = 0;
let cameraAnimDuration = 20;
let cameraAnimStartPos = null;
let cameraAnimEndPos = null;

// guide character elements
let guideTextEl; // will be set once DOM is ready (window.onload)


function initThree() {
    console.log('initThree called');
    if (typeof THREE === 'undefined') {
        console.error('Three.js is not loaded');
        alert('Error: Three.js failed to load. Check network or CDN.');
        return;
    }
    const container = document.getElementById('scene-container');
    if (!container) {
        console.error('scene-container not found');
        alert('Error: scene container element missing');
        return;
    }
    renderer = new THREE.WebGLRenderer({antialias:true});
    if (!renderer) {
        console.error('WebGLRenderer creation failed');
        alert('WebGL initialization failed');
        return;
    }
    if (!renderer.getContext()) {
        console.error('Unable to get WebGL context');
        alert('WebGL context unavailable (your browser or GPU may not support WebGL)');
        return;
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    // set neutral non-black background so user always sees something
    scene.background = new THREE.Color(0xdddddd);
    clock = new THREE.Clock();

    // vectors that depend on THREE must be created after library is loaded
    nucleationPoint = new THREE.Vector3(0,0,0);
    cameraInitialPos = new THREE.Vector3(0,4,25);
    cameraTargetPos = new THREE.Vector3(0,2,5);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.copy(cameraInitialPos);
    camera.lookAt(nucleationPoint);

    // ambient light for general illumination
    ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    
    // directional sun light for natural daylight
    const sun = new THREE.DirectionalLight(0xffffff, 1.0);
    sun.position.set(10, 20, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    scene.add(sun);

    // point light that will brighten with crystals
    light = new THREE.PointLight(0xffffff, 0.8, 100);
    light.position.copy(nucleationPoint);
    scene.add(light);

    // table plane with mild reflectivity
    const tableMat = new THREE.MeshStandardMaterial({
        color:0x8b6f47,
        roughness:0.6,
        metalness:0.2
    });
    const table = new THREE.Mesh(new THREE.BoxGeometry(50,1,30), tableMat);
    table.position.y=-1;
    scene.add(table);

    // crystal container group
    crystalGroup = new THREE.Group();
    scene.add(crystalGroup);
    // add a visible reference cube in center to verify rendering
    const refMat = new THREE.MeshBasicMaterial({color:0x4444aa});
    const refCube = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), refMat);
    refCube.position.copy(nucleationPoint);
    scene.add(refCube);

    // glow object
    initGlow();

    window.addEventListener('resize', onWindowResize);
    try {
        initPostprocessing();
    } catch (e) {
        console.warn('Postprocessing initialization failed, continuing without DOF or heat shader', e);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (composer) {
        composer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Smooth easing function for camera motion
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Intro camera pan
function playIntro() {
    const duration = 15; // seconds
    let elapsed = 0;
    const startPos = camera.position.clone();
    const endPos = new THREE.Vector3(0,4,0);
    function animateIntro() {
        if (elapsed < duration) {
            elapsed += clock.getDelta();
            let t = Math.min(elapsed / duration, 1.0);
            let easeT = easeInOutCubic(t);
            camera.position.lerpVectors(startPos, endPos, easeT);
            camera.lookAt(nucleationPoint);
            // gradually adjust DOF focus distance
            if (bokehPass) {
                bokehPass.materialBokeh.uniforms['focus'].value = THREE.MathUtils.lerp(10, 5, easeT);
            }
            requestAnimationFrame(animateIntro);
            if (composer) composer.render();
            else renderer.render(scene, camera);
        } else {
            hideIntroOverlay();
        }
    }
    animateIntro();
}

function hideIntroOverlay() {
    const overlay = document.getElementById('intro-overlay');
    if (!overlay) return;
    overlay.style.transition = 'opacity 1s';
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 1200);
}

// allow manual dismissal if user clicks while overlay stuck
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('intro-overlay');
    if (overlay) {
        overlay.addEventListener('click', () => {
            console.log('Overlay clicked, removing');
            hideIntroOverlay();
            // if user clicked over the start button, also start growth automatically
            const startBtn = document.getElementById('start-crystallization');
            if (startBtn) {
                console.log('Simulating start button click after overlay removal');
                startBtn.click();
            }
        });
    }
});

// DLA walker
class Walker {
    constructor() {
        this.position = new THREE.Vector3(
            (Math.random()-0.5)*20,
            0,
            (Math.random()-0.5)*20
        );
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 6,6),
            new THREE.MeshBasicMaterial({color:0xaaaaaa})
        );
        this.mesh.position.copy(this.position);
        scene.add(this.mesh);
    }
    step() {
        // random walk on XZ plane
        this.position.x += (Math.random()-0.5)*0.5;
        this.position.z += (Math.random()-0.5)*0.5;
        this.mesh.position.copy(this.position);
        // check for contact
        if (this.position.distanceTo(nucleationPoint) < crystalGroup.children.length*0.2 + 0.5) {
            stickCrystal(this.position);
            scene.remove(this.mesh);
            return false;
        }
        if (this.position.length() > 30) {
            // reset far walkers
            this.position.set((Math.random()-0.5)*20,0,(Math.random()-0.5)*20);
            this.mesh.position.copy(this.position);
        }
        return true;
    }
}

// create a glow around the growing crystals
let glowMesh;
function initGlow() {
    const glowGeom = new THREE.SphereGeometry(1, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
        color:0xffffff,
        transparent:true,
        opacity:0.1,
        blending:THREE.AdditiveBlending
    });
    glowMesh = new THREE.Mesh(glowGeom, glowMat);
    glowMesh.position.copy(nucleationPoint);
    scene.add(glowMesh);
}

function stickCrystal(pos) {
    const geom = new THREE.CylinderGeometry(0.1,0.1,1,6);
    const mat = new THREE.MeshPhysicalMaterial({
        color:0xffffff,
        transparent:true,
        opacity:0.6,
        transmission:0.9,
        roughness:0.1,
        metalness:0.0,
        clearcoat:1.0,
        clearcoatRoughness:0.1
    });
    const crystal = new THREE.Mesh(geom, mat);
    crystal.position.copy(pos);
    crystal.rotation.x = Math.random()*Math.PI;
    crystal.rotation.y = Math.random()*Math.PI;
    crystal.scale.setScalar(0.5 + Math.random()*1.5);
    crystalGroup.add(crystal);
    // brighten light a bit
    light.intensity = Math.min(2, light.intensity + 0.02);
    // grow glow radius
    if (glowMesh) {
        const scale = 1 + crystalGroup.children.length * 0.02;
        glowMesh.scale.set(scale, scale, scale);
        glowMesh.material.opacity = Math.min(0.4, glowMesh.material.opacity + 0.005);
    }
}

function spawnWalker() {
    walkers.push(new Walker());
}

function growCrystals() {
    // run walkers
    walkers = walkers.filter(w => w.step());
    if (Math.random() < 0.3) spawnWalker();
    // gradually zoom camera inward as structure grows
    if (crystalGroup.children.length % 20 === 0) {
        const zoomTarget = new THREE.Vector3(0,3,3);
        camera.position.lerp(zoomTarget, 0.002);
        ambient.intensity = Math.min(0.8, ambient.intensity + 0.001);
    }
}

function animate() {
    const dt = clock.getDelta();
    
    // Update camera animation if active (one-way slow move)
    if (cameraAnimating) {
        const elapsed = clock.getElapsedTime() - cameraAnimStart;
        const t = Math.min(elapsed / cameraAnimDuration, 1.0);
        const easeT = easeInOutCubic(t);
        camera.position.lerpVectors(cameraAnimStartPos, cameraAnimEndPos, easeT);
        camera.lookAt(nucleationPoint);
        
        // reduce DOF focus distance to nucleation
        if (bokehPass) {
            bokehPass.materialBokeh.uniforms['focus'].value = THREE.MathUtils.lerp(5, 2, easeT);
        }
        
        if (t >= 1.0) {
            cameraAnimating = false;
        }
    }
    
    if (isGrowing) growCrystals();
    // update heat shader time
    if (composer && composer.passes) {
        composer.passes.forEach(p => {
            if (p.uniforms && p.uniforms.time) {
                p.uniforms.time.value += dt;
            }
        });
    }
    // render using composer for DOF + heat
    if (composer) composer.render();
    else renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

function startGrowth() {
    console.log('startGrowth triggered');
    if (isGrowing) {
        console.log('already growing');
        return;
    }
    isGrowing = true;
    guideSpeak('Crystallization initiated! Supersaturated solution will nucleate and grow beautiful branches.');
    // camera shift to focus
    moveCameraToTarget();
    // start audio
    playCrackle();
    // spawn a batch of walkers initially
    for (let i=0;i<50;i++) spawnWalker();
    // educational messages
    setTimeout(() => guideSpeak('Supersaturation means the solution contains more sodium acetate than it can normally hold. A tiny disturbance triggers nucleation.'), 4000);
    setTimeout(() => guideSpeak('As crystals form, the reaction releases heat — an exothermic process you can see as a subtle glow.'), 9000);
    setTimeout(() => guideSpeak('Crystals grow in a lattice pattern; branches propagate similarly to diffusion-limited aggregation.'), 14000);
}
function moveCameraToTarget() {
    // Begin slow one-way move to focus position
    cameraAnimating = true;
    cameraAnimStart = clock.getElapsedTime();
    cameraAnimStartPos = camera.position.clone();
    cameraAnimEndPos = cameraTargetPos.clone();
    guideSpeak('Slowly moving camera into position...');
}

function playCrackle() {
    const audio = document.getElementById('crackle-sound');
    // generate noise via Web Audio
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const buffer = ctx.createBuffer(1, ctx.sampleRate*2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i=0;i<data.length;i++) {
        data[i] = (Math.random()*2-1)*0.2;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.connect(ctx.destination);
    src.start();
    // store to stop later
    crackleSource = src;
    // also trigger small camera shake to accompany sound
    shakeCamera();
}

function toggleAnalysis() {
    analysisMode = !analysisMode;
    const overlays = document.getElementById('analysis-overlays');
    if (analysisMode) {
        positionAnalysisOverlays();
        overlays.classList.add('visible');
        guideSpeak('Scientific analysis mode active. Observe molecular structures and lattice formation.');
    } else {
        overlays.classList.remove('visible');
        guideSpeak('Analysis mode off. Enjoy the visual experience.');
    }
}

function positionAnalysisOverlays() {
    const items = document.querySelectorAll('#analysis-overlays .overlay-element');
    const positions = [
        {top:'10%', left:'10%'},
        {top:'10%', right:'10%'},
        {bottom:'10%', left:'15%'},
        {bottom:'15%', right:'15%'},
        {top:'50%', left:'45%'},
        {top:'45%', right:'45%'},
        {bottom:'30%', left:'40%'}
    ];
    items.forEach((el, i) => {
        const pos = positions[i] || {top:'20%', left:'20%'};
        Object.assign(el.style, pos);
    });
}

function guideSpeak(text) {
    if (guideTextEl) {
        guideTextEl.textContent = text;
    } else {
        console.warn('guideSpeak called before guideTextEl available:', text);
    }
    const bubble = document.getElementById('guide-speech');
    if (bubble) {
        bubble.style.animation = 'none';
        setTimeout(()=>bubble.style.animation='bubble-appear 0.4s ease-out',10);
    }
}

// bind UI
window.onload = () => {
    // at this point DOM elements exist
    guideTextEl = document.getElementById('guide-text');

    if (typeof THREE === 'undefined') {
        console.error('Skipping initialization because THREE is unavailable');
        return;
    }

    try {
        initThree();
        playIntro();
        animate();
        document.getElementById('start-crystallization').addEventListener('click', startGrowth);
        document.getElementById('toggle-analysis').addEventListener('click', toggleAnalysis);

        // if nothing appears after a short delay, warn the user
        setTimeout(() => {
            const container = document.getElementById('scene-container');
            if (container && container.children.length === 0) {
                container.innerHTML = '<div style="color:#900;padding:20px;font-size:18px;">No 3D content detected. Check console for errors or ensure the libraries loaded.</div>';
            }
        }, 1500);
    } catch (err) {
        console.error('Initialization error', err);
        alert('Initialization error: see console');
        const container = document.getElementById('scene-container');
        if (container) {
            container.innerHTML = '<div style="color:#900;padding:20px;font-size:18px;">Failed to initialize 3D scene. Check console.</div>';
        }
    }
};

// postprocessing initialization for DOF
function initPostprocessing() {
    composer = new THREE.EffectComposer(renderer);
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bokehSettings = {
        focus: 10.0,
        aperture: 0.0002,
        maxblur: 0.01,
        width: window.innerWidth,
        height: window.innerHeight
    };
    bokehPass = new THREE.BokehPass(scene, camera, bokehSettings);
    composer.addPass(bokehPass);

    // heat shimmer shader pass
    const heatShader = {
        uniforms: {
            tDiffuse: { value: null },
            time: { value: 0 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform float time;
            varying vec2 vUv;
            float rand(vec2 co){
                return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
            }
            void main(){
                vec2 uv = vUv;
                float n = rand(uv * 50.0 + time*0.1);
                uv.y += (n - 0.5) * 0.015;
                gl_FragColor = texture2D(tDiffuse, uv);
            }
        `
    };
    const heatPass = new THREE.ShaderPass(heatShader);
    heatPass.renderToScreen = true;
    composer.addPass(heatPass);
}

// small camera shake effect
function shakeCamera() {
    const orig = camera.position.clone();
    let shakeTime = 0.3;
    function doShake() {
        if (shakeTime > 0) {
            shakeTime -= clock.getDelta();
            camera.position.x = orig.x + (Math.random()-0.5)*0.1;
            camera.position.y = orig.y + (Math.random()-0.5)*0.05;
            requestAnimationFrame(doShake);
        } else {
            camera.position.copy(orig);
        }
    }
    doShake();
}

// placeholder variables
let crackleSource;
