/* ============================================================
   HERO — Three.js Neural Network Particle System
   ============================================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  /* ── Scene setup ──────────────────────────────────────────── */
  var scene    = new THREE.Scene();
  var W        = window.innerWidth;
  var H        = window.innerHeight;
  var camera   = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  camera.position.set(0, 0, 35);

  /* ── Particle data ────────────────────────────────────────── */
  var PARTICLE_COUNT = window.innerWidth < 768 ? 70 : 130;
  var CONNECT_DIST   = window.innerWidth < 768 ?  9 : 13;
  var MAX_LINES      = PARTICLE_COUNT * (PARTICLE_COUNT - 1) / 2;

  var particles = [];
  for (var i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x:  (Math.random() - 0.5) * 56,
      y:  (Math.random() - 0.5) * 36,
      z:  (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 0.038,
      vy: (Math.random() - 0.5) * 0.028,
      vz: (Math.random() - 0.5) * 0.015,
    });
  }

  /* ── Points geometry ──────────────────────────────────────── */
  var ptGeo  = new THREE.BufferGeometry();
  var ptPos  = new Float32Array(PARTICLE_COUNT * 3);
  ptGeo.setAttribute('position', new THREE.BufferAttribute(ptPos, 3));

  var ptMat  = new THREE.PointsMaterial({
    color: 0x00d4ff,
    size: window.innerWidth < 768 ? 0.22 : 0.28,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
  });
  var points = new THREE.Points(ptGeo, ptMat);
  scene.add(points);

  /* ── Lines geometry ───────────────────────────────────────── */
  var linePos = new Float32Array(MAX_LINES * 6);
  var lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));

  var lineMat = new THREE.LineBasicMaterial({
    color: 0x00d4ff,
    transparent: true,
    opacity: 0.18,
  });
  var lineSegs = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lineSegs);

  /* ── Mouse parallax ───────────────────────────────────────── */
  var mouseX = 0, mouseY = 0;
  var targetX = 0, targetY = 0;

  document.addEventListener('mousemove', function (e) {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* ── Animate ──────────────────────────────────────────────── */
  var clock = 0;

  function animate() {
    requestAnimationFrame(animate);
    clock += 0.004;

    /* Move particles */
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;

      /* Soft boundary bounce */
      if (p.x >  28 || p.x < -28) p.vx *= -1;
      if (p.y >  18 || p.y < -18) p.vy *= -1;
      if (p.z >  10 || p.z < -10) p.vz *= -1;

      ptPos[i * 3]     = p.x;
      ptPos[i * 3 + 1] = p.y;
      ptPos[i * 3 + 2] = p.z;
    }
    ptGeo.attributes.position.needsUpdate = true;

    /* Build connection lines */
    var li = 0;
    for (var a = 0; a < PARTICLE_COUNT; a++) {
      for (var b = a + 1; b < PARTICLE_COUNT; b++) {
        var dx = particles[a].x - particles[b].x;
        var dy = particles[a].y - particles[b].y;
        var dz = particles[a].z - particles[b].z;
        var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < CONNECT_DIST) {
          linePos[li * 6]     = particles[a].x;
          linePos[li * 6 + 1] = particles[a].y;
          linePos[li * 6 + 2] = particles[a].z;
          linePos[li * 6 + 3] = particles[b].x;
          linePos[li * 6 + 4] = particles[b].y;
          linePos[li * 6 + 5] = particles[b].z;
          li++;
        }
      }
    }
    lineGeo.setDrawRange(0, li * 2);
    lineGeo.attributes.position.needsUpdate = true;

    /* Parallax camera */
    targetX += (mouseX * 3.5 - targetX) * 0.04;
    targetY += (-mouseY * 2.5 - targetY) * 0.04;
    camera.position.x = targetX;
    camera.position.y = targetY;
    camera.lookAt(scene.position);

    /* Slow scene rotation */
    scene.rotation.y = Math.sin(clock * 0.25) * 0.08;
    scene.rotation.x = Math.cos(clock * 0.18) * 0.05;

    renderer.render(scene, camera);
  }

  animate();

  /* ── Resize ───────────────────────────────────────────────── */
  window.addEventListener('resize', function () {
    W = window.innerWidth;
    H = window.innerHeight;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  /* ── Scroll parallax on hero canvas ──────────────────────── */
  window.addEventListener('scroll', function () {
    var scrollY = window.scrollY;
    var heroH   = document.getElementById('hero').offsetHeight;
    var progress = Math.min(scrollY / heroH, 1);
    // Fade and scale canvas on scroll
    canvas.style.opacity = 1 - progress * 1.2;
    canvas.style.transform = 'scale(' + (1 + progress * 0.08) + ')';
  });

}());
