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

  var hero = document.querySelector('.hero');
  var contact = document.getElementById('contact');
  var stickyCta = document.getElementById('stickyCta');
  if (hero && contact && stickyCta && 'IntersectionObserver' in window) {
    var pastHero = false;
    var atContact = false;
    var updateStickyCta = function () {
      stickyCta.classList.toggle('is-visible', pastHero && !atContact);
    };
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        pastHero = !entry.isIntersecting;
      });
      updateStickyCta();
    }, { threshold: 0 }).observe(hero);
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        atContact = entry.isIntersecting;
      });
      updateStickyCta();
    }, { threshold: 0 }).observe(contact);
  }
})();
