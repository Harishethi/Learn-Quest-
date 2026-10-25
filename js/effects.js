/* =========================================================
   QuestLearn — Visual & audio effects
   Particle background, confetti, floating text, toasts,
   count-up numbers, 3D tilt cards, button ripples, sounds.
   ========================================================= */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = str => String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const Fx = (() => {
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bg = $('#bg-canvas'), fx = $('#fx-canvas');
  const bctx = bg && bg.getContext ? bg.getContext('2d') : null;
  const fctx = fx && fx.getContext ? fx.getContext('2d') : null;
  let W = 0, H = 0, dots = [], conf = [], running = false;
  const mouse = { x: -9999, y: -9999 };
  let colors = ['#8b5cf6', '#22d3ee'];

  function readColors() {
    const cs = getComputedStyle(document.body);
    colors = [cs.getPropertyValue('--a1').trim() || '#8b5cf6', cs.getPropertyValue('--a2').trim() || '#22d3ee'];
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    [[bg, bctx], [fx, fctx]].forEach(([c, ctx]) => {
      if (!c || !ctx) return;
      c.width = W * dpr; c.height = H * dpr;
      c.style.width = W + 'px'; c.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    const n = reduce ? 25 : Math.min(90, Math.floor((W * H) / 16000));
    dots = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.4, c: Math.random() < 0.5 ? 0 : 1
    }));
  }

  function hexA(hex, a) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map(x => x + x).join('') : h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  function drawBg() {
    if (!bctx) return;
    bctx.clearRect(0, 0, W, H);
    for (const d of dots) {
      d.x += d.vx; d.y += d.vy;
      const dx = d.x - mouse.x, dy = d.y - mouse.y, dist = Math.hypot(dx, dy);
      if (dist < 120 && dist > 0) { d.x += dx / dist * 0.8; d.y += dy / dist * 0.8; }
      if (d.x < -10) d.x = W + 10; if (d.x > W + 10) d.x = -10;
      if (d.y < -10) d.y = H + 10; if (d.y > H + 10) d.y = -10;
      bctx.beginPath(); bctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      bctx.fillStyle = hexA(colors[d.c], 0.8); bctx.fill();
    }
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const a = dots[i], b = dots[j], dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 130) {
          bctx.strokeStyle = hexA(colors[a.c], (1 - dist / 130) * 0.22);
          bctx.lineWidth = 1;
          bctx.beginPath(); bctx.moveTo(a.x, a.y); bctx.lineTo(b.x, b.y); bctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawBg);
  }

  /* ---------- Confetti ---------- */
  function palette() { return [...colors, '#fbbf24', '#f472b6', '#ffffff', '#34d399']; }

  function spawn(p) { conf.push(p); if (!running) { running = true; requestAnimationFrame(loop); } }

  function burst(x, y, n = 60, power = 1) {
    if (!fctx || reduce) return;
    const pal = palette();
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2, sp = (Math.random() * 9 + 3) * power;
      spawn({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 4, g: 0.28, w: 5 + Math.random() * 6, h: 3 + Math.random() * 5,
        rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: pal[(Math.random() * pal.length) | 0], life: 0, max: 70 + Math.random() * 50, circle: Math.random() < 0.3 });
    }
  }

  function rain(n = 180) {
    if (!fctx || reduce) return;
    const pal = palette();
    for (let i = 0; i < n; i++) {
      spawn({ x: Math.random() * W, y: -20 - Math.random() * H * 0.5, vx: (Math.random() - 0.5) * 3, vy: Math.random() * 3 + 2, g: 0.06,
        w: 6 + Math.random() * 6, h: 4 + Math.random() * 6, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
        c: pal[(Math.random() * pal.length) | 0], life: 0, max: 260, circle: Math.random() < 0.25 });
    }
  }

  function loop() {
    fctx.clearRect(0, 0, W, H);
    conf = conf.filter(p => {
      p.vx *= 0.985; p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life++;
      const alpha = Math.max(0, 1 - p.life / p.max);
      fctx.save(); fctx.globalAlpha = alpha; fctx.translate(p.x, p.y); fctx.rotate(p.rot); fctx.fillStyle = p.c;
      if (p.circle) { fctx.beginPath(); fctx.arc(0, 0, p.w / 2.5, 0, Math.PI * 2); fctx.fill(); }
      else fctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 2)) + 1);
      fctx.restore();
      return p.life < p.max && p.y < H + 50;
    });
    if (conf.length) requestAnimationFrame(loop);
    else { running = false; fctx.clearRect(0, 0, W, H); }
  }

  /* ---------- Floating text ---------- */
  function floatText(text, x, y, cls = '') {
    const el = document.createElement('div');
    el.className = 'float-text ' + cls;
    el.textContent = text;
    el.style.left = x + 'px'; el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }

  function centerOf(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  /* ---------- Toasts ---------- */
  function toast({ icon = '✨', title = '', msg = '', kind = '' }) {
    const box = $('#toasts');
    const el = document.createElement('div');
    el.className = `toast ${kind}`;
    el.innerHTML = `<div class="t-icon">${icon}</div><div class="t-body"><b>${title}</b>${msg ? `<small>${msg}</small>` : ''}</div><i class="t-timer"></i>`;
    box.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 450); }, 3800);
  }

  /* ---------- Count up ---------- */
  function countUp(el, to, dur = 1200) {
    const from = 0, t0 = performance.now();
    const step = now => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    if (reduce) el.textContent = to.toLocaleString(); else requestAnimationFrame(step);
  }

  /* ---------- 3D tilt ---------- */
  function bindTilt(root = document) {
    if (reduce || !matchMedia('(hover: hover)').matches) return;
    $$('.tilt', root).forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-4px)`;
        el.style.setProperty('--mx', (px + 0.5) * 100 + '%');
        el.style.setProperty('--my', (py + 0.5) * 100 + '%');
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Ripple on buttons ---------- */
  document.addEventListener('pointerdown', e => {
    const btn = e.target.closest('.btn');
    if (!btn || btn.disabled) return;
    const r = btn.getBoundingClientRect(), s = Math.max(r.width, r.height);
    const span = document.createElement('span');
    span.className = 'ripple';
    span.style.width = span.style.height = s + 'px';
    span.style.left = e.clientX - r.left - s / 2 + 'px';
    span.style.top = e.clientY - r.top - s / 2 + 'px';
    btn.appendChild(span);
    setTimeout(() => span.remove(), 650);
  });

  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });
  addEventListener('resize', resize);

  function start() { readColors(); resize(); if (bctx) requestAnimationFrame(drawBg); }

  return { start, readColors, burst, rain, floatText, centerOf, toast, countUp, bindTilt };
})();

/* ---------- Sound effects (Web Audio, no files needed) ---------- */
const Sfx = (() => {
  let ctx = null;
  let muted = false;
  try { muted = localStorage.getItem('ql-muted') === '1'; } catch (e) { }
  function tone(freq, dur = 0.12, type = 'sine', when = 0, vol = 0.07) {
    if (muted) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + when;
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(ctx.destination);
      o.start(t); o.stop(t + dur + 0.05);
    } catch (e) { }
  }
  return {
    correct() { tone(660, 0.1, 'triangle'); tone(990, 0.18, 'triangle', 0.08); },
    wrong() { tone(220, 0.22, 'sawtooth', 0, 0.04); tone(160, 0.25, 'sawtooth', 0.1, 0.04); },
    coin() { tone(1180, 0.07, 'square', 0, 0.03); tone(1580, 0.12, 'square', 0.06, 0.03); },
    level() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.25, 'triangle', i * 0.09)); },
    badge() { [784, 988, 1175].forEach((f, i) => tone(f, 0.2, 'sine', i * 0.08, 0.06)); },
    click() { tone(520, 0.04, 'sine', 0, 0.025); },
    tick() { tone(880, 0.03, 'square', 0, 0.015); },
    toggle() { muted = !muted; try { localStorage.setItem('ql-muted', muted ? '1' : '0'); } catch (e) { } return muted; },
    get muted() { return muted; }
  };
})();
