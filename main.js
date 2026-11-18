(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme: System (follows the OS) by default; the button cycles System → Light → Dark → System.
  // Light or Dark is remembered when storage allows; going back to System forgets the pick.
  var toggle = document.querySelector('.theme-toggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var NEXT = { system: 'light', light: 'dark', dark: 'system' };

  function currentMode() {
    var chosen = root.getAttribute('data-theme');
    return chosen === 'light' || chosen === 'dark' ? chosen : 'system';
  }

  function syncThemeUi() {
    if (toggle) {
      var mode = currentMode();
      toggle.setAttribute('data-mode', mode);
      toggle.setAttribute('title', 'Theme: ' + mode);
      toggle.setAttribute('aria-label', 'Theme: ' + mode + '. Switch to ' + NEXT[mode] + ' theme');
    }
    if (themeMeta) {
      var paper = getComputedStyle(root).getPropertyValue('--paper').trim();
      if (paper) themeMeta.setAttribute('content', paper);
    }
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = NEXT[currentMode()];
      if (next === 'system') root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', next);
      try {
        if (next === 'system') localStorage.removeItem('theme');
        else localStorage.setItem('theme', next);
      } catch (e) {}
      syncThemeUi();
    });
  }

  if (darkQuery) {
    if (darkQuery.addEventListener) darkQuery.addEventListener('change', syncThemeUi);
    else if (darkQuery.addListener) darkQuery.addListener(syncThemeUi);
  }

  syncThemeUi();

  // Phone menu: the section links fold behind a button; picking one, Escape or a click outside closes it.
  var header = document.querySelector('.site-header');
  var menuButton = document.querySelector('.menu-toggle');

  function setMenu(open) {
    if (!header || !menuButton) return;
    header.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (menuButton) {
    menuButton.addEventListener('click', function () {
      setMenu(!header.classList.contains('is-open'));
    });
    document.querySelectorAll('.site-nav a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && header.classList.contains('is-open')) {
        setMenu(false);
        menuButton.focus();
      }
    });
    document.addEventListener('click', function (event) {
      if (header.classList.contains('is-open') && !header.contains(event.target)) setMenu(false);
    });
  }

  // Exploded stack: tilts toward the pointer. Mouse and pen only, and never with reduced motion.
  var hero = document.querySelector('.hero');
  var stack = document.querySelector('.stack');
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (hero && stack && finePointer && !reduceMotion) {
    var frame = 0;
    hero.addEventListener('pointermove', function (event) {
      if (frame) return;
      frame = requestAnimationFrame(function () {
        frame = 0;
        var box = stack.getBoundingClientRect();
        var x = (event.clientX - (box.left + box.width / 2)) / (window.innerWidth / 2);
        var y = (event.clientY - (box.top + box.height / 2)) / (window.innerHeight / 2);
        stack.style.setProperty('--tx', Math.max(-1, Math.min(1, x)).toFixed(3));
        stack.style.setProperty('--ty', Math.max(-1, Math.min(1, y)).toFixed(3));
      });
    });
    hero.addEventListener('pointerleave', function () {
      stack.style.setProperty('--tx', '0');
      stack.style.setProperty('--ty', '0');
    });
  }

  // Career chart: the HTML ships with values for October 2026; recompute so the
  // current role, its duration and the year axis stay true to today's date.
  var chart = document.querySelector('.career');

  function parseMonth(value) {
    var parts = String(value).split('-');
    return { y: Number(parts[0]), m: Number(parts[1]) };
  }

  function monthsSince(date, origin) {
    return (date.y - origin.y) * 12 + (date.m - origin.m);
  }

  function formatDuration(months) {
    var years = Math.floor(months / 12);
    var rest = months % 12;
    var parts = [];
    if (years) parts.push(years + (years === 1 ? ' yr' : ' yrs'));
    if (rest) parts.push(rest + (rest === 1 ? ' mo' : ' mos'));
    return parts.join(' ');
  }

  if (chart) {
    var origin = parseMonth(chart.getAttribute('data-origin'));
    var today = new Date();
    var total = monthsSince({ y: today.getFullYear(), m: today.getMonth() + 1 }, origin) + 1;
    chart.style.setProperty('--total', String(total));

    Array.prototype.forEach.call(chart.querySelectorAll('.role'), function (role) {
      var from = monthsSince(parseMonth(role.getAttribute('data-start')), origin);
      var end = role.getAttribute('data-end');
      var to = end === 'present' ? total : monthsSince(parseMonth(end), origin) + 1;
      role.style.setProperty('--from', String(from));
      role.style.setProperty('--to', String(to));
      var duration = role.querySelector('.role__dur');
      if (duration) duration.textContent = formatDuration(to - from);
    });

    var scale = chart.querySelector('.career__scale');
    if (scale) {
      var ticks = '';
      for (var year = origin.y + 1; year <= today.getFullYear(); year++) {
        var at = monthsSince({ y: year, m: 1 }, origin);
        ticks += '<span class="tick' + (year % 2 ? ' tick--odd' : '') + '" style="--at: ' + at + '">' + year + '</span>';
      }
      scale.innerHTML = ticks;
    }

    // Draw the bars when the chart scrolls into view, not while it is off screen.
    if ('IntersectionObserver' in window) {
      var watcher = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          chart.classList.add('is-visible');
          watcher.disconnect();
        }
      }, { threshold: 0.25 });
      watcher.observe(chart);
    } else {
      chart.classList.add('is-visible');
    }
  }

  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
