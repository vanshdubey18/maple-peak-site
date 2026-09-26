(function () {
  var panel = document.getElementById('demoPanel');
  if (!panel) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var india = (function () {
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    return /^Asia\/(Kolkata|Calcutta)$/.test(tz) || /-IN$/i.test(navigator.language || '');
  })();

  // Sample documents from made-up companies. <span data-f="x"> marks the text
  // a field is read from, so it lights up as that field fills in.
  var DEMOS = {
    order: india ? {
      source: '<div class="demo-mail"><p class="demo-meta">From: <span data-f="customer">Rakesh Menon, Sagar Components</span><br />Subject: <span data-f="po">PO-4471</span>, brake pads</p>' +
        '<p>Hi team,</p><p>Please supply <span data-f="l1">1,200 units of BP-220 brake pads at ₹340</span> and <span data-f="l2">600 units of BP-310 at ₹410</span>. ' +
        'Deliver to our <span data-f="ship">Pune plant by 14 Oct</span>. Payment terms <span data-f="terms">45 days</span> as usual.</p><p>Thanks,<br />Rakesh</p></div>',
      fields: [
        ['customer', 'Customer', 'Sagar Components', 'Existing account'],
        ['po', 'PO number', 'PO-4471'],
        ['l1', 'Line 1', 'BP-220 × 1,200 at ₹340'],
        ['l2', 'Line 2', 'BP-310 × 600 at ₹410'],
        ['l1 l2', 'Order value', '₹6,54,000', 'Checked'],
        ['ship', 'Deliver to', 'Pune plant, 14 Oct'],
        ['terms', 'Payment terms', '45 days', 'Matches account']
      ],
      verdict: ['ok', 'Order entered'],
      actions: ['Sales order SO-10482 created in Tally Prime', 'Stock checked: both items available', 'Order confirmation sent to Rakesh'],
      manual: 'about 12 minutes of typing and checking'
    } : {
      source: '<div class="demo-mail"><p class="demo-meta">From: <span data-f="customer">Mike Reyes, Northgate Components</span><br />Subject: <span data-f="po">PO-4471</span>, brake pads</p>' +
        '<p>Hi team,</p><p>Please supply <span data-f="l1">1,200 units of BP-220 brake pads at $4.10</span> and <span data-f="l2">600 units of BP-310 at $4.95</span>. ' +
        'Ship to our <span data-f="ship">Columbus plant by Oct 14</span>. Terms <span data-f="terms">Net 45</span> as usual.</p><p>Thanks,<br />Mike</p></div>',
      fields: [
        ['customer', 'Customer', 'Northgate Components', 'Existing account'],
        ['po', 'PO number', 'PO-4471'],
        ['l1', 'Line 1', 'BP-220 × 1,200 at $4.10'],
        ['l2', 'Line 2', 'BP-310 × 600 at $4.95'],
        ['l1 l2', 'Order value', '$7,890.00', 'Checked'],
        ['ship', 'Ship to', 'Columbus plant, Oct 14'],
        ['terms', 'Terms', 'Net 45', 'Matches account']
      ],
      verdict: ['ok', 'Order entered'],
      actions: ['Sales order SO-10482 created in NetSuite', 'Stock checked: both items available', 'Order confirmation sent to Mike'],
      manual: 'about 12 minutes of typing and checking'
    },

    invoice: india ? {
      source: '<div class="demo-doc"><p class="demo-doc-head">TAX INVOICE <span data-f="inv">INV/2026/0917</span></p>' +
        '<p>From: <span data-f="supplier">Shreeji Steel Traders</span><br />GSTIN: <span data-f="gst">27ABCDE1234F1Z5</span></p>' +
        '<p>Against PO: <span data-f="po">PO-3318</span></p>' +
        '<p>MS sheet 2mm: <span data-f="qty">500 units</span> at ₹1,180<br />Total incl. 18% GST: <span data-f="amt">₹6,96,200</span></p></div>',
      fields: [
        ['supplier', 'Supplier', 'Shreeji Steel Traders', 'Approved vendor'],
        ['inv', 'Invoice', 'INV/2026/0917'],
        ['gst', 'GSTIN', '27ABCDE1234F1Z5', 'Matches vendor record'],
        ['po', 'Purchase order', 'PO-3318: 500 units ordered', 'Match'],
        ['qty', 'Goods received', '480 units on the receipt', 'Short by 20', 'bad'],
        ['amt', 'Amount', '₹6,96,200', 'Tax maths correct']
      ],
      verdict: ['hold', 'Held for review, not paid'],
      actions: ['Invoice logged in Tally Prime as on hold', 'Query sent to Shreeji Steel about the 20 missing units', 'Everything else ready to post once they reply'],
      manual: 'about 15 minutes matching three documents'
    } : {
      source: '<div class="demo-doc"><p class="demo-doc-head">INVOICE <span data-f="inv">INV-20917</span></p>' +
        '<p>From: <span data-f="supplier">Ridgeway Steel Supply</span><br />Terms: <span data-f="terms">Net 30</span></p>' +
        '<p>Your PO: <span data-f="po">PO-3318</span></p>' +
        '<p>Steel sheet 14ga: <span data-f="qty">500 units</span> at $14.20<br />Total due: <span data-f="amt">$7,100.00</span></p></div>',
      fields: [
        ['supplier', 'Supplier', 'Ridgeway Steel Supply', 'Approved vendor'],
        ['inv', 'Invoice', 'INV-20917'],
        ['terms', 'Terms', 'Net 30', 'Matches vendor record'],
        ['po', 'Purchase order', 'PO-3318: 500 units ordered', 'Match'],
        ['qty', 'Goods received', '480 units on the receipt', 'Short by 20', 'bad'],
        ['amt', 'Amount', '$7,100.00', 'Maths correct']
      ],
      verdict: ['hold', 'Held for review, not paid'],
      actions: ['Invoice logged in NetSuite as on hold', 'Query sent to Ridgeway about the 20 missing units', 'Everything else ready to post once they reply'],
      manual: 'about 15 minutes matching three documents'
    },

    payment: india ? {
      source: '<div class="demo-doc"><p class="demo-doc-head">RECEIVABLES LEDGER</p>' +
        '<p>Customer: <span data-f="customer">Arvind Distributors</span><br />Invoice: <span data-f="inv">INV/2026/0782</span></p>' +
        '<p>Amount: <span data-f="amt">₹3,40,000</span><br />Due: <span data-f="due">10 Sep, unpaid</span></p>' +
        '<p>Contact: <span data-f="contact">Arvind Shah, accounts</span></p></div>',
      fields: [
        ['customer', 'Customer', 'Arvind Distributors'],
        ['inv', 'Invoice', 'INV/2026/0782'],
        ['amt', 'Amount', '₹3,40,000'],
        ['due', 'Overdue by', '16 days', 'Reminder due', 'bad'],
        ['customer', 'History', 'Usually pays within 5 days of a reminder'],
        ['contact', 'Send to', 'Arvind Shah on WhatsApp and email']
      ],
      verdict: ['ok', 'Reminder sent'],
      message: 'Hi Arvind ji, a gentle reminder that invoice INV/2026/0782 for ₹3,40,000 was due on 10 Sep. Could you share the payment date? Happy to resend the invoice if needed.',
      actions: ['Follow-up set for 3 days if there is no reply', 'Collections list updated for the finance head'],
      manual: 'about 8 minutes per customer, for every overdue invoice'
    } : {
      source: '<div class="demo-doc"><p class="demo-doc-head">RECEIVABLES LEDGER</p>' +
        '<p>Customer: <span data-f="customer">Harbor Supply Co.</span><br />Invoice: <span data-f="inv">INV-10782</span></p>' +
        '<p>Amount: <span data-f="amt">$4,300.00</span><br />Due: <span data-f="due">Sep 10, unpaid</span></p>' +
        '<p>Contact: <span data-f="contact">Dana Cole, AP</span></p></div>',
      fields: [
        ['customer', 'Customer', 'Harbor Supply Co.'],
        ['inv', 'Invoice', 'INV-10782'],
        ['amt', 'Amount', '$4,300.00'],
        ['due', 'Overdue by', '16 days', 'Reminder due', 'bad'],
        ['customer', 'History', 'Usually pays within 5 days of a reminder'],
        ['contact', 'Send to', 'Dana Cole by email']
      ],
      verdict: ['ok', 'Reminder sent'],
      message: 'Hi Dana, a quick reminder that invoice INV-10782 for $4,300.00 was due on Sep 10. Could you confirm when it will be paid? Happy to resend it if that helps.',
      actions: ['Follow-up set for 3 days if there is no reply', 'Collections list updated for the finance lead'],
      manual: 'about 8 minutes per customer, for every overdue invoice'
    }
  };

  var sourceEl = document.getElementById('demoSource');
  var fieldsEl = document.getElementById('demoFields');
  var resultEl = document.getElementById('demoResult');
  var timesEl = document.getElementById('demoTimes');
  var runBtn = document.getElementById('demoRun');
  var tabs = panel.querySelectorAll('.demo-tab');
  var current = 'order';
  var timers = [];
  var STEP = 520;

  function later(fn, ms) { timers.push(window.setTimeout(fn, reduceMotion ? 0 : ms)); }

  function highlight(keys) {
    sourceEl.querySelectorAll('[data-f]').forEach(function (el) {
      el.classList.toggle('is-read', keys.indexOf(el.dataset.f) !== -1);
    });
  }

  function addField(f) {
    var row = document.createElement('div');
    row.className = 'demo-field';
    row.innerHTML = '<dt></dt><dd><span class="demo-value"></span></dd>';
    row.querySelector('dt').textContent = f[1];
    row.querySelector('.demo-value').textContent = f[2];
    if (f[3]) {
      var tag = document.createElement('span');
      tag.className = 'demo-check' + (f[4] === 'bad' ? ' is-bad' : '');
      tag.textContent = (f[4] === 'bad' ? '! ' : '✓ ') + f[3];
      row.querySelector('dd').appendChild(tag);
    }
    fieldsEl.appendChild(row);
  }

  function showResult(d) {
    var html = '<p class="demo-verdict is-' + d.verdict[0] + '">' + d.verdict[1] + '</p>';
    if (d.message) html += '<blockquote class="demo-message"></blockquote>';
    html += '<ul>' + d.actions.map(function () { return '<li></li>'; }).join('') + '</ul>';
    resultEl.innerHTML = html;
    if (d.message) resultEl.querySelector('.demo-message').textContent = d.message;
    resultEl.querySelectorAll('li').forEach(function (li, i) { li.textContent = d.actions[i]; });
    resultEl.hidden = false;
  }

  function showTimes(d) {
    timesEl.innerHTML = '<div class="demo-bar"><span>By hand</span><i style="--w:100%"></i><b></b></div>' +
      '<div class="demo-bar is-fast"><span>With the system</span><i style="--w:2%"></i><b>Seconds</b></div>';
    timesEl.querySelector('b').textContent = d.manual.charAt(0).toUpperCase() + d.manual.slice(1);
    timesEl.classList.add('is-shown');
  }

  function run(key) {
    timers.forEach(window.clearTimeout);
    timers = [];
    current = key;
    var d = DEMOS[key];
    tabs.forEach(function (t) { t.setAttribute('aria-pressed', String(t.dataset.demo === key)); });
    sourceEl.innerHTML = d.source;
    fieldsEl.innerHTML = '';
    resultEl.hidden = true;
    timesEl.innerHTML = '<p class="demo-status">Reading…</p>';
    timesEl.classList.remove('is-shown');
    runBtn.disabled = true;

    d.fields.forEach(function (f, i) {
      later(function () { highlight(f[0].split(' ')); addField(f); }, 400 + i * STEP);
    });
    var end = 400 + d.fields.length * STEP;
    later(function () { highlight([]); showResult(d); }, end);
    later(function () { showTimes(d); runBtn.disabled = false; }, end + 500);
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () { run(t.dataset.demo); });
  });
  runBtn.addEventListener('click', function () { run(current); });

  sourceEl.innerHTML = DEMOS[current].source;
  timesEl.innerHTML = '<p class="demo-status">Ready</p>';

  // Play once when the panel scrolls into view, so the first visit shows it working.
  var started = false;
  function start() { if (!started) { started = true; run(current); } }
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { start(); io.disconnect(); }
    }, { threshold: 0.35 });
    io.observe(panel);
  } else {
    start();
  }
})();
