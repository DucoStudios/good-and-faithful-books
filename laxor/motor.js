// Läxportalens motor: sparning, inloggning, ljud, uppläsning, mikrofon, konfetti och kompisar.
window.LP = (() => {
  const NYCKEL = 'laxportal.v1';

  // ---------- Sparning (lokalt i webbläsaren) ----------
  function lasIn() {
    try { return JSON.parse(localStorage.getItem(NYCKEL)) || {}; } catch (e) { return {}; }
  }
  const data = lasIn();
  data.laxor = data.laxor || {};
  data.installningar = Object.assign({ talaIProv: true, ljud: true }, data.installningar || {});
  function spara() {
    try { localStorage.setItem(NYCKEL, JSON.stringify(data)); } catch (e) { /* privat läge */ }
  }
  function laxdata(id) {
    if (!data.laxor[id]) data.laxor[id] = { stjarnor: {}, klar: false, provforsok: 0 };
    return data.laxor[id];
  }
  function sattStjarnor(laxa, lage, antal) {
    const d = laxdata(laxa);
    const gammal = d.stjarnor[lage] || 0;
    if (antal > gammal) d.stjarnor[lage] = antal;
    spara();
    return antal > gammal;
  }
  function totalaStjarnor() {
    let s = 0;
    for (const id in data.laxor) {
      const l = data.laxor[id];
      for (const m in l.stjarnor) s += l.stjarnor[m];
      if (l.klar) s += 5;
    }
    return s;
  }

  // ---------- Inloggning ----------
  function arInne() {
    try { return sessionStorage.getItem('laxportal.inne') === 'ja'; } catch (e) { return window.__inne === true; }
  }
  function loggaIn(pin) {
    if (String(pin) !== String(window.LAXPORTAL_CONFIG.pin)) return false;
    try { sessionStorage.setItem('laxportal.inne', 'ja'); } catch (e) { window.__inne = true; }
    return true;
  }
  function loggaUt() {
    try { sessionStorage.removeItem('laxportal.inne'); } catch (e) { window.__inne = false; }
  }

  // ---------- Läxor ----------
  const laxor = {};
  function registreraLaxa(l) { laxor[l.id] = l; }

  // ---------- Hjälpare ----------
  const $ = (s, r = document) => r.querySelector(s);
  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function blanda(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const vanta = (ms) => new Promise((r) => setTimeout(r, ms));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------- Bedömning av skrivna svar ----------
  function norm(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[’`´‘]/g, "'")
      .replace(/œ/g, 'oe')
      .replace(/æ/g, 'ae')
      .replace(/\s*-\s*/g, '-')
      .replace(/\s*'\s*/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }
  const utanAccent = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  const ARTIKEL = /^(le |la |les |l')/;
  function facit(item) { return [item.fr].concat(item.alt || []).map(norm); }
  function bedom(svar, item, laxa) {
    const a = norm(svar);
    if (!a) return { ok: false, tom: true };
    const f = facit(item);
    if (f.includes(a)) return { ok: true };
    if (f.map(utanAccent).includes(utanAccent(a))) return { ok: false, nastan: true, tips: 'Nästan! Kolla accenterna (é, è, ê …).' };
    const utanStreck = (x) => utanAccent(x).replace(/-/g, ' ');
    if (f.map(utanStreck).includes(utanStreck(a))) return { ok: false, nastan: true, tips: 'Nästan! Kolla bindestrecken ( - ).' };
    if (laxa && laxa.artikel) {
      const ord = f.map((x) => utanAccent(x.replace(ARTIKEL, '')));
      const a2 = utanAccent(a.replace(ARTIKEL, ''));
      if (ord.includes(a2)) {
        const ratt = norm(item.fr).match(ARTIKEL);
        if (!ARTIKEL.test(a)) return { ok: false, nastan: true, tips: 'Nästan! Glöm inte le, la, l\' eller les framför.' };
        return { ok: false, nastan: true, tips: 'Nästan! Det ska vara ' + (ratt ? ratt[1].trim() : 'en annan artikel') + ' framför.' };
      }
    }
    return { ok: false };
  }

  // ---------- Matchning av det hon säger ----------
  function horMatch(alternativ, item) {
    const rena = (s) => ' ' + utanAccent(norm(s)).replace(/[.,!?;:"]/g, ' ').replace(/-/g, ' ').replace(/'/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
    const mal = [item.fr].concat(item.alt || [], item.hor || []).map(rena);
    mal.slice().forEach((m) => {
      const utan = m.replace(/^ (le|la|les|l) /, ' ');
      if (utan !== m) mal.push(utan);
    });
    if (/^\d+$/.test(item.id)) mal.push(' ' + item.id + ' ');
    return alternativ.some((t) => {
      const r = rena(t);
      return mal.some((m) => m.trim() && r.includes(m));
    });
  }

  // ---------- Uppläsning ----------
  let roster = [];
  function laddaRoster() { roster = window.speechSynthesis ? speechSynthesis.getVoices() : []; }
  if (window.speechSynthesis) {
    laddaRoster();
    speechSynthesis.onvoiceschanged = laddaRoster;
  }
  function valjRost(lang) {
    const kort = lang.slice(0, 2);
    const mojliga = roster.filter((v) => v.lang && v.lang.replace('_', '-').toLowerCase().startsWith(kort));
    const exakt = mojliga.filter((v) => v.lang.replace('_', '-').toLowerCase() === lang.toLowerCase());
    const lista = exakt.length ? exakt : mojliga;
    const bra = ['Amélie', 'Amelie', 'Audrey', 'Thomas', 'Google français', 'Marie', 'Alva', 'Klara', 'Google svenska'];
    for (const namn of bra) {
      const v = lista.find((x) => x.name.includes(namn));
      if (v) return v;
    }
    return lista[0] || null;
  }
  function sag(text, lang = 'fr-FR', fart = 0.85) {
    return new Promise((klar) => {
      if (!window.speechSynthesis) return klar();
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      const v = valjRost(lang);
      if (v) u.voice = v;
      u.rate = fart;
      u.pitch = 1.05;
      let gjort = false;
      const slut = () => { if (!gjort) { gjort = true; klar(); } };
      u.onend = slut;
      u.onerror = slut;
      setTimeout(slut, 600 + text.length * 160);
      speechSynthesis.speak(u);
    });
  }

  // ---------- Mikrofon ----------
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const kanHora = !!SR;
  function hor(lang = 'fr-FR') {
    return new Promise((klar, fel) => {
      if (!SR) return fel(new Error('stöds-inte'));
      const r = new SR();
      r.lang = lang;
      r.interimResults = false;
      r.maxAlternatives = 6;
      r.continuous = false;
      let fick = false;
      r.onresult = (e) => {
        fick = true;
        const alt = [];
        for (let i = 0; i < e.results.length; i++) for (let j = 0; j < e.results[i].length; j++) alt.push(e.results[i][j].transcript);
        klar(alt);
      };
      r.onerror = (e) => { fick = true; fel(new Error(e.error || 'fel')); };
      r.onend = () => { if (!fick) klar([]); };
      try { r.start(); } catch (e) { fel(e); }
      setTimeout(() => { try { r.stop(); } catch (e) {} }, 6000);
    });
  }

  // ---------- Ljudeffekter ----------
  let ac = null;
  function ton(frekvens, start, langd, typ = 'sine', vol = 0.18) {
    if (!data.installningar.ljud) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const t = ac.currentTime + start;
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = typ;
      o.frequency.setValueAtTime(frekvens, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + langd);
      o.connect(g).connect(ac.destination);
      o.start(t);
      o.stop(t + langd + 0.05);
    } catch (e) {}
  }
  const ljud = {
    klick: () => ton(660, 0, 0.08, 'triangle', 0.08),
    ratt: () => { ton(784, 0, 0.15, 'triangle'); ton(1046, 0.1, 0.25, 'triangle'); },
    fel: () => { ton(330, 0, 0.18, 'sine', 0.12); ton(262, 0.15, 0.25, 'sine', 0.1); },
    pop: () => { ton(900, 0, 0.06, 'square', 0.06); ton(1400, 0.03, 0.08, 'triangle', 0.08); },
    vandning: () => ton(520, 0, 0.1, 'triangle', 0.07),
    stjarna: (i = 0) => ton(880 + i * 220, 0, 0.3, 'triangle', 0.14),
    fanfar: () => {
      [523, 659, 784, 1046].forEach((f, i) => ton(f, i * 0.13, 0.3, 'triangle', 0.16));
      [523, 659, 784].forEach((f) => ton(f, 0.62, 0.9, 'triangle', 0.1));
      ton(1046, 0.62, 1.1, 'triangle', 0.14);
    },
  };

  // ---------- Konfetti ----------
  let duk, ctx, bitar = [], igang = false;
  const FARGER = ['#ff7a2f', '#f5b81f', '#2fb36b', '#3d7be0', '#e5484d', '#b65cf0', '#ff9ec7'];
  function sakerstallDuk() {
    if (duk) return;
    duk = document.createElement('canvas');
    duk.className = 'konfetti-duk';
    document.body.appendChild(duk);
    ctx = duk.getContext('2d');
    const storlek = () => { duk.width = innerWidth * devicePixelRatio; duk.height = innerHeight * devicePixelRatio; };
    storlek();
    addEventListener('resize', storlek);
  }
  function konfetti({ x = innerWidth / 2, y = innerHeight / 2, antal = 60, kraft = 9, regn = false } = {}) {
    sakerstallDuk();
    const d = devicePixelRatio;
    for (let i = 0; i < antal; i++) {
      const vinkel = regn ? Math.PI / 2 : Math.random() * Math.PI * 2;
      const fart = regn ? Math.random() * 2 + 1 : Math.random() * kraft + kraft * 0.4;
      bitar.push({
        x: (regn ? Math.random() * innerWidth : x) * d,
        y: (regn ? -20 - Math.random() * innerHeight * 0.6 : y) * d,
        vx: Math.cos(vinkel) * fart * d * (regn ? 0.3 : 1),
        vy: (Math.sin(vinkel) * fart - (regn ? 0 : kraft * 0.5)) * d,
        s: (Math.random() * 7 + 5) * d,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        f: FARGER[i % FARGER.length],
        form: Math.random() < 0.3 ? 'rund' : 'rekt',
        liv: 0,
      });
    }
    if (!igang) { igang = true; requestAnimationFrame(rita); }
  }
  function rita() {
    ctx.clearRect(0, 0, duk.width, duk.height);
    const d = devicePixelRatio;
    bitar = bitar.filter((b) => b.y < duk.height + 40 && b.liv < 600);
    for (const b of bitar) {
      b.liv++;
      b.vy += 0.25 * d;
      b.vx *= 0.985;
      b.vy *= 0.985;
      b.x += b.vx;
      b.y += b.vy;
      b.r += b.vr;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.r);
      ctx.fillStyle = b.f;
      if (b.form === 'rund') { ctx.beginPath(); ctx.arc(0, 0, b.s / 2.4, 0, Math.PI * 2); ctx.fill(); }
      else ctx.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2 * Math.abs(Math.cos(b.r * 2)) + 1);
      ctx.restore();
    }
    if (bitar.length) requestAnimationFrame(rita);
    else { igang = false; ctx.clearRect(0, 0, duk.width, duk.height); }
  }
  function konfettiFran(elem, antal = 40) {
    const r = elem.getBoundingClientRect();
    konfetti({ x: r.left + r.width / 2, y: r.top + r.height / 2, antal, kraft: 7 });
  }
  function storFest() {
    konfetti({ x: innerWidth * 0.2, y: innerHeight * 0.7, antal: 90, kraft: 13 });
    konfetti({ x: innerWidth * 0.8, y: innerHeight * 0.7, antal: 90, kraft: 13 });
    setTimeout(() => konfetti({ antal: 160, regn: true }), 300);
    setTimeout(() => konfetti({ x: innerWidth / 2, y: innerHeight * 0.4, antal: 120, kraft: 12 }), 900);
    setTimeout(() => konfetti({ antal: 140, regn: true }), 1600);
    ljud.fanfar();
  }

  // ---------- Kompisar (Penny, Theo och Emma) ----------
  const KOMPISAR = {
    penny: { namn: 'Penny' },
    theo: { namn: 'Theo' },
    emma: { namn: 'Emma' },
  };
  const BERÖM = ['Superbra!', 'Wow!', 'Bravo !', 'Magnifique !', 'Snyggt!', 'Du är grym!', 'Exakt rätt!', 'Super !', 'Toppen!', 'Très bien !', 'Klockrent!', 'Yes!'];
  const PEPP = ['Nästan! Testa igen.', 'Ingen fara, vi provar en gång till.', 'Hoppsan! Du klarar det.', 'Bra försök! En gång till.', 'Det där var svårt. Vi kör igen!'];
  const slump = (a) => a[Math.floor(Math.random() * a.length)];
  function bildKompis(vem, humor) { return 'bilder/' + vem + '-' + humor + '.jpg'; }
  // Alla ansikten laddas i förväg. Ett nytt ansikte visas först när det är helt laddat,
  // annars ligger det förra kvar (så att det aldrig blir en trasig bild).
  const laddade = {};
  function forladda(url, forsok = 0) {
    if (laddade[url]) return laddade[url];
    laddade[url] = new Promise((klar) => {
      const i = new Image();
      i.onload = () => klar(i.src);
      i.onerror = () => {
        delete laddade[url];
        if (forsok < 2) setTimeout(() => forladda(url, forsok + 1).then(klar), 800);
        else klar(null);
      };
      i.src = forsok ? url + '?r=' + forsok : url;
    });
    return laddade[url];
  }
  window.addEventListener('load', () => {
    for (const vem of Object.keys(KOMPISAR)) for (const h of ['glad', 'skrattar', 'fundersam', 'forvanad']) forladda(bildKompis(vem, h));
  });
  function kompis(text, { vem = 'penny', humor = 'glad', tid = 0 } = {}) {
    let k = $('.kompis');
    if (!k) {
      k = el('<div class="kompis"><img alt="" src="bilder/penny-glad.jpg"><div class="pratbubbla"></div></div>');
      document.body.appendChild(k);
    }
    const img = k.querySelector('img');
    const ny = bildKompis(vem, humor);
    k._onskad = ny;
    forladda(ny).then((src) => { if (src && k._onskad === ny && img.src !== src) img.src = src; });
    k.querySelector('.pratbubbla').innerHTML = text;
    k.classList.remove('hopp');
    void k.offsetWidth;
    k.classList.add('synlig', 'hopp');
    clearTimeout(k._t);
    if (tid) k._t = setTimeout(() => k.classList.remove('synlig'), tid);
  }
  function gomKompis() { const k = $('.kompis'); if (k) k.classList.remove('synlig'); }

  // ---------- Visa ett item (siffra, emoji eller Penny-bild) ----------
  const BILDER = { hel: { w: 360, h: 645 }, bak: { w: 360, h: 645 } };
  function visaHTML(visa, { ring = true, klass = '' } = {}) {
    if (visa.typ === 'text') return `<div class="visa visa-text ${klass}"><span>${esc(visa.text)}</span></div>`;
    if (visa.typ === 'emoji') return `<div class="visa visa-emoji ${klass}"><span>${visa.emoji}</span></div>`;
    if (visa.typ === 'penny') {
      const b = BILDER[visa.bild];
      const z = visa.z || 1;
      const iw = z;
      const ih = (z * b.h) / b.w;
      const x = visa.x / 100, y = visa.y / 100;
      const offX = Math.min(0, Math.max(1 - iw, 0.5 - iw * x));
      const offY = Math.min(0, Math.max(1 - ih, 0.5 - ih * y));
      const rx = (iw * x + offX) * 100, ry = (ih * y + offY) * 100;
      const r = visa.r || 14;
      return `<div class="visa visa-penny ${klass}"><img src="bilder/penny-${visa.bild}.jpg" alt="" draggable="false" style="width:${iw * 100}%;left:${offX * 100}%;top:${offY * 100}%">` +
        (ring ? `<span class="ring" style="left:${rx}%;top:${ry}%;width:${r * 2}%;height:${r * 2}%"></span>` : '') + '</div>';
    }
    return '';
  }

  // ---------- Stjärnor ----------
  function stjarnorHTML(antal, max = 3) {
    let s = '';
    for (let i = 0; i < max; i++) s += `<span class="stj ${i < antal ? 'fylld' : ''}">★</span>`;
    return `<span class="stjarnor">${s}</span>`;
  }

  return {
    data, spara, laxdata, sattStjarnor, totalaStjarnor,
    arInne, loggaIn, loggaUt,
    laxor, registreraLaxa,
    $, el, blanda, vanta, esc, slump,
    norm, bedom, horMatch,
    sag, hor, kanHora,
    ljud, konfetti, konfettiFran, storFest,
    kompis, gomKompis, BERÖM, PEPP,
    visaHTML, stjarnorHTML,
  };
})();
