// Läxa: räkna till trettio på franska och stava alla siffror.
(function () {
  const ord = [
    ['un', 'ett', ['hein', 'une', 'in']],
    ['deux', 'två', ['de', "d'eux", 'deu']],
    ['trois', 'tre', ['troie', 'troy']],
    ['quatre', 'fyra', ['cat', 'quatres']],
    ['cinq', 'fem', ['saint', 'sain', 'sein', 'cinque', 'sink']],
    ['six', 'sex', ['si', 'scie', 'cis', 'sis']],
    ['sept', 'sju', ['set', 'cet', 'cette', 'sete', 'sette']],
    ['huit', 'åtta', ['oui', 'ouie', 'wheat']],
    ['neuf', 'nio', ['noeuf', 'new']],
    ['dix', 'tio', ['dis', 'dit', 'disse', 'dice']],
    ['onze', 'elva', ['once']],
    ['douze', 'tolv', ['douse']],
    ['treize', 'tretton', ['trez']],
    ['quatorze', 'fjorton', []],
    ['quinze', 'femton', ['kinze']],
    ['seize', 'sexton', ['seze', 'says']],
    ['dix-sept', 'sjutton', ['disette']],
    ['dix-huit', 'arton', ['dizzy']],
    ['dix-neuf', 'nitton', []],
    ['vingt', 'tjugo', ['vin', 'vain', 'vint', 'vins', 'vent']],
    ['vingt et un', 'tjugoett', []],
    ['vingt-deux', 'tjugotvå', []],
    ['vingt-trois', 'tjugotre', []],
    ['vingt-quatre', 'tjugofyra', []],
    ['vingt-cinq', 'tjugofem', []],
    ['vingt-six', 'tjugosex', []],
    ['vingt-sept', 'tjugosju', []],
    ['vingt-huit', 'tjugoåtta', []],
    ['vingt-neuf', 'tjugonio', []],
    ['trente', 'trettio', ['trante']],
  ];

  const items = ord.map(([fr, sv, hor], i) => ({
    id: String(i + 1),
    fr,
    sv,
    alt: fr === 'vingt et un' ? ['vingt-et-un'] : [],
    hor,
    visa: { typ: 'text', text: String(i + 1) },
  }));

  LP.registreraLaxa({
    id: 'siffror',
    titel: 'Siffror 1–30 på franska',
    ikon: '🔢',
    farg: '#ff7a2f',
    sprak: 'fr-FR',
    intro: 'Hej! Jag heter Penny. Nu ska vi lära oss räkna till trettio på franska. Un, deux, trois … kör!',
    items,
    // I vilken ordning spelen visas på läxsidan.
    lagen: ['lar', 'lyssna', 'ordning', 'sekvens', 'memory', 'valj', 'bygg', 'skriv', 'ballong', 'tala'],
    prov: [
      { typ: 'lyssna', antal: 4 },
      { typ: 'sekvens', antal: 3 },
      { typ: 'skriv', antal: 12 },
      { typ: 'tala', antal: 3 },
    ],
  });
})();
