(function () {
  'use strict';

  var TALLY_FORM_ID = 'PdKloe';
  var POINT_FIRST_URL = 'https://tally.so/r/Me0N8k?source=audit';
  var CONTACT_URL = 'https://instagram.com/vanshdubeyy';
  var HOURS_PER_PERSON_YEAR = 1920;

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

  var AREAS = {
    finance: { label: 'Finance & accounts', hint: 'Invoices, payments, collections', share: [0.25, 0.40],
      volLabel: 'Supplier + customer invoices a month', vol: ['Under 200', '200–1,000', '1,000–5,000', '5,000+'] },
    sales: { label: 'Sales & enquiries', hint: 'Leads, quotes, follow-ups', share: [0.15, 0.30],
      volLabel: 'Enquiries a month', vol: ['Under 100', '100–500', '500–2,000', '2,000+'] },
    orders: { label: 'Orders & customer service', hint: 'Order entry, status, support', share: [0.25, 0.40],
      volLabel: 'Customer orders a month', vol: ['Under 200', '200–1,000', '1,000–5,000', '5,000+'] },
    procurement: { label: 'Procurement & vendors', hint: 'POs, approvals, supplier follow-ups', share: [0.20, 0.35],
      volLabel: 'Purchase orders a month', vol: ['Under 100', '100–500', '500–2,000', '2,000+'] },
    dealers: { label: 'Dealers & distributors', hint: 'Dealer orders, schemes, claims', share: [0.20, 0.35],
      volLabel: 'Active dealers or distributors', vol: ['Under 50', '50–200', '200–1,000', '1,000+'] },
    hr: { label: 'HR & people', hint: 'Hiring, onboarding, staff queries', share: [0.15, 0.30],
      volLabel: 'Total employees', vol: ['Under 200', '200–500', '500–2,000', '2,000+'] },
    reporting: { label: 'Management reporting', hint: 'MIS, month-end close, dashboards', share: [0.30, 0.50],
      volLabel: 'Branches, plants or entities', vol: ['1–2', '3–5', '6–15', '15+'] },
    compliance: { label: 'Tax & compliance', labelIN: 'GST & statutory compliance', hint: 'Filings, reconciliations, deadlines', share: [0.20, 0.35],
      volLabel: 'Tax registrations or entities', volLabelIN: 'GST registrations (GSTINs)', vol: ['1', '2–5', '6–15', '15+'] }
  };
  var AREA_ORDER = ['finance', 'sales', 'orders', 'procurement', 'dealers', 'hr', 'reporting', 'compliance'];

  var REPLY_SPEED = [
    { id: 's1', label: 'Within 5 minutes', slow: false },
    { id: 's2', label: 'Within an hour', slow: false },
    { id: 's3', label: 'Same day', slow: true },
    { id: 's4', label: 'Next day or later', slow: true }
  ];

  var DAYS_TO_PAY = [
    { id: 'd1', label: 'Under 30 days', faster: [3, 7] },
    { id: 'd2', label: '30–60 days', faster: [7, 15] },
    { id: 'd3', label: '60–90 days', faster: [15, 25] },
    { id: 'd4', label: '90+ days', faster: [20, 35] },
    { id: 'dx', label: 'Not sure', faster: [7, 15] }
  ];

  var GOALS = [
    { id: 'time', label: 'Free up my team\'s time' },
    { id: 'cash', label: 'Get paid faster' },
    { id: 'revenue', label: 'Convert more enquiries' },
    { id: 'risk', label: 'Fewer errors and compliance risk' },
    { id: 'scale', label: 'Grow without adding headcount' },
    { id: 'visibility', label: 'Better visibility for management' }
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

  // value types: time, cash, risk, revenue. goal = goals this directly serves.
  var CATALOGUE = [
    { id: 'ap_capture', area: 'finance', w: 3, weeks: '3–6 weeks', types: ['time'], goals: ['time', 'scale', 'risk'],
      title: 'Supplier invoice capture and three-way match',
      what: 'Reads supplier invoices from email or PDF, checks each against the PO and goods receipt, and posts matched ones into {erp}. People only handle the exceptions.' },
    { id: 'collections', area: 'finance', w: 3, weeks: '2–4 weeks', types: ['time', 'cash'], goals: ['cash', 'time'],
      title: 'Collections on autopilot',
      what: 'Sends each customer reminders matched to their terms and payment history, shares statements, and tracks promised payment dates. Your team only calls the hard cases.' },
    { id: 'cash_app', area: 'finance', w: 2, weeks: '2–4 weeks', types: ['time', 'cash'], goals: ['cash', 'time'],
      title: 'Matching incoming payments to invoices',
      whatIN: 'Matches incoming NEFT, RTGS and UPI receipts to open invoices and posts them in {erp}, so outstanding balances are always current.',
      whatUS: 'Matches incoming ACH, wire, check and card payments to open invoices and posts them in {erp}, so outstanding balances are always current.' },
    { id: 'vendor_onboard', area: 'finance', w: 1, weeks: '2–3 weeks', types: ['time', 'risk'], goals: ['risk', 'time'],
      title: 'New supplier setup and checks',
      whatIN: 'Collects supplier documents and validates GSTIN, PAN, bank details and MSME status before a vendor goes live.',
      whatUS: 'Collects W-9, banking and insurance details from new suppliers and validates them before a vendor goes live.' },
    { id: 'msme45', area: 'finance', region: 'IN', w: 1, weeks: '1–2 weeks', types: ['risk'], goals: ['risk'],
      title: 'MSME 45-day payment tracker',
      whatIN: 'Flags invoices from micro and small suppliers as they approach 45 days, so late payments don\'t cost you the tax deduction.' },
    { id: 'ledger_recon', area: 'finance', w: 1, weeks: '2–3 weeks', types: ['time'], goals: ['time', 'risk'],
      title: 'Customer ledger reconciliation',
      what: 'Prepares balance confirmations and flags mismatches between your books and customer statements before they turn into disputes.' },

    { id: 'speed_lead', area: 'sales', w: 3, weeks: '2–4 weeks', types: ['revenue', 'time'], goals: ['revenue', 'scale'],
      title: 'Instant reply and routing for every enquiry',
      whatIN: 'Replies within a minute to enquiries from your website, IndiaMART and WhatsApp, qualifies them, and routes each one to the right salesperson.',
      whatUS: 'Replies within a minute to web forms, ad leads and emails, qualifies them, and routes each one to the right rep.' },
    { id: 'quotes', area: 'sales', w: 2, weeks: '3–5 weeks', types: ['time', 'revenue'], goals: ['revenue', 'time'],
      title: 'Quote, proposal and tender drafting',
      what: 'Drafts quotes, proposals and tender or RFP responses from your past documents and price lists, ready for your team to review.' },
    { id: 'crm_log', area: 'sales', w: 1, weeks: '2–3 weeks', types: ['time'], goals: ['visibility', 'time'],
      title: 'A CRM that updates itself',
      what: 'Logs calls, emails and messages into {crm} automatically and reminds reps of their next step, so the pipeline is always accurate.' },

    { id: 'po_to_so', area: 'orders', w: 3, weeks: '3–5 weeks', types: ['time', 'risk'], goals: ['time', 'scale', 'risk'],
      title: 'Customer POs straight into {erp}',
      whatIN: 'Reads purchase orders from email, PDF or WhatsApp, creates the sales order in {erp}, and checks credit limits before it\'s confirmed.',
      whatUS: 'Reads purchase orders from email, PDF or portals, creates the sales order in {erp}, and checks credit limits before it\'s confirmed.' },
    { id: 'support_ai', area: 'orders', w: 2, weeks: '3–5 weeks', types: ['time'], goals: ['time', 'scale'],
      title: 'Customer service assistant',
      whatIN: 'Answers routine customer questions in English and Hindi, sorts tickets, and hands the rest to your team with full context.',
      whatUS: 'Answers routine customer questions, sorts tickets, and hands the rest to your team with full context.' },
    { id: 'order_updates', area: 'orders', w: 1, weeks: '1–3 weeks', types: ['time'], goals: ['time'],
      title: 'Automatic order and dispatch updates',
      what: 'Tells customers when orders are confirmed, dispatched and delivered, cutting the "where is my order?" calls.' },

    { id: 'po_approvals', area: 'procurement', w: 2, weeks: '2–4 weeks', types: ['time'], goals: ['time', 'visibility'],
      title: 'PO approvals and supplier follow-ups',
      what: 'Routes purchase requests to the right approver and chases suppliers on delivery dates automatically.' },
    { id: 'contracts', area: 'procurement', w: 1, weeks: '3–5 weeks', types: ['risk'], goals: ['risk'],
      title: 'Contract review and renewal alerts',
      what: 'Pulls key terms, obligations and renewal dates out of contracts and alerts you before anything lapses or auto-renews.' },

    { id: 'dealer_orders', area: 'dealers', w: 3, weeks: '3–5 weeks', types: ['time'], goals: ['time', 'scale'],
      title: 'Dealer orders straight into {erp}',
      whatIN: 'Lets dealers place orders on WhatsApp and creates them in {erp} without anyone re-typing them.',
      whatUS: 'Lets dealers place orders by email or portal and creates them in {erp} without anyone re-typing them.' },
    { id: 'claims', area: 'dealers', w: 2, weeks: '3–6 weeks', types: ['time', 'risk'], goals: ['risk', 'cash'],
      title: 'Scheme and claim processing',
      what: 'Checks dealer claims against scheme rules and actual sales, flags leakage, and prepares approvals.' },
    { id: 'secondary', area: 'dealers', w: 1, weeks: '2–4 weeks', types: ['time'], goals: ['visibility'],
      title: 'Distributor stock and sales reporting',
      what: 'Collects distributor stock and sell-through data automatically and turns it into one weekly view.' },

    { id: 'hiring', area: 'hr', w: 2, weeks: '2–4 weeks', types: ['time'], goals: ['time', 'scale'],
      title: 'Candidate screening and interview scheduling',
      what: 'Screens applications against the role, shortlists the strongest, and books interviews without the email back-and-forth.' },
    { id: 'hr_help', area: 'hr', w: 2, weeks: '3–5 weeks', types: ['time'], goals: ['time', 'scale'],
      title: 'Onboarding and HR helpdesk',
      what: 'Runs new-joiner paperwork and answers staff questions on policies, leave and payslips.' },
    { id: 'knowledge', area: 'hr', w: 1, weeks: '3–5 weeks', types: ['time'], goals: ['scale', 'time'],
      title: 'Internal knowledge assistant',
      what: 'Answers staff questions instantly from your SOPs, policies and contracts, so seniors stop being the help desk.' },

    { id: 'mis', area: 'reporting', w: 3, weeks: '3–6 weeks', types: ['time'], goals: ['visibility', 'time'],
      title: 'One management view across every branch',
      what: 'Pulls numbers from {erp}, {crm} and spreadsheets into a daily summary and a consolidated MIS across every branch and plant.' },
    { id: 'close', area: 'reporting', w: 2, weeks: '4–8 weeks', types: ['time', 'risk'], goals: ['visibility', 'time'],
      title: 'Faster month-end close',
      what: 'Automates reconciliations and the close checklist so the books close in days, not weeks.' },

    { id: 'gstr2b', area: 'compliance', region: 'IN', w: 3, weeks: '3–5 weeks', types: ['time', 'risk'], goals: ['risk', 'cash'],
      title: 'GST input-credit matching',
      whatIN: 'Matches GSTR-2B against your purchase register every month and chases suppliers for missing filings, protecting your input tax credit.' },
    { id: 'einvoice', area: 'compliance', region: 'IN', w: 2, weeks: '1–2 weeks', types: ['risk'], goals: ['risk'],
      title: 'E-invoice 30-day monitor',
      whatIN: 'Watches every invoice across all your GSTINs and alerts before the 30-day IRN window closes, since a missed invoice can\'t be registered later.' },
    { id: 'tds', area: 'compliance', region: 'IN', w: 1, weeks: '2–3 weeks', types: ['time', 'risk'], goals: ['risk', 'time'],
      title: 'Compliance calendar and filing prep',
      whatIN: 'Tracks TDS, GST and statutory due dates across entities and prepares the working files before each deadline.' },
    { id: 'us_tax', area: 'compliance', region: 'US', w: 3, weeks: '2–4 weeks', types: ['time', 'risk'], goals: ['risk', 'time'],
      title: 'Sales-tax and 1099 compliance prep',
      whatUS: 'Collects vendor W-9s, tracks 1099 eligibility, and prepares sales-tax working files by state before each deadline.' }
  ];

  // ---------- State ----------

  var state = {
    country: detectCountry(),
    industry: null, revenue: null, role: null,
    areas: [], detail: {},
    erp: null, crm: null,
    owed: null, days: null,
    goal: null, timeline: null, decider: null,
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

  // ---------- Screens ----------

  function buildScreens() {
    var screens = ['intro', 'industry', 'revenue', 'role', 'areas'];
    state.areas.forEach(function (a) { screens.push('area:' + a); });
    screens.push('systems', 'money', 'goal', 'timeline');
    return screens;
  }

  function render() {
    var screens = buildScreens();
    var name = screens[screenIndex];
    var questionCount = screens.length - 1;
    var progress = screenIndex === 0 ? 0 : Math.pow(screenIndex / questionCount, 0.6);
    setProgress(progress);

    var html = '';
    if (name === 'intro') html = introScreen();
    else if (name === 'industry') html = singleScreen('What kind of business do you run?', null, 'industry', INDUSTRIES.map(asOption), true);
    else if (name === 'revenue') html = singleScreen('What is your annual revenue?', 'This decides which questions and recommendations fit your size.', 'revenue', region().revenue.map(function (r) { return { id: r.id, label: r.label }; }));
    else if (name === 'role') html = singleScreen('What is your role?', 'So the report speaks to what you own.', 'role', ROLES.map(asOption));
    else if (name === 'areas') html = areasScreen();
    else if (name.indexOf('area:') === 0) html = areaDetailScreen(name.slice(5));
    else if (name === 'systems') html = systemsScreen();
    else if (name === 'money') html = moneyScreen();
    else if (name === 'goal') html = singleScreen('What matters most right now?', 'Your report will be ordered around this.', 'goal', GOALS);
    else if (name === 'timeline') html = timelineScreen();

    app.innerHTML = '<section class="audit-screen" tabindex="-1">' + stepLabel(screenIndex, questionCount) + html + '</section>';
    bindScreen(name);
    focusScreen();
  }

  function stepLabel(i, total) {
    if (i === 0) return '';
    return '<span class="audit-step">Question ' + i + ' of ' + total + '</span>';
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
    return '<h1 class="audit-title">Find what your operations can automate — and what it\'s worth.</h1>' +
      '<p class="audit-sub">A free audit for mid-size and large businesses. Built from your answers, with the maths shown for every number.</p>' +
      '<ul class="audit-intro-points">' +
      '<li><strong>3</strong><span>minutes, about 10 quick taps. No typing until the end.</span></li>' +
      '<li><strong>₹ $</strong><span>The yearly value of each automation, calculated from your team sizes and volumes.</span></li>' +
      '<li><strong>✓</strong><span>No invented figures. Every estimate shows its working and assumptions you can change.</span></li>' +
      '</ul>' +
      '<button type="button" class="btn btn-solid" data-action="next">Start the audit →</button>' +
      '<p class="audit-fineprint">Nothing is saved while you answer. You only share contact details if you choose to unlock the full report.</p>';
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

  function areasScreen() {
    var options = AREA_ORDER.map(function (id) { return { id: id, label: areaLabel(id), hint: AREAS[id].hint }; });
    return '<h1 class="audit-title">Which areas lose the most time to manual work?</h1>' +
      '<p class="audit-sub">Pick up to 3. We\'ll ask two quick questions about each.</p>' +
      optionButtons('areas', options, state.areas, true) +
      navButtons(true, state.areas.length > 0);
  }

  function areaDetailScreen(areaId) {
    var a = AREAS[areaId];
    var d = state.detail[areaId] || (state.detail[areaId] = {});
    var volLabel = (state.country === 'IN' && a.volLabelIN) || a.volLabel;
    var volOptions = a.vol.map(asOption);
    var html = '<h1 class="audit-title">' + esc(areaLabel(areaId)) + '</h1>' +
      '<p class="audit-sub">Rough numbers are fine.</p>' +
      '<div class="audit-group"><span class="audit-group-label">' + esc(volLabel) + '</span>' + optionButtons('vol:' + areaId, volOptions, d.vol, false, true) + '</div>' +
      '<div class="audit-group"><span class="audit-group-label">People working on this</span>' + optionButtons('people:' + areaId, PEOPLE, d.people, false, true) + '</div>';
    var complete = d.vol && d.people;
    if (areaId === 'sales') {
      html += '<div class="audit-group"><span class="audit-group-label">How fast do you usually reply to a new enquiry?</span>' + optionButtons('speed:sales', REPLY_SPEED, d.speed, false, true) + '</div>';
      complete = complete && d.speed;
    }
    return html + navButtons(true, !!complete);
  }

  function systemsScreen() {
    var r = region();
    return '<h1 class="audit-title">Which systems do you run on?</h1>' +
      '<p class="audit-sub">So recommendations connect to what you already use.</p>' +
      '<div class="audit-group"><span class="audit-group-label">Accounting / ERP</span>' + optionButtons('erp', r.erp.map(asOption), state.erp, false, true) + '</div>' +
      '<div class="audit-group"><span class="audit-group-label">CRM</span>' + optionButtons('crm', r.crm.map(asOption), state.crm, false, true) + '</div>' +
      navButtons(true, !!(state.erp && state.crm));
  }

  function moneyScreen() {
    var r = region();
    return '<h1 class="audit-title">How much do customers owe you right now?</h1>' +
      '<p class="audit-sub">Money stuck with customers has a real cost. This lets us value faster collections.</p>' +
      '<div class="audit-group"><span class="audit-group-label">Total outstanding from customers</span>' + optionButtons('owed', r.owed, state.owed, false, true) + '</div>' +
      '<div class="audit-group"><span class="audit-group-label">How long customers typically take to pay</span>' + optionButtons('days', DAYS_TO_PAY, state.days, false, true) + '</div>' +
      navButtons(true, !!(state.owed && state.days));
  }

  function timelineScreen() {
    return '<h1 class="audit-title">Last one. How soon do you want to act?</h1>' +
      '<div class="audit-group"><span class="audit-group-label">Timeline</span>' + optionButtons('timeline', TIMELINE, state.timeline, false, true) + '</div>' +
      '<div class="audit-group"><span class="audit-group-label">Who signs off on a project like this?</span>' + optionButtons('decider', DECIDER, state.decider, false, true) + '</div>' +
      navButtons(true, !!(state.timeline && state.decider), 'See my results →');
  }

  function bindScreen(name) {
    app.querySelectorAll('.audit-option').forEach(function (btn) {
      btn.addEventListener('click', function () { choose(name, btn.dataset.key, btn.dataset.id); });
    });
    app.querySelectorAll('[data-country]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (state.country === btn.dataset.country) return;
        state.country = btn.dataset.country;
        state.revenue = null; state.erp = null; state.crm = null; state.owed = null;
        render();
      });
    });
    var back = app.querySelector('[data-action="back"]');
    if (back) back.addEventListener('click', function () { screenIndex = Math.max(0, screenIndex - 1); render(); });
    var next = app.querySelector('[data-action="next"]');
    if (next) next.addEventListener('click', goNext);
  }

  function choose(screenName, key, id) {
    var autoAdvance = false;
    if (key === 'areas') {
      var i = state.areas.indexOf(id);
      if (i !== -1) state.areas.splice(i, 1);
      else if (state.areas.length < 3) state.areas.push(id);
      state.areas.sort(function (a, b) { return AREA_ORDER.indexOf(a) - AREA_ORDER.indexOf(b); });
    } else if (key.indexOf(':') !== -1) {
      var parts = key.split(':');
      (state.detail[parts[1]] = state.detail[parts[1]] || {})[parts[0]] = id;
    } else {
      state[key] = id;
      autoAdvance = ['industry', 'revenue', 'role', 'goal'].indexOf(key) !== -1;
    }
    if (autoAdvance) {
      render();
      window.setTimeout(goNext, reduceMotion ? 0 : 180);
    } else {
      render();
    }
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
    var items = [];
    var totals = { hoursLow: 0, hoursHigh: 0, timeLow: 0, timeHigh: 0, cashLow: 0, cashHigh: 0 };

    function eligible(item) { return !item.region || item.region === state.country; }

    state.areas.forEach(function (areaId) {
      var a = AREAS[areaId];
      var d = state.detail[areaId] || {};
      var people = (findById(PEOPLE, d.people) || PEOPLE[0]).v;
      var hoursLow = people * HOURS_PER_PERSON_YEAR * a.share[0];
      var hoursHigh = people * HOURS_PER_PERSON_YEAR * a.share[1];
      totals.hoursLow += hoursLow; totals.hoursHigh += hoursHigh;
      var areaItems = CATALOGUE.filter(function (c) { return c.area === areaId && eligible(c); });
      var savesTime = function (c) { return c.types.indexOf('time') !== -1; };
      var weightSum = areaItems.filter(savesTime).reduce(function (s, c) { return s + c.w; }, 0);
      areaItems.forEach(function (c) {
        var f = savesTime(c) && weightSum ? c.w / weightSum : 0;
        items.push({ c: c, area: areaId, people: people, hoursLow: hoursLow * f, hoursHigh: hoursHigh * f, cashLow: 0, cashHigh: 0 });
      });
    });

    var owedBand = findById(r.owed, state.owed);
    var daysBand = findById(DAYS_TO_PAY, state.days);
    var owed = owedBand ? owedBand.v : null;
    if (owed) {
      var cashLow = owed * daysBand.faster[0] / 365 * borrow;
      var cashHigh = owed * daysBand.faster[1] / 365 * borrow;
      totals.cashLow = cashLow; totals.cashHigh = cashHigh;
      [['collections', 0.7], ['cash_app', 0.3]].forEach(function (pair) {
        var existing = items.filter(function (x) { return x.c.id === pair[0]; })[0];
        if (!existing) {
          existing = { c: findById(CATALOGUE, pair[0]), area: 'finance', people: 0, hoursLow: 0, hoursHigh: 0, cashLow: 0, cashHigh: 0, cashOnly: true };
          items.push(existing);
        }
        existing.cashLow = cashLow * pair[1];
        existing.cashHigh = cashHigh * pair[1];
      });
    }

    var sales = state.detail.sales;
    var slowReply = sales && findById(REPLY_SPEED, sales.speed) && findById(REPLY_SPEED, sales.speed).slow;

    items.forEach(function (x) {
      x.timeLow = x.hoursLow * rate;
      x.timeHigh = x.hoursHigh * rate;
      x.valueLow = x.timeLow + x.cashLow;
      x.valueHigh = x.timeHigh + x.cashHigh;
      var score = (x.valueLow + x.valueHigh) / 2;
      if (x.c.goals.indexOf(state.goal) !== -1) score *= 1.6;
      if (x.c.id === 'speed_lead' && slowReply) score *= 1.8;
      if (x.c.types.indexOf('risk') !== -1 && state.goal === 'risk') score *= 1.3;
      score += x.c.w;
      x.score = score;
    });
    var valued = items.filter(function (x) { return x.valueHigh > 0; });
    var avgScore = valued.length ? valued.reduce(function (s, x) { return s + x.score; }, 0) / valued.length : 1;
    items.forEach(function (x) {
      if (x.valueHigh === 0 && state.goal === 'risk') x.score = avgScore + x.c.w;
    });
    items.sort(function (a, b) { return b.score - a.score; });

    totals.timeLow = totals.hoursLow * rate;
    totals.timeHigh = totals.hoursHigh * rate;
    totals.low = totals.timeLow + totals.cashLow;
    totals.high = totals.timeHigh + totals.cashHigh;
    totals.fteLow = totals.hoursLow / HOURS_PER_PERSON_YEAR;
    totals.fteHigh = totals.hoursHigh / HOURS_PER_PERSON_YEAR;

    return { items: items, totals: totals, rate: rate, borrow: borrow * 100, owedBand: owedBand, daysBand: daysBand, slowReply: slowReply };
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

  // ---------- Analysing ----------

  function analyse() {
    setProgress(1);
    var res = computeResults();
    var steps = [
      'Reading your answers',
      'Matching ' + state.areas.length + ' area' + (state.areas.length > 1 ? 's' : '') + ' against ' + CATALOGUE.filter(function (c) { return !c.region || c.region === state.country; }).length + ' automations',
      'Estimating time from your team sizes'
    ];
    if (res.owedBand && res.owedBand.v) steps.push('Valuing cash tied up with customers');
    steps.push('Ranking by value for your goal');

    app.innerHTML = '<section class="audit-screen" tabindex="-1"><h1 class="audit-title">Building your audit…</h1>' +
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
    var rows = '<div><dt>Team time freed each year</dt><dd>' + num(t.hoursLow) + '–' + num(t.hoursHigh) + ' hrs</dd></div>' +
      '<div><dt>Equal to about</dt><dd>' + trim(t.fteLow) + '–' + trim(t.fteHigh) + ' full-time people</dd></div>' +
      '<div><dt>Value of that time</dt><dd>' + moneyRange(t.timeLow, t.timeHigh) + '</dd></div>';
    if (t.cashHigh > 0) rows += '<div><dt>Saved by collecting cash faster</dt><dd>' + moneyRange(t.cashLow, t.cashHigh) + '</dd></div>';
    var hasRisk = res.items.some(function (x) { return x.c.types.indexOf('risk') !== -1; });
    if (hasRisk) rows += '<div><dt>Compliance risk</dt><dd>Reduced</dd></div>';
    return '<div class="audit-summary">' +
      '<span class="audit-summary-label">Estimated value each year</span>' +
      '<span class="audit-summary-value">' + moneyRange(t.low, t.high) + '</span>' +
      '<span class="audit-summary-note">' + esc(SEGMENTS[segment()] || '') + ' · ' + esc(state.industry || '') + ' · ' + esc(state.areas.map(areaLabel).join(', ')) + '</span>' +
      '<dl class="audit-breakdown">' + rows + '</dl></div>';
  }

  function tagsFor(x) {
    var names = { time: 'Saves time', cash: 'Frees cash', risk: 'Reduces risk', revenue: 'Wins revenue' };
    return '<div class="audit-tags">' + x.c.types.map(function (t) { return '<span class="audit-tag is-strong">' + names[t] + '</span>'; }).join('') +
      '<span class="audit-tag">' + esc(areaLabel(x.area)) + '</span><span class="audit-tag">Set up in ' + esc(x.c.weeks) + '</span></div>';
  }

  function whyFor(x, res) {
    var parts = [];
    if (x.hoursHigh > 0) {
      var label = areaLabel(x.area);
      if (!/^[A-Z]{2}/.test(label)) label = label.charAt(0).toLowerCase() + label.slice(1);
      parts.push('Your ' + label + ' team of about ' + trim(x.people) + ' people spends time on this; we estimate it frees ' + num(x.hoursLow) + '–' + num(x.hoursHigh) + ' hours a year.');
    }
    if (x.cashHigh > 0) {
      parts.push('With ' + res.owedBand.label.toLowerCase() + ' owed and customers taking ' + res.daysBand.label.toLowerCase() + ' to pay, collecting ' + res.daysBand.faster[0] + '–' + res.daysBand.faster[1] + ' days sooner is worth ' + moneyRange(x.cashLow, x.cashHigh) + ' a year in borrowing costs.');
    }
    if (x.c.id === 'speed_lead' && res.slowReply) {
      parts.push('You reply ' + findById(REPLY_SPEED, state.detail.sales.speed).label.toLowerCase() + '. Research on thousands of companies found leads contacted within 5 minutes are far more likely to be reached and qualified than after 30.');
    }
    if (x.c.types.indexOf('risk') !== -1 && x.hoursHigh === 0) parts.push('Its main value is avoiding penalties, lost tax credit or missed deadlines rather than saving hours.');
    if (x.c.goals.indexOf(state.goal) !== -1) parts.push('Directly supports your main goal: ' + findById(GOALS, state.goal).label.toLowerCase() + '.');
    return parts.join(' ');
  }

  function card(x, i, res, full) {
    var value = x.valueHigh > 0 ? moneyRange(x.valueLow, x.valueHigh) + ' / yr' : 'Risk reduction';
    return '<article class="audit-card"><div class="audit-card-head"><span class="audit-card-rank">#' + (i + 1) + '</span>' +
      '<span class="audit-card-value">' + value + '</span></div>' +
      '<h3 class="audit-card-title">' + esc(fill(x.c.title)) + '</h3>' +
      '<p>' + esc(whatOf(x.c)) + '</p>' +
      (full ? '<p class="audit-why">' + esc(whyFor(x, res)) + '</p>' : '') +
      tagsFor(x) + '</article>';
  }

  function segmentNote() {
    var s = segment();
    if (s === 'small') return 'Most of our work is with mid-size and larger companies, but the same automations apply at your size. Start with the top one, and grab Point First, our free guide, to pick it well.';
    if (s === 'big' || s === 'enterprise') return 'At your size, the fastest path is a pilot in one department: prove the numbers on the #1 automation, then roll out.';
    return 'Companies your size usually start with the top one or two, see results in weeks, and expand from there.';
  }

  function renderResults(full) {
    var res = computeResults();
    var top = res.items.slice(0, 3);
    var html = '<section class="audit-screen" tabindex="-1">' +
      '<span class="audit-step">Your automation audit</span>' +
      '<h1 class="audit-title">' + (full ? 'Your full report' : 'Here\'s what we found') + '</h1>' +
      summaryBlock(res);

    if (!full) {
      html += '<h2 class="audit-section-title">Your top 3 opportunities</h2>' +
        top.map(function (x, i) { return card(x, i, res, false); }).join('') +
        '<div class="audit-locked"><h3>Unlock your full report</h3>' +
        '<p>Free. Opens instantly after you enter your details.</p>' +
        '<ul class="audit-locked-list">' +
        '<li>All ' + res.items.length + ' automations that fit your business, ranked</li>' +
        '<li>The value and setup time of each</li>' +
        '<li>Why each one fits, from your own answers</li>' +
        '<li>The full maths, with assumptions you can change</li>' +
        '</ul>' +
        '<button type="button" class="btn btn-solid" data-action="unlock">Unlock my full report →</button></div>';
    } else {
      html += '<p class="audit-sub">' + esc(segmentNote()) + '</p>' +
        '<h2 class="audit-section-title">All ' + res.items.length + ' opportunities, ranked</h2>' +
        res.items.map(function (x, i) { return card(x, i, res, true); }).join('') +
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
    var items = state.areas.map(function (id) {
      var a = AREAS[id];
      var p = (findById(PEOPLE, (state.detail[id] || {}).people) || PEOPLE[0]);
      return '<li><strong>' + esc(areaLabel(id)) + ':</strong> ' + p.label + ' people (we use ' + trim(p.v) + ') × ' + num(HOURS_PER_PERSON_YEAR) +
        ' working hours a year × ' + Math.round(a.share[0] * 100) + '–' + Math.round(a.share[1] * 100) + '% of their time automated × ' + money(res.rate) + ' an hour.</li>';
    });
    if (res.totals.cashHigh > 0) {
      items.push('<li><strong>Faster collections:</strong> ' + esc(res.owedBand.label) + ' owed (we use ' + money(res.owedBand.v) + ') × ' + res.daysBand.faster[0] + '–' + res.daysBand.faster[1] +
        ' days sooner ÷ 365 × ' + res.borrow + '% cost of borrowing.</li>');
    }
    items.push('<li><strong>Why these percentages:</strong> McKinsey estimates today\'s technology could automate activities that take up 60–70% of employees\' time. We assume only 15–50%, depending on the area, to stay conservative.</li>');
    items.push('<li><strong>Not included:</strong> extra revenue from faster replies, fewer errors, and avoided penalties. These are real but depend on details only a proper review can confirm, so we don\'t put a number on them.</li>');
    return '<h2 class="audit-section-title">How we calculated this</h2><ul class="audit-method">' + items.join('') + '</ul>';
  }

  function nextStepsBlock() {
    return '<div class="audit-next-steps"><h2>Want to see the top one working?</h2>' +
      '<p>Vansh will walk you through your report and show how the #1 automation would work on your systems. No slides, no pressure.</p>' +
      '<div class="audit-actions">' +
      '<a class="btn btn-solid" href="' + CONTACT_URL + '" target="_blank" rel="noopener">Message Vansh →</a>' +
      '<a class="btn btn-outline" href="' + POINT_FIRST_URL + '" target="_blank" rel="noopener">Bonus: get the Point First guide</a>' +
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
    return {
      segment: SEGMENTS[segment()] || '',
      country: region().label,
      revenue: (revenueBand() || {}).label || '',
      industry: state.industry || '',
      role: state.role || '',
      areas: state.areas.map(areaLabel).join(', '),
      annual_value: moneyRange(res.totals.low, res.totals.high),
      top_automations: res.items.slice(0, 3).map(function (x) { return fill(x.c.title); }).join(' | '),
      timeline: [(findById(TIMELINE, state.timeline) || {}).label, (findById(DECIDER, state.decider) || {}).label].filter(Boolean).join(' / '),
      source: 'audit-' + utm.source,
      utm_source: utm.utm_source,
      utm_campaign: utm.utm_campaign
    };
  }

  function openUnlock() {
    var fields = hiddenFields(computeResults());
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
    if (box) {
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

  render();
})();
