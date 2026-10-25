/* =========================================================
   QuestLearn — Content & game configuration
   Add your own courses by following the same structure.
   ========================================================= */

const COURSES = [
  {
    id: 'web', title: 'Web Development Basics', icon: '🌐', level: 'Beginner',
    color: ['#7c3aed', '#06b6d4'],
    description: 'Understand how the web works and build pages with HTML & CSS.',
    lessons: [
      {
        id: 'web-1', title: 'How the Web Works', minutes: 5, xp: 50,
        content: `
          <h3>From URL to web page</h3>
          <p>When you type a URL, your <b>browser</b> (the <em>client</em>) first asks a <b>DNS server</b> to translate the human-friendly domain name into an <b>IP address</b>. It then sends an <b>HTTP request</b> to the server at that address.</p>
          <p>The <b>server</b> responds with files — HTML, CSS, JavaScript and images — which the browser assembles and renders on screen.</p>
          <ul>
            <li><b>Client</b> – the device/browser requesting content</li>
            <li><b>Server</b> – the computer that stores and serves the website</li>
            <li><b>DNS</b> – the internet's phonebook (domain → IP)</li>
            <li><b>HTTP/HTTPS</b> – the protocol used to request and deliver pages</li>
          </ul>
          <div class="callout">💡 <b>Tip:</b> HTTPS is HTTP + encryption (TLS). Look for the padlock!</div>`,
        quiz: [
          { q: 'What does DNS do?', o: ['Encrypts web traffic', 'Translates domain names into IP addresses', 'Stores website files', 'Renders HTML'], a: 1, e: 'DNS is the phonebook of the internet: it maps names like example.com to IP addresses.' },
          { q: 'Which protocol does a browser use to request web pages?', o: ['FTP', 'SMTP', 'HTTP', 'SSH'], a: 2, e: 'HTTP (and its secure version HTTPS) is the protocol of the web.' },
          { q: 'In the client–server model, the browser is the…', o: ['Server', 'Client', 'Router', 'Database'], a: 1, e: 'The browser is the client — it requests resources from servers.' }
        ]
      },
      {
        id: 'web-2', title: 'HTML Building Blocks', minutes: 6, xp: 60,
        content: `
          <h3>Structure with HTML</h3>
          <p><b>HTML</b> (HyperText Markup Language) describes the <em>structure</em> of a page using <b>elements</b> written as tags.</p>
          <pre><code>&lt;article&gt;
  &lt;h1&gt;Hello, world!&lt;/h1&gt;
  &lt;p&gt;Visit &lt;a href="https://example.com"&gt;my site&lt;/a&gt;&lt;/p&gt;
&lt;/article&gt;</code></pre>
          <p><b>Attributes</b> like <code>href</code> add extra information. <b>Semantic</b> elements such as <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;article&gt;</code> and <code>&lt;footer&gt;</code> describe meaning, which helps accessibility and SEO.</p>
          <div class="callout">💡 <b>Tip:</b> Use one <code>&lt;h1&gt;</code> per page for the main title.</div>`,
        quiz: [
          { q: 'What does HTML stand for?', o: ['HyperText Markup Language', 'High Tech Modern Language', 'Hyperlink Text Management Logic', 'Home Tool Markup Language'], a: 0, e: 'HTML = HyperText Markup Language.' },
          { q: 'Which tag creates a hyperlink?', o: ['<link>', '<a>', '<href>', '<url>'], a: 1, e: 'The anchor tag <a> with an href attribute creates links.' },
          { q: 'Which of these is a semantic element?', o: ['<div>', '<span>', '<article>', '<b>'], a: 2, e: '<article> describes its content’s meaning; <div> and <span> are generic.' }
        ]
      },
      {
        id: 'web-3', title: 'Styling with CSS', minutes: 7, xp: 70,
        content: `
          <h3>Make it beautiful</h3>
          <p><b>CSS</b> controls presentation. You target elements with <b>selectors</b> and apply <b>properties</b>.</p>
          <pre><code>.card {
  padding: 16px;
  margin: 12px;
  border: 1px solid #ddd;
  display: flex;
  gap: 8px;
}</code></pre>
          <p><b>The box model:</b> every element is a box of <em>content → padding → border → margin</em> (inside to outside).</p>
          <p><b>Flexbox</b> (<code>display: flex</code>) arranges children in a row or column and makes alignment easy.</p>
          <div class="callout">💡 <b>Tip:</b> <code>.name</code> selects a class, <code>#name</code> selects an id.</div>`,
        quiz: [
          { q: 'In the box model, what is the space outside the border?', o: ['Padding', 'Margin', 'Content', 'Outline'], a: 1, e: 'Margin is the outermost layer; padding sits inside the border.' },
          { q: 'Which declaration turns an element into a flex container?', o: ['display: flex', 'position: flex', 'flex: on', 'layout: flex'], a: 0, e: 'display: flex creates a flex container.' },
          { q: 'Which selector targets elements with class "card"?', o: ['#card', 'card', '.card', '*card'], a: 2, e: 'A dot prefix selects by class name.' }
        ]
      }
    ]
  },
  {
    id: 'js', title: 'JavaScript Essentials', icon: '⚡', level: 'Intermediate',
    color: ['#f59e0b', '#ef4444'],
    description: 'Master variables, functions and data structures in the language of the web.',
    lessons: [
      {
        id: 'js-1', title: 'Variables & Types', minutes: 6, xp: 60,
        content: `
          <h3>Storing data</h3>
          <p>Declare variables with <code>let</code> (can be reassigned) or <code>const</code> (cannot be reassigned). Avoid the old <code>var</code>.</p>
          <pre><code>const name = "Ana";   // string
let score = 42;       // number
let isPro = true;     // boolean
let empty = null;     // intentionally empty
let notSet;           // undefined</code></pre>
          <p>Use <code>typeof</code> to check a value's type: <code>typeof 42 === "number"</code>.</p>
          <div class="callout">💡 <b>Tip:</b> Default to <code>const</code>; switch to <code>let</code> only when you need to reassign.</div>`,
        quiz: [
          { q: 'Which keyword declares a variable that cannot be reassigned?', o: ['var', 'let', 'const', 'static'], a: 2, e: 'const bindings cannot be reassigned.' },
          { q: 'What does typeof 42 return?', o: ['"integer"', '"number"', '"float"', '"digit"'], a: 1, e: 'JavaScript has a single "number" type for integers and decimals.' },
          { q: 'Which value means "intentionally empty"?', o: ['undefined', 'NaN', 'null', '0'], a: 2, e: 'null is assigned on purpose; undefined means not yet assigned.' }
        ]
      },
      {
        id: 'js-2', title: 'Functions & Scope', minutes: 7, xp: 70,
        content: `
          <h3>Reusable logic</h3>
          <pre><code>function greet(name) { return "Hi " + name; }
const add = (a, b) => a + b;   // arrow function

function counter() {
  let count = 0;
  return () => ++count;        // closure!
}</code></pre>
          <p><b>Scope</b> decides where variables are visible. <code>let</code> and <code>const</code> are <b>block-scoped</b> — they live only inside the nearest <code>{ }</code>.</p>
          <p>A <b>closure</b> is a function that remembers variables from the place where it was created.</p>
          <div class="callout">💡 <b>Tip:</b> Arrow functions are great for short callbacks.</div>`,
        quiz: [
          { q: 'Which is a valid arrow function?', o: ['const f = () => 1', 'const f = -> 1', 'function => 1', 'f() => {1}'], a: 0, e: '() => value is the arrow function syntax.' },
          { q: 'A closure is…', o: ['A function bundled with its surrounding variables', 'A way to close the browser', 'A loop that ends', 'A syntax error'], a: 0, e: 'Closures let inner functions keep access to outer variables.' },
          { q: 'Variables declared with let inside { } are…', o: ['Global', 'Block-scoped', 'Function-scoped only', 'Attached to window'], a: 1, e: 'let and const are block-scoped.' }
        ]
      },
      {
        id: 'js-3', title: 'Arrays & Objects', minutes: 8, xp: 80,
        content: `
          <h3>Working with collections</h3>
          <pre><code>const nums = [1, 2, 3, 4];
nums.map(n => n * 2);       // [2, 4, 6, 8]
nums.filter(n => n > 2);    // [3, 4]
nums.reduce((a, n) => a + n, 0); // 10

const user = { name: "Ana", level: 7 };
user.name;                  // "Ana"
const { level } = user;     // destructuring</code></pre>
          <ul>
            <li><b>map</b> – transform every item</li>
            <li><b>filter</b> – keep items that pass a test</li>
            <li><b>reduce</b> – combine items into one value</li>
          </ul>`,
        quiz: [
          { q: 'What does [1,2,3].map(x => x * 2) return?', o: ['[1,2,3]', '[2,4,6]', '6', '[1,4,9]'], a: 1, e: 'map applies the function to each item and returns a new array.' },
          { q: 'Which method keeps only items that pass a test?', o: ['map', 'filter', 'reduce', 'forEach'], a: 1, e: 'filter returns the items for which the callback returns true.' },
          { q: 'How do you read name from const u = { name: "Ana" }?', o: ['u[name]', 'u->name', 'u.name', 'u::name'], a: 2, e: 'Dot notation: u.name (or u["name"] with quotes).' }
        ]
      }
    ]
  },
  {
    id: 'py', title: 'Python Fundamentals', icon: '🐍', level: 'Beginner',
    color: ['#10b981', '#3b82f6'],
    description: 'Learn clean, readable Python — the go-to language for data & automation.',
    lessons: [
      {
        id: 'py-1', title: 'Python Syntax', minutes: 5, xp: 50,
        content: `
          <h3>Readable by design</h3>
          <p>Python uses <b>indentation</b> (not braces) to define code blocks. Comments start with <code>#</code>.</p>
          <pre><code># This is a comment
name = "Ana"
print("Hello,", name)
print(3 * "ab")   # ababab</code></pre>
          <p>Variables don't need type declarations — Python figures types out at runtime.</p>
          <div class="callout">💡 <b>Tip:</b> The convention is 4 spaces per indentation level.</div>`,
        quiz: [
          { q: 'How does Python define code blocks?', o: ['Curly braces', 'Indentation', 'Semicolons', 'BEGIN/END'], a: 1, e: 'Indentation is part of Python’s syntax.' },
          { q: 'Which symbol starts a comment in Python?', o: ['//', '#', '<!--', '--'], a: 1, e: '# starts a single-line comment.' },
          { q: 'What does print(3 * "ab") output?', o: ['ababab', '3ab', 'Error', 'ab3'], a: 0, e: 'Multiplying a string repeats it.' }
        ]
      },
      {
        id: 'py-2', title: 'Control Flow', minutes: 6, xp: 60,
        content: `
          <h3>Decisions & loops</h3>
          <pre><code>score = 85
if score >= 90:
    print("A")
elif score >= 80:
    print("B")
else:
    print("Keep going!")

for i in range(3):   # 0, 1, 2
    print(i)

while True:
    break            # exit the loop</code></pre>`,
        quiz: [
          { q: 'What does range(3) produce?', o: ['1, 2, 3', '0, 1, 2', '0, 1, 2, 3', '3, 2, 1'], a: 1, e: 'range(n) starts at 0 and stops before n.' },
          { q: 'Python’s keyword for "else if" is…', o: ['elseif', 'else if', 'elif', 'ifelse'], a: 2, e: 'Python uses elif.' },
          { q: 'Which statement exits a loop early?', o: ['stop', 'exit', 'break', 'return loop'], a: 2, e: 'break immediately leaves the loop.' }
        ]
      },
      {
        id: 'py-3', title: 'Lists & Dictionaries', minutes: 7, xp: 70,
        content: `
          <h3>Core data structures</h3>
          <pre><code>nums = [1, 2, 3]
nums.append(4)       # [1, 2, 3, 4]
nums[0]              # 1  (indexes start at 0)

hero = {"name": "Ana", "xp": 120}
hero["xp"] += 30     # 150
for key, value in hero.items():
    print(key, value)</code></pre>
          <p><b>Lists</b> are ordered collections; <b>dictionaries</b> map keys to values.</p>`,
        quiz: [
          { q: 'What is the index of the first item in a list?', o: ['1', '0', '-1', 'first'], a: 1, e: 'Python lists are zero-indexed.' },
          { q: 'Which creates a dictionary?', o: ['[1, 2]', '(1, 2)', '{"a": 1}', '<a: 1>'], a: 2, e: 'Curly braces with key: value pairs create a dict.' },
          { q: 'nums = [1,2,3]; nums.append(4). What is len(nums)?', o: ['3', '4', '5', 'Error'], a: 1, e: 'append adds one item, so the length becomes 4.' }
        ]
      }
    ]
  },
  {
    id: 'sec', title: 'Cyber Security Basics', icon: '🛡️', level: 'All levels',
    color: ['#ec4899', '#8b5cf6'],
    description: 'Protect yourself online: passwords, phishing and safe browsing habits.',
    lessons: [
      {
        id: 'sec-1', title: 'Passwords & 2FA', minutes: 5, xp: 50,
        content: `
          <h3>Lock the front door</h3>
          <ul>
            <li>Long <b>passphrases</b> beat short complex passwords.</li>
            <li>Never reuse passwords — use a <b>password manager</b>.</li>
            <li>Turn on <b>two-factor authentication (2FA)</b>: something you know + something you have.</li>
          </ul>
          <p>Well-built services never store your password directly; they store a <b>salted hash</b>, so a leak doesn't reveal the real password.</p>
          <div class="callout">💡 <b>Tip:</b> Authenticator apps are safer than SMS codes.</div>`,
        quiz: [
          { q: 'Which password is the strongest?', o: ['Password123!', 'qwerty', 'correct-horse-battery-staple-92', 'JohnSmith1990'], a: 2, e: 'Length and unpredictability matter most.' },
          { q: 'What does 2FA add?', o: ['A second verification factor', 'A second password field', 'Faster login', 'Two usernames'], a: 0, e: '2FA requires a second, different factor such as a code from your phone.' },
          { q: 'Servers should store passwords as…', o: ['Plain text', 'Salted hashes', 'Base64 strings', 'Emails'], a: 1, e: 'Salted hashes protect passwords if a database leaks.' }
        ]
      },
      {
        id: 'sec-2', title: 'Spotting Phishing', minutes: 6, xp: 60,
        content: `
          <h3>Don't take the bait</h3>
          <p><b>Phishing</b> messages pretend to be from trusted organisations to steal data or money. Red flags:</p>
          <ul>
            <li>Urgent threats: "Your account will be closed in 24 hours!"</li>
            <li>Sender addresses that don't match the real domain</li>
            <li>Links whose real URL (hover to see) looks odd</li>
            <li>Requests for passwords, PINs or OTPs</li>
          </ul>
          <div class="callout">💡 <b>Tip:</b> When in doubt, contact the company through its official website or app — never via the message's link.</div>`,
        quiz: [
          { q: 'Which is a common sign of phishing?', o: ['Urgent threats demanding immediate action', 'Correct spelling', 'A known coworker asking about lunch', 'A newsletter you subscribed to'], a: 0, e: 'Pressure and urgency are classic phishing tactics.' },
          { q: 'Before clicking a link in an email you should…', o: ['Click quickly', 'Hover to inspect the real URL', 'Forward it to friends', 'Reply with your password'], a: 1, e: 'Hovering reveals where the link actually goes.' },
          { q: 'A "bank" emails asking for your PIN. You…', o: ['Reply with the PIN', 'Contact the bank via its official channel', 'Click the link to verify', 'Ignore every bank email forever'], a: 1, e: 'Banks never ask for PINs; verify through official channels.' }
        ]
      },
      {
        id: 'sec-3', title: 'Safe Browsing', minutes: 6, xp: 60,
        content: `
          <h3>Browse like a pro</h3>
          <ul>
            <li><b>HTTPS</b> encrypts the connection — but doesn't prove a site is honest.</li>
            <li>Install <b>updates</b> promptly; they patch security holes.</li>
            <li>On <b>public Wi-Fi</b>, use a VPN or avoid sensitive logins.</li>
            <li>Only install extensions and apps from trusted sources.</li>
          </ul>
          <div class="callout">💡 <b>Tip:</b> Enable automatic updates on your OS and browser.</div>`,
        quiz: [
          { q: 'HTTPS guarantees that…', o: ['The site is trustworthy', 'The connection is encrypted', 'The site loads faster', 'There are no ads'], a: 1, e: 'HTTPS encrypts traffic; scam sites can use HTTPS too.' },
          { q: 'Why install updates promptly?', o: ['To get new emojis', 'To patch security vulnerabilities', 'To use more storage', 'To reset settings'], a: 1, e: 'Updates fix known vulnerabilities attackers exploit.' },
          { q: 'On public Wi-Fi it is safest to…', o: ['Do online banking freely', 'Use a VPN or avoid sensitive logins', 'Disable your firewall', 'Share files openly'], a: 1, e: 'Public networks can be monitored; protect sensitive activity.' }
        ]
      }
    ]
  }
];

const ALL_LESSONS = COURSES.flatMap(c => c.lessons.map((lesson, idx) => ({ course: c, lesson, idx })));
const findLesson = id => ALL_LESSONS.find(x => x.lesson.id === id);
const findCourse = id => COURSES.find(c => c.id === id);

/* ---------- Badges (val = current progress, target = goal) ---------- */
const BADGES = [
  { id: 'first_lesson', icon: '🎯', name: 'First Steps', desc: 'Complete your first lesson', rarity: 'common', reward: 25, target: 1, val: s => Object.keys(s.completed).length },
  { id: 'five_lessons', icon: '📚', name: 'Bookworm', desc: 'Complete 5 lessons', rarity: 'rare', reward: 50, target: 5, val: s => Object.keys(s.completed).length },
  { id: 'scholar', icon: '🎓', name: 'Grand Scholar', desc: 'Complete every lesson', rarity: 'legendary', reward: 200, target: ALL_LESSONS.length, val: s => Object.keys(s.completed).length },
  { id: 'course_done', icon: '🏅', name: 'Course Conqueror', desc: 'Finish an entire course', rarity: 'rare', reward: 75, target: 1, val: s => COURSES.filter(c => c.lessons.every(l => s.completed[l.id])).length },
  { id: 'perfect', icon: '💯', name: 'Perfectionist', desc: 'Score 100% on a challenge', rarity: 'common', reward: 30, target: 1, val: s => s.stats.perfect },
  { id: 'perfect5', icon: '💎', name: 'Diamond Mind', desc: 'Score 100% on 5 challenges', rarity: 'epic', reward: 100, target: 5, val: s => s.stats.perfect },
  { id: 'run10', icon: '🔥', name: 'Unstoppable', desc: 'Answer 10 questions correctly in a row', rarity: 'epic', reward: 100, target: 10, val: s => s.stats.bestRun },
  { id: 'speedy', icon: '⚡', name: 'Lightning Fast', desc: 'Answer correctly within 5 seconds', rarity: 'common', reward: 25, target: 1, val: s => s.stats.fast },
  { id: 'speedy10', icon: '🚀', name: 'Speed Demon', desc: 'Make 15 lightning-fast answers', rarity: 'epic', reward: 100, target: 15, val: s => s.stats.fast },
  { id: 'level5', icon: '⭐', name: 'Rising Star', desc: 'Reach level 5', rarity: 'rare', reward: 75, target: 5, val: s => Game.levelOf(s.xp) },
  { id: 'level8', icon: '🌟', name: 'Superstar', desc: 'Reach level 8', rarity: 'legendary', reward: 200, target: 8, val: s => Game.levelOf(s.xp) },
  { id: 'streak3', icon: '📅', name: 'Habit Builder', desc: 'Keep a 3-day streak', rarity: 'rare', reward: 50, target: 3, val: s => s.bestStreak },
  { id: 'streak7', icon: '🗓️', name: 'Week Warrior', desc: 'Keep a 7-day streak', rarity: 'epic', reward: 150, target: 7, val: s => s.bestStreak },
  { id: 'rich', icon: '💰', name: 'Treasure Hunter', desc: 'Earn 1,000 coins in total', rarity: 'epic', reward: 100, target: 1000, val: s => s.stats.coinsEarned },
  { id: 'shopper', icon: '🛍️', name: 'Shopaholic', desc: 'Buy something from the shop', rarity: 'common', reward: 20, target: 1, val: s => s.stats.purchases },
  { id: 'quester', icon: '🗺️', name: 'Quest Master', desc: 'Claim 10 daily quests', rarity: 'rare', reward: 75, target: 10, val: s => s.stats.questsClaimed }
];

/* ---------- Daily quests (key = counter in state.daily) ---------- */
const QUESTS = [
  { id: 'q_lesson', icon: '📘', title: 'Complete a new lesson', key: 'lessons', target: 1, reward: { xp: 40, coins: 25 } },
  { id: 'q_xp', icon: '⚡', title: 'Earn 150 XP today', key: 'xp', target: 150, reward: { xp: 0, coins: 40 } },
  { id: 'q_correct', icon: '✅', title: 'Answer 8 questions correctly', key: 'correct', target: 8, reward: { xp: 40, coins: 25 } },
  { id: 'q_perfect', icon: '💯', title: 'Ace a challenge with 100%', key: 'perfect', target: 1, reward: { xp: 50, coins: 30 } },
  { id: 'q_fast', icon: '⏱️', title: 'Make 3 lightning answers (< 5s)', key: 'fast', target: 3, reward: { xp: 30, coins: 30 } }
];

/* ---------- Shop ---------- */
const SHOP_ITEMS = [
  { id: 'av_fox', type: 'avatar', value: '🦊', name: 'Fox', price: 0 },
  { id: 'av_panda', type: 'avatar', value: '🐼', name: 'Panda', price: 0 },
  { id: 'av_lion', type: 'avatar', value: '🦁', name: 'Lion', price: 0 },
  { id: 'av_frog', type: 'avatar', value: '🐸', name: 'Frog', price: 0 },
  { id: 'av_robot', type: 'avatar', value: '🤖', name: 'Robot', price: 200 },
  { id: 'av_alien', type: 'avatar', value: '👾', name: 'Space Invader', price: 250 },
  { id: 'av_unicorn', type: 'avatar', value: '🦄', name: 'Unicorn', price: 300 },
  { id: 'av_dragon', type: 'avatar', value: '🐲', name: 'Dragon', price: 400 },
  { id: 'av_wizard', type: 'avatar', value: '🧙', name: 'Wizard', price: 500 },
  { id: 'av_crown', type: 'avatar', value: '👑', name: 'Royal Crown', price: 900 },
  { id: 'th_neon', type: 'theme', value: 'neon', name: 'Neon Nebula', price: 0, swatch: ['#8b5cf6', '#22d3ee'] },
  { id: 'th_sunset', type: 'theme', value: 'sunset', name: 'Sunset Blaze', price: 300, swatch: ['#f97316', '#ec4899'] },
  { id: 'th_emerald', type: 'theme', value: 'emerald', name: 'Emerald Forest', price: 300, swatch: ['#10b981', '#a3e635'] },
  { id: 'th_ocean', type: 'theme', value: 'ocean', name: 'Deep Ocean', price: 350, swatch: ['#3b82f6', '#2dd4bf'] },
  { id: 'th_gold', type: 'theme', value: 'gold', name: 'Golden Legend', price: 700, swatch: ['#f59e0b', '#fde047'] },
  { id: 'pu_boost', type: 'powerup', value: 'boost', name: '2× XP Boost', icon: '🚀', desc: 'Double the XP from your next challenge', price: 150 },
  { id: 'pu_hint', type: 'powerup', value: 'hint', name: '50/50 Hint', icon: '💡', desc: 'Remove two wrong answers on a question', price: 60 },
  { id: 'pu_freeze', type: 'powerup', value: 'freeze', name: 'Streak Freeze', icon: '🧊', desc: 'Protects your streak if you miss one day', price: 200 }
];

/* ---------- Leaderboard rivals ---------- */
const BOTS = [
  { name: 'Aarav S.', avatar: '🐯', base: 2200, rate: 70 },
  { name: 'Priya K.', avatar: '🦋', base: 1650, rate: 85 },
  { name: 'Liam O.', avatar: '🐺', base: 1250, rate: 60 },
  { name: 'Mei Lin', avatar: '🌸', base: 950, rate: 55 },
  { name: 'Diego R.', avatar: '🦅', base: 700, rate: 50 },
  { name: 'Sara M.', avatar: '🐬', base: 480, rate: 45 },
  { name: 'Kenji T.', avatar: '🐉', base: 300, rate: 40 },
  { name: 'Noah B.', avatar: '🐢', base: 160, rate: 30 },
  { name: 'Zara A.', avatar: '🦉', base: 70, rate: 25 }
];

const LEVEL_TITLES = [[1, 'Novice'], [3, 'Apprentice'], [5, 'Scholar'], [7, 'Expert'], [10, 'Master'], [14, 'Legend']];
