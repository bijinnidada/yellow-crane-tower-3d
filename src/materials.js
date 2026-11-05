import * as THREE from 'three';

function canvasOf(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

function makeTexture(canvas, renderer, { srgb = true, repeat = [1, 1] } = {}) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function rand(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function roofTiles(renderer) {
  const [c, x] = canvasOf(256, 256);
  const g = x.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0.0, '#8a5a19');
  g.addColorStop(0.14, '#b37d26');
  g.addColorStop(0.36, '#d9a642');
  g.addColorStop(0.5, '#eac568');
  g.addColorStop(0.64, '#d5a044');
  g.addColorStop(0.86, '#ab7622');
  g.addColorStop(1.0, '#85571b');
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 256);

  const r = rand(7);
  for (let i = 0; i < 900; i++) {
    const px = r() * 256;
    const py = r() * 256;
    x.fillStyle = r() > 0.5 ? 'rgba(255,240,190,0.05)' : 'rgba(60,35,5,0.05)';
    x.fillRect(px, py, 1 + r() * 2, 1 + r() * 3);
  }

  for (let y = 0; y < 256; y += 64) {
    x.fillStyle = 'rgba(58,33,6,0.28)';
    x.fillRect(0, y, 256, 4);
    x.fillStyle = 'rgba(255,232,170,0.16)';
    x.fillRect(0, y + 4, 256, 2);
    x.fillStyle = 'rgba(58,33,6,0.09)';
    x.fillRect(0, y + 14, 256, 2);
  }
  return makeTexture(c, renderer);
}

function plaster(renderer) {
  const [c, x] = canvasOf(512, 512);
  x.fillStyle = '#b4715d';
  x.fillRect(0, 0, 512, 512);
  const r = rand(11);
  for (let i = 0; i < 2600; i++) {
    x.fillStyle = r() > 0.5 ? 'rgba(255,215,190,0.055)' : 'rgba(88,42,32,0.05)';
    x.fillRect(r() * 512, r() * 512, 1 + r() * 3, 1 + r() * 3);
  }
  for (let i = 0; i < 26; i++) {
    x.fillStyle = 'rgba(96,44,34,0.05)';
    x.fillRect(r() * 512, 0, 4 + r() * 18, 512);
  }
  return makeTexture(c, renderer, { repeat: [2, 1] });
}

function stone(renderer) {
  const [c, x] = canvasOf(512, 512);
  x.fillStyle = '#c7bdaa';
  x.fillRect(0, 0, 512, 512);
  const r = rand(23);
  const rowH = 100;
  for (let row = 0; row < 6; row++) {
    const y = row * rowH;
    const offset = row % 2 ? 110 : 0;
    for (let col = -1; col < 4; col++) {
      const bx = col * 210 + offset;
      const shade = 0.92 + r() * 0.13;
      x.fillStyle = `rgba(${Math.round(199 * shade)},${Math.round(189 * shade)},${Math.round(170 * shade)},1)`;
      x.fillRect(bx + 3, y + 3, 204, rowH - 6);
      x.strokeStyle = 'rgba(120,110,96,0.22)';
      x.lineWidth = 1;
      x.strokeRect(bx + 8, y + 8, 194, rowH - 16);
    }
    x.fillStyle = 'rgba(118,108,94,0.5)';
    x.fillRect(0, y, 512, 4);
  }
  for (let i = 0; i < 1600; i++) {
    x.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(90,82,70,0.05)';
    x.fillRect(r() * 512, r() * 512, 1 + r() * 2, 1 + r() * 2);
  }
  return makeTexture(c, renderer, { repeat: [3, 1.4] });
}

function plaza(renderer) {
  const [c, x] = canvasOf(1024, 1024);
  x.fillStyle = '#b3ab9c';
  x.fillRect(0, 0, 1024, 1024);
  const r = rand(41);
  const tile = 128;
  for (let y = 0; y < 1024; y += tile) {
    for (let px = 0; px < 1024; px += tile) {
      const v = 0.94 + r() * 0.12;
      x.fillStyle = `rgba(${Math.round(178 * v)},${Math.round(170 * v)},${Math.round(155 * v)},1)`;
      x.fillRect(px + 2, y + 2, tile - 4, tile - 4);
    }
  }
  x.strokeStyle = 'rgba(92,85,73,0.35)';
  x.lineWidth = 2;
  for (let i = 0; i <= 1024; i += tile) {
    x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 1024); x.stroke();
    x.beginPath(); x.moveTo(0, i); x.lineTo(1024, i); x.stroke();
  }
  for (let i = 0; i < 5000; i++) {
    x.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(60,54,45,0.035)';
    x.fillRect(r() * 1024, r() * 1024, 1 + r() * 3, 1 + r() * 3);
  }
  return makeTexture(c, renderer, { repeat: [26, 26] });
}

function lattice(renderer) {
  const [c, x] = canvasOf(512, 512);
  const glow = x.createRadialGradient(256, 270, 40, 256, 256, 340);
  glow.addColorStop(0, '#2f2318');
  glow.addColorStop(0.6, '#19120d');
  glow.addColorStop(1, '#0e0906');
  x.fillStyle = glow;
  x.fillRect(0, 0, 512, 512);

  x.fillStyle = '#47251b';
  x.fillRect(0, 0, 512, 18);
  x.fillRect(0, 494, 512, 18);
  x.fillRect(0, 0, 18, 512);
  x.fillRect(494, 0, 18, 512);

  const step = 74;
  for (let i = 18; i <= 494; i += step) {
    x.fillStyle = '#55301f';
    x.fillRect(i - 4, 0, 8, 512);
    x.fillStyle = '#7a4c2c';
    x.fillRect(i - 4, 0, 2, 512);
    x.fillStyle = '#55301f';
    x.fillRect(0, i - 3, 512, 7);
    x.fillStyle = '#7a4c2c';
    x.fillRect(0, i - 3, 512, 2);
  }
  for (let i = 0; i < 512; i += step) {
    for (let j = 0; j < 512; j += step) {
      x.strokeStyle = 'rgba(116,72,42,0.7)';
      x.lineWidth = 4;
      x.strokeRect(i + 12, j + 12, step - 24, step - 24);
    }
  }
  return makeTexture(c, renderer);
}

function railingAlpha(renderer) {
  const [c, x] = canvasOf(512, 256);
  x.clearRect(0, 0, 512, 256);
  x.strokeStyle = '#8b3a2b';
  x.fillStyle = '#8b3a2b';
  x.fillRect(0, 0, 512, 16);
  x.fillRect(0, 240, 512, 16);
  x.fillRect(0, 0, 16, 256);
  x.fillRect(496, 0, 16, 256);
  for (let px = 128; px < 512; px += 128) {
    x.fillRect(px - 7, 0, 14, 256);
    x.fillStyle = '#b25a44';
    x.fillRect(px - 7, 0, 4, 256);
    x.fillStyle = '#8b3a2b';
  }
  x.strokeStyle = '#a24a37';
  x.lineWidth = 9;
  for (let k = -256; k < 768; k += 64) {
    x.beginPath(); x.moveTo(k, 16); x.lineTo(k + 240, 256); x.stroke();
    x.beginPath(); x.moveTo(k, 256); x.lineTo(k + 240, 16); x.stroke();
  }
  x.strokeStyle = 'rgba(196,120,86,0.55)';
  x.lineWidth = 2;
  for (let k = -256; k < 768; k += 64) {
    x.beginPath(); x.moveTo(k, 16); x.lineTo(k + 240, 256); x.stroke();
  }
  const tex = makeTexture(c, renderer);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function beamPattern(renderer) {
  const [c, x] = canvasOf(512, 128);
  const g = x.createLinearGradient(0, 0, 0, 128);
  g.addColorStop(0, '#2c5a4b');
  g.addColorStop(0.5, '#244c41');
  g.addColorStop(1, '#1c3d35');
  x.fillStyle = g;
  x.fillRect(0, 0, 512, 128);

  x.fillStyle = '#c4a158';
  x.fillRect(0, 0, 512, 5);
  x.fillRect(0, 123, 512, 5);

  for (let px = 0; px < 512; px += 128) {
    x.fillStyle = px % 256 === 0 ? '#2f6152' : '#2f5266';
    x.fillRect(px + 8, 14, 112, 100);
    x.strokeStyle = '#b9964f';
    x.lineWidth = 3;
    x.strokeRect(px + 10, 16, 108, 96);
    x.strokeStyle = 'rgba(210,180,112,0.75)';
    x.lineWidth = 2;
    x.strokeRect(px + 24, 30, 80, 68);
    x.beginPath();
    x.moveTo(px + 64, 30);
    x.lineTo(px + 64, 98);
    x.moveTo(px + 24, 64);
    x.lineTo(px + 104, 64);
    x.stroke();
    x.fillStyle = '#c9a65c';
    x.beginPath();
    x.moveTo(px + 64, 42); x.lineTo(px + 78, 64); x.lineTo(px + 64, 86); x.lineTo(px + 50, 64);
    x.closePath(); x.fill();
    x.fillStyle = '#1e3d34';
    x.beginPath(); x.arc(px + 64, 64, 7, 0, Math.PI * 2); x.fill();
  }
  return makeTexture(c, renderer);
}

function plaqueTexture(text, renderer) {
  const [c, x] = canvasOf(1024, 320);
  const g = x.createLinearGradient(0, 0, 0, 320);
  g.addColorStop(0, '#1a1512');
  g.addColorStop(0.5, '#0e0b09');
  g.addColorStop(1, '#161110');
  x.fillStyle = g;
  x.fillRect(0, 0, 1024, 320);

  const r = rand(91);
  for (let i = 0; i < 900; i++) {
    x.fillStyle = 'rgba(120,90,55,0.03)';
    x.fillRect(r() * 1024, r() * 320, 1 + r() * 40, 1);
  }

  x.strokeStyle = '#b08b45';
  x.lineWidth = 11;
  x.strokeRect(16, 16, 992, 288);
  x.strokeStyle = 'rgba(214,178,104,0.55)';
  x.lineWidth = 3;
  x.strokeRect(38, 38, 948, 244);
  x.strokeStyle = 'rgba(90,62,24,0.85)';
  x.lineWidth = 2;
  x.strokeRect(46, 46, 932, 228);

  const chars = Array.from(text);
  const gold = x.createLinearGradient(0, 60, 0, 270);
  gold.addColorStop(0, '#f7e3a8');
  gold.addColorStop(0.45, '#e2be6a');
  gold.addColorStop(0.75, '#c79b46');
  gold.addColorStop(1, '#a97c2f');
  x.fillStyle = gold;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  const size = chars.length > 3 ? 152 : 178;
  x.font = `${size}px "KaiTi","STKaiti","Kaiti SC","SimSun",serif`;
  x.shadowColor = 'rgba(0,0,0,0.6)';
  x.shadowBlur = 8;
  x.shadowOffsetY = 4;
  const step = 236;
  const startX = 1024 - 220;
  chars.forEach((ch, i) => {
    x.fillText(ch, startX - i * step, 176);
  });
  x.shadowColor = 'transparent';

  x.fillStyle = '#9e3327';
  x.fillRect(84, 196, 62, 62);
  x.fillStyle = 'rgba(245,225,190,0.9)';
  x.font = '34px "KaiTi","STKaiti",serif';
  x.fillText('鶴', 115, 228);

  const tex = makeTexture(c, renderer);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function shadowBlob(renderer) {
  const [c, x] = canvasOf(256, 256);
  const g = x.createRadialGradient(128, 128, 10, 128, 128, 126);
  g.addColorStop(0, 'rgba(0,0,0,0.55)');
  g.addColorStop(0.55, 'rgba(0,0,0,0.25)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 256);
  return makeTexture(c, renderer, { srgb: false });
}

function cloudTexture(renderer) {
  const [c, x] = canvasOf(256, 128);
  x.clearRect(0, 0, 256, 128);
  const r = rand(3);
  for (let i = 0; i < 26; i++) {
    const cx = 40 + r() * 176;
    const cy = 54 + r() * 34;
    const rad = 22 + r() * 38;
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, rad);
    g.addColorStop(0, 'rgba(255,255,255,0.22)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g;
    x.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
  }
  return makeTexture(c, renderer, { srgb: false });
}

function mistTexture(renderer) {
  const [c, x] = canvasOf(512, 512);
  const g = x.createRadialGradient(256, 256, 20, 256, 256, 254);
  g.addColorStop(0, 'rgba(255,255,255,0.5)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.18)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 512, 512);
  return makeTexture(c, renderer, { srgb: false });
}

export function createMaterials(renderer) {
  const roofTex = roofTiles(renderer);
  const plasterTex = plaster(renderer);
  const stoneTex = stone(renderer);
  const plazaTex = plaza(renderer);
  const latticeTex = lattice(renderer);
  const railingTex = railingAlpha(renderer);
  const beamTex = beamPattern(renderer);
  beamTex.repeat.set(4, 1);

  const windowMat = new THREE.MeshStandardMaterial({
    map: latticeTex,
    roughness: 0.72,
    metalness: 0.04,
    emissive: new THREE.Color('#ff9a45'),
    emissiveMap: latticeTex,
    emissiveIntensity: 0.02,
    side: THREE.DoubleSide,
  });

  const lanternMat = new THREE.MeshStandardMaterial({
    color: '#c93a26',
    emissive: new THREE.Color('#ff5d2f'),
    emissiveIntensity: 0.28,
    roughness: 0.42,
    metalness: 0.05,
  });

  const materials = {
    roof: new THREE.MeshPhysicalMaterial({
      map: roofTex,
      roughness: 0.62,
      metalness: 0.12,
      clearcoat: 0.08,
      clearcoatRoughness: 0.6,
      side: THREE.DoubleSide,
    }),
    ridge: new THREE.MeshStandardMaterial({ color: '#9a732f', roughness: 0.5, metalness: 0.35 }),
    fascia: new THREE.MeshStandardMaterial({ color: '#79531d', roughness: 0.55, metalness: 0.2 }),
    soffit: new THREE.MeshStandardMaterial({ color: '#264d40', roughness: 0.7, metalness: 0.05, side: THREE.DoubleSide }),
    tileEnd: new THREE.MeshStandardMaterial({ color: '#2e5645', roughness: 0.42, metalness: 0.18 }),
    gold: new THREE.MeshStandardMaterial({ color: '#c9a35a', roughness: 0.32, metalness: 0.72 }),
    bronze: new THREE.MeshStandardMaterial({ color: '#8a6a35', roughness: 0.45, metalness: 0.6 }),
    column: new THREE.MeshStandardMaterial({ color: '#b0604c', roughness: 0.6, metalness: 0.03 }),
    railingSolid: new THREE.MeshStandardMaterial({ color: '#96452f', roughness: 0.65 }),
    railing: new THREE.MeshStandardMaterial({
      map: railingTex,
      transparent: true,
      alphaTest: 0.35,
      side: THREE.DoubleSide,
      roughness: 0.7,
    }),
    woodDark: new THREE.MeshStandardMaterial({ color: '#3d2419', roughness: 0.72 }),
    balcony: new THREE.MeshStandardMaterial({ color: '#5a3226', roughness: 0.7 }),
    wall: new THREE.MeshStandardMaterial({ map: plasterTex, color: '#ffffff', roughness: 0.92 }),
    stone: new THREE.MeshStandardMaterial({ map: stoneTex, color: '#ffffff', roughness: 0.9 }),
    stoneDark: new THREE.MeshStandardMaterial({ map: stoneTex, color: '#b9b0a0', roughness: 0.92 }),
    beam: new THREE.MeshStandardMaterial({ map: beamTex, roughness: 0.62, metalness: 0.1 }),
    bracket: new THREE.MeshStandardMaterial({ color: '#2b6152', roughness: 0.6 }),
    window: windowMat,
    lantern: lanternMat,
    plaza: new THREE.MeshStandardMaterial({ map: plazaTex, roughness: 0.96 }),
    interior: new THREE.MeshStandardMaterial({ color: '#150f0b', roughness: 0.9 }),
    pine: new THREE.MeshStandardMaterial({ color: '#446849', roughness: 0.9, flatShading: true }),
    pineDark: new THREE.MeshStandardMaterial({ color: '#35543b', roughness: 0.9, flatShading: true }),
    bark: new THREE.MeshStandardMaterial({ color: '#54402e', roughness: 0.95 }),
    hill: new THREE.MeshStandardMaterial({ color: '#93a8b4', roughness: 1, flatShading: true }),
    crane: new THREE.MeshStandardMaterial({ color: '#f4f1e8', roughness: 0.65 }),
    craneDark: new THREE.MeshStandardMaterial({ color: '#2a2723', roughness: 0.7 }),
    cloud: cloudTexture(renderer),
    mist: mistTexture(renderer),
    shadow: shadowBlob(renderer),
  };

  const plaqueSpecs = {
    top: '黃鶴樓',
    back: '楚天極目',
    ground: '氣吞雲夢',
  };
  materials.plaques = {};
  for (const [key, text] of Object.entries(plaqueSpecs)) {
    const tex = plaqueTexture(text, renderer);
    materials.plaques[key] = {
      texture: tex,
      material: new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0.15 }),
      aspect: 1024 / 320,
    };
  }

  materials.adaptive = { window: windowMat, lantern: lanternMat };
  return materials;
}
