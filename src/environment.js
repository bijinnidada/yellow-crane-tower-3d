import * as THREE from 'three';

function rand(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function makeSky() {
  const geo = new THREE.SphereGeometry(460, 40, 24);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    toneMapped: false,
    uniforms: {
      uTop: { value: new THREE.Color('#3f90d9') },
      uHorizon: { value: new THREE.Color('#d3eaf7') },
      uBottom: { value: new THREE.Color('#c4ccc9') },
      uSunColor: { value: new THREE.Color('#ffdca8') },
      uSunDir: { value: new THREE.Vector3(0.48, 0.62, 0.62).normalize() },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop;
      uniform vec3 uHorizon;
      uniform vec3 uBottom;
      uniform vec3 uSunColor;
      uniform vec3 uSunDir;
      varying vec3 vWorld;
      void main() {
        vec3 dir = normalize(vWorld - cameraPosition);
        float h = dir.y;
        float t = pow(clamp(h, 0.0, 1.0), 0.48);
        vec3 col = mix(uHorizon, uTop, t);
        col = mix(col, uBottom, smoothstep(0.0, -0.3, h));
        float sd = max(dot(dir, normalize(uSunDir)), 0.0);
        col += uSunColor * (pow(sd, 700.0) * 1.4 + pow(sd, 9.0) * 0.1);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  return { mesh, mat };
}

function makeStars() {
  const r = rand(17);
  const count = 700;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = r() * Math.PI * 2;
    const y = 0.08 + r() * 0.9;
    const radius = 420;
    const horiz = Math.sqrt(1 - y * y);
    positions[i * 3] = Math.cos(theta) * horiz * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * horiz * radius;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: '#dfe7ff',
    size: 2.1,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    fog: false,
  });
  return { points: new THREE.Points(geo, mat), mat };
}

function makePine(mats, scale = 1) {
  const g = new THREE.Group();
  const r = rand(Math.floor(scale * 1000) + 5);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.5, 4.6, 7), mats.bark);
  trunk.position.y = 2.3;
  trunk.castShadow = true;
  g.add(trunk);

  for (let i = 0; i < 6; i++) {
    const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1.9 + r() * 1.1, 1), i % 2 ? mats.pine : mats.pineDark);
    blob.position.set((r() - 0.5) * 2.8, 4.9 + r() * 2.6, (r() - 0.5) * 2.8);
    blob.scale.set(1.5 + r() * 0.5, 0.8 + r() * 0.35, 1.3 + r() * 0.5);
    blob.rotation.set(r() * 3, r() * 3, r() * 3);
    blob.castShadow = true;
    blob.receiveShadow = true;
    g.add(blob);
  }
  g.scale.setScalar(scale);
  g.rotation.y = r() * Math.PI * 2;
  return g;
}

function wingGeometry(points, depth = 0.06) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  geo.rotateX(Math.PI / 2);
  return geo;
}

function makeCrane(mats, scale = 1) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 8), mats.crane);
  body.scale.set(0.5, 0.42, 1.5);
  body.castShadow = true;
  g.add(body);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.1, 1.6, 6), mats.crane);
  neck.position.set(0, 0.42, 1.1);
  neck.rotation.x = 0.62;
  g.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), mats.crane);
  head.position.set(0, 0.92, 1.66);
  g.add(head);

  const crown = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 5), mats.lantern);
  crown.position.set(0, 1.03, 1.63);
  g.add(crown);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.42, 6), mats.gold);
  beak.position.set(0, 0.9, 1.95);
  beak.rotation.x = Math.PI / 2;
  g.add(beak);

  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.7), mats.craneDark);
  tail.position.set(0, 0.06, -1.0);
  g.add(tail);

  for (const sx of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 1.25, 5), mats.craneDark);
    leg.position.set(sx * 0.1, -0.2, -0.6);
    leg.rotation.x = Math.PI / 2 - 0.15;
    g.add(leg);
  }

  const wingPts = [
    [0.0, 0.3], [0.9, 0.24], [1.85, 0.08], [2.45, -0.18],
    [2.1, -0.4], [1.3, -0.52], [0.6, -0.6], [0.0, -0.5],
  ];
  const tipPts = [
    [1.75, 0.11], [2.45, -0.18], [2.1, -0.4], [1.6, -0.32],
  ];
  const wings = [];
  for (const sx of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.22, 0.16, 0.05);
    pivot.scale.x = sx;
    g.add(pivot);
    const wing = new THREE.Mesh(wingGeometry(wingPts), mats.crane);
    wing.castShadow = true;
    pivot.add(wing);
    const tip = new THREE.Mesh(wingGeometry(tipPts, 0.065), mats.craneDark);
    tip.position.y = 0.002;
    pivot.add(tip);
    wings.push({ pivot, sx });
  }

  g.scale.setScalar(scale);
  g.userData.wings = wings;
  return g;
}

export function createEnvironment(scene, mats) {
  const sky = makeSky();
  scene.add(sky.mesh);

  const stars = makeStars();
  scene.add(stars.points);

  const ground = new THREE.Mesh(new THREE.CircleGeometry(360, 80), mats.plaza);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(27.5, 28.2, 128),
    new THREE.MeshStandardMaterial({ color: '#8d744a', roughness: 0.55, metalness: 0.35 })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  scene.add(ring);

  const ring2 = new THREE.Mesh(
    new THREE.RingGeometry(34, 34.4, 128),
    new THREE.MeshStandardMaterial({ color: '#9a917f', roughness: 0.9 })
  );
  ring2.rotation.x = -Math.PI / 2;
  ring2.position.y = 0.02;
  scene.add(ring2);

  const mountains = new THREE.Group();
  const mr = rand(77);
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2 + mr() * 0.2;
    const dist = 260 + mr() * 140;
    const height = 16 + mr() * 26;
    const radius = 80 + mr() * 90;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 6 + Math.floor(mr() * 3)), mats.hill);
    cone.position.set(Math.cos(angle) * dist, height / 2 - 6, Math.sin(angle) * dist);
    cone.rotation.y = mr() * Math.PI;
    cone.receiveShadow = false;
    cone.castShadow = false;
    mountains.add(cone);
  }
  scene.add(mountains);

  const trees = new THREE.Group();
  const treeSpots = [
    [-38, 26, 1.0],
    [-44, -16, 0.95],
    [40, -28, 1.0],
    [48, 6, 1.05],
    [-28, 42, 0.7],
    [32, 42, 0.65],
    [-60, 6, 0.85],
    [-54, -34, 0.8],
    [20, -50, 0.75],
    [58, 24, 0.7],
  ];
  treeSpots.forEach(([x, z, s], i) => {
    const tree = makePine(mats, s);
    tree.position.set(x, 0, z);
    tree.rotation.y = i * 1.7;
    trees.add(tree);
  });
  scene.add(trees);

  const clouds = new THREE.Group();
  const cloudMat = new THREE.SpriteMaterial({
    map: mats.cloud,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    color: '#ffffff',
  });
  const cr = rand(9);
  for (let i = 0; i < 5; i++) {
    const sprite = new THREE.Sprite(cloudMat.clone());
    const angle = cr() * Math.PI * 2;
    const dist = 240 + cr() * 120;
    sprite.position.set(Math.cos(angle) * dist, 52 + cr() * 34, Math.sin(angle) * dist);
    const s = 46 + cr() * 48;
    sprite.scale.set(s, s * 0.36, 1);
    clouds.add(sprite);
  }
  scene.add(clouds);

  const mistMat = new THREE.MeshBasicMaterial({
    map: mats.mist,
    transparent: true,
    opacity: 0.13,
    depthWrite: false,
    color: '#efe9dc',
    fog: false,
  });
  const mists = [];
  for (let i = 0; i < 3; i++) {
    const mist = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mistMat.clone());
    mist.rotation.x = -Math.PI / 2;
    mist.scale.set(150 + i * 40, 150 + i * 40, 1);
    mist.position.set(0, 1.4 + i * 2.6, 0);
    mist.material.opacity = 0.12 - i * 0.03;
    mist.renderOrder = 2;
    scene.add(mist);
    mists.push(mist);
  }

  const cranes = new THREE.Group();
  scene.add(cranes);
  const craneList = [];
  const craneSpecs = [
    { radius: 54, height: 47, speed: 0.05, phase: 0.4, scale: 1.05 },
    { radius: 64, height: 53, speed: 0.042, phase: 2.4, scale: 1.15 },
    { radius: 49, height: 42, speed: 0.058, phase: 4.6, scale: 0.95 },
  ];
  craneSpecs.forEach((spec) => {
    const crane = makeCrane(mats, spec.scale);
    cranes.add(crane);
    craneList.push({ crane, ...spec });
  });

  const dayCols = {
    top: new THREE.Color('#3f90d9'),
    horizon: new THREE.Color('#d3eaf7'),
    bottom: new THREE.Color('#c4ccc9'),
    sun: new THREE.Color('#ffdca8'),
  };
  const nightCols = {
    top: new THREE.Color('#040811'),
    horizon: new THREE.Color('#16233a'),
    bottom: new THREE.Color('#0a111c'),
    sun: new THREE.Color('#a7c1ee'),
  };
  const daySunDir = new THREE.Vector3(0.48, 0.62, 0.62).normalize();
  const nightSunDir = new THREE.Vector3(-0.45, 0.5, -0.55).normalize();
  let night = 0;

  function setNight(n) {
    night = THREE.MathUtils.clamp(n, 0, 1);
    sky.mat.uniforms.uTop.value.copy(dayCols.top).lerp(nightCols.top, night);
    sky.mat.uniforms.uHorizon.value.copy(dayCols.horizon).lerp(nightCols.horizon, night);
    sky.mat.uniforms.uBottom.value.copy(dayCols.bottom).lerp(nightCols.bottom, night);
    sky.mat.uniforms.uSunColor.value.copy(dayCols.sun).lerp(nightCols.sun, night);
    sky.mat.uniforms.uSunDir.value.copy(daySunDir).lerp(nightSunDir, night).normalize();
    stars.mat.opacity = night * 0.9;
    for (const child of clouds.children) {
      child.material.opacity = 0.16 - night * 0.1;
      child.material.color.copy(new THREE.Color('#ffffff')).lerp(new THREE.Color('#5b6f95'), night);
    }
    for (const mist of mists) {
      mist.material.color.copy(new THREE.Color('#efe9dc')).lerp(new THREE.Color('#8fa2c4'), night);
      mist.material.opacity = (0.12 - mists.indexOf(mist) * 0.03) * (1 - night * 0.35);
    }
  }

  function update(dt, t) {
    clouds.rotation.y += dt * 0.0035;
    mists.forEach((mist, i) => {
      mist.rotation.z += dt * (0.006 + i * 0.002) * (i % 2 ? -1 : 1);
    });
    for (const item of craneList) {
      const a = t * item.speed + item.phase;
      const r = item.radius;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const y = item.height + Math.sin(t * 0.35 + item.phase) * 0.8;
      item.crane.position.set(x, y, z);
      const nextA = a + 0.05;
      item.crane.lookAt(Math.cos(nextA) * r, y, Math.sin(nextA) * r);
      const flap = Math.sin(t * 4.2 + item.phase) * 0.32;
      for (const { pivot, sx } of item.crane.userData.wings) {
        pivot.rotation.z = sx * (0.16 + flap);
      }
    }
  }

  return { setNight, update, sky: sky.mesh };
}
