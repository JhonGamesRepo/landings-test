(() => {
  'use strict';

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const body = document.body;
  const intro = $('#intro');
  const introCracks = $('#introCracks');
  const heroCracks = $('#heroCracks');
  const bpmEl = $('#bpm');
  const msgEl = $('#introMsg');

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Idioma ES / EN ---------- */
  // El español vive en el HTML (data-i18n / data-i18n-attr) y se lee al cargar;
  // aquí sólo va el inglés y los textos que genera el JS.
  const I18N = {
    en: {
      title: 'Ataque de Pánico | Colombian Metal',
      description: 'Ataque de Pánico — Metal from Colombia. Listen to Malviajado and follow the band.',
      gateTip: 'Sound experience &middot; wear headphones',
      gateOn: 'Enter with sound',
      gateOff: 'No sound',
      skip: 'Skip &rarr;',
      homeLabel: 'Home',
      navLabel: 'Main navigation',
      navListen: 'Listen',
      navDiscs: 'Records',
      navBand: 'The band',
      navSocial: 'Social',
      kicker: 'Colombian &middot; Metal',
      title1: 'Fear',
      title2: 'can be',
      title3: 'deafening',
      heroSub: 'A racing heart, distortion and a trip you never asked for. Listen to <strong>Malviajado</strong>, the latest blow from Ataque de Pánico.',
      ctaSpotify: 'Listen on Spotify',
      ctaFollow: 'Follow the band',
      coverAlt: 'Malviajado cover: cracked blue face with yellow eyes',
      scrollLabel: 'Scroll down',
      marquee: 'Colombian Metal',
      listenTitle: 'Listen',
      playerTitle: 'Spotify player',
      listenLead: 'Put your headphones on. Turn it up until your chest shakes.',
      listenText: 'Malviajado is what happens when your pulse spikes and there is no way out: crushing riffs, cracking voices and an ending that leaves you staring at the ceiling.',
      openSpotify: 'Open in Spotify',
      discsTitle: 'Discography',
      altMalviajado: 'Malviajado cover',
      altFragmentado: 'Fragmentado cover',
      altCaras: 'Caras Vemos cover',
      altSevera: 'Severa Molleja cover',
      metaMalviajado: 'EP &middot; 2025 &middot; 4 songs',
      metaSevera: 'Album &middot; 2017 &middot; 7 songs',
      bandTitle: 'The band',
      bandQuote: '&ldquo;Everyone has a <em>panic attack</em>. We turn ours into songs.&rdquo;',
      factGenre: 'Genre',
      factOrigin: 'Origin',
      factLatest: 'Latest EP',
      socialTitle: 'Social',
      artistProfile: 'Artist profile',
      footerTag: 'Metal from Colombia',
      replay: 'Replay the attack &#8635;',
      npLabel: 'Player: Malviajado',
      npClose: 'Close player'
    }
  };
  const JS_TEXT = {
    es: {
      msg1: 'respira', msg2: 'todo está bien', msg3: 'no. no está bien',
      openMenu: 'Abrir menú', closeMenu: 'Cerrar menú',
      playHere: '&#9654; Escuchar aquí', inPlayer: '&#9835; En el reproductor',
      switchLang: 'Switch to English'
    },
    en: {
      msg1: 'breathe', msg2: 'everything is fine', msg3: 'no. it is not fine',
      openMenu: 'Open menu', closeMenu: 'Close menu',
      playHere: '&#9654; Play here', inPlayer: '&#9835; In the player',
      switchLang: 'Cambiar a español'
    }
  };

  const metaDesc = $('meta[name="description"]');
  const i18nAttrs = el => el.dataset.i18nAttr.split(';').map(pair => pair.split(':'));

  // leer el español del HTML
  I18N.es = { title: document.title, description: metaDesc.content };
  $$('[data-i18n]').forEach(el => { I18N.es[el.dataset.i18n] = el.innerHTML.trim(); });
  $$('[data-i18n-attr]').forEach(el => i18nAttrs(el).forEach(([attr, key]) => { I18N.es[key] = el.getAttribute(attr); }));

  let lang = 'es';
  const langHooks = [];
  const t = key => JS_TEXT[lang][key];

  function setLang(next) {
    lang = next === 'en' ? 'en' : 'es';
    const dict = I18N[lang];
    document.documentElement.lang = lang;
    document.title = dict.title;
    metaDesc.content = dict.description;
    $$('[data-i18n]').forEach(el => { el.innerHTML = dict[el.dataset.i18n]; });
    $$('[data-i18n-attr]').forEach(el => i18nAttrs(el).forEach(([attr, key]) => el.setAttribute(attr, dict[key])));
    $$('[data-lang-toggle]').forEach(btn => {
      btn.dataset.current = lang;
      btn.setAttribute('aria-label', t('switchLang'));
    });
    try { localStorage.setItem('adp-lang', lang); } catch (e) { /* sin almacenamiento */ }
    langHooks.forEach(fn => fn());
  }

  $$('[data-lang-toggle]').forEach(btn => btn.addEventListener('click', () => setLang(lang === 'es' ? 'en' : 'es')));

  let savedLang = null;
  try { savedLang = localStorage.getItem('adp-lang'); } catch (e) { /* sin almacenamiento */ }
  const browserLang = (navigator.languages || [navigator.language || 'es']).some(l => /^es\b/i.test(l)) ? 'es' : 'en';
  setLang(savedLang || browserLang);

  /* ---------- Grietas generadas (como las de la portada) ---------- */
  const rand = (a, b) => a + Math.random() * (b - a);

  function makeCrack(cx, cy, angle, r0, r1, step) {
    let a = angle;
    let r = r0;
    const pts = [[cx + Math.cos(a) * r, cy + Math.sin(a) * r]];
    while (r < r1) {
      r += rand(step * .5, step * 1.4);
      a += rand(-.22, .22);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    return { pts, a };
  }

  function toPath(pts) {
    return 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
  }

  function addPath(svg, d, width, delay) {
    const p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('pathLength', '1');
    p.setAttribute('stroke-width', width);
    p.style.setProperty('--d', delay.toFixed(2) + 's');
    svg.appendChild(p);
  }

  function drawCracks(svg, { rays = 16, cx = 500, cy = 500, r0 = 60, r1 = 820, width = 3, spread = .35 } = {}) {
    svg.innerHTML = '';
    for (let i = 0; i < rays; i++) {
      const angle = (i / rays) * Math.PI * 2 + rand(-.2, .2);
      const main = makeCrack(cx, cy, angle, r0 + rand(0, 40), r1 * rand(.7, 1), 45);
      const delay = rand(0, spread);
      addPath(svg, toPath(main.pts), width * rand(.6, 1.2), delay);

      // ramas secundarias
      const branches = Math.floor(rand(1, 4));
      for (let b = 0; b < branches; b++) {
        const idx = Math.floor(rand(2, main.pts.length - 1));
        const [bx, by] = main.pts[idx] || main.pts[0];
        const ba = angle + rand(-.9, .9);
        const len = rand(60, 220);
        const pts = [[bx, by]];
        let a = ba, x = bx, y = by, travelled = 0;
        while (travelled < len) {
          const s = rand(18, 40);
          a += rand(-.3, .3);
          x += Math.cos(a) * s;
          y += Math.sin(a) * s;
          travelled += s;
          pts.push([x, y]);
        }
        addPath(svg, toPath(pts), width * .45, delay + idx * .04);
      }
    }
  }

  /* ---------- Sonido: monitor cardíaco (Web Audio, sin archivos) ---------- */
  const Sound = (() => {
    let ctx = null;
    let master = null;
    let noiseBuf = null;
    let flat = null;
    let enabled = false;

    function init() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      if (!ctx) {
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = .35;
        master.connect(ctx.destination);
        noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
        const data = noiseBuf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      }
      if (ctx.state === 'suspended') ctx.resume();
      return true;
    }

    function tone(freq, t, dur, vol, type = 'sine') {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + .008);
      g.gain.setValueAtTime(vol, t + dur - .02);
      g.gain.linearRampToValueAtTime(0, t + dur);
      o.connect(g).connect(master);
      o.start(t);
      o.stop(t + dur + .02);
      return o;
    }

    function noise(t, dur, vol, filterType, freq) {
      const src = ctx.createBufferSource();
      const f = ctx.createBiquadFilter();
      const g = ctx.createGain();
      src.buffer = noiseBuf;
      f.type = filterType;
      f.frequency.value = freq;
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(.001, t + dur);
      src.connect(f).connect(g).connect(master);
      src.start(t);
      src.stop(t + dur);
    }

    return {
      enable(on) { enabled = !!on && init(); },
      get on() { return enabled; },

      // pitido del monitor
      beep() {
        if (!enabled) return;
        const t = ctx.currentTime;
        tone(1000, t, .12, .5);
        tone(2000, t, .12, .06);
      },

      // línea plana sostenida
      flatline() {
        if (!enabled) return;
        this.stopFlat(0);
        const t = ctx.currentTime;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = 1000;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(.45, t + .02);
        o.connect(g).connect(master);
        o.start(t);
        flat = { o, g };
      },

      stopFlat(fade = .3) {
        if (!flat || !ctx) return;
        const t = ctx.currentTime;
        flat.g.gain.cancelScheduledValues(t);
        flat.g.gain.setValueAtTime(flat.g.gain.value, t);
        flat.g.gain.linearRampToValueAtTime(0, t + fade + .01);
        flat.o.stop(t + fade + .02);
        flat = null;
      },

      // vidrio que se quiebra
      crack() {
        if (!enabled) return;
        const t = ctx.currentTime;
        noise(t, .5, .9, 'highpass', 2500);
        noise(t + .05, .25, .5, 'bandpass', 5000);
        tone(180, t, .18, .4, 'triangle');
      },

      // golpe grave al aparecer el logo
      boom() {
        if (!enabled) return;
        const t = ctx.currentTime;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.setValueAtTime(120, t);
        o.frequency.exponentialRampToValueAtTime(35, t + .9);
        g.gain.setValueAtTime(1, t);
        g.gain.exponentialRampToValueAtTime(.001, t + 1.2);
        o.connect(g).connect(master);
        o.start(t);
        o.stop(t + 1.25);
        noise(t, .35, .5, 'lowpass', 500);
      }
    };
  })();

  /* ---------- Malviajado desde el 3:50 al terminar el intro (Spotify iFrame API) ---------- */
  const Track = (() => {
    const START = 230; // 3:50 en segundos
    const dock = $('#nowPlaying');
    let controller = null;
    let wantPlay = false;
    let seeked = false;

    window.onSpotifyIframeApiReady = IFrameAPI => {
      IFrameAPI.createController($('#npEmbed'), {
        uri: 'spotify:track:2wTOSRYAEfcmZacERguOh2',
        width: '100%',
        height: 80
      }, c => {
        controller = c;
        // play() arranca desde el inicio: en cuanto suena, saltar al 3:50.
        // Sin sesión de Spotify sólo hay una vista previa de 30 s y no se puede saltar.
        c.addListener('playback_update', e => {
          const { isPaused, position, duration } = e.data;
          if (!seeked && !isPaused && duration > START * 1000 && position < START * 1000 - 1000) {
            seeked = true;
            c.seek(START);
          }
        });
        if (wantPlay) start();
      });
    };

    function start() {
      seeked = false;
      controller.play();
    }

    return {
      play() {
        wantPlay = true;
        dock.classList.add('is-show');
        if (controller) start();
      },
      stop() {
        wantPlay = false;
        dock.classList.remove('is-show');
        if (controller) controller.pause();
      }
    };
  })();

  $('#npClose').addEventListener('click', () => Track.stop());

  /* ---------- Intro: crisis de pánico ---------- */
  let timers = [];
  let bpmTimer = null;
  let introRunning = false;
  let soundChosen = false;

  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
    clearInterval(bpmTimer);
  }

  function runIntro() {
    clearTimers();
    Track.stop();
    introRunning = true;
    window.scrollTo(0, 0);
    body.classList.add('is-locked');
    // cerrar las mitades al instante, sin transición
    const halves = $$('.intro__half', intro);
    halves.forEach(h => { h.style.transition = 'none'; });
    intro.className = 'intro';
    void intro.offsetWidth;
    halves.forEach(h => { h.style.transition = ''; });
    intro.setAttribute('aria-hidden', 'false');
    bpmEl.textContent = '72';
    bpmEl.parentElement.classList.remove('is-high');
    msgEl.textContent = t('msg1');
    drawCracks(introCracks, { rays: 18, width: 2.4 });

    // la primera vez se pide un clic: los navegadores bloquean el audio sin interacción
    if (!soundChosen) {
      intro.classList.add('is-gate');
      return;
    }
    playIntro();
  }

  function playIntro() {
    intro.classList.remove('is-gate');

    if (reducedMotion) {
      intro.classList.add('is-logo');
      Sound.boom();
      later(endIntro, 900);
      return;
    }

    // pulso acelerando
    let bpm = 72;
    bpmTimer = setInterval(() => {
      bpm = Math.min(188, bpm + Math.round(rand(3, 9)));
      bpmEl.textContent = bpm;
      if (bpm > 130) bpmEl.parentElement.classList.add('is-high');
    }, 90);

    // un pitido por latido, al ritmo de los BPM actuales
    const bpmBox = bpmEl.parentElement;
    const beat = () => {
      Sound.beep();
      bpmBox.classList.remove('is-beat');
      void bpmBox.offsetWidth;
      bpmBox.classList.add('is-beat');
      later(beat, 60000 / bpm);
    };
    beat();

    later(() => intro.classList.add('is-pulse'), 600);
    later(() => { msgEl.textContent = t('msg2'); }, 700);
    later(() => { msgEl.textContent = t('msg3'); }, 1400);
    later(() => {
      clearTimers();
      intro.classList.add('is-crack');
      Sound.crack();
      Sound.flatline();
      queueRest();
    }, 2100);
  }

  // tras la ruptura (clearTimers corta el bucle de latidos)
  function queueRest() {
    later(() => intro.classList.add('is-eyes'), 800);
    later(() => {
      intro.classList.add('is-logo');
      Sound.stopFlat(.08);
      Sound.boom();
    }, 1500);
    later(endIntro, 3100);
  }

  // si se cambia el idioma en la pantalla previa
  langHooks.push(() => { if (intro.classList.contains('is-gate')) msgEl.textContent = t('msg1'); });

  $$('[data-sound]', intro).forEach(btn => btn.addEventListener('click', () => {
    soundChosen = true;
    Sound.enable(btn.dataset.sound === 'on');
    playIntro();
  }));

  function endIntro() {
    if (!introRunning) return;
    introRunning = false;
    clearTimers();
    Sound.stopFlat(.15);
    intro.classList.remove('is-gate');
    if (Sound.on) Track.play();
    intro.classList.add('is-crack', 'is-logo', 'is-out');
    intro.setAttribute('aria-hidden', 'true');
    body.classList.remove('is-locked');
    startPage();
    setTimeout(() => {
      if (!introRunning) intro.classList.add('is-done');
    }, 1100);
  }

  $('#introSkip').addEventListener('click', endIntro);
  document.addEventListener('keydown', e => {
    if (!introRunning) return;
    // en la pantalla previa Enter/espacio activan el botón enfocado
    const skipKey = e.key === 'Escape' || (!intro.classList.contains('is-gate') && (e.key === 'Enter' || e.key === ' '));
    if (skipKey) {
      e.preventDefault();
      endIntro();
    }
  });
  $('#replayIntro').addEventListener('click', runIntro);

  /* ---------- Página ---------- */
  let pageStarted = false;

  function startPage() {
    drawCracks(heroCracks, { rays: 22, cx: 760, cy: 480, r0: 120, r1: 900, width: 1.6, spread: .8 });
    requestAnimationFrame(() => heroCracks.classList.add('is-drawn'));
    if (pageStarted) return;
    pageStarted = true;
    initReveal();
  }

  // revelado al hacer scroll, con escalonado entre hermanos
  function initReveal() {
    const items = $$('.reveal');
    items.forEach(el => {
      const siblings = $$(':scope > .reveal', el.parentElement);
      el.style.setProperty('--rd', (siblings.indexOf(el) * .12) + 's');
    });

    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
    items.forEach(el => io.observe(el));
  }

  // header al hacer scroll
  const header = $('#header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // menú móvil
  const toggle = $('#navToggle');
  const nav = $('#nav');
  const setNav = open => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', t(open ? 'closeMenu' : 'openMenu'));
    body.classList.toggle('is-locked', open);
  };
  toggle.addEventListener('click', () => setNav(!nav.classList.contains('is-open')));
  langHooks.push(() => toggle.setAttribute('aria-label', t(nav.classList.contains('is-open') ? 'closeMenu' : 'openMenu')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setNav(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) setNav(false);
  });

  // discografía: "Escuchar aquí" carga el disco en el reproductor de la sección Escuchar
  const listenEmbed = $('#listenEmbed');
  const listenLink = $('.listen__copy .btn');
  const playBtns = $$('.disc__play');
  let currentBtn = playBtns[0];
  const markCurrent = btn => playBtns.forEach(b => {
    currentBtn = btn;
    const on = b === btn;
    b.classList.toggle('is-current', on);
    b.innerHTML = t(on ? 'inPlayer' : 'playHere');
  });
  playBtns.forEach(btn => btn.addEventListener('click', () => {
    const path = btn.dataset.embed;
    listenEmbed.src = `https://open.spotify.com/embed/${path}?utm_source=generator&theme=0`;
    listenLink.href = `https://open.spotify.com/${path}`;
    markCurrent(btn);
    $('#escuchar').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  }));
  markCurrent(currentBtn);
  langHooks.push(() => markCurrent(currentBtn));

  // portada con inclinación 3D
  const cover = $('.cover');
  const tilt = $('#coverTilt');
  if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
    cover.addEventListener('mousemove', e => {
      const r = cover.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      tilt.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
    });
    cover.addEventListener('mouseleave', () => { tilt.style.transform = ''; });
  }

  langHooks.forEach(fn => fn()); // aplicar el idioma inicial a lo creado después de setLang
  runIntro();
})();
