// ---- Guestbook setup: paste your Google Apps Script web app URL between the quotes (see guestbook/README) ----
var GUESTBOOK_URL = '';

(function () {
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Soft fade-in on scroll (page works without it)
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { items.forEach(function (el) { el.classList.add('in'); }); }
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.1 });
    items.forEach(function (el) { io.observe(el); });
  }

  // 3D "25": stacked gold layers
  var g = document.querySelector('.big25 > .gold');
  if (g && !reduced) {
    var w = document.createElement('div'); w.className = 'num3d';
    g.parentNode.insertBefore(w, g);
    for (var i = 18; i >= 1; i--) {
      var l = document.createElement('span'), t = i / 18;
      l.className = 'layer'; l.setAttribute('aria-hidden', 'true'); l.textContent = g.textContent;
      l.style.setProperty('--c', 'hsl(38 ' + (60 - 10 * t) + '% ' + (50 - 28 * t) + '%)');
      l.style.transform = 'translateZ(' + (-i * 2.4) + 'px)';
      w.appendChild(l);
    }
    w.appendChild(g);
  }

  // Falling petals in 3D (hero and closing)
  if (!reduced) {
    var cols = [['#ff9fc0', '#ff4f93'], ['#ffd27a', '#ff9f1c'], ['#fff0c8', '#f6c453'], ['#ffb3c9', '#e0457b']];
    document.querySelectorAll('.petals').forEach(function (box) {
      for (var i = 0; i < 14; i++) {
        var s = document.createElement('span'), c = cols[i % cols.length], z = 10 + Math.random() * 12;
        s.style.cssText = 'left:' + (Math.random() * 100) + '%;--s:' + z + 'px;--c1:' + c[0] + ';--c2:' + c[1] + ';--t:' + (12 + Math.random() * 10) + 's;--d:' + (-Math.random() * 20) + 's;--x:' + (Math.random() * 140 - 50) + 'px;--z:' + (Math.random() * 260 - 80) + 'px';
        box.appendChild(s);
      }
    });
  }

  // Hero depth: layers drift with the pointer (desktop)
  var hero = document.querySelector('.hero'), wrap = document.querySelector('.arch-wrap');
  if (hero && wrap && !reduced && window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      wrap.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5) * 2);
      wrap.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5) * 2);
    });
  }

  // Gentle 3D tilt on desktop
  if (window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.arch,.card,.msg,.gallery figure,.cd > div,.wish-list li').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateY(' + (x * 9) + 'deg) rotateX(' + (-y * 9) + 'deg)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  // Countdown to 12 Dec 2026, 6:00 PM Pacific (Surrey, BC)
  var START = new Date('2026-12-12T18:00:00-08:00').getTime(), END = new Date('2026-12-12T23:00:00-08:00').getTime();
  var cd = document.getElementById('cd'), msg = document.getElementById('cd-msg');
  if (cd) {
    var f = { d: document.getElementById('cd-d'), h: document.getElementById('cd-h'), m: document.getElementById('cd-m'), s: document.getElementById('cd-s') };
    var pad = function (n) { return n < 10 ? '0' + n : '' + n; }, timer, first = true;
    var set = function (el, v) { if (el.textContent === v) return; el.textContent = v; if (first || reduced) return; el.classList.remove('flip'); void el.offsetWidth; el.classList.add('flip'); };
    var tick = function () {
      var now = Date.now(), left = START - now;
      if (left <= 0) {
        cd.hidden = true; msg.hidden = false;
        msg.textContent = now < END ? 'The celebration has begun. Welcome!' : 'Thank you for celebrating with us.';
        if (now >= END) clearInterval(timer);
        return;
      }
      var s = Math.floor(left / 1000);
      set(f.d, pad(Math.floor(s / 86400))); set(f.h, pad(Math.floor(s % 86400 / 3600)));
      set(f.m, pad(Math.floor(s % 3600 / 60))); set(f.s, pad(s % 60));
    };
    tick(); first = false; timer = setInterval(tick, 1000);
  }

  // Background song, no controls. Starts when the browser allows it, otherwise on the first tap/click/key.
  var a = document.getElementById('song');
  if (a) {
    a.volume = 0.8;
    var evts = ['pointerup', 'touchend', 'click', 'keydown'], resume = false;
    var kick = function () { var p = a.play(); if (p && p.catch) p.catch(function () {}); };
    var arm = function () { evts.forEach(function (e) { document.addEventListener(e, kick, { passive: true }); }); };
    a.addEventListener('playing', function () { evts.forEach(function (e) { document.removeEventListener(e, kick); }); });
    var p = a.play(); if (p && p.catch) p.catch(arm); else arm();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { if (!a.paused) { resume = true; a.pause(); } } else if (resume) { resume = false; kick(); }
    });
  }

  // Guestbook: wishes and blessings
  var form = document.getElementById('wish-form'), list = document.getElementById('wish-list');
  if (form && list) {
    var status = document.getElementById('wish-status'), count = document.getElementById('wish-count'), note = document.getElementById('wish-note');
    var ta = form.elements.msg, nm = form.elements.name, KEY = 'wishes-preview', LAST = 'wish-last';
    var read = function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
    var write = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
    var ago = function (iso) {
      var d = new Date(iso); if (isNaN(d)) return '';
      return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    };
    var render = function (items) {
      list.textContent = '';
      if (!items || !items.length) {
        var e = document.createElement('li'); e.className = 'wish-empty'; e.textContent = 'Be the first to leave a wish.'; list.appendChild(e); return;
      }
      items.slice(0, 100).forEach(function (it) {
        var li = document.createElement('li'), av = document.createElement('span'), w = document.createElement('div'), t = document.createElement('time'), p = document.createElement('p');
        var name = String(it.name || 'A friend').slice(0, 40);
        av.className = 'av'; av.textContent = name.charAt(0).toUpperCase(); av.setAttribute('aria-hidden', 'true');
        w.className = 'who'; w.textContent = name; t.textContent = ago(it.t); p.textContent = String(it.msg || '').slice(0, 300);
        li.appendChild(av); li.appendChild(w); li.appendChild(t); li.appendChild(p); list.appendChild(li);
      });
    };
    var say = function (m, bad) { status.textContent = m; status.className = bad ? 'err' : ''; };
    var load = function () {
      if (!GUESTBOOK_URL) { note.hidden = false; render(read(KEY) || []); return; }
      fetch(GUESTBOOK_URL).then(function (r) { return r.json(); }).then(function (d) { render(Array.isArray(d) ? d : []); })
        .catch(function () { render([]); say('Could not load the wishes just now.', true); });
    };
    ta.addEventListener('input', function () { count.textContent = ta.value.length + ' / 300'; });
    form.querySelectorAll('.chips button').forEach(function (b) {
      b.addEventListener('click', function () { ta.value = b.getAttribute('data-t'); ta.dispatchEvent(new Event('input')); ta.focus(); });
    });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (form.elements.website.value) return; // spam trap
      var name = nm.value.trim(), msg = ta.value.trim();
      if (!name || !msg) { say('Please add your name and a message.', true); return; }
      var last = Number(read(LAST) || 0);
      if (Date.now() - last < 30000) { say('Please wait a few seconds before sending another wish.', true); return; }
      var item = { t: new Date().toISOString(), name: name.slice(0, 40), msg: msg.slice(0, 300) };
      var done = function () {
        write(LAST, Date.now()); ta.value = ''; ta.dispatchEvent(new Event('input'));
        say('Thank you! Your wish has been sent.');
        var cur = Array.prototype.map.call(list.querySelectorAll('li:not(.wish-empty)'), function (li) {
          return { t: li.querySelector('time').getAttribute('data-t') || '', name: li.querySelector('.who').textContent, msg: li.querySelector('p').textContent };
        });
        render([item].concat(cur));
        list.firstChild.querySelector('time').setAttribute('data-t', item.t);
      };
      if (!GUESTBOOK_URL) { var arr = read(KEY) || []; arr.unshift(item); write(KEY, arr.slice(0, 100)); done(); return; }
      var btn = form.querySelector('button[type=submit]'); btn.disabled = true; say('Sending…');
      fetch(GUESTBOOK_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ name: item.name, msg: item.msg }) })
        .then(done).catch(function () { say('Sorry, that did not send. Please try again.', true); })
        .then(function () { btn.disabled = false; });
    });
    load();
  }
})();
