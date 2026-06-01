/* ═════════════════════════════════════════════════════════════════
   HARBOR COMPASS · js/main.js
   ─────────────────────────────────────────────────────────────────
   Navigate Your Whole Life — Stanford WELL · 10 Domains

   ARCHITECTURE
     1. Helpers                — cssColor / domainColor (live theme resolution)
     2. DOMAINS                — config array (10 wellness domains)
     3. State                  — single in-memory object
     4. Tab switching          — controls which pane is active
     5. Pane 1 · Overview      — the wheel + progress meter
     6. Pane 2 · Wizard        — 5-step dimension flow (define→reflect→score→declare→act)
     7. Pane 3 · Vision        — overarching "I am..." statement
     8. Pane 4 · Timeline      — focused actions sorted by urgency
     9. Pane 5 · Fund          — budget with adjustable 50/30/20
    10. Utils                  — escapeHtml, setDateLine
    11. Boot                   — runs at end of file (deferred script tag)
   ═════════════════════════════════════════════════════════════════ */

/* CSS variable resolver — reads live values so colors auto-swap on light/dark mode change */
function cssColor(varName){
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}
function domainColor(d){ return cssColor(d.cssVar); }

/* ═════════════════════════════════════════════════════════
   10 DOMAINS — Stanford WELL for Life Scale
   ═════════════════════════════════════════════════════════ */
const DOMAINS = [
  {
    id: 'physical', label: 'Physical Health', short: 'Physical',
    essence: 'Vitality & function of the body', cssVar: '--domain-physical',
    definitionLead: 'Physical health is the vitality, function, and resilience of your body — the foundation that makes every other dimension possible.',
    definitionBody: 'In the Stanford WELL Scale, physical health is treated as distinct from lifestyle: lifestyle is what you do, physical health is how you are. It reflects the absence of disease and the presence of energy, mobility, and strength.',
    components: [['Cardiovascular','Heart, blood pressure, circulation'],['Strength & mobility','Muscle, bone density, range of motion'],['Energy','Reserves for the day'],['Absence of pain','Or skillful management of chronic conditions'],['Prevention','Screenings, vaccinations, early intervention']],
    evidence: 'Melnyk & Neale (Ohio State): four behaviors — 30 min activity 5×/week, 5 servings of fruits & vegetables, limited alcohol, not smoking — reduce diabetes by 66%, depression by 93%, stress by 74%.',
    prompts: ['How does your body actually feel — energy, pain, sleep, strength — on a typical day right now?','Imagine yourself one year from now in optimal physical health. What does an ordinary morning look and feel like?','What is the one habit (or one barrier removed) that would change your body the most?'],
    iamPlaceholder: 'someone whose body has energy for the life I love…',
    iamHelper: 'Speak as the person whose body is already where you want it to be.',
    iamExamples: [
      'someone whose body has energy for what I love.',
      'a person who moves my body every day in ways that feel good.',
      'someone who treats my body as a long-term friend, not a project.'
    ],
    actionExamples: [
      ['sedentary most days', 'walking 30 min daily', 'June 30'],
      ['skipping breakfast', 'eating protein within 1 hr of waking', 'May 31'],
      ['7,000 steps avg', '10,000 steps avg', 'July 15']
    ],
  },
  {
    id: 'lifestyle', label: 'Lifestyle & Daily Practices', short: 'Lifestyle',
    essence: 'The shape of an ordinary day', cssVar: '--domain-lifestyle',
    definitionLead: 'Lifestyle is the architecture of an ordinary day — what you eat, how you move, when you sleep, what substances you take in.',
    definitionBody: 'The Stanford WELL Scale explicitly defines this domain as encompassing diet, physical activity, sleep, and tobacco and alcohol use. It is upstream of physical health: your daily patterns create the body you live in.',
    components: [['Diet','What and when you eat'],['Physical activity','Movement integrated into the day'],['Sleep','Both quantity (~7+ hours) and quality'],['Substance use','Alcohol, tobacco, caffeine, screens'],['Daily rhythms','The default shape of morning, midday, evening']],
    evidence: 'Ford et al. (Am J Public Health): adults who engage in five healthy lifestyle behaviors live ~14 years longer than those who engage in none. Stanford WELL defines this domain as diet, activity, sleep, and substance use.',
    prompts: ['Walk through your typical day from waking to sleeping. Where does it serve you, where does it not?','Describe one ordinary day in your ideal life — morning, midday, evening.','What one habit would you install, and what one would you release, in the next 30 days?'],
    iamPlaceholder: 'someone whose days look like…',
    iamHelper: 'Describe the rhythms of your ideal ordinary day in the present tense.',
    iamExamples: [
      'someone whose mornings are slow, intentional, and screen-free.',
      'a person whose ordinary days nourish me.',
      'someone in bed by 10:30, awake by 6, every weekday.'
    ],
    actionExamples: [
      ['scrolling phone in bed', 'reading 10 pages before bed', 'June 1'],
      ['skipping lunch most days', 'eating a real lunch away from desk', 'May 30'],
      ['drinking 3 coffees/day', 'down to 1 morning coffee', 'July 31']
    ],
  },
  {
    id: 'stress', label: 'Stress & Resilience', short: 'Stress',
    essence: 'How you metabolize hard things', cssVar: '--domain-stress',
    definitionLead: 'Stress and resilience together describe your capacity to absorb pressure and recover your equilibrium.',
    definitionBody: 'Stanford treats these as one domain because they are inseparable: stress is the load, resilience is the carrying capacity. Stanford found this was one of three domains — with emotional health and finances — with the strongest associations to environmental factors.',
    components: [['Stress load','What you carry daily, weekly, in seasons'],['Recovery practices','How you come back to baseline'],['Buffering relationships','Who shares the weight'],['Cognitive flexibility','Reframing, perspective-taking'],['Physiological reset','Breath, sleep, movement, nature']],
    evidence: 'Chrisinger et al. (Stanford WELL, 2019): stress & resilience was one of three domains — with emotional health and finances — having the strongest associations with neighborhood-level environmental factors.',
    prompts: ['What is the load you are currently carrying — practical, emotional, relational, financial?','What is your reliable practice for coming back to center? How often do you actually use it?','Who or what restores you, and how can you make that more available?'],
    iamPlaceholder: 'someone who can sit with the storm and return to myself…',
    iamHelper: 'Speak as someone who has metabolized hard things and remained whole.',
    iamExamples: [
      'someone who can hold hard things without breaking.',
      'a person with reliable practices for coming back to myself.',
      'someone who chooses what to carry and what to set down.'
    ],
    actionExamples: [
      ['no breath practice', '5 min daily morning breathwork', 'June 15'],
      ['saying yes by default', 'one clear "no" per week', 'May 30'],
      ['working through lunch', 'a walk every workday at noon', 'June 1']
    ],
  },
  {
    id: 'emotional', label: 'Emotional & Mental Health', short: 'Emotional',
    essence: 'Awareness & regulation', cssVar: '--domain-emotional',
    definitionLead: 'Emotional health is the ability to identify, express, and skillfully manage your full range of feelings.',
    definitionBody: 'In the Stanford Scale, this domain covers both the presence of positive emotions (joy, gratitude) and the regulation of negative ones (anxiety, sadness, anger). Cognitive Behavioral Skills Building is the gold-standard treatment, working by interrupting the thinking → feeling → behaving loop.',
    components: [['Emotional awareness','Noticing what you feel as you feel it'],['Expression','Letting feelings move, in healthy ways'],['Regulation','Skills for staying in your window of tolerance'],['Positive affect','Cultivating joy, gratitude, awe'],['Mental health','Absence of disabling anxiety/depression']],
    evidence: 'Moskowitz et al.: eight daily positive-affect practices (gratitude, savoring, kindness, mindfulness) improved emotional outlook over time, even amid serious illness.',
    prompts: ['Which emotions do you give the most space to, and which do you tend to suppress?','When you imagine yourself emotionally well, what changes about how you respond to stress?','What is one recurring negative thought you could begin to rewrite?'],
    iamPlaceholder: 'someone who feels my feelings and lets them move…',
    iamHelper: 'Speak as someone fluent in their own inner weather.',
    iamExamples: [
      'someone who feels my feelings and lets them move.',
      'a person fluent in my own inner weather.',
      'someone who can name what I am feeling, in the moment.'
    ],
    actionExamples: [
      ['avoiding hard conversations', 'one honest conversation this month', 'June 30'],
      ['journaling 0 times/week', 'journaling 3 mornings/week', 'July 1'],
      ['no therapy', 'in weekly therapy', 'September 1']
    ],
  },
  {
    id: 'social', label: 'Social Connectedness', short: 'Social',
    essence: 'Belonging & relationship', cssVar: '--domain-social',
    definitionLead: 'Social connectedness is the quality and depth of your bonds — feeling seen, known, and supported.',
    definitionBody: 'Stanford research found that in some cohorts (Bay Area), social connectedness is the strongest predictor of overall well-being. Connectedness is not the number of relationships; it is the felt sense of being part of something with others.',
    components: [['Close relationships','Family, partner, dearest friends'],['Broader community','Neighbors, colleagues, faith/hobby groups'],['Sense of belonging','Feeling at home among others'],['Reciprocity','Giving and receiving support'],['Quality of contact','Depth over frequency']],
    evidence: 'Holt-Lunstad & Smith: loneliness raises mortality risk by ~30% — greater than smoking or obesity. Stanford WELL Bay Area cohort: well-being most strongly linked to social connectedness and lifestyle.',
    prompts: ['Who are the three or four people who truly know you, and how often do you actually connect?','Where do you feel most lonely — and what would meaningful connection look like there?','What bid for closeness, or what boundary, have you been avoiding?'],
    iamPlaceholder: 'someone surrounded by people who know me…',
    iamHelper: 'Speak as someone embedded in real relationships.',
    iamExamples: [
      'someone surrounded by people who know me deeply.',
      'a person who reaches out as much as I am reached for.',
      'someone embedded in real community, not just contacts.'
    ],
    actionExamples: [
      ['no regular friend time', 'weekly walk with one close friend', 'June 1'],
      ['reactive to invitations', 'host dinner once a month', 'July 15'],
      ['no community involvement', 'volunteering 2 hrs/week', 'August 1']
    ],
  },
  {
    id: 'purpose', label: 'Purpose & Meaning', short: 'Purpose',
    essence: 'Meaning & direction', cssVar: '--domain-purpose',
    definitionLead: 'Purpose is alignment with your reason for being here — the sense that your days matter and add up to something.',
    definitionBody: 'Stanford\'s newer 2024 framework pairs purpose with personal growth, reflecting research that purpose is a process, not a possession. Jim Loehr\'s work shows that disconnection from purpose creates an extraordinary energy drain.',
    components: [['Felt sense of meaning','Days that matter to you'],['Contribution','What you give to others/world'],['Growth','Becoming more yourself over time'],['Coherence','Activities aligning with values'],['Future orientation','Something worth moving toward']],
    evidence: 'Jim Loehr (The Power of Story): disconnection from life-purpose creates an extraordinary energy drain — even healthy pursuits become meaningless without it.',
    prompts: ['In the next two-to-five years, what will you do if you know that you cannot fail?','When do you feel most "on purpose" — and what does that activity have in common with the rest of your life?','What would you have to stop doing to live more on purpose?'],
    iamPlaceholder: 'someone whose days are aligned with…',
    iamHelper: 'Speak as someone living their reason.',
    iamExamples: [
      'someone whose days are aligned with what I care about most.',
      'a person living their reason, not just their routine.',
      'someone building something that matters beyond me.'
    ],
    actionExamples: [
      ['unclear on what I want', 'a 1-page life purpose statement', 'June 30'],
      ['no creative side project', 'shipping one chapter per month', 'July 31'],
      ['no mentor', 'one mentor conversation per month', 'June 15']
    ],
  },
  {
    id: 'self', label: 'Sense of Self', short: 'Sense of Self',
    essence: 'Knowing & accepting who you are', cssVar: '--domain-self',
    definitionLead: 'Sense of self is the steady ground of self-knowledge, self-acceptance, and self-worth — independent of validation.',
    definitionBody: 'Stanford treats sense of self as distinct from purpose: purpose is where you are going; sense of self is the ground you stand on while you go. It includes identity, self-compassion, and the quiet assurance that you are okay as you are.',
    components: [['Self-knowledge','Knowing your own values, patterns, limits'],['Self-acceptance','Welcoming yourself as you are'],['Self-worth','Inherent, not earned'],['Identity coherence','Feeling like yourself across contexts'],['Self-compassion','Treating yourself as you would a friend']],
    evidence: 'Sense of self is one of the ten validated domains of the Stanford WELL for Life Scale, distinct from purpose. The model recognizes self-acceptance as foundational to all other well-being domains.',
    prompts: ['Finish this sentence: "Regardless of what I accomplish, I am ____."','What part of yourself do you most need to accept more fully?','Where do you outsource your self-worth — and how can you reclaim it?'],
    iamPlaceholder: 'someone rooted in who I am, regardless of…',
    iamHelper: 'Speak as someone whose worth is not negotiable.',
    iamExamples: [
      'someone rooted in who I am, regardless of validation.',
      'a person who treats myself the way I treat my best friend.',
      'someone who knows my worth without needing it confirmed.'
    ],
    actionExamples: [
      ['harsh self-talk daily', 'noticing and reframing 1x/day', 'July 1'],
      ['no self-reflection time', '15 min Sunday review weekly', 'June 1'],
      ['comparison spiral weekly', 'no social media on weekends', 'May 30']
    ],
  },
  {
    id: 'spiritual', label: 'Spirituality & Religiosity', short: 'Spiritual',
    essence: 'Inner life & connection to the larger', cssVar: '--domain-spiritual',
    definitionLead: 'Spirituality is your relationship to what is larger than you — meaning, mystery, transcendence, or the sacred.',
    definitionBody: 'Stanford pairs spirituality and religiosity to acknowledge that organized religion is one expression — but awe, gratitude, contemplative practice, time in nature, and a felt sense of connection to something beyond the self all qualify.',
    components: [['Practices','Prayer, meditation, ritual, time in nature'],['Beliefs','What you hold to be true about existence'],['Community','Shared practice (optional)'],['Experience','Awe, gratitude, transcendence'],['Values','How beliefs shape how you live']],
    evidence: 'Moskowitz et al.: eight daily positive-affect practices improved emotional outlook over time, even amid serious illness. Stanford WELL pairs spirituality with religiosity to recognize multiple expressions.',
    prompts: ['What values, beliefs, or practices anchor you when life is loud?','What practice — prayer, meditation, nature, journaling — would you like to deepen?','Where in your week could a daily moment of stillness fit?'],
    iamPlaceholder: 'someone who tends to my inner life by…',
    iamHelper: 'Speak as someone in relationship with the larger.',
    iamExamples: [
      'someone who tends to my inner life with care.',
      'a person in relationship with something larger.',
      'someone whose days have a moment of stillness in them.'
    ],
    actionExamples: [
      ['no daily practice', '10 min meditation each morning', 'June 1'],
      ['indoor most days', 'one walk in nature each week', 'May 30'],
      ['no gratitude practice', 'writing 3 gratitudes each night', 'June 30']
    ],
  },
  {
    id: 'creative', label: 'Exploration & Creativity', short: 'Creative',
    essence: 'Curiosity, expression, play', cssVar: '--domain-creative',
    definitionLead: 'Exploration and creativity describe your engagement with the new — making, learning, wondering, playing.',
    definitionBody: 'Stanford pairs these because they are the same instinct in two directions: creativity is making, exploration is discovering. A Mayo Clinic study found artistic activity had the greatest protective effect against cognitive decline of any behavior studied.',
    components: [['Making','Music, writing, cooking, building, design'],['Learning','New skills, languages, perspectives'],['Wonder','Asking questions, exploring places'],['Play','Doing things for their own sake'],['Expression','Putting your inner world into form']],
    evidence: 'Mayo Clinic study of adults in their mid-to-late 80s: artistic activity had the greatest protective effect against cognitive decline of any behavior studied.',
    prompts: ['What creative or curious practice did you love as a child — and what would it mean to return to it?','What would you make or explore if no one would ever see or judge it?','How could you weave 30 minutes of making or wondering into a regular week?'],
    iamPlaceholder: 'someone who makes and explores for the joy of it…',
    iamHelper: 'Speak as a maker, a wonderer, a player.',
    iamExamples: [
      'someone who makes things just for the joy of it.',
      'a wonderer, a maker, a player.',
      'someone whose hands stay busy with what brings me alive.'
    ],
    actionExamples: [
      ['no creative time', '1 hour drawing each Saturday', 'June 1'],
      ['unfinished projects', 'finishing one project this quarter', 'July 31'],
      ['only consuming, never making', 'shipping one piece per month', 'August 1']
    ],
  },
  {
    id: 'financial', label: 'Financial Security & Satisfaction', short: 'Financial',
    essence: 'Means in service of vision', cssVar: '--domain-financial',
    definitionLead: 'Financial well-being is the felt experience of security plus satisfaction — having enough, and feeling that your money is in service of your life.',
    definitionBody: 'Stanford\'s scale measures both objective security (debt, savings, income) and subjective satisfaction. APA reports 72% of Americans experience financial stress, linked to physical and emotional outcomes. Clarity and a plan measurably reduce this load.',
    components: [['Security','Income, emergency reserves, debt management'],['Satisfaction','Felt sense that money is sufficient'],['Awareness','Knowing money in / money out'],['Planning','Goals, savings, retirement'],['Alignment','Spending that reflects your values']],
    evidence: 'American Psychological Association: 72% of Americans experience financial stress, linked to ulcers, migraines, heart attacks, depression, anxiety, sleep disturbance.',
    prompts: ['What does financial peace look like for you a year from now — concretely?','Which of the other dimensions above (physical, social, creative…) needs money to flourish, and how much?','What is one money habit you want to install or release in the next 30 days?'],
    iamPlaceholder: 'someone whose money serves the life I am building…',
    iamHelper: 'Speak as someone in right relationship with money.',
    iamExamples: [
      'someone whose money serves the life I am building.',
      'a person in right relationship with money.',
      'someone with enough, who knows what enough is.'
    ],
    actionExamples: [
      ['no emergency fund', '$1,000 emergency fund saved', 'July 1'],
      ['no idea where money goes', 'weekly budget review installed', 'May 30'],
      ['carrying credit card debt', 'paid off in full', 'December 31']
    ],
  },
];

const STEP_NAMES = ['Define', 'Reflect', 'Score', 'I am…', 'Act'];
const STEP_KICKERS = ['First · Understand', 'Next · Reflect in Writing', 'Now · Rate Yourself', 'Declare · Identity', 'Act · The Next Step'];
const STEP_TITLES = [
  'What this dimension actually means',
  'Answer these to prepare yourself',
  'Where are you, and where are you going?',
  'Write your "I am…" for this dimension',
  'From X, to Y, by when',
];
const STEP_SUBTITLES = ['research-based definition', 'before scoring', '1 to 10', 'a fragment of your whole-life vision', 'make it concrete and dated'];

/* ═════════════════════════════════════════════════════════
   STATE
   ═════════════════════════════════════════════════════════ */
function freshDim() {
  return { answers: ['', '', ''], score: 0, targetScore: 0, iam: '', goals: [], savedAt: null };
}
function defaultState() {
  const s = {
    activeIdx: 0, activeStep: 0, actionSort: 'date',
    dims: {}, income: 5000, cycle: 'monthly',
    pcts: { needs: 50, wants: 30, savings: 20 },
    expenses: [
      { id: 1, name: 'Rent', amount: 1400, bucket: 'needs', source: null },
      { id: 2, name: 'Groceries', amount: 420, bucket: 'needs', source: null },
      { id: 3, name: 'Roth IRA', amount: 500, bucket: 'savings', source: null },
    ],
  };
  DOMAINS.forEach(d => s.dims[d.id] = freshDim());
  return s;
}

let state = defaultState();
let nextExpId = 100;

/* ─── PERSISTENCE ───────────────────────────────────────────
   The user's reflections, scores, declarations and actions are
   saved to this browser automatically. This is a standalone
   file, so localStorage works (unlike sandboxed artifacts).
   Data never leaves the device. */
const STORAGE_KEY = 'harbor-compass-v1';
let lastSavedAt = null;

function persistState() {
  try {
    const snapshot = {
      dims: state.dims,
      income: state.income,
      cycle: state.cycle,
      pcts: state.pcts,
      expenses: state.expenses,
      nextExpId,
      savedTs: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    lastSavedAt = snapshot.savedTs;
    updateAutosaveIndicator();
  } catch (e) {
    // Storage full / blocked (e.g. private mode). Fail silently;
    // the app still works for the session.
    const ind = document.getElementById('autosave-indicator');
    if (ind) ind.textContent = 'Auto-save unavailable in this browser';
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    if (!saved || !saved.dims) return false;
    // Merge defensively so a schema change can't break boot
    DOMAINS.forEach(d => {
      const sd = saved.dims[d.id];
      if (sd) {
        state.dims[d.id] = {
          answers: Array.isArray(sd.answers) ? sd.answers : ['', '', ''],
          score: sd.score || 0,
          targetScore: sd.targetScore || 0,
          iam: sd.iam || '',
          goals: Array.isArray(sd.goals) ? sd.goals : [],
          savedAt: sd.savedAt || null,
        };
      }
    });
    if (typeof saved.income === 'number') state.income = saved.income;
    if (saved.cycle) state.cycle = saved.cycle;
    if (saved.pcts) state.pcts = saved.pcts;
    if (Array.isArray(saved.expenses)) state.expenses = saved.expenses;
    if (typeof saved.nextExpId === 'number') nextExpId = saved.nextExpId;
    lastSavedAt = saved.savedTs || null;
    return true;
  } catch (e) {
    return false;
  }
}

function clearSavedState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  state = defaultState();
  nextExpId = 100;
  lastSavedAt = null;
}

function relativeTime(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const min = Math.round(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.round(hr / 24);
  if (day === 1) return 'yesterday';
  return `${day} days ago`;
}

function updateAutosaveIndicator() {
  const ind = document.getElementById('autosave-indicator');
  if (ind) ind.textContent = lastSavedAt ? `Saved to this browser · ${relativeTime(lastSavedAt)}` : 'Saved to this browser';
}

/* ═════════════════════════════════════════════════════════
   TAB SWITCHING
   ═════════════════════════════════════════════════════════ */
document.querySelectorAll('.tab-nav button').forEach(btn => {
  btn.addEventListener('click', () => switchPane(btn.dataset.pane));
});
function switchPane(target) {
  document.querySelectorAll('.tab-nav button').forEach(b => b.classList.toggle('active', b.dataset.pane === target));
  document.querySelectorAll('.pane').forEach(p => p.classList.toggle('active', p.id === 'pane-' + target));
  if (target === 'overview') { buildWheel(); renderProgress(); updateNextCta(); renderDomainCards(); renderPatterns(); }
  if (target === 'dimension') { renderWizard(); }
  if (target === 'vision') { renderVisionStatement(); }
  if (target === 'actions') { renderTimeline(); }
  if (target === 'fund') { renderBudget(); }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ─── Domain preview cards (overview pane) ───────────── */
function renderDomainCards() {
  const grid = document.getElementById('domain-cards-grid');
  if (!grid) return;
  grid.innerHTML = '';
  DOMAINS.forEach((d, i) => {
    const data = state.dims[d.id];
    const color = domainColor(d);
    const hasIam = data.iam.trim();
    const hasScore = data.score > 0;
    const goalCount = data.goals.filter(g => g.from && g.to).length;
    const complete = isDimensionComplete(d.id);
    const answered = data.answers.filter(a => a.trim()).length;

    const card = document.createElement('button');
    card.className = 'domain-card ' + (complete ? 'is-complete' : answered > 0 || hasScore ? 'is-started' : 'is-fresh');
    card.style.setProperty('--card-accent', color);
    card.innerHTML = `
      <div class="dc-head">
        <div class="dc-num">${String(i+1).padStart(2,'0')}</div>
        <div class="dc-name">${d.short}</div>
        <div class="dc-status">${complete ? '✓ saved' : hasScore || answered ? 'in progress' : 'not yet'}</div>
      </div>
      <div class="dc-essence">${escapeHtml(d.essence)}</div>

      ${hasScore ? `
        <div class="dc-score-row">
          <div class="dc-score-track">
            <div class="dc-score-fill" style="width:${data.score*10}%;background:${color}"></div>
            ${data.targetScore ? `<div class="dc-score-target" style="left:${data.targetScore*10}%"></div>` : ''}
          </div>
          <div class="dc-score-nums">${data.score} <span class="dc-score-arrow">→</span> ${data.targetScore || '?'}</div>
        </div>
      ` : `
        <div class="dc-empty-bar"></div>
      `}

      ${hasIam ? `
        <div class="dc-iam">
          <span class="dc-iam-mark">I am</span>
          <span class="dc-iam-text">${escapeHtml(data.iam.length > 90 ? data.iam.slice(0,90)+'…' : data.iam)}</span>
        </div>
      ` : `
        <div class="dc-iam-empty">
          <span class="dc-iam-mark">I am…</span>
          <span class="dc-iam-text-empty">${escapeHtml(d.iamPlaceholder)}</span>
        </div>
      `}

      <div class="dc-foot">
        <span class="dc-foot-item">${answered}/3 reflections</span>
        <span class="dc-foot-item">${goalCount} action${goalCount===1?'':'s'}</span>
        <span class="dc-foot-cta">${complete ? 'Refine →' : answered || hasScore ? 'Continue →' : 'Begin →'}</span>
      </div>
    `;
    card.addEventListener('click', () => openDimension(i));
    grid.appendChild(card);
  });
}

/* ─── Patterns insights (overview pane) ──────────────── */
function renderPatterns() {
  const section = document.getElementById('patterns-section');
  const grid = document.getElementById('patterns-grid');
  if (!section || !grid) return;

  const scored = DOMAINS.filter(d => state.dims[d.id].score > 0);
  if (scored.length < 3) {
    section.style.display = 'none';
    return;
  }
  section.style.display = '';

  // ── Domain-group averages (only over domains that have a score) ──
  const groups = {
    foundational: ['physical', 'lifestyle', 'financial'],
    stabilizing:  ['emotional', 'stress', 'social'],
    growth:       ['purpose', 'self', 'creative', 'spiritual'],
  };
  const avgOf = (ids) => {
    const vals = ids.map(id => state.dims[id] && state.dims[id].score).filter(v => v > 0);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };
  const fAvg = avgOf(groups.foundational);
  const sAvg = avgOf(groups.stabilizing);
  const gAvg = avgOf(groups.growth);

  const syndromes = [];

  // ── PATTERN 1: Survival strain — foundational layer is low ──
  if (fAvg !== null && fAvg < 4.5) {
    const weakest = groups.foundational
      .filter(id => state.dims[id].score > 0)
      .map(id => ({ d: DOMAINS.find(x => x.id === id), s: state.dims[id].score }))
      .sort((a, b) => a.s - b.s)[0];
    syndromes.push({
      kind: 'burnout',
      title: 'Possible survival-mode strain',
      body: `Your load-bearing areas — physical health, daily lifestyle, and financial security — average <strong>${fAvg.toFixed(1)}/10</strong> in your own rating. A common pattern is that when these basics feel low, attention and energy get pulled toward coping, leaving less for growth elsewhere. ${weakest ? `If that resonates, <strong>${weakest.d.short}</strong> (${weakest.s}/10) is the lowest of the three — a possible place to start.` : ''}`,
      threshold: 'Shown when your average self-rating across Physical, Lifestyle, and Financial is below 4.5/10.',
    });
  }

  // ── PATTERN 2: Mission-driven but exposed ──
  if (gAvg !== null && fAvg !== null && gAvg >= 7.5 && fAvg < 5) {
    syndromes.push({
      kind: 'vulnerable',
      title: 'A mission-driven but exposed shape',
      body: `You rated purpose and inner-life areas high (<strong>${gAvg.toFixed(1)}/10</strong>) while the material foundation sits lower (<strong>${fAvg.toFixed(1)}/10</strong>). Meaning is real fuel — but some people find a strong sense of purpose can make it easy to under-attend to material fragility until a financial or physical shock lands. Worth asking whether that's true for you.`,
      threshold: 'Shown when growth areas (Purpose, Self, Creative, Spiritual) average ≥ 7.5/10 and foundational areas average < 5/10.',
    });
  }

  // ── PATTERN 3: Comfortable but coasting ──
  if (fAvg !== null && sAvg !== null && gAvg !== null) {
    const structural = (fAvg + sAvg) / 2;
    if (structural >= 7 && gAvg < 5) {
      syndromes.push({
        kind: 'stagnation',
        title: 'A comfortable but possibly coasting shape',
        body: `Your foundation and stability ratings are strong (<strong>${structural.toFixed(1)}/10</strong>) while growth — purpose, sense of self, creativity, spirituality — sits lower (<strong>${gAvg.toFixed(1)}/10</strong>). Nothing here is failing. For some people, a secure base with low growth signals room for deliberate creative risk rather than a problem to fix. Only you can say which it is.`,
        threshold: 'Shown when the average of foundational + stabilizing areas is ≥ 7/10 and growth areas average < 5/10.',
      });
    }
  }

  // ── PATTERN 4: Uniformly mid, no anchor ──
  if (scored.length >= 6) {
    const allScores = scored.map(d => state.dims[d.id].score);
    const mean = allScores.reduce((a, b) => a + b, 0) / allScores.length;
    const spread = Math.max(...allScores) - Math.min(...allScores);
    if (mean >= 4 && mean <= 6 && spread <= 3) {
      syndromes.push({
        kind: 'flat',
        title: 'Everything rated around the middle',
        body: `Across ${scored.length} scored areas your ratings cluster tightly around <strong>${mean.toFixed(1)}/10</strong> with little variation. Nothing stands out as failing — and nothing as a clear strength either. When everything feels "fine," some people find it useful to deliberately pick one or two areas to push rather than maintaining all of them evenly.`,
        threshold: `Shown when ${scored.length}+ areas are scored, their mean is between 4 and 6, and the spread (highest minus lowest) is ≤ 3.`,
      });
    }
  }

  // ── PATTERN 5: Vision far above current, broadly ──
  const withBoth = DOMAINS.filter(d => state.dims[d.id].score > 0 && state.dims[d.id].targetScore > 0);
  if (withBoth.length >= 4) {
    const avgGap = withBoth.reduce((s, d) => s + (state.dims[d.id].targetScore - state.dims[d.id].score), 0) / withBoth.length;
    if (avgGap >= 3.5) {
      syndromes.push({
        kind: 'ambition',
        title: 'A steep climb declared across many areas',
        body: `Across ${withBoth.length} areas your vision sits an average of <strong>${avgGap.toFixed(1)} points</strong> above where you rated yourself now. That can be energizing — and it can also be a lot to hold at once. Vision tends to pull hardest when it's focused; it may be worth choosing the two or three areas you'll actually move this year and letting the rest hold steady without guilt.`,
        threshold: 'Shown when 4+ areas have both scores and the average vision-minus-current gap is ≥ 3.5 points.',
      });
    }
  }

  // ── Single-dimension observations (kept, shown after syndromes) ──
  const observations = [];

  const gaps = DOMAINS
    .filter(d => state.dims[d.id].score > 0 && state.dims[d.id].targetScore > 0)
    .map(d => ({ d, gap: state.dims[d.id].targetScore - state.dims[d.id].score }))
    .sort((a, b) => b.gap - a.gap);
  if (gaps.length && gaps[0].gap > 0) {
    observations.push({
      color: domainColor(gaps[0].d),
      title: 'Biggest single stretch',
      body: `Your largest gap is in <strong>${gaps[0].d.short}</strong> — ${gaps[0].gap} points between where you are and where you're going. That's where the most growth is on offer.`,
    });
  }

  const strong = DOMAINS
    .filter(d => state.dims[d.id].score > 0)
    .map(d => ({ d, score: state.dims[d.id].score }))
    .sort((a, b) => b.score - a.score);
  if (strong.length && strong[0].score >= 7) {
    observations.push({
      color: domainColor(strong[0].d),
      title: 'Your strongest dimension',
      body: `<strong>${strong[0].d.short}</strong> is your highest-rated at ${strong[0].score}/10 — a foundation to build from, and a strength to protect rather than take for granted.`,
    });
  }

  const fundTotals = {};
  let grand = 0;
  DOMAINS.forEach(d => {
    const sum = state.dims[d.id].goals.reduce((s, g) => s + (g.from && g.to ? monthlyCost(g.cost, g.costCycle) : 0), 0);
    fundTotals[d.id] = sum;
    grand += sum;
  });
  if (grand > 0) {
    const top = DOMAINS.map(d => ({ d, amt: fundTotals[d.id] })).sort((a, b) => b.amt - a.amt)[0];
    if (top.amt / grand > 0.5) {
      observations.push({
        color: domainColor(top.d),
        title: 'Funding concentration',
        body: `<strong>${top.d.short}</strong> alone receives ${Math.round(top.amt / grand * 100)}% of your vision-funded spending. Is that the balance you want, or is another dimension under-resourced?`,
      });
    }
  }

  // ── Render: patterns first (prominent), then observations ──
  let html = '';

  if (syndromes.length) {
    html += `<div class="syndrome-stack">` + syndromes.map(s => `
      <div class="syndrome-card ${s.kind}">
        <div class="syndrome-flag">A pattern worth considering</div>
        <div class="syndrome-title">${escapeHtml(s.title)}</div>
        <div class="syndrome-body">${s.body}</div>
        <details class="syndrome-why">
          <summary>Why am I seeing this?</summary>
          <p>${escapeHtml(s.threshold)} The grouping of areas into "foundational," "stabilizing," and "growth" is a reflective heuristic this tool applies — it is not part of the Stanford WELL scale, which does not rank its domains. Treat this as a lens, not a measurement.</p>
        </details>
      </div>
    `).join('') + `</div>`;
  } else {
    html += `<div class="syndrome-clear">
      <div class="syndrome-clear-mark">✓</div>
      <div>
        <div class="syndrome-clear-title">No notable cross-area patterns right now</div>
        <div class="syndrome-clear-body">Based on how your current self-ratings relate to each other, none of this tool's reflective patterns apply. That isn't a clean bill of health or its opposite — just that nothing in the relationships between your numbers stands out. These prompts shift as you score more areas.</div>
      </div>
    </div>`;
  }

  if (observations.length) {
    html += `<div class="obs-grid">` + observations.map(o => `
      <div class="pattern-card" style="--p-accent:${o.color}">
        <div class="pattern-title">${escapeHtml(o.title)}</div>
        <div class="pattern-body">${o.body}</div>
      </div>
    `).join('') + `</div>`;
  }

  grid.innerHTML = html;
}

/* ═════════════════════════════════════════════════════════
   PANE 1: WHEEL OVERVIEW
   ═════════════════════════════════════════════════════════ */
function buildWheel() {
  const svg = document.getElementById('wheel-svg');
  svg.innerHTML = '';
  const N = DOMAINS.length, angleStep = (Math.PI * 2) / N, innerR = 38, maxR = 130;

  DOMAINS.forEach((d, i) => {
    const data = state.dims[d.id];
    const a1 = -Math.PI / 2 + i * angleStep - angleStep / 2 + 0.03;
    const a2 = -Math.PI / 2 + i * angleStep + angleStep / 2 - 0.03;
    const mid = (a1 + a2) / 2;

    const bgRadius = data.targetScore > 0 ? innerR + (maxR - innerR) * (data.targetScore / 10) : maxR;
    const bgPath = annularArc(innerR, bgRadius, a1, a2);
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    bg.setAttribute('d', bgPath);
    bg.setAttribute('fill', domainColor(d));
    bg.setAttribute('opacity', '0.4');
    bg.setAttribute('class', 'wheel-petal');
    bg.addEventListener('click', () => openDimension(i));
    svg.appendChild(bg);

    if (data.score > 0) {
      const fgRadius = innerR + (maxR - innerR) * (data.score / 10);
      const fgPath = annularArc(innerR, fgRadius, a1, a2);
      const fg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      fg.setAttribute('d', fgPath);
      fg.setAttribute('fill', domainColor(d));
      fg.setAttribute('opacity', '1');
      fg.setAttribute('class', 'wheel-petal');
      fg.style.cursor = 'pointer';
      fg.addEventListener('click', () => openDimension(i));
      svg.appendChild(fg);
    }

    if (isDimensionComplete(d.id)) {
      const cR = maxR + 14, cx = Math.cos(mid) * cR, cy = Math.sin(mid) * cR;
      const star = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      star.setAttribute('cx', cx); star.setAttribute('cy', cy); star.setAttribute('r', 4); star.setAttribute('fill', cssColor('--ink'));
      svg.appendChild(star);
    }

    const labelR = maxR + 28;
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', Math.cos(mid) * labelR); text.setAttribute('y', Math.sin(mid) * labelR);
    text.setAttribute('text-anchor', 'middle'); text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('font-family', 'Inter Tight, sans-serif');
    text.setAttribute('font-size', '13');
    text.setAttribute('font-weight', '500');
    text.setAttribute('fill', cssColor('--ink'));
    text.style.cursor = 'pointer';
    text.textContent = d.short;
    text.addEventListener('click', () => openDimension(i));
    svg.appendChild(text);
  });

  const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  ring.setAttribute('cx', 0); ring.setAttribute('cy', 0); ring.setAttribute('r', innerR);
  ring.setAttribute('fill', 'none'); ring.setAttribute('stroke', cssColor('--line')); ring.setAttribute('stroke-width', '1');
  svg.appendChild(ring);

  [5, 10].forEach(v => {
    const r = innerR + (maxR - innerR) * (v / 10);
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', 0); c.setAttribute('cy', 0); c.setAttribute('r', r);
    c.setAttribute('fill', 'none'); c.setAttribute('stroke', cssColor('--line'));
    c.setAttribute('stroke-width', '0.4'); c.setAttribute('stroke-dasharray', '2,3');
    svg.appendChild(c);
  });
}

function annularArc(rIn, rOut, a1, a2) {
  const x1 = Math.cos(a1) * rOut, y1 = Math.sin(a1) * rOut;
  const x2 = Math.cos(a2) * rOut, y2 = Math.sin(a2) * rOut;
  const x3 = Math.cos(a2) * rIn, y3 = Math.sin(a2) * rIn;
  const x4 = Math.cos(a1) * rIn, y4 = Math.sin(a1) * rIn;
  const large = (a2 - a1) > Math.PI ? 1 : 0;
  return `M ${x1} ${y1} A ${rOut} ${rOut} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${rIn} ${rIn} 0 ${large} 0 ${x4} ${y4} Z`;
}

function isDimensionComplete(id) {
  const d = state.dims[id];
  return d.savedAt && d.score > 0 && d.iam.trim();
}

function renderProgress() {
  const meter = document.getElementById('progress-meter');
  meter.innerHTML = '';
  DOMAINS.forEach((d, i) => {
    const complete = isDimensionComplete(d.id);
    const seg = document.createElement('div');
    seg.className = 'pseg' + (complete ? ' complete-seg' : '');
    if (complete) { seg.style.background = domainColor(d); seg.style.borderColor = domainColor(d); }
    seg.textContent = i + 1;
    seg.title = d.label + (complete ? ' ✓' : '');
    seg.addEventListener('click', () => openDimension(i));
    meter.appendChild(seg);
  });
  const c = DOMAINS.filter(d => isDimensionComplete(d.id)).length;
  document.getElementById('progress-stats').innerHTML = `<span><strong>${c}</strong> / 10 complete</span><span>${c === 10 ? 'Whole wheel mapped.' : `${10 - c} dimension${c === 9 ? '' : 's'} to go`}</span>`;
}

function updateNextCta() {
  const next = DOMAINS.findIndex(d => !isDimensionComplete(d.id));
  const btn = document.getElementById('next-cta');
  if (next === -1) {
    document.getElementById('next-cta-label').textContent = 'Review your wheel';
    btn.onclick = () => openDimension(0);
  } else {
    const verb = next === 0 ? 'Begin with' : 'Continue to';
    document.getElementById('next-cta-label').textContent = `${verb} ${DOMAINS[next].label}`;
    btn.onclick = () => openDimension(next);
  }
}

function openDimension(idx) {
  state.activeIdx = idx;
  state.activeStep = 0;
  switchPane('dimension');
}

/* ═════════════════════════════════════════════════════════
   PANE 2: WIZARD
   ═════════════════════════════════════════════════════════ */
function isStepComplete(stepIdx) {
  const data = state.dims[DOMAINS[state.activeIdx].id];
  switch (stepIdx) {
    case 0: return true; // define is read-only
    case 1: return data.answers.some(a => a.trim());
    case 2: return data.score > 0 && data.targetScore > 0;
    case 3: return data.iam.trim().length > 0;
    case 4: return data.goals.some(g => g.from && g.to && g.by);
    default: return false;
  }
}

function renderWizard() {
  const d = DOMAINS[state.activeIdx];
  const data = state.dims[d.id];
  document.getElementById('detail-stripe').style.background = domainColor(d);
  document.getElementById('bc-dim').textContent = d.label;
  document.getElementById('bc-step').textContent = `Step ${state.activeStep + 1} · ${STEP_NAMES[state.activeStep]}`;
  document.getElementById('detail-title').innerHTML = `${d.label}<em>${d.essence}</em>`;
  document.getElementById('save-pill').textContent = data.savedAt ? `Saved · ${data.savedAt}` : 'Draft';
  document.getElementById('save-pill').classList.toggle('saved', !!data.savedAt);

  // progress pills
  document.querySelectorAll('.wp-step').forEach((el, i) => {
    el.classList.toggle('active', i === state.activeStep);
    el.classList.toggle('complete', isStepComplete(i));
  });
  document.querySelectorAll('.wp-step').forEach(el => {
    el.onclick = () => { state.activeStep = +el.dataset.step; renderWizard(); };
  });

  // Two-column body: step content (left) + persistent companion (right)
  const body = document.getElementById('wizard-body');
  body.innerHTML = `
    <div class="wb-grid">
      <div class="wb-main">
        <div class="wizard-step-header">
          <div class="step-num-badge">${state.activeStep + 1}</div>
          <div class="step-titles">
            <div class="kicker">${STEP_KICKERS[state.activeStep]}</div>
            <h4>${STEP_TITLES[state.activeStep]} <em>· ${STEP_SUBTITLES[state.activeStep]}</em></h4>
          </div>
        </div>
        <div id="step-content"></div>
      </div>
      <aside class="wb-companion" id="wb-companion"></aside>
    </div>
  `;
  renderStepContent();
  renderCompanion();

  // nav buttons
  document.getElementById('step-back').disabled = state.activeStep === 0;
  const nextBtn = document.getElementById('step-next');
  if (state.activeStep === 4) {
    nextBtn.textContent = state.activeIdx < DOMAINS.length - 1 ? 'Save & next dimension →' : 'Save & finish →';
  } else {
    nextBtn.textContent = 'Next →';
  }
  document.getElementById('save-state').textContent = data.savedAt ? `Saved · ${data.savedAt}` : 'Draft — not yet saved';
  document.getElementById('save-state').classList.toggle('saved', !!data.savedAt);
}

/* ─── COMPANION SIDEBAR — visible alongside every wizard step ─── */
function renderCompanion() {
  const d = DOMAINS[state.activeIdx];
  const data = state.dims[d.id];
  const el = document.getElementById('wb-companion');
  const color = domainColor(d);

  // Mini wheel (all 10 petals, current one solid + glowing)
  const miniWheel = buildMiniWheel();

  // Progress through this dimension
  const stepsComplete = [0,1,2,3,4].map(i => isStepComplete(i));
  const stepIcons = stepsComplete.map((c,i) => `
    <div class="cmp-step ${i === state.activeStep ? 'active' : ''} ${c ? 'complete' : ''}"
         data-step="${i}" title="${STEP_NAMES[i]}">
      <span class="dot">${c ? '✓' : i+1}</span>
      <span class="lbl">${STEP_NAMES[i]}</span>
    </div>
  `).join('');

  // Your work-so-far for this dimension
  const answered = data.answers.filter(a => a.trim()).length;
  const reflectionPreview = answered > 0
    ? `<div class="cmp-card">
         <div class="cmp-card-h">Your reflection <span class="cmp-card-meta">${answered}/${d.prompts.length}</span></div>
         <div class="cmp-card-body">${data.answers.filter(a => a.trim()).slice(0,2).map(a => `<p>"${escapeHtml(a.length > 80 ? a.slice(0,80)+'…' : a)}"</p>`).join('')}</div>
       </div>` : '';

  const scorePreview = (data.score || data.targetScore)
    ? `<div class="cmp-card">
         <div class="cmp-card-h">Score</div>
         <div class="cmp-score">
           <div class="cmp-score-row"><span class="cmp-score-lbl">Now</span><span class="cmp-score-val" style="color:${color}">${data.score || '—'}</span><span class="cmp-score-of">/10</span></div>
           <div class="cmp-score-row"><span class="cmp-score-lbl">Vision</span><span class="cmp-score-val" style="color:${color};opacity:0.7">${data.targetScore || '—'}</span><span class="cmp-score-of">/10</span></div>
         </div>
       </div>` : '';

  const iamPreview = data.iam.trim()
    ? `<div class="cmp-card cmp-iam">
         <div class="cmp-card-h">Identity</div>
         <p class="cmp-iam-text">"I am ${escapeHtml(data.iam.trim())}."</p>
       </div>` : '';

  const goalsCount = data.goals.filter(g => g.from && g.to).length;
  const actionsPreview = goalsCount > 0
    ? `<div class="cmp-card">
         <div class="cmp-card-h">Focused actions <span class="cmp-card-meta">${goalsCount}</span></div>
         <div class="cmp-card-body">${data.goals.filter(g => g.from && g.to).slice(0,2).map(g => `<p class="cmp-action">→ <strong>${escapeHtml(g.to)}</strong>${g.by ? ` <span class="cmp-when">by ${formatDate(g.by)}</span>` : ''}</p>`).join('')}</div>
       </div>` : '';

  el.innerHTML = `
    <div class="cmp-wheel-wrap">
      ${miniWheel}
      <div class="cmp-wheel-caption">
        <div class="cmp-wheel-current" style="color:${color}">${d.short}</div>
        <div class="cmp-wheel-sub">${d.essence}</div>
      </div>
    </div>

    <div class="cmp-steps">${stepIcons}</div>

    ${reflectionPreview}
    ${scorePreview}
    ${iamPreview}
    ${actionsPreview}
  `;

  // step icons clickable
  el.querySelectorAll('.cmp-step').forEach(s => {
    s.addEventListener('click', () => {
      state.activeStep = +s.dataset.step;
      renderWizard();
    });
  });
}

function buildMiniWheel() {
  const N = DOMAINS.length;
  const angleStep = (Math.PI * 2) / N;
  const innerR = 22, maxR = 60;
  let svg = `<svg viewBox="-80 -80 160 160" class="cmp-wheel-svg">`;

  DOMAINS.forEach((d, i) => {
    const data = state.dims[d.id];
    const a1 = -Math.PI/2 + i*angleStep - angleStep/2 + 0.04;
    const a2 = -Math.PI/2 + i*angleStep + angleStep/2 - 0.04;
    const isActive = i === state.activeIdx;
    const score = data.score || 0;
    const filled = score > 0;
    const radius = filled ? innerR + (maxR-innerR) * (score/10) : maxR;
    const opacity = isActive ? '1' : filled ? '0.7' : '0.2';

    svg += `<path d="${annularArc(innerR, radius, a1, a2)}" fill="${cssColor(d.cssVar)}" opacity="${opacity}"${isActive ? ' stroke="'+cssColor('--ink')+'" stroke-width="1.5"' : ''}/>`;
  });
  // center ring
  svg += `<circle cx="0" cy="0" r="${innerR}" fill="${cssColor('--paper')}" stroke="${cssColor('--line')}" stroke-width="0.6"/>`;
  svg += `</svg>`;
  return svg;
}

function renderStepContent() {
  const d = DOMAINS[state.activeIdx];
  const data = state.dims[d.id];
  const el = document.getElementById('step-content');

  if (state.activeStep === 0) {
    // ── STEP 1: DEFINE ───────────────────────────────────────────
    el.innerHTML = `
      <p class="step-lead-quote">${escapeHtml(d.definitionLead)}</p>
      <p class="step-body-text">${escapeHtml(d.definitionBody)}</p>

      <div class="components-block">
        <div class="components-label">What makes it up</div>
        <ul class="components">
          ${d.components.map(([n, desc]) => `<li><strong>${escapeHtml(n)}</strong><span>${escapeHtml(desc)}</span></li>`).join('')}
        </ul>
      </div>

      <div class="evidence-note">
        <strong>Research note</strong>
        ${escapeHtml(d.evidence)}
      </div>

      <div class="examples-block">
        <div class="examples-label">What people sometimes say in this dimension</div>
        <div class="examples-grid">
          ${(d.iamExamples || []).slice(0,3).map(s => `
            <div class="example-chip">
              <div class="example-mark">I am…</div>
              <div class="example-text">${escapeHtml(s)}</div>
            </div>
          `).join('')}
        </div>
        <div class="examples-foot">Yours will be different. These are here to spark direction, not prescribe.</div>
      </div>

      <button class="step-advance-cta" id="step-advance-cta">
        <span>Begin with reflection</span><span>→</span>
      </button>
    `;
    document.getElementById('step-advance-cta').addEventListener('click', () => {
      state.activeStep = 1;
      renderWizard();
    });
  }

  else if (state.activeStep === 1) {
    // ── STEP 2: REFLECT ──────────────────────────────────────────
    el.innerHTML = `
      <p class="reflect-intro">Write your way through these three questions before scoring. Even a sentence per prompt produces a more honest score and seeds the vision you'll articulate next. There are no wrong answers.</p>

      ${d.prompts.map((q, i) => `
        <div class="reflect-q ${data.answers[i] ? 'has-answer' : ''}">
          <div class="qnum">Question ${i + 1} of ${d.prompts.length}</div>
          <label>${escapeHtml(q)}</label>
          <textarea data-i="${i}" placeholder="Write freely. A sentence is fine. A paragraph is welcome.">${escapeHtml(data.answers[i] || '')}</textarea>
        </div>
      `).join('')}

      <div class="reflect-progress">
        <span class="reflect-progress-label">Reflection progress</span>
        <div class="reflect-progress-bar">
          ${[0,1,2].map(i => `<div class="rp-seg ${data.answers[i] && data.answers[i].trim() ? 'filled' : ''}" style="${data.answers[i] && data.answers[i].trim() ? `background:${domainColor(d)}` : ''}"></div>`).join('')}
        </div>
        <span class="reflect-progress-count">${data.answers.filter(a=>a.trim()).length}/3</span>
      </div>
    `;
    el.querySelectorAll('textarea').forEach(t => {
      t.addEventListener('input', (e) => {
        const i = +e.target.dataset.i;
        data.answers[i] = e.target.value;
        e.target.closest('.reflect-q').classList.toggle('has-answer', !!e.target.value.trim());
        // update progress bar
        const segs = el.querySelectorAll('.rp-seg');
        segs.forEach((seg, idx) => {
          const filled = data.answers[idx] && data.answers[idx].trim();
          seg.classList.toggle('filled', !!filled);
          seg.style.background = filled ? domainColor(d) : '';
        });
        el.querySelector('.reflect-progress-count').textContent = `${data.answers.filter(a=>a.trim()).length}/3`;
        markUnsaved();
        document.querySelectorAll('.wp-step')[1].classList.toggle('complete', isStepComplete(1));
        renderCompanion();
      });
    });
  }

  else if (state.activeStep === 2) {
    // ── STEP 3: SCORE ────────────────────────────────────────────
    const hasReflection = data.answers.some(a => a.trim());
    const color = domainColor(d);
    el.innerHTML = `
      ${hasReflection
        ? `<div class="score-context">${renderReflectionSummary(d, data)}</div>`
        : `<div class="score-context warn"><strong>Heads up:</strong> Go back to <em>Reflect</em> first — your number will mean more if you've written through the questions.</div>`}

      <div class="score-frame-note">
        This number is your own felt sense of this area <em>today</em> — not a test result or a clinical measure. It will move with your mood and circumstances, and that's expected. Score it as it honestly feels right now; you can always return and change it.
      </div>

      <div class="score-block">
        <div class="score-side">
          <h5>How it feels today</h5>
          <p class="hint">Your honest gut sense right now — not where you wish you were, not your worst day.</p>
          <div class="scale-track" id="score-now-track"></div>
          <div class="scale-anchors">
            <span>1 · struggling</span>
            <span>5 · okay</span>
            <span>10 · thriving</span>
          </div>
          <div class="scale-readout"><span id="score-now-val" style="color:${color}">${data.score || '—'}</span><span class="of">/10</span></div>
        </div>
        <div class="score-side">
          <h5>Where you'd like it to be (12 mo)</h5>
          <p class="hint">A realistic stretch one year out. Not perfection — direction.</p>
          <div class="scale-track" id="score-target-track"></div>
          <div class="scale-anchors">
            <span>1 · holding ground</span>
            <span>5 · steady growth</span>
            <span>10 · transformation</span>
          </div>
          <div class="scale-readout"><span id="score-target-val" style="color:${color};opacity:0.75">${data.targetScore || '—'}</span><span class="of">/10</span></div>
        </div>
      </div>

      <div class="gap-display" id="gap-display" style="border-left-color:${color}">${gapDisplayText()}</div>

      ${(data.score && data.targetScore) ? `
        <div class="gap-visual">
          <div class="gap-visual-track">
            <div class="gap-visual-now" style="width:${data.score*10}%;background:${color}"></div>
            <div class="gap-visual-target" style="left:${data.targetScore*10}%;background:${color}"></div>
          </div>
          <div class="gap-visual-labels">
            <span>now</span>
            <span style="left:${data.targetScore*10}%">vision</span>
          </div>
        </div>
      ` : ''}
    `;
    renderScalePips('score-now-track', data.score, 'score', color);
    renderScalePips('score-target-track', data.targetScore, 'targetScore', color);
  }

  else if (state.activeStep === 3) {
    // ── STEP 4: I AM ─────────────────────────────────────────────
    const color = domainColor(d);
    // build live overarching preview
    const allFragments = DOMAINS.map(dim => ({d: dim, iam: state.dims[dim.id].iam.trim()})).filter(x => x.iam || x.d.id === d.id);

    el.innerHTML = `
      <div class="iam-card" style="border-top:4px solid ${color}">
        <div class="lead">I am…</div>
        <p class="helper">${escapeHtml(d.iamHelper)} Write it in your own words — this becomes one verse of your overarching vision statement.</p>
        <div class="iam-write" id="iam-write">
          <span class="iam-prefix">I am</span>
          <textarea class="iam-input" id="iam-input" rows="1"
            placeholder="${escapeHtml(d.iamPlaceholder)}"
            aria-label="Write your own I am statement for ${escapeHtml(d.short)}">${escapeHtml(data.iam)}</textarea>
        </div>
        <div class="iam-undertext">
          <span class="iam-counter" id="iam-counter">${data.iam.trim() ? data.iam.trim().split(/\s+/).length + ' words' : 'Start typing — there\u2019s no right length'}</span>
          <span class="iam-clear-wrap">${data.iam.trim() ? '<button class="iam-clear" id="iam-clear">clear</button>' : ''}</span>
        </div>
        <div class="echo">Joins your vision statement as: <span id="iam-echo">${data.iam.trim() ? `"I am ${escapeHtml(data.iam.trim())}."` : '"I am …"'}</span></div>
      </div>

      <details class="iam-inspiration" ${data.iam.trim() ? '' : 'open'}>
        <summary class="iam-inspiration-label">Stuck? Borrow a starting point for ${escapeHtml(d.short)} <span class="iam-insp-hint">(optional)</span></summary>
        <div class="iam-spark-grid">
          ${(d.iamExamples || []).map(s => `
            <button class="iam-spark" data-spark="${escapeHtml(s)}">
              <span class="iam-spark-mark">I am</span>
              <span class="iam-spark-text">${escapeHtml(s)}</span>
            </button>
          `).join('')}
        </div>
        <div class="iam-inspiration-foot">These drop into the box above as editable text — change every word until it's yours.</div>
      </details>

      ${data.answers.some(a => a.trim()) ? `
        <div class="reflection-summary">
          <div class="sl">Your reflection · for reference</div>
          <div class="summary-text">${renderReflectionForRef(data)}</div>
        </div>
      ` : ''}

      <div class="overarching-preview">
        <div class="op-label">Your overarching vision so far</div>
        <div class="op-card">
          ${allFragments.length === 0
            ? '<div class="op-empty">Begin writing to see your whole-life vision compose itself.</div>'
            : '<div class="op-text">I am ' + allFragments.map(f => {
                const isCurrent = f.d.id === d.id;
                const text = f.iam || `<span class="op-pending" style="color:${cssColor(f.d.cssVar)}">[${f.d.short.toLowerCase()}]</span>`;
                return isCurrent ? `<strong style="color:${color}">${typeof text === 'string' && !text.includes('span') ? escapeHtml(text) : text}</strong>` : (typeof text === 'string' && !text.includes('span') ? escapeHtml(text) : text);
              }).join('<span class="op-sep">, </span>') + '.</div>'
          }
        </div>
      </div>
    `;
    const iam = document.getElementById('iam-input');
    const counter = document.getElementById('iam-counter');

    function autosize() {
      iam.style.height = 'auto';
      iam.style.height = Math.max(iam.scrollHeight, 44) + 'px';
    }
    autosize();
    // Put the cursor at the end so editing a borrowed line is natural
    requestAnimationFrame(() => {
      iam.focus();
      const v = iam.value;
      iam.value = '';
      iam.value = v;
      autosize();
    });

    let opTimer = null;
    iam.addEventListener('input', (e) => {
      data.iam = e.target.value;
      autosize();
      const trimmed = data.iam.trim();
      const echoEl = document.getElementById('iam-echo');
      if (echoEl) echoEl.textContent = trimmed ? `"I am ${trimmed}."` : '"I am …"';
      if (counter) counter.textContent = trimmed
        ? trimmed.split(/\s+/).length + (trimmed.split(/\s+/).length === 1 ? ' word' : ' words')
        : 'Start typing — there\u2019s no right length';
      // Toggle clear button without nuking the textarea
      const clearWrap = el.querySelector('.iam-clear-wrap');
      if (clearWrap) {
        if (trimmed && !clearWrap.querySelector('.iam-clear')) {
          clearWrap.innerHTML = '<button class="iam-clear" id="iam-clear">clear</button>';
          wireClear();
        } else if (!trimmed && clearWrap.querySelector('.iam-clear')) {
          clearWrap.innerHTML = '';
        }
      }
      markUnsaved();
      document.querySelectorAll('.wp-step')[3].classList.toggle('complete', isStepComplete(3));
      renderCompanion();
      // Debounced, surgical preview refresh — does NOT rebuild the textarea
      clearTimeout(opTimer);
      opTimer = setTimeout(() => {
        const op = el.querySelector('.op-card');
        if (op) {
          const frags = DOMAINS
            .map(dim => ({ d: dim, iam: state.dims[dim.id].iam.trim() }))
            .filter(x => x.iam || x.d.id === d.id);
          if (frags.length === 0) {
            op.innerHTML = '<div class="op-empty">Begin writing to see your whole-life vision compose itself.</div>';
          } else {
            op.innerHTML = '<div class="op-text">I am ' + frags.map(f => {
              const isCurrent = f.d.id === d.id;
              if (f.iam) {
                const t = escapeHtml(f.iam);
                return isCurrent ? `<strong style="color:${color}">${t}</strong>` : t;
              }
              return `<span class="op-pending" style="color:${cssColor(f.d.cssVar)}">[${f.d.short.toLowerCase()}]</span>`;
            }).join('<span class="op-sep">, </span>') + '.</div>';
          }
        }
      }, 250);
    });

    // Enter (without Shift) confirms and moves to the next step
    iam.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (data.iam.trim()) {
          document.getElementById('step-next').click();
        }
      }
    });

    function wireClear() {
      const cb = document.getElementById('iam-clear');
      if (!cb) return;
      cb.addEventListener('click', () => {
        data.iam = '';
        iam.value = '';
        autosize();
        iam.focus();
        iam.dispatchEvent(new Event('input'));
      });
    }
    wireClear();

    // Borrow a starting point → drops into the box as fully editable text
    el.querySelectorAll('.iam-spark').forEach(b => {
      b.addEventListener('click', () => {
        const spark = b.dataset.spark.replace(/\.$/, '');
        iam.value = spark;
        data.iam = spark;
        autosize();
        iam.focus();
        iam.setSelectionRange(spark.length, spark.length);
        iam.dispatchEvent(new Event('input'));
        // Collapse the inspiration drawer so the focus returns to the writing
        const drawer = el.querySelector('.iam-inspiration');
        if (drawer) drawer.open = false;
        iam.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  else if (state.activeStep === 4) {
    // ── STEP 5: ACT ──────────────────────────────────────────────
    const color = domainColor(d);
    if (data.goals.length === 0) {
      data.goals.push({ from: '', to: '', by: '', cost: '', costCycle: 'monthly', bucket: 'wants' });
    }
    el.innerHTML = `
      <p class="actions-intro">An "I am…" names the destination. A focused action names the next step. Be specific about where you are starting, where you're going, and by when. If it costs money, name the amount — it flows into your budget automatically.</p>

      ${data.iam.trim() ? `
        <div class="action-anchor" style="border-left-color:${color}">
          <div class="action-anchor-label">Your declaration · ${d.short}</div>
          <div class="action-anchor-text">"I am ${escapeHtml(data.iam.trim())}."</div>
        </div>
      ` : `
        <div class="action-anchor warn">
          <div class="action-anchor-label">Tip</div>
          <div class="action-anchor-text">Write your "I am…" first (Step 4) — focused actions land harder when they're in service of a declared identity.</div>
        </div>
      `}

      <div id="goals-list"></div>
      <button class="add-goal" id="add-goal">+ Add another focused action</button>

      <div class="action-inspiration">
        <div class="action-inspiration-label">Examples in this dimension</div>
        <div class="action-example-list">
          ${(d.actionExamples || []).map((a,i) => `
            <button class="action-example" data-ex="${i}">
              <span class="ax-arrow">→</span>
              <span class="ax-body">from <strong>${escapeHtml(a[0])}</strong> to <strong>${escapeHtml(a[1])}</strong>, by <strong>${escapeHtml(a[2])}</strong></span>
              <span class="ax-use">use this</span>
            </button>
          `).join('')}
        </div>
        <div class="action-inspiration-foot">Click any example to populate a new action — then make it specific to your life.</div>
      </div>
    `;
    renderGoals();
    document.getElementById('add-goal').addEventListener('click', () => {
      data.goals.push({ from: '', to: '', by: '', cost: '', costCycle: 'monthly', bucket: 'wants' });
      renderGoals();
      markUnsaved();
    });
    // Wire example clicks
    el.querySelectorAll('.action-example').forEach(btn => {
      btn.addEventListener('click', () => {
        const exIdx = +btn.dataset.ex;
        const ex = d.actionExamples[exIdx];
        // append a new goal with example values (date approximated)
        const now = new Date();
        now.setMonth(now.getMonth() + 2);
        const byDate = now.toISOString().slice(0,10);
        data.goals.push({ from: ex[0], to: ex[1], by: byDate, cost: '', costCycle: 'monthly', bucket: 'wants' });
        renderGoals();
        markUnsaved();
        renderCompanion();
      });
    });
  }
}

function renderReflectionSummary(d, data) {
  const answered = data.answers.filter(a => a.trim()).length;
  return `<strong>You wrote about ${answered} of ${d.prompts.length} prompt${answered === 1 ? '' : 's'}.</strong> Drawing on that, score yourself honestly below — not aspirationally, not pessimistically.`;
}

function renderReflectionForRef(data) {
  return data.answers.filter(a => a.trim()).map((a, i) =>
    `<div style="padding:8px 0;border-bottom:1px dotted var(--line);"><strong style="font-style:normal;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.15em;color:var(--muted);">Q${i + 1}</strong> ${escapeHtml(a.length > 200 ? a.slice(0, 200) + '…' : a)}</div>`
  ).join('') || '<em>No reflection written yet.</em>';
}

function renderScalePips(elId, currentValue, type, color) {
  const track = document.getElementById(elId);
  track.innerHTML = '';
  for (let n = 1; n <= 10; n++) {
    const pip = document.createElement('div');
    pip.className = 'scale-pip' + (currentValue >= n ? ' filled' : '');
    pip.textContent = n;
    if (currentValue >= n) {
      pip.style.background = color; pip.style.borderColor = color;
      if (type === 'targetScore') pip.style.opacity = '0.65';
    }
    pip.addEventListener('click', () => {
      const d = DOMAINS[state.activeIdx];
      state.dims[d.id][type] = n;
      renderStepContent();
      markUnsaved();
      document.querySelectorAll('.wp-step')[2].classList.toggle('complete', isStepComplete(2));
    });
    track.appendChild(pip);
  }
}

function gapDisplayText() {
  const d = DOMAINS[state.activeIdx], data = state.dims[d.id];
  if (data.score === 0 || data.targetScore === 0) return 'Set both scores to see your gap.';
  const gap = data.targetScore - data.score;
  if (gap === 0) return `You are already where you want to be. Consider whether your <em>vision</em> could stretch — or whether the work here is to <em>protect</em> what you have.`;
  if (gap > 0) return `Your gap is <strong>+${gap} points</strong>. That gap is the work — your "I am…" and focused actions are how you close it.`;
  return `Interesting — your vision is <em>lower</em> than your current state. Worth asking: are you over-investing here, at the cost of another dimension?`;
}

function renderGoals() {
  const d = DOMAINS[state.activeIdx], data = state.dims[d.id];
  const list = document.getElementById('goals-list');
  list.innerHTML = '';
  data.goals.forEach((g, i) => {
    const card = document.createElement('div');
    card.className = 'goal-card';
    card.innerHTML = `
      <h6>
        <span>Focused Action · ${String(i + 1).padStart(2, '0')}</span>
        ${data.goals.length > 1 ? `<button class="goal-delete" data-i="${i}" title="Remove">×</button>` : '<span></span>'}
      </h6>
      <div class="goal-grid">
        <div class="goal-field"><label>From (where you are now)</label>
          <input type="text" data-field="from" data-i="${i}" value="${escapeHtml(g.from)}" placeholder="e.g. sedentary most days"/></div>
        <div class="goal-field"><label>To (where you are going)</label>
          <input type="text" data-field="to" data-i="${i}" value="${escapeHtml(g.to)}" placeholder="e.g. walking 30 min daily"/></div>
        <div class="goal-field full"><label>By when (specific date)</label>
          <input type="date" data-field="by" data-i="${i}" value="${escapeHtml(g.by)}"/></div>
      </div>
      <div class="goal-preview">${renderGoalPreview(g)}</div>
      <div class="budget-link">
        <div>
          <div class="bl-label">Does this need money?</div>
          <div style="font-family:'Fraunces',serif;font-style:italic;font-size:13px;color:var(--muted);">If yes, it flows into your budget automatically.</div>
        </div>
        <div class="cost-row">
          <span style="font-family:'Fraunces',serif;">$</span>
          <input type="number" class="cost" data-field="cost" data-i="${i}" value="${g.cost || ''}" placeholder="0" min="0" step="1"/>
          <select data-field="costCycle" data-i="${i}">
            <option value="one-time" ${g.costCycle === 'one-time' ? 'selected' : ''}>once</option>
            <option value="monthly" ${g.costCycle === 'monthly' ? 'selected' : ''}>/mo</option>
            <option value="yearly" ${g.costCycle === 'yearly' ? 'selected' : ''}>/yr</option>
          </select>
          <select data-field="bucket" data-i="${i}">
            <option value="needs" ${g.bucket === 'needs' ? 'selected' : ''}>Needs</option>
            <option value="wants" ${g.bucket === 'wants' ? 'selected' : ''}>Wants</option>
            <option value="savings" ${g.bucket === 'savings' ? 'selected' : ''}>Savings</option>
          </select>
        </div>
      </div>
    `;
    list.appendChild(card);
  });
  list.querySelectorAll('input, select').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const i = +e.target.dataset.i, f = e.target.dataset.field;
      data.goals[i][f] = e.target.value;
      const preview = e.target.closest('.goal-card').querySelector('.goal-preview');
      if (preview) preview.innerHTML = renderGoalPreview(data.goals[i]);
      markUnsaved();
      document.querySelectorAll('.wp-step')[4].classList.toggle('complete', isStepComplete(4));
    });
  });
  list.querySelectorAll('.goal-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = +btn.dataset.i;
      data.goals.splice(i, 1);
      if (data.goals.length === 0) data.goals.push({ from: '', to: '', by: '', cost: '', costCycle: 'monthly', bucket: 'wants' });
      renderGoals();
      markUnsaved();
    });
  });
}

function renderGoalPreview(g) {
  if (!g.from && !g.to && !g.by) return '<span class="placeholder">Your commitment will appear here as you write.</span>';
  const from = g.from ? `<strong>${escapeHtml(g.from)}</strong>` : '<em style="color:var(--muted)">[from]</em>';
  const to = g.to ? `<strong>${escapeHtml(g.to)}</strong>` : '<em style="color:var(--muted)">[to]</em>';
  const by = g.by ? `<strong>${formatDate(g.by)}</strong>` : '<em style="color:var(--muted)">[by when]</em>';
  return `I will move from ${from} to ${to}, by ${by}.`;
}

function formatDate(s) {
  if (!s) return '';
  const d = new Date(s + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function markUnsaved() {
  document.getElementById('save-state').textContent = 'Saving…';
  document.getElementById('save-state').classList.remove('saved');
  document.getElementById('save-pill').textContent = 'Saving…';
  document.getElementById('save-pill').classList.remove('saved');
  // Debounced autosave so rapid typing doesn't thrash localStorage
  clearTimeout(markUnsaved._t);
  markUnsaved._t = setTimeout(() => {
    persistState();
    const ss = document.getElementById('save-state');
    const sp = document.getElementById('save-pill');
    if (ss) { ss.textContent = 'Saved'; ss.classList.add('saved'); }
    if (sp) { sp.textContent = 'Saved'; sp.classList.add('saved'); }
  }, 600);
}

function saveDimension() {
  const d = DOMAINS[state.activeIdx];
  state.dims[d.id].savedAt = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  persistState();
}

// WIZARD NAV
document.getElementById('step-back').addEventListener('click', () => {
  if (state.activeStep > 0) { state.activeStep--; renderWizard(); }
});
document.getElementById('step-next').addEventListener('click', () => {
  if (state.activeStep < 4) { state.activeStep++; renderWizard(); }
  else {
    // last step: save & advance
    saveDimension();
    if (state.activeIdx < DOMAINS.length - 1) {
      state.activeIdx++; state.activeStep = 0; renderWizard();
    } else {
      switchPane('vision');
    }
  }
});
document.getElementById('step-skip').addEventListener('click', () => {
  if (state.activeIdx < DOMAINS.length - 1) { state.activeIdx++; state.activeStep = 0; renderWizard(); }
  else { switchPane('overview'); }
});
document.getElementById('back-to-wheel').addEventListener('click', (e) => { e.preventDefault(); switchPane('overview'); });

/* ═════════════════════════════════════════════════════════
   PANE 3: VISION STATEMENT
   ═════════════════════════════════════════════════════════ */
function renderVisionStatement() {
  const declared = DOMAINS.map(d => ({ d, iam: state.dims[d.id].iam.trim() })).filter(x => x.iam);
  const el = document.getElementById('vs-content');
  document.getElementById('vs-count').textContent = `${declared.length} / 10 voices`;

  // ── Hero: the composed statement ──
  if (declared.length === 0) {
    el.innerHTML = `<div class="vs-empty">Begin writing your "I am…" statements in each dimension. They will compose themselves here into one overarching vision — a single sentence describing the whole life you're building.</div>`;
  } else if (declared.length === 1) {
    el.innerHTML = `<div class="vs-iam">I am ${escapeHtml(declared[0].iam)}.</div>`;
  } else {
    const parts = declared.map(f => `<span class="frag">${escapeHtml(f.iam)}</span>`);
    let combined;
    if (parts.length === 2) combined = parts.join(' <span class="sep">&</span> ');
    else {
      const last = parts[parts.length - 1];
      const head = parts.slice(0, -1).join('<span class="sep">,</span> ');
      combined = `${head}<span class="sep">, and</span> ${last}`;
    }
    el.innerHTML = `<div class="vs-iam">I am…</div><div class="vs-list">${combined}.</div>`;
  }

  // ── Meta stats grid ──
  const totalScore = DOMAINS.reduce((s, d) => s + (state.dims[d.id].score || 0), 0);
  const scoredCount = DOMAINS.filter(d => state.dims[d.id].score > 0).length;
  const avgNow = scoredCount ? (DOMAINS.reduce((s,d)=>s+(state.dims[d.id].score||0),0) / scoredCount) : 0;
  const avgVision = scoredCount ? (DOMAINS.reduce((s,d)=>s+(state.dims[d.id].targetScore||0),0) / DOMAINS.filter(d=>state.dims[d.id].targetScore>0).length || 0) : 0;
  const totalActions = DOMAINS.reduce((s,d)=>s+state.dims[d.id].goals.filter(g=>g.from&&g.to).length,0);
  const completeDims = DOMAINS.filter(d => isDimensionComplete(d.id)).length;

  document.getElementById('vision-meta-grid').innerHTML = `
    <div class="vm-cell">
      <div class="vm-num">${declared.length}<span class="vm-den">/10</span></div>
      <div class="vm-lbl">Voices declared</div>
    </div>
    <div class="vm-cell">
      <div class="vm-num">${avgNow ? avgNow.toFixed(1) : '—'}</div>
      <div class="vm-lbl">Avg. current score</div>
    </div>
    <div class="vm-cell">
      <div class="vm-num">${avgVision ? avgVision.toFixed(1) : '—'}</div>
      <div class="vm-lbl">Avg. vision score</div>
    </div>
    <div class="vm-cell">
      <div class="vm-num">${totalActions}</div>
      <div class="vm-lbl">Focused actions set</div>
    </div>
  `;

  // ── Verses: one card per dimension ──
  document.getElementById('vv-progress').textContent = `${declared.length} of 10 declared`;
  const verses = document.getElementById('vision-verses');
  verses.innerHTML = DOMAINS.map(d => {
    const data = state.dims[d.id];
    const c = domainColor(d);
    const hasIam = data.iam.trim();
    return `
      <button class="verse-card ${hasIam ? 'declared' : 'pending'}" data-dim="${d.id}" style="--vc:${c}">
        <div class="verse-head">
          <span class="verse-dot" style="background:${c}"></span>
          <span class="verse-name">${d.short}</span>
          ${hasIam ? `<span class="verse-badge declared">declared</span>` : `<span class="verse-badge">awaiting</span>`}
        </div>
        ${hasIam
          ? `<div class="verse-text">"I am ${escapeHtml(data.iam.trim())}."</div>`
          : `<div class="verse-placeholder">${escapeHtml(d.iamPlaceholder)}</div>`}
        <div class="verse-foot">
          ${data.score ? `<span class="verse-score" style="color:${c}">${data.score}<span class="vs-den">/10</span> now</span>` : '<span class="verse-score muted">not scored</span>'}
          <span class="verse-cta">${hasIam ? 'refine →' : 'declare →'}</span>
        </div>
      </button>
    `;
  }).join('');
  verses.querySelectorAll('.verse-card').forEach(card => {
    card.addEventListener('click', () => {
      state.activeIdx = DOMAINS.findIndex(x => x.id === card.dataset.dim);
      state.activeStep = 3; // jump to the "I am" step
      switchPane('dimension');
    });
  });

  // ── Contextual prompt ──
  const promptEl = document.getElementById('vision-prompt-card');
  if (declared.length === 0) {
    promptEl.innerHTML = `
      <div class="vp-inner">
        <div class="vp-mark">"</div>
        <div class="vp-body">
          <div class="vp-h">Where to start</div>
          <p>You don't have to do this in order. Pick the dimension that feels most alive — or most stuck — and write a single present-tense sentence about who you are becoming there. The rest will follow.</p>
          <button class="vp-cta" id="vp-cta">Go to the wheel →</button>
        </div>
      </div>`;
  } else if (declared.length < 10) {
    const next = DOMAINS.find(d => !state.dims[d.id].iam.trim());
    promptEl.innerHTML = `
      <div class="vp-inner">
        <div class="vp-mark">"</div>
        <div class="vp-body">
          <div class="vp-h">${10 - declared.length} ${10 - declared.length === 1 ? 'voice' : 'voices'} still silent</div>
          <p>Your vision is taking shape. ${next ? `<strong>${next.label}</strong> is undeclared — ${escapeHtml(next.essence.toLowerCase())}.` : ''} A whole-life vision is most powerful when every dimension speaks.</p>
          <button class="vp-cta" id="vp-cta">Declare ${next ? next.short : 'the next one'} →</button>
        </div>
      </div>`;
  } else {
    promptEl.innerHTML = `
      <div class="vp-inner complete">
        <div class="vp-mark">✓</div>
        <div class="vp-body">
          <div class="vp-h">All ten voices are speaking</div>
          <p>Your whole-life vision is complete. Read it aloud once a week. Revisit and refine it as you grow — a vision is a living document, not a monument. Next: make sure each voice has a focused action and that your budget funds the life you've named.</p>
          <button class="vp-cta" id="vp-cta">Review focused actions →</button>
        </div>
      </div>`;
  }
  const vpCta = document.getElementById('vp-cta');
  if (vpCta) {
    vpCta.addEventListener('click', () => {
      if (declared.length === 0) switchPane('overview');
      else if (declared.length < 10) {
        const next = DOMAINS.find(d => !state.dims[d.id].iam.trim());
        if (next) { state.activeIdx = DOMAINS.indexOf(next); state.activeStep = 3; switchPane('dimension'); }
      } else switchPane('actions');
    });
  }
}

/* ═════════════════════════════════════════════════════════
   PANE 4: TIMELINE
   ═════════════════════════════════════════════════════════ */
function renderTimeline() {
  const all = [];
  DOMAINS.forEach(d => {
    state.dims[d.id].goals.forEach((g, gi) => {
      if (g.from && g.to && g.by) all.push({ ...g, dimension: d, gi });
    });
  });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const urgencyOf = (byStr) => {
    const due = new Date(byStr + 'T00:00:00');
    const days = Math.round((due - today) / 86400000);
    if (days < 0) return { rank: 0, urgency: 'overdue', label: `${Math.abs(days)}d overdue`, days };
    if (days <= 30) return { rank: 1, urgency: 'soon', label: days === 0 ? 'today' : `${days}d`, days };
    if (days <= 90) return { rank: 2, urgency: 'soon', label: `${days}d`, days };
    return { rank: 3, urgency: 'later', label: `${days}d`, days };
  };

  // ── Stats header ──
  const statsEl = document.getElementById('timeline-stats');
  if (all.length === 0) {
    statsEl.innerHTML = '';
  } else {
    const overdue = all.filter(a => urgencyOf(a.by).urgency === 'overdue').length;
    const soon = all.filter(a => urgencyOf(a.by).rank === 1).length;
    const funded = all.filter(a => parseFloat(a.cost) > 0).length;
    const dimsCovered = new Set(all.map(a => a.dimension.id)).size;
    statsEl.innerHTML = `
      <div class="ts-cell ${overdue ? 'alert' : ''}">
        <div class="ts-num">${overdue}</div><div class="ts-lbl">Overdue</div>
      </div>
      <div class="ts-cell">
        <div class="ts-num">${soon}</div><div class="ts-lbl">Due within 30 days</div>
      </div>
      <div class="ts-cell">
        <div class="ts-num">${all.length}</div><div class="ts-lbl">Total commitments</div>
      </div>
      <div class="ts-cell">
        <div class="ts-num">${dimsCovered}<span class="ts-den">/10</span></div><div class="ts-lbl">Dimensions in motion</div>
      </div>
      <div class="ts-cell">
        <div class="ts-num">${funded}</div><div class="ts-lbl">Funded actions</div>
      </div>
    `;
  }

  const list = document.getElementById('timeline-list');
  if (all.length === 0) {
    list.innerHTML = `
      <div class="timeline-empty">
        <div class="te-mark">→</div>
        <div class="te-h">No focused actions yet</div>
        <p>Once you write "from X to Y, by when" commitments in the dimension wizard, they appear here as a single prioritized list — your whole vision's to-do, in order.</p>
        <button class="te-cta" id="te-cta">Open the wheel →</button>
      </div>`;
    const teCta = document.getElementById('te-cta');
    if (teCta) teCta.addEventListener('click', () => switchPane('overview'));
    document.getElementById('timeline-coverage').innerHTML = '';
    return;
  }

  // ── Sort ──
  if (state.actionSort === 'date') all.sort((a, b) => new Date(a.by) - new Date(b.by));
  else if (state.actionSort === 'urgency') all.sort((a, b) => urgencyOf(a.by).days - urgencyOf(b.by).days);
  else all.sort((a, b) => DOMAINS.indexOf(a.dimension) - DOMAINS.indexOf(b.dimension) || new Date(a.by) - new Date(b.by));

  list.innerHTML = '';
  let lastGroup = null;
  all.forEach(a => {
    const u = urgencyOf(a.by);

    // Group dividers when sorting by urgency
    if (state.actionSort === 'urgency') {
      const groupName = u.urgency === 'overdue' ? 'Overdue — needs attention now'
        : u.rank === 1 ? 'This month'
        : u.rank === 2 ? 'This quarter'
        : 'Later this year';
      if (groupName !== lastGroup) {
        lastGroup = groupName;
        const divider = document.createElement('li');
        divider.className = 'timeline-divider';
        divider.innerHTML = `<span>${groupName}</span>`;
        list.appendChild(divider);
      }
    }

    const row = document.createElement('li');
    row.className = 'timeline-row';
    row.innerHTML = `
      <div class="urgency ${u.urgency}">${u.label}</div>
      <div class="dim-tag"><span class="dot" style="background:${domainColor(a.dimension)}"></span>${a.dimension.short}</div>
      <div class="commitment-text">From <strong>${escapeHtml(a.from)}</strong> to <strong>${escapeHtml(a.to)}</strong>.</div>
      <div class="when">${formatDate(a.by)}<div class="sub">${a.cost ? '$' + a.cost + '/' + a.costCycle.replace('-time', '') : 'no cost'}</div></div>
    `;
    row.addEventListener('click', () => {
      state.activeIdx = DOMAINS.indexOf(a.dimension); state.activeStep = 4; switchPane('dimension');
    });
    list.appendChild(row);
  });

  // ── Coverage panel: which dimensions have actions, which don't ──
  const covEl = document.getElementById('timeline-coverage');
  const covered = new Set(all.map(a => a.dimension.id));
  const declaredButNoAction = DOMAINS.filter(d => state.dims[d.id].iam.trim() && !covered.has(d.id));
  covEl.innerHTML = `
    <div class="tc-head">
      <h4>Coverage across your wheel <em>· every dimension deserves a next step</em></h4>
    </div>
    <div class="tc-grid">
      ${DOMAINS.map(d => {
        const has = covered.has(d.id);
        const declared = state.dims[d.id].iam.trim();
        const count = state.dims[d.id].goals.filter(g => g.from && g.to && g.by).length;
        const c = domainColor(d);
        return `
          <button class="tc-cell ${has ? 'has' : declared ? 'gap' : 'none'}" data-dim="${d.id}" style="--tc:${c}">
            <span class="tc-dot" style="background:${c}"></span>
            <span class="tc-name">${d.short}</span>
            <span class="tc-status">${has ? `${count} action${count===1?'':'s'}` : declared ? 'declared, no action' : 'no action'}</span>
          </button>`;
      }).join('')}
    </div>
    ${declaredButNoAction.length ? `
      <div class="tc-alert">
        <strong>${declaredButNoAction.length} declared ${declaredButNoAction.length === 1 ? 'dimension has' : 'dimensions have'} no focused action:</strong>
        ${declaredButNoAction.map(d => `<span class="tc-chip" style="border-color:${domainColor(d)};color:${domainColor(d)}">${d.short}</span>`).join('')}
        — an identity without an action is just a wish.
      </div>` : `
      <div class="tc-ok">Every declared dimension has at least one focused action. Your vision has feet.</div>`}
  `;
  covEl.querySelectorAll('.tc-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      state.activeIdx = DOMAINS.findIndex(x => x.id === cell.dataset.dim);
      state.activeStep = 4;
      switchPane('dimension');
    });
  });
}
document.querySelectorAll('.sort-toggle button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sort-toggle button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.actionSort = btn.dataset.sort;
    renderTimeline();
  });
});

/* ═════════════════════════════════════════════════════════
   PANE 5: FUND
   ═════════════════════════════════════════════════════════ */
function monthlyCost(cost, cadence) {
  const c = parseFloat(cost) || 0;
  if (c === 0) return 0;
  if (cadence === 'monthly') return c;
  if (cadence === 'yearly') return c / 12;
  return c / 12;
}
function visionExpenses() {
  const out = [];
  DOMAINS.forEach(d => {
    state.dims[d.id].goals.forEach((g, gi) => {
      const m = monthlyCost(g.cost, g.costCycle);
      if (m > 0 && g.from && g.to) {
        out.push({
          id: `vision-${d.id}-${gi}`,
          name: g.to.length > 30 ? g.to.slice(0, 30) + '…' : g.to,
          amount: m, bucket: g.bucket, source: d.short, sourceColor: domainColor(d),
        });
      }
    });
  });
  return out;
}
function allExpenses() { return [...visionExpenses(), ...state.expenses]; }
function fmt(n) { return '$' + Math.round(n).toLocaleString(); }

function renderBudget() {
  renderBudgetOverview();
  renderExpenses();
  renderVisionFundPanel();
  updateFundIntro();
  syncSliders();
}

function renderBudgetOverview() {
  const income = state.income || 0;
  const expenses = allExpenses();
  const targets = { needs: state.pcts.needs / 100, wants: state.pcts.wants / 100, savings: state.pcts.savings / 100 };

  ['needs', 'wants', 'savings'].forEach(b => {
    const node = document.querySelector(`.bucket[data-bucket="${b}"]`);
    const actual = expenses.filter(e => e.bucket === b).reduce((s, e) => s + e.amount, 0);
    const cap = income * targets[b];
    const actualPct = income > 0 ? (actual / income) * 100 : 0;
    node.querySelector('.bucket-actual').textContent = fmt(actual);
    node.querySelector('.bucket-cap').textContent = Math.round(cap).toLocaleString();
    node.querySelector('.target-pct').textContent = state.pcts[b];
    node.querySelector('.actual-pct').textContent = actualPct.toFixed(1) + '%';
    node.querySelector('.bucket-bar-fill').style.width = Math.min(100, actualPct) + '%';
    node.querySelector('.bucket-bar-target').style.left = state.pcts[b] + '%';
    const diff = actual - cap;
    const diffEl = node.querySelector('.diff'), statusEl = node.querySelector('.bucket-status');
    statusEl.classList.remove('over', 'good');
    if (income === 0) { diffEl.textContent = '—'; statusEl.textContent = 'Enter income to begin.'; }
    else if (b === 'savings') {
      if (actual >= cap) { diffEl.textContent = '+' + fmt(diff); statusEl.textContent = 'Above target.'; statusEl.classList.add('good'); }
      else { diffEl.textContent = fmt(Math.abs(diff)) + ' to target'; statusEl.textContent = `Add ${fmt(Math.abs(diff))} more.`; }
    } else {
      if (actual > cap) { diffEl.textContent = '+' + fmt(diff) + ' over'; statusEl.textContent = `Over target by ${fmt(diff)}.`; statusEl.classList.add('over'); }
      else if (actual === 0) { diffEl.textContent = fmt(cap) + ' available'; statusEl.textContent = b === 'needs' ? 'Awaiting essentials.' : 'Room to enjoy.'; }
      else { diffEl.textContent = fmt(cap - actual) + ' left'; statusEl.textContent = `${fmt(cap - actual)} remaining.`; statusEl.classList.add('good'); }
    }
  });
}

function renderExpenses() {
  const list = document.getElementById('expense-list');
  list.innerHTML = '';
  const expenses = allExpenses();
  const buckets = [
    { id: 'needs', label: 'Needs', color: cssColor('--bucket-needs') },
    { id: 'wants', label: 'Wants', color: cssColor('--bucket-wants') },
    { id: 'savings', label: 'Savings & Debt', color: cssColor('--bucket-savings') },
  ];
  buckets.forEach(b => {
    const items = expenses.filter(e => e.bucket === b.id);
    const sum = items.reduce((s, e) => s + e.amount, 0);
    const groupEl = document.createElement('li');
    groupEl.className = 'group';
    groupEl.innerHTML = `
      <div class="group-head">
        <h3><span class="swatch" style="background:${b.color}"></span>${b.label}</h3>
        <div class="sum">${items.length} item${items.length === 1 ? '' : 's'} · <strong>${fmt(sum)}</strong>/mo</div>
      </div>
    `;
    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty'; empty.textContent = 'Nothing here yet.';
      groupEl.appendChild(empty);
    } else {
      items.forEach(e => {
        const row = document.createElement('div');
        row.className = 'expense';
        const isVision = e.id && String(e.id).startsWith('vision-');
        row.innerHTML = `
          <span>${escapeHtml(e.name)}</span>
          ${e.source ? `<span class="source-tag" style="background:${e.sourceColor};">${escapeHtml(e.source)} · vision</span>` : '<span></span>'}
          <span class="amount">${fmt(e.amount)}</span>
          ${isVision ? '<span style="color:var(--muted);font-size:11px;font-style:italic;">linked</span>' : `<button class="del" data-id="${e.id}" title="Remove">×</button>`}
        `;
        groupEl.appendChild(row);
      });
    }
    list.appendChild(groupEl);
  });
  list.querySelectorAll('.del').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = +btn.dataset.id;
      state.expenses = state.expenses.filter(e => e.id !== id);
      persistState();
      renderBudget();
    });
  });
}

function renderVisionFundPanel() {
  const el = document.getElementById('vision-fund-panel');
  const totals = {};
  let grand = 0;
  DOMAINS.forEach(d => {
    let sum = 0;
    state.dims[d.id].goals.forEach(g => {
      const m = monthlyCost(g.cost, g.costCycle);
      if (m > 0 && g.from && g.to) sum += m;
    });
    totals[d.id] = sum;
    grand += sum;
  });

  // Balance check: under-funded = has goals but $0; over-funded = >50% of total vision funding
  const dimsWithGoals = DOMAINS.filter(d => state.dims[d.id].goals.some(g => g.from && g.to));
  const underfunded = dimsWithGoals.filter(d => totals[d.id] === 0);
  const overfundedDim = grand > 0
    ? DOMAINS.find(d => totals[d.id] > 0 && totals[d.id] / grand > 0.5)
    : null;

  let alertHTML = '';
  if (dimsWithGoals.length === 0) {
    alertHTML = `<div class="balance-alert"><strong>Awaiting input</strong>Write focused actions in the wizard to see your balance.</div>`;
  } else if (underfunded.length > 0) {
    alertHTML = `<div class="balance-alert"><strong>Balance check</strong>You have actions in <strong style="font-style:italic;font-family:'Fraunces',serif;text-transform:none;letter-spacing:0;font-size:13px;color:var(--ink);font-weight:500;">${underfunded.map(d => d.short).join(', ')}</strong> but no funding. Is that intentional, or did something get missed?</div>`;
  } else if (overfundedDim && dimsWithGoals.length >= 3) {
    const pct = Math.round(totals[overfundedDim.id] / grand * 100);
    alertHTML = `<div class="balance-alert"><strong>Balance check</strong><strong style="font-style:italic;font-family:'Fraunces',serif;text-transform:none;letter-spacing:0;font-size:13px;color:var(--ink);font-weight:500;">${overfundedDim.short}</strong> alone is ${pct}% of your vision-funded spending. Is that the life you want — or is something else under-resourced?</div>`;
  } else {
    alertHTML = `<div class="balance-alert good"><strong>Balanced</strong>Your funded dimensions are well-distributed across your wheel.</div>`;
  }

  el.innerHTML = `
    <h5>Vision-funded line items / mo</h5>
    <div class="vf-sub">From your focused actions, by dimension.</div>
    ${DOMAINS.map(d => {
      const hasGoals = state.dims[d.id].goals.some(g => g.from && g.to);
      const flagged = hasGoals && totals[d.id] === 0;
      return `
      <div class="vfund-row">
        <span class="vfd-dot" style="background:${domainColor(d)}"></span>
        <span class="vfd-name">${d.short}${flagged ? '<span class="vfd-flag">no $</span>' : ''}</span>
        <span class="vfd-amount ${totals[d.id] === 0 ? 'zero' : ''}">${totals[d.id] > 0 ? fmt(totals[d.id]) : hasGoals ? 'unfunded' : '—'}</span>
      </div>
    `;
    }).join('')}
    <div class="vfd-total">
      <span class="lbl">Total / mo</span>
      <span class="val">${fmt(grand)}</span>
    </div>
    ${alertHTML}
  `;
}

function updateFundIntro() {
  const dimensionsFunded = DOMAINS.filter(d =>
    state.dims[d.id].goals.some(g => monthlyCost(g.cost, g.costCycle) > 0 && g.from && g.to)
  ).length;
  const totalMonthly = DOMAINS.reduce((sum, d) =>
    sum + state.dims[d.id].goals.reduce((s, g) =>
      s + (g.from && g.to ? monthlyCost(g.cost, g.costCycle) : 0), 0), 0);
  document.getElementById('fund-stat-vision').textContent = fmt(totalMonthly);
  document.getElementById('fund-stat-sub').textContent = `across ${dimensionsFunded} dimension${dimensionsFunded === 1 ? '' : 's'}`;
}

// SLIDERS
function syncSliders() {
  document.getElementById('slider-needs').value = state.pcts.needs;
  document.getElementById('slider-wants').value = state.pcts.wants;
  document.getElementById('slider-savings').value = state.pcts.savings;
  document.getElementById('pct-needs').textContent = state.pcts.needs + '%';
  document.getElementById('pct-wants').textContent = state.pcts.wants + '%';
  document.getElementById('pct-savings').textContent = state.pcts.savings + '%';
  const total = state.pcts.needs + state.pcts.wants + state.pcts.savings;
  const warn = document.getElementById('slider-warning');
  if (total !== 100) {
    warn.textContent = total < 100 ? `${100 - total}% unallocated — your buckets don't sum to 100%.` : `Over-allocated by ${total - 100}% — your buckets exceed 100%.`;
  } else {
    warn.textContent = '';
  }
}
['needs', 'wants', 'savings'].forEach(bucket => {
  document.getElementById('slider-' + bucket).addEventListener('input', (e) => {
    state.pcts[bucket] = +e.target.value;
    syncSliders();
    renderBudgetOverview();
    persistState();
  });
});
document.getElementById('reset-pcts').addEventListener('click', () => {
  state.pcts = { needs: 50, wants: 30, savings: 20 };
  syncSliders();
  renderBudgetOverview();
  persistState();
});

document.getElementById('income-input').addEventListener('input', (e) => {
  state.income = Math.max(0, +e.target.value || 0);
  renderBudgetOverview();
  persistState();
});
document.getElementById('cycle').addEventListener('click', (e) => {
  const btn = e.target.closest('button'); if (!btn) return;
  document.querySelectorAll('#cycle button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active'); state.cycle = btn.dataset.cycle;
  persistState();
});
document.getElementById('add-btn').addEventListener('click', addExpense);
['exp-name', 'exp-amount'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') addExpense(); });
});
function addExpense() {
  const name = document.getElementById('exp-name').value.trim();
  const amount = +document.getElementById('exp-amount').value;
  const bucket = document.getElementById('exp-bucket').value;
  if (!name || !amount || amount <= 0) {
    const inp = document.getElementById('exp-name');
    inp.style.borderColor = 'var(--warn)';
    setTimeout(() => inp.style.borderColor = '', 1500);
    return;
  }
  state.expenses.push({ id: nextExpId++, name, amount, bucket, source: null });
  document.getElementById('exp-name').value = '';
  document.getElementById('exp-amount').value = '';
  persistState();
  renderBudget();
}

/* ═════════════════════════════════════════════════════════
   UTILS & BOOT
   ═════════════════════════════════════════════════════════ */
function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function setDateLine() {
  const d = new Date();
  const m = d.toLocaleString('en-US', { month: 'long' });
  document.getElementById('date-line').innerHTML = `Period · <strong>${m} ${d.getFullYear()}</strong>`;
}

const hadSavedData = loadState();

setDateLine();
buildWheel();
renderProgress();
updateNextCta();
renderDomainCards();
renderPatterns();
updateAutosaveIndicator();
if (hadSavedData) showRestoredToast();

/* Re-render when OS color scheme flips so wheel/chips pick up the new palette */
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    buildWheel();
    renderProgress();
    renderDomainCards();
    renderPatterns();
    if (state.activePane === 'fund') { renderBudget(); }
    if (state.activePane === 'actions') { renderTimeline(); }
    if (state.activePane === 'dimension') { renderWizard(); }
  });
}

/* ─── Restored-data toast & reset ─────────────────────────── */
function showRestoredToast() {
  const t = document.createElement('div');
  t.className = 'restore-toast';
  t.innerHTML = `<span>Your earlier work was restored from this browser.</span><button id="restore-dismiss">Got it</button>`;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  const close = () => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); };
  document.getElementById('restore-dismiss').addEventListener('click', close);
  setTimeout(close, 7000);
}

const resetBtn = document.getElementById('reset-all-data');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    const sure = confirm('Reset ALL data?\n\nThis permanently erases every dimension\'s reflections, scores, declarations, and focused actions — plus your budget — from this browser. This cannot be undone.\n\nTip: download a backup first if you might want this work back.');
    if (!sure) return;
    clearSavedState();
    state.activeIdx = 0; state.activeStep = 0;
    switchPane('overview');
    buildWheel(); renderProgress(); updateNextCta(); renderDomainCards(); renderPatterns();
    updateAutosaveIndicator();
  });
}

/* ═════════════════════════════════════════════════════════════════
   PER-DIMENSION RESET — clears one dimension's data only
   ═════════════════════════════════════════════════════════════════ */
const dimResetBtn = document.getElementById('dim-reset-btn');
if (dimResetBtn) {
  dimResetBtn.addEventListener('click', () => {
    const d = DOMAINS[state.activeIdx];
    const data = state.dims[d.id];
    const hasContent =
      data.iam.trim() ||
      data.score ||
      data.targetScore ||
      data.answers.some(a => a.trim()) ||
      data.goals.some(g => g.from || g.to || g.by);
    if (!hasContent) {
      // Nothing to clear; give a softer note
      const sp = document.getElementById('save-pill');
      if (sp) {
        const original = sp.textContent;
        sp.textContent = 'Already empty';
        setTimeout(() => { sp.textContent = original; }, 1400);
      }
      return;
    }
    const sure = confirm(
      `Reset ${d.label}?\n\n` +
      `This clears your reflections, score, "I am…" declaration, and focused actions for this dimension only. Your other nine dimensions and your budget are not touched.\n\n` +
      `This cannot be undone.`
    );
    if (!sure) return;
    state.dims[d.id] = freshDim();
    state.activeStep = 0;
    persistState();
    renderWizard();
    // Refresh anything that depends on this dimension
    buildWheel(); renderProgress(); renderDomainCards(); renderPatterns();
  });
}

/* ═════════════════════════════════════════════════════════════════
   JSON EXPORT / IMPORT — download a backup file; restore from one
   ═════════════════════════════════════════════════════════════════ */
function downloadJSONBackup() {
  const snapshot = {
    schema: 'harbor-compass-v1',
    exportedAt: new Date().toISOString(),
    dims: state.dims,
    income: state.income,
    cycle: state.cycle,
    pcts: state.pcts,
    expenses: state.expenses,
  };
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `harbor-compass-backup-${today}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  flashIndicator('Backup downloaded');
}

function restoreFromJSON(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed || !parsed.dims) {
        alert('That file does not look like a Harbor Compass backup. No changes were made.');
        return;
      }
      const sure = confirm(
        'Restore from this backup?\n\n' +
        'This will replace ALL of your current data — every dimension, focused action, and budget setting — with the contents of the backup file. Your current work will be overwritten.\n\n' +
        'Tip: download a backup of your current state first if you want a fallback.'
      );
      if (!sure) return;
      DOMAINS.forEach(d => {
        const sd = parsed.dims[d.id];
        state.dims[d.id] = sd ? {
          answers: Array.isArray(sd.answers) ? sd.answers : ['', '', ''],
          score: sd.score || 0,
          targetScore: sd.targetScore || 0,
          iam: sd.iam || '',
          goals: Array.isArray(sd.goals) ? sd.goals : [],
          savedAt: sd.savedAt || null,
        } : freshDim();
      });
      if (typeof parsed.income === 'number') state.income = parsed.income;
      if (parsed.cycle) state.cycle = parsed.cycle;
      if (parsed.pcts) state.pcts = parsed.pcts;
      if (Array.isArray(parsed.expenses)) state.expenses = parsed.expenses;
      persistState();
      state.activeIdx = 0; state.activeStep = 0;
      switchPane('overview');
      buildWheel(); renderProgress(); updateNextCta(); renderDomainCards(); renderPatterns();
      flashIndicator('Backup restored');
    } catch (err) {
      alert('Could not read that backup file — it may be corrupted or not a valid Harbor Compass backup. No changes were made.');
    }
  };
  reader.onerror = () => alert('Could not read that file.');
  reader.readAsText(file);
}

function flashIndicator(msg) {
  const ind = document.getElementById('autosave-indicator');
  if (!ind) return;
  const original = ind.textContent;
  ind.textContent = msg;
  ind.classList.add('flash');
  setTimeout(() => {
    ind.classList.remove('flash');
    updateAutosaveIndicator();
  }, 2400);
}

const dlBtn = document.getElementById('action-download-json');
if (dlBtn) dlBtn.addEventListener('click', downloadJSONBackup);

const importBtn = document.getElementById('action-import-json');
const importInput = document.getElementById('import-file-input');
if (importBtn && importInput) {
  importBtn.addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) restoreFromJSON(file);
    e.target.value = ''; // reset so re-picking the same file works
  });
}

/* ═════════════════════════════════════════════════════════════════
   PDF EXPORT — builds a polished print-only document, then window.print()
   The print stylesheet hides the live app and shows ONLY #print-document.
   The user can save as PDF from the browser's print dialog on any OS.
   ═════════════════════════════════════════════════════════════════ */
function buildPrintDocument() {
  const root = document.getElementById('print-document');
  if (!root) return;

  // Helpers
  const niceDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const dim = (id) => state.dims[id];
  const declared = DOMAINS.filter(d => dim(d.id).iam.trim());
  const scored = DOMAINS.filter(d => dim(d.id).score > 0);

  // Composed vision
  let composedVision;
  if (declared.length === 0) {
    composedVision = '<em>No declarations written yet.</em>';
  } else if (declared.length === 1) {
    composedVision = `I am ${escapeHtml(dim(declared[0].id).iam.trim())}.`;
  } else {
    const parts = declared.map(d => escapeHtml(dim(d.id).iam.trim()));
    const last = parts.pop();
    composedVision = `I am ${parts.join(', ')}, and ${last}.`;
  }

  // Build a static wheel SVG with current scores baked in
  const wheelSVG = buildPrintWheelSVG();

  // Average stats
  const avgNow = scored.length ? (scored.reduce((s, d) => s + dim(d.id).score, 0) / scored.length).toFixed(1) : '—';
  const withTarget = DOMAINS.filter(d => dim(d.id).targetScore > 0);
  const avgVision = withTarget.length ? (withTarget.reduce((s, d) => s + dim(d.id).targetScore, 0) / withTarget.length).toFixed(1) : '—';
  const totalActions = DOMAINS.reduce((n, d) => n + dim(d.id).goals.filter(g => g.from && g.to).length, 0);

  // Focused actions, sorted by date
  const actions = [];
  DOMAINS.forEach(d => {
    dim(d.id).goals.forEach(g => {
      if (g.from && g.to && g.by) actions.push({ ...g, dimension: d });
    });
  });
  actions.sort((a, b) => new Date(a.by) - new Date(b.by));

  // Budget
  const buckets = ['needs', 'wants', 'savings'];
  const visionExp = (() => {
    const out = [];
    DOMAINS.forEach(d => {
      dim(d.id).goals.forEach(g => {
        const m = monthlyCost(g.cost, g.costCycle);
        if (m > 0 && g.from && g.to) {
          out.push({
            name: g.to.length > 38 ? g.to.slice(0, 38) + '…' : g.to,
            amount: m, bucket: g.bucket, source: d.short,
          });
        }
      });
    });
    return out;
  })();
  const allExp = [...visionExp, ...state.expenses];
  const bucketSums = { needs: 0, wants: 0, savings: 0 };
  allExp.forEach(e => { bucketSums[e.bucket] = (bucketSums[e.bucket] || 0) + e.amount; });

  // ── Assemble document ──
  root.innerHTML = `
    <div class="pd-page pd-cover">
      <div class="pd-cover-mark">H</div>
      <div class="pd-cover-eyebrow">Harbor Compass</div>
      <h1 class="pd-cover-title">Your Whole-Life<br/><em>Vision &amp; Plan</em></h1>
      <div class="pd-cover-meta">
        <div>${niceDate}</div>
        <div>${declared.length} of 10 dimensions declared · ${totalActions} focused action${totalActions === 1 ? '' : 's'}</div>
      </div>
      <p class="pd-cover-note">
        This document was generated from your reflections in Harbor Compass. It is a private snapshot of how you described your life on this date — not a clinical or psychometric assessment. The numbers are your own subjective sense of each area; they will move with time. Read this aloud once a week. Revisit it as you grow.
      </p>
    </div>

    <div class="pd-page">
      <div class="pd-section-eyebrow">01 · The Whole Life</div>
      <h2 class="pd-section-title">My vision <em>· composed from ${declared.length} declarations</em></h2>
      <div class="pd-vision-card">
        <div class="pd-vision-iam">${composedVision}</div>
      </div>
      <div class="pd-wheel-row">
        <div class="pd-wheel">
          ${wheelSVG}
          <div class="pd-wheel-cap">Inner ring = current self-rating · Outer ring = 12-month vision</div>
        </div>
        <div class="pd-wheel-stats">
          <div class="pd-stat"><div class="pd-stat-num">${declared.length}<span>/10</span></div><div class="pd-stat-lbl">Voices declared</div></div>
          <div class="pd-stat"><div class="pd-stat-num">${avgNow}</div><div class="pd-stat-lbl">Average current</div></div>
          <div class="pd-stat"><div class="pd-stat-num">${avgVision}</div><div class="pd-stat-lbl">Average vision</div></div>
          <div class="pd-stat"><div class="pd-stat-num">${totalActions}</div><div class="pd-stat-lbl">Focused actions</div></div>
        </div>
      </div>
    </div>

    ${DOMAINS.map((d, i) => buildPrintDomainPage(d, i)).join('')}

    <div class="pd-page">
      <div class="pd-section-eyebrow">04 · The Path Forward</div>
      <h2 class="pd-section-title">Focused actions <em>· sorted by date</em></h2>
      ${actions.length === 0 ? `
        <p class="pd-empty">No focused actions written yet.</p>
      ` : `
        <table class="pd-actions">
          <thead><tr><th>Due</th><th>Dimension</th><th>Commitment</th><th>Cost</th></tr></thead>
          <tbody>
            ${actions.map(a => `
              <tr>
                <td class="pd-action-when">${formatDate(a.by)}</td>
                <td class="pd-action-dim"><span class="pd-dim-dot" style="background:${domainColor(a.dimension)}"></span>${a.dimension.short}</td>
                <td class="pd-action-text">From <strong>${escapeHtml(a.from)}</strong> to <strong>${escapeHtml(a.to)}</strong>.</td>
                <td class="pd-action-cost">${a.cost ? '$' + a.cost + '/' + a.costCycle.replace('-time', '') : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `}
    </div>

    <div class="pd-page">
      <div class="pd-section-eyebrow">05 · Fund the Life</div>
      <h2 class="pd-section-title">Budget <em>· money in service of your wheel</em></h2>
      <div class="pd-budget-summary">
        <div><strong>${fmt(state.income)}</strong> / month after-tax</div>
        <div>Allocation target: ${state.pcts.needs}% needs · ${state.pcts.wants}% wants · ${state.pcts.savings}% savings</div>
      </div>
      <table class="pd-budget">
        <thead><tr><th>Bucket</th><th>Target</th><th>Actual</th><th>Items</th></tr></thead>
        <tbody>
          ${buckets.map(b => {
            const target = state.income * (state.pcts[b] / 100);
            const items = allExp.filter(e => e.bucket === b);
            return `
              <tr>
                <td><strong>${b === 'savings' ? 'Savings & Debt' : b.charAt(0).toUpperCase() + b.slice(1)}</strong></td>
                <td>${fmt(target)}</td>
                <td>${fmt(bucketSums[b] || 0)}</td>
                <td>${items.length} item${items.length === 1 ? '' : 's'}</td>
              </tr>
              ${items.map(e => `
                <tr class="pd-budget-line">
                  <td></td><td></td>
                  <td>${escapeHtml(e.name)}${e.source ? ` <span class="pd-budget-source">${escapeHtml(e.source)} · vision</span>` : ''}</td>
                  <td>${fmt(e.amount)}</td>
                </tr>
              `).join('')}
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <div class="pd-footer">
      Harbor Compass · generated ${niceDate} · this is your private reflection, not a clinical assessment
    </div>
  `;
}

function buildPrintDomainPage(d, idx) {
  const data = state.dims[d.id];
  const hasAnything = data.iam.trim() || data.score || data.targetScore ||
    data.answers.some(a => a.trim()) || data.goals.some(g => g.from && g.to);
  if (!hasAnything) return '';
  const c = domainColor(d);
  const prompts = d.prompts || [];
  return `
    <div class="pd-page pd-domain">
      <div class="pd-section-eyebrow" style="color:${c}">02 · Dimension ${String(idx + 1).padStart(2, '0')}</div>
      <h2 class="pd-section-title" style="border-bottom-color:${c}">${escapeHtml(d.label)} <em>· ${escapeHtml(d.essence)}</em></h2>

      ${data.iam.trim() ? `
        <div class="pd-iam-block" style="border-left-color:${c}">
          <div class="pd-iam-label">My declaration</div>
          <div class="pd-iam-text">"I am ${escapeHtml(data.iam.trim())}."</div>
        </div>
      ` : ''}

      ${(data.score || data.targetScore) ? `
        <div class="pd-scores">
          <div class="pd-score">
            <div class="pd-score-lbl">Today</div>
            <div class="pd-score-num" style="color:${c}">${data.score || '—'}<span>/10</span></div>
          </div>
          <div class="pd-score">
            <div class="pd-score-lbl">12-month vision</div>
            <div class="pd-score-num" style="color:${c}">${data.targetScore || '—'}<span>/10</span></div>
          </div>
          ${(data.score && data.targetScore) ? `
            <div class="pd-score">
              <div class="pd-score-lbl">Gap</div>
              <div class="pd-score-num">${data.targetScore - data.score >= 0 ? '+' : ''}${data.targetScore - data.score}</div>
            </div>
          ` : ''}
        </div>
      ` : ''}

      ${data.answers.some(a => a.trim()) ? `
        <div class="pd-reflections">
          <div class="pd-subhead">Reflections</div>
          ${data.answers.map((a, i) => a.trim() ? `
            <div class="pd-reflection">
              <div class="pd-reflection-q">${escapeHtml(prompts[i] || `Reflection ${i + 1}`)}</div>
              <div class="pd-reflection-a">${escapeHtml(a.trim())}</div>
            </div>
          ` : '').join('')}
        </div>
      ` : ''}

      ${data.goals.some(g => g.from && g.to) ? `
        <div class="pd-goals">
          <div class="pd-subhead">Focused actions</div>
          ${data.goals.filter(g => g.from && g.to).map(g => `
            <div class="pd-goal">
              <div class="pd-goal-text">From <strong>${escapeHtml(g.from)}</strong> to <strong>${escapeHtml(g.to)}</strong>${g.by ? `, by <strong>${formatDate(g.by)}</strong>` : ''}.</div>
              ${g.cost ? `<div class="pd-goal-cost">$${g.cost}/${g.costCycle.replace('-time', '')} · ${g.bucket}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function buildPrintWheelSVG() {
  // A self-contained SVG with embedded fills (no CSS vars — PDFs need literal colors)
  const N = DOMAINS.length, angleStep = (Math.PI * 2) / N, innerR = 38, maxR = 130;
  let petals = '';
  let labels = '';
  DOMAINS.forEach((d, i) => {
    const data = state.dims[d.id];
    const a1 = -Math.PI / 2 + i * angleStep - angleStep / 2 + 0.03;
    const a2 = -Math.PI / 2 + i * angleStep + angleStep / 2 - 0.03;
    const mid = (a1 + a2) / 2;
    const color = domainColor(d);
    const targetR = data.targetScore > 0 ? innerR + (maxR - innerR) * (data.targetScore / 10) : maxR;
    petals += `<path d="${annularArc(innerR, targetR, a1, a2)}" fill="${color}" fill-opacity="0.32"/>`;
    if (data.score > 0) {
      const nowR = innerR + (maxR - innerR) * (data.score / 10);
      petals += `<path d="${annularArc(innerR, nowR, a1, a2)}" fill="${color}" fill-opacity="0.95"/>`;
    }
    const lr = maxR + 22;
    const lx = Math.cos(mid) * lr;
    const ly = Math.sin(mid) * lr;
    labels += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-family="Inter Tight, sans-serif" font-size="11" font-weight="500" fill="#212121">${d.short}</text>`;
  });
  return `<svg viewBox="-180 -180 360 360" xmlns="http://www.w3.org/2000/svg">${petals}<circle cx="0" cy="0" r="${innerR}" fill="none" stroke="#D4D4D4" stroke-width="1"/>${labels}</svg>`;
}

const pdfBtn = document.getElementById('action-export-pdf');
if (pdfBtn) {
  pdfBtn.addEventListener('click', () => {
    buildPrintDocument();
    // Let layout settle before opening the print dialog
    setTimeout(() => { window.print(); }, 50);
  });
}

/* Final safety save when leaving the page */
window.addEventListener('beforeunload', () => { try { persistState(); } catch (e) {} });