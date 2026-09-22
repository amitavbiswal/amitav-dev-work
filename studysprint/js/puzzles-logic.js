(function () {
  // Puzzles: logic — registerPuzzles('logic', [ ... ]);
  const INK = '#1f2937';
  // capped at about 140px tall on screen so the whole question card fits without scrolling
  const svgWrap = (w, h, inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" style="max-width:${Math.min(280, Math.round(140 * w / h))}px">${inner}</svg>`;
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.anchor || 'middle'}" font-family="Arial, Helvetica, sans-serif" font-size="${o.size || 14}" font-weight="${o.bold ? 700 : 400}" fill="${o.fill || INK}">${s}</text>`;
  const rect = (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx || 0}" fill="${o.fill || 'none'}" stroke="${o.stroke || INK}" stroke-width="${o.sw || 2}"/>`;
  const line = (x1, y1, x2, y2, o = {}) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.stroke || INK}" stroke-width="${o.sw || 2}" stroke-linecap="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;
  const circ = (x, y, r, o = {}) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${o.fill || 'none'}" stroke="${o.stroke || INK}" stroke-width="${o.sw || 2}"/>`;
  const poly = (pts, o = {}) => `<polygon points="${pts}" fill="${o.fill || 'none'}" stroke="${o.stroke || INK}" stroke-width="${o.sw || 2}" stroke-linejoin="round"/>`;
  const R = (a) => a * Math.PI / 180;

  // ---- a small stick figure (head + body + legs), arms optional ----
  function person(x, y, o = {}) { // (x, y) = feet position; height ~ 50
    const c = o.fill || '#ffffff';
    let s = circ(x, y - 42, 8, { fill: c }) + line(x, y - 34, x, y - 14) + line(x, y - 14, x - 8, y) + line(x, y - 14, x + 8, y);
    s += o.arm === 'left' ? line(x, y - 30, x - 20, y - 36) : o.arm === 'right' ? line(x, y - 30, x + 20, y - 36) : line(x - 9, y - 24, x, y - 30) + line(x + 9, y - 24, x, y - 30);
    return s;
  }

  // ---- shapes used on balance scales ----
  const COL = { r: '#ef4444', b: '#3b82f6', g: '#22c55e', y: '#facc15', o: '#fb923c', p: '#a855f7', k: '#9ca3af' };
  function item(it, x, yb) { // bottom-centre at (x, yb); width ~ 20
    const c = COL[it.col] || '#ffffff';
    if (it.k === 'c') return circ(x, yb - 9, 9, { fill: c, sw: 1.5 });
    if (it.k === 's') return rect(x - 9, yb - 18, 18, 18, { fill: c, sw: 1.5 });
    if (it.k === 't') return poly(`${x - 10},${yb} ${x + 10},${yb} ${x},${yb - 18}`, { fill: c, sw: 1.5 });
    if (it.k === 'w') return rect(x - 13, yb - 22, 26, 22, { fill: '#d1d5db', sw: 1.5, rx: 3 }) + txt(x, yb - 6, it.label, { size: 14, bold: true });
    if (it.k === 'q') return rect(x - 13, yb - 24, 26, 24, { fill: '#fde68a', sw: 1.5, rx: 3 }) + txt(x, yb - 6, '?', { size: 15, bold: true });
    return '';
  }
  const itemW = (it) => (it.k === 'w' || it.k === 'q' ? 28 : 22);
  // tilt: 1 = left pan lower, -1 = right pan lower, 0 = level
  function balance(cx, py, tilt, left, right) {
    const L = 72, a = R(tilt * 9);
    const lx = cx - L * Math.cos(a), ly = py + L * Math.sin(a);
    const rx = cx + L * Math.cos(a), ry = py - L * Math.sin(a);
    let s = line(cx, py, cx, py + 62, { sw: 3 }) + line(cx - 28, py + 62, cx + 28, py + 62, { sw: 4 });
    s += line(lx, ly, rx, ry, { sw: 4 });
    [[lx, ly, left], [rx, ry, right]].forEach(([x, y, items]) => {
      const panY = y + 36;
      s += `<path d="M ${x} ${y} L ${x - 40} ${panY} L ${x + 40} ${panY} Z" fill="none" stroke="${INK}" stroke-width="1.5"/>` + line(x - 44, panY, x + 44, panY, { sw: 3 });
      const rows = [];
      for (let i = 0; i < items.length; i += 3) rows.push(items.slice(i, i + 3));
      rows.forEach((row, ri) => {
        const w = row.reduce((t, it) => t + itemW(it), 0);
        let x0 = x - w / 2;
        row.forEach((it) => { s += item(it, x0 + itemW(it) / 2, panY - 2 - ri * 22); x0 += itemW(it); });
      });
    });
    return s + circ(cx, py, 4, { fill: INK });
  }
  const many = (n, it) => Array.from({ length: n }, () => it);

  // ---- a door (rectangle with knob) ----
  function door(x, y, w, h, label, fill) {
    return rect(x, y, w, h, { fill: fill || '#fde68a', sw: 2.5, rx: 3 }) + circ(x + w - 10, y + h / 2, 3.5, { fill: INK, sw: 1 }) + (label ? txt(x + w / 2, y + 24, label, { size: 15, bold: true }) : '');
  }
  const lines = (x, y, arr, o = {}) => arr.map((s, i) => txt(x, y + i * (o.gap || 16), s, o)).join('');

  registerPuzzles('logic', [
    { q: `On an island, <b>knights</b> always tell the truth and <b>knaves</b> always lie. Ann says: “We are both knaves.” What are Ann and her friend Ben?`,
      a: `Ann is a knave, Ben is a knight`, w: [`Ann is a knight, Ben is a knave`, `Both are knaves`, `Both are knights`],
      why: `A knight can never say “I am a knave”, so Ann is a knave. Then her statement is false, meaning they are not both knaves, so Ben must be a knight.`, bloom: 'Analyze' },
    { q: `Knights always tell the truth, knaves always lie. Ann says: “Exactly one of us is a knave.” Ben says: “Ann is a knave.” Who is who?`,
      a: `Ann is a knight, Ben is a knave`, w: [`Ann is a knave, Ben is a knight`, `Both are knights`, `Both are knaves`],
      why: `Suppose Ann were a knave. Then her claim is false, so there is not exactly one knave; since she is one, Ben must be a knave too. But then Ben&rsquo;s claim “Ann is a knave” is true, which a knave cannot say. So Ann is a knight, exactly one knave exists, and it is Ben.`, bloom: 'Analyze' },
    { q: `Knights tell the truth, knaves lie. Ann says: “Ben is a knave.” Ben says: “Ann and I are the same type.” Who is who?`,
      a: `Ann is a knight, Ben is a knave`, w: [`Ann is a knave, Ben is a knight`, `Both are knights`, `Both are knaves`],
      why: `Suppose Ann is a knave: then Ben is a knight, but a knight could not truthfully say they are the same type. So Ann is a knight, Ben is a knave, and Ben&rsquo;s “same type” claim is (rightly) false.`, bloom: 'Analyze' },
    { q: `On the Island of Knights and Knaves you ask Ann, “Are you a knight or a knave?” You don&rsquo;t hear her answer, but Ben says: “Ann said she is a knave.” What can you conclude?`,
      a: `Ben is a knave`, w: [`Ben is a knight`, `Ann is a knave`, `Ann is a knight`],
      why: `No islander can ever claim to be a knave: a knight would not lie and a knave would not tell the truth. So Ann really said “knight”, and Ben&rsquo;s report was false, which makes Ben a knave. (Ann&rsquo;s own type stays unknown.)`, bloom: 'Understand' },
    { q: `You ask an islander, “Are you a knave?” and he answers “No.” What can you conclude?`,
      a: `Nothing: a knight and a knave would both say “No”`, w: [`He is a knight`, `He is a knave`, `He is definitely lying`],
      why: `A knight truthfully says “No”. A knave, who really is a knave, lies and also says “No”. Both give the same reply, so it tells you nothing.`, bloom: 'Understand' },
    { q: `Ten islanders stand in a row. The 1st says “Exactly 1 of us is a liar,” the 2nd says “Exactly 2 of us are liars,” and so on, up to the 10th who says “Exactly 10 of us are liars.” Each person is either always honest or always lying. How many liars are there?`,
      n: 9, why: `The ten statements contradict each other, so at most one is true. If none were true, there would be 10 liars and the 10th statement would be true, a contradiction. So exactly one is true, which leaves 9 liars (and the 9th person is the honest one).`, bloom: 'Analyze' },
    { q: `Five people are in a room. Each one says: “The other four are all liars.” Each person is either always honest or always a liar. How many of them are honest?`,
      n: 1, why: `If nobody were honest, every claim “the other four are liars” would be true, a contradiction. If two were honest, each would be wrongly claiming the other honest one is a liar. Exactly one honest person works.`, bloom: 'Analyze' },
    { q: `Ann says: “Ben is lying.” Ben says: “Cy is lying.” Cy says: “Ann and Ben are both lying.” Who is telling the truth?`,
      a: `Only Ben`, w: [`Only Ann`, `Only Cy`, `Nobody`],
      why: `If Ann were truthful, Ben lies, so Cy is truthful, but Cy says Ann lies, a contradiction. So Ann lies, Ben is truthful, Cy lies. Check: Cy&rsquo;s claim is false, since Ben is not lying.`, bloom: 'Evaluate' },
    { q: `Someone smashed a vase. Exactly one of these four children is lying, and the culprit is one of them.<br>Ann: “Ben did it.” Ben: “Dan did it.” Cy: “I didn&rsquo;t do it.” Dan: “Ben is lying.”<br>Who broke the vase?`,
      a: `Ben`, w: [`Ann`, `Cy`, `Dan`],
      why: `Try each culprit and count the false statements. If Ben did it: Ann is right, Ben is wrong, Cy is right, and Dan is right (Ben is lying), so exactly one liar. Every other culprit gives two liars or more.`, bloom: 'Analyze' },
    { q: `One door leads to freedom, the other to a dungeon. One guard always tells the truth, the other always lies. You ask the guard by the left door: “Which door would the <i>other</i> guard say leads to freedom?” He points to the <b>left</b> door. Which door do you take?`,
      a: `The right door`, w: [`The left door`, `It&rsquo;s a 50–50 guess`, `You cannot tell`],
      why: `An honest guard truthfully reports what the liar would say (the wrong door); a lying guard lies about what the honest guard would say (again the wrong door). Either way the pointed-at door is the dungeon, so take the other one.`, bloom: 'Apply',
      diagram: svgWrap(250, 140,
        door(8, 14, 64, 100, 'LEFT') + door(178, 14, 64, 100, 'RIGHT') +
        person(100, 114, { arm: 'left' }) + person(160, 114) +
        txt(96, 134, 'Guard A', { size: 13 }) + txt(164, 134, 'Guard B', { size: 13 }) +
        poly('80,72 88,66 88,78', { fill: INK, sw: 1 })) },
    { q: `A single guard stands in front of two doors, one safe and one deadly. He is either always truthful or always a liar, and you don&rsquo;t know which. You may ask <b>one</b> yes/no question. Which question always lets you find the safe door?`,
      a: `“If I asked you whether the left door is safe, would you say yes?”`, w: [`“Is the left door safe?”`, `“Are you a truth-teller?”`, `“Which door would the other guard point to?”`],
      why: `A truth-teller answers honestly about what he would say. A liar would say “no” to the plain question if the door is safe, but he lies about that too, so he still says “yes”. The double lie cancels, and “yes” always means the left door is safe.`, bloom: 'Create' },
    { q: `Three boxes are labelled APPLES, ORANGES and MIXED (apples and oranges together). Every label is wrong. You may take out one fruit from one box without looking inside. Which box should you pick from to work out the contents of all three?`,
      a: `The box labelled MIXED`, w: [`The box labelled APPLES`, `The box labelled ORANGES`, `Any box works equally well`],
      why: `The “MIXED” box cannot be mixed, so it holds only one kind of fruit. Whatever you pull out tells you its contents, and since the other labels are also wrong, the last two boxes follow by elimination.`, bloom: 'Create' },
    { q: `Behind exactly one of three doors is a prize. Exactly <b>one</b> of the three signs is true. Where is the prize?`,
      a: `Door 2`, w: [`Door 1`, `Door 3`, `It cannot be determined`],
      why: `Test each door. Prize behind Door 1: signs 1 and 2 are both true. Prize behind Door 3: signs 2 and 3 are both true. Prize behind Door 2: only sign 3 is true. Only Door 2 gives exactly one true sign.`, bloom: 'Evaluate',
      diagram: svgWrap(320, 190,
        door(20, 10, 64, 84, '1') + door(128, 10, 64, 84, '2') + door(236, 10, 64, 84, '3') +
        [52, 160, 268].map((cx) => rect(cx - 50, 108, 100, 68, { fill: '#ffffff', sw: 1.5, rx: 4 })).join('') +
        lines(52, 128, ['The prize', 'is HERE.']) + lines(160, 128, ['The prize', 'is NOT here.']) + lines(268, 124, ['The prize', 'is NOT behind', 'Door 1.'])) },
    { q: `In <i>Through the Looking-Glass</i>, the Lion lies on Mondays, Tuesdays and Wednesdays and tells the truth on the other days. The Unicorn lies on Thursdays, Fridays and Saturdays and tells the truth on the other days. One day both say: “Yesterday was one of my lying days.” What day is it?`,
      a: `Thursday`, w: [`Monday`, `Wednesday`, `Sunday`],
      why: `Check the days: on Thursday the Lion (truthful) says yesterday, Wednesday, was a lying day: true. The Unicorn (lying) says Wednesday was one of <i>its</i> lying days: false, so it lies. No other day makes both statements consistent.`, bloom: 'Analyze' },
    { q: `Knights tell the truth, knaves lie. Ann says: “Ben is a knight.” Ben says: “Cy is a knave.” Cy says: “Ann and Ben are the same type.” Which is correct?`,
      a: `Ann and Ben are knaves, Cy is a knight`, w: [`Ann and Cy are knights, Ben is a knave`, `Ben and Cy are knights, Ann is a knave`, `All three are knaves`],
      why: `Whatever Ann is, saying “Ben is a knight” means she and Ben are the same type. If Ben were a knight, Cy would be a knave, yet Cy&rsquo;s claim “Ann and Ben are the same type” would be true, which a knave can&rsquo;t say. So Ben is a knave, Cy is a knight, and Ann (same type as Ben) is a knave.`, bloom: 'Analyze' },
    { q: `Ann is asked “Are you a knight or a knave?” and answers in a whisper you can&rsquo;t hear. Ben says: “Ann said she is a knight.” Cy says: “Ben is lying.” On the island, knights always tell the truth and knaves always lie. What must be true?`,
      a: `Cy is a knave`, w: [`Cy is a knight`, `Ann is a knight`, `Ben is a knave`],
      why: `Whether she is a knight or a knave, Ann would say “I am a knight”. So Ben spoke truthfully, which makes him a knight, and Cy calls a truth-teller a liar, so Cy is a knave. Ann&rsquo;s type stays unknown.`, bloom: 'Analyze' },
    { q: `You meet a stranger who is either a knight or a knave. Which single yes/no question always tells you which one he is?`,
      a: `“Is 2 + 2 equal to 4?”`, w: [`“Are you a knight?”`, `“Are you a knave?”`, `“Do you always tell the truth?”`],
      why: `You need a question whose true answer you already know. A knight says “yes” to 2 + 2 = 4 and a knave says “no”. The other questions get the same answer from both types (“yes”, “no”, “yes”).`, bloom: 'Evaluate' },
  ]);

  // person wearing an unknown (grey) hat, with a letter under the feet
  function hatPerson(x, y, label, o = {}) {
    return person(x, y, o) + poly(`${x - 9},${y - 49} ${x + 9},${y - 49} ${x},${y - 70}`, { fill: '#9ca3af', sw: 1.5 }) + txt(x, y + 18, label, { size: 15, bold: true });
  }

  registerPuzzles('logic', [
    { q: `Ann and Ben each wear a hat that is red or blue. Each can see the other&rsquo;s hat but not their own. The teacher says: “At least one of you is wearing a red hat.” She asks Ann, “Do you know the colour of your hat?” Ann answers, “No.” What colour is Ben&rsquo;s hat?`,
      a: `Red`, w: [`Blue`, `It cannot be determined`, `The same colour as Ann&rsquo;s`],
      why: `If Ben&rsquo;s hat were blue, Ann would see it and know her own must be red, because at least one is red. Since Ann does <i>not</i> know, Ben&rsquo;s hat must be red.`, bloom: 'Analyze' },
    { q: `Three wise men wear hats taken from 3 white and 2 red ones. As shown, A sees B and C, B sees only C, and C sees nobody. Asked in turn if they know their own colour, A says “No,” B says “No,” and then C says “Yes!” What colour is C&rsquo;s hat?`,
      a: `White`, w: [`Red`, `Either one, he just guessed`, `It depends on A&rsquo;s hat`],
      why: `A didn&rsquo;t know, so B and C are not both red (else A would know his own is white). B didn&rsquo;t know either; if C had been red, B would see it, realise he must be white, and answer “Yes”. So C&rsquo;s hat is white.`, bloom: 'Analyze',
      diagram: svgWrap(230, 130,
        hatPerson(30, 90, 'A', { arm: 'right' }) + hatPerson(90, 90, 'B', { arm: 'right' }) + hatPerson(150, 90, 'C', { arm: 'right' }) +
        line(186, 30, 186, 100, { sw: 6, stroke: '#6b7280' }) + txt(210, 64, 'wall', { size: 14 }) + txt(115, 124, 'everyone faces the wall', { size: 13 })) },
    { q: `Four prisoners wear hats, two white and two black (they know this). As shown, A sees B and C, B sees only C, and C and D see no one. A says “I can&rsquo;t tell my colour.” Who can now work out his own hat colour?`,
      a: `Only B`, w: [`Only A`, `Only C`, `Only D`],
      why: `If B and C had the same colour, A would see two hats of one colour and know his own is the other. Since A can&rsquo;t tell, B and C are different. B sees C&rsquo;s hat, so his own is the opposite. C and D cannot see the hat that matters to them.`, bloom: 'Analyze',
      diagram: svgWrap(230, 130,
        hatPerson(24, 90, 'A', { arm: 'right' }) + hatPerson(74, 90, 'B', { arm: 'right' }) + hatPerson(124, 90, 'C', { arm: 'right' }) +
        rect(156, 20, 12, 90, { fill: '#9ca3af', sw: 2 }) + hatPerson(204, 90, 'D') + txt(162, 124, 'wall', { size: 13 })) },
    { q: `Three children all have muddy foreheads. Each sees the others&rsquo; foreheads but not their own. The teacher says: “At least one of you has a muddy forehead.” She then asks again and again: “If you know your own forehead is muddy, step forward.” The children are perfect logicians who answer honestly. In which round do all three step forward?`,
      n: 3, why: `A lone muddy child would see no mud and step forward in round 1. With two muddy children, each waits, then reasons “the other didn&rsquo;t step forward, so I must be muddy too” and both step forward in round 2. With three, when nobody moves in round 2, each realises he must be muddy as well, so all three step forward in round 3.`, bloom: 'Analyze' },
    { q: `Ten prisoners stand in a line, all facing forward. Each wears a black or white hat and can see only the hats of the people in front. Starting from the back, each must shout out a guess of his own hat colour (everyone hears the guesses). Which plan guarantees that at least 9 of the 10 are right, whatever the hats?`,
      a: `The last prisoner says “black” if he sees an even number of black hats, else “white”; everyone else then works out his own colour`, w: [`Everyone says the colour of the hat in front of him`, `Everyone says the colour he sees most often`, `Everyone just guesses; nothing can be planned`],
      why: `The back prisoner uses his “guess” to pass on the parity (even/odd) of black hats ahead. Each next prisoner counts the hats he sees and the answers already given, and can deduce his own colour exactly. Only the first is a gamble.`, bloom: 'Create' },
    { q: `Alex tells the truth on Thursdays through Sundays and lies on Mondays, Tuesdays and Wednesdays. One day Alex says: “Tomorrow is one of my lying days.” On which day(s) could Alex have said this?`,
      a: `Sunday or Wednesday`, w: [`Sunday only`, `Wednesday only`, `Monday or Tuesday`],
      why: `On Sunday (a truthful day) tomorrow is Monday, a lying day, so the statement is true. On Wednesday (a lying day) tomorrow is Thursday, not a lying day, so the statement is false, as a liar requires. On Monday and Tuesday it would be true, which a liar cannot say.`, bloom: 'Evaluate' },
    { q: `If the day before yesterday was two days after Thursday, what day is it today?`,
      a: `Monday`, w: [`Sunday`, `Tuesday`, `Saturday`],
      why: `Two days after Thursday is Saturday, and that was the day before yesterday. So yesterday was Sunday and today is Monday.`, bloom: 'Apply' },
    { q: `Sam lies only on Thursdays and tells the truth on every other day. One day Sam says: “Yesterday I lied.” On which day(s) could this have been said?`,
      a: `Thursday or Friday`, w: [`Friday only`, `Thursday only`, `Wednesday or Thursday`],
      why: `On Friday Sam is truthful and yesterday (Thursday) really was a lying day. On Thursday Sam lies, and “yesterday I lied” is false (Wednesday was honest), as a liar requires. On other days it doesn&rsquo;t work.`, bloom: 'Evaluate' },
  ]);

  const cir = (col) => ({ k: 'c', col }), sq = (col) => ({ k: 's', col }), tri = (col) => ({ k: 't', col });

  registerPuzzles('logic', [
    { q: `Both balance scales below are perfectly level. How many triangles balance one square?`,
      n: 6, why: `One square equals 3 circles. Each circle equals 2 triangles, so 3 circles equal 3 × 2 = 6 triangles.`, bloom: 'Apply',
      diagram: svgWrap(230, 194,
        balance(115, 34, 0, [sq('b')], many(3, cir('r'))) + txt(6, 16, 'Scale 1', { size: 13, anchor: 'start' }) +
        balance(115, 128, 0, [cir('r')], many(2, tri('g'))) + txt(6, 110, 'Scale 2', { size: 13, anchor: 'start' })) },
    { q: `Two weighings are shown. Which shape is the heaviest?`,
      a: `The blue square`, w: [`The red circle`, `The green triangle`, `Can&rsquo;t be told`],
      why: `The lower pan holds the heavier object. Scale 1: the square is heavier than the circle. Scale 2: the square is heavier than the triangle. So the square beats both.`, bloom: 'Understand',
      diagram: svgWrap(230, 194,
        balance(115, 34, -1, [cir('r')], [sq('b')]) + txt(6, 16, 'Scale 1', { size: 13, anchor: 'start' }) +
        balance(115, 128, 1, [sq('b')], [tri('g')]) + txt(6, 110, 'Scale 2', { size: 13, anchor: 'start' })) },
    { q: `Nine coins look identical, but one is slightly heavier than the others. You have a two-pan balance scale (no weights). What is the smallest number of weighings that is <b>guaranteed</b> to find the heavy coin?`,
      n: 2, why: `Weigh 3 coins against 3. The heavier pan holds the heavy coin, or if they balance it is among the 3 left aside. Now you have 3 suspects: weigh 1 against 1, and the odd one out (or the one left over) is the heavy coin. Each weighing cuts the suspects to a third.`, bloom: 'Apply' },
    { q: `Eight coins look identical, but one is heavier. With a two-pan balance you want to be <b>certain</b> to find it in just 2 weighings. Which first weighing should you do?`,
      a: `3 coins against 3 coins`, w: [`4 coins against 4 coins`, `2 coins against 2 coins`, `1 coin against 1 coin`],
      why: `After the first weighing you need at most 3 suspects left, since 3 coins can be settled with one more weighing. With 3 v 3 you are left with 3 (a heavier pan) or 2 (balance). 4 v 4 leaves 4 suspects, 2 v 2 could leave 4, and 1 v 1 could leave 6.`, bloom: 'Create' },
    { q: `Using a balance scale, you can put weights on <i>either</i> pan (next to the object or on the opposite pan). What is the smallest number of weights that lets you weigh every whole number of kilograms from 1 to 40?`,
      n: 4, why: `Each weight can go on the left, the right or stay off: 3 choices. With 4 weights that is 3<sup>4</sup> = 81 combinations, enough for the range −40 … +40. The weights 1, 3, 9, 27 do it, and 3 weights can only reach up to 13.`, bloom: 'Apply' },
    { q: `The scale below is level. The left pan holds a mystery block together with a 1 kg and a 3 kg weight, and the right pan holds a 9 kg weight. How many kilograms does the block weigh?`,
      n: 5, why: `The two sides weigh the same: block + 1 + 3 = 9, so the block weighs 9 − 4 = 5 kg.`, bloom: 'Understand',
      diagram: svgWrap(230, 108, balance(115, 24, 0, [{ k: 'q' }, { k: 'w', label: '1' }, { k: 'w', label: '3' }], [{ k: 'w', label: '9' }])) },
    { q: `A shopkeeper has a two-pan balance, a bag of sugar, and only two weights: a 3 kg weight and a 5 kg weight. How can he measure out exactly 2 kg of sugar?`,
      a: `Put the 5 kg weight on one pan; put the 3 kg weight and sugar on the other, and pour until level`, w: [`Put both weights on one pan and pour sugar on the other until level`, `Put the 3 kg weight on one pan and pour sugar on the other until level`, `Put the 5 kg weight and the sugar on one pan and the 3 kg weight on the other`],
      why: `The trick is to put a weight on the same pan as the sugar: 3 + sugar = 5 gives sugar = 2 kg. The other choices produce 8 kg, 3 kg, or can never balance.`, bloom: 'Create' },
    { q: `The scale shows that 1 red ball balances 2 green cubes. If you now put <b>3 red balls</b> on the left pan and <b>5 green cubes</b> on the right pan, what happens?`,
      a: `The left pan goes down`, w: [`The right pan goes down`, `The scale stays level`, `It depends on the size of the balls`],
      why: `3 red balls weigh as much as 3 × 2 = 6 green cubes. Six cubes beat five, so the left pan sinks.`, bloom: 'Apply',
      diagram: svgWrap(230, 108, balance(115, 24, 0, [cir('r')], many(2, sq('g'))))},
    { q: `You have 10 bags of coins. Every coin should weigh 10 g, but one bag holds only forged coins, each weighing 9 g. You take 1 coin from bag 1, 2 coins from bag 2, 3 coins from bag 3, and so on up to 10 coins from bag 10, and weigh all of them together on a digital scale: it shows 543 g. Which bag holds the forged coins?`,
      n: 7, why: `There are 1 + 2 + … + 10 = 55 coins, which would weigh 550 g if all were genuine. The scale is 7 g short, and every forged coin is 1 g light, so 7 forged coins were taken: they came from bag 7.`, bloom: 'Apply' },
    { q: `Both balance scales are perfectly level. How many triangles would balance <b>4 squares</b>?`,
      n: 10, why: `From scale 1, 2 circles = 3 triangles, so 1 circle = 1.5 triangles. From scale 2, a square = 1 circle + 1 triangle = 2.5 triangles. Then 4 squares = 4 × 2.5 = 10 triangles.`, bloom: 'Apply',
      diagram: svgWrap(230, 194,
        balance(115, 34, 0, many(2, cir('r')), many(3, tri('g'))) + txt(6, 16, 'Scale 1', { size: 13, anchor: 'start' }) +
        balance(115, 128, 0, [sq('b')], [cir('r'), tri('g')]) + txt(6, 110, 'Scale 2', { size: 13, anchor: 'start' })) },
  ]);

  // ---- arrows between circular nodes ----
  function arrow(x1, y1, x2, y2, r) {
    const d = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / d, uy = (y2 - y1) / d;
    const sx = x1 + ux * r, sy = y1 + uy * r, ex = x2 - ux * r, ey = y2 - uy * r;
    const hx = ex - ux * 10, hy = ey - uy * 10, nx = -uy * 5, ny = ux * 5;
    return line(sx, sy, hx, hy, { sw: 2.5 }) + poly(`${ex},${ey} ${hx + nx},${hy + ny} ${hx - nx},${hy - ny}`, { fill: INK, sw: 1 });
  }
  const node = (x, y, label, fill) => circ(x, y, 17, { fill: fill || '#e0e7ff', sw: 2 }) + txt(x, y + 5, label, { size: 15, bold: true });
  // round table with 6 numbered seats; occupied = { seatNumber: 'Name' }
  function roundTable(occupied) {
    let s = circ(120, 128, 40, { fill: '#e5e7eb', sw: 2 });
    for (let k = 1; k <= 6; k++) {
      const a = R(-90 + (k - 1) * 60), x = 120 + 78 * Math.cos(a), y = 128 + 78 * Math.sin(a);
      s += circ(x, y, 19, { fill: occupied[k] ? '#bfdbfe' : '#ffffff', sw: 2 }) + txt(x, y + 5, String(k), { size: 15, bold: true });
      if (occupied[k]) {
        const nx = k === 1 ? x : k === 4 ? x : x, ny = k === 1 ? y - 26 : k === 4 ? y + 34 : y + 34;
        s += txt(nx, ny, occupied[k], { size: 14, bold: true });
      }
    }
    return s;
  }
  // results grid: rows/cols = team letters, res[r][c] = 'W' | 'L' | '' (diagonal)
  function resultsGrid(teams, res) {
    const cs = 42, x0 = 8, y0 = 8;
    let s = '';
    for (let i = 0; i <= teams.length; i++) for (let j = 0; j <= teams.length; j++) {
      const x = x0 + j * cs, y = y0 + i * cs;
      let fill = '#ffffff', label = '', col = INK;
      if (i === 0 && j === 0) { fill = '#f3f4f6'; }
      else if (i === 0) { fill = '#e5e7eb'; label = teams[j - 1]; }
      else if (j === 0) { fill = '#e5e7eb'; label = teams[i - 1]; }
      else if (i === j) { fill = '#d1d5db'; label = '–'; }
      else { label = res[i - 1][j - 1]; col = label === 'W' ? '#15803d' : '#b91c1c'; }
      s += rect(x, y, cs, cs, { fill, sw: 1.5 }) + (label ? txt(x + cs / 2, y + cs / 2 + 6, label, { size: 17, bold: true, fill: col }) : '');
    }
    return s;
  }
  function carPlan() {
    const seat = (x, y, l) => rect(x, y, 76, 56, { fill: '#ffffff', sw: 2, rx: 6 }) + txt(x + 38, y + 33, l, { size: 14, bold: true });
    return rect(30, 22, 170, 170, { fill: '#f3f4f6', sw: 2.5, rx: 26 }) + txt(115, 14, 'FRONT', { size: 13, bold: true }) +
      seat(42, 46, 'Driver') + seat(122, 46, 'Passenger') + seat(42, 122, 'Back left') + seat(122, 122, 'Back right');
  }

  registerPuzzles('logic', [
    { q: `Amy, Ben, Cara and Dan ran a race with no ties. Amy finished ahead of Ben, and Ben finished ahead of Cara. Dan finished somewhere between Amy and Ben. Who finished third?`,
      a: `Ben`, w: [`Amy`, `Cara`, `Dan`],
      why: `Amy is ahead of Ben, Dan is between them, and Cara is behind Ben. The order is Amy, Dan, Ben, Cara, so Ben is third.`, bloom: 'Analyze' },
    { q: `Five friends compare their heights. Ann is taller than Ben. Cat is shorter than Ben. Dan is taller than Ann. Eve is taller than Cat but shorter than Ben. Who is the <b>second shortest</b>?`,
      a: `Eve`, w: [`Cat`, `Ben`, `Ann`],
      why: `From the clues the order from tallest to shortest is Dan, Ann, Ben, Eve, Cat. So Cat is the shortest and Eve is second shortest.`, bloom: 'Analyze' },
    { q: `Sam is standing in a queue. He is the 8th person from the front and the 11th person from the back. How many people are in the queue?`,
      n: 18, why: `Add the two positions and subtract 1 because Sam is counted in both: 8 + 11 − 1 = 18.`, bloom: 'Apply' },
    { q: `In a row of people, Mia is 7th from the left and Zoe is 4th from the right. If Mia and Zoe swap places, Mia becomes 11th from the left. How many people are in the row?`,
      n: 14, why: `Mia now stands where Zoe used to stand, so Zoe was 11th from the left. She was also 4th from the right, so the row has 11 + 4 − 1 = 14 people.`, bloom: 'Apply' },
    { q: `People stand evenly spaced around a circle, numbered 1, 2, 3, … in order all the way round. Person 7 is exactly opposite person 23. How many people are in the circle?`,
      n: 32, why: `Opposite people are half the circle apart. From 7 to 23 is 16 steps, which is half the circle, so there are 2 × 16 = 32 people.`, bloom: 'Apply' },
    { q: `Five friends sit in a row of five seats, 1 to 5 from left to right. Eli sits in the middle seat. Ben sits between Ann and Eli. Cy sits at one end. Ann sits somewhere to the left of Dee. Which seating (left to right) is correct?`,
      a: `Ann, Ben, Eli, Dee, Cy`, w: [`Ann, Ben, Eli, Cy, Dee`, `Cy, Dee, Eli, Ben, Ann`, `Dee, Ann, Eli, Ben, Cy`],
      why: `Eli is in seat 3. Ben is between Ann and Eli, so Ann and Ben take seats 1 and 2 (Ann on the left as she is left of Dee). Cy is at an end, so Cy is seat 5 and Dee is seat 4.`, bloom: 'Create' },
    { q: `Six friends sit at a round table with seats numbered 1 to 6 as shown; Ann and Ben are already seated. Cy sits directly opposite Ann. Dee sits next to Cy but not next to Ben. Eve sits next to Ben. Fay takes the last seat. Who sits in seat 6?`,
      a: `Fay`, w: [`Dee`, `Eve`, `Cy`],
      why: `Cy is opposite Ann in seat 4. Dee must be next to Cy but Ben is in seat 3, so Dee is in seat 5. Eve is next to Ben, and the only free seat next to him is seat 2. That leaves Fay in seat 6.`, bloom: 'Analyze',
      diagram: svgWrap(240, 236, roundTable({ 1: 'Ann', 3: 'Ben' })) },
    { q: `Baker, Cooper, Fletcher, Miller and Smith live on different floors of a five-storey building (floor 1 is the bottom). Baker does not live on the top floor. Cooper does not live on the bottom floor. Fletcher lives on neither the top nor the bottom floor. Miller lives higher than Cooper. Smith does not live next to Fletcher (on an adjacent floor), and Fletcher does not live next to Cooper. Who lives on the 3rd floor?`,
      a: `Baker`, w: [`Cooper`, `Fletcher`, `Smith`],
      why: `Fletcher can only be on floor 2, 3 or 4. Testing each with the other clues leaves a single arrangement: Smith 1, Cooper 2, Baker 3, Fletcher 4, Miller 5. Baker is on the 3rd floor.`, bloom: 'Analyze' },
    { q: `Five runners A, B, C, D, E finish a race (no ties). An arrow X → Y means “X finishes ahead of Y”. Runners not linked by a chain of arrows may finish in either order. How many different finishing orders are possible?`,
      n: 4, why: `A and B must both finish before C, in either order (2 ways). C must finish before D and E, which can then finish in either order (2 ways). Total 2 × 2 = 4 orders.`, bloom: 'Apply',
      diagram: svgWrap(230, 190,
        arrow(38, 45, 112, 92, 17) + arrow(38, 145, 112, 98, 17) + arrow(118, 92, 192, 45, 17) + arrow(118, 98, 192, 145, 17) +
        node(30, 45, 'A') + node(30, 145, 'B') + node(115, 95, 'C') + node(200, 45, 'D') + node(200, 145, 'E')) },
    { q: `Four teams each played every other team once (no draws). The table shows the result of the team in each row against the team in each column (W = won, L = lost). Ranking the teams by number of wins, which team came second?`,
      a: `Team B`, w: [`Team A`, `Team C`, `Team D`],
      why: `Count the W&rsquo;s in each row: A has 3, B has 2, C has 0 and D has 1. So B has the second-most wins.`, bloom: 'Understand',
      diagram: svgWrap(226, 226, resultsGrid(['A', 'B', 'C', 'D'], [['', 'W', 'W', 'W'], ['L', '', 'W', 'W'], ['L', 'L', '', 'L'], ['L', 'L', 'W', '']])) },
    { q: `Ann, Ben and Cy finished a race in three different places. Ann did not win. Ben did not finish last. Cy did not finish second. Ann finished ahead of Cy. Who finished second?`,
      a: `Ann`, w: [`Ben`, `Cy`, `It can&rsquo;t be worked out`],
      why: `The first three clues allow only two orders: Ben, Ann, Cy or Cy, Ben, Ann. The last clue (Ann ahead of Cy) rules out the second, so the order is Ben, Ann, Cy.`, bloom: 'Analyze' },
    { q: `Five people stand in a queue. Ola is last. Kai is neither first nor last. Lin stands immediately behind Kai. Mo is ahead of Nia, and Mo and Nia are not next to each other. Which queue order (front to back) fits all the clues?`,
      a: `Mo, Kai, Lin, Nia, Ola`, w: [`Kai, Lin, Mo, Nia, Ola`, `Mo, Nia, Kai, Lin, Ola`, `Mo, Lin, Kai, Nia, Ola`],
      why: `Ola is 5th, so Kai is 2nd or 3rd. If Kai were 3rd, Lin would be 4th, and Mo and Nia would fill places 1 and 2, next to each other, which is not allowed. So Kai is 2nd, Lin 3rd, and the order is Mo, Kai, Lin, Nia, Ola. The other options put Kai first, put Mo and Nia side by side, or put Lin in front of Kai.`, bloom: 'Create' },
    { q: `Four runners will run the four legs of a relay, in order. Ben does not run the last leg. Ann runs the leg immediately before Cy. Dee runs before Ann. Ben runs before Dee. Which running order (first to last) fits all the clues?`,
      a: `Ben, Dee, Ann, Cy`, w: [`Dee, Ben, Ann, Cy`, `Dee, Ann, Cy, Ben`, `Ben, Ann, Cy, Dee`],
      why: `Ann and Cy run back to back. Dee runs before Ann and Ben runs before Dee, so Ben, Dee, Ann, Cy fits. Each other option breaks a clue: the first has Dee before Ben, the second has Ben last, the third has Dee after Ann.`, bloom: 'Create' },
    { q: `Four friends ride in a car with seats as shown. Cy sits in the front row. Ben sits directly behind Cy. Ann does not sit next to Ben (in the same row). Ann is not the driver. Which plan fits all the clues? (Listed as: driver, passenger, back left, back right.)`,
      a: `Cy, Ann, Ben, Dee`, w: [`Ann, Cy, Dee, Ben`, `Cy, Dee, Ben, Ann`, `Dee, Cy, Ann, Ben`],
      why: `Ben is directly behind Cy, so Cy is in the front and Ben is behind him. If Cy sat in the passenger seat, Ben would be back right, Ann couldn&rsquo;t sit back left, and would have to drive, which is forbidden. So Cy drives, Ben is back left, Ann takes the passenger seat and Dee the back right.`, bloom: 'Create',
      diagram: svgWrap(230, 200, carPlan()) },
  ]);

  // elimination grid: rows (names) x cols (things); xs = list of [row, col] to cross out
  function markGrid(rows, cols, xs) {
    const cs = 40, x0 = 10, y0 = 10;
    let s = '';
    for (let i = 0; i <= rows.length; i++) for (let j = 0; j <= cols.length; j++) {
      const x = x0 + j * cs, y = y0 + i * cs, head = i === 0 || j === 0;
      s += rect(x, y, cs, cs, { fill: head ? '#e5e7eb' : '#ffffff', sw: 1.5 });
      if (i === 0 && j > 0) s += txt(x + cs / 2, y + 25, cols[j - 1], { size: 13, bold: true });
      if (j === 0 && i > 0) s += txt(x + cs / 2, y + 25, rows[i - 1], { size: 13, bold: true });
    }
    xs.forEach(([r, c]) => {
      const x = x0 + (c + 1) * cs, y = y0 + (r + 1) * cs;
      s += line(x + 10, y + 10, x + cs - 10, y + cs - 10, { stroke: '#dc2626', sw: 3 }) + line(x + cs - 10, y + 10, x + 10, y + cs - 10, { stroke: '#dc2626', sw: 3 });
    });
    return s;
  }
  function house(x, col, label) {
    return poly(`${x - 4},44 ${x + 33},12 ${x + 70},44`, { fill: '#9ca3af', sw: 2 }) + rect(x, 44, 66, 46, { fill: col, sw: 2 }) + rect(x + 24, 60, 18, 30, { fill: '#ffffff', sw: 1.5 }) + txt(x + 33, 110, label, { size: 14, bold: true });
  }

  registerPuzzles('logic', [
    { q: `Ann, Ben and Cy each own one pet: a cat, a dog or a fish. Ann is allergic to fur, so she owns neither the cat nor the dog. Ben is afraid of dogs and does not own one. Who owns the dog?`,
      a: `Cy`, w: [`Ann`, `Ben`, `It can&rsquo;t be worked out`],
      why: `Ann can&rsquo;t have fur, so she has the fish. Ben doesn&rsquo;t have the dog, and the fish is taken, so Ben has the cat. That leaves the dog for Cy.`, bloom: 'Analyze' },
    { q: `Ann, Ben and Cy each eat a different fruit at break: an apple, a banana or an orange. Ann eats either the apple or the banana. Ben does not eat the banana. Cy eats neither the orange nor the apple. Who eats the orange?`,
      a: `Ben`, w: [`Ann`, `Cy`, `Either Ann or Ben`],
      why: `Cy has neither orange nor apple, so Cy has the banana. Ann then can&rsquo;t have the banana, so she has the apple, and Ben is left with the orange.`, bloom: 'Analyze' },
    { q: `Ann, Ben, Cy and Dee each play a different instrument: piano, violin, drums or flute. Ann plays neither the piano nor the drums. Ben plays either the piano or the drums, but not the drums. Cy plays neither the flute nor the piano. Dee plays neither the violin nor the drums. Which assignment fits all the clues?`,
      a: `Ann violin, Ben piano, Cy drums, Dee flute`, w: [`Ann flute, Ben drums, Cy violin, Dee piano`, `Ann violin, Ben piano, Cy flute, Dee drums`, `Ann piano, Ben drums, Cy violin, Dee flute`],
      why: `Ben plays the piano (piano or drums, but not drums). Dee can&rsquo;t play violin, drums or the taken piano, so Dee plays the flute. Ann can&rsquo;t play piano or drums, and the flute is taken, so Ann plays the violin. Cy is left with the drums.`, bloom: 'Create' },
    { q: `Four friends each own a different pet: a cat, a dog, a fish or a bird. The grid shows what is already known (a red cross means “does not own”). Two more clues: Ann does not own the fish, and Dee does not own the cat. Who owns the bird?`,
      a: `Ann`, w: [`Ben`, `Cy`, `Dee`],
      why: `Ann is crossed out for cat and dog, and now also fish, so Ann has the bird. (Check the rest: Cy has the dog, Ben the cat and Dee the fish.)`, bloom: 'Analyze',
      diagram: svgWrap(220, 220, markGrid(['Ann', 'Ben', 'Cy', 'Dee'], ['Cat', 'Dog', 'Fish', 'Bird'], [[0, 0], [0, 1], [1, 2], [2, 0], [2, 3], [3, 1]])) },
    { q: `Kim, Lee and Max have three different jobs: chef, pilot and nurse. Each drinks something different: tea, coffee or milk. The pilot drinks coffee. The nurse drinks tea. Kim is not the pilot and does not drink tea. Lee does not drink coffee. Who is the pilot?`,
      a: `Max`, w: [`Kim`, `Lee`, `It can&rsquo;t be worked out`],
      why: `The nurse drinks tea, so Kim (no tea) is not the nurse, and is not the pilot: Kim is the chef. Lee doesn&rsquo;t drink coffee, so Lee isn&rsquo;t the pilot: Lee is the nurse. That leaves Max as the pilot.`, bloom: 'Analyze' },
    { q: `Ana, Bo, Cy and Di each have a different pet (cat, dog, parrot, fish) and play a different sport (tennis, golf, judo, swimming). The tennis player owns the dog. The golfer owns the parrot. Cy plays neither tennis nor golf. Bo owns the fish. Di does not play tennis. The swimmer does not own the fish. Which sport does the <b>cat&rsquo;s owner</b> play?`,
      a: `Swimming`, w: [`Tennis`, `Golf`, `Judo`],
      why: `Bo has the fish, so Bo plays neither tennis (dog) nor golf (parrot); Cy also plays neither. So Ana and Di take tennis and golf, and Di isn&rsquo;t tennis: Di golf (parrot), Ana tennis (dog). Cy keeps the cat. The swimmer can&rsquo;t own the fish, so Bo does judo and Cy swims.`, bloom: 'Analyze' },
    { q: `Ann, Ben and Cy own a cat, a dog and a bird, one each. So far we know that Ann does not own the dog. Which <b>one</b> extra clue is enough to work out who owns which pet?`,
      a: `Ben owns the bird.`, w: [`Cy does not own the dog.`, `Ann does not own the cat.`, `Ben does not own the cat.`],
      why: `“Ben owns the bird” leaves the cat and dog for Ann and Cy, and Ann can&rsquo;t have the dog, so it is settled. Each of the other clues still leaves at least two possible arrangements.`, bloom: 'Evaluate' },
    { q: `Ann, Ben and Cy were near the biscuit tin. One of them ate the last biscuit. Ann says: “Ben ate it.” Ben says: “Ann is lying.” Cy says: “I didn&rsquo;t eat it.” Exactly one of the three is telling the truth. Who ate the biscuit?`,
      a: `Cy`, w: [`Ann`, `Ben`, `It can&rsquo;t be worked out`],
      why: `Ann and Ben contradict each other, so exactly one of them is truthful, which means Cy is lying: Cy ate the biscuit. (Check: if Ann or Ben were the culprit, two statements would be true.)`, bloom: 'Evaluate' },
    { q: `Four friends each wear a different T-shirt colour (red, blue, green or yellow). Ann is not in red. Ben wears blue or green. Cy wears neither yellow nor blue, and is not in red. Dee wears neither green nor blue. Which assignment fits all the clues?`,
      a: `Ann yellow, Ben blue, Cy green, Dee red`, w: [`Ann blue, Ben green, Cy red, Dee yellow`, `Ann red, Ben blue, Cy green, Dee yellow`, `Ann green, Ben blue, Cy yellow, Dee red`],
      why: `Cy is not yellow, blue or red, so Cy is in green. Ben then wears blue. Dee can&rsquo;t wear green or blue, and Ann can&rsquo;t wear red, so Ann wears yellow and Dee red. Each other option breaks one clue.`, bloom: 'Create' },
    { q: `Three houses stand in a row, painted red, blue and green (in some order). Their owners keep different pets (cat, dog, fish) and drink different drinks (tea, milk, juice). The green house is at the left end. The red house is immediately left of the blue house. The dog&rsquo;s owner drinks tea. Milk is drunk in the middle house. The dog lives in the house immediately to the right of the cat. Which colour is the house with the fish?`,
      a: `Green`, w: [`Red`, `Blue`, `It can&rsquo;t be worked out`],
      why: `Green is on the left, then red in the middle, then blue on the right. The dog&rsquo;s owner drinks tea, so the dog isn&rsquo;t in the middle house (milk), and it can&rsquo;t be at the left end (it must be right of the cat). So the dog is in the blue house, the cat in the red house, and the fish in the green house.`, bloom: 'Analyze' },
    { q: `Houses (left to right): red, blue, green. Pets: cat, dog, fish. Drinks: tea, milk, juice. Each is used once. The dog&rsquo;s owner drinks tea. The dog is right of the cat. The tea drinker is left of the milk drinker. Which pet is in the green house?`,
      a: `The fish`, w: [`The cat`, `The dog`, `It can&rsquo;t be worked out`],
      why: `The dog owner drinks tea, and the tea drinker is left of the milk drinker, so the dog isn&rsquo;t in the green house. The dog is also right of the cat, so it isn&rsquo;t in the red house: the dog is in the blue house, the cat in red, and the fish in green.`, bloom: 'Analyze',
      diagram: svgWrap(230, 118, house(6, '#ef4444', 'red') + house(82, '#3b82f6', 'blue') + house(158, '#22c55e', 'green')) },
    { q: `Three houses stand in a row, painted red, blue and green. Their owners have a cat, a dog and a fish (one each) and drink tea, milk or juice (one each). The green house is at the left end. The cat lives in the red house. The fish is not in the blue house. The tea drinker lives next to the fish. The juice drinker lives in the blue house. Which pet lives in the blue house?`,
      a: `The dog`, w: [`The cat`, `The fish`, `It can&rsquo;t be worked out`],
      why: `The cat is in the red house and the fish isn&rsquo;t in blue, so the fish is in the green house and the dog in the blue one. (The full solution: green = fish + milk, red = cat + tea, blue = dog + juice, and the tea drinker does sit next to the fish.)`, bloom: 'Analyze' },
    { q: `Three houses stand in a row, painted red, blue and green. Their owners have a cat, a dog and a fish (one each) and drink tea, milk or juice (one each). The green house is at the left end. The cat lives in the red house. Milk is drunk in the middle house. The owner of the red house drinks juice. The tea drinker lives next to the fish. What colour is the middle house?`,
      a: `Blue`, w: [`Red`, `Green`, `It can&rsquo;t be worked out`],
      why: `The red-house owner drinks juice and milk is in the middle, so red is not in the middle: it must be at the right end (green is on the left). That makes the middle house blue.`, bloom: 'Analyze' },
  ]);

  function wasonCards() {
    return ['E', 'K', '4', '7'].map((c, i) => rect(6 + i * 56, 20, 50, 70, { fill: '#fef3c7', sw: 2.5, rx: 6 }) + txt(31 + i * 56, 65, c, { size: 28, bold: true })).join('');
  }
  function vennDiagram() {
    const dot = (x, y, name) => txt(x, y - 8, name, { size: 14, bold: true }) + circ(x, y, 3.5, { fill: INK, sw: 1 });
    return rect(4, 4, 232, 162, { sw: 2 }) + circ(88, 80, 52, { fill: 'rgba(59,130,246,0.18)', sw: 2.5 }) + circ(152, 80, 52, { fill: 'rgba(239,68,68,0.18)', sw: 2.5 }) +
      txt(58, 22, 'Music', { size: 14, bold: true }) + txt(182, 22, 'Swimming', { size: 14, bold: true }) +
      dot(60, 88, 'Ana') + dot(120, 88, 'Bo') + dot(180, 88, 'Cy') + dot(120, 152, 'Dee');
  }

  registerPuzzles('logic', [
    { q: `All bloops are razzies. All razzies are lazzies. Which statement must be true?`,
      a: `All bloops are lazzies`, w: [`All lazzies are bloops`, `All razzies are bloops`, `No bloop is a lazzy`],
      why: `Follow the chain: every bloop is a razzy, and every razzy is a lazzy, so every bloop is a lazzy. The chain doesn&rsquo;t work backwards, so “all lazzies are bloops” need not be true.`, bloom: 'Understand' },
    { q: `Lewis Carroll&rsquo;s puzzle: “No ducks waltz. No officers ever decline to waltz. All my poultry are ducks.” What follows from these three statements?`,
      a: `None of my poultry are officers`, w: [`All officers are ducks`, `Some officers are poultry`, `All ducks are my poultry`],
      why: `Poultry are ducks, and ducks don&rsquo;t waltz. Officers always waltz. So nothing that is my poultry can be an officer.`, bloom: 'Analyze' },
    { q: `Lewis Carroll&rsquo;s puzzle: “Babies are illogical. Nobody is despised who can manage a crocodile. Illogical persons are despised.” Which conclusion follows?`,
      a: `Babies cannot manage crocodiles`, w: [`Babies can manage crocodiles`, `Everyone who can manage a crocodile is illogical`, `Everyone who is despised is a baby`],
      why: `Babies are illogical, and illogical persons are despised, so babies are despised. But nobody who can manage a crocodile is despised, so a baby cannot manage a crocodile.`, bloom: 'Analyze' },
    { q: `Some wugs are blicks. All blicks are zorps. Which statement must be true?`,
      a: `Some wugs are zorps`, w: [`All wugs are zorps`, `Some zorps are not blicks`, `No wug is a zorp`],
      why: `Take one of those wugs that is a blick: since every blick is a zorp, that wug is a zorp. So at least some wugs are zorps. We can&rsquo;t say all wugs are, or that any zorp fails to be a blick.`, bloom: 'Analyze' },
    { q: `“If it rains, the match is cancelled.” You learn that the match was <b>not</b> cancelled. What can you conclude for certain?`,
      a: `It did not rain`, w: [`It rained`, `It might have rained`, `The match will be played next week`],
      why: `If it had rained, the match would have been cancelled. It wasn&rsquo;t cancelled, so it can&rsquo;t have rained. (This reasoning is called modus tollens.)`, bloom: 'Understand' },
    { q: `“If a student studies, they pass the test.” Sam passed the test. Which conclusion is justified?`,
      a: `None: Sam may or may not have studied`, w: [`Sam studied`, `Sam did not study`, `Sam is very clever`],
      why: `The rule says studying leads to passing, not that passing needs studying. Sam may have passed some other way, so we can&rsquo;t conclude anything about studying. (Mixing this up is the fallacy of “affirming the consequent”.)`, bloom: 'Evaluate' },
    { q: `Four cards each have a letter on one side and a number on the other. You see: E, K, 4, 7. The rule is: “If a card has a vowel on one side, then it has an even number on the other side.” Which cards must you turn over to test whether the rule is broken?`,
      a: `E and 7`, w: [`E and 4`, `E only`, `E, 4 and 7`],
      why: `This is the Wason selection task. E must be turned (its back must be even). 7 must be turned (if its back were a vowel, the rule would fail). K and 4 can&rsquo;t break the rule whatever is on their backs, since the rule doesn&rsquo;t say what non-vowels or even numbers must have.`, bloom: 'Evaluate',
      diagram: svgWrap(230, 110, wasonCards()) },
    { q: `In the diagram, the left circle holds the people who play music and the right circle holds the people who swim. Which statement is true?`,
      a: `Somebody both plays music and swims`, w: [`Everyone who swims also plays music`, `Nobody swims`, `Dee plays music`],
      why: `Bo sits in the overlap of the two circles, so Bo plays music and swims. Cy swims but doesn&rsquo;t play music, Ana plays music but doesn&rsquo;t swim, and Dee is in neither circle.`, bloom: 'Understand',
      diagram: svgWrap(240, 170, vennDiagram()) },
    { q: `Some A are B, and some B are C. Does it follow that some A are C?`,
      a: `No: the B&rsquo;s that are A may be different from the B&rsquo;s that are C`, w: [`Yes, always`, `Yes, because both A and C overlap with B`, `Only if there are more A than C`],
      why: `For example, some cats are pets and some pets are fish, yet no cat is a fish. The pets that are cats need not be the pets that are fish. So the link fails.`, bloom: 'Evaluate' },
    { q: `Every student in the chess club also plays an instrument. Nobody who plays an instrument is ever late to rehearsal. Nick is in the chess club. Which statement must be true?`,
      a: `Nick is never late to rehearsal`, w: [`Nick is sometimes late to rehearsal`, `Everyone who is never late is in the chess club`, `Nick plays the piano`],
      why: `Nick is in the club, so he plays an instrument, and instrument players are never late. So Nick is never late. Nothing tells us which instrument, or that all punctual people are in the club.`, bloom: 'Understand' },
    { q: `Which statement is the <b>contrapositive</b> of “If a shape is a square, then it has four sides”?`,
      a: `If a shape does not have four sides, then it is not a square`, w: [`If a shape has four sides, then it is a square`, `If a shape is not a square, then it does not have four sides`, `If a shape is a square, then it does not have four sides`],
      why: `The contrapositive flips the “if” and “then” parts and negates both. It always has the same truth as the original. The converse (“four sides so a square”) and the inverse (“not a square so not four sides”) are different statements, and both are false for rectangles.`, bloom: 'Understand' },
    { q: `Read the four statements. (a) Exactly one of these four statements is false. (b) Exactly two of these four statements are false. (c) Exactly three of these four statements are false. (d) All four of these statements are false. Which one statement is true?`,
      a: `Statement (c)`, w: [`Statement (a)`, `Statement (b)`, `Statement (d)`],
      why: `No two statements can be true together, since they give different numbers of false statements. If none were true, (d) would be true, a contradiction. So exactly one is true, meaning exactly three are false. That makes (c) the true one.`, bloom: 'Evaluate' },
    { q: `Three statements are written on a card. (1) “Exactly one of statements 2 and 3 is true.” (2) “Statement 1 is false.” (3) “Statement 2 is false.” Which statement is <b>false</b>?`,
      a: `Statement 2`, w: [`Statement 1`, `Statement 3`, `None: they are all true`],
      why: `Suppose statement 1 is false; then 2 (“1 is false”) is true and 3 is false, so exactly one of 2 and 3 is true, making 1 true after all: a contradiction. So 1 is true, hence 2 is false, and then 3 (“2 is false”) is true. Exactly one of 2 and 3 is true, as 1 says.`, bloom: 'Evaluate' },
    { q: `I&rsquo;m thinking of a whole number from 1 to 10. Three claims: A: “It is even.” B: “It is a multiple of 5.” C: “It is greater than 7.” Exactly two of the claims are true, and one is false. What is the number?`,
      n: 8, why: `Try each pair as the true ones. Even and a multiple of 5 means 10, but 10 is also greater than 7, making all three true. Multiple of 5 and greater than 7 means 10 again. Even and greater than 7, but not a multiple of 5, gives 8 (and not 10).`, bloom: 'Evaluate' },
    { q: `Ann, Ben, Cy and Dan are suspects and exactly one of them did it. Ann: “I didn&rsquo;t do it.” Ben: “Ann did it.” Cy: “Ben did it.” Dan: “I didn&rsquo;t do it.” Exactly <b>one</b> of these four statements is true. Who did it?`,
      a: `Dan`, w: [`Ann`, `Ben`, `Cy`],
      why: `Try each culprit and count true statements. If Ann did it: Ben and Dan are truthful (2). If Ben: Ann, Cy and Dan (3). If Cy: Ann and Dan (2). If Dan did it: only Ann speaks the truth (1). So Dan is the culprit.`, bloom: 'Evaluate' },
    { q: `The sentence below is written on a blank card. <br><b>“This sentence is false.”</b><br>What is the best description of it?`,
      a: `It can be neither true nor false without contradicting itself (the liar paradox)`, w: [`It is simply true`, `It is simply false`, `It is true on some days and false on others`],
      why: `If it is true, then what it says (that it is false) must hold, so it&rsquo;s false. If it is false, then it&rsquo;s not the case that it is false, so it is true. Either way we contradict ourselves: this is the famous liar paradox.`, bloom: 'Understand' },
    { q: `A village barber shaves <b>every man who does not shave himself</b>, and only those men. Does the barber shave himself?`,
      a: `Neither answer works: such a barber cannot exist`, w: [`Yes, he shaves himself`, `No, he doesn&rsquo;t shave himself`, `Yes on some days, no on others`],
      why: `If he shaves himself, then he breaks “shaves only men who do not shave themselves”. If he doesn&rsquo;t, then he must shave himself (he shaves everyone who doesn&rsquo;t). Both lead to a contradiction, so no such barber exists. This is Russell&rsquo;s barber paradox.`, bloom: 'Evaluate' },
    { q: `In a running race, you overtake the person who is in <b>2nd place</b>. What place are you in now?`,
      a: `2nd`, w: [`1st`, `3rd`, `It depends on how fast you go`],
      why: `You take the place of the runner you pass, who was second. The runner you passed is now 3rd, and you are 2nd. Only the leader is still ahead of you.`, bloom: 'Understand' },
  ]);

  // NEXT_BATCH
})();
