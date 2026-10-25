/* =========================================================
   QuestLearn — Game engine: XP, levels, streaks, badges,
   quests, shop. Progress is saved in localStorage.
   ========================================================= */

const Bus = {
  h: {},
  on(e, f) { (this.h[e] = this.h[e] || []).push(f); },
  emit(e, d) { (this.h[e] || []).forEach(f => { try { f(d); } catch (err) { console.error(err); } }); }
};

const Game = (() => {
  const KEY = 'questlearn-save-v1';
  const pad = n => String(n).padStart(2, '0');
  const dayStr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => dayStr(new Date());
  const dayDiff = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
  const shift = (str, n) => { const d = new Date(str + 'T00:00:00'); d.setDate(d.getDate() + n); return dayStr(d); };

  const freshDaily = () => ({ date: today(), lessons: 0, xp: 0, perfect: 0, correct: 0, fast: 0, claimed: [] });
  const fresh = () => ({
    user: null, createdAt: today(), xp: 0, coins: 100, streak: 0, bestStreak: 0, lastActive: null,
    completed: {}, scores: {}, badges: [], inventory: [], theme: 'neon',
    powerups: { boost: 1, hint: 2, freeze: 0 },
    daily: freshDaily(), history: {},
    stats: { quizzes: 0, answered: 0, correct: 0, perfect: 0, fast: 0, run: 0, bestRun: 0, coinsEarned: 0, purchases: 0, questsClaimed: 0 }
  });

  function load() {
    const base = fresh();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        return { ...base, ...d, powerups: { ...base.powerups, ...d.powerups }, stats: { ...base.stats, ...d.stats }, daily: { ...base.daily, ...d.daily } };
      }
    } catch (e) { console.warn('Could not load save', e); }
    return base;
  }

  let s = load();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* storage unavailable */ } };

  function ensureDaily() { if (s.daily.date !== today()) s.daily = freshDaily(); }

  function refreshStreak() {
    if (!s.lastActive) return;
    const gap = dayDiff(s.lastActive, today());
    if (gap <= 1) return;
    if (gap === 2 && s.powerups.freeze > 0 && s.streak > 0) {
      s.powerups.freeze--;
      s.lastActive = shift(today(), -1);
      setTimeout(() => Bus.emit('freeze', s.streak), 1500);
    } else {
      s.streak = 0;
    }
    save();
  }

  function touch() {
    const t = today();
    if (s.lastActive === t) return;
    s.streak = (s.lastActive && dayDiff(s.lastActive, t) === 1) ? s.streak + 1 : 1;
    s.lastActive = t;
    s.bestStreak = Math.max(s.bestStreak, s.streak);
    Bus.emit('streak', s.streak);
  }

  /* Levels: level n starts at 50·(n-1)² XP */
  const levelOf = xp => Math.floor(Math.sqrt(xp / 50)) + 1;
  const xpFor = l => 50 * (l - 1) ** 2;
  function levelInfo() {
    const level = levelOf(s.xp), start = xpFor(level), end = xpFor(level + 1);
    return { level, cur: s.xp - start, need: end - start, toNext: end - s.xp, pct: Math.round((s.xp - start) / (end - start) * 100) };
  }

  function addXp(n, src) {
    if (!n || n <= 0) return;
    ensureDaily();
    const before = levelOf(s.xp);
    s.xp += n;
    s.daily.xp += n;
    s.history[today()] = (s.history[today()] || 0) + n;
    Bus.emit('xp', { amount: n, src });
    const after = levelOf(s.xp);
    if (after > before) {
      const bonus = after * 25;
      s.coins += bonus; s.stats.coinsEarned += bonus;
      Bus.emit('levelup', { level: after, bonus });
    }
  }

  function addCoins(n) {
    if (!n) return;
    s.coins += n;
    if (n > 0) s.stats.coinsEarned += n;
    Bus.emit('coins', n);
  }

  function checkBadges() {
    let found = true;
    while (found) {
      found = false;
      for (const b of BADGES) {
        if (!s.badges.includes(b.id) && b.val(s) >= b.target) {
          s.badges.push(b.id);
          s.coins += b.reward; s.stats.coinsEarned += b.reward;
          found = true;
          Bus.emit('badge', b);
        }
      }
    }
  }

  function commit() { checkBadges(); save(); Bus.emit('change'); }

  const isUnlocked = (course, idx) => idx === 0 || !!s.completed[course.lessons[idx - 1].id];

  function recordAnswer(correct, secs) {
    ensureDaily();
    s.stats.answered++;
    if (correct) {
      s.stats.correct++; s.daily.correct++;
      s.stats.run++; s.stats.bestRun = Math.max(s.stats.bestRun, s.stats.run);
      if (secs <= 5) { s.stats.fast++; s.daily.fast++; }
    } else {
      s.stats.run = 0;
    }
    save();
  }

  function finishQuiz(lessonId, correct, total, quizXp) {
    const { course, lesson } = findLesson(lessonId);
    ensureDaily();
    const pct = correct / total, passed = pct >= 0.6, perfect = correct === total;
    const first = !s.completed[lessonId];
    const stars = perfect ? 3 : passed ? 2 : correct > 0 ? 1 : 0;

    s.stats.quizzes++;
    if (perfect) { s.stats.perfect++; s.daily.perfect++; }
    s.scores[lessonId] = Math.max(s.scores[lessonId] || 0, stars);

    let xp = first ? quizXp : Math.round(quizXp * 0.5);
    let coins = passed ? (first ? 20 : 5) + (perfect ? 15 : 0) : 0;
    let courseDone = false;

    if (passed && first) {
      s.completed[lessonId] = today();
      s.daily.lessons++;
      xp += lesson.xp;
      if (course.lessons.every(l => s.completed[l.id])) { courseDone = true; xp += 200; coins += 150; }
    }
    touch();
    addXp(xp, 'quiz');
    addCoins(coins);
    commit();
    if (courseDone) Bus.emit('course', course);
    return { passed, perfect, first, stars, xp, coins, courseDone };
  }

  function questProgress(q) { ensureDaily(); return Math.min(s.daily[q.key] || 0, q.target); }
  function questClaimed(q) { ensureDaily(); return s.daily.claimed.includes(q.id); }

  function claimQuest(id) {
    ensureDaily();
    const q = QUESTS.find(x => x.id === id);
    if (!q || s.daily.claimed.includes(id) || (s.daily[q.key] || 0) < q.target) return false;
    s.daily.claimed.push(id);
    s.stats.questsClaimed++;
    addXp(q.reward.xp, 'quest');
    addCoins(q.reward.coins);
    commit();
    return true;
  }

  const owns = item => item.type !== 'powerup' && (item.price === 0 || s.inventory.includes(item.id));

  function buy(item) {
    if (owns(item) || s.coins < item.price) return false;
    s.coins -= item.price;
    s.stats.purchases++;
    if (item.type === 'powerup') s.powerups[item.value]++;
    else s.inventory.push(item.id);
    commit();
    return true;
  }

  function equip(item) {
    if (!owns(item)) return false;
    if (item.type === 'avatar') s.user.avatar = item.value;
    if (item.type === 'theme') s.theme = item.value;
    commit();
    return true;
  }

  function usePowerup(key) {
    if ((s.powerups[key] || 0) <= 0) return false;
    s.powerups[key]--; save(); Bus.emit('change');
    return true;
  }

  function setUser(name, avatar) { s.user = { name, avatar, joined: today() }; s.createdAt = today(); commit(); }
  function setName(name) { s.user.name = name; commit(); }
  function reset() { localStorage.removeItem(KEY); location.hash = '#/dashboard'; location.reload(); }

  ensureDaily();
  refreshStreak();

  return {
    get state() { return s; },
    today, shift, dayDiff, levelOf, xpFor, levelInfo, isUnlocked, ensureDaily,
    recordAnswer, finishQuiz, questProgress, questClaimed, claimQuest,
    owns, buy, equip, usePowerup, setUser, setName, reset, save
  };
})();
