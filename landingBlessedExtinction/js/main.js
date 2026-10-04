(() => {
  const SPLASH_DURATION = 7000; // ms — mantener sincronizado con $splash-duration en el SCSS
  const SILENCE_GAP = 1500;     // ms de silencio entre el sonido de ultratumba y la canción
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----- Idioma ES / EN -----
  // El español vive en el HTML; aquí sólo está el inglés. Los elementos se marcan con
  // data-i18n (texto), data-i18n-html (HTML) o data-i18n-attr="atributo:clave;...".
  const EN = {
    'meta.title': 'Blessed Extinction | Death Metal · Bogotá',
    'meta.description': 'Blessed Extinction — Death Metal since 2013, Bogotá, Colombia. New single “Incorruptible Cadavérico” out now on all platforms.',
    'splash.label': 'Welcome screen',
    'splash.kicker': 'New single',
    'splash.enter': 'Enter',
    'nav.label': 'Main navigation',
    'nav.menu': 'Open menu',
    'nav.home': 'Home',
    'nav.music': 'Music',
    'nav.videos': 'Videos',
    'nav.listen': 'Listen',
    'nav.band': 'Band',
    'nav.tour': 'Shows',
    'nav.contact': 'Contact',
    'hero.kicker': 'New single',
    'hero.subtitle': 'Metal from Bogotá, Colombia, since 2013. The new single is out now with its official lyric video.',
    'hero.watch': 'Watch lyric video',
    'hero.spotify': 'Listen on Spotify',
    'hero.scroll': 'Scroll down',
    'disc.title': 'Discography',
    'disc.new': 'New',
    'disc.newSingle': 'New single',
    'disc.altInc': 'Cover of the single Incorruptible Cadavérico',
    'disc.altSie': 'Cover of the single Siembra de Cadáveres',
    'disc.altVen': 'Cover of the EP Venganza Natural',
    'player.tabs': 'Choose a release',
    'player.title': 'Spotify player — Blessed Extinction',
    'video.official': 'Official video',
    'video.lyric': 'Official lyric video',
    'video.video': 'Video',
    'video.channel': 'Visit YouTube channel',
    'video.playInc': 'Play the Incorruptible Cadavérico lyric video',
    'video.playSie': 'Play the Siembra de Cadáveres official video',
    'video.playDes': 'Play the Desollados video',
    'platforms.title': 'Listen & Follow',
    'platforms.platforms': 'Platforms',
    'platforms.social': 'Social media',
    'bio.photoAlt': 'Blessed Extinction, left to right: Jhon Hernández, William Ruiz, Julio Sarmiento, Carlos Sarmiento and Julián Franco',
    'bio.photoZoom': 'View full photo',
    'bio.photoCaption': 'Bogotá · Since 2013',
    'bio.photoDialog': 'Band photo',
    'bio.photoClose': 'Close',
    'bio.title': 'The Band',
    'bio.p1': 'Blessed Extinction is a Colombian metal band that came together in Bogotá in late 2013, influenced by Death Metal, Thrash and New York Hardcore. The band was born after the breakup of its members’ previous projects, with one main goal: to build a solid, consistent band that leaves its mark on the history of Colombian metal, like other major bands from our country.',
    'bio.p2': 'An apocalyptic world and social decline are among the main themes of the band’s lyrics, along with personal experiences and thoughts, driven by heavy guitar riffs and aggressive vocals.',
    'bio.p3': 'After the EP <em>Venganza Natural</em> and the single <em>Siembra de Cadáveres</em>, the band presents its new single <em>Incorruptible Cadavérico</em>.',
    'bio.members': 'Members',
    'role.vocals': 'Vocals',
    'role.guitar': 'Guitar',
    'role.bass': 'Bass',
    'role.drums': 'Drums',
    'tour.title': 'Upcoming Shows',
    'tour.emptyTitle': 'No dates announced yet',
    'tour.emptyText': 'New dates will be announced soon. Follow us on social media to hear about them first.',
    'footer.tagline': 'Death Metal since 2013 · Bogotá, Colombia',
    'footer.contact': 'Contact',
    'footer.contactText': 'Booking, press and collaborations:',
    'footer.replay': 'Replay the beginning ↻',
    'splash.hint': 'Sound experience · turn up the volume',
    'splash.mute': 'Enter without sound',
    'splash.skip': 'Skip intro ⏭',
    'np.tap': 'Press ▶ to listen',
    'np.close': 'Close player',
  };

  const LANG_KEY = 'be-lang';
  const ES = {}; // textos originales en español, tomados del HTML
  const i18nText = document.querySelectorAll('[data-i18n]');
  const i18nHtml = document.querySelectorAll('[data-i18n-html]');
  const i18nAttr = document.querySelectorAll('[data-i18n-attr]');
  const attrPairs = (el) => el.dataset.i18nAttr.split(';').map((pair) => pair.split(':'));

  i18nText.forEach((el) => { ES[el.dataset.i18n] = el.textContent; });
  i18nHtml.forEach((el) => { ES[el.dataset.i18nHtml] = el.innerHTML; });
  i18nAttr.forEach((el) => attrPairs(el).forEach(([attr, key]) => { ES[key] = el.getAttribute(attr); }));

  const setLang = (lang) => {
    const dict = lang === 'en' ? EN : ES;
    const t = (key) => dict[key] ?? ES[key];
    document.documentElement.lang = lang;
    i18nText.forEach((el) => { el.textContent = t(el.dataset.i18n); });
    i18nHtml.forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    i18nAttr.forEach((el) => attrPairs(el).forEach(([attr, key]) => {
      if (el.hasAttribute(attr)) el.setAttribute(attr, t(key));
    }));
    document.querySelectorAll('.lang__btn').forEach((btn) =>
      btn.setAttribute('aria-pressed', btn.dataset.lang === lang)
    );
    try { localStorage.setItem(LANG_KEY, lang); } catch (_) { /* almacenamiento no disponible */ }
  };

  let savedLang = null;
  try { savedLang = localStorage.getItem(LANG_KEY); } catch (_) { /* almacenamiento no disponible */ }
  const browserLang = (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en';
  setLang(savedLang === 'es' || savedLang === 'en' ? savedLang : browserLang);

  document.querySelectorAll('.lang__btn').forEach((btn) =>
    btn.addEventListener('click', () => setLang(btn.dataset.lang))
  );

  // ----- Sonido de ultratumba (sintetizado con Web Audio, sin archivos) -----
  // Drone grave disonante, viento, coro fantasmal y campanas en una catedral (reverb).
  const Ultratumba = (() => {
    let ctx = null;
    let master = null;

    const noiseBuffer = (seconds) => {
      const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let n = 0; n < data.length; n++) data[n] = Math.random() * 2 - 1;
      return buf;
    };

    // Respuesta al impulso: ruido que decae → eco de nave de catedral
    const cathedral = (seconds, decay) => {
      const len = ctx.sampleRate * seconds;
      const buf = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = buf.getChannelData(ch);
        for (let n = 0; n < len; n++) data[n] = (Math.random() * 2 - 1) * Math.pow(1 - n / len, decay);
      }
      return buf;
    };

    const bell = (bus, at, freq, level) => {
      // Parciales inarmónicos de campana de iglesia
      [1, 2.01, 2.76, 4.07, 5.43, 6.8].forEach((ratio, k) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.value = freq * ratio;
        const peak = level / (k + 1);
        g.gain.setValueAtTime(0, at);
        g.gain.linearRampToValueAtTime(peak, at + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 4.5 / (1 + k * 0.4));
        osc.connect(g).connect(bus);
        osc.start(at);
        osc.stop(at + 5);
      });
    };

    const play = (dur) => {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      const now = ctx.currentTime;

      master = ctx.createGain();
      master.gain.setValueAtTime(0, now);
      master.gain.linearRampToValueAtTime(0.85, now + 0.8);
      // Se apaga solo antes del final de la intro (incluida la cola de reverb)
      master.gain.setValueAtTime(0.85, now + dur - 2);
      master.gain.linearRampToValueAtTime(0, now + dur - 0.3);
      const comp = ctx.createDynamicsCompressor();
      master.connect(comp).connect(ctx.destination);

      const bus = ctx.createGain();
      const dry = ctx.createGain();
      const wet = ctx.createGain();
      const reverb = ctx.createConvolver();
      dry.gain.value = 0.55;
      wet.gain.value = 0.7;
      reverb.buffer = cathedral(5, 2.2);
      bus.connect(dry).connect(master);
      bus.connect(reverb).connect(wet).connect(master);

      const end = now + dur;

      // Golpe sub-grave al abrirse la puerta
      const boom = ctx.createOscillator();
      const boomG = ctx.createGain();
      boom.frequency.setValueAtTime(70, now);
      boom.frequency.exponentialRampToValueAtTime(28, now + 1.4);
      boomG.gain.setValueAtTime(0.9, now);
      boomG.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      boom.connect(boomG).connect(bus);
      boom.start(now);
      boom.stop(now + 2);

      // Drone: E1 y su tritono, sierras desafinadas a través de un filtro que se abre
      const droneLP = ctx.createBiquadFilter();
      droneLP.type = 'lowpass';
      droneLP.Q.value = 5;
      droneLP.frequency.setValueAtTime(80, now);
      droneLP.frequency.linearRampToValueAtTime(380, now + dur);
      const droneG = ctx.createGain();
      droneG.gain.value = 0.2;
      droneLP.connect(droneG).connect(bus);
      [[41.2, -8], [41.2, 9], [58.27, 0], [82.4, 4]].forEach(([f, detune]) => {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = f;
        o.detune.value = detune;
        o.connect(droneLP);
        o.start(now);
        o.stop(end);
      });

      // Viento / aliento: ruido filtrado con barrido lento
      const wind = ctx.createBufferSource();
      wind.buffer = noiseBuffer(2);
      wind.loop = true;
      const windBP = ctx.createBiquadFilter();
      windBP.type = 'bandpass';
      windBP.Q.value = 7;
      windBP.frequency.value = 450;
      const windLfo = ctx.createOscillator();
      const windDepth = ctx.createGain();
      windLfo.frequency.value = 0.25;
      windDepth.gain.value = 260;
      windLfo.connect(windDepth).connect(windBP.frequency);
      const windG = ctx.createGain();
      windG.gain.setValueAtTime(0, now);
      windG.gain.linearRampToValueAtTime(0.35, now + 1.5);
      wind.connect(windBP).connect(windG).connect(bus);
      wind.start(now);
      windLfo.start(now);
      wind.stop(end);
      windLfo.stop(end);

      // Coro fantasmal: acorde disminuido con vibrato, entra con el título
      const choirLP = ctx.createBiquadFilter();
      choirLP.type = 'lowpass';
      choirLP.frequency.value = 1400;
      const choirG = ctx.createGain();
      choirG.gain.setValueAtTime(0, now);
      choirG.gain.linearRampToValueAtTime(0, now + 3.2);
      choirG.gain.linearRampToValueAtTime(0.07, now + 4.6);
      choirLP.connect(choirG).connect(bus);
      [164.81, 196, 233.08, 329.63].forEach((f, k) => {
        const o = ctx.createOscillator();
        const vib = ctx.createOscillator();
        const vibDepth = ctx.createGain();
        o.type = 'triangle';
        o.frequency.value = f;
        vib.frequency.value = 4.5 + k * 0.3;
        vibDepth.gain.value = f * 0.012;
        vib.connect(vibDepth).connect(o.frequency);
        o.connect(choirLP);
        o.start(now);
        vib.start(now);
        o.stop(end);
        vib.stop(end);
      });

      // Campanadas: cuando aparece el logo y cuando se revela el título
      bell(bus, now + 0.6, 98, 0.22);
      bell(bus, now + 2.2, 73.4, 0.18);
      bell(bus, now + 3.8, 98, 0.2);
    };

    const stop = (fade = 1.5) => {
      if (!ctx || !master) return;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + fade);
      const old = ctx;
      ctx = null;
      setTimeout(() => old.close(), (fade + 0.2) * 1000);
    };

    return { play, stop };
  })();

  // ----- Canción al entrar: "Incorruptible Cadavérico" en Spotify desde el 1:30 -----
  // El reproductor se crea oculto al cargar la página para que esté listo al entrar.
  // Spotify sólo entrega la canción completa a visitantes con sesión iniciada; sin
  // sesión reproduce una vista previa corta, así que el salto a 1:30 se hace sólo
  // cuando la pista dura más que eso (saltar más allá de la vista previa la detiene).
  const Music = (() => {
    const SONG_START = 90; // segundos
    const SPOTIFY_URI = 'spotify:track:3SSYo3fM6wHw28QY71RTwC';
    const box = document.getElementById('nowPlaying');
    let controller = null;
    let wantPlay = false;
    let playing = false;
    let seeked = false;
    let fullTrack = false;   // true si Spotify entrega la canción completa (sesión iniciada)
    let startedOnce = false;

    window.onSpotifyIframeApiReady = (api) => {
      api.createController(document.getElementById('npSpotify'), { uri: SPOTIFY_URI, width: '100%', height: 80 }, (c) => {
        controller = c;
        c.addListener('ready', () => { if (wantPlay) c.play(); });
        c.addListener('playback_update', ({ data }) => {
          playing = !data.isPaused;
          if (data.duration) fullTrack = data.duration > SONG_START * 1000;
          if (playing) box.classList.remove('needs-tap');
          if (playing && !data.isBuffering && !seeked && data.duration > SONG_START * 1000) {
            seeked = true;
            if (data.position < (SONG_START - 2) * 1000) c.seek(SONG_START);
          }
        });
      });
    };
    const script = document.createElement('script');
    script.src = 'https://open.spotify.com/embed/iframe-api/v1';
    script.async = true;
    document.head.appendChild(script);

    const setVisible = (visible) => {
      box.classList.toggle('is-offstage', !visible);
      document.body.classList.toggle('has-player', visible); // deja sitio al final de la página
      box.inert = !visible;
      box.setAttribute('aria-hidden', String(!visible));
    };

    const start = () => {
      wantPlay = true;
      setVisible(true);
      // Al repetir la intro, la canción vuelve al 1:30 (o al inicio de la vista previa)
      if (controller && startedOnce) controller.seek(fullTrack ? SONG_START : 0);
      startedOnce = true;
      if (controller) controller.play();
      // Si el navegador bloqueó la reproducción automática, invitar a pulsar play
      setTimeout(() => { if (wantPlay && !playing) box.classList.add('needs-tap'); }, 4000);
    };

    const pause = () => {
      wantPlay = false;
      if (controller && playing) controller.pause();
    };

    document.getElementById('npClose').addEventListener('click', () => {
      pause();
      box.classList.remove('needs-tap');
      setVisible(false);
    });

    return { start, pause };
  })();

  // ----- Splash screen (Incorruptible Cadavérico) -----
  const splash = document.getElementById('splash');
  const enterBtn = document.getElementById('splashEnter');

  // Título: cada letra en un <span> para revelarla en secuencia
  const title = document.getElementById('splashTitle');
  title.setAttribute('aria-label', title.textContent);
  let i = 0;
  title.innerHTML = title.textContent
    .split(' ')
    .map((word) => `<span class="word" aria-hidden="true">${[...word]
      .map((ch) => `<span class="char" style="--i:${i++}">${ch}</span>`)
      .join('')}</span>`)
    .join(' ');

  // Polvo dorado flotando como en la nave de una catedral
  const dust = document.getElementById('splashDust');
  if (!reduceMotion) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('span');
      const rnd = (min, max) => (Math.random() * (max - min) + min).toFixed(2);
      p.style.left = `${rnd(0, 100)}%`;
      p.style.setProperty('--s', `${rnd(1, 3.5)}px`);
      p.style.setProperty('--d', `${rnd(5, 11)}s`);
      p.style.setProperty('--delay', `${rnd(-10, 0)}s`);
      p.style.setProperty('--x', `${rnd(-60, 60)}px`);
      p.style.setProperty('--o', rnd(0.3, 0.9));
      frag.appendChild(p);
    }
    dust.appendChild(frag);
  }

  let closed = false;
  const closeSplash = () => {
    if (closed) return;
    closed = true;
    splash.classList.add('is-hidden');
    document.body.classList.remove('is-locked');
    // Se oculta (no se elimina) para poder repetir la intro desde el pie de página
    splash.addEventListener('transitionend', () => { if (closed) splash.style.display = 'none'; }, { once: true });
  };

  let started = false;
  let withSound = true;
  let timer = null;

  const enterSite = (gap = SILENCE_GAP) => {
    if (closed) return;
    clearTimeout(timer);
    Ultratumba.stop(0.4);
    closeSplash();
    // Pausa de silencio antes de la canción para que no se monten los sonidos
    if (withSound) setTimeout(Music.start, gap);
  };

  // El clic en "Entrar" es el gesto que permite al navegador reproducir sonido
  const startSequence = (sound) => {
    if (started) return;
    started = true;
    withSound = sound;
    if (sound) Ultratumba.play(SPLASH_DURATION / 1000);
    splash.classList.remove('is-waiting');
    splash.classList.add('is-playing');
    timer = setTimeout(enterSite, SPLASH_DURATION);
  };

  enterBtn.addEventListener('click', () => startSequence(true));
  // Saltar intro: desde la puerta entra directo con la canción (el clic habilita el
  // audio); durante la secuencia respeta la elección hecha y la pausa de silencio
  document.getElementById('splashSkip').addEventListener('click', () => {
    if (!started) {
      started = true;
      withSound = true;
      enterSite(0);
    } else {
      enterSite();
    }
  });
  document.getElementById('splashMute').addEventListener('click', () => startSequence(false));
  document.addEventListener('keydown', (e) => {
    if (closed) return;
    if (e.key === 'Escape') {
      // Saltar la intro. Si aún no se eligió, entra sin sonido (Esc no habilita audio)
      if (!started) { started = true; withSound = false; }
      enterSite();
    } else if (e.key === 'Enter' && !e.target.closest('button')) {
      startSequence(true);
    }
  });

  // Repetir la intro (botón del pie). Volver a mostrar el splash tras display:none
  // reinicia sus animaciones; el clic del botón vuelve a habilitar el sonido.
  document.getElementById('replayIntro').addEventListener('click', () => {
    if (!closed) return;
    Music.pause();
    window.scrollTo({ top: 0, behavior: 'instant' });
    splash.classList.remove('is-hidden', 'is-playing');
    splash.classList.add('is-waiting', 'is-replay');
    splash.style.display = '';
    void splash.offsetWidth; // aplicar el estado inicial antes de arrancar
    document.body.classList.add('is-locked');
    closed = false;
    started = false;
    startSequence(withSound);
  });

  // ----- Header al hacer scroll -----
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ----- Menú móvil -----
  const toggle = document.getElementById('navToggle');
  const navList = document.getElementById('navList');
  toggle.addEventListener('click', () => {
    const open = navList.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
  });
  navList.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      navList.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );

  // ----- Videos de YouTube (fachada: el iframe se carga al hacer clic) -----
  // YouTube exige un Referer (error 153 sin él). Abierta como archivo local
  // (file://) la página no envía ninguno, así que ahí se abre el video en YouTube.
  const canEmbed = location.protocol === 'http:' || location.protocol === 'https:';
  document.querySelectorAll('.yt[data-yt]').forEach((btn) => {
    const id = btn.dataset.yt;
    btn.style.setProperty('--thumb', `url("https://i.ytimg.com/vi/${id}/hqdefault.jpg")`);
    btn.addEventListener('click', () => {
      if (btn.querySelector('iframe')) return;
      Music.pause();
      if (!canEmbed) {
        window.open(`https://www.youtube.com/watch?v=${id}`, '_blank', 'noopener');
        return;
      }
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&origin=${encodeURIComponent(location.origin)}`;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.title = btn.getAttribute('aria-label');
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      btn.replaceChildren(iframe);
      btn.removeAttribute('aria-label');
    });
  });

  // ----- Reproductor de Spotify: cambiar de lanzamiento -----
  const spotifyFrame = document.getElementById('spotifyFrame');
  // Al interactuar con el reproductor de la discografía, pausar la canción de fondo
  window.addEventListener('blur', () => {
    if (document.activeElement === spotifyFrame) Music.pause();
  });
  // Cada portada de abajo muestra su funda, sus datos y su álbum en el
  // reproductor; el color de acento sigue al lanzamiento (data-release)
  const disc = document.getElementById('disc');
  const picks = disc.querySelectorAll('.disc__pick');
  const panes = disc.querySelectorAll('.disc__record, .disc__info');
  picks.forEach((pick) =>
    pick.addEventListener('click', () => {
      const id = pick.dataset.release;
      if (disc.dataset.release === id) return;
      disc.dataset.release = id;
      picks.forEach((p) => p.setAttribute('aria-selected', p === pick));
      panes.forEach((p) => { p.hidden = p.dataset.release !== id; });
      spotifyFrame.src = `https://open.spotify.com/embed/album/${pick.dataset.album}?utm_source=generator&theme=0`;
    })
  );

  // ----- Foto de la banda: lightbox -----
  const lightbox = document.getElementById('lightbox');
  document.getElementById('bioZoom').addEventListener('click', () => lightbox.showModal());
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.closest('#lightboxClose')) lightbox.close();
  });

  // ----- Linterna con parallax en «Escucha & Sigue» -----
  // La luz y el parallax siguen al cursor (o al dedo); sin puntero, la luz deriva
  // sola. Los valores se suavizan en cada cuadro y el bucle sólo corre mientras
  // la sección está en pantalla.
  const lantern = document.getElementById('lantern');
  const listen = document.getElementById('escuchar');
  if (reduceMotion) {
    lantern.style.setProperty('--my', '35%');
  } else {
    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let pointerInside = false;
    let visible = false;
    let frame = 0;
    let t = 0;

    const onPointer = (e) => {
      const r = listen.getBoundingClientRect();
      target.x = e.clientX - r.left;
      target.y = e.clientY - r.top;
      pointerInside = true;
    };
    listen.addEventListener('pointermove', onPointer);
    listen.addEventListener('pointerdown', onPointer);
    listen.addEventListener('pointerleave', () => { pointerInside = false; });

    const tick = () => {
      const w = listen.clientWidth;
      const h = listen.clientHeight;
      if (!pointerInside) {
        t += 0.005;
        target.x = w * (0.5 + 0.3 * Math.sin(t));
        target.y = h * (0.42 + 0.18 * Math.sin(t * 1.7));
      }
      pos.x += (target.x - pos.x) * 0.12;
      pos.y += (target.y - pos.y) * 0.12;
      lantern.style.setProperty('--mx', `${pos.x}px`);
      lantern.style.setProperty('--my', `${pos.y}px`);
      lantern.style.setProperty('--px', ((pos.x / w) * 2 - 1).toFixed(3));
      lantern.style.setProperty('--py', ((pos.y / h) * 2 - 1).toFixed(3));
      frame = visible ? requestAnimationFrame(tick) : 0;
    };

    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) {
        if (!pos.x) { pos.x = listen.clientWidth / 2; pos.y = listen.clientHeight * 0.42; }
        frame = requestAnimationFrame(tick);
      }
    }).observe(listen);
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
