import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createMaterials } from './materials.js';
import { createTower } from './tower.js';
import { createEnvironment } from './environment.js';

const TARGET_HEIGHT = 51.4;

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const fogDay = new THREE.Color('#d8e9f3');
const fogNight = new THREE.Color('#0b1422');
scene.fog = new THREE.Fog(fogDay.clone(), 150, 460);

const isPortrait = window.innerWidth / window.innerHeight < 0.85;
const preset = isPortrait
  ? { pos: new THREE.Vector3(64, 33, 122), target: new THREE.Vector3(0, 25, 0), fov: 48 }
  : { pos: new THREE.Vector3(56, 30, 92), target: new THREE.Vector3(0, 24.5, 0), fov: 38 };

const camera = new THREE.PerspectiveCamera(preset.fov, window.innerWidth / window.innerHeight, 0.5, 1200);
camera.position.copy(preset.pos);

const controls = new OrbitControls(camera, canvas);
controls.target.copy(preset.target);
controls.enableDamping = true;
controls.dampingFactor = 0.065;
controls.enablePan = false;
controls.minDistance = 48;
controls.maxDistance = 210;
controls.minPolarAngle = 0.18;
controls.maxPolarAngle = 1.5;
controls.rotateSpeed = 0.55;
controls.zoomSpeed = 0.75;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.32;
controls.update();

const materials = createMaterials(renderer);
const tower = createTower(materials);
const scaleFactor = TARGET_HEIGHT / tower.totalHeight;
tower.group.scale.setScalar(scaleFactor);
scene.add(tower.group);

const env = createEnvironment(scene, materials);

const hemi = new THREE.HemisphereLight(0xdfeaff, 0x8a7458, 1.2);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff0d6, 2.5);
sun.position.set(70, 110, 60);
sun.target.position.set(0, 22, 0);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -70;
sun.shadow.camera.right = 70;
sun.shadow.camera.top = 100;
sun.shadow.camera.bottom = -40;
sun.shadow.camera.near = 20;
sun.shadow.camera.far = 280;
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.025;
scene.add(sun, sun.target);

const fill = new THREE.DirectionalLight(0x9fc2e8, 0.5);
fill.position.set(-70, 45, -50);
scene.add(fill);

const spotWarm = new THREE.SpotLight(0xffcf9a, 0, 170, 0.55, 0.7, 1.35);
spotWarm.position.set(36, 5, 58);
spotWarm.target.position.set(0, 28, 0);
scene.add(spotWarm, spotWarm.target);

const spotCool = new THREE.SpotLight(0xffd9b0, 0, 160, 0.5, 0.65, 1.4);
spotCool.position.set(-44, 8, 22);
spotCool.target.position.set(0, 32, 0);
scene.add(spotCool, spotCool.target);

const spotBack = new THREE.SpotLight(0x9db8e8, 0, 160, 0.5, 0.7, 1.4);
spotBack.position.set(-10, 6, -56);
spotBack.target.position.set(0, 25, 0);
scene.add(spotBack, spotBack.target);

const lanternLightA = new THREE.PointLight(0xff7a3d, 0, 30, 2);
lanternLightA.position.set(-4.4, 8.5, 18);
const lanternLightB = lanternLightA.clone();
lanternLightB.position.set(4.4, 8.5, 18);
scene.add(lanternLightA, lanternLightB);

const roofFlood = new THREE.PointLight(0xffdcae, 0, 230, 2);
roofFlood.position.set(4, 66, 40);
scene.add(roofFlood);

const nightCols = {
  sun: new THREE.Color('#a9c3ff'),
  sunDay: new THREE.Color('#fff0d6'),
  hemiSkyDay: new THREE.Color('#dfeaff'),
  hemiSkyNight: new THREE.Color('#2a3a5e'),
  hemiGroundDay: new THREE.Color('#8a7458'),
  hemiGroundNight: new THREE.Color('#141a24'),
};
const sunDayPos = sun.position.clone();
const sunNightPos = new THREE.Vector3(-70, 100, -30);
const daylightFog = new THREE.Color('#d8e9f3');
const nightFog = new THREE.Color('#0b1422');

let night = 0;
let nightTarget = 0;

const state = {
  explode: 0,
  explodeTarget: 0,
  autoRotate: true,
  selected: null,
  resetTween: null,
};

function applyNight(n) {
  night = n;
  const sunColor = nightCols.sunDay.clone().lerp(nightCols.sun, n);
  sun.color.copy(sunColor);
  sun.intensity = THREE.MathUtils.lerp(2.5, 1.55, n);
  sun.position.lerpVectors(sunDayPos, sunNightPos, n);
  hemi.color.copy(nightCols.hemiSkyDay).lerp(nightCols.hemiSkyNight, n);
  hemi.groundColor.copy(nightCols.hemiGroundDay).lerp(nightCols.hemiGroundNight, n);
  hemi.intensity = THREE.MathUtils.lerp(1.15, 0.48, n);
  fill.intensity = THREE.MathUtils.lerp(0.6, 0.12, n);
  fill.color.copy(new THREE.Color('#9fc2e8')).lerp(new THREE.Color('#4e5f80'), n);
  spotWarm.intensity = n * 2400;
  spotCool.intensity = n * 1700;
  spotBack.intensity = n * 1400;
  lanternLightA.intensity = n * 24;
  roofFlood.intensity = n * 5200;
  lanternLightB.intensity = n * 24;
  renderer.toneMappingExposure = THREE.MathUtils.lerp(1.08, 0.98, n);
  scene.fog.color.copy(daylightFog).lerp(nightFog, n);
  tower.setNight(n);
  env.setNight(n);
}

applyNight(0);

const infoPanel = document.getElementById('info');
const infoTitle = document.getElementById('infoTitle');
const infoSub = document.getElementById('infoSub');
const infoText = document.getElementById('infoText');
const infoFacts = document.getElementById('infoFacts');
const labelLayer = document.getElementById('labels');
const loader = document.getElementById('loader');

const labelNames = {
  platform: '台基 · 石作',
  tier1: '一层 · 气吞云梦',
  tier2: '二层 · 平座回廊',
  tier3: '三层 · 平座回廊',
  tier4: '四层 · 四面回廊',
  tier5: '五层 · 黄鹤楼匾',
  crown: '攒尖顶 · 葫芦宝顶',
};

const labelEntries = [];
for (const id of ['platform', 'tier1', 'tier2', 'tier3', 'tier4', 'tier5', 'crown']) {
  const part = tower.parts[id];
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'part-label';
  el.innerHTML = `<span class="label-dot"></span><span class="label-text">${labelNames[id]}</span>`;
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    selectPart(id, true);
  });
  labelLayer.appendChild(el);
  labelEntries.push({ id, el, part });
}

function openInfo(id) {
  const part = tower.parts[id];
  if (!part) return;
  const { title, sub, text, facts } = part.data;
  infoTitle.textContent = title;
  infoSub.textContent = sub;
  infoText.textContent = text;
  infoFacts.innerHTML = facts
    .map(([k, v]) => `<div class="fact"><dt>${k}</dt><dd>${v}</dd></div>`)
    .join('');
  infoPanel.classList.add('open');
  infoPanel.setAttribute('aria-hidden', 'false');
}

function closeInfo() {
  infoPanel.classList.remove('open');
  infoPanel.setAttribute('aria-hidden', 'true');
  tower.setSelected(null);
  state.selected = null;
}

function selectPart(id, openPanel) {
  state.selected = id;
  tower.setSelected(id);
  if (openPanel !== false) openInfo(id);
}

document.getElementById('infoClose').addEventListener('click', closeInfo);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoverCheckAt = 0;
let pointerDownAt = null;

function pickAt(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(tower.pickables, false);
  for (const hit of hits) {
    const id = tower.partIdForObject(hit.object);
    if (id) return id;
  }
  return null;
}

canvas.addEventListener('pointermove', (e) => {
  const now = performance.now();
  if (now - hoverCheckAt < 70) return;
  hoverCheckAt = now;
  const id = pickAt(e.clientX, e.clientY);
  canvas.style.cursor = id ? 'pointer' : controls.autoRotate ? 'default' : 'grab';
});

canvas.addEventListener('pointerdown', (e) => {
  pointerDownAt = { x: e.clientX, y: e.clientY };
  if (controls.autoRotate) {
    controls.autoRotate = false;
    state.autoRotate = false;
    syncButtons();
  }
});

canvas.addEventListener('pointerup', (e) => {
  if (!pointerDownAt) return;
  const dx = e.clientX - pointerDownAt.x;
  const dy = e.clientY - pointerDownAt.y;
  pointerDownAt = null;
  if (Math.hypot(dx, dy) > 6) return;
  const id = pickAt(e.clientX, e.clientY);
  if (id) selectPart(id, true);
  else closeInfo();
});

function syncButtons() {
  const rotateBtn = document.querySelector('[data-action="rotate"]');
  rotateBtn.classList.toggle('on', state.autoRotate);
  rotateBtn.setAttribute('aria-pressed', String(state.autoRotate));
  const explodeBtn = document.querySelector('[data-action="explode"]');
  explodeBtn.classList.toggle('on', state.explodeTarget === 1);
  explodeBtn.setAttribute('aria-pressed', String(state.explodeTarget === 1));
  const nightBtn = document.querySelector('[data-action="night"]');
  nightBtn.classList.toggle('on', nightTarget === 1);
  nightBtn.setAttribute('aria-pressed', String(nightTarget === 1));
  nightBtn.querySelector('.ctl-text').textContent = nightTarget === 1 ? '日景' : '夜景';
}

syncButtons();

document.querySelectorAll('[data-action]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    if (action === 'rotate') {
      state.autoRotate = !state.autoRotate;
      controls.autoRotate = state.autoRotate;
      syncButtons();
    } else if (action === 'explode') {
      state.explodeTarget = state.explodeTarget ? 0 : 1;
      syncButtons();
      if (state.explodeTarget === 0 && state.selected === null) closeInfo();
    } else if (action === 'night') {
      nightTarget = nightTarget ? 0 : 1;
      syncButtons();
    } else if (action === 'reset') {
      startReset();
    }
  });
});

function startReset() {
  const portrait = window.innerWidth / window.innerHeight < 0.85;
  const base = portrait
    ? { pos: new THREE.Vector3(64, 33, 122), target: new THREE.Vector3(0, 25, 0), fov: 48 }
    : { pos: new THREE.Vector3(56, 30, 92), target: new THREE.Vector3(0, 24.5, 0), fov: 38 };
  const expand = state.explode;
  state.resetTween = {
    t: 0,
    fromPos: camera.position.clone(),
    fromTarget: controls.target.clone(),
    fromFov: camera.fov,
    toPos: base.pos.clone(),
    toTarget: base.target.clone().add(new THREE.Vector3(0, expand * 8, 0)),
    toFov: base.fov + expand * 8,
  };
  if (controls.autoRotate) {
    controls.autoRotate = false;
    state.autoRotate = false;
    syncButtons();
  }
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeInfo();
});

function updateLabels(explodeT) {
  const show = explodeT > 0.02;
  labelLayer.classList.toggle('visible', show);
  if (!show) return;
  const rect = renderer.domElement.getBoundingClientRect();
  const v = new THREE.Vector3();
  tower.group.updateWorldMatrix(true, true);
  for (const entry of labelEntries) {
    const part = entry.part;
    v.copy(part.anchor);
    part.group.localToWorld(v);
    v.project(camera);
    const x = (v.x * 0.5 + 0.5) * rect.width;
    const y = (-v.y * 0.5 + 0.5) * rect.height;
    const behind = v.z > 1;
    const inView = x > -80 && x < rect.width + 80 && y > -40 && y < rect.height + 40;
    entry.el.style.opacity = show && !behind && inView ? String(Math.min(1, explodeT * 1.4)) : '0';
    entry.el.style.pointerEvents = show && !behind && inView ? 'auto' : 'none';
    entry.el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(22px, -50%)`;
  }
}

const clock = new THREE.Clock();
let elapsed = 0;
let firstFrame = true;

function animate() {
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;

  night = THREE.MathUtils.damp(night, nightTarget, 3.4, dt);
  applyNight(night);

  state.explode = THREE.MathUtils.damp(state.explode, state.explodeTarget, 4.2, dt);
  tower.setExplode(state.explode);

  const portrait = window.innerWidth / window.innerHeight < 0.85;
  const baseFov = portrait ? 48 : 38;
  const baseTargetY = portrait ? 25 : 24.5;
  camera.fov = THREE.MathUtils.lerp(baseFov, baseFov + 8, state.explode);
  camera.updateProjectionMatrix();
  controls.target.y = THREE.MathUtils.lerp(baseTargetY, baseTargetY + 8, state.explode);

  if (state.resetTween) {
    const tw = state.resetTween;
    tw.t = Math.min(1, tw.t + dt / 1.1);
    const k = tw.t * tw.t * (3 - 2 * tw.t);
    camera.position.lerpVectors(tw.fromPos, tw.toPos, k);
    controls.target.lerpVectors(tw.fromTarget, tw.toTarget, k);
    camera.fov = THREE.MathUtils.lerp(tw.fromFov, tw.toFov, k);
    camera.updateProjectionMatrix();
    if (tw.t >= 1) state.resetTween = null;
  }

  env.update(dt, elapsed);
  controls.update();
  updateLabels(state.explode);

  const selected = state.selected ? tower.parts[state.selected] : null;
  if (selected && selected.group.userData.ring) {
    selected.group.userData.ring.material.opacity = 0.65 + Math.sin(elapsed * 2.4) * 0.25;
  }

  renderer.render(scene, camera);

  if (firstFrame) {
    firstFrame = false;
    setTimeout(() => {
      loader.classList.add('is-hidden');
      setTimeout(() => loader.remove(), 900);
    }, 260);
  }
  requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const params = new URLSearchParams(location.search);
if (params.get('rotate') === '0') {
  controls.autoRotate = false;
  state.autoRotate = false;
  syncButtons();
}
if (params.get('night') === '1') {
  nightTarget = 1;
  applyNight(1);
  syncButtons();
}
if (params.get('explode') === '1') {
  state.explodeTarget = 1;
  state.explode = 1;
  tower.setExplode(1);
  syncButtons();
}
if (params.has('cam')) {
  const v = params.get('cam').split(',').map(Number);
  if (v.length === 3 && v.every(Number.isFinite)) camera.position.set(v[0], v[1], v[2]);
}
if (params.has('target')) {
  const v = params.get('target').split(',').map(Number);
  if (v.length === 3 && v.every(Number.isFinite)) controls.target.set(v[0], v[1], v[2]);
}
controls.update();
if (params.has('select')) selectPart(params.get('select'));

animate();
