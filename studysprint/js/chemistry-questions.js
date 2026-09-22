// Chemistry question bank. Reuses shared helpers (randInt, choice, shuffle,
// buildChoices, round2, supify, makeBank, defineTopic, C_PRIMARY, etc.)
// defined in questions.js, which must load first.

// ---- chemistry-specific SVG helpers ---------------------------------------

function atomSVG(protons, electrons) {
  const cx = 130, cy = 130;
  let shells = '';
  let remaining = electrons;
  // 2n^2 shell capacities support atoms up to Krypton (36 electrons) while
  // keeping the drawn radius inside the enlarged viewBox below.
  const shellCapacities = [2, 8, 18, 32];
  let radius = 30;
  shellCapacities.forEach(cap => {
    if (remaining <= 0) return;
    const inShell = Math.min(remaining, cap);
    shells += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${C_BORDER}" stroke-width="1.5"/>`;
    for (let i = 0; i < inShell; i++) {
      const angle = (2 * Math.PI * i) / inShell;
      const ex = cx + radius * Math.cos(angle);
      const ey = cy + radius * Math.sin(angle);
      shells += `<circle cx="${ex}" cy="${ey}" r="5" fill="${C_PRIMARY}"/>`;
    }
    remaining -= inShell;
    radius += 25;
  });
  return `<svg viewBox="0 0 260 260" class="q-diagram" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${cx}" cy="${cy}" r="18" fill="#dc2626"/>
    <text x="${cx}" y="${cy + 5}" font-size="12" text-anchor="middle" fill="#fff">${protons}p</text>
    ${shells}
  </svg>`;
}

function moleculeSVG(atoms) {
  // atoms: array of {label, x, y, color}
  const bonds = [];
  for (let i = 1; i < atoms.length; i++) {
    bonds.push(`<line x1="${atoms[0].x}" y1="${atoms[0].y}" x2="${atoms[i].x}" y2="${atoms[i].y}" stroke="${C_MUTED}" stroke-width="3"/>`);
  }
  const circles = atoms.map(a => `<circle cx="${a.x}" cy="${a.y}" r="22" fill="${a.color}"/><text x="${a.x}" y="${a.y + 5}" font-size="14" text-anchor="middle" fill="#fff">${a.label}</text>`).join('');
  return `<svg viewBox="0 0 220 160" class="q-diagram" xmlns="http://www.w3.org/2000/svg">${bonds.join('')}${circles}</svg>`;
}

function phScaleSVG(value) {
  const width = 420, height = 80, padding = 20;
  const scale = (width - padding * 2) / 14;
  const x = padding + value * scale;
  let ticks = '';
  for (let i = 0; i <= 14; i += 2) {
    const tx = padding + i * scale;
    ticks += `<text x="${tx}" y="60" font-size="11" text-anchor="middle" fill="${C_MUTED}">${i}</text>`;
  }
  return `<svg viewBox="0 0 ${width} ${height}" class="q-diagram" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="phgrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#dc2626"/>
        <stop offset="50%" stop-color="#16a34a"/>
        <stop offset="100%" stop-color="#4f46e5"/>
      </linearGradient>
    </defs>
    <rect x="${padding}" y="20" width="${width - padding * 2}" height="16" fill="url(#phgrad)" rx="4"/>
    ${ticks}
    <polygon points="${x},18 ${x - 7},4 ${x + 7},4" fill="${C_TEXT}"/>
  </svg>`;
}

// ---- Atoms & Elements -------------------------------------------------------

const atomsTemplates = [
  { bloom: 'Remember', gen: () => {
    const facts = [
      { q: 'What subatomic particle has a positive charge?', correct: 'Proton', wrongs: ['Electron', 'Neutron', 'Nucleus'] },
      { q: 'What subatomic particle has a negative charge?', correct: 'Electron', wrongs: ['Proton', 'Neutron', 'Nucleus'] },
      { q: 'What subatomic particle has no electric charge?', correct: 'Neutron', wrongs: ['Proton', 'Electron', 'Ion'] },
      { q: 'What do we call the number of protons in an atom\'s nucleus?', correct: 'Atomic number', wrongs: ['Mass number', 'Atomic mass', 'Valence number'] },
      { q: 'What do we call the sum of protons and neutrons in an atom\'s nucleus?', correct: 'Mass number', wrongs: ['Atomic number', 'Atomic mass', 'Isotope number'] },
      { q: 'What do we call atoms of the same element that have different numbers of neutrons?', correct: 'Isotopes', wrongs: ['Ions', 'Molecules', 'Compounds'] },
      { q: 'What do we call an atom that has gained or lost electrons, giving it an overall electric charge?', correct: 'Ion', wrongs: ['Isotope', 'Molecule', 'Neutron'] },
      { q: 'What do we call the tiny, dense, positively charged center of an atom?', correct: 'Nucleus', wrongs: ['Electron cloud', 'Valence shell', 'Orbital'] },
      { q: 'What do we call the region around the nucleus where electrons are most likely to be found?', correct: 'Electron cloud', wrongs: ['Nucleus', 'Isotope shell', 'Ion core'] },
      { q: 'What do we call the electrons in an atom\'s outermost shell, which determine how it bonds?', correct: 'Valence electrons', wrongs: ['Core electrons', 'Nuclear electrons', 'Free electrons'] },
      { q: 'What scientist is credited with the "planetary" model of the atom, with electrons orbiting a nucleus?', correct: 'Niels Bohr', wrongs: ['Isaac Newton', 'Charles Darwin', 'Marie Curie'] },
      { q: 'What do we call the weighted average mass of an element\'s isotopes, found on the periodic table?', correct: 'Atomic mass', wrongs: ['Mass number', 'Atomic number', 'Molar volume'] },
      { q: 'In a NEUTRAL atom, how does the number of electrons compare to the number of protons?', correct: 'They are equal', wrongs: ['Electrons outnumber protons', 'Protons outnumber electrons', 'There is no relationship'] },
      { q: 'What do we call an atom that has lost one or more electrons, giving it a positive charge?', correct: 'Cation', wrongs: ['Anion', 'Isotope', 'Neutron'] },
      { q: 'What do we call an atom that has gained one or more electrons, giving it a negative charge?', correct: 'Anion', wrongs: ['Cation', 'Isotope', 'Proton'] },
      { q: 'What do we call the smallest particle of an element that still has the properties of that element?', correct: 'Atom', wrongs: ['Molecule', 'Compound', 'Mixture'] },
      { q: 'Roughly how many times more massive is a proton than an electron?', correct: 'About 1,800 times', wrongs: ['About 2 times', 'About 100 times', 'They have the same mass'] },
      { q: 'What do we call the model of the atom where electrons exist in probability "clouds" rather than fixed orbits?', correct: 'Electron cloud model', wrongs: ['Solid sphere model', 'Plum pudding model', 'Planetary model'] },
      { q: 'What do we call the outermost energy level of electrons in an atom?', correct: 'Valence shell', wrongs: ['Nucleus', 'Inner shell', 'Ion core'] },
      { q: 'If an atom has 12 protons and 12 neutrons, what is true about its overall charge (assuming it is neutral)?', correct: 'It has no overall charge', wrongs: ['It is positively charged', 'It is negatively charged', 'It cannot be determined'] },
      { q: 'What scientist proposed that atoms are mostly empty space with a small, dense, positively charged nucleus, based on his gold foil experiment?', correct: 'Ernest Rutherford', wrongs: ['Niels Bohr', 'John Dalton', 'J.J. Thomson'] },
      { q: 'What scientist discovered the electron using a cathode ray tube experiment?', correct: 'J.J. Thomson', wrongs: ['Ernest Rutherford', 'James Chadwick', 'John Dalton'] },
      { q: 'What scientist discovered the neutron in 1932?', correct: 'James Chadwick', wrongs: ['Ernest Rutherford', 'J.J. Thomson', 'Niels Bohr'] },
      { q: 'What scientist is credited with the earliest modern atomic theory, proposing that all matter is made of tiny, indivisible atoms?', correct: 'John Dalton', wrongs: ['Ernest Rutherford', 'J.J. Thomson', 'Marie Curie'] },
      { q: 'What early atomic model is nicknamed the "plum pudding" model, showing electrons scattered through a positive sphere?', correct: "Thomson's model", wrongs: ["Bohr's model", "Rutherford's model", "Dalton's model"] },
      { q: 'What do we call the modern description of where electrons are likely to be found, based on probability rather than fixed paths?', correct: 'Quantum mechanical model', wrongs: ['Planetary model', 'Plum pudding model', 'Solid sphere model'] },
      { q: 'What do we call the specific region of space within an electron cloud where an electron is most likely to be found?', correct: 'Orbital', wrongs: ['Nucleus', 'Isotope', 'Valence shell'] },
      { q: 'What do we call the maximum number of electrons that can occupy an atom\'s first (innermost) electron shell?', correct: 'Two', wrongs: ['Eight', 'Eighteen', 'Four'] },
      { q: 'What do we call the maximum number of electrons that can typically occupy an atom\'s second electron shell?', correct: 'Eight', wrongs: ['Two', 'Eighteen', 'Six'] },
      { q: 'What is the electric charge of the nucleus of an atom, ignoring any surrounding electrons?', correct: 'Positive', wrongs: ['Negative', 'Neutral', 'It varies randomly'] },
      { q: 'What do we call two atoms of the same element with different mass numbers but identical chemical behavior?', correct: 'Isotopes', wrongs: ['Ions', 'Allotropes', 'Isomers'] },
      { q: 'What do we call the radioactive process in which an unstable nucleus breaks down and releases particles or energy?', correct: 'Radioactive decay', wrongs: ['Ionization', 'Sublimation', 'Neutralization'] },
      { q: 'What do we call the notation that shows an isotope\'s mass number as a superscript before the element symbol, such as ¹⁴C?', correct: 'Isotope notation', wrongs: ['Ionic notation', 'Lewis structure', 'Electron configuration'] },
      { q: 'Roughly how many times more massive is a neutron than an electron?', correct: 'About 1,800 times', wrongs: ['About 2 times', 'About 10 times', 'They have the same mass'] },
      { q: 'What do we call the total number of protons plus neutrons in a single atom?', correct: 'Mass number', wrongs: ['Atomic number', 'Atomic mass', 'Avogadro number'] },
      { q: 'If a neutral atom loses an electron, what happens to its overall charge?', correct: 'It becomes positively charged', wrongs: ['It becomes negatively charged', 'It stays neutral', 'It loses a proton too'] },
      { q: 'If a neutral atom gains an electron, what happens to its overall charge?', correct: 'It becomes negatively charged', wrongs: ['It becomes positively charged', 'It stays neutral', 'It gains a proton too'] },
      { q: 'What do we call the smallest unit of an element that can still be divided further into protons, neutrons, and electrons?', correct: 'Atom', wrongs: ['Molecule', 'Quark', 'Nucleon'] },
      { q: 'What is the approximate diameter of a typical atom?', correct: 'About one ten-billionth of a meter', wrongs: ['About one meter', 'About one millimeter', 'About one centimeter'] },
      { q: 'What do subatomic particles called "nucleons" refer to collectively?', correct: 'Protons and neutrons', wrongs: ['Protons and electrons', 'Neutrons and electrons', 'Only protons'] }
    ];
    const f = choice(facts);
    const choices = shuffle([f.correct, ...f.wrongs]);
    return { prompt: f.q, type: 'mcq', choices, correct: f.correct, explanation: `${f.correct} is the correct particle.` };
  }},
  { bloom: 'Understand', gen: () => {
    const protons = randInt(1, 36);
    const diagram = atomSVG(protons, protons);
    const choices = buildChoices(String(protons), () => String(protons + choice([-2, -1, 1, 2])));
    return {
      prompt: 'Based on the atomic diagram shown (protons in the nucleus), what is the atomic number of this atom?',
      type: 'mcq',
      choices,
      correct: String(protons),
      diagram,
      explanation: `The atomic number equals the number of protons in the nucleus, which is ${protons}.`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const elements = [
      ['Carbon', 6, 6], ['Oxygen', 8, 8], ['Nitrogen', 7, 7], ['Sodium', 11, 12],
      ['Helium', 2, 2], ['Neon', 10, 10], ['Aluminum', 13, 14], ['Magnesium', 12, 12],
      ['Hydrogen', 1, 0], ['Lithium', 3, 4], ['Beryllium', 4, 5], ['Boron', 5, 6],
      ['Fluorine', 9, 10], ['Silicon', 14, 14], ['Phosphorus', 15, 16], ['Sulfur', 16, 16],
      ['Chlorine', 17, 18], ['Argon', 18, 22], ['Potassium', 19, 20], ['Calcium', 20, 20],
      ['Scandium', 21, 24], ['Titanium', 22, 26], ['Iron', 26, 30], ['Zinc', 30, 35]
    ];
    const [name, protons, neutrons] = choice(elements);
    const askMass = Math.random() < 0.5;
    if (askMass) {
      return {
        prompt: `${name} has ${protons} protons and ${neutrons} neutrons. What is its mass number?`,
        type: 'numeric',
        answer: protons + neutrons,
        explanation: `Mass number = protons + neutrons = ${protons} + ${neutrons} = ${protons + neutrons}.`
      };
    }
    return {
      prompt: `An atom of ${name} has a mass number of ${protons + neutrons} and ${protons} protons. How many neutrons does it have?`,
      type: 'numeric',
      answer: neutrons,
      explanation: `Neutrons = mass number - protons = ${protons + neutrons} - ${protons} = ${neutrons}.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const protons = randInt(3, 15), neutrons = randInt(3, 16);
    const correctMass = protons + neutrons;
    const wrongMass = protons * neutrons;
    const correct = `They multiplied instead of adding — mass number = ${protons} + ${neutrons} = ${correctMass}, not ${wrongMass}`;
    const wrongs = ['The student is correct', 'Mass number equals protons only', 'Mass number equals neutrons only'];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `A student calculated the mass number of an atom with ${protons} protons and ${neutrons} neutrons as ${wrongMass} by multiplying. What is their mistake?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Mass number is protons PLUS neutrons: ${protons} + ${neutrons} = ${correctMass}.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const ANSWERS = {
      cation: 'a positive ion (cation), since it has more protons than electrons',
      anion: 'a negative ion (anion), since it has more electrons than protons',
      neutral: 'a neutral atom, since protons and electrons are equal'
    };
    const scenarios = [
      { scenario: 'an atom with 11 protons and 10 electrons', category: 'cation' },
      { scenario: 'an atom with 9 protons and 10 electrons', category: 'anion' },
      { scenario: 'an atom with 6 protons and 6 electrons', category: 'neutral' },
      { scenario: 'an atom with 20 protons and 18 electrons', category: 'cation' },
      { scenario: 'an atom with 17 protons and 18 electrons', category: 'anion' },
      { scenario: 'an atom with 8 protons and 8 electrons', category: 'neutral' },
      { scenario: 'an atom with 13 protons and 10 electrons', category: 'cation' },
      { scenario: 'an atom with 7 protons and 10 electrons', category: 'anion' },
      { scenario: 'an atom with 1 proton and 1 electron', category: 'neutral' },
      { scenario: 'an atom with 19 protons and 18 electrons', category: 'cation' },
      { scenario: 'an atom with 8 protons and 10 electrons', category: 'anion' },
      { scenario: 'an atom with 14 protons and 14 electrons', category: 'neutral' },
      { scenario: 'an atom with 12 protons and 10 electrons', category: 'cation' },
      { scenario: 'an atom with 35 protons and 36 electrons', category: 'anion' },
      { scenario: 'an atom with 18 protons and 18 electrons', category: 'neutral' },
      { scenario: 'an atom with 3 protons and 2 electrons', category: 'cation' },
      { scenario: 'an atom with 16 protons and 18 electrons', category: 'anion' },
      { scenario: 'an atom with 10 protons and 10 electrons', category: 'neutral' },
      { scenario: 'an atom with 38 protons and 36 electrons', category: 'cation' },
      { scenario: 'an atom with 53 protons and 54 electrons', category: 'anion' },
      { scenario: 'an atom with 4 protons and 2 electrons', category: 'cation' },
      { scenario: 'an atom with 15 protons and 18 electrons', category: 'anion' },
      { scenario: 'an atom with 2 protons and 2 electrons', category: 'neutral' },
      { scenario: 'an atom with 20 protons and 20 electrons', category: 'neutral' },
      { scenario: 'an atom with 5 protons and 2 electrons', category: 'cation' },
      { scenario: 'an atom with 34 protons and 36 electrons', category: 'anion' },
      { scenario: 'an atom with 15 protons and 15 electrons', category: 'neutral' },
      { scenario: 'an atom with 22 protons and 18 electrons', category: 'cation' },
      { scenario: 'an atom with 33 protons and 36 electrons', category: 'anion' },
      { scenario: 'an atom with 26 protons and 26 electrons', category: 'neutral' },
      { scenario: 'an atom with 30 protons and 28 electrons', category: 'cation' },
      { scenario: 'an atom with 5 protons and 6 electrons', category: 'anion' },
      { scenario: 'an atom with 30 protons and 30 electrons', category: 'neutral' },
      { scenario: 'an atom with 56 protons and 54 electrons', category: 'cation' },
      { scenario: 'an atom with 52 protons and 54 electrons', category: 'anion' },
      { scenario: 'an atom with 47 protons and 47 electrons', category: 'neutral' },
      { scenario: 'an atom with 37 protons and 36 electrons', category: 'cation' },
      { scenario: 'an atom with 6 protons and 10 electrons', category: 'anion' }
    ];
    const entry = choice(scenarios);
    const correct = ANSWERS[entry.category];
    const otherCategories = Object.keys(ANSWERS).filter(c => c !== entry.category);
    const wrongs = [...otherCategories.map(c => ANSWERS[c]), 'An isotope, since it has an unusual number of neutrons'];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Consider ${entry.scenario}. What can you conclude about its charge?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Charge depends on the balance of protons (+) and electrons (-). ${correct}`
    };
  }},
  { bloom: 'Create', gen: () => {
    const target = randInt(10, 60);
    let p = randInt(4, target - 4);
    let n = target - p;
    while (n === p) { p = randInt(4, target - 4); n = target - p; }
    const correct = `${p} protons and ${n} neutrons`;
    const wrongs = [`${p + 1} protons and ${n} neutrons`, `${p} protons and ${n + 2} neutrons`, `${n} protons and ${p} neutrons`];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Which combination of protons and neutrons gives an atom a mass number of exactly ${target}?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `${correct}: ${p} + ${n} = ${target}.`
    };
  }}
];

// ---- Molecules & Bonding -----------------------------------------------------

const COVALENT_CHECK_POOL = [
  { pairDesc: 'two oxygen atoms bond together to form O₂ gas' },
  { pairDesc: 'two nitrogen atoms bond together to form N₂ gas' },
  { pairDesc: 'two hydrogen atoms bond together to form H₂ gas' },
  { pairDesc: 'two chlorine atoms bond together to form Cl₂ gas' },
  { pairDesc: 'two fluorine atoms bond together to form F₂ gas' },
  { pairDesc: 'two bromine atoms bond together to form Br₂' },
  { pairDesc: 'two iodine atoms bond together to form I₂' },
  { pairDesc: 'a carbon atom bonds with four hydrogen atoms to form CH₄' },
  { pairDesc: 'a nitrogen atom bonds with three hydrogen atoms to form NH₃' },
  { pairDesc: 'a carbon atom bonds with two oxygen atoms to form CO₂' },
  { pairDesc: 'a hydrogen atom bonds with a chlorine atom to form HCl' },
  { pairDesc: 'a hydrogen atom bonds with a fluorine atom to form HF' },
  { pairDesc: 'two hydrogen atoms bond with one oxygen atom to form H₂O' },
  { pairDesc: 'a carbon atom bonds with an oxygen atom to form CO' },
  { pairDesc: 'a phosphorus atom bonds with three chlorine atoms to form PCl₃' },
  { pairDesc: 'a sulfur atom bonds with two oxygen atoms to form SO₂' },
  { pairDesc: 'a silicon atom bonds with four oxygen atoms in a silicate structure' },
  { pairDesc: 'two carbon atoms bond with six hydrogen atoms to form C₂H₆' },
  { pairDesc: 'a nitrogen atom bonds with an oxygen atom to form NO' },
  { pairDesc: 'two nonmetal atoms bond together to form a diatomic molecule of oxygen and nitrogen mixed in the air' },
  { pairDesc: 'a chlorine atom bonds with a fluorine atom to form ClF' },
  { pairDesc: 'a bromine atom bonds with a chlorine atom to form BrCl' },
  { pairDesc: 'an iodine atom bonds with a fluorine atom to form IF' },
  { pairDesc: 'a silicon atom bonds with an oxygen atom to form SiO' },
  { pairDesc: 'a nitrogen atom bonds with another nitrogen atom and an oxygen atom to form N₂O' },
  { pairDesc: 'a sulfur atom bonds with two chlorine atoms to form SCl₂' },
  { pairDesc: 'a nitrogen atom bonds with two oxygen atoms to form NO₂' },
  { pairDesc: 'a carbon atom bonds with two sulfur atoms to form CS₂' },
  { pairDesc: 'a silicon atom bonds with four fluorine atoms to form SiF₄' },
  { pairDesc: 'a boron atom bonds with three fluorine atoms to form BF₃' },
  { pairDesc: 'a sulfur atom bonds with three oxygen atoms to form SO₃' },
  { pairDesc: 'a carbon atom bonds with four fluorine atoms to form CF₄' },
  { pairDesc: 'a carbon atom bonds with four chlorine atoms to form CCl₄' },
  { pairDesc: 'two phosphorus atoms bond with five oxygen atoms to form P₂O₅' },
  { pairDesc: 'a hydrogen atom bonds with a bromine atom to form HBr' },
  { pairDesc: 'a hydrogen atom bonds with an iodine atom to form HI' },
  { pairDesc: 'two nitrogen atoms bond with four oxygen atoms to form N₂O₄' },
  { pairDesc: 'a xenon atom bonds with two fluorine atoms to form the rare compound XeF₂' },
  { pairDesc: 'a carbon atom bonds with two hydrogen atoms and two chlorine atoms to form CH₂Cl₂' },
  { pairDesc: 'a nitrogen atom bonds with three fluorine atoms to form NF₃' }
];

const IONIC_CHECK_POOL = [
  { metal: 'sodium', nonmetal: 'chlorine', compound: 'NaCl' },
  { metal: 'potassium', nonmetal: 'fluorine', compound: 'KF' },
  { metal: 'magnesium', nonmetal: 'oxygen', compound: 'MgO' },
  { metal: 'calcium', nonmetal: 'chlorine', compound: 'CaCl₂' },
  { metal: 'lithium', nonmetal: 'fluorine', compound: 'LiF' },
  { metal: 'potassium', nonmetal: 'bromine', compound: 'KBr' },
  { metal: 'sodium', nonmetal: 'fluorine', compound: 'NaF' },
  { metal: 'lithium', nonmetal: 'chlorine', compound: 'LiCl' },
  { metal: 'calcium', nonmetal: 'oxygen', compound: 'CaO' },
  { metal: 'magnesium', nonmetal: 'chlorine', compound: 'MgCl₂' },
  { metal: 'potassium', nonmetal: 'chlorine', compound: 'KCl' },
  { metal: 'sodium', nonmetal: 'bromine', compound: 'NaBr' },
  { metal: 'calcium', nonmetal: 'fluorine', compound: 'CaF₂' },
  { metal: 'lithium', nonmetal: 'oxygen', compound: 'Li₂O' },
  { metal: 'barium', nonmetal: 'oxygen', compound: 'BaO' },
  { metal: 'aluminum', nonmetal: 'oxygen', compound: 'Al₂O₃' },
  { metal: 'aluminum', nonmetal: 'chlorine', compound: 'AlCl₃' },
  { metal: 'sodium', nonmetal: 'iodine', compound: 'NaI' },
  { metal: 'potassium', nonmetal: 'iodine', compound: 'KI' },
  { metal: 'magnesium', nonmetal: 'fluorine', compound: 'MgF₂' },
  { metal: 'barium', nonmetal: 'chlorine', compound: 'BaCl₂' },
  { metal: 'barium', nonmetal: 'fluorine', compound: 'BaF₂' },
  { metal: 'lithium', nonmetal: 'bromine', compound: 'LiBr' },
  { metal: 'lithium', nonmetal: 'iodine', compound: 'LiI' },
  { metal: 'potassium', nonmetal: 'oxygen', compound: 'K₂O' },
  { metal: 'calcium', nonmetal: 'bromine', compound: 'CaBr₂' },
  { metal: 'calcium', nonmetal: 'iodine', compound: 'CaI₂' },
  { metal: 'magnesium', nonmetal: 'bromine', compound: 'MgBr₂' },
  { metal: 'magnesium', nonmetal: 'iodine', compound: 'MgI₂' },
  { metal: 'aluminum', nonmetal: 'fluorine', compound: 'AlF₃' },
  { metal: 'aluminum', nonmetal: 'bromine', compound: 'AlBr₃' },
  { metal: 'sodium', nonmetal: 'sulfur', compound: 'Na₂S' },
  { metal: 'potassium', nonmetal: 'sulfur', compound: 'K₂S' },
  { metal: 'zinc', nonmetal: 'oxygen', compound: 'ZnO' },
  { metal: 'zinc', nonmetal: 'chlorine', compound: 'ZnCl₂' },
  { metal: 'silver', nonmetal: 'chlorine', compound: 'AgCl' },
  { metal: 'silver', nonmetal: 'bromine', compound: 'AgBr' },
  { metal: 'strontium', nonmetal: 'oxygen', compound: 'SrO' },
  { metal: 'strontium', nonmetal: 'chlorine', compound: 'SrCl₂' },
  { metal: 'rubidium', nonmetal: 'chlorine', compound: 'RbCl' }
];

const COVALENT_CREATE_POOL = [
  { formula: 'H₂O', correct: 'Two hydrogen atoms sharing electrons with one oxygen atom' },
  { formula: 'CH₄', correct: 'One carbon atom sharing electrons with four hydrogen atoms' },
  { formula: 'NH₃', correct: 'One nitrogen atom sharing electrons with three hydrogen atoms' },
  { formula: 'CO₂', correct: 'One carbon atom sharing electrons with two oxygen atoms' },
  { formula: 'HCl', correct: 'One hydrogen atom sharing electrons with one chlorine atom' },
  { formula: 'HF', correct: 'One hydrogen atom sharing electrons with one fluorine atom' },
  { formula: 'O₂', correct: 'Two oxygen atoms sharing electrons with each other' },
  { formula: 'N₂', correct: 'Two nitrogen atoms sharing electrons with each other' },
  { formula: 'Cl₂', correct: 'Two chlorine atoms sharing electrons with each other' },
  { formula: 'H₂', correct: 'Two hydrogen atoms sharing electrons with each other' },
  { formula: 'CO', correct: 'One carbon atom sharing electrons with one oxygen atom' },
  { formula: 'SiO₂', correct: 'One silicon atom sharing electrons with two oxygen atoms' },
  { formula: 'PCl₃', correct: 'One phosphorus atom sharing electrons with three chlorine atoms' },
  { formula: 'SO₂', correct: 'One sulfur atom sharing electrons with two oxygen atoms' },
  { formula: 'C₂H₆', correct: 'Two carbon atoms sharing electrons with each other and with six hydrogen atoms' },
  { formula: 'HBr', correct: 'One hydrogen atom sharing electrons with one bromine atom' },
  { formula: 'CS₂', correct: 'One carbon atom sharing electrons with two sulfur atoms' },
  { formula: 'H₂S', correct: 'Two hydrogen atoms sharing electrons with one sulfur atom' },
  { formula: 'PH₃', correct: 'One phosphorus atom sharing electrons with three hydrogen atoms' },
  { formula: 'CCl₄', correct: 'One carbon atom sharing electrons with four chlorine atoms' },
  { formula: 'ClF', correct: 'One chlorine atom sharing electrons with one fluorine atom' },
  { formula: 'BrCl', correct: 'One bromine atom sharing electrons with one chlorine atom' },
  { formula: 'IF', correct: 'One iodine atom sharing electrons with one fluorine atom' },
  { formula: 'SiO₂', correct: 'One silicon atom sharing electrons with two oxygen atoms in a network structure' },
  { formula: 'N₂O', correct: 'Two nitrogen atoms sharing electrons with each other and with one oxygen atom' },
  { formula: 'SCl₂', correct: 'One sulfur atom sharing electrons with two chlorine atoms' },
  { formula: 'NO₂', correct: 'One nitrogen atom sharing electrons with two oxygen atoms' },
  { formula: 'CS₂', correct: 'One carbon atom sharing electrons with two sulfur atoms' },
  { formula: 'SiF₄', correct: 'One silicon atom sharing electrons with four fluorine atoms' },
  { formula: 'BF₃', correct: 'One boron atom sharing electrons with three fluorine atoms' },
  { formula: 'SO₃', correct: 'One sulfur atom sharing electrons with three oxygen atoms' },
  { formula: 'CF₄', correct: 'One carbon atom sharing electrons with four fluorine atoms' },
  { formula: 'HI', correct: 'One hydrogen atom sharing electrons with one iodine atom' },
  { formula: 'NF₃', correct: 'One nitrogen atom sharing electrons with three fluorine atoms' },
  { formula: 'PCl₅', correct: 'One phosphorus atom sharing electrons with five chlorine atoms' },
  { formula: 'OF₂', correct: 'One oxygen atom sharing electrons with two fluorine atoms' },
  { formula: 'ClO₂', correct: 'One chlorine atom sharing electrons with two oxygen atoms' },
  { formula: 'C₂H₄', correct: 'Two carbon atoms sharing electrons with each other and with four hydrogen atoms' },
  { formula: 'C₂H₂', correct: 'Two carbon atoms sharing electrons with each other and with two hydrogen atoms' },
  { formula: 'CH₃Cl', correct: 'One carbon atom sharing electrons with three hydrogen atoms and one chlorine atom' }
];

const moleculesTemplates = [
  { bloom: 'Remember', gen: () => {
    const facts = [
      { q: 'What do we call a bond formed when atoms SHARE electrons?', correct: 'Covalent bond' },
      { q: 'What do we call a bond formed when one atom TRANSFERS an electron to another?', correct: 'Ionic bond' },
      { q: 'What is the smallest unit of a compound that keeps its chemical properties?', correct: 'Molecule' },
      { q: 'What do we call an atom (or group of atoms) that has gained or lost electrons, giving it an electric charge?', correct: 'Ion' },
      { q: 'What do we call two or more elements chemically combined in a fixed ratio?', correct: 'Compound' },
      { q: 'What do we call the force of attraction that holds a metal\'s atoms together, formed by a "sea" of shared electrons?', correct: 'Metallic bond' },
      { q: 'What do we call a bond where electrons are shared UNEQUALLY between two atoms of different electronegativity?', correct: 'Polar covalent bond' },
      { q: 'What do we call two or more atoms of the SAME element bonded together, like O₂ or N₂?', correct: 'Diatomic molecule' },
      { q: 'What do we call a bond where electrons are shared EQUALLY between two atoms of similar electronegativity?', correct: 'Nonpolar covalent bond' },
      { q: 'What do we call the notation showing the exact number and type of atoms in a molecule, like H₂O?', correct: 'Chemical formula' },
      { q: 'What do we call a bond formed by sharing TWO pairs of electrons between two atoms?', correct: 'Double bond' },
      { q: 'What do we call a bond formed by sharing THREE pairs of electrons between two atoms?', correct: 'Triple bond' },
      { q: 'What do we call the repeating three-dimensional arrangement of ions in an ionic solid, like table salt?', correct: 'Crystal lattice' },
      { q: 'What do we call the measure of how strongly an atom attracts shared electrons in a bond?', correct: 'Electronegativity' },
      { q: 'What do we call two or more atoms held together by a chemical bond, whether of the same or different elements?', correct: 'Molecule' },
      { q: 'What do we call the weak attraction between the slightly positive hydrogen of one molecule and a nearby slightly negative atom, important in water?', correct: 'Hydrogen bond' },
      { q: 'What do we call a group of atoms that stays bonded together and carries an overall charge, like the sulfate ion?', correct: 'Polyatomic ion' },
      { q: 'What do we call the simplest whole-number ratio of atoms in a compound?', correct: 'Empirical formula' },
      { q: 'What do we call the tendency of atoms to gain, lose, or share electrons so they end up with eight electrons in their outer shell?', correct: 'Octet rule' },
      { q: 'What do we call a diagram that uses dots to show the valence electrons around an atom or molecule?', correct: 'Lewis structure' },
      { q: 'What do we call a formula that shows how atoms are arranged and connected within a molecule, not just their counts?', correct: 'Structural formula' },
      { q: 'What do we call the formula that shows the exact number of each type of atom in one molecule, such as C₆H₁₂O₆?', correct: 'Molecular formula' },
      { q: 'What do we call a covalent bond where BOTH shared electrons come from the same atom?', correct: 'Coordinate covalent bond' },
      { q: 'What do we call a molecule with an uneven distribution of charge, having a slightly positive end and a slightly negative end?', correct: 'Dipole' },
      { q: 'What do we call the weak attractive forces that act BETWEEN separate molecules, rather than within them?', correct: 'Intermolecular force' },
      { q: 'What do we call an electron in an atom\'s outermost shell that participates in chemical bonding?', correct: 'Valence electron' },
      { q: 'What do we call the average distance between the nuclei of two atoms joined by a chemical bond?', correct: 'Bond length' },
      { q: 'What do we call the amount of energy needed to break one mole of a particular chemical bond?', correct: 'Bond energy' },
      { q: 'What do we call the weak, short-range attractive forces between all molecules, caused by temporary shifts in electron distribution?', correct: 'Van der Waals force' },
      { q: 'What do we call a giant structure, like diamond, where atoms are linked together in a continuous network of covalent bonds?', correct: 'Network covalent bond' },
      { q: 'What do we call the smallest repeating ratio of ions in an ionic compound\'s crystal lattice?', correct: 'Formula unit' },
      { q: 'Which type of bond is typically found between a metal and a nonmetal, such as sodium and chlorine?', correct: 'Ionic bond' },
      { q: 'Which type of bond is typically found between two nonmetal atoms, such as two hydrogen atoms?', correct: 'Covalent bond' },
      { q: 'What is the term for two or more different elements combined chemically in fixed proportions, like table salt?', correct: 'Compound' },
      { q: 'What do we call a charged particle formed when a neutral atom or molecule gains or loses one or more electrons?', correct: 'Ion' },
      { q: 'What do we call the strong bonds found within metals that allow them to conduct electricity and be shaped easily?', correct: 'Metallic bond' },
      { q: 'What term describes a bond where electron sharing is unequal because one atom pulls harder on the shared electrons?', correct: 'Polar covalent bond' },
      { q: 'What do we call the smallest whole-number ratio of elements in an ionic compound, such as CaCl₂?', correct: 'Empirical formula' },
      { q: 'What do we call a group of covalently bonded atoms that stays together and carries an overall charge, such as the nitrate ion?', correct: 'Polyatomic ion' }
    ];
    const allTerms = ['Covalent bond', 'Ionic bond', 'Molecule', 'Ion', 'Compound', 'Metallic bond', 'Polar covalent bond', 'Diatomic molecule', 'Nonpolar covalent bond', 'Chemical formula', 'Double bond', 'Triple bond', 'Crystal lattice', 'Electronegativity', 'Hydrogen bond', 'Polyatomic ion', 'Empirical formula', 'Octet rule', 'Lewis structure', 'Structural formula', 'Molecular formula', 'Coordinate covalent bond', 'Dipole', 'Intermolecular force', 'Valence electron', 'Bond length', 'Bond energy', 'Van der Waals force', 'Network covalent bond', 'Formula unit'];
    const f = choice(facts);
    const wrongs = shuffle(allTerms.filter(c => c !== f.correct)).slice(0, 3);
    const choices = shuffle([f.correct, ...wrongs]);
    return { prompt: f.q, type: 'mcq', choices, correct: f.correct, explanation: `${f.correct} matches this definition.` };
  }},
  { bloom: 'Understand', gen: () => {
    const molecules = [
      { formula: 'H₂O', name: 'Water', atoms: [{label:'O',x:110,y:50,color:'#dc2626'},{label:'H',x:70,y:110,color:C_PRIMARY},{label:'H',x:150,y:110,color:C_PRIMARY}] },
      { formula: 'CO₂', name: 'Carbon dioxide', atoms: [{label:'C',x:110,y:80,color:'#374151'},{label:'O',x:50,y:80,color:'#dc2626'},{label:'O',x:170,y:80,color:'#dc2626'}] },
      { formula: 'CH₄', name: 'Methane', atoms: [{label:'C',x:110,y:80,color:'#374151'},{label:'H',x:60,y:50,color:C_PRIMARY},{label:'H',x:160,y:50,color:C_PRIMARY},{label:'H',x:60,y:120,color:C_PRIMARY}] },
      { formula: 'NH₃', name: 'Ammonia', atoms: [{label:'N',x:110,y:80,color:'#0891b2'},{label:'H',x:60,y:50,color:C_PRIMARY},{label:'H',x:160,y:50,color:C_PRIMARY},{label:'H',x:110,y:130,color:C_PRIMARY}] },
      { formula: 'O₂', name: 'Oxygen gas', atoms: [{label:'O',x:70,y:80,color:'#dc2626'},{label:'O',x:150,y:80,color:'#dc2626'}] },
      { formula: 'N₂', name: 'Nitrogen gas', atoms: [{label:'N',x:70,y:80,color:'#0891b2'},{label:'N',x:150,y:80,color:'#0891b2'}] },
      { formula: 'HCl', name: 'Hydrogen chloride', atoms: [{label:'H',x:70,y:80,color:C_PRIMARY},{label:'Cl',x:150,y:80,color:'#16a34a'}] },
      { formula: 'CO', name: 'Carbon monoxide', atoms: [{label:'C',x:70,y:80,color:'#374151'},{label:'O',x:150,y:80,color:'#dc2626'}] },
      { formula: 'H₂', name: 'Hydrogen gas', atoms: [{label:'H',x:70,y:80,color:C_PRIMARY},{label:'H',x:150,y:80,color:C_PRIMARY}] },
      { formula: 'Cl₂', name: 'Chlorine gas', atoms: [{label:'Cl',x:70,y:80,color:'#16a34a'},{label:'Cl',x:150,y:80,color:'#16a34a'}] },
      { formula: 'NO', name: 'Nitric oxide', atoms: [{label:'N',x:70,y:80,color:'#0891b2'},{label:'O',x:150,y:80,color:'#dc2626'}] },
      { formula: 'HF', name: 'Hydrogen fluoride', atoms: [{label:'H',x:70,y:80,color:C_PRIMARY},{label:'F',x:150,y:80,color:'#f59e0b'}] },
      { formula: 'Br₂', name: 'Bromine gas', atoms: [{label:'Br',x:70,y:80,color:'#78350f'},{label:'Br',x:150,y:80,color:'#78350f'}] },
      { formula: 'F₂', name: 'Fluorine gas', atoms: [{label:'F',x:70,y:80,color:'#f59e0b'},{label:'F',x:150,y:80,color:'#f59e0b'}] },
      { formula: 'HBr', name: 'Hydrogen bromide', atoms: [{label:'H',x:70,y:80,color:C_PRIMARY},{label:'Br',x:150,y:80,color:'#78350f'}] },
      { formula: 'I₂', name: 'Iodine gas', atoms: [{label:'I',x:70,y:80,color:'#7c3aed'},{label:'I',x:150,y:80,color:'#7c3aed'}] },
      { formula: 'HI', name: 'Hydrogen iodide', atoms: [{label:'H',x:70,y:80,color:C_PRIMARY},{label:'I',x:150,y:80,color:'#7c3aed'}] },
      { formula: 'OF₂', name: 'Oxygen difluoride', atoms: [{label:'O',x:110,y:80,color:'#dc2626'},{label:'F',x:60,y:50,color:'#f59e0b'},{label:'F',x:160,y:50,color:'#f59e0b'}] },
      { formula: 'PH₃', name: 'Phosphine', atoms: [{label:'P',x:110,y:80,color:'#ea580c'},{label:'H',x:60,y:50,color:C_PRIMARY},{label:'H',x:160,y:50,color:C_PRIMARY},{label:'H',x:110,y:130,color:C_PRIMARY}] },
      { formula: 'H₂S', name: 'Hydrogen sulfide', atoms: [{label:'S',x:110,y:50,color:'#ca8a04'},{label:'H',x:70,y:110,color:C_PRIMARY},{label:'H',x:150,y:110,color:C_PRIMARY}] },
      { formula: 'SiH₄', name: 'Silane', atoms: [{label:'Si',x:110,y:80,color:'#57534e'},{label:'H',x:60,y:50,color:C_PRIMARY},{label:'H',x:160,y:50,color:C_PRIMARY},{label:'H',x:60,y:120,color:C_PRIMARY}] },
      { formula: 'ClF', name: 'Chlorine monofluoride', atoms: [{label:'Cl',x:70,y:80,color:'#16a34a'},{label:'F',x:150,y:80,color:'#f59e0b'}] },
      { formula: 'BrCl', name: 'Bromine chloride', atoms: [{label:'Br',x:70,y:80,color:'#78350f'},{label:'Cl',x:150,y:80,color:'#16a34a'}] },
      { formula: 'IF', name: 'Iodine monofluoride', atoms: [{label:'I',x:70,y:80,color:'#7c3aed'},{label:'F',x:150,y:80,color:'#f59e0b'}] },
      { formula: 'ICl', name: 'Iodine chloride', atoms: [{label:'I',x:70,y:80,color:'#7c3aed'},{label:'Cl',x:150,y:80,color:'#16a34a'}] },
      { formula: 'SiO', name: 'Silicon monoxide', atoms: [{label:'Si',x:70,y:80,color:'#57534e'},{label:'O',x:150,y:80,color:'#dc2626'}] },
      { formula: 'CS', name: 'Carbon monosulfide', atoms: [{label:'C',x:70,y:80,color:'#374151'},{label:'S',x:150,y:80,color:'#ca8a04'}] },
      { formula: 'ClO', name: 'Chlorine monoxide', atoms: [{label:'Cl',x:70,y:80,color:'#16a34a'},{label:'O',x:150,y:80,color:'#dc2626'}] },
      { formula: 'BrF', name: 'Bromine monofluoride', atoms: [{label:'Br',x:70,y:80,color:'#78350f'},{label:'F',x:150,y:80,color:'#f59e0b'}] },
      { formula: 'N₂O', name: 'Nitrous oxide', atoms: [{label:'N',x:110,y:80,color:'#0891b2'},{label:'N',x:50,y:80,color:'#0891b2'},{label:'O',x:170,y:80,color:'#dc2626'}] },
      { formula: 'Cl₂O', name: 'Dichlorine monoxide', atoms: [{label:'O',x:110,y:80,color:'#dc2626'},{label:'Cl',x:60,y:50,color:'#16a34a'},{label:'Cl',x:160,y:50,color:'#16a34a'}] },
      { formula: 'SCl₂', name: 'Sulfur dichloride', atoms: [{label:'S',x:110,y:50,color:'#ca8a04'},{label:'Cl',x:70,y:110,color:'#16a34a'},{label:'Cl',x:150,y:110,color:'#16a34a'}] },
      { formula: 'NO₂', name: 'Nitrogen dioxide', atoms: [{label:'N',x:110,y:80,color:'#0891b2'},{label:'O',x:50,y:80,color:'#dc2626'},{label:'O',x:170,y:80,color:'#dc2626'}] },
      { formula: 'CS₂', name: 'Carbon disulfide', atoms: [{label:'C',x:110,y:80,color:'#374151'},{label:'S',x:50,y:80,color:'#ca8a04'},{label:'S',x:170,y:80,color:'#ca8a04'}] },
      { formula: 'SiF₄', name: 'Silicon tetrafluoride', atoms: [{label:'Si',x:110,y:80,color:'#57534e'},{label:'F',x:60,y:50,color:'#f59e0b'},{label:'F',x:160,y:50,color:'#f59e0b'},{label:'F',x:60,y:120,color:'#f59e0b'}] },
      { formula: 'BF₃', name: 'Boron trifluoride', atoms: [{label:'B',x:110,y:80,color:'#c026d3'},{label:'F',x:60,y:50,color:'#f59e0b'},{label:'F',x:160,y:50,color:'#f59e0b'},{label:'F',x:110,y:130,color:'#f59e0b'}] },
      { formula: 'AlCl₃', name: 'Aluminum chloride', atoms: [{label:'Al',x:110,y:80,color:'#94a3b8'},{label:'Cl',x:60,y:50,color:'#16a34a'},{label:'Cl',x:160,y:50,color:'#16a34a'},{label:'Cl',x:110,y:130,color:'#16a34a'}] },
      { formula: 'PCl₃', name: 'Phosphorus trichloride', atoms: [{label:'P',x:110,y:80,color:'#ea580c'},{label:'Cl',x:60,y:50,color:'#16a34a'},{label:'Cl',x:160,y:50,color:'#16a34a'},{label:'Cl',x:110,y:130,color:'#16a34a'}] },
      { formula: 'SO₃', name: 'Sulfur trioxide', atoms: [{label:'S',x:110,y:80,color:'#ca8a04'},{label:'O',x:60,y:50,color:'#dc2626'},{label:'O',x:160,y:50,color:'#dc2626'},{label:'O',x:110,y:130,color:'#dc2626'}] },
      { formula: 'CCl₄', name: 'Carbon tetrachloride', atoms: [{label:'C',x:110,y:80,color:'#374151'},{label:'Cl',x:60,y:50,color:'#16a34a'},{label:'Cl',x:160,y:50,color:'#16a34a'},{label:'Cl',x:60,y:120,color:'#16a34a'}] },
      { formula: 'CF₄', name: 'Carbon tetrafluoride', atoms: [{label:'C',x:110,y:80,color:'#374151'},{label:'F',x:60,y:50,color:'#f59e0b'},{label:'F',x:160,y:50,color:'#f59e0b'},{label:'F',x:60,y:120,color:'#f59e0b'}] }
    ];
    const m = choice(molecules);
    const diagram = moleculeSVG(m.atoms);
    const wrongs = shuffle(molecules.filter(x => x !== m)).slice(0, 3).map(x => `${x.name} (${x.formula})`);
    const correct = `${m.name} (${m.formula})`;
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: 'Based on the atoms and bonds shown, which molecule is this?',
      type: 'mcq',
      choices,
      correct,
      diagram,
      explanation: `The diagram shows the atoms that make up ${correct}.`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const compounds = [
      { formula: 'H₂O', counts: { H: 2, O: 1 } },
      { formula: 'CO₂', counts: { C: 1, O: 2 } },
      { formula: 'NaCl', counts: { Na: 1, Cl: 1 } },
      { formula: 'CH₄', counts: { C: 1, H: 4 } },
      { formula: 'C₆H₁₂O₆', counts: { C: 6, H: 12, O: 6 } },
      { formula: 'NH₃', counts: { N: 1, H: 3 } },
      { formula: 'CaCO₃', counts: { Ca: 1, C: 1, O: 3 } },
      { formula: 'C₂H₆', counts: { C: 2, H: 6 } },
      { formula: 'Al₂O₃', counts: { Al: 2, O: 3 } },
      { formula: 'C₆H₆', counts: { C: 6, H: 6 } },
      { formula: 'Mg(OH)₂', counts: { Mg: 1, O: 2, H: 2 } },
      { formula: 'HNO₃', counts: { H: 1, N: 1, O: 3 } },
      { formula: 'H₂SO₄', counts: { H: 2, S: 1, O: 4 } },
      { formula: 'NaOH', counts: { Na: 1, O: 1, H: 1 } },
      { formula: 'KMnO₄', counts: { K: 1, Mn: 1, O: 4 } },
      { formula: 'C₃H₈', counts: { C: 3, H: 8 } },
      { formula: 'C₂H₄', counts: { C: 2, H: 4 } },
      { formula: 'C₂H₂', counts: { C: 2, H: 2 } },
      { formula: 'CH₃OH', counts: { C: 1, H: 4, O: 1 } },
      { formula: 'NH₄Cl', counts: { N: 1, H: 4, Cl: 1 } },
      { formula: 'Fe₂O₃', counts: { Fe: 2, O: 3 } },
      { formula: 'CuSO₄', counts: { Cu: 1, S: 1, O: 4 } },
      { formula: 'K₂CO₃', counts: { K: 2, C: 1, O: 3 } },
      { formula: 'Na₂SO₄', counts: { Na: 2, S: 1, O: 4 } },
      { formula: 'CaCl₂', counts: { Ca: 1, Cl: 2 } },
      { formula: 'MgSO₄', counts: { Mg: 1, S: 1, O: 4 } }
    ];
    const c = choice(compounds);
    const elements = Object.keys(c.counts);
    const target = choice(elements);
    return {
      prompt: `In the compound ${c.formula}, how many atoms of ${target} are in one molecule?`,
      type: 'numeric',
      answer: c.counts[target],
      explanation: `The subscript after ${target} in ${c.formula} tells you there ${c.counts[target] === 1 ? 'is' : 'are'} ${c.counts[target]} atom${c.counts[target] === 1 ? '' : 's'} of ${target}.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const entry = choice(COVALENT_CHECK_POOL);
    const correct = 'It is covalent — both are nonmetals that share electrons rather than transfer them';
    const wrongs = ['It is ionic — nonmetals always transfer electrons completely', 'It is metallic, since it conducts electricity', 'It has no bond at all, since both atoms are the same type'];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Two nonmetal atoms: ${entry.pairDesc}. A student says this must be an ionic bond. Evaluate this claim.`,
      type: 'mcq',
      choices,
      correct,
      explanation: 'Nonmetal-nonmetal bonds are covalent (sharing electrons). Ionic bonds typically form between a metal and a nonmetal (transferring electrons).'
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const entry = choice(IONIC_CHECK_POOL);
    const correct = 'Ionic bonds, because metals lose electrons easily and nonmetals gain them easily';
    const wrongs = ['Covalent bonds, because metals and nonmetals always share electrons equally', 'No bond at all, since metals and nonmetals cannot combine', 'Metallic bonds, since one of the elements is a metal'];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `When ${entry.metal} reacts with ${entry.nonmetal} to form ${entry.compound}, what type of bond typically forms, and why?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Metals tend to lose electrons and nonmetals tend to gain them, so electrons transfer completely — forming an ionic bond (as in ${entry.compound}).`
    };
  }},
  { bloom: 'Create', gen: () => {
    const entry = choice(COVALENT_CREATE_POOL);
    const wrongs = [
      'A single, isolated atom with no other atoms nearby',
      'Two ions simply sitting next to each other without any electron sharing',
      'An atom randomly changing its number of protons'
    ];
    const choices = shuffle([entry.correct, ...wrongs]);
    return {
      prompt: `Which scenario best represents how the molecule ${entry.formula} forms through covalent bonding?`,
      type: 'mcq',
      choices,
      correct: entry.correct,
      explanation: `A covalent bond forms when atoms share electrons: ${entry.correct.toLowerCase()} to form ${entry.formula}.`
    };
  }}
];

// ---- Mixtures & Solutions -----------------------------------------------------

const mixturesTemplates = [
  { bloom: 'Remember', gen: () => {
    const facts = [
      { q: 'What do we call a mixture where one substance is evenly dissolved in another?', correct: 'Solution', wrongs: ['Suspension', 'Compound', 'Colloid'] },
      { q: 'What do we call the substance that gets dissolved in a solution (like sugar in water)?', correct: 'Solute', wrongs: ['Solvent', 'Precipitate', 'Catalyst'] },
      { q: 'What do we call the substance that does the dissolving in a solution (like water)?', correct: 'Solvent', wrongs: ['Solute', 'Precipitate', 'Catalyst'] }
    ];
    const f = choice(facts);
    const choices = shuffle([f.correct, ...f.wrongs]);
    return { prompt: f.q, type: 'mcq', choices, correct: f.correct, explanation: `${f.correct} matches this definition.` };
  }},
  { bloom: 'Understand', gen: () => {
    const methods = [
      { scenario: 'Separating sand from water by pouring the water through a coffee filter', correct: 'Filtration' },
      { scenario: 'Separating salt from water by heating the mixture until the water turns to vapor', correct: 'Evaporation' },
      { scenario: 'Separating iron filings from a mix of iron and sand using a magnet', correct: 'Magnetic separation' }
    ];
    const m = choice(methods);
    const wrongs = ['Filtration', 'Evaporation', 'Magnetic separation', 'Distillation'].filter(t => t !== m.correct);
    const choices = shuffle([m.correct, ...wrongs]);
    return { prompt: `"${m.scenario}" — which separation method is this?`, type: 'mcq', choices, correct: m.correct, explanation: `This is an example of ${m.correct.toLowerCase()}.` };
  }},
  { bloom: 'Apply', gen: () => {
    const soluteGrams = randInt(5, 50);
    const solutionML = randInt(50, 500);
    return {
      prompt: `Using Concentration (g/mL) = mass of solute ÷ volume of solution, find the concentration of a solution with ${soluteGrams} g of solute dissolved in ${solutionML} mL of solution.`,
      type: 'numeric',
      tolerance: 0.005,
      answer: round2(soluteGrams / solutionML),
      explanation: `Concentration = ${soluteGrams} ÷ ${solutionML} = ${round2(soluteGrams / solutionML)} g/mL.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const solute = randInt(10, 40), solvent = randInt(60, 200);
    const correctConc = round2(solute / (solute + solvent));
    const wrongConc = round2(solute / solvent);
    const correct = `They divided by the solvent alone instead of the total solution — the correct concentration is ${correctConc} g/mL, not ${wrongConc} g/mL`;
    const wrongs = ['The student is correct', 'Concentration should be solvent divided by solute', 'Concentration cannot be calculated this way'];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `A student dissolved ${solute} g of solute in ${solvent} mL of solvent (total solution volume ${solute + solvent} mL) and calculated the concentration as ${wrongConc} g/mL using solute ÷ solvent. What is their mistake?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Concentration should use the TOTAL solution volume: ${solute} ÷ (${solute}+${solvent}) = ${correctConc} g/mL.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const tempLow = randInt(10, 20), tempHigh = tempLow + randInt(20, 40);
    const correct = `More sugar dissolves at ${tempHigh}°C, since solubility of solids generally increases with temperature`;
    const wrongs = [`More sugar dissolves at ${tempLow}°C, since solubility always decreases with temperature`, 'The same amount dissolves regardless of temperature', 'Temperature has no effect on solubility'];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `You have two glasses of water: one at ${tempLow}°C and one at ${tempHigh}°C. In which glass will more sugar dissolve, and why?`,
      type: 'mcq',
      choices,
      correct,
      explanation: 'For most solid solutes like sugar, solubility increases as temperature increases — the warmer water can dissolve more sugar.'
    };
  }},
  { bloom: 'Create', gen: () => {
    const correct = 'Stirring instant coffee powder into hot water until it disappears completely';
    const wrongs = [
      'Mixing oil and water, which separate into two visible layers',
      'Shaking sand and gravel together in a jar',
      'Mixing iron filings with sawdust'
    ];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: 'Which scenario best demonstrates forming a true solution?',
      type: 'mcq',
      choices,
      correct,
      explanation: 'A true solution forms when a solute dissolves completely and evenly into a solvent, like coffee powder disappearing into hot water.'
    };
  }}
];

// ---- Chemical Reactions --------------------------------------------------------

const reactionsTemplates = [
  { bloom: 'Remember', gen: () => {
    const facts = [
      { q: 'What do we call the starting substances in a chemical reaction?', correct: 'Reactants', wrongs: ['Products', 'Catalysts', 'Precipitates'] },
      { q: 'What do we call the new substances formed by a chemical reaction?', correct: 'Products', wrongs: ['Reactants', 'Solutes', 'Isotopes'] },
      { q: 'What law states that mass is neither created nor destroyed in a chemical reaction?', correct: 'Law of conservation of mass', wrongs: ["Newton's third law", 'Law of definite proportions', 'Periodic law'] },
      { q: 'What do we call a substance that speeds up a chemical reaction without being used up itself?', correct: 'Catalyst', wrongs: ['Reactant', 'Product', 'Precipitate'] },
      { q: 'What do we call a solid that forms out of a solution during a chemical reaction?', correct: 'Precipitate', wrongs: ['Reactant', 'Catalyst', 'Solvent'] },
      { q: 'What do we call a reaction that RELEASES heat energy to its surroundings?', correct: 'Exothermic reaction', wrongs: ['Endothermic reaction', 'Neutral reaction', 'Synthesis reaction'] },
      { q: 'What do we call a reaction that ABSORBS heat energy from its surroundings?', correct: 'Endothermic reaction', wrongs: ['Exothermic reaction', 'Neutral reaction', 'Decomposition reaction'] },
      { q: 'What do we call a reaction where two or more simple substances combine to form one more complex product?', correct: 'Synthesis reaction', wrongs: ['Decomposition reaction', 'Single-replacement reaction', 'Combustion reaction'] },
      { q: 'What do we call a reaction where one compound breaks down into two or more simpler substances?', correct: 'Decomposition reaction', wrongs: ['Synthesis reaction', 'Double-replacement reaction', 'Combustion reaction'] },
      { q: 'What do we call a reaction where a substance combines with oxygen, releasing energy as heat and light?', correct: 'Combustion reaction', wrongs: ['Synthesis reaction', 'Decomposition reaction', 'Neutralization reaction'] },
      { q: 'What do we call a reaction where one element replaces another element in a compound?', correct: 'Single-replacement reaction', wrongs: ['Double-replacement reaction', 'Synthesis reaction', 'Combustion reaction'] },
      { q: 'What do we call a reaction where the positive and negative ions of two compounds swap places?', correct: 'Double-replacement reaction', wrongs: ['Single-replacement reaction', 'Decomposition reaction', 'Synthesis reaction'] },
      { q: 'What do we call the minimum amount of energy needed to start a chemical reaction?', correct: 'Activation energy', wrongs: ['Kinetic energy', 'Potential energy', 'Thermal equilibrium'] },
      { q: 'What do we call the numbers placed in front of formulas in a chemical equation to balance the atoms?', correct: 'Coefficients', wrongs: ['Subscripts', 'Exponents', 'Isotopes'] },
      { q: 'What do we call the small numbers written after an element symbol showing how many atoms are in the formula?', correct: 'Subscripts', wrongs: ['Coefficients', 'Superscripts', 'Valences'] },
      { q: 'What do we call an equation where the number of atoms of each element is equal on both sides?', correct: 'Balanced equation', wrongs: ['Unbalanced equation', 'Ionic equation', 'Molecular formula'] },
      { q: 'What do we call the loss of electrons by a substance during a chemical reaction?', correct: 'Oxidation', wrongs: ['Reduction', 'Neutralization', 'Precipitation'] },
      { q: 'What do we call the gain of electrons by a substance during a chemical reaction?', correct: 'Reduction', wrongs: ['Oxidation', 'Neutralization', 'Sublimation'] },
      { q: 'What do we call a reaction between an acid and a base that produces a salt and water?', correct: 'Neutralization reaction', wrongs: ['Combustion reaction', 'Decomposition reaction', 'Synthesis reaction'] },
      { q: 'What do we call the study of the amount of heat released or absorbed during chemical reactions?', correct: 'Thermochemistry', wrongs: ['Stoichiometry', 'Thermodynamics of motion', 'Electrochemistry'] }
    ];
    const f = choice(facts);
    const choices = shuffle([f.correct, ...f.wrongs]);
    return { prompt: f.q, type: 'mcq', choices, correct: f.correct, explanation: `${f.correct} is correct.` };
  }},
  { bloom: 'Understand', gen: () => {
    const signs = [
      { scenario: 'Bubbles form when you mix baking soda and vinegar', correct: 'Gas production' },
      { scenario: 'Bubbles rise out of a freshly opened bottle of hydrogen peroxide poured on a cut', correct: 'Gas production' },
      { scenario: 'A fizzing antacid tablet dropped into water releases a steady stream of bubbles', correct: 'Gas production' },
      { scenario: 'A balloon slowly inflates when placed over a bottle of baking soda and vinegar', correct: 'Gas production' },
      { scenario: 'Rising bread dough puffs up as yeast produces bubbles inside it', correct: 'Gas production' },
      { scenario: 'A metal object rusts and changes color over time', correct: 'Color change' },
      { scenario: 'A sliced apple left out on the counter slowly turns brown', correct: 'Color change' },
      { scenario: 'A copper roof turns from shiny orange to dull green over many years', correct: 'Color change' },
      { scenario: 'Silverware left in a drawer for months develops a dark, dull tarnish', correct: 'Color change' },
      { scenario: 'Leaves change from green to red and orange in the fall as chlorophyll breaks down', correct: 'Color change' },
      { scenario: 'A glow stick heats up slightly when it starts glowing', correct: 'Temperature change' },
      { scenario: 'A hand warmer packet becomes noticeably hot after you shake it', correct: 'Temperature change' },
      { scenario: 'An instant cold pack turns icy cold the moment its inner pouch is broken', correct: 'Temperature change' },
      { scenario: 'A test tube feels warm to the touch right after two clear liquids are mixed', correct: 'Temperature change' },
      { scenario: 'Wet concrete grows warm to the touch as it cures and hardens', correct: 'Temperature change' },
      { scenario: 'A cloudy white solid appears at the bottom of a test tube after two clear solutions are combined', correct: 'Precipitate formation' },
      { scenario: 'Mixing two clear liquids causes a chalky solid to settle at the bottom of the beaker', correct: 'Precipitate formation' },
      { scenario: 'A milky solid suddenly forms and clouds a solution when silver nitrate is added to salt water', correct: 'Precipitate formation' },
      { scenario: 'Hard water pipes slowly build up a solid mineral scale where dissolved minerals react and settle out', correct: 'Precipitate formation' },
      { scenario: 'A clear solution turns cloudy as tiny solid particles form and drift to the bottom of the container', correct: 'Precipitate formation' }
    ];
    const s = choice(signs);
    const wrongs = ['Gas production', 'Color change', 'Temperature change', 'Precipitate formation'].filter(t => t !== s.correct);
    const choices = shuffle([s.correct, ...wrongs]);
    return { prompt: `"${s.scenario}" — which sign of a chemical reaction is being described?`, type: 'mcq', choices, correct: s.correct, explanation: `This is an example of ${s.correct.toLowerCase()}.` };
  }},
  { bloom: 'Apply', gen: () => {
    const reactions = [
      { equation: '2H₂ + O₂ → 2H₂O', fromLabel: 'H₂', fromCoef: 2, toLabel: 'H₂O', toCoef: 2 },
      { equation: '2H₂ + O₂ → 2H₂O', fromLabel: 'O₂', fromCoef: 1, toLabel: 'H₂O', toCoef: 2 },
      { equation: 'N₂ + 3H₂ → 2NH₃', fromLabel: 'H₂', fromCoef: 3, toLabel: 'NH₃', toCoef: 2 },
      { equation: 'N₂ + 3H₂ → 2NH₃', fromLabel: 'N₂', fromCoef: 1, toLabel: 'NH₃', toCoef: 2 },
      { equation: '2Mg + O₂ → 2MgO', fromLabel: 'Mg', fromCoef: 2, toLabel: 'MgO', toCoef: 2 }
    ];
    const r = choice(reactions);
    const k = randInt(2, 8);
    const fromAmount = r.fromCoef * k;
    const toAmount = r.toCoef * k;
    return {
      prompt: `In the balanced equation ${r.equation}, if you start with ${fromAmount} molecules of ${r.fromLabel}, how many molecules of ${r.toLabel} are produced?`,
      type: 'numeric',
      answer: toAmount,
      explanation: `The mole ratio of ${r.fromLabel} to ${r.toLabel} is ${r.fromCoef}:${r.toCoef}. ${fromAmount} ÷ ${r.fromCoef} × ${r.toCoef} = ${toAmount}.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const massReactants = randInt(20, 100);
    const claimedProducts = massReactants + choice([-10, -5, 5, 10]);
    const correct = `Incorrect — by the law of conservation of mass, the products should have a total mass of ${massReactants} g, not ${claimedProducts} g`;
    const wrongs = ['Correct — mass can change during a chemical reaction', 'Incorrect — mass always doubles in a reaction', 'Cannot be determined without knowing the reactants'];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `${massReactants} g of reactants combine in a chemical reaction. A student says the products will have a total mass of ${claimedProducts} g. Evaluate this claim.`,
      type: 'mcq',
      choices,
      correct,
      explanation: `The law of conservation of mass says total mass stays the same: ${massReactants} g of reactants must produce ${massReactants} g of products.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const entries = [
      { scenario: 'When you mix baking soda and vinegar, bubbles of gas rapidly form.', correct: 'A chemical reaction, because a new gas (carbon dioxide) is produced that was not there before' },
      { scenario: 'A nail left outside in the rain slowly turns orange and flaky over several weeks.', correct: 'A chemical reaction, because a new substance (iron oxide, or rust) forms that was not there before' },
      { scenario: 'A candle burns, producing light, heat, and a thin trail of soot.', correct: 'A chemical reaction, because the wax combines with oxygen to form new substances like carbon dioxide and water vapor' },
      { scenario: 'A slice of bread turns golden-brown and crisp when toasted.', correct: 'A chemical reaction, because heat converts the sugars and proteins on the surface into new brown-colored compounds' },
      { scenario: 'Milk left out on the counter for two days develops a sour smell and lumpy texture.', correct: 'A chemical reaction, because bacteria convert the milk into new substances like lactic acid' },
      { scenario: 'A firework explodes in the sky, releasing bright colored light and a loud bang.', correct: 'A chemical reaction, because burning metal compounds release energy as new gaseous products form' },
      { scenario: 'A silver spoon left in a drawer for months develops a dark, dull tarnish.', correct: 'A chemical reaction, because the silver reacts with sulfur compounds in the air to form a new substance, silver sulfide' },
      { scenario: 'An antacid tablet dropped into a glass of water fizzes rapidly and dissolves.', correct: 'A chemical reaction, because the fizzing shows a new gas is being produced that was not there before' },
      { scenario: 'Bread dough left with yeast rises and grows bubbly over an hour.', correct: 'A chemical reaction, because the yeast converts sugars into new substances, including carbon dioxide gas' },
      { scenario: 'A banana peel develops brown spots a few days after it is picked.', correct: 'A chemical reaction, because exposed cells produce new brown pigments when they react with oxygen in the air' },
      { scenario: 'An egg white turns from clear and runny to white and solid when it is fried.', correct: 'A chemical reaction, because heat permanently changes the proteins in the egg white into a new solid structure' },
      { scenario: 'A pile of dry leaves is set on fire and burns down into a small pile of ash.', correct: 'A chemical reaction, because the leaves combine with oxygen and are converted into ash, water vapor, and carbon dioxide' },
      { scenario: 'A drop of hydrogen peroxide poured on a cut foams up immediately.', correct: 'A chemical reaction, because the foaming shows a new gas (oxygen) is being released that was not there before' },
      { scenario: 'A car battery slowly loses its charge while powering the headlights overnight.', correct: 'A chemical reaction, because chemicals inside the battery react to produce the electric current, forming new substances as they go' },
      { scenario: 'A copper statue outdoors gradually turns from shiny orange-brown to a dull blue-green over many years.', correct: 'A chemical reaction, because the copper reacts with air and moisture to form a new compound called copper carbonate' }
    ];
    const entry = choice(entries);
    const correct = entry.correct;
    const wrongs = ['A physical change, because no new substance is formed', 'Neither, since nothing is actually happening', 'A nuclear reaction, since energy is released'];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `${entry.scenario} Is this a physical change or a chemical reaction? Justify your answer.`,
      type: 'mcq',
      choices,
      correct,
      explanation: `${correct}, which is a strong sign of a chemical reaction rather than a physical change.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const entries = [
      { correct: 'Mixing an acid and a base to form a new salt and water, releasing heat', hint: 'combining an acid and a base' },
      { correct: 'Striking a match, which ignites and burns down into ash and smoke', hint: 'lighting a match' },
      { correct: 'Dropping a piece of chalk (calcium carbonate) into vinegar and watching it fizz and dissolve', hint: 'chalk reacting with an acid' },
      { correct: 'Burning natural gas on a stove, producing a blue flame, heat, carbon dioxide, and water vapor', hint: 'a gas stove burner lighting' },
      { correct: 'Leaving an iron nail in water for weeks until it forms a flaky, orange coating of rust', hint: 'a nail slowly rusting' },
      { correct: 'Adding yeast to sugar water and watching it bubble as carbon dioxide gas is produced', hint: 'yeast fermenting sugar' },
      { correct: 'Mixing bleach with a colored stain until the color fades because the dye molecules are broken apart', hint: 'bleach fading a stain' },
      { correct: 'Combining two clear solutions and watching a solid, cloudy precipitate immediately form and settle', hint: 'two clear solutions forming a solid' },
      { correct: 'Lighting a firework fuse and watching it explode into colored light as metal compounds burn', hint: 'a firework exploding' },
      { correct: 'Photosynthesis in a leaf, where carbon dioxide and water are converted into sugar and oxygen using sunlight', hint: 'a plant photosynthesizing in sunlight' },
      { correct: 'Baking a cake, where heat turns the raw batter into a solid cake with a browned crust', hint: 'raw batter baking into a cake' },
      { correct: 'Digesting food, where enzymes break complex molecules in a meal down into new, simpler molecules', hint: 'the body digesting a meal' },
      { correct: 'An alkaline battery discharging, where chemicals inside react to generate electricity and new compounds', hint: 'a battery powering a flashlight' },
      { correct: 'Toasting a marshmallow over a flame until its surface turns golden-brown and caramelized', hint: 'a marshmallow toasting over a fire' },
      { correct: 'Rust forming on an old bicycle chain left out in the rain', hint: 'a bike chain rusting in the rain' },
      { correct: 'A firecracker\'s gunpowder igniting and rapidly converting into hot expanding gases', hint: 'gunpowder igniting in a firecracker' },
      { correct: 'Bread dough browning in a hot oven as sugars and proteins react to form a crisp, golden crust', hint: 'bread crust browning in the oven' },
      { correct: 'Vinegar dissolving the mineral buildup inside a kettle by reacting with it and releasing bubbles', hint: 'vinegar clearing mineral scale from a kettle' },
      { correct: 'A cut apple slowly turning brown as its surface reacts with oxygen in the air', hint: 'a sliced apple browning' },
      { correct: 'An effervescent vitamin tablet dropped in water fizzing as it reacts and releases gas', hint: 'a fizzy vitamin tablet dissolving' }
    ];
    const entry = choice(entries);
    const wrongPool = [
      'Cutting a piece of paper into smaller pieces',
      'Melting ice cubes into liquid water',
      'Dissolving sugar into iced tea',
      'Breaking a glass bottle into shards',
      'Folding a piece of aluminum foil in half',
      'Boiling water into steam on the stove',
      'Crushing an empty soda can with your foot',
      'Freezing fruit juice into ice pops'
    ];
    const wrongs = shuffle(wrongPool).slice(0, 3);
    const choices = shuffle([entry.correct, ...wrongs]);
    return {
      prompt: `Which scenario best demonstrates a chemical reaction taking place — think about ${entry.hint}?`,
      type: 'mcq',
      choices,
      correct: entry.correct,
      explanation: 'A chemical reaction produces new substances with different properties from the starting materials — unlike a physical change, which just alters form, shape, or state.'
    };
  }}
];

// ---- Acids & Bases ---------------------------------------------------------------

const PH_CORRECTION_POOL = [
  { scenario: "A swimming pool's water has become too acidic (low pH)", correct: 'Adding a base, since bases neutralize acids and raise pH toward 7', wrongs: ['Adding more acid, since like dissolves like', 'Adding pure oxygen gas', 'Freezing the solution'] },
  { scenario: 'A garden soil has become too acidic for most vegetables to grow well', correct: "Adding lime (a base), since it neutralizes excess acid and raises the soil's pH", wrongs: ['Adding vinegar, since acids help plants grow', 'Adding more fertilizer only', 'Watering the soil more often'] },
  { scenario: "An aquarium's water has become too basic (high pH) for the fish", correct: 'Adding a small amount of acid, since acids neutralize bases and lower pH toward 7', wrongs: ['Adding more base, since bases are always safe for fish', 'Adding pure salt', 'Changing the water temperature'] },
  { scenario: 'Someone has an upset stomach caused by excess stomach acid', correct: 'Taking an antacid (a base), since it neutralizes excess stomach acid and raises pH', wrongs: ['Drinking more acidic juice, since acid balances acid', 'Taking a strong acid tablet', 'Avoiding food entirely'] },
  { scenario: 'A farmer notices their lake water has become too basic (high pH) after runoff from a nearby factory', correct: 'Adding a mild acid, since acids neutralize bases and lower pH toward 7', wrongs: ['Adding more base, since bases purify water', 'Adding pure sugar', 'Draining and refilling with the same water'] },
  { scenario: 'A scientist needs to neutralize a spilled acidic chemical in the lab before cleaning it up', correct: 'Sprinkling a mild base like baking soda on the spill, since it neutralizes the acid', wrongs: ['Sprinkling more of the same acid on the spill', 'Pouring water only, since dilution changes nothing about pH', 'Covering the spill with a dry cloth and leaving it'] },
  { scenario: 'A beekeeper wants to soothe a bee sting, which is acidic', correct: 'Dabbing on a mild base like baking soda paste, since it neutralizes the acidic sting', wrongs: ['Dabbing on lemon juice, since acids soothe acids', 'Applying more venom', 'Rubbing the area with sugar'] },
  { scenario: 'A chef finds a sauce has become too basic-tasting after adding too much baking soda', correct: 'Adding a splash of an acid like lemon juice or vinegar to balance the taste toward neutral', wrongs: ['Adding more baking soda', 'Adding plain sugar', 'Adding more salt'] },
  { scenario: 'A hair stylist finds a client\'s hair damaged from a highly basic relaxer treatment', correct: 'Applying a mildly acidic conditioning rinse, since acids neutralize the leftover base', wrongs: ['Applying more relaxer, since bases repair hair', 'Rinsing only with plain oil', 'Blow-drying the hair on high heat'] },
  { scenario: 'A vineyard\'s soil has become too basic for grapevines to absorb nutrients well', correct: 'Adding sulfur or an acidic compost, since acids lower soil pH toward neutral', wrongs: ['Adding more limestone, since bases help grapevines grow', 'Watering less often', 'Adding pure sand'] },
  { scenario: 'A swimmer\'s eyes sting after swimming in a pool with an unusually high (basic) pH', correct: 'Lowering the pool\'s pH with a mild acid until it returns closer to neutral', wrongs: ['Raising the pH even further with more base', 'Adding chlorine tablets only', 'Draining the pool completely and refilling with the same water'] },
  { scenario: 'A student spills a basic cleaning solution on a lab bench and needs to neutralize it safely', correct: 'Neutralizing it with a mild acid like dilute vinegar before wiping it up', wrongs: ['Neutralizing it with a stronger base', 'Wiping it up with a dry paper towel only', 'Covering it with more of the same basic cleaner'] },
  { scenario: 'A fish tank\'s pH has drifted too low (too acidic) after adding driftwood that releases tannins', correct: 'Adding a small amount of a base like crushed coral to gently raise the pH toward neutral', wrongs: ['Adding more driftwood to lower it further', 'Adding table salt to fix the pH', 'Removing the fish\'s food supply'] },
  { scenario: 'Someone gets a chemical burn on their skin from a strong base at school', correct: 'Rinsing the area thoroughly with plenty of water, and treating with mild acid only if trained and instructed to', wrongs: ['Rubbing in a stronger base to neutralize it', 'Applying oil to seal in the base', 'Ignoring it since bases are not dangerous'] },
  { scenario: 'A brewer\'s batch of beer wort has become too acidic during fermentation', correct: 'Adding a small amount of a base like calcium carbonate to raise the pH back toward the target range', wrongs: ['Adding more acid to balance the flavor', 'Boiling the wort for a shorter time', 'Adding more yeast only'] },
  { scenario: 'A gardener\'s blueberry bushes need more acidic soil than the yard currently has', correct: 'Adding sulfur or an acidic compost, since acids lower soil pH toward the range blueberries need', wrongs: ['Adding more limestone, since bases lower soil pH', 'Watering more often with plain tap water', 'Adding pure sand only'] },
  { scenario: 'A pool technician measures the water and finds it dangerously close to pH 5, far too acidic for swimmers', correct: 'Adding a base like soda ash to raise the pH back toward the safe 7.2-7.8 range', wrongs: ['Adding more acid to correct the imbalance', 'Adding chlorine tablets only, since chlorine fixes pH', 'Draining and refilling with the same untreated water'] },
  { scenario: 'A winemaker\'s batch of wine tastes unpleasantly acidic after fermentation', correct: 'Adding a small amount of a base like potassium bicarbonate to raise the pH toward the target range', wrongs: ['Adding more acid to balance the flavor', 'Adding more sugar only', 'Straining the wine through a cloth'] },
  { scenario: 'A dentist explains that plaque bacteria have made the pH in a patient\'s mouth too acidic, weakening the enamel', correct: 'Using a mildly basic toothpaste or rinse to neutralize the acid and protect the enamel', wrongs: ['Rinsing with more acidic soda to clean it out', 'Avoiding brushing altogether', 'Applying more sugar to the teeth'] },
  { scenario: 'A pond keeper finds the pond water has drifted too acidic after heavy rainfall', correct: 'Adding a small amount of crushed limestone (a base) to gradually raise the pH toward neutral', wrongs: ['Adding more rainwater to dilute it further', 'Adding vinegar to balance the water', 'Removing all the fish food'] },
  { scenario: 'A metalworker needs to neutralize an acidic pickling bath used to clean rust off steel before disposal', correct: 'Slowly adding a base like sodium carbonate until the bath reaches a safe, near-neutral pH', wrongs: ['Adding more acid to finish dissolving the rust', 'Pouring the acidic bath straight down the drain', 'Letting it evaporate without any treatment'] },
  { scenario: 'A soap maker\'s batch of soap turns out too basic and irritates skin during testing', correct: 'Adding a mild acid, like citric acid, to bring the pH down closer to skin-friendly levels', wrongs: ['Adding more lye (a strong base) to finish the reaction', 'Adding more oil only, since oil has no effect on pH', 'Leaving the soap to cure without changes'] },
  { scenario: 'A biologist finds that a lake\'s pH has dropped due to acid rain, harming fish populations', correct: 'Adding crushed limestone (a base) to the lake to help neutralize the excess acidity', wrongs: ['Adding more acidic rainwater collected from nearby', 'Adding table sugar to feed the fish', 'Draining the lake permanently'] },
  { scenario: 'A cheese maker notices a batch of cheese curds has become too acidic during culturing', correct: 'Adding a small amount of a mild base, like calcium carbonate, to raise the pH back toward the target range', wrongs: ['Adding more starter culture to increase acidity further', 'Adding more salt only, since salt has no effect on pH', 'Leaving the curds untouched'] },
  { scenario: 'A pottery glaze chemist finds a glaze mixture has become too basic and is reacting poorly with the clay', correct: 'Adding a mild acid to the mixture to bring the pH back down closer to neutral', wrongs: ['Adding more base to strengthen the glaze', 'Adding more water only, since dilution changes nothing about pH', 'Firing the glaze at a higher temperature to fix it'] },
  { scenario: 'A pharmacist needs to neutralize a spilled basic medication solution in the pharmacy before disposal', correct: 'Carefully adding a mild acid to the spill to bring it to a safe, near-neutral pH before cleanup', wrongs: ['Adding more of the same basic solution', 'Sweeping it up dry with no other treatment', 'Covering it with a plastic sheet and leaving it'] },
  { scenario: 'A hydroponic farmer finds the nutrient solution feeding their plants has drifted too acidic', correct: 'Adding a small, measured amount of a base like potassium hydroxide to raise the pH back to the target range', wrongs: ['Adding more acidic nutrient concentrate', 'Adding plain sugar to the reservoir', 'Turning off the grow lights'] },
  { scenario: 'A leather tanner finds a tanning solution has become too basic partway through the process', correct: 'Adding a mild acid to bring the solution\'s pH back down to the range needed for tanning', wrongs: ['Adding more base to speed up the tanning', 'Adding more water only, since dilution changes nothing about pH', 'Leaving the hides to soak longer without changes'] },
  { scenario: 'A chemistry student needs to neutralize leftover strong acid in a flask before pouring it down a lab sink, per safety rules', correct: 'Slowly adding a base like dilute sodium bicarbonate until the solution reaches a safe, near-neutral pH', wrongs: ['Pouring the strong acid directly down the drain undiluted', 'Adding more acid to use it all up faster', 'Leaving the flask open so the acid evaporates'] },
  { scenario: 'A greenhouse manager finds their irrigation water has become too basic for acid-loving orchids', correct: 'Adding a mild acid, like diluted phosphoric acid, to bring the irrigation water\'s pH down toward the range orchids need', wrongs: ['Adding more base to the irrigation tank', 'Adding more fertilizer only, since fertilizer has no effect on pH', 'Watering the orchids less often'] },
  { scenario: 'A candy maker finds a batch of caramel has turned out too basic after adding too much baking soda', correct: 'Adding a splash of an acid like lemon juice or cream of tartar to balance the caramel toward neutral', wrongs: ['Adding more baking soda to finish the reaction', 'Adding more sugar only, since sugar has no effect on pH', 'Cooking the caramel at a lower temperature'] },
  { scenario: 'A researcher\'s cell culture medium has drifted too acidic overnight, stressing the cells', correct: 'Adding a small, carefully measured amount of a base to bring the medium\'s pH back to the target range', wrongs: ['Adding more acidic waste to the culture', 'Adding plain water only, since dilution changes nothing about pH', 'Leaving the culture incubating without changes'] },
  { scenario: 'A car detailer\'s wheel cleaner, a strong acid, splashes onto a concrete driveway and begins etching it', correct: 'Immediately neutralizing the spill with a base like baking soda before rinsing it away', wrongs: ['Spraying on more acid to finish dissolving the residue', 'Letting it sit in the sun to dry out', 'Covering it with a tarp and leaving it'] },
  { scenario: 'A composter finds a batch of compost has become too acidic for the worms to survive well', correct: 'Mixing in a small amount of a base like crushed eggshells or lime to raise the compost\'s pH', wrongs: ['Mixing in more acidic food scraps', 'Adding more water only, since dilution changes nothing about pH', 'Covering the compost pile completely to stop airflow'] },
  { scenario: 'A jewelry cleaner solution, which is strongly basic, needs to be neutralized before it goes down the studio drain', correct: 'Slowly adding a mild acid until the solution reaches a safe, near-neutral pH', wrongs: ['Adding more of the same basic cleaner', 'Pouring it straight down the drain undiluted', 'Letting it evaporate on the counter overnight'] }
];

const PH_DESCRIBE_POOL = [
  { substance: 'lemon juice (pH 2)', correct: 'Acidic, since pH 2 is well below 7' },
  { substance: 'baking soda solution (pH 9)', correct: 'Basic, since pH 9 is above 7' },
  { substance: 'pure water (pH 7)', correct: 'Neutral, since pH 7 is exactly in the middle of the scale' },
  { substance: 'soap (pH 10)', correct: 'Basic, since pH 10 is above 7' },
  { substance: 'battery acid (pH 1)', correct: 'Acidic, since pH 1 is well below 7' },
  { substance: 'milk (pH 6.5)', correct: 'Acidic, since pH 6.5 is just below 7' },
  { substance: 'ammonia cleaner (pH 11)', correct: 'Basic, since pH 11 is above 7' },
  { substance: 'black coffee (pH 5)', correct: 'Acidic, since pH 5 is below 7' },
  { substance: 'bleach (pH 13)', correct: 'Basic, since pH 13 is above 7' },
  { substance: 'orange juice (pH 3.5)', correct: 'Acidic, since pH 3.5 is well below 7' },
  { substance: 'tomato juice (pH 4)', correct: 'Acidic, since pH 4 is below 7' },
  { substance: 'sea water (pH 8)', correct: 'Basic, since pH 8 is above 7' },
  { substance: 'human blood (pH 7.4)', correct: 'Basic, since pH 7.4 is just above 7' },
  { substance: 'vinegar (pH 2.5)', correct: 'Acidic, since pH 2.5 is well below 7' },
  { substance: 'toothpaste (pH 9)', correct: 'Basic, since pH 9 is above 7' },
  { substance: 'distilled water (pH 7)', correct: 'Neutral, since pH 7 is exactly in the middle of the scale' },
  { substance: 'stomach acid (pH 1.5)', correct: 'Acidic, since pH 1.5 is well below 7' },
  { substance: 'drain cleaner (pH 14)', correct: 'Basic, since pH 14 is far above 7' },
  { substance: 'milk of magnesia (pH 10.5)', correct: 'Basic, since pH 10.5 is above 7' },
  { substance: 'carbonated soda (pH 3)', correct: 'Acidic, since pH 3 is well below 7' },
  { substance: 'egg white (pH 8)', correct: 'Basic, since pH 8 is above 7' },
  { substance: 'grapefruit juice (pH 3)', correct: 'Acidic, since pH 3 is well below 7' },
  { substance: 'apple juice (pH 3.8)', correct: 'Acidic, since pH 3.8 is below 7' },
  { substance: 'beer (pH 4.5)', correct: 'Acidic, since pH 4.5 is below 7' },
  { substance: 'cow\'s milk (pH 6.7)', correct: 'Acidic, since pH 6.7 is just below 7' },
  { substance: 'human saliva (pH 6.8)', correct: 'Acidic, since pH 6.8 is just below 7' },
  { substance: 'shampoo (pH 5.5)', correct: 'Acidic, since pH 5.5 is below 7' },
  { substance: 'wine (pH 3.5)', correct: 'Acidic, since pH 3.5 is well below 7' },
  { substance: 'sparkling mineral water (pH 5.5)', correct: 'Acidic, since pH 5.5 is below 7' },
  { substance: 'cheese (pH 5.2)', correct: 'Acidic, since pH 5.2 is below 7' },
  { substance: 'yogurt (pH 4.4)', correct: 'Acidic, since pH 4.4 is below 7' },
  { substance: 'toilet bowl cleaner (pH 2)', correct: 'Acidic, since pH 2 is well below 7' },
  { substance: 'sea water (pH 8.1)', correct: 'Basic, since pH 8.1 is above 7' },
  { substance: 'human blood (pH 7.4)', correct: 'Basic, since pH 7.4 is just above 7' },
  { substance: 'oven cleaner (pH 13.5)', correct: 'Basic, since pH 13.5 is far above 7' },
  { substance: 'lye solution (pH 14)', correct: 'Basic, since pH 14 is far above 7' },
  { substance: 'liquid antacid (pH 10)', correct: 'Basic, since pH 10 is above 7' },
  { substance: 'laundry detergent (pH 10.5)', correct: 'Basic, since pH 10.5 is above 7' },
  { substance: 'household glass cleaner (pH 11.5)', correct: 'Basic, since pH 11.5 is above 7' },
  { substance: 'baking soda paste (pH 9.5)', correct: 'Basic, since pH 9.5 is above 7' },
  { substance: 'hand soap (pH 9.5)', correct: 'Basic, since pH 9.5 is above 7' }
];

const acidsTemplates = [
  { bloom: 'Remember', gen: () => {
    const facts = [
      { q: 'What pH value represents a perfectly neutral substance?', correct: '7', wrongs: ['0', '14', '10'] },
      { q: 'What do we call a substance that turns litmus paper red and tastes sour?', correct: 'Acid', wrongs: ['Base', 'Salt', 'Solvent'] },
      { q: 'What do we call a substance that turns litmus paper blue and feels slippery?', correct: 'Base', wrongs: ['Acid', 'Salt', 'Neutral'] },
      { q: 'What do we call a substance used to test whether something is acidic or basic, often by changing color?', correct: 'Indicator', wrongs: ['Solvent', 'Catalyst', 'Isotope'] },
      { q: 'What is the pH range for a strong acid?', correct: '0 to 3', wrongs: ['7 to 10', '11 to 14', 'Exactly 7'] },
      { q: 'What is the pH range for a strong base?', correct: '11 to 14', wrongs: ['0 to 3', '4 to 6', 'Exactly 7'] },
      { q: 'What do we call the reaction between an acid and a base that produces a salt and water?', correct: 'Neutralization', wrongs: ['Sublimation', 'Precipitation', 'Oxidation'] },
      { q: 'On the pH scale, does a LOWER number mean a stronger acid or a weaker acid?', correct: 'A stronger acid', wrongs: ['A weaker acid', 'A stronger base', 'It has no effect on acid strength'] },
      { q: 'On the pH scale, does a HIGHER number (above 7) mean a stronger base or a weaker base?', correct: 'A stronger base', wrongs: ['A weaker base', 'A stronger acid', 'It has no effect on base strength'] },
      { q: 'What do we call a base that dissolves in water to form a solution, like sodium hydroxide?', correct: 'Alkali', wrongs: ['Acid salt', 'Indicator', 'Precipitate'] },
      { q: 'What ion do acids release when dissolved in water?', correct: 'Hydrogen ions (H⁺)', wrongs: ['Hydroxide ions (OH⁻)', 'Oxygen ions (O²⁻)', 'Chloride ions (Cl⁻)'] },
      { q: 'What ion do bases release when dissolved in water?', correct: 'Hydroxide ions (OH⁻)', wrongs: ['Hydrogen ions (H⁺)', 'Sodium ions (Na⁺)', 'Carbonate ions (CO₃²⁻)'] },
      { q: 'What color does blue litmus paper turn when dipped in an acid?', correct: 'Red', wrongs: ['Blue (no change)', 'Green', 'Yellow'] },
      { q: 'What color does red litmus paper turn when dipped in a base?', correct: 'Blue', wrongs: ['Red (no change)', 'Green', 'Purple'] },
      { q: 'What compound is produced, along with water, when an acid reacts with a base?', correct: 'A salt', wrongs: ['A precipitate only', 'A gas only', 'A new acid'] },
      { q: 'What do we call an acid, like vinegar, that only partially breaks apart into ions in water?', correct: 'Weak acid', wrongs: ['Strong acid', 'Weak base', 'Neutral solution'] },
      { q: 'What do we call an acid, like hydrochloric acid, that completely breaks apart into ions in water?', correct: 'Strong acid', wrongs: ['Weak acid', 'Strong base', 'Neutral solution'] },
      { q: 'What common household substance is a well-known example of a strong base?', correct: 'Drain cleaner (sodium hydroxide)', wrongs: ['Lemon juice', 'Vinegar', 'Black coffee'] },
      { q: 'What scale is used to measure how acidic or basic a solution is, ranging from 0 to 14?', correct: 'pH scale', wrongs: ['Richter scale', 'Kelvin scale', 'Mohs scale'] },
      { q: 'What do we call an acid made of only hydrogen and one other nonmetal element, like HCl?', correct: 'Binary acid', wrongs: ['Oxyacid', 'Weak base', 'Alkali'] },
      { q: 'What do we call an acid that contains hydrogen, oxygen, and another element, like sulfuric acid?', correct: 'Oxyacid', wrongs: ['Binary acid', 'Weak base', 'Alkali'] },
      { q: 'What do we call a base, like ammonia, that only partially breaks apart into ions in water?', correct: 'Weak base', wrongs: ['Strong base', 'Weak acid', 'Neutral solution'] },
      { q: 'What do we call a base, like sodium hydroxide, that completely breaks apart into ions in water?', correct: 'Strong base', wrongs: ['Weak base', 'Strong acid', 'Neutral solution'] },
      { q: 'What word describes water\'s ability to act as either an acid or a base depending on what it reacts with?', correct: 'Amphoteric', wrongs: ['Neutral only', 'Acidic only', 'Basic only'] },
      { q: 'What do we call the process of gradually adding a solution of known concentration to determine the concentration of an acid or base?', correct: 'Titration', wrongs: ['Filtration', 'Distillation', 'Evaporation'] },
      { q: 'What indicator turns pink in a basic solution and stays clear in an acidic or neutral solution?', correct: 'Phenolphthalein', wrongs: ['Litmus paper', 'pH paper only', 'Bromine water'] },
      { q: 'What do we call the point in a titration where the acid and base have completely neutralized each other?', correct: 'Equivalence point', wrongs: ['Boiling point', 'Freezing point', 'Saturation point'] },
      { q: 'What gas is commonly released when an acid reacts with a metal such as zinc or magnesium?', correct: 'Hydrogen gas', wrongs: ['Oxygen gas', 'Carbon dioxide gas', 'Nitrogen gas'] },
      { q: 'What gas is commonly released when an acid reacts with a carbonate, such as calcium carbonate?', correct: 'Carbon dioxide gas', wrongs: ['Hydrogen gas', 'Oxygen gas', 'Chlorine gas'] },
      { q: 'What do we call the concentration of hydrogen ions in a solution, which the pH scale is based on?', correct: 'Hydrogen ion concentration', wrongs: ['Hydroxide ion concentration', 'Electron concentration', 'Neutron concentration'] },
      { q: 'What common acid is found naturally in citrus fruits like lemons and oranges?', correct: 'Citric acid', wrongs: ['Acetic acid', 'Hydrochloric acid', 'Sulfuric acid'] },
      { q: 'What common acid is the main component of vinegar?', correct: 'Acetic acid', wrongs: ['Citric acid', 'Sulfuric acid', 'Nitric acid'] },
      { q: 'What common acid is naturally produced in the stomach to help digest food?', correct: 'Hydrochloric acid', wrongs: ['Citric acid', 'Acetic acid', 'Carbonic acid'] },
      { q: 'What is a base commonly known as when dissolved in water and used to relieve indigestion?', correct: 'Antacid', wrongs: ['Acidifier', 'Catalyst', 'Solvent'] },
      { q: 'What do we call a solution that resists changes in pH when small amounts of acid or base are added?', correct: 'Buffer solution', wrongs: ['Saturated solution', 'Dilute solution', 'Concentrated solution'] },
      { q: 'What property do acids commonly have that gives foods like lemons and vinegar their characteristic sour taste?', correct: 'A sour taste', wrongs: ['A bitter taste', 'A sweet taste', 'No taste at all'] },
      { q: 'What property do bases commonly have that gives them a soapy, slick feeling?', correct: 'A slippery feel', wrongs: ['A gritty feel', 'A sticky feel', 'No noticeable feel'] },
      { q: 'What happens to the pH of a solution as you add more and more acid to it?', correct: 'The pH decreases', wrongs: ['The pH increases', 'The pH stays exactly the same', 'The pH becomes undefined'] },
      { q: 'What happens to the pH of a solution as you add more and more base to it?', correct: 'The pH increases', wrongs: ['The pH decreases', 'The pH stays exactly the same', 'The pH becomes undefined'] },
      { q: 'On a 0-14 pH scale, which single number separates acidic solutions from basic solutions?', correct: '7', wrongs: ['0', '14', '3.5'] }
    ];
    const f = choice(facts);
    const choices = shuffle([f.correct, ...f.wrongs]);
    return { prompt: f.q, type: 'mcq', choices, correct: f.correct, explanation: `${f.correct} is the correct answer.` };
  }},
  { bloom: 'Understand', gen: () => {
    const value = randInt(0, 56) / 4;
    const diagram = phScaleSVG(value);
    const category = value < 7 ? 'Acidic' : value > 7 ? 'Basic (alkaline)' : 'Neutral';
    const wrongs = ['Acidic', 'Basic (alkaline)', 'Neutral', 'Cannot be determined from pH alone'].filter(c => c !== category);
    const choices = shuffle([category, ...wrongs]);
    return {
      prompt: `The pH scale below shows a substance with pH = ${value}. Is this substance acidic, basic, or neutral?`,
      type: 'mcq',
      choices,
      correct: category,
      diagram,
      explanation: `pH values below 7 are acidic, above 7 are basic, and exactly 7 is neutral. pH ${value} is ${category.toLowerCase()}.`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const substances = [
      ['Lemon juice', 2], ['Battery acid', 1], ['Vinegar', 3], ['Black coffee', 5],
      ['Pure water', 7], ['Baking soda', 9], ['Soap', 10], ['Ammonia', 11], ['Bleach', 13],
      ['Milk', 6], ['Tomato juice', 4], ['Antacid tablet', 10], ['Orange juice', 3],
      ['Sea water', 8], ['Human blood', 7], ['Toothpaste', 9], ['Drain cleaner', 14],
      ['Carbonated soda', 3], ['Egg white', 8], ['Grapefruit juice', 3], ['Rainwater', 6],
      ['Wine', 4], ['Beer', 5], ['Cucumber', 6], ['Apple juice', 4], ['Yogurt', 4],
      ['Cheese', 5], ['Cow\'s milk', 7], ['Chicken', 6], ['Corn', 6], ['Bread', 5],
      ['Bananas', 5], ['Bottled water', 7], ['Sea salt solution', 8], ['Toilet bowl cleaner', 2],
      ['Oven cleaner', 13], ['Lye solution', 14], ['Milk of magnesia', 10], ['Detergent', 10],
      ['Shampoo', 6], ['Distilled vinegar', 3], ['Ocean water', 8]
    ];
    const [name, ph] = choice(substances);
    return {
      prompt: `${name} has a pH of ${ph}. How many pH units away from neutral (pH 7) is it?`,
      type: 'numeric',
      answer: Math.abs(ph - 7),
      explanation: `Distance from neutral = |${ph} - 7| = ${Math.abs(ph - 7)}.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const pairs = [
      [3, 2], [4, 3], [5, 4], [6, 5], [3, 1], [4, 2], [5, 3], [6, 4],
      [2, 1], [5, 1], [6, 2], [6, 1], [4, 1], [5, 2], [3.5, 2], [4.5, 3],
      [5.5, 4], [6.5, 5], [2.5, 1], [5.5, 2],
      [3, 0.5], [4, 0.5], [4, 1.5], [5, 0.5], [5, 1.5], [6, 0.5], [6, 1.5], [6, 2.5],
      [6, 3.5], [3.5, 1], [3.5, 1.5], [4.5, 1], [4.5, 1.5], [4.5, 2], [5.5, 1],
      [5.5, 3], [6.5, 1], [6.5, 2], [6.5, 3], [6.5, 4]
    ];
    const [phA, phB] = choice(pairs);
    const correct = `Solution B (pH ${phB}) is actually MORE acidic than Solution A (pH ${phA}), since lower pH means stronger acid`;
    const wrongs = [`Solution A (pH ${phA}) is more acidic since it has the higher number`, 'Both solutions are equally acidic since both are below 7', 'Neither solution is acidic since both are below 7'];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `A student says Solution A (pH ${phA}) is more acidic than Solution B (pH ${phB}) because ${phA} is a bigger number. Evaluate this claim.`,
      type: 'mcq',
      choices,
      correct,
      explanation: `On the pH scale, LOWER numbers mean stronger acids. Since ${phB} < ${phA}, Solution B is actually more acidic.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const entry = choice(PH_CORRECTION_POOL);
    const choices = shuffle([entry.correct, ...entry.wrongs]);
    return {
      prompt: `${entry.scenario}. What should be added to fix this, and why?`,
      type: 'mcq',
      choices,
      correct: entry.correct,
      explanation: entry.correct
    };
  }},
  { bloom: 'Create', gen: () => {
    const entry = choice(PH_DESCRIBE_POOL);
    const choices = shuffle(['Acidic', 'Basic', 'Neutral', 'Cannot be determined from pH alone']);
    const correctCategory = entry.correct.split(',')[0];
    return {
      prompt: `Based on its pH, how would you classify ${entry.substance}?`,
      type: 'mcq',
      choices,
      correct: correctCategory,
      explanation: entry.correct
    };
  }}
];

// ---- Periodic Table -----------------------------------------------------------

const PERIODIC_MISCONCEPTIONS = [
  { claim: 'elements in the same PERIOD (row) always have similar chemical properties', correct: 'Incorrect — elements in the same GROUP (column) share similar properties, not elements in the same period', wrong: 'Correct — all elements in a row behave identically' },
  { claim: 'metals are always more reactive than nonmetals', correct: 'Incorrect — reactivity depends on the specific group; some nonmetals (like fluorine) are extremely reactive', wrong: 'Correct — metals are always the most reactive elements' },
  { claim: 'the periodic table is arranged alphabetically by element name', correct: 'Incorrect — elements are arranged by increasing atomic number, not alphabetically', wrong: 'Correct — elements are listed in alphabetical order' },
  { claim: 'noble gases are highly reactive because they are in the last group', correct: 'Incorrect — noble gases are actually the LEAST reactive elements because they have full outer electron shells', wrong: 'Correct — noble gases react violently with other elements' },
  { claim: 'all elements in Group 1 are nonmetals', correct: 'Incorrect — Group 1 elements (except hydrogen) are alkali metals, not nonmetals', wrong: 'Correct — Group 1 is entirely made of nonmetals' },
  { claim: 'an element\'s mass number determines its identity, not its atomic number', correct: 'Incorrect — an element\'s IDENTITY is determined by its atomic number (proton count), not its mass number', wrong: 'Correct — mass number alone identifies an element' },
  { claim: 'all elements on the left side of the periodic table are gases at room temperature', correct: 'Incorrect — most elements on the left side are solid metals at room temperature, not gases', wrong: 'Correct — the left side is entirely made of gases' },
  { claim: 'elements get smaller in atomic size as you move DOWN a group', correct: 'Incorrect — atomic size generally INCREASES moving down a group, as more electron shells are added', wrong: 'Correct — atoms always shrink moving down a group' },
  { claim: 'isotopes of an element have different numbers of protons', correct: 'Incorrect — isotopes have the same number of protons but different numbers of neutrons', wrong: 'Correct — isotopes always have different proton counts' },
  { claim: 'metalloids conduct electricity exactly as well as metals do', correct: 'Incorrect — metalloids are semiconductors, conducting electricity better than nonmetals but worse than true metals', wrong: 'Correct — metalloids conduct electricity identically to metals' },
  { claim: 'the number of valence electrons has nothing to do with how an element bonds', correct: 'Incorrect — valence electrons largely determine how an element bonds with other atoms', wrong: 'Correct — valence electrons are unrelated to bonding behavior' },
  { claim: 'elements in Group 18 readily form compounds with Group 1 elements', correct: 'Incorrect — noble gases (Group 18) rarely form compounds with anything because their outer shells are already full', wrong: 'Correct — noble gases eagerly bond with alkali metals' },
  { claim: 'atomic size generally increases as you move LEFT to RIGHT across a period', correct: 'Incorrect — atomic size generally DECREASES moving left to right across a period, as nuclear charge increases', wrong: 'Correct — atoms always grow larger moving across a period' },
  { claim: 'hydrogen belongs to the halogen family because it is placed at the very top of the periodic table', correct: 'Incorrect — hydrogen is a unique element that does not fit neatly into any family, even though it is placed above Group 1', wrong: 'Correct — hydrogen is officially classified as a halogen' },
  { claim: 'transition metals (the middle block of the table) cannot form colorful compounds', correct: 'Incorrect — transition metals are well known for forming many brightly colored compounds', wrong: 'Correct — transition metal compounds are always colorless' },
  { claim: 'an element with a full outer electron shell is usually highly reactive', correct: 'Incorrect — a full outer shell makes an element very STABLE and unreactive, like the noble gases', wrong: 'Correct — a full outer shell always makes an element unstable and reactive' },
  { claim: 'all nonmetals are gases at room temperature', correct: 'Incorrect — nonmetals can be gases, liquids (like bromine), or solids (like carbon and sulfur) at room temperature', wrong: 'Correct — every nonmetal is a gas at room temperature' },
  { claim: 'elements lower in a group are always less reactive than elements higher in the same group', correct: 'Incorrect — reactivity trends differ by family; for alkali metals reactivity increases going down the group, while for halogens it decreases', wrong: 'Correct — reactivity always decreases moving down any group' },
  { claim: 'the periodic table was arranged the same way from the very first version, with no changes over time', correct: 'Incorrect — the modern table (ordered by atomic number) replaced earlier versions that were ordered by atomic mass', wrong: 'Correct — the periodic table has never changed since it was first created' },
  { claim: 'an atom\'s electron configuration has no effect on which group it belongs to', correct: 'Incorrect — an atom\'s valence electron configuration directly determines which group (column) it belongs to', wrong: 'Correct — group placement is unrelated to electron configuration' },
  { claim: 'the number of protons in an atom can change during a normal chemical reaction', correct: 'Incorrect — the number of protons defines the element and does not change during ordinary chemical reactions, only during nuclear reactions', wrong: 'Correct — protons are freely gained or lost during chemical reactions' },
  { claim: 'all elements in the same group have the same number of electron shells', correct: 'Incorrect — elements in the same group share the same number of valence electrons, not the same number of shells, which increases moving down the group', wrong: 'Correct — every element in a group has an identical number of shells' },
  { claim: 'the periodic table has no elements that were artificially created by scientists', correct: 'Incorrect — several elements, like technetium and the transuranium elements, were first created artificially in laboratories', wrong: 'Correct — every element on the table occurs naturally' },
  { claim: 'atomic mass and atomic number always refer to the same value for an element', correct: 'Incorrect — atomic number is the number of protons, while atomic mass is the weighted average mass of an element\'s isotopes; they are usually different numbers', wrong: 'Correct — atomic mass and atomic number are always identical' },
  { claim: 'the halogens (Group 17) are metals because they are so reactive', correct: 'Incorrect — halogens are reactive nonmetals; being highly reactive does not by itself make an element a metal', wrong: 'Correct — high reactivity always means an element is a metal' },
  { claim: 'elements within the same period all have the same number of valence electrons', correct: 'Incorrect — elements in the same PERIOD share the same number of electron shells, while elements in the same GROUP share the same number of valence electrons', wrong: 'Correct — every element in a row shares the same number of valence electrons' },
  { claim: 'the size of an atom has no relationship to its position on the periodic table', correct: 'Incorrect — atomic size follows clear trends, generally increasing moving down a group and decreasing moving across a period', wrong: 'Correct — atomic size is completely random across the table' },
  { claim: 'ionization energy always decreases as you move left to right across a period', correct: 'Incorrect — ionization energy generally INCREASES moving left to right across a period, as nuclear charge increases', wrong: 'Correct — ionization energy always decreases moving across a period' },
  { claim: 'once an atom loses an electron, it must become a different element entirely', correct: 'Incorrect — losing or gaining electrons changes an atom\'s charge (forming an ion) but not its identity, which depends only on its number of protons', wrong: 'Correct — losing any electron changes an atom into a different element' },
  { claim: 'the alkaline earth metals (Group 2) are just as reactive as the alkali metals (Group 1)', correct: 'Incorrect — alkaline earth metals are reactive, but generally less reactive than the alkali metals in the same period', wrong: 'Correct — Group 1 and Group 2 metals are always equally reactive' },
  { claim: 'elements classified as metalloids are scattered randomly across the periodic table', correct: 'Incorrect — metalloids form a distinct staircase-shaped band along the boundary between metals and nonmetals', wrong: 'Correct — metalloids have no consistent location on the table' },
  { claim: 'the periodic table only organizes elements by their physical appearance, like color', correct: 'Incorrect — the periodic table is organized by atomic number and recurring chemical and physical properties, not by appearance alone', wrong: 'Correct — color is the main organizing principle of the periodic table' },
  { claim: 'noble gases were among the very first elements ever discovered because they are so common', correct: 'Incorrect — noble gases were among the LAST groups discovered because their lack of reactivity made them very hard to detect', wrong: 'Correct — noble gases were the very first elements ever discovered' },
  { claim: 'an element\'s row (period) number on the periodic table tells you its number of valence electrons', correct: 'Incorrect — an element\'s GROUP number (for main-group elements) relates to its valence electrons, not its row (period) number', wrong: 'Correct — the row number always equals the number of valence electrons' },
  { claim: 'all elements in Group 17 (the halogens) exist as solids at room temperature', correct: 'Incorrect — halogens exist in all three states at room temperature: fluorine and chlorine are gases, bromine is a liquid, and iodine is a solid', wrong: 'Correct — every halogen is a solid at room temperature' }
];

const SIMILAR_GROUP_POOL = [
  { anchor: 'Fluorine', correct: 'Chlorine', wrongs: ['Sodium', 'Carbon', 'Helium'], groupNote: 'Both are halogens (Group 17)' },
  { anchor: 'Sodium', correct: 'Potassium', wrongs: ['Chlorine', 'Oxygen', 'Neon'], groupNote: 'Both are alkali metals (Group 1)' },
  { anchor: 'Helium', correct: 'Neon', wrongs: ['Hydrogen', 'Nitrogen', 'Sodium'], groupNote: 'Both are noble gases (Group 18)' },
  { anchor: 'Oxygen', correct: 'Sulfur', wrongs: ['Fluorine', 'Potassium', 'Argon'], groupNote: 'Both are in Group 16 (the oxygen family)' },
  { anchor: 'Magnesium', correct: 'Calcium', wrongs: ['Aluminum', 'Chlorine', 'Neon'], groupNote: 'Both are alkaline earth metals (Group 2)' },
  { anchor: 'Chlorine', correct: 'Bromine', wrongs: ['Sodium', 'Carbon', 'Helium'], groupNote: 'Both are halogens (Group 17)' },
  { anchor: 'Lithium', correct: 'Sodium', wrongs: ['Fluorine', 'Neon', 'Magnesium'], groupNote: 'Both are alkali metals (Group 1)' },
  { anchor: 'Potassium', correct: 'Lithium', wrongs: ['Bromine', 'Argon', 'Carbon'], groupNote: 'Both are alkali metals (Group 1)' },
  { anchor: 'Neon', correct: 'Argon', wrongs: ['Oxygen', 'Magnesium', 'Chlorine'], groupNote: 'Both are noble gases (Group 18)' },
  { anchor: 'Calcium', correct: 'Magnesium', wrongs: ['Potassium', 'Fluorine', 'Helium'], groupNote: 'Both are alkaline earth metals (Group 2)' },
  { anchor: 'Bromine', correct: 'Iodine', wrongs: ['Calcium', 'Neon', 'Boron'], groupNote: 'Both are halogens (Group 17)' },
  { anchor: 'Iodine', correct: 'Fluorine', wrongs: ['Magnesium', 'Argon', 'Silicon'], groupNote: 'Both are halogens (Group 17)' },
  { anchor: 'Sulfur', correct: 'Oxygen', wrongs: ['Chlorine', 'Sodium', 'Krypton'], groupNote: 'Both are in Group 16 (the oxygen family)' },
  { anchor: 'Beryllium', correct: 'Magnesium', wrongs: ['Boron', 'Fluorine', 'Neon'], groupNote: 'Both are alkaline earth metals (Group 2)' },
  { anchor: 'Argon', correct: 'Krypton', wrongs: ['Bromine', 'Calcium', 'Phosphorus'], groupNote: 'Both are noble gases (Group 18)' },
  { anchor: 'Krypton', correct: 'Helium', wrongs: ['Rubidium', 'Selenium', 'Iodine'], groupNote: 'Both are noble gases (Group 18)' },
  { anchor: 'Rubidium', correct: 'Potassium', wrongs: ['Strontium', 'Bromine', 'Krypton'], groupNote: 'Both are alkali metals (Group 1)' },
  { anchor: 'Strontium', correct: 'Calcium', wrongs: ['Rubidium', 'Iodine', 'Xenon'], groupNote: 'Both are alkaline earth metals (Group 2)' },
  { anchor: 'Nitrogen', correct: 'Phosphorus', wrongs: ['Oxygen', 'Carbon', 'Neon'], groupNote: 'Both are in Group 15 (the nitrogen family)' },
  { anchor: 'Carbon', correct: 'Silicon', wrongs: ['Nitrogen', 'Boron', 'Aluminum'], groupNote: 'Both are in Group 14 (the carbon family)' },
  { anchor: 'Xenon', correct: 'Krypton', wrongs: ['Iodine', 'Cesium', 'Calcium'], groupNote: 'Both are noble gases (Group 18)' },
  { anchor: 'Phosphorus', correct: 'Arsenic', wrongs: ['Sulfur', 'Silicon', 'Neon'], groupNote: 'Both are in Group 15 (the nitrogen family)' },
  { anchor: 'Silicon', correct: 'Germanium', wrongs: ['Aluminum', 'Phosphorus', 'Argon'], groupNote: 'Both are in Group 14 (the carbon family)' },
  { anchor: 'Boron', correct: 'Aluminum', wrongs: ['Carbon', 'Nitrogen', 'Neon'], groupNote: 'Both are in Group 13 (the boron family)' },
  { anchor: 'Aluminum', correct: 'Gallium', wrongs: ['Silicon', 'Magnesium', 'Argon'], groupNote: 'Both are in Group 13 (the boron family)' },
  { anchor: 'Gallium', correct: 'Boron', wrongs: ['Germanium', 'Zinc', 'Krypton'], groupNote: 'Both are in Group 13 (the boron family)' },
  { anchor: 'Cesium', correct: 'Rubidium', wrongs: ['Barium', 'Iodine', 'Xenon'], groupNote: 'Both are alkali metals (Group 1)' },
  { anchor: 'Barium', correct: 'Strontium', wrongs: ['Cesium', 'Iodine', 'Xenon'], groupNote: 'Both are alkaline earth metals (Group 2)' },
  { anchor: 'Selenium', correct: 'Sulfur', wrongs: ['Bromine', 'Arsenic', 'Krypton'], groupNote: 'Both are in Group 16 (the oxygen family)' },
  { anchor: 'Tellurium', correct: 'Selenium', wrongs: ['Iodine', 'Antimony', 'Xenon'], groupNote: 'Both are in Group 16 (the oxygen family)' },
  { anchor: 'Germanium', correct: 'Silicon', wrongs: ['Gallium', 'Arsenic', 'Krypton'], groupNote: 'Both are in Group 14 (the carbon family)' },
  { anchor: 'Arsenic', correct: 'Phosphorus', wrongs: ['Selenium', 'Germanium', 'Bromine'], groupNote: 'Both are in Group 15 (the nitrogen family)' },
  { anchor: 'Radium', correct: 'Barium', wrongs: ['Francium', 'Radon', 'Actinium'], groupNote: 'Both are alkaline earth metals (Group 2)' },
  { anchor: 'Francium', correct: 'Cesium', wrongs: ['Radium', 'Radon', 'Actinium'], groupNote: 'Both are alkali metals (Group 1)' },
  { anchor: 'Astatine', correct: 'Iodine', wrongs: ['Radon', 'Polonium', 'Francium'], groupNote: 'Both are halogens (Group 17)' }
];

const REACTIVITY_POOL = [
  { element: 'Sodium (Group 1)', correct: 'Highly reactive — it has just one electron in its outer shell, which it readily loses', wrongs: ['Completely unreactive — it never forms compounds', 'Reactive only when frozen', 'Reactive only with other metals'] },
  { element: 'Neon (Group 18)', correct: 'Very unreactive — it already has a full outer electron shell', wrongs: ['Extremely reactive — it explodes on contact with air', 'Reactive only with water', 'Moderately reactive, similar to sodium'] },
  { element: 'Chlorine (Group 17)', correct: 'Highly reactive — it needs just one more electron to complete its outer shell', wrongs: ['Completely unreactive — it has a full outer shell already', 'Reactive only with noble gases', 'Reactive only at very cold temperatures'] },
  { element: 'Magnesium (Group 2)', correct: 'Reactive — it has two outer electrons it can lose to form a stable ion', wrongs: ['Unreactive — it behaves like a noble gas', 'Reactive only underwater', 'Reactive only with other metals'] },
  { element: 'Argon (Group 18)', correct: 'Very unreactive — like other noble gases, it has a full outer electron shell', wrongs: ['Extremely reactive — it readily forms many compounds', 'Reactive only with nonmetals', 'Reactive only when heated to extreme temperatures'] },
  { element: 'Fluorine (Group 17)', correct: 'Extremely reactive — it needs just one more electron to complete its outer shell', wrongs: ['Completely unreactive — it never bonds with other elements', 'Reactive only with noble gases', 'Reactive only in liquid form'] },
  { element: 'Potassium (Group 1)', correct: 'Highly reactive — it has just one electron in its outer shell, which it readily loses', wrongs: ['Completely unreactive — it never forms compounds', 'Reactive only when frozen', 'Reactive only with other metals'] },
  { element: 'Calcium (Group 2)', correct: 'Reactive — it has two outer electrons it can lose to form a stable ion', wrongs: ['Unreactive — it behaves like a noble gas', 'Reactive only underwater', 'Reactive only with other metals'] },
  { element: 'Bromine (Group 17)', correct: 'Highly reactive — it needs just one more electron to complete its outer shell', wrongs: ['Completely unreactive — it has a full outer shell already', 'Reactive only with noble gases', 'Reactive only at very cold temperatures'] },
  { element: 'Lithium (Group 1)', correct: 'Highly reactive — it has just one electron in its outer shell, which it readily loses', wrongs: ['Completely unreactive — it never forms compounds', 'Reactive only when frozen', 'Reactive only with other metals'] },
  { element: 'Helium (Group 18)', correct: 'Very unreactive — it already has a full outer electron shell', wrongs: ['Extremely reactive — it explodes on contact with air', 'Reactive only with water', 'Moderately reactive, similar to sodium'] },
  { element: 'Krypton (Group 18)', correct: 'Very unreactive — like other noble gases, it has a full outer electron shell', wrongs: ['Extremely reactive — it readily forms many compounds', 'Reactive only with nonmetals', 'Reactive only when heated to extreme temperatures'] },
  { element: 'Iodine (Group 17)', correct: 'Reactive — it needs just one more electron to complete its outer shell', wrongs: ['Completely unreactive — it has a full outer shell already', 'Reactive only with noble gases', 'Reactive only at very cold temperatures'] },
  { element: 'Beryllium (Group 2)', correct: 'Reactive — it has two outer electrons it can lose to form a stable ion', wrongs: ['Unreactive — it behaves like a noble gas', 'Reactive only underwater', 'Reactive only with other metals'] },
  { element: 'Rubidium (Group 1)', correct: 'Extremely reactive — it has just one loosely held outer electron, which it loses even more easily than sodium', wrongs: ['Completely unreactive — it never forms compounds', 'Reactive only when frozen', 'Reactive only with other metals'] },
  { element: 'Strontium (Group 2)', correct: 'Reactive — it has two outer electrons it can lose to form a stable ion', wrongs: ['Unreactive — it behaves like a noble gas', 'Reactive only underwater', 'Reactive only with other metals'] },
  { element: 'Xenon (Group 18)', correct: 'Very unreactive — like other noble gases, it has a full outer electron shell', wrongs: ['Extremely reactive — it readily forms many compounds', 'Reactive only with nonmetals', 'Reactive only when heated to extreme temperatures'] },
  { element: 'Aluminum (Group 13)', correct: 'Reactive — it can lose three outer electrons to form a stable ion', wrongs: ['Unreactive — it behaves like a noble gas', 'Reactive only underwater', 'Reactive only with other nonmetals'] },
  { element: 'Oxygen (Group 16)', correct: 'Reactive — it needs just two more electrons to complete its outer shell', wrongs: ['Completely unreactive — it has a full outer shell already', 'Reactive only with noble gases', 'Reactive only at extremely low temperatures'] },
  { element: 'Sulfur (Group 16)', correct: 'Reactive — it needs just two more electrons to complete its outer shell', wrongs: ['Completely unreactive — it has a full outer shell already', 'Reactive only with noble gases', 'Reactive only in liquid form'] },
  { element: 'Cesium (Group 1)', correct: 'Extremely reactive — it has just one very loosely held outer electron, among the most reactive of all metals', wrongs: ['Completely unreactive — it never forms compounds', 'Reactive only when frozen', 'Reactive only with other metals'] },
  { element: 'Francium (Group 1)', correct: 'Extremely reactive — it has just one outer electron held even more loosely than cesium\'s, making it one of the most reactive elements known', wrongs: ['Completely unreactive — it never forms compounds', 'Reactive only when frozen', 'Reactive only with other metals'] },
  { element: 'Barium (Group 2)', correct: 'Reactive — it has two outer electrons it can lose to form a stable ion', wrongs: ['Unreactive — it behaves like a noble gas', 'Reactive only underwater', 'Reactive only with other metals'] },
  { element: 'Radium (Group 2)', correct: 'Reactive — it has two outer electrons it can lose to form a stable ion, similar to other Group 2 metals', wrongs: ['Unreactive — it behaves like a noble gas', 'Reactive only underwater', 'Reactive only with other metals'] },
  { element: 'Boron (Group 13)', correct: 'Moderately reactive — it can share or lose its three outer electrons, though less readily than true metals', wrongs: ['Unreactive — it behaves like a noble gas', 'Extremely reactive — it explodes on contact with air', 'Reactive only with noble gases'] },
  { element: 'Gallium (Group 13)', correct: 'Reactive — it can lose three outer electrons to form a stable ion', wrongs: ['Unreactive — it behaves like a noble gas', 'Reactive only underwater', 'Reactive only with other nonmetals'] },
  { element: 'Xenon (Group 18)', correct: 'Very unreactive — like other noble gases, it has a full outer electron shell, though it can form rare compounds under extreme conditions', wrongs: ['Extremely reactive — it readily forms many compounds', 'Reactive only with nonmetals', 'Reactive only when heated to extreme temperatures'] },
  { element: 'Radon (Group 18)', correct: 'Very unreactive — like other noble gases, it has a full outer electron shell', wrongs: ['Extremely reactive — it readily forms many compounds', 'Reactive only with nonmetals', 'Reactive only when heated to extreme temperatures'] },
  { element: 'Phosphorus (Group 15)', correct: 'Reactive — it needs three more electrons to complete its outer shell', wrongs: ['Completely unreactive — it has a full outer shell already', 'Reactive only with noble gases', 'Reactive only at extremely low temperatures'] },
  { element: 'Arsenic (Group 15)', correct: 'Reactive — it needs three more electrons to complete its outer shell', wrongs: ['Completely unreactive — it has a full outer shell already', 'Reactive only with noble gases', 'Reactive only at extremely low temperatures'] },
  { element: 'Selenium (Group 16)', correct: 'Reactive — it needs just two more electrons to complete its outer shell', wrongs: ['Completely unreactive — it has a full outer shell already', 'Reactive only with noble gases', 'Reactive only in liquid form'] },
  { element: 'Tellurium (Group 16)', correct: 'Reactive — it needs just two more electrons to complete its outer shell', wrongs: ['Completely unreactive — it has a full outer shell already', 'Reactive only with noble gases', 'Reactive only in liquid form'] },
  { element: 'Astatine (Group 17)', correct: 'Highly reactive — it needs just one more electron to complete its outer shell, like the other halogens', wrongs: ['Completely unreactive — it has a full outer shell already', 'Reactive only with noble gases', 'Reactive only at very cold temperatures'] },
  { element: 'Silicon (Group 14)', correct: 'Moderately reactive — as a metalloid, it can share its four outer electrons, but far less readily than reactive metals or halogens', wrongs: ['Extremely reactive — it explodes on contact with air', 'Completely unreactive — it never forms compounds', 'Reactive only with noble gases'] },
  { element: 'Germanium (Group 14)', correct: 'Moderately reactive — as a metalloid, it can share its four outer electrons, but far less readily than reactive metals or halogens', wrongs: ['Extremely reactive — it explodes on contact with air', 'Completely unreactive — it never forms compounds', 'Reactive only with noble gases'] }
];

const periodicTemplates = [
  { bloom: 'Remember', gen: () => {
    const facts = [
      { q: 'Elements in the periodic table are arranged in order of increasing what?', correct: 'Atomic number (number of protons)' },
      { q: 'What do we call a vertical column in the periodic table?', correct: 'Group (or family)' },
      { q: 'What do we call a horizontal row in the periodic table?', correct: 'Period' },
      { q: 'What do we call elements that are shiny, conduct electricity, and are typically found on the left side of the periodic table?', correct: 'Metals' },
      { q: 'What do we call elements that are poor conductors and are typically found on the right side of the periodic table?', correct: 'Nonmetals' },
      { q: 'What do we call the electrons in an atom\'s outermost shell, which determine how it bonds with other atoms?', correct: 'Valence electrons' },
      { q: 'What do we call elements, like silicon and boron, that have properties between metals and nonmetals?', correct: 'Metalloids' },
      { q: 'What do we call the extremely unreactive elements found in the last column (Group 18) of the periodic table?', correct: 'Noble gases' },
      { q: 'What do we call the highly reactive metals found in Group 1 of the periodic table?', correct: 'Alkali metals' },
      { q: 'What do we call the reactive metals found in Group 2 of the periodic table?', correct: 'Alkaline earth metals' },
      { q: 'What do we call the reactive nonmetal elements found in Group 17 of the periodic table?', correct: 'Halogens' },
      { q: 'What do we call the block of metals in the middle of the periodic table, like iron, copper, and gold?', correct: 'Transition metals' },
      { q: 'What do we call the general trend where atoms get smaller moving left to right across a period?', correct: 'Atomic radius trend' },
      { q: 'What do we call the overall pattern of repeating chemical properties as you move across the periodic table?', correct: 'Periodicity' },
      { q: 'Roughly how many naturally occurring elements are arranged on the periodic table?', correct: 'About 90', wrongs: ['About 500', 'Exactly 100', 'About 20'] },
      { q: 'What do we call the two rows of elements usually placed below the main body of the periodic table?', correct: 'Lanthanides and actinides', wrongs: ['Halogens and noble gases', 'Alkali and alkaline earth metals', 'Metalloids and nonmetals'] },
      { q: 'What symbol is used on the periodic table for the element gold?', correct: 'Au', wrongs: ['Gd', 'Go', 'Ag'] },
      { q: 'What symbol is used on the periodic table for the element sodium?', correct: 'Na', wrongs: ['So', 'Sd', 'S'] },
      { q: 'Who is credited with creating an early version of the periodic table that left gaps for undiscovered elements?', correct: 'Dmitri Mendeleev', wrongs: ['Antoine Lavoisier', 'Marie Curie', 'Ernest Rutherford'] },
      { q: 'How many periods (rows) does the standard periodic table have?', correct: '7', wrongs: ['8', '18', '12'] },
      { q: 'How many groups (columns) does the standard periodic table have?', correct: '18', wrongs: ['7', '20', '8'] },
      { q: 'What is the lightest and simplest element on the periodic table, with just one proton?', correct: 'Hydrogen', wrongs: ['Helium', 'Lithium', 'Carbon'] },
      { q: 'What do we call elements found in Groups 3-12 of the periodic table that are known for forming colorful compounds?', correct: 'Transition metals', wrongs: ['Alkali metals', 'Halogens', 'Metalloids'] },
      { q: 'What symbol is used on the periodic table for the element iron?', correct: 'Fe', wrongs: ['Ir', 'In', 'Fr'] },
      { q: 'What symbol is used on the periodic table for the element potassium?', correct: 'K', wrongs: ['P', 'Po', 'Pt'] },
      { q: 'What symbol is used on the periodic table for the element silver?', correct: 'Ag', wrongs: ['Si', 'Sr', 'Sn'] },
      { q: 'What symbol is used on the periodic table for the element lead?', correct: 'Pb', wrongs: ['Ld', 'Le', 'Pl'] },
      { q: 'What symbol is used on the periodic table for the element tin?', correct: 'Sn', wrongs: ['Ti', 'Ta', 'Tn'] },
      { q: 'What symbol is used on the periodic table for the element copper?', correct: 'Cu', wrongs: ['Co', 'Cp', 'Ce'] },
      { q: 'What symbol is used on the periodic table for the element mercury?', correct: 'Hg', wrongs: ['Me', 'Mc', 'Hy'] },
      { q: 'What symbol is used on the periodic table for the element tungsten?', correct: 'W', wrongs: ['Tu', 'Tn', 'Wo'] },
      { q: 'What do we call the general trend where an atom\'s attraction for shared electrons increases moving left to right across a period?', correct: 'Electronegativity trend', wrongs: ['Atomic radius trend', 'Ionization energy decrease', 'Metallic character increase'] },
      { q: 'What do we call the amount of energy required to remove an electron from a neutral atom?', correct: 'Ionization energy', wrongs: ['Electronegativity', 'Atomic radius', 'Bond energy'] },
      { q: 'As you move DOWN a group, does an element\'s ionization energy generally increase or decrease?', correct: 'It generally decreases', wrongs: ['It generally increases', 'It stays exactly the same', 'It becomes impossible to measure'] },
      { q: 'As you move LEFT to RIGHT across a period, does an element\'s ionization energy generally increase or decrease?', correct: 'It generally increases', wrongs: ['It generally decreases', 'It stays exactly the same', 'It becomes impossible to measure'] },
      { q: 'What do we call the section of the periodic table containing elements that are mostly gases, liquids, or brittle solids and tend to gain electrons?', correct: 'Nonmetals', wrongs: ['Metals', 'Metalloids', 'Noble gases'] },
      { q: 'What do we call an element that is placed above Group 1 but does not fully belong to the alkali metal family?', correct: 'Hydrogen', wrongs: ['Helium', 'Lithium', 'Boron'] },
      { q: 'What do we call the elements in Group 14 of the periodic table, which includes carbon and silicon?', correct: 'Carbon family', wrongs: ['Nitrogen family', 'Oxygen family', 'Boron family'] },
      { q: 'What do we call the elements in Group 15 of the periodic table, which includes nitrogen and phosphorus?', correct: 'Nitrogen family', wrongs: ['Carbon family', 'Oxygen family', 'Halogens'] },
      { q: 'What do we call the tendency of an element to lose electrons and form positive ions, a property most common in metals?', correct: 'Metallic character', wrongs: ['Electronegativity', 'Ionization energy', 'Atomic radius'] }
    ];
    const allTerms = ['Atomic number (number of protons)', 'Group (or family)', 'Period', 'Metals', 'Nonmetals', 'Valence electrons', 'Metalloids', 'Noble gases', 'Alkali metals', 'Alkaline earth metals', 'Halogens', 'Transition metals', 'Atomic radius trend', 'Periodicity'];
    const f = choice(facts);
    const wrongs = f.wrongs || shuffle(allTerms.filter(c => c !== f.correct)).slice(0, 3);
    const choices = shuffle([f.correct, ...wrongs]);
    return { prompt: f.q, type: 'mcq', choices, correct: f.correct, explanation: `${f.correct} is correct.` };
  }},
  { bloom: 'Understand', gen: () => {
    const elements = [
      ['Sodium (Na)', 'Metal'], ['Iron (Fe)', 'Metal'], ['Oxygen (O)', 'Nonmetal'],
      ['Chlorine (Cl)', 'Nonmetal'], ['Silicon (Si)', 'Metalloid'], ['Boron (B)', 'Metalloid'],
      ['Calcium (Ca)', 'Metal'], ['Nitrogen (N)', 'Nonmetal'], ['Germanium (Ge)', 'Metalloid'],
      ['Copper (Cu)', 'Metal'], ['Hydrogen (H)', 'Nonmetal'], ['Arsenic (As)', 'Metalloid'],
      ['Zinc (Zn)', 'Metal'], ['Sulfur (S)', 'Nonmetal'], ['Antimony (Sb)', 'Metalloid'],
      ['Gold (Au)', 'Metal'], ['Carbon (C)', 'Nonmetal'], ['Tellurium (Te)', 'Metalloid'],
      ['Aluminum (Al)', 'Metal'], ['Phosphorus (P)', 'Nonmetal'], ['Silver (Ag)', 'Metal'],
      ['Nickel (Ni)', 'Metal'], ['Iodine (I)', 'Nonmetal'],
      ['Platinum (Pt)', 'Metal'], ['Titanium (Ti)', 'Metal'], ['Lead (Pb)', 'Metal'], ['Tin (Sn)', 'Metal'],
      ['Mercury (Hg)', 'Metal'], ['Tungsten (W)', 'Metal'], ['Chromium (Cr)', 'Metal'], ['Manganese (Mn)', 'Metal'],
      ['Cobalt (Co)', 'Metal'], ['Bromine (Br)', 'Nonmetal'], ['Helium (He)', 'Nonmetal'], ['Neon (Ne)', 'Nonmetal'],
      ['Fluorine (F)', 'Nonmetal'], ['Selenium (Se)', 'Nonmetal'], ['Krypton (Kr)', 'Nonmetal'],
      ['Polonium (Po)', 'Metalloid'], ['Astatine (At)', 'Metalloid']
    ];
    const [name, category] = choice(elements);
    const wrongs = ['Metal', 'Nonmetal', 'Metalloid', 'Noble gas'].filter(c => c !== category);
    const choices = shuffle([category, ...wrongs]);
    return { prompt: `Which category does ${name} belong to?`, type: 'mcq', choices, correct: category, explanation: `${name} is classified as a ${category.toLowerCase()}.` };
  }},
  { bloom: 'Apply', gen: () => {
    const elements = [
      ['Hydrogen', 1], ['Carbon', 6], ['Oxygen', 8], ['Sodium', 11], ['Magnesium', 12],
      ['Aluminum', 13], ['Silicon', 14], ['Chlorine', 17], ['Calcium', 20],
      ['Helium', 2], ['Nitrogen', 7], ['Fluorine', 9], ['Potassium', 19],
      ['Lithium', 3], ['Beryllium', 4], ['Boron', 5], ['Neon', 10], ['Phosphorus', 15],
      ['Sulfur', 16], ['Argon', 18], ['Scandium', 21], ['Titanium', 22], ['Iron', 26],
      ['Vanadium', 23], ['Chromium', 24], ['Manganese', 25], ['Cobalt', 27], ['Nickel', 28],
      ['Copper', 29], ['Zinc', 30], ['Gallium', 31], ['Germanium', 32], ['Arsenic', 33],
      ['Selenium', 34], ['Bromine', 35], ['Krypton', 36], ['Silver', 47], ['Tin', 50],
      ['Iodine', 53], ['Barium', 56]
    ];
    const [name, atomicNum] = choice(elements);
    return {
      prompt: `${name} has an atomic number of ${atomicNum}. How many electrons does a neutral atom of ${name} have?`,
      type: 'numeric',
      answer: atomicNum,
      explanation: `In a neutral atom, the number of electrons equals the number of protons (the atomic number): ${atomicNum}.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const entry = choice(PERIODIC_MISCONCEPTIONS);
    const wrongs = ['Cannot be determined without more information', 'This is only true for elements in Group 18', entry.wrong];
    const choices = shuffle([entry.correct, ...wrongs]);
    return {
      prompt: `A student claims that ${entry.claim}. Evaluate this claim.`,
      type: 'mcq',
      choices,
      correct: entry.correct,
      explanation: entry.correct
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const entry = choice(SIMILAR_GROUP_POOL);
    const choices = shuffle([entry.correct, ...entry.wrongs]);
    return {
      prompt: `Which element would you expect to have the MOST similar chemical properties to ${entry.anchor}?`,
      type: 'mcq',
      choices,
      correct: entry.correct,
      explanation: `${entry.correct} and ${entry.anchor} share similar properties. ${entry.groupNote}, giving them the same number of valence electrons.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const entry = choice(REACTIVITY_POOL);
    const choices = shuffle([entry.correct, ...entry.wrongs]);
    return {
      prompt: `Based on its position in the periodic table, how reactive would you expect ${entry.element} to be?`,
      type: 'mcq',
      choices,
      correct: entry.correct,
      explanation: entry.correct
    };
  }}
];

const CHEMISTRY_TOPICS = [
  defineTopic('atoms', 'Atoms & Elements', '⚛️', atomsTemplates),
  defineTopic('molecules', 'Molecules & Bonding', '🧪', moleculesTemplates),
  defineTopic('mixtures', 'Mixtures & Solutions', '💧', mixturesTemplates),
  defineTopic('reactions', 'Chemical Reactions', '🔥', reactionsTemplates),
  defineTopic('acids', 'Acids & Bases', '🧫', acidsTemplates),
  defineTopic('periodic', 'Periodic Table', '📋', periodicTemplates)
];
