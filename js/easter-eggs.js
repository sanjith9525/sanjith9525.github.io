/* ============================================================
   EASTER EGGS
   · Console ASCII art
   · Konami code → Matrix rain
   · ` key → fake terminal
   · matrix() command
   ============================================================ */
(function () {
  'use strict';

  /* ── Console Easter Egg ───────────────────────────────────── */
  var art = [
    ' ____    _    _   _ _ ___ _____ _   _',
    '/ ___|  / \\  | \\ | | |_ _|_   _| | | |',
    '\\___ \\ / _ \\ |  \\| |  | |  | | | |_| |',
    ' ___) / ___ \\| |\\  |  | |  | | |  _  |',
    '|____/_/   \\_\\_| \\_| |___| |_| |_| |_|',
  ].join('\n');

  console.log('%c' + art,
    'color:#00d4ff;font-family:monospace;line-height:1.4;font-size:12px;');
  console.log('%c👋 Hey curious dev!', 'color:#00ffff;font-size:16px;font-weight:bold;');
  console.log('%cYou found the source. That means you might be exactly the kind of person I want to work with.',
    'color:#94a3b8;font-size:13px;');
  console.log('%c📧  sanjith9525@gmail.com', 'color:#ffffff;font-size:14px;');
  console.log('%c🔗  linkedin.com/in/sanjith-edwin', 'color:#00d4ff;font-size:13px;');
  console.log('%c(Also try pressing ` for a terminal, or the Konami code ↑↑↓↓←→←→BA)',
    'color:#475569;font-size:11px;');

  /* ── Matrix Rain ──────────────────────────────────────────── */
  var matrixActive = false;
  var matrixTimer  = null;
  var matrixRAF    = null;

  function triggerMatrix(duration) {
    if (matrixActive) return;
    matrixActive = true;

    var overlay = document.getElementById('matrix-overlay');
    var canvas  = document.getElementById('matrix-canvas');
    var ctx     = canvas.getContext('2d');

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    overlay.style.display = 'block';

    var COLS   = Math.floor(canvas.width / 14);
    var drops  = new Array(COLS).fill(1);
    var CHARS  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' +
                 '0123456789@#$%&*<>|/\\~^ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ';

    function drawMatrix() {
      ctx.fillStyle = 'rgba(0,0,0,0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (var i = 0; i < COLS; i++) {
        var char = CHARS[Math.floor(Math.random() * CHARS.length)];

        /* Bright head */
        ctx.fillStyle = '#aaffaa';
        ctx.font = '13px JetBrains Mono, monospace';
        ctx.fillText(char, i * 14, drops[i] * 14);

        /* Trailing characters */
        ctx.fillStyle = '#00ff41';
        ctx.font = '13px JetBrains Mono, monospace';
        var trail = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(trail, i * 14, (drops[i] - 1) * 14);

        if (drops[i] * 14 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      matrixRAF = requestAnimationFrame(drawMatrix);
    }

    drawMatrix();

    matrixTimer = setTimeout(function () {
      cancelAnimationFrame(matrixRAF);
      overlay.style.display = 'none';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      matrixActive = false;
    }, duration || 5000);
  }

  /* Expose globally so terminal can call it */
  window.triggerMatrix = triggerMatrix;

  /* ── Konami Code ──────────────────────────────────────────── */
  var KONAMI = [
    'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
    'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
    'b','a',
  ];
  var konamiIdx = 0;

  document.addEventListener('keydown', function (e) {
    /* Skip if terminal input focused */
    if (document.activeElement && document.activeElement.id === 'term-input') return;

    if (e.key === KONAMI[konamiIdx]) {
      konamiIdx++;
      if (konamiIdx === KONAMI.length) {
        konamiIdx = 0;
        showNotif('KONAMI CODE ACTIVATED 🎮');
        setTimeout(triggerMatrix, 600);
      }
    } else {
      konamiIdx = 0;
      /* Re-check current key as start of new sequence */
      if (e.key === KONAMI[0]) konamiIdx = 1;
    }
  });

  /* Small toast notification */
  function showNotif(msg) {
    var n = document.createElement('div');
    n.textContent = msg;
    n.style.cssText = [
      'position:fixed','top:100px','left:50%',
      'transform:translateX(-50%) scale(.9)',
      'background:rgba(0,212,255,.15)',
      'border:1px solid rgba(0,212,255,.4)',
      'color:#00d4ff','padding:10px 22px','border-radius:6px',
      'font-family:JetBrains Mono,monospace','font-size:.85rem',
      'letter-spacing:2px','z-index:99989',
      'transition:transform .3s,opacity .3s','opacity:0',
      'backdrop-filter:blur(10px)',
    ].join(';');
    document.body.appendChild(n);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        n.style.transform = 'translateX(-50%) scale(1)';
        n.style.opacity = '1';
      });
    });
    setTimeout(function () {
      n.style.opacity = '0';
      setTimeout(function () { n.remove(); }, 400);
    }, 2800);
  }

  /* ── Terminal ─────────────────────────────────────────────── */
  var term       = document.getElementById('terminal');
  var termOutput = document.getElementById('term-output');
  var termInput  = document.getElementById('term-input');
  var termClose  = document.getElementById('term-close');
  var termOpen   = false;

  function openTerminal() {
    if (!termOpen) {
      term.classList.add('open');
      term.setAttribute('aria-hidden', 'false');
      termOpen = true;
      setTimeout(function () { termInput.focus(); }, 50);
    }
  }

  function closeTerminal() {
    if (termOpen) {
      term.classList.remove('open');
      term.setAttribute('aria-hidden', 'true');
      termOpen = false;
    }
  }

  /* Backtick toggles terminal */
  document.addEventListener('keydown', function (e) {
    if (e.key === '`') {
      e.preventDefault();
      if (termOpen) { closeTerminal(); } else { openTerminal(); }
    }
    if (e.key === 'Escape' && termOpen) { closeTerminal(); }
  });

  if (termClose) termClose.addEventListener('click', closeTerminal);

  /* Drag to move terminal */
  var termBar = term.querySelector('.term-bar');
  var dragging = false, dragStartX, dragStartY, termStartX, termStartY;

  termBar.addEventListener('mousedown', function (e) {
    dragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    var r = term.getBoundingClientRect();
    termStartX = r.left + r.width  / 2;
    termStartY = r.top  + r.height / 2;
    term.style.transition = 'none';
  });

  document.addEventListener('mousemove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - dragStartX;
    var dy = e.clientY - dragStartY;
    term.style.left = (termStartX + dx) + 'px';
    term.style.top  = (termStartY + dy) + 'px';
    term.style.transform = 'translate(-50%,-50%)';
  });

  document.addEventListener('mouseup', function () {
    if (dragging) {
      dragging = false;
      term.style.transition = '';
    }
  });

  /* ── Terminal commands ────────────────────────────────────── */
  var COMMANDS = {
    help: [
      'Available commands:',
      '',
      '  <span class="term-accent">whoami</span>   — About Sanjith',
      '  <span class="term-accent">skills</span>   — List tech stack',
      '  <span class="term-accent">exp</span>      — Work history',
      '  <span class="term-accent">hire</span>     — Contact information',
      '  <span class="term-accent">github</span>   — Open GitHub',
      '  <span class="term-accent">matrix</span>   — You know what this does',
      '  <span class="term-accent">clear</span>    — Clear terminal',
      '  <span class="term-accent">exit</span>     — Close terminal',
    ].join('\n'),

    whoami: [
      'Sanjith Edwin',
      'Senior AI &amp; Backend Engineer',
      'Location: Abu Dhabi, UAE',
      '',
      '7+ years shipping production systems.',
      'Currently leading AI &amp; Backend at Wizcommerce.',
      'Won All India Hackathon (1st place).',
    ].join('\n'),

    skills: [
      '── AI / ML ─────────────────────',
      '  LLMs, RAG, LangChain, LangGraph',
      '  AI Agents, MCP, Vector DBs',
      '  OpenAI, Anthropic, Whisper',
      '',
      '── Backend ─────────────────────',
      '  Python, FastAPI, Django, Go',
      '  Elasticsearch, PostgreSQL, Redis',
      '  Kafka, GraphQL, gRPC',
      '',
      '── Infrastructure ───────────────',
      '  GKE, Cloud Run, Docker, GCP',
      '  Pub/Sub, Terraform, CI/CD',
    ].join('\n'),

    exp: [
      'Wizcommerce    2023–Present  Tech Lead AI &amp; Backend',
      'Dunzo          2022–2023     Software Engineer II',
      'Esaver         2021–2022     Software Engineer',
      'Cisco          2018–2020     Software Engineer II',
    ].join('\n'),

    hire: [
      '┌──────────────────────────────────────────┐',
      '│  📧  sanjith9525@gmail.com               │',
      '│  💼  linkedin.com/in/sanjith-edwin       │',
      '│  ⚡  github.com/sanjith-edwin           │',
      '│  📍  Abu Dhabi, UAE                      │',
      '└──────────────────────────────────────────┘',
    ].join('\n'),

    github: function () {
      window.open('https://github.com/sanjith-edwin', '_blank');
      return 'Opening GitHub...';
    },

    matrix: function () {
      triggerMatrix(5000);
      return 'Initiating matrix sequence... 🟩';
    },

    clear: function () {
      termOutput.innerHTML = '';
      return null;
    },

    exit: function () {
      closeTerminal();
      return null;
    },
  };

  /* Command history */
  var history = [];
  var histIdx = -1;

  termInput.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < history.length - 1) {
        histIdx++;
        termInput.value = history[history.length - 1 - histIdx];
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) {
        histIdx--;
        termInput.value = history[history.length - 1 - histIdx];
      } else {
        histIdx = -1;
        termInput.value = '';
      }
      return;
    }
    if (e.key !== 'Enter') return;

    var raw = termInput.value.trim();
    termInput.value = '';
    histIdx = -1;

    /* Echo command */
    var echoEl = document.createElement('div');
    echoEl.className = 'term-line';
    echoEl.innerHTML = '<span class="term-green">sanjith@portfolio:~$</span> ' + escHtml(raw);
    termOutput.appendChild(echoEl);

    if (!raw) { scrollTerm(); return; }

    history.unshift(raw);
    if (history.length > 50) history.pop();

    var cmd    = raw.toLowerCase().split(' ')[0];
    var result = COMMANDS[cmd];
    var output = '';

    if (result !== undefined) {
      output = typeof result === 'function' ? result() : result;
    } else {
      output = '<span class="term-err">command not found: ' + escHtml(cmd) +
               '</span>\nType <span class="term-accent">help</span> for available commands.';
    }

    if (output !== null && output !== undefined && output !== '') {
      var outEl = document.createElement('div');
      outEl.className = 'term-line';
      outEl.style.whiteSpace = 'pre-wrap';
      outEl.innerHTML = output;
      termOutput.appendChild(outEl);
    }

    /* Blank line */
    var blank = document.createElement('div');
    blank.className = 'term-line';
    blank.innerHTML = '&nbsp;';
    termOutput.appendChild(blank);

    scrollTerm();
  });

  function scrollTerm() {
    termOutput.scrollTop = termOutput.scrollHeight;
  }

  function escHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

}());
