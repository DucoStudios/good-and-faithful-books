// Spelen och provet för en läxa. Läxans data laddas från laxor/<id>.js.
(() => {
  const { $, el, esc, blanda, vanta, slump, sag, ljud, kompis, visaHTML, stjarnorHTML, data, spara, laxdata } = LP;
  const app = $('#app');
  const laxId = new URLSearchParams(location.search).get('laxa');
  const meta = (window.LAXOR_LISTA || []).find((m) => m.id === laxId);

  if (!LP.arInne() || !meta) { location.replace('index.html'); return; }

  const s = document.createElement('script');
  s.src = 'laxor/' + laxId + '.js?v=3';
  s.onload = () => starta(LP.laxor[laxId]);
  document.body.appendChild(s);

  let laxa;
  let svit = 0;
  let kompisVem = 'penny';

  // ---------- Spellägen ----------
  const LAGEN = {
    lar: { titel: 'Lär dig', ikon: '📖', tagg: 'Titta och lyssna', text: 'Se, lyssna och säg efter.', vem: 'penny' },
    lyssna: { titel: 'Lyssna och välj', ikon: '👂', tagg: 'Förståelse', text: 'Hör ordet och tryck på rätt bild.', vem: 'penny', antal: 10 },
    peka: { titel: 'Peka på Penny', ikon: '👆', tagg: 'Förståelse', text: 'Penny säger en kroppsdel. Peka på den!', vem: 'penny', antal: 10 },
    ordning: { titel: 'Prick till prick', ikon: '⭐', tagg: 'Räkna', text: 'Tryck från 1 till 30 och se vad som dyker upp!', vem: 'theo' },
    sekvens: { titel: 'Vad kommer sen?', ikon: '➡️', tagg: 'Räkna', text: 'Vilket tal kommer efter?', vem: 'theo', antal: 8 },
    memory: { titel: 'Memory', ikon: '🃏', tagg: 'Minne', text: 'Hitta paren: bild och ord.', vem: 'emma' },
    valj: { titel: 'Läs och välj', ikon: '👀', tagg: 'Läsa', text: 'Vilket franskt ord passar?', vem: 'emma', antal: 10 },
    bygg: { titel: 'Bokstavsbygge', ikon: '🧩', tagg: 'Stava', text: 'Bygg ordet bokstav för bokstav.', vem: 'emma', antal: 8 },
    skriv: { titel: 'Skriv ordet', ikon: '✏️', tagg: 'Stava', text: 'Skriv ordet själv på franska.', vem: 'penny', antal: 8 },
    ballong: { titel: 'Ballongjakt', ikon: '🎈', tagg: 'Snabbt lyssna', text: 'Lyssna och poppa rätt ballong!', vem: 'theo' },
    tala: { titel: 'Säg det!', ikon: '🎤', tagg: 'Uttal', text: 'Säg ordet på franska i mikrofonen.', vem: 'penny', antal: 6 },
  };

  // ---------- Läxans startsida ----------
  function starta(l) {
    laxa = l;
    document.documentElement.style.setProperty('--laxfarg', laxa.farg);
    document.title = laxa.titel + ' · Läxportalen';
    visaHem(true);
  }

  function hemknapp() { return '<button class="tillbaka" id="hem" aria-label="Tillbaka">←</button>'; }

  function visaHem(forsta) {
    kompisVem = 'penny';
    const d = laxdata(laxa.id);
    const summa = Object.values(d.stjarnor).reduce((a, b) => a + b, 0);
    const lagen = laxa.lagen;
    app.innerHTML = `
      <div class="toppbar">
        <button class="tillbaka" id="portal" aria-label="Till portalen">←</button>
        <span class="spacer"></span>
        <span class="pill"><span class="stj-ikon">★</span> ${summa} / ${lagen.length * 3}</span>
      </div>
      <div class="laxhuvud"><span class="ikon">${laxa.ikon}</span><div><h1>${esc(laxa.titel)}</h1>
        <p class="svag" style="margin:6px 0 0">Öva med spelen. När du känner dig redo: gör provet!</p></div></div>
      <div class="lagen">${lagen.map((k) => {
        const m = LAGEN[k];
        return `<button class="lagekort" data-lage="${k}">
          <div class="ikon">${m.ikon}</div>
          <div class="tagg">${m.tagg}</div>
          <h3>${m.titel}</h3>
          <p>${m.text}</p>
          ${stjarnorHTML(d.stjarnor[k] || 0)}
        </button>`;
      }).join('')}</div>
      <div class="provkort">
        <img src="bilder/emma-glad.jpg" alt="Emma">
        <div class="text">
          <h2>${d.klar ? 'Läxan är klar! 🏆' : 'Provet'}</h2>
          <p>${d.klar ? 'Du klarade provet. Du kan göra det igen om du vill.' : 'Få alla rätt så är läxan klar. Du kan försöka hur många gånger du vill!'}</p>
        </div>
        <button class="knapp gul" id="prov">${d.klar ? 'Gör igen' : 'Starta provet'}</button>
      </div>`;
    $('#portal').onclick = () => { location.href = 'index.html'; };
    app.querySelectorAll('.lagekort').forEach((b) => (b.onclick = () => { ljud.klick(); korLage(b.dataset.lage); }));
    $('#prov').onclick = () => { ljud.klick(); korProv(); };
    if (forsta && !d.intro) {
      kompis(laxa.intro, { vem: 'penny', humor: 'skrattar', tid: 9000 });
      d.intro = true;
      spara();
    } else {
      kompis(summa === 0 ? 'Börja med <b>Lär dig</b>, sen kan du spela!' : slump(['Vilket spel tar vi nu?', 'Bra jobbat hittills! Fortsätt så.', 'Samla alla stjärnor! ⭐']), { tid: 5000 });
    }
  }

  // ---------- Scen för ett spel ----------
  function scen(titel, antal) {
    app.innerHTML = `
      <div class="scen">
        <div class="scenhuvud">${hemknapp()}<div class="matare"><i></i></div><span class="pill" id="raknare">0/${antal}</span></div>
        <div id="kropp"></div>
      </div>`;
    $('#hem').onclick = () => { speechSynthesis && speechSynthesis.cancel(); visaHemLadda(); };
    const kropp = $('#kropp');
    return {
      kropp,
      framsteg(i) {
        $('.matare i').style.width = (i / antal) * 100 + '%';
        $('#raknare').textContent = i + '/' + antal;
      },
    };
  }
  // Laddar om sidan så att pågående spel avbryts helt.
  function visaHemLadda() { location.href = 'spel.html?laxa=' + laxa.id; }

  // ---------- Beröm och pepp ----------
  function rattSvar(elem, extra) {
    ljud.ratt();
    if (elem) LP.konfettiFran(elem, 45);
    svit++;
    if (svit > 0 && svit % 3 === 0) {
      const sv = $('.svit');
      sv.textContent = '🔥 ' + svit + ' i rad!';
      sv.classList.remove('syns');
      void sv.offsetWidth;
      sv.classList.add('syns');
      setTimeout(() => LP.konfetti({ antal: 70, regn: true }), 150);
    }
    kompis(extra || slump(LP.BERÖM), { vem: kompisVem, humor: Math.random() < 0.5 ? 'skrattar' : 'glad' });
  }
  function felSvar(text) {
    ljud.fel();
    svit = 0;
    kompis(text || slump(LP.PEPP), { vem: kompisVem, humor: 'fundersam' });
  }

  function svLapp(item) { return laxa.visaSv ? `<div class="svag" style="margin-top:6px">(${esc(item.sv)})</div>` : ''; }
  function distraktorer(item, n, filter) {
    const lista = laxa.items.filter((i) => i !== item && (!filter || filter(i)));
    // För siffror: blanda in några närliggande tal så att det blir lagom svårt.
    if (/^\d+$/.test(item.id)) {
      const nara = lista.filter((i) => Math.abs(+i.id - +item.id) <= 3 || +i.id % 10 === +item.id % 10);
      return blanda(blanda(nara).slice(0, 2).concat(blanda(lista))).filter((v, i, a) => a.indexOf(v) === i).slice(0, n);
    }
    return blanda(lista).slice(0, n);
  }

  // Väntar på att hon trycker på ett av alternativen.
  function valjSvar(kropp, alt, item, prov, efterRatt) {
    return new Promise((klar) => {
      let misstag = 0;
      kropp.querySelectorAll('.valknapp').forEach((b) => {
        b.onclick = async () => {
          const a = alt[+b.dataset.i];
          if (a === item) {
            b.classList.add('ratt');
            kropp.querySelectorAll('.valknapp').forEach((x) => (x.onclick = null));
            rattSvar(b);
            if (efterRatt) await efterRatt();
            await vanta(900);
            klar({ ratt: misstag === 0, misstag });
          } else {
            misstag++;
            b.classList.add('fel');
            b.onclick = null;
            if (prov) {
              kropp.querySelectorAll('.valknapp').forEach((x) => (x.onclick = null));
              const r = kropp.querySelector(`.valknapp[data-i="${alt.indexOf(item)}"]`);
              r.classList.add('ratt');
              felSvar('Det rätta var <b>' + esc(item.fr) + '</b>.');
              await vanta(1800);
              klar({ ratt: false, misstag });
            } else felSvar();
          }
        };
      });
    });
  }

  // ---------- Frågetyper (används både i spelen och i provet) ----------
  const FRAGOR = {
    async lyssna({ item, kropp, prov }) {
      const alt = blanda([item].concat(distraktorer(item, 3)));
      kropp.innerHTML = `
        <div class="fraga">Lyssna! Vilken är det?</div>
        <button class="lyssnaknapp" aria-label="Lyssna igen">🔊</button>
        <div class="val bilder">${alt.map((a, i) => `<button class="valknapp bild" data-i="${i}">${visaHTML(a.visa)}</button>`).join('')}</div>`;
      const spela = () => sag(item.fr, laxa.sprak);
      kropp.querySelector('.lyssnaknapp').onclick = spela;
      await vanta(300);
      spela();
      return valjSvar(kropp, alt, item, prov);
    },

    async valj({ item, kropp, prov }) {
      const alt = blanda([item].concat(distraktorer(item, 3)));
      kropp.innerHTML = `
        <div class="fraga">Vad heter det på franska?</div>
        ${visaHTML(item.visa)}${svLapp(item)}
        <div class="val">${alt.map((a, i) => `<button class="valknapp" data-i="${i}">${esc(a.fr)}</button>`).join('')}</div>`;
      return valjSvar(kropp, alt, item, prov, () => sag(item.fr, laxa.sprak));
    },

    async sekvens({ item, kropp, prov }) {
      const n = +item.id;
      const fore = [n - 3, n - 2, n - 1].map((k) => laxa.items[k - 1]);
      const alt = blanda([item].concat(distraktorer(item, 3, (i) => +i.id !== n - 1 && +i.id !== n - 2 && +i.id !== n - 3)));
      kropp.innerHTML = `
        <div class="fraga">Vad kommer sen?</div>
        <div class="val" style="grid-template-columns:repeat(4,1fr);max-width:640px">
          ${fore.map((f) => `<div class="valknapp" style="background:#fff7ec">${esc(f.fr)}</div>`).join('')}
          <div class="valknapp" style="border-style:dashed;color:var(--laxfarg)">?</div>
        </div>
        <div class="val">${alt.map((a, i) => `<button class="valknapp" data-i="${i}">${esc(a.fr)}</button>`).join('')}</div>`;
      sag(fore.map((f) => f.fr).join(', ') + ' …', laxa.sprak);
      return valjSvar(kropp, alt, item, prov, () => sag(item.fr, laxa.sprak));
    },

    async skriv({ item, kropp, prov }) {
      const accenter = laxa.accenter || ['é', 'è', 'ê', 'à', 'ç', 'œ', '-', "'"];
      kropp.innerHTML = `
        <div class="fraga">Skriv på franska</div>
        ${visaHTML(item.visa)}${svLapp(item)}
        <div style="margin-top:10px"><button class="lyssnaknapp liten" aria-label="Lyssna">🔊</button></div>
        <div class="skrivrad">
          <input class="skrivfalt" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done">
          <button class="knapp gron" id="klar">OK</button>
        </div>
        <div class="accenter">${accenter.map((a) => `<button data-a="${esc(a)}">${esc(a)}</button>`).join('')}</div>
        <div class="tips"></div>`;
      const falt = kropp.querySelector('.skrivfalt');
      const tips = kropp.querySelector('.tips');
      kropp.querySelector('.lyssnaknapp').onclick = () => sag(item.fr, laxa.sprak);
      kropp.querySelectorAll('.accenter button').forEach((b) => {
        b.onmousedown = (e) => e.preventDefault();
        b.onclick = () => {
          const st = falt.selectionStart ?? falt.value.length, sl = falt.selectionEnd ?? falt.value.length;
          falt.value = falt.value.slice(0, st) + b.dataset.a + falt.value.slice(sl);
          falt.focus();
          falt.setSelectionRange(st + b.dataset.a.length, st + b.dataset.a.length);
          ljud.klick();
        };
      });
      setTimeout(() => falt.focus(), 60);
      return new Promise((klar) => {
        let misstag = 0, nastanGivet = false, avskrift = false;
        const prova = async () => {
          const b = LP.bedom(falt.value, item, laxa);
          if (b.tom) { falt.focus(); return; }
          if (b.ok) {
            falt.classList.remove('fel');
            falt.classList.add('ratt');
            falt.disabled = true;
            kropp.querySelector('#klar').disabled = true;
            tips.textContent = '';
            rattSvar(falt);
            sag(item.fr, laxa.sprak);
            await vanta(1100);
            return klar({ ratt: misstag === 0 && !avskrift, misstag });
          }
          falt.classList.remove('fel');
          void falt.offsetWidth;
          falt.classList.add('fel');
          if (prov) {
            if (b.nastan && !nastanGivet) {
              nastanGivet = true;
              tips.textContent = b.tips + ' Rätta och tryck OK.';
              felSvar('Titta en gång till!');
              return;
            }
            falt.disabled = true;
            kropp.querySelector('#klar').disabled = true;
            tips.innerHTML = 'Rätt svar: <span class="facitvisning">' + esc(item.fr) + '</span>';
            felSvar('Nu vet du hur det stavas!');
            sag(item.fr, laxa.sprak);
            await vanta(2600);
            return klar({ ratt: false, misstag: 1 });
          }
          misstag++;
          if (misstag >= 2 && !avskrift) {
            avskrift = true;
            tips.innerHTML = 'Så här stavas det: <span class="facitvisning">' + esc(item.fr) + '</span><br>Skriv av det!';
            falt.value = '';
            felSvar('Ingen fara! Skriv av ordet så lär du dig det.');
            sag(item.fr, laxa.sprak);
          } else {
            tips.textContent = b.tips || 'Inte riktigt. Försök igen!';
            felSvar(b.nastan ? 'Så nära!' : null);
          }
          falt.focus();
        };
        kropp.querySelector('#klar').onclick = prova;
        falt.onkeydown = (e) => { if (e.key === 'Enter') prova(); };
      });
    },

    async bygg({ item, kropp }) {
      const tecken = Array.from(item.fr);
      const fasta = (c) => c === ' ' || c === '-' || c === "'";
      const bokstaver = blanda(tecken.filter((c) => !fasta(c)));
      kropp.innerHTML = `
        <div class="fraga">Bygg ordet</div>
        ${visaHTML(item.visa, { klass: '' })}${svLapp(item)}
        <div style="margin-top:10px"><button class="lyssnaknapp liten" aria-label="Lyssna">🔊</button></div>
        <div class="bygg-svar">${tecken.map((c) => `<span class="${fasta(c) ? 'fast' : ''}">${fasta(c) ? (c === ' ' ? '&nbsp;' : esc(c)) : ''}</span>`).join('')}</div>
        <div class="brickor">${bokstaver.map((c, i) => `<button class="bricka" data-i="${i}">${esc(c)}</button>`).join('')}</div>`;
      kropp.querySelector('.lyssnaknapp').onclick = () => sag(item.fr, laxa.sprak);
      sag(item.fr, laxa.sprak);
      const rutor = Array.from(kropp.querySelectorAll('.bygg-svar span'));
      let pos = 0;
      const hoppaFasta = () => { while (pos < tecken.length && fasta(tecken[pos])) pos++; };
      hoppaFasta();
      return new Promise((klar) => {
        let misstag = 0, felIRad = 0;
        kropp.querySelectorAll('.bricka').forEach((b) => {
          b.onclick = async () => {
            const c = bokstaver[+b.dataset.i];
            if (c === tecken[pos]) {
              ljud.pop();
              felIRad = 0;
              b.classList.add('anvand');
              rutor[pos].textContent = c;
              rutor[pos].classList.add('fylld');
              pos++;
              hoppaFasta();
              kropp.querySelectorAll('.bricka').forEach((x) => (x.style.outline = ''));
              if (pos >= tecken.length) {
                rattSvar(kropp.querySelector('.bygg-svar'));
                sag(item.fr, laxa.sprak);
                await vanta(1200);
                klar({ ratt: misstag === 0, misstag });
              }
            } else {
              misstag++;
              felIRad++;
              ljud.fel();
              b.classList.remove('fel');
              void b.offsetWidth;
              b.classList.add('fel');
              if (felIRad >= 2) {
                const hjalp = Array.from(kropp.querySelectorAll('.bricka:not(.anvand)')).find((x) => bokstaver[+x.dataset.i] === tecken[pos]);
                if (hjalp) hjalp.style.outline = '4px solid var(--gron)';
                kompis('Psst! Testa den gröna.', { vem: kompisVem, humor: 'glad' });
              }
            }
          };
        });
      });
    },

    async tala({ item, kropp, prov }) {
      kropp.innerHTML = `
        <div class="fraga">Säg det på franska!</div>
        ${visaHTML(item.visa)}${svLapp(item)}
        <button class="mikknapp" aria-label="Prata">🎤</button>
        <div class="hordes">Tryck på mikrofonen och säg ordet.</div>
        <div id="hjalp" style="margin-top:10px"></div>`;
      const mik = kropp.querySelector('.mikknapp');
      const hordes = kropp.querySelector('.hordes');
      const hjalp = kropp.querySelector('#hjalp');

      if (!LP.kanHora) {
        if (prov) return null;
        mik.style.display = 'none';
        hordes.textContent = 'Säg ordet högt! Tryck sen på högtalaren och hör om du sa rätt.';
        hjalp.innerHTML = '<button class="lyssnaknapp liten">🔊</button> <button class="knapp gron" id="gick">Jag sa det! ✓</button>';
        hjalp.querySelector('.lyssnaknapp').onclick = () => sag(item.fr, laxa.sprak);
        return new Promise((klar) => {
          hjalp.querySelector('#gick').onclick = async () => { rattSvar(hjalp); await vanta(800); klar({ ratt: true, misstag: 0 }); };
        });
      }

      return new Promise((klar) => {
        let forsok = 0, upptagen = false;
        const visaHjalp = () => {
          if (hjalp.innerHTML) return;
          hjalp.innerHTML = '<button class="knapp sekundar liten">🔊 Hör hur det låter</button>';
          hjalp.querySelector('button').onclick = () => sag(item.fr, laxa.sprak);
        };
        mik.onclick = async () => {
          if (upptagen) return;
          upptagen = true;
          speechSynthesis && speechSynthesis.cancel();
          mik.classList.add('lyssnar');
          hordes.textContent = 'Jag lyssnar …';
          let alt = [];
          try {
            alt = await LP.hor(laxa.sprak);
          } catch (e) {
            mik.classList.remove('lyssnar');
            upptagen = false;
            if (e.message === 'not-allowed' || e.message === 'service-not-allowed') {
              hordes.innerHTML = 'Mikrofonen är avstängd. Be pappa slå på den i webbläsaren.';
              if (prov) { await vanta(2000); return klar(null); }
              hjalp.innerHTML = '<button class="knapp sekundar liten">Hoppa över</button>';
              hjalp.querySelector('button').onclick = () => klar({ ratt: true, misstag: 0 });
              return;
            }
            hordes.textContent = 'Jag hörde inget. Prova igen!';
            return;
          }
          mik.classList.remove('lyssnar');
          upptagen = false;
          if (!alt.length) { hordes.textContent = 'Jag hörde inget. Tryck och prata lite högre!'; return; }
          if (LP.horMatch(alt, item)) {
            hordes.innerHTML = 'Jag hörde: <b>' + esc(alt[0]) + '</b> ✓';
            mik.onclick = null;
            rattSvar(mik, slump(['Perfekt uttal!', 'Du låter som en fransyska!', 'Magnifique !', 'Wow, vilket uttal!']));
            await vanta(1100);
            return klar({ ratt: forsok === 0 || prov, misstag: forsok });
          }
          forsok++;
          hordes.innerHTML = 'Jag hörde: <b>' + esc(alt[0]) + '</b>';
          if (forsok >= 3) {
            mik.onclick = null;
            felSvar(prov ? 'Rätt ord är <b>' + esc(item.fr) + '</b>. Öva lite till!' : 'Bra kämpat! Lyssna, så tar vi nästa.');
            await sag(item.fr, laxa.sprak);
            await vanta(900);
            return klar({ ratt: false, misstag: forsok });
          }
          felSvar(forsok === 1 ? 'Nästan! Säg det en gång till.' : 'Lyssna först, sen provar du igen!');
          if (forsok >= 1 && !prov) visaHjalp();
          if (forsok >= 2) visaHjalp();
        };
      });
    },

    async peka({ item, kropp, prov }) {
      kropp.innerHTML = `
        <div class="fraga">Peka på: <span class="fr">${esc(item.fr)}</span> <button class="lyssnaknapp liten" aria-label="Lyssna">🔊</button></div>
        <div class="pekascen"><img src="bilder/penny-hel.jpg" alt="Penny" draggable="false"></div>`;
      kropp.querySelector('.lyssnaknapp').onclick = () => sag(item.fr, laxa.sprak);
      sag(item.fr, laxa.sprak);
      const sc = kropp.querySelector('.pekascen');
      const ASP = 645 / 360;
      const markera = (x, y, r, klass) => {
        const m = document.createElement('span');
        m.className = 'pekamark ' + klass;
        m.style.left = x + '%';
        m.style.top = y + '%';
        if (r) { m.style.width = r * 2 + '%'; m.style.height = (r * 2) / ASP + '%'; }
        sc.appendChild(m);
        return m;
      };
      const visaRatt = () => item.p.forEach(([x, y, r]) => markera(x, y, Math.max(r, 6), 'visa-har'));
      return new Promise((klar) => {
        let misstag = 0;
        sc.onclick = async (e) => {
          const rect = sc.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          const traff = item.p.find(([px, py, r]) => Math.hypot(x - px, (y - py) * ASP) <= r + 2);
          if (traff) {
            sc.onclick = null;
            markera(traff[0], traff[1], traff[2] + 1, 'ratt');
            rattSvar(sc.querySelectorAll('.pekamark.ratt')[0], Math.random() < 0.3 ? 'Hihi, det kittlas! 😆' : null);
            await vanta(1000);
            return klar({ ratt: misstag === 0, misstag });
          }
          misstag++;
          markera(x, y, 0, 'miss');
          if (prov) {
            sc.onclick = null;
            visaRatt();
            felSvar('Den sitter här! 👆');
            await vanta(2000);
            return klar({ ratt: false, misstag });
          }
          if (misstag >= 2) { visaRatt(); felSvar('Titta, den sitter där det blinkar!'); }
          else felSvar();
        };
      });
    },
  };

  // Vilka items som passar en frågetyp.
  function passar(typ) {
    if (typ === 'sekvens') return laxa.items.filter((i) => +i.id >= 4);
    if (typ === 'peka') return laxa.items.filter((i) => i.p);
    return laxa.items;
  }
  function valjUt(typ, n, svagaForst) {
    const pool = passar(typ);
    const svaga = svagaForst ? pool.filter((i) => (laxdata(laxa.id).svaga || []).includes(i.id)) : [];
    let lista = blanda(svaga).concat(blanda(pool.filter((i) => !svaga.includes(i))));
    while (lista.length < n) lista = lista.concat(blanda(pool));
    return lista.slice(0, n);
  }

  // ---------- Kör ett spelläge ----------
  function korLage(k) {
    kompisVem = LAGEN[k].vem;
    LP.gomKompis();
    svit = 0;
    if (k === 'lar') return korLar();
    if (k === 'memory') return korMemory();
    if (k === 'ballong') return korBallong();
    if (k === 'ordning') return korOrdning();
    return korRundor(k);
  }

  async function korRundor(typ) {
    const n = Math.min(LAGEN[typ].antal, typ === 'peka' ? 10 : 99);
    const lista = valjUt(typ, n, true);
    const sc = scen(LAGEN[typ].titel, lista.length);
    let misstag = 0;
    for (let i = 0; i < lista.length; i++) {
      sc.framsteg(i);
      const r = await FRAGOR[typ]({ item: lista[i], kropp: sc.kropp, prov: false });
      if (r) misstag += r.misstag || 0;
    }
    sc.framsteg(lista.length);
    visaResultat(typ, misstag <= 1 ? 3 : misstag <= 4 ? 2 : 1);
  }

  // ---------- Lär dig (bläddra bland korten) ----------
  function korLar() {
    const items = laxa.items;
    let i = 0;
    const sedda = new Set();
    let autoTimer = null;
    app.innerHTML = `
      <div class="scen">
        <div class="scenhuvud">${hemknapp()}<h2>Lär dig</h2>
          <button class="knapp liten sekundar" id="auto">▶ ${/^\d+$/.test(items[0].id) ? 'Räkna med Penny' : 'Spela upp alla'}</button></div>
        <div class="kort flashkort" id="fk"></div>
        <div class="flashnav">
          <button class="knapp sekundar" id="fore">←</button>
          <button class="lyssnaknapp" id="lyssna" aria-label="Lyssna">🔊</button>
          <button class="knapp sekundar" id="nasta">→</button>
        </div>
        <div class="flashlista">${items.map(() => '<span></span>').join('')}</div>
        <div style="margin-top:18px"><button class="knapp gron" id="klar" style="display:none">Klar! ⭐</button></div>
      </div>`;
    $('#hem').onclick = visaHemLadda;
    const fk = $('#fk');
    const visa = (tyst) => {
      const it = items[i];
      sedda.add(i);
      fk.innerHTML = `${visaHTML(it.visa)}<div class="ord">${esc(it.fr)}</div><div class="sv">${esc(it.sv)}</div>
        ${it.info ? `<div class="info">${esc(it.info)}</div>` : ''}
        ${LP.kanHora ? '<div style="margin-top:14px"><button class="knapp liten sekundar" id="sagefter">🎤 Säg efter</button> <span class="hordes" id="hh"></span></div>' : ''}`;
      app.querySelectorAll('.flashlista span').forEach((s, j) => { s.classList.toggle('sedd', sedda.has(j)); s.classList.toggle('nu', j === i); });
      if (!tyst) sag(it.fr, laxa.sprak);
      if (sedda.size === items.length) $('#klar').style.display = '';
      const se = $('#sagefter');
      if (se) se.onclick = async () => {
        const hh = $('#hh');
        hh.textContent = 'Jag lyssnar …';
        try {
          const alt = await LP.hor(laxa.sprak);
          if (LP.horMatch(alt, it)) { hh.textContent = '✓ Perfekt!'; rattSvar(se); }
          else { hh.textContent = alt[0] ? 'Jag hörde: ' + alt[0] : 'Jag hörde inget.'; ljud.fel(); }
        } catch (e) { hh.textContent = 'Mikrofonen fungerar inte just nu.'; }
      };
    };
    const stoppaAuto = () => { if (autoTimer) { autoTimer = null; $('#auto').textContent = '▶ Spela upp alla'; } };
    $('#fore').onclick = () => { stoppaAuto(); i = (i - 1 + items.length) % items.length; ljud.vandning(); visa(); };
    $('#nasta').onclick = () => { stoppaAuto(); i = (i + 1) % items.length; ljud.vandning(); visa(); };
    $('#lyssna').onclick = () => sag(items[i].fr, laxa.sprak);
    $('#auto').onclick = async () => {
      if (autoTimer) return stoppaAuto();
      const token = (autoTimer = {});
      $('#auto').textContent = '⏸ Stopp';
      for (i = 0; i < items.length; i++) {
        if (autoTimer !== token) return;
        visa(true);
        await sag(items[i].fr, laxa.sprak);
        await vanta(450);
      }
      i = items.length - 1;
      stoppaAuto();
      kompis('Bra lyssnat! Säg dem högt med mig nästa gång.', { vem: 'penny', tid: 5000 });
    };
    $('#klar').onclick = () => visaResultat('lar', 3);
    visa();
    kompis('Tryck på pilarna och lyssna. Säg orden högt!', { vem: 'penny', tid: 5000 });
  }

  // ---------- Memory ----------
  function korMemory() {
    const par = blanda(laxa.items).slice(0, 6);
    const kort = blanda(par.flatMap((it) => [{ it, sida: 'bild' }, { it, sida: 'ord' }]));
    const sc = scen('Memory', par.length);
    sc.kropp.innerHTML = `<div class="fraga">Hitta paren!</div>
      <div class="memory">${kort.map((k, i) => `<button class="mkort" data-i="${i}">
        <span class="sida bak">?</span>
        <span class="sida fram">${k.sida === 'bild' ? visaHTML(k.it.visa) : esc(k.it.fr)}</span></button>`).join('')}</div>`;
    let oppna = [], hittade = 0, fel = 0, las = false;
    sc.kropp.querySelectorAll('.mkort').forEach((b) => {
      b.onclick = async () => {
        if (las || b.classList.contains('vand') || b.classList.contains('hittad')) return;
        const k = kort[+b.dataset.i];
        b.classList.add('vand');
        ljud.vandning();
        if (k.sida === 'ord') sag(k.it.fr, laxa.sprak);
        oppna.push({ b, k });
        if (oppna.length < 2) return;
        las = true;
        const [a, c] = oppna;
        oppna = [];
        if (a.k.it === c.k.it) {
          await vanta(350);
          a.b.classList.add('hittad');
          c.b.classList.add('hittad');
          hittade++;
          sc.framsteg(hittade);
          rattSvar(c.b);
          sag(a.k.it.fr, laxa.sprak);
          las = false;
          if (hittade === par.length) { await vanta(1100); visaResultat('memory', fel <= 4 ? 3 : fel <= 9 ? 2 : 1); }
        } else {
          fel++;
          await vanta(1000);
          a.b.classList.remove('vand');
          c.b.classList.remove('vand');
          las = false;
        }
      };
    });
    kompis('Vänd två kort. Hitta bilden och ordet som hör ihop!', { vem: 'emma', tid: 5000 });
  }

  // ---------- Ballongjakt ----------
  function korBallong() {
    const MAL = 8;
    const sc = scen('Ballongjakt', MAL);
    sc.kropp.innerHTML = `
      <div class="malord"><span class="hjartan" id="hj">❤️❤️❤️</span>
        <button class="lyssnaknapp liten" id="hor" aria-label="Lyssna igen">🔊</button>
        <span class="svag">Poppa ordet du hör!</span></div>
      <div class="ballongscen" id="bs"></div>`;
    const bs = $('#bs');
    const FARG = ['#ff7a2f', '#3d7be0', '#2fb36b', '#e5484d', '#b65cf0', '#f5b81f', '#ff6fae'];
    const urval = blanda(laxa.items).slice(0, Math.min(10, laxa.items.length));
    let mal = slump(urval), poang = 0, hjartan = 3, slut = false, senast = 0, senastMal = 0, forra = performance.now();
    const ballonger = [];
    const sagMal = () => sag(mal.fr, laxa.sprak);
    $('#hor').onclick = sagMal;

    function skapa(it) {
      const b = document.createElement('button');
      b.className = 'ballong';
      b.innerHTML = `<div class="kropp" style="background:${slump(FARG)}">${esc(it.fr)}</div><div class="snore"></div>`;
      const x = 10 + Math.random() * 80;
      b.style.left = x + '%';
      const o = { b, it, y: bs.clientHeight + 10, v: 55 + poang * 7 + Math.random() * 20, svaj: Math.random() * 6 };
      b.style.top = o.y + 'px';
      b.onclick = () => tryck(o);
      bs.appendChild(b);
      ballonger.push(o);
    }
    function ta(o) { const i = ballonger.indexOf(o); if (i >= 0) ballonger.splice(i, 1); }
    async function tryck(o) {
      if (slut) return;
      if (o.it === mal) {
        ta(o);
        o.b.classList.add('poff');
        ljud.pop();
        rattSvar(o.b);
        setTimeout(() => o.b.remove(), 300);
        poang++;
        sc.framsteg(poang);
        if (poang >= MAL) return avsluta();
        let nytt;
        do { nytt = slump(urval); } while (nytt === mal && urval.length > 1);
        mal = nytt;
        senastMal = 0;
        setTimeout(sagMal, 700);
      } else {
        hjartan--;
        $('#hj').textContent = '❤️'.repeat(hjartan) + '🤍'.repeat(3 - hjartan);
        o.b.classList.remove('mis');
        void o.b.offsetWidth;
        o.b.classList.add('mis');
        felSvar('Oj! Det där var <b>' + esc(o.it.fr) + '</b>.');
        if (hjartan <= 0) return avsluta();
        setTimeout(sagMal, 900);
      }
    }
    function avsluta() {
      slut = true;
      setTimeout(() => {
        bs.innerHTML = '';
        visaResultat('ballong', poang >= MAL ? hjartan : 0, poang >= MAL ? null : 'Du poppade ' + poang + ' av ' + MAL + '! Försök igen så får du stjärnor.');
      }, 900);
    }
    function loop(t) {
      if (slut || !document.body.contains(bs)) return;
      const dt = Math.min(0.05, (t - forra) / 1000);
      forra = t;
      senast += dt;
      senastMal += dt;
      const malPaSkarmen = ballonger.some((o) => o.it === mal);
      if (senast > 1.05) {
        senast = 0;
        const tidForMal = !malPaSkarmen && senastMal > 1.5;
        skapa(tidForMal || Math.random() < 0.3 ? mal : slump(urval));
        if (tidForMal || ballonger[ballonger.length - 1].it === mal) senastMal = 0;
      }
      for (const o of ballonger.slice()) {
        o.y -= o.v * dt;
        o.b.style.top = o.y + 'px';
        o.b.style.marginLeft = Math.sin(t / 600 + o.svaj) * 12 + 'px';
        if (o.y < -150) { ta(o); o.b.remove(); }
      }
      requestAnimationFrame(loop);
    }
    kompis('Lyssna på ordet och poppa rätt ballong! Du har tre hjärtan.', { vem: 'theo', humor: 'skrattar', tid: 4000 });
    setTimeout(() => { sagMal(); requestAnimationFrame((t) => { forra = t; loop(t); }); }, 1200);
  }

  // ---------- Prick till prick (1 till 30) ----------
  function korOrdning() {
    const items = laxa.items;
    const N = items.length;
    // Punkter längs en femuddig stjärna, med start i toppen.
    const horn = [];
    for (let k = 0; k < 10; k++) {
      const v = -Math.PI / 2 + (k * Math.PI) / 5;
      const R = k % 2 === 0 ? 0.44 : 0.22;
      horn.push([0.5 + R * Math.cos(v), 0.53 + R * Math.sin(v)]);
    }
    const per = N / 10;
    const pkt = [];
    for (let k = 0; k < 10; k++) {
      const [ax, ay] = horn[k], [bx, by] = horn[(k + 1) % 10];
      for (let j = 0; j < per; j++) pkt.push([ax + ((bx - ax) * j) / per, ay + ((by - ay) * j) / per]);
    }
    const sc = scen('Prick till prick', N);
    sc.kropp.innerHTML = `<div class="fraga">Tryck i ordning: 1, 2, 3 …</div>
      <div class="ordningscen" id="os">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none"><polygon id="fyll" points="${pkt.map(([x, y]) => x * 100 + ',' + y * 100).join(' ')}" fill="var(--gul)" opacity="0" style="transition:opacity 1s"></polygon><g id="linjer" stroke="var(--laxfarg)" stroke-width="1.2" stroke-linecap="round"></g></svg>
        ${pkt.map(([x, y], i) => `<button class="prick" data-i="${i}" style="left:${x * 100}%;top:${y * 100}%">${items[i].id}</button>`).join('')}
      </div>`;
    let nasta = 0, fel = 0;
    const prickar = sc.kropp.querySelectorAll('.prick');
    const markeraNasta = () => prickar.forEach((p, i) => p.classList.toggle('nasta', i === nasta && fel >= 2));
    prickar.forEach((p) => {
      p.onclick = async () => {
        const i = +p.dataset.i;
        if (i < nasta) return;
        if (i !== nasta) {
          fel++;
          ljud.fel();
          p.classList.remove('fel');
          void p.offsetWidth;
          p.classList.add('fel');
          kompis('Vi letar efter <b>' + esc(items[nasta].fr) + '</b>!', { vem: 'theo', humor: 'fundersam' });
          markeraNasta();
          return;
        }
        p.classList.add('klar');
        ljud.pop();
        sag(items[i].fr, laxa.sprak, 1);
        if (i > 0) {
          const [x1, y1] = pkt[i - 1], [x2, y2] = pkt[i];
          $('#linjer').insertAdjacentHTML('beforeend', `<line x1="${x1 * 100}" y1="${y1 * 100}" x2="${x2 * 100}" y2="${y2 * 100}"/>`);
        }
        nasta++;
        sc.framsteg(nasta);
        markeraNasta();
        if (nasta % 10 === 0 && nasta < N) rattSvar(p, nasta + '! Fortsätt!');
        if (nasta === N) {
          const [x1, y1] = pkt[N - 1], [x2, y2] = pkt[0];
          $('#linjer').insertAdjacentHTML('beforeend', `<line x1="${x1 * 100}" y1="${y1 * 100}" x2="${x2 * 100}" y2="${y2 * 100}"/>`);
          $('#fyll').setAttribute('opacity', '1');
          rattSvar($('#os'), 'En guldstjärna! ⭐');
          LP.konfetti({ antal: 120, regn: true });
          await vanta(1800);
          visaResultat('ordning', fel <= 1 ? 3 : fel <= 4 ? 2 : 1);
        }
      };
    });
    kompis('Tryck på siffrorna i ordning. Lyssna på hur de låter!', { vem: 'theo', tid: 5000 });
  }

  // ---------- Resultat efter ett spel ----------
  async function visaResultat(lage, st, egenText) {
    const nytt = LP.sattStjarnor(laxa.id, lage, st);
    const rubrik = st === 3 ? 'Perfekt!' : st === 2 ? 'Jättebra!' : st === 1 ? 'Bra jobbat!' : 'Bra kämpat!';
    app.innerHTML = `
      <div class="scen"><div class="kort resultat">
        <img class="jubel" src="bilder/${st >= 2 ? 'penny-jubel' : 'penny-hel'}.jpg" alt="Penny">
        <h2>${rubrik}</h2>
        ${stjarnorHTML(st)}
        <p class="svag">${egenText || (nytt && st > 0 ? 'Nytt rekord! ⭐' : st === 3 ? 'Alla tre stjärnorna!' : 'Spela igen och samla fler stjärnor!')}</p>
        <div class="knappar">
          <button class="knapp" id="igen">Spela igen 🔁</button>
          <button class="knapp sekundar" id="tillbaka">Välj ett annat spel</button>
        </div>
      </div></div>`;
    LP.gomKompis();
    $('#igen').onclick = () => korLage(lage);
    $('#tillbaka').onclick = () => visaHem(false);
    const stj = app.querySelectorAll('.resultat .stj');
    for (let i = 0; i < stj.length; i++) {
      await vanta(350);
      stj[i].classList.add('syns');
      if (i < st) { ljud.stjarna(i); LP.konfettiFran(stj[i], 30); }
    }
    if (st === 3) LP.storFest();
    else if (st > 0) LP.konfetti({ antal: 90, regn: true });
  }

  // ---------- Provet ----------
  async function korProv() {
    kompisVem = 'emma';
    LP.gomKompis();
    svit = 0;
    const talaMed = LP.kanHora && data.installningar.talaIProv;
    const fragor = [];
    for (const del of laxa.prov) {
      if (del.typ === 'tala' && !talaMed) continue;
      valjUt(del.typ, del.antal, false).forEach((item) => fragor.push({ typ: del.typ, item }));
    }
    app.innerHTML = `
      <div class="scen"><div class="kort resultat">
        <img class="jubel" src="bilder/emma-hel.jpg" alt="Emma" style="height:200px">
        <h2>Provet: ${esc(laxa.titel)}</h2>
        <p style="font-size:20px">${fragor.length} frågor. Får du <b>alla rätt</b> är läxan klar! 🏆</p>
        <p class="svag">Det gör inget om det blir fel. Då övar du lite till och försöker igen.</p>
        <div class="knappar"><button class="knapp gul" id="kor">Jag är redo! 🚀</button>
        <button class="knapp sekundar" id="tillbaka">Öva mer först</button></div>
      </div></div>`;
    $('#tillbaka').onclick = () => visaHem(false);
    await new Promise((r) => ($('#kor').onclick = r));
    ljud.klick();

    const d = laxdata(laxa.id);
    d.provforsok = (d.provforsok || 0) + 1;
    spara();
    const sc = scen('Provet', fragor.length);
    const missade = [];
    let ratt = 0, raknade = 0;
    for (let i = 0; i < fragor.length; i++) {
      sc.framsteg(i);
      const { typ, item } = fragor[i];
      const r = await FRAGOR[typ]({ item, kropp: sc.kropp, prov: true });
      if (r === null) continue;
      raknade++;
      if (r.ratt) ratt++;
      else if (!missade.includes(item)) missade.push(item);
    }
    sc.framsteg(fragor.length);
    LP.gomKompis();

    if (missade.length === 0) {
      const forstaGangen = !d.klar;
      d.klar = true;
      d.klarDatum = d.klarDatum || new Date().toLocaleDateString('sv-SE');
      d.svaga = [];
      spara();
      app.innerHTML = `
        <div class="scen"><div class="kort resultat">
          <img class="jubel" src="bilder/penny-jubel.jpg" alt="Penny" style="height:260px">
          <div><span class="klarstampel">LÄXAN KLAR!</span></div>
          <h2 style="margin-top:20px">${ratt} av ${raknade} rätt! ${forstaGangen ? '+5 ⭐' : ''}</h2>
          <p style="font-size:20px">Du är fantastisk, ${esc(data.namn || '')}! Visa pappa! 🎉</p>
          <div class="knappar"><button class="knapp gron" id="portal">Till mina läxor 🏆</button></div>
        </div></div>`;
      $('#portal').onclick = () => { location.href = 'index.html'; };
      LP.storFest();
      setTimeout(() => LP.storFest(), 2400);
      kompis('JAAA! Du klarade det! 🎉🎉🎉', { vem: 'penny', humor: 'skrattar' });
      return;
    }

    d.svaga = missade.map((i) => i.id);
    spara();
    app.innerHTML = `
      <div class="scen"><div class="kort resultat">
        <img class="jubel" src="bilder/penny-hel.jpg" alt="Penny" style="height:200px">
        <h2>${ratt} av ${raknade} rätt! 💪</h2>
        <p style="font-size:20px">${missade.length <= 2 ? 'Så nära!' : 'Bra kämpat!'} Öva lite till på de här, så klarar du det nästa gång:</p>
        <div class="ovalista">${missade.map((i) => `<span>${esc(i.fr)}</span>`).join('')}</div>
        <p class="svag">Spelen tar de här orden först när du övar.</p>
        <div class="knappar">
          <button class="knapp" id="ova">Öva på dem</button>
          <button class="knapp gul" id="igen">Försök igen 🔁</button>
        </div>
      </div></div>`;
    LP.konfetti({ antal: 50, regn: true });
    kompis('Varje gång du övar blir hjärnan starkare! 🧠', { vem: 'penny', humor: 'glad', tid: 6000 });
    $('#ova').onclick = () => visaHem(false);
    $('#igen').onclick = () => korProv();
  }
})();
