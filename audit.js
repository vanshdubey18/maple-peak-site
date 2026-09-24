(function () {
  'use strict';

  var TALLY_FORM_ID = 'PdKloe';
  var SAVED_KEY = 'mp-audit-report';
  var GUIDE_URL = 'https://tally.so/r/Me0N8k?source=audit';
  var CONTACT_URL = 'https://instagram.com/vanshdubeyy';
  var HOURS_PER_PERSON_YEAR = 1920;
  var WORKING_WEEKS = 48;

  var app = document.getElementById('auditApp');
  var progressFill = document.getElementById('auditProgress');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Reference data ----------

  var REGIONS = {
    IN: {
      label: 'India', currency: 'INR', locale: 'en-IN', rate: 200, borrow: 10,
      revenue: [
        { id: 'r0', label: 'Under ₹100 crore', seg: 'small' },
        { id: 'r1', label: '₹100–500 crore', seg: 'mid-lower' },
        { id: 'r2', label: '₹500–1,000 crore', seg: 'mid-upper' },
        { id: 'r3', label: '₹1,000–6,000 crore', seg: 'big' },
        { id: 'r4', label: '₹6,000 crore+', seg: 'enterprise' }
      ],
      owed: [
        { id: 'o0', label: 'Under ₹5 crore', v: 2.5e7 },
        { id: 'o1', label: '₹5–25 crore', v: 12e7 },
        { id: 'o2', label: '₹25–100 crore', v: 50e7 },
        { id: 'o3', label: '₹100–500 crore', v: 200e7 },
        { id: 'o4', label: '₹500 crore+', v: 500e7 },
        { id: 'ox', label: 'Not sure', v: null }
      ],
      erp: ['SAP S/4HANA or ECC', 'SAP Business One', 'Oracle / NetSuite', 'Microsoft Dynamics', 'Tally Prime', 'Zoho Books', 'Busy / Marg', 'Custom-built', 'Mostly Excel'],
      crm: ['Salesforce', 'HubSpot', 'Zoho CRM', 'LeadSquared', 'Microsoft Dynamics', 'None / spreadsheets']
    },
    US: {
      label: 'United States', currency: 'USD', locale: 'en-US', rate: 35, borrow: 10,
      revenue: [
        { id: 'r0', label: 'Under $10M', seg: 'small' },
        { id: 'r1', label: '$10–50M', seg: 'mid-lower' },
        { id: 'r2', label: '$50–250M', seg: 'mid-upper' },
        { id: 'r3', label: '$250M–1B', seg: 'big' },
        { id: 'r4', label: '$1B+', seg: 'enterprise' }
      ],
      owed: [
        { id: 'o0', label: 'Under $1M', v: 0.5e6 },
        { id: 'o1', label: '$1–5M', v: 2.5e6 },
        { id: 'o2', label: '$5–20M', v: 10e6 },
        { id: 'o3', label: '$20–100M', v: 40e6 },
        { id: 'o4', label: '$100M+', v: 100e6 },
        { id: 'ox', label: 'Not sure', v: null }
      ],
      erp: ['SAP', 'Oracle NetSuite', 'Microsoft Dynamics', 'QuickBooks', 'Sage / Intacct', 'Custom-built', 'Mostly Excel'],
      crm: ['Salesforce', 'HubSpot', 'Microsoft Dynamics', 'Zoho CRM', 'None / spreadsheets']
    }
  };

  var SEGMENTS = {
    'small': 'Small business',
    'mid-lower': 'Mid-size',
    'mid-upper': 'Mid-size (upper)',
    'big': 'Large',
    'enterprise': 'Enterprise'
  };

  var INDUSTRIES = ['Manufacturing', 'Distribution & trading', 'Pharma & healthcare', 'Real estate & construction', 'Logistics', 'Education', 'Retail & D2C', 'Professional services', 'Other'];
  var ROLES = ['MD / Owner / Founder', 'CFO / Finance head', 'COO / Operations head', 'Sales head', 'HR head', 'IT head', 'Other'];

  var PEOPLE = [
    { id: 'p1', label: '1–2', v: 1.5 },
    { id: 'p2', label: '3–5', v: 4 },
    { id: 'p3', label: '6–10', v: 8 },
    { id: 'p4', label: '11–25', v: 18 },
    { id: 'p5', label: '26–50', v: 38 },
    { id: 'p6', label: '50+', v: 50 }
  ];

  // share = part of the whole team's time the automations in this area could take over (conservative)
  var AREAS = {
    finance: { label: 'Finance & accounts', hint: 'Invoices, payments, collections', share: [0.25, 0.40] },
    sales: { label: 'Sales & enquiries', hint: 'Leads, quotes, follow-ups', share: [0.15, 0.30] },
    orders: { label: 'Orders & customer service', hint: 'Order entry, status, support', share: [0.25, 0.40] },
    procurement: { label: 'Procurement & vendors', hint: 'POs, approvals, supplier follow-ups', share: [0.20, 0.35] },
    dealers: { label: 'Dealers & distributors', hint: 'Dealer orders, schemes, claims', share: [0.20, 0.35] },
    hr: { label: 'HR & people', hint: 'Hiring, onboarding, staff queries', share: [0.15, 0.30] },
    reporting: { label: 'Management reporting', hint: 'MIS, month-end close, dashboards', share: [0.30, 0.50] },
    compliance: { label: 'Tax & compliance', labelIN: 'GST & statutory compliance', hint: 'Filings, reconciliations, deadlines', share: [0.20, 0.35] }
  };
  var AREA_ORDER = ['finance', 'sales', 'orders', 'procurement', 'dealers', 'hr', 'reporting', 'compliance'];

  var REPLY_SPEED = [
    { id: 's1', label: 'Within 5 minutes', slow: false },
    { id: 's2', label: 'Within an hour', slow: false },
    { id: 's3', label: 'Same day', slow: true },
    { id: 's4', label: 'Next day or later', slow: true }
  ];

  var WHY_REASONS = [
    { id: 'w1', label: 'The information is already in emails, PDFs or messages', kind: 'ai' },
    { id: 'w2', label: 'Our systems don\'t talk to each other, so data gets re-typed', kind: 'ai' },
    { id: 'w3', label: 'Volume keeps growing faster than the team', kind: 'ai' },
    { id: 'w4', label: 'Customers or staff can\'t see the status themselves', kind: 'ai' },
    { id: 'w5', label: 'It needs a judgement call every time', kind: 'front' },
    { id: 'w6', label: 'Everyone does it a slightly different way', kind: 'setup' },
    { id: 'w7', label: 'Only one or two people know how it\'s done', kind: 'setup' }
  ];

  var SCORE_QUESTIONS = [
    'Does it happen every day or every week?',
    'Is it mostly the same steps each time?',
    'Is the information already somewhere: a system, sheet, inbox or website?',
    'Is a person doing work a machine could take?',
    'If it were handled, would you get time or money back this month?'
  ];

  var CHECK_HOURS = [
    { id: 'h1', label: 'Under 5 hours', v: [2, 5] },
    { id: 'h2', label: '5–15 hours', v: [5, 15] },
    { id: 'h3', label: '15–40 hours', v: [15, 40] },
    { id: 'h4', label: '40–100 hours', v: [40, 100] },
    { id: 'h5', label: '100+ hours', v: [100, 100] }
  ];

  // Verdicts and wording follow the Point First guide.
  var VERDICTS = {
    needs_ai: { label: 'Needs AI', share: [0.5, 0.7],
      line: 'Same job, same steps, and the information already exists. A person shouldn\'t keep doing this by hand.' },
    ai_front: { label: 'Needs a person, with AI in front', share: [0.3, 0.5],
      line: 'A person still makes the final call. AI should do the first part: find it, sort it, draft it, remind and follow up.' },
    setup_first: { label: 'Needs setup, then AI', share: [0.25, 0.4],
      line: 'The job is slow, but the steps are messy or live in someone\'s head. Write the steps down first, then it needs AI too.' },
    person: { label: 'Mostly a person\'s job for now', share: [0.15, 0.3],
      line: 'It scored under 3 of 5. Keep it with a person, but AI can still sort, draft and remind.' }
  };

  var DAYS_TO_PAY = [
    { id: 'd1', label: 'Under 30 days', faster: [3, 7] },
    { id: 'd2', label: '30–60 days', faster: [7, 15] },
    { id: 'd3', label: '60–90 days', faster: [15, 25] },
    { id: 'd4', label: '90+ days', faster: [20, 35] },
    { id: 'dx', label: 'Not sure', faster: [7, 15] }
  ];

  var TIMELINE = [
    { id: 't1', label: 'This quarter' },
    { id: 't2', label: 'Within 6 months' },
    { id: 't3', label: 'Just exploring' }
  ];

  var DECIDER = [
    { id: 'k1', label: 'I decide' },
    { id: 'k2', label: 'Needs promoter or board approval' },
    { id: 'k3', label: 'IT team evaluates' },
    { id: 'k4', label: 'Not sure yet' }
  ];

  // job = how an owner names the manual work (Point step). types: time, cash, risk, revenue.
  var CATALOGUE = [
    { id: 'ap_capture', area: 'finance', w: 3, weeks: '3–6 weeks', types: ['time'],
      job: 'Typing supplier invoices into the system',
      title: 'Supplier invoice capture and three-way match',
      what: 'Reads supplier invoices from email or PDF, checks each against the PO and goods receipt, and posts matched ones into {erp}. People only handle the exceptions.' },
    { id: 'collections', area: 'finance', w: 3, weeks: '2–4 weeks', types: ['time', 'cash'],
      job: 'Chasing customers for payment',
      title: 'Collections on autopilot',
      what: 'Sends each customer reminders matched to their terms and payment history, shares statements, and tracks promised payment dates. Your team only calls the hard cases.' },
    { id: 'cash_app', area: 'finance', w: 2, weeks: '2–4 weeks', types: ['time', 'cash'],
      job: 'Matching incoming payments to invoices',
      title: 'Matching incoming payments to invoices',
      whatIN: 'Matches incoming NEFT, RTGS and UPI receipts to open invoices and posts them in {erp}, so outstanding balances are always current.',
      whatUS: 'Matches incoming ACH, wire, check and card payments to open invoices and posts them in {erp}, so outstanding balances are always current.' },
    { id: 'vendor_onboard', area: 'finance', w: 1, weeks: '2–3 weeks', types: ['time', 'risk'],
      job: 'Setting up and checking new suppliers',
      title: 'New supplier setup and checks',
      whatIN: 'Collects supplier documents and validates GSTIN, PAN, bank details and MSME status before a vendor goes live.',
      whatUS: 'Collects W-9, banking and insurance details from new suppliers and validates them before a vendor goes live.' },
    { id: 'ledger_recon', area: 'finance', w: 1, weeks: '2–3 weeks', types: ['time'],
      job: 'Reconciling customer ledgers',
      title: 'Customer ledger reconciliation',
      what: 'Prepares balance confirmations and flags mismatches between your books and customer statements before they turn into disputes.' },
    { id: 'msme45', area: 'finance', region: 'IN', w: 1, weeks: '1–2 weeks', types: ['risk'],
      title: 'MSME 45-day payment tracker',
      whatIN: 'Flags invoices from micro and small suppliers as they approach 45 days, so late payments don\'t cost you the tax deduction.' },

    { id: 'speed_lead', area: 'sales', w: 3, weeks: '2–4 weeks', types: ['revenue', 'time'],
      job: 'First reply to new enquiries',
      title: 'Instant reply and routing for every enquiry',
      whatIN: 'Replies within a minute to enquiries from your website, IndiaMART and WhatsApp, qualifies them, and routes each one to the right salesperson.',
      whatUS: 'Replies within a minute to web forms, ad leads and emails, qualifies them, and routes each one to the right rep.' },
    { id: 'quotes', area: 'sales', w: 2, weeks: '3–5 weeks', types: ['time', 'revenue'],
      job: 'Writing quotes, proposals and tenders',
      title: 'Quote, proposal and tender drafting',
      what: 'Drafts quotes, proposals and tender or RFP responses from your past documents and price lists, ready for your team to review.' },
    { id: 'crm_log', area: 'sales', w: 1, weeks: '2–3 weeks', types: ['time'],
      job: 'Updating the CRM after calls and emails',
      title: 'A CRM that updates itself',
      what: 'Logs calls, emails and messages into {crm} automatically and reminds reps of their next step, so the pipeline is always accurate.' },

    { id: 'po_to_so', area: 'orders', w: 3, weeks: '3–5 weeks', types: ['time', 'risk'],
      job: 'Entering customer POs as sales orders',
      title: 'Customer POs straight into {erp}',
      whatIN: 'Reads purchase orders from email, PDF or WhatsApp, creates the sales order in {erp}, and checks credit limits before it\'s confirmed.',
      whatUS: 'Reads purchase orders from email, PDF or portals, creates the sales order in {erp}, and checks credit limits before it\'s confirmed.' },
    { id: 'support_ai', area: 'orders', w: 2, weeks: '3–5 weeks', types: ['time'],
      job: 'Answering the same customer questions',
      title: 'Customer service assistant',
      whatIN: 'Answers routine customer questions in English and Hindi, sorts tickets, and hands the rest to your team with full context.',
      whatUS: 'Answers routine customer questions, sorts tickets, and hands the rest to your team with full context.' },
    { id: 'order_updates', area: 'orders', w: 1, weeks: '1–3 weeks', types: ['time'],
      job: 'Giving order and dispatch updates',
      title: 'Automatic order and dispatch updates',
      what: 'Tells customers when orders are confirmed, dispatched and delivered, cutting the "where is my order?" calls.' },

    { id: 'po_approvals', area: 'procurement', w: 2, weeks: '2–4 weeks', types: ['time'],
      job: 'Chasing PO approvals and supplier deliveries',
      title: 'PO approvals and supplier follow-ups',
      what: 'Routes purchase requests to the right approver and chases suppliers on delivery dates automatically.' },
    { id: 'contracts', area: 'procurement', w: 1, weeks: '3–5 weeks', types: ['risk'],
      job: 'Tracking contract terms and renewals',
      title: 'Contract review and renewal alerts',
      what: 'Pulls key terms, obligations and renewal dates out of contracts and alerts you before anything lapses or auto-renews.' },

    { id: 'dealer_orders', area: 'dealers', w: 3, weeks: '3–5 weeks', types: ['time'],
      job: 'Entering dealer orders',
      title: 'Dealer orders straight into {erp}',
      whatIN: 'Lets dealers place orders on WhatsApp and creates them in {erp} without anyone re-typing them.',
      whatUS: 'Lets dealers place orders by email or portal and creates them in {erp} without anyone re-typing them.' },
    { id: 'claims', area: 'dealers', w: 2, weeks: '3–6 weeks', types: ['time', 'risk'],
      job: 'Checking scheme and claim requests',
      title: 'Scheme and claim processing',
      what: 'Checks dealer claims against scheme rules and actual sales, flags leakage, and prepares approvals.' },
    { id: 'secondary', area: 'dealers', w: 1, weeks: '2–4 weeks', types: ['time'],
      job: 'Collecting distributor stock and sales reports',
      title: 'Distributor stock and sales reporting',
      what: 'Collects distributor stock and sell-through data automatically and turns it into one weekly view.' },

    { id: 'hiring', area: 'hr', w: 2, weeks: '2–4 weeks', types: ['time'],
      job: 'Screening candidates and scheduling interviews',
      title: 'Candidate screening and interview scheduling',
      what: 'Screens applications against the role, shortlists the strongest, and books interviews without the email back-and-forth.' },
    { id: 'hr_help', area: 'hr', w: 2, weeks: '3–5 weeks', types: ['time'],
      job: 'Onboarding joiners and answering HR questions',
      title: 'Onboarding and HR helpdesk',
      what: 'Runs new-joiner paperwork and answers staff questions on policies, leave and payslips.' },
    { id: 'knowledge', area: 'hr', w: 1, weeks: '3–5 weeks', types: ['time'],
      job: 'Answering "how do we do this?" questions',
      title: 'Internal knowledge assistant',
      what: 'Answers staff questions instantly from your SOPs, policies and contracts, so seniors stop being the help desk.' },

    { id: 'mis', area: 'reporting', w: 3, weeks: '3–6 weeks', types: ['time'],
      job: 'Building MIS and management reports',
      title: 'One management view across every branch',
      what: 'Pulls numbers from {erp}, {crm} and spreadsheets into a daily summary and a consolidated MIS across every branch and plant.' },
    { id: 'close', area: 'reporting', w: 2, weeks: '4–8 weeks', types: ['time', 'risk'],
      job: 'Closing the books each month',
      title: 'Faster month-end close',
      what: 'Automates reconciliations and the close checklist so the books close in days, not weeks.' },

    { id: 'gstr2b', area: 'compliance', region: 'IN', w: 3, weeks: '3–5 weeks', types: ['time', 'risk'],
      job: 'Matching GSTR-2B with purchase records',
      title: 'GST input-credit matching',
      whatIN: 'Matches GSTR-2B against your purchase register every month and chases suppliers for missing filings, protecting your input tax credit.' },
    { id: 'einvoice', area: 'compliance', region: 'IN', w: 2, weeks: '1–2 weeks', types: ['risk'],
      job: 'Tracking e-invoice deadlines',
      title: 'E-invoice 30-day monitor',
      whatIN: 'Watches every invoice across all your GSTINs and alerts before the 30-day IRN window closes, since a missed invoice can\'t be registered later.' },
    { id: 'tds', area: 'compliance', region: 'IN', w: 1, weeks: '2–3 weeks', types: ['time', 'risk'],
      job: 'Preparing TDS and GST filings',
      title: 'Compliance calendar and filing prep',
      whatIN: 'Tracks TDS, GST and statutory due dates across entities and prepares the working files before each deadline.' },
    { id: 'us_tax', area: 'compliance', region: 'US', w: 3, weeks: '2–4 weeks', types: ['time', 'risk'],
      job: 'Preparing sales-tax and 1099 filings',
      title: 'Sales-tax and 1099 compliance prep',
      whatUS: 'Collects vendor W-9s, tracks 1099 eligibility, and prepares sales-tax working files by state before each deadline.' }
  ];

  // ---------- State ----------

  var state = {
    country: detectCountry(),
    industry: null, revenue: null, role: null,
    areas: [], people: {}, speed: null,
    job: null, why: [], score: [null, null, null, null, null], check: null,
    owed: null, days: null,
    erp: null, crm: null,
    timeline: null, decider: null,
    rate: null, borrow: null
  };

  var params = new URLSearchParams(window.location.search);
  var utm = {
    source: params.get('source') || 'site',
    utm_source: params.get('utm_source') || (/instagram\./i.test(document.referrer) ? 'instagram' : ''),
    utm_campaign: params.get('utm_campaign') || ''
  };

  var screenIndex = 0;
  var unlocked = false;

  function detectCountry() {
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    if (/^Asia\/(Kolkata|Calcutta)$/.test(tz) || /-IN$/i.test(navigator.language || '')) return 'IN';
    return 'US';
  }

  function region() { return REGIONS[state.country]; }
  function revenueBand() { return findById(region().revenue, state.revenue); }
  function segment() { var r = revenueBand(); return r ? r.seg : null; }
  function areaLabel(id) { var a = AREAS[id]; return (state.country === 'IN' && a.labelIN) || a.label; }
  function findById(list, id) { for (var i = 0; i < list.length; i++) { if (list[i].id === id) return list[i]; } return null; }
  function eligible(c) { return !c.region || c.region === state.country; }
  function jobItem() { return findById(CATALOGUE, state.job); }
  function peopleIn(areaId) { return (findById(PEOPLE, state.people[areaId]) || PEOPLE[0]).v; }
  function scoreCount() { return state.score.filter(function (s) { return s === 'y'; }).length; }

  function verdictId() {
    if (scoreCount() < 3) return 'person';
    var kinds = state.why.map(function (id) { return findById(WHY_REASONS, id).kind; });
    if (kinds.indexOf('setup') !== -1) return 'setup_first';
    if (kinds.indexOf('front') !== -1) return 'ai_front';
    return 'needs_ai';
  }

  function showsMoney() {
    return state.areas.indexOf('finance') !== -1 || ['collections', 'cash_app', 'ledger_recon'].indexOf(state.job) !== -1;
  }

  // ---------- Screens ----------

  var STEP_TAGS = {
    map: 'Step 1 · Map', people: 'Step 1 · Map', point: 'Step 2 · Point', why: 'Step 3 · Why',
    score: 'Step 4 · Score', check: 'Step 5 · Check'
  };

  function buildScreens() {
    var screens = ['intro', 'industry', 'revenue', 'role', 'map', 'people', 'point', 'why', 'score', 'check'];
    if (showsMoney()) screens.push('money');
    screens.push('systems', 'timeline');
    return screens;
  }

  function render() {
    var screens = buildScreens();
    var name = screens[screenIndex];
    var questionCount = screens.length - 1;
    setProgress(screenIndex === 0 ? 0 : Math.pow(screenIndex / questionCount, 0.6));

    var html = '';
    if (name === 'intro') html = introScreen();
    else if (name === 'industry') html = singleScreen('What kind of business do you run?', null, 'industry', INDUSTRIES.map(asOption), true);
    else if (name === 'revenue') html = singleScreen('What is your annual revenue?', 'This decides which recommendations fit your size.', 'revenue', region().revenue.map(function (r) { return { id: r.id, label: r.label }; }));
    else if (name === 'role') html = singleScreen('What is your role?', 'So the report speaks to what you own.', 'role', ROLES.map(asOption));
    else if (name === 'map') html = mapScreen();
    else if (name === 'people') html = peopleScreen();
    else if (name === 'point') html = pointScreen();
    else if (name === 'why') html = whyScreen();
    else if (name === 'score') html = scoreScreen();
    else if (name === 'check') html = checkScreen();
    else if (name === 'money') html = moneyScreen();
    else if (name === 'systems') html = systemsScreen();
    else if (name === 'timeline') html = timelineScreen();

    var tag = STEP_TAGS[name] ? '<span class="audit-steptag">' + STEP_TAGS[name] + '</span>' : '';
    app.innerHTML = '<section class="audit-screen" tabindex="-1">' + stepLabel(screenIndex, questionCount) + tag + html + '</section>';
    bindScreen();
    focusScreen();
  }

  function stepLabel(i, total) {
    return i === 0 ? '' : '<span class="audit-step">Question ' + i + ' of ' + total + '</span>';
  }

  function asOption(label) { return { id: label, label: label }; }

  function optionButtons(key, options, value, multi, compact) {
    return '<div class="audit-options' + (compact ? ' is-compact' : '') + '" role="group">' +
      options.map(function (o) {
        var pressed = multi ? value.indexOf(o.id) !== -1 : value === o.id;
        return '<button type="button" class="audit-option" data-key="' + key + '" data-id="' + esc(o.id) + '" aria-pressed="' + pressed + '">' +
          esc(o.label) + (o.hint ? '<span class="audit-option-hint">' + esc(o.hint) + '</span>' : '') + '</button>';
      }).join('') + '</div>';
  }

  function navButtons(showNext, canNext, nextLabel) {
    return '<div class="audit-nav">' +
      (screenIndex > 0 ? '<button type="button" class="audit-back" data-action="back">← Back</button>' : '<span></span>') +
      (showNext ? '<button type="button" class="btn btn-solid audit-next" data-action="next"' + (canNext ? '' : ' disabled') + '>' + (nextLabel || 'Continue →') + '</button>' : '') +
      '</div>';
  }

  function introScreen() {
    var steps = [
      ['Map', 'Where the manual work happens'],
      ['Point', 'Circle the one job stealing the most hours'],
      ['Why', 'Ask why it keeps happening, twice'],
      ['Score', 'Five yes-or-no questions'],
      ['Check', 'Put a number on it'],
      ['Repeat', 'Your next jobs, ranked']
    ];
    return '<span class="audit-step">Free · 3–4 minutes · Taps, no typing</span>' +
      '<h1 class="audit-title">The Point First Audit</h1>' +
      '<p class="audit-sub">Find the first job in your company worth automating, what it\'s worth each year, and what comes next. Built on Point First, our six-step method.</p>' +
      '<ol class="audit-intro-points">' + steps.map(function (s, i) {
        return '<li><strong>' + (i + 1) + '</strong><span><b>' + s[0] + '.</b> ' + s[1] + '</span></li>';
      }).join('') + '</ol>' +
      '<button type="button" class="btn btn-solid" data-action="next">Start the audit →</button>' +
      '<p class="audit-fineprint">Every number is built from your answers, with the working shown. Nothing is saved while you answer.</p>';
  }

  function singleScreen(title, sub, key, options, withCountry) {
    return (withCountry ? countryToggle() : '') +
      '<h1 class="audit-title">' + esc(title) + '</h1>' +
      (sub ? '<p class="audit-sub">' + esc(sub) + '</p>' : '') +
      optionButtons(key, options, state[key], false) +
      navButtons(false);
  }

  function countryToggle() {
    return '<div class="audit-country" role="group" aria-label="Country">' +
      ['IN', 'US'].map(function (c) {
        return '<button type="button" data-country="' + c + '" aria-pressed="' + (state.country === c) + '">' + (c === 'IN' ? 'India ₹' : 'US $') + '</button>';
      }).join('') + '</div>';
  }

  function mapScreen() {
    var options = AREA_ORDER.map(function (id) { return { id: id, label: areaLabel(id), hint: AREAS[id].hint }; });
    return '<h1 class="audit-title">Where does manual work pile up?</h1>' +
      '<p class="audit-sub">Think about what your teams actually did yesterday, not what the process says. Pick up to 3 areas.</p>' +
      optionButtons('areas', options, state.areas, true) +
      navButtons(true, state.areas.length > 0);
  }

  function peopleScreen() {
    var html = '<h1 class="audit-title">How many people work in each?</h1><p class="audit-sub">Rough numbers are fine.</p>';
    var complete = true;
    state.areas.forEach(function (id) {
      html += '<div class="audit-group"><span class="audit-group-label">' + esc(areaLabel(id)) + '</span>' + optionButtons('people:' + id, PEOPLE, state.people[id], false, true) + '</div>';
      if (!state.people[id]) complete = false;
    });
    if (state.areas.indexOf('sales') !== -1) {
      html += '<div class="audit-group"><span class="audit-group-label">How fast does sales usually reply to a new enquiry?</span>' + optionButtons('speed', REPLY_SPEED, state.speed, false, true) + '</div>';
      if (!state.speed) complete = false;
    }
    return html + navButtons(true, complete);
  }

  function pointScreen() {
    var options = [];
    state.areas.forEach(function (id) {
      CATALOGUE.forEach(function (c) {
        if (c.area === id && c.job && eligible(c)) options.push({ id: c.id, label: c.job, hint: areaLabel(id) });
      });
    });
    return '<h1 class="audit-title">Circle the one job stealing the most hours.</h1>' +
      '<p class="audit-sub">Just one. The job that repeats the most and wastes the most time or money this week.</p>' +
      optionButtons('job', options, state.job, false) + navButtons(false);
  }

  function whyScreen() {
    var j = jobItem();
    return '<h1 class="audit-title">Why does it keep happening?</h1>' +
      '<p class="audit-sub">Ask why, then ask why again. Pick up to 2 reasons for "' + esc(j ? j.job.toLowerCase() : 'this job') + '".</p>' +
      optionButtons('why', WHY_REASONS, state.why, true) +
      navButtons(true, state.why.length > 0);
  }

  function scoreScreen() {
    var html = '<h1 class="audit-title">Score it. Five yes or no questions.</h1>' +
      '<p class="audit-sub">Three or more yeses means this job needs AI.</p>';
    SCORE_QUESTIONS.forEach(function (q, i) {
      html += '<div class="audit-group audit-score-row"><span class="audit-group-label">' + (i + 1) + '. ' + esc(q) + '</span>' +
        optionButtons('score:' + i, [{ id: 'y', label: 'Yes' }, { id: 'n', label: 'No' }], state.score[i], false, true) + '</div>';
    });
    return html + navButtons(true, state.score.indexOf(null) === -1);
  }

  function checkScreen() {
    var j = jobItem();
    return '<h1 class="audit-title">Put a number on it.</h1>' +
      '<p class="audit-sub">Roughly how many hours a week does your team spend on "' + esc(j ? j.job.toLowerCase() : 'this job') + '"? Most owners guess low, so round up.</p>' +
      optionButtons('check', CHECK_HOURS, state.check, false) + navButtons(false);
  }

  function moneyScreen() {
    var r = region();
    return '<h1 class="audit-title">How much do customers owe you right now?</h1>' +
      '<p class="audit-sub">Money stuck with customers has a real cost. This lets us value faster collections.</p>' +
      '<div class="audit-group"><span class="audit-group-label">Total outstanding from customers</span>' + optionButtons('owed', r.owed, state.owed, false, true) + '</div>' +
      '<div class="audit-group"><span class="audit-group-label">How long customers typically take to pay</span>' + optionButtons('days', DAYS_TO_PAY, state.days, false, true) + '</div>' +
      navButtons(true, !!(state.owed && state.days));
  }

  function systemsScreen() {
    var r = region();
    return '<h1 class="audit-title">Which systems do you run on?</h1>' +
      '<p class="audit-sub">So the recommendations connect to what you already use.</p>' +
      '<div class="audit-group"><span class="audit-group-label">Accounting / ERP</span>' + optionButtons('erp', r.erp.map(asOption), state.erp, false, true) + '</div>' +
      '<div class="audit-group"><span class="audit-group-label">CRM</span>' + optionButtons('crm', r.crm.map(asOption), state.crm, false, true) + '</div>' +
      navButtons(true, !!(state.erp && state.crm));
  }

  function timelineScreen() {
    return '<h1 class="audit-title">Last one. How soon do you want to act?</h1>' +
      '<div class="audit-group"><span class="audit-group-label">Timeline</span>' + optionButtons('timeline', TIMELINE, state.timeline, false, true) + '</div>' +
      '<div class="audit-group"><span class="audit-group-label">Who signs off on a project like this?</span>' + optionButtons('decider', DECIDER, state.decider, false, true) + '</div>' +
      navButtons(true, !!(state.timeline && state.decider), 'See my results →');
  }

  function bindScreen() {
    app.querySelectorAll('.audit-option').forEach(function (btn) {
      btn.addEventListener('click', function () { choose(btn.dataset.key, btn.dataset.id); });
    });
    app.querySelectorAll('[data-country]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (state.country === btn.dataset.country) return;
        state.country = btn.dataset.country;
        state.revenue = null; state.erp = null; state.crm = null; state.owed = null;
        if (state.job && !eligible(jobItem())) state.job = null;
        render();
      });
    });
    var back = app.querySelector('[data-action="back"]');
    if (back) back.addEventListener('click', function () { screenIndex = Math.max(0, screenIndex - 1); render(); });
    var next = app.querySelector('[data-action="next"]');
    if (next) next.addEventListener('click', goNext);
  }

  function toggle(list, id, max) {
    var i = list.indexOf(id);
    if (i !== -1) list.splice(i, 1);
    else if (list.length < max) list.push(id);
  }

  function choose(key, id) {
    var autoAdvance = false;
    if (key === 'areas') {
      toggle(state.areas, id, 3);
      state.areas.sort(function (a, b) { return AREA_ORDER.indexOf(a) - AREA_ORDER.indexOf(b); });
      if (state.job && state.areas.indexOf(jobItem().area) === -1) state.job = null;
    } else if (key === 'why') {
      toggle(state.why, id, 2);
    } else if (key.indexOf('people:') === 0) {
      state.people[key.slice(7)] = id;
    } else if (key.indexOf('score:') === 0) {
      state.score[+key.slice(6)] = id;
    } else {
      state[key] = id;
      autoAdvance = ['industry', 'revenue', 'role', 'job', 'check'].indexOf(key) !== -1;
    }
    render();
    if (autoAdvance) window.setTimeout(goNext, reduceMotion ? 0 : 180);
  }

  function goNext() {
    var screens = buildScreens();
    if (screenIndex >= screens.length - 1) { analyse(); return; }
    screenIndex++;
    render();
    window.scrollTo(0, 0);
  }

  function focusScreen() {
    var s = app.querySelector('.audit-screen');
    if (s) s.focus({ preventScroll: true });
  }

  function setProgress(p) { progressFill.style.width = Math.round(p * 100) + '%'; }

  // ---------- Engine ----------

  function computeResults() {
    var r = region();
    var rate = state.rate != null ? state.rate : r.rate;
    var borrow = (state.borrow != null ? state.borrow : r.borrow) / 100;
    var first = jobItem();
    var verdict = VERDICTS[verdictId()];
    var items = [];

    // Step 5 (Check): the owner's own number for the job they pointed at, capped at the team's working hours.
    var checkBand = findById(CHECK_HOURS, state.check) || CHECK_HOURS[0];
    var capacity = peopleIn(first.area) * 40;
    var weekLow = Math.min(checkBand.v[0], capacity);
    var weekHigh = Math.min(checkBand.v[1], capacity);
    var firstItem = {
      c: first, area: first.area, people: peopleIn(first.area), isFirst: true,
      weekLow: weekLow, weekHigh: weekHigh,
      hoursLow: weekLow * WORKING_WEEKS * verdict.share[0],
      hoursHigh: weekHigh * WORKING_WEEKS * verdict.share[1],
      cashLow: 0, cashHigh: 0
    };
    items.push(firstItem);

    // Step 6 (Repeat): the rest of each mapped area, valued from team size, minus what the first job already takes.
    state.areas.forEach(function (areaId) {
      var a = AREAS[areaId];
      var people = peopleIn(areaId);
      var poolLow = people * HOURS_PER_PERSON_YEAR * a.share[0];
      var poolHigh = people * HOURS_PER_PERSON_YEAR * a.share[1];
      if (areaId === first.area) {
        poolLow = Math.max(0, poolLow - firstItem.hoursLow);
        poolHigh = Math.max(0, poolHigh - firstItem.hoursHigh);
      }
      var rest = CATALOGUE.filter(function (c) { return c.area === areaId && eligible(c) && c.id !== first.id; });
      var savesTime = function (c) { return c.types.indexOf('time') !== -1; };
      var weightSum = rest.filter(savesTime).reduce(function (s, c) { return s + c.w; }, 0);
      rest.forEach(function (c) {
        var f = savesTime(c) && weightSum ? c.w / weightSum : 0;
        items.push({ c: c, area: areaId, people: people, hoursLow: poolLow * f, hoursHigh: poolHigh * f, cashLow: 0, cashHigh: 0 });
      });
    });

    var owedBand = showsMoney() ? findById(r.owed, state.owed) : null;
    var daysBand = findById(DAYS_TO_PAY, state.days);
    var totals = { cashLow: 0, cashHigh: 0 };
    if (owedBand && owedBand.v) {
      totals.cashLow = owedBand.v * daysBand.faster[0] / 365 * borrow;
      totals.cashHigh = owedBand.v * daysBand.faster[1] / 365 * borrow;
      [['collections', 0.7], ['cash_app', 0.3]].forEach(function (pair) {
        var existing = items.filter(function (x) { return x.c.id === pair[0]; })[0];
        if (!existing) {
          existing = { c: findById(CATALOGUE, pair[0]), area: 'finance', people: 0, hoursLow: 0, hoursHigh: 0 };
          items.push(existing);
        }
        existing.cashLow = totals.cashLow * pair[1];
        existing.cashHigh = totals.cashHigh * pair[1];
      });
    }

    var speed = findById(REPLY_SPEED, state.speed);
    var slowReply = !!(speed && speed.slow);

    items.forEach(function (x) {
      x.timeLow = x.hoursLow * rate;
      x.timeHigh = x.hoursHigh * rate;
      x.valueLow = x.timeLow + (x.cashLow || 0);
      x.valueHigh = x.timeHigh + (x.cashHigh || 0);
      x.score = (x.valueLow + x.valueHigh) / 2 * (x.c.id === 'speed_lead' && slowReply ? 1.8 : 1) + x.c.w;
    });
    var rest = items.filter(function (x) { return !x.isFirst; });
    rest.sort(function (a, b) { return b.score - a.score; });
    items = [firstItem].concat(rest);

    totals.hoursLow = items.reduce(function (s, x) { return s + x.hoursLow; }, 0);
    totals.hoursHigh = items.reduce(function (s, x) { return s + x.hoursHigh; }, 0);
    totals.timeLow = totals.hoursLow * rate;
    totals.timeHigh = totals.hoursHigh * rate;
    totals.low = totals.timeLow + totals.cashLow;
    totals.high = totals.timeHigh + totals.cashHigh;
    totals.fteLow = totals.hoursLow / HOURS_PER_PERSON_YEAR;
    totals.fteHigh = totals.hoursHigh / HOURS_PER_PERSON_YEAR;

    return { items: items, first: firstItem, verdict: verdict, totals: totals, rate: rate, borrow: borrow * 100,
      owedBand: owedBand, daysBand: daysBand, slowReply: slowReply, checkBand: checkBand, capacity: capacity };
  }

  // ---------- Formatting ----------

  function unitFor(n) {
    if (state.country === 'IN') {
      if (n >= 1e7) return { div: 1e7, suffix: ' crore' };
      if (n >= 1e5) return { div: 1e5, suffix: ' lakh' };
      return null;
    }
    if (n >= 1e6) return { div: 1e6, suffix: 'M' };
    if (n >= 1e3) return { div: 1e3, suffix: 'K' };
    return null;
  }

  function sym() { return state.country === 'IN' ? '₹' : '$'; }

  function trim(n) {
    var s = n >= 100 ? Math.round(n).toString() : n >= 10 ? n.toFixed(0) : n.toFixed(1);
    return s.replace(/\.0$/, '');
  }

  function money(n) {
    var u = unitFor(n);
    if (!u) return new Intl.NumberFormat(region().locale, { style: 'currency', currency: region().currency, maximumFractionDigits: 0 }).format(Math.round(n));
    return sym() + trim(n / u.div) + u.suffix;
  }

  function moneyRange(lo, hi) {
    if (hi <= 0) return money(0);
    var u = unitFor(hi);
    if (u && lo / u.div >= 0.1) {
      var a = trim(lo / u.div), b = trim(hi / u.div);
      return a === b ? sym() + a + u.suffix : sym() + a + '–' + b + u.suffix;
    }
    return money(lo) + '–' + money(hi);
  }

  function num(n) { return new Intl.NumberFormat(region().locale).format(Math.round(n)); }
  function range(a, b) { return num(a) === num(b) ? num(a) : num(a) + '–' + num(b); }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function fill(text) {
    var erp = state.erp && state.erp !== 'Mostly Excel' ? state.erp : 'your accounting system';
    var crm = state.crm && state.crm !== 'None / spreadsheets' ? state.crm : 'your CRM';
    return text.replace(/\{erp\}/g, erp).replace(/\{crm\}/g, crm);
  }

  function whatOf(c) { return fill((state.country === 'IN' ? c.whatIN : c.whatUS) || c.what); }
  function lcFirst(s) { return /^[A-Z]{2}/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1); }

  // ---------- Analysing ----------

  function analyse() {
    setProgress(1);
    var res = computeResults();
    var steps = [
      'Mapping ' + state.areas.length + ' area' + (state.areas.length > 1 ? 's' : '') + ' and ' + num(state.areas.reduce(function (s, a) { return s + peopleIn(a); }, 0)) + ' people',
      'Scoring your first job: ' + scoreCount() + ' of 5',
      'Checking your number: ' + res.checkBand.label.toLowerCase() + ' a week',
      'Matching the rest against ' + CATALOGUE.filter(eligible).length + ' automations'
    ];
    if (res.totals.cashHigh > 0) steps.push('Valuing cash tied up with customers');
    steps.push('Ranking your next jobs');

    app.innerHTML = '<section class="audit-screen" tabindex="-1"><h1 class="audit-title">Building your Point First Audit…</h1>' +
      '<ul class="audit-analysing">' + steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></section>';
    focusScreen();
    window.scrollTo(0, 0);
    var lis = app.querySelectorAll('.audit-analysing li');
    var delay = reduceMotion ? 80 : 650;
    lis.forEach(function (li, i) { window.setTimeout(function () { li.classList.add('is-done'); }, delay * (i + 1)); });
    window.setTimeout(function () { renderResults(false); }, delay * (lis.length + 1));
  }

  // ---------- Results ----------

  function summaryBlock(res) {
    var t = res.totals;
    var rows = '<div><dt>Team time freed each year</dt><dd>' + range(t.hoursLow, t.hoursHigh) + ' hrs</dd></div>' +
      '<div><dt>Equal to about</dt><dd>' + trim(t.fteLow) + '–' + trim(t.fteHigh) + ' full-time people</dd></div>' +
      '<div><dt>Value of that time</dt><dd>' + moneyRange(t.timeLow, t.timeHigh) + '</dd></div>';
    if (t.cashHigh > 0) rows += '<div><dt>Saved by collecting cash faster</dt><dd>' + moneyRange(t.cashLow, t.cashHigh) + '</dd></div>';
    if (res.items.some(function (x) { return x.c.types.indexOf('risk') !== -1; })) rows += '<div><dt>Compliance risk</dt><dd>Reduced</dd></div>';
    return '<div class="audit-summary">' +
      '<span class="audit-summary-label">Estimated value each year</span>' +
      '<span class="audit-summary-value">' + moneyRange(t.low, t.high) + '</span>' +
      '<span class="audit-summary-note">' + esc(SEGMENTS[segment()] || '') + ' · ' + esc(state.industry || '') + ' · ' + esc(state.areas.map(areaLabel).join(', ')) + '</span>' +
      '<dl class="audit-breakdown">' + rows + '</dl></div>';
  }

  function firstJobBlock(res) {
    var f = res.first;
    var whyLabels = state.why.map(function (id) { return findById(WHY_REASONS, id).label; });
    var rows = [
      ['Map', state.areas.map(function (a) { return areaLabel(a) + ' (' + findById(PEOPLE, state.people[a]).label + ' people)'; }).join(', ')],
      ['Point', f.c.job],
      ['Why', whyLabels.join('. ') + '.'],
      ['Score', scoreCount() + ' of 5 yes'],
      ['Check', res.checkBand.label + ' a week on this job']
    ];
    var value = f.valueHigh > 0 ? moneyRange(f.valueLow, f.valueHigh) + ' / yr' : 'Risk reduction';
    return '<div class="audit-first">' +
      '<div class="audit-first-head"><span class="audit-summary-label">Your first job</span>' +
      '<span class="audit-verdict">' + esc(res.verdict.label) + '</span></div>' +
      '<h2 class="audit-first-title">' + esc(f.c.job) + '</h2>' +
      '<p class="audit-first-line">' + esc(res.verdict.line) + '</p>' +
      '<dl class="audit-first-steps">' + rows.map(function (r) {
        return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>';
      }).join('') + '</dl>' +
      '<div class="audit-first-build"><span class="audit-summary-label">What to build</span>' +
      '<h3>' + esc(fill(f.c.title)) + '</h3><p>' + esc(whatOf(f.c)) + '</p>' +
      '<div class="audit-first-meta"><span>' + value + '</span><span>Set up in ' + esc(f.c.weeks) + '</span></div></div>' +
      '</div>';
  }

  function tagsFor(x) {
    var names = { time: 'Saves time', cash: 'Frees cash', risk: 'Reduces risk', revenue: 'Wins revenue' };
    return '<div class="audit-tags">' + x.c.types.map(function (t) { return '<span class="audit-tag is-strong">' + names[t] + '</span>'; }).join('') +
      '<span class="audit-tag">' + esc(areaLabel(x.area)) + '</span><span class="audit-tag">Set up in ' + esc(x.c.weeks) + '</span></div>';
  }

  function whyFor(x, res) {
    var parts = [];
    if (x.hoursHigh > 0) {
      parts.push('Your ' + lcFirst(areaLabel(x.area)) + ' team of about ' + trim(x.people) + ' people spends time on this; we estimate it frees ' + range(x.hoursLow, x.hoursHigh) + ' hours a year.');
    }
    if (x.cashHigh > 0) {
      parts.push('With ' + res.owedBand.label.toLowerCase() + ' owed and customers taking ' + res.daysBand.label.toLowerCase() + ' to pay, collecting ' + res.daysBand.faster[0] + '–' + res.daysBand.faster[1] + ' days sooner is worth ' + moneyRange(x.cashLow, x.cashHigh) + ' a year in borrowing costs.');
    }
    if (x.c.id === 'speed_lead' && res.slowReply) {
      parts.push('You reply ' + findById(REPLY_SPEED, state.speed).label.toLowerCase() + '. Research across thousands of companies found leads contacted within 5 minutes are far more likely to be reached and qualified than after 30.');
    }
    if (x.c.types.indexOf('risk') !== -1 && x.hoursHigh === 0) parts.push('Its main value is avoiding penalties, lost tax credit or missed deadlines rather than saving hours.');
    return parts.join(' ');
  }

  function card(x, n, res, full) {
    var value = x.valueHigh > 0 ? moneyRange(x.valueLow, x.valueHigh) + ' / yr' : 'Risk reduction';
    return '<article class="audit-card"><div class="audit-card-head"><span class="audit-card-rank">Next job ' + n + '</span>' +
      '<span class="audit-card-value">' + value + '</span></div>' +
      '<h3 class="audit-card-title">' + esc(fill(x.c.title)) + '</h3>' +
      '<p>' + esc(whatOf(x.c)) + '</p>' +
      (full ? '<p class="audit-why">' + esc(whyFor(x, res)) + '</p>' : '') +
      tagsFor(x) + '</article>';
  }

  function segmentNote() {
    var s = segment();
    if (s === 'small') return 'Most of our work is with mid-size and larger companies, but the method works at any size. Start with your first job, and grab the pen-and-paper version of Point First to run it again next month.';
    if (s === 'big' || s === 'enterprise') return 'At your size, the fastest path is a pilot on your first job in one department: prove the numbers, then roll out.';
    return 'Companies your size usually fix the first job, see results in weeks, then work down the list.';
  }

  function renderResults(full) {
    var res = computeResults();
    var next = res.items.slice(1);
    var html = '<section class="audit-screen" tabindex="-1">' +
      '<span class="audit-step">The Point First Audit</span>' +
      '<h1 class="audit-title">' + (full ? 'Your full report' : 'Here\'s what we found') + '</h1>' +
      summaryBlock(res) + firstJobBlock(res);

    if (!full) {
      html += '<h2 class="audit-section-title">Repeat: your next jobs</h2>' +
        next.slice(0, 2).map(function (x, i) { return card(x, i + 1, res, false); }).join('') +
        '<div class="audit-locked"><h3>Unlock your full report</h3>' +
        '<p>Free. Opens instantly after you enter your details.</p>' +
        '<ul class="audit-locked-list">' +
        '<li>All ' + next.length + ' next jobs, ranked by value</li>' +
        '<li>The value and setup time of each</li>' +
        '<li>Why each one fits, from your own answers</li>' +
        '<li>The full maths, with assumptions you can change</li>' +
        '</ul>' +
        '<button type="button" class="btn btn-solid" data-action="unlock">Unlock my full report →</button></div>';
    } else {
      html += '<p class="audit-sub">' + esc(segmentNote()) + '</p>' +
        '<h2 class="audit-section-title">Repeat: your next ' + next.length + ' jobs, ranked</h2>' +
        next.map(function (x, i) { return card(x, i + 1, res, true); }).join('') +
        assumptionsBlock(res) + methodBlock(res) + nextStepsBlock();
    }
    html += '</section>';
    app.innerHTML = html;
    focusScreen();

    var unlock = app.querySelector('[data-action="unlock"]');
    if (unlock) unlock.addEventListener('click', openUnlock);
    bindAssumptions();
    var print = app.querySelector('[data-action="print"]');
    if (print) print.addEventListener('click', function () { window.print(); });
    if (!full) window.scrollTo(0, 0);
  }

  function assumptionsBlock(res) {
    return '<h2 class="audit-section-title">Change the assumptions</h2>' +
      '<div class="audit-assumptions">' +
      '<div><label for="aRate">Staff cost per hour (' + sym() + ')</label>' +
      '<input id="aRate" type="number" inputmode="numeric" min="1" step="1" value="' + Math.round(res.rate) + '" />' +
      '<small>Salary plus benefits, per working hour. Default ' + sym() + region().rate + '.</small></div>' +
      '<div><label for="aBorrow">Cost of borrowing (% a year)</label>' +
      '<input id="aBorrow" type="number" inputmode="decimal" min="0" max="40" step="0.5" value="' + res.borrow + '" />' +
      '<small>Used to value cash collected sooner. Default ' + region().borrow + '%.</small></div>' +
      '</div>';
  }

  function methodBlock(res) {
    var f = res.first;
    var v = res.verdict;
    var capped = res.checkBand.v[1] > res.capacity ? ' (capped at your team\'s ' + num(res.capacity) + ' working hours a week)' : '';
    var items = ['<li><strong>Your first job:</strong> ' + esc(res.checkBand.label.toLowerCase()) + ' a week, your number' + capped + ' × ' + WORKING_WEEKS +
      ' working weeks × ' + Math.round(v.share[0] * 100) + '–' + Math.round(v.share[1] * 100) + '% automated for a "' + esc(v.label) + '" job × ' + money(res.rate) + ' an hour.</li>'];
    state.areas.forEach(function (id) {
      var a = AREAS[id];
      var p = findById(PEOPLE, state.people[id]);
      items.push('<li><strong>Next jobs in ' + esc(lcFirst(areaLabel(id))) + ':</strong> ' + p.label + ' people (we use ' + trim(p.v) + ') × ' + num(HOURS_PER_PERSON_YEAR) +
        ' working hours a year × ' + Math.round(a.share[0] * 100) + '–' + Math.round(a.share[1] * 100) + '% of their time automated' +
        (id === f.area ? ', minus the hours your first job already covers' : '') + ', × ' + money(res.rate) + ' an hour.</li>');
    });
    if (res.totals.cashHigh > 0) {
      items.push('<li><strong>Faster collections:</strong> ' + esc(res.owedBand.label) + ' owed (we use ' + money(res.owedBand.v) + ') × ' + res.daysBand.faster[0] + '–' + res.daysBand.faster[1] +
        ' days sooner ÷ 365 × ' + res.borrow + '% cost of borrowing.</li>');
    }
    items.push('<li><strong>Why these percentages:</strong> McKinsey estimates today\'s technology could automate activities that take up 60–70% of employees\' time. We assume 15–70% depending on the job and its score, to stay conservative.</li>');
    items.push('<li><strong>Not included:</strong> extra revenue from faster replies, fewer errors, and avoided penalties. These are real but depend on details only a proper review can confirm, so we don\'t put a number on them.</li>');
    return '<h2 class="audit-section-title">How we calculated this</h2><ul class="audit-method">' + items.join('') + '</ul>';
  }

  function nextStepsBlock() {
    return '<div class="audit-next-steps"><h2>Want to see your first job fixed?</h2>' +
      '<p>Vansh will walk you through this report and show how your first job would work on your own systems. No slides, no pressure.</p>' +
      '<div class="audit-actions">' +
      '<a class="btn btn-solid" href="' + CONTACT_URL + '" target="_blank" rel="noopener">Message Vansh →</a>' +
      '<a class="btn btn-outline" href="' + GUIDE_URL + '" target="_blank" rel="noopener">Point First, the pen-and-paper version</a>' +
      '</div></div>' +
      '<button type="button" class="audit-print" data-action="print">Save or print this report</button>';
  }

  function bindAssumptions() {
    var rateInput = document.getElementById('aRate');
    var borrowInput = document.getElementById('aBorrow');
    if (!rateInput) return;
    var update = function () {
      var r = parseFloat(rateInput.value);
      var b = parseFloat(borrowInput.value);
      if (!(r > 0) || !(b >= 0)) return;
      if (r === state.rate && b === state.borrow) return;
      state.rate = r; state.borrow = b;
      var focused = document.activeElement && document.activeElement.id;
      window.setTimeout(function () {
        var scroll = window.scrollY;
        renderResults(true);
        window.scrollTo(0, scroll);
        var el = focused && document.getElementById(focused);
        if (el) el.focus({ preventScroll: true });
      }, 0);
    };
    rateInput.addEventListener('change', update);
    borrowInput.addEventListener('change', update);
  }

  // ---------- Unlock via Tally ----------

  function hiddenFields(res) {
    var f = res.first;
    var firstJob = 'FIRST: ' + f.c.job + ' (' + res.verdict.label + ', score ' + scoreCount() + '/5, ' + res.checkBand.label.toLowerCase() + '/wk)';
    var nextJobs = res.items.slice(1, 3).map(function (x) { return fill(x.c.title); }).join(' | ');
    return {
      segment: SEGMENTS[segment()] || '',
      country: region().label,
      revenue: (revenueBand() || {}).label || '',
      industry: state.industry || '',
      role: state.role || '',
      areas: state.areas.map(areaLabel).join(', '),
      annual_value: moneyRange(res.totals.low, res.totals.high),
      top_automations: firstJob + ' | NEXT: ' + nextJobs,
      timeline: [(findById(TIMELINE, state.timeline) || {}).label, (findById(DECIDER, state.decider) || {}).label].filter(Boolean).join(' / '),
      source: 'audit-' + utm.source,
      utm_source: utm.utm_source,
      utm_campaign: utm.utm_campaign,
      report: packState()
    };
  }

  // The answers travel through Tally's redirect, so the full report opens
  // on the audit page even when the form ran in a new tab.
  function packState() {
    var json = JSON.stringify(state);
    return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function restoreState(packed) {
    var before = JSON.stringify(state);
    try {
      var b64 = packed.replace(/-/g, '+').replace(/_/g, '/');
      var saved = JSON.parse(decodeURIComponent(escape(atob(b64))));
      if (!saved || typeof saved !== 'object' || !REGIONS[saved.country]) return false;
      Object.keys(state).forEach(function (k) { if (k in saved) state[k] = saved[k]; });
      computeResults();
      return true;
    } catch (e) {
      state = JSON.parse(before);
      return false;
    }
  }

  function openUnlock() {
    var fields = hiddenFields(computeResults());
    try { localStorage.setItem(SAVED_KEY, JSON.stringify({ report: fields.report, at: Date.now() })); } catch (e) {}
    if (window.Tally && typeof window.Tally.openPopup === 'function') {
      window.Tally.openPopup(TALLY_FORM_ID, {
        layout: 'modal',
        width: 520,
        autoClose: 800,
        hiddenFields: fields,
        onSubmit: unlockReport
      });
      return;
    }
    var q = new URLSearchParams(fields).toString();
    window.open('https://tally.so/r/' + TALLY_FORM_ID + '?' + q, '_blank', 'noopener');
    var box = app.querySelector('.audit-locked');
    if (box && !box.querySelector('[data-action="continue"]')) {
      box.insertAdjacentHTML('beforeend', '<p class="audit-fineprint">The form opened in a new tab. Once you\'ve submitted it, <button type="button" class="audit-print" data-action="continue">show my full report</button>.</p>');
      box.querySelector('[data-action="continue"]').addEventListener('click', unlockReport);
    }
  }

  function unlockReport() {
    if (unlocked) return;
    unlocked = true;
    renderResults(true);
    window.scrollTo(0, 0);
  }

  window.addEventListener('message', function (e) {
    if (e.origin !== 'https://tally.so') return;
    var data = e.data;
    if (typeof data === 'string') { try { data = JSON.parse(data); } catch (err) { return; } }
    if (data && data.event === 'Tally.FormSubmitted') unlockReport();
  });

  // Tally redirects to ?unlocked=1&report=... after the form. If the report
  // value didn't come through, fall back to the copy saved on this device.
  function savedReport() {
    try {
      var saved = JSON.parse(localStorage.getItem(SAVED_KEY) || 'null');
      if (saved && saved.report && Date.now() - saved.at < 7 * 24 * 3600 * 1000) return saved.report;
    } catch (e) {}
    return null;
  }

  var packed = params.get('report');
  var restored = !!packed && restoreState(packed);
  if (!restored && params.get('unlocked')) {
    packed = savedReport();
    restored = !!packed && restoreState(packed);
    if (restored) {
      try { history.replaceState(null, '', window.location.pathname + '?report=' + packed); } catch (e) {}
    }
  }
  if (restored) {
    unlocked = true;
    renderResults(true);
  } else {
    render();
  }
})();
