(function () {
  // explain-chemistry-a: on-screen explanations + spoken scripts, added via addTutorialExplanations(...).

  // ------------------------------------------------------------------
  // ATOMS & ELEMENTS
  // ------------------------------------------------------------------
  addTutorialExplanations('chemistry', 'atoms', [
    // 1. Zoom into an atom
    {
      explain: '<p>This is a <b>carbon atom</b>. The clump in the middle is the <b>nucleus</b>: 6 <b>red protons</b> and 6 <b>grey neutrons</b>. Two rings circle it, and the <b>indigo electrons</b> keep spinning round: 2 on the inner ring, 4 on the outer.</p><p>Notice that 6 protons (+) and 6 electrons (−) balance each other.</p>',
      say: 'Look at the middle of the picture. That clump of balls is the nucleus of a carbon atom. The red balls are protons, and they carry a positive charge. The grey balls are neutrons, and they carry no charge at all. There are six of each. Now watch the two rings. The blue and purple dots are electrons, and they carry a negative charge. Two electrons travel on the inner ring, and four travel on the outer ring. Those rings are called shells. Notice that this atom has six protons and six electrons, so the positive and negative charges cancel out.'
    },
    // 2. Build an atom
    {
      explain: '<p>The <b>red nucleus</b> shows the number of protons, like <b>6p</b>. Press <b>+ Proton</b> or <b>− Proton</b>, or drag the slider, and the name, symbol and <b>indigo electrons</b> update. Electrons fill rings: 2 first, then 8, then 8.</p><p>Notice that changing only the proton number turns the atom into a different element.</p>',
      say: 'This is the atom builder, and right now it shows carbon. Look at the red circle in the middle. It says six p, which means six protons. The number of protons is called the atomic number, and it decides which element the atom is. The blue and purple dots are electrons. A neutral atom has the same number of electrons as protons, so carbon has six. They fill the shells in order, two on the first shell and then up to eight on the second. Now press the plus proton button, or drag the slider. Watch the name change, and watch new electrons fill the outer rings.'
    },
    // 3. Ions
    {
      explain: '<p>Pick an atom with the buttons: <b>Na, Mg, O</b> or <b>Cl</b>. <b>− e<sup>−</sup></b> makes an <b>indigo electron</b> fly away, and <b>+ e<sup>−</sup></b> makes one fly in. The big symbol gains a charge, and the panel counts protons, electrons and net charge.</p><p>Notice that only electrons move, never protons.</p>',
      say: 'Now let us turn atoms into ions. The scene starts with sodium. It has eleven protons and eleven electrons, so the net charge is zero. Look at the outer ring. Sodium has just one electron out there. Press the minus electron button and watch that electron fly away. Now there are eleven protons but only ten electrons, so the atom has a plus one charge. It has become a sodium ion, and its outer shell is full. Protons never move, only electrons do. Next, choose chlorine and press the plus electron button. An extra electron flies in, and it becomes a chloride ion with a minus one charge.'
    },
    // 4. Isotopes
    {
      explain: '<p>The jiggling nucleus holds 6 <b>red protons</b> and some <b>grey neutrons</b>. Drag the slider to change the neutrons from 6 to 8. The name changes from carbon-12 to 13 to 14, and the panel shows <b>mass number = protons + neutrons</b>.</p><p>Notice that the protons stay at 6, so it is always carbon.</p>',
      say: 'Here is carbon again, but this time look closely at the nucleus. It is a jiggling clump of six red protons and some grey neutrons. Right now there are six neutrons, so the label says carbon twelve. The mass number is protons plus neutrons, and six plus six is twelve. Now drag the neutron slider to seven. A new grey ball appears, and the label changes to carbon thirteen. Move it to eight and you get carbon fourteen. Notice that the protons stay at six the whole time, so the atom is always carbon. These different versions of one element are called isotopes.'
    },
    // 5. Periodic table
    {
      explain: '<p>This is the start of the <b>periodic table</b>: the first 20 elements. The <b>purple box</b> counts up one element at a time, and the caption gives its atomic number and proton count. The <b>orange outlines</b> mark H, C, N and O, the main atoms in your body.</p><p>Notice that each step adds exactly one proton.</p>',
      say: 'This is the start of the periodic table, showing the first twenty elements. Watch the colored box count upward, one element at a time, beginning with hydrogen. The number is the atomic number, which is the number of protons. So the caption tells you that hydrogen has exactly one proton, helium has two, and so on. The boxes with orange outlines are hydrogen, carbon, nitrogen, and oxygen. Those four make up most of your body. Notice that each element is just one kind of atom, and the only difference is the proton count. About one hundred kinds of atoms build everything around you.'
    },
    // 6. Neon signs
    {
      explain: '<p>On the left is a <b>neon atom</b> with 10 protons, 2 electrons on the inner ring and 8 on the next. One <b>orange electron</b> jumps out to the dashed outer ring, then falls back. A <b>yellow flash</b> flies to the dark <b>NEON</b> sign, which lights up orange.</p><p>Notice that light appears when the electron drops back.</p>',
      say: 'Look at the neon atom on the left. It has ten protons in the nucleus, two electrons on the inner ring, and eight on the next ring. Watch the orange electron. First, the caption says electric energy makes it jump up to the dashed outer ring. Then it falls back down. When it falls, it gives off that energy as light. See the yellow flash fly across to the sign on the right. The word neon glows bright orange. That is how a neon sign works. Electricity pushes electrons up, and when they fall back, the gas gives off light.'
    },
    // 7. Balloon
    {
      explain: '<p>The <b>orange balloon</b> gets rubbed on the <b>hair</b>. Little <b>indigo electrons</b> hop from the hair to the balloon, which fills with white <b>minus signs</b>. The hair gets red <b>plus signs</b> and reaches up towards the balloon. <b>Rub the balloon</b> again for more charge, and <b>Reset</b> starts over.</p><p>Notice that only electrons move.</p>',
      say: 'Look at the orange balloon and the head of hair. At the start, both are neutral. The scene rubs the balloon on the hair by itself. Watch the little blue and purple dots. Those are electrons, and they hop from the hair onto the balloon. Now the balloon has extra electrons, so it is negative, and you can see minus signs on it. The hair has lost electrons, so it is positive, with plus signs. Opposite charges attract, so the hair reaches up towards the balloon. Try pressing the rub button a few more times and watch the hair rise higher. Only electrons move, never protons.'
    },
    // 8. Atoms in you
    {
      explain: '<p>Colored bars grow one by one to show what a person is made of, <b>by mass</b>: <b>oxygen</b> (red) is longest at 65%, then <b>carbon</b> 18%, <b>hydrogen</b> 10%, <b>nitrogen</b> 3% and <b>others</b> 4%. The bars then shrink and repeat.</p><p>Notice that just four elements make up about 96% of your body.</p>',
      say: 'This bar chart shows what a person is made of, measured by mass. Watch the bars grow one at a time. The longest bar is oxygen, at about sixty five percent. Next is carbon, at eighteen percent, then hydrogen at ten percent, and nitrogen at three percent. All the other elements together, like calcium, make up the last four percent. That means just four kinds of atoms make up about ninety six percent of you. The note at the bottom adds something surprising. Counting atoms instead of mass, hydrogen is the most common, but hydrogen atoms are so light that they add up to only about ten percent of your weight.'
    }
  ]);

  // ------------------------------------------------------------------
  // MOLECULES & BONDING
  // ------------------------------------------------------------------
  addTutorialExplanations('chemistry', 'molecules', [
    // 1. Atoms join up by sharing
    {
      explain: '<p>Two <b>hydrogen atoms</b> (H), each a <b>red nucleus</b> with one <b>indigo electron</b> orbiting inside a light circle, slide together. As the circles overlap, both electrons loop around <b>both</b> nuclei, and the label reads <b>H<sub>2</sub> molecule</b>. Then the atoms drift apart and it repeats.</p><p>Notice that the electrons are shared, not given away.</p>',
      say: 'Look at the two circles. Each one is a hydrogen atom, with a red nucleus in the middle and one blue and purple electron circling it. A hydrogen atom has just one electron, but its shell is happiest with two. Watch what happens as the atoms slide together. The circles overlap, and the two electrons start moving around both nuclei. Now the atoms share a pair of electrons, so each one can count two. That sharing is called a covalent bond, and the joined atoms form a hydrogen molecule. Notice that nothing was given away. The electrons are shared. After a few seconds the atoms drift apart, and the show starts again.'
    },
    // 2. Water is bent
    {
      explain: '<p>The ball-and-stick model of <b>water</b>: one big <b>red oxygen</b> ball on top, two smaller <b>blue-violet hydrogen</b> balls joined by <b>grey sticks</b> (bonds). The hydrogens sway gently. The dashed <b>orange arc</b> marks the angle, about <b>104.5°</b>.</p><p>Notice that the molecule is bent, not a straight line.</p>',
      say: 'This is a model of a water molecule. The big red ball is one oxygen atom. The two smaller balls are hydrogen atoms, and the grey sticks between them are the bonds, where electrons are shared. Look at the shape. It is not a straight line. The two hydrogens sway a little, and the dashed orange arc shows the angle between them, about one hundred and four point five degrees. So water is bent. Now read the formula on the right. It says H 2 O. The small two means two hydrogen atoms, and no number after the O means one oxygen atom.'
    },
    // 3. Ionic bond
    {
      explain: '<p>A <b>sodium</b> atom (left) and a <b>chlorine</b> atom (right) each show three rings of <b>indigo electrons</b>. Press <b>Transfer electron</b>: sodium\'s single <b>orange</b> outer electron flies across to chlorine, the atoms slide closer, and the labels change to <b>Na<sup>+</sup></b> and <b>Cl<sup>−</sup></b>. Green lines and the word <b>attract</b> appear between them. <b>Reset</b> starts again.</p>',
      say: 'Now for a different kind of bond. Look at sodium on the left and chlorine on the right. The caption says sodium has one outer electron, shown in orange, while chlorine has seven and needs eight. Press the transfer electron button and watch. The orange electron flies across to chlorine. Sodium lost an electron, so it becomes a sodium ion with a plus one charge. Chlorine gained one, so it becomes a chloride ion with a minus one charge. The two atoms slide together, and green lines show that opposite charges attract. This is an ionic bond. Here the electron was transferred, not shared. Press reset to watch again.'
    },
    // 4. Reading a formula
    {
      explain: '<p>Pick a molecule: <b>H<sub>2</sub>O</b>, <b>CO<sub>2</sub></b>, <b>CH<sub>4</sub></b> or <b>C<sub>6</sub>H<sub>12</sub>O<sub>6</sub></b>. Colored balls pop up in rows, one row for each atom type (H indigo, O red, C dark grey). A counter beside each row and a total at the bottom show how many.</p><p>Notice that each small number matches its row of balls.</p>',
      say: 'This scene teaches you to read a chemical formula. It starts with water, H 2 O. Watch the balls pop up one by one. The letter H has two blue and purple balls, because the small two counts the hydrogen atoms. The letter O has just one red ball, because when there is no number, it means one. At the bottom, it adds up the total number of atoms in one molecule. Now press the carbon dioxide button. You should see one dark ball for carbon and two red balls for oxygen. Try methane and glucose too, and check that every small number matches the row of balls.'
    },
    // 5. Molecule shapes
    {
      explain: '<p>A rotating <b>ball-and-stick model</b>: <b>red</b> oxygen, <b>dark grey</b> carbon, <b>blue-violet</b> hydrogen, and <b>grey sticks</b> for bonds (double bonds are two lines). Choose H<sub>2</sub>O, CO<sub>2</sub>, CH<sub>4</sub> or O<sub>2</sub>; the panel names it and gives its shape and bond type.</p><p>Notice that shapes are 3D and differ from molecule to molecule.</p>',
      say: 'Here you can spin molecules in three dimensions. The red balls are oxygen atoms, the dark grey ball is carbon, and the smaller balls are hydrogen. The grey sticks are bonds. Where you see two parallel sticks, that is a double bond. The model starts with water. Look at how it is bent. Now press the carbon dioxide button. It is a straight line, with a double bond on each side. Try methane. Its four hydrogens point to the corners of a shape called a tetrahedron. The last button shows oxygen gas, just two oxygen atoms joined by a double bond. Read the panel on the right to see each molecule name and shape.'
    },
    // 6. Why ice floats
    {
      explain: '<p>Each <b>water molecule</b> is a <b>red oxygen</b> ball with two small <b>indigo hydrogens</b>. At 0 °C or below they lock into an open <b>hexagon pattern</b> with <b>dashed lines</b> and gaps, and the water level rises. Slide above 0 °C and they tumble and pack closer, so the level drops.</p><p>Notice that ice takes up more room, so it is less dense.</p>',
      say: 'Look at the beaker. Each little shape is a water molecule, a red oxygen with two small hydrogens. The slider starts at minus six degrees Celsius, so this is ice. The molecules are locked in an open pattern of hexagons, joined by dashed lines, with empty gaps between them. Now drag the temperature slider above zero degrees Celsius. The molecules break out of the pattern, tumble around, and pack closer together. Watch the water level drop. Liquid water takes up less space than the same water as ice. That means ice is less dense than liquid water, so ice floats. The picture exaggerates the gaps to make them easy to see.'
    },
    // 7. Breathing gases
    {
      explain: '<p>Pink <b>lungs</b> swell gently in the middle. On the left, <b>O<sub>2</sub></b> molecules (two red oxygen balls with a double bond) drift towards them: <b>breathe in</b>. On the right, <b>CO<sub>2</sub></b> molecules (a dark carbon ball between two red oxygens) drift away: <b>breathe out</b>.</p><p>Notice that O<sub>2</sub> has two atoms; CO<sub>2</sub> has three.</p>',
      say: 'Look at the pink lungs in the middle. They swell gently as you breathe. On the left, see the pairs of red balls drifting towards the lungs. Each pair is an oxygen molecule, two oxygen atoms joined by a double bond. That is the oxygen you breathe in. On the right, look at the molecules drifting away from the lungs. Each has a dark grey carbon atom in the middle, with an oxygen atom on either side. That is carbon dioxide, which you breathe out. Your cells use oxygen to release energy from food, and they make carbon dioxide as a waste product. So every breath swaps one gas for the other.'
    },
    // 8. Salt vs sugar
    {
      explain: '<p>Choose <b>Salt</b> or <b>Sugar</b>. Salt is a block of <b>orange +</b> and <b>green −</b> ions; sugar is a block of <b>yellow hexagon</b> molecules. Water molecules tumble around, and every second another piece breaks away. The counter shows how many are free. <b>Restart</b> repeats.</p><p>Notice that salt splits into separate ions, but sugar molecules stay whole.</p>',
      say: 'Look at the pile at the bottom of the beaker. It starts as salt. The small orange balls with a plus are sodium ions, and the larger green balls with a minus are chloride ions. Small red and purple water molecules tumble around them. Watch one piece break away every second. Each ion floats off by itself. The counter shows how many are free. Salt is ionic, so water pulls it apart into separate ions. Now press the sugar button. The yellow hexagons are whole sugar molecules. They also break away and spread out, but each one stays in one piece. Both seem to vanish, but for different reasons.'
    }
  ]);

  // ------------------------------------------------------------------
  // MIXTURES & SOLUTIONS
  // ------------------------------------------------------------------
  addTutorialExplanations('chemistry', 'mixtures', [
    // 1. Mixture or compound?
    {
      explain: '<p>The <b>mixture</b> box holds 5 big <b>orange</b> and 3 small <b>blue</b> particles wobbling on their own, in uneven amounts. In the <b>compound</b> box every orange particle is joined to a blue one by a <b>black stick</b> (a bond), 6 pairs in a fixed ratio.</p><p>Notice that only the compound has bonds.</p>',
      say: 'Look at the two boxes. The left box is a mixture. It has five big orange particles and three small blue ones, all wobbling around on their own. Nothing is joined together, and the amounts do not have to match. You could add more of either kind. The right box is a compound. Here every big orange particle is joined to a small blue one by a black stick, which stands for a chemical bond. There is exactly one of each in every pair, so the ratio is fixed. Notice the big difference. In a mixture, the substances are only physically combined and keep their own properties. In a compound, the atoms are chemically bonded.'
    },
    // 2. Sugar dissolving
    {
      explain: '<p>Small <b>blue dots</b> are water; <b>gold dots</b> are sugar, starting as a pile at the bottom. Sugar breaks away and wanders, and the counters track <b>Dissolved</b> and <b>Still solid</b> (total always 24). <b>Stir</b> swings a rod, and the <b>Temp</b> slider changes speed and how much can dissolve.</p><p>Notice that no sugar is lost.</p>',
      say: 'Look at the glass of water. The small blue dots are water particles, and the gold dots in a pile at the bottom are solid sugar. Watch what happens. Little by little, sugar particles break away and wander between the water particles. That is dissolving. The counters on the right show how many are dissolved and how many are still solid, and the total stays at twenty four. No sugar is lost, because dissolving is a physical change. Now press the stir button and watch the rod swing. It speeds things up. Then drag the temperature slider higher. Hot water dissolves sugar faster and can hold more. If you see the word saturated, heat it up.'
    },
    // 3. Even or uneven?
    {
      explain: '<p>In <b>Salt water</b> (left), small blue and grey dots wiggle and are spread evenly through the glass: <b>homogeneous</b>. In <b>Sand and water</b> (right), brown sand grains sink and pile up on the bottom, then the scene repeats: <b>heterogeneous</b>.</p><p>Notice that in a solution you cannot pick out separate parts.</p>',
      say: 'Compare the two glasses. On the left is salt water. The blue and grey dots are the dissolved salt, and they are spread evenly through the whole glass, jiggling around. It looks the same everywhere, so you cannot see separate parts. That is called homogeneous. On the right is sand and water. Watch the brown sand grains. They sink and pile up at the bottom, and then after a few seconds the animation repeats. Here you can clearly see two different parts, so this is called heterogeneous. Notice that a solution is even all the way through, but sand in water is uneven.'
    },
    // 4. Separating mixtures
    {
      explain: '<p>Press a button to see each method run. <b>Filtration</b>: brown sand is caught in the funnel, water drips through. <b>Evaporation</b>: a flame drives water off as steam and white salt crystals remain. <b>Magnet</b>: dark iron filings jump to the magnet, sand stays. <b>Distillation</b>: vapor travels along a tube and drips out as pure water.</p>',
      say: 'This scene shows four ways to pull a mixture apart. It starts with filtration. Look at the funnel. The brown sand grains are caught by the filter paper, but the water passes through and drips into the beaker below. Now press evaporation. A flame heats a dish of salt water. The water leaves as vapor, and white salt crystals are left behind. Try the magnet next. Iron filings jump up to the magnet, while the sand stays put. Finally, press distillation. The water vapor travels along the tube, cools back into a liquid, and drips into the beaker as pure water. Each method uses a physical difference between the parts.'
    },
    // 5. Concentration
    {
      explain: '<p>The beaker\'s <b>blue liquid</b> is the solution and each <b>orange dot</b> is 2 g of solute. The <b>Solute</b> slider adds dots and deepens the blue; the <b>Volume</b> slider changes the water level. The panel divides <b>mass ÷ volume</b> to give the concentration in g/mL.</p><p>Notice that more solute raises it and more water lowers it.</p>',
      say: 'Look at the beaker. The blue liquid is the solution, and each orange dot is a bit of solute, one dot for every two grams. On the right, the scene divides the mass of the solute by the volume of the solution. Right now that is twenty grams divided by two hundred milliliters, which gives zero point one grams per milliliter. That number is the concentration. Now drag the solute slider up. More dots appear, the blue gets deeper, and the concentration rises. Next, drag the volume slider up instead. The same solute is spread through more liquid, so the number falls. Notice that concentration depends on both amounts.'
    },
    // 6. Oil and water
    {
      explain: '<p>A jar of <b>blue water</b> holds <b>yellow oil</b>. It shakes by itself at the start, and <b>Shake the jar!</b> shakes it again. The oil breaks into round <b>droplets</b> that scatter, then rise and merge into a <b>yellow layer on top</b>. The side text changes at each stage.</p><p>Notice that the oil never truly mixes.</p>',
      say: 'Watch the jar. It shakes by itself at the start. The yellow oil breaks into lots of little droplets that scatter through the blue water. For a moment it looks mixed, but it is not. Once the shaking stops, the droplets slowly drift upward, because oil is less dense than water. They reach the top and join together, until you have two separate layers again, with oil floating on water. Liquids that will not mix like this are called immiscible. Press the shake the jar button to try it yourself, and notice that the oil always ends up on top.'
    },
    // 7. Ink chromatography
    {
      explain: '<p>A paper strip hangs in a beaker with a little water. A <b>black ink dot</b> sits on the dashed <b>Start</b> line. Pale blue water climbs the paper, the dot fades, and it splits into <b>yellow</b>, <b>red</b> and <b>blue</b> spots. Yellow travels farthest and blue the least. Then it repeats.</p><p>Notice that the black ink was a mixture of dyes.</p>',
      say: 'Look at the strip of paper hanging in the beaker. It has a black dot of ink on the dashed start line, just above the water. Watch the water climb up the paper. As it rises, it carries the ink with it, and the black dot splits apart. Three colors appear, yellow, red, and blue. Yellow travels the farthest, red goes a medium distance, and blue travels the least. The dyes dissolve differently in the water, so they move at different speeds. This is chromatography. Notice that the black ink was a mixture of dyes all along, and this physical method separated it. Then the animation repeats.'
    },
    // 8. Air
    {
      explain: '<p>The box is a tiny sample of air. <b>Blue pairs</b> are nitrogen, <b>red pairs</b> are oxygen, and the single <b>green ball</b> stands for other gases. They all bounce around freely. The list gives about <b>78%</b>, <b>21%</b> and <b>1%</b>. The buttons fade all but one gas.</p><p>Notice that the gases are mixed, not bonded to each other.</p>',
      say: 'Look inside the box. It is a tiny sample of air. The blue pairs are nitrogen molecules, and there are lots of them. The red pairs are oxygen molecules, and there are fewer. The single green ball stands for the other gases, such as argon. They all bounce around and mix together, but they are not joined to one another. Read the list on the right. Air is about seventy eight percent nitrogen, twenty one percent oxygen, and one percent other gases. Now press one of the buttons, like oxygen. The other gases fade out, so you can follow just that one. Notice that air is a mixture, so each gas keeps its own properties.'
    }
  ]);
})();
