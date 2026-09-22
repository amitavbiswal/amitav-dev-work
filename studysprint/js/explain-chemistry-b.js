(function () {
  // explain-chemistry-b: on-screen explanations + spoken scripts, added via addTutorialExplanations(...).
  // Topics: reactions, acids, periodic (8 steps each: 5 core + 3 real-life examples).

  addTutorialExplanations('chemistry', 'reactions', [
    // 1. Atoms change partners
    {
      explain: '<p>On the left, under <b>Reactants</b>, pale blue circles are <b>hydrogen atoms</b> joined in pairs, and two bigger red circles are <b>oxygen atoms</b> joined together. They glide to the right, the black bond lines fade, then new bonds appear: each red oxygen now holds two hydrogens, so there are two water molecules.</p><p>Notice that both sides say 4 H + 2 O.</p>',
      say: 'Look at the left side, labeled reactants. The small pale blue circles are hydrogen atoms, joined in pairs by black lines. The two bigger red circles are oxygen atoms, joined to each other. Now watch. The atoms glide to the right. The old bonds fade, and the message says bonds break. Then new bonds appear, and each red oxygen atom ends up holding two hydrogen atoms. That is water. Now count the atoms under each heading. Four hydrogen and two oxygen on both sides. Two hydrogen molecules plus one oxygen molecule make two water molecules. Nothing was created or destroyed. The atoms only changed partners.'
    },
    // 2. Balance the equation
    {
      explain: '<p>Choose <b>Water</b>, <b>Methane</b> or <b>Ammonia</b>, then press the − and + buttons to change the big number in front of each formula. The table below counts every atom with a row of bobbing dots, reactants on the left, products on the right. A row turns <b>green with =</b> when the counts match and <b>red with ≠</b> when they do not.</p><p>Notice that it says Balanced only when every row is green.</p>',
      say: 'This one is yours to play with. At the top, choose water, methane, or ammonia. Each formula has a minus button and a plus button that change the big number in front of it. That number is called the coefficient. Under the equation, a table counts each kind of atom on both sides, using little bobbing dots. When the two counts match, the row turns green with an equals sign. When they do not match, it turns red. Try water first. When every row is green, the message says balanced. Remember, change only the big numbers, never the small numbers inside a formula.'
    },
    // 3. Signs of a reaction
    {
      explain: '<p>Four beakers, four clues. <b>Gas bubbles</b>: white bubbles stream up from a small block at the bottom. <b>Color change</b>: an orange drop falls in and the blue liquid turns yellow. <b>Precipitate</b>: white specks appear and sink into a layer of solid. <b>Heat, light</b>: a yellow glow pulses and wavy orange lines rise.</p><p>Notice that each clue means a new substance formed.</p>',
      say: 'Look at the four beakers side by side. Each one shows a different clue that a chemical reaction is happening. In the first beaker, bubbles rise from the bottom. That is a gas being made. In the second, a drop falls in and the liquid changes from blue to yellow. A color change is a sign of a new substance. In the third, little white specks appear and sink to the bottom. That is a precipitate, a brand new solid. In the fourth, a glow pulses and heat lines rise. Energy is being given off as heat and light. Melting is different, because no new substance forms.'
    },
    // 4. Heat in, heat out
    {
      explain: '<p>The two bars show the energy of the <b>Reactants</b> and the <b>Products</b>. In <b>Exothermic</b>, the products bar is lower, an arrow points down, orange dots flow out to the thermometer, and its red liquid rises: the surroundings warm up. Press <b>Endothermic</b> and it flips: products higher, blue dots flow in, and the thermometer drops.</p>',
      say: 'Look at the two bars. The left bar shows the energy stored in the reactants. The right bar shows the energy in the products. The scene starts with an exothermic reaction. The products bar is lower, so the reaction has given energy away. See the orange dots streaming out toward the thermometer? That is heat leaving. The liquid in the thermometer rises, so the surroundings get warmer. Burning and hand warmers work this way. Now press the endothermic button. The bars swap. The products bar is higher, because energy has to come in. Blue dots flow in, and the thermometer drops. That is why an instant cold pack feels cold.'
    },
    // 5. Two reaction types
    {
      explain: '<p>Two rows, two reaction types. In the top row, <b>Synthesis</b>, an orange atom A and a blue atom B glide together and a black bond joins them: two things become one. In the bottom row, <b>Decomposition</b>, a bonded A–B pair loses its bond and the atoms drift apart. The letters are generic stand-ins, not real elements.</p>',
      say: 'Look at the two rows. The top row is synthesis. An orange atom and a blue atom start apart, then slide toward each other, and a black bond appears between them. Two separate things combined into one. Making water from hydrogen and oxygen is an example. The bottom row is decomposition. Here the orange atom and the blue atom start joined. Then the bond disappears and they drift apart. One thing broke into simpler things. Splitting water into hydrogen and oxygen with electricity is an example. The letters A and B are just stand-ins, so this is a simplified picture. Notice that decomposition is like synthesis played backward.'
    },
    // 6. Real life: A nail rusts
    {
      explain: '<p>A gray <b>iron nail</b> sits in the middle. Red pairs are <b>oxygen molecules</b> and blue drops are <b>water</b>; both keep drifting down onto it. This is a time-lapse: the label changes from Day 1 to Week 2 to Month 3 while more <b>brown-orange rust patches</b> spread along the nail.</p><p>Notice that the equation shows iron and oxygen becoming iron oxide.</p>',
      say: 'Look at the gray iron nail in the middle. The red pairs are oxygen molecules from the air, and the blue drops are water. They keep drifting down onto the nail. Now watch the label on the right. It says day one, and the nail is almost clean. Then it says week two, and brown patches start to spread. By month three, there is a lot of rust. This is a time lapse, so a very slow reaction is squeezed into a few seconds. Rust is a new substance called iron oxide. Four iron atoms plus three oxygen molecules make two units of iron oxide. Water speeds up the rusting.'
    },
    // 7. Real life: A fizzy tablet
    {
      explain: '<p>A glass of blue water holds a white <b>tablet</b> that shrinks while white <b>bubbles</b> of carbon dioxide rise. The orange <b>Reaction speed</b> bar grows when the reaction is faster. The <b>Water</b> slider sets the temperature, <b>Crush it</b> breaks the tablet into small pieces, and a Done in seconds message appears at the end.</p><p>Notice that warm water and crushing both finish sooner.</p>',
      say: 'Here is a glass of water with a fizzy tablet at the bottom. The tablet contains an acid and baking soda. When they meet in water, they react and make carbon dioxide gas. Those are the white bubbles rising up. Watch the tablet shrink as it gets used up. The orange bar on the right shows the reaction speed. When the tablet is gone, the screen tells you how many seconds it took. Now experiment. Slide the water temperature up, then press drop tablet, and compare the time. Next press crush it. Crushed pieces have more surface touching the water. Warm water and more surface both make the reaction faster.'
    },
    // 8. Real life: A burning candle
    {
      explain: '<p>A <b>candle</b> with a flickering orange and yellow flame glows and sends out yellow rays. Red pairs of <b>oxygen</b> drift in from both sides. From the flame, <b>carbon dioxide</b> (a gray atom between two red ones) and <b>water</b> (a red atom with two small pale blue ones) float up and away, while the candle slowly gets shorter.</p><p>Notice that the atoms leave as new gases.</p>',
      say: 'Look at the candle in the middle. The flame flickers, and it gives out light and heat. That makes this an exothermic reaction. Watch the red pairs drifting in from both sides. Those are oxygen molecules from the air. The wax vapor in the flame reacts with the oxygen. Now look at what floats up and away. Some molecules have a gray atom between two red atoms. That is carbon dioxide. Others have a red atom with two small pale blue atoms. That is water vapor. Notice that the candle slowly gets shorter. The wax is not simply vanishing. Its atoms leave as new gases.'
    }
  ]);

  addTutorialExplanations('chemistry', 'acids', [
    // 1. Acids and bases in water
    {
      explain: '<p>Two beakers of water. In the left <b>acid</b> beaker (hydrochloric acid), red circles labeled H<sup>+</sup> are <b>hydrogen ions</b>, with a few gray Cl<sup>−</sup> circles. In the right <b>base</b> beaker (sodium hydroxide), blue circles labeled OH<sup>−</sup> are <b>hydroxide ions</b>, with gray Na<sup>+</sup> circles. All the ions wobble about freely.</p><p>Notice: acid means red H<sup>+</sup>, base means blue OH<sup>−</sup>.</p>',
      say: 'Look at the two beakers. The left one holds an acid dissolved in water. It is hydrochloric acid. The red circles are hydrogen ions, and they are what make something an acid. The gray circles are chloride ions that came along with them. Now look at the right beaker. It holds a base called sodium hydroxide. The blue circles are hydroxide ions, and the gray circles are sodium ions. All the ions wobble around freely in the water. So here is the big idea. An acid releases hydrogen ions in water. A base releases hydroxide ions. Lemon juice and vinegar are acids. Soap and baking soda are everyday bases.'
    },
    // 2. The pH scale
    {
      explain: '<p>The rainbow bar is the <b>pH scale</b>, from 0 at the red end to 14 at the purple end, with ACIDIC, NEUTRAL and BASIC labels above it. A dark <b>pointer</b> slides along and every couple of seconds lands on a new everyday substance, from stomach acid to bleach, and its label box shows the name and pH.</p><p>Notice that water sits at 7, in the green middle.</p>',
      say: 'This colorful bar is the P H scale. It runs from zero at the red end to fourteen at the purple end. The middle, seven, is green, which means neutral. Now watch the dark pointer. It slides to a new everyday substance every couple of seconds. First comes stomach acid, then lemon juice, vinegar, coffee, and milk, getting closer to neutral. Pure water lands right on seven. After that, baking soda, soap, ammonia, and bleach move into the basic side. Each step on this scale is a tenfold change. So a P H of three is ten times more acidic than a P H of four.'
    },
    // 3. Indicators
    {
      explain: '<p>On the left, a strip of <b>blue litmus paper</b> hangs above <b>lemon juice</b>. On the right, a strip of <b>red litmus paper</b> hangs above <b>soapy water</b>. Each strip dips into its beaker and its wet tip changes color: blue turns <b>red</b> in the acid, red turns <b>blue</b> in the base. A message appears above each strip, then the strips lift out and it repeats.</p>',
      say: 'Look at the two paper strips hanging above the beakers. The left strip is blue litmus paper, and the left beaker holds lemon juice, an acid. The right strip is red litmus paper, and the right beaker holds soapy water, a base. Watch the strips dip into the liquids. The tip of the blue strip turns red in the acid. The tip of the red strip turns blue in the base. Litmus is an indicator, a substance that changes color to reveal acids and bases. Blue turning red means acid. Red turning blue means base. Universal indicator goes further and shows the whole P H rainbow.'
    },
    // 4. Try it: slide the pH
    {
      explain: '<p>Drag the <b>pH slider</b>. In the beaker, red <b>H<sup>+</sup></b> circles and blue <b>OH<sup>−</sup></b> circles bounce around, and the liquid color follows the rainbow bar. Low pH shows many red circles, high pH many blue ones, and pH 7 one of each. The big readout names the pH, acidic, neutral or basic, and a matching everyday liquid.</p>',
      say: 'Now it is your turn. Drag the slider under the beaker. Inside the beaker, the red circles are hydrogen ions, and the blue circles are hydroxide ions. They bounce around, and the liquid changes color to match the scale. At a low P H, you see lots of red hydrogen ions. That is an acid. Slide up to seven, and there is one of each, so the water is neutral. Keep going, and the blue hydroxide ions take over. That is a base. On the right, the readout names the P H and a matching everyday liquid. Remember, this picture is simplified, with far fewer ions than a real solution.'
    },
    // 5. Neutralization
    {
      explain: '<p>The beaker starts as acid: three red <b>H<sup>+</sup></b> and three gray <b>Cl<sup>−</sup></b> ions, and the readout says pH 1. Press <b>Drop base</b> and a dark Na<sup>+</sup> and a blue OH<sup>−</sup> fall in. The OH<sup>−</sup> vanishes and one red circle becomes a pale blue <b>H<sub>2</sub>O</b>, so the pH climbs. <b>Reset</b> starts over.</p><p>Notice: three drops give neutral, more drops give base.</p>',
      say: 'We start with an acid. The beaker holds three red hydrogen ions and three gray chloride ions, and the reading says P H one. Press drop base and watch. A pair falls in from the top. The blue one is a hydroxide ion, and the darker one is a sodium ion. The hydroxide ion grabs a nearby hydrogen ion, and together they turn into a pale blue water molecule. The P H climbs. After three drops, no hydrogen ions or hydroxide ions are left. The liquid is green and neutral. What remains is salt and water. A fourth drop adds too much base, and the P H jumps up.'
    },
    // 6. Real life: Red cabbage juice
    {
      explain: '<p>A beaker of purple <b>red cabbage juice</b> sits on the left. Press <b>Lemon</b>, <b>Water</b>, <b>Baking soda</b> or <b>Soap</b>: a drop falls in and the juice fades to a new color. The rainbow bar on the right has a pointer that slides to the liquid\'s pH, with its name and kind shown above.</p><p>Notice that acids give pink-red and bases give blue-green.</p>',
      say: 'On the left is a beaker of purple red cabbage juice. It is a natural indicator, which means its color depends on the P H of whatever you add. On the right is a color bar with a pointer. Press lemon. A drop falls in, and the juice turns pink red. Lemon juice is an acid. The pointer slides to the acid end of the bar. Now press plain water. The juice goes back to purple, because water is neutral. Baking soda makes it bluer. Soap makes it blue green, because soap is a base. So the color of the juice tells you the P H.'
    },
    // 7. Real life: Sugar, acid and teeth
    {
      explain: '<p>A white <b>tooth</b> sits on the left, with green bacteria beside it. A sugar cube drops in, then red <b>H<sup>+</sup></b> acid circles gather and a brown spot grows on the tooth. On the right, the <b>Mouth pH</b> pointer slides from 7 down to 5, past the dashed 5.5 line. Later a <b>toothbrush</b> sweeps the tooth and the pointer returns to 7.</p>',
      say: 'Look at the tooth on the left, with the little green bacteria around it. Stage one, a sugar cube drops in. The bacteria feed on the sugar. Stage two, red hydrogen ions appear around the tooth. The bacteria are making acid, and a brown spot grows on the tooth to show the damage. On the meter, the pointer slides down from seven to five. It crosses the dashed line at five point five, and below that line, acid can start to wear away tooth enamel. Stage three, a toothbrush sweeps across. Toothpaste is a mild base, so it neutralizes the acid, and the pointer moves back up to seven.'
    },
    // 8. Real life: Garden soil pH
    {
      explain: '<p>A potted <b>hydrangea</b> has a cluster of round blooms that gently sway. Drag the <b>Soil pH</b> slider from 4 to 8. The blooms fade from <b>blue</b> to purple to <b>pink</b>, the pointer moves along the color bar, and the text on the right gives the pH, whether the soil is acidic or basic, and the flower color.</p><p>Notice that acidic soil gives blue flowers.</p>',
      say: 'Look at the hydrangea plant in its pot. Its round flowers sway gently, and right now they are blue. The soil P H is five, so the soil is acidic. Now drag the slider to the right. As the soil P H rises, the blue blooms turn purple, and then pink. The pointer moves along the color bar, and the words on the right tell you the P H and the flower color. Acidic soil gives blue flowers. Basic soil gives pink flowers. Gardeners can add garden lime, which is a base, to raise the soil P H and change the color. So chemistry really does help gardeners.'
    }
  ]);

  addTutorialExplanations('chemistry', 'periodic', [
    // 1. Elements in order
    {
      explain: '<p>A mini periodic table of the first 20 elements. Numbers across the top are <b>groups</b> (columns) and numbers down the left are <b>periods</b> (rows). The cells pop in one at a time, each showing its <b>atomic number</b> above its symbol, from hydrogen at 1 to calcium at 20. A caption then says the number of protons increases. The dashed box is a gap for groups 3 to 12.</p>',
      say: 'Look at this small piece of the periodic table. Along the top are group numbers, which label the columns. Down the left are period numbers, which label the rows. Now watch the boxes pop in, one at a time. Each box shows a small number, the atomic number, and the element symbol. It starts with hydrogen, number one, at the top left. Then helium, number two, appears all the way over on the right. Then the next row begins with lithium. The order goes left to right, then down. At the end, a message says increasing atomic number means more protons.'
    },
    // 2. Groups and periods
    {
      explain: '<p>The same mini table, now with a pulsing orange <b>band</b> around one column or row. The cells inside turn amber and its group or period number turns brown and bigger. Every two seconds the band moves on. <b>Columns</b> mode steps through the groups, and the caption gives the outer electrons. <b>Rows</b> mode steps through the periods, and the caption gives the electron shells.</p><p>Notice that the group number matches the outer electrons.</p>',
      say: 'The table is back, and now a glowing orange band moves across it. Each column is called a group. Every two seconds the band jumps to the next group, and the caption tells you how many outer electrons those elements have. Group one has one outer electron each. Group two has two. Group eighteen has a full outer shell. Elements in the same group behave alike because they have the same number of outer electrons. Now press the rows button. A row is called a period. The band sweeps down through the periods, and the caption gives the number of electron shells.'
    },
    // 3. Metals, metalloids, nonmetals
    {
      explain: '<p>The table starts all gray, then colors fill in with a caption for each. First the <b>metals</b> turn blue: lithium, beryllium, sodium, magnesium, aluminum, potassium and calcium. Next the two <b>metalloids</b>, boron and silicon, turn yellow with thick outlines. Last the <b>nonmetals</b>, including hydrogen, turn teal. A color key sits at the bottom.</p>',
      say: 'Watch the table fill with color. It starts all gray. First, the metals light up in blue. They fill the left and middle of the table. Metals are shiny and good at carrying electricity. Next, two boxes turn yellow with a thick outline. Those are boron and silicon, the metalloids. They sit along a staircase between the metals and the nonmetals, and they have properties of both. Finally, the nonmetals turn teal on the right side. Notice that hydrogen is teal too. It is a nonmetal, even though it sits at the top of group one.'
    },
    // 4. Try it: valence electrons
    {
      explain: '<p>The atom model has a colored <b>nucleus</b> showing the symbol, two gray rings of orbiting electrons, and an outer ring of orange dots: the <b>valence electrons</b>. Drag the <b>Group</b> slider from 1 to 18. The atom changes from sodium to argon, the number of orange dots changes, and the text on the right names the type and what the atom does with its electrons.</p>',
      say: 'Here is a model of an atom. The big purple circle in the middle is the nucleus. Around it, the electrons travel in rings called shells. The gray dots are inner electrons. The orange dots on the outside are valence electrons. Those are the ones that matter in reactions. Now drag the slider. It moves across the groups, from sodium in group one to argon in group eighteen. Watch the orange dots grow from one to eight. The text on the right tells you what each atom tends to do. Sodium loses one electron easily. Chlorine needs just one more. Argon has a full outer shell, so it is very unreactive.'
    },
    // 5. Reactivity trend: alkali metals
    {
      explain: '<p>Three water troughs: <b>lithium</b>, <b>sodium</b> and <b>potassium</b>, each with a gray ball for the metal. Bubbles of hydrogen rise from each ball. Lithium drifts slowly with a few bubbles, sodium zips faster with more, and potassium darts about with many bubbles and a flickering lilac flame. The arrow along the top points toward the most reactive metal.</p>',
      say: 'Look at the three troughs of water. Each one has a small gray ball, which is a piece of a soft metal from group one. On the left is lithium, in the middle is sodium, and on the right is potassium. In every trough, the metal reacts with water and makes bubbles of hydrogen gas. Watch the differences. Lithium drifts slowly and makes a steady fizz. Sodium zips about faster, with more bubbles. Potassium darts around wildly, with lots of bubbles, and a lilac flame appears. Going down group one, the metals get more reactive, because their outer electron is easier to lose. Please never try this yourself.'
    },
    // 6. Real life: Balloons and neon signs
    {
      explain: '<p>On the left, three <b>balloons</b> (red, blue, yellow) bob gently on strings; they hold helium. In the middle is a <b>helium atom</b>: an orange nucleus marked He, with two blue electrons circling inside a dashed ring labeled shell full. On the right, a curving orange <b>neon tube</b> glows and pulses while white sparks run along it.</p><p>Notice that both are Group 18 gases.</p>',
      say: 'Look at the picture from left to right. On the left, three balloons bob up and down. They are filled with helium, a light gas. In the middle is a helium atom. The orange center is the nucleus, and two blue electrons circle around it inside the dashed ring. Two electrons is a full shell for helium. On the right is a glowing sign tube. It holds neon gas, and the white sparks stand for electricity passing through it and making it glow. Helium and neon are noble gases from group eighteen. Their outer shells are full, so they almost never react. That makes them safe for balloons and signs.'
    },
    // 7. Real life: Does it conduct?
    {
      explain: '<p>A simple circuit: a <b>battery</b> on the left, a <b>bulb</b> on top, and a <b>sample bar</b> in the bottom wire. Small blue dots are <b>electrons</b>. Pick a material with the buttons. For copper, aluminum or iron, the electrons stream around the loop and the bulb glows yellow. For sulfur the electrons only jiggle and the bulb stays gray. The text at the top says ON or OFF.</p>',
      say: 'Here is a simple electric circuit. There is a battery on the left, a bulb at the top, and a bar of material in the bottom wire that you can swap. The small blue dots are electrons. Right now the bar is copper. Look, the electrons stream around the loop, and the bulb glows yellow. Copper is a metal, and metals let electrons flow. Now press the sulfur button. The electrons only jiggle in place, and the bulb goes dark. Sulfur is a nonmetal, and it does not conduct. Aluminum foil and iron light the bulb too. That is why wires are made of metal, and plugs are covered in plastic.'
    },
    // 8. Real life: Find the element
    {
      explain: '<p>A mini periodic table of elements 1 to 18, colored by type: blue metals, yellow metalloids, green nonmetals, purple noble gases. Tap an <b>object button</b> and an orange dot flies to the matching element, whose cell turns orange with a pulsing ring. Three lines of text give its name, atomic number, group, period and type.</p>',
      say: 'This is an element scavenger hunt. You see a small periodic table, with colors for metals, metalloids, nonmetals, and noble gases. Underneath are buttons for everyday objects. Press balloon. An orange dot flies up to helium, and its box lights up with a pulsing ring. The text tells you the atomic number, the group, the period, and the type of element. Now try the others. Foil is aluminum, a metal. A pencil is mostly carbon, a nonmetal. A phone battery uses lithium. A computer chip is made from silicon, a metalloid. A glowing sign is neon, another noble gas. Notice that elements in the same column behave alike.'
    }
  ]);
})();
