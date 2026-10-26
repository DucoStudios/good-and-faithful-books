// Läxa: kroppsdelar på franska (nivå för en nioåring).
// visa: hur kroppsdelen visas. typ 'penny' = Penny-bilden inzoomad med en ring,
//   bild 'hel' (framifrån) eller 'bak' (bakifrån), x/y i procent av bilden, z = zoom.
// p: ställen på Penny (framifrån) där man får peka i "Peka på Penny", [x, y, radie] i procent.
(function () {
  const items = [
    { id: 'tete', fr: 'la tête', sv: 'huvudet', hor: ['tet', 'tette'], visa: { typ: 'penny', bild: 'hel', x: 50, y: 18, z: 1.15, r: 30 }, p: [[50, 18, 15]] },
    { id: 'cheveux', fr: 'les cheveux', sv: 'håret', hor: ['cheveu', 'chevaux'], visa: { typ: 'penny', bild: 'hel', x: 38, y: 10, z: 1.6, r: 16 }, p: [[45, 8, 7], [23, 24, 6], [73, 22, 6]] },
    { id: 'oeil', fr: "l'œil", sv: 'ögat', info: 'Två ögon heter les yeux.', alt: ['les yeux', "l'oeil"], hor: ['oeuil', 'yeux'], visa: { typ: 'penny', bild: 'hel', x: 43, y: 19.5, z: 2.6, r: 10 }, p: [[43, 19.5, 4.5], [58.5, 18.5, 4.5]] },
    { id: 'nez', fr: 'le nez', sv: 'näsan', hor: ['ne', 'nes', 'nee'], visa: { typ: 'penny', bild: 'hel', x: 52.5, y: 21, z: 2.6, r: 9 }, p: [[52.5, 21, 4]] },
    { id: 'bouche', fr: 'la bouche', sv: 'munnen', hor: ['bouch', 'bouchee'], visa: { typ: 'penny', bild: 'hel', x: 51, y: 25, z: 2.4, r: 11 }, p: [[51, 25, 5]] },
    { id: 'oreille', fr: "l'oreille", sv: 'örat', hor: ['oreil'], visa: { typ: 'penny', bild: 'hel', x: 30, y: 22.5, z: 2.4, r: 11 }, p: [[30, 22.5, 5]] },
    { id: 'dent', fr: 'la dent', sv: 'tanden', info: 'Många tänder heter les dents.', alt: ['les dents'], hor: ['dans', 'dents', 'dan'], visa: { typ: 'emoji', emoji: '🦷' } },
    { id: 'cou', fr: 'le cou', sv: 'halsen', hor: ['coup', 'cous', 'cout', 'cool', 'qu'], visa: { typ: 'penny', bild: 'hel', x: 50, y: 30.5, z: 2, r: 11 }, p: [[50, 30.5, 4.5]] },
    { id: 'epaule', fr: "l'épaule", sv: 'axeln', hor: ['epaule', 'epaul'], visa: { typ: 'penny', bild: 'hel', x: 30, y: 34, z: 1.8, r: 13 }, p: [[30, 34, 6], [69, 33.5, 6]] },
    { id: 'bras', fr: 'le bras', sv: 'armen', hor: ['bra', 'brat'], visa: { typ: 'penny', bild: 'hel', x: 25, y: 44, z: 1.5, r: 18 }, p: [[25, 44, 7], [75, 44, 7]] },
    { id: 'coude', fr: 'le coude', sv: 'armbågen', hor: ['coud'], visa: { typ: 'penny', bild: 'hel', x: 21, y: 48, z: 2, r: 11 }, p: [[21, 48, 5], [77, 48, 5]] },
    { id: 'main', fr: 'la main', sv: 'handen', hor: ['mains', 'maint', 'ma main', 'min'], visa: { typ: 'penny', bild: 'hel', x: 38, y: 40, z: 2.2, r: 12 }, p: [[38, 40, 5.5], [62, 40, 5.5]] },
    { id: 'doigt', fr: 'le doigt', sv: 'fingret', hor: ['doit', 'doigts', 'doi', 'dois'], visa: { typ: 'emoji', emoji: '☝️' } },
    { id: 'ventre', fr: 'le ventre', sv: 'magen', hor: ['vente', 'ventres'], visa: { typ: 'penny', bild: 'hel', x: 50, y: 46, z: 1.5, r: 18 }, p: [[50, 46, 8]] },
    { id: 'dos', fr: 'le dos', sv: 'ryggen', hor: ['do', 'dot', 'dau'], visa: { typ: 'penny', bild: 'bak', x: 50, y: 38, z: 1.2, r: 26 } },
    { id: 'jambe', fr: 'la jambe', sv: 'benet', hor: ['jamb', 'jambes', 'chambre'], visa: { typ: 'penny', bild: 'hel', x: 38, y: 68, z: 1.3, r: 20 }, p: [[38, 68, 7], [62, 68, 7]] },
    { id: 'genou', fr: 'le genou', sv: 'knät', hor: ['genoux', 'je nous'], visa: { typ: 'penny', bild: 'hel', x: 36, y: 74, z: 1.9, r: 13 }, p: [[36, 74, 5.5], [64, 74, 5.5]] },
    { id: 'pied', fr: 'le pied', sv: 'foten', hor: ['pie', 'pier'], visa: { typ: 'penny', bild: 'hel', x: 26, y: 92, z: 1.6, r: 18 }, p: [[25, 93, 9], [73, 93, 9]] },
    { id: 'orteil', fr: "l'orteil", sv: 'tån', info: 'Alla tårna heter les orteils.', alt: ['les orteils'], hor: ['orteille'], visa: { typ: 'emoji', emoji: '🦶' } },
  ];

  LP.registreraLaxa({
    id: 'kroppen',
    titel: 'Kroppen på franska',
    ikon: '🧍‍♀️',
    farg: '#3d7be0',
    sprak: 'fr-FR',
    artikel: true,
    visaSv: true,
    intro: 'Nu ska vi lära oss kroppen på franska! Du får peka på mig. Det kittlas lite …',
    items,
    lagen: ['lar', 'lyssna', 'peka', 'memory', 'valj', 'bygg', 'skriv', 'ballong', 'tala'],
    prov: [
      { typ: 'peka', antal: 4 },
      { typ: 'lyssna', antal: 3 },
      { typ: 'skriv', antal: 10 },
      { typ: 'tala', antal: 3 },
    ],
  });
})();
