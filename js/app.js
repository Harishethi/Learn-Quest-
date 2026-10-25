/* =========================================================
   QuestLearn — App shell, router & views
   ========================================================= */

const S = () => Game.state;
let cleanups = [];
const onCleanup = f => cleanups.push(f);

const NAV = [
  ['dashboard', '🏠', 'Dashboard'],
  ['courses', '📚', 'Courses'],
  ['quests', '🎯', 'Daily Quests'],
  ['achievements', '🏆', 'Achievements'],
  ['leaderboard', '📊', 'Leaderboard'],
  ['shop', '🛍️', 'Reward Shop'],
  ['profile', '👤', 'Profile']
];

/* ---------------- Helpers ---------------- */
const levelTitle = l => LEVEL_TITLES.filter(([min]) => l >= min).pop()[1];
const courseXp = c => c.lessons.reduce((a, l) => a + l.xp, 0) + 200;
function courseProgress(c) {
  const done = c.lessons.filter(l => S().completed[l.id]).length;
  return { done, total: c.lessons.length, pct: Math.round(done / c.lessons.length * 100) };
}
function nextLesson() {
  for (const c of COURSES) {
    for (let i = 0; i < c.lessons.length; i++) {
      if (!S().completed[c.lessons[i].id] && Game.isUnlocked(c, i)) {
        if (courseProgress(c).done > 0) return { course: c, lesson: c.lessons[i] };
      }
    }
  }
  for (const c of COURSES) {
    const i = c.lessons.findIndex(l => !S().completed[l.id]);
    if (i >= 0 && Game.isUnlocked(c, i)) return { course: c, lesson: c.lessons[i] };
  }
  return null;
}
function lastNDays(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = Game.shift(Game.today(), -i);
    out.push({ date, isToday: i === 0, label: new Date(date + 'T00:00:00').toLocaleDateString('en', { weekday: 'short' }), xp: S().history[date] || 0 });
  }
  return out;
}
const stars = n => [0, 1, 2].map(i => `<span class="${i < n ? 'on' : ''}">★</span>`).join('');
const fmtDate = d => new Date(d + 'T00:00:00').toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' });
const league = l => l >= 8 ? ['💎', 'Diamond League'] : l >= 5 ? ['🥇', 'Gold League'] : l >= 3 ? ['🥈', 'Silver League'] : ['🥉', 'Bronze League'];

/* ---------------- Chrome (sidebar + topbar) ---------------- */
function buildNav() {
  $('#nav').innerHTML = NAV.map(([key, icon, label]) =>
    `<a class="nav-link" data-route="${key}" data-go="#/${key}"><span class="nav-icon">${icon}</span><span>${label}</span>${key === 'quests' ? '<em class="nav-dot" id="quest-dot"></em>' : ''}</a>`).join('');
}

const lastChip = { coins: null, streak: null, level: null };
function bump(el) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }

function renderChrome() {
  const s = S(), li = Game.levelInfo();
  document.body.dataset.theme = s.theme;
  Fx.readColors();
  const set = (id, key, val) => {
    const chip = $(id); $('b', chip).textContent = val.toLocaleString();
    if (lastChip[key] !== null && lastChip[key] !== val) bump(chip);
    lastChip[key] = val;
  };
  set('#chip-coins', 'coins', s.coins);
  set('#chip-streak', 'streak', s.streak);
  set('#chip-level', 'level', li.level);
  $('#chip-level .mini-bar i').style.width = li.pct + '%';
  $('#chip-streak').classList.toggle('lit', s.streak > 0);
  if (s.user) {
    $('#side-avatar').textContent = s.user.avatar;
    $('#side-name').textContent = s.user.name;
    $('#side-title').textContent = `Lv ${li.level} · ${levelTitle(li.level)}`;
  }
  const ready = QUESTS.some(q => Game.questProgress(q) >= q.target && !Game.questClaimed(q));
  const dot = $('#quest-dot'); if (dot) dot.classList.toggle('show', ready);
  $('#sound-btn').textContent = Sfx.muted ? '🔇' : '🔊';
}

/* ---------------- Modal system (queued) ---------------- */
const modalQueue = []; let modalOpen = false;
function showModal(html, mount, opts = {}) {
  if (modalOpen) { modalQueue.push([html, mount, opts]); return; }
  modalOpen = true;
  const root = $('#modal-root');
  root.innerHTML = `<div class="modal-backdrop"><div class="modal ${opts.cls || ''}">${html}</div></div>`;
  const close = () => {
    const bd = $('.modal-backdrop', root);
    if (!bd || bd.classList.contains('out')) return;
    bd.classList.add('out');
    setTimeout(() => {
      root.innerHTML = ''; modalOpen = false;
      if (modalQueue.length) showModal(...modalQueue.shift());
    }, 320);
  };
  $$('[data-close]', root).forEach(b => b.addEventListener('click', close));
  if (!opts.locked) $('.modal-backdrop', root).addEventListener('click', e => { if (e.target.classList.contains('modal-backdrop')) close(); });
  mount && mount(root, close);
}

function showOnboarding() {
  if ($('.onboard')) return;
  let avatar = '🦊';
  const free = SHOP_ITEMS.filter(i => i.type === 'avatar' && i.price === 0);
  showModal(`
    <div class="onboard">
      <div class="ob-logo">⚔️</div>
      <h1>Welcome to <span class="grad-text">QuestLearn</span></h1>
      <p class="muted">Learn real skills, earn XP, level up, and unlock rewards. Your adventure starts now!</p>
      <div class="ob-features">
        <div><span>⚡</span>Earn XP</div><div><span>🔥</span>Build streaks</div>
        <div><span>🏆</span>Win badges</div><div><span>🛍️</span>Spend coins</div>
      </div>
      <label for="ob-name">Choose your hero name</label>
      <input id="ob-name" maxlength="18" placeholder="e.g. Alex" autocomplete="off" />
      <label>Pick your avatar</label>
      <div class="avatar-pick">${free.map((a, i) => `<button class="av-opt ${i === 0 ? 'sel' : ''}" data-av="${a.value}">${a.value}</button>`).join('')}</div>
      <button class="btn primary lg block" id="ob-start">Start My Quest 🚀</button>
    </div>`, (root, close) => {
    $$('.av-opt', root).forEach(b => b.addEventListener('click', () => {
      $$('.av-opt', root).forEach(x => x.classList.remove('sel'));
      b.classList.add('sel'); avatar = b.dataset.av; Sfx.click();
    }));
    const start = () => {
      const name = $('#ob-name', root).value.trim() || 'Learner';
      Game.setUser(name, avatar);
      close(); Fx.rain(); Sfx.level();
      Fx.toast({ icon: '🎉', title: `Welcome, ${esc(name)}!`, msg: 'You received 100 🪙, a 2× XP Boost and two 50/50 hints.', kind: 'gold' });
      router();
    };
    $('#ob-start', root).addEventListener('click', start);
    $('#ob-name', root).addEventListener('keydown', e => { if (e.key === 'Enter') start(); });
    setTimeout(() => $('#ob-name', root).focus(), 400);
  }, { locked: true, cls: 'wide' });
}

function showLevelUp(level, bonus) {
  Sfx.level(); Fx.rain(220);
  showModal(`
    <div class="levelup">
      <div class="rays"></div>
      <p class="eyebrow">LEVEL UP!</p>
      <div class="lv-badge"><span>${level}</span></div>
      <h2>You reached Level ${level}</h2>
      <p class="muted">New title unlocked: <b class="grad-text">${levelTitle(level)}</b></p>
      <div class="pill gold">+${bonus} 🪙 level bonus</div>
      <button class="btn primary lg" data-close>Awesome! ✨</button>
    </div>`, null, { cls: 'center' });
}

function showCourseComplete(c) {
  Sfx.level(); Fx.rain(260);
  showModal(`
    <div class="levelup">
      <div class="rays"></div>
      <p class="eyebrow">COURSE CONQUERED</p>
      <div class="course-trophy">🏆</div>
      <h2>${c.title}</h2>
      <p class="muted">You mastered every lesson. Bonus <b>+200 XP</b> and <b>+150 🪙</b> earned!</p>
      <div class="modal-actions">
        <button class="btn ghost" data-close>Later</button>
        <button class="btn primary" id="view-cert">🎓 View Certificate</button>
      </div>
    </div>`, (root, close) => {
    $('#view-cert', root).addEventListener('click', () => { close(); setTimeout(() => showCertificate(c), 350); });
  }, { cls: 'center' });
}

function showCertificate(c) {
  const s = S();
  const date = c.lessons.map(l => s.completed[l.id]).filter(Boolean).sort().pop() || Game.today();
  const code = ('QL-' + c.id + '-' + date.replace(/-/g, '') + '-' + s.user.name.length * 37).toUpperCase();
  showModal(`
    <div class="certificate" id="cert">
      <div class="cert-inner">
        <div class="cert-seal">🏅</div>
        <p class="cert-eyebrow">Certificate of Completion</p>
        <p class="cert-small">This certifies that</p>
        <h1 class="cert-name">${esc(s.user.name)}</h1>
        <p class="cert-small">has successfully completed the course</p>
        <h2 class="cert-course">${c.icon} ${c.title}</h2>
        <div class="cert-foot">
          <div><b>${fmtDate(date)}</b><small>Date issued</small></div>
          <div class="cert-logo">⚔️ QuestLearn</div>
          <div><b>${code}</b><small>Credential ID</small></div>
        </div>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn ghost" data-close>Close</button>
      <button class="btn primary" id="print-cert">🖨️ Print / Save as PDF</button>
    </div>`, root => {
    $('#print-cert', root).addEventListener('click', () => {
      document.body.classList.add('printing-cert');
      window.print();
      setTimeout(() => document.body.classList.remove('printing-cert'), 500);
    });
  }, { cls: 'cert-modal' });
}

/* ---------------- Views ---------------- */
function statCard(icon, label, val, suffix = '') {
  return `<div class="stat card tilt"><div class="stat-icon">${icon}</div><div><div class="stat-val"><b data-count="${val}">0</b>${suffix ? `<span>${suffix}</span>` : ''}</div><small>${label}</small></div></div>`;
}

function questMini(q) {
  const cur = Game.questProgress(q), claimed = Game.questClaimed(q), pct = Math.round(cur / q.target * 100);
  return `<div class="qm ${claimed ? 'claimed' : ''}"><span class="qm-icon">${q.icon}</span><div class="qm-body"><b>${q.title}</b><div class="bar sm"><i data-w="${pct}"></i></div></div><small>${claimed ? '✓' : `${cur}/${q.target}`}</small></div>`;
}

function viewDashboard() {
  const s = S(), li = Game.levelInfo(), nl = nextLesson(), done = Object.keys(s.completed).length;
  const h = new Date().getHours(), greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const week = lastNDays(7), max = Math.max(60, ...week.map(d => d.xp));
  const C = 2 * Math.PI * 70;
  const recent = s.badges.slice(-4).reverse().map(id => BADGES.find(b => b.id === id)).filter(Boolean);
  return {
    title: 'Dashboard', html: `
    <section class="hero card">
      <div class="hero-text">
        <p class="eyebrow">${greet} ✨</p>
        <h1>Welcome back, <span class="grad-text">${esc(s.user ? s.user.name : 'Learner')}</span></h1>
        <p class="muted">You're <b>${li.toNext} XP</b> away from <b>Level ${li.level + 1}</b>. ${s.streak ? `Your 🔥 ${s.streak}-day streak is alive — keep it burning!` : 'Finish a challenge today to light up your streak!'}</p>
        <div class="hero-actions">
          ${nl ? `<button class="btn primary lg" data-go="#/lesson/${nl.lesson.id}">▶ Continue: ${esc(nl.lesson.title)}</button>`
               : `<button class="btn primary lg" data-go="#/achievements">🏆 Every lesson complete!</button>`}
          <button class="btn ghost" data-go="#/quests">🎯 Daily Quests</button>
        </div>
      </div>
      <div class="level-ring">
        <svg viewBox="0 0 160 160">
          <defs><linearGradient id="lgRing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--a1)"/><stop offset="1" style="stop-color:var(--a2)"/></linearGradient></defs>
          <circle cx="80" cy="80" r="70" class="ring-bg"/>
          <circle cx="80" cy="80" r="70" class="ring-fg" stroke-dasharray="${C}" stroke-dashoffset="${C}" data-offset="${C * (1 - li.pct / 100)}"/>
        </svg>
        <div class="ring-center"><small>LEVEL</small><b>${li.level}</b><small>${li.cur} / ${li.need} XP</small></div>
        <div class="orbit"><span>⭐</span></div>
      </div>
    </section>

    <section class="stats-grid">
      ${statCard('⚡', 'Total XP', s.xp)}
      ${statCard('📘', 'Lessons done', done, '/' + ALL_LESSONS.length)}
      ${statCard('🔥', 'Day streak', s.streak)}
      ${statCard('🏆', 'Badges', s.badges.length, '/' + BADGES.length)}
    </section>

    <section class="grid-2">
      <div class="card">
        <div class="card-head"><h3>📈 Weekly activity</h3><span class="muted">${week.reduce((a, d) => a + d.xp, 0)} XP this week</span></div>
        <div class="chart">
          ${week.map(d => `<div class="col ${d.isToday ? 'today' : ''}"><div class="col-bar"><i data-h="${Math.max(3, d.xp / max * 100)}"><em>${d.xp}</em></i></div><small>${d.label}</small></div>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h3>🎯 Today's quests</h3><a class="link" data-go="#/quests">View all →</a></div>
        <div class="qm-list">${QUESTS.slice(0, 4).map(questMini).join('')}</div>
      </div>
    </section>

    <section class="card">
      <div class="card-head"><h3>📚 Your learning paths</h3><a class="link" data-go="#/courses">All courses →</a></div>
      <div class="path-list">
        ${COURSES.map(c => { const p = courseProgress(c); return `
          <div class="path-row" data-go="#/course/${c.id}" style="--c1:${c.color[0]};--c2:${c.color[1]}">
            <span class="pr-icon">${c.icon}</span>
            <div class="pr-body"><b>${c.title}</b><div class="bar"><i data-w="${p.pct}"></i></div></div>
            <span class="pr-pct">${p.pct}%</span>
          </div>`; }).join('')}
      </div>
    </section>

    ${recent.length ? `<section class="card">
      <div class="card-head"><h3>🏅 Recent achievements</h3><a class="link" data-go="#/achievements">See all →</a></div>
      <div class="recent-badges">${recent.map(b => `<div class="rb r-${b.rarity}"><span>${b.icon}</span><b>${b.name}</b></div>`).join('')}</div>
    </section>` : ''}`
  };
}

function courseCard(c) {
  const p = courseProgress(c);
  return `<article class="course-card tilt" data-go="#/course/${c.id}" style="--c1:${c.color[0]};--c2:${c.color[1]}">
    <div class="cc-glow"></div>
    <div class="cc-top"><span class="cc-icon">${c.icon}</span><span class="tag">${c.level}</span></div>
    <h3>${c.title}</h3>
    <p class="muted">${c.description}</p>
    <div class="cc-meta"><span>📖 ${c.lessons.length} lessons</span><span>⚡ ${courseXp(c)} XP</span><span>🎓 Certificate</span></div>
    <div class="bar"><i data-w="${p.pct}"></i></div>
    <div class="cc-foot"><span>${p.done}/${p.total} complete</span><span class="cc-cta">${p.pct === 100 ? '🏅 Completed' : p.done ? 'Continue →' : 'Start →'}</span></div>
  </article>`;
}

function viewCourses() {
  return {
    title: 'Courses', html: `
    <div class="page-head"><div><h1>Explore Courses</h1><p class="muted">Pick a path, conquer lessons and earn certificates.</p></div></div>
    <div class="course-grid">${COURSES.map(courseCard).join('')}</div>`
  };
}

function viewCourse(id) {
  const c = findCourse(id);
  if (!c) { location.hash = '#/courses'; return null; }
  const s = S(), p = courseProgress(c);
  const nodes = c.lessons.map((l, i) => {
    const done = !!s.completed[l.id], unlocked = Game.isUnlocked(c, i), state = done ? 'done' : unlocked ? 'current' : 'locked';
    return `<div class="tl-node ${state}" ${unlocked ? `data-go="#/lesson/${l.id}"` : ''}>
      <div class="tl-dot">${done ? '✓' : unlocked ? '▶' : '🔒'}</div>
      <div class="tl-card card">
        <div><p class="eyebrow">Lesson ${i + 1}</p><b>${l.title}</b>
        <small class="muted">⏱ ${l.minutes} min · ⚡ +${l.xp} XP · 🧩 ${l.quiz.length} questions</small></div>
        <div class="tl-right">${done ? `<div class="stars">${stars(s.scores[l.id] || 0)}</div>` : unlocked ? '<span class="pill glow">Start</span>' : '<span class="pill">Locked</span>'}</div>
      </div>
    </div>`;
  }).join('');
  return {
    title: c.title, html: `
    <div class="crumbs"><a data-go="#/courses">Courses</a><span>/</span><b>${c.title}</b></div>
    <section class="course-banner card" style="--c1:${c.color[0]};--c2:${c.color[1]}">
      <div class="cb-icon">${c.icon}</div>
      <div class="cb-text">
        <span class="tag">${c.level}</span>
        <h1>${c.title}</h1>
        <p>${c.description}</p>
        <div class="bar light"><i data-w="${p.pct}"></i></div>
        <small>${p.done} of ${p.total} lessons complete · ${p.pct}%</small>
      </div>
      ${p.pct === 100 ? `<button class="btn light" id="cert-btn">🎓 Certificate</button>` : ''}
    </section>
    <section class="timeline" style="--fill:${p.done / c.lessons.length * 100}%">
      ${nodes}
      <div class="tl-node ${p.pct === 100 ? 'done' : 'locked'} trophy">
        <div class="tl-dot">🏆</div>
        <div class="tl-card card"><div><p class="eyebrow">Course reward</p><b>Final Trophy</b><small class="muted">+200 XP · +150 🪙 · Certificate of Completion</small></div></div>
      </div>
    </section>`,
    mount() { const b = $('#cert-btn'); if (b) b.addEventListener('click', () => showCertificate(c)); }
  };
}

function viewLesson(id) {
  const f = findLesson(id);
  if (!f) { location.hash = '#/courses'; return null; }
  const { course: c, lesson: l, idx } = f;
  if (!Game.isUnlocked(c, idx)) {
    Fx.toast({ icon: '🔒', title: 'Lesson locked', msg: 'Complete the previous lesson first.', kind: 'bad' });
    location.hash = '#/course/' + c.id; return null;
  }
  const done = !!S().completed[l.id];
  return {
    title: l.title, html: `
    <div class="crumbs"><a data-go="#/courses">Courses</a><span>/</span><a data-go="#/course/${c.id}">${c.title}</a><span>/</span><b>${l.title}</b></div>
    <section class="lesson-head card" style="--c1:${c.color[0]};--c2:${c.color[1]}">
      <span class="lh-icon">${c.icon}</span>
      <div>
        <p class="eyebrow">Lesson ${idx + 1} of ${c.lessons.length}</p>
        <h1>${l.title}</h1>
        <div class="meta"><span>⏱ ${l.minutes} min read</span><span>⚡ +${l.xp} XP</span><span>🧩 ${l.quiz.length} questions</span>${done ? '<span class="pill good">✓ Completed</span>' : ''}</div>
      </div>
    </section>
    <article class="card lesson-body">${l.content}</article>
    <section class="card cta-card">
      <div class="cta-art">⚔️</div>
      <div class="cta-text"><h3>Ready for the challenge?</h3><p class="muted">Answer ${l.quiz.length} timed questions. Score 60%+ to complete the lesson. Fast answers and combos earn bonus XP!</p></div>
      <button class="btn primary lg" data-go="#/quiz/${l.id}">${done ? 'Replay Challenge' : 'Start Challenge'} →</button>
    </section>`
  };
}

/* ---------------- Quiz engine ---------------- */
const Q_TIME = 20;
let Q = null;

function viewQuiz(id) {
  const f = findLesson(id);
  if (!f || !Game.isUnlocked(f.course, f.idx)) { location.hash = '#/courses'; return null; }
  Q = { course: f.course, lesson: f.lesson, idx: 0, correct: 0, combo: 0, maxCombo: 0, xp: 0, boost: false, answered: false, t0: 0, timer: null, hintUsed: false };
  onCleanup(() => { if (Q && Q.timer) clearInterval(Q.timer); });
  const keyHandler = e => {
    if (!Q || $('.modal-backdrop')) return;
    if (!Q.answered && ['1', '2', '3', '4', 'a', 'b', 'c', 'd'].includes(e.key.toLowerCase())) {
      const i = '1234'.includes(e.key) ? +e.key - 1 : 'abcd'.indexOf(e.key.toLowerCase());
      const btn = $(`.opt[data-i="${i}"]`); if (btn && !btn.disabled) btn.click();
    } else if (e.key === 'Enter') {
      const nb = $('#next-btn'); if (nb && !nb.hidden) nb.click();
    }
  };
  document.addEventListener('keydown', keyHandler);
  onCleanup(() => document.removeEventListener('keydown', keyHandler));
  return { title: 'Challenge', html: `<div class="quiz-wrap" id="quiz"></div>`, mount: renderQuizIntro };
}

function renderQuizIntro() {
  const s = S(), l = Q.lesson;
  $('#quiz').innerHTML = `
    <div class="card quiz-intro pop-in">
      <div class="qi-art"><span>⚔️</span></div>
      <p class="eyebrow">${Q.course.title}</p>
      <h1>${l.title} — Challenge</h1>
      <div class="qi-rules">
        <div><span>🧩</span><b>${l.quiz.length}</b><small>Questions</small></div>
        <div><span>⏱️</span><b>${Q_TIME}s</b><small>Per question</small></div>
        <div><span>🔥</span><b>×2.5</b><small>Max combo</small></div>
        <div><span>🎯</span><b>60%</b><small>To pass</small></div>
      </div>
      <div class="qi-power">
        <button class="power-btn ${s.powerups.boost ? '' : 'off'}" id="boost-btn" ${s.powerups.boost ? '' : 'disabled'}>
          🚀 <span>Activate 2× XP Boost</span><em>${s.powerups.boost} owned</em>
        </button>
        <div class="power-info">💡 50/50 hints owned: <b>${s.powerups.hint}</b></div>
      </div>
      <button class="btn primary lg block" id="start-quiz">Begin ⚔️</button>
      <p class="muted tiny">Tip: use keys 1–4 to answer and Enter to continue.</p>
    </div>`;
  $('#boost-btn').addEventListener('click', e => {
    if (Q.boost || !Game.usePowerup('boost')) return;
    Q.boost = true;
    const b = e.currentTarget; b.classList.add('active'); b.disabled = true;
    $('span', b).textContent = '2× XP Boost active!';
    const c = Fx.centerOf(b); Fx.burst(c.x, c.y, 40); Sfx.coin();
  });
  $('#start-quiz').addEventListener('click', () => { Sfx.click(); renderQuestion(); });
}

function renderQuestion() {
  const q = Q.lesson.quiz[Q.idx], n = Q.lesson.quiz.length, s = S();
  Q.answered = false; Q.hintUsed = false;
  const mult = comboMult(Q.combo);
  $('#quiz').innerHTML = `
    <div class="quiz-top">
      <div class="q-dots">${Q.lesson.quiz.map((_, i) => `<i class="${i < Q.idx ? (Q.results && Q.results[i] ? 'ok' : 'no') : i === Q.idx ? 'cur' : ''}"></i>`).join('')}</div>
      <div class="combo ${Q.combo > 0 ? 'on' : ''}" id="combo">🔥 Combo <b>${Q.combo}</b><span>×${mult.toFixed(1)}</span></div>
      <div class="timer" id="timer">
        <svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="26" class="t-bg"/><circle cx="30" cy="30" r="26" class="t-fg" id="t-fg" stroke-dasharray="163.4" stroke-dashoffset="0"/></svg>
        <span id="t-num">${Q_TIME}</span>
      </div>
    </div>
    <div class="card q-card pop-in" id="q-card">
      <p class="eyebrow">Question ${Q.idx + 1} of ${n}</p>
      <h2>${esc(q.q)}</h2>
      <div class="options">
        ${q.o.map((o, i) => `<button class="opt" data-i="${i}" style="--d:${i * 0.07}s"><span class="key">${'ABCD'[i]}</span><span class="opt-text">${esc(o)}</span><span class="opt-mark"></span></button>`).join('')}
      </div>
      <div class="explain" id="explain"></div>
    </div>
    <div class="quiz-bottom">
      <button class="btn ghost sm" id="hint-btn" ${s.powerups.hint > 0 ? '' : 'disabled'}>💡 50/50 <em>(${s.powerups.hint})</em></button>
      <div class="quiz-xp">⚡ <b id="qxp">${Q.xp}</b> XP ${Q.boost ? '<span class="boost-tag">2×</span>' : ''}</div>
      <button class="btn primary" id="next-btn" hidden>${Q.idx === n - 1 ? 'See Results 🏁' : 'Next →'}</button>
    </div>`;
  $$('.opt').forEach(b => b.addEventListener('click', () => answer(+b.dataset.i)));
  $('#hint-btn').addEventListener('click', useHint);
  $('#next-btn').addEventListener('click', () => {
    Sfx.click();
    if (Q.idx < n - 1) { Q.idx++; renderQuestion(); } else finishQuiz();
  });

  const C = 163.4, fg = $('#t-fg'), num = $('#t-num'), timerEl = $('#timer');
  let lastSec = Q_TIME;
  Q.t0 = performance.now();
  Q.timer = setInterval(() => {
    const left = Math.max(0, Q_TIME - (performance.now() - Q.t0) / 1000);
    fg.style.strokeDashoffset = C * (1 - left / Q_TIME);
    const sec = Math.ceil(left);
    if (sec !== lastSec) { lastSec = sec; num.textContent = sec; if (sec <= 5 && sec > 0) Sfx.tick(); }
    timerEl.classList.toggle('danger', left <= 5);
    if (left <= 0) answer(-1);
  }, 100);
}

const comboMult = combo => Math.min(2.5, 1 + 0.5 * Math.max(0, combo - 1));

function useHint() {
  if (Q.answered || Q.hintUsed || !Game.usePowerup('hint')) return;
  Q.hintUsed = true;
  const q = Q.lesson.quiz[Q.idx];
  const wrong = q.o.map((_, i) => i).filter(i => i !== q.a).sort(() => Math.random() - 0.5).slice(0, 2);
  wrong.forEach(i => { const b = $(`.opt[data-i="${i}"]`); b.classList.add('gone'); b.disabled = true; });
  const hb = $('#hint-btn'); hb.disabled = true; $('em', hb).textContent = `(${S().powerups.hint})`;
  Sfx.click();
}

function answer(i) {
  if (!Q || Q.answered) return;
  Q.answered = true;
  clearInterval(Q.timer);
  const q = Q.lesson.quiz[Q.idx], secs = (performance.now() - Q.t0) / 1000, ok = i === q.a;
  Q.results = Q.results || [];
  Q.results[Q.idx] = ok;
  Game.recordAnswer(ok, secs);

  $$('.opt').forEach(b => {
    const bi = +b.dataset.i; b.disabled = true;
    if (bi === q.a) { b.classList.add('correct'); $('.opt-mark', b).textContent = '✓'; }
    else if (bi === i) { b.classList.add('wrong'); $('.opt-mark', b).textContent = '✕'; }
    else b.classList.add('dim');
  });
  $('#hint-btn').disabled = true;

  const card = $('#q-card');
  if (ok) {
    Q.correct++; Q.combo++; Q.maxCombo = Math.max(Q.maxCombo, Q.combo);
    const speed = Math.max(0, Math.round(10 * (1 - secs / Q_TIME)));
    const pts = Math.round((10 + speed) * comboMult(Q.combo));
    Q.xp += pts;
    const btn = $(`.opt[data-i="${i}"]`), c = Fx.centerOf(btn);
    Fx.burst(c.x, c.y, 45, 0.8);
    Fx.floatText(`+${pts} XP`, c.x, c.y - 20, 'xp');
    if (secs <= 5) setTimeout(() => Fx.floatText('⚡ Lightning!', c.x + 60, c.y - 50, 'speed'), 180);
    if (Q.combo >= 2) setTimeout(() => Fx.floatText(`🔥 Combo ×${comboMult(Q.combo).toFixed(1)}`, c.x - 60, c.y - 40, 'combo'), 320);
    card.classList.add('flash-good');
    Sfx.correct();
  } else {
    Q.combo = 0;
    card.classList.add('shake');
    Sfx.wrong();
  }
  const comboEl = $('#combo');
  comboEl.classList.toggle('on', Q.combo > 0);
  $('b', comboEl).textContent = Q.combo;
  $('span', comboEl).textContent = '×' + comboMult(Q.combo).toFixed(1);
  if (ok) bump(comboEl);
  const qxp = $('#qxp'); qxp.textContent = Q.xp; if (ok) bump(qxp.parentElement);

  const ex = $('#explain');
  ex.innerHTML = `<b>${ok ? '✅ Correct!' : i === -1 ? '⏰ Time\'s up!' : '❌ Not quite.'}</b> ${esc(q.e)}`;
  ex.className = 'explain show ' + (ok ? 'good' : 'bad');
  const nb = $('#next-btn'); nb.hidden = false; nb.classList.add('pop-in');
}

function finishQuiz() {
  const total = Q.lesson.quiz.length;
  const quizXp = Q.boost ? Q.xp * 2 : Q.xp;
  const res = Game.finishQuiz(Q.lesson.id, Q.correct, total, quizXp);
  const { course: c, idx } = findLesson(Q.lesson.id);
  const nextL = c.lessons[idx + 1];
  const title = res.perfect ? 'Flawless Victory!' : res.passed ? 'Challenge Complete!' : 'So close — try again!';
  $('#quiz').innerHTML = `
    <div class="card results pop-in ${res.passed ? 'win' : 'lose'}">
      <div class="res-glow"></div>
      <div class="big-stars">${[0, 1, 2].map(i => `<span class="${i < res.stars ? 'on' : ''}" style="--d:${0.3 + i * 0.28}s">★</span>`).join('')}</div>
      <h1>${title}</h1>
      <p class="muted">You answered <b>${Q.correct}</b> of <b>${total}</b> correctly${res.first ? '' : ' (replay — half XP)'}.</p>
      <div class="reward-row">
        <div class="reward"><span>⚡</span><b data-count="${res.xp}">0</b><small>XP earned</small></div>
        <div class="reward"><span>🪙</span><b data-count="${res.coins}">0</b><small>Coins</small></div>
        <div class="reward"><span>🔥</span><b data-count="${Q.maxCombo}">0</b><small>Best combo</small></div>
      </div>
      ${Q.boost ? '<div class="pill gold">🚀 2× Boost applied</div>' : ''}
      ${!res.passed ? '<p class="muted">Score at least 60% to unlock the next lesson. Re-read the lesson and give it another shot!</p>' : ''}
      <div class="res-actions">
        <button class="btn ghost" id="retry-btn">↻ Retry</button>
        ${res.passed && nextL ? `<button class="btn primary" data-go="#/lesson/${nextL.id}">Next Lesson →</button>` : ''}
        <button class="btn ${res.passed && nextL ? 'ghost' : 'primary'}" data-go="#/course/${c.id}">Course Map</button>
      </div>
    </div>`;
  $('#retry-btn').addEventListener('click', () => router());
  animateIn($('#quiz'));
  if (res.passed) { setTimeout(() => Fx.rain(res.perfect ? 220 : 120), 300); Sfx.badge(); }
  Q = null;
}

/* ---------------- Daily quests ---------------- */
function viewQuests() {
  const s = S();
  Game.ensureDaily();
  const week = lastNDays(7);
  const claimedCount = s.daily.claimed.length;
  const total = QUESTS.reduce((a, q) => ({ xp: a.xp + q.reward.xp, coins: a.coins + q.reward.coins }), { xp: 0, coins: 0 });
  return {
    title: 'Daily Quests', html: `
    <div class="page-head"><div><h1>Daily Quests</h1><p class="muted">Fresh challenges every day · resets in <b id="reset-timer" class="mono">--:--:--</b></p></div></div>
    <section class="grid-2">
      <div class="card streak-card">
        <div class="flame ${s.streak ? 'lit' : ''}">🔥</div>
        <div>
          <h2><span data-count="${s.streak}">0</span> day streak</h2>
          <p class="muted">Best: ${s.bestStreak} days · Streak freezes: ${s.powerups.freeze} 🧊</p>
        </div>
        <div class="week-dots">${week.map(d => `<div class="wd ${d.xp > 0 ? 'on' : ''} ${d.isToday ? 'today' : ''}"><i>${d.xp > 0 ? '✓' : ''}</i><small>${d.label}</small></div>`).join('')}</div>
      </div>
      <div class="card quest-summary">
        <div class="qs-ring" style="--p:${claimedCount / QUESTS.length * 100}"><b>${claimedCount}/${QUESTS.length}</b><small>claimed</small></div>
        <div>
          <h3>Today's bounty</h3>
          <p class="muted">Complete all quests to earn up to</p>
          <div class="qs-rewards"><span class="pill">⚡ ${total.xp} XP</span><span class="pill gold">🪙 ${total.coins}</span></div>
        </div>
      </div>
    </section>
    <section class="quest-list">
      ${QUESTS.map(q => {
        const cur = Game.questProgress(q), claimed = Game.questClaimed(q), ready = cur >= q.target && !claimed, pct = Math.round(cur / q.target * 100);
        return `<div class="quest card ${claimed ? 'claimed' : ready ? 'ready' : ''}">
          <div class="q-icon">${q.icon}</div>
          <div class="q-body"><b>${q.title}</b><div class="bar"><i data-w="${pct}"></i></div><small class="muted">${cur} / ${q.target}</small></div>
          <div class="q-reward">${q.reward.xp ? `<span>+${q.reward.xp} ⚡</span>` : ''}<span>+${q.reward.coins} 🪙</span></div>
          <button class="btn sm ${ready ? 'primary glow' : 'ghost'}" data-claim="${q.id}" ${ready ? '' : 'disabled'}>${claimed ? 'Claimed ✓' : ready ? 'Claim!' : 'In progress'}</button>
        </div>`;
      }).join('')}
    </section>`,
    mount() {
      const tick = () => {
        const now = new Date(), mid = new Date(now); mid.setHours(24, 0, 0, 0);
        const d = Math.max(0, mid - now), h = Math.floor(d / 3.6e6), m = Math.floor(d % 3.6e6 / 6e4), sec = Math.floor(d % 6e4 / 1000);
        const el = $('#reset-timer'); if (el) el.textContent = [h, m, sec].map(x => String(x).padStart(2, '0')).join(':');
      };
      tick(); const iv = setInterval(tick, 1000); onCleanup(() => clearInterval(iv));
      $$('[data-claim]').forEach(b => b.addEventListener('click', () => {
        const c = Fx.centerOf(b);
        if (Game.claimQuest(b.dataset.claim)) {
          Fx.burst(c.x, c.y, 70); Fx.floatText('Quest complete!', c.x, c.y - 30, 'xp'); Sfx.coin();
          setTimeout(router, 700);
        }
      }));
    }
  };
}

/* ---------------- Achievements ---------------- */
let badgeFilter = 'all';
function viewAchievements() {
  const s = S(), got = s.badges.length, pct = Math.round(got / BADGES.length * 100);
  const list = BADGES.filter(b => badgeFilter === 'all' || (badgeFilter === 'unlocked') === s.badges.includes(b.id));
  return {
    title: 'Achievements', html: `
    <div class="page-head">
      <div><h1>Achievements</h1><p class="muted">Collect badges by learning, competing and staying consistent.</p></div>
      <div class="tabs">${['all', 'unlocked', 'locked'].map(f => `<button class="tab ${badgeFilter === f ? 'active' : ''}" data-filter="${f}">${f[0].toUpperCase() + f.slice(1)}</button>`).join('')}</div>
    </div>
    <section class="card ach-summary">
      <div class="trophy-big">🏆</div>
      <div class="as-body"><h2><span data-count="${got}">0</span> / ${BADGES.length} badges unlocked</h2><div class="bar"><i data-w="${pct}"></i></div></div>
      <div class="rarity-legend"><span class="r-common">Common</span><span class="r-rare">Rare</span><span class="r-epic">Epic</span><span class="r-legendary">Legendary</span></div>
    </section>
    <section class="badge-grid">
      ${list.map((b, i) => {
        const has = s.badges.includes(b.id), cur = Math.min(b.val(s), b.target);
        return `<div class="badge-card tilt r-${b.rarity} ${has ? 'unlocked' : 'locked'}" style="--d:${i * 0.04}s">
          <div class="badge-icon"><span>${b.icon}</span></div>
          <b>${b.name}</b>
          <small class="muted">${b.desc}</small>
          ${has ? `<span class="pill good">Unlocked · +${b.reward} 🪙</span>` : `<div class="bar sm"><i data-w="${Math.round(cur / b.target * 100)}"></i></div><small class="mono">${cur} / ${b.target}</small>`}
          <em class="rarity">${b.rarity}</em>
        </div>`;
      }).join('') || '<p class="muted">Nothing here yet — go earn some badges!</p>'}
    </section>`,
    mount() { $$('[data-filter]').forEach(t => t.addEventListener('click', () => { badgeFilter = t.dataset.filter; Sfx.click(); router(); })); }
  };
}

/* ---------------- Leaderboard ---------------- */
function viewLeaderboard() {
  const s = S(), li = Game.levelInfo();
  const days = Math.max(0, Game.dayDiff(s.createdAt || Game.today(), Game.today()));
  const rows = BOTS.map(b => ({ name: b.name, avatar: b.avatar, xp: b.base + b.rate * days, me: false }))
    .concat([{ name: s.user ? s.user.name : 'You', avatar: s.user ? s.user.avatar : '🦊', xp: s.xp, me: true }])
    .sort((a, b) => b.xp - a.xp)
    .map((r, i) => ({ ...r, rank: i + 1, level: Game.levelOf(r.xp) }));
  const me = rows.find(r => r.me), above = rows[me.rank - 2];
  const top = [rows[1], rows[0], rows[2]];
  const [lIcon, lName] = league(li.level);
  return {
    title: 'Leaderboard', html: `
    <div class="page-head">
      <div><h1>Leaderboard</h1><p class="muted">${lIcon} You're competing in the <b>${lName}</b></p></div>
      <div class="rank-chip">Your rank <b>#${me.rank}</b></div>
    </div>
    <section class="podium">
      ${top.map((r, i) => r ? `<div class="pod pod-${[2, 1, 3][i]} ${r.me ? 'me' : ''}">
        <div class="pod-avatar">${r.avatar}${[2, 1, 3][i] === 1 ? '<span class="crown">👑</span>' : ''}</div>
        <b>${esc(r.name)}</b><small>${r.xp.toLocaleString()} XP</small>
        <div class="pod-block"><span>${[2, 1, 3][i]}</span></div>
      </div>` : '').join('')}
    </section>
    ${above ? `<div class="card chase"><span>🎯</span><p>Only <b>${(above.xp - me.xp + 1).toLocaleString()} XP</b> to overtake <b>${esc(above.name)}</b> and climb to <b>#${above.rank}</b>!</p><button class="btn primary sm" data-go="#/courses">Earn XP</button></div>`
            : `<div class="card chase top"><span>👑</span><p>You're <b>#1</b>! Keep learning to defend your crown.</p></div>`}
    <section class="card lb-table">
      ${rows.map((r, i) => `<div class="lb-row ${r.me ? 'me' : ''}" style="--d:${i * 0.05}s">
        <span class="lb-rank">${r.rank <= 3 ? ['🥇', '🥈', '🥉'][r.rank - 1] : '#' + r.rank}</span>
        <span class="lb-avatar">${r.avatar}</span>
        <span class="lb-name">${esc(r.name)}${r.me ? ' <em>(you)</em>' : ''}</span>
        <span class="lb-level">Lv ${r.level}</span>
        <span class="lb-xp">${r.xp.toLocaleString()} XP</span>
      </div>`).join('')}
    </section>`
  };
}

/* ---------------- Shop ---------------- */
let shopTab = 'avatar';
function viewShop() {
  const s = S();
  const tabs = [['avatar', '🧑‍🚀 Avatars'], ['theme', '🎨 Themes'], ['powerup', '⚡ Power-ups']];
  const items = SHOP_ITEMS.filter(i => i.type === shopTab);
  const card = it => {
    const owned = Game.owns(it);
    const equipped = (it.type === 'avatar' && s.user && s.user.avatar === it.value) || (it.type === 'theme' && s.theme === it.value);
    const afford = s.coins >= it.price;
    let action;
    if (it.type === 'powerup') action = `<button class="btn sm ${afford ? 'primary' : 'ghost'}" data-buy="${it.id}" ${afford ? '' : 'disabled'}>🪙 ${it.price}</button>`;
    else if (equipped) action = `<button class="btn sm ghost" disabled>✓ Equipped</button>`;
    else if (owned) action = `<button class="btn sm ghost" data-equip="${it.id}">Equip</button>`;
    else action = `<button class="btn sm ${afford ? 'primary' : 'ghost'}" data-buy="${it.id}" ${afford ? '' : 'disabled'}>🪙 ${it.price}</button>`;
    const preview = it.type === 'theme'
      ? `<div class="theme-swatch" style="--s1:${it.swatch[0]};--s2:${it.swatch[1]}"></div>`
      : `<div class="item-icon">${it.type === 'powerup' ? it.icon : it.value}</div>`;
    return `<div class="shop-item card tilt ${equipped ? 'equipped' : ''}">
      ${preview}
      <b>${it.name}</b>
      <small class="muted">${it.type === 'powerup' ? `${it.desc}<br/>Owned: <b>${s.powerups[it.value]}</b>` : owned ? 'Owned' : it.price === 0 ? 'Free' : 'Premium'}</small>
      ${action}
    </div>`;
  };
  return {
    title: 'Reward Shop', html: `
    <div class="page-head">
      <div><h1>Reward Shop</h1><p class="muted">Spend the coins you earn on looks and power-ups.</p></div>
      <div class="wallet"><span class="coin-spin">🪙</span><b data-count="${s.coins}">0</b><small>coins</small></div>
    </div>
    <div class="tabs big">${tabs.map(([k, l]) => `<button class="tab ${shopTab === k ? 'active' : ''}" data-tab="${k}">${l}</button>`).join('')}</div>
    <section class="shop-grid">${items.map(card).join('')}</section>`,
    mount() {
      $$('[data-tab]').forEach(t => t.addEventListener('click', () => { shopTab = t.dataset.tab; Sfx.click(); router(); }));
      $$('[data-buy]').forEach(b => b.addEventListener('click', () => {
        const it = SHOP_ITEMS.find(x => x.id === b.dataset.buy), c = Fx.centerOf(b);
        if (Game.buy(it)) {
          Fx.burst(c.x, c.y, 50); Fx.floatText(`-${it.price} 🪙`, c.x, c.y - 20, 'coin'); Sfx.coin();
          Fx.toast({ icon: it.icon || it.value || '🎨', title: `${it.name} purchased!`, msg: it.type === 'powerup' ? 'Use it during a challenge.' : 'Equip it to show it off.', kind: 'gold' });
          if (it.type !== 'powerup') Game.equip(it);
          setTimeout(router, 500);
        }
      }));
      $$('[data-equip]').forEach(b => b.addEventListener('click', () => {
        const it = SHOP_ITEMS.find(x => x.id === b.dataset.equip);
        Game.equip(it); Sfx.click(); router();
      }));
    }
  };
}

/* ---------------- Profile ---------------- */
function viewProfile() {
  const s = S(), li = Game.levelInfo(), st = s.stats;
  const acc = st.answered ? Math.round(st.correct / st.answered * 100) : 0;
  const doneCourses = COURSES.filter(c => courseProgress(c).pct === 100);
  return {
    title: 'Profile', html: `
    <section class="card profile-hero">
      <div class="ph-avatar"><span>${s.user ? s.user.avatar : '🦊'}</span><em>Lv ${li.level}</em></div>
      <div class="ph-info">
        <div class="name-edit"><input id="name-input" value="${esc(s.user ? s.user.name : '')}" maxlength="18" /><button class="btn ghost sm" id="save-name">Save</button></div>
        <p class="muted">${levelTitle(li.level)} · Member since ${fmtDate((s.user && s.user.joined) || s.createdAt)}</p>
        <div class="bar"><i data-w="${li.pct}"></i></div>
        <small class="muted">${li.cur} / ${li.need} XP to Level ${li.level + 1}</small>
      </div>
      <button class="btn ghost sm" data-go="#/shop">Change avatar</button>
    </section>
    <section class="stats-grid six">
      ${statCard('🧩', 'Challenges taken', st.quizzes)}
      ${statCard('🎯', 'Accuracy', acc, '%')}
      ${statCard('🔥', 'Best answer run', st.bestRun)}
      ${statCard('📅', 'Best streak', s.bestStreak)}
      ${statCard('⚡', 'Lightning answers', st.fast)}
      ${statCard('🪙', 'Coins earned', st.coinsEarned)}
    </section>
    <section class="card">
      <div class="card-head"><h3>🎓 Certificates</h3><span class="muted">${doneCourses.length} earned</span></div>
      ${doneCourses.length ? `<div class="cert-list">${doneCourses.map(c => `<button class="cert-chip" data-cert="${c.id}" style="--c1:${c.color[0]};--c2:${c.color[1]}"><span>${c.icon}</span><b>${c.title}</b><small>View →</small></button>`).join('')}</div>`
                           : '<p class="muted">Complete a full course to earn your first certificate.</p>'}
    </section>
    <section class="card">
      <div class="card-head"><h3>🎒 Inventory</h3></div>
      <div class="inv">
        <div><span>🚀</span><b>${s.powerups.boost}</b><small>XP Boosts</small></div>
        <div><span>💡</span><b>${s.powerups.hint}</b><small>50/50 Hints</small></div>
        <div><span>🧊</span><b>${s.powerups.freeze}</b><small>Streak Freezes</small></div>
      </div>
    </section>
    <section class="card danger">
      <div><h3>⚠️ Reset progress</h3><p class="muted">Erase all XP, badges and purchases on this device.</p></div>
      <button class="btn bad sm" id="reset-btn">Reset</button>
    </section>`,
    mount() {
      $('#save-name').addEventListener('click', () => {
        const v = $('#name-input').value.trim(); if (!v) return;
        Game.setName(v); Fx.toast({ icon: '✏️', title: 'Name updated', msg: `Hello, ${esc(v)}!` });
      });
      $$('[data-cert]').forEach(b => b.addEventListener('click', () => showCertificate(findCourse(b.dataset.cert))));
      $('#reset-btn').addEventListener('click', () => { if (confirm('Reset all progress? This cannot be undone.')) Game.reset(); });
    }
  };
}

/* ---------------- Router ---------------- */
const ROUTES = { dashboard: viewDashboard, courses: viewCourses, course: viewCourse, lesson: viewLesson, quiz: viewQuiz, quests: viewQuests, achievements: viewAchievements, leaderboard: viewLeaderboard, shop: viewShop, profile: viewProfile };

function animateIn(root) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    $$('[data-w]', root).forEach(el => { el.style.width = el.dataset.w + '%'; });
    $$('[data-h]', root).forEach(el => { el.style.height = el.dataset.h + '%'; });
    $$('[data-offset]', root).forEach(el => { el.style.strokeDashoffset = el.dataset.offset; });
    $$('[data-count]', root).forEach(el => Fx.countUp(el, +el.dataset.count));
  }));
  Fx.bindTilt(root);
}

function router() {
  cleanups.forEach(f => f()); cleanups = [];
  const parts = (location.hash.replace(/^#\/?/, '') || 'dashboard').split('/');
  const fn = ROUTES[parts[0]] || viewDashboard;
  const v = fn(...parts.slice(1));
  if (!v) return;
  const view = $('#view');
  view.innerHTML = v.html;
  [...view.children].forEach((c, i) => c.style.setProperty('--i', i));
  view.classList.remove('enter'); void view.offsetWidth; view.classList.add('enter');
  $('#page-title').textContent = v.title;
  document.title = `${v.title} · QuestLearn`;
  const navKey = { course: 'courses', lesson: 'courses', quiz: 'courses' }[parts[0]] || parts[0];
  $$('.nav-link').forEach(a => a.classList.toggle('active', a.dataset.route === navKey));
  document.body.classList.remove('nav-open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (v.mount) v.mount();
  animateIn(view);
  renderChrome();
  if (!S().user) showOnboarding();
}

/* ---------------- Global events ---------------- */
document.addEventListener('click', e => {
  const go = e.target.closest('[data-go]');
  if (go && !e.target.closest('button[data-buy],button[data-equip],button[data-claim]')) {
    e.preventDefault();
    if (location.hash === go.dataset.go) router(); else location.hash = go.dataset.go;
  }
});
$('#menu-btn').addEventListener('click', () => document.body.classList.toggle('nav-open'));
$('#sidebar-backdrop').addEventListener('click', () => document.body.classList.remove('nav-open'));
$('#sound-btn').addEventListener('click', () => { Sfx.toggle(); renderChrome(); Sfx.click(); });

Bus.on('change', renderChrome);
Bus.on('levelup', ({ level, bonus }) => setTimeout(() => showLevelUp(level, bonus), 1100));
Bus.on('course', c => setTimeout(() => showCourseComplete(c), 1600));
Bus.on('badge', b => setTimeout(() => {
  Sfx.badge();
  Fx.toast({ icon: b.icon, title: `Badge unlocked: ${b.name}`, msg: `${b.desc} · +${b.reward} 🪙`, kind: 'badge' });
  Fx.burst(innerWidth - 160, 90, 40, 0.7);
}, 700));
Bus.on('streak', n => setTimeout(() => Fx.toast({ icon: '🔥', title: `${n}-day streak!`, msg: n > 1 ? 'Consistency is your superpower.' : 'Come back tomorrow to keep it going.', kind: 'fire' }), 400));
Bus.on('freeze', n => Fx.toast({ icon: '🧊', title: 'Streak Freeze used', msg: `Your ${n}-day streak was protected!`, kind: 'info' }));

/* ---------------- Boot ---------------- */
buildNav();
document.body.dataset.theme = S().theme;
Fx.start();
addEventListener('hashchange', router);
router();
