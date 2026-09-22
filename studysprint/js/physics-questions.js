// Physics question bank. Reuses shared helpers (randInt, choice, shuffle,
// buildChoices, round2, supify, makeBank, defineTopic, coordinatePlaneSVG,
// C_PRIMARY etc.) defined in questions.js, which must load first.

// ---- physics-specific SVG helpers -----------------------------------------

function forceArrowsSVG(f1, f2) {
  const midY = 60;
  const arrow = (x1, x2, y, color) => {
    const dir = x2 > x1 ? 1 : -1;
    return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${color}" stroke-width="4"/>
      <polygon points="${x2},${y} ${x2 - dir * 10},${y - 6} ${x2 - dir * 10},${y + 6}" fill="${color}"/>`;
  };
  return `<svg viewBox="0 0 300 120" class="q-diagram" xmlns="http://www.w3.org/2000/svg">
    <rect x="120" y="40" width="60" height="40" fill="#e5e7eb" stroke="${C_TEXT}" stroke-width="2"/>
    ${arrow(120, 120 - f1 * 6, midY, '#dc2626')}
    <text x="${120 - f1 * 6 - 10}" y="${midY - 12}" font-size="13" fill="#dc2626" text-anchor="end">${f1} N</text>
    ${arrow(180, 180 + f2 * 6, midY, C_PRIMARY)}
    <text x="${180 + f2 * 6 + 10}" y="${midY - 12}" font-size="13" fill="${C_PRIMARY}">${f2} N</text>
  </svg>`;
}

function particleGridSVG(state) {
  let dots = '';
  if (state === 'solid') {
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      dots += `<circle cx="${40 + c * 35}" cy="${30 + r * 35}" r="9" fill="${C_PRIMARY}"/>`;
    }
  } else if (state === 'liquid') {
    const rand = [[40,35],[72,40],[110,32],[150,38],[55,70],[95,75],[130,68],[170,72],[45,105],[85,100],[125,108],[160,103]];
    rand.forEach(([x,y]) => { dots += `<circle cx="${x}" cy="${y}" r="9" fill="${C_PRIMARY}"/>`; });
  } else {
    const rand = [[30,20],[140,15],[70,55],[10,90],[160,80],[100,110],[50,130],[180,45],[120,125],[20,50]];
    rand.forEach(([x,y]) => { dots += `<circle cx="${x}" cy="${y}" r="8" fill="${C_PRIMARY}"/>`; });
  }
  return `<svg viewBox="0 0 200 140" class="q-diagram" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="196" height="136" fill="none" stroke="${C_BORDER}" stroke-width="2" rx="8"/>
    ${dots}
  </svg>`;
}

function simpleWaveSVG(amplitude, wavelengthPx) {
  const width = 420, height = 140, midY = 70;
  const points = [];
  for (let x = 0; x <= width; x += 4) {
    const y = midY - amplitude * Math.sin((2 * Math.PI * x) / wavelengthPx);
    points.push(`${x},${y.toFixed(1)}`);
  }
  return `<svg viewBox="0 0 ${width} ${height}" class="q-diagram" xmlns="http://www.w3.org/2000/svg">
    <line x1="0" y1="${midY}" x2="${width}" y2="${midY}" stroke="${C_BORDER}" stroke-width="1"/>
    <polyline points="${points.join(' ')}" fill="none" stroke="${C_PRIMARY}" stroke-width="3"/>
    <line x1="20" y1="${midY}" x2="20" y2="${midY - amplitude}" stroke="${C_MUTED}" stroke-width="1.5" stroke-dasharray="3,2"/>
    <text x="26" y="${midY - amplitude / 2}" font-size="12" fill="${C_MUTED}">amplitude</text>
    <line x1="20" y1="${midY + 25}" x2="${20 + wavelengthPx}" y2="${midY + 25}" stroke="${C_MUTED}" stroke-width="1.5"/>
    <text x="${20 + wavelengthPx / 2}" y="${midY + 42}" font-size="12" text-anchor="middle" fill="${C_MUTED}">wavelength</text>
  </svg>`;
}

function circuitSVG(voltage, resistance) {
  const loopLeft = 90, loopRight = 270, loopTop = 50, loopBottom = 170;
  const battYMid = (loopTop + loopBottom) / 2;
  const gap = 10;
  const resistorCx = (loopLeft + loopRight) / 2;
  return `<svg viewBox="0 0 340 210" class="q-diagram" xmlns="http://www.w3.org/2000/svg">
    <line x1="${loopLeft}" y1="${loopTop}" x2="${loopRight}" y2="${loopTop}" stroke="${C_TEXT}" stroke-width="3"/>
    <line x1="${loopRight}" y1="${loopTop}" x2="${loopRight}" y2="${loopBottom}" stroke="${C_TEXT}" stroke-width="3"/>
    <line x1="${loopRight}" y1="${loopBottom}" x2="${loopLeft}" y2="${loopBottom}" stroke="${C_TEXT}" stroke-width="3"/>
    <line x1="${loopLeft}" y1="${loopBottom}" x2="${loopLeft}" y2="${battYMid + gap}" stroke="${C_TEXT}" stroke-width="3"/>
    <line x1="${loopLeft}" y1="${loopTop}" x2="${loopLeft}" y2="${battYMid - gap}" stroke="${C_TEXT}" stroke-width="3"/>
    <line x1="${loopLeft - 14}" y1="${battYMid - gap}" x2="${loopLeft + 14}" y2="${battYMid - gap}" stroke="${C_TEXT}" stroke-width="4"/>
    <line x1="${loopLeft - 7}" y1="${battYMid + gap}" x2="${loopLeft + 7}" y2="${battYMid + gap}" stroke="${C_TEXT}" stroke-width="4"/>
    <text x="${loopLeft - 24}" y="${battYMid + 5}" font-size="15" text-anchor="end" fill="${C_TEXT}">${voltage}V</text>
    <rect x="${resistorCx - 20}" y="${loopTop - 11}" width="40" height="22" fill="#fde68a" stroke="${C_TEXT}" stroke-width="2"/>
    <text x="${resistorCx}" y="${loopTop - 18}" font-size="15" text-anchor="middle" fill="${C_TEXT}">${resistance}Ω</text>
  </svg>`;
}

// ---- Forces & Motion -------------------------------------------------------

const forcesTemplates = [
  { bloom: 'Remember', gen: () => {
    const facts = [
      { q: 'What is the SI unit of force?', correct: 'Newton', wrongs: ['Joule', 'Watt', 'Pascal'] },
      { q: 'What do we call a force that opposes motion between two touching surfaces?', correct: 'Friction', wrongs: ['Gravity', 'Tension', 'Momentum'] },
      { q: 'What is the SI unit of speed?', correct: 'Meters per second', wrongs: ['Newtons', 'Kilograms', 'Joules'] }
    ];
    const f = choice(facts);
    const choices = shuffle([f.correct, ...f.wrongs]);
    return { prompt: f.q, type: 'mcq', choices, correct: f.correct, explanation: `${f.correct} is the term/unit being described.` };
  }},
  { bloom: 'Understand', gen: () => {
    const f1 = randInt(2, 8), f2 = randInt(2, 8);
    const net = f2 - f1;
    const diagram = forceArrowsSVG(f1, f2);
    return {
      prompt: 'Two forces act on the box shown. What is the net force? (rightward is positive)',
      type: 'numeric',
      answer: net,
      diagram,
      explanation: `Net force = rightward force - leftward force = ${f2} - ${f1} = ${net} N.`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const m = randInt(2, 20), a = randInt(2, 10);
    return {
      prompt: `Using Newton's second law (F = ma), what force is needed to accelerate a ${m} kg object at ${a} m/s²?`,
      type: 'numeric',
      answer: m * a,
      explanation: `F = ma = ${m} × ${a} = ${m * a} N.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const speedA = randInt(30, 70), hoursA = randInt(1, 4);
    const speedB = randInt(30, 70);
    let hoursB = randInt(1, 4);
    const distA = speedA * hoursA;
    if (distA === speedB * hoursB) hoursB += 1;
    const finalDistB = speedB * hoursB;
    const correct = distA > finalDistB ? `Car A travels farther (${distA} miles vs ${finalDistB} miles)` : `Car B travels farther (${finalDistB} miles vs ${distA} miles)`;
    const wrong = distA > finalDistB ? `Car B travels farther (${finalDistB} miles vs ${distA} miles)` : `Car A travels farther (${distA} miles vs ${finalDistB} miles)`;
    const choices = shuffle([correct, wrong, 'They travel the same distance', 'Cannot be determined']);
    return {
      prompt: `Car A drives at ${speedA} mph for ${hoursA} hours. Car B drives at ${speedB} mph for ${hoursB} hours. Which travels farther?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Distance = speed × time. Car A: ${speedA}×${hoursA}=${distA} miles. Car B: ${speedB}×${hoursB}=${finalDistB} miles.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const correct = "An equal and opposite force pushing up on the book";
    const wrongs = ['No force at all, since the book is not moving', 'A smaller force than the book exerts on the table', "A force in the same direction as gravity"];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: "A book rests on a table. According to Newton's third law, what force does the table exert on the book?",
      type: 'mcq',
      choices,
      correct,
      explanation: "Newton's third law: for every action force, there is an equal and opposite reaction force. The table pushes up on the book as hard as gravity pulls the book down."
    };
  }},
  { bloom: 'Create', gen: () => {
    const correct = 'A hockey puck sliding on frictionless ice keeps moving in a straight line until something stops it';
    const wrongs = [
      'A ball speeds up on its own while rolling across grass',
      'A car needs constant pushing to keep moving at a steady speed on a flat road',
      'An object at rest starts moving with no force applied to it'
    ];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: "Which scenario best demonstrates Newton's first law (an object in motion stays in motion unless acted on by an outside force)?",
      type: 'mcq',
      choices,
      correct,
      explanation: 'Newton\'s first law (inertia) means objects resist changes to their motion. The frictionless puck keeps sliding because no force acts to stop it.'
    };
  }}
];

// ---- Energy & Work ----------------------------------------------------------

const energyTemplates = [
  { bloom: 'Remember', gen: () => {
    const correct = 'Joule';
    const wrongs = ['Newton', 'Watt', 'Ampere'];
    const choices = shuffle([correct, ...wrongs]);
    return { prompt: 'What is the SI unit of energy?', type: 'mcq', choices, correct, explanation: 'Energy (and work) are measured in joules (J).' };
  }},
  { bloom: 'Understand', gen: () => {
    const terms = [
      { term: 'Kinetic energy', def: 'the energy of motion' },
      { term: 'Potential energy', def: 'stored energy due to position or height' },
      { term: 'Thermal energy', def: 'the energy of moving particles that we feel as heat' },
      { term: 'Chemical energy', def: 'energy stored in the bonds of molecules, like in food or batteries' }
    ];
    const target = choice(terms);
    const wrongs = terms.filter(t => t !== target).map(t => t.term);
    const choices = shuffle([target.term, ...wrongs]);
    return { prompt: `What do we call ${target.def}?`, type: 'mcq', choices, correct: target.term, explanation: `${target.term} is defined as ${target.def}.` };
  }},
  { bloom: 'Apply', gen: () => {
    if (Math.random() < 0.5) {
      const f = randInt(5, 40), d = randInt(2, 15);
      return {
        prompt: `Using Work = Force × distance, how much work is done pushing an object with ${f} N of force across ${d} meters?`,
        type: 'numeric',
        answer: f * d,
        explanation: `Work = F × d = ${f} × ${d} = ${f * d} J.`
      };
    }
    const m = randInt(2, 10), v = randInt(2, 8);
    return {
      prompt: `Using KE = ½mv², what is the kinetic energy of a ${m} kg object moving at ${v} m/s?`,
      type: 'numeric',
      answer: round2(0.5 * m * v * v),
      explanation: `KE = ½ × ${m} × ${v}² = ½ × ${m} × ${v * v} = ${round2(0.5 * m * v * v)} J.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const m = randInt(2, 10), h = randInt(2, 20), g = 10;
    const correctPE = m * g * h;
    const studentWrong = Math.random() < 0.5;
    const studentPE = studentWrong ? correctPE + choice([-20, -10, 10, 20]) : correctPE;
    const correctChoice = studentPE === correctPE ? `Correct — PE = ${correctPE} J` : `Incorrect — PE should be ${correctPE} J, not ${studentPE} J`;
    const wrongChoice = studentPE === correctPE ? `Incorrect — PE should be ${correctPE + 10} J` : `Correct — PE = ${studentPE} J`;
    const choices = shuffle([correctChoice, wrongChoice, 'Cannot be determined', 'Potential energy does not depend on height']);
    return {
      prompt: `Using PE = mgh (g = 10 m/s²), a student calculated the potential energy of a ${m} kg object at ${h} m height as ${studentPE} J. Evaluate their work.`,
      type: 'mcq',
      choices,
      correct: correctChoice,
      explanation: `PE = mgh = ${m} × ${g} × ${h} = ${correctPE} J. ${studentPE === correctPE ? 'The student is correct.' : `Their answer of ${studentPE} J is wrong.`}`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const m1 = randInt(2, 10), v1 = randInt(2, 8);
    let m2 = randInt(2, 10), v2 = randInt(2, 8);
    let ke1 = round2(0.5 * m1 * v1 * v1), ke2 = round2(0.5 * m2 * v2 * v2);
    let guard = 0;
    while (ke1 === ke2 && guard < 30) { m2 = randInt(2, 10); v2 = randInt(2, 8); ke2 = round2(0.5 * m2 * v2 * v2); guard++; }
    const optA = `Object A (${m1} kg at ${v1} m/s): KE = ${ke1} J`;
    const optB = `Object B (${m2} kg at ${v2} m/s): KE = ${ke2} J`;
    const correct = ke1 > ke2 ? optA : optB;
    const choices = shuffle([optA, optB, 'They have equal kinetic energy', 'Cannot be determined']);
    return {
      prompt: `Which has more kinetic energy: Object A (${m1} kg at ${v1} m/s) or Object B (${m2} kg at ${v2} m/s)?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `KE = ½mv². Object A: ½×${m1}×${v1}² = ${ke1} J. Object B: ½×${m2}×${v2}² = ${ke2} J.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const correct = 'Doubling the speed';
    const wrongs = ['Doubling the mass', 'Doubling the height', 'Halving the mass'];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: "Since KE = ½mv², which change would increase an object's kinetic energy the most?",
      type: 'mcq',
      choices,
      correct,
      explanation: 'Kinetic energy depends on the SQUARE of speed, so doubling speed quadruples KE — much more than doubling mass, which only doubles KE.'
    };
  }}
];

// ---- Matter & States ---------------------------------------------------------

const matterTemplates = [
  { bloom: 'Remember', gen: () => {
    const facts = [
      { q: 'What is the term for matter changing directly from a solid to a gas?', correct: 'Sublimation', wrongs: ['Evaporation', 'Condensation', 'Melting'] },
      { q: 'What is the term for a gas changing directly into a liquid?', correct: 'Condensation', wrongs: ['Sublimation', 'Freezing', 'Boiling'] },
      { q: 'What is the term for a liquid changing into a solid?', correct: 'Freezing', wrongs: ['Melting', 'Evaporation', 'Sublimation'] }
    ];
    const f = choice(facts);
    const choices = shuffle([f.correct, ...f.wrongs]);
    return { prompt: f.q, type: 'mcq', choices, correct: f.correct, explanation: `${f.correct} describes this change of state.` };
  }},
  { bloom: 'Understand', gen: () => {
    const state = choice(['solid', 'liquid', 'gas']);
    const diagram = particleGridSVG(state);
    const wrongs = ['solid', 'liquid', 'gas', 'plasma'].filter(s => s !== state);
    const choices = shuffle([state, ...wrongs].map(s => s[0].toUpperCase() + s.slice(1)));
    const correct = state[0].toUpperCase() + state.slice(1);
    return {
      prompt: 'Which state of matter is shown by the particle arrangement below?',
      type: 'mcq',
      choices,
      correct,
      diagram,
      explanation: `${correct === 'Solid' ? 'Particles packed in a tight, fixed pattern' : correct === 'Liquid' ? 'Particles close together but free to move past each other' : 'Particles spread far apart, moving freely'} indicates the ${correct.toLowerCase()} state.`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const mass = randInt(10, 200);
    const volume = randInt(2, 20);
    return {
      prompt: `Using Density = mass ÷ volume, what is the density of an object with mass ${mass} g and volume ${volume} mL?`,
      type: 'numeric',
      tolerance: 0.05,
      answer: round2(mass / volume),
      explanation: `Density = ${mass} ÷ ${volume} = ${round2(mass / volume)} g/mL.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const mass = randInt(20, 100), volume = randInt(2, 10);
    const correctDensity = round2(mass / volume);
    const wrongDensity = round2(volume / mass);
    const correct = `They flipped the formula — density is mass ÷ volume = ${correctDensity} g/mL, not volume ÷ mass`;
    const wrongs = ['The student is correct', 'Density should be mass × volume instead', 'Density cannot be calculated without more information'];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `A student calculated the density of an object (mass ${mass} g, volume ${volume} mL) as ${wrongDensity} g/mL by dividing volume by mass. What is their mistake?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Density = mass ÷ volume = ${mass} ÷ ${volume} = ${correctDensity} g/mL. Dividing the other way around gives the wrong (and much smaller) value.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const densities = [
      ['Oil', 0.9], ['Water', 1.0], ['Ice', 0.92], ['Corn syrup', 1.4], ['Honey', 1.42], ['Rubbing alcohol', 0.79]
    ];
    const [nameA, densA] = choice(densities);
    let [nameB, densB] = choice(densities);
    let guard = 0;
    while ((nameB === nameA || densB === densA) && guard < 20) { [nameB, densB] = choice(densities); guard++; }
    const floats = densA < densB ? nameA : nameB;
    const sinks = densA < densB ? nameB : nameA;
    const correct = `${floats} floats on top of ${sinks}`;
    const wrong = `${sinks} floats on top of ${floats}`;
    const choices = shuffle([correct, wrong, 'They form a uniform mixture', 'Neither floats; both sink to the bottom']);
    return {
      prompt: `${nameA} has a density of ${densA} g/mL, and ${nameB} has a density of ${densB} g/mL. If mixed in a container, what happens?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `The less dense liquid floats on top of the denser one. Since ${floats} (${densA < densB ? densA : densB} g/mL) is less dense than ${sinks}, it floats on top.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const pairs = [[10, 5], [20, 10], [30, 15], [8, 4], [50, 25]];
    const correctPair = choice(pairs);
    const correct = `mass = ${correctPair[0]} g, volume = ${correctPair[1]} mL`;
    const wrongPairs = [[12, 5], [20, 8], [15, 10]];
    const choices = shuffle([correct, ...shuffle(wrongPairs).slice(0, 3).map(p => `mass = ${p[0]} g, volume = ${p[1]} mL`)]);
    return {
      prompt: 'Which combination of mass and volume gives a density of exactly 2 g/mL?',
      type: 'mcq',
      choices,
      correct,
      explanation: `${correct}: density = ${correctPair[0]} ÷ ${correctPair[1]} = 2 g/mL.`
    };
  }}
];

// ---- Heat & Thermal Energy ----------------------------------------------------

const MATERIAL_COMPARISON_POOL = [
  { conductor: 'A metal spoon', insulator: 'A wooden spoon', context: 'both placed in a hot pot of soup' },
  { conductor: 'A metal doorknob', insulator: 'A plastic doorknob', context: 'both in a cold room overnight' },
  { conductor: 'An aluminum foil sheet', insulator: 'A wool blanket', context: 'both left outside on a sunny day' },
  { conductor: 'A ceramic mug', insulator: 'A styrofoam cup', context: 'both filled with the same hot coffee' },
  { conductor: 'A metal railing', insulator: 'A rubber handle', context: 'both touched on a freezing winter morning' },
  { conductor: 'A metal frying pan', insulator: 'A wooden cutting board', context: 'both left on a stove near a lit burner' },
  { conductor: 'A metal car body', insulator: 'A foam seat cushion', context: 'both sitting in direct sunlight for an hour' },
  { conductor: 'A metal fence', insulator: 'A canvas tent', context: 'both left outside on a frosty morning' },
  { conductor: 'A steel water bottle', insulator: 'A cardboard box', context: 'both holding ice water on a warm day' },
  { conductor: 'A metal ladder', insulator: 'A wooden ladder', context: 'both left leaning against a house on a hot afternoon' },
  { conductor: 'A metal thermos (no vacuum layer)', insulator: 'A foam-walled thermos', context: 'both filled with the same hot cocoa' },
  { conductor: 'A metal playground slide', insulator: 'A plastic playground slide', context: 'both sitting under direct midday sun' },
  { conductor: 'A metal cookie sheet', insulator: 'A silicone baking mat', context: 'both resting on the same hot oven rack' },
  { conductor: 'A metal pipe', insulator: 'A rubber garden hose', context: 'both lying outside on a freezing night' },
  { conductor: 'A metal butter knife', insulator: 'A plastic butter knife', context: 'both left standing in a mug of hot tea' },
  { conductor: 'A metal window frame', insulator: 'A vinyl window frame', context: 'both exposed to a cold winter draft' },
  { conductor: 'A metal picnic table', insulator: 'A wooden picnic table', context: 'both sitting in a park all afternoon in the sun' },
  { conductor: 'A metal camping mug', insulator: 'A ceramic camping mug with a cozy sleeve', context: 'both holding the same hot coffee at a campsite' },
  { conductor: 'A metal spatula', insulator: 'A silicone spatula', context: 'both resting in the same hot skillet' },
  { conductor: 'A metal garden trowel', insulator: 'A wooden-handled garden fork', context: 'both left outside on a scorching afternoon' },
  { conductor: 'A metal filing cabinet', insulator: 'A cardboard storage box', context: 'both sitting in a sunlit office window' },
  { conductor: 'A metal bike frame', insulator: 'A foam bike seat cover', context: 'both parked outside on a hot summer day' },
  { conductor: 'A metal measuring cup', insulator: 'A plastic measuring cup', context: 'both used to scoop the same hot soup' },
  { conductor: 'A metal belt buckle', insulator: 'A leather belt strap', context: 'both worn outside on a freezing morning' },
  { conductor: 'A metal mailbox', insulator: 'A wooden mailbox post', context: 'both standing outside in the midday sun' },
  { conductor: 'A metal patio chair', insulator: 'A cushioned patio chair', context: 'both sitting in direct sunlight all day' },
  { conductor: 'A metal tent stake', insulator: 'A rubber mallet handle', context: 'both left out overnight in cold weather' },
  { conductor: 'A metal coin', insulator: 'A plastic poker chip', context: 'both resting on a sun-warmed windowsill' },
  { conductor: 'A metal whisk', insulator: 'A wooden spoon handle', context: 'both stirring the same pot of hot stew' },
  { conductor: 'A metal flashlight casing', insulator: 'A rubber flashlight grip', context: 'both left in a car trunk on a hot day' },
  { conductor: 'A metal picture frame', insulator: 'A fabric-covered bulletin board', context: 'both hanging on a sunlit wall' },
  { conductor: 'A metal watering can', insulator: 'A plastic watering can', context: 'both filled with the same warm water' },
  { conductor: 'A metal skillet lid', insulator: 'A glass skillet lid with a plastic knob', context: 'both covering the same simmering pan' },
  { conductor: 'A metal jungle gym bar', insulator: 'A rubber playground mat', context: 'both baking in the midday sun' },
  { conductor: 'A metal thermometer stem', insulator: 'A plastic thermometer casing', context: 'both dipped into the same warm bathwater' },
  { conductor: 'A metal wind chime', insulator: 'A wooden wind chime frame', context: 'both hanging on a hot porch' }
];

const HEAT_DEMO_POOL = [
  { type: 'convection', correct: 'Water boiling in a pot, with hot water rising and cooler water sinking to replace it', hint: 'a pot of water coming to a boil on the stove', explanation: 'the movement of a fluid (liquid or gas)' },
  { type: 'convection', correct: 'A room warming up as hot air near a heater rises and circulates around the space', hint: 'a heater slowly warming up a whole room', explanation: 'the movement of a fluid (liquid or gas)' },
  { type: 'convection', correct: 'Wind forming as warm air over land rises and cooler air from the ocean rushes in to replace it', hint: 'a sea breeze developing along a coastline', explanation: 'the movement of a fluid (liquid or gas)' },
  { type: 'convection', correct: 'Steam and heat swirling upward out of an open manhole on a cold morning', hint: 'a steamy street vent on a cold morning', explanation: 'the movement of a fluid (liquid or gas)' },
  { type: 'convection', correct: 'A hot air balloon rising as the air inside it is heated and becomes less dense than the air outside', hint: 'a hot air balloon lifting off the ground', explanation: 'the movement of a fluid (liquid or gas)' },
  { type: 'convection', correct: 'Soup in a pot circulating in currents as the bottom layer heats and rises past the cooler top layer', hint: 'currents forming in a simmering pot of soup', explanation: 'the movement of a fluid (liquid or gas)' },
  { type: 'convection', correct: 'A lava lamp\'s colored wax rising and sinking as it heats near the bulb and cools near the top', hint: 'the blobs drifting inside a lava lamp', explanation: 'the movement of a fluid (liquid or gas)' },
  { type: 'conduction', correct: 'A metal rod slowly getting warm at one end after the other end is heated', hint: 'heat creeping down a metal rod held in a flame', explanation: 'direct contact between particles' },
  { type: 'conduction', correct: 'A spoon left in a hot cup of tea becoming warm to the touch', hint: 'a spoon forgotten in a hot mug of tea', explanation: 'direct contact between particles' },
  { type: 'conduction', correct: 'The handle of a frying pan becoming too hot to grab bare-handed while cooking', hint: 'a frying pan handle heating up while cooking', explanation: 'direct contact between particles' },
  { type: 'conduction', correct: 'Bare feet feeling cold instantly after stepping onto a tile floor in winter', hint: 'stepping barefoot onto a cold tile floor', explanation: 'direct contact between particles' },
  { type: 'conduction', correct: 'An ice cube melting quickly in your warm hand as you hold it', hint: 'an ice cube melting in a warm palm', explanation: 'direct contact between particles' },
  { type: 'conduction', correct: 'A soldering iron transferring heat directly into a wire it touches', hint: 'a soldering iron pressed against a wire', explanation: 'direct contact between particles' },
  { type: 'conduction', correct: 'A car seatbelt buckle feeling scorching hot after sitting in a parked, sun-soaked car', hint: 'a metal seatbelt buckle baking inside a parked car', explanation: 'direct contact between particles' },
  { type: 'radiation', correct: 'Feeling the warmth of a campfire without touching it', hint: 'standing near a crackling campfire', explanation: 'electromagnetic waves, with no contact or fluid needed' },
  { type: 'radiation', correct: 'The Sun warming the Earth across empty space', hint: 'sunlight traveling through the vacuum of space', explanation: 'electromagnetic waves, with no contact or fluid needed' },
  { type: 'radiation', correct: 'A toaster\'s glowing coils warming bread without the bread ever touching the coils', hint: 'bread toasting near a toaster\'s glowing coils', explanation: 'electromagnetic waves, with no contact or fluid needed' },
  { type: 'radiation', correct: 'Skin feeling warm after standing in direct sunlight on a clear day', hint: 'skin warming up while standing in the sun', explanation: 'electromagnetic waves, with no contact or fluid needed' },
  { type: 'radiation', correct: 'A heat lamp keeping food warm at a restaurant without touching the plates', hint: 'a heat lamp glowing over plates at a buffet', explanation: 'electromagnetic waves, with no contact or fluid needed' },
  { type: 'radiation', correct: 'The warmth felt on your face when standing a few feet from a glowing fireplace', hint: 'the glow of a fireplace warming a nearby face', explanation: 'electromagnetic waves, with no contact or fluid needed' },
  { type: 'convection', correct: 'Clouds forming as warm, moist air rises high into the cooler upper atmosphere', hint: 'a thunderstorm cloud building up on a humid afternoon', explanation: 'the movement of a fluid (liquid or gas)' },
  { type: 'convection', correct: 'A candle flame flickering upward as hot gases rise above the wick and cooler air is pulled in below', hint: 'the shape of a candle flame stretching upward', explanation: 'the movement of a fluid (liquid or gas)' },
  { type: 'convection', correct: 'Water in a kettle circulating in loops as the heated water near the base rises past cooler water above', hint: 'currents swirling inside a kettle just before it whistles', explanation: 'the movement of a fluid (liquid or gas)' },
  { type: 'convection', correct: 'Warm exhaust air escaping a clothes dryer vent while cooler outside air gets pulled in around the machine', hint: 'warm air puffing out of a dryer vent', explanation: 'the movement of a fluid (liquid or gas)' },
  { type: 'convection', correct: 'A ceiling fan set to pull warm air down from the top of a room in winter to mix it with cooler air below', hint: 'a ceiling fan running slowly in winter', explanation: 'the movement of a fluid (liquid or gas)' },
  { type: 'conduction', correct: 'A skillet handle growing too hot to grip after the pan sits over a flame for a few minutes', hint: 'a skillet handle heating up during cooking', explanation: 'direct contact between particles' },
  { type: 'conduction', correct: 'A popsicle stick feeling instantly cold the moment it touches your tongue', hint: 'the first cold bite of a popsicle', explanation: 'direct contact between particles' },
  { type: 'conduction', correct: 'A curling iron transferring its heat directly into a strand of hair wrapped around it', hint: 'a curling iron pressed against a lock of hair', explanation: 'direct contact between particles' },
  { type: 'conduction', correct: 'Bare hands feeling cold almost immediately after grabbing a metal porch railing in winter', hint: 'grabbing a frosty metal railing outside', explanation: 'direct contact between particles' },
  { type: 'conduction', correct: 'A branding iron heating the surface of wood the instant it presses against it', hint: 'a branding iron stamping a wooden sign', explanation: 'direct contact between particles' },
  { type: 'radiation', correct: 'An astronomer\'s hands feeling faint warmth from a distant star through a telescope\'s eyepiece', hint: 'starlight barely warming an observer\'s face', explanation: 'electromagnetic waves, with no contact or fluid needed' },
  { type: 'radiation', correct: 'A tanning bed warming skin using bright lamps without the lamps ever touching the body', hint: 'lamps glowing above someone lying in a tanning bed', explanation: 'electromagnetic waves, with no contact or fluid needed' },
  { type: 'radiation', correct: 'An infrared sauna warming a person\'s body using heating panels that never make contact with the skin', hint: 'glowing panels warming a person in an infrared sauna', explanation: 'electromagnetic waves, with no contact or fluid needed' },
  { type: 'radiation', correct: 'A satellite in orbit heating up on the side that faces the Sun while the shaded side stays cold', hint: 'one side of a satellite baking in direct sunlight', explanation: 'electromagnetic waves, with no contact or fluid needed' },
  { type: 'radiation', correct: 'A desert night cooling rapidly as the ground releases its stored heat outward into the clear sky', hint: 'a desert turning cold fast after sunset', explanation: 'electromagnetic waves, with no contact or fluid needed' }
];

const heatTemplates = [
  { bloom: 'Remember', gen: () => {
    const facts = [
      { q: 'What is the transfer of heat through direct contact between materials called?', correct: 'Conduction', wrongs: ['Convection', 'Radiation', 'Insulation'] },
      { q: 'What is the transfer of heat through the movement of a fluid (liquid or gas) called?', correct: 'Convection', wrongs: ['Conduction', 'Radiation', 'Friction'] },
      { q: 'What is the transfer of heat through electromagnetic waves (like sunlight) called?', correct: 'Radiation', wrongs: ['Conduction', 'Convection', 'Reflection'] },
      { q: 'What do we call a material that slows down the transfer of heat, like foam or wool?', correct: 'Insulator', wrongs: ['Conductor', 'Catalyst', 'Reflector'] },
      { q: 'What do we call a material that allows heat to transfer through it easily, like a metal?', correct: 'Conductor', wrongs: ['Insulator', 'Radiator', 'Solvent'] },
      { q: 'What do we call the state where two objects in contact have reached the same temperature and heat stops flowing between them?', correct: 'Thermal equilibrium', wrongs: ['Thermal expansion', 'Conduction', 'Insulation'] },
      { q: 'What is the SI unit of temperature used in most science formulas?', correct: 'Kelvin', wrongs: ['Fahrenheit', 'Joule', 'Calorie'] },
      { q: 'What do we call the amount of heat energy needed to raise the temperature of a substance, which depends on its mass and material?', correct: 'Specific heat', wrongs: ['Thermal equilibrium', 'Latent heat', 'Insulation'] },
      { q: 'What do we call heat energy that is absorbed or released during a change of state (like melting) without changing temperature?', correct: 'Latent heat', wrongs: ['Specific heat', 'Radiant heat', 'Kinetic heat'] },
      { q: 'What do we call the natural direction heat always flows, from hot objects to cold objects?', correct: 'From hot to cold', wrongs: ['From cold to hot', 'Equally in both directions', 'It depends on the material only'] },
      { q: 'What device is commonly used to measure temperature?', correct: 'Thermometer', wrongs: ['Barometer', 'Voltmeter', 'Calorimeter'] },
      { q: 'What do we call the process of a solid changing into a liquid due to heat?', correct: 'Melting', wrongs: ['Freezing', 'Evaporation', 'Condensation'] },
      { q: 'What do we call the process of a liquid changing into a gas due to heat?', correct: 'Evaporation', wrongs: ['Condensation', 'Freezing', 'Sublimation'] },
      { q: 'What do we call energy transferred between objects because of a temperature difference?', correct: 'Heat', wrongs: ['Temperature', 'Work', 'Pressure'] },
      { q: 'What do we call the measure of the average kinetic energy of the particles in a substance?', correct: 'Temperature', wrongs: ['Heat', 'Pressure', 'Density'] },
      { q: 'What do we call a container designed to slow down heat transfer and keep drinks hot or cold, like a thermos?', correct: 'Insulated container', wrongs: ['Conductive container', 'Radiative container', 'Convective container'] },
      { q: 'What do we call the shiny coating on some emergency blankets that reflects radiant heat back toward the body?', correct: 'Reflective coating', wrongs: ['Absorptive coating', 'Conductive coating', 'Porous coating'] },
      { q: 'What do we call materials, like metals, that tend to feel cold to the touch because they conduct heat away from your skin quickly?', correct: 'Good conductors', wrongs: ['Good insulators', 'Good radiators', 'Good absorbers'] },
      { q: 'What do we call the transfer of heat that requires no medium at all and can travel through the vacuum of space?', correct: 'Radiation', wrongs: ['Conduction', 'Convection', 'Diffusion'] },
      { q: 'What do we call the process by which darker surfaces tend to absorb more radiant heat than lighter surfaces?', correct: 'Absorption', wrongs: ['Reflection', 'Conduction', 'Convection'] },
      { q: 'What do we call it when a substance expands as its temperature increases?', correct: 'Thermal expansion', wrongs: ['Thermal contraction', 'Thermal equilibrium', 'Conduction'] },
      { q: 'What do we call it when a substance shrinks as its temperature decreases?', correct: 'Thermal contraction', wrongs: ['Thermal expansion', 'Thermal equilibrium', 'Radiation'] },
      { q: 'What do we call the process of a gas changing directly into a liquid as it cools?', correct: 'Condensation', wrongs: ['Evaporation', 'Sublimation', 'Melting'] },
      { q: 'What do we call the process of a liquid changing into a solid as it cools?', correct: 'Freezing', wrongs: ['Melting', 'Boiling', 'Condensation'] },
      { q: 'What do we call the process of a solid changing directly into a gas without becoming a liquid first?', correct: 'Sublimation', wrongs: ['Deposition', 'Evaporation', 'Melting'] },
      { q: 'What do we call the process of a gas changing directly into a solid without becoming a liquid first?', correct: 'Deposition', wrongs: ['Sublimation', 'Condensation', 'Freezing'] },
      { q: 'What is the temperature at which a substance changes from solid to liquid called?', correct: 'Melting point', wrongs: ['Boiling point', 'Freezing point', 'Flash point'] },
      { q: 'What is the temperature at which a substance changes rapidly from liquid to gas throughout its volume called?', correct: 'Boiling point', wrongs: ['Melting point', 'Dew point', 'Condensation point'] },
      { q: 'What do we call the study of heat and how it moves or transforms into other forms of energy?', correct: 'Thermodynamics', wrongs: ['Thermochemistry', 'Calorimetry', 'Mechanics'] },
      { q: 'What instrument is used to measure the amount of heat released or absorbed in a chemical or physical process?', correct: 'Calorimeter', wrongs: ['Thermometer', 'Barometer', 'Manometer'] },
      { q: 'What do we call the total kinetic and potential energy of all the particles in an object?', correct: 'Internal energy', wrongs: ['Temperature', 'Specific heat', 'Latent heat'] },
      { q: 'What do we call the layer of trapped air (or other gas) that gives many insulating materials, like double-pane windows, their insulating power?', correct: 'Trapped air pocket', wrongs: ['Vacuum seal', 'Conductive layer', 'Radiant barrier'] },
      { q: 'What do we call a vacuum-sealed, double-walled container that greatly slows heat transfer by conduction, convection, and radiation, like in a thermos?', correct: 'Vacuum flask', wrongs: ['Calorimeter', 'Heat exchanger', 'Radiator'] },
      { q: 'What do we call the process engineers use to add cooling fins to a device, increasing surface area to release heat faster?', correct: 'Heat sinking', wrongs: ['Heat trapping', 'Heat insulating', 'Heat storing'] },
      { q: 'What do we call the greenhouse-like effect where a car\'s interior heats up because sunlight enters through the glass but the resulting heat cannot easily escape?', correct: 'Greenhouse effect', wrongs: ['Convection loop', 'Thermal equilibrium', 'Heat sink effect'] },
      { q: 'What term describes a substance, like water, that needs a large amount of energy to change its temperature compared to other substances?', correct: 'High specific heat', wrongs: ['Low specific heat', 'High latent heat', 'Low thermal conductivity'] },
      { q: 'What do we call the point at which a liquid and its vapor exist in balance at a given temperature and pressure?', correct: 'Equilibrium vapor point', wrongs: ['Melting point', 'Flash point', 'Triple point'] }
    ];
    const f = choice(facts);
    const choices = shuffle([f.correct, ...f.wrongs]);
    return { prompt: f.q, type: 'mcq', choices, correct: f.correct, explanation: `${f.correct} is the correct term.` };
  }},
  { bloom: 'Understand', gen: () => {
    const scenarios = [
      { scenario: 'A metal spoon left in a hot pot becomes hot to the touch', correct: 'Conduction' },
      { scenario: 'Sunlight travels through empty space and warms the Earth', correct: 'Radiation' },
      { scenario: 'Warm water rises and cool water sinks in a boiling pot, creating currents', correct: 'Convection' },
      { scenario: 'Touching an ice cube and feeling your hand grow cold', correct: 'Conduction' },
      { scenario: 'A room warms up as hot air near a heater rises and circulates around the space', correct: 'Convection' },
      { scenario: 'Standing near a campfire and feeling its warmth without touching the flames', correct: 'Radiation' },
      { scenario: 'A car left in direct sunlight heats up inside even with the windows closed', correct: 'Radiation' },
      { scenario: 'Ocean currents circulate as warm surface water and cooler deep water exchange places', correct: 'Convection' },
      { scenario: 'A frying pan handle becomes hot after the pan sits on a lit stove burner', correct: 'Conduction' },
      { scenario: 'A hiker feels the heat of the noon sun on the back of their neck on an exposed trail', correct: 'Radiation' },
      { scenario: 'Warm attic air rises and escapes through a roof vent while cooler air is drawn in below', correct: 'Convection' },
      { scenario: 'A branding iron transfers its heat into a piece of leather the instant it touches it', correct: 'Conduction' },
      { scenario: 'A greenhouse traps radiant heat from sunlight that passes through its glass panels', correct: 'Radiation' },
      { scenario: 'Steam rises off a hot cup of cocoa and swirls through the cooler air above it', correct: 'Convection' },
      { scenario: 'A blacksmith\'s tongs slowly grow warm after gripping a glowing piece of iron', correct: 'Conduction' },
      { scenario: 'A microwave popcorn bag puffs up as heated air currents circulate and expand inside it', correct: 'Convection' },
      { scenario: 'An astronaut\'s spacesuit must block heat radiating directly from unfiltered sunlight in orbit', correct: 'Radiation' },
      { scenario: 'A cast-iron skillet stays hot for a while after being removed from the stove because heat is stored throughout the metal', correct: 'Conduction' },
      { scenario: 'A weather balloon feels the sun\'s heat directly even at high altitude where the air is thin', correct: 'Radiation' },
      { scenario: 'Cold air sinks near an open freezer door while warmer room air flows in above it', correct: 'Convection' },
      { scenario: 'A welder\'s glove slowly warms up while gripping a metal tool that was just used near a torch', correct: 'Conduction' },
      { scenario: 'A solar panel heats up on a rooftop as it absorbs energy streaming in from the Sun', correct: 'Radiation' },
      { scenario: 'A pot of chili bubbles and churns as heated liquid near the bottom rises past cooler liquid above', correct: 'Convection' },
      { scenario: 'A metal thermometer probe quickly matches the temperature of the liquid it is dipped into', correct: 'Conduction' },
      { scenario: 'A tanning bed warms the skin using lamps without ever touching the body', correct: 'Radiation' },
      { scenario: 'A radiator warms a room as heated air near it rises and cooler air sinks to take its place', correct: 'Convection' },
      { scenario: 'A camp stove\'s metal grate becomes too hot to touch moments after the burner is lit beneath it', correct: 'Conduction' },
      { scenario: 'An infrared heat lamp above a reptile tank warms the animal\'s skin without any contact', correct: 'Radiation' },
      { scenario: 'A pot lid rattles as steam and hot air currents rise and swirl beneath it while water boils', correct: 'Convection' },
      { scenario: 'A metal fork left resting in a hot casserole dish becomes warm to the touch', correct: 'Conduction' },
      { scenario: 'Distant stars are felt as faint warmth by sensitive instruments even though nothing physically connects them to Earth', correct: 'Radiation' },
      { scenario: 'A hot air furnace duct blows warm air that rises and mixes throughout a house', correct: 'Convection' },
      { scenario: 'A metal bracelet becomes uncomfortably warm after resting against sun-heated skin for a while', correct: 'Conduction' },
      { scenario: 'A microwave dish feels warm to the touch shortly after the food inside finishes heating', correct: 'Conduction' },
      { scenario: 'A weather satellite\'s solar panels warm up as they face directly toward the Sun in orbit', correct: 'Radiation' },
      { scenario: 'Warm exhaust air rises out of a clothes dryer vent while cooler air is drawn in around the machine', correct: 'Convection' }
    ];
    const s = choice(scenarios);
    const wrongs = ['Conduction', 'Convection', 'Radiation', 'Insulation'].filter(t => t !== s.correct);
    const choices = shuffle([s.correct, ...wrongs]);
    return { prompt: `"${s.scenario}" — which type of heat transfer is this?`, type: 'mcq', choices, correct: s.correct, explanation: `This describes ${s.correct.toLowerCase()}.` };
  }},
  { bloom: 'Apply', gen: () => {
    const toF = Math.random() < 0.5;
    if (toF) {
      const c = randInt(-30, 150);
      return {
        prompt: `Using F = (C × 9/5) + 32, convert ${c}°C to Fahrenheit.`,
        type: 'numeric',
        answer: round2(c * 9 / 5 + 32),
        explanation: `F = (${c} × 9/5) + 32 = ${round2(c * 9 / 5)} + 32 = ${round2(c * 9 / 5 + 32)}°F.`
      };
    }
    const f = randInt(-40, 250);
    return {
      prompt: `Using C = (F - 32) × 5/9, convert ${f}°F to Celsius.`,
      type: 'numeric',
      tolerance: 0.2,
      answer: round2((f - 32) * 5 / 9),
      explanation: `C = (${f} - 32) × 5/9 = ${round2(f - 32)} × 5/9 = ${round2((f - 32) * 5 / 9)}°C.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    let c = randInt(-30, 60);
    if (c === 0) c = 1;
    const correctF = round2(c * 9 / 5 + 32);
    const wrongF = c + 32;
    const correct = `They forgot to multiply by 9/5 first — the correct value is ${correctF}°F, not ${wrongF}°F`;
    const wrongs = ['The student is correct', 'They should have subtracted 32 instead of adding', 'Celsius and Fahrenheit are always equal'];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `A student converted ${c}°C to Fahrenheit and got ${wrongF}°F by just adding 32. What is their mistake?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `The correct formula is F = (C × 9/5) + 32 = (${c} × 9/5) + 32 = ${correctF}°F. Skipping the ×9/5 step gives the wrong answer.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const entry = choice(MATERIAL_COMPARISON_POOL);
    const correct = `${entry.conductor}, because it is a good conductor of heat`;
    const wrongs = [`${entry.insulator}, because it conducts heat better than ${entry.conductor}`, 'Both heat up at exactly the same rate', 'Neither will heat up unless placed in direct sunlight'];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `${entry.conductor} and ${entry.insulator} are ${entry.context}. Which one heats up faster, and why?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `${entry.conductor} is a good thermal conductor, so heat moves through it quickly. ${entry.insulator} is a poor conductor (an insulator), so it heats up much more slowly.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const entry = choice(HEAT_DEMO_POOL);
    const otherTypeEntries = HEAT_DEMO_POOL.filter(e => e.type !== entry.type);
    const wrongs = shuffle(otherTypeEntries.map(e => e.correct)).slice(0, 3);
    const choices = shuffle([entry.correct, ...wrongs]);
    return {
      prompt: `Which scenario best demonstrates ${entry.type} — think of ${entry.hint}?`,
      type: 'mcq',
      choices,
      correct: entry.correct,
      explanation: `${entry.type[0].toUpperCase()}${entry.type.slice(1)} is heat transfer through ${entry.explanation}.`
    };
  }}
];

// ---- Light & Sound (Waves) -----------------------------------------------------

const wavesTemplates = [
  { bloom: 'Remember', gen: () => {
    const facts = [
      { q: 'What is the distance between two consecutive wave crests called?', correct: 'Wavelength', wrongs: ['Amplitude', 'Frequency', 'Period'] },
      { q: 'What do we call the number of wave cycles that pass a point per second?', correct: 'Frequency', wrongs: ['Wavelength', 'Amplitude', 'Speed'] },
      { q: "What do we call a wave's maximum height from its resting position?", correct: 'Amplitude', wrongs: ['Wavelength', 'Frequency', 'Period'] }
    ];
    const f = choice(facts);
    const choices = shuffle([f.correct, ...f.wrongs]);
    return { prompt: f.q, type: 'mcq', choices, correct: f.correct, explanation: `${f.correct} is the correct term.` };
  }},
  { bloom: 'Understand', gen: () => {
    const amplitude = randInt(20, 40);
    const wavelengthPx = choice([80, 100, 120]);
    const diagram = simpleWaveSVG(amplitude, wavelengthPx);
    const correct = 'The distance labeled "wavelength" spans exactly one full wave cycle';
    const wrongs = [
      'The distance labeled "amplitude" spans exactly one full wave cycle',
      'The wavelength and amplitude always measure the same thing',
      'Amplitude measures how fast the wave travels'
    ];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: 'Looking at the wave diagram, which statement is true?',
      type: 'mcq',
      choices,
      correct,
      diagram,
      explanation: 'Wavelength is the length of one complete wave cycle (crest to crest), while amplitude is the height of the wave from its resting line.'
    };
  }},
  { bloom: 'Apply', gen: () => {
    const freq = randInt(2, 20), wavelength = randInt(2, 20);
    return {
      prompt: `Using wave speed = frequency × wavelength, find the speed of a wave with frequency ${freq} Hz and wavelength ${wavelength} m.`,
      type: 'numeric',
      answer: freq * wavelength,
      explanation: `Speed = frequency × wavelength = ${freq} × ${wavelength} = ${freq * wavelength} m/s.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const correct = 'Incorrect — higher frequency means higher pitch, not lower';
    const wrongs = ['Correct — higher frequency does mean lower pitch', 'Frequency has no effect on pitch', 'Pitch only depends on amplitude, not frequency'];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: 'A student claims that a sound wave with a higher frequency has a LOWER pitch. Evaluate this claim.',
      type: 'mcq',
      choices,
      correct,
      explanation: 'Pitch and frequency are directly related: higher frequency = higher pitch (like a smaller bell ringing higher than a large one).'
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const freqA = randInt(200, 800), freqB = randInt(200, 800);
    let a = freqA, b = freqB;
    while (a === b) b = randInt(200, 800);
    const correct = a > b ? `Sound A (${a} Hz) has the higher pitch` : `Sound B (${b} Hz) has the higher pitch`;
    const choices = shuffle([`Sound A (${a} Hz) has the higher pitch`, `Sound B (${b} Hz) has the higher pitch`, 'They have the same pitch', 'Frequency does not affect pitch']);
    return {
      prompt: `Sound A has a frequency of ${a} Hz. Sound B has a frequency of ${b} Hz. Which has the higher pitch?`,
      type: 'mcq',
      choices,
      correct,
      explanation: 'Higher frequency corresponds to higher pitch, so the sound with the larger frequency value has the higher pitch.'
    };
  }},
  { bloom: 'Create', gen: () => {
    const correct = 'Tightening the string, which increases its vibration frequency';
    const wrongs = ['Loosening the string, which decreases its vibration frequency', 'Making the string longer', 'Playing the string more quietly'];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: 'Which change to a guitar string would increase the pitch of the sound it makes?',
      type: 'mcq',
      choices,
      correct,
      explanation: 'Tightening a string increases its vibration frequency, which raises the pitch of the sound produced.'
    };
  }}
];

// ---- Electricity & Magnetism -------------------------------------------------

const electricityTemplates = [
  { bloom: 'Remember', gen: () => {
    const facts = [
      { q: 'What is the SI unit of electric current?', correct: 'Ampere', wrongs: ['Volt', 'Ohm', 'Watt'] },
      { q: 'What is the SI unit of voltage?', correct: 'Volt', wrongs: ['Ampere', 'Ohm', 'Joule'] },
      { q: 'What is the SI unit of electrical resistance?', correct: 'Ohm', wrongs: ['Ampere', 'Volt', 'Watt'] },
      { q: 'What is the SI unit of electrical power?', correct: 'Watt', wrongs: ['Volt', 'Ampere', 'Joule'] },
      { q: 'What do we call the flow of electric charge through a wire?', correct: 'Electric current', wrongs: ['Voltage', 'Resistance', 'Power'] },
      { q: 'What do we call the "push" or energy per charge that drives current through a circuit?', correct: 'Voltage', wrongs: ['Current', 'Resistance', 'Power'] },
      { q: 'What do we call a component specifically designed to oppose the flow of electric current in a circuit?', correct: 'Resistor', wrongs: ['Conductor', 'Capacitor', 'Inductor'] },
      { q: "What law states that V = IR, relating voltage, current, and resistance?", correct: "Ohm's law", wrongs: ["Newton's law", "Coulomb's law", "Faraday's law"] },
      { q: 'What do we call a circuit where all components are connected one after another along a single path?', correct: 'Series circuit', wrongs: ['Parallel circuit', 'Short circuit', 'Open circuit'] },
      { q: 'What do we call a circuit where components are connected along two or more separate branches?', correct: 'Parallel circuit', wrongs: ['Series circuit', 'Short circuit', 'Closed circuit'] },
      { q: 'What do we call a circuit with a break in it that stops current from flowing anywhere in the loop?', correct: 'Open circuit', wrongs: ['Closed circuit', 'Short circuit', 'Series circuit'] },
      { q: 'What do we call an unbroken circuit that allows current to flow continuously all the way around?', correct: 'Closed circuit', wrongs: ['Open circuit', 'Broken circuit', 'Dead circuit'] },
      { q: 'What do we call a low-resistance connection that accidentally bypasses part of a circuit, often causing a dangerous surge of current?', correct: 'Short circuit', wrongs: ['Open circuit', 'Series circuit', 'Ground fault'] },
      { q: 'What device is used to store electric charge and release it later in a circuit?', correct: 'Capacitor', wrongs: ['Resistor', 'Inductor', 'Transformer'] },
      { q: 'What device stores chemical energy and converts it into electrical energy to power a circuit?', correct: 'Battery', wrongs: ['Capacitor', 'Resistor', 'Generator'] },
      { q: 'What do we call a magnet whose magnetic field is created by an electric current, and can be switched on and off?', correct: 'Electromagnet', wrongs: ['Permanent magnet', 'Capacitor', 'Transformer'] },
      { q: 'What do we call the invisible region around a magnet where its magnetic force can be detected?', correct: 'Magnetic field', wrongs: ['Electric field', 'Gravitational field', 'Current field'] },
      { q: 'What are the two ends of a magnet, where its magnetic force is strongest, called?', correct: 'Poles', wrongs: ['Terminals', 'Nodes', 'Junctions'] },
      { q: 'What happens when the same poles of two magnets (like north and north) are brought close together?', correct: 'They repel each other', wrongs: ['They attract each other', 'Nothing happens', 'They cancel out completely'] },
      { q: 'What happens when opposite poles of two magnets (like north and south) are brought close together?', correct: 'They attract each other', wrongs: ['They repel each other', 'Nothing happens', 'They short-circuit'] },
      { q: 'What device converts electrical energy into mechanical motion, such as spinning a fan blade?', correct: 'Electric motor', wrongs: ['Generator', 'Capacitor', 'Transformer'] },
      { q: 'What device converts mechanical motion into electrical energy, such as in a power plant turbine?', correct: 'Generator', wrongs: ['Electric motor', 'Battery', 'Resistor'] },
      { q: 'What do we call materials, like plastic and rubber, that strongly resist the flow of electric current?', correct: 'Insulators', wrongs: ['Conductors', 'Semiconductors', 'Superconductors'] },
      { q: 'What do we call materials, like copper and silver, that allow electric current to pass through them easily?', correct: 'Conductors', wrongs: ['Insulators', 'Resistors only', 'Capacitors only'] },
      { q: 'What do we call the buildup of electric charge on the surface of an object, often caused by friction, as when rubbing a balloon on hair?', correct: 'Static electricity', wrongs: ['Current electricity', 'Magnetism', 'Induction'] },
      { q: 'What do we call the path that an electric charge or current travels along?', correct: 'Circuit', wrongs: ['Conduit', 'Grid', 'Loop wire'] },
      { q: 'What safety device automatically breaks a circuit when too much current flows through it, preventing fires?', correct: 'Circuit breaker (or fuse)', wrongs: ['Resistor', 'Capacitor', 'Transformer'] },
      { q: 'What device increases or decreases voltage in an electrical system, often used to step voltage up or down for power lines?', correct: 'Transformer', wrongs: ['Generator', 'Capacitor', 'Rectifier'] },
      { q: 'What do we call the tiny, negatively charged particles that carry electric current through a wire?', correct: 'Electrons', wrongs: ['Protons', 'Neutrons', 'Ions'] },
      { q: 'What do we call a diagram that uses standard symbols to show how components are connected in a circuit?', correct: 'Circuit diagram', wrongs: ['Flowchart', 'Blueprint', 'Topographic map'] },
      { q: 'What do we call the amount of electrical energy used or transferred per second, measured in watts?', correct: 'Electrical power', wrongs: ['Electrical current', 'Electrical charge', 'Electrical resistance'] },
      { q: 'What term describes a material, like silicon, whose ability to conduct electricity lies between that of a conductor and an insulator?', correct: 'Semiconductor', wrongs: ['Superconductor', 'Insulator', 'Dielectric'] },
      { q: 'What do we call a material that has zero electrical resistance, usually only at extremely low temperatures?', correct: 'Superconductor', wrongs: ['Semiconductor', 'Insulator', 'Conductor'] },
      { q: 'What do we call the process of generating a voltage in a wire by moving it through a magnetic field?', correct: 'Electromagnetic induction', wrongs: ['Static discharge', 'Ohmic heating', 'Thermal conduction'] },
      { q: 'What do we call the total electrical energy consumed over time, which utility companies bill in kilowatt-hours?', correct: 'Energy consumption', wrongs: ['Instantaneous power', 'Peak voltage', 'Resistance load'] },
      { q: 'What do we call a switch that automatically interrupts a circuit if it detects a ground fault, protecting people from shock near water?', correct: 'Ground fault circuit interrupter (GFCI)', wrongs: ['Circuit breaker only', 'Transformer', 'Capacitor bank'] }
    ];
    const f = choice(facts);
    const choices = shuffle([f.correct, ...f.wrongs]);
    return { prompt: f.q, type: 'mcq', choices, correct: f.correct, explanation: `${f.correct} is the correct answer.` };
  }},
  { bloom: 'Understand', gen: () => {
    const materials = [
      { material: 'copper wire', type: 'Conductor' },
      { material: 'a rubber glove', type: 'Insulator' },
      { material: 'aluminum foil', type: 'Conductor' },
      { material: 'a glass rod', type: 'Insulator' },
      { material: 'a silver necklace', type: 'Conductor' },
      { material: 'a plastic ruler', type: 'Insulator' },
      { material: 'a steel nail', type: 'Conductor' },
      { material: 'a wooden spoon', type: 'Insulator' },
      { material: 'an iron nail', type: 'Conductor' },
      { material: 'a ceramic plate', type: 'Insulator' },
      { material: 'a gold ring', type: 'Conductor' },
      { material: 'a rubber-coated wire jacket', type: 'Insulator' },
      { material: 'a brass doorknob', type: 'Conductor' },
      { material: 'a sheet of dry paper', type: 'Insulator' },
      { material: 'salt water', type: 'Conductor' },
      { material: 'an inflated rubber balloon', type: 'Insulator' },
      { material: 'a metal paperclip', type: 'Conductor' },
      { material: 'a cotton shirt', type: 'Insulator' },
      { material: 'a graphite pencil core', type: 'Conductor' },
      { material: 'a styrofoam cup', type: 'Insulator' },
      { material: 'a tin can', type: 'Conductor' },
      { material: 'a porcelain insulator cap on a power line', type: 'Insulator' },
      { material: 'liquid mercury metal', type: 'Conductor' },
      { material: 'a pocket of dry air', type: 'Insulator' },
      { material: 'a zinc-coated nail', type: 'Conductor' },
      { material: 'a rubber tire', type: 'Insulator' },
      { material: 'a nickel coin', type: 'Conductor' },
      { material: 'a wax candle', type: 'Insulator' },
      { material: 'a platinum wire', type: 'Conductor' },
      { material: 'a rubber doormat', type: 'Insulator' },
      { material: 'seawater', type: 'Conductor' },
      { material: 'a dry wooden ruler', type: 'Insulator' },
      { material: 'an aluminum soda can', type: 'Conductor' },
      { material: 'a glass window pane', type: 'Insulator' },
      { material: 'a stainless steel fork', type: 'Conductor' },
      { material: 'a plastic electrical outlet cover', type: 'Insulator' }
    ];
    const entry = choice(materials);
    const correct = entry.type;
    const wrongs = ['Conductor', 'Insulator', 'Resistor', 'Capacitor'].filter(t => t !== correct);
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Which term best describes ${entry.material} in terms of how well it lets electric current flow through it?`,
      type: 'mcq',
      choices,
      correct,
      explanation: correct === 'Conductor'
        ? `${entry.material.charAt(0).toUpperCase()}${entry.material.slice(1)} is a conductor, so electrons flow through it freely, letting current pass through easily.`
        : `${entry.material.charAt(0).toUpperCase()}${entry.material.slice(1)} is an insulator, so it strongly resists the flow of electrons and blocks current.`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const askFor = choice(['V', 'I', 'R']);
    const I = randInt(1, 10), R = randInt(2, 20);
    const V = I * R;
    if (askFor === 'V') {
      return {
        prompt: `Using Ohm's law (V = IR), find the voltage in the circuit shown, where I = ${I} A and R = ${R} Ω.`,
        type: 'numeric',
        answer: V,
        diagram: circuitSVG('?', R),
        explanation: `V = I × R = ${I} × ${R} = ${V} V.`
      };
    }
    return {
      prompt: `Using Ohm's law (V = IR), find the current in the circuit shown, where V = ${V} V and R = ${R} Ω.`,
      type: 'numeric',
      answer: I,
      diagram: circuitSVG(V, R),
      explanation: `I = V ÷ R = ${V} ÷ ${R} = ${I} A.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const I = randInt(1, 8), R = randInt(2, 10);
    const correctV = I * R;
    const wrongV = round2(I / R);
    const correct = `They divided instead of multiplied — V = IR = ${correctV} V, not ${wrongV} V`;
    const wrongs = ['The student is correct', 'They should have subtracted R from I', "Ohm's law does not apply to this circuit"];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `A student used Ohm's law and for I = ${I} A, R = ${R} Ω, calculated V = ${wrongV} V by dividing I by R. What is their mistake?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Ohm's law is V = I × R = ${I} × ${R} = ${correctV} V. Dividing instead of multiplying gives the wrong answer.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const n = randInt(2, 10);
    const device = choice(['light bulbs', 'LED lamps', 'holiday string lights', 'mini flashlight bulbs', 'nightlight bulbs', 'string-light bulbs']);
    const correct = `Wiring them in series, because the ${device} must share the same current and split the total voltage along one path`;
    const wrongs = [
      `Wiring them in parallel, because the ${device} must share the same current along one path`,
      'Both arrangements produce identical brightness',
      'Neither arrangement affects brightness'
    ];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `In a circuit with ${n} identical ${device}, which arrangement typically makes each one DIMMER: wiring them in series or in parallel?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `In series, current must pass through all ${n} ${device} one after another, splitting the available voltage across them and making each one dimmer than if wired in parallel.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const devices = [
      'toaster', 'electric kettle', 'hair dryer', 'desk lamp', 'ceiling fan', 'box fan',
      'space heater', 'phone charger', 'laptop charger', 'doorbell circuit', 'string of holiday lights',
      'flashlight', 'radio', 'electric heater', 'blender motor', 'vacuum cleaner motor',
      'washing machine motor', 'refrigerator compressor', 'microwave oven', 'toaster oven',
      'electric shaver', 'hand mixer', 'table saw motor', 'power drill motor', 'garage door opener',
      'electric griddle', 'curling iron', 'clothes iron', 'air conditioner compressor',
      'sewing machine motor', 'security camera circuit', 'smoke detector circuit', 'LED desk lamp',
      'portable speaker', 'electric toothbrush', 'car headlight circuit'
    ];
    const device = choice(devices);
    const correct = `Increasing the voltage across the ${device} while keeping its resistance the same`;
    const wrongs = [
      `Increasing the resistance of the ${device} while keeping the voltage the same`,
      `Disconnecting the ${device} from the battery`,
      `Removing a wire connected to the ${device}`
    ];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Since V = IR, which change would INCREASE the current flowing through a ${device}?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `Since I = V/R, increasing voltage across the ${device} (with resistance constant) increases current through it. Increasing resistance would instead decrease current.`
    };
  }}
];

const PHYSICS_TOPICS = [
  defineTopic('forces', 'Forces & Motion', '🏃', forcesTemplates),
  defineTopic('energy', 'Energy & Work', '⚡', energyTemplates),
  defineTopic('matter', 'Matter & States', '🧊', matterTemplates),
  defineTopic('heat', 'Heat & Thermal Energy', '🔥', heatTemplates),
  defineTopic('waves', 'Light & Sound (Waves)', '🌊', wavesTemplates),
  defineTopic('electricity', 'Electricity & Magnetism', '🔌', electricityTemplates)
];
