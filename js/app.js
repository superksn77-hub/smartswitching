/* ==========================================================================
   SmartSwitching - Cognitive Switching Test
   ========================================================================== */

/* ==========================================================================
   ICON LIBRARY — Geometric patterns (inline SVG, 48x48 viewBox)
   All icons are abstract geometric shapes for consistent style.
   ========================================================================== */
const S = (paths, opts = {}) => {
    const stroke = opts.stroke || '#4a5878';
    const fill = opts.fill || 'none';
    const sw = opts.sw || 2.6;
    return `<svg viewBox="0 0 48 48" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
};

const ICONS = {
    // Basic shapes
    circle:      S(`<circle cx="24" cy="24" r="14"/>`),
    square:      S(`<rect x="10" y="10" width="28" height="28" rx="2"/>`),
    triangle:    S(`<polygon points="24,8 40,38 8,38"/>`),
    diamond:     S(`<polygon points="24,6 42,24 24,42 6,24"/>`),
    hexagon:     S(`<polygon points="24,6 40,15 40,33 24,42 8,33 8,15"/>`),
    pentagon:    S(`<polygon points="24,6 42,20 35,40 13,40 6,20"/>`),

    // Filled/stroked composites
    star:        S(`<polygon points="24,6 29,19 43,19 32,28 36,42 24,33 12,42 16,28 5,19 19,19"/>`),
    heart:       S(`<path d="M24 40 Q8 28 8 18 Q8 10 16 10 Q22 10 24 16 Q26 10 32 10 Q40 10 40 18 Q40 28 24 40 Z"/>`),
    crescent:    S(`<path d="M32 8 A16 16 0 1 0 32 40 A12 12 0 1 1 32 8 Z"/>`),
    dropIcon:    S(`<path d="M24 6 Q10 24 10 32 Q10 42 24 42 Q38 42 38 32 Q38 24 24 6 Z"/>`),

    // Pattern-based
    crosshair:   S(`<circle cx="24" cy="24" r="14"/><line x1="24" y1="6" x2="24" y2="42"/><line x1="6" y1="24" x2="42" y2="24"/>`),
    target:      S(`<circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="10"/><circle cx="24" cy="24" r="4"/>`),
    plus:        S(`<line x1="24" y1="8" x2="24" y2="40"/><line x1="8" y1="24" x2="40" y2="24"/>`, { sw: 4 }),
    xMark:       S(`<line x1="10" y1="10" x2="38" y2="38"/><line x1="38" y1="10" x2="10" y2="38"/>`, { sw: 4 }),
    checkMark:   S(`<polyline points="8,26 20,38 40,12"/>`, { sw: 4 }),

    // Arrows
    arrowUp:     S(`<line x1="24" y1="8" x2="24" y2="40"/><polyline points="14,18 24,8 34,18"/>`, { sw: 3 }),
    arrowRight:  S(`<line x1="8" y1="24" x2="40" y2="24"/><polyline points="30,14 40,24 30,34"/>`, { sw: 3 }),
    chevron:     S(`<polyline points="14,10 32,24 14,38"/>`, { sw: 3.5 }),
    doubleChev:  S(`<polyline points="10,10 24,24 10,38"/><polyline points="24,10 38,24 24,38"/>`, { sw: 3 }),

    // Grouped shapes
    dotGrid:     S(`<circle cx="14" cy="14" r="3" fill="#4a5878"/><circle cx="24" cy="14" r="3" fill="#4a5878"/><circle cx="34" cy="14" r="3" fill="#4a5878"/><circle cx="14" cy="24" r="3" fill="#4a5878"/><circle cx="24" cy="24" r="3" fill="#4a5878"/><circle cx="34" cy="24" r="3" fill="#4a5878"/><circle cx="14" cy="34" r="3" fill="#4a5878"/><circle cx="24" cy="34" r="3" fill="#4a5878"/><circle cx="34" cy="34" r="3" fill="#4a5878"/>`, { sw: 0 }),
    twoCircles:  S(`<circle cx="16" cy="24" r="10"/><circle cx="32" cy="24" r="10"/>`),
    threeStacks: S(`<rect x="8" y="32" width="32" height="8" rx="1"/><rect x="12" y="20" width="24" height="8" rx="1"/><rect x="16" y="8" width="16" height="8" rx="1"/>`),

    // Waves / lines
    wave:        S(`<path d="M6 24 Q12 12 18 24 Q24 36 30 24 Q36 12 42 24"/>`, { sw: 3 }),
    zigzag:      S(`<polyline points="6,30 14,18 22,30 30,18 38,30 42,24"/>`, { sw: 3 }),
    parallel:    S(`<line x1="8" y1="14" x2="40" y2="14"/><line x1="8" y1="24" x2="40" y2="24"/><line x1="8" y1="34" x2="40" y2="34"/>`, { sw: 3 }),

    // Compound patterns
    flower:      S(`<circle cx="24" cy="12" r="6"/><circle cx="36" cy="24" r="6"/><circle cx="24" cy="36" r="6"/><circle cx="12" cy="24" r="6"/><circle cx="24" cy="24" r="4" fill="#4a5878"/>`),
    gear:        S(`<circle cx="24" cy="24" r="8"/><line x1="24" y1="6" x2="24" y2="12"/><line x1="24" y1="36" x2="24" y2="42"/><line x1="6" y1="24" x2="12" y2="24"/><line x1="36" y1="24" x2="42" y2="24"/><line x1="11" y1="11" x2="15" y2="15"/><line x1="33" y1="33" x2="37" y2="37"/><line x1="37" y1="11" x2="33" y2="15"/><line x1="15" y1="33" x2="11" y2="37"/>`, { sw: 3 }),
    grid:        S(`<rect x="8" y="8" width="12" height="12"/><rect x="28" y="8" width="12" height="12"/><rect x="8" y="28" width="12" height="12"/><rect x="28" y="28" width="12" height="12"/>`),

    // More pattern shapes
    nested:      S(`<rect x="6" y="6" width="36" height="36" rx="2"/><rect x="14" y="14" width="20" height="20" rx="2"/>`),
    diag:        S(`<line x1="8" y1="40" x2="40" y2="8"/><line x1="8" y1="28" x2="28" y2="8"/><line x1="20" y1="40" x2="40" y2="20"/>`, { sw: 3 }),
    split:       S(`<circle cx="24" cy="24" r="16"/><line x1="8" y1="24" x2="40" y2="24"/>`),
    halfMoon:    S(`<path d="M8 24 A16 16 0 0 1 40 24 Z"/>`, { fill: '#4a5878' }),
    trefoil:     S(`<circle cx="24" cy="14" r="8"/><circle cx="15" cy="30" r="8"/><circle cx="33" cy="30" r="8"/>`)
};

const ICON_KEYS = Object.keys(ICONS);

function renderIcon(key) {
    return ICONS[key] || ICONS.person;
}

/* ==========================================================================
   LEVEL CONFIGURATION
   ========================================================================== */
const LEVELS = [
    { name: '레벨1-3개',   count: 3 },
    { name: '레벨2-4개',   count: 4 },
    { name: '레벨3-5개',   count: 5 },
    { name: '레벨4-6개',   count: 6 },
    { name: '레벨5-7개',   count: 7 },
    { name: '레벨6-8개',   count: 8 },
    { name: '레벨7-10개',  count: 10 },
    { name: '레벨8-12개',  count: 12 },
    { name: '레벨9-14개',  count: 14 },
    { name: '레벨10-16개', count: 16 },
    { name: '레벨11-18개', count: 18 },
    { name: '레벨12-20개', count: 20 },
    { name: '레벨13-22개', count: 22 },
    { name: '레벨14-24개', count: 24 }
];

const TEST_CONFIG = {
    preschool:  { refCount: 4, seqCount: 10, label: '유아~초등저학년' },
    elementary: { refCount: 6, seqCount: 15, label: '초등고학년~중등저학년' },
    middle:     { refCount: 7, seqCount: 20, label: '중등고학년~고등저학년' },
    adult:      { refCount: 9, seqCount: 28, label: '고등고학년~일반 성인' }
};

/* ==========================================================================
   GAME STATE & LOGIC
   ========================================================================== */
class SmartSwitchingGame {
    constructor() {
        this.mode = 'training';           // 'training' | 'test'
        this.currentLevel = 0;            // index into LEVELS
        this.referencePairs = [];         // [{icon, number}, ...]
        this.currentQuestion = null;      // {icon, number, isMatch}
        this.stats = {
            startTime: 0,
            lastAnswerTime: 0,
            point: 0,
            targetPoint: 20,
            totalTime: 0,
            answers: 0,
            correct: 0,
            wrong: 0
        };
        this.attempts = []; // {rt: seconds, correct: bool}
        this.streak = 0;
        this.bestStreak = 0;
        this.timerInterval = null;

        // Test mode state
        this.testType = null;
        this.testSequence = [];           // [{icon, userAnswer, correct}, ...]
        this.testIndex = 0;

        this.setupMenus();
        this.setupKeyboard();
        this.setupResize();
        this.setupAudio();
        this.setupFX();
        this.startTraining(0);
        // 클라이언트 인디케이터 초기화
        if (typeof ClientManager !== 'undefined') ClientManager.updateClientDisplay();
    }

    /* ---------------- Menu Setup ---------------- */
    setupMenus() {
        // Build level dropdown
        const lvlDropdown = document.getElementById('dropdownLevel');
        LEVELS.forEach((lvl, i) => {
            const opt = document.createElement('div');
            opt.className = 'menu-option';
            opt.textContent = lvl.name;
            opt.onclick = () => this.startTraining(i);
            lvlDropdown.appendChild(opt);
        });

        // Menu toggling
        const menus = [
            { item: 'menuFile',   drop: 'dropdownFile'   },
            { item: 'menuLevel',  drop: 'dropdownLevel'  },
            { item: 'menuTest',   drop: 'dropdownTest'   },
            { item: 'menuClient', drop: 'dropdownClient' }
        ];
        menus.forEach(m => {
            const itemEl = document.getElementById(m.item);
            const dropEl = document.getElementById(m.drop);
            itemEl.onclick = (e) => {
                e.stopPropagation();
                // close others
                menus.forEach(o => {
                    if (o.drop !== m.drop) {
                        document.getElementById(o.drop).classList.remove('show');
                        document.getElementById(o.item).classList.remove('active');
                    }
                });
                dropEl.classList.toggle('show');
                itemEl.classList.toggle('active');
            };
        });
        document.addEventListener('click', () => {
            menus.forEach(m => {
                document.getElementById(m.drop).classList.remove('show');
                document.getElementById(m.item).classList.remove('active');
            });
            document.querySelectorAll('.menu-option.has-submenu.open').forEach(el => el.classList.remove('open'));
        });

        // Nested submenu: clicking the parent (e.g. "New") toggles .open
        // and keeps the parent dropdown open. Hover still opens via CSS.
        document.querySelectorAll('.menu-option.has-submenu').forEach(parent => {
            parent.addEventListener('click', (e) => {
                // Only trigger if the click was on the parent itself, not a child option
                if (e.target !== parent) return;
                e.stopPropagation();
                parent.classList.toggle('open');
            });
        });
    }

    /* ---------------- Audio (Web Audio API) ---------------- */
    setupAudio() {
        this.audioCtx = null;
        this.audioReady = false;
        // Initialize on first user gesture (required by browser policies)
        const init = () => {
            if (this.audioReady) return;
            try {
                const AC = window.AudioContext || window.webkitAudioContext;
                this.audioCtx = new AC();
                this.audioReady = true;
            } catch (e) {}
        };
        ['click', 'keydown', 'touchstart'].forEach(ev =>
            document.addEventListener(ev, init, { once: true, capture: true })
        );
    }

    playTone(frequencies, duration = 0.18, type = 'sine', volume = 0.22) {
        if (!this.audioCtx) return;
        const ctx = this.audioCtx;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        // Schedule frequency ramp for each target
        if (Array.isArray(frequencies)) {
            osc.frequency.setValueAtTime(frequencies[0], now);
            frequencies.slice(1).forEach((f, i) => {
                osc.frequency.exponentialRampToValueAtTime(
                    Math.max(f, 1),
                    now + duration * ((i + 1) / frequencies.length)
                );
            });
        } else {
            osc.frequency.setValueAtTime(frequencies, now);
        }
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration + 0.02);
    }

    playCorrect() {
        // Pleasant ascending two-tone chime: C5 → E5 → G5
        this.playTone(523.25, 0.09, 'sine', 0.2);
        setTimeout(() => this.playTone(659.25, 0.09, 'sine', 0.2), 90);
        setTimeout(() => this.playTone(783.99, 0.16, 'sine', 0.2), 180);
    }

    playWrong() {
        // Descending buzz: E4 → A3 with sawtooth for harsh tone
        this.playTone([329.63, 220.00], 0.22, 'sawtooth', 0.14);
        setTimeout(() => this.playTone(196.00, 0.18, 'square', 0.10), 180);
    }

    /* ---------------- FX (confetti / particles) ---------------- */
    setupFX() {
        this.fxParticles = [];
        this.fxCanvas = document.getElementById('fxCanvas');
        this.fxCtx = this.fxCanvas.getContext('2d');
        const resize = () => {
            this.fxCanvas.width = window.innerWidth;
            this.fxCanvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);
        this.fxLoop();
    }

    fxLoop() {
        const ctx = this.fxCtx;
        ctx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);
        this.fxParticles = this.fxParticles.filter(p => p.life > 0);
        this.fxParticles.forEach(p => {
            p.vy += p.g;
            p.vx *= 0.99;
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.vrot;
            p.life -= 1;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
            if (p.shape === 'circle') {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.shape === 'star') {
                ctx.fillStyle = p.color;
                this.drawStar(ctx, 0, 0, p.size);
            } else {
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            }
            ctx.restore();
        });
        requestAnimationFrame(() => this.fxLoop());
    }

    drawStar(ctx, cx, cy, r) {
        const spikes = 5;
        const outerR = r;
        const innerR = r * 0.5;
        let rot = Math.PI / 2 * 3;
        const step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerR);
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(cx + Math.cos(rot) * outerR, cy - Math.sin(rot) * outerR);
            rot += step;
            ctx.lineTo(cx + Math.cos(rot) * innerR, cy - Math.sin(rot) * innerR);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerR);
        ctx.closePath();
        ctx.fill();
    }

    confettiBurst(cx, cy, intensity = 1) {
        const colors = ['#ff6b6b', '#f7b731', '#5cb85c', '#4aa3df', '#9b59b6', '#f5c320', '#e84545'];
        const count = Math.floor(30 * intensity);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 4 + Math.random() * 8;
            const shape = Math.random() < 0.3 ? 'star' : (Math.random() < 0.5 ? 'rect' : 'circle');
            this.fxParticles.push({
                x: cx, y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 3,
                g: 0.25,
                size: 5 + Math.random() * 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                rot: Math.random() * Math.PI,
                vrot: (Math.random() - 0.5) * 0.3,
                life: 60 + Math.random() * 30,
                maxLife: 90,
                shape
            });
        }
    }

    celebrationBurst() {
        const W = window.innerWidth;
        // Massive confetti from multiple points
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.confettiBurst(W * (0.2 + i * 0.15), window.innerHeight * 0.3, 1.5);
            }, i * 80);
        }
    }

    /* ---------------- Praise / Streak ---------------- */
    PRAISE = [
        { min: 2,  text: 'GOOD!',      color: '#4aa3df', size: 64 },
        { min: 4,  text: 'NICE!',      color: '#2bb5a4', size: 72 },
        { min: 6,  text: 'GREAT!',     color: '#3fb85e', size: 80 },
        { min: 8,  text: 'AMAZING!',   color: '#e88820', size: 88 },
        { min: 12, text: 'INCREDIBLE!',color: '#e84545', size: 92 },
        { min: 16, text: 'PERFECT!',   color: '#f5c320', size: 100 },
        { min: 20, text: 'UNSTOPPABLE!',color: '#9b59b6', size: 108 }
    ];

    MASCOT_PHRASES = {
        correct: ['좋아요!', '잘했어요!', '정답!', '굿!', '완벽!', '멋져요!', '훌륭해요!'],
        wrong:   ['앗!', '괜찮아요', '다시!', '힘내요', '아쉽!'],
        streak:  ['불타오르네요!🔥', '연속 정답!', '대단해요!', '계속 가요!', '무적모드!']
    };

    showPraise() {
        const tier = [...this.PRAISE].reverse().find(p => this.streak >= p.min);
        if (!tier) return;
        const el = document.createElement('div');
        el.className = 'praise-pop';
        el.textContent = tier.text;
        el.style.color = tier.color;
        el.style.fontSize = tier.size + 'px';
        el.style.textShadow = `0 4px 20px ${tier.color}66, 0 2px 6px rgba(0,0,0,0.2)`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 900);
    }

    updateComboBadge() {
        const badge = document.getElementById('comboBadge');
        const count = document.getElementById('comboCount');
        const fire = document.getElementById('comboFire');
        if (this.streak >= 2) {
            badge.style.display = 'block';
            count.textContent = this.streak;
            badge.classList.remove('pop');
            void badge.offsetWidth; // reflow
            badge.classList.add('pop');
            // Fire intensifies
            if (this.streak >= 10)      fire.textContent = '🔥🔥🔥';
            else if (this.streak >= 5)  fire.textContent = '🔥🔥';
            else if (this.streak >= 3)  fire.textContent = '🔥';
            else fire.textContent = '';
        } else {
            badge.style.display = 'none';
        }
    }

    playComboTone(streak) {
        if (!this.audioCtx) return;
        // Pitch rises with streak
        const base = 523.25; // C5
        const freq = base * Math.pow(1.12, Math.min(streak - 1, 12));
        this.playTone(freq, 0.08, 'triangle', 0.18);
        setTimeout(() => this.playTone(freq * 1.5, 0.10, 'triangle', 0.16), 70);
    }

    /* ---------------- Mascot ---------------- */
    reactMascot(kind) {
        const m = document.getElementById('mascot');
        const speech = document.getElementById('mascotSpeech');
        m.classList.remove('happy', 'sad', 'streak');
        void m.offsetWidth;
        if (kind === 'correct') m.classList.add('happy');
        else if (kind === 'wrong') m.classList.add('sad');
        else if (kind === 'streak') m.classList.add('streak');

        const phrases = this.MASCOT_PHRASES[kind] || [];
        if (phrases.length) {
            const txt = phrases[Math.floor(Math.random() * phrases.length)];
            speech.textContent = txt;
            speech.classList.remove('show');
            void speech.offsetWidth;
            speech.classList.add('show');
            clearTimeout(this._speechTimer);
            this._speechTimer = setTimeout(() => speech.classList.remove('show'), 1600);
        }
    }

    /* ---------------- Progress Bar ---------------- */
    updateProgressBar() {
        const fill = document.getElementById('progressFill');
        const cur = document.getElementById('progressCurrent');
        const tot = document.getElementById('progressTotal');
        if (!fill) return;
        const pct = Math.min(100, (this.stats.point / this.stats.targetPoint) * 100);
        fill.style.width = pct + '%';
        cur.textContent = this.stats.point;
        tot.textContent = this.stats.targetPoint;
        fill.className = 'progress-fill';
        if (pct >= 100)      fill.classList.add('rainbow');
        else if (pct >= 75)  fill.classList.add('high');
        else if (pct >= 50)  fill.classList.add('mid');
    }

    /* ---------------- Resize ---------------- */
    setupResize() {
        let t;
        window.addEventListener('resize', () => {
            clearTimeout(t);
            t = setTimeout(() => {
                if (this.mode === 'training') this.fitReferenceToScreen();
            }, 120);
        });
    }

    /* ---------------- Keyboard Input ---------------- */
    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            const editorOpen = document.getElementById('targetEditorOverlay')?.style.display === 'flex';
            if (editorOpen) {
                if (e.key === 'Enter') { e.preventDefault(); this.saveTargetEditor(); }
                else if (e.key === 'Escape') { e.preventDefault(); this.closeTargetEditor(); }
                return;
            }
            if (this.mode === 'training') {
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.answer(true);
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.answer(false);
                }
            } else if (this.mode === 'test') {
                if (/^[1-9]$/.test(e.key)) {
                    e.preventDefault();
                    this.inputNumber(parseInt(e.key, 10));
                }
            }
        });
    }

    /* ---------------- Training Mode ---------------- */
    startTraining(levelIdx) {
        this.mode = 'training';
        this.currentLevel = levelIdx;
        this.trainingDone = false;
        this.attempts = [];
        this.resetStats();
        this.streak = 0;
        document.getElementById('questionCard').classList.remove('locked');
        this.updateComboBadge();
        this.updateProgressBar();
        document.getElementById('instructions').style.display = 'block';
        document.getElementById('questionArea').style.display = 'flex';
        document.getElementById('testArea').style.display = 'none';
        document.getElementById('printBtn').style.display = 'none';
        // Show fun elements for training mode
        document.getElementById('mascot').style.display = 'block';
        document.getElementById('progressWrap').style.display = 'block';
        this.generateReference();
        this.nextQuestion();
        this.startTimer();
    }

    generateReference() {
        const count = LEVELS[this.currentLevel].count;
        // Pick distinct icons
        const shuffled = [...ICON_KEYS].sort(() => Math.random() - 0.5);
        const iconPool = shuffled.slice(0, Math.min(count, ICON_KEYS.length));
        // Assign distinct numbers 1..24
        const numberPool = Array.from({length: 30}, (_, i) => i + 1)
            .sort(() => Math.random() - 0.5)
            .slice(0, count);

        this.referencePairs = [];
        for (let i = 0; i < count; i++) {
            this.referencePairs.push({
                icon: iconPool[i % iconPool.length],
                number: numberPool[i]
            });
        }
        this.renderReference();
    }

    renderReference() {
        const wrap = document.getElementById('referenceCards');
        wrap.innerHTML = '';
        wrap.className = 'reference-cards';
        this.referencePairs.forEach(p => {
            wrap.appendChild(this.makeCard(p.icon, p.number));
        });
        this.fitReferenceToScreen();
    }

    fitReferenceToScreen() {
        const wrap = document.getElementById('referenceCards');
        const n = this.referencePairs.length;
        if (!n) return;

        const viewportW = Math.max(window.innerWidth - 60, 320);
        // Reserved: menu(40) + instructions(~90) + question area(~220) + stats(~60) + paddings(~80)
        const reservedH = 490;
        const viewportH = Math.max(window.innerHeight - reservedH, 160);
        const gap = 12;
        const ratio = 1.15;

        // Try every column count, pick the one giving largest card that fits both dims
        let best = null;
        const maxCols = Math.min(n, 14);
        for (let cols = 1; cols <= maxCols; cols++) {
            const rows = Math.ceil(n / cols);
            const byW = Math.floor((viewportW - (cols - 1) * gap) / cols);
            const byH = Math.floor(((viewportH - (rows - 1) * gap) / rows) / ratio);
            const cardW = Math.min(byW, byH);
            if (!best || cardW > best.cardW) best = { cols, cardW, rows };
        }

        // Clamp card size
        const cardW = Math.max(54, Math.min(170, best.cardW));
        const cardH = Math.round(cardW * ratio);
        const fontNum = Math.max(10, Math.round(cardW * 0.15));
        const iconSize = Math.round(cardW * 0.54);
        const radius = Math.max(8, Math.round(cardW * 0.13));

        wrap.style.setProperty('--card-w', cardW + 'px');
        wrap.style.setProperty('--card-h', cardH + 'px');
        wrap.style.setProperty('--card-num', fontNum + 'px');
        wrap.style.setProperty('--card-icon', iconSize + 'px');
        wrap.style.setProperty('--card-radius', radius + 'px');
        wrap.style.gridTemplateColumns = `repeat(${best.cols}, ${cardW}px)`;
    }

    makeCard(iconKey, number, active = false) {
        const card = document.createElement('div');
        card.className = 'card' + (active ? ' active' : '');
        card.innerHTML = `
            <div class="card-number-top">${number}</div>
            <div class="card-icon">${renderIcon(iconKey)}</div>
            <div class="card-number-bottom">${number}</div>
        `;
        return card;
    }

    nextQuestion() {
        // Rule: icon MUST always match at least one reference card.
        // True  = icon AND number match an existing reference pair
        // False = icon matches a reference icon, but number does NOT match any pair with that icon
        const pickRef = this.referencePairs[Math.floor(Math.random() * this.referencePairs.length)];
        const icon = pickRef.icon;
        let number, isMatch;
        if (Math.random() < 0.5) {
            // True
            number = pickRef.number;
            isMatch = true;
        } else {
            // False - same icon, different number than any ref pair having this icon
            const forbidden = new Set(
                this.referencePairs.filter(p => p.icon === icon).map(p => p.number)
            );
            // Build candidate number pool (1..30, excluding forbidden)
            const pool = [];
            for (let n = 1; n <= 30; n++) if (!forbidden.has(n)) pool.push(n);
            number = pool[Math.floor(Math.random() * pool.length)];
            isMatch = false;
        }
        this.currentQuestion = { icon, number, isMatch };
        this.renderQuestion();
        this.stats.lastAnswerTime = Date.now();
    }

    renderQuestion() {
        const qc = document.getElementById('questionCard');
        qc.innerHTML = '';
        qc.appendChild(this.makeCard(this.currentQuestion.icon, this.currentQuestion.number, true));
    }

    answer(userSaidTrue) {
        if (!this.currentQuestion) return;
        if (this.trainingDone) return; // Stop accepting input after target reached
        const correct = (userSaidTrue === this.currentQuestion.isMatch);
        const now = Date.now();
        const deltaMs = now - this.stats.lastAnswerTime;
        const rt = deltaMs / 1000;
        this.stats.answers++;
        this.stats.totalTime += deltaMs;
        this.attempts.push({ rt, correct });

        if (correct) {
            this.streak++;
            if (this.streak > this.bestStreak) this.bestStreak = this.streak;
            this.stats.correct++;

            // Always +1 point per correct answer
            this.stats.point += 1;

            this.showFeedback('O', true);
            this.playCorrect();
            this.reactMascot(this.streak >= 3 ? 'streak' : 'correct');

            // Confetti near question card (for fun, size scales with streak)
            const qc = document.getElementById('questionCard');
            const r = qc.getBoundingClientRect();
            this.confettiBurst(r.left + r.width/2, r.top + r.height/2, 0.7 + Math.min(this.streak, 10) * 0.08);

            if (this.streak >= 2) {
                this.showPraise();
                this.playComboTone(this.streak);
            }
            this.showPointPop(1, false);
        } else {
            this.streak = 0;
            this.stats.wrong++;
            // Do NOT decrease point on wrong (keep clean +1 progression)
            this.showFeedback('X', false);
            this.playWrong();
            this.reactMascot('wrong');
            // Shake the question card
            const qc = document.getElementById('questionCard');
            qc.classList.remove('shake');
            void qc.offsetWidth;
            qc.classList.add('shake');
        }

        this.updateComboBadge();
        this.updateProgressBar();
        this.updateStatsUI();

        if (this.stats.point >= this.stats.targetPoint) {
            // Lock training: no more questions, no more input
            this.trainingDone = true;
            this.stopTimer();
            this.celebrationBurst();
            // Hide question card so user can't click further
            const qc = document.getElementById('questionCard');
            qc.classList.add('locked');
            setTimeout(() => this.openTargetModal(), 1200);
        } else {
            setTimeout(() => {
                if (this.trainingDone) return;
                this.generateReference();
                this.nextQuestion();
            }, 350);
        }
    }

    showPointPop(pts, speedy) {
        const qc = document.getElementById('questionCard');
        const r = qc.getBoundingClientRect();
        const el = document.createElement('div');
        el.className = 'point-pop' + (speedy ? ' speedy' : '');
        el.textContent = (speedy ? '⚡ ' : '') + '+' + pts;
        el.style.left = (r.right - 10) + 'px';
        el.style.top  = (r.top + 10) + 'px';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 900);
    }

    /* ---------------- Target Point Editor ---------------- */
    openTargetEditor() {
        const cur = this.stats.targetPoint;
        document.getElementById('targetEditCurrent').textContent = cur;
        const inp = document.getElementById('targetEditInput');
        inp.value = cur;
        document.getElementById('targetEditorOverlay').style.display = 'flex';
        setTimeout(() => { inp.focus(); inp.select(); }, 50);
    }

    closeTargetEditor() {
        document.getElementById('targetEditorOverlay').style.display = 'none';
    }

    setTargetPreset(n) {
        document.getElementById('targetEditInput').value = n;
    }

    saveTargetEditor() {
        const raw = parseInt(document.getElementById('targetEditInput').value, 10);
        if (!Number.isFinite(raw) || raw < 1) {
            alert('1 이상의 숫자를 입력하세요.');
            return;
        }
        const val = Math.min(Math.max(raw, 1), 500);
        this.stats.targetPoint = val;
        this.updateStatsUI();
        this.closeTargetEditor();
    }

    /* ---------------- Target Modal / Result Flow ---------------- */
    openTargetModal() {
        const avg = this.stats.answers ? (this.stats.totalTime / this.stats.answers / 1000).toFixed(2) : '0';
        document.getElementById('modalPoint').textContent = this.stats.point;
        document.getElementById('modalAvg').textContent = avg;
        document.getElementById('modalOverlay').style.display = 'flex';
    }

    closeModal() {
        // Deprecated (modal X close). Kept as alias for showResult to avoid accidental bypass.
        this.showResult();
    }

    async showResult() {
        document.getElementById('modalOverlay').style.display = 'none';
        document.getElementById('resultPage').style.display = 'block';
        this.renderChart();
        this.renderMetrics();
        // Set defaults
        const today = new Date();
        const dateStr = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
        const di = document.getElementById('trainDate');
        if (!di.value) di.value = dateStr;
        // 활성 클라이언트 이름 자동 채움
        if (typeof ClientManager !== 'undefined') {
            const ac = ClientManager.getActiveClient();
            if (ac) {
                const ni = document.getElementById('clientName');
                if (ni && !ni.value) ni.value = ac.name;
            }
        }
        // Hide menu, stats bar, game elements
        document.querySelector('.menu-bar').style.display = 'none';
        document.getElementById('gameArea').style.display = 'none';
        document.getElementById('statsBar').style.display = 'none';
        document.getElementById('mascot').style.display = 'none';
        document.getElementById('progressWrap').style.display = 'none';
        document.getElementById('comboBadge').style.display = 'none';
        document.getElementById('fxCanvas').style.display = 'none';
        // 세션 저장 (활성 클라이언트가 있을 때만)
        this._saveCurrentSession('training');
        // Generate AI analysis (async)
        this.loadAnalysis();
    }

    /* ---------------- Client Session Saving ---------------- */
    _saveCurrentSession(mode, testType) {
        if (typeof saveClientSession !== 'function') return;
        const m = this.computeMetrics();
        saveClientSession({
            mode: mode,                                // 'training' | 'test'
            testType: testType || null,                // preschool/elementary/middle/adult
            level: mode === 'training' ? this.currentLevel : null,
            targetScore: parseInt(m.targetPoint) || 0,
            totalAttempts: parseInt(m.totalTries) || 0,
            correct: parseInt(m.correct) || 0,
            errors: parseInt(m.errors) || 0,
            errorRate: parseFloat(m.errRate) || 0,
            totalTime: this.stats.totalTime || 0,
            avgTime: parseFloat(m.avgTime) || 0,
            grade: this._lastGradeTier || null,
            gradeLabel: this._lastGradeLabel || null,
            score: this.stats.point || 0
        });
    }

    backFromResult() {
        document.getElementById('resultPage').style.display = 'none';
        document.querySelector('.menu-bar').style.display = 'flex';
        document.getElementById('gameArea').style.display = 'flex';
        document.getElementById('statsBar').style.display = 'flex';
        document.getElementById('fxCanvas').style.display = 'block';
        // Clean restart of the same training level (mascot/progress restored in startTraining)
        this.startTraining(this.currentLevel);
    }

    printReport() {
        document.body.classList.add('print-report');
        window.print();
        document.body.classList.remove('print-report');
    }

    renderChart() {
        const svg = document.getElementById('resultChart');
        svg.innerHTML = '';
        const W = 900, H = 240;
        const padL = 40, padR = 60, padT = 20, padB = 30;
        const plotW = W - padL - padR;
        const plotH = H - padT - padB;
        const maxY = 7; // seconds
        const n = this.attempts.length || 1;

        // Y axis labels and gridlines
        for (let y = 0; y <= maxY; y++) {
            const yy = padT + plotH - (y / maxY) * plotH;
            svg.innerHTML += `<line x1="${padL}" y1="${yy}" x2="${padL + plotW}" y2="${yy}" stroke="#eee" stroke-width="1"/>`;
            svg.innerHTML += `<text x="${padL - 6}" y="${yy + 4}" text-anchor="end" font-size="11" fill="#666">${y}</text>`;
        }
        // time label
        svg.innerHTML += `<text x="${padL - 28}" y="${padT - 4}" font-size="11" fill="#666">time</text>`;
        // number label (x-axis)
        svg.innerHTML += `<text x="${padL + plotW + 4}" y="${padT + plotH + 4}" font-size="11" fill="#666">number</text>`;

        // 2-second benchmark line (orange)
        const y2 = padT + plotH - (2 / maxY) * plotH;
        svg.innerHTML += `<line x1="${padL}" y1="${y2}" x2="${padL + plotW}" y2="${y2}" stroke="#f0a040" stroke-width="2"/>`;
        svg.innerHTML += `<text x="${padL + plotW + 4}" y="${y2 + 4}" font-size="11" fill="#f0a040">averge</text>`;

        // Data points
        this.attempts.forEach((a, i) => {
            const x = padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
            const yVal = Math.min(a.rt, maxY);
            const y = padT + plotH - (yVal / maxY) * plotH;
            const color = a.correct ? '#3b6fd6' : '#e84545';
            svg.innerHTML += `<circle cx="${x}" cy="${y}" r="3" fill="${color}"/>`;
        });

        // Connect correct-points line faintly
        const correctPts = this.attempts.map((a, i) => {
            const x = padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
            const y = padT + plotH - (Math.min(a.rt, maxY) / maxY) * plotH;
            return { x, y, correct: a.correct };
        });
        let pathD = '';
        correctPts.forEach((p, i) => { pathD += (i === 0 ? 'M' : 'L') + p.x + ',' + p.y; });
        svg.innerHTML += `<path d="${pathD}" fill="none" stroke="rgba(100,130,180,0.25)" stroke-width="1"/>`;

        // Axes
        svg.innerHTML += `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="#aaa" stroke-width="1"/>`;
        svg.innerHTML += `<line x1="${padL}" y1="${padT + plotH}" x2="${padL + plotW}" y2="${padT + plotH}" stroke="#aaa" stroke-width="1"/>`;
    }

    computeMetrics() {
        const levelInfo = LEVELS[this.currentLevel];
        const totalMs = this.stats.totalTime;
        const mins = Math.floor(totalMs / 60000);
        const secs = Math.floor((totalMs % 60000) / 1000);
        const errRate = this.stats.answers ? (this.stats.wrong / this.stats.answers * 100) : 0;
        const avgTime = this.stats.answers ? (this.stats.totalTime / this.stats.answers / 1000) : 0;
        return {
            levelName: levelInfo.name,
            levelCount: levelInfo.count,
            targetPoint: this.stats.targetPoint,
            totalTimeStr: `${mins}분:${String(secs).padStart(2,'0')}초`,
            totalTries: this.stats.answers,
            errors: this.stats.wrong,
            correct: this.stats.correct,
            errRate: errRate.toFixed(2),
            avgTime: avgTime.toFixed(2)
        };
    }

    renderMetrics() {
        const m = this.computeMetrics();
        document.getElementById('rptLevel').textContent = m.levelName + ' (' + m.levelCount + '개)';
        document.getElementById('rptTarget').textContent = m.targetPoint;
        document.getElementById('rptTries').textContent = m.totalTries;
        document.getElementById('rptCorrect').textContent = m.correct;
        document.getElementById('rptErrors').textContent = m.errors;
        document.getElementById('rptErrRate').textContent = m.errRate + '%';
        document.getElementById('rptTotalTime').textContent = m.totalTimeStr;
        document.getElementById('rptAvgTime').textContent = m.avgTime + '초';
    }

    /* ---------------- Ollama Integration ---------------- */
    // Config stored in localStorage (editable via settings modal)
    getOllamaConfig() {
        let cfg;
        try { cfg = JSON.parse(localStorage.getItem('ollamaConfig') || '{}'); }
        catch { cfg = {}; }
        return {
            url: cfg.url || 'http://localhost:11434',
            model: cfg.model || '',           // empty = auto-detect
            enabled: cfg.enabled !== false     // default on
        };
    }

    saveOllamaConfig(cfg) {
        localStorage.setItem('ollamaConfig', JSON.stringify(cfg));
    }

    // Preferred model order (tries in order if available)
    PREFERRED_MODELS = [
        'llama3.2', 'llama3.2:latest',
        'llama3.1', 'llama3.1:latest',
        'llama3',   'llama3:latest',
        'qwen2.5', 'qwen2.5:latest',
        'gemma2',  'gemma2:latest',
        'mistral', 'mistral:latest',
        'phi3',    'phi3:latest'
    ];

    async ollamaListModels(url) {
        try {
            const res = await fetch(`${url}/api/tags`, { method: 'GET' });
            if (!res.ok) return { err: `HTTP_${res.status}` };
            const data = await res.json();
            return { models: (data.models || []).map(m => m.name) };
        } catch (e) {
            // Distinguish network errors
            const msg = String(e?.message || e);
            if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('CORS')) {
                return { err: 'NETWORK_OR_CORS', detail: msg };
            }
            return { err: 'UNKNOWN', detail: msg };
        }
    }

    /**
     * Probe Ollama with a no-cors fetch to distinguish "not running" from "CORS blocked".
     * - If server is up but CORS blocks: no-cors returns opaque response OK.
     * - If server isn't running: both fail.
     */
    async ollamaProbeServer(url) {
        try {
            const res = await fetch(`${url}/api/tags`, { mode: 'no-cors' });
            // opaque response but fetch succeeded → server IS running
            return { alive: true };
        } catch (e) {
            return { alive: false };
        }
    }

    async ollamaPickModel(url, preferredModel) {
        const result = await this.ollamaListModels(url);
        if (result.err) return { err: result.err, detail: result.detail, available: null, picked: null };
        const available = result.models;
        if (preferredModel && available.includes(preferredModel)) {
            return { available, picked: preferredModel };
        }
        if (preferredModel) {
            const prefixMatch = available.find(m => m.startsWith(preferredModel));
            if (prefixMatch) return { available, picked: prefixMatch };
        }
        for (const p of this.PREFERRED_MODELS) {
            if (available.includes(p)) return { available, picked: p };
        }
        if (available.length) return { available, picked: available[0] };
        return { available, picked: null };
    }

    async ollamaGenerateStreaming(url, model, prompt, onToken) {
        const res = await fetch(`${url}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                prompt,
                stream: true,
                options: { temperature: 0.7, top_p: 0.9 }
            })
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = '';
        let buffer = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); // leftover
            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const obj = JSON.parse(line);
                    if (obj.response) {
                        full += obj.response;
                        onToken(full);
                    }
                    if (obj.done) return full;
                } catch {}
            }
        }
        return full;
    }

    async loadAnalysis() {
        const loading = document.getElementById('analysisLoading');
        const status = document.getElementById('analysisStatus');
        const content = document.getElementById('analysisContent');
        loading.style.display = 'flex';
        content.style.display = 'none';
        content.innerHTML = '';

        const m = this.computeMetrics();
        const prompt = this.buildAnalysisPrompt(m);
        const cfg = this.getOllamaConfig();

        const setStatus = (txt, ok) => {
            if (status) {
                status.textContent = txt;
                status.className = 'ollama-status ' + (ok ? 'ok' : 'warn');
            }
        };

        let text = null;
        let usedAI = false;

        if (cfg.enabled) {
            try {
                setStatus(`🔍 Ollama 연결 확인 중... (${cfg.url})`, true);
                const pick = await this.ollamaPickModel(cfg.url, cfg.model);
                if (pick.err) {
                    if (pick.err === 'NETWORK_OR_CORS') {
                        const probe = await this.ollamaProbeServer(cfg.url);
                        throw new Error(probe.alive ? 'CORS_BLOCKED' : 'CONNECTION_FAILED');
                    }
                    throw new Error(pick.err);
                }
                if (!pick.available) throw new Error('CONNECTION_FAILED');
                if (!pick.picked)   throw new Error('NO_MODEL');
                setStatus(`🤖 AI 분석 중... (${pick.picked}) · 모델 ${pick.available.length}개 감지됨`, true);

                // Stream into content area
                loading.style.display = 'none';
                content.style.display = 'block';
                content.innerHTML = '<div class="ai-streaming"><span class="ai-caret"></span></div>';

                const streamDiv = content.querySelector('.ai-streaming');
                const rendered = await this.ollamaGenerateStreaming(cfg.url, pick.picked, prompt, (partial) => {
                    streamDiv.innerHTML = this.formatAnalysis(partial) + '<span class="ai-caret"></span>';
                });
                text = rendered;
                usedAI = true;
                setStatus(`✅ Ollama AI 분석 완료 · 모델: ${pick.picked}`, true);
            } catch (e) {
                const code = e.message;
                if (code === 'CONNECTION_FAILED') {
                    setStatus('⚠ Ollama 서버 미실행 · Ollama 앱이 실행 중인지 확인하세요 (템플릿 분석 사용)', false);
                } else if (code === 'CORS_BLOCKED') {
                    setStatus('⚠ Ollama는 실행 중이지만 CORS 차단됨 · AI 설정 → 문제해결 가이드 참고 (OLLAMA_ORIGINS=*)', false);
                } else if (code === 'NO_MODEL') {
                    setStatus('⚠ Ollama 모델 미설치 · ollama pull llama3.2 실행 후 다시 시도', false);
                } else {
                    setStatus('⚠ AI 요청 오류: ' + code + ' · 템플릿 분석으로 전환', false);
                }
            }
        } else {
            setStatus('ℹ Ollama 비활성화됨 · 템플릿 분석 사용', false);
        }

        if (!usedAI) {
            text = this.templateAnalysis(m);
            loading.style.display = 'none';
            content.style.display = 'block';
            content.innerHTML = this.formatAnalysis(text);
        }
    }

    openOllamaSettings() {
        const cfg = this.getOllamaConfig();
        document.getElementById('ollamaUrlInput').value = cfg.url;
        document.getElementById('ollamaModelInput').value = cfg.model;
        document.getElementById('ollamaEnabledInput').checked = cfg.enabled;
        document.getElementById('ollamaStatusCheck').innerHTML = '';
        document.getElementById('ollamaStatusCheck').className = 'ollama-check';
        document.getElementById('ollamaSettingsOverlay').style.display = 'flex';
        // Auto-run diagnostic
        this.runOllamaDiagnostic();
    }

    closeOllamaSettings() {
        document.getElementById('ollamaSettingsOverlay').style.display = 'none';
    }

    async runOllamaDiagnostic() {
        const diag = document.getElementById('ollamaDiagnostic');
        const help = document.getElementById('ollamaHelpDetails');
        diag.className = 'ollama-diag checking';
        diag.innerHTML = '<span class="spinner"></span> Ollama 연결 상태 자동 확인 중...';
        help.open = false;

        const url = document.getElementById('ollamaUrlInput').value.trim() || 'http://localhost:11434';
        const result = await this.ollamaListModels(url);

        if (result.models) {
            // Connection works
            if (result.models.length === 0) {
                diag.className = 'ollama-diag warn';
                diag.innerHTML = `
                    <div class="diag-icon">⚠</div>
                    <div class="diag-text">
                        <b>Ollama 연결 성공 · 설치된 모델이 없습니다</b>
                        <p>터미널에서 아래 명령으로 모델을 다운로드하세요:</p>
                        <div class="cmd-box"><code>ollama pull llama3.2</code><button class="copy-btn" onclick="game.copyCmd(this, 'ollama pull llama3.2')">복사</button></div>
                    </div>`;
                help.open = true;
            } else {
                diag.className = 'ollama-diag ok';
                diag.innerHTML = `
                    <div class="diag-icon">✅</div>
                    <div class="diag-text">
                        <b>Ollama 연결 성공!</b>
                        <p>설치된 모델 <b>${result.models.length}개</b>: ${result.models.map(m => `<code>${m}</code>`).join(', ')}</p>
                        <p style="color:#065f46;">AI 분석을 바로 사용할 수 있습니다. 🎉</p>
                    </div>`;
            }
        } else {
            // Connection failed — probe to tell CORS from "not running"
            const probe = await this.ollamaProbeServer(url);
            if (probe.alive) {
                // Server running but CORS blocked
                diag.className = 'ollama-diag fail';
                diag.innerHTML = `
                    <div class="diag-icon">🚫</div>
                    <div class="diag-text">
                        <b>Ollama는 실행 중이지만 <u>CORS 차단</u> 상태입니다</b>
                        <p>브라우저의 보안 정책이 Ollama 요청을 막고 있습니다.
                        <b>OLLAMA_ORIGINS=*</b> 환경변수를 설정하고 Ollama를 재시작해야 합니다.</p>
                        <p>⬇ 아래 <b>문제 해결 가이드</b>에서 OS별 설정 방법을 확인하세요.</p>
                    </div>`;
                help.open = true;
            } else {
                // Server not reachable
                diag.className = 'ollama-diag fail';
                diag.innerHTML = `
                    <div class="diag-icon">❌</div>
                    <div class="diag-text">
                        <b>Ollama 서버에 연결할 수 없습니다 (${url})</b>
                        <p>• Ollama 앱이 실행 중인지 확인하세요 (트레이 아이콘 / Dock / Applications)</p>
                        <p>• 브라우저에서 <a href="${url}" target="_blank">${url}</a> 접속 시 <code>Ollama is running</code> 메시지가 나와야 합니다.</p>
                        <p>• 포트가 다르면 위 URL 입력란에서 변경하세요.</p>
                    </div>`;
                help.open = true;
            }
        }
    }

    async testOllamaConnection() {
        const url = document.getElementById('ollamaUrlInput').value.trim();
        const model = document.getElementById('ollamaModelInput').value.trim();
        const statusEl = document.getElementById('ollamaStatusCheck');
        statusEl.innerHTML = '<span class="spinner"></span> 연결 확인 중...';
        statusEl.className = 'ollama-check pending';
        const pick = await this.ollamaPickModel(url, model);

        if (pick.err) {
            const probe = await this.ollamaProbeServer(url);
            if (probe.alive) {
                statusEl.innerHTML = `🚫 <b>CORS 차단됨</b> — Ollama는 실행 중이지만 브라우저가 접근할 수 없습니다.<br><small>아래 문제 해결 가이드를 펼쳐 <b>OLLAMA_ORIGINS=*</b> 설정 방법을 확인하세요.</small>`;
                statusEl.className = 'ollama-check fail';
                document.getElementById('ollamaHelpDetails').open = true;
            } else {
                statusEl.innerHTML = `❌ <b>서버 미응답</b> — Ollama 앱이 실행 중인지 확인하세요.<br><small>브라우저에서 <a href="${url}" target="_blank">${url}</a> 접속 시 "Ollama is running"이 보여야 합니다.</small>`;
                statusEl.className = 'ollama-check fail';
            }
            // Also refresh top diagnostic
            this.runOllamaDiagnostic();
            return;
        }

        if (!pick.available || !pick.available.length) {
            statusEl.innerHTML = `⚠ <b>모델 미설치</b> — 아래 명령으로 설치하세요:<br><code>ollama pull llama3.2</code>`;
            statusEl.className = 'ollama-check warn';
            return;
        }
        if (!pick.picked) {
            statusEl.innerHTML = `⚠ 사용 가능한 모델이 없습니다.<br><code>ollama pull llama3.2</code>`;
            statusEl.className = 'ollama-check warn';
            return;
        }
        statusEl.innerHTML = `✅ 연결 성공 · 선택된 모델: <b>${pick.picked}</b><br><small>설치된 모델: ${pick.available.map(m => `<code>${m}</code>`).join(' ')}</small>`;
        statusEl.className = 'ollama-check ok';
        this.runOllamaDiagnostic();
    }

    copyCmd(btn, text) {
        navigator.clipboard?.writeText(text).then(() => {
            const orig = btn.textContent;
            btn.textContent = '✓ 복사됨';
            btn.classList.add('copied');
            setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1500);
        }).catch(() => alert('복사 실패: ' + text));
    }

    saveOllamaSettings() {
        const url = document.getElementById('ollamaUrlInput').value.trim() || 'http://localhost:11434';
        const model = document.getElementById('ollamaModelInput').value.trim();
        const enabled = document.getElementById('ollamaEnabledInput').checked;
        this.saveOllamaConfig({ url, model, enabled });
        this.closeOllamaSettings();
    }

    buildAnalysisPrompt(m) {
        return `당신은 아동·청소년 인지발달 전문가이자 임상심리학자입니다. 다음은 '스마트 스위칭 인지 훈련'(시각-숫자 매칭 과제)을 수행한 결과입니다. 부모/보호자 또는 임상 클라이언트에게 제공할 리포트 형식의 한국어 분석을 작성해 주세요.

[훈련 결과 데이터]
- 훈련 단계: ${m.levelName} (참조 자극 ${m.levelCount}개)
- 목표 점수: ${m.targetPoint}점 (달성)
- 총 소요 시간: ${m.totalTimeStr}
- 총 시도 횟수: ${m.totalTries}회
- 정답 수: ${m.correct}회
- 오류 수: ${m.errors}회
- 오류율: ${m.errRate}%
- 평균 반응 시간: ${m.avgTime}초 (기준선 2.00초)

[작성 지침]
1. **종합 평가**: 피검자의 수행 수준을 2.0초 기준선과 오류율을 근거로 평가.
2. **인지 기능별 분석**: 다음 4개 영역을 각각 평가하고 근거 수치 포함.
   - 인지 유연성(Cognitive Flexibility) – 과제 간 전환 능력
   - 시각 추적(Visual Tracking) – 시각 자극 처리·주의 지속
   - 순발력(Processing Speed) – 반응 속도·의사결정 속도
   - 작업 기억(Working Memory) – 참조 자극 유지·회상
3. **강점과 보완점**: 수치 기반으로 3~4가지 제시.
4. **권장 훈련 계획**: 다음 단계 제안.
5. 전문적이면서도 보호자가 이해하기 쉬운 톤, 7~10문단, Markdown 서식 사용.`;
    }

    templateAnalysis(m) {
        const avg = parseFloat(m.avgTime);
        const err = parseFloat(m.errRate);
        const speedLabel = avg < 1.0 ? '매우 빠름' : avg < 1.5 ? '빠름' : avg < 2.0 ? '보통' : avg < 3.0 ? '다소 느림' : '느림';
        const speedGrade = avg < 1.0 ? '우수' : avg < 1.5 ? '양호' : avg < 2.0 ? '정상 범위' : '보완 필요';
        const accLabel = err < 5 ? '탁월한 정확성' : err < 15 ? '우수한 정확성' : err < 30 ? '양호한 정확성' : '주의 집중 보완 필요';
        const accGrade = err < 5 ? '매우 우수' : err < 15 ? '우수' : err < 30 ? '보통' : '보완 필요';

        return `## 1. 종합 평가 (Overall Assessment)

피검자는 **${m.levelName}** 난이도에서 **평균 반응 시간 ${m.avgTime}초**, **오류율 ${m.errRate}%** 로 목표 점수 ${m.targetPoint}점을 달성하였습니다. 임상 기준선(2.00초)과 비교할 때 처리 속도는 **${speedLabel}(${speedGrade})** 수준이며, 정확도는 **${accLabel}(${accGrade})** 으로 나타났습니다.

## 2. 인지 기능별 분석 (Domain-wise Analysis)

### 1. 인지 유연성 (Cognitive Flexibility)
스마트 스위칭 과제는 상단의 참조 자극 집합과 하단의 탐색 자극을 지속적으로 전환하며 비교해야 하는 **과제 전환(task-switching) 패러다임**에 기반합니다 (Monsell, 2003). 본 피검자는 ${m.totalTries}회의 시도 중 ${m.correct}회 정답을 달성하여 **${(100-err).toFixed(1)}%의 정답률**을 보였으며, 이는 Miyake et al. (2000)이 제안한 집행 기능의 3대 하위 요인(Shifting, Updating, Inhibition) 중 *Shifting(전환)* 능력이 ${err < 15 ? '정상~우수 범위' : '발달 필요 범위'}에 위치함을 시사합니다.

### 2. 시각 추적 및 선택적 주의 (Visual Tracking & Selective Attention)
참조 자극 **${m.levelCount}개**를 동시에 유지하면서 표적 자극을 탐색한 점은 시각 작업 기억과 주의 분배의 통합 지표입니다. 평균 반응 시간 ${m.avgTime}초는 ${avg < 1.5 ? '시각 스캔 경로가 효율적으로 구성되어 있음을' : avg < 2.5 ? '일반적 시각 탐색 속도를' : '시각 처리 속도 향상이 필요함을'} 의미합니다 (Anderson, 2002).

### 3. 순발력 / 처리 속도 (Processing Speed)
Diamond (2013)의 집행 기능 모델에 따르면 처리 속도는 의사결정 과제의 근본 자원입니다. 본 피검자의 평균 반응 시간 **${m.avgTime}초**는 ${avg < 1.0 ? '또래 평균 상위권' : avg < 2.0 ? '정상 발달 범위' : '보완 훈련이 권장되는 범위'}에 해당합니다. 반응 시간 변동성(그래프상의 이탈 점) 또한 ${err < 10 ? '낮아 일관된 수행' : '다소 있어 주의 집중의 기복'}을 보여줍니다.

### 4. 작업 기억 (Working Memory)
${m.levelCount}개의 참조 자극을 단기간 유지하며 비교하는 능력은 작업 기억 용량을 반영합니다. ${m.levelCount >= 8 ? `8개 이상의 항목을 다룬 것은 작업 기억 용량이 연령 평균 대비 양호함을 시사합니다` : `본 단계는 작업 기억 기초 용량을 훈련하는 데 적합합니다`} (Deák & Wiseheart, 2015).

## 3. 강점 (Strengths)
- **정답률 ${(100-err).toFixed(1)}%** — 자극 구분 정확도가 ${err < 15 ? '우수' : '양호'}
- **평균 반응 시간 ${m.avgTime}초** — 처리 속도가 ${avg < 2 ? '기준선 이내로 안정적' : '기준선 근접'}
- ${m.levelCount}개 참조 자극을 처리하며 집행 기능의 *Shifting* 및 *Updating* 요인에 ${err<15?'양호한':'기본'} 수행을 보임

## 4. 보완점 (Areas for Improvement)
${err >= 15 ? '- **오류율 ' + m.errRate + '%** — 충동적 반응 억제(Inhibition) 훈련 필요\n' : ''}${avg >= 2.0 ? '- **반응 시간 ' + m.avgTime + '초** — 처리 속도 향상을 위한 반복 훈련 권장\n' : ''}${err < 15 && avg < 2.0 ? '- 현 난이도에서 안정적 수행을 보이므로 더 높은 난이도에서의 일반화 훈련이 필요합니다.\n' : ''}
## 5. 권장 훈련 계획 (Recommended Plan)
1. **다음 단계 권장**: ${err < 10 && avg < 1.5 ? `상위 난이도(레벨 ${Math.min(this.currentLevel + 2, 13) + 1})로 도전` : err < 20 ? `동일 난이도를 1~2회 반복 후 상위 난이도 시도` : `현 난이도를 안정화 할 때까지 반복 수행 후 단계 상승 고려`}
2. **주 3~4회, 회당 10~15분** 규칙적 수행을 권장합니다 (Anderson, 2002).
3. 보조 활동: 시각-공간 퍼즐, 카드 매칭 게임, 스토리 기반 규칙 전환 게임.

---
*본 리포트는 스마트 스위칭 훈련 결과에 기반한 참고 분석이며, 임상적 진단을 대체하지 않습니다.*`;
    }

    formatAnalysis(text) {
        // Simple markdown → HTML
        let html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        html = html.replace(/^### (.*$)/gm, '<h4>$1</h4>');
        html = html.replace(/^## (.*$)/gm, '<h3>$1</h3>');
        html = html.replace(/^# (.*$)/gm, '<h2>$1</h2>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        html = html.replace(/^---$/gm, '<hr>');
        html = html.replace(/^- (.+$)/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>\n?)+/g, (m) => '<ul>' + m + '</ul>');
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';
        html = html.replace(/<p>\s*<\/p>/g, '');
        html = html.replace(/<p>(<h[234]>)/g, '$1').replace(/(<\/h[234]>)<\/p>/g, '$1');
        html = html.replace(/<p>(<ul>)/g, '$1').replace(/(<\/ul>)<\/p>/g, '$1');
        html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
        return html;
    }

    showFeedback(text, ok) {
        const el = document.createElement('div');
        el.className = 'feedback-overlay ' + (ok ? 'correct' : 'wrong');
        el.textContent = text;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 800);
    }

    /* ---------------- Test Mode ---------------- */
    startTest(type) {
        this.mode = 'test';
        this.testType = type;
        this.resetStats();
        this.streak = 0;
        document.getElementById('mascot').style.display = 'none';
        document.getElementById('progressWrap').style.display = 'none';
        document.getElementById('comboBadge').style.display = 'none';
        const cfg = TEST_CONFIG[type];
        document.getElementById('instructions').style.display = 'none';
        document.getElementById('questionArea').style.display = 'none';
        document.getElementById('testArea').style.display = 'flex';
        document.getElementById('printBtn').style.display = 'inline-block';

        // Generate reference
        const iconPool = [...ICON_KEYS].sort(() => Math.random() - 0.5).slice(0, cfg.refCount);
        this.referencePairs = iconPool.map((icon, i) => ({ icon, number: i + 1 }));
        this.renderTestReference();

        // Generate test sequence
        this.testSequence = [];
        for (let i = 0; i < cfg.seqCount; i++) {
            const pick = this.referencePairs[Math.floor(Math.random() * this.referencePairs.length)];
            this.testSequence.push({
                icon: pick.icon,
                correctNumber: pick.number,
                userAnswer: null
            });
        }
        this.testIndex = 0;
        this.renderTestSequence();
        this.startTimer();
        this.stats.lastAnswerTime = Date.now();
    }

    renderTestReference() {
        const refWrap = document.getElementById('referenceCards');
        refWrap.innerHTML = '';
        refWrap.className = 'test-reference';
        this.referencePairs.forEach(p => {
            const c = document.createElement('div');
            c.className = 'test-ref-card';
            c.innerHTML = `
                <div class="test-icon">${renderIcon(p.icon)}</div>
                <div class="test-number">${p.number}</div>
            `;
            refWrap.appendChild(c);
        });
    }

    renderTestSequence() {
        const seqWrap = document.getElementById('testSequence');
        seqWrap.innerHTML = '';
        this.testSequence.forEach((item, i) => {
            const c = document.createElement('div');
            let cls = 'test-card';
            if (i === this.testIndex) cls += ' current';
            else if (item.userAnswer !== null) {
                cls += ' answered';
                cls += item.userAnswer === item.correctNumber ? ' correct' : ' wrong';
            }
            c.className = cls;
            c.innerHTML = `
                <div class="test-icon">${renderIcon(item.icon)}</div>
                <div class="test-number">${item.userAnswer !== null ? item.userAnswer : ''}</div>
            `;
            seqWrap.appendChild(c);
        });
        this.fitTestToScreen();
    }

    fitTestToScreen() {
        const refWrap = document.getElementById('referenceCards');
        const seqWrap = document.getElementById('testSequence');
        const nRef = this.referencePairs.length;
        const nSeq = this.testSequence.length;
        if (!nSeq) return;

        const viewportW = Math.max(window.innerWidth - 80, 320);
        // Reserved: menu + number buttons + stats + spacing
        const reservedH = 380;
        const viewportH = Math.max(window.innerHeight - reservedH, 200);

        // Reference row: single row, fit width
        const refW = Math.floor((viewportW - (nRef - 1) * 0) / nRef);
        const refCardW = Math.max(70, Math.min(140, refW));
        const refCardH = Math.round(refCardW * 1.2);
        refWrap.style.setProperty('--tref-w', refCardW + 'px');
        refWrap.style.setProperty('--tref-h', refCardH + 'px');
        refWrap.style.setProperty('--tref-icon', Math.round(refCardW * 0.52) + 'px');
        refWrap.style.setProperty('--tref-num', Math.round(refCardW * 0.24) + 'px');

        // Sequence row: find best single-row or multi-row layout
        const seqH = Math.floor(viewportH / 2); // allow up to 2 rows
        // Try single row first
        let seqCardW = Math.floor(viewportW / nSeq);
        let seqRows = 1;
        if (seqCardW < 50) {
            // multi-row
            const perRow = Math.ceil(nSeq / 2);
            seqCardW = Math.floor(viewportW / perRow);
            seqRows = 2;
        }
        seqCardW = Math.max(50, Math.min(110, seqCardW));
        const seqCardH = Math.round(seqCardW * 1.25);
        seqWrap.style.setProperty('--tseq-w', seqCardW + 'px');
        seqWrap.style.setProperty('--tseq-h', seqCardH + 'px');
        seqWrap.style.setProperty('--tseq-icon', Math.round(seqCardW * 0.50) + 'px');
        seqWrap.style.setProperty('--tseq-num', Math.round(seqCardW * 0.26) + 'px');
        seqWrap.style.setProperty('--tseq-rows', seqRows);
    }

    inputNumber(n) {
        if (this.mode !== 'test') return;
        if (this.testIndex >= this.testSequence.length) return;
        const item = this.testSequence[this.testIndex];
        item.userAnswer = n;
        const now = Date.now();
        const delta = now - this.stats.lastAnswerTime;
        this.stats.lastAnswerTime = now;
        this.stats.answers++;
        this.stats.totalTime += delta;
        if (n === item.correctNumber) {
            this.stats.correct++;
            this.stats.point++;
            this.playCorrect();
        } else {
            this.stats.wrong++;
            this.playWrong();
        }
        this.testIndex++;
        this.renderTestSequence();
        this.updateStatsUI();
        if (this.testIndex >= this.testSequence.length) {
            this.stopTimer();
            setTimeout(() => this.showTestResult(), 500);
        }
    }

    /* ---------------- Test Grade Result ---------------- */
    GRADE_TIERS = [
        { n: 1, title: '문제 단계',   desc: ['언어기능이 약하고', '학습에 문제가 있을 수 있습니다.'],          color: '#f5a623', face: 'crying' },
        { n: 2, title: '초급 단계',   desc: ['언어기능이 저조하고', '학습에 다소 문제가 있을 수 있습니다.'],  color: '#e88820', face: 'sad' },
        { n: 3, title: '경계선 단계', desc: ['언어기능이 저조하고', '학습에 조금 문제가 있을 수 있습니다.'], color: '#e84545', face: 'frown' },
        { n: 4, title: '평균 단계',   desc: ['언어기능과 학습능력이', '평균 수준입니다.'],                    color: '#8b1e3f', face: 'neutral' },
        { n: 5, title: '양호 단계',   desc: ['언어기능이 양호하며', '학습능력이 향상되고 있습니다.'],          color: '#3fb85e', face: 'smile' },
        { n: 6, title: '우수 단계',   desc: ['언어기능과 학습집중력이', '우수한 편입니다.'],                    color: '#2bb5a4', face: 'bigSmile' },
        { n: 7, title: '숙련자 단계', desc: ['언어기능과 학습집중력이', '뛰어 납니다.'],                        color: '#4aa3df', face: 'wink' },
        { n: 8, title: '최고 단계',   desc: ['최상위 수준의', '인지 유연성을 보유하고 있습니다.'],              color: '#f5c320', face: 'excellent' }
    ];

    // Per-age-group benchmarks.
    // accThresholds = 7 accuracy cutoffs separating 8 tiers.
    // speedLimit = slowest acceptable avg seconds for this age group.
    AGE_BENCHMARKS = {
        preschool:  { accThresholds: [0.15, 0.28, 0.40, 0.55, 0.67, 0.78, 0.88], speedLimit: 5.0, label: '유아~초등저학년' },
        elementary: { accThresholds: [0.25, 0.40, 0.53, 0.65, 0.75, 0.85, 0.92], speedLimit: 4.0, label: '초등고학년~중등저학년' },
        middle:     { accThresholds: [0.28, 0.42, 0.54, 0.66, 0.76, 0.86, 0.93], speedLimit: 3.0, label: '중등고학년~고등저학년' },
        adult:      { accThresholds: [0.35, 0.48, 0.60, 0.72, 0.82, 0.90, 0.95], speedLimit: 2.0, label: '고등고학년~일반 성인' }
    };

    computeGradeTier() {
        const total = this.testSequence.length || 1;
        const correct = this.stats.correct;
        const acc = correct / total;
        const avgSec = this.stats.answers ? (this.stats.totalTime / this.stats.answers / 1000) : 99;

        const bench = this.AGE_BENCHMARKS[this.testType] || this.AGE_BENCHMARKS.elementary;

        // Primary tier from accuracy
        let tier = 8;
        for (let i = 0; i < bench.accThresholds.length; i++) {
            if (acc < bench.accThresholds[i]) { tier = i + 1; break; }
        }

        // Speed modifier: very slow → -1 tier, very fast + accurate → +1 tier
        if (avgSec > bench.speedLimit * 1.5) tier -= 1;
        else if (avgSec < bench.speedLimit * 0.4 && acc >= 0.70) tier += 1;

        return Math.max(1, Math.min(8, tier));
    }

    showTestResult() {
        const tier = this.computeGradeTier();
        const tierInfo = this.GRADE_TIERS[tier - 1];
        const mins = Math.floor(this.stats.totalTime / 60000);
        const secs = Math.floor((this.stats.totalTime % 60000) / 1000);

        // 세션 저장용 등급 저장
        this._lastGradeTier = tier;
        this._lastGradeLabel = tierInfo ? (tierInfo.label || tierInfo.name) : null;

        document.getElementById('testScore').textContent = this.stats.correct;
        document.getElementById('testTime').textContent = `${mins}분:${String(secs).padStart(2,'0')}초`;
        const today = new Date();
        const dateStr = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
        const di = document.getElementById('testDate');
        if (!di.value) di.value = dateStr;
        // 활성 클라이언트 이름 자동 채움
        if (typeof ClientManager !== 'undefined') {
            const ac = ClientManager.getActiveClient();
            if (ac) {
                const ni = document.getElementById('testClientName');
                if (ni && !ni.value) ni.value = ac.name;
            }
        }

        this.renderGradeWheel(tier, tierInfo);

        document.getElementById('testResultPage').style.display = 'flex';
        document.querySelector('.menu-bar').style.display = 'none';
        document.getElementById('gameArea').style.display = 'none';
        document.getElementById('statsBar').style.display = 'none';

        // 세션 저장
        this._saveCurrentSession('test', this.testType);
    }

    backFromTestResult() {
        document.getElementById('testResultPage').style.display = 'none';
        document.querySelector('.menu-bar').style.display = 'flex';
        document.getElementById('gameArea').style.display = 'flex';
        document.getElementById('statsBar').style.display = 'flex';
        // Reset to training mode at level 0
        this.startTraining(0);
    }

    /* Face SVG renderer for each tier, drawn around center (cx, cy) at radius r */
    renderFaceSVG(faceKey, cx, cy, r, color) {
        const s = r / 30; // scale factor
        const x = (v) => cx + v * s;
        const y = (v) => cy + v * s;
        const sw = Math.max(2.2, s * 2.2);
        const faces = {
            crying: `
                <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"/>
                <path d="M ${x(-14)} ${y(-8)} L ${x(-6)} ${y(-2)} M ${x(-6)} ${y(-8)} L ${x(-14)} ${y(-2)}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>
                <path d="M ${x(6)} ${y(-8)} L ${x(14)} ${y(-2)} M ${x(14)} ${y(-8)} L ${x(6)} ${y(-2)}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>
                <ellipse cx="${cx}" cy="${y(10)}" rx="${8*s}" ry="${6*s}" fill="${color}"/>
                <path d="M ${x(-12)} ${y(2)} Q ${x(-14)} ${y(8)} ${x(-10)} ${y(10)}" fill="${color}" stroke="none"/>
                <path d="M ${x(12)} ${y(2)} Q ${x(14)} ${y(8)} ${x(10)} ${y(10)}" fill="${color}" stroke="none"/>`,
            sad: `
                <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"/>
                <path d="M ${x(-14)} ${y(-8)} Q ${x(-10)} ${y(-12)} ${x(-6)} ${y(-8)}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>
                <path d="M ${x(6)} ${y(-8)} Q ${x(10)} ${y(-12)} ${x(14)} ${y(-8)}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>
                <path d="M ${x(-10)} ${y(10)} Q ${cx} ${y(2)} ${x(10)} ${y(10)}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`,
            frown: `
                <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"/>
                <circle cx="${x(-9)}" cy="${y(-5)}" r="${2.5*s}" fill="${color}"/>
                <circle cx="${x(9)}" cy="${y(-5)}" r="${2.5*s}" fill="${color}"/>
                <path d="M ${x(-9)} ${y(10)} Q ${cx} ${y(5)} ${x(9)} ${y(10)}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`,
            neutral: `
                <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"/>
                <circle cx="${x(-9)}" cy="${y(-5)}" r="${2.5*s}" fill="${color}"/>
                <circle cx="${x(9)}" cy="${y(-5)}" r="${2.5*s}" fill="${color}"/>
                <line x1="${x(-8)}" y1="${y(8)}" x2="${x(8)}" y2="${y(8)}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`,
            smile: `
                <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"/>
                <circle cx="${x(-9)}" cy="${y(-5)}" r="${2.5*s}" fill="${color}"/>
                <circle cx="${x(9)}" cy="${y(-5)}" r="${2.5*s}" fill="${color}"/>
                <path d="M ${x(-9)} ${y(5)} Q ${cx} ${y(12)} ${x(9)} ${y(5)}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`,
            bigSmile: `
                <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"/>
                <circle cx="${x(-9)}" cy="${y(-6)}" r="${2.8*s}" fill="${color}"/>
                <circle cx="${x(9)}" cy="${y(-6)}" r="${2.8*s}" fill="${color}"/>
                <path d="M ${x(-12)} ${y(3)} Q ${cx} ${y(16)} ${x(12)} ${y(3)}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`,
            wink: `
                <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"/>
                <path d="M ${x(-13)} ${y(-5)} L ${x(-5)} ${y(-5)}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>
                <circle cx="${x(9)}" cy="${y(-5)}" r="${2.5*s}" fill="${color}"/>
                <path d="M ${x(-12)} ${y(3)} Q ${cx} ${y(16)} ${x(12)} ${y(3)}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`,
            excellent: `
                <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"/>
                <path d="M ${x(-10)} ${y(-8)} L ${x(-8)} ${y(-4)} L ${x(-4)} ${y(-4)} L ${x(-7)} ${y(-1)} L ${x(-6)} ${y(3)} L ${x(-10)} ${y(0)} L ${x(-14)} ${y(3)} L ${x(-13)} ${y(-1)} L ${x(-16)} ${y(-4)} L ${x(-12)} ${y(-4)} Z" fill="${color}"/>
                <path d="M ${x(10)} ${y(-8)} L ${x(12)} ${y(-4)} L ${x(16)} ${y(-4)} L ${x(13)} ${y(-1)} L ${x(14)} ${y(3)} L ${x(10)} ${y(0)} L ${x(6)} ${y(3)} L ${x(7)} ${y(-1)} L ${x(4)} ${y(-4)} L ${x(8)} ${y(-4)} Z" fill="${color}"/>
                <path d="M ${x(-13)} ${y(4)} Q ${cx} ${y(18)} ${x(13)} ${y(4)}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`
        };
        return faces[faceKey] || faces.neutral;
    }

    renderGradeWheel(achievedTier, tierInfo) {
        const svg = document.getElementById('gradeWheel');
        const cx = 400, cy = 280;
        const rInner = 120, rOuter = 255;
        const n = 8;
        const sliceAngle = (2 * Math.PI) / n;
        // Start from top-right slice (first filled tier in the reference image)
        const startAngle = -Math.PI / 2 - sliceAngle / 2;
        const GRAY = '#c9c9c9';

        let html = '';

        // Draw all 8 slices (first N filled in tier colors, rest gray)
        for (let i = 0; i < n; i++) {
            const tier = this.GRADE_TIERS[i];
            const a1 = startAngle + i * sliceAngle;
            const a2 = startAngle + (i + 1) * sliceAngle;
            const gap = 0.010;
            const ia1 = a1 + gap, ia2 = a2 - gap;

            const p1x = cx + rInner * Math.cos(ia1);
            const p1y = cy + rInner * Math.sin(ia1);
            const p2x = cx + rOuter * Math.cos(ia1);
            const p2y = cy + rOuter * Math.sin(ia1);
            const p3x = cx + rOuter * Math.cos(ia2);
            const p3y = cy + rOuter * Math.sin(ia2);
            const p4x = cx + rInner * Math.cos(ia2);
            const p4y = cy + rInner * Math.sin(ia2);

            const path = `M ${p1x.toFixed(2)} ${p1y.toFixed(2)} L ${p2x.toFixed(2)} ${p2y.toFixed(2)} A ${rOuter} ${rOuter} 0 0 1 ${p3x.toFixed(2)} ${p3y.toFixed(2)} L ${p4x.toFixed(2)} ${p4y.toFixed(2)} A ${rInner} ${rInner} 0 0 0 ${p1x.toFixed(2)} ${p1y.toFixed(2)} Z`;

            const filled = (i + 1) <= achievedTier;
            const fill = filled ? tier.color : GRAY;
            html += `<path d="${path}" fill="${fill}" stroke="#fff" stroke-width="2"/>`;

            // Number only on the last filled (achieved) slice
            if ((i + 1) === achievedTier) {
                const midA = (a1 + a2) / 2;
                const tr = (rInner + rOuter) / 2;
                const tx = cx + tr * Math.cos(midA);
                const ty = cy + tr * Math.sin(midA);
                html += `<text x="${tx.toFixed(2)}" y="${ty.toFixed(2)}" text-anchor="middle" dominant-baseline="central"
                     font-size="62" font-weight="800" fill="#fff"
                     style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));">${achievedTier}</text>`;
            }
        }

        // Center white circle (hides inner boundaries)
        html += `<circle cx="${cx}" cy="${cy}" r="${rInner - 2}" fill="#fff"/>`;

        // Face emoji (placed above title)
        const faceR = 32;
        const faceY = cy - 35;
        html += this.renderFaceSVG(tierInfo.face, cx, faceY, faceR, tierInfo.color);

        // Title
        html += `<text x="${cx}" y="${cy + 28}" text-anchor="middle"
                 font-size="26" font-weight="800" fill="${tierInfo.color}">${tierInfo.title}</text>`;

        // Description lines
        const lines = Array.isArray(tierInfo.desc) ? tierInfo.desc : [tierInfo.desc];
        lines.forEach((line, idx) => {
            html += `<text x="${cx}" y="${cy + 55 + idx * 18}" text-anchor="middle"
                     font-size="12" font-weight="500" fill="#555">${line}</text>`;
        });

        // Age group label (bottom of center circle)
        const bench = this.AGE_BENCHMARKS[this.testType];
        if (bench) {
            html += `<text x="${cx}" y="${cy + 100}" text-anchor="middle"
                     font-size="11" font-weight="600" fill="#888" letter-spacing="0.5">
                     [ ${bench.label} ]</text>`;
        }

        svg.innerHTML = html;
    }

    /* ---------------- Stats ---------------- */
    resetStats() {
        this.stopTimer();
        this.stats = {
            startTime: Date.now(),
            lastAnswerTime: Date.now(),
            point: 0,
            targetPoint: 20,
            totalTime: 0,
            answers: 0,
            correct: 0,
            wrong: 0
        };
        this.updateStatsUI();
    }

    startTimer() {
        this.stopTimer();
        this.stats.startTime = Date.now();
        this.timerInterval = setInterval(() => this.updateStatsUI(), 500);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateStatsUI() {
        const elapsedMs = Date.now() - this.stats.startTime;
        const mins = Math.floor(elapsedMs / 60000);
        const secs = Math.floor((elapsedMs % 60000) / 1000);
        document.getElementById('statTime').textContent = `${mins}분:${String(secs).padStart(2,'0')}초`;

        const nowSec = ((Date.now() - this.stats.lastAnswerTime) / 1000).toFixed(1);
        document.getElementById('statNowTime').textContent = nowSec;

        const avg = this.stats.answers ? (this.stats.totalTime / this.stats.answers / 1000).toFixed(2) : '0';
        document.getElementById('statAvgTime').textContent = avg;

        document.getElementById('statPoint').textContent = this.stats.point;
        document.getElementById('statTarget').textContent = this.stats.targetPoint;
    }

    /* ---------------- File Menu Actions ---------------- */
    newGame() {
        if (this.mode === 'training') this.startTraining(this.currentLevel);
        else if (this.testType) this.startTest(this.testType);
    }

    saveResults() {
        const data = {
            mode: this.mode,
            level: this.mode === 'training' ? LEVELS[this.currentLevel].name : TEST_CONFIG[this.testType].label,
            timestamp: new Date().toISOString(),
            stats: this.stats,
            testSequence: this.mode === 'test' ? this.testSequence : undefined
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `smartswitching-results-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    printResults() {
        document.body.classList.add('print-test');
        window.print();
        document.body.classList.remove('print-test');
    }
}

/* ==========================================================================
   INIT
   ========================================================================== */
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new SmartSwitchingGame();
});
