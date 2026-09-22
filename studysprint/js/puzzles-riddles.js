(function () {
  // Puzzles: riddles — registerPuzzles('riddles', [ ... ]);

  // ---------- small SVG helpers (all colours hard-coded; shown on a white panel) ----------
  const INK = '#1f2937';
  const FONT = 'font-family="Arial, Helvetica, sans-serif"';
  function svg(w, h, inner) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" role="img">' + inner + '</svg>';
  }
  function text(x, y, s, size, fill, weight) {
    return '<text x="' + x + '" y="' + y + '" ' + FONT + ' font-size="' + size + '" font-weight="' + (weight || 'bold') +
      '" fill="' + (fill || INK) + '" text-anchor="middle">' + s + '</text>';
  }
  function frame(w, h) {
    return '<rect x="6" y="6" width="' + (w - 12) + '" height="' + (h - 12) + '" rx="10" fill="#ffffff" stroke="' + INK + '" stroke-width="2.5"/>';
  }
  // words stacked on separate lines inside a frame (rebus)
  function stacked(lines, size) {
    const h = 40 + lines.length * (size + 22);
    let inner = frame(320, h);
    lines.forEach(function (ln, i) {
      inner += text(160, 30 + size + i * (size + 22), ln, size);
    });
    return svg(320, h, inner);
  }
  // a row of boxes holding single letters; the last one can be a highlighted "?"
  function letterRow(letters, boxW) {
    // long sequences wrap onto two lines so the boxes (and letters) stay big
    const perRow = letters.length > 8 ? Math.ceil(letters.length / 2) : letters.length;
    const rows = [];
    for (let i = 0; i < letters.length; i += perRow) rows.push(letters.slice(i, i + perRow));
    const bw = boxW ? Math.max(boxW, Math.floor(300 / Math.max(perRow, 6))) : Math.floor(300 / perRow);
    const bh = 44;
    let inner = '';
    rows.forEach(function (row, r) {
      const x0 = (320 - bw * row.length) / 2;
      const y = 18 + r * (bh + 12);
      row.forEach(function (ch, i) {
        const q = ch === '?';
        inner += '<rect x="' + (x0 + i * bw + 2) + '" y="' + y + '" width="' + (bw - 4) + '" height="' + bh + '" rx="5" fill="' + (q ? '#fde68a' : '#ffffff') + '" stroke="' + INK + '" stroke-width="2"/>';
        inner += text(x0 + i * bw + bw / 2, y + bh / 2 + 8, ch, 22, q ? '#b45309' : INK);
      });
    });
    return svg(320, 36 + rows.length * bh + (rows.length - 1) * 12, inner);
  }
  // analogue clock face
  function clock(cx, cy, r, hour, min) {
    let s = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#ffffff" stroke="' + INK + '" stroke-width="3"/>';
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      const x1 = cx + Math.sin(a) * (r - 4), y1 = cy - Math.cos(a) * (r - 4);
      const x2 = cx + Math.sin(a) * (r - (i % 3 === 0 ? 12 : 8)), y2 = cy - Math.cos(a) * (r - (i % 3 === 0 ? 12 : 8));
      s += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + INK + '" stroke-width="2"/>';
    }
    const ha = ((hour % 12) + min / 60) * Math.PI / 6, ma = min * Math.PI / 30;
    s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + Math.sin(ha) * r * 0.5).toFixed(1) + '" y2="' + (cy - Math.cos(ha) * r * 0.5).toFixed(1) + '" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>';
    s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + Math.sin(ma) * r * 0.78).toFixed(1) + '" y2="' + (cy - Math.cos(ma) * r * 0.78).toFixed(1) + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="3.5" fill="' + INK + '"/>';
    return s;
  }

  // ---------- batch 1: famous traditional riddles ----------
  registerPuzzles('riddles', [
    {
      q: 'I have keys, but they open no locks. I have hammers and strings hidden inside me. What am I?',
      a: 'A piano', w: ['A guitar', 'A harp', 'A drum'],
      why: 'Piano keys move little hammers that strike strings: the classic "keys but no locks" riddle. A guitar and a harp have strings but no keys or hammers, and a drum has neither.',
      bloom: 'Analyze'
    },
    {
      q: 'The more of me you take, the more of me you leave behind. What am I?',
      a: 'Footsteps', w: ['Money', 'Time', 'Breaths'],
      why: 'Every step you take leaves another footstep behind you. The riddle plays on the word "take": you take steps, and you leave them behind.',
      bloom: 'Understand'
    },
    {
      q: 'What gets wetter and wetter the more it dries?',
      a: 'A towel', w: ['A sponge', 'A raincoat', 'A hair dryer'],
      why: 'A towel dries things by soaking up water, so the more it dries, the wetter it becomes.',
      bloom: 'Understand'
    },
    {
      q: 'I have two hands but cannot clap, a face but cannot smile, and I hang on the wall. What am I?',
      a: 'A clock', w: ['A scarecrow', 'A mirror', 'A calendar'],
      why: 'A clock has an hour hand and a minute hand and a "face", and it hangs on the wall. A scarecrow does not hang on a wall, and neither a mirror nor a calendar has hands.',
      bloom: 'Analyze'
    },
    {
      q: 'I have a neck but no head, and I wear a cap. I hold your drink, but I am not a cup. What am I?',
      a: 'A bottle', w: ['A shirt', 'A giraffe', 'A lamp'],
      why: 'A bottle has a neck, and its cap sits on the top where a head would be. A giraffe has a head, and a shirt or lamp does not wear a cap or hold a drink.',
      bloom: 'Analyze'
    },
    {
      q: 'What goes up every year, but never comes back down?',
      a: 'Your age', w: ['A balloon', 'A rocket', 'A kite'],
      why: 'Your age only ever increases. A balloon, a rocket and a kite all come back down eventually.',
      bloom: 'Understand'
    },
    {
      q: 'The Sphinx asked: "What walks on four legs in the morning, two legs at noon, and three legs in the evening?" What is the answer?',
      a: 'A human being', w: ['A dog', 'A spider', 'A table'],
      why: 'Morning is babyhood (crawling on all fours), noon is adulthood (walking on two legs), and evening is old age (two legs plus a walking stick). Oedipus solved this riddle of the Sphinx.',
      bloom: 'Understand'
    },
    {
      q: 'I speak without a mouth and hear without ears. I only ever repeat what you shout, and I live in canyons and empty halls. What am I?',
      a: 'An echo', w: ['A parrot', 'A radio', 'A ghost'],
      why: 'An echo is your own sound bouncing back off a wall or a cliff. It "speaks" and "hears" without a mouth or ears.',
      bloom: 'Understand'
    },
    {
      q: 'What can travel all around the world while staying stuck in one corner?',
      a: 'A postage stamp', w: ['A compass', 'A suitcase', 'A passport'],
      why: 'A stamp sits in the corner of an envelope, and the envelope carries it across the world without it ever leaving its corner.',
      bloom: 'Understand'
    },
    {
      q: 'What kind of room has no doors and no windows?',
      a: 'A mushroom', w: ['A cellar', 'A closet', 'A cave'],
      why: 'It is a pun: the word "mushroom" has "room" in it, and a mushroom has no doors or windows. A cellar, closet or cave all have some kind of entrance.',
      bloom: 'Understand'
    }
  ]);

  // ---------- batch 2: more riddles + lateral-thinking scenarios ----------
  registerPuzzles('riddles', [
    {
      q: 'Feed me and I live and grow. Give me a drink of water and I die. What am I?',
      a: 'Fire', w: ['A plant', 'A puppy', 'A river'],
      why: 'Fire grows when you feed it wood and is put out by water. A plant, a puppy and a river all need water rather than being killed by it.',
      bloom: 'Analyze'
    },
    {
      q: 'I have many branches in many towns, but no fruit, no trunk and no leaves. I keep your savings safe. What am I?',
      a: 'A bank', w: ['A tree', 'A library', 'A shop'],
      why: 'Banks have "branches" all over the place, and they look after your savings. A library also has branches, but it does not keep your savings.',
      bloom: 'Analyze'
    },
    {
      q: 'A man pushes his car up to a hotel and announces that he is bankrupt. The whole scene takes place around a kitchen table and nobody leaves their seat. What is he doing?',
      a: 'Playing Monopoly', w: ['Rehearsing a play', 'Watching a film', 'Building a model railway'],
      why: 'In the board game Monopoly, one of the tokens is a little car. Landing on a hotel and being unable to pay the rent means going bankrupt.',
      bloom: 'Analyze'
    },
    {
      q: 'A man lives on the 10th floor of a tall building and is happy to climb stairs. Every morning he rides the elevator down to the ground floor. Coming home, he rides to the 7th floor and walks up the last three floors, except on rainy days, when he rides all the way to the 10th floor. Why?',
      a: 'He is too short to reach the 10 button, but on rainy days his umbrella lets him press it',
      w: ['He is so tall that he bumps his head on the top floors', 'He gets dizzy on high floors unless it is raining', 'The button for floor 10 only lights up when it rains'],
      why: 'He can only reach as high as the button for floor 7. On rainy days he carries an umbrella, which he uses to stretch up and press the 10 button. This is a famous lateral-thinking riddle.',
      bloom: 'Analyze'
    },
    {
      q: 'A boy is hurt at the park and taken to hospital. The doctor looks at him and says, "I cannot treat this boy. He is my son!" The boy has exactly one father and one mother, and his father is sitting in the waiting room. How is this possible?',
      a: 'The doctor is the boy\'s mother', w: ['The doctor is the boy\'s grandfather', 'The doctor is the boy\'s uncle', 'The doctor is the boy\'s stepbrother'],
      why: 'The boy\'s father is in the waiting room, so the doctor must be his other parent: his mother. The puzzle works because many people wrongly assume that doctors are men.',
      bloom: 'Analyze'
    },
    {
      q: 'A man points at a photograph and says: "Brothers and sisters I have none, but that man\'s father is my father\'s son." Who is in the photograph?',
      a: 'His own son', w: ['Himself', 'His father', 'His nephew'],
      why: 'He has no brothers, so "my father\'s son" can only be himself. That makes the pictured man\'s father the speaker, so the pictured man is the speaker\'s son.',
      bloom: 'Analyze'
    },
    {
      q: 'A man walks for an hour in heavy rain with no hat, no hood and no umbrella. His clothes are soaked, but not a single hair on his head gets wet. How?',
      a: 'He is bald', w: ['He has waterproof hair', 'He walks close to the buildings', 'His hair is too short to get wet'],
      why: 'A bald man has no hair to get wet. This classic riddle makes you think about rain and umbrellas instead of the man himself.',
      bloom: 'Evaluate'
    },
    {
      q: 'A cowboy rides into town on Friday. He stays for three days, then rides out on Friday. How is that possible?',
      a: 'His horse is named Friday', w: ['He lost track of the days', 'The town uses a different calendar', 'He crossed into a different time zone'],
      why: 'The cowboy did not arrive on the day Friday; he arrived on a horse called Friday. The riddle tricks you into hearing "Friday" as a day of the week.',
      bloom: 'Evaluate'
    },
    {
      q: 'An electric train is travelling north at 60 mph while a strong wind blows from the east. In which direction does the train\'s smoke blow?',
      a: 'There is no smoke', w: ['West', 'South', 'North'],
      why: 'An electric train does not burn fuel, so it makes no smoke at all. The wind direction and the train\'s speed are just distractions.',
      bloom: 'Analyze'
    },
    {
      q: 'A rope ladder hangs over the side of a ship. Its rungs are 30 cm apart, and the bottom 3 rungs are underwater. The tide rises 60 cm every hour. After 2 hours, how many rungs are underwater?',
      a: '3', w: ['7', '4', '1'],
      why: 'The ship floats, so it rises with the water. The ladder rises too, so the same 3 rungs stay underwater. Adding 4 rungs for the rising tide (making 7) forgets that the ship floats.',
      bloom: 'Analyze'
    },
    {
      q: 'A truck driver goes the wrong way down a one-way street, passes four police officers, and nobody stops him or gives him a ticket. Why not?',
      a: 'He was walking, not driving', w: ['The police did not notice him', 'Police never ticket truck drivers', 'It was a public holiday'],
      why: 'Nobody said he was driving at the time. A truck driver is a job, and he can walk down a one-way street in either direction.',
      bloom: 'Evaluate'
    },
    {
      q: 'A man builds a house in which all four walls face south. A bear walks past the window. What colour is the bear?',
      a: 'White', w: ['Brown', 'Black', 'Grey'],
      why: 'All four walls can only face south at the North Pole, because every direction from there is south. The bears that live at the North Pole are polar bears, which are white.',
      bloom: 'Analyze'
    },
    {
      q: 'Two men play five games of chess. Each of them wins three games, and there are no draws and no cheating. How is that possible?',
      a: 'They were not playing each other', w: ['One game was played twice', 'One game was counted for both of them', 'One man won a game on time'],
      why: 'Five games can have only five winners, but six wins were claimed. So the two men must have been playing against other people.',
      bloom: 'Analyze'
    },
    {
      q: 'If you throw a blue stone into the Red Sea, what does it become?',
      a: 'Wet', w: ['Purple', 'Red', 'Smaller'],
      why: 'This riddle tempts you to mix the colours. Anything that goes into the sea simply gets wet.',
      bloom: 'Evaluate'
    },
    {
      q: 'A mother has two sons who were born on the same day, in the same year, to the same mother and father. They are not twins. How can this be?',
      a: 'They are two of triplets', w: ['One of them is adopted', 'They are cousins', 'They were born in different countries'],
      why: 'Triplets are born on the same day to the same parents, but three children make triplets, not twins. The riddle only mentions two of them.',
      bloom: 'Evaluate'
    }
  ]);

  // ---------- batch 3: famous trick questions ----------
  registerPuzzles('riddles', [
    {
      q: 'Riddle: how many months of the year have at least 28 days?',
      a: '12', w: ['1', '2', '11'],
      why: 'Every month has 28 days or more, so all 12 months qualify. The famous riddle "how many months have 28 days?" catches people out because they only think of February.',
      bloom: 'Apply'
    },
    {
      q: 'A plane crashes exactly on the border between two countries. In which country should the survivors be buried?',
      a: 'Nowhere, because survivors are still alive', w: ['In the larger country', 'Half in each country', 'In the country on their passports'],
      why: 'Survivors are people who lived through the crash, and living people are not buried. The famous riddle tricks you into arguing about the border.',
      bloom: 'Evaluate'
    },
    {
      q: 'How many animals of each kind did Moses take on the ark? (Read closely: this famous question is built on a false assumption.)',
      a: 'None, because it was Noah who built the ark', w: ['Two', 'Seven', 'One'],
      why: 'The question assumes Moses had an ark, but it was Noah who took the animals on board. This is the "Moses illusion": people answer "two" without noticing the wrong name.',
      bloom: 'Evaluate'
    },
    {
      q: 'A farmer has 17 sheep. All but 9 of them run away. How many sheep does the farmer have left?',
      a: '9', w: ['8', '0', '17'],
      why: '"All but 9" means every sheep except 9 ran away, so 9 stayed. Subtracting 9 from 17 to get 8 misreads the wording.',
      bloom: 'Apply'
    },
    {
      q: 'A doctor gives you three pills and says: "Take one right now, and then one every half hour." How long does it take you to take all three pills?',
      a: '1 hour', w: ['1 hour 30 minutes', '2 hours', '30 minutes'],
      why: 'You take the first pill at time 0, the second after 30 minutes and the third after 60 minutes. There are only two half-hour gaps, not three.',
      bloom: 'Apply'
    },
    {
      q: 'Before Mount Everest was discovered, what was the highest mountain on Earth?',
      a: 'Mount Everest', w: ['K2', 'Mont Blanc', 'Kilimanjaro'],
      why: 'Discovering a mountain does not change its height. Everest was already the highest mountain before anyone found it.',
      bloom: 'Evaluate'
    },
    {
      q: 'Mary\'s father has five daughters: Nana, Nene, Nini, Nono and ...?',
      a: 'Mary', w: ['Nunu', 'Nuna', 'Nyna'],
      why: 'The pattern Nana, Nene, Nini, Nono tempts you to say "Nunu", but the first sentence already told you that the father is Mary\'s father, so Mary is the fifth daughter.',
      bloom: 'Evaluate'
    },
    {
      q: 'A one-storey house has no basement and no attic. It is built entirely from blue bricks, with blue walls, blue floors and a blue roof. What colour are its stairs?',
      a: 'It has no stairs', w: ['Blue', 'White', 'Grey'],
      why: 'A house with only one storey and no basement or attic has nowhere for stairs to go. The colour details are just a distraction.',
      bloom: 'Analyze'
    },
    {
      q: 'You walk into a cold, dark room with a single match. In the room there is an oil lamp, a candle and a fireplace with logs ready to burn. What do you light first?',
      a: 'The match', w: ['The oil lamp', 'The candle', 'The fireplace'],
      why: 'Nothing can be lit until the match is lit. It is the first thing you must light.',
      bloom: 'Evaluate'
    },
    {
      q: 'You are running a race and you overtake the runner who is in second place. What position are you in now?',
      a: 'Second', w: ['First', 'Third', 'Fourth'],
      why: 'You have only passed the person who was second, so you take their place. To be first you would need to pass the leader as well.',
      bloom: 'Evaluate'
    }
  ]);

  // ---------- batch 4: wordplay and letter riddles ----------
  registerPuzzles('riddles', [
    {
      q: 'What word becomes ‘shorter’ when you add two letters to it?',
      a: 'Short', w: ['Small', 'Brief', 'Tiny'],
      why: 'Add "er" to "short" and you get "shorter". The word has grown longer, but it has literally become "shorter", which is the joke.',
      bloom: 'Apply'
    },
    {
      q: 'Riddle: which word in the dictionary is always spelled wrong?',
      a: 'Wrong', w: ['Rhythm', 'Necessary', 'Separate'],
      why: 'It is a pun. If you spell the word "wrong" correctly, you have still spelled "wrong", so it is always spelled "wrong". The other three are tricky, but people can spell them correctly.',
      bloom: 'Apply'
    },
    {
      q: 'What starts with an "e", ends with an "e", and contains only one letter?',
      a: 'An envelope', w: ['An eagle', 'An eclipse', 'An engine'],
      why: 'An envelope starts and ends with "e", and it holds one letter (a piece of mail). Eagle, eclipse and engine also start and end with "e", but none of them contains a letter.',
      bloom: 'Apply'
    },
    {
      q: 'What letter appears once in a minute, twice in a moment, and never in a thousand years?',
      a: 'M', w: ['E', 'T', 'N'],
      why: '"Minute" has one M, "moment" has two, and "a thousand years" has none. The other letters appear too often in "moment" or "minute" to fit.',
      bloom: 'Apply'
    },
    {
      q: 'Two in a corner, one in a room, none in a house, but one in a shelter. What am I?',
      a: 'The letter R', w: ['The letter O', 'The letter E', 'The letter S'],
      why: 'Count the letter R in each word: "corner" has two, "room" has one, "house" has none and "shelter" has one.',
      bloom: 'Apply'
    },
    {
      q: 'As a wordplay riddle, what is the "centre of gravity"?',
      a: 'The letter V', w: ['The letter A', 'The letter R', 'The letter T'],
      why: 'The word GRAVITY has seven letters: G-R-A-V-I-T-Y. The letter in the very middle, the fourth one, is V.',
      bloom: 'Apply'
    },
    {
      q: 'Which English word sounds exactly the same when you remove four of its five letters?',
      a: 'Queue', w: ['Eight', 'Aisle', 'Ghost'],
      why: 'Take away U-E-U-E from "queue" and you are left with just Q, which is pronounced "kyoo", exactly like the whole word.',
      bloom: 'Evaluate'
    },
    {
      q: 'A famous riddle asks for the "longest word" in the dictionary. The answer has a whole mile between its first letter and its last. Which word is it?',
      a: 'Smiles', w: ['Miles', 'Marathon', 'Distance'],
      why: 'The word "smiles" starts with S and ends with S, and there is a "mile" between the two S letters: s-MILE-s.',
      bloom: 'Understand'
    },
    {
      q: 'Which four-letter word reads the same forwards, backwards, and when written in capital letters and turned upside down?',
      a: 'NOON', w: ['DEED', 'TOOT', 'PEEP'],
      why: 'DEED, TOOT and PEEP are palindromes, but their capital letters do not look the same when turned upside down (a "T" or a "D" changes). N and O look the same after a half-turn, so NOON works in every direction.',
      bloom: 'Analyze'
    },
    {
      q: 'In English, which of these number words has exactly as many letters as the number it names?',
      a: 'Four', w: ['Three', 'Five', 'Six'],
      why: '"Four" has four letters. "Three" has five letters, "five" has four letters and "six" has three. Four is the only number in English with this property.',
      bloom: 'Apply'
    }
  ]);

  // ---------- batch 5: rebus / picture puzzles ----------
  const sunFlowerPic = svg(320, 160,
    frame(320, 160) +
    (function () {
      let s = '';
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        s += '<line x1="' + (70 + Math.cos(a) * 30).toFixed(1) + '" y1="' + (80 + Math.sin(a) * 30).toFixed(1) + '" x2="' + (70 + Math.cos(a) * 42).toFixed(1) + '" y2="' + (80 + Math.sin(a) * 42).toFixed(1) + '" stroke="#d97706" stroke-width="4" stroke-linecap="round"/>';
      }
      s += '<circle cx="70" cy="80" r="24" fill="#fbbf24" stroke="#d97706" stroke-width="3"/>';
      s += text(160, 92, '+', 40);
      s += '<line x1="250" y1="90" x2="250" y2="140" stroke="#15803d" stroke-width="5" stroke-linecap="round"/>';
      s += '<path d="M250 122 Q225 112 222 128 Q240 136 250 122 Z" fill="#22c55e" stroke="#15803d" stroke-width="2"/>';
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3;
        s += '<circle cx="' + (250 + Math.cos(a) * 20).toFixed(1) + '" cy="' + (65 + Math.sin(a) * 20).toFixed(1) + '" r="13" fill="#f9a8d4" stroke="#be185d" stroke-width="2"/>';
      }
      s += '<circle cx="250" cy="65" r="11" fill="#fbbf24" stroke="#b45309" stroke-width="2"/>';
      return s;
    })());
  const eyeHeartUPic = svg(320, 150,
    frame(320, 150) +
    '<path d="M22 75 Q58 42 94 75 Q58 108 22 75 Z" fill="#ffffff" stroke="' + INK + '" stroke-width="3"/>' +
    '<circle cx="58" cy="75" r="14" fill="#3b82f6" stroke="' + INK + '" stroke-width="2.5"/>' +
    '<circle cx="58" cy="75" r="6" fill="#111827"/>' +
    '<path d="M165 112 C122 84 132 48 154 56 C161 59 165 65 165 65 C165 65 169 59 176 56 C198 48 208 84 165 112 Z" fill="#ef4444" stroke="#991b1b" stroke-width="3"/>' +
    text(258, 100, 'U', 72));
  const hToOPic = letterRow(['H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'], 37);
  const readingPic = svg(320, 150,
    frame(320, 150) +
    '<line x1="30" y1="45" x2="290" y2="45" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
    '<line x1="30" y1="107" x2="290" y2="107" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
    text(160, 87, 'READING', 34));

  registerPuzzles('riddles', [
    {
      q: 'Which well-known phrase does this word picture show?',
      a: 'Mind over matter', w: ['Never mind the matter', 'Mind the gap', 'A matter of fact'],
      why: 'The word MIND is placed over the word MATTER, so the picture reads "mind over matter". Rebus puzzles use where the words are placed as part of the clue.',
      bloom: 'Understand', diagram: stacked(['MIND', 'MATTER'], 34)
    },
    {
      q: 'Which sentence does this word picture show?',
      a: 'I understand', w: ['I stand alone', 'Stand by me', 'I overstand'],
      why: 'The letter I sits under the word STAND, so you read "I under stand", which is "I understand".',
      bloom: 'Understand', diagram: stacked(['STAND', 'I'], 34)
    },
    {
      q: 'Which warning does this word picture show?',
      a: 'Man overboard', w: ['Man on board', 'Board of men', 'Mankind'],
      why: 'MAN is written over BOARD, so it reads "man over board", which is "man overboard".',
      bloom: 'Understand', diagram: stacked(['MAN', 'BOARD'], 34)
    },
    {
      q: 'Which saying does this word picture show?',
      a: 'Reading between the lines', w: ['Reading in line', 'Lines of reading', 'Read a line'],
      why: 'The word READING sits between two lines, so the picture says "reading between the lines".',
      bloom: 'Understand', diagram: readingPic
    },
    {
      q: 'Which one word does this picture show (a sun plus a flower)?',
      a: 'Sunflower', w: ['Sunrise', 'Daisy chain', 'Moonflower'],
      why: 'Picture rebuses add the two pictures together: sun + flower = sunflower.',
      bloom: 'Understand', diagram: sunFlowerPic
    },
    {
      q: 'Which sentence does this picture show (an eye, a heart and the letter U)?',
      a: 'I love you', w: ['Eye of the heart', 'You see love', 'Heart to heart'],
      why: 'An eye sounds like "I", the heart stands for "love", and the letter U sounds like "you". So the picture reads "I love you".',
      bloom: 'Understand', diagram: eyeHeartUPic
    },
    {
      q: 'The letters in this picture run from H to O. Read "H to O" like a chemical formula: which common substance does it show?',
      a: 'Water', w: ['Salt', 'Oxygen', 'Hydrogen peroxide'],
      why: '"H to O" sounds like "H two O", which is H<sub>2</sub>O, the chemical formula for water.',
      bloom: 'Understand', diagram: hToOPic
    },
    {
      q: 'Which one word does this picture show?',
      a: 'Tricycle', w: ['Bicycle', 'Recycle', 'Motorcycle'],
      why: 'The word CYCLE appears three times. "Tri" means three, so three cycles make a "tricycle".',
      bloom: 'Understand', diagram: stacked(['CYCLE', 'CYCLE', 'CYCLE'], 28)
    }
  ]);

  // ---------- batch 6: "what comes next" letter patterns, clock and calendar pictures ----------
  const calendarPic = (function () {
    const days = [['SUN', 7], ['MON', 8], ['TUE', 9], ['WED', 10], ['THU', 11]];
    let s = frame(320, 165);
    days.forEach(function (d, i) {
      const x = 20 + i * 56;
      s += '<rect x="' + x + '" y="24" width="56" height="88" fill="#ffffff" stroke="' + INK + '" stroke-width="2"/>';
      s += '<rect x="' + x + '" y="24" width="56" height="26" fill="#e5e7eb" stroke="' + INK + '" stroke-width="2"/>';
      s += text(x + 28, 43, d[0], 15);
      s += text(x + 28, 95, String(d[1]), 30);
    });
    s += '<circle cx="' + (20 + 2 * 56 + 28) + '" cy="88" r="27" fill="none" stroke="#dc2626" stroke-width="3.5"/>';
    s += text(20 + 2 * 56 + 28, 140, 'TODAY', 15, '#dc2626');
    return svg(320, 165, s);
  })();
  const stoppedClockPic = svg(320, 160,
    clock(82, 62, 54, 4, 10) + clock(238, 62, 54, 7, 25) +
    text(82, 146, 'STOPPED', 15) +
    text(238, 146, 'LOSES 1 MIN A DAY', 14));

  registerPuzzles('riddles', [
    {
      q: 'The letters are the first letters of counting words. What letter comes next in this sequence?',
      a: 'E', w: ['N', 'T', 'S'],
      why: 'They are the first letters of One, Two, Three, Four, Five, Six, Seven. The next number is Eight, so the next letter is E.',
      bloom: 'Apply', diagram: letterRow(['O', 'T', 'T', 'F', 'F', 'S', 'S', '?'], 37)
    },
    {
      q: 'These are the first letters of something you know from the calendar. What letter comes next?',
      a: 'D', w: ['J', 'M', 'O'],
      why: 'They are the first letters of the months in order: January, February, ... October, November. The next month is December, so the letter is D.',
      bloom: 'Apply', diagram: letterRow(['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', '?'], 25)
    },
    {
      q: 'Which letter comes next in this pattern?',
      a: 'U', w: ['S', 'T', 'V'],
      why: 'The gaps between the letters grow by one each time: A to C skips 1 letter, C to F skips 2, F to J skips 3, J to O skips 4. So O to U skips 5 (P, Q, R, S, T).',
      bloom: 'Apply', diagram: letterRow(['A', 'C', 'F', 'J', 'O', '?'], 50)
    },
    {
      q: 'What pair of letters comes next?',
      a: 'IJ', w: ['JI', 'IK', 'LK'],
      why: 'The pairs are AB, CD, EF, GH, IJ in alphabetical order, but every second pair is written backwards: AB, DC, EF, HG. So the next pair, IJ, is written the normal way round.',
      bloom: 'Apply', diagram: letterRow(['AB', 'DC', 'EF', 'HG', '?'], 58)
    },
    {
      q: 'Which letter comes next in the sequence Z, A, Y, B, X, C, ... ?',
      a: 'W', w: ['D', 'V', 'Z'],
      why: 'Two patterns are woven together: Z, Y, X, W... counts backwards from the end of the alphabet and A, B, C, D... counts forwards from the start. The next letter in the backwards run is W.',
      bloom: 'Apply'
    },
    {
      q: 'The letters below are the first letters of a list you know well, but the list is read in a backwards order. What letter comes next?<br><b>D, N, O, S, A, J, J, M, A, M, F, ...</b>',
      a: 'J', w: ['A', 'M', 'D'],
      why: 'They are the months backwards from December: December, November, October, September, August, July, June, May, April, March, February. The next month is January, so the letter is J.',
      bloom: 'Apply'
    },
    {
      q: 'Lewis Carroll asked: which clock shows the exactly right time more often, one that has stopped, or one that loses one minute every day? (Think of a 12-hour dial.)',
      a: 'The stopped clock', w: ['The clock that loses a minute a day', 'Both are equally good', 'Neither is ever exactly right'],
      why: 'A stopped clock shows the right time twice every day. A clock that loses one minute a day is only right again once it has lost a full 12 hours (720 minutes), which takes 720 days.',
      bloom: 'Evaluate', diagram: stoppedClockPic
    },
    {
      q: 'On this calendar strip, today is Tuesday the 9th. What is "the day after the day before yesterday"?',
      a: 'Monday the 8th', w: ['Sunday the 7th', 'Tuesday the 9th', 'Wednesday the 10th'],
      why: 'The day before yesterday is Sunday the 7th, and the day after that is Monday the 8th, which is simply yesterday.',
      bloom: 'Apply', diagram: calendarPic
    }
  ]);

  // ---------- batch 7: anagrams, hidden words, odd-one-out, impossible things ----------
  registerPuzzles('riddles', [
    {
      q: 'Three of these words are anagrams of LISTEN (they use exactly the same letters). Which one is NOT?',
      a: 'Stolen', w: ['Silent', 'Tinsel', 'Enlist'],
      why: 'SILENT, TINSEL and ENLIST all use the letters E, I, L, N, S, T. STOLEN uses an O instead of the I, so it is the odd one out.',
      bloom: 'Evaluate'
    },
    {
      q: 'Rearrange every letter of the word DORMITORY to make a two-word phrase. Which phrase can you make?',
      a: 'Dirty room', w: ['Dirty rooms', 'Tidy motors', 'Moody trip'],
      why: 'D-O-R-M-I-T-O-R-Y has the same nine letters as D-I-R-T-Y R-O-O-M. The other phrases have too many letters or use letters that DORMITORY does not have.',
      bloom: 'Create'
    },
    {
      q: 'Rearrange the letters of NEW DOOR to make a different two-word phrase that describes what you were just asked to make. Which is it?',
      a: 'One word', w: ['Once word', 'Newer do', 'Do renew'],
      why: 'N-E-W D-O-O-R has the same seven letters as O-N-E W-O-R-D. The other phrases need an extra C or E, or are missing an O.',
      bloom: 'Create'
    },
    {
      q: 'Which sentence uses exactly the same letters as ELEVEN PLUS TWO?',
      a: 'Twelve plus one', w: ['Twelve minus one', 'Twelve plus two', 'Twenty plus one'],
      why: 'ELEVEN PLUS TWO and TWELVE PLUS ONE both use the letters E-E-E-L-L-N-O-P-S-T-U-V-W. The answer to both sums is 13, which is a famous anagram coincidence.',
      bloom: 'Create'
    },
    {
      q: 'Each of these words hides the name of a body part inside it, except one. Which word does NOT?',
      a: 'Carpet', w: ['China', 'Ships', 'Hearth'],
      why: 'CHINA hides "chin", SHIPS hides "hip" and HEARTH hides "ear" and "heart". CARPET hides "car" and "pet" but no body part.',
      bloom: 'Analyze'
    },
    {
      q: 'Each of these words hides a spelled-out number inside it, except one. Which word does NOT?',
      a: 'Nation', w: ['Often', 'Money', 'Weight'],
      why: 'OFTEN hides "ten", MONEY hides "one" and WEIGHT hides "eight". NATION hides no number word.',
      bloom: 'Analyze'
    },
    {
      q: 'Three of these animals are mammals. Which one is NOT a mammal?',
      a: 'Shark', w: ['Dolphin', 'Whale', 'Seal'],
      why: 'Dolphins, whales and seals are mammals: they breathe air and feed their babies milk. A shark is a fish.',
      bloom: 'Evaluate'
    },
    {
      q: 'Which of these calendar months could NEVER exist?',
      a: 'A 30-day month with five Mondays, five Tuesdays and five Wednesdays',
      w: ['A 30-day month with five Mondays and five Tuesdays', 'A 31-day month with five Mondays, five Tuesdays and five Wednesdays', 'A 30-day month with five Mondays'],
      why: 'A 30-day month is four full weeks plus 2 extra days, so at most two weekdays can occur five times. A 31-day month has 3 extra days, so three weekdays in a row can each occur five times.',
      bloom: 'Evaluate'
    },
    {
      q: 'In one family, every child has at least one brother AND at least one sister. What is the smallest possible number of children?',
      a: '4', w: ['2', '3', '5'],
      why: 'Every girl needs a sister and a brother, so there must be at least two girls and at least one boy. Every boy needs a brother and a sister, so there must be at least two boys. Two girls and two boys make 4.',
      bloom: 'Analyze'
    }
  ]);

  // ---------- batch 8: word ladders, word-building and compound-word puzzles ----------
  registerPuzzles('riddles', [
    {
      q: 'A word ladder changes exactly one letter at each step, and every step must be a real word. Which of these is a correct word ladder from COLD to WARM?',
      a: 'COLD → CORD → CARD → WARD → WARM',
      w: ['COLD → CORD → WORM → WARM', 'COLD → GOLD → GOAD → WARD → WARM', 'COLD → CORD → CARD → WARD → WARN'],
      why: 'COLD → CORD (L to R) → CARD (O to A) → WARD (C to W) → WARM (D to M) changes one letter each time. CORD → WORM changes two letters, GOAD → WARD changes three, and the last ladder finishes at WARN, not WARM.',
      bloom: 'Create'
    },
    {
      q: 'Lewis Carroll invented word ladders (change one letter per step, every step a real word). Which of these correctly turns HEAD into TAIL?',
      a: 'HEAD → HEAL → TEAL → TELL → TALL → TAIL',
      w: ['HEAD → HEAL → TEAL → TALL → TAIL', 'HEAD → HEAL → HAIL → TAIL', 'HEAD → HEAL → TEAL → TELL → TILL → TAIL'],
      why: 'Each step of HEAD → HEAL → TEAL → TELL → TALL → TAIL changes exactly one letter. In the others, TEAL → TALL, HEAL → HAIL and TILL → TAIL each change two letters at once.',
      bloom: 'Create'
    },
    {
      q: 'Which word ladder correctly turns LEAD into GOLD? (One letter changes per step, and every step must be a real word.)',
      a: 'LEAD → LOAD → GOAD → GOLD',
      w: ['LEAD → LOAD → GOLD', 'LEAD → LEND → GOLD', 'LEAD → LOAD → LOLD → GOLD'],
      why: 'LEAD → LOAD (E to O) → GOAD (L to G) → GOLD (A to L) works. LOAD → GOLD and LEND → GOLD change too many letters, and LOLD is not a real word.',
      bloom: 'Create'
    },
    {
      q: 'Which word contains all five vowels (A, E, I, O and U), each used exactly once?',
      a: 'Education', w: ['Evolution', 'Question', 'Vacation'],
      why: 'EDUCATION has one E, one U, one A, one I and one O. EVOLUTION has no A, QUESTION has no A, and VACATION is missing E and U.',
      bloom: 'Create'
    },
    {
      q: 'Which word has three double letters back to back (a pair, then another pair, then a third pair, with nothing in between)?',
      a: 'Bookkeeper', w: ['Committee', 'Balloonist', 'Assessment'],
      why: 'BOOKKEEPER is b-OO-KK-EE-p-e-r: three double letters (OO, KK, EE) one right after another. COMMITTEE has three pairs, but there are other letters in between them.',
      bloom: 'Create'
    },
    {
      q: 'Which of these words can be typed using only the top row of a keyboard (the letters Q W E R T Y U I O P)?',
      a: 'Typewriter', w: ['Keyboard', 'Computer', 'Alphabet'],
      why: 'T-Y-P-E-W-R-I-T-E-R uses only letters from the top row, so it is the classic example. The other words all contain letters from the other rows, such as K, M, A or B.',
      bloom: 'Create'
    },
    {
      q: 'Which word has its letters in alphabetical order, reading from the first letter to the last?',
      a: 'Almost', w: ['Planet', 'Marble', 'Sunset'],
      why: 'A-L-M-O-S-T goes up the alphabet all the way. PLANET, MARBLE and SUNSET each step backwards somewhere (P then L, R then B, U then N).',
      bloom: 'Create'
    },
    {
      q: 'Which word can be put in front of each of these to make three new words: ___case, ___mark, ___worm?',
      a: 'Book', w: ['Suit', 'Land', 'Ear'],
      why: 'BOOKcase, BOOKmark and BOOKworm are all real words. "Suit" only makes suitcase, and "land" and "ear" do not fit all three.',
      bloom: 'Create'
    },
    {
      q: 'Which word can be put after each of these to make three new words: foot___, basket___, base___?',
      a: 'Ball', w: ['Hand', 'Bat', 'Court'],
      why: 'Football, basketball and baseball are all real words. "Hand" makes handball, but foothand and baskethand are not words.',
      bloom: 'Create'
    },
    {
      q: 'Which word can be put after each of these to make three new words: sun___, moon___, day___?',
      a: 'Light', w: ['Shine', 'Rise', 'Beam'],
      why: 'Sunlight, moonlight and daylight are all real words. Shine, rise and beam work after "sun" and "moon", but "dayshine", "dayrise" and "daybeam" are not words.',
      bloom: 'Create'
    }
  ]);
})();
