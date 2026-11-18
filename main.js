(function () {
  'use strict';

  var root = document.documentElement;

  // Theme: System (follows the OS) by default; the button cycles System → Light → Dark → System.
  // Light or Dark is remembered when storage allows; going back to System forgets the pick.
  var toggle = document.querySelector('.theme-toggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var NEXT = { system: 'light', light: 'dark', dark: 'system' };
  var NAMES = { system: 'system', light: 'light', dark: 'dark' };

  function currentMode() {
    var chosen = root.getAttribute('data-theme');
    return chosen === 'light' || chosen === 'dark' ? chosen : 'system';
  }

  function syncThemeUi() {
    if (toggle) {
      var mode = currentMode();
      toggle.setAttribute('data-mode', mode);
      toggle.setAttribute('title', 'Theme: ' + NAMES[mode]);
      toggle.setAttribute('aria-label', 'Theme: ' + NAMES[mode] + '. Switch to ' + NAMES[NEXT[mode]] + ' theme');
    }
    if (themeMeta) {
      var paper = getComputedStyle(root).getPropertyValue('--paper').trim();
      if (paper) themeMeta.setAttribute('content', paper);
    }
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = NEXT[currentMode()];
      try {
        if (next === 'system') {
          root.removeAttribute('data-theme');
          localStorage.removeItem('theme');
        } else {
          root.setAttribute('data-theme', next);
          localStorage.setItem('theme', next);
        }
      } catch (e) {
        if (next === 'system') root.removeAttribute('data-theme');
        else root.setAttribute('data-theme', next);
      }
      syncThemeUi();
    });
  }

  if (darkQuery) {
    if (darkQuery.addEventListener) darkQuery.addEventListener('change', syncThemeUi);
    else if (darkQuery.addListener) darkQuery.addListener(syncThemeUi);
  }

  syncThemeUi();

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
  }

  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
