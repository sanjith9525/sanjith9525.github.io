/* ============================================================
   NEURAL NETWORK NODE GAME
   Click to create nodes — they auto-connect when nearby.
   ============================================================ */
(function () {
  'use strict';

  var canvas    = document.getElementById('game-canvas');
  var clearBtn  = document.getElementById('game-clear');
  var nodeCount = document.getElementById('node-count');

  if (!canvas) return;

  var ctx   = canvas.getContext('2d');
  var nodes = [];
  var CONNECT_RADIUS = 130;
  var RAF_ID = null;

  /* ── Resize canvas to display size ───────────────────────── */
  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── Click to add node ────────────────────────────────────── */
  canvas.addEventListener('click', function (e) {
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    /* Don't add if clicking clear button */
    nodes.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      phase: Math.random() * Math.PI * 2,
      id: Date.now(),
      birth: performance.now(),
    });

    if (nodeCount) nodeCount.textContent = nodes.length;
    if (!RAF_ID) loop();
  });

  /* ── Clear ────────────────────────────────────────────────── */
  if (clearBtn) {
    clearBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      nodes.length = 0;
      if (nodeCount) nodeCount.textContent = '0';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (RAF_ID) { cancelAnimationFrame(RAF_ID); RAF_ID = null; }
    });
  }

  /* ── Draw loop ────────────────────────────────────────────── */
  function loop() {
    RAF_ID = requestAnimationFrame(loop);

    /* Subtle fade trail */
    ctx.fillStyle = 'rgba(13,22,48,0.35)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var t = performance.now() / 1000;

    /* Drift nodes slowly */
    nodes.forEach(function (n) {
      n.x += n.vx;
      n.y += n.vy;

      /* Soft bounce at edges */
      if (n.x < 10 || n.x > canvas.width  - 10) { n.vx *= -1; n.x = Math.max(10, Math.min(canvas.width - 10, n.x)); }
      if (n.y < 10 || n.y > canvas.height - 10) { n.vy *= -1; n.y = Math.max(10, Math.min(canvas.height - 10, n.y)); }
    });

    /* Draw connections */
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var dx   = nodes[i].x - nodes[j].x;
        var dy   = nodes[i].y - nodes[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECT_RADIUS) {
          var alpha = (1 - dist / CONNECT_RADIUS) * 0.65;
          var pulse = 0.7 + 0.3 * Math.sin(t * 1.8 + nodes[i].phase + nodes[j].phase);

          /* Gradient line */
          var grad = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
          grad.addColorStop(0, 'rgba(0,212,255,' + (alpha * pulse).toFixed(3) + ')');
          grad.addColorStop(1, 'rgba(0,245,255,' + (alpha * pulse * 0.6).toFixed(3) + ')');

          ctx.beginPath();
          ctx.strokeStyle = grad;
          ctx.lineWidth   = alpha * 2.2;
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();

          /* Travelling pulse dot along connection */
          if (Math.random() < 0.004) {
            var frac = (Math.sin(t * 3 + i * 0.7 + j * 0.5) + 1) / 2;
            var px   = nodes[i].x + (nodes[j].x - nodes[i].x) * frac;
            var py   = nodes[i].y + (nodes[j].y - nodes[i].y) * frac;
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,255,180,0.9)';
            ctx.fill();
          }
        }
      }
    }

    /* Draw nodes */
    nodes.forEach(function (n) {
      var age   = Math.min((performance.now() - n.birth) / 400, 1);
      var pulse = 0.72 + 0.28 * Math.sin(t * 2.2 + n.phase);
      var r     = 14 * age;

      /* Outer glow */
      var grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2.2);
      grd.addColorStop(0,   'rgba(0,212,255,' + (0.35 * pulse * age).toFixed(3) + ')');
      grd.addColorStop(0.5, 'rgba(0,212,255,' + (0.12 * pulse * age).toFixed(3) + ')');
      grd.addColorStop(1,   'rgba(0,212,255,0)');
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      /* Halo ring */
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,212,255,' + (0.5 * pulse * age).toFixed(3) + ')';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      /* Core dot */
      ctx.beginPath();
      ctx.arc(n.x, n.y, 4 * age, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,245,255,' + (pulse * age).toFixed(3) + ')';
      ctx.shadowColor = '#00d4ff';
      ctx.shadowBlur  = 10;
      ctx.fill();
      ctx.shadowBlur  = 0;
    });

    /* Stop loop if no nodes */
    if (nodes.length === 0) {
      cancelAnimationFrame(RAF_ID);
      RAF_ID = null;
    }
  }

}());
