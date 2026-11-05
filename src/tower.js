import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const BODY_W = [30, 26.5, 23.5, 20.5, 17.5];
const BODY_H = [7.4, 6.0, 5.6, 5.3, 5.0];
const ROOF_RISE = [4.0, 3.4, 3.2, 3.0, 5.2];
const EAVE_W = [37, 32.5, 29, 25.5, 22.5];
const PLATFORM_TOP = 2.45;
const BASE_Y = [0];

for (let i = 1; i < 5; i++) {
  BASE_Y[i] = BASE_Y[i - 1] + BODY_H[i - 1] + ROOF_RISE[i - 1] * 0.62;
}

const PARTS = {
  platform: {
    title: '台基',
    sub: '三层石作 · 四面踏道',
    text: '宽阔的石台基把楼身托起，四面各设一跑踏道与石栏。游人拾级而上，五层重檐便自台面层层展开。',
    facts: [['形制', '石作高台'], ['踏道', '四向登临'], ['栏板', '望柱寻杖']],
  },
  tier1: {
    title: '一层',
    sub: '气吞云梦 · 周围廊',
    text: '一层五开间，周以朱红立柱与周围廊，檐下青绿斗拱承托第一重飞檐。明间悬“气吞云梦”匾，檐角红灯高挂。',
    facts: [['开间', '五间'], ['匾额', '气吞云梦'], ['形制', '周围廊']],
  },
  tier2: {
    title: '二层',
    sub: '平座回廊 · 格扇窗',
    text: '自二层起收为三开间，外挑平座，环以寻杖栏杆。深色格扇窗后是回廊，可环楼四望，江天入眼。',
    facts: [['开间', '三间'], ['平座', '外挑回廊'], ['窗式', '格扇']],
  },
  tier3: {
    title: '三层',
    sub: '平座回廊 · 江天一览',
    text: '三层延续平座回廊的做法，楼身继续收分。金色琉璃瓦与朱红柱网交替，形成层层叠叠的水平檐线。',
    facts: [['开间', '三间'], ['屋檐', '琉璃瓦'], ['收分', '逐层内收']],
  },
  tier4: {
    title: '四层',
    sub: '平座回廊 · 四望如一',
    text: '四层平面近方，四望如一。檐下斗拱、额枋彩画与格扇窗构成完整的立面节奏，为顶层的高潮作铺垫。',
    facts: [['平面', '方形四望'], ['彩画', '青绿额枋'], ['栏杆', '回廊周设']],
  },
  tier5: {
    title: '五层',
    sub: '黄鹤楼匾 · 楚天极目',
    text: '顶层收至三开间，正面悬“黄鹤楼”匾，背面为“楚天极目”。面阔收至十八米，四角小阁簇拥，上承整座楼最大的歇山式屋顶。',
    facts: [['开间', '三间'], ['面阔', '约 18 m'], ['匾额', '黄鹤楼']],
  },
  crown: {
    title: '攒尖顶',
    sub: '四角攒尖 · 鎏金宝顶',
    text: '主屋顶之上再起一座四角攒尖小亭，四条垂脊起翘，亭心立鎏金葫芦宝顶。全楼总高 51.4 米，此顶是整座建筑的收束。',
    facts: [['屋顶', '四角攒尖'], ['宝顶', '鎏金葫芦'], ['总高', '51.4 m']],
  },
};

function addMesh(parent, geo, mat, x = 0, y = 0, z = 0, ry = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.rotation.y = ry;
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function addBox(parent, w, h, d, mat, x, y, z, ry = 0) {
  return addMesh(parent, new THREE.BoxGeometry(w, h, d), mat, x, y, z, ry);
}

function addCylinder(parent, rTop, rBot, h, mat, x, y, z, seg = 10) {
  return addMesh(parent, new THREE.CylinderGeometry(rTop, rBot, h, seg), mat, x, y, z);
}

function rotatePoint(x, z, ry) {
  const c = Math.cos(ry);
  const s = Math.sin(ry);
  return [x * c + z * s, -x * s + z * c];
}

function buildStairs(mats, { width, run, rise, steps, halfZ }) {
  const g = new THREE.Group();
  const stepDepth = run / steps;
  for (let k = 0; k < steps; k++) {
    const top = (rise * (k + 1)) / steps;
    const z = halfZ + (steps - 1 - k) * stepDepth + stepDepth / 2;
    addBox(g, width, top, stepDepth, mats.stone, 0, top / 2, z);
  }
  for (const sx of [-1, 1]) {
    const len = Math.hypot(run, rise) + 0.8;
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.85, len), mats.stoneDark);
    wall.position.set(sx * (width / 2 + 0.35), rise / 2 + 0.28, halfZ + run / 2);
    wall.rotation.x = Math.atan2(rise, run);
    wall.castShadow = true;
    wall.receiveShadow = true;
    g.add(wall);
    const newel = addBox(g, 0.62, 1.5, 0.62, mats.stone, sx * (width / 2 + 0.35), rise + 0.55, halfZ + 0.2);
    newel.castShadow = true;
  }
  return g;
}

function addPlatform(mats, root) {
  const g = new THREE.Group();
  g.userData.partId = 'platform';

  addBox(g, 48, 2.2, 48, mats.stone, 0, 1.1, 0);
  addBox(g, 48.8, 0.22, 48.8, mats.stoneDark, 0, 2.31, 0);
  addBox(g, 49.2, 0.16, 49.2, mats.stone, 0, 0.08, 0);

  const stairFront = buildStairs(mats, { width: 11, run: 8.5, rise: 2.45, steps: 13, halfZ: 24 });
  g.add(stairFront);
  const stairBack = stairFront.clone();
  stairBack.rotation.y = Math.PI;
  g.add(stairBack);
  const stairSideL = buildStairs(mats, { width: 7.5, run: 7, rise: 2.45, steps: 12, halfZ: 24 });
  stairSideL.rotation.y = Math.PI / 2;
  g.add(stairSideL);
  const stairSideR = buildStairs(mats, { width: 7.5, run: 7, rise: 2.45, steps: 12, halfZ: 24 });
  stairSideR.rotation.y = -Math.PI / 2;
  g.add(stairSideR);

  const railGroup = new THREE.Group();
  g.add(railGroup);
  const gapFront = 11.6;
  const gapSide = 8.1;
  const half = 24.2;
  for (let side = 0; side < 4; side++) {
    const rot = (side * Math.PI) / 2;
    const gap = side % 2 === 0 ? gapFront : gapSide;
    const segs = [
      [-half, -gap / 2],
      [gap / 2, half],
    ];
    for (const [a, b] of segs) {
      const len = b - a;
      const mid = (a + b) / 2;
      const sideGroup = new THREE.Group();
      sideGroup.rotation.y = rot;
      railGroup.add(sideGroup);
      addBox(sideGroup, len, 0.16, 0.2, mats.stone, mid, 1.18, half);
      addBox(sideGroup, len, 0.14, 0.16, mats.stoneDark, mid, 0.62, half);
      addBox(sideGroup, len, 0.42, 0.2, mats.stone, mid, 0.88, half);
      const n = Math.max(2, Math.round(len / 2.4));
      for (let k = 0; k <= n; k++) {
        const x = a + ((b - a) * k) / n;
        addBox(sideGroup, 0.26, 1.15, 0.3, mats.stoneDark, x, 0.58, half);
        addCylinder(sideGroup, 0.18, 0.22, 0.16, mats.stone, x, 1.28, half, 8);
      }
    }
  }

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(76, 66),
    new THREE.MeshBasicMaterial({ map: mats.shadow, transparent: true, opacity: 0.6, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.03;
  shadow.renderOrder = 1;
  g.add(shadow);

  root.add(g);
  return g;
}

function addRailingSegments(parent, mats, segments, railingHeight = 1.0) {
  const fasciaGeos = [];
  const goldGeos = [];
  const solidGeos = [];
  const panelGeos = [];

  const boxAt = (list, w, h, d, x, y, z, ry) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (ry) g.rotateY(ry);
    g.translate(x, y, z);
    list.push(g);
  };

  for (const [x1, z1, x2, z2] of segments) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    if (len < 0.08) continue;
    const mx = (x1 + x2) / 2;
    const mz = (z1 + z2) / 2;
    const ry = -Math.atan2(dz, dx);
    const dirX = dx / len;
    const dirZ = dz / len;

    boxAt(fasciaGeos, len, 0.9, 0.32, mx, -0.66, mz, ry);
    boxAt(goldGeos, len, 0.06, 0.4, mx, -0.2, mz, ry);
    boxAt(solidGeos, len, 0.16, 0.24, mx, railingHeight, mz, ry);
    boxAt(solidGeos, len, 0.1, 0.16, mx, 0.16, mz, ry);

    const panelW = Math.max(0.2, len - 0.4);
    const panelGeo = new THREE.PlaneGeometry(panelW, railingHeight - 0.42);
    const uv = panelGeo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * Math.max(1, len / 1.1), uv.getY(i));
    panelGeo.rotateY(ry);
    panelGeo.translate(mx, 0.2 + (railingHeight - 0.42) / 2, mz);
    panelGeos.push(panelGeo);

    const n = Math.max(2, Math.round(len / 2.1));
    for (let k = 0; k <= n; k++) {
      const s = -len / 2 + (len * k) / n;
      boxAt(solidGeos, 0.16, railingHeight, 0.16, mx + dirX * s, railingHeight / 2, mz + dirZ * s, ry);
    }
  }

  const addMerged = (list, mat, withShadow = true) => {
    if (!list.length) return;
    const mesh = new THREE.Mesh(mergeGeometries(list, false), mat);
    mesh.castShadow = withShadow;
    mesh.receiveShadow = withShadow;
    parent.add(mesh);
  };
  addMerged(fasciaGeos, mats.balcony);
  addMerged(goldGeos, mats.gold);
  addMerged(solidGeos, mats.railingSolid);
  addMerged(panelGeos, mats.railing, false);
}

function addBalcony(parent, mats, half, railingHeight, porchWidth, porchDepth) {
  const deck = new THREE.Mesh(new THREE.BoxGeometry(half * 2, 0.32, half * 2), mats.balcony);
  deck.position.y = 0.02;
  deck.castShadow = true;
  deck.receiveShadow = true;
  parent.add(deck);

  const openHalf = porchWidth / 2;
  const segments = [];
  for (let side = 0; side < 4; side++) {
    const rot = (side * Math.PI) / 2;
    const edge = half - 0.12;
    const p = (x, z) => rotatePoint(x, z, rot);
    const [m1x, m1z] = p(-half, edge);
    const [m2x, m2z] = p(-openHalf, edge);
    const [m3x, m3z] = p(openHalf, edge);
    const [m4x, m4z] = p(half, edge);
    segments.push([m1x, m1z, m2x, m2z]);
    segments.push([m3x, m3z, m4x, m4z]);

    const [r1x, r1z] = p(-openHalf, edge);
    const [r2x, r2z] = p(-openHalf, half + porchDepth - 0.12);
    const [r3x, r3z] = p(openHalf, half + porchDepth - 0.12);
    const [r4x, r4z] = p(openHalf, edge);
    segments.push([r1x, r1z, r2x, r2z]);
    segments.push([r2x, r2z, r3x, r3z]);
    segments.push([r3x, r3z, r4x, r4z]);

    const [dx, dz] = p(0, half + porchDepth / 2 + 0.18);
    const porchDeck = new THREE.Mesh(
      new THREE.BoxGeometry(porchWidth + 0.4, 0.32, porchDepth + 0.32),
      mats.balcony
    );
    porchDeck.position.set(dx, 0.03, dz);
    porchDeck.rotation.y = rot;
    porchDeck.castShadow = true;
    porchDeck.receiveShadow = true;
    parent.add(porchDeck);
  }
  addRailingSegments(parent, mats, segments, railingHeight);
}

function addPorchHorn(parent, mats, x, y, z, dirX, dirZ, scale = 1) {
  const pts = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(dirX * 0.5 * scale, 0.38 * scale, dirZ * 0.5 * scale),
    new THREE.Vector3(dirX * 0.9 * scale, 0.95 * scale, dirZ * 0.9 * scale),
    new THREE.Vector3(dirX * 1.05 * scale, 1.5 * scale, dirZ * 1.05 * scale),
    new THREE.Vector3(dirX * 0.9 * scale, 1.85 * scale, dirZ * 0.9 * scale),
  ];
  const curve = new THREE.CatmullRomCurve3(pts);
  const horn = new THREE.Mesh(new THREE.TubeGeometry(curve, 18, 0.14 * scale, 6, false), mats.ridge);
  horn.position.set(x, y, z);
  horn.castShadow = true;
  parent.add(horn);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.16 * scale, 8, 8), mats.gold);
  tip.position.set(x + pts[4].x, y + pts[4].y, z + pts[4].z);
  parent.add(tip);
}

function makePorchRoof(mats, { frontHalf, backHalf, proj, drop = 0.55 }) {
  const g = new THREE.Group();
  const nU = 18;
  const nV = 8;
  const lift = Math.min(0.58, frontHalf * 0.12);
  const flare = frontHalf * 0.055;
  const sag = frontHalf * 0.028;

  const pt = (u, v) => {
    const ct = Math.pow(Math.abs(u), 7) * Math.pow(v, 2.2);
    const halfW = backHalf + (frontHalf - backHalf) * v;
    const x = u * halfW + Math.sign(u) * flare * ct;
    const y = -drop * v + lift * ct - sag * (1 - Math.pow(Math.abs(u), 1.6)) * v * v;
    return [x, y, proj * v];
  };

  const pos = [];
  const uv = [];
  const idx = [];
  for (let j = 0; j <= nV; j++) {
    const v = j / nV;
    for (let i = 0; i <= nU; i++) {
      const u = -1 + (2 * i) / nU;
      const p = pt(u, v);
      pos.push(p[0], p[1], p[2]);
      uv.push((u * 0.5 + 0.5) * ((frontHalf * 2) / 0.48), v * (proj / 1.15));
    }
  }
  for (let j = 0; j < nV; j++) {
    for (let i = 0; i < nU; i++) {
      const a = j * (nU + 1) + i;
      const b = a + 1;
      const c = a + nU + 1;
      const d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const roof = new THREE.Mesh(geo, mats.roof);
  roof.castShadow = true;
  roof.receiveShadow = true;
  g.add(roof);

  const edgePts = (side) => {
    const out = [];
    for (let i = 0; i <= 12; i++) {
      const v = i / 12;
      const p = pt(side, v);
      out.push(new THREE.Vector3(p[0], p[1] - 0.1, p[2]));
    }
    return out;
  };

  const frontPts = [];
  for (let i = 0; i <= 12; i++) {
    const u = -1 + (2 * i) / 12;
    const p = pt(u, 1);
    frontPts.push(new THREE.Vector3(p[0], p[1] - 0.1, p[2] + 0.06));
  }
  const frontCurve = new THREE.CatmullRomCurve3(frontPts);
  const frontTube = new THREE.Mesh(new THREE.TubeGeometry(frontCurve, 22, 0.14, 6, false), mats.fascia);
  frontTube.castShadow = true;
  g.add(frontTube);

  const bandPos = [];
  const bandUv = [];
  const bandIdx = [];
  for (let i = 0; i <= 12; i++) {
    const u = -1 + (2 * i) / 12;
    const p = pt(u, 1);
    bandPos.push(p[0], p[1] + 0.03, p[2] + 0.01, p[0], p[1] - 0.34, p[2] + 0.01);
    bandUv.push(i * 0.6, 1, i * 0.6, 0);
  }
  for (let i = 0; i < 12; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    bandIdx.push(a, b, c, b, d, c);
  }
  const bandGeo = new THREE.BufferGeometry();
  bandGeo.setAttribute('position', new THREE.Float32BufferAttribute(bandPos, 3));
  bandGeo.setAttribute('uv', new THREE.Float32BufferAttribute(bandUv, 2));
  bandGeo.setIndex(bandIdx);
  bandGeo.computeVertexNormals();
  const band = new THREE.Mesh(bandGeo, mats.soffit);
  band.receiveShadow = true;
  g.add(band);

  for (const side of [-1, 1]) {
    const sideCurve = new THREE.CatmullRomCurve3(edgePts(side).reverse());
    const tube = new THREE.Mesh(new THREE.TubeGeometry(sideCurve, 10, 0.11, 5, false), mats.fascia);
    tube.castShadow = true;
    g.add(tube);
  }

  const dotGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.12, 6);
  const dots = new THREE.InstancedMesh(dotGeo, mats.tileEnd, 12);
  dots.castShadow = false;
  const dummy = new THREE.Object3D();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1));
  for (let i = 0; i < 12; i++) {
    const u = -1 + (2 * (i + 0.5)) / 12;
    const p = pt(u, 1);
    dummy.position.set(p[0], p[1] - 0.28, p[2] + 0.11);
    dummy.quaternion.copy(q);
    dummy.updateMatrix();
    dots.setMatrixAt(i, dummy.matrix);
  }
  g.add(dots);

  for (const side of [-1, 1]) {
    const p = pt(side, 1);
    addPorchHorn(g, mats, p[0], p[1] - 0.02, p[2], side * 0.82, 0.57, 0.95);
  }

  return g;
}

function addPorch(parent, mats, {
  half,
  height,
  width,
  baseZ,
  depth,
  ground = false,
  plaque = null,
  backPlaque = null,
  lanterns = false,
}) {
  const frontZ = baseZ + depth;
  const roofProj = frontZ + 1.0 - half;
  const colX = width / 2 - 0.5;
  const beamY = height - 0.85;
  const deckTop = ground ? 0.2 : 0.22;

  for (let side = 0; side < 4; side++) {
    const rot = (side * Math.PI) / 2;
    const grp = new THREE.Group();
    grp.rotation.y = rot;
    parent.add(grp);

    if (ground) {
      const deck = new THREE.Mesh(new THREE.BoxGeometry(width + 0.8, 0.3, depth + 0.4), mats.stone);
      deck.position.set(0, 0.15, baseZ + depth / 2);
      deck.castShadow = true;
      deck.receiveShadow = true;
      grp.add(deck);
      const step = new THREE.Mesh(new THREE.BoxGeometry(width * 0.5, 0.14, 0.9), mats.stoneDark);
      step.position.set(0, 0.07, frontZ + 0.5);
      step.receiveShadow = true;
      grp.add(step);
    }

    const colGeo = new THREE.CylinderGeometry(ground ? 0.3 : 0.26, ground ? 0.34 : 0.3, height - 0.95, 10);
    const baseGeo = new THREE.CylinderGeometry(ground ? 0.42 : 0.38, ground ? 0.46 : 0.42, 0.24, 10);
    const cols = ground ? [-colX, -colX * 0.32, colX * 0.32, colX] : [-colX, colX];
    for (const cx of cols) {
      addMesh(grp, colGeo, mats.column, cx, deckTop + (height - 0.95) / 2, frontZ - 0.45);
      addMesh(grp, baseGeo, mats.stoneDark, cx, deckTop + 0.12, frontZ - 0.45);
    }

    const beam = addBox(grp, width + 0.2, 0.48, 0.34, mats.beam, 0, beamY, frontZ - 0.45);
    beam.castShadow = true;
    addBox(grp, width + 0.34, 0.08, 0.42, mats.gold, 0, beamY + 0.27, frontZ - 0.45);
    addBox(grp, width + 0.34, 0.07, 0.4, mats.gold, 0, beamY - 0.27, frontZ - 0.45);

    const roof = makePorchRoof(mats, {
      frontHalf: width / 2 + 0.8,
      backHalf: width * 0.3,
      proj: roofProj,
      drop: 0.88,
    });
    roof.position.set(0, height + 0.08, half);
    grp.add(roof);

    if (plaque && side === 0) {
      const plaqueWidth = width >= 15 ? 4.5 : 5.3;
      addPlaque(grp, mats, plaque, {
        width: plaqueWidth,
        y: beamY - 0.34 - (plaqueWidth / (1024 / 320)) / 2,
        z: frontZ - 0.28,
      });
    }
    if (backPlaque && side === 2) {
      addPlaque(grp, mats, backPlaque, {
        width: 5.0,
        y: beamY - 0.34 - (5.0 / (1024 / 320)) / 2,
        z: frontZ - 0.28,
      });
    }

    if (lanterns && side === 0) {
      for (const lx of [-3.5, 3.5, -7.2, 7.2]) {
        addLantern(grp, mats, lx, height - 2.85, frontZ - 0.55);
      }
    }
  }
}

function addColumns(parent, mats, half, height, bays, radius) {
  const positions = new Map();
  for (let side = 0; side < 4; side++) {
    const rot = (side * Math.PI) / 2;
    for (let k = 0; k <= bays; k++) {
      const t = -1 + (2 * k) / bays;
      const [x, z] = rotatePoint(t * half, half, rot);
      positions.set(`${x.toFixed(2)},${z.toFixed(2)}`, [x, z]);
    }
  }
  const geo = new THREE.CylinderGeometry(radius * 0.92, radius, height, 10);
  const baseGeo = new THREE.CylinderGeometry(radius * 1.3, radius * 1.45, 0.28, 10);
  for (const [x, z] of positions.values()) {
    addMesh(parent, geo, mats.column, x, 0.32 + height / 2, z);
    addMesh(parent, baseGeo, mats.stoneDark, x, 0.18, z);
  }
}

function addFacade(parent, mats, { half, height, bays, tierIndex }) {
  for (let side = 0; side < 4; side++) {
    const rot = (side * Math.PI) / 2;
    const grp = new THREE.Group();
    grp.rotation.y = rot;
    parent.add(grp);

    const wallW = half * 2 - 0.9;
    const winBottom = tierIndex === 0 ? 0.65 : 0.95;
    const winTop = tierIndex === 0 ? height - 2.3 : height - 1.8;
    const winH = winTop - winBottom;
    addBox(grp, wallW, height - 0.55, 0.34, mats.wall, 0, (height - 0.55) / 2, half - 0.5);
    addBox(grp, wallW, winBottom, 0.38, mats.woodDark, 0, winBottom / 2, half - 0.48);

    const bayW = wallW / bays;
    for (let k = 0; k < bays; k++) {
      const cx = -wallW / 2 + bayW * (k + 0.5);
      const w = bayW - 0.66;
      const isCenter = k === Math.floor(bays / 2);
      if (isCenter) {
        const doorW = w * 0.94;
        const doorH = tierIndex === 0 ? 4.6 : winH;
        const doorGeo = new THREE.PlaneGeometry(doorW, doorH);
        const uv = doorGeo.attributes.uv;
        for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * Math.max(1, doorW / 1.6), uv.getY(i));
        const doors = new THREE.Mesh(doorGeo, mats.window);
        doors.position.set(cx, winBottom + doorH / 2, half - 0.29);
        doors.castShadow = false;
        grp.add(doors);
        addBox(grp, doorW + 0.2, 0.14, 0.2, mats.woodDark, cx, winBottom - 0.05, half - 0.28);
        addBox(grp, doorW + 0.2, 0.14, 0.2, mats.woodDark, cx, winBottom + doorH + 0.05, half - 0.28);
        addBox(grp, 0.09, doorH, 0.1, mats.gold, cx, winBottom + doorH / 2, half - 0.2);
      } else {
        const winGeo = new THREE.PlaneGeometry(w, winH);
        const uv = winGeo.attributes.uv;
        for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * Math.max(1, w / 1.7), uv.getY(i));
        const win = new THREE.Mesh(winGeo, mats.window);
        win.position.set(cx, winBottom + winH / 2, half - 0.29);
        win.castShadow = false;
        grp.add(win);
        addBox(grp, w + 0.16, 0.13, 0.18, mats.woodDark, cx, winBottom - 0.04, half - 0.28);
        addBox(grp, w + 0.16, 0.13, 0.18, mats.woodDark, cx, winBottom + winH + 0.04, half - 0.28);
      }
    }

    addBox(grp, wallW + 0.5, 0.75, 0.38, mats.beam, 0, height - 1.02, half - 0.32);
    addBox(grp, wallW + 0.6, 0.07, 0.44, mats.gold, 0, height - 0.62, half - 0.32);
    addBox(grp, wallW + 0.6, 0.06, 0.44, mats.gold, 0, height - 1.41, half - 0.32);
  }
}

function addBracketRing(parent, mats, half, y) {
  const bracket = mergeGeometries([
    (() => { const g = new THREE.BoxGeometry(0.34, 0.5, 0.7); g.translate(0, 0, 0.2); return g; })(),
    (() => { const g = new THREE.BoxGeometry(0.8, 0.16, 0.88); g.translate(0, 0.25, 0.2); return g; })(),
    (() => { const g = new THREE.BoxGeometry(0.52, 0.2, 0.5); g.translate(0, -0.22, 0.06); return g; })(),
  ]);
  const per = Math.max(6, Math.round((half * 2) / 1.35));
  const total = per * 4;
  const inst = new THREE.InstancedMesh(bracket, mats.bracket, total);
  inst.castShadow = false;
  inst.receiveShadow = true;
  const dummy = new THREE.Object3D();
  let idx = 0;
  for (let side = 0; side < 4; side++) {
    const rot = (side * Math.PI) / 2;
    for (let k = 0; k < per; k++) {
      const t = -1 + (2 * (k + 0.5)) / per;
      const [x, z] = rotatePoint(t * half, half - 0.05, rot);
      dummy.position.set(x, y, z);
      dummy.rotation.set(0, rot, 0);
      dummy.updateMatrix();
      inst.setMatrixAt(idx++, dummy.matrix);
    }
  }
  parent.add(inst);
}

function makeRoof(mats, { eaveHalf, rise, ridgeHalf = 0, main = false, sagScale = 1 }) {
  const g = new THREE.Group();
  const eaveZ = eaveHalf;
  const isPyramid = ridgeHalf < 0.02;
  const nU = 34;
  const nV = 16;
  const sag = eaveHalf * 0.026 * sagScale;
  const lift = eaveHalf * 0.085;
  const flareX = eaveHalf * 0.052;
  const flareZ = eaveHalf * 0.06;
  const slopeLen = Math.hypot(rise, eaveHalf * 0.92);

  const cornerTerm = (u, v) => Math.pow(Math.abs(u), 9) * Math.pow(1 - v, 2.2);
  const baseY = (u, v) =>
    rise * Math.pow(v, 1.3) +
    lift * Math.pow(Math.abs(u), 9) * Math.pow(1 - v, 2.2) -
    sag * (1 - Math.pow(Math.abs(u), 1.6)) * Math.pow(1 - v, 2.2);

  const quadPoint = (u, v, sign = 1) => {
    const half = eaveHalf + (ridgeHalf - eaveHalf) * v;
    const ct = cornerTerm(u, v);
    const x = u * half + Math.sign(u) * flareX * ct;
    const z = (eaveHalf * (1 - v) + flareZ * ct) * sign;
    return [x, baseY(u, v), z];
  };

  const sidePoint = (u, v, sign = 1) => {
    const ct = cornerTerm(u, v);
    const x = (eaveHalf * (1 - v) + ridgeHalf * v) * sign + Math.sign(u) * flareX * ct;
    const z = u * eaveHalf * (1 - v) + Math.sign(u) * flareZ * ct;
    return [x, baseY(u, v), z];
  };

  const pyramidPoint = (u, v) => {
    const ct = cornerTerm(u, v);
    const x = u * eaveHalf * (1 - v) + Math.sign(u) * flareX * ct;
    const z = eaveHalf * (1 - v) + flareZ * ct;
    return [x, baseY(u, v), z];
  };

  const makeGeo = (pointFn, { apex = false, flip = false } = {}) => {
    const pos = [];
    const uv = [];
    const idx = [];
    const rows = apex ? nV : nV + 1;
    for (let j = 0; j < rows; j++) {
      const v = Math.pow(j / nV, 1.35);
      for (let i = 0; i <= nU; i++) {
        const u = -1 + (2 * i) / nU;
        const p = pointFn(u, v);
        pos.push(p[0], p[1], p[2]);
        uv.push((u * 0.5 + 0.5) * ((eaveHalf * 2) / 0.48), v * (slopeLen / 1.15));
      }
    }
    let apexIndex = -1;
    if (apex) {
      const p = pointFn(0, 1);
      apexIndex = pos.length / 3;
      pos.push(p[0], p[1], p[2]);
      uv.push(0.5 * ((eaveHalf * 2) / 0.48), slopeLen / 1.15);
    }
    for (let j = 0; j < nV; j++) {
      for (let i = 0; i < nU; i++) {
        const a = j * (nU + 1) + i;
        const b = a + 1;
        const c = a + nU + 1;
        const d = c + 1;
        if (apex && j === nV - 1) {
          if (flip) idx.push(a, apexIndex, b);
          else idx.push(a, b, apexIndex);
        } else if (apex) {
          if (flip) idx.push(a, c, b, b, c, d);
          else idx.push(a, b, c, b, d, c);
        } else if (flip) {
          idx.push(a, c, b, b, c, d);
        } else {
          idx.push(a, b, c, b, d, c);
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    return geo;
  };

  if (isPyramid) {
    const geo = makeGeo(pyramidPoint, { apex: true });
    for (let k = 0; k < 4; k++) {
      const m = new THREE.Mesh(geo, mats.roof);
      m.rotation.y = (k * Math.PI) / 2;
      m.castShadow = true;
      m.receiveShadow = true;
      g.add(m);
    }
  } else {
    const quadGeo = makeGeo((u, v) => quadPoint(u, v, 1));
    const quadBack = new THREE.Mesh(quadGeo, mats.roof);
    quadBack.rotation.y = Math.PI;
    quadBack.castShadow = true;
    quadBack.receiveShadow = true;
    g.add(quadBack);
    const quadFront = new THREE.Mesh(quadGeo, mats.roof);
    quadFront.castShadow = true;
    quadFront.receiveShadow = true;
    g.add(quadFront);

    const sideGeo = makeGeo((u, v) => sidePoint(u, v, 1), { apex: true, flip: true });
    const sideA = new THREE.Mesh(sideGeo, mats.roof);
    sideA.castShadow = true;
    sideA.receiveShadow = true;
    g.add(sideA);
    const sideB = new THREE.Mesh(sideGeo, mats.roof);
    sideB.rotation.y = Math.PI;
    sideB.castShadow = true;
    sideB.receiveShadow = true;
    g.add(sideB);
  }

  const eavePts = [];
  const samples = 32;
  for (let i = 0; i <= samples; i++) {
    const u = -1 + (2 * i) / samples;
    const p = isPyramid ? pyramidPoint(u, 0) : quadPoint(u, 0, 1);
    eavePts.push(new THREE.Vector3(p[0], p[1] - 0.11, p[2] + 0.12));
  }

  const tileDotGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.16, 8);
  const dotCount = samples;
  const dots = new THREE.InstancedMesh(tileDotGeo, mats.tileEnd, dotCount * 4);
  dots.castShadow = false;
  const dummy = new THREE.Object3D();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1));
  let dotIdx = 0;
  const bandGeos = [];

  for (let k = 0; k < 4; k++) {
    const rot = (k * Math.PI) / 2;
    const pts = eavePts.map((p) => {
      const [x, z] = rotatePoint(p.x, p.z, rot);
      return new THREE.Vector3(x, p.y, z);
    });
    const curve = new THREE.CatmullRomCurve3(pts);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 60, 0.14, 6, false), mats.fascia);
    tube.castShadow = true;
    tube.receiveShadow = true;
    g.add(tube);

    const bandPos = [];
    const bandUv = [];
    const bandIdx = [];
    for (let i = 0; i <= samples; i++) {
      const p = pts[i];
      bandPos.push(p.x * 1.003, p.y + 0.03, p.z * 1.003, p.x * 1.003, p.y - 0.5, p.z * 1.003);
      bandUv.push(i * 0.4, 1, i * 0.4, 0);
    }
    for (let i = 0; i < samples; i++) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      bandIdx.push(a, b, c, b, d, c);
    }
    const bandGeo = new THREE.BufferGeometry();
    bandGeo.setAttribute('position', new THREE.Float32BufferAttribute(bandPos, 3));
    bandGeo.setAttribute('uv', new THREE.Float32BufferAttribute(bandUv, 2));
    bandGeo.setIndex(bandIdx);
    bandGeo.computeVertexNormals();
    bandGeos.push(bandGeo);

    for (let i = 0; i < samples; i++) {
      const u = -1 + (2 * (i + 0.5)) / samples;
      const p = isPyramid ? pyramidPoint(u, 0) : quadPoint(u, 0, 1);
      const [x, z] = rotatePoint(p[0], p[2], rot);
      dummy.position.set(x * 1.018, p[1] - 0.36, z * 1.018);
      dummy.quaternion.copy(q).premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rot));
      dummy.updateMatrix();
      dots.setMatrixAt(dotIdx++, dummy.matrix);
    }
  }
  g.add(dots);

  if (bandGeos.length) {
    const band = new THREE.Mesh(mergeGeometries(bandGeos, false), mats.soffit);
    band.receiveShadow = true;
    g.add(band);
  }

  const cornerSigns = [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1],
  ];
  for (const [sx, sz] of cornerSigns) {
    const corner = isPyramid ? pyramidPoint(sx, 0) : quadPoint(sx, 0, sz);
    corner[2] = Math.abs(corner[2]) * sz;
    const dir = new THREE.Vector3(sx, 0, sz).normalize();
    const hornPts = [
      new THREE.Vector3(corner[0], corner[1] - 0.05, corner[2]),
      new THREE.Vector3(corner[0] + dir.x * 0.62, corner[1] + 0.42, corner[2] + dir.z * 0.62),
      new THREE.Vector3(corner[0] + dir.x * 1.12, corner[1] + 1.1, corner[2] + dir.z * 1.12),
      new THREE.Vector3(corner[0] + dir.x * 1.32, corner[1] + 1.78, corner[2] + dir.z * 1.32),
      new THREE.Vector3(corner[0] + dir.x * 1.16, corner[1] + 2.3, corner[2] + dir.z * 1.16),
    ];
    const hornCurve = new THREE.CatmullRomCurve3(hornPts);
    const horn = new THREE.Mesh(new THREE.TubeGeometry(hornCurve, 24, 0.18, 7, false), mats.ridge);
    horn.castShadow = true;
    horn.receiveShadow = true;
    g.add(horn);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.19, 8, 8), mats.gold);
    tip.position.copy(hornPts[hornPts.length - 1]);
    g.add(tip);
  }

  const hipPts = [];
  for (let i = 0; i <= 16; i++) {
    const v = i / 16;
    const p = isPyramid ? pyramidPoint(1, v) : quadPoint(1, v, 1);
    hipPts.push(new THREE.Vector3(p[0], p[1] + 0.07, p[2]));
  }
  const hipBase = new THREE.CatmullRomCurve3(hipPts);
  for (let k = 0; k < 4; k++) {
    const rot = (k * Math.PI) / 2;
    const pts = hipBase.points.map((p) => {
      const [x, z] = rotatePoint(p.x, p.z, rot);
      return new THREE.Vector3(x, p.y, z);
    });
    const hip = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 34, 0.155, 6, false), mats.ridge);
    hip.castShadow = true;
    hip.receiveShadow = true;
    g.add(hip);
  }

  if (!isPyramid) {
    const ridge = addBox(g, ridgeHalf * 2 + 0.3, 0.34, 0.5, mats.gold, 0, rise + 0.16, 0);
    ridge.castShadow = true;
    if (main) {
      for (const sx of [-1, 1]) {
        const pts = [
          new THREE.Vector3(sx * (ridgeHalf - 0.1), rise + 0.2, 0),
          new THREE.Vector3(sx * (ridgeHalf + 0.02), rise + 0.85, 0),
          new THREE.Vector3(sx * (ridgeHalf - 0.35), rise + 1.4, 0),
          new THREE.Vector3(sx * (ridgeHalf - 0.8), rise + 1.75, 0),
        ];
        const curl = new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.19, 6, false),
          mats.ridge
        );
        curl.castShadow = true;
        g.add(curl);
      }
    }
  }

  g.userData.eaveHalf = eaveHalf;
  g.userData.ridgeHalf = ridgeHalf;
  g.userData.rise = rise;
  return g;
}

function addPlaque(parent, mats, key, { width, y, z, rot = 0 }) {
  const spec = mats.plaques[key];
  const height = width / spec.aspect;
  const holder = new THREE.Group();
  holder.position.set(0, y, z);
  holder.rotation.y = rot;
  parent.add(holder);
  const back = addBox(holder, width + 0.25, height + 0.25, 0.16, mats.woodDark, 0, 0, 0);
  back.castShadow = true;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(width, height), spec.material);
  face.position.z = 0.085;
  holder.add(face);
  addBox(holder, width + 0.65, 0.12, 0.3, mats.gold, 0, height / 2 + 0.18, 0);
  addBox(holder, width + 0.65, 0.09, 0.26, mats.gold, 0, -height / 2 - 0.14, 0);
  return holder;
}

function addLantern(parent, mats, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.52, 14, 12), mats.lantern);
  body.scale.set(1, 1.15, 1);
  body.castShadow = true;
  g.add(body);
  const cap = addCylinder(g, 0.24, 0.24, 0.12, mats.gold, 0, 0.55, 0, 10);
  cap.castShadow = true;
  addCylinder(g, 0.18, 0.18, 0.1, mats.gold, 0, -0.55, 0, 10);
  addCylinder(g, 0.02, 0.02, 1.3, mats.woodDark, 0, 1.1, 0, 5);
  addCylinder(g, 0.05, 0.05, 0.5, mats.gold, 0, -0.85, 0, 6);
  const tassel = addCylinder(g, 0.16, 0.02, 0.32, mats.lantern, 0, -1.1, 0, 8);
  tassel.castShadow = true;
  return g;
}

function addTurret(mats, sx, sz) {
  const g = new THREE.Group();
  g.position.set(sx * 9.2, 0, sz * 9.2);
  g.rotation.y = Math.atan2(sx, sz);
  addBox(g, 2.7, 1.4, 2.7, mats.balcony, 0, 0.7, 0);
  addBox(g, 3.1, 2.5, 3.1, mats.wall, 0, 2.65, 0);
  addBox(g, 3.3, 0.6, 3.3, mats.beam, 0, 3.75, 0);
  addBox(g, 3.45, 0.09, 3.45, mats.gold, 0, 4.08, 0);
  for (let side = 0; side < 4; side++) {
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.5), mats.window);
    panel.rotation.y = (side * Math.PI) / 2;
    panel.position.set(Math.sin((side * Math.PI) / 2) * 1.57, 2.75, Math.cos((side * Math.PI) / 2) * 1.57);
    g.add(panel);
  }
  const roof = makeRoof(mats, { eaveHalf: 2.3, rise: 1.2, ridgeHalf: 0.7 });
  roof.position.y = 4.16;
  g.add(roof);
  return g;
}

function addCrown(mats) {
  const g = new THREE.Group();
  g.userData.partId = 'crown';

  addBox(g, 8.4, 2.1, 8.4, mats.balcony, 0, -1.05, 0);
  addBox(g, 8.8, 0.28, 8.8, mats.beam, 0, 0.02, 0);
  addBox(g, 7.6, 0.34, 7.6, mats.balcony, 0, 0.16, 0);

  addBox(g, 5.4, 2.6, 5.4, mats.woodDark, 0, 1.55, 0);
  for (let side = 0; side < 4; side++) {
    const rot = (side * Math.PI) / 2;
    const grp = new THREE.Group();
    grp.rotation.y = rot;
    g.add(grp);
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 2.2), mats.window);
    panel.position.set(0, 1.55, 2.72);
    grp.add(panel);
    for (let k = -1; k <= 1; k += 1) {
      addMesh(grp, new THREE.CylinderGeometry(0.16, 0.18, 2.6, 8), mats.column, k * 2.1, 1.55, 2.72);
    }
    addBox(grp, 5.5, 0.5, 0.35, mats.beam, 0, 2.9, 2.72);
    addBox(grp, 5.7, 0.08, 0.4, mats.gold, 0, 3.2, 2.72);
  }

  const roof = makeRoof(mats, { eaveHalf: 4.25, rise: 2.2, ridgeHalf: 0 });
  roof.position.y = 3.3;
  g.add(roof);

  const finial = new THREE.Group();
  finial.position.y = 5.55;
  g.add(finial);
  addCylinder(finial, 0.9, 1.0, 0.35, mats.ridge, 0, 0, 0, 12);
  const profile = [
    [0.0, 0.0], [0.52, 0.08], [0.7, 0.28], [0.58, 0.52], [0.28, 0.68],
    [0.18, 0.85], [0.5, 1.02], [0.56, 1.28], [0.34, 1.55], [0.14, 1.75],
    [0.12, 1.92], [0.26, 2.06], [0.16, 2.2], [0.0, 2.26],
  ].map(([r, h]) => new THREE.Vector2(r, h));
  const lathe = new THREE.LatheGeometry(profile, 18);
  const gold = new THREE.Mesh(lathe, mats.gold);
  gold.castShadow = true;
  finial.add(gold);
  addCylinder(finial, 0.03, 0.12, 0.55, mats.bronze, 0, 2.5, 0, 8);

  g.userData.anchor = new THREE.Vector3(0, 2.6, 0);
  return g;
}

function addSelectionRing(group, half, y, height = 2) {
  const corners = [
    [-half, -half],
    [half, -half],
    [half, half],
    [-half, half],
  ];
  const pts = [];
  for (let i = 0; i < 4; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % 4];
    pts.push(new THREE.Vector3(a[0], y, a[1]), new THREE.Vector3(b[0], y, b[1]));
    pts.push(new THREE.Vector3(a[0], y + height, a[1]), new THREE.Vector3(b[0], y + height, b[1]));
    pts.push(new THREE.Vector3(a[0], y, a[1]), new THREE.Vector3(a[0], y + height, a[1]));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({
    color: '#ffd98a',
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    depthTest: false,
  });
  const line = new THREE.LineSegments(geo, mat);
  line.visible = false;
  line.renderOrder = 20;
  group.add(line);
  return line;
}

export function createTower(materials) {
  const root = new THREE.Group();
  const platform = addPlatform(materials, root);

  const building = new THREE.Group();
  building.position.y = PLATFORM_TOP;
  root.add(building);

  const tiers = [];
  const tierData = [];

  for (let i = 0; i < 5; i++) {
    const tier = new THREE.Group();
    tier.position.y = BASE_Y[i];
    tier.userData.partId = `tier${i + 1}`;
    building.add(tier);

    const W = BODY_W[i];
    const H = BODY_H[i];
    const half = W / 2;
    const bays = i === 0 ? 5 : 3;
    const porchW = W * (i === 0 ? 0.58 : 0.56);
    const balconyHalf = half + 1.5;
    const porchDepth = i === 0 ? 5.0 : 2.4;
    const porchBaseZ = i === 0 ? half : balconyHalf;

    if (i > 0) {
      addBalcony(tier, materials, balconyHalf, 1.0, porchW, porchDepth);
    } else {
      addBox(tier, W + 1.4, 0.4, W + 1.4, materials.stoneDark, 0, 0.05, 0);
    }

    addColumns(tier, materials, half, H - 0.55, bays, i === 0 ? 0.42 : 0.33);
    addFacade(tier, materials, { half, height: H, bays, tierIndex: i });
    addBracketRing(tier, materials, half, H - 0.45);

    if (i === 0) {
      const outer = half + 1.9;
      const vHeight = H - 1.3;
      for (let side = 0; side < 4; side++) {
        const rot = (side * Math.PI) / 2;
        for (const t of [-0.72, 0.72]) {
          const [x, z] = rotatePoint(t * half, outer, rot);
          addCylinder(tier, 0.27, 0.31, vHeight, materials.column, x, vHeight / 2 + 0.35, z, 10);
          addCylinder(tier, 0.38, 0.42, 0.24, materials.stoneDark, x, 0.2, z, 10);
        }
      }
      for (let side = 0; side < 4; side++) {
        const rot = (side * Math.PI) / 2;
        const [bx, bz] = rotatePoint(0, outer, rot);
        addBox(tier, outer * 2 + 0.6, 0.42, 0.34, materials.beam, bx, 6.32, bz, rot);
      }
    }

    const roof = makeRoof(materials, {
      eaveHalf: EAVE_W[i] / 2,
      rise: ROOF_RISE[i],
      ridgeHalf: i === 4 ? EAVE_W[i] / 2 * 0.46 : EAVE_W[i] / 2 * 0.52,
      main: i === 4,
      sagScale: i === 4 ? 1.15 : 1,
    });
    roof.position.y = H;
    tier.add(roof);

    addPorch(tier, materials, {
      half,
      height: H,
      width: porchW,
      baseZ: porchBaseZ,
      depth: porchDepth,
      ground: i === 0,
      plaque: i === 0 ? 'ground' : i === 4 ? 'top' : null,
      backPlaque: i === 4 ? 'back' : null,
      lanterns: i === 0,
    });

    if (i === 4) {
      for (const [sx, sz] of [
        [1, 1],
        [-1, 1],
        [-1, -1],
        [1, -1],
      ]) {
        tier.add(addTurret(materials, sx, sz));
      }
    }

    tier.userData.anchor = new THREE.Vector3(0, H * 0.5, 0);
    tier.userData.baseY = BASE_Y[i];
    tier.userData.explode = 0.9 + i * 5.8;
    tier.userData.ring = addSelectionRing(tier, half + (i > 0 ? 1.5 : 0.2), 0.18, H + ROOF_RISE[i] * 0.5);
    tiers.push(tier);
    tierData.push({ i, W, H, half, bays });
  }

  const crown = addCrown(materials);
  const mainRoofTier = tiers[4];
  crown.position.y = 10.2;
  mainRoofTier.add(crown);
  crown.userData.ring = addSelectionRing(crown, 4.4, 0.2, 7.6);

  platform.userData.anchor = new THREE.Vector3(0, 1.2, 0);
  platform.userData.ring = addSelectionRing(platform, 24.3, 0.4, 2.4);

  const parts = {
    platform: { group: platform, data: PARTS.platform, anchor: new THREE.Vector3(0, 1.2, 0) },
    tier1: { group: tiers[0], data: PARTS.tier1, anchor: new THREE.Vector3(0, BODY_H[0] * 0.5, 0) },
    tier2: { group: tiers[1], data: PARTS.tier2, anchor: new THREE.Vector3(0, BODY_H[1] * 0.5, 0) },
    tier3: { group: tiers[2], data: PARTS.tier3, anchor: new THREE.Vector3(0, BODY_H[2] * 0.5, 0) },
    tier4: { group: tiers[3], data: PARTS.tier4, anchor: new THREE.Vector3(0, BODY_H[3] * 0.5, 0) },
    tier5: { group: tiers[4], data: PARTS.tier5, anchor: new THREE.Vector3(0, BODY_H[4] * 0.5, 0) },
    crown: { group: crown, data: PARTS.crown, anchor: new THREE.Vector3(0, 2.8, 0) },
  };

  const pickables = [];
  root.traverse((obj) => {
    if (obj.isMesh || obj.isInstancedMesh) {
      obj.userData.isPickable = true;
      pickables.push(obj);
    }
  });

  const totalHeight = PLATFORM_TOP + BASE_Y[4] + 10.2 + 5.55 + 2.26;
  let explodeT = 0;
  let selected = null;

  function setExplode(t) {
    explodeT = t;
    for (const tier of tiers) {
      tier.position.y = tier.userData.baseY + tier.userData.explode * t;
    }
  }

  function setSelected(partId) {
    selected = partId;
    for (const [id, part] of Object.entries(parts)) {
      if (part.group.userData.ring) part.group.userData.ring.visible = id === partId;
    }
  }

  function setNight(n) {
    materials.adaptive.window.emissiveIntensity = 0.02 + n * 0.5;
    materials.adaptive.lantern.emissiveIntensity = 0.28 + n * 0.6;
  }

  function partIdForObject(obj) {
    let o = obj;
    while (o) {
      if (o.userData && o.userData.partId) return o.userData.partId;
      o = o.parent;
    }
    return null;
  }

  return {
    group: root,
    pickables,
    parts,
    totalHeight,
    explodeT: () => explodeT,
    setExplode,
    setSelected,
    setNight,
    partIdForObject,
  };
}
