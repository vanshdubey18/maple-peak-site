(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduceMotion && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px 0px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });

    // Safety net: guarantee nothing stays invisible if a fast scroll
    // or an odd browser skips an intersection check.
    window.setTimeout(function () {
      document.querySelectorAll('.reveal:not(.in-view)').forEach(function (el) {
        el.classList.add('in-view');
      });
    }, 2500);
  }

  var params = new URLSearchParams(window.location.search);
  var utmSource = params.get('utm_source') ||
    (/instagram\./i.test(document.referrer) ? 'instagram' : '');
  var utmCampaign = params.get('utm_campaign') || '';
  document.querySelectorAll('a[href^="https://tally.so/r/"], a[href^="/audit"]').forEach(function (link) {
    var url = new URL(link.href, window.location.href);
    url.searchParams.set('source', link.dataset.cta || 'site');
    if (utmSource) url.searchParams.set('utm_source', utmSource);
    if (utmCampaign) url.searchParams.set('utm_campaign', utmCampaign);
    link.href = url.toString();
  });

  var costHours = document.getElementById('costHours');
  var costPeople = document.getElementById('costPeople');
  var costRate = document.getElementById('costRate');
  var costTotal = document.getElementById('costTotal');
  if (costHours && costPeople && costRate && costTotal) {
    var WORKING_WEEKS = 48;
    var CURRENCIES = {
      USD: { locale: 'en-US', min: 10, max: 200, step: 5, rate: 35 },
      INR: { locale: 'en-IN', min: 50, max: 2000, step: 10, rate: 150 }
    };
    var currency = 'USD';
    var money;
    var count = new Intl.NumberFormat('en-US');
    var shownTotal = 0;
    var tweenFrame = null;
    var currencyButtons = document.querySelectorAll('.cost-currency-btn');

    var applyCurrency = function (code) {
      CURRENCIES[currency].rate = +costRate.value;
      currency = code;
      var config = CURRENCIES[code];
      money = new Intl.NumberFormat(config.locale, { style: 'currency', currency: code, maximumFractionDigits: 0 });
      costRate.min = config.min;
      costRate.max = config.max;
      costRate.step = config.step;
      costRate.value = config.rate;
      currencyButtons.forEach(function (btn) {
        btn.setAttribute('aria-pressed', String(btn.dataset.currency === code));
      });
      shownTotal = +costHours.value * +costPeople.value * WORKING_WEEKS * config.rate;
    };

    var setFill = function (input) {
      var pct = (input.value - input.min) / (input.max - input.min) * 100;
      input.style.setProperty('--fill', pct + '%');
    };

    var renderTotal = function (target) {
      if (tweenFrame) cancelAnimationFrame(tweenFrame);
      if (reduceMotion) {
        shownTotal = target;
        costTotal.textContent = money.format(target);
        return;
      }
      var start = shownTotal;
      var startTime = null;
      var step = function (now) {
        if (startTime === null) startTime = now;
        var t = Math.min((now - startTime) / 300, 1);
        var eased = 1 - Math.pow(1 - t, 3);
        shownTotal = start + (target - start) * eased;
        costTotal.textContent = money.format(Math.round(shownTotal));
        if (t < 1) tweenFrame = requestAnimationFrame(step);
      };
      tweenFrame = requestAnimationFrame(step);
    };

    var updateCost = function () {
      var hours = +costHours.value;
      var people = +costPeople.value;
      var rate = +costRate.value;
      var annualHours = hours * people * WORKING_WEEKS;
      document.getElementById('costHoursOut').textContent = hours;
      document.getElementById('costPeopleOut').textContent = people;
      document.getElementById('costRateOut').textContent = money.format(rate);
      document.getElementById('costAnnualHours').textContent = count.format(annualHours);
      [costHours, costPeople, costRate].forEach(setFill);
      renderTotal(annualHours * rate);
    };

    [costHours, costPeople, costRate].forEach(function (input) {
      input.addEventListener('input', updateCost);
    });
    currencyButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.dataset.currency === currency) return;
        applyCurrency(btn.dataset.currency);
        updateCost();
      });
    });

    var timeZone = '';
    try { timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    var inIndia = /^Asia\/(Kolkata|Calcutta)$/.test(timeZone) || /-IN$/i.test(navigator.language || '');
    applyCurrency(inIndia ? 'INR' : 'USD');
    updateCost();
  }

  var hero = document.querySelector('.hero');
  var stickyCta = document.getElementById('stickyCta');
  var inPageCtaZones = document.querySelectorAll('.cost-result, #contact');
  if (hero && stickyCta && 'IntersectionObserver' in window) {
    var pastHero = false;
    var visibleCtaZones = new Set();
    var updateStickyCta = function () {
      stickyCta.classList.toggle('is-visible', pastHero && visibleCtaZones.size === 0);
    };
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        pastHero = !entry.isIntersecting;
      });
      updateStickyCta();
    }, { threshold: 0 }).observe(hero);
    var ctaZoneObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visibleCtaZones.add(entry.target);
        else visibleCtaZones.delete(entry.target);
      });
      updateStickyCta();
    }, { threshold: 0 });
    inPageCtaZones.forEach(function (zone) { ctaZoneObserver.observe(zone); });
  }
})();
