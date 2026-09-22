// English question bank. Reuses shared helpers (randInt, choice, shuffle,
// buildChoices, makeBank, defineTopic) defined in questions.js, which must
// load first. English content is mostly pool-based (curated sentence/word
// banks) rather than numeric, since there's no computation to vary.

// ---- shared word banks / pools --------------------------------------------

const POS_NOUNS = ['freedom', 'teacher', 'kitten', 'mountain', 'curiosity', 'engine', 'whale', 'castle', 'breeze', 'happiness', 'ocean', 'friendship', 'computer', 'garden', 'bicycle'];
const POS_VERBS = ['run', 'whisper', 'soar', 'explain', 'rescue', 'migrate', 'wrap', 'roar', 'travel', 'sing', 'bark', 'play', 'finish', 'surface', 'hide'];
const POS_ADJECTIVES = ['brave', 'ancient', 'gentle', 'enormous', 'nervous', 'fragile', 'colorful', 'ambitious', 'ordinary', 'curious', 'tiny', 'loyal', 'vivid', 'silent', 'graceful'];
const POS_ADVERBS = ['quickly', 'loudly', 'beautifully', 'happily', 'quietly', 'carefully', 'rarely', 'gently', 'bravely', 'silently', 'eagerly', 'slowly', 'softly', 'proudly', 'fiercely'];
const POS_BANKS = { Noun: POS_NOUNS, Verb: POS_VERBS, Adjective: POS_ADJECTIVES, Adverb: POS_ADVERBS };

const SENTENCE_POS_POOL = [
  { sentence: 'The brave firefighter rescued the kitten.', word: 'brave', pos: 'Adjective' },
  { sentence: 'She sings beautifully every morning.', word: 'beautifully', pos: 'Adverb' },
  { sentence: 'The dog barked loudly at the mailman.', word: 'barked', pos: 'Verb' },
  { sentence: 'Happiness is found in small moments.', word: 'Happiness', pos: 'Noun' },
  { sentence: 'He quickly finished his homework.', word: 'quickly', pos: 'Adverb' },
  { sentence: 'The ancient castle stood on the hill.', word: 'ancient', pos: 'Adjective' },
  { sentence: 'They will travel to Paris next summer.', word: 'travel', pos: 'Verb' },
  { sentence: 'The children played happily in the park.', word: 'happily', pos: 'Adverb' },
  { sentence: 'A gentle breeze cooled the warm afternoon.', word: 'gentle', pos: 'Adjective' },
  { sentence: 'The teacher explained the lesson clearly.', word: 'teacher', pos: 'Noun' },
  { sentence: 'We whispered quietly during the movie.', word: 'quietly', pos: 'Adverb' },
  { sentence: 'The enormous whale surfaced near the boat.', word: 'enormous', pos: 'Adjective' },
  { sentence: 'Birds migrate south during winter.', word: 'migrate', pos: 'Verb' },
  { sentence: 'Curiosity drives every great scientist.', word: 'Curiosity', pos: 'Noun' },
  { sentence: 'The nervous puppy hid under the bed.', word: 'nervous', pos: 'Adjective' },
  { sentence: 'She carefully wrapped the fragile gift.', word: 'carefully', pos: 'Adverb' },
  { sentence: 'The engine roared to life.', word: 'roared', pos: 'Verb' },
  { sentence: 'Freedom is a fundamental human right.', word: 'Freedom', pos: 'Noun' },
  { sentence: 'The colorful kite soared above the trees.', word: 'colorful', pos: 'Adjective' },
  { sentence: 'He rarely complains about anything.', word: 'rarely', pos: 'Adverb' },
  { sentence: 'The computer crashed during the storm.', word: 'computer', pos: 'Noun' },
  { sentence: 'She proudly displayed her science project.', word: 'proudly', pos: 'Adverb' },
  { sentence: 'The tiny mouse squeezed through the crack.', word: 'tiny', pos: 'Adjective' },
  { sentence: 'The bicycle wobbled on the gravel path.', word: 'bicycle', pos: 'Noun' },
  { sentence: 'He finished the race eagerly.', word: 'eagerly', pos: 'Adverb' },
  { sentence: 'A loyal friend always tells the truth.', word: 'loyal', pos: 'Adjective' },
  { sentence: 'The ocean sparkled under the afternoon sun.', word: 'ocean', pos: 'Noun' },
  { sentence: 'The nervous student hid her notes.', word: 'hid', pos: 'Verb' },
  { sentence: 'Friendship grows stronger over time.', word: 'Friendship', pos: 'Noun' },
  { sentence: 'The graceful dancer spun across the stage.', word: 'graceful', pos: 'Adjective' },
  { sentence: 'They finished the project slowly but carefully.', word: 'slowly', pos: 'Adverb' },
  { sentence: 'The garden bloomed with vivid tulips.', word: 'vivid', pos: 'Adjective' },
  { sentence: 'The engine roared fiercely down the track.', word: 'fiercely', pos: 'Adverb' },
  { sentence: 'A curious student asked the teacher a question.', word: 'curious', pos: 'Adjective' },
  { sentence: 'The kitten hid silently under the porch.', word: 'silently', pos: 'Adverb' },
  { sentence: 'The mountain climbers reached the summit at dawn.', word: 'climbers', pos: 'Noun' },
  { sentence: 'She will explain the rules before the game starts.', word: 'explain', pos: 'Verb' },
  { sentence: 'The ordinary afternoon turned into an adventure.', word: 'ordinary', pos: 'Adjective' },
  { sentence: 'The whale surfaced gently near the shore.', word: 'gently', pos: 'Adverb' },
  { sentence: 'A castle stood at the edge of the ancient forest.', word: 'castle', pos: 'Noun' },
  { sentence: 'The runners rescue their teammate from behind.', word: 'rescue', pos: 'Verb' }
];

const HOMOGRAPHS = [
  { word: 'light', examples: [
    { sentence: 'Turn on the light in the hallway.', pos: 'Noun' },
    { sentence: 'Please light the candle carefully.', pos: 'Verb' },
    { sentence: 'This box is surprisingly light.', pos: 'Adjective' }
  ]},
  { word: 'run', examples: [
    { sentence: 'I go for a run every morning.', pos: 'Noun' },
    { sentence: 'They run to school together.', pos: 'Verb' }
  ]},
  { word: 'fast', examples: [
    { sentence: 'She is a fast runner.', pos: 'Adjective' },
    { sentence: 'He ran fast to catch the bus.', pos: 'Adverb' }
  ]},
  { word: 'well', examples: [
    { sentence: 'She sings well.', pos: 'Adverb' },
    { sentence: 'They drew water from the well.', pos: 'Noun' }
  ]},
  { word: 'bark', examples: [
    { sentence: 'The bark of the old oak tree was rough.', pos: 'Noun' },
    { sentence: 'Dogs bark loudly at strangers.', pos: 'Verb' }
  ]},
  { word: 'watch', examples: [
    { sentence: 'She wears a silver watch on her wrist.', pos: 'Noun' },
    { sentence: 'Watch the road carefully before crossing.', pos: 'Verb' }
  ]},
  { word: 'point', examples: [
    { sentence: 'He made a good point during the debate.', pos: 'Noun' },
    { sentence: 'She will point to the correct answer.', pos: 'Verb' }
  ]},
  { word: 'record', examples: [
    { sentence: 'He set a new record in the race.', pos: 'Noun' },
    { sentence: 'Please record the meeting for the absent students.', pos: 'Verb' }
  ]},
  { word: 'object', examples: [
    { sentence: 'The strange object on the table was a lamp.', pos: 'Noun' },
    { sentence: 'Several parents object to the new rule.', pos: 'Verb' }
  ]},
  { word: 'present', examples: [
    { sentence: 'She opened her birthday present.', pos: 'Noun' },
    { sentence: 'They will present their project tomorrow.', pos: 'Verb' },
    { sentence: 'All the students were present today.', pos: 'Adjective' }
  ]},
  { word: 'close', examples: [
    { sentence: 'Please close the door behind you.', pos: 'Verb' },
    { sentence: 'We live close to the school.', pos: 'Adjective' }
  ]},
  { word: 'second', examples: [
    { sentence: 'Wait just a second before you leave.', pos: 'Noun' },
    { sentence: 'She finished the race in second place.', pos: 'Adjective' }
  ]},
  { word: 'train', examples: [
    { sentence: 'The train arrived at the station on time.', pos: 'Noun' },
    { sentence: 'Athletes train every single day.', pos: 'Verb' }
  ]},
  { word: 'address', examples: [
    { sentence: 'Write your address on the envelope.', pos: 'Noun' },
    { sentence: 'The mayor will address the crowd tonight.', pos: 'Verb' }
  ]},
  { word: 'park', examples: [
    { sentence: 'We had a picnic in the park.', pos: 'Noun' },
    { sentence: 'Please park the car outside the garage.', pos: 'Verb' }
  ]},
  { word: 'spring', examples: [
    { sentence: 'Flowers bloom in the spring.', pos: 'Noun' },
    { sentence: 'The cat will spring onto the couch.', pos: 'Verb' }
  ]},
  { word: 'iron', examples: [
    { sentence: 'The old gate was made of iron.', pos: 'Noun' },
    { sentence: 'She will iron her shirt before school.', pos: 'Verb' }
  ]}
];

const BLANK_TEMPLATES = [
  { template: 'The ___ dog barked loudly.', blankPOS: 'Adjective' },
  { template: 'She wore a ___ dress to the party.', blankPOS: 'Adjective' },
  { template: 'The ___ mountain was covered in snow.', blankPOS: 'Adjective' },
  { template: 'He gave a ___ speech at the ceremony.', blankPOS: 'Adjective' },
  { template: 'The soup tasted ___ after adding spices.', blankPOS: 'Adjective' },
  { template: 'They live in a ___ house near the lake.', blankPOS: 'Adjective' },
  { template: 'The ___ students finished their test early.', blankPOS: 'Adjective' },
  { template: 'A ___ wind blew through the valley.', blankPOS: 'Adjective' },
  { template: 'The movie had a ___ ending.', blankPOS: 'Adjective' },
  { template: 'She ___ finished her homework.', blankPOS: 'Adverb' },
  { template: 'The children played ___ in the yard.', blankPOS: 'Adverb' },
  { template: 'He ___ answered the difficult question.', blankPOS: 'Adverb' },
  { template: 'The dancer moved ___ across the stage.', blankPOS: 'Adverb' },
  { template: 'They ___ agreed to the new plan.', blankPOS: 'Adverb' },
  { template: 'The old man walked ___ down the street.', blankPOS: 'Adverb' },
  { template: 'She ___ smiled at the compliment.', blankPOS: 'Adverb' },
  { template: 'The team celebrated ___ after the win.', blankPOS: 'Adverb' },
  { template: 'He ___ finished the marathon.', blankPOS: 'Adverb' },
  { template: 'The ___ crossed the finish line first.', blankPOS: 'Noun' },
  { template: 'The ___ barked at the mail carrier.', blankPOS: 'Noun' },
  { template: 'A ___ flew high over the mountains.', blankPOS: 'Noun' },
  { template: 'The ___ explained the homework assignment.', blankPOS: 'Noun' },
  { template: 'My favorite ___ is sitting on the shelf.', blankPOS: 'Noun' },
  { template: 'The ___ rescued the family from the fire.', blankPOS: 'Noun' },
  { template: 'A ___ splashed in the pool all afternoon.', blankPOS: 'Noun' },
  { template: 'The ___ won first prize at the fair.', blankPOS: 'Noun' },
  { template: 'Her ___ was the topic of the essay.', blankPOS: 'Noun' },
  { template: 'They ___ to the store every weekend.', blankPOS: 'Verb' },
  { template: 'The birds ___ south every winter.', blankPOS: 'Verb' },
  { template: 'She will ___ the letter tomorrow.', blankPOS: 'Verb' },
  { template: 'The children ___ happily in the pool.', blankPOS: 'Verb' },
  { template: 'He decided to ___ the mountain trail.', blankPOS: 'Verb' },
  { template: 'The team will ___ the game this weekend.', blankPOS: 'Verb' },
  { template: 'We ___ dinner together every night.', blankPOS: 'Verb' },
  { template: 'The cat likes to ___ on the windowsill.', blankPOS: 'Verb' },
  { template: 'They ___ the entire book in one day.', blankPOS: 'Verb' }
];

// ---- Parts of Speech ---------------------------------------------------------

const partsOfSpeechTemplates = [
  { bloom: 'Remember', gen: () => {
    const facts = [
      { q: 'Which part of speech names a person, place, thing, or idea?', correct: 'Noun' },
      { q: 'Which part of speech is used to name people, animals, places, things, and ideas?', correct: 'Noun' },
      { q: 'Which part of speech can be the subject of a sentence?', correct: 'Noun' },
      { q: 'Which part of speech can be made plural by adding -s or -es?', correct: 'Noun' },
      { q: 'Which part of speech answers the question "who" or "what" in a sentence?', correct: 'Noun' },
      { q: 'Which part of speech is capitalized when it names a specific person or place, like "Texas" or "Maria"?', correct: 'Noun' },
      { q: 'Which part of speech can follow an article like "the," "a," or "an"?', correct: 'Noun' },
      { q: 'Which part of speech can show possession by adding an apostrophe and an s, like "dog\'s"?', correct: 'Noun' },
      { q: 'Which part of speech can be replaced by a pronoun like "it," "she," or "they"?', correct: 'Noun' },
      { q: 'Which part of speech names an abstract concept, like "freedom" or "happiness"?', correct: 'Noun' },
      { q: 'Which part of speech describes an action or state of being?', correct: 'Verb' },
      { q: 'Which part of speech changes form to show past, present, or future tense?', correct: 'Verb' },
      { q: 'Which part of speech is the main word in the predicate of a sentence?', correct: 'Verb' },
      { q: 'Which part of speech tells what the subject of a sentence does or is?', correct: 'Verb' },
      { q: 'Which part of speech can be either an action word or a linking word, like "run" or "is"?', correct: 'Verb' },
      { q: 'Which part of speech often ends in -ed to show that something already happened?', correct: 'Verb' },
      { q: 'Which part of speech must agree in number with its subject, as in "he runs" versus "they run"?', correct: 'Verb' },
      { q: 'Which part of speech is required, along with a subject, to form a complete sentence?', correct: 'Verb' },
      { q: 'Which part of speech can show an action still happening by adding -ing?', correct: 'Verb' },
      { q: 'Which part of speech links the subject to more information about it, like "is," "seems," or "became"?', correct: 'Verb' },
      { q: 'Which part of speech describes or modifies a noun?', correct: 'Adjective' },
      { q: 'Which part of speech answers "what kind," "which one," or "how many" about a noun?', correct: 'Adjective' },
      { q: 'Which part of speech usually comes right before the noun it describes?', correct: 'Adjective' },
      { q: 'Which part of speech can be compared using -er and -est, like "faster" and "fastest"?', correct: 'Adjective' },
      { q: 'Which part of speech gives extra detail about a person, place, or thing?', correct: 'Adjective' },
      { q: 'Which part of speech can follow a linking verb to describe the subject, as in "The soup is hot"?', correct: 'Adjective' },
      { q: 'Which part of speech tells the color, size, or shape of a noun?', correct: 'Adjective' },
      { q: 'Which part of speech can be formed by adding -ful or -ous to a noun, like "joyful" or "dangerous"?', correct: 'Adjective' },
      { q: 'Which part of speech modifies a noun or a pronoun?', correct: 'Adjective' },
      { q: 'Which part of speech tells how many or what kind right before a noun, like "three" or "red"?', correct: 'Adjective' },
      { q: 'Which part of speech describes or modifies a verb, adjective, or other adverb?', correct: 'Adverb' },
      { q: 'Which part of speech answers "how," "when," "where," or "to what extent"?', correct: 'Adverb' },
      { q: 'Which part of speech often ends in -ly?', correct: 'Adverb' },
      { q: 'Which part of speech can modify an entire sentence, as in "Honestly, I forgot"?', correct: 'Adverb' },
      { q: 'Which part of speech tells how often something happens, like "always" or "rarely"?', correct: 'Adverb' },
      { q: 'Which part of speech describes the manner in which an action is performed?', correct: 'Adverb' },
      { q: 'Which part of speech can be compared using "more" and "most," like "more quickly"?', correct: 'Adverb' },
      { q: 'Which part of speech tells the degree or intensity of an adjective, like "very" or "extremely"?', correct: 'Adverb' },
      { q: 'Which part of speech tells where an action takes place, like "outside" or "nearby"?', correct: 'Adverb' },
      { q: 'Which part of speech tells when an action takes place, like "yesterday" or "soon"?', correct: 'Adverb' }
    ];
    const f = choice(facts);
    const wrongs = ['Noun', 'Verb', 'Adjective', 'Adverb'].filter(p => p !== f.correct);
    const choices = shuffle([f.correct, ...wrongs]);
    return { prompt: f.q, type: 'mcq', choices, correct: f.correct, explanation: `${f.correct} matches this definition.` };
  }},
  { bloom: 'Understand', gen: () => {
    const entry = choice(SENTENCE_POS_POOL);
    const wrongs = ['Noun', 'Verb', 'Adjective', 'Adverb'].filter(p => p !== entry.pos);
    const choices = shuffle([entry.pos, ...wrongs]);
    return {
      prompt: `In the sentence "${entry.sentence}", what part of speech is the word "${entry.word}"?`,
      type: 'mcq',
      choices,
      correct: entry.pos,
      explanation: `"${entry.word}" is a ${entry.pos.toLowerCase()} in this sentence.`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const pos = ['Noun', 'Verb', 'Adjective', 'Adverb'];
    const words = pos.map(p => choice(POS_BANKS[p]));
    const targetIndex = randInt(0, 3);
    const targetPOS = pos[targetIndex];
    return {
      prompt: `Which of these words is a ${targetPOS.toLowerCase()}: ${words.join(', ')}?`,
      type: 'mcq',
      choices: shuffle(words),
      correct: words[targetIndex],
      explanation: `"${words[targetIndex]}" is the ${targetPOS.toLowerCase()} in this list.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const entry = choice(SENTENCE_POS_POOL);
    const otherPOS = ['Noun', 'Verb', 'Adjective', 'Adverb'].filter(p => p !== entry.pos);
    const wrongPOS = choice(otherPOS);
    const correct = `${entry.pos} — not ${wrongPOS}`;
    const wrongs = otherPOS.filter(p => p !== wrongPOS).map(p => `${p} — not ${wrongPOS}`);
    wrongs.push(`${wrongPOS} is correct as labeled`);
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `A student labeled the word "${entry.word}" in "${entry.sentence}" as a ${wrongPOS.toLowerCase()}. What is the CORRECT part of speech?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `"${entry.word}" functions as a ${entry.pos.toLowerCase()} in this sentence, not a ${wrongPOS.toLowerCase()}.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const h = choice(HOMOGRAPHS);
    const target = choice(h.examples);
    const sameWordWrongs = h.examples.filter(e => e !== target).map(e => e.sentence);
    const otherPool = HOMOGRAPHS.filter(x => x !== h).reduce((acc, x) => acc.concat(x.examples.map(e => e.sentence)), []);
    const filler = shuffle(otherPool).slice(0, 3 - sameWordWrongs.length);
    const choices = shuffle([target.sentence, ...sameWordWrongs, ...filler]);
    return {
      prompt: `Which sentence uses the word "${h.word}" as a${/^[aeiou]/i.test(target.pos) ? 'n' : ''} ${target.pos.toLowerCase()}?`,
      type: 'mcq',
      choices,
      correct: target.sentence,
      explanation: `In "${target.sentence}", "${h.word}" functions as a${/^[aeiou]/i.test(target.pos) ? 'n' : ''} ${target.pos.toLowerCase()}.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const t = choice(BLANK_TEMPLATES);
    const correctWord = choice(POS_BANKS[t.blankPOS]);
    const otherPOS = Object.keys(POS_BANKS).filter(p => p !== t.blankPOS);
    const distractorWords = otherPOS.map(p => choice(POS_BANKS[p]));
    const choices = shuffle([correctWord, ...distractorWords]);
    return {
      prompt: `Which word correctly completes the sentence (it needs a ${t.blankPOS.toLowerCase()}): "${t.template}"`,
      type: 'mcq',
      choices,
      correct: correctWord,
      explanation: `"${correctWord}" is a ${t.blankPOS.toLowerCase()}, which fits the blank in "${t.template.replace('___', correctWord)}"`
    };
  }}
];

// ---- Sentence Structure -------------------------------------------------------

const SUBJECT_PREDICATE_POOL = [
  { sentence: 'The little girl skipped happily down the street.', subject: 'The little girl', predicate: 'skipped happily down the street' },
  { sentence: 'My best friend called me yesterday.', subject: 'My best friend', predicate: 'called me yesterday' },
  { sentence: 'The old wooden bridge creaked in the wind.', subject: 'The old wooden bridge', predicate: 'creaked in the wind' },
  { sentence: 'A curious kitten explored the empty box.', subject: 'A curious kitten', predicate: 'explored the empty box' },
  { sentence: 'Our teacher explained the new lesson.', subject: 'Our teacher', predicate: 'explained the new lesson' },
  { sentence: 'The loud thunder scared the puppy.', subject: 'The loud thunder', predicate: 'scared the puppy' },
  { sentence: 'The bright yellow bus arrived early today.', subject: 'The bright yellow bus', predicate: 'arrived early today' },
  { sentence: 'Several hungry seagulls circled the fishing boat.', subject: 'Several hungry seagulls', predicate: 'circled the fishing boat' },
  { sentence: 'My little brother built a tower out of blocks.', subject: 'My little brother', predicate: 'built a tower out of blocks' },
  { sentence: 'The tired hikers finally reached the summit.', subject: 'The tired hikers', predicate: 'finally reached the summit' },
  { sentence: 'The young artist painted a colorful mural.', subject: 'The young artist', predicate: 'painted a colorful mural' },
  { sentence: "Our neighbor's cat climbed the tall fence.", subject: "Our neighbor's cat", predicate: 'climbed the tall fence' },
  { sentence: 'The excited fans cheered for their team.', subject: 'The excited fans', predicate: 'cheered for their team' },
  { sentence: 'A sudden storm flooded the narrow street.', subject: 'A sudden storm', predicate: 'flooded the narrow street' },
  { sentence: 'The determined runner trained every single morning.', subject: 'The determined runner', predicate: 'trained every single morning' },
  { sentence: 'The shy new student sat quietly in the corner.', subject: 'The shy new student', predicate: 'sat quietly in the corner' },
  { sentence: 'Several hungry raccoons raided the campsite overnight.', subject: 'Several hungry raccoons', predicate: 'raided the campsite overnight' },
  { sentence: 'The town council approved the new park design.', subject: 'The town council', predicate: 'approved the new park design' },
  { sentence: 'My grandfather tells the funniest stories at dinner.', subject: 'My grandfather', predicate: 'tells the funniest stories at dinner' },
  { sentence: 'The brave firefighters entered the burning building.', subject: 'The brave firefighters', predicate: 'entered the burning building' },
  { sentence: 'The curious scientist studied the strange rock formation.', subject: 'The curious scientist', predicate: 'studied the strange rock formation' },
  { sentence: 'A gentle rain fell across the quiet valley.', subject: 'A gentle rain', predicate: 'fell across the quiet valley' },
  { sentence: 'The talented chef prepared a delicious three-course meal.', subject: 'The talented chef', predicate: 'prepared a delicious three-course meal' },
  { sentence: 'The whole neighborhood gathered for the summer festival.', subject: 'The whole neighborhood', predicate: 'gathered for the summer festival' },
  { sentence: 'The nervous actor forgot his lines on stage.', subject: 'The nervous actor', predicate: 'forgot his lines on stage' },
  { sentence: 'A flock of geese flew over the frozen lake.', subject: 'A flock of geese', predicate: 'flew over the frozen lake' }
];

const SENTENCE_TYPE_POOL = [
  { sentence: 'The cat slept.', type: 'Simple' },
  { sentence: 'Birds fly south in winter.', type: 'Simple' },
  { sentence: 'She loves reading mystery novels.', type: 'Simple' },
  { sentence: 'The old bridge collapsed suddenly.', type: 'Simple' },
  { sentence: 'The children played in the park all afternoon.', type: 'Simple' },
  { sentence: 'My grandmother bakes bread every Sunday morning.', type: 'Simple' },
  { sentence: 'I wanted to go for a walk, but it started raining.', type: 'Compound' },
  { sentence: 'She studied hard, so she passed the test.', type: 'Compound' },
  { sentence: 'He likes tea, and she prefers coffee.', type: 'Compound' },
  { sentence: 'We could stay home, or we could go to the movies.', type: 'Compound' },
  { sentence: 'The rain stopped, yet the streets stayed flooded for hours.', type: 'Compound' },
  { sentence: 'The alarm went off, but nobody woke up in time.', type: 'Compound' },
  { sentence: 'Although it was raining, we went for a walk.', type: 'Complex' },
  { sentence: 'Because she studied hard, she passed the test.', type: 'Complex' },
  { sentence: 'When the bell rang, the students rushed outside.', type: 'Complex' },
  { sentence: 'The book that I borrowed is overdue.', type: 'Complex' },
  { sentence: 'Since the bus was late, we missed the first period of class.', type: 'Complex' },
  { sentence: 'While the soup simmered, she chopped vegetables for the salad.', type: 'Complex' },
  { sentence: 'Although it was raining, we went for a walk, and we got soaked.', type: 'Compound-complex' },
  { sentence: 'Because she studied hard, she passed the test, and her parents were proud.', type: 'Compound-complex' },
  { sentence: 'When the bell rang, the students rushed outside, but the teacher called them back.', type: 'Compound-complex' },
  { sentence: 'I wanted to go for a walk, but it started raining, so I stayed inside.', type: 'Compound-complex' },
  { sentence: 'Since the bus was late, we missed class, and the teacher marked us absent.', type: 'Compound-complex' },
  { sentence: 'While the soup simmered, she chopped vegetables, and the kitchen filled with steam.', type: 'Compound-complex' },
  { sentence: 'The puppy chased its tail in circles.', type: 'Simple' },
  { sentence: 'Our team practices every Tuesday afternoon.', type: 'Simple' },
  { sentence: 'The museum displays ancient pottery from Greece.', type: 'Simple' },
  { sentence: 'He wanted a snack, so he grabbed an apple.', type: 'Compound' },
  { sentence: 'The lights flickered, and then the power went out.', type: 'Compound' },
  { sentence: 'She can play the guitar, or she can sing instead.', type: 'Compound' },
  { sentence: 'Before the game started, the players stretched carefully.', type: 'Complex' },
  { sentence: 'The cake that Grandma baked disappeared within minutes.', type: 'Complex' },
  { sentence: 'Unless we leave now, we will miss the bus.', type: 'Complex' },
  { sentence: 'Before the game started, the players stretched, and the coach reviewed the plan.', type: 'Compound-complex' },
  { sentence: 'The cake that Grandma baked disappeared quickly, so nobody got a second slice.', type: 'Compound-complex' },
  { sentence: 'Unless we leave now, we will miss the bus, and the trip will be ruined.', type: 'Compound-complex' }
];

const ERROR_SCENARIOS = [
  { bad: 'I like pizza, I also like pasta.', errorName: 'Comma splice', fix: 'I like pizza, and I also like pasta.' },
  { bad: 'The dog ran fast it caught the ball.', errorName: 'Run-on sentence', fix: 'The dog ran fast, and it caught the ball.' },
  { bad: 'Because it was raining outside.', errorName: 'Sentence fragment', fix: 'Because it was raining outside, we stayed home.' },
  { bad: 'She loves music, she plays piano every day.', errorName: 'Comma splice', fix: 'She loves music, and she plays piano every day.' },
  { bad: 'The movie was long we still enjoyed it.', errorName: 'Run-on sentence', fix: 'The movie was long, but we still enjoyed it.' },
  { bad: 'Walking home after the game in the dark.', errorName: 'Sentence fragment', fix: 'We walked home after the game in the dark.' },
  { bad: 'The kids were tired, they still wanted dessert.', errorName: 'Comma splice', fix: 'The kids were tired, but they still wanted dessert.' },
  { bad: 'The bus arrived early we all rushed to catch it.', errorName: 'Run-on sentence', fix: 'The bus arrived early, so we all rushed to catch it.' },
  { bad: 'Even though the test was hard.', errorName: 'Sentence fragment', fix: 'Even though the test was hard, she still passed.' },
  { bad: 'He finished his chores, he went outside to play.', errorName: 'Comma splice', fix: 'He finished his chores, and he went outside to play.' },
  { bad: 'The lights went out the whole house went dark.', errorName: 'Run-on sentence', fix: 'The lights went out, and the whole house went dark.' },
  { bad: 'Running late for the bus every single morning.', errorName: 'Sentence fragment', fix: 'She was running late for the bus every single morning.' },
  { bad: 'The garden was beautiful, everyone wanted to see it.', errorName: 'Comma splice', fix: 'The garden was beautiful, so everyone wanted to see it.' },
  { bad: 'The fire alarm rang everyone left the building calmly.', errorName: 'Run-on sentence', fix: 'The fire alarm rang, and everyone left the building calmly.' },
  { bad: 'Before the sun rose over the quiet hills.', errorName: 'Sentence fragment', fix: 'Before the sun rose over the quiet hills, the farmers were already awake.' },
  { bad: 'The coach blew the whistle, the players lined up.', errorName: 'Comma splice', fix: 'The coach blew the whistle, and the players lined up.' },
  { bad: 'The power flickered the lights dimmed for a second.', errorName: 'Run-on sentence', fix: 'The power flickered, and the lights dimmed for a second.' },
  { bad: 'Hiking up the steep, rocky trail before breakfast.', errorName: 'Sentence fragment', fix: 'We went hiking up the steep, rocky trail before breakfast.' },
  { bad: 'The bakery smelled wonderful, customers lined up outside.', errorName: 'Comma splice', fix: 'The bakery smelled wonderful, so customers lined up outside.' },
  { bad: 'The waves crashed loudly nobody could hear the music.', errorName: 'Run-on sentence', fix: 'The waves crashed loudly, so nobody could hear the music.' },
  { bad: 'The rain finally stopped, everyone went back outside.', errorName: 'Comma splice', fix: 'The rain finally stopped, so everyone went back outside.' },
  { bad: 'The team lost the game they still celebrated together.', errorName: 'Run-on sentence', fix: 'The team lost the game, but they still celebrated together.' },
  { bad: 'While waiting for the bus in the pouring rain.', errorName: 'Sentence fragment', fix: 'While waiting for the bus in the pouring rain, we got soaked.' },
  { bad: 'The concert was loud, the crowd sang along anyway.', errorName: 'Comma splice', fix: 'The concert was loud, but the crowd sang along anyway.' },
  { bad: 'The printer jammed again nobody knew how to fix it.', errorName: 'Run-on sentence', fix: 'The printer jammed again, and nobody knew how to fix it.' },
  { bad: 'A small cabin hidden deep in the snowy woods.', errorName: 'Sentence fragment', fix: 'We found a small cabin hidden deep in the snowy woods.' },
  { bad: 'The recipe looked simple, it took three hours to make.', errorName: 'Comma splice', fix: 'The recipe looked simple, but it took three hours to make.' },
  { bad: 'The car wouldn\'t start we had to call for help.', errorName: 'Run-on sentence', fix: 'The car wouldn\'t start, so we had to call for help.' },
  { bad: 'Trying to finish the puzzle before dinner was ready.', errorName: 'Sentence fragment', fix: 'She was trying to finish the puzzle before dinner was ready.' },
  { bad: 'The crowd grew restless, the show still hadn\'t started.', errorName: 'Comma splice', fix: 'The crowd grew restless because the show still hadn\'t started.' },
  { bad: 'The phone rang twice nobody answered it.', errorName: 'Run-on sentence', fix: 'The phone rang twice, but nobody answered it.' },
  { bad: 'Especially during the busiest hours of the morning commute.', errorName: 'Sentence fragment', fix: 'The traffic was terrible, especially during the busiest hours of the morning commute.' },
  { bad: 'The bell rang, the students kept working anyway.', errorName: 'Comma splice', fix: 'The bell rang, but the students kept working anyway.' },
  { bad: 'The ice cracked loudly everyone skated toward the shore.', errorName: 'Run-on sentence', fix: 'The ice cracked loudly, so everyone skated toward the shore.' }
];

const FRAGMENTS_POOL = [
  'Running through the park.',
  'Because I was tired.',
  'The big red house on the corner.',
  'Since she left early for work.',
  'Eating breakfast quickly before the bus arrived.',
  'Under the old oak tree in the backyard.',
  'After the movie ended late at night.',
  'The tall stranger by the door.',
  'Waiting patiently in the long line.',
  'Although the storm had already passed.',
  'A box of old photographs in the attic.',
  'Jumping over the fence to catch the ball.',
  'While the kettle boiled on the stove.',
  'The quiet street near the old school.',
  'Searching everywhere for the missing keys.'
];

const COMBINE_PAIRS = [
  { a: 'I wanted to go for a walk', b: 'it started raining', conj: 'but' },
  { a: 'She studied hard', b: 'she passed the test', conj: 'so' },
  { a: 'He likes tea', b: 'she prefers coffee', conj: 'and' },
  { a: 'We could stay home', b: 'we could go to the movies', conj: 'or' },
  { a: 'The power went out', b: 'we lit some candles', conj: 'so' },
  { a: 'I finished my homework', b: 'I watched a movie', conj: 'and' },
  { a: 'The team practiced all week', b: 'they still lost the game', conj: 'but' },
  { a: 'You can call me tonight', b: 'you can email me tomorrow', conj: 'or' },
  { a: 'The dog barked loudly', b: 'the mail carrier kept walking', conj: 'but' },
  { a: 'She saved her allowance', b: 'she bought a new bike', conj: 'so' },
  { a: 'We packed an umbrella', b: 'it never rained', conj: 'but' },
  { a: 'The chef added more spice', b: 'the dish tasted better', conj: 'and' },
  { a: 'You can take the bus', b: 'you can walk to school', conj: 'or' },
  { a: 'The crowd cheered loudly', b: 'the players felt encouraged', conj: 'so' },
  { a: 'The movie was long', b: 'nobody wanted to leave', conj: 'but' },
  { a: 'The garden needed water', b: 'the plants would wilt', conj: 'or' },
  { a: 'The library closed early', b: 'we finished our project at home', conj: 'so' },
  { a: 'The wind picked up', b: 'the kite soared higher', conj: 'and' },
  { a: 'She practiced piano daily', b: 'her skills improved quickly', conj: 'so' },
  { a: 'The road was icy', b: 'traffic moved very slowly', conj: 'so' },
  { a: 'The bell rang', b: 'the students rushed to lunch', conj: 'so' },
  { a: 'He forgot his lines', b: 'the audience still applauded', conj: 'but' },
  { a: 'You can study tonight', b: 'you can study tomorrow morning', conj: 'or' },
  { a: 'The waves grew rough', b: 'the sailors lowered the sails', conj: 'so' },
  { a: 'The bakery ran out of bread', b: 'customers kept coming in', conj: 'but' },
  { a: 'We can watch a movie', b: 'we can play a board game', conj: 'or' },
  { a: 'The volcano had been silent for years', b: 'scientists still monitored it closely', conj: 'but' },
  { a: 'The coach blew the whistle', b: 'the players lined up quickly', conj: 'and' },
  { a: 'The battery died', b: 'the flashlight stopped working', conj: 'so' },
  { a: 'She could take the elevator', b: 'she could climb the stairs', conj: 'or' },
  { a: 'The fog rolled in', b: 'the ferry delayed its departure', conj: 'so' },
  { a: 'The puppy chewed the shoe', b: 'nobody scolded him', conj: 'but' },
  { a: 'The comet appeared briefly', b: 'astronomers rushed to photograph it', conj: 'and' },
  { a: 'The museum was closing soon', b: 'we hurried through the last exhibit', conj: 'so' }
];

const SENTENCE_TERM_FACTS = [
  { q: 'What is the term for the part of a sentence that tells WHO or WHAT the sentence is about?', correct: 'Subject' },
  { q: 'What is the term for the part of a sentence that tells what the subject DOES or IS?', correct: 'Predicate' },
  { q: 'What is the term for a group of words with both a subject and a verb?', correct: 'Clause' },
  { q: 'What is the term for a group of related words that does NOT have both a subject and a verb?', correct: 'Phrase' },
  { q: 'What is the term for a clause that can stand alone as a complete sentence?', correct: 'Independent clause' },
  { q: 'What is the term for a clause that cannot stand alone and depends on another clause to form a complete sentence?', correct: 'Dependent clause' },
  { q: 'What is the term for a sentence with just one independent clause and no dependent clauses?', correct: 'Simple sentence' },
  { q: 'What is the term for a sentence made of two or more independent clauses joined by a conjunction?', correct: 'Compound sentence' },
  { q: 'What is the term for a sentence with one independent clause and at least one dependent clause?', correct: 'Complex sentence' },
  { q: 'What is the term for a sentence with at least two independent clauses AND at least one dependent clause?', correct: 'Compound-complex sentence' },
  { q: 'What is the term for a word like "and," "but," or "so" that joins two independent clauses?', correct: 'Coordinating conjunction' },
  { q: 'What is the term for a word like "because," "although," or "when" that begins a dependent clause?', correct: 'Subordinating conjunction' },
  { q: 'What do we call the main noun or pronoun that performs the action in a sentence?', correct: 'Simple subject' },
  { q: 'What do we call the main verb in the predicate that shows the action or state of being?', correct: 'Simple predicate' },
  { q: 'What is the term for a sentence that incorrectly joins two independent clauses with only a comma?', correct: 'Comma splice' },
  { q: 'What is the term for a sentence that incorrectly joins two independent clauses with no punctuation at all?', correct: 'Run-on sentence' },
  { q: 'What is the term for an incomplete sentence that is missing a subject, a verb, or a complete thought?', correct: 'Sentence fragment' },
  { q: 'What term names the part of a sentence that the rest of the sentence tells us about?', correct: 'Subject' },
  { q: 'What term names the part of a sentence that contains the verb and tells what happens?', correct: 'Predicate' },
  { q: 'What is the term for a group of words containing a subject and a verb together?', correct: 'Clause' },
  { q: 'What is the term for a group of words that acts as a single part of speech but lacks a subject-verb pair?', correct: 'Phrase' },
  { q: 'What is the term for a clause that expresses a complete thought all on its own?', correct: 'Independent clause' },
  { q: 'What is the term for a clause that needs to be attached to an independent clause to make sense?', correct: 'Dependent clause' },
  { q: 'What is the term for a sentence built from exactly one independent clause and nothing else?', correct: 'Simple sentence' },
  { q: 'What is the term for two or more independent clauses joined together with a conjunction or semicolon?', correct: 'Compound sentence' },
  { q: 'What is the term for a sentence combining one independent clause with one or more dependent clauses?', correct: 'Complex sentence' },
  { q: 'What is the term for a sentence with two-plus independent clauses AND one-plus dependent clauses together?', correct: 'Compound-complex sentence' },
  { q: 'What is the term for words such as "and," "but," "or," and "so" that link two independent clauses?', correct: 'Coordinating conjunction' },
  { q: 'What is the term for words such as "although," "since," and "while" that start a dependent clause?', correct: 'Subordinating conjunction' },
  { q: 'What is the term for just the essential noun or pronoun acting as the subject, without its modifiers?', correct: 'Simple subject' },
  { q: 'What is the term for just the essential verb in the predicate, without its modifiers or objects?', correct: 'Simple predicate' },
  { q: 'What is the term for the mistake of joining two independent clauses with nothing but a comma?', correct: 'Comma splice' },
  { q: 'What is the term for the mistake of jamming two independent clauses together with no punctuation between them?', correct: 'Run-on sentence' },
  { q: 'What is the term for a group of words punctuated like a sentence but missing a subject, verb, or complete thought?', correct: 'Sentence fragment' },
  { q: 'Which grammar term answers the question "who or what is this sentence about"?', correct: 'Subject' },
  { q: 'Which grammar term answers the question "what does the subject do or what is true about it"?', correct: 'Predicate' },
  { q: 'Which grammar term describes any word group with both a subject and a verb, whether independent or dependent?', correct: 'Clause' },
  { q: 'Which grammar term describes a word group like "under the old bridge" that has no subject-verb pair?', correct: 'Phrase' },
  { q: 'Which grammar term describes a clause that could be its own sentence if you removed the rest?', correct: 'Independent clause' },
  { q: 'Which grammar term describes a clause starting with a word like "because" that can\'t stand alone?', correct: 'Dependent clause' },
  { q: 'Which sentence type has one independent clause and zero dependent clauses?', correct: 'Simple sentence' },
  { q: 'Which sentence type joins two or more independent clauses with "and," "but," or a semicolon?', correct: 'Compound sentence' },
  { q: 'Which sentence type has exactly one independent clause plus at least one dependent clause?', correct: 'Complex sentence' },
  { q: 'Which sentence type mixes at least two independent clauses with at least one dependent clause?', correct: 'Compound-complex sentence' },
  { q: 'Which term describes a conjunction that joins two grammatically equal independent clauses?', correct: 'Coordinating conjunction' },
  { q: 'Which term describes a conjunction that begins a clause and makes it dependent on another clause?', correct: 'Subordinating conjunction' },
  { q: 'Which term names only the core noun/pronoun of the subject, stripped of any describing words?', correct: 'Simple subject' },
  { q: 'Which term names only the core verb of the predicate, stripped of any objects or modifiers?', correct: 'Simple predicate' },
  { q: 'Which writing error happens when a writer uses only a comma to connect two complete sentences?', correct: 'Comma splice' },
  { q: 'Which writing error happens when two complete sentences run together with no comma or conjunction at all?', correct: 'Run-on sentence' },
  { q: 'Which writing error happens when a group of words is punctuated as a sentence but is not actually complete?', correct: 'Sentence fragment' }
];

const sentenceStructureTemplates = [
  { bloom: 'Remember', gen: () => {
    const allTerms = ['Subject', 'Predicate', 'Clause', 'Phrase', 'Independent clause', 'Dependent clause', 'Simple sentence', 'Compound sentence', 'Complex sentence', 'Compound-complex sentence', 'Coordinating conjunction', 'Subordinating conjunction', 'Simple subject', 'Simple predicate', 'Comma splice', 'Run-on sentence', 'Sentence fragment'];
    const f = choice(SENTENCE_TERM_FACTS);
    const wrongs = shuffle(allTerms.filter(t => t !== f.correct)).slice(0, 3);
    const choices = shuffle([f.correct, ...wrongs]);
    return {
      prompt: f.q,
      type: 'mcq',
      choices,
      correct: f.correct,
      explanation: `${f.correct} matches this definition.`
    };
  }},
  { bloom: 'Understand', gen: () => {
    const entry = choice(SUBJECT_PREDICATE_POOL);
    const askSubject = Math.random() < 0.5;
    const correct = askSubject ? entry.subject : entry.predicate;
    const others = SUBJECT_PREDICATE_POOL.filter(e => e !== entry);
    const distractors = shuffle(others).slice(0, 3).map(e => askSubject ? e.subject : e.predicate);
    const choices = shuffle([correct, ...distractors]);
    return {
      prompt: `In the sentence "${entry.sentence}", what is the complete ${askSubject ? 'subject' : 'predicate'}?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `The complete ${askSubject ? 'subject' : 'predicate'} is "${correct}."`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const entry = choice(SENTENCE_TYPE_POOL);
    const choices = shuffle(['Simple', 'Compound', 'Complex', 'Compound-complex']);
    return {
      prompt: `What type of sentence is this: "${entry.sentence}"?`,
      type: 'mcq',
      choices,
      correct: entry.type,
      explanation: `This is a ${entry.type.toLowerCase()} sentence.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const s = choice(ERROR_SCENARIOS);
    const correct = `${s.errorName} — should be fixed as: "${s.fix}"`;
    const others = shuffle(ERROR_SCENARIOS.filter(x => x !== s)).slice(0, 2);
    const wrongs = others.map(o => `${o.errorName} — should be fixed as: "${o.fix}"`);
    wrongs.push('This sentence has no error');
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `What type of error is in this sentence, and how should it be fixed? "${s.bad}"`,
      type: 'mcq',
      choices,
      correct,
      explanation: `This is a ${s.errorName.toLowerCase()}. Corrected: "${s.fix}"`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const testFragment = Math.random() < 0.6;
    const text = testFragment ? choice(FRAGMENTS_POOL) : choice(SENTENCE_TYPE_POOL).sentence;
    const correct = testFragment ? 'Fragment (missing a subject and/or a verb)' : 'Complete sentence';
    const choices = shuffle(['Complete sentence', 'Fragment (missing a subject and/or a verb)', 'Run-on sentence', 'Comma splice']);
    return {
      prompt: `Is this a complete sentence or a fragment: "${text}"?`,
      type: 'mcq',
      choices,
      correct,
      explanation: testFragment
        ? `"${text}" is missing a subject, a verb, or a complete thought, making it a fragment.`
        : `"${text}" has both a subject and a verb, forming a complete thought.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const p = choice(COMBINE_PAIRS);
    const correct = `${p.a}, ${p.conj} ${p.b}.`;
    const wrongs = [
      `${p.a} ${p.conj} ${p.b}.`,
      `${p.a}, ${p.b}.`,
      `${p.a} ${p.b}.`
    ];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Which choice correctly combines these two sentences into a compound sentence? "${p.a}." + "${p.b.charAt(0).toUpperCase() + p.b.slice(1)}."`,
      type: 'mcq',
      choices,
      correct,
      explanation: `A compound sentence needs a comma AND a coordinating conjunction (like "${p.conj}") between the two independent clauses: "${correct}"`
    };
  }}
];

// ---- Punctuation & Capitalization ------------------------------------------------

const APOSTROPHE_POOL = [
  { bad: "The dog wagged it's tail.", correct: 'The dog wagged its tail.', rule: '"its" (no apostrophe) is possessive; "it\'s" is a contraction for "it is"' },
  { bad: 'The cats toy was under the couch.', correct: "The cat's toy was under the couch.", rule: 'an apostrophe + s shows possession for a singular noun' },
  { bad: "Whose going to the party tonight?", correct: "Who's going to the party tonight?", rule: '"who\'s" is a contraction for "who is"; "whose" shows possession' },
  { bad: "The childrens' toys were scattered everywhere.", correct: "The children's toys were scattered everywhere.", rule: '"children" is already plural, so you just add apostrophe + s' },
  { bad: "Its raining outside, bring an umbrella.", correct: "It's raining outside, bring an umbrella.", rule: '"it\'s" (with apostrophe) is a contraction for "it is"' },
  { bad: "The teachers lounge is down the hall.", correct: "The teachers' lounge is down the hall.", rule: "for a plural noun already ending in s, the apostrophe goes after the s" },
  { bad: "Your going to love this movie.", correct: "You're going to love this movie.", rule: '"you\'re" is a contraction for "you are"; "your" shows possession' },
  { bad: "The dogs bone was buried in the yard.", correct: "The dog's bone was buried in the yard.", rule: 'an apostrophe + s shows possession for a singular noun' },
  { bad: "Lets go to the beach this weekend.", correct: "Let's go to the beach this weekend.", rule: '"let\'s" is a contraction for "let us"' },
  { bad: "The boys' were playing in the park.", correct: "The boys were playing in the park.", rule: "no apostrophe is needed here since \"boys\" is just a plural noun, not possessive" },
  { bad: "Theyre going to be late for the meeting.", correct: "They're going to be late for the meeting.", rule: '"they\'re" is a contraction for "they are"' },
  { bad: "The girls soccer team won the championship.", correct: "The girl's soccer team won the championship.", rule: 'an apostrophe + s shows possession for a singular noun' },
  { bad: "Its a beautiful day for a picnic.", correct: "It's a beautiful day for a picnic.", rule: '"it\'s" (with apostrophe) is a contraction for "it is"' },
  { bad: "The mens locker room is being renovated.", correct: "The men's locker room is being renovated.", rule: '"men" is already plural without an s, so add apostrophe + s for possession' },
  { bad: "Wheres the nearest gas station?", correct: "Where's the nearest gas station?", rule: '"where\'s" is a contraction for "where is"' },
  { bad: "The three cats toys were scattered across the floor.", correct: "The three cats' toys were scattered across the floor.", rule: 'for a plural noun already ending in s, the apostrophe goes after the s' },
  { bad: "Well be there by six o'clock.", correct: "We'll be there by six o'clock.", rule: '"we\'ll" is a contraction for "we will"' },
  { bad: "The company changed it's logo last year.", correct: "The company changed its logo last year.", rule: '"its" (no apostrophe) is possessive; "it\'s" is only a contraction for "it is"' },
  { bad: "Thats not what I meant to say.", correct: "That's not what I meant to say.", rule: '"that\'s" is a contraction for "that is"' },
  { bad: "Shes going to be the new class president.", correct: "She's going to be the new class president.", rule: '"she\'s" is a contraction for "she is"' },
  { bad: "The horses' were grazing in the field.", correct: "The horses were grazing in the field.", rule: 'no apostrophe is needed since "horses" is just a plural noun here, not possessive' },
  { bad: "Its important to double-check your work.", correct: "It's important to double-check your work.", rule: '"it\'s" (with apostrophe) is a contraction for "it is"' },
  { bad: "The countrys' economy grew last year.", correct: "The country's economy grew last year.", rule: 'an apostrophe + s shows possession for a singular noun' },
  { bad: "Wasnt that the best movie ever?", correct: "Wasn't that the best movie ever?", rule: '"wasn\'t" is a contraction for "was not"' },
  { bad: "The two familys shared a house.", correct: "The two families shared a house.", rule: '"families" is simply plural here, so no apostrophe is needed at all' },
  { bad: "Theres a new bakery on Main Street.", correct: "There's a new bakery on Main Street.", rule: '"there\'s" is a contraction for "there is"' },
  { bad: "My sisters' bike has a flat tire.", correct: "My sister's bike has a flat tire.", rule: 'an apostrophe + s shows possession for a single sister; using "sisters\'" would mean more than one sister owns it' },
  { bad: "Cant you come to the party?", correct: "Can't you come to the party?", rule: '"can\'t" is a contraction for "cannot"' },
  { bad: "The classes' schedule changed for next week.", correct: "The class's schedule changed for next week.", rule: 'a singular noun ending in s still typically adds apostrophe + s for possession' },
  { bad: "Its been a long day at school.", correct: "It's been a long day at school.", rule: '"it\'s" (with apostrophe) is a contraction for "it has"' },
  { bad: "The citys' parks were recently renovated.", correct: "The city's parks were recently renovated.", rule: 'an apostrophe + s shows possession for a singular noun' },
  { bad: "Didnt you already turn in your project?", correct: "Didn't you already turn in your project?", rule: '"didn\'t" is a contraction for "did not"' },
  { bad: "The womens team advanced to the finals.", correct: "The women's team advanced to the finals.", rule: '"women" is already plural without an s, so add apostrophe + s for possession' },
  { bad: "Youve done a great job on this essay.", correct: "You've done a great job on this essay.", rule: '"you\'ve" is a contraction for "you have"' }
];

const CAPITALIZATION_POOL = [
  { correct: 'We visited Paris last summer.', incorrect: 'We visited paris last summer.' },
  { correct: 'My teacher, Mrs. Johnson, is very kind.', incorrect: 'My teacher, mrs. johnson, is very kind.' },
  { correct: 'I love reading books on Fridays.', incorrect: 'i love reading books on fridays.' },
  { correct: 'The Eiffel Tower is in France.', incorrect: 'The eiffel tower is in france.' },
  { correct: 'We are reading a novel by Mark Twain.', incorrect: 'We are reading a novel by mark twain.' },
  { correct: 'My favorite holiday is Thanksgiving.', incorrect: 'My favorite holiday is thanksgiving.' },
  { correct: 'Doctor Lee works at Central Hospital.', incorrect: 'doctor lee works at central hospital.' },
  { correct: 'I was born in October in New York City.', incorrect: 'I was born in october in new york city.' },
  { correct: 'The Amazon River flows through Brazil.', incorrect: 'The amazon river flows through brazil.' },
  { correct: 'She speaks both English and Spanish.', incorrect: 'She speaks both english and spanish.' },
  { correct: 'We celebrated the Fourth of July with fireworks.', incorrect: 'We celebrated the fourth of july with fireworks.' },
  { correct: 'Professor Diaz teaches chemistry at Lincoln High School.', incorrect: 'professor diaz teaches chemistry at lincoln high school.' },
  { correct: 'My uncle lives near the Rocky Mountains in Colorado.', incorrect: 'My uncle lives near the rocky mountains in colorado.' },
  { correct: 'We watched the sunrise over Lake Michigan on Monday.', incorrect: 'We watched the sunrise over lake michigan on monday.' },
  { correct: 'The Statue of Liberty stands in New York Harbor.', incorrect: 'The statue of liberty stands in new york harbor.' },
  { correct: 'Aunt Linda visited the Grand Canyon last April.', incorrect: 'aunt linda visited the grand canyon last april.' },
  { correct: 'The president will speak at the United Nations today.', incorrect: 'The president will speak at the united nations today.' },
  { correct: 'Our class read a poem by Emily Dickinson.', incorrect: 'Our class read a poem by emily dickinson.' },
  { correct: 'We flew from Chicago to Tokyo over the winter break.', incorrect: 'We flew from chicago to tokyo over the winter break.' },
  { correct: 'Captain Rivera led the team during the Olympics.', incorrect: 'captain rivera led the team during the olympics.' },
  { correct: 'We toured the Great Wall of China in August.', incorrect: 'We toured the great wall of china in august.' },
  { correct: 'Senator Brooks visited our school on Tuesday.', incorrect: 'senator brooks visited our school on tuesday.' },
  { correct: 'The Mississippi River flows past St. Louis.', incorrect: 'The mississippi river flows past st. louis.' },
  { correct: 'My cousin studies at Harvard University.', incorrect: 'My cousin studies at harvard university.' },
  { correct: 'We celebrate Independence Day every July.', incorrect: 'We celebrate independence day every july.' },
  { correct: 'Coach Reyes led us to the state championship.', incorrect: 'coach reyes led us to the state championship.' },
  { correct: 'The Golden Gate Bridge connects to San Francisco.', incorrect: 'The golden gate bridge connects to san francisco.' },
  { correct: 'Uncle Marco moved to Seattle last February.', incorrect: 'uncle marco moved to seattle last february.' },
  { correct: 'We read a chapter from The Adventures of Tom Sawyer.', incorrect: 'We read a chapter from the adventures of tom sawyer.' },
  { correct: 'The Grand Canyon attracts visitors from Japan and Germany.', incorrect: 'The grand canyon attracts visitors from japan and germany.' },
  { correct: 'Principal Chen announced the schedule for Monday.', incorrect: 'principal chen announced the schedule for monday.' },
  { correct: 'The Nile River is the longest river in Africa.', incorrect: 'The nile river is the longest river in africa.' },
  { correct: 'We watched a documentary about Antarctica in December.', incorrect: 'We watched a documentary about antarctica in december.' },
  { correct: 'Doctor Kim works at Sunrise Elementary School.', incorrect: 'doctor kim works at sunrise elementary school.' }
];

const LIST_COMMA_POOL = [
  { correct: 'I packed shirts, socks, and shoes for the trip.', incorrect: 'I packed shirts socks and shoes for the trip.' },
  { correct: 'She enjoys hiking, swimming, and biking.', incorrect: 'She enjoys hiking swimming and biking.' },
  { correct: 'We need eggs, milk, and bread from the store.', incorrect: 'We need eggs milk and bread from the store.' },
  { correct: 'He plays soccer, basketball, and tennis.', incorrect: 'He plays soccer basketball and tennis.' },
  { correct: 'The recipe calls for flour, sugar, and butter.', incorrect: 'The recipe calls for flour sugar and butter.' },
  { correct: 'My backpack has pens, notebooks, and a calculator.', incorrect: 'My backpack has pens notebooks and a calculator.' },
  { correct: 'We saw lions, tigers, and bears at the zoo.', incorrect: 'We saw lions tigers and bears at the zoo.' },
  { correct: 'The band played rock, jazz, and pop songs.', incorrect: 'The band played rock jazz and pop songs.' },
  { correct: 'She studied history, math, and science this semester.', incorrect: 'She studied history math and science this semester.' },
  { correct: 'The garden has roses, tulips, and daisies.', incorrect: 'The garden has roses tulips and daisies.' },
  { correct: 'We adopted a cat, a dog, and two rabbits.', incorrect: 'We adopted a cat a dog and two rabbits.' },
  { correct: 'The store sells books, magazines, and newspapers.', incorrect: 'The store sells books magazines and newspapers.' },
  { correct: 'I need a hammer, nails, and a screwdriver.', incorrect: 'I need a hammer nails and a screwdriver.' },
  { correct: 'Her hobbies include painting, writing, and gardening.', incorrect: 'Her hobbies include painting writing and gardening.' },
  { correct: 'The trip includes stops in Rome, Paris, and London.', incorrect: 'The trip includes stops in Rome Paris and London.' },
  { correct: 'He ordered a burger, fries, and a milkshake.', incorrect: 'He ordered a burger fries and a milkshake.' },
  { correct: 'The museum has paintings, sculptures, and photographs.', incorrect: 'The museum has paintings sculptures and photographs.' },
  { correct: 'We need paper, pencils, glue, and scissors for the project.', incorrect: 'We need paper pencils glue and scissors for the project.' },
  { correct: 'The chef used garlic, onions, and tomatoes in the sauce.', incorrect: 'The chef used garlic onions and tomatoes in the sauce.' },
  { correct: 'The team practiced dribbling, passing, and shooting.', incorrect: 'The team practiced dribbling passing and shooting.' },
  { correct: 'We visited Rome, Venice, and Florence on our trip.', incorrect: 'We visited Rome Venice and Florence on our trip.' },
  { correct: 'The bakery sells bagels, muffins, and croissants.', incorrect: 'The bakery sells bagels muffins and croissants.' },
  { correct: 'She packed a map, a compass, and a flashlight.', incorrect: 'She packed a map a compass and a flashlight.' },
  { correct: 'The orchestra played strings, brass, and percussion.', incorrect: 'The orchestra played strings brass and percussion.' },
  { correct: 'We need scissors, tape, and construction paper for the craft.', incorrect: 'We need scissors tape and construction paper for the craft.' },
  { correct: 'The farmer grows corn, wheat, and soybeans.', incorrect: 'The farmer grows corn wheat and soybeans.' },
  { correct: 'His favorite subjects are art, gym, and music.', incorrect: 'His favorite subjects are art gym and music.' },
  { correct: 'The shelf held novels, comic books, and encyclopedias.', incorrect: 'The shelf held novels comic books and encyclopedias.' },
  { correct: 'We spotted eagles, hawks, and falcons on the hike.', incorrect: 'We spotted eagles hawks and falcons on the hike.' },
  { correct: 'The bag contained apples, oranges, and bananas.', incorrect: 'The bag contained apples oranges and bananas.' },
  { correct: 'She collects stamps, coins, and postcards.', incorrect: 'She collects stamps coins and postcards.' },
  { correct: 'The class studied volcanoes, earthquakes, and glaciers.', incorrect: 'The class studied volcanoes earthquakes and glaciers.' },
  { correct: 'We packed sunscreen, towels, and snacks for the beach.', incorrect: 'We packed sunscreen towels and snacks for the beach.' },
  { correct: 'The chef chopped carrots, celery, and onions.', incorrect: 'The chef chopped carrots celery and onions.' }
];

const PUNCT_BLANK_POOL = [
  { template: 'Watch out___', correct: '!', context: 'an exclamation of warning' },
  { template: 'What time is it___', correct: '?', context: 'a question' },
  { template: 'I went to the store___', correct: '.', context: 'a simple statement' },
  { template: 'My favorite fruits are apples, bananas___ and grapes.', correct: ',', context: 'separating items in a list' },
  { template: 'That was amazing___', correct: '!', context: 'an exclamation of excitement' },
  { template: 'Where did you put my keys___', correct: '?', context: 'a question' },
  { template: 'The sun rises in the east___', correct: '.', context: 'a simple statement of fact' },
  { template: 'After the movie___ we went home', correct: ',', context: 'separating an introductory clause from the main sentence' },
  { template: 'Help___ the house is on fire', correct: '!', context: 'an urgent exclamation' },
  { template: 'Do you know what time the game starts___', correct: '?', context: 'a question' },
  { template: 'We won the championship___', correct: '!', context: 'an exclamation of excitement' },
  { template: 'Can you pass the salt___', correct: '?', context: 'a question' },
  { template: 'The library opens at nine___', correct: '.', context: 'a simple statement of fact' },
  { template: 'Before we left___ we checked the weather', correct: ',', context: 'separating an introductory clause from the main sentence' },
  { template: 'Watch your step___', correct: '!', context: 'an exclamation of warning' },
  { template: 'What is your favorite color___', correct: '?', context: 'a question' },
  { template: 'The moon orbits the Earth___', correct: '.', context: 'a simple statement of fact' },
  { template: 'On my desk are pens, pencils___ and erasers.', correct: ',', context: 'separating items in a list' },
  { template: 'Incredible, we actually won___', correct: '!', context: 'an exclamation of excitement' },
  { template: 'How far is the airport from here___', correct: '?', context: 'a question' },
  { template: 'Snow fell quietly all night long___', correct: '.', context: 'a simple statement' },
  { template: 'After dinner___ we played board games', correct: ',', context: 'separating an introductory clause from the main sentence' },
  { template: 'Look out below___', correct: '!', context: 'an urgent exclamation' },
  { template: 'Did you finish your homework___', correct: '?', context: 'a question' },
  { template: 'Fire___ everyone evacuate now', correct: '!', context: 'an urgent exclamation' },
  { template: 'What grade did you get on the test___', correct: '?', context: 'a question' },
  { template: 'The train departs at noon___', correct: '.', context: 'a simple statement of fact' },
  { template: 'For the trip, pack socks, shirts___ and shoes.', correct: ',', context: 'separating items in a list' },
  { template: 'We actually made it on time___', correct: '!', context: 'an exclamation of excitement' },
  { template: 'How many pages is the report___', correct: '?', context: 'a question' },
  { template: 'Plants need sunlight and water to grow___', correct: '.', context: 'a simple statement of fact' },
  { template: 'Once the bell rang___ the students lined up', correct: ',', context: 'separating an introductory clause from the main sentence' },
  { template: 'Duck___ that ball is coming right at you', correct: '!', context: 'an urgent exclamation' },
  { template: 'Who left the door unlocked___', correct: '?', context: 'a question' }
];

const DIALOGUE_LINES_POOL = [
  { speaker: 'Maria', line: 'I will be there soon.' },
  { speaker: 'Jake', line: 'Watch out for the car!' },
  { speaker: 'Grandma', line: 'Dinner is almost ready.' },
  { speaker: 'The coach', line: 'Great effort out there today.' },
  { speaker: 'Sam', line: "I can't find my homework." },
  { speaker: 'The teacher', line: 'Please take out your notebooks.' },
  { speaker: 'Priya', line: 'This is my favorite song.' },
  { speaker: 'The captain', line: 'All passengers should remain seated.' },
  { speaker: 'Liam', line: "Let's meet at the library." },
  { speaker: 'The librarian', line: 'Quiet voices in here, please.' },
  { speaker: 'Noah', line: 'I already finished my chores.' },
  { speaker: 'The pilot', line: 'Please fasten your seatbelts now.' },
  { speaker: 'Grandpa', line: "That's the best story I've ever heard." },
  { speaker: 'Ava', line: 'Can we get ice cream after dinner?' },
  { speaker: 'The nurse', line: 'Take a deep breath for me.' },
  { speaker: 'Ethan', line: 'I forgot my umbrella at school.' },
  { speaker: 'The tour guide', line: 'Stay close to the group, everyone.' },
  { speaker: 'Zoe', line: "I can't believe we won the game!" },
  { speaker: 'The waiter', line: 'Your table is ready now.' },
  { speaker: 'Mrs. Patel', line: 'Turn to page twelve in your textbooks.' },
  { speaker: 'Carlos', line: 'I left my jacket on the bus.' },
  { speaker: 'The referee', line: 'That was clearly a foul.' },
  { speaker: 'Grandma Rose', line: 'Come sit with me for a while.' },
  { speaker: 'The scientist', line: 'This reaction is going to be amazing.' },
  { speaker: 'Nina', line: "I've never seen anything like this before." },
  { speaker: 'The mail carrier', line: 'You have a package today.' },
  { speaker: 'Oliver', line: 'Can you help me carry these books?' },
  { speaker: 'The conductor', line: 'Please have your tickets ready.' },
  { speaker: 'Aunt Bea', line: 'The pie needs ten more minutes.' },
  { speaker: 'The lifeguard', line: 'No running near the pool!' },
  { speaker: 'Miguel', line: 'I finally beat that level.' },
  { speaker: 'The vet', line: 'Your puppy is perfectly healthy.' },
  { speaker: 'Hannah', line: "Let's practice our lines one more time." },
  { speaker: 'The janitor', line: 'Watch out, the floor is wet.' }
];

const punctuationTemplates = [
  { bloom: 'Remember', gen: () => {
    const facts = [
      { q: 'Which punctuation mark ends a question?', correct: 'Question mark (?)' },
      { q: 'Which punctuation mark ends a statement of strong emotion?', correct: 'Exclamation point (!)' },
      { q: 'Which punctuation mark ends a simple statement?', correct: 'Period (.)' },
      { q: 'Which punctuation mark separates items in a list?', correct: 'Comma (,)' },
      { q: 'Which punctuation mark shows possession or forms a contraction, like in "dog\'s" or "don\'t"?', correct: "Apostrophe (')" },
      { q: 'Which punctuation mark introduces a list or an explanation, as in "Bring these: a pen, paper, and a ruler"?', correct: 'Colon (:)' },
      { q: 'Which punctuation marks enclose a speaker\'s exact words?', correct: 'Quotation marks (" ")' },
      { q: 'Which punctuation mark can join two closely related independent clauses without a conjunction?', correct: 'Semicolon (;)' },
      { q: 'Which punctuation marks enclose extra, optional information in a sentence?', correct: 'Parentheses ( )' },
      { q: 'Which punctuation mark joins two words to form a compound word, like "well-known"?', correct: 'Hyphen (-)' },
      { q: 'Which punctuation mark shows that words have been left out of a quotation, or a pause or trailing thought?', correct: 'Ellipsis (...)' },
      { q: 'Which punctuation mark can be used to set off a dramatic break or an explanatory aside in a sentence?', correct: 'Em dash (—)' },
      { q: 'Which punctuation marks are used to add an editor\'s clarifying note inside a quotation?', correct: 'Brackets ([ ])' },
      { q: 'Which punctuation mark do you use at the end of a sentence that simply states a fact?', correct: 'Period (.)' },
      { q: 'Which punctuation mark do you use at the end of a sentence that asks something?', correct: 'Question mark (?)' },
      { q: 'Which punctuation mark shows strong feeling, like surprise or excitement, at the end of a sentence?', correct: 'Exclamation point (!)' },
      { q: 'Which punctuation mark is used before a list, or between an independent clause and an explanation that follows it?', correct: 'Colon (:)' },
      { q: 'Which punctuation mark connects two closely related independent clauses without using "and," "but," or "or"?', correct: 'Semicolon (;)' },
      { q: 'Which punctuation mark is used to show that a noun owns something, like in "the dog\'s leash"?', correct: "Apostrophe (')" },
      { q: 'Which punctuation mark do you place at the end of a request phrased as a question, like "Could you help me?"', correct: 'Question mark (?)' },
      { q: 'Which punctuation mark do you use after an interjection like "Wow" or "Ouch" to show excitement?', correct: 'Exclamation point (!)' },
      { q: 'Which punctuation mark comes after an abbreviation like "Dr." or "etc."?', correct: 'Period (.)' },
      { q: 'Which punctuation mark separates an introductory word or phrase from the rest of a sentence?', correct: 'Comma (,)' },
      { q: 'Which punctuation mark replaces the missing letters in a contraction like "can\'t" or "won\'t"?', correct: "Apostrophe (')" },
      { q: 'Which punctuation mark is used before a formal list following a complete sentence?', correct: 'Colon (:)' },
      { q: 'Which punctuation marks go around a book title when it is being directly quoted as dialogue?', correct: 'Quotation marks (" ")' },
      { q: 'Which punctuation mark can replace a comma or period to link two closely related complete thoughts?', correct: 'Semicolon (;)' },
      { q: 'Which punctuation marks would you use to add a quick side comment, like "(as I mentioned earlier)"?', correct: 'Parentheses ( )' },
      { q: 'Which punctuation mark is used in a compound adjective before a noun, like "well-known author"?', correct: 'Hyphen (-)' },
      { q: 'Which punctuation mark shows a sentence trailing off, unfinished, as in "I was going to say..."?', correct: 'Ellipsis (...)' },
      { q: 'Which punctuation mark can replace a colon or parentheses to add emphasis to an explanation?', correct: 'Em dash (—)' },
      { q: 'Which punctuation marks are used to insert a word for clarity into someone else\'s quoted sentence?', correct: 'Brackets ([ ])' },
      { q: 'Which mark ends a sentence that simply reports information without any special emotion?', correct: 'Period (.)' },
      { q: 'Which mark do you use at the end of "Where are you going"?', correct: 'Question mark (?)' },
      { q: 'Which mark do you use at the end of "That is amazing"?', correct: 'Exclamation point (!)' },
      { q: 'Which mark separates the day and year in a date written in a sentence, like "May 3, 2020"?', correct: 'Comma (,)' },
      { q: 'Which mark is required to show plural possession, as in "the dogs\' leashes"?', correct: "Apostrophe (')" },
      { q: 'Which mark introduces a direct explanation right after an independent clause, as in "There was one problem: rain"?', correct: 'Colon (:)' },
      { q: 'Which mark connects two independent clauses so closely related they read almost as one idea, without "and"?', correct: 'Semicolon (;)' }
    ];
    const allMarks = ['Question mark (?)', 'Exclamation point (!)', 'Period (.)', 'Comma (,)', "Apostrophe (')", 'Colon (:)', 'Quotation marks (" ")', 'Semicolon (;)', 'Parentheses ( )', 'Hyphen (-)', 'Ellipsis (...)', 'Em dash (—)', 'Brackets ([ ])'];
    const f = choice(facts);
    const wrongs = shuffle(allMarks.filter(c => c !== f.correct)).slice(0, 3);
    const choices = shuffle([f.correct, ...wrongs]);
    return { prompt: f.q, type: 'mcq', choices, correct: f.correct, explanation: `${f.correct} is correct.` };
  }},
  { bloom: 'Understand', gen: () => {
    const target = choice(LIST_COMMA_POOL);
    const others = shuffle(LIST_COMMA_POOL.filter(e => e !== target)).slice(0, 3);
    const choices = shuffle([target.correct, ...others.map(o => o.incorrect)]);
    return {
      prompt: `Which is the correctly punctuated version of this list: "${target.incorrect}"`,
      type: 'mcq',
      choices,
      correct: target.correct,
      explanation: 'Items in a list are separated by commas, including before "and" (the Oxford comma).'
    };
  }},
  { bloom: 'Apply', gen: () => {
    const target = choice(CAPITALIZATION_POOL);
    const others = shuffle(CAPITALIZATION_POOL.filter(e => e !== target)).slice(0, 3);
    const choices = shuffle([target.correct, ...others.map(o => o.incorrect)]);
    return {
      prompt: `Which is the correctly capitalized version of: "${target.incorrect}"`,
      type: 'mcq',
      choices,
      correct: target.correct,
      explanation: 'Proper nouns (names of specific people and places) and the first word of a sentence should be capitalized.'
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const entry = choice(APOSTROPHE_POOL);
    const correct = `The apostrophe is misused — it should be "${entry.correct}" because ${entry.rule}`;
    const wrongs = ['There is no error in this sentence', 'The sentence needs a semicolon instead', 'The word order is incorrect'];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Find the error: "${entry.bad}"`,
      type: 'mcq',
      choices,
      correct,
      explanation: `The correct version is "${entry.correct}" — ${entry.rule}.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const entry = choice(PUNCT_BLANK_POOL);
    const choices = shuffle(['.', '?', '!', ',']);
    return {
      prompt: `Which punctuation mark correctly completes this sentence: "${entry.template}"`,
      type: 'mcq',
      choices,
      correct: entry.correct,
      explanation: `This calls for "${entry.correct}" because it is ${entry.context}.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const entry = choice(DIALOGUE_LINES_POOL);
    const correct = `${entry.speaker} said, "${entry.line}"`;
    const wrongs = [
      `${entry.speaker} said, ${entry.line}`,
      `${entry.speaker} said "${entry.line}"`,
      `${entry.speaker} said, '${entry.line}'`
    ];
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `Which sentence correctly punctuates ${entry.speaker}'s dialogue: "${entry.line}"?`,
      type: 'mcq',
      choices,
      correct,
      explanation: 'Spoken words go inside double quotation marks, with a comma separating them from the speaker tag.'
    };
  }}
];

// ---- Vocabulary & Word Roots ---------------------------------------------------

const SYNONYM_POOL = [
  { word: 'Happy', synonym: 'Joyful', distractors: ['Angry', 'Tired', 'Confused'] },
  { word: 'Big', synonym: 'Enormous', distractors: ['Tiny', 'Narrow', 'Quiet'] },
  { word: 'Smart', synonym: 'Intelligent', distractors: ['Clumsy', 'Lazy', 'Rude'] },
  { word: 'Fast', synonym: 'Rapid', distractors: ['Sluggish', 'Silent', 'Heavy'] },
  { word: 'Brave', synonym: 'Courageous', distractors: ['Cowardly', 'Nervous', 'Weak'] },
  { word: 'Sad', synonym: 'Sorrowful', distractors: ['Cheerful', 'Excited', 'Calm'] },
  { word: 'Angry', synonym: 'Furious', distractors: ['Delighted', 'Peaceful', 'Sleepy'] },
  { word: 'Quiet', synonym: 'Silent', distractors: ['Loud', 'Bright', 'Crowded'] },
  { word: 'Beautiful', synonym: 'Gorgeous', distractors: ['Hideous', 'Ordinary', 'Broken'] },
  { word: 'Tired', synonym: 'Exhausted', distractors: ['Energetic', 'Hungry', 'Curious'] },
  { word: 'Funny', synonym: 'Hilarious', distractors: ['Boring', 'Serious', 'Frightening'] },
  { word: 'Difficult', synonym: 'Challenging', distractors: ['Effortless', 'Pleasant', 'Ordinary'] },
  { word: 'Cold', synonym: 'Frigid', distractors: ['Scorching', 'Mild', 'Damp'] },
  { word: 'Strong', synonym: 'Powerful', distractors: ['Feeble', 'Gentle', 'Quiet'] },
  { word: 'Small', synonym: 'Tiny', distractors: ['Massive', 'Wide', 'Tall'] },
  { word: 'Bright', synonym: 'Radiant', distractors: ['Dim', 'Faded', 'Murky'] },
  { word: 'Kind', synonym: 'Compassionate', distractors: ['Cruel', 'Selfish', 'Rude'] },
  { word: 'Clean', synonym: 'Spotless', distractors: ['Filthy', 'Messy', 'Damp'] },
  { word: 'Old', synonym: 'Ancient', distractors: ['Modern', 'Fresh', 'Young'] },
  { word: 'Rich', synonym: 'Wealthy', distractors: ['Poor', 'Ordinary', 'Humble'] },
  { word: 'Loud', synonym: 'Deafening', distractors: ['Silent', 'Faint', 'Gentle'] },
  { word: 'Weak', synonym: 'Feeble', distractors: ['Powerful', 'Sturdy', 'Tough'] },
  { word: 'Glad', synonym: 'Delighted', distractors: ['Miserable', 'Anxious', 'Bored'] },
  { word: 'Enraged', synonym: 'Irate', distractors: ['Content', 'Relaxed', 'Sleepy'] },
  { word: 'Honest', synonym: 'Truthful', distractors: ['Deceptive', 'Secretive', 'Careless'] },
  { word: 'Lazy', synonym: 'Idle', distractors: ['Energetic', 'Diligent', 'Productive'] },
  { word: 'Polite', synonym: 'Courteous', distractors: ['Rude', 'Arrogant', 'Careless'] },
  { word: 'Wise', synonym: 'Sensible', distractors: ['Foolish', 'Naive', 'Reckless'] },
  { word: 'Generous', synonym: 'Giving', distractors: ['Selfish', 'Greedy', 'Stingy'] },
  { word: 'Messy', synonym: 'Disorganized', distractors: ['Tidy', 'Spotless', 'Orderly'] },
  { word: 'Ancient', synonym: 'Prehistoric', distractors: ['Modern', 'Recent', 'Current'] },
  { word: 'Cheerful', synonym: 'Upbeat', distractors: ['Gloomy', 'Grumpy', 'Sorrowful'] },
  { word: 'Dangerous', synonym: 'Hazardous', distractors: ['Harmless', 'Secure', 'Peaceful'] },
  { word: 'Joyous', synonym: 'Elated', distractors: ['Miserable', 'Bored', 'Tired'] },
  { word: 'Miserable', synonym: 'Wretched', distractors: ['Cheerful', 'Relaxed', 'Excited'] },
  { word: 'Gloomy', synonym: 'Dismal', distractors: ['Bright', 'Joyful', 'Lively'] },
  { word: 'Anxious', synonym: 'Uneasy', distractors: ['Relaxed', 'Confident', 'Cheerful'] },
  { word: 'Terrified', synonym: 'Petrified', distractors: ['Delighted', 'Calm', 'Amused'] },
  { word: 'Astonished', synonym: 'Amazed', distractors: ['Bored', 'Indifferent', 'Annoyed'] },
  { word: 'Grateful', synonym: 'Thankful', distractors: ['Resentful', 'Jealous', 'Indifferent'] },
  { word: 'Jealous', synonym: 'Envious', distractors: ['Content', 'Generous', 'Proud'] },
  { word: 'Embarrassed', synonym: 'Humiliated', distractors: ['Proud', 'Confident', 'Cheerful'] },
  { word: 'Ashamed', synonym: 'Remorseful', distractors: ['Proud', 'Boastful', 'Delighted'] },
  { word: 'Confident', synonym: 'Self-assured', distractors: ['Timid', 'Nervous', 'Insecure'] },
  { word: 'Hopeful', synonym: 'Optimistic', distractors: ['Pessimistic', 'Despairing', 'Indifferent'] },
  { word: 'Desperate', synonym: 'Frantic', distractors: ['Relaxed', 'Content', 'Patient'] },
  { word: 'Frustrated', synonym: 'Exasperated', distractors: ['Satisfied', 'Calm', 'Delighted'] },
  { word: 'Irritated', synonym: 'Annoyed', distractors: ['Pleased', 'Delighted', 'Calm'] },
  { word: 'Disgusted', synonym: 'Repulsed', distractors: ['Delighted', 'Fascinated', 'Amused'] },
  { word: 'Curious', synonym: 'Inquisitive', distractors: ['Indifferent', 'Bored', 'Uninterested'] },
  { word: 'Eager', synonym: 'Enthusiastic', distractors: ['Reluctant', 'Indifferent', 'Bored'] },
  { word: 'Calm', synonym: 'Serene', distractors: ['Frantic', 'Agitated', 'Nervous'] },
  { word: 'Tense', synonym: 'Strained', distractors: ['Relaxed', 'Calm', 'Loose'] },
  { word: 'Frightened', synonym: 'Alarmed', distractors: ['Fearless', 'Calm', 'Confident'] },
  { word: 'Shocked', synonym: 'Stunned', distractors: ['Expecting', 'Calm', 'Bored'] },
  { word: 'Heartbroken', synonym: 'Devastated', distractors: ['Delighted', 'Content', 'Cheerful'] },
  { word: 'Gigantic', synonym: 'Colossal', distractors: ['Miniature', 'Microscopic', 'Petite'] },
  { word: 'Vast', synonym: 'Immense', distractors: ['Cramped', 'Narrow', 'Tiny'] },
  { word: 'Numerous', synonym: 'Countless', distractors: ['Scarce', 'Rare', 'Sparse'] },
  { word: 'Scarce', synonym: 'Sparse', distractors: ['Abundant', 'Plentiful', 'Numerous'] },
  { word: 'Plentiful', synonym: 'Bountiful', distractors: ['Scarce', 'Meager', 'Limited'] },
  { word: 'Sufficient', synonym: 'Adequate', distractors: ['Insufficient', 'Lacking', 'Scarce'] },
  { word: 'Meager', synonym: 'Scanty', distractors: ['Abundant', 'Generous', 'Plentiful'] },
  { word: 'Substantial', synonym: 'Considerable', distractors: ['Trivial', 'Minor', 'Insignificant'] },
  { word: 'Excessive', synonym: 'Extravagant', distractors: ['Moderate', 'Minimal', 'Sparse'] },
  { word: 'Swift', synonym: 'Speedy', distractors: ['Sluggish', 'Slow', 'Lethargic'] },
  { word: 'Hasty', synonym: 'Rushed', distractors: ['Careful', 'Deliberate', 'Unhurried'] },
  { word: 'Gradual', synonym: 'Steady', distractors: ['Sudden', 'Abrupt', 'Instant'] },
  { word: 'Abrupt', synonym: 'Sudden', distractors: ['Gradual', 'Slow', 'Expected'] },
  { word: 'Nimble', synonym: 'Agile', distractors: ['Clumsy', 'Awkward', 'Sluggish'] },
  { word: 'Clumsy', synonym: 'Awkward', distractors: ['Graceful', 'Nimble', 'Skillful'] },
  { word: 'Graceful', synonym: 'Elegant', distractors: ['Clumsy', 'Awkward', 'Stiff'] },
  { word: 'Rigid', synonym: 'Stiff', distractors: ['Flexible', 'Pliable', 'Elastic'] },
  { word: 'Flexible', synonym: 'Adaptable', distractors: ['Rigid', 'Stiff', 'Inflexible'] },
  { word: 'Fragile', synonym: 'Delicate', distractors: ['Sturdy', 'Durable', 'Tough'] },
  { word: 'Durable', synonym: 'Long-lasting', distractors: ['Fragile', 'Flimsy', 'Brittle'] },
  { word: 'Brittle', synonym: 'Crumbly', distractors: ['Sturdy', 'Flexible', 'Tough'] },
  { word: 'Flimsy', synonym: 'Rickety', distractors: ['Sturdy', 'Solid', 'Durable'] },
  { word: 'Robust', synonym: 'Sturdy', distractors: ['Frail', 'Powerless', 'Fragile'] },
  { word: 'Feeble', synonym: 'Frail', distractors: ['Robust', 'Powerful', 'Sturdy'] },
  { word: 'Clever', synonym: 'Cunning', distractors: ['Foolish', 'Dull', 'Simple'] },
  { word: 'Brilliant', synonym: 'Ingenious', distractors: ['Dim-witted', 'Foolish', 'Unimaginative'] },
  { word: 'Foolish', synonym: 'Silly', distractors: ['Wise', 'Sensible', 'Clever'] },
  { word: 'Naive', synonym: 'Gullible', distractors: ['Cynical', 'Skeptical', 'Shrewd'] },
  { word: 'Gifted', synonym: 'Talented', distractors: ['Untalented', 'Ordinary', 'Unskilled'] },
  { word: 'Inexperienced', synonym: 'Green', distractors: ['Seasoned', 'Expert', 'Skilled'] },
  { word: 'Competent', synonym: 'Capable', distractors: ['Incompetent', 'Inept', 'Unskilled'] },
  { word: 'Incompetent', synonym: 'Inept', distractors: ['Skilled', 'Capable', 'Proficient'] },
  { word: 'Knowledgeable', synonym: 'Well-informed', distractors: ['Ignorant', 'Uninformed', 'Clueless'] },
  { word: 'Ignorant', synonym: 'Uninformed', distractors: ['Knowledgeable', 'Educated', 'Informed'] },
  { word: 'Perceptive', synonym: 'Observant', distractors: ['Oblivious', 'Unaware', 'Careless'] },
  { word: 'Absent-minded', synonym: 'Forgetful', distractors: ['Attentive', 'Alert', 'Sharp'] },
  { word: 'Cooperative', synonym: 'Helpful', distractors: ['Stubborn', 'Uncooperative', 'Difficult'] },
  { word: 'Aggressive', synonym: 'Hostile', distractors: ['Peaceful', 'Gentle', 'Calm'] },
  { word: 'Gentle', synonym: 'Mild', distractors: ['Harsh', 'Rough', 'Fierce'] },
  { word: 'Fierce', synonym: 'Ferocious', distractors: ['Tame', 'Gentle', 'Mild'] },
  { word: 'Timid', synonym: 'Bashful', distractors: ['Bold', 'Confident', 'Outgoing'] },
  { word: 'Reckless', synonym: 'Careless', distractors: ['Cautious', 'Careful', 'Prudent'] },
  { word: 'Cautious', synonym: 'Wary', distractors: ['Reckless', 'Careless', 'Rash'] },
  { word: 'Meticulous', synonym: 'Thorough', distractors: ['Careless', 'Sloppy', 'Hasty'] },
  { word: 'Diligent', synonym: 'Industrious', distractors: ['Lazy', 'Idle', 'Slothful'] },
  { word: 'Obedient', synonym: 'Compliant', distractors: ['Rebellious', 'Defiant', 'Disobedient'] },
  { word: 'Rebellious', synonym: 'Defiant', distractors: ['Obedient', 'Compliant', 'Docile'] },
  { word: 'Loyal', synonym: 'Faithful', distractors: ['Disloyal', 'Treacherous', 'Unfaithful'] },
  { word: 'Treacherous', synonym: 'Deceitful', distractors: ['Loyal', 'Trustworthy', 'Honest'] },
  { word: 'Trustworthy', synonym: 'Reliable', distractors: ['Untrustworthy', 'Deceitful', 'Shady'] },
  { word: 'Suspicious', synonym: 'Distrustful', distractors: ['Trusting', 'Confident', 'Naive'] },
  { word: 'Arrogant', synonym: 'Conceited', distractors: ['Modest', 'Humble', 'Meek'] },
  { word: 'Humble', synonym: 'Modest', distractors: ['Arrogant', 'Boastful', 'Conceited'] },
  { word: 'Boastful', synonym: 'Bragging', distractors: ['Modest', 'Humble', 'Reserved'] },
  { word: 'Selfish', synonym: 'Self-centered', distractors: ['Generous', 'Selfless', 'Giving'] },
  { word: 'Selfless', synonym: 'Altruistic', distractors: ['Selfish', 'Greedy', 'Stingy'] },
  { word: 'Stingy', synonym: 'Miserly', distractors: ['Generous', 'Charitable', 'Giving'] },
  { word: 'Charitable', synonym: 'Generous', distractors: ['Stingy', 'Greedy', 'Selfish'] },
  { word: 'Greedy', synonym: 'Grasping', distractors: ['Generous', 'Content', 'Satisfied'] },
  { word: 'Content', synonym: 'Satisfied', distractors: ['Dissatisfied', 'Discontent', 'Restless'] },
  { word: 'Restless', synonym: 'Fidgety', distractors: ['Calm', 'Relaxed', 'Peaceful'] },
  { word: 'Patient', synonym: 'Tolerant', distractors: ['Impatient', 'Irritable', 'Hasty'] },
  { word: 'Impatient', synonym: 'Restless', distractors: ['Patient', 'Calm', 'Tolerant'] },
  { word: 'Stern', synonym: 'Strict', distractors: ['Lenient', 'Easygoing', 'Permissive'] },
  { word: 'Lenient', synonym: 'Easygoing', distractors: ['Strict', 'Harsh', 'Severe'] },
  { word: 'Harsh', synonym: 'Severe', distractors: ['Gentle', 'Mild', 'Lenient'] },
  { word: 'Compassionate', synonym: 'Empathetic', distractors: ['Cruel', 'Heartless', 'Indifferent'] },
  { word: 'Cruel', synonym: 'Heartless', distractors: ['Kind', 'Gentle', 'Compassionate'] },
  { word: 'Merciless', synonym: 'Ruthless', distractors: ['Merciful', 'Forgiving', 'Kind'] },
  { word: 'Merciful', synonym: 'Forgiving', distractors: ['Merciless', 'Ruthless', 'Harsh'] },
  { word: 'Vengeful', synonym: 'Vindictive', distractors: ['Forgiving', 'Merciful', 'Kind'] },
  { word: 'Sincere', synonym: 'Genuine', distractors: ['Insincere', 'Fake', 'Phony'] },
  { word: 'Insincere', synonym: 'Fake', distractors: ['Sincere', 'Genuine', 'Honest'] },
  { word: 'Deceptive', synonym: 'Misleading', distractors: ['Honest', 'Truthful', 'Straightforward'] },
  { word: 'Blunt', synonym: 'Direct', distractors: ['Vague', 'Evasive', 'Indirect'] },
  { word: 'Vague', synonym: 'Unclear', distractors: ['Precise', 'Exact', 'Clear'] },
  { word: 'Precise', synonym: 'Exact', distractors: ['Vague', 'Approximate', 'Imprecise'] },
  { word: 'Ambiguous', synonym: 'Unclear', distractors: ['Obvious', 'Clear', 'Definite'] },
  { word: 'Obvious', synonym: 'Evident', distractors: ['Hidden', 'Obscure', 'Unclear'] },
  { word: 'Obscure', synonym: 'Unclear', distractors: ['Obvious', 'Famous', 'Well-known'] },
  { word: 'Famous', synonym: 'Renowned', distractors: ['Unknown', 'Obscure', 'Anonymous'] },
  { word: 'Notorious', synonym: 'Infamous', distractors: ['Respected', 'Admired', 'Beloved'] },
  { word: 'Respected', synonym: 'Esteemed', distractors: ['Despised', 'Disliked', 'Scorned'] },
  { word: 'Despised', synonym: 'Loathed', distractors: ['Adored', 'Cherished', 'Beloved'] },
  { word: 'Adored', synonym: 'Cherished', distractors: ['Despised', 'Hated', 'Loathed'] },
  { word: 'Ordinary', synonym: 'Common', distractors: ['Unique', 'Rare', 'Extraordinary'] },
  { word: 'Extraordinary', synonym: 'Remarkable', distractors: ['Ordinary', 'Typical', 'Common'] },
  { word: 'Typical', synonym: 'Standard', distractors: ['Unusual', 'Rare', 'Exceptional'] },
  { word: 'Unusual', synonym: 'Odd', distractors: ['Typical', 'Common', 'Normal'] },
  { word: 'Bizarre', synonym: 'Strange', distractors: ['Ordinary', 'Normal', 'Familiar'] },
  { word: 'Peculiar', synonym: 'Odd', distractors: ['Normal', 'Usual', 'Common'] },
  { word: 'Fascinating', synonym: 'Captivating', distractors: ['Boring', 'Dull', 'Tedious'] },
  { word: 'Tedious', synonym: 'Monotonous', distractors: ['Exciting', 'Thrilling', 'Fascinating'] },
  { word: 'Dull', synonym: 'Boring', distractors: ['Exciting', 'Vivid', 'Lively'] },
  { word: 'Vivid', synonym: 'Vibrant', distractors: ['Dull', 'Faded', 'Pale'] },
  { word: 'Pale', synonym: 'Faded', distractors: ['Vivid', 'Bright', 'Bold'] },
  { word: 'Radiant', synonym: 'Glowing', distractors: ['Dim', 'Dark', 'Dull'] },
  { word: 'Murky', synonym: 'Cloudy', distractors: ['Clear', 'Transparent', 'Crisp'] },
  { word: 'Transparent', synonym: 'Clear', distractors: ['Opaque', 'Murky', 'Cloudy'] },
  { word: 'Opaque', synonym: 'Cloudy', distractors: ['Transparent', 'Clear', 'See-through'] },
  { word: 'Spacious', synonym: 'Roomy', distractors: ['Cramped', 'Confined', 'Tight'] },
  { word: 'Cramped', synonym: 'Confined', distractors: ['Spacious', 'Roomy', 'Open'] },
  { word: 'Narrow', synonym: 'Slim', distractors: ['Wide', 'Broad', 'Spacious'] },
  { word: 'Broad', synonym: 'Wide', distractors: ['Narrow', 'Thin', 'Slim'] },
  { word: 'Steep', synonym: 'Sharp', distractors: ['Gentle', 'Gradual', 'Flat'] },
  { word: 'Shallow', synonym: 'Superficial', distractors: ['Deep', 'Profound', 'Thorough'] },
  { word: 'Profound', synonym: 'Deep', distractors: ['Shallow', 'Superficial', 'Trivial'] },
  { word: 'Trivial', synonym: 'Insignificant', distractors: ['Important', 'Crucial', 'Vital'] },
  { word: 'Crucial', synonym: 'Vital', distractors: ['Trivial', 'Minor', 'Unimportant'] },
  { word: 'Essential', synonym: 'Necessary', distractors: ['Optional', 'Unnecessary', 'Trivial'] },
  { word: 'Optional', synonym: 'Voluntary', distractors: ['Mandatory', 'Required', 'Essential'] },
  { word: 'Mandatory', synonym: 'Compulsory', distractors: ['Optional', 'Voluntary', 'Elective'] },
  { word: 'Reluctant', synonym: 'Hesitant', distractors: ['Eager', 'Willing', 'Enthusiastic'] },
  { word: 'Willing', synonym: 'Agreeable', distractors: ['Reluctant', 'Unwilling', 'Resistant'] },
  { word: 'Persistent', synonym: 'Relentless', distractors: ['Occasional', 'Sporadic', 'Intermittent'] },
  { word: 'Occasional', synonym: 'Infrequent', distractors: ['Constant', 'Frequent', 'Persistent'] },
  { word: 'Frequent', synonym: 'Common', distractors: ['Rare', 'Occasional', 'Infrequent'] },
  { word: 'Rare', synonym: 'Uncommon', distractors: ['Frequent', 'Common', 'Usual'] },
  { word: 'Permanent', synonym: 'Lasting', distractors: ['Temporary', 'Fleeting', 'Brief'] },
  { word: 'Temporary', synonym: 'Fleeting', distractors: ['Permanent', 'Lasting', 'Eternal'] },
  { word: 'Eternal', synonym: 'Everlasting', distractors: ['Temporary', 'Brief', 'Momentary'] },
  { word: 'Momentary', synonym: 'Brief', distractors: ['Eternal', 'Permanent', 'Lasting'] },
  { word: 'Modern', synonym: 'Contemporary', distractors: ['Ancient', 'Outdated', 'Old-fashioned'] },
  { word: 'Outdated', synonym: 'Obsolete', distractors: ['Modern', 'Current', 'Up-to-date'] },
  { word: 'Innovative', synonym: 'Inventive', distractors: ['Outdated', 'Old-fashioned', 'Traditional'] },
  { word: 'Traditional', synonym: 'Conventional', distractors: ['Innovative', 'Modern', 'Novel'] },
  { word: 'Novel', synonym: 'Original', distractors: ['Traditional', 'Ordinary', 'Common'] },
  { word: 'Authentic', synonym: 'Genuine', distractors: ['Fake', 'Imitation', 'Counterfeit'] },
  { word: 'Imitation', synonym: 'Fake', distractors: ['Authentic', 'Genuine', 'Real'] },
  { word: 'Elaborate', synonym: 'Detailed', distractors: ['Simple', 'Plain', 'Basic'] },
  { word: 'Simple', synonym: 'Basic', distractors: ['Complex', 'Elaborate', 'Complicated'] },
  { word: 'Complex', synonym: 'Complicated', distractors: ['Simple', 'Basic', 'Easy'] },
  { word: 'Intricate', synonym: 'Complex', distractors: ['Simple', 'Plain', 'Basic'] },
  { word: 'Effortless', synonym: 'Easy', distractors: ['Difficult', 'Challenging', 'Strenuous'] },
  { word: 'Strenuous', synonym: 'Exhausting', distractors: ['Effortless', 'Easy', 'Simple'] },
  { word: 'Exhausting', synonym: 'Draining', distractors: ['Refreshing', 'Energizing', 'Invigorating'] },
  { word: 'Refreshing', synonym: 'Invigorating', distractors: ['Exhausting', 'Draining', 'Tiring'] },
  { word: 'Invigorating', synonym: 'Energizing', distractors: ['Tiring', 'Draining', 'Exhausting'] },
  { word: 'Soothing', synonym: 'Calming', distractors: ['Irritating', 'Agitating', 'Disturbing'] },
  { word: 'Irritating', synonym: 'Annoying', distractors: ['Soothing', 'Pleasant', 'Calming'] },
  { word: 'Pleasant', synonym: 'Enjoyable', distractors: ['Unpleasant', 'Disagreeable', 'Awful'] },
  { word: 'Unpleasant', synonym: 'Disagreeable', distractors: ['Pleasant', 'Enjoyable', 'Delightful'] },
  { word: 'Delightful', synonym: 'Charming', distractors: ['Unpleasant', 'Dreadful', 'Awful'] },
  { word: 'Dreadful', synonym: 'Terrible', distractors: ['Wonderful', 'Delightful', 'Excellent'] },
  { word: 'Excellent', synonym: 'Superb', distractors: ['Terrible', 'Awful', 'Dreadful'] },
  { word: 'Awful', synonym: 'Horrible', distractors: ['Excellent', 'Superb', 'Magnificent'] },
  { word: 'Magnificent', synonym: 'Splendid', distractors: ['Awful', 'Dreadful', 'Terrible'] },
  { word: 'Splendid', synonym: 'Marvelous', distractors: ['Awful', 'Poor', 'Mediocre'] },
  { word: 'Mediocre', synonym: 'Average', distractors: ['Excellent', 'Outstanding', 'Superb'] },
  { word: 'Outstanding', synonym: 'Exceptional', distractors: ['Mediocre', 'Ordinary', 'Average'] },
  { word: 'Flawless', synonym: 'Perfect', distractors: ['Flawed', 'Defective', 'Imperfect'] },
  { word: 'Flawed', synonym: 'Defective', distractors: ['Flawless', 'Perfect', 'Ideal'] },
  { word: 'Damaged', synonym: 'Broken', distractors: ['Repaired', 'Intact', 'Undamaged'] },
  { word: 'Repaired', synonym: 'Fixed', distractors: ['Broken', 'Damaged', 'Ruined'] },
  { word: 'Ruined', synonym: 'Destroyed', distractors: ['Restored', 'Repaired', 'Preserved'] },
  { word: 'Preserved', synonym: 'Protected', distractors: ['Ruined', 'Destroyed', 'Damaged'] },
  { word: 'Primitive', synonym: 'Basic', distractors: ['Advanced', 'Modern', 'Sophisticated'] },
  { word: 'Sophisticated', synonym: 'Refined', distractors: ['Primitive', 'Crude', 'Simple'] },
  { word: 'Crude', synonym: 'Rough', distractors: ['Refined', 'Polished', 'Sophisticated'] },
  { word: 'Polished', synonym: 'Refined', distractors: ['Crude', 'Rough', 'Coarse'] },
  { word: 'Coarse', synonym: 'Rough', distractors: ['Smooth', 'Fine', 'Soft'] },
  { word: 'Smooth', synonym: 'Even', distractors: ['Coarse', 'Rough', 'Bumpy'] },
  { word: 'Bumpy', synonym: 'Uneven', distractors: ['Smooth', 'Level', 'Flat'] },
  { word: 'Steady', synonym: 'Stable', distractors: ['Unsteady', 'Wobbly', 'Shaky'] },
  { word: 'Wobbly', synonym: 'Shaky', distractors: ['Steady', 'Stable', 'Firm'] },
  { word: 'Firm', synonym: 'Solid', distractors: ['Wobbly', 'Loose', 'Shaky'] },
  { word: 'Loose', synonym: 'Slack', distractors: ['Firm', 'Tight', 'Snug'] },
  { word: 'Tight', synonym: 'Snug', distractors: ['Loose', 'Baggy', 'Slack'] },
  { word: 'Baggy', synonym: 'Loose-fitting', distractors: ['Tight', 'Snug', 'Fitted'] },
  { word: 'Elderly', synonym: 'Aged', distractors: ['Youthful', 'Young', 'Juvenile'] },
  { word: 'Juvenile', synonym: 'Youthful', distractors: ['Elderly', 'Mature', 'Aged'] },
  { word: 'Mature', synonym: 'Grown-up', distractors: ['Immature', 'Childish', 'Juvenile'] },
  { word: 'Immature', synonym: 'Childish', distractors: ['Mature', 'Grown-up', 'Adult'] },
  { word: 'Adventurous', synonym: 'Daring', distractors: ['Cautious', 'Timid', 'Fearful'] },
  { word: 'Daring', synonym: 'Bold', distractors: ['Timid', 'Cowardly', 'Fearful'] },
  { word: 'Cowardly', synonym: 'Fearful', distractors: ['Brave', 'Bold', 'Courageous'] },
  { word: 'Fearless', synonym: 'Bold', distractors: ['Fearful', 'Timid', 'Cowardly'] },
  { word: 'Valiant', synonym: 'Heroic', distractors: ['Cowardly', 'Timid', 'Weak'] },
  { word: 'Heroic', synonym: 'Valiant', distractors: ['Cowardly', 'Villainous', 'Weak'] },
  { word: 'Villainous', synonym: 'Wicked', distractors: ['Heroic', 'Noble', 'Virtuous'] },
  { word: 'Wicked', synonym: 'Evil', distractors: ['Virtuous', 'Good', 'Kind'] },
  { word: 'Virtuous', synonym: 'Righteous', distractors: ['Wicked', 'Sinful', 'Corrupt'] },
  { word: 'Corrupt', synonym: 'Dishonest', distractors: ['Virtuous', 'Honest', 'Ethical'] },
  { word: 'Ethical', synonym: 'Moral', distractors: ['Corrupt', 'Unethical', 'Immoral'] },
  { word: 'Immoral', synonym: 'Unethical', distractors: ['Moral', 'Ethical', 'Virtuous'] },
  { word: 'Vigilant', synonym: 'Watchful', distractors: ['Careless', 'Inattentive', 'Distracted'] },
  { word: 'Distracted', synonym: 'Inattentive', distractors: ['Focused', 'Attentive', 'Vigilant'] },
  { word: 'Attentive', synonym: 'Focused', distractors: ['Distracted', 'Careless', 'Inattentive'] },
  { word: 'Alert', synonym: 'Watchful', distractors: ['Drowsy', 'Sleepy', 'Unaware'] },
  { word: 'Drowsy', synonym: 'Sleepy', distractors: ['Alert', 'Awake', 'Energetic'] },
  { word: 'Weary', synonym: 'Exhausted', distractors: ['Energetic', 'Refreshed', 'Lively'] },
  { word: 'Lively', synonym: 'Energetic', distractors: ['Weary', 'Sluggish', 'Lethargic'] },
  { word: 'Lethargic', synonym: 'Sluggish', distractors: ['Lively', 'Energetic', 'Active'] },
  { word: 'Active', synonym: 'Energetic', distractors: ['Lethargic', 'Inactive', 'Idle'] },
  { word: 'Inactive', synonym: 'Idle', distractors: ['Active', 'Energetic', 'Busy'] },
  { word: 'Busy', synonym: 'Occupied', distractors: ['Idle', 'Free', 'Available'] },
  { word: 'Available', synonym: 'Accessible', distractors: ['Unavailable', 'Occupied', 'Busy'] },
  { word: 'Limited', synonym: 'Restricted', distractors: ['Unlimited', 'Boundless', 'Ample'] },
  { word: 'Unlimited', synonym: 'Boundless', distractors: ['Limited', 'Restricted', 'Finite'] },
  { word: 'Finite', synonym: 'Limited', distractors: ['Infinite', 'Boundless', 'Unlimited'] },
  { word: 'Infinite', synonym: 'Boundless', distractors: ['Finite', 'Limited', 'Restricted'] },
  { word: 'Compact', synonym: 'Dense', distractors: ['Spacious', 'Bulky', 'Sprawling'] },
  { word: 'Bulky', synonym: 'Cumbersome', distractors: ['Compact', 'Sleek', 'Slim'] },
  { word: 'Sleek', synonym: 'Streamlined', distractors: ['Bulky', 'Clunky', 'Awkward'] },
  { word: 'Clunky', synonym: 'Awkward', distractors: ['Sleek', 'Elegant', 'Graceful'] },
  { word: 'Elegant', synonym: 'Graceful', distractors: ['Clunky', 'Awkward', 'Clumsy'] },
  { word: 'Stylish', synonym: 'Fashionable', distractors: ['Outdated', 'Old-fashioned', 'Dowdy'] },
  { word: 'Dowdy', synonym: 'Shabby', distractors: ['Stylish', 'Elegant', 'Chic'] },
  { word: 'Chic', synonym: 'Fashionable', distractors: ['Dowdy', 'Shabby', 'Frumpy'] },
  { word: 'Shabby', synonym: 'Worn-out', distractors: ['Pristine', 'Immaculate', 'New'] },
  { word: 'Pristine', synonym: 'Immaculate', distractors: ['Shabby', 'Filthy', 'Grimy'] },
  { word: 'Grimy', synonym: 'Filthy', distractors: ['Pristine', 'Spotless', 'Clean'] },
  { word: 'Tidy', synonym: 'Neat', distractors: ['Messy', 'Cluttered', 'Disorganized'] },
  { word: 'Cluttered', synonym: 'Disorganized', distractors: ['Tidy', 'Neat', 'Orderly'] },
  { word: 'Orderly', synonym: 'Systematic', distractors: ['Chaotic', 'Disorderly', 'Messy'] },
  { word: 'Chaotic', synonym: 'Disorderly', distractors: ['Orderly', 'Systematic', 'Organized'] },
  { word: 'Hectic', synonym: 'Frantic', distractors: ['Calm', 'Relaxed', 'Peaceful'] }
];

const AFFIX_POOL = [
  { affix: 're-', meaning: 'again', example: 'redo', isPrefix: true },
  { affix: 'un-', meaning: 'not / the opposite of', example: 'unhappy', isPrefix: true },
  { affix: 'pre-', meaning: 'before', example: 'preview', isPrefix: true },
  { affix: '-ful', meaning: 'full of', example: 'joyful', isPrefix: false },
  { affix: '-less', meaning: 'without', example: 'fearless', isPrefix: false },
  { affix: 'bio-', meaning: 'life', example: 'biology', isPrefix: true },
  { affix: 'auto-', meaning: 'self', example: 'automatic', isPrefix: true },
  { affix: 'mis-', meaning: 'wrongly', example: 'misunderstand', isPrefix: true },
  { affix: 'dis-', meaning: 'not / opposite of', example: 'disagree', isPrefix: true },
  { affix: 'over-', meaning: 'too much', example: 'overcooked', isPrefix: true },
  { affix: '-able', meaning: 'able to be', example: 'washable', isPrefix: false },
  { affix: '-ly', meaning: 'in a certain way', example: 'quickly', isPrefix: false },
  { affix: 'tele-', meaning: 'far off / distant', example: 'telescope', isPrefix: true },
  { affix: '-ist', meaning: 'a person who does', example: 'artist', isPrefix: false },
  { affix: 'sub-', meaning: 'under / below', example: 'submarine', isPrefix: true },
  { affix: 'inter-', meaning: 'between / among', example: 'international', isPrefix: true },
  { affix: 'trans-', meaning: 'across / beyond', example: 'transport', isPrefix: true },
  { affix: '-ology', meaning: 'the study of', example: 'biology', isPrefix: false },
  { affix: '-ness', meaning: 'the state or quality of', example: 'kindness', isPrefix: false },
  { affix: '-tion', meaning: 'the act or process of', example: 'creation', isPrefix: false },
  { affix: 'anti-', meaning: 'against', example: 'antifreeze', isPrefix: true },
  { affix: 'semi-', meaning: 'half or partly', example: 'semicircle', isPrefix: true },
  { affix: 'post-', meaning: 'after', example: 'postgame', isPrefix: true },
  { affix: 'super-', meaning: 'above or beyond', example: 'superhuman', isPrefix: true },
  { affix: 'micro-', meaning: 'very small', example: 'microscope', isPrefix: true },
  { affix: 'non-', meaning: 'not', example: 'nonfiction', isPrefix: true },
  { affix: 'co-', meaning: 'together with', example: 'coworker', isPrefix: true },
  { affix: 'de-', meaning: 'to remove or reverse', example: 'defrost', isPrefix: true },
  { affix: '-ive', meaning: 'tending to or having the quality of', example: 'creative', isPrefix: false },
  { affix: '-ment', meaning: 'the result or action of', example: 'agreement', isPrefix: false },
  { affix: '-ous', meaning: 'full of or having', example: 'dangerous', isPrefix: false },
  { affix: '-ize', meaning: 'to make or become', example: 'modernize', isPrefix: false },
  { affix: '-ward', meaning: 'in the direction of', example: 'backward', isPrefix: false },
  { affix: '-hood', meaning: 'the state or condition of', example: 'childhood', isPrefix: false },
  { affix: '-graph', meaning: 'something written or recorded', example: 'autograph', isPrefix: false },
  { affix: 'phon-', meaning: 'sound', example: 'telephone', isPrefix: true },
  { affix: 'therm-', meaning: 'heat', example: 'thermometer', isPrefix: true },
  { affix: 'chron-', meaning: 'time', example: 'chronological', isPrefix: true },
  { affix: 'geo-', meaning: 'earth', example: 'geography', isPrefix: true },
  { affix: 'hydro-', meaning: 'water', example: 'hydropower', isPrefix: true },
  { affix: 'photo-', meaning: 'light', example: 'photograph', isPrefix: true },
  { affix: '-scope', meaning: 'an instrument for viewing', example: 'microscope', isPrefix: false },
  { affix: 'path-', meaning: 'feeling or suffering', example: 'sympathy', isPrefix: true },
  { affix: 'dict-', meaning: 'to say or speak', example: 'predict', isPrefix: true },
  { affix: 'spect-', meaning: 'to look or watch', example: 'spectator', isPrefix: true },
  { affix: 'port-', meaning: 'to carry', example: 'transport', isPrefix: true },
  { affix: 'vis-', meaning: 'to see', example: 'visible', isPrefix: true },
  { affix: 'aud-', meaning: 'to hear', example: 'audience', isPrefix: true },
  { affix: 'cred-', meaning: 'to believe', example: 'credible', isPrefix: true },
  { affix: 'fac-', meaning: 'to make or do', example: 'factory', isPrefix: true },
  { affix: 'mot-', meaning: 'to move', example: 'motion', isPrefix: true },
  { affix: 'sent-', meaning: 'to feel', example: 'sentiment', isPrefix: true },
  { affix: 'cogn-', meaning: 'to know or become aware', example: 'recognize', isPrefix: true },
  { affix: 'duc-', meaning: 'to lead', example: 'conduct', isPrefix: true },
  { affix: 'flex-', meaning: 'to bend', example: 'flexible', isPrefix: true },
  { affix: 'gen-', meaning: 'birth or origin', example: 'generation', isPrefix: true },
  { affix: 'greg-', meaning: 'group or flock', example: 'gregarious', isPrefix: true },
  { affix: 'jur-', meaning: 'law', example: 'jury', isPrefix: true },
  { affix: 'loc-', meaning: 'place', example: 'location', isPrefix: true },
  { affix: 'manu-', meaning: 'hand', example: 'manual', isPrefix: true },
  { affix: 'mem-', meaning: 'memory or recall', example: 'memorize', isPrefix: true },
  { affix: 'mort-', meaning: 'death', example: 'immortal', isPrefix: true },
  { affix: 'nov-', meaning: 'new', example: 'renovate', isPrefix: true },
  { affix: 'omni-', meaning: 'all', example: 'omnivore', isPrefix: true },
  { affix: 'ped-', meaning: 'foot', example: 'pedestrian', isPrefix: true },
  { affix: 'poly-', meaning: 'many', example: 'polygon', isPrefix: true },
  { affix: 'prim-', meaning: 'first', example: 'primary', isPrefix: true },
  { affix: 'sci-', meaning: 'knowledge', example: 'science', isPrefix: true },
  { affix: 'sol-', meaning: 'alone', example: 'solitude', isPrefix: true },
  { affix: 'son-', meaning: 'sound or tone', example: 'sonic', isPrefix: true },
  { affix: 'spir-', meaning: 'to breathe', example: 'respiration', isPrefix: true },
  { affix: 'tract-', meaning: 'to pull or drag', example: 'attract', isPrefix: true },
  { affix: 'urb-', meaning: 'city', example: 'suburban', isPrefix: true },
  { affix: 'vac-', meaning: 'empty', example: 'vacant', isPrefix: true },
  { affix: 'ver-', meaning: 'truth', example: 'verify', isPrefix: true },
  { affix: 'vol-', meaning: 'to wish or will', example: 'volunteer', isPrefix: true },
  { affix: 'viv-', meaning: 'life or liveliness', example: 'revive', isPrefix: true },
  { affix: '-phobia', meaning: 'fear of', example: 'arachnophobia', isPrefix: false },
  { affix: '-cracy', meaning: 'rule or government', example: 'democracy', isPrefix: false },
  { affix: '-meter', meaning: 'a device that measures', example: 'kilometer', isPrefix: false },
  { affix: '-cide', meaning: 'to kill', example: 'insecticide', isPrefix: false },
  { affix: '-fy', meaning: 'to make or cause to become', example: 'simplify', isPrefix: false },
  { affix: '-ject', meaning: 'to throw', example: 'reject', isPrefix: false },
  { affix: '-gress', meaning: 'to step or go', example: 'progress', isPrefix: false },
  { affix: '-mit', meaning: 'to send', example: 'transmit', isPrefix: false },
  { affix: '-pel', meaning: 'to push or drive', example: 'propel', isPrefix: false },
  { affix: '-rupt', meaning: 'to break', example: 'interrupt', isPrefix: false },
  { affix: '-scrib', meaning: 'to write', example: 'describe', isPrefix: false },
  { affix: '-sect', meaning: 'to cut', example: 'dissect', isPrefix: false },
  { affix: '-solv', meaning: 'to loosen or release', example: 'dissolve', isPrefix: false },
  { affix: '-tain', meaning: 'to hold', example: 'contain', isPrefix: false },
  { affix: '-vert', meaning: 'to turn', example: 'convert', isPrefix: false },
  { affix: 'ambi-', meaning: 'both or around', example: 'ambidextrous', isPrefix: true },
  { affix: 'circum-', meaning: 'completely around', example: 'circumference', isPrefix: true },
  { affix: 'contra-', meaning: 'against or opposite', example: 'contradict', isPrefix: true },
  { affix: 'equi-', meaning: 'equal', example: 'equidistant', isPrefix: true },
  { affix: 'ex-', meaning: 'out of or former', example: 'exhale', isPrefix: true },
  { affix: 'extra-', meaning: 'beyond or outside', example: 'extraordinary', isPrefix: true },
  { affix: 'homo-', meaning: 'same', example: 'homogeneous', isPrefix: true },
  { affix: 'hyper-', meaning: 'excessive or above normal', example: 'hyperactive', isPrefix: true },
  { affix: 'hypo-', meaning: 'under or below normal', example: 'hypothermia', isPrefix: true },
  { affix: 'mono-', meaning: 'one or single', example: 'monorail', isPrefix: true },
  { affix: 'multi-', meaning: 'many or several', example: 'multicolored', isPrefix: true },
  { affix: 'pan-', meaning: 'all or entire', example: 'pandemic', isPrefix: true },
  { affix: 'peri-', meaning: 'near or around the outside', example: 'perimeter', isPrefix: true },
  { affix: 'proto-', meaning: 'first or original', example: 'prototype', isPrefix: true },
  { affix: 'pseudo-', meaning: 'false', example: 'pseudonym', isPrefix: true },
  { affix: 'quad-', meaning: 'four', example: 'quadrilateral', isPrefix: true },
  { affix: 'tri-', meaning: 'three', example: 'triangle', isPrefix: true },
  { affix: 'uni-', meaning: 'one', example: 'unicycle', isPrefix: true }
];

const CONTEXT_POOL = [
  { sentence: "The ravenous wolf hadn't eaten in days, so it devoured the meat instantly.", word: 'ravenous', correct: 'Extremely hungry', wrongs: ['Very sleepy', 'Extremely happy', 'Completely full'] },
  { sentence: 'Her cryptic message left everyone confused about what she really meant.', word: 'cryptic', correct: 'Mysterious or hard to understand', wrongs: ['Very simple and clear', 'Extremely loud', 'Written in a foreign language'] },
  { sentence: 'The exhausted hikers trudged slowly up the final, steep hill.', word: 'trudged', correct: 'Walked slowly and with effort', wrongs: ['Ran quickly', 'Jumped joyfully', 'Stood still'] },
  { sentence: 'The abundant harvest meant the farmers had more than enough food for winter.', word: 'abundant', correct: 'Plentiful; more than enough', wrongs: ['Very scarce', 'Rotten and inedible', 'Extremely expensive'] },
  { sentence: 'The toddler was fascinated by the vibrant colors of the butterfly.', word: 'vibrant', correct: 'Bright and full of life', wrongs: ['Dull and faded', 'Extremely small', 'Completely invisible'] },
  { sentence: 'The suspicious stranger lurked near the entrance, watching everyone who passed.', word: 'lurked', correct: 'Waited or hid in a sneaky, watchful way', wrongs: ['Danced happily', 'Slept soundly', 'Sang loudly'] },
  { sentence: 'The old oak table was so sturdy that it held the weight of ten people without wobbling.', word: 'sturdy', correct: 'Strong and firm', wrongs: ['Weak and wobbly', 'Extremely fast', 'Very colorful'] },
  { sentence: 'The professor gave a tedious three-hour lecture that put half the class to sleep.', word: 'tedious', correct: 'Boring and tiresome', wrongs: ['Exciting and fun', 'Very short', 'Extremely loud'] },
  { sentence: 'The detective was meticulous, checking every tiny detail of the crime scene twice.', word: 'meticulous', correct: 'Extremely careful and thorough', wrongs: ['Careless and rushed', 'Confused and lost', 'Loud and dramatic'] },
  { sentence: "The candidate's speech was so eloquent that the entire audience stood and applauded.", word: 'eloquent', correct: 'Well-spoken and persuasive', wrongs: ['Confusing and unclear', 'Extremely short', 'Written, not spoken'] },
  { sentence: 'After the marathon, the runner felt utterly depleted and could barely stand.', word: 'depleted', correct: 'Completely drained of energy', wrongs: ['Full of energy', 'Mildly annoyed', 'Extremely proud'] },
  { sentence: 'The old house was so dilapidated that the roof had caved in on one side.', word: 'dilapidated', correct: 'Falling apart from age or neglect', wrongs: ['Brand new and modern', 'Recently painted', 'Extremely expensive'] },
  { sentence: 'The comedian\'s jokes were so witty that the whole audience burst into laughter.', word: 'witty', correct: 'Cleverly funny', wrongs: ['Dull and unfunny', 'Extremely quiet', 'Sad and serious'] },
  { sentence: 'The negotiations were tense, but both sides eventually reached an amicable agreement.', word: 'amicable', correct: 'Friendly and free of disagreement', wrongs: ['Hostile and angry', 'Confusing and unclear', 'Extremely expensive'] },
  { sentence: 'The shy student was reluctant to raise her hand, even though she knew the answer.', word: 'reluctant', correct: 'Unwilling or hesitant', wrongs: ['Eager and excited', 'Confident and loud', 'Completely unaware'] },
  { sentence: 'The scientist\'s theory seemed plausible, backed up by years of careful research.', word: 'plausible', correct: 'Believable or reasonable', wrongs: ['Completely impossible', 'Extremely boring', 'Poorly written'] },
  { sentence: 'The toddler was adamant that he wanted the blue cup, refusing every other color.', word: 'adamant', correct: 'Firmly insistent and unwilling to change one\'s mind', wrongs: ['Easily persuaded', 'Confused and unsure', 'Sleepy and quiet'] },
  { sentence: 'The mysterious footprints in the snow left the hikers utterly perplexed.', word: 'perplexed', correct: 'Confused or puzzled', wrongs: ['Completely certain', 'Extremely happy', 'Bored and tired'] },
  { sentence: 'The volunteers were commended for their tireless efforts after the flood.', word: 'commended', correct: 'Praised or officially recognized', wrongs: ['Criticized harshly', 'Ignored completely', 'Punished severely'] },
  { sentence: 'The soup had a bland taste, so she added extra spices to liven it up.', word: 'bland', correct: 'Lacking flavor or excitement', wrongs: ['Extremely spicy', 'Very colorful', 'Perfectly seasoned'] },
  { sentence: 'The mayor gave a candid answer, admitting the plan had failed.', word: 'candid', correct: 'Honest and straightforward', wrongs: ['Vague and evasive', 'Extremely rude', 'Written down formally'] },
  { sentence: 'The stubborn goat was obstinate, refusing to move no matter how hard they pulled.', word: 'obstinate', correct: 'Stubbornly refusing to change', wrongs: ['Easily persuaded', 'Very friendly', 'Extremely tired'] },
  { sentence: 'The lawyer presented ample evidence, more than enough to convince the jury.', word: 'ample', correct: 'Plentiful; more than sufficient', wrongs: ['Barely enough', 'Completely missing', 'Confusing and unclear'] },
  { sentence: 'Her concise summary covered the entire book in just two short paragraphs.', word: 'concise', correct: 'Brief and to the point', wrongs: ['Long and rambling', 'Confusing and vague', 'Written in another language'] },
  { sentence: 'The audience was captivated, unable to look away from the stunning performance.', word: 'captivated', correct: 'Completely fascinated', wrongs: ['Extremely bored', 'Slightly annoyed', 'Falling asleep'] },
  { sentence: 'The old bridge was so precarious that engineers feared it might collapse.', word: 'precarious', correct: 'Dangerously unstable', wrongs: ['Perfectly safe', 'Newly built', 'Brightly painted'] },
  { sentence: 'The twins were nearly identical, but a keen observer could tell them apart.', word: 'keen', correct: 'Sharp and perceptive', wrongs: ['Careless and distracted', 'Completely blind', 'Extremely slow'] },
  { sentence: 'The volunteers worked with zeal, eager to finish before the storm arrived.', word: 'zeal', correct: 'Great energy and enthusiasm', wrongs: ['Total exhaustion', 'Quiet indifference', 'Mild annoyance'] },
  { sentence: 'The critic wrote a scathing review, tearing the film apart line by line.', word: 'scathing', correct: 'Harshly critical', wrongs: ['Warmly complimentary', 'Completely neutral', 'Very brief'] },
  { sentence: 'His frugal habits meant he saved almost every dollar he earned.', word: 'frugal', correct: 'Careful and thrifty with money', wrongs: ['Wasteful and careless', 'Extremely generous', 'Constantly borrowing'] },
  { sentence: 'The hikers found a secluded meadow, far from any trail or crowd.', word: 'secluded', correct: 'Isolated and private', wrongs: ['Crowded and busy', 'Loud and noisy', 'Brightly lit'] },
  { sentence: 'The coach gave a terse reply, just two words before walking away.', word: 'terse', correct: 'Short and abrupt', wrongs: ['Long and detailed', 'Warm and friendly', 'Confusing and unclear'] },
  { sentence: 'The old sailor was gruff but kind underneath his rough exterior.', word: 'gruff', correct: 'Rough or blunt in manner', wrongs: ['Cheerful and bubbly', 'Extremely shy', 'Soft-spoken and gentle'] },
  { sentence: "The museum's newest exhibit was truly novel, unlike anything seen before.", word: 'novel', correct: 'New and original', wrongs: ['Old and familiar', 'Broken and unusable', 'Extremely expensive'] },
  { sentence: 'It was audacious of the new student to challenge the champion on his first day.', word: 'audacious', correct: 'Boldly daring, even to the point of being risky', wrongs: ['Extremely shy and quiet', 'Careful and cautious', 'Completely uninterested'] },
  { sentence: 'The benevolent old woman spent her weekends cooking meals for the homeless.', word: 'benevolent', correct: 'Kind and generous', wrongs: ['Cruel and greedy', 'Lazy and careless', 'Confused and forgetful'] },
  { sentence: 'The villain\'s malicious plan was designed to ruin his neighbor\'s reputation.', word: 'malicious', correct: 'Intending to cause harm', wrongs: ['Meant to be helpful', 'Completely accidental', 'Playfully silly'] },
  { sentence: 'She remained indifferent to the gossip, barely glancing up from her book.', word: 'indifferent', correct: 'Showing no interest or concern', wrongs: ['Extremely curious', 'Deeply upset', 'Wildly excited'] },
  { sentence: 'The exuberant fans jumped, cheered, and hugged strangers when their team scored.', word: 'exuberant', correct: 'Full of energetic excitement', wrongs: ['Quiet and withdrawn', 'Tired and bored', 'Annoyed and irritable'] },
  { sentence: 'After the flu, he felt listless, with no energy to even get out of bed.', word: 'listless', correct: 'Lacking energy or enthusiasm', wrongs: ['Bursting with energy', 'Extremely cheerful', 'Fully alert and focused'] },
  { sentence: 'The wary deer froze at the edge of the clearing, sniffing the air for danger.', word: 'wary', correct: 'Cautious about possible danger', wrongs: ['Completely relaxed', 'Careless and reckless', 'Fast asleep'] },
  { sentence: 'The gullible customer believed the salesman\'s obviously fake story right away.', word: 'gullible', correct: 'Easily tricked or deceived', wrongs: ['Impossible to fool', 'Extremely suspicious', 'Very intelligent'] },
  { sentence: 'He tends to procrastinate, leaving every assignment until the night before it is due.', word: 'procrastinate', correct: 'To delay or put off doing something', wrongs: ['To finish tasks early', 'To organize carefully', 'To ask for help'] },
  { sentence: 'The relentless rain kept falling for three straight days without ever letting up.', word: 'relentless', correct: 'Never stopping; persistent', wrongs: ['Occasional and light', 'Gentle and brief', 'Completely absent'] },
  { sentence: 'The lake was tranquil at dawn, its surface perfectly still and silent.', word: 'tranquil', correct: 'Calm and peaceful', wrongs: ['Violently stormy', 'Loud and crowded', 'Dirty and polluted'] },
  { sentence: 'The turbulent meeting ended in shouting after three separate arguments broke out.', word: 'turbulent', correct: 'Full of conflict or sudden disturbance', wrongs: ['Calm and orderly', 'Quiet and dull', 'Friendly and warm'] },
  { sentence: 'Her volatile temper meant nobody knew if she would laugh or explode with anger next.', word: 'volatile', correct: 'Likely to change suddenly and unpredictably', wrongs: ['Perfectly steady and calm', 'Slow to react to anything', 'Completely emotionless'] },
  { sentence: 'The zealous volunteer showed up an hour early every single day to help set up.', word: 'zealous', correct: 'Showing great enthusiasm for a cause', wrongs: ['Reluctant and unwilling', 'Bored and distracted', 'Careless and forgetful'] },
  { sentence: 'The amiable shopkeeper greeted every customer with a warm smile and a joke.', word: 'amiable', correct: 'Friendly and pleasant', wrongs: ['Rude and hostile', 'Cold and distant', 'Nervous and shy'] },
  { sentence: 'The two rival gangs grew belligerent, shoving and shouting threats at each other.', word: 'belligerent', correct: 'Hostile and eager to fight', wrongs: ['Calm and peaceful', 'Shy and withdrawn', 'Cheerful and playful'] },
  { sentence: 'Dinner with the congenial hosts felt easy, with warm conversation all evening.', word: 'congenial', correct: 'Pleasant and agreeable', wrongs: ['Tense and awkward', 'Cold and unwelcoming', 'Loud and chaotic'] },
  { sentence: 'The docile old horse let the toddlers pet its nose without flinching.', word: 'docile', correct: 'Easy to manage or control; gentle', wrongs: ['Wild and dangerous', 'Fast and unpredictable', 'Aggressive and biting'] },
  { sentence: 'His erratic driving, swerving lane to lane, made every passenger nervous.', word: 'erratic', correct: 'Irregular and unpredictable', wrongs: ['Perfectly smooth and steady', 'Extremely slow', 'Carefully planned'] },
  { sentence: 'Her fickle taste in music changed every week, from pop to jazz to metal.', word: 'fickle', correct: 'Changing opinions or loyalty frequently', wrongs: ['Completely consistent', 'Firmly decided forever', 'Slow to form any opinion'] },
  { sentence: 'The garrulous cab driver talked nonstop for the entire forty-minute ride.', word: 'garrulous', correct: 'Excessively talkative', wrongs: ['Silent the whole trip', 'Shy and withdrawn', 'Angry and shouting'] },
  { sentence: 'The hapless intern spilled coffee, missed the bus, and lost his badge, all before 9 a.m.', word: 'hapless', correct: 'Unlucky', wrongs: ['Extremely fortunate', 'Carefully organized', 'Highly skilled'] },
  { sentence: 'His impetuous decision to quit his job on the spot surprised everyone.', word: 'impetuous', correct: 'Acting suddenly without thinking things through', wrongs: ['Carefully planned over months', 'Slow and hesitant', 'Forced by someone else'] },
  { sentence: 'The jubilant crowd danced in the streets after their team won the championship.', word: 'jubilant', correct: 'Joyfully triumphant', wrongs: ['Deeply disappointed', 'Bored and indifferent', 'Confused and lost'] },
  { sentence: 'After losing the contest, he grew morose and refused to talk to anyone for days.', word: 'morose', correct: 'Sullen and gloomy', wrongs: ['Cheerful and upbeat', 'Excited and energetic', 'Calm and relaxed'] },
  { sentence: 'She stayed nonchalant even as the crowd gasped, barely reacting to the news.', word: 'nonchalant', correct: 'Calm and seemingly unconcerned', wrongs: ['Extremely panicked', 'Wildly excited', 'Furiously angry'] },
  { sentence: 'The opulent ballroom sparkled with gold trim, crystal chandeliers, and marble floors.', word: 'opulent', correct: 'Extremely luxurious and lavish', wrongs: ['Plain and simple', 'Run-down and shabby', 'Small and cramped'] },
  { sentence: 'She grew pensive while staring out the train window, thinking about home.', word: 'pensive', correct: 'Deeply thoughtful, often with a hint of sadness', wrongs: ['Loud and talkative', 'Cheerful and carefree', 'Angry and shouting'] },
  { sentence: 'The quaint village had cobblestone streets and flower boxes on every windowsill.', word: 'quaint', correct: 'Attractively old-fashioned or charming', wrongs: ['Modern and industrial', 'Ugly and neglected', 'Loud and busy'] },
  { sentence: 'Despite the setbacks, she remained resolute, promising to finish what she started.', word: 'resolute', correct: 'Firm and determined', wrongs: ['Easily discouraged', 'Uncertain and wavering', 'Careless and indifferent'] },
  { sentence: 'Even after his friends left the club, he stayed staunch in his support of the team.', word: 'staunch', correct: 'Firmly loyal', wrongs: ['Easily swayed', 'Secretly disloyal', 'Completely uninterested'] },
  { sentence: 'The taciturn farmer answered every question with a single nod or word.', word: 'taciturn', correct: 'Saying very little; reserved', wrongs: ['Extremely talkative', 'Loud and dramatic', 'Friendly and chatty'] },
  { sentence: 'The unruly classroom ignored the substitute teacher and threw paper across the room.', word: 'unruly', correct: 'Disorderly and hard to control', wrongs: ['Perfectly well-behaved', 'Silent and obedient', 'Organized and calm'] },
  { sentence: 'He grew vexed when the printer jammed for the fourth time that morning.', word: 'vexed', correct: 'Annoyed or frustrated', wrongs: ['Delighted and pleased', 'Completely relaxed', 'Bored and sleepy'] },
  { sentence: 'The artist\'s whimsical drawings showed flying teapots and dancing clouds.', word: 'whimsical', correct: 'Playfully fanciful or imaginative', wrongs: ['Strictly realistic', 'Dark and frightening', 'Plain and boring'] },
  { sentence: 'She felt a deep yearning to see her grandmother again after the long trip abroad.', word: 'yearning', correct: 'A strong feeling of longing', wrongs: ['A complete lack of interest', 'A feeling of anger', 'A moment of confusion'] },
  { sentence: 'The zestful new coach brought so much energy that practice felt like a party.', word: 'zestful', correct: 'Full of energy and enthusiasm', wrongs: ['Tired and sluggish', 'Cold and distant', 'Nervous and anxious'] },
  { sentence: 'His abrasive comments during the meeting left several coworkers offended.', word: 'abrasive', correct: 'Harsh and rough in manner', wrongs: ['Gentle and soothing', 'Quiet and shy', 'Cheerful and warm'] },
  { sentence: 'The brazen shoplifter walked out the front door with the TV in plain sight.', word: 'brazen', correct: 'Bold and shameless', wrongs: ['Nervous and hesitant', 'Secretive and hidden', 'Apologetic and shy'] },
  { sentence: 'They held a clandestine meeting in the basement so no one else would find out.', word: 'clandestine', correct: 'Secret and hidden', wrongs: ['Public and announced', 'Loud and obvious', 'Accidental and unplanned'] },
  { sentence: 'The diligent student reviewed her notes every night, never missing a single day.', word: 'diligent', correct: 'Showing careful, persistent effort', wrongs: ['Lazy and careless', 'Distracted and forgetful', 'Rushed and sloppy'] },
  { sentence: 'The elusive butterfly darted away every time the child got close enough to catch it.', word: 'elusive', correct: 'Difficult to find or catch', wrongs: ['Easy to catch', 'Completely motionless', 'Very large and obvious'] },
  { sentence: 'The singer\'s flamboyant costume was covered in sequins, feathers, and neon colors.', word: 'flamboyant', correct: 'Showy and boldly colorful', wrongs: ['Plain and unnoticeable', 'Dark and dull', 'Simple and modest'] },
  { sentence: 'The gregarious puppy bounded up to greet every single visitor at the party.', word: 'gregarious', correct: 'Sociable; enjoying the company of others', wrongs: ['Shy and withdrawn', 'Aggressive and biting', 'Sleepy and lazy'] },
  { sentence: 'The haughty noble refused to speak to anyone he considered beneath him.', word: 'haughty', correct: 'Arrogantly proud', wrongs: ['Humble and modest', 'Friendly and warm', 'Nervous and shy'] },
  { sentence: 'The impartial referee made the same calls whether it helped the home team or not.', word: 'impartial', correct: 'Not favoring one side; fair', wrongs: ['Strongly biased', 'Confused and uncertain', 'Loud and rude'] },
  { sentence: 'The jovial grandfather laughed loudly at his own jokes during every holiday dinner.', word: 'jovial', correct: 'Cheerful and friendly', wrongs: ['Gloomy and sour', 'Silent and serious', 'Nervous and tense'] },
  { sentence: 'The two strangers discovered they were kindred spirits who both loved astronomy.', word: 'kindred', correct: 'Similar in nature; closely related', wrongs: ['Completely opposite', 'Unfamiliar and strange', 'Distant and cold'] },
  { sentence: 'She began to lament the missed opportunity, wishing she had spoken up sooner.', word: 'lament', correct: 'To express deep sorrow or regret', wrongs: ['To celebrate joyfully', 'To ignore completely', 'To laugh about'] },
  { sentence: 'The river seemed to meander lazily through the valley, curving back on itself again and again.', word: 'meander', correct: 'To wander slowly without a fixed direction', wrongs: ['To rush in a straight line', 'To stay completely still', 'To flow underground'] },
  { sentence: 'The old photograph made her feel nostalgic for summers at her grandparents\' farm.', word: 'nostalgic', correct: 'Feeling sentimental longing for the past', wrongs: ['Feeling nothing at all', 'Feeling angry about the future', 'Feeling confused by the present'] },
  { sentence: 'His ostentatious gold watch and diamond rings were clearly meant to impress everyone.', word: 'ostentatious', correct: 'Showing off wealth to impress others', wrongs: ['Modest and understated', 'Cheap and worthless', 'Hidden from view'] },
  { sentence: 'It was peculiar that the cat kept staring at the empty corner of the room.', word: 'peculiar', correct: 'Strange or unusual', wrongs: ['Completely normal', 'Extremely boring', 'Very expected'] },
  { sentence: 'She faced a real quandary: tell her friend the truth, or protect her feelings with a lie.', word: 'quandary', correct: 'A difficult, confusing situation', wrongs: ['An easy, obvious choice', 'A moment of celebration', 'A minor, unimportant detail'] },
  { sentence: 'The ruthless business owner fired anyone who slowed down profits, without a second thought.', word: 'ruthless', correct: 'Showing no pity or compassion', wrongs: ['Extremely kind and gentle', 'Fair and understanding', 'Nervous and hesitant'] },
  { sentence: 'The skeptical detective refused to believe the suspect\'s story without solid proof.', word: 'skeptical', correct: 'Doubtful; not easily convinced', wrongs: ['Completely trusting', 'Extremely gullible', 'Totally uninterested'] },
  { sentence: 'His tentative first step onto the ice showed just how unsure he was of its safety.', word: 'tentative', correct: 'Uncertain and hesitant', wrongs: ['Bold and confident', 'Fast and reckless', 'Careless and rushed'] },
  { sentence: 'Her unwavering support never changed, even when everyone else gave up on the plan.', word: 'unwavering', correct: 'Steady and not changing', wrongs: ['Constantly shifting', 'Weak and easily broken', 'Brief and temporary'] },
  { sentence: 'The vivacious performer bounced across the stage, grinning and waving at the crowd.', word: 'vivacious', correct: 'Lively and full of energy', wrongs: ['Tired and sluggish', 'Quiet and withdrawn', 'Angry and hostile'] },
  { sentence: 'Looking at her old school photos left her feeling wistful about childhood summers.', word: 'wistful', correct: 'Full of longing tinged with sadness', wrongs: ['Full of anger', 'Completely indifferent', 'Bursting with joy'] },
  { sentence: 'She claimed to abhor liver and onions, refusing to even smell the dish.', word: 'abhor', correct: 'To hate intensely', wrongs: ['To love deeply', 'To feel curious about', 'To feel nothing about'] },
  { sentence: 'The old friends fell into easy banter, trading jokes the moment they sat down.', word: 'banter', correct: 'Playful, teasing conversation', wrongs: ['A serious formal debate', 'A silent standoff', 'An angry argument'] },
  { sentence: 'He tried to cajole his sister into lending him the car with flattery and promises.', word: 'cajole', correct: 'To persuade someone through flattery or gentle urging', wrongs: ['To threaten someone into agreeing', 'To ignore someone completely', 'To pay someone directly'] },
  { sentence: 'The illness began to debilitate him, leaving him too weak to climb the stairs.', word: 'debilitate', correct: 'To weaken', wrongs: ['To strengthen', 'To cure completely', 'To energize'] },
  { sentence: 'He tended to embellish his fishing stories, adding a bigger fish every time he told it.', word: 'embellish', correct: 'To add extra, often exaggerated, detail', wrongs: ['To shorten and simplify', 'To keep perfectly accurate', 'To forget entirely'] },
  { sentence: 'Investigators discovered the witness had fabricated the entire alibi.', word: 'fabricate', correct: 'To invent or make up', wrongs: ['To confirm as true', 'To carefully research', 'To accidentally repeat'] },
  { sentence: 'The warm meal and kind words seemed to gratify the exhausted travelers.', word: 'gratify', correct: 'To please or satisfy', wrongs: ['To annoy or upset', 'To confuse completely', 'To frighten badly'] },
  { sentence: 'Heavy traffic continued to hinder the ambulance\'s progress toward the hospital.', word: 'hinder', correct: 'To slow down or get in the way of', wrongs: ['To speed up', 'To celebrate', 'To repair'] },
  { sentence: 'When the microphone failed, the comedian had to improvise a whole new bit on the spot.', word: 'improvise', correct: 'To create or perform something without preparation', wrongs: ['To follow a strict script', 'To cancel the show', 'To rehearse for weeks'] },
  { sentence: 'Texting while driving could jeopardize both your safety and everyone else\'s.', word: 'jeopardize', correct: 'To put at risk', wrongs: ['To guarantee safety for', 'To improve completely', 'To ignore entirely'] },
  { sentence: 'A single spark was enough to kindle the tiny campfire into a roaring blaze.', word: 'kindle', correct: 'To start (a fire); to arouse a feeling', wrongs: ['To extinguish completely', 'To freeze solid', 'To measure carefully'] },
  { sentence: 'Without water or sunlight, the little seedling began to languish in the dark closet.', word: 'languish', correct: 'To become weak or fail to make progress', wrongs: ['To grow quickly and thrive', 'To bloom brightly', 'To spread rapidly'] },
  { sentence: 'The new policy was designed to mitigate the damage caused by the factory\'s pollution.', word: 'mitigate', correct: 'To make less severe', wrongs: ['To make much worse', 'To completely ignore', 'To celebrate publicly'] },
  { sentence: 'Good teachers nurture curiosity in their students instead of just demanding memorization.', word: 'nurture', correct: 'To care for and help grow', wrongs: ['To ignore and neglect', 'To punish harshly', 'To destroy completely'] },
  { sentence: 'The contract will oblige the company to repair any damage within thirty days.', word: 'oblige', correct: 'To require or do a favor for', wrongs: ['To forbid entirely', 'To reward generously', 'To confuse completely'] },
  { sentence: 'The zookeeper spoke softly to pacify the frightened animal before the vet arrived.', word: 'pacify', correct: 'To calm down', wrongs: ['To provoke further', 'To frighten more', 'To ignore completely'] },
  { sentence: 'A tall glass of cold water finally helped quench his thirst after the long run.', word: 'quench', correct: 'To satisfy (thirst) or put out (a fire)', wrongs: ['To increase greatly', 'To create suddenly', 'To measure exactly'] },
  { sentence: 'The principal chose to rebuke the students privately instead of embarrassing them.', word: 'rebuke', correct: 'To criticize sharply', wrongs: ['To praise warmly', 'To reward generously', 'To ignore quietly'] },
  { sentence: 'The storm continued until the ground was completely saturated with rainwater.', word: 'saturate', correct: 'To soak or fill completely', wrongs: ['To dry out completely', 'To freeze solid', 'To burn away'] },
  { sentence: 'Even in the rocky, dry soil, the stubborn little cactus managed to thrive.', word: 'thrive', correct: 'To grow or develop successfully', wrongs: ['To wither and die', 'To stay exactly the same', 'To shrink slowly'] },
  { sentence: 'Constant criticism began to undermine her confidence before the big performance.', word: 'undermine', correct: 'To weaken gradually', wrongs: ['To strengthen greatly', 'To ignore completely', 'To celebrate loudly'] },
  { sentence: 'New evidence finally helped vindicate the man who had been wrongly accused.', word: 'vindicate', correct: 'To clear of blame', wrongs: ['To prove guilty', 'To confuse further', 'To punish severely'] },
  { sentence: 'As autumn arrived, the daylight began to wane earlier and earlier each evening.', word: 'wane', correct: 'To gradually decrease', wrongs: ['To gradually increase', 'To stay exactly the same', 'To disappear instantly'] },
  { sentence: 'After a long argument, he finally decided to yield and let his sister choose the movie.', word: 'yield', correct: 'To give way or give in', wrongs: ['To refuse completely', 'To argue louder', 'To leave angrily'] },
  { sentence: 'The new speakers seemed to amplify every sound in the small room to a deafening level.', word: 'amplify', correct: 'To increase in size, volume, or strength', wrongs: ['To reduce to silence', 'To keep exactly the same', 'To remove completely'] },
  { sentence: 'The strange noises in the attic continued to bewilder the new homeowners.', word: 'bewilder', correct: 'To confuse thoroughly', wrongs: ['To reassure completely', 'To delight instantly', 'To bore completely'] },
  { sentence: 'Two independent witnesses were able to corroborate the driver\'s version of events.', word: 'corroborate', correct: 'To confirm or support with evidence', wrongs: ['To contradict completely', 'To forget entirely', 'To invent falsely'] },
  { sentence: 'The con artist tried to deceive the elderly couple into signing away their savings.', word: 'deceive', correct: 'To mislead intentionally', wrongs: ['To help honestly', 'To warn clearly', 'To reward generously'] },
  { sentence: 'Her rescue of the drowning swimmer perfectly exemplifies what it means to be brave.', word: 'exemplify', correct: 'To be a typical example of', wrongs: ['To contradict entirely', 'To hide completely', 'To forget about'] },
  { sentence: 'The stock price began to fluctuate wildly, rising and falling every few minutes.', word: 'fluctuate', correct: 'To rise and fall irregularly', wrongs: ['To stay perfectly steady', 'To disappear entirely', 'To increase only'] },
  { sentence: 'The coach\'s halftime speech seemed to galvanize the exhausted team into a comeback.', word: 'galvanize', correct: 'To shock or excite into sudden action', wrongs: ['To calm completely', 'To exhaust further', 'To confuse thoroughly'] },
  { sentence: 'Seeing the storm clouds roll in, the campers began to hasten toward the cabin.', word: 'hasten', correct: 'To hurry', wrongs: ['To slow down', 'To stop completely', 'To wander aimlessly'] },
  { sentence: 'The referee\'s unfair call was enough to infuriate the entire home crowd.', word: 'infuriate', correct: 'To make extremely angry', wrongs: ['To delight completely', 'To calm instantly', 'To bore thoroughly'] },
  { sentence: 'Fans began to jostle for position, pushing and shoving to get closer to the stage.', word: 'jostle', correct: 'To bump or push roughly', wrongs: ['To stand perfectly still', 'To politely wait in line', 'To sit down quietly'] },
  { sentence: 'She decided to linger at the museum long after her friends had already left.', word: 'linger', correct: 'To stay longer than expected', wrongs: ['To leave immediately', 'To arrive late', 'To hide completely'] },
  { sentence: 'The magician\'s final trick seemed to mesmerize the entire audience into silence.', word: 'mesmerize', correct: 'To hold completely spellbound', wrongs: ['To bore completely', 'To annoy greatly', 'To frighten away'] },
  { sentence: 'The two companies spent months trying to negotiate a fair price for the merger.', word: 'negotiate', correct: 'To discuss something in order to reach an agreement', wrongs: ['To refuse to speak at all', 'To fight physically', 'To ignore completely'] },
  { sentence: 'A fallen tree continued to obstruct the only road out of the flooded valley.', word: 'obstruct', correct: 'To block', wrongs: ['To clear completely', 'To repair quickly', 'To widen greatly'] },
  { sentence: 'Despite failing the exam twice, she chose to persevere and study even harder.', word: 'persevere', correct: 'To keep going despite difficulty', wrongs: ['To give up immediately', 'To ignore the problem', 'To blame someone else'] },
  { sentence: 'The neighbors began to quarrel loudly over whose fence the tree had damaged.', word: 'quarrel', correct: 'An angry argument', wrongs: ['A friendly agreement', 'A quiet nap', 'A shared meal'] },
  { sentence: 'The teacher chose to reprimand the students quietly instead of yelling in front of the class.', word: 'reprimand', correct: 'A formal expression of disapproval', wrongs: ['A warm compliment', 'A generous reward', 'A cheerful greeting'] },
  { sentence: 'He would squander his entire allowance on candy within the first hour of getting it.', word: 'squander', correct: 'To waste carelessly', wrongs: ['To save carefully', 'To invest wisely', 'To donate generously'] },
  { sentence: 'Her parents agreed to tolerate the loud music for one more hour before bedtime.', word: 'tolerate', correct: 'To allow or put up with', wrongs: ['To forbid completely', 'To celebrate loudly', 'To reward generously'] },
  { sentence: 'The museum planned to unveil the mysterious new dinosaur skeleton on Friday.', word: 'unveil', correct: 'To reveal', wrongs: ['To hide again', 'To destroy completely', 'To sell quietly'] },
  { sentence: 'The tiny underdog team managed to vanquish the reigning champions in the final round.', word: 'vanquish', correct: 'To defeat completely', wrongs: ['To lose badly to', 'To tie with', 'To avoid entirely'] },
  { sentence: 'The company chose to withhold the bonus payments until the audit was finished.', word: 'withhold', correct: 'To hold back', wrongs: ['To give away freely', 'To double instantly', 'To announce publicly'] },
  { sentence: 'Over the years, the collector managed to accumulate over three hundred rare coins.', word: 'accumulate', correct: 'To gather gradually over time', wrongs: ['To lose gradually', 'To give away instantly', 'To destroy completely'] },
  { sentence: 'His careless blunder on the final play cost the team the championship game.', word: 'blunder', correct: 'A careless mistake', wrongs: ['A brilliant strategy', 'A lucky coincidence', 'A planned sacrifice'] },
  { sentence: 'She sat quietly on the porch, choosing to contemplate her options before deciding.', word: 'contemplate', correct: 'To think deeply about', wrongs: ['To ignore completely', 'To announce immediately', 'To forget instantly'] },
  { sentence: 'Under pressure from reporters, the spokesperson finally chose to divulge the secret plan.', word: 'divulge', correct: 'To reveal (secret information)', wrongs: ['To conceal completely', 'To forget entirely', 'To deny firmly'] },
  { sentence: 'The new lighting was meant to enhance the painting\'s already vivid colors.', word: 'enhance', correct: 'To improve', wrongs: ['To ruin completely', 'To hide entirely', 'To ignore fully'] },
  { sentence: 'Even in the harsh desert climate, the hardy wildflowers continued to flourish.', word: 'flourish', correct: 'To grow vigorously; thrive', wrongs: ['To wither and die', 'To stay perfectly still', 'To shrink gradually'] },
  { sentence: 'The tired passengers began to grumble about the third delayed flight in a row.', word: 'grumble', correct: 'To complain in a low, discontented voice', wrongs: ['To cheer enthusiastically', 'To laugh loudly', 'To sing happily'] },
  { sentence: 'The old dragon in the story would hoard piles of gold deep within its cave.', word: 'hoard', correct: 'To collect and store away, often secretly', wrongs: ['To give away freely', 'To spend quickly', 'To destroy completely'] },
  { sentence: 'Rumors suggested a rival company had tried to instigate the factory workers\' strike.', word: 'instigate', correct: 'To cause or stir up (often trouble)', wrongs: ['To prevent completely', 'To calm down', 'To ignore entirely'] },
  { sentence: 'He struggled to justify his decision to skip the meeting without a good excuse.', word: 'justify', correct: 'To show to be right or reasonable', wrongs: ['To hide completely', 'To forget about', 'To celebrate openly'] },
  { sentence: 'The hosts threw a lavish party with a live band, ice sculptures, and a five-course meal.', word: 'lavish', correct: 'Very generous or extravagant', wrongs: ['Extremely plain and simple', 'Cheap and stingy', 'Quiet and modest'] },
  { sentence: 'The general worked all night to muster enough troops before the battle began.', word: 'muster', correct: 'To gather together', wrongs: ['To scatter completely', 'To hide away', 'To lose track of'] },
  { sentence: 'The new evidence seemed to negate everything the lawyer had argued that morning.', word: 'negate', correct: 'To cancel out or make ineffective', wrongs: ['To strongly confirm', 'To celebrate loudly', 'To double in strength'] },
  { sentence: 'The sheer size of the ancient cathedral was enough to overwhelm the young visitors.', word: 'overwhelm', correct: 'To overpower completely', wrongs: ['To bore slightly', 'To calm instantly', 'To ignore entirely'] },
  { sentence: 'Losing her job and her home in the same month was a period of true adversity.', word: 'adversity', correct: 'Difficult circumstances or hardship', wrongs: ['A time of great luck', 'A moment of celebration', 'A period of boredom'] },
  { sentence: 'The loss of their family pet caused the children real anguish for weeks.', word: 'anguish', correct: 'Severe mental or physical suffering', wrongs: ['Complete happiness', 'Mild curiosity', 'Total boredom'] },
  { sentence: 'Floating in the warm pool on a lazy Sunday felt like pure bliss.', word: 'bliss', correct: 'Complete happiness', wrongs: ['Deep sadness', 'Constant worry', 'Total confusion'] },
  { sentence: 'When the power went out during the storm, the office descended into chaos.', word: 'chaos', correct: 'Complete disorder and confusion', wrongs: ['Perfect order', 'Total silence', 'Gentle calm'] },
  { sentence: 'After the third rejection letter, he sank into despair about ever getting published.', word: 'despair', correct: 'A complete loss of hope', wrongs: ['Overwhelming joy', 'Mild annoyance', 'Sudden excitement'] },
  { sentence: 'Crossing the finish line first, she felt a rush of pure euphoria.', word: 'euphoria', correct: 'Intense excitement and happiness', wrongs: ['Deep sadness', 'Total exhaustion', 'Complete boredom'] },
  { sentence: 'It took real fortitude for the firefighter to walk back into the burning building.', word: 'fortitude', correct: 'Courage in facing pain or hardship', wrongs: ['Fear of any risk', 'Complete carelessness', 'A total lack of skill'] },
  { sentence: 'The whole town shared in the family\'s grief after the terrible accident.', word: 'grief', correct: 'Deep sorrow', wrongs: ['Great excitement', 'Mild curiosity', 'Total relief'] },
  { sentence: 'After years of fighting, the two brothers finally found harmony living next door to each other.', word: 'harmony', correct: 'Agreement and peaceful coexistence', wrongs: ['Constant conflict', 'Total silence', 'Complete confusion'] },
  { sentence: 'Even when it cost him the sale, he refused to lie, valuing his integrity above all.', word: 'integrity', correct: 'Honesty and strong moral principles', wrongs: ['A willingness to cheat', 'A love of money', 'A fear of failure'] },
  { sentence: 'The doctors used so much medical jargon that the patient\'s family understood almost nothing.', word: 'jargon', correct: 'Special vocabulary used by a particular group', wrongs: ['Simple, everyday language', 'A type of medicine', 'A formal apology'] },
  { sentence: 'After months of overtime, she finally had a full week of leisure to travel.', word: 'leisure', correct: 'Free time', wrongs: ['Extra work', 'A type of punishment', 'A financial debt'] },
  { sentence: 'The story\'s villain acted purely out of malice, wanting to hurt others for no reason.', word: 'malice', correct: 'A desire to harm others', wrongs: ['A desire to help others', 'A fear of others', 'A love of animals'] },
  { sentence: 'The novelty of the new video game wore off after just a few days of playing.', word: 'novelty', correct: 'The quality of being new and unusual', wrongs: ['The quality of being old and familiar', 'A feeling of boredom', 'A type of prize'] },
  { sentence: 'Her constant optimism kept the whole team believing they could still win.', word: 'optimism', correct: 'Hopefulness about the future', wrongs: ['Hopelessness about the future', 'Anger about the past', 'Confusion about the present'] },
  { sentence: 'His pessimism made him assume the trip would be ruined by rain before it even started.', word: 'pessimism', correct: 'A tendency to expect the worst', wrongs: ['A tendency to expect the best', 'A fear of travel', 'A love of planning'] },
  { sentence: 'One odd quirk of hers was that she always ate dessert before the main course.', word: 'quirk', correct: 'A peculiar habit or characteristic', wrongs: ['A common, ordinary habit', 'A serious illness', 'A type of dessert'] },
  { sentence: 'Her resilience after the injury amazed her coaches, who watched her return stronger than ever.', word: 'resilience', correct: 'The ability to recover quickly from difficulty', wrongs: ['A tendency to give up easily', 'A fear of competition', 'A lack of ambition'] },
  { sentence: 'After the noisy family reunion, she craved a weekend of complete solitude.', word: 'solitude', correct: 'The state of being alone', wrongs: ['The state of being surrounded by people', 'A loud celebration', 'A busy schedule'] },
  { sentence: 'It was her tenacity, not talent alone, that got her through years of rejection before success.', word: 'tenacity', correct: 'Persistence in doing something difficult', wrongs: ['A tendency to quit easily', 'A fear of hard work', 'A dislike of challenges'] },
  { sentence: 'The novel described a utopia where no one ever went hungry or felt unsafe.', word: 'utopia', correct: 'An imagined perfect place', wrongs: ['A terrible, ruined place', 'A crowded city', 'A type of prison'] },
  { sentence: 'Even after the long hike, he still had the vigor to help set up the tents.', word: 'vigor', correct: 'Physical strength and energy', wrongs: ['Complete exhaustion', 'A feeling of sickness', 'A lack of interest'] },
  { sentence: 'Decades of teaching gave her a quiet wisdom that younger teachers often admired.', word: 'wisdom', correct: 'Knowledge gained through experience', wrongs: ['A lack of knowledge', 'A feeling of confusion', 'A sudden mistake'] },
  { sentence: 'Her career reached its zenith the year she won the international award.', word: 'zenith', correct: 'The highest point', wrongs: ['The lowest point', 'The starting point', 'A minor point'] },
  { sentence: 'His total apathy toward the election meant he never even bothered to vote.', word: 'apathy', correct: 'A lack of interest or concern', wrongs: ['Strong enthusiasm', 'Deep anger', 'Great curiosity'] },
  { sentence: 'The charity was founded on pure benevolence, with no interest in making a profit.', word: 'benevolence', correct: 'Kindness and generosity', wrongs: ['Cruelty and greed', 'Fear and worry', 'Laziness and neglect'] },
  { sentence: 'Her candor surprised the interviewer, who expected a much more careful, guarded answer.', word: 'candor', correct: 'Honesty and directness', wrongs: ['Deception and evasion', 'Shyness and silence', 'Confusion and doubt'] },
  { sentence: 'Constant discord between the two co-founders eventually broke the company apart.', word: 'discord', correct: 'Disagreement or conflict', wrongs: ['Perfect agreement', 'Total silence', 'Shared celebration'] },
  { sentence: 'Her empathy for the new student led her to sit with him at lunch on his first day.', word: 'empathy', correct: 'The ability to understand and share others\' feelings', wrongs: ['A total lack of concern for others', 'A fear of new people', 'A dislike of school'] },
  { sentence: 'The frailty of the ancient bridge worried every engineer who inspected it.', word: 'frailty', correct: 'Physical weakness', wrongs: ['Great strength', 'Complete safety', 'Modern design'] },
  { sentence: 'The grandeur of the mountain range left every hiker speechless at the summit.', word: 'grandeur', correct: 'Impressive beauty or greatness', wrongs: ['Plainness and dullness', 'Small, ordinary size', 'A feeling of fear'] },
  { sentence: 'Despite winning three awards, she accepted them with genuine humility.', word: 'humility', correct: 'A modest view of one\'s own importance', wrongs: ['Excessive pride', 'Deep anger', 'Total confusion'] },
  { sentence: 'His ineptitude at basic repairs meant the leaky faucet only got worse.', word: 'ineptitude', correct: 'A lack of skill', wrongs: ['Great skill', 'Strong confidence', 'Careful planning'] },
  { sentence: 'The whole stadium erupted in jubilation the moment the final buzzer sounded.', word: 'jubilation', correct: 'A feeling of great happiness and triumph', wrongs: ['A feeling of deep sadness', 'A moment of confusion', 'A period of silence'] },
  { sentence: 'A strange lethargy settled over the office after lunch, and no one could focus.', word: 'lethargy', correct: 'A lack of energy', wrongs: ['A burst of energy', 'A feeling of excitement', 'A moment of clarity'] },
  { sentence: 'The critic complained that the film\'s special effects couldn\'t hide its overall mediocrity.', word: 'mediocrity', correct: 'The quality of being average, not very good', wrongs: ['Extraordinary excellence', 'Complete failure', 'Great originality'] },
  { sentence: 'The lifeguard\'s negligence, checking his phone instead of the pool, nearly caused a tragedy.', word: 'negligence', correct: 'Failure to take proper care', wrongs: ['Careful attention', 'Great bravery', 'Quick thinking'] },
  { sentence: 'His obsession with collecting vintage stamps took over every spare hour of his week.', word: 'obsession', correct: 'An idea that continually occupies one\'s mind', wrongs: ['A brief, passing interest', 'A total lack of interest', 'A forgotten hobby'] },
  { sentence: 'Years of prudence with her paycheck meant she had savings when the emergency hit.', word: 'prudence', correct: 'Careful, sensible judgment', wrongs: ['Careless spending', 'Reckless risk-taking', 'Total confusion about money'] },
  { sentence: 'The coach ran practice with such rigor that even the star players were exhausted.', word: 'rigor', correct: 'Strictness and thoroughness', wrongs: ['Complete laziness', 'A relaxed, easy pace', 'A total lack of rules'] },
  { sentence: 'A deep serenity settled over the campsite once the wind finally died down.', word: 'serenity', correct: 'Calmness and peace', wrongs: ['Chaos and noise', 'Fear and panic', 'Anger and shouting'] },
  { sentence: 'The meditation retreat promised a week of pure tranquility, far from any city noise.', word: 'tranquility', correct: 'Calmness and peacefulness', wrongs: ['Constant noise and stress', 'Sudden danger', 'Deep confusion'] },
  { sentence: 'The uncertainty about the exam date left the whole class anxious and unable to plan.', word: 'uncertainty', correct: 'A lack of certainty', wrongs: ['Complete confidence', 'Total relaxation', 'Firm agreement'] },
  { sentence: 'His vanity meant he checked his reflection in every window he passed.', word: 'vanity', correct: 'Excessive pride in one\'s own appearance or abilities', wrongs: ['Deep humility', 'A fear of mirrors', 'A dislike of attention'] },
  { sentence: 'The king\'s wrath was terrifying, and his guards scattered the moment he began shouting.', word: 'wrath', correct: 'Extreme anger', wrongs: ['Deep calm', 'Quiet sadness', 'Gentle kindness'] },
  { sentence: 'The vitamins and daily jog gave the whole family a new sense of vitality.', word: 'vitality', correct: 'Energy and liveliness', wrongs: ['Exhaustion and weakness', 'Sadness and gloom', 'Confusion and doubt'] },
  { sentence: 'The buffet offered such an abundance of food that no one left hungry.', word: 'abundance', correct: 'A very large quantity', wrongs: ['A tiny amount', 'A complete absence', 'A single portion'] },
  { sentence: 'The young violinist\'s brilliance was obvious from her very first note at the recital.', word: 'brilliance', correct: 'Exceptional talent or intelligence', wrongs: ['Complete lack of skill', 'Ordinary, average ability', 'Extreme nervousness'] },
  { sentence: 'The instructions were written with such clarity that no one had a single question.', word: 'clarity', correct: 'Clearness', wrongs: ['Total confusion', 'Extreme length', 'Complete silence'] },
  { sentence: 'The festival celebrated the city\'s diversity, with food and music from a dozen cultures.', word: 'diversity', correct: 'A range of different things or people', wrongs: ['Complete sameness', 'A single culture only', 'A lack of people'] },
  { sentence: 'The dancer moved across the stage with a natural elegance that drew every eye.', word: 'elegance', correct: 'Gracefulness in style or movement', wrongs: ['Clumsy awkwardness', 'Loud roughness', 'Complete stillness'] },
  { sentence: 'The fragility of the antique vase meant it had to be wrapped in three layers of padding.', word: 'fragility', correct: 'The quality of being easily broken', wrongs: ['The quality of being unbreakable', 'Great heaviness', 'Bright color'] },
  { sentence: 'Her generosity was well known; she never hesitated to share whatever she had.', word: 'generosity', correct: 'The quality of being generous', wrongs: ['The quality of being stingy', 'A fear of sharing', 'A dislike of people'] },
  { sentence: 'The open hostility between the two neighbors made the whole block uncomfortable.', word: 'hostility', correct: 'Unfriendly or aggressive behavior', wrongs: ['Warm friendliness', 'Complete indifference', 'Quiet politeness'] },
  { sentence: 'His ignorance of the local customs led to several awkward, embarrassing moments.', word: 'ignorance', correct: 'A lack of knowledge', wrongs: ['A wealth of knowledge', 'Great skill', 'Strong confidence'] },
  { sentence: 'The judge was known for treating every case with equal justice, rich or poor.', word: 'justice', correct: 'Fairness in the way people are treated', wrongs: ['Favoritism toward the wealthy', 'A total lack of rules', 'Constant confusion'] },
  { sentence: 'Her kindness toward the new employee made his first week much less stressful.', word: 'kindness', correct: 'Being friendly, generous, and considerate', wrongs: ['Being cruel and dismissive', 'Being loud and rude', 'Being distant and cold'] },
  { sentence: 'Even after the company moved away, she showed great loyalty by staying with them.', word: 'loyalty', correct: 'Faithfulness to a person or cause', wrongs: ['A willingness to switch sides easily', 'A dislike of commitment', 'A fear of change'] },
  { sentence: 'Despite winning the award, he described his role with surprising modesty.', word: 'modesty', correct: 'Not being boastful about one\'s abilities', wrongs: ['Excessive bragging', 'Loud confidence', 'Constant complaining'] },
  { sentence: 'The knight\'s nobility was shown not by his title, but by how he treated the poor.', word: 'nobility', correct: 'The quality of having high moral principles', wrongs: ['A tendency toward cruelty', 'A love of money', 'A fear of responsibility'] },
  { sentence: 'The abrupt ending of the movie left the whole theater confused and unsatisfied.', word: 'abrupt', correct: 'Sudden and unexpected', wrongs: ['Slow and gradual', 'Long and detailed', 'Calm and expected'] },
  { sentence: 'The loud alarm left the bewildered students unsure of where to go.', word: 'bewildered', correct: 'Confused', wrongs: ['Completely certain', 'Fully relaxed', 'Extremely bored'] },
  { sentence: 'His callous remark about her accident showed he didn\'t care about her pain at all.', word: 'callous', correct: 'Showing no sympathy for others', wrongs: ['Showing deep sympathy', 'Feeling great guilt', 'Feeling nervous'] },
  { sentence: 'The diplomatic ambassador found a way to calm both angry delegations at once.', word: 'diplomatic', correct: 'Skilled at handling situations without upsetting people', wrongs: ['Careless about others\' feelings', 'Rude and blunt', 'Confused and unsure'] },
  { sentence: 'Her earnest apology, with tears in her eyes, convinced him she truly meant it.', word: 'earnest', correct: 'Sincere and serious', wrongs: ['Fake and insincere', 'Joking and playful', 'Bored and distracted'] },
  { sentence: 'Flustered by the sudden question, she forgot half of what she meant to say.', word: 'flustered', correct: 'Agitated and confused', wrongs: ['Perfectly calm', 'Extremely confident', 'Completely bored'] },
  { sentence: 'The gracious host made sure every guest felt welcome, even the ones arriving late.', word: 'gracious', correct: 'Courteous and kind', wrongs: ['Rude and dismissive', 'Cold and distant', 'Loud and demanding'] },
  { sentence: 'He was hesitant to dive into the cold lake, standing at the edge for a full minute.', word: 'hesitant', correct: 'Slow to act because of uncertainty', wrongs: ['Eager and quick to act', 'Completely fearless', 'Totally indifferent'] },
  { sentence: 'The insolent teenager rolled his eyes and talked back to the principal.', word: 'insolent', correct: 'Rude and disrespectful', wrongs: ['Polite and respectful', 'Shy and quiet', 'Nervous and anxious'] },
  { sentence: 'After ten years in the industry, she felt jaded by all the broken promises.', word: 'jaded', correct: 'Tired and cynical from too much experience', wrongs: ['Freshly excited and hopeful', 'Completely inexperienced', 'Wildly enthusiastic'] },
  { sentence: 'The lofty goal of ending world hunger inspired thousands of volunteers.', word: 'lofty', correct: 'Very high or noble in aim', wrongs: ['Small and unimportant', 'Selfish and mean', 'Easy and simple'] },
  { sentence: 'The meek new intern barely spoke above a whisper during her first meeting.', word: 'meek', correct: 'Quiet, gentle, and submissive', wrongs: ['Loud and aggressive', 'Bold and confident', 'Angry and hostile'] },
  { sentence: 'The naive tourist handed his wallet to a stranger who promised to "keep it safe."', word: 'naive', correct: 'Lacking experience or good judgment', wrongs: ['Highly experienced and wise', 'Extremely suspicious', 'Very cautious'] },
  { sentence: 'His obnoxious laugh could be heard through three closed doors.', word: 'obnoxious', correct: 'Extremely unpleasant or annoying', wrongs: ['Extremely pleasant', 'Very quiet', 'Completely invisible'] },
  { sentence: 'Instead of dreaming big, she took a pragmatic approach and planned a realistic budget.', word: 'pragmatic', correct: 'Dealing with things in a sensible, practical way', wrongs: ['Dealing with things unrealistically', 'Ignoring problems completely', 'Acting purely on emotion'] },
  { sentence: 'The querulous customer complained about every single item on his receipt.', word: 'querulous', correct: 'Complaining in a whining way', wrongs: ['Cheerfully satisfied', 'Completely silent', 'Extremely grateful'] },
  { sentence: 'The reticent witness gave only one-word answers during the entire interview.', word: 'reticent', correct: 'Reluctant to reveal thoughts or feelings', wrongs: ['Eager to share every detail', 'Loud and talkative', 'Angry and shouting'] },
  { sentence: 'The stoic soldier didn\'t flinch or cry out, even as the medic treated his wound.', word: 'stoic', correct: 'Enduring hardship without showing feelings', wrongs: ['Screaming from pain', 'Laughing uncontrollably', 'Fainting immediately'] },
  { sentence: 'The tactful nurse found a gentle way to deliver the difficult diagnosis.', word: 'tactful', correct: 'Sensitive and careful in dealing with others', wrongs: ['Blunt and careless', 'Loud and rude', 'Cold and distant'] },
  { sentence: 'Despite winning the award, she remained unassuming, crediting her whole team instead.', word: 'unassuming', correct: 'Modest; not seeking attention', wrongs: ['Boastful and attention-seeking', 'Loud and dramatic', 'Arrogant and proud'] },
  { sentence: 'The vigilant night guard checked every locked door twice before his shift ended.', word: 'vigilant', correct: 'Alert and watchful for danger', wrongs: ['Careless and distracted', 'Fast asleep', 'Completely unaware'] },
  { sentence: 'He sat sullen and silent in the corner, refusing to join the birthday celebration.', word: 'sullen', correct: 'Bad-tempered and sulky', wrongs: ['Cheerful and bright', 'Excited and eager', 'Calm and friendly'] },
  { sentence: 'Her tenacious grip on the rope never loosened, even as the wind tried to pull her free.', word: 'tenacious', correct: 'Holding firmly; persistent', wrongs: ['Loose and careless', 'Weak and giving up', 'Nervous and shaking'] },
  { sentence: 'The pilot stayed unruffled even as the plane hit turbulence, calmly reassuring the passengers.', word: 'unruffled', correct: 'Calm, not agitated', wrongs: ['Panicked and shaking', 'Angry and shouting', 'Confused and lost'] },
  { sentence: 'The venomous rumor spread through the school, clearly meant to hurt her reputation.', word: 'venomous', correct: 'Full of malice; spiteful', wrongs: ['Kind and supportive', 'Playful and harmless', 'Boring and dull'] },
  { sentence: 'The cafeteria began serving more wholesome meals, swapping fries for fresh vegetables.', word: 'wholesome', correct: 'Good for one\'s health or well-being', wrongs: ['Harmful to one\'s health', 'Extremely expensive', 'Completely tasteless'] },
  { sentence: 'The youthful energy of the new coach made even the veteran players feel inspired.', word: 'youthful', correct: 'Having the qualities of youth, such as energy or freshness', wrongs: ['Tired and worn out', 'Old and outdated', 'Slow and sluggish'] },
  { sentence: 'The clown\'s zany antics, from juggling shoes to riding a unicycle backward, had everyone laughing.', word: 'zany', correct: 'Amusingly unconventional or wildly funny', wrongs: ['Extremely serious', 'Completely ordinary', 'Sad and gloomy'] },
  { sentence: 'She felt ambivalent about the move, excited for a new city but sad to leave her friends.', word: 'ambivalent', correct: 'Having mixed or conflicting feelings', wrongs: ['Feeling only pure joy', 'Feeling only pure anger', 'Feeling nothing at all'] },
  { sentence: 'The boisterous kids raced through the yard, shrieking with laughter and knocking over chairs.', word: 'boisterous', correct: 'Noisy, energetic, and unruly', wrongs: ['Quiet and calm', 'Tired and sleepy', 'Shy and withdrawn'] },
  { sentence: 'Wearing a bright orange coat made him conspicuous in the middle of the gray crowd.', word: 'conspicuous', correct: 'Easily noticeable', wrongs: ['Impossible to notice', 'Perfectly hidden', 'Completely forgettable'] },
  { sentence: 'The desolate stretch of desert hadn\'t seen a single traveler in weeks.', word: 'desolate', correct: 'Empty and bleak; deserted', wrongs: ['Crowded and lively', 'Lush and green', 'Warm and welcoming'] },
  { sentence: 'The enigmatic message left everyone guessing about what the sender really meant.', word: 'enigmatic', correct: 'Mysterious and difficult to understand', wrongs: ['Perfectly clear', 'Extremely simple', 'Completely obvious'] },
  { sentence: 'His facetious comment about quitting school was clearly just a joke, not a real plan.', word: 'facetious', correct: 'Joking, not meant to be taken seriously', wrongs: ['Completely serious', 'Deeply sad', 'Extremely angry'] },
  { sentence: 'The gaudy neon sign, covered in flashing lights, clashed with the quiet street around it.', word: 'gaudy', correct: 'Extravagantly bright and showy, often in poor taste', wrongs: ['Plain and understated', 'Dark and dim', 'Soft and muted'] },
  { sentence: 'A flat tire proved to be only a minor hindrance on their long road trip.', word: 'hindrance', correct: 'Something that gets in the way or slows progress', wrongs: ['Something that speeds progress', 'A moment of celebration', 'A type of reward'] },
  { sentence: 'The chef\'s impeccable technique meant not a single dish left the kitchen with a flaw.', word: 'impeccable', correct: 'Flawless', wrongs: ['Full of mistakes', 'Average at best', 'Completely careless'] },
  { sentence: 'His jocular tone made even the awkward introduction feel light and fun.', word: 'jocular', correct: 'Fond of joking; humorous', wrongs: ['Deeply serious', 'Angry and harsh', 'Nervous and shy'] },
  { sentence: 'Her lucid explanation of the tricky math problem finally made it click for the class.', word: 'lucid', correct: 'Clear and easy to understand', wrongs: ['Confusing and unclear', 'Extremely long', 'Completely silent'] },
  { sentence: 'The story\'s malevolent sorcerer plotted to curse the entire kingdom out of pure spite.', word: 'malevolent', correct: 'Having harmful or evil intent', wrongs: ['Having kind, helpful intent', 'Feeling nervous', 'Feeling curious'] },
  { sentence: 'His nebulous plan had no real details, just a vague idea of "starting a business someday."', word: 'nebulous', correct: 'Unclear or vague', wrongs: ['Extremely detailed', 'Perfectly clear', 'Firmly scheduled'] },
  { sentence: 'The obsolete computer, running software from the 1990s, could barely open a web page.', word: 'obsolete', correct: 'No longer used; outdated', wrongs: ['Brand new and cutting-edge', 'Extremely popular', 'Recently upgraded'] },
  { sentence: 'The placid pond didn\'t have a single ripple on its glassy surface all morning.', word: 'placid', correct: 'Calm and peaceful', wrongs: ['Violently stormy', 'Loud and chaotic', 'Murky and dirty'] },
  { sentence: 'The rambunctious puppy tore through the living room, knocking over lamps and pillows.', word: 'rambunctious', correct: 'Uncontrollably energetic and lively', wrongs: ['Calm and well-behaved', 'Sleepy and quiet', 'Shy and timid'] },
  { sentence: 'Sales had grown stagnant for three years, never rising or falling by much.', word: 'stagnant', correct: 'Not flowing or developing; inactive', wrongs: ['Rapidly growing', 'Constantly changing', 'Wildly successful'] },
  { sentence: 'The tumultuous town hall meeting ended with three separate shouting matches.', word: 'tumultuous', correct: 'Loud, confused, and disorderly', wrongs: ['Calm and orderly', 'Quiet and dull', 'Friendly and warm'] },
  { sentence: 'The unscrupulous salesman had no problem lying to elderly customers for a bigger commission.', word: 'unscrupulous', correct: 'Having no moral principles', wrongs: ['Extremely honest', 'Fair to every customer', 'Nervous about lying'] },
  { sentence: 'The vociferous protesters chanted and shouted outside the building for hours.', word: 'vociferous', correct: 'Loud and forceful in expressing an opinion', wrongs: ['Silent and withdrawn', 'Calm and quiet', 'Shy and reserved'] },
  { sentence: 'Her winsome smile and easy laugh made new friends everywhere she traveled.', word: 'winsome', correct: 'Charming and appealing', wrongs: ['Off-putting and unpleasant', 'Cold and distant', 'Boring and dull'] },
  { sentence: 'The affable shop owner remembered every regular customer\'s name and order.', word: 'affable', correct: 'Friendly and easy to talk to', wrongs: ['Rude and unapproachable', 'Cold and silent', 'Nervous and shy'] }
];

const CONNOTATION_POOL = [
  { positive: 'Determined', negative: 'Stubborn', sharedMeaning: "refusing to change one's mind" },
  { positive: 'Confident', negative: 'Arrogant', sharedMeaning: 'believing strongly in oneself' },
  { positive: 'Curious', negative: 'Nosy', sharedMeaning: "wanting to know about others' business" },
  { positive: 'Frugal', negative: 'Cheap', sharedMeaning: 'careful about spending money' },
  { positive: 'Assertive', negative: 'Pushy', sharedMeaning: 'expressing opinions and needs directly' },
  { positive: 'Unique', negative: 'Strange', sharedMeaning: 'being different from what is typical' },
  { positive: 'Relaxed', negative: 'Lazy', sharedMeaning: 'not rushing to get things done' },
  { positive: 'Thrifty', negative: 'Stingy', sharedMeaning: 'being careful not to waste money' },
  { positive: 'Youthful', negative: 'Immature', sharedMeaning: 'acting young for one\'s age' },
  { positive: 'Cautious', negative: 'Paranoid', sharedMeaning: 'being alert to possible danger' },
  { positive: 'Passionate', negative: 'Obsessive', sharedMeaning: 'caring deeply about something' },
  { positive: 'Spontaneous', negative: 'Reckless', sharedMeaning: 'acting without a lot of planning' },
  { positive: 'Modest', negative: 'Insecure', sharedMeaning: 'not boasting about oneself' },
  { positive: 'Talkative', negative: 'Annoying', sharedMeaning: 'speaking often and at length' },
  { positive: 'Persistent', negative: 'Obsessed', sharedMeaning: 'continuing to try despite difficulty' },
  { positive: 'Economical', negative: 'Miserly', sharedMeaning: 'trying to spend as little money as possible' },
  { positive: 'Adventurous', negative: 'Reckless', sharedMeaning: 'taking on risky or new experiences' },
  { positive: 'Inquisitive', negative: 'Prying', sharedMeaning: "asking a lot of questions about others' lives" },
  { positive: 'Firm', negative: 'Harsh', sharedMeaning: 'being strict about rules or decisions' },
  { positive: 'Carefree', negative: 'Irresponsible', sharedMeaning: 'not worrying much about consequences' },
  { positive: 'Frank', negative: 'Blunt', sharedMeaning: 'speaking honestly and directly' },
  { positive: 'Slender', negative: 'Skinny', sharedMeaning: 'having a thin body' },
  { positive: 'Plump', negative: 'Fat', sharedMeaning: 'having a heavier body' },
  { positive: 'Mature', negative: 'Uptight', sharedMeaning: 'behaving in a very formal, controlled way' },
  { positive: 'Meticulous', negative: 'Fussy', sharedMeaning: 'paying very close attention to small details' },
  { positive: 'Bold', negative: 'Cocky', sharedMeaning: "showing strong belief in one's own abilities" },
  { positive: 'Charismatic', negative: 'Smooth-talking', sharedMeaning: 'being persuasive and charming with words' },
  { positive: 'Diplomatic', negative: 'Evasive', sharedMeaning: 'avoiding direct, blunt statements' },
  { positive: 'Straightforward', negative: 'Tactless', sharedMeaning: 'saying exactly what one thinks' },
  { positive: 'Eccentric', negative: 'Weird', sharedMeaning: 'behaving in unusual ways' },
  { positive: 'Sentimental', negative: 'Overemotional', sharedMeaning: 'being easily moved by feelings' },
  { positive: 'Vintage', negative: 'Outdated', sharedMeaning: 'being from an earlier time period' },
  { positive: 'Simple', negative: 'Simplistic', sharedMeaning: 'not complicated' },
  { positive: 'Colorful', negative: 'Gaudy', sharedMeaning: 'having bright, noticeable colors' },
  { positive: 'Free-spirited', negative: 'Flaky', sharedMeaning: 'not following a strict plan or schedule' },
  { positive: 'Driven', negative: 'Ruthless', sharedMeaning: 'working intensely to achieve a goal' },
  { positive: 'Humble', negative: 'Timid', sharedMeaning: 'not drawing attention to oneself' },
  { positive: 'Playful', negative: 'Childish', sharedMeaning: 'acting in a lighthearted, fun way' },
  { positive: 'Independent', negative: 'Aloof', sharedMeaning: 'not relying much on others' },
  { positive: 'Sociable', negative: 'Attention-seeking', sharedMeaning: 'enjoying being around and noticed by other people' },
  { positive: 'Analytical', negative: 'Overcritical', sharedMeaning: 'examining things very closely to judge them' },
  { positive: 'Calm', negative: 'Detached', sharedMeaning: 'not showing much emotion in a situation' },
  { positive: 'Efficient', negative: 'Robotic', sharedMeaning: 'doing tasks quickly with little wasted effort' },
  { positive: 'Generous', negative: 'Wasteful', sharedMeaning: 'giving or spending freely' },
  { positive: 'Careful', negative: 'Picky', sharedMeaning: 'paying close attention before deciding on something' },
  { positive: 'Traditional', negative: 'Old-fashioned', sharedMeaning: 'holding on to established customs and values' },
  { positive: 'Optimistic', negative: 'Naive', sharedMeaning: 'expecting things to turn out well' },
  { positive: 'Realistic', negative: 'Cynical', sharedMeaning: 'expecting things to turn out only moderately well or worse' },
  { positive: 'Devoted', negative: 'Clingy', sharedMeaning: 'wanting to be close to someone or something' },
  { positive: 'Assured', negative: 'Overconfident', sharedMeaning: "feeling very sure of one's own abilities" },
  { positive: 'Reserved', negative: 'Cold', sharedMeaning: 'not showing much emotion around others' },
  { positive: 'Watchful', negative: 'Suspicious', sharedMeaning: 'paying close attention to what others are doing' },
  { positive: 'Outspoken', negative: 'Loudmouthed', sharedMeaning: 'sharing opinions openly and often' },
  { positive: 'Relentless', negative: 'Nagging', sharedMeaning: 'continuing to push for something repeatedly' },
  { positive: 'Practical', negative: 'Unimaginative', sharedMeaning: 'focusing on what is useful rather than abstract ideas' },
  { positive: 'Creative', negative: 'Impractical', sharedMeaning: 'coming up with unusual or original ideas' },
  { positive: 'Ambitious', negative: 'Cutthroat', sharedMeaning: 'working hard to rise above others' },
  { positive: 'Easygoing', negative: 'Apathetic', sharedMeaning: 'not getting upset or worked up about things' },
  { positive: 'Vigilant', negative: 'Jumpy', sharedMeaning: 'reacting quickly to possible danger' },
  { positive: 'Self-reliant', negative: 'Distant', sharedMeaning: 'preferring to handle things without help from others' },
  { positive: 'Enthusiastic', negative: 'Overzealous', sharedMeaning: 'showing a lot of excitement about something' },
  { positive: 'Direct', negative: 'Harsh', sharedMeaning: 'communicating without softening the message' },
  { positive: 'Classic', negative: 'Boring', sharedMeaning: 'not following the latest trends' },
  { positive: 'Wealthy', negative: 'Showy', sharedMeaning: 'having and displaying a lot of money' },
  { positive: 'Lively', negative: 'Hyper', sharedMeaning: 'having a great deal of energy' }
];

const FILL_MEANING_POOL = [
  { sentence: 'After winning the award, she felt very ___.', meaning: '(full of pride)', correct: 'Proud', wrongs: ['Ashamed', 'Bored', 'Confused'] },
  { sentence: "The ___ cave was so dark we couldn't see our hands.", meaning: '(giving no light)', correct: 'Pitch-black', wrongs: ['Radiant', 'Colorful', 'Transparent'] },
  { sentence: 'He was ___ about his chances of winning the race.', meaning: '(feeling sure of success)', correct: 'Confident', wrongs: ['Uncertain', 'Terrified', 'Indifferent'] },
  { sentence: 'The ___ toddler refused to nap and cried during the whole car ride.', meaning: '(easily upset or irritated)', correct: 'Cranky', wrongs: ['Cheerful', 'Sleepy', 'Silent'] },
  { sentence: 'Losing the championship game left the whole team feeling ___.', meaning: '(deeply disappointed)', correct: 'Devastated', wrongs: ['Thrilled', 'Indifferent', 'Amused'] },
  { sentence: 'The ___ smell of fresh cookies filled the entire house.', meaning: '(pleasing and appealing)', correct: 'Delightful', wrongs: ['Disgusting', 'Faint', 'Bitter'] },
  { sentence: 'It took a ___ amount of courage for her to speak in front of the whole school.', meaning: '(very large)', correct: 'Tremendous', wrongs: ['Tiny', 'Average', 'Negative'] },
  { sentence: 'The instructions were so ___ that nobody could figure out how to assemble the shelf.', meaning: '(confusing)', correct: 'Baffling', wrongs: ['Straightforward', 'Colorful', 'Brief'] },
  { sentence: 'The hikers were ___ when they finally spotted the cabin through the trees.', meaning: '(filled with relief)', correct: 'Relieved', wrongs: ['Disappointed', 'Suspicious', 'Bored'] },
  { sentence: 'The ___ puppy chewed through three pairs of shoes in one afternoon.', meaning: '(full of energy and mischief)', correct: 'Mischievous', wrongs: ['Exhausted', 'Well-behaved', 'Elderly'] },
  { sentence: 'Her ___ answer left no doubt about how she felt on the issue.', meaning: '(clear and direct)', correct: 'Blunt', wrongs: ['Vague', 'Cheerful', 'Whispered'] },
  { sentence: 'The scientist remained ___ despite years of failed experiments.', meaning: '(not giving up)', correct: 'Persistent', wrongs: ['Discouraged', 'Careless', 'Indifferent'] },
  { sentence: 'The ___ crowd roared as the home team scored the winning goal.', meaning: '(loudly enthusiastic)', correct: 'Jubilant', wrongs: ['Silent', 'Sleepy', 'Annoyed'] },
  { sentence: 'The old photograph was ___ , its edges crumbling at the slightest touch.', meaning: '(easily damaged or broken)', correct: 'Fragile', wrongs: ['Indestructible', 'Colorful', 'Heavy'] },
  { sentence: 'His ___ excuse convinced no one that he had actually finished the project.', meaning: '(clearly false)', correct: 'Flimsy', wrongs: ['Convincing', 'Detailed', 'Honest'] },
  { sentence: 'The ___ smell of smoke told them the campfire hadn\'t fully gone out.', meaning: '(strong and noticeable)', correct: 'Pungent', wrongs: ['Faint', 'Pleasant', 'Sweet'] },
  { sentence: 'The team felt ___ after training together for months before the big match.', meaning: '(fully ready and prepared)', correct: 'Prepared', wrongs: ['Unprepared', 'Nervous', 'Indifferent'] },
  { sentence: 'The ___ silence in the library made every footstep sound like thunder.', meaning: '(complete and total)', correct: 'Utter', wrongs: ['Partial', 'Noisy', 'Pleasant'] },
  { sentence: 'The manager gave ___ instructions, leaving no room for confusion.', meaning: '(exact and specific)', correct: 'Precise', wrongs: ['Vague', 'Rude', 'Lengthy'] },
  { sentence: 'The ___ toddler wandered off from her parents at the crowded fair.', meaning: '(showing no fear)', correct: 'Fearless', wrongs: ['Terrified', 'Sleepy', 'Shy'] },
  { sentence: 'The ___ hikers pushed on even after losing the trail twice.', meaning: '(not giving up easily)', correct: 'Determined', wrongs: ['Discouraged', 'Careless', 'Bored'] },
  { sentence: 'His ___ remarks during the meeting embarrassed the whole team.', meaning: '(said without thinking, careless)', correct: 'Thoughtless', wrongs: ['Considerate', 'Formal', 'Quiet'] },
  { sentence: 'The ___ skyline glowed orange as the sun went down.', meaning: '(giving off a warm light)', correct: 'Glowing', wrongs: ['Dark', 'Frozen', 'Colorless'] },
  { sentence: 'The coach gave ___ feedback that helped the team improve quickly.', meaning: '(useful and constructive)', correct: 'Valuable', wrongs: ['Useless', 'Confusing', 'Harsh'] },
  { sentence: 'The ___ crowd pushed toward the exits when the alarm sounded.', meaning: '(filled with panic)', correct: 'Frantic', wrongs: ['Calm', 'Cheerful', 'Sleepy'] },
  { sentence: 'Her ___ explanation left absolutely no room for misunderstanding.', meaning: '(extremely clear)', correct: 'Explicit', wrongs: ['Ambiguous', 'Brief', 'Rude'] },
  { sentence: 'The ___ old sailor had survived three shipwrecks.', meaning: '(tough and able to endure hardship)', correct: 'Resilient', wrongs: ['Fragile', 'Careless', 'Lazy'] },
  { sentence: 'The teacher\'s ___ tone made even the shy students want to answer.', meaning: '(warm and welcoming)', correct: 'Encouraging', wrongs: ['Intimidating', 'Boring', 'Silent'] },
  { sentence: 'The ___ fog made it impossible to see more than a few feet ahead.', meaning: '(extremely thick)', correct: 'Dense', wrongs: ['Thin', 'Bright', 'Warm'] },
  { sentence: 'The ___ negotiator managed to satisfy both sides of the dispute.', meaning: '(fair and balanced)', correct: 'Impartial', wrongs: ['Biased', 'Confused', 'Loud'] },
  { sentence: 'The ___ smell from the chemistry lab cleared the hallway in seconds.', meaning: '(extremely unpleasant)', correct: 'Foul', wrongs: ['Pleasant', 'Faint', 'Sweet'] },
  { sentence: 'The ___ actor delivered every line exactly as rehearsed.', meaning: '(highly skilled)', correct: 'Polished', wrongs: ['Clumsy', 'Nervous', 'Forgetful'] },
  { sentence: 'The ___ silence after the announcement made everyone uneasy.', meaning: '(sudden and unexpected)', correct: 'Abrupt', wrongs: ['Gradual', 'Comfortable', 'Predictable'] },
  { sentence: 'Their ___ friendship had lasted since kindergarten.', meaning: '(long-lasting and steady)', correct: 'Enduring', wrongs: ['Temporary', 'Fragile', 'Distant'] },
  { sentence: 'She was absolutely ___ after finding out she had won the scholarship.', meaning: '(extremely happy)', correct: 'Ecstatic', wrongs: ['Miserable', 'Indifferent', 'Nervous'] },
  { sentence: 'He was ___ when he saw the dent in his brand-new car.', meaning: '(extremely angry)', correct: 'Furious', wrongs: ['Delighted', 'Calm', 'Amused'] },
  { sentence: 'She felt ___ walking into the huge auditorium to give her first speech.', meaning: '(uneasy or fearful)', correct: 'Nervous', wrongs: ['Confident', 'Bored', 'Relaxed'] },
  { sentence: 'After the double shift, the nurse was completely ___.', meaning: '(extremely tired)', correct: 'Exhausted', wrongs: ['Energized', 'Refreshed', 'Alert'] },
  { sentence: 'The ___ toddler opened every cabinet in the kitchen looking for something new.', meaning: '(eager to learn or explore)', correct: 'Curious', wrongs: ['Indifferent', 'Bored', 'Sleepy'] },
  { sentence: 'The ___ donor paid for the entire class field trip without telling anyone.', meaning: '(willing to give freely)', correct: 'Generous', wrongs: ['Stingy', 'Selfish', 'Greedy'] },
  { sentence: 'The ___ toddler refused to wear anything but his favorite red shirt.', meaning: '(unwilling to change one\'s mind)', correct: 'Stubborn', wrongs: ['Flexible', 'Agreeable', 'Easygoing'] },
  { sentence: 'The ___ shopkeeper always told customers the truth, even about damaged items.', meaning: '(truthful)', correct: 'Honest', wrongs: ['Deceptive', 'Secretive', 'Dishonest'] },
  { sentence: 'The ___ waiter tripped over his own feet and spilled the tray of drinks.', meaning: '(awkward and lacking grace)', correct: 'Clumsy', wrongs: ['Graceful', 'Nimble', 'Skillful'] },
  { sentence: 'The ballerina\'s ___ movements made the difficult routine look effortless.', meaning: '(elegant and smooth)', correct: 'Graceful', wrongs: ['Clumsy', 'Stiff', 'Awkward'] },
  { sentence: 'The ___ new student wouldn\'t even look up when the teacher called her name.', meaning: '(shy and easily frightened)', correct: 'Timid', wrongs: ['Bold', 'Confident', 'Outgoing'] },
  { sentence: 'The ___ firefighter ran back into the burning house to save the family dog.', meaning: '(brave)', correct: 'Courageous', wrongs: ['Cowardly', 'Fearful', 'Timid'] },
  { sentence: 'His ___ decision to jump into the lake fully clothed surprised everyone.', meaning: '(done without thinking it through)', correct: 'Impulsive', wrongs: ['Deliberate', 'Cautious', 'Planned'] },
  { sentence: 'The ___ driver checked her mirrors three times before changing lanes.', meaning: '(paying close attention to avoid mistakes)', correct: 'Careful', wrongs: ['Reckless', 'Careless', 'Distracted'] },
  { sentence: 'The ___ skateboarder attempted the huge jump without a helmet or pads.', meaning: '(taking dangerous risks without caution)', correct: 'Reckless', wrongs: ['Cautious', 'Careful', 'Prudent'] },
  { sentence: 'The ___ train arrived at exactly 8:00, just as the schedule promised.', meaning: '(always on time)', correct: 'Punctual', wrongs: ['Late', 'Delayed', 'Unreliable'] },
  { sentence: 'The ___ student left his lunch, his jacket, and his homework on the bus.', meaning: '(likely to forget things)', correct: 'Forgetful', wrongs: ['Attentive', 'Sharp', 'Alert'] },
  { sentence: 'The ___ guard noticed the broken lock the moment he walked past it.', meaning: '(watchful and alert to danger)', correct: 'Vigilant', wrongs: ['Careless', 'Distracted', 'Sleepy'] },
  { sentence: 'The ___ shopper read every review twice before trusting the online store.', meaning: '(doubtful; not easily convinced)', correct: 'Skeptical', wrongs: ['Trusting', 'Gullible', 'Naive'] },
  { sentence: 'The ___ investor handed his savings to a stranger promising "guaranteed" riches.', meaning: '(easily fooled)', correct: 'Gullible', wrongs: ['Skeptical', 'Cautious', 'Suspicious'] },
  { sentence: 'The ___ champion bragged about his win to anyone who would listen.', meaning: '(having an exaggerated sense of one\'s own importance)', correct: 'Arrogant', wrongs: ['Humble', 'Modest', 'Meek'] },
  { sentence: 'Despite scoring the winning goal, she stayed ___ and thanked her teammates.', meaning: '(not boastful about one\'s achievements)', correct: 'Humble', wrongs: ['Arrogant', 'Boastful', 'Conceited'] },
  { sentence: 'The ___ tour guide joked with the group the entire hike.', meaning: '(happy and good-humored)', correct: 'Cheerful', wrongs: ['Gloomy', 'Grumpy', 'Sour'] },
  { sentence: 'Losing his favorite toy left the little boy completely ___.', meaning: '(extremely unhappy)', correct: 'Miserable', wrongs: ['Delighted', 'Content', 'Cheerful'] },
  { sentence: 'The ___ dog paced back and forth by the door, waiting for its owner.', meaning: '(unable to stay still or relaxed)', correct: 'Restless', wrongs: ['Calm', 'Peaceful', 'Relaxed'] },
  { sentence: 'Even during the fire drill, the teacher remained completely ___.', meaning: '(not anxious or upset)', correct: 'Calm', wrongs: ['Panicked', 'Frantic', 'Agitated'] },
  { sentence: 'The kitchen turned ___ the moment three chefs tried to use the same stove.', meaning: '(in complete disorder)', correct: 'Chaotic', wrongs: ['Organized', 'Orderly', 'Peaceful'] },
  { sentence: 'The ___ garden, with its quiet fountain, was the perfect place to read.', meaning: '(calm and peaceful)', correct: 'Serene', wrongs: ['Chaotic', 'Noisy', 'Hectic'] },
  { sentence: 'It was ___ that the cat kept meowing at the exact same spot on the wall.', meaning: '(strange or unusual)', correct: 'Bizarre', wrongs: ['Normal', 'Expected', 'Typical'] },
  { sentence: 'Wearing jeans and a T-shirt is pretty ___ for a Saturday afternoon.', meaning: '(usual, not special)', correct: 'Ordinary', wrongs: ['Extraordinary', 'Unique', 'Remarkable'] },
  { sentence: 'The bride\'s ___ gown flowed gracefully as she walked down the aisle.', meaning: '(stylish and refined)', correct: 'Elegant', wrongs: ['Shabby', 'Sloppy', 'Plain'] },
  { sentence: 'The ___ apartment building hadn\'t been repainted in over twenty years.', meaning: '(run-down and worn)', correct: 'Shabby', wrongs: ['Pristine', 'Elegant', 'Immaculate'] },
  { sentence: 'The hotel room was ___, without a single speck of dust anywhere.', meaning: '(perfectly clean)', correct: 'Spotless', wrongs: ['Filthy', 'Grimy', 'Messy'] },
  { sentence: 'After the flood, the basement floor was covered in ___ mud.', meaning: '(extremely dirty)', correct: 'Filthy', wrongs: ['Spotless', 'Pristine', 'Clean'] },
  { sentence: 'The old oak table was so ___ that it survived three house moves.', meaning: '(strong and well-built)', correct: 'Sturdy', wrongs: ['Rickety', 'Flimsy', 'Fragile'] },
  { sentence: 'The ___ old ladder wobbled dangerously with every step he took.', meaning: '(shaky and likely to fall apart)', correct: 'Rickety', wrongs: ['Sturdy', 'Solid', 'Stable'] },
  { sentence: 'A ___ cargo ship glided slowly past the tiny fishing boats.', meaning: '(extremely large)', correct: 'Massive', wrongs: ['Miniature', 'Tiny', 'Microscopic'] },
  { sentence: 'The dollhouse came with ___ furniture no bigger than a fingernail.', meaning: '(extremely small)', correct: 'Miniature', wrongs: ['Massive', 'Enormous', 'Gigantic'] },
  { sentence: 'The museum displayed ___ pottery that was thousands of years old.', meaning: '(extremely old)', correct: 'Ancient', wrongs: ['Modern', 'Recent', 'New'] },
  { sentence: 'The new smartphone had the most ___ camera on the market this year.', meaning: '(up to date; current)', correct: 'Modern', wrongs: ['Ancient', 'Outdated', 'Old-fashioned'] },
  { sentence: 'The hotel suite\'s ___ furniture made the whole room feel like a palace.', meaning: '(rich and comfortable; expensive)', correct: 'Luxurious', wrongs: ['Plain', 'Cheap', 'Basic'] },
  { sentence: 'Despite her fame, the actress stayed ___ when asked about her success.', meaning: '(not boastful)', correct: 'Modest', wrongs: ['Boastful', 'Arrogant', 'Conceited'] },
  { sentence: 'His ___ stories about "the biggest fish ever caught" got bigger every year.', meaning: '(bragging)', correct: 'Boastful', wrongs: ['Modest', 'Humble', 'Reserved'] },
  { sentence: 'Her ___ apology, with real tears, convinced him she truly felt sorry.', meaning: '(honest and heartfelt)', correct: 'Sincere', wrongs: ['Insincere', 'Fake', 'Phony'] },
  { sentence: 'The ___ advertisement promised a miracle cure that didn\'t actually exist.', meaning: '(intended to mislead)', correct: 'Deceptive', wrongs: ['Honest', 'Truthful', 'Accurate'] },
  { sentence: 'The ___ dog never left its owner\'s side, even during thunderstorms.', meaning: '(faithful)', correct: 'Loyal', wrongs: ['Disloyal', 'Unfaithful', 'Treacherous'] },
  { sentence: 'The spy\'s ___ actions eventually betrayed everyone who had trusted him.', meaning: '(disloyal and deceitful)', correct: 'Treacherous', wrongs: ['Loyal', 'Faithful', 'Trustworthy'] },
  { sentence: 'The ___ employee arrived early every day and double-checked all her work.', meaning: '(showing careful, steady effort)', correct: 'Diligent', wrongs: ['Idle', 'Lazy', 'Careless'] },
  { sentence: 'The ___ cat spent all afternoon napping in the sun instead of chasing mice.', meaning: '(avoiding work or activity)', correct: 'Idle', wrongs: ['Diligent', 'Active', 'Busy'] },
  { sentence: 'The ___ puppy chased its tail around the yard for a full hour.', meaning: '(full of energy)', correct: 'Energetic', wrongs: ['Sluggish', 'Lethargic', 'Weary'] },
  { sentence: 'On hot afternoons, the whole town seemed to move at a ___ pace.', meaning: '(slow-moving and lacking energy)', correct: 'Sluggish', wrongs: ['Energetic', 'Lively', 'Spirited'] },
  { sentence: 'The ___ tour guide never stopped chatting the entire bus ride.', meaning: '(fond of talking a lot)', correct: 'Talkative', wrongs: ['Reserved', 'Silent', 'Quiet'] },
  { sentence: 'The new employee was ___ at first, only speaking when someone asked him a question.', meaning: '(quiet and holding back one\'s thoughts)', correct: 'Reserved', wrongs: ['Talkative', 'Outgoing', 'Chatty'] },
  { sentence: 'The ___ exchange student made friends with everyone in the cafeteria within a week.', meaning: '(enjoying the company of others)', correct: 'Sociable', wrongs: ['Withdrawn', 'Antisocial', 'Reserved'] },
  { sentence: 'After the breakup, he became ___, skipping parties and avoiding his friends.', meaning: '(shut off from others)', correct: 'Withdrawn', wrongs: ['Sociable', 'Outgoing', 'Friendly'] },
  { sentence: 'Even down two goals, the ___ coach told the team they could still win.', meaning: '(expecting good outcomes)', correct: 'Optimistic', wrongs: ['Pessimistic', 'Hopeless', 'Despairing'] },
  { sentence: 'The ___ weather forecaster assumed every cloud meant a coming storm.', meaning: '(expecting bad outcomes)', correct: 'Pessimistic', wrongs: ['Optimistic', 'Hopeful', 'Confident'] },
  { sentence: 'She wrote a ___ letter thanking the stranger who had returned her lost wallet.', meaning: '(feeling or showing thanks)', correct: 'Grateful', wrongs: ['Resentful', 'Ungrateful', 'Indifferent'] },
  { sentence: 'He grew ___ toward his brother after being passed over for the promotion.', meaning: '(bitterly angry about being treated unfairly)', correct: 'Resentful', wrongs: ['Grateful', 'Thankful', 'Content'] },
  { sentence: 'She felt ___ every time her sister got a new phone before she did.', meaning: '(wanting what someone else has)', correct: 'Envious', wrongs: ['Content', 'Generous', 'Satisfied'] },
  { sentence: 'With a full stomach and a warm bed, the camper felt completely ___.', meaning: '(satisfied; not wanting more)', correct: 'Content', wrongs: ['Envious', 'Dissatisfied', 'Restless'] },
  { sentence: 'She grew ___ the night before the exam, unable to focus on anything else.', meaning: '(worried and uneasy)', correct: 'Anxious', wrongs: ['Relaxed', 'Calm', 'Confident'] },
  { sentence: 'Even during the chaotic fire drill, the principal stayed perfectly ___.', meaning: '(calm and in control)', correct: 'Composed', wrongs: ['Frazzled', 'Agitated', 'Panicked'] },
  { sentence: 'By the end of finals week, every student in the library looked completely ___.', meaning: '(worn out and stressed)', correct: 'Frazzled', wrongs: ['Composed', 'Relaxed', 'Calm'] },
  { sentence: 'The barking dogs left the sleeping baby ___ and crying.', meaning: '(disturbed and upset)', correct: 'Agitated', wrongs: ['Placid', 'Calm', 'Peaceful'] },
  { sentence: 'The ___ lake reflected the mountains without a single ripple.', meaning: '(calm and undisturbed)', correct: 'Placid', wrongs: ['Agitated', 'Turbulent', 'Choppy'] },
  { sentence: 'His ___ moods meant his coworkers never knew if he\'d be cheerful or furious.', meaning: '(likely to change suddenly)', correct: 'Volatile', wrongs: ['Steady', 'Stable', 'Predictable'] },
  { sentence: 'Their ___ friendship had survived every disagreement for over a decade.', meaning: '(firm and unchanging)', correct: 'Steady', wrongs: ['Volatile', 'Unstable', 'Shaky'] },
  { sentence: 'The old radio\'s ___ signal kept fading in and out during the storm.', meaning: '(irregular and unpredictable)', correct: 'Erratic', wrongs: ['Steady', 'Consistent', 'Reliable'] },
  { sentence: 'The train\'s schedule was so ___ that commuters set their watches by it.', meaning: '(able to be foreseen or expected)', correct: 'Predictable', wrongs: ['Erratic', 'Unpredictable', 'Random'] },
  { sentence: 'The ___ footprints in the attic had no obvious explanation.', meaning: '(hard to explain or understand)', correct: 'Mysterious', wrongs: ['Obvious', 'Clear', 'Simple'] },
  { sentence: 'It was ___ that the store was closed, since a sign had been posted for weeks.', meaning: '(easy to see or understand)', correct: 'Obvious', wrongs: ['Mysterious', 'Hidden', 'Unclear'] },
  { sentence: 'The artist used ___ shading, so faint you almost missed the hidden figure.', meaning: '(not obvious; delicate)', correct: 'Subtle', wrongs: ['Blatant', 'Obvious', 'Glaring'] },
  { sentence: 'His ___ lie was so obvious that nobody in the room believed it for a second.', meaning: '(very obvious, often in a bad way)', correct: 'Blatant', wrongs: ['Subtle', 'Discreet', 'Hidden'] },
  { sentence: 'She made a ___ exit, slipping out the back door before anyone noticed.', meaning: '(careful to avoid being noticed)', correct: 'Discreet', wrongs: ['Conspicuous', 'Obvious', 'Loud'] },
  { sentence: 'His bright yellow sneakers were ___ against the plain gray hallway floor.', meaning: '(easily noticed)', correct: 'Conspicuous', wrongs: ['Discreet', 'Hidden', 'Unnoticeable'] },
  { sentence: 'The treasure map led to a chest ___ deep beneath the old oak tree.', meaning: '(kept out of sight)', correct: 'Hidden', wrongs: ['Exposed', 'Visible', 'Displayed'] },
  { sentence: 'With the tide gone, the rocky seabed lay completely ___.', meaning: '(uncovered and visible)', correct: 'Exposed', wrongs: ['Hidden', 'Covered', 'Concealed'] },
  { sentence: 'Alone on the cliff edge without a rope, the climber felt completely ___.', meaning: '(open to danger or harm)', correct: 'Vulnerable', wrongs: ['Invincible', 'Protected', 'Safe'] },
  { sentence: 'Wearing full armor, the knight felt almost ___ on the battlefield.', meaning: '(impossible to defeat)', correct: 'Invincible', wrongs: ['Vulnerable', 'Fragile', 'Weak'] },
  { sentence: 'The champion had built a ___ record, unbeaten in over fifty matches.', meaning: '(impressively strong or powerful)', correct: 'Formidable', wrongs: ['Weak', 'Feeble', 'Harmless'] },
  { sentence: 'After the fever, the puppy was too ___ to even stand on its own.', meaning: '(weak)', correct: 'Feeble', wrongs: ['Robust', 'Sturdy', 'Powerful'] },
  { sentence: 'Years of training gave the athlete a ___ frame built for endurance sports.', meaning: '(strong and healthy)', correct: 'Robust', wrongs: ['Feeble', 'Frail', 'Weak'] },
  { sentence: 'The antique teacup was so ___ that she wrapped it in three layers of tissue.', meaning: '(easily broken)', correct: 'Delicate', wrongs: ['Sturdy', 'Robust', 'Tough'] },
  { sentence: 'The sailor\'s hands had grown ___ from years of pulling rough rope.', meaning: '(rough)', correct: 'Coarse', wrongs: ['Refined', 'Smooth', 'Soft'] },
  { sentence: 'The palace\'s ___ decorations showed centuries of careful craftsmanship.', meaning: '(elegant and sophisticated)', correct: 'Refined', wrongs: ['Coarse', 'Crude', 'Rough'] },
  { sentence: 'His ___ joke about the teacher got him sent straight to the office.', meaning: '(rude or offensive)', correct: 'Vulgar', wrongs: ['Polite', 'Refined', 'Tasteful'] },
  { sentence: 'The ___ waiter greeted every table with a smile and a warm welcome.', meaning: '(having good manners)', correct: 'Polite', wrongs: ['Rude', 'Impolite', 'Discourteous'] },
  { sentence: 'His ___ comment about her cooking left the whole table in awkward silence.', meaning: '(having bad manners)', correct: 'Impolite', wrongs: ['Polite', 'Courteous', 'Gracious'] },
  { sentence: 'The ___ flight attendant made sure every passenger had a pillow and blanket.', meaning: '(showing good manners; considerate)', correct: 'Courteous', wrongs: ['Rude', 'Impolite', 'Discourteous'] },
  { sentence: 'The customer was ___ to the cashier, shouting over a small mistake in his order.', meaning: '(showing bad manners)', correct: 'Rude', wrongs: ['Courteous', 'Polite', 'Gracious'] },
  { sentence: 'The ___ nurse always checked twice before giving a patient any medicine.', meaning: '(thinking carefully about others\' needs)', correct: 'Considerate', wrongs: ['Careless', 'Negligent', 'Thoughtless'] },
  { sentence: 'It was ___ of him to leave his wet umbrella right in the doorway.', meaning: '(showing a lack of care for others)', correct: 'Negligent', wrongs: ['Considerate', 'Attentive', 'Careful'] },
  { sentence: 'The ___ lifeguard never once took his eyes off the swimmers.', meaning: '(paying close attention)', correct: 'Attentive', wrongs: ['Distracted', 'Careless', 'Inattentive'] },
  { sentence: 'The ___ driver kept checking his phone instead of watching the road.', meaning: '(not paying attention)', correct: 'Distracted', wrongs: ['Attentive', 'Focused', 'Alert'] },
  { sentence: 'The ___ chess player never once looked away from the board during the match.', meaning: '(giving complete attention to one thing)', correct: 'Focused', wrongs: ['Distracted', 'Scatterbrained', 'Absent-minded'] },
  { sentence: 'The ___ professor once left his own car running in the parking lot all day.', meaning: '(forgetful and disorganized)', correct: 'Scatterbrained', wrongs: ['Focused', 'Organized', 'Sharp'] },
  { sentence: 'The ___ detective noticed the tiny clue everyone else had walked right past.', meaning: '(quick to notice or understand things)', correct: 'Sharp', wrongs: ['Dull', 'Slow', 'Oblivious'] },
  { sentence: 'The comedian\'s ___ one-liners had the whole audience laughing within seconds.', meaning: '(cleverly funny)', correct: 'Witty', wrongs: ['Humorless', 'Dull', 'Boring'] },
  { sentence: 'The class clown\'s ___ antics kept everyone entertained during study hall.', meaning: '(funny; amusing)', correct: 'Humorous', wrongs: ['Serious', 'Solemn', 'Grim'] },
  { sentence: 'The judge remained ___ throughout the entire trial, never once smiling.', meaning: '(grave and not joking)', correct: 'Serious', wrongs: ['Humorous', 'Playful', 'Silly'] },
  { sentence: 'A ___ hush fell over the crowd as the memorial service began.', meaning: '(deeply serious, especially in a formal setting)', correct: 'Solemn', wrongs: ['Playful', 'Cheerful', 'Lighthearted'] },
  { sentence: 'The kitten\'s ___ swipes at the yarn kept the whole family laughing.', meaning: '(fond of fun and games)', correct: 'Playful', wrongs: ['Solemn', 'Serious', 'Grim'] },
  { sentence: 'The ___ toddler hid everyone\'s shoes just to watch them search for them.', meaning: '(mischievously playful)', correct: 'Impish', wrongs: ['Innocent', 'Angelic', 'Obedient'] },
  { sentence: 'The ___ puppy had no idea it had done anything wrong by chewing the shoe.', meaning: '(not guilty; free of wrongdoing)', correct: 'Innocent', wrongs: ['Guilty', 'Impish', 'Sneaky'] },
  { sentence: 'The security footage finally proved the suspect was ___ of the theft.', meaning: '(responsible for wrongdoing)', correct: 'Guilty', wrongs: ['Innocent', 'Blameless', 'Cleared'] },
  { sentence: 'The ___ hiker checked the weather report three times before leaving.', meaning: '(cautious about possible danger)', correct: 'Wary', wrongs: ['Trusting', 'Careless', 'Reckless'] },
  { sentence: 'The overly ___ investor handed his life savings to the first stranger who asked.', meaning: '(quick to believe others)', correct: 'Trusting', wrongs: ['Wary', 'Suspicious', 'Skeptical'] },
  { sentence: 'His ___ boss checked every employee\'s desk drawers for no clear reason.', meaning: '(irrationally suspicious of others)', correct: 'Paranoid', wrongs: ['Trusting', 'Calm', 'Relaxed'] },
  { sentence: 'The new student felt ___ every time the whole class turned to look at her.', meaning: '(uncomfortably aware of being watched)', correct: 'Self-conscious', wrongs: ['Confident', 'Carefree', 'Relaxed'] },
  { sentence: 'The ___ boy hid behind his mother whenever a stranger said hello.', meaning: '(shy)', correct: 'Bashful', wrongs: ['Outgoing', 'Confident', 'Bold'] },
  { sentence: 'The ___ new kid introduced himself to everyone in the lunchroom on his first day.', meaning: '(friendly and sociable)', correct: 'Outgoing', wrongs: ['Bashful', 'Antisocial', 'Withdrawn'] },
  { sentence: 'He was so ___ that he never joined any of the class clubs or teams.', meaning: '(avoiding the company of others)', correct: 'Antisocial', wrongs: ['Outgoing', 'Sociable', 'Friendly'] },
  { sentence: 'The two rival companies remained openly ___ toward each other for years.', meaning: '(unfriendly and aggressive)', correct: 'Hostile', wrongs: ['Peaceful', 'Friendly', 'Amicable'] },
  { sentence: 'After the treaty was signed, the two nations finally became ___ neighbors.', meaning: '(calm and free from conflict)', correct: 'Peaceful', wrongs: ['Hostile', 'Warlike', 'Aggressive'] },
  { sentence: 'The two ancient kingdoms had a long ___ history full of battles.', meaning: '(inclined toward fighting)', correct: 'Warlike', wrongs: ['Peaceful', 'Friendly', 'Calm'] },
  { sentence: 'The ___ negotiator found a solution that left both sides satisfied.', meaning: '(skilled at handling delicate situations)', correct: 'Diplomatic', wrongs: ['Tactless', 'Rude', 'Blunt'] },
  { sentence: 'His ___ joke about her haircut hurt her feelings without him even realizing it.', meaning: '(lacking sensitivity toward others\' feelings)', correct: 'Tactless', wrongs: ['Diplomatic', 'Considerate', 'Sensitive'] },
  { sentence: 'The critic\'s ___ review didn\'t hold back a single harsh word.', meaning: '(harsh and unpleasantly direct)', correct: 'Abrasive', wrongs: ['Soothing', 'Gentle', 'Mild'] },
  { sentence: 'The lullaby had a ___ effect, calming the crying baby within minutes.', meaning: '(calming)', correct: 'Soothing', wrongs: ['Irritating', 'Abrasive', 'Jarring'] },
  { sentence: 'The scratchy tag on his shirt was so ___ that he cut it off immediately.', meaning: '(annoying)', correct: 'Irritating', wrongs: ['Soothing', 'Calming', 'Pleasant'] },
  { sentence: 'Her ___ laugh made everyone in the room want to smile too.', meaning: '(pleasant and attractive)', correct: 'Charming', wrongs: ['Repulsive', 'Unpleasant', 'Off-putting'] },
  { sentence: 'The smell coming from the dumpster was absolutely ___.', meaning: '(disgusting)', correct: 'Repulsive', wrongs: ['Charming', 'Delightful', 'Pleasant'] },
  { sentence: 'Everyone agreed the sunset over the canyon was truly ___.', meaning: '(pleasing to look at)', correct: 'Attractive', wrongs: ['Hideous', 'Ugly', 'Repulsive'] },
  { sentence: 'The monster costume was so ___ that several kids started crying.', meaning: '(extremely ugly or frightening)', correct: 'Hideous', wrongs: ['Attractive', 'Gorgeous', 'Beautiful'] },
  { sentence: 'The bride looked absolutely ___ in her flowing white gown.', meaning: '(extremely beautiful)', correct: 'Gorgeous', wrongs: ['Hideous', 'Plain', 'Ordinary'] },
  { sentence: 'The office walls were painted a ___ shade of beige with no decoration at all.', meaning: '(simple and undecorated)', correct: 'Plain', wrongs: ['Gorgeous', 'Elaborate', 'Ornate'] },
  { sentence: 'The fireworks put on a ___ display that lit up the whole night sky.', meaning: '(brilliantly impressive)', correct: 'Dazzling', wrongs: ['Drab', 'Dull', 'Colorless'] },
  { sentence: 'The abandoned warehouse was painted a ___ shade of gray with no other color.', meaning: '(dull in color; lacking brightness)', correct: 'Drab', wrongs: ['Dazzling', 'Vibrant', 'Colorful'] },
  { sentence: 'After the fire, the once green forest looked completely ___ and gray.', meaning: '(lacking color)', correct: 'Colorless', wrongs: ['Colorful', 'Vivid', 'Vibrant'] },
  { sentence: 'The parade featured ___ costumes in every shade of the rainbow.', meaning: '(full of bright colors)', correct: 'Colorful', wrongs: ['Colorless', 'Drab', 'Faded'] },
  { sentence: 'The old photograph had grown ___ after sitting in the sun for decades.', meaning: '(lost its brightness)', correct: 'Faded', wrongs: ['Vivid', 'Bright', 'Bold'] },
  { sentence: 'The designer chose ___ pastel colors instead of anything too bold.', meaning: '(softened; not bright or sharp)', correct: 'Muted', wrongs: ['Vivid', 'Bold', 'Bright'] },
  { sentence: 'The rock concert\'s speakers were so ___ that fans wore earplugs.', meaning: '(extremely loud)', correct: 'Deafening', wrongs: ['Silent', 'Quiet', 'Faint'] },
  { sentence: 'After the announcement, the entire courtroom went completely ___.', meaning: '(making no sound)', correct: 'Silent', wrongs: ['Deafening', 'Loud', 'Noisy'] },
  { sentence: 'The library stayed ___ except for the occasional turning of a page.', meaning: '(quiet; subdued)', correct: 'Hushed', wrongs: ['Deafening', 'Loud', 'Boisterous'] },
  { sentence: 'The ___ crowd at the fair shouted, laughed, and pushed toward the rides.', meaning: '(noisy and unruly)', correct: 'Rowdy', wrongs: ['Hushed', 'Calm', 'Quiet'] },
  { sentence: 'The librarian kept every shelf in ___ rows by subject and author.', meaning: '(arranged neatly)', correct: 'Orderly', wrongs: ['Untidy', 'Chaotic', 'Haphazard'] },
  { sentence: 'His ___ desk was covered in old papers, empty cups, and loose pens.', meaning: '(messy)', correct: 'Untidy', wrongs: ['Orderly', 'Neat', 'Tidy'] },
  { sentence: 'She kept her closet ___, with every shirt folded and color-coded.', meaning: '(clean and orderly)', correct: 'Neat', wrongs: ['Sloppy', 'Untidy', 'Cluttered'] },
  { sentence: 'His ___ handwriting made the teacher\'s grading take twice as long.', meaning: '(careless and messy)', correct: 'Sloppy', wrongs: ['Neat', 'Tidy', 'Precise'] },
  { sentence: 'The moving company kept every box carefully labeled and ___.', meaning: '(arranged in a planned, structured way)', correct: 'Organized', wrongs: ['Haphazard', 'Random', 'Disorganized'] },
  { sentence: 'The garage sale items were piled in a completely ___ heap on the driveway.', meaning: '(lacking any order or plan)', correct: 'Haphazard', wrongs: ['Organized', 'Systematic', 'Orderly'] },
  { sentence: 'The factory followed a ___ process to check every product before shipping.', meaning: '(done according to a fixed plan or method)', correct: 'Systematic', wrongs: ['Random', 'Haphazard', 'Chaotic'] },
  { sentence: 'The numbers on the raffle tickets were drawn in a completely ___ order.', meaning: '(without any particular pattern)', correct: 'Random', wrongs: ['Systematic', 'Planned', 'Deliberate'] },
  { sentence: 'His ___ apology proved that he really had thought carefully about what he did wrong.', meaning: '(carefully thought out)', correct: 'Deliberate', wrongs: ['Accidental', 'Unintentional', 'Random'] },
  { sentence: 'Knocking over the vase was completely ___, not something she meant to do.', meaning: '(happening by chance, not on purpose)', correct: 'Accidental', wrongs: ['Deliberate', 'Intentional', 'Planned'] },
  { sentence: 'The referee gave a warning for what looked like an ___ foul.', meaning: '(done on purpose)', correct: 'Intentional', wrongs: ['Unintentional', 'Accidental', 'Random'] },
  { sentence: 'His ___ mistake on the form was fixed as soon as he noticed it.', meaning: '(not done on purpose)', correct: 'Unintentional', wrongs: ['Intentional', 'Deliberate', 'Planned'] },
  { sentence: 'Experts confirmed that the painting was an ___ work by the famous artist.', meaning: '(genuinely what it is claimed to be)', correct: 'Authentic', wrongs: ['Counterfeit', 'Fake', 'Imitation'] },
  { sentence: 'The store was shut down after selling ___ designer handbags for years.', meaning: '(made to look real, but fake)', correct: 'Counterfeit', wrongs: ['Authentic', 'Genuine', 'Real'] },
  { sentence: 'Once the permit was approved, the food truck became a fully ___ business.', meaning: '(allowed by law)', correct: 'Legitimate', wrongs: ['Illegal', 'Unlawful', 'Corrupt'] },
  { sentence: 'Selling fireworks without a permit is ___ in most towns.', meaning: '(against the law)', correct: 'Illegal', wrongs: ['Legitimate', 'Lawful', 'Legal'] },
  { sentence: 'Every driver on the road must follow the ___ speed limit.', meaning: '(required or permitted by law)', correct: 'Lawful', wrongs: ['Illegal', 'Unlawful', 'Criminal'] },
  { sentence: 'The mayor resigned after reporters uncovered his ___ deals with contractors.', meaning: '(dishonest, especially involving bribery)', correct: 'Crooked', wrongs: ['Honest', 'Ethical', 'Lawful'] },
  { sentence: 'The mail carrier was so ___ that the whole street trusted him with their spare keys.', meaning: '(able to be trusted to do what is expected)', correct: 'Dependable', wrongs: ['Unreliable', 'Untrustworthy', 'Flaky'] },
  { sentence: 'The old car\'s brakes were so ___ that mechanics warned against driving it.', meaning: '(not able to be trusted or depended on)', correct: 'Unreliable', wrongs: ['Dependable', 'Trustworthy', 'Reliable'] },
  { sentence: 'The ___ fan drove six hours just to watch his favorite band play one show.', meaning: '(loyal and committed)', correct: 'Devoted', wrongs: ['Unfaithful', 'Disloyal', 'Indifferent'] },
  { sentence: 'His ___ business partner secretly sold the company\'s secrets to a rival.', meaning: '(not loyal)', correct: 'Unfaithful', wrongs: ['Devoted', 'Loyal', 'Faithful'] },
  { sentence: 'The ___ family owned three mansions and a private jet.', meaning: '(having a great deal of money)', correct: 'Wealthy', wrongs: ['Impoverished', 'Destitute', 'Poor'] },
  { sentence: 'After the factory closed, the whole town fell into ___ conditions.', meaning: '(extremely poor)', correct: 'Impoverished', wrongs: ['Wealthy', 'Prosperous', 'Rich'] },
  { sentence: 'The once struggling bakery became a ___ business within just two years.', meaning: '(financially successful)', correct: 'Prosperous', wrongs: ['Impoverished', 'Destitute', 'Bankrupt'] },
  { sentence: 'After losing his job and his home, he was left completely ___.', meaning: '(without any money or resources)', correct: 'Destitute', wrongs: ['Wealthy', 'Prosperous', 'Rich'] },
  { sentence: 'The ___ shopper compared prices at three different stores before buying anything.', meaning: '(careful with money)', correct: 'Thrifty', wrongs: ['Wasteful', 'Extravagant', 'Careless'] },
  { sentence: 'His ___ spending on video games left nothing in his savings account.', meaning: '(using resources carelessly)', correct: 'Wasteful', wrongs: ['Thrifty', 'Economical', 'Frugal'] },
  { sentence: 'The billionaire\'s ___ birthday party included fireworks and a live orchestra.', meaning: '(spending far more than necessary)', correct: 'Extravagant', wrongs: ['Economical', 'Thrifty', 'Modest'] },
  { sentence: 'Riding a bike to work instead of driving is a very ___ choice.', meaning: '(using money or resources wisely)', correct: 'Economical', wrongs: ['Extravagant', 'Wasteful', 'Lavish'] },
  { sentence: 'The ___ foundation donated free winter coats to every child at the shelter.', meaning: '(generous toward those in need)', correct: 'Charitable', wrongs: ['Stingy', 'Selfish', 'Miserly'] },
  { sentence: 'The ___ landlord refused to spend a single dollar fixing the broken heater.', meaning: '(unwilling to spend money)', correct: 'Miserly', wrongs: ['Charitable', 'Generous', 'Giving'] },
  { sentence: 'The ___ young athlete trained twice a day, determined to make the Olympic team.', meaning: '(strongly determined to succeed)', correct: 'Ambitious', wrongs: ['Complacent', 'Apathetic', 'Unmotivated'] },
  { sentence: 'The ___ employee never asked for a raise or a new project in ten years.', meaning: '(satisfied with things as they are, to the point of not trying to improve)', correct: 'Complacent', wrongs: ['Ambitious', 'Motivated', 'Driven'] },
  { sentence: 'The ___ coach inspired even the laziest players to start showing up early.', meaning: '(driven to work hard toward a goal)', correct: 'Motivated', wrongs: ['Complacent', 'Apathetic', 'Indifferent'] },
  { sentence: 'His ___ attitude toward the project meant he never once offered an idea.', meaning: '(showing no interest or energy)', correct: 'Apathetic', wrongs: ['Enthusiastic', 'Motivated', 'Passionate'] },
  { sentence: 'The ___ volunteers showed up an hour early, eager to start the beach cleanup.', meaning: '(showing great excitement or interest)', correct: 'Enthusiastic', wrongs: ['Apathetic', 'Indifferent', 'Unmoved'] },
  { sentence: 'She stayed completely ___ when told the concert had been canceled.', meaning: '(not emotionally affected)', correct: 'Unmoved', wrongs: ['Enthusiastic', 'Devastated', 'Thrilled'] },
  { sentence: 'His ___ speech about protecting the coral reefs convinced the whole audience to volunteer.', meaning: '(showing strong feeling for a cause)', correct: 'Passionate', wrongs: ['Lukewarm', 'Indifferent', 'Apathetic'] },
  { sentence: 'His ___ response to the exciting news left his friends wondering if he even cared.', meaning: '(showing little enthusiasm)', correct: 'Lukewarm', wrongs: ['Passionate', 'Enthusiastic', 'Fervent'] },
  { sentence: 'The ___ supporters lined the streets, waving flags for their candidate.', meaning: '(showing very strong feeling)', correct: 'Fervent', wrongs: ['Lukewarm', 'Indifferent', 'Apathetic'] },
  { sentence: 'The office kept a ___ dress code, allowing jeans and sneakers every day.', meaning: '(relaxed; not formal)', correct: 'Casual', wrongs: ['Formal', 'Rigid', 'Strict'] },
  { sentence: 'The wedding required a ___ dress code, with tuxedos and evening gowns.', meaning: '(following established rules of etiquette)', correct: 'Formal', wrongs: ['Casual', 'Informal', 'Relaxed'] },
  { sentence: 'Their ___ chat over coffee felt more like two old friends catching up.', meaning: '(not official or formal)', correct: 'Informal', wrongs: ['Formal', 'Official', 'Strict'] },
  { sentence: 'The ___ schedule at the new job left no room for any last-minute changes.', meaning: '(unable to be changed easily)', correct: 'Inflexible', wrongs: ['Versatile', 'Adaptable', 'Flexible'] },
  { sentence: 'The ___ tool could be used as a screwdriver, a bottle opener, or a knife.', meaning: '(able to be used for many purposes)', correct: 'Versatile', wrongs: ['Inflexible', 'Rigid', 'Limited'] },
  { sentence: 'His ___ arguments finally convinced the skeptical jury of his innocence.', meaning: '(convincing)', correct: 'Persuasive', wrongs: ['Unconvincing', 'Weak', 'Feeble'] },
  { sentence: 'Her ___ excuse for missing the deadline didn\'t fool the manager at all.', meaning: '(not convincing)', correct: 'Unconvincing', wrongs: ['Persuasive', 'Compelling', 'Convincing'] },
  { sentence: 'The documentary told such a ___ story that no one left their seats for two hours.', meaning: '(so interesting it holds your attention)', correct: 'Compelling', wrongs: ['Unconvincing', 'Boring', 'Dull'] },
  { sentence: 'The cafeteria\'s ___ oatmeal had almost no flavor at all.', meaning: '(lacking flavor or interest)', correct: 'Bland', wrongs: ['Flavorful', 'Spicy', 'Savory'] },
  { sentence: 'The chef\'s ___ curry was packed with spices and rich, satisfying taste.', meaning: '(full of pleasing taste)', correct: 'Flavorful', wrongs: ['Bland', 'Tasteless', 'Bitter'] },
  { sentence: 'The ___ stew, rich with garlic and herbs, filled the whole kitchen with its smell.', meaning: '(having a rich, appetizing taste)', correct: 'Savory', wrongs: ['Bland', 'Bitter', 'Sour'] },
  { sentence: 'The medicine had such a ___ taste that she gagged after just one spoonful.', meaning: '(sharp and unpleasant to taste)', correct: 'Bitter', wrongs: ['Sweet', 'Savory', 'Mild'] },
  { sentence: 'The birthday cake was so ___ that everyone asked for a second slice.', meaning: '(having sugar\'s pleasant taste)', correct: 'Sweet', wrongs: ['Bitter', 'Sour', 'Bland'] },
  { sentence: 'One bite of the unripe lemon left her whole face twisted from how ___ it was.', meaning: '(having a sharp, tangy taste)', correct: 'Sour', wrongs: ['Sweet', 'Savory', 'Mild'] },
  { sentence: 'The bakery\'s ___ cinnamon rolls could be smelled from across the street.', meaning: '(having a pleasant, noticeable smell)', correct: 'Aromatic', wrongs: ['Odorless', 'Fragrant', 'Bland'] },
  { sentence: 'Scientists use ___ gases in the lab because they\'re impossible to smell if they leak.', meaning: '(having no smell)', correct: 'Odorless', wrongs: ['Aromatic', 'Fragrant', 'Pungent'] },
  { sentence: 'The rose garden was so ___ that visitors could smell it from the parking lot.', meaning: '(having a pleasant smell)', correct: 'Fragrant', wrongs: ['Odorless', 'Foul', 'Rancid'] },
  { sentence: 'The forgotten leftovers in the fridge had gone completely ___.', meaning: '(having a bad smell from spoiling)', correct: 'Rancid', wrongs: ['Fragrant', 'Fresh', 'Aromatic'] },
  { sentence: 'The farmer\'s market only sold vegetables picked that same ___ morning.', meaning: '(recently made or gathered; not spoiled)', correct: 'Fresh', wrongs: ['Stale', 'Rotten', 'Rancid'] },
  { sentence: 'The ___ bread had gone hard and flavorless after sitting out for a week.', meaning: '(no longer fresh)', correct: 'Stale', wrongs: ['Fresh', 'Crisp', 'Ripe'] },
  { sentence: 'The ___ banana peel had turned completely black and mushy.', meaning: '(decayed and spoiled)', correct: 'Rotten', wrongs: ['Fresh', 'Ripe', 'Crisp'] },
  { sentence: 'The mango was finally ___ enough to eat, soft and sweet all the way through.', meaning: '(fully developed and ready to eat)', correct: 'Ripe', wrongs: ['Unripe', 'Overripe', 'Rotten'] },
  { sentence: 'The ___ tomatoes were still hard and green, far from ready to pick.', meaning: '(not yet fully developed)', correct: 'Unripe', wrongs: ['Ripe', 'Overripe', 'Rotten'] },
  { sentence: 'The ___ banana had turned brown and mushy from sitting too long in the bowl.', meaning: '(past its best ripeness; too soft)', correct: 'Overripe', wrongs: ['Unripe', 'Fresh', 'Crisp'] },
  { sentence: 'The fresh lettuce stayed ___ even after a full day in the fridge.', meaning: '(pleasantly firm; not soft or wilted)', correct: 'Crisp', wrongs: ['Soggy', 'Wilted', 'Limp'] },
  { sentence: 'The cereal had gone ___ after sitting in milk for far too long.', meaning: '(unpleasantly wet and soft)', correct: 'Soggy', wrongs: ['Crisp', 'Crunchy', 'Dry'] },
  { sentence: 'The perfectly cooked steak was ___ enough to cut with just a fork.', meaning: '(soft and easy to chew or cut)', correct: 'Tender', wrongs: ['Chewy', 'Tough', 'Rubbery'] },
  { sentence: 'The overcooked meat turned so ___ that his jaw hurt from all the chewing.', meaning: '(requiring a lot of chewing)', correct: 'Chewy', wrongs: ['Tender', 'Soft', 'Delicate'] },
  { sentence: 'The freshly picked peach was so ___ that its juice ran down her chin.', meaning: '(full of liquid)', correct: 'Juicy', wrongs: ['Dry', 'Parched', 'Arid'] },
  { sentence: 'After days without rain, the ___ soil cracked into a pattern of jagged lines.', meaning: '(extremely dry, from lack of water)', correct: 'Parched', wrongs: ['Juicy', 'Moist', 'Soaked'] },
  { sentence: 'After the storm, her jacket was completely ___ and had to be hung to dry.', meaning: '(slightly wet)', correct: 'Damp', wrongs: ['Arid', 'Parched', 'Dry'] },
  { sentence: 'Falling into the pool left him completely ___ from head to toe.', meaning: '(thoroughly wet)', correct: 'Soaked', wrongs: ['Dry', 'Arid', 'Parched'] },
  { sentence: 'Caught in the downpour without an umbrella, they arrived home totally ___.', meaning: '(extremely wet)', correct: 'Drenched', wrongs: ['Dry', 'Arid', 'Parched'] },
  { sentence: 'Almost nothing grows in the ___ desert, where rain falls only a few days a year.', meaning: '(extremely dry, with very little rainfall)', correct: 'Arid', wrongs: ['Humid', 'Damp', 'Wet'] },
  { sentence: 'The ___ jungle air made every hiker\'s shirt stick to their skin.', meaning: '(having a high level of moisture in the air)', correct: 'Humid', wrongs: ['Arid', 'Dry', 'Parched'] },
  { sentence: 'The ___ mountain wind made the campers zip their jackets all the way up.', meaning: '(extremely cold)', correct: 'Icy', wrongs: ['Scorching', 'Sweltering', 'Warm'] },
  { sentence: 'The ___ afternoon sun kept everyone crowded under the beach umbrellas.', meaning: '(extremely hot)', correct: 'Scorching', wrongs: ['Icy', 'Frigid', 'Chilly'] },
  { sentence: 'The city stayed at a comfortable, ___ sixty-eight degrees all spring.', meaning: '(mild in temperature)', correct: 'Temperate', wrongs: ['Scorching', 'Icy', 'Frigid'] },
  { sentence: 'She wrapped a scarf around her neck against the ___ autumn morning air.', meaning: '(uncomfortably cold)', correct: 'Chilly', wrongs: ['Sweltering', 'Scorching', 'Warm'] },
  { sentence: 'They spent the ___ evening on the porch without needing a single jacket.', meaning: '(pleasantly warm)', correct: 'Balmy', wrongs: ['Frigid', 'Icy', 'Chilly'] },
  { sentence: 'The ___ afternoon nearly knocked over the picnic tent twice.', meaning: '(windy, with sudden strong gusts)', correct: 'Blustery', wrongs: ['Windless', 'Calm', 'Still'] },
  { sentence: 'A ___ breeze kept flipping the pages of her book on the beach.', meaning: '(marked by sudden bursts of wind)', correct: 'Gusty', wrongs: ['Windless', 'Calm', 'Still'] },
  { sentence: 'The ___ afternoon made it the perfect day to fly a kite... or not fly one at all.', meaning: '(without any wind)', correct: 'Windless', wrongs: ['Blustery', 'Gusty', 'Windy'] },
  { sentence: 'The ___ sky over the harbor warned every sailor to head back before the waves grew.', meaning: '(threatening bad weather)', correct: 'Stormy', wrongs: ['Windless', 'Clear', 'Cloudless'] },
  { sentence: 'The ___ sky blocked out the sun for most of the afternoon.', meaning: '(covered by clouds)', correct: 'Overcast', wrongs: ['Cloudless', 'Clear', 'Sunny'] },
  { sentence: 'The ___ night sky let them see every single star above the campsite.', meaning: '(without any clouds)', correct: 'Cloudless', wrongs: ['Overcast', 'Stormy', 'Foggy'] },
  { sentence: 'The ___ morning made it impossible to see more than ten feet down the road.', meaning: '(filled with thick mist)', correct: 'Foggy', wrongs: ['Cloudless', 'Clear', 'Sunny'] },
  { sentence: 'The ___ view from the hilltop made the distant mountains look like blurry shapes.', meaning: '(slightly unclear, as if covered by thin mist)', correct: 'Hazy', wrongs: ['Cloudless', 'Clear', 'Sharp'] },
  { sentence: 'The ___ valley looked like it was wrapped in a soft gray blanket at dawn.', meaning: '(covered by a thin fog)', correct: 'Misty', wrongs: ['Cloudless', 'Clear', 'Sunny'] }
];

const vocabularyTemplates = [
  { bloom: 'Remember', gen: () => {
    const facts = [
      { q: 'What do we call a word that means the OPPOSITE of another word?', correct: 'Antonym' },
      { q: 'What do we call a word that means nearly the SAME as another word?', correct: 'Synonym' },
      { q: 'What do we call word parts added to the BEGINNING of a word to change its meaning?', correct: 'Prefix' },
      { q: 'What do we call word parts added to the END of a word to change its meaning?', correct: 'Suffix' },
      { q: 'What do we call the base part of a word that carries its core meaning, before prefixes or suffixes are added?', correct: 'Root word' },
      { q: 'What do we call the emotional feeling a word carries beyond its literal, dictionary meaning?', correct: 'Connotation' },
      { q: 'What do we call the literal, dictionary definition of a word?', correct: 'Denotation' },
      { q: 'What do we call clues in the surrounding text that help you figure out the meaning of an unfamiliar word?', correct: 'Context clues' },
      { q: 'What do we call two words that are spelled the same but have different meanings, like "bat" the animal and "bat" the equipment?', correct: 'Homonym' },
      { q: 'What do we call two words that sound the same but are spelled differently and have different meanings, like "flour" and "flower"?', correct: 'Homophone' },
      { q: 'What do we call a word that imitates the sound it represents, like "buzz" or "clang"?', correct: 'Onomatopoeia' },
      { q: 'What do we call a phrase whose overall meaning is different from the literal meaning of its individual words, like "break the ice"?', correct: 'Idiom' },
      { q: 'What do we call the practice of looking up a word\'s meaning, pronunciation, and part of speech in a reference book?', correct: 'Using a dictionary' },
      { q: 'What do we call a reference book that lists synonyms and antonyms for words?', correct: 'Thesaurus' },
      { q: 'What do we call words that belong to the same word family and share a common root, like "act," "action," and "actor"?', correct: 'Word family' },
      { q: 'What do we call it when a word has more than one distinct meaning, like "bank" (a riverbank or a place for money)?', correct: 'Multiple meaning word' },
      { q: 'What do we call specialized vocabulary specific to a particular subject or field, like scientific terms?', correct: 'Domain-specific vocabulary' },
      { q: 'What do we call the smallest meaningful unit of language, like the word part "un-" or "-ing"?', correct: 'Morpheme' },
      { q: 'Which term describes a word with a meaning opposite to another word, like "hot" and "cold"?', correct: 'Antonym' },
      { q: 'Which term describes a word that could replace another word without changing the meaning much, like "happy" and "glad"?', correct: 'Synonym' },
      { q: 'Which term describes the word part attached before a root, such as "re-" in "replay"?', correct: 'Prefix' },
      { q: 'Which term describes the word part attached after a root, such as "-less" in "hopeless"?', correct: 'Suffix' },
      { q: 'Which term describes the central word part that holds the main meaning, before any prefix or suffix is added?', correct: 'Root word' },
      { q: 'Which term describes the feeling or association a word carries, positive or negative, beyond its dictionary definition?', correct: 'Connotation' },
      { q: 'Which term describes a word\'s exact dictionary meaning, without any emotional association?', correct: 'Denotation' },
      { q: 'Which term describes hints from surrounding words and sentences that reveal an unfamiliar word\'s meaning?', correct: 'Context clues' },
      { q: 'Which term describes words spelled identically but with unrelated meanings, like "bark" (tree) and "bark" (dog sound)?', correct: 'Homonym' },
      { q: 'Which term describes words that sound alike but are spelled differently, like "there" and "their"?', correct: 'Homophone' },
      { q: 'Which term describes a word formed to sound like the noise it names, like "splash" or "hiss"?', correct: 'Onomatopoeia' },
      { q: 'Which term describes an expression like "hit the books" whose meaning isn\'t literal?', correct: 'Idiom' },
      { q: 'Which term describes looking up a word to learn its spelling, meaning, and pronunciation?', correct: 'Using a dictionary' },
      { q: 'Which term describes a reference tool you\'d use to find a more vivid synonym for "said"?', correct: 'Thesaurus' },
      { q: 'Which term describes a group of related words built from the same root, like "help," "helpful," and "helper"?', correct: 'Word family' },
      { q: 'Which term describes a word like "fair," which can mean "just" or "a carnival," depending on context?', correct: 'Multiple meaning word' },
      { q: 'Which term describes technical words used mainly within one subject area, like "photosynthesis" in science?', correct: 'Domain-specific vocabulary' },
      { q: 'Which term describes the tiniest unit of meaning in a word, such as the "-s" that makes a noun plural?', correct: 'Morpheme' },
      { q: 'What do we call a deliberate exaggeration used for effect, like "I could eat a horse"?', correct: 'Hyperbole' },
      { q: 'What do we call giving human qualities to an animal, object, or idea, like "the wind whispered"?', correct: 'Personification' },
      { q: 'What do we call describing something as less significant than it really is, like calling a hurricane "a bit of weather"?', correct: 'Understatement' },
      { q: 'What do we call an informal word or phrase typical of everyday conversation, like "gonna" or "y\'all"?', correct: 'Colloquialism' },
      { q: 'What do we call specialized vocabulary used mainly by people in a particular profession or group, like a doctor\'s medical terms?', correct: 'Jargon' },
      { q: 'What do we call the level of formality a speaker or writer chooses, from very casual to very formal?', correct: 'Register' },
      { q: 'What do we call the writer\'s or speaker\'s attitude toward a subject, as shown through word choice?', correct: 'Tone' },
      { q: 'What do we call a writer\'s specific choice of words to create a certain effect or style?', correct: 'Diction' },
      { q: 'What do we call a word formed by blending the sounds and meanings of two other words, like "brunch" from "breakfast" and "lunch"?', correct: 'Portmanteau' },
      { q: 'What do we call a word formed from the first letters of a longer phrase, like "NASA"?', correct: 'Acronym' },
      { q: 'What do we call a mild or indirect word used in place of a harsh or unpleasant one, like "passed away" instead of "died"?', correct: 'Euphemism' },
      { q: 'What do we call a comparison between two unlike things using the word "like" or "as"?', correct: 'Simile' },
      { q: 'What do we call a figure of speech that describes one thing as if it actually were another, without using "like" or "as"?', correct: 'Metaphor' },
      { q: 'What do we call the repetition of the same beginning consonant sound in nearby words, like "wild and windy"?', correct: 'Alliteration' },
      { q: 'What do we call very informal, playful language often used within a specific group, like "cool" or "lit"?', correct: 'Slang' },
      { q: 'What do we call a word borrowed directly from another language, like "burrito" from Spanish?', correct: 'Loanword' },
      { q: 'Which term describes exaggerating something far beyond reality for dramatic or humorous effect?', correct: 'Hyperbole' },
      { q: 'Which term describes giving human traits, like feelings or actions, to something that is not human?', correct: 'Personification' },
      { q: 'Which term describes making something sound smaller or less serious than it truly is?', correct: 'Understatement' },
      { q: 'Which term describes a casual expression more common in speech than formal writing, like "kinda"?', correct: 'Colloquialism' },
      { q: 'Which term describes technical terms that outsiders to a profession might not understand, like legal or medical vocabulary?', correct: 'Jargon' },
      { q: 'Which term describes how formal or informal a piece of language is, depending on the audience and situation?', correct: 'Register' },
      { q: 'Which term describes whether a passage feels serious, humorous, sarcastic, or sorrowful based on its wording?', correct: 'Tone' },
      { q: 'Which term describes the specific words an author selects, which shape the mood and style of a text?', correct: 'Diction' },
      { q: 'Which term describes a new word made by combining parts of two existing words, like "smog" from "smoke" and "fog"?', correct: 'Portmanteau' },
      { q: 'Which term describes an abbreviation pronounced as a word, formed from a phrase\'s initial letters, like "SCUBA"?', correct: 'Acronym' },
      { q: 'Which term describes softening an uncomfortable topic with gentler wording, like "let go" instead of "fired"?', correct: 'Euphemism' },
      { q: 'Which term describes a comparison like "brave as a lion," which uses "as" to link two different things?', correct: 'Simile' },
      { q: 'Which term describes a phrase like "time is money," which equates two different things without "like" or "as"?', correct: 'Metaphor' },
      { q: 'Which term describes a phrase like "Peter Piper picked," where several words start with the same sound?', correct: 'Alliteration' },
      { q: 'Which term describes trendy, casual vocabulary that often changes quickly between generations?', correct: 'Slang' },
      { q: 'Which term describes a word like "kindergarten," which English adopted directly from German?', correct: 'Loanword' }
    ];
    const allTerms = ['Antonym', 'Synonym', 'Prefix', 'Suffix', 'Root word', 'Connotation', 'Denotation', 'Context clues', 'Homonym', 'Homophone', 'Onomatopoeia', 'Idiom', 'Using a dictionary', 'Thesaurus', 'Word family', 'Multiple meaning word', 'Domain-specific vocabulary', 'Morpheme', 'Hyperbole', 'Personification', 'Understatement', 'Colloquialism', 'Jargon', 'Register', 'Tone', 'Diction', 'Portmanteau', 'Acronym', 'Euphemism', 'Simile', 'Metaphor', 'Alliteration', 'Slang', 'Loanword'];
    const f = choice(facts);
    const wrongs = shuffle(allTerms.filter(c => c !== f.correct)).slice(0, 3);
    const choices = shuffle([f.correct, ...wrongs]);
    return { prompt: f.q, type: 'mcq', choices, correct: f.correct, explanation: `${f.correct} matches this definition.` };
  }},
  { bloom: 'Understand', gen: () => {
    const entry = choice(SYNONYM_POOL);
    const choices = shuffle([entry.synonym, ...entry.distractors]);
    return {
      prompt: `Which word is a SYNONYM for "${entry.word}"?`,
      type: 'mcq',
      choices,
      correct: entry.synonym,
      explanation: `"${entry.synonym}" means nearly the same thing as "${entry.word}."`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const entry = choice(AFFIX_POOL);
    const others = shuffle(AFFIX_POOL.filter(e => e !== entry)).slice(0, 3);
    const choices = shuffle([entry.meaning, ...others.map(o => o.meaning)]);
    return {
      prompt: `What does the ${entry.isPrefix ? 'prefix' : 'suffix'} "${entry.affix}" mean, as in the word "${entry.example}"?`,
      type: 'mcq',
      choices,
      correct: entry.meaning,
      explanation: `"${entry.affix}" means "${entry.meaning}," as shown in "${entry.example}."`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const entry = choice(CONTEXT_POOL);
    const choices = shuffle([entry.correct, ...entry.wrongs]);
    return {
      prompt: `Based on context, what does "${entry.word}" most likely mean in this sentence? "${entry.sentence}"`,
      type: 'mcq',
      choices,
      correct: entry.correct,
      explanation: `The surrounding context ("${entry.sentence}") suggests "${entry.word}" means: ${entry.correct.toLowerCase()}.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const entry = choice(CONNOTATION_POOL);
    const askNegative = Math.random() < 0.5;
    const correct = askNegative ? entry.negative : entry.positive;
    const choices = shuffle([entry.positive, entry.negative, 'They have identical connotations', 'Neither word relates to this meaning']);
    return {
      prompt: `Both "${entry.positive}" and "${entry.negative}" can describe someone ${entry.sharedMeaning}, but which word has a more ${askNegative ? 'NEGATIVE' : 'POSITIVE'} connotation?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `"${entry.positive}" has a positive connotation, while "${entry.negative}" has a negative connotation, even though both describe someone ${entry.sharedMeaning}.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const entry = choice(FILL_MEANING_POOL);
    const choices = shuffle([entry.correct, ...entry.wrongs]);
    return {
      prompt: `Which word best completes the sentence? "${entry.sentence}" ${entry.meaning}`,
      type: 'mcq',
      choices,
      correct: entry.correct,
      explanation: `"${entry.correct}" fits the meaning ${entry.meaning} and completes the sentence naturally.`
    };
  }}
];

// ---- Reading Comprehension -----------------------------------------------------

const READING_POOL = [
  {
    passage: "Maria had never hiked before, but her older brother convinced her to join him on a trail through Pine Ridge Forest. The path was steep and rocky, and by the time they reached the halfway point, Maria's legs were burning. Just as she considered turning back, they rounded a bend and saw a stunning waterfall cascading into a crystal-clear pool. Maria forgot all about her tired legs and ran ahead to get a closer look.",
    remember: { q: 'Where were Maria and her brother hiking?', correct: 'Pine Ridge Forest', wrongs: ['Crystal Lake Park', 'Rocky Mountain Trail', 'Silver Creek Woods'] },
    understand: { q: 'What is the main idea of this passage?', correct: 'A tiring hike became worthwhile when Maria discovered a beautiful waterfall', wrongs: ["Maria's brother is an experienced hiker", 'Pine Ridge Forest is a dangerous place to hike', 'Maria decided never to hike again'] },
    apply: { q: 'As used in the passage, what does "cascading" most likely mean?', correct: 'Falling or flowing downward', wrongs: ['Standing perfectly still', 'Freezing solid', 'Making a loud noise'] },
    analyze: { q: "What can you infer about Maria's feelings just before she saw the waterfall?", correct: 'She was tired and thinking about giving up', wrongs: ['She was extremely excited and full of energy', 'She was afraid of her brother', 'She wanted to hike faster'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To tell an engaging story about an unexpected reward', wrongs: ['To give instructions on how to hike safely', 'To persuade readers to avoid hiking', 'To explain the history of Pine Ridge Forest'] },
    create: { q: 'Which title best fits this passage?', correct: 'The Waterfall Surprise', wrongs: ['Brother Knows Best', 'The Dangers of Hiking', 'Lost in the Forest'] }
  },
  {
    passage: "Devon spent three weeks building a model volcano for the school science fair. He mixed baking soda and vinegar to create a bubbling eruption, then painted the outside to look like real rock. On the day of the fair, his volcano erupted perfectly in front of the judges, and red 'lava' spilled down its sides. Devon won second place, and he was already planning an even bigger project for next year.",
    remember: { q: 'What two ingredients did Devon mix to create the eruption?', correct: 'Baking soda and vinegar', wrongs: ['Flour and water', 'Sugar and salt', 'Clay and paint'] },
    understand: { q: 'What is the main idea of this passage?', correct: "Devon's hard work on his volcano project paid off at the science fair", wrongs: ['Devon dislikes science fairs', 'Building volcanoes is very dangerous', "Devon's project was a complete failure"] },
    apply: { q: 'As used in the passage, what does "eruption" mean in this context?', correct: 'A sudden bursting or spilling out', wrongs: ['A quiet, slow process', 'A type of rock formation', 'A school award'] },
    analyze: { q: "What can you infer about Devon's attitude toward science fairs?", correct: 'He enjoys them and is motivated to keep improving', wrongs: ['He never wants to enter another science fair', 'He thinks science fairs are a waste of time', 'He is afraid of judges'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: "To describe a student's successful science fair experience", wrongs: ['To explain exactly how volcanoes work in nature', 'To criticize school science fairs', 'To compare Devon to other students'] },
    create: { q: 'Which title best fits this passage?', correct: "Devon's Winning Volcano", wrongs: ['The History of Volcanoes', 'A Science Fair Disaster', 'Devon Quits Science'] }
  },
  {
    passage: 'The old library downtown was scheduled for demolition until a group of students started a petition to save it. They collected over two thousand signatures and presented them at a city council meeting. Many residents shared memories of learning to read there as children. Moved by the community\'s response, the city council voted to restore the building instead of tearing it down.',
    remember: { q: 'How many signatures did the students collect?', correct: 'Over two thousand', wrongs: ['Exactly one hundred', 'Over ten thousand', 'About five hundred'] },
    understand: { q: 'What is the main idea of this passage?', correct: 'Community action saved a beloved library from demolition', wrongs: ['The library was too expensive to maintain', 'Students dislike libraries', 'The city council ignored the petition'] },
    apply: { q: 'As used in the passage, what does "petition" mean?', correct: 'A formal written request signed by many people', wrongs: ['A type of building material', 'A city law', 'A library book'] },
    analyze: { q: "What can you infer about the library's importance to the community?", correct: 'It holds meaningful memories for many residents', wrongs: ['Nobody in the community cares about it', 'It was built very recently', 'It is the newest building downtown'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show how community action can create positive change', wrongs: ['To argue that old buildings should always be torn down', 'To explain how city councils are elected', 'To criticize students for being too involved'] },
    create: { q: 'Which title best fits this passage?', correct: 'Saving the Library', wrongs: ['The New City Hall', 'Students Against Reading', 'A History of Demolition'] }
  },
  {
    passage: "When Mr. Alvarez retired, he decided to turn his backyard into a vegetable garden. At first, nothing seemed to grow, and he almost gave up after the tomatoes wilted in the summer heat. He researched proper watering schedules and soil types, then tried again the following spring. By fall, his garden was overflowing with tomatoes, peppers, and squash, and he began sharing the extra vegetables with his neighbors.",
    remember: { q: "What three vegetables did Mr. Alvarez's garden eventually produce?", correct: 'Tomatoes, peppers, and squash', wrongs: ['Carrots, onions, and corn', 'Apples, pears, and grapes', 'Lettuce, spinach, and kale'] },
    understand: { q: 'What is the main idea of this passage?', correct: 'Mr. Alvarez succeeded at gardening after learning from his early failures', wrongs: ['Gardening is impossible for retirees', 'Mr. Alvarez hates vegetables', 'His neighbors refused his vegetables'] },
    apply: { q: 'As used in the passage, what does "wilted" most likely mean?', correct: 'Drooped or dried out from lack of water', wrongs: ['Grew unusually tall', 'Turned bright red', 'Multiplied quickly'] },
    analyze: { q: "What can you infer about Mr. Alvarez's personality?", correct: 'He is persistent and willing to learn from mistakes', wrongs: ['He gives up easily when things go wrong', 'He dislikes his neighbors', 'He has always been an expert gardener'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show that persistence can lead to success', wrongs: ['To provide a step-by-step gardening manual', 'To argue that gardens are a waste of time', 'To describe the history of vegetable farming'] },
    create: { q: 'Which title best fits this passage?', correct: 'From Wilted to Wonderful', wrongs: ['Why Gardens Always Fail', "Mr. Alvarez's Boring Retirement", 'The Cost of Vegetables'] }
  },
  {
    passage: "Our school's robotics team had never won a competition until this year. The students spent months designing a robot that could sort recycling faster than any other team's machine. During the final round, their robot briefly malfunctioned, and the team had only sixty seconds to fix it. Working together calmly under pressure, they solved the problem just in time and went on to win first place.",
    remember: { q: 'How many seconds did the team have to fix their robot?', correct: 'Sixty seconds', wrongs: ['Five minutes', 'Ten seconds', 'Two hours'] },
    understand: { q: 'What is the main idea of this passage?', correct: "Teamwork and quick thinking helped the robotics team win their first competition", wrongs: ['The robot worked perfectly the entire time', 'The team decided to quit robotics', 'Robots cannot sort recycling effectively'] },
    apply: { q: 'As used in the passage, what does "malfunctioned" mean?', correct: 'Stopped working correctly', wrongs: ['Won a prize', 'Moved extremely fast', 'Was painted a new color'] },
    analyze: { q: 'What can you infer about the team members?', correct: 'They can stay calm and work well together under pressure', wrongs: ['They panic easily during competitions', 'They dislike working as a team', 'They had given up before the final round'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: "To celebrate a team's perseverance and teamwork", wrongs: ['To explain how robots are built', 'To criticize robotics competitions', 'To describe the rules of recycling'] },
    create: { q: 'Which title best fits this passage?', correct: 'Sixty Seconds to Victory', wrongs: ['A Robot That Never Works', 'Giving Up on Robotics', 'The History of Recycling'] }
  },
  {
    passage: "Every year, Lincoln Middle School holds a bake sale to raise money for new library books. This year, seventh-grader Aiden decided to bake dozens of chocolate chip cookies with his grandmother the night before. By lunchtime, his table had sold out completely, and Aiden donated all $85 he earned to the library fund. The librarian later thanked him personally and asked if he'd help organize next year's sale.",
    remember: { q: 'How much money did Aiden donate to the library fund?', correct: '$85', wrongs: ['$50', '$100', '$8.50'] },
    understand: { q: 'What is the main idea of this passage?', correct: "Aiden's baking effort made a meaningful contribution to his school's library fund", wrongs: ['Aiden dislikes baking cookies', 'The bake sale was a failure', 'The librarian was upset with Aiden'] },
    apply: { q: 'As used in the passage, what does "donated" mean?', correct: 'Gave away, usually to a good cause', wrongs: ['Sold for personal profit', 'Threw away', 'Borrowed temporarily'] },
    analyze: { q: 'What can you infer about Aiden?', correct: 'He is generous and enjoys helping his school community', wrongs: ['He only cares about making money for himself', 'He dislikes his grandmother', 'He never wants to bake again'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: "To highlight a student's generosity and community spirit", wrongs: ['To give a recipe for chocolate chip cookies', 'To criticize school bake sales', 'To explain how libraries are funded'] },
    create: { q: 'Which title best fits this passage?', correct: 'Cookies for a Cause', wrongs: ['The Worst Bake Sale Ever', "Aiden's Cooking Disaster", 'A History of Libraries'] }
  },
  {
    passage: "Ten-year-old Sofia had practiced the violin every day for six months before her first recital. Backstage, her hands trembled and she considered running out the door. Her older sister reminded her that mistakes were part of learning and squeezed her hand for courage. When Sofia finally stepped on stage, she took a deep breath and played her piece from memory, earning a standing ovation from the audience.",
    remember: { q: 'How long had Sofia practiced before her recital?', correct: 'Six months', wrongs: ['Six days', 'Six weeks', 'One year'] },
    understand: { q: 'What is the main idea of this passage?', correct: "With support from her sister, Sofia overcame her nerves and delivered a successful performance", wrongs: ['Sofia decided to quit the violin', 'The audience booed her performance', "Sofia's sister performed instead of her"] },
    apply: { q: 'As used in the passage, what does "trembled" mean?', correct: 'Shook slightly, often from nervousness', wrongs: ['Clapped loudly', 'Moved gracefully', 'Stayed perfectly still'] },
    analyze: { q: 'What can you infer about Sofia?', correct: 'She was very nervous but ultimately brave', wrongs: ['She felt completely calm the whole time', 'She did not care about the performance', "Her sister was not supportive"] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show how courage and support can help someone overcome fear', wrongs: ['To teach readers how to play the violin', 'To criticize young performers', 'To describe the history of recitals'] },
    create: { q: 'Which title best fits this passage?', correct: "Sofia's Standing Ovation", wrongs: ['Quitting the Violin', 'A Boring Recital', 'Six Months of Silence'] }
  },
  {
    passage: "The vacant lot on Maple Street had been full of weeds and trash for years until neighbors decided to transform it into a community garden. Volunteers of all ages showed up on weekends to clear debris, build raised beds, and plant vegetables. By midsummer, the garden was producing tomatoes, peppers, and herbs that neighbors shared freely with one another. What was once an eyesore had become the friendliest spot in the neighborhood.",
    remember: { q: 'What three things did the garden eventually produce?', correct: 'Tomatoes, peppers, and herbs', wrongs: ['Corn, wheat, and rice', 'Apples, oranges, and lemons', 'Flowers, grass, and weeds'] },
    understand: { q: 'What is the main idea of this passage?', correct: 'Neighbors transformed a neglected lot into a thriving, shared community space', wrongs: ['The lot remained full of trash', 'Neighbors argued constantly about the garden', 'The garden failed to grow anything'] },
    apply: { q: 'As used in the passage, what does "debris" mean?', correct: 'Scattered trash or leftover waste material', wrongs: ['Fresh vegetables', 'Gardening tools', 'Flower seeds'] },
    analyze: { q: 'What can you infer about the neighbors?', correct: 'They valued cooperation and improving their shared community', wrongs: ['They preferred to keep the lot empty', 'They did not get along with each other', 'The garden was built by professional landscapers only'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show how community effort can turn a neglected space into something valuable', wrongs: ['To provide instructions on growing tomatoes', 'To criticize neighborhoods with vacant lots', 'To explain how to build raised garden beds'] },
    create: { q: 'Which title best fits this passage?', correct: 'From Weeds to a Community Garden', wrongs: ['The Empty Lot on Maple Street', 'Neighbors Who Never Met', 'A Guide to Weed Removal'] }
  },
  {
    passage: "When Marcus joined his school's coding club, he had never written a line of code before. He struggled through his first few projects, often staying after school for extra help from his teacher. By the end of the year, Marcus had built a simple video game that his classmates could play on the school's computers. He proudly demonstrated it at the school's tech fair, where younger students lined up to try it.",
    remember: { q: 'What did Marcus build by the end of the year?', correct: 'A simple video game', wrongs: ['A robot', 'A website for his school', 'A mobile app for parents'] },
    understand: { q: 'What is the main idea of this passage?', correct: 'Marcus grew from a coding beginner into someone who created something classmates enjoyed', wrongs: ['Marcus quit the coding club early', 'Marcus already knew how to code before joining', 'Nobody was interested in trying his game'] },
    apply: { q: 'As used in the passage, what does "demonstrated" mean?', correct: 'Showed how something works', wrongs: ['Hid from view', 'Sold for money', 'Deleted completely'] },
    analyze: { q: 'What can you infer about Marcus?', correct: 'He was persistent and willing to ask for help when he struggled', wrongs: ['He gave up whenever something got difficult', 'He preferred working alone with no help', 'He was already an expert programmer'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show how practice and persistence can lead to a rewarding achievement', wrongs: ['To provide step-by-step coding instructions', 'To argue that coding clubs are a waste of time', 'To compare Marcus to professional programmers'] },
    create: { q: 'Which title best fits this passage?', correct: 'From Beginner to Game Designer', wrongs: ['Marcus Quits Coding', 'The Worst Tech Fair Ever', 'A History of Video Games'] }
  },
  {
    passage: "When the Ramirez family adopted Buddy from the shelter, he was terrified of loud noises and refused to leave his crate for the first week. Patiently, the family sat near him every day, speaking softly and offering treats until he began to trust them. Six months later, Buddy greets visitors at the door with a wagging tail and has even learned to fetch the newspaper. The shelter now uses his story to encourage other families to consider adopting older, anxious dogs.",
    remember: { q: 'How long did it take before Buddy would leave his crate?', correct: 'About a week', wrongs: ['One day', 'Several months', 'He never left the crate'] },
    understand: { q: 'What is the main idea of this passage?', correct: 'Patience and kindness helped a frightened rescue dog become a confident, trusting pet', wrongs: ['Buddy remained frightened of the family forever', 'The family returned Buddy to the shelter', 'Buddy was never afraid of anything'] },
    apply: { q: 'As used in the passage, what does "patiently" mean?', correct: 'In a calm way, without rushing or getting frustrated', wrongs: ['Angrily and loudly', 'Very quickly', 'Without any care'] },
    analyze: { q: 'What can you infer about the Ramirez family?', correct: 'They are caring and committed to helping animals in need', wrongs: ['They regretted adopting Buddy', 'They ignored Buddy most of the time', 'They wanted to return Buddy immediately'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To encourage readers to consider adopting anxious or older shelter animals', wrongs: ['To discourage people from adopting rescue dogs', 'To explain how to train a dog to fetch newspapers', 'To describe the history of animal shelters'] },
    create: { q: 'Which title best fits this passage?', correct: "Buddy's Journey to Trust", wrongs: ['A Dog That Never Changed', "The Shelter's Biggest Mistake", 'Why Dogs Fear Loud Noises'] }
  },
  {
    passage: "Priya had always been afraid of public speaking, but she signed up for the school debate team anyway. During her first practice round, her voice shook so much that her teammates could barely hear her. Instead of quitting, she practiced every night in front of her bedroom mirror for weeks. By the regional competition, Priya delivered her argument so confidently that the judges awarded her team first place.",
    remember: { q: 'What team did Priya join despite her fear?', correct: 'The debate team', wrongs: ['The soccer team', 'The chess club', 'The drama club'] },
    understand: { q: 'What is the main idea of this passage?', correct: 'Priya overcame her fear of public speaking through consistent practice', wrongs: ['Priya quit the debate team after one round', 'Priya was naturally gifted and never practiced', "The judges disqualified Priya's team"] },
    apply: { q: 'As used in the passage, what does "confidently" mean?', correct: 'In a self-assured, certain way', wrongs: ['In a nervous, shaky way', 'In a silent way', 'In an angry way'] },
    analyze: { q: 'What can you infer about Priya?', correct: 'She is determined and willing to work hard to improve', wrongs: ['She gave up easily under pressure', 'She never felt nervous about speaking', 'She disliked her teammates'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show that practice can help someone overcome a fear and succeed', wrongs: ['To argue that public speaking is impossible to learn', 'To describe the rules of debate competitions', 'To criticize students who join debate teams'] },
    create: { q: 'Which title best fits this passage?', correct: 'Finding Her Voice', wrongs: ['A Debate Team Disaster', 'Priya Quits Public Speaking', 'The History of Debate'] }
  },
  {
    passage: "The old lighthouse on Gull Point had been dark for twenty years until a group of retired sailors decided to restore it. They spent two summers scraping rust, repairing the lens, and rewiring the light. Many locals doubted the volunteers would ever get the old mechanism working again. On the night they finally switched it on, the beam swept across the harbor, and boats sounded their horns in celebration.",
    remember: { q: 'How long had the lighthouse been dark before the restoration began?', correct: 'Twenty years', wrongs: ['Two years', 'Five years', 'One hundred years'] },
    understand: { q: 'What is the main idea of this passage?', correct: 'A group of dedicated volunteers successfully restored a long-dark lighthouse', wrongs: ['The lighthouse restoration was abandoned halfway through', 'Nobody in the town cared about the lighthouse', 'The lighthouse was torn down instead of repaired'] },
    apply: { q: 'As used in the passage, what does "doubted" mean?', correct: 'Did not believe something would happen', wrongs: ['Strongly believed something would happen', 'Celebrated an achievement', 'Ignored completely'] },
    analyze: { q: 'What can you infer about the retired sailors?', correct: 'They were skilled, patient, and dedicated to finishing the project', wrongs: ['They gave up after the first summer', 'They had no experience with mechanical repairs', 'They disliked the lighthouse'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: "To celebrate a community's successful restoration of a historic landmark", wrongs: ['To explain how lighthouses are built from scratch', 'To argue that old lighthouses should be demolished', 'To criticize the volunteers for taking too long'] },
    create: { q: 'Which title best fits this passage?', correct: 'Light Returns to Gull Point', wrongs: ['The Lighthouse That Stayed Dark', 'A Failed Restoration', 'The History of Sailing'] }
  },
  {
    passage: "Every winter, the Chen family volunteers at a shelter that provides warm meals to people experiencing homelessness. This year, their ten-year-old son Leo suggested they also collect handwritten thank-you cards from customers at their bakery to hand out along with the meals. Many guests at the shelter were moved to tears reading the kind notes. The shelter director asked if the bakery would make the card collection a yearly tradition.",
    remember: { q: 'What did Leo suggest collecting in addition to meals?', correct: 'Handwritten thank-you cards', wrongs: ['Warm blankets', 'Used clothing', 'Canned food'] },
    understand: { q: 'What is the main idea of this passage?', correct: "A simple idea from a child added emotional warmth to a family's charity work", wrongs: ['The shelter refused the cards', 'Leo did not want to help at the shelter', 'The bakery stopped volunteering this year'] },
    apply: { q: 'As used in the passage, what does "moved" mean in this context?', correct: 'Emotionally affected', wrongs: ['Physically relocated', 'Confused', 'Angered'] },
    analyze: { q: 'What can you infer about Leo?', correct: 'He is thoughtful and cares about making others feel appreciated', wrongs: ['He dislikes volunteering with his family', 'He only cares about the bakery business', 'He was forced to help against his will'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: "To show how a small, thoughtful gesture can have a meaningful impact", wrongs: ['To explain how to start a bakery', 'To criticize families who volunteer', 'To describe the history of homeless shelters'] },
    create: { q: 'Which title best fits this passage?', correct: 'Cards That Warmed More Than Hands', wrongs: ['The Bakery That Forgot to Care', "Leo's Worst Idea", 'A History of Winter Shelters'] }
  },
  {
    passage: "Jamal had collected baseball cards since he was six years old, filling binder after binder with his favorite players. When his family faced financial hardship, he decided to sell his rarest card, worth several hundred dollars, to help pay for groceries. His teammates heard about his decision and started a fundraiser instead, refusing to let him give up his prized collection. Touched by their support, Jamal kept the card and thanked his team at the next practice.",
    remember: { q: 'What did Jamal consider selling to help his family?', correct: 'His rarest baseball card', wrongs: ['His bicycle', 'His video game console', 'His shoes'] },
    understand: { q: 'What is the main idea of this passage?', correct: "Jamal's teammates supported him during a hard time instead of letting him sacrifice something he loved", wrongs: ['Jamal sold his entire card collection', 'His teammates ignored his situation', 'Jamal quit the baseball team'] },
    apply: { q: 'As used in the passage, what does "touched" mean in this context?', correct: 'Emotionally moved by kindness', wrongs: ['Physically injured', 'Confused', 'Annoyed'] },
    analyze: { q: "What can you infer about Jamal's teammates?", correct: 'They are generous and care deeply about supporting one another', wrongs: ['They wanted the rare card for themselves', 'They were indifferent to his situation', 'They discouraged him from playing baseball'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To highlight the power of teamwork and generosity during hard times', wrongs: ['To explain how to collect baseball cards', 'To criticize families facing financial hardship', 'To argue that collecting cards is a waste of money'] },
    create: { q: 'Which title best fits this passage?', correct: 'A Team That Had His Back', wrongs: ['Jamal Sells His Collection', 'The Worst Team in Baseball', 'A History of Baseball Cards'] }
  },
  {
    passage: "After a heavy storm knocked down several trees in the neighborhood park, city officials announced there was no budget to replant them. A group of fifth-graders started a lemonade stand every Saturday to raise money for new saplings. Word spread through the neighborhood, and soon local businesses were donating supplies and matching the students' earnings. Within two months, the students had raised enough money to plant twelve new trees.",
    remember: { q: 'How many new trees did the students raise enough money to plant?', correct: 'Twelve', wrongs: ['Two', 'One hundred', 'Twenty-five'] },
    understand: { q: 'What is the main idea of this passage?', correct: "A group of students' fundraising effort helped restore trees to their local park", wrongs: ['The city refused all donations', 'The students gave up after a few weeks', 'No trees were ever replanted'] },
    apply: { q: 'As used in the passage, what does "matching" mean in this context?', correct: 'Contributing an equal amount of money', wrongs: ['Comparing two similar items', 'Painting something the same color', 'Ignoring a request'] },
    analyze: { q: 'What can you infer about the local businesses?', correct: 'They were willing to support a good cause led by young people', wrongs: ['They refused to help the students', 'They were unaware of the fundraiser', 'They only cared about their own profits'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show how a community can come together to solve a local problem', wrongs: ['To argue that cities should never plant trees', 'To explain how lemonade stands are run', 'To criticize students for raising money'] },
    create: { q: 'Which title best fits this passage?', correct: 'Lemonade for a Greener Park', wrongs: ['The Park That Stayed Empty', 'A Storm Nobody Noticed', 'The History of City Budgets'] }
  },
  {
    passage: "Ten years after emigrating from Vietnam, Mr. Nguyen opened a small noodle shop in his new town, using recipes passed down from his grandmother. Business was slow at first, and he worried he had made a mistake. A local food blogger discovered the shop and wrote a glowing review praising the authentic flavors. Within weeks, lines stretched down the block, and Mr. Nguyen was able to hire his first employees.",
    remember: { q: "Whose recipes did Mr. Nguyen use in his noodle shop?", correct: "His grandmother's recipes", wrongs: ["A famous chef's recipes", "His own invented recipes", "His business partner's recipes"] },
    understand: { q: 'What is the main idea of this passage?', correct: "Mr. Nguyen's small business succeeded after a review helped others discover his authentic cooking", wrongs: ['Mr. Nguyen closed his shop after a bad review', 'The noodle shop was successful from day one', 'Mr. Nguyen refused to hire any employees'] },
    apply: { q: 'As used in the passage, what does "authentic" mean in this context?', correct: 'Genuine and true to its origins', wrongs: ['Completely invented', 'Extremely expensive', 'Poorly made'] },
    analyze: { q: 'What can you infer about Mr. Nguyen?', correct: 'He was worried but persistent in pursuing his business despite a slow start', wrongs: ['He gave up on his shop immediately', 'He never doubted his success', 'He disliked cooking'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: "To show how persistence and a bit of luck helped a small business owner succeed", wrongs: ['To provide a recipe for Vietnamese noodles', 'To criticize food bloggers', 'To explain how to immigrate to a new country'] },
    create: { q: 'Which title best fits this passage?', correct: "A Grandmother's Recipe, A New Beginning", wrongs: ['The Noodle Shop That Failed', 'Mr. Nguyen Gives Up', 'A History of Food Blogging'] }
  },
  {
    passage: "During a school camping trip, twelve-year-old Casey got separated from the group while looking for firewood and became lost as the sun began to set. Remembering advice from a scout leader, Casey stayed near a large boulder instead of wandering further and used a whistle to signal for help. After twenty tense minutes, a teacher heard the whistle and followed the sound to find Casey safe. The school later invited a wilderness expert to teach all students the same survival tips.",
    remember: { q: 'What object did Casey use to signal for help?', correct: 'A whistle', wrongs: ['A flashlight', 'A cell phone', 'A flare'] },
    understand: { q: 'What is the main idea of this passage?', correct: "Remembering safety advice helped Casey stay calm and get found after getting lost", wrongs: ['Casey wandered further and was never found', 'The teachers ignored the whistle sound', 'Casey was never actually in danger'] },
    apply: { q: 'As used in the passage, what does "tense" mean in this context?', correct: 'Full of anxious worry', wrongs: ['Relaxed and calm', 'Extremely happy', 'Bored'] },
    analyze: { q: 'What can you infer about Casey?', correct: 'Casey stayed level-headed and used prior knowledge to handle a scary situation', wrongs: ['Casey panicked and made the situation worse', 'Casey had never learned any safety tips', 'Casey was not actually scared at all'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show the value of remembering safety advice in an emergency', wrongs: ['To discourage students from going camping', 'To criticize scout leaders', 'To explain how to build a campfire'] },
    create: { q: 'Which title best fits this passage?', correct: 'The Whistle That Saved the Day', wrongs: ['Lost Forever in the Woods', 'Casey Ignores the Rules', 'A History of Camping Trips'] }
  },
  {
    passage: "When a small earthquake damaged the community center where Mia took weekly art classes, the building was closed for repairs for what officials said could be over a year. Refusing to let the classes stop, Mia's art teacher began holding free sessions in the town park every Saturday, rain or shine. Neighbors donated art supplies, and attendance actually grew as more families discovered the outdoor classes. When the community center finally reopened, many students asked to keep the park sessions going too.",
    remember: { q: 'Where did the art teacher hold classes while the community center was closed?', correct: 'In the town park', wrongs: ['In her own backyard', 'At the local school', 'At the library'] },
    understand: { q: 'What is the main idea of this passage?', correct: "An art teacher's creative solution kept classes going and even grew the community", wrongs: ['The art classes were canceled permanently', 'Nobody wanted to attend the outdoor classes', 'The community center was never repaired'] },
    apply: { q: 'As used in the passage, what does "attendance" mean in this context?', correct: 'The number of people who show up', wrongs: ['The cost of a class', 'A type of art supply', 'A building repair'] },
    analyze: { q: 'What can you infer about the art teacher?', correct: 'She is resourceful and committed to her students even when facing setbacks', wrongs: ['She gave up teaching after the earthquake', 'She only cared about the community center building', 'She discouraged students from attending'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show how flexibility and creativity can turn a setback into an opportunity', wrongs: ['To argue that community centers are unnecessary', 'To explain how earthquakes are measured', 'To criticize families who missed class'] },
    create: { q: 'Which title best fits this passage?', correct: 'Art Class Moves to the Park', wrongs: ['The Community Center Disaster', 'Mia Quits Art Class', 'A History of Earthquakes'] }
  },
  {
    passage: "For years, the Okafor twins argued about which of them was the better chess player, but neither would agree to a real match. Their grandfather finally set up a small tournament table in the living room and invited both to settle it once and for all. The match lasted nearly three hours, ending in a draw that left both twins laughing instead of arguing. They now play a friendly rematch every Sunday afternoon, keeping score in a shared notebook.",
    remember: { q: 'How did the first chess match between the twins end?', correct: 'In a draw', wrongs: ['One twin won decisively', 'It was never finished', 'Their grandfather won instead'] },
    understand: { q: 'What is the main idea of this passage?', correct: "A friendly chess match turned a sibling rivalry into a shared weekly tradition", wrongs: ['The twins refused to ever play chess again', 'The match caused the twins to stop speaking', 'Their grandfather forbade further matches'] },
    apply: { q: 'As used in the passage, what does "settle" mean in this context?', correct: 'To resolve a disagreement', wrongs: ['To physically sit down', 'To move to a new home', 'To ignore a problem'] },
    analyze: { q: 'What can you infer about the Okafor twins?', correct: 'Despite their rivalry, they genuinely enjoy spending time together', wrongs: ['They no longer get along at all', 'They dislike playing games together', 'They never wanted to prove who was better'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show how healthy competition can strengthen a sibling relationship', wrongs: ['To explain the official rules of chess', 'To argue that sibling rivalry is always harmful', 'To criticize their grandfather for intervening'] },
    create: { q: 'Which title best fits this passage?', correct: 'A Draw Worth Celebrating', wrongs: ['The Twins Who Never Played', 'A Chess Match Gone Wrong', 'The History of Chess'] }
  },
  {
    passage: "Twelve-year-old Ines borrowed her father's old camera and spent Saturday mornings photographing birds at the wetland preserve. After weeks of blurry, out-of-focus shots, she finally captured a heron catching a fish in one perfect frame. She entered the photo in the county youth photography contest, and it won first place in the nature category. The local newspaper printed her photo on the front page of the Sunday edition.",
    remember: { q: 'What animal did Ines eventually photograph catching a fish?', correct: 'A heron', wrongs: ['A duck', 'An eagle', 'A pelican'] },
    understand: { q: 'What is the main idea of this passage?', correct: "Ines's persistence with photography paid off when she captured a prize-winning shot", wrongs: ['Ines gave up photography after her blurry photos', 'The newspaper refused to print her photo', 'Ines borrowed a camera but never used it'] },
    apply: { q: 'As used in the passage, what does "captured" mean?', correct: 'Successfully recorded in a photograph', wrongs: ['Chased and caught physically', 'Painted from memory', 'Purchased at a store'] },
    analyze: { q: 'What can you infer about Ines?', correct: 'She is patient and willing to keep practicing despite failure', wrongs: ['She gave up quickly when her photos were blurry', 'She had professional training before this', 'She disliked photographing birds'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show how patience and practice can lead to a rewarding success', wrongs: ['To explain how cameras work', 'To criticize young photographers', 'To describe wetland ecosystems'] },
    create: { q: 'Which title best fits this passage?', correct: 'The Perfect Shot', wrongs: ['Ines Quits Photography', "A Newspaper's Mistake", 'The Blurry Bird'] }
  },
  {
    passage: "While walking home from school, Deshawn and his sister found an injured owl tangled in fishing line near the creek. Instead of touching the bird, they called a wildlife rehabilitation center for advice, just as their science teacher had once taught them. A rehabilitator arrived within the hour, carefully freed the owl, and treated its wing. Three months later, the same rehabilitator invited Deshawn's class to watch the healed owl be released back into the wild.",
    remember: { q: 'What was tangled around the injured owl?', correct: 'Fishing line', wrongs: ['Wire fencing', 'A plastic bag', 'Tree branches'] },
    understand: { q: 'What is the main idea of this passage?', correct: "Knowing the right way to respond helped save an injured owl's life", wrongs: ["Deshawn tried to fix the owl's wing himself", 'The owl could not be saved', 'The class was uninterested in the outcome'] },
    apply: { q: 'As used in the passage, what does "rehabilitator" mean?', correct: 'A person trained to treat and care for injured wild animals', wrongs: ['A person who studies weather', 'A type of veterinarian tool', 'A wildlife photographer'] },
    analyze: { q: 'What can you infer about Deshawn and his sister?', correct: 'They acted responsibly by not touching the bird themselves', wrongs: ['They panicked and made the situation worse', 'They ignored the owl completely', 'They were afraid of getting in trouble'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show the value of knowing how to respond calmly and correctly in an emergency', wrongs: ['To discourage kids from walking near creeks', 'To criticize wildlife rehabilitators', 'To explain how owls hunt'] },
    create: { q: 'Which title best fits this passage?', correct: 'Saving a Silent Hunter', wrongs: ['The Owl That Never Recovered', 'A Walk Home Gone Wrong', 'The History of Owls'] }
  },
  {
    passage: "Every year, Emma dreaded the school spelling bee, convinced she would freeze the moment she stepped up to the microphone. Her older brother, a former spelling bee champion, spent weeks quizzing her with flashcards after dinner. When her turn finally came this year, Emma took a slow breath, pictured the flashcards in her mind, and correctly spelled 'chrysanthemum' to win the school championship. She now helps her brother make flashcards for next year's contestants.",
    remember: { q: 'What word did Emma correctly spell to win the championship?', correct: 'Chrysanthemum', wrongs: ['Onomatopoeia', 'Rhododendron', 'Kaleidoscope'] },
    understand: { q: 'What is the main idea of this passage?', correct: "Preparation and support from her brother helped Emma overcome her fear of the spelling bee", wrongs: ['Emma refused to compete this year', 'Her brother discouraged her from trying', 'Emma lost the spelling bee again'] },
    apply: { q: 'As used in the passage, what does "dreaded" mean?', correct: 'Feared or worried about ahead of time', wrongs: ['Looked forward to eagerly', 'Completely forgot about', 'Enjoyed thoroughly'] },
    analyze: { q: "What can you infer about Emma's brother?", correct: 'He is supportive and invested in her success', wrongs: ['He was jealous of her chance to compete', 'He refused to help her prepare', 'He prepared entirely without her'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show how practice and support can help someone conquer a fear', wrongs: ['To explain the rules of spelling bees', 'To criticize students who get nervous', 'To describe rare flower names'] },
    create: { q: 'Which title best fits this passage?', correct: 'Spelling Her Way to Confidence', wrongs: ['Emma Freezes Again', 'The Brother Who Never Helped', 'A History of Spelling Bees'] }
  },
  {
    passage: "Malik had been terrified of deep water ever since a scary moment at a lake when he was six years old. When his middle school started a swim team, his mother encouraged him to try it, promising he could quit after one practice if he wanted. His coach paired him with a patient assistant who worked with him in the shallow end for weeks before he ever attempted the deep water. By the end of the season, Malik competed in his first freestyle race and finished proudly, though last.",
    remember: { q: 'How old was Malik during the scary moment at the lake?', correct: 'Six years old', wrongs: ['Three years old', 'Ten years old', 'He has never explained the incident'] },
    understand: { q: 'What is the main idea of this passage?', correct: "With patient support, Malik overcame his fear of deep water and joined the swim team", wrongs: ['Malik quit the swim team after one practice', 'Malik was never afraid of water', 'His coach refused to help him'] },
    apply: { q: 'As used in the passage, what does "assistant" mean?', correct: 'A helper who works under the main coach', wrongs: ["The team's fastest swimmer", 'A referee at swim meets', 'A type of swimming stroke'] },
    analyze: { q: 'What can you infer about Malik?', correct: 'He is brave for facing a long-standing fear step by step', wrongs: ['He was never actually scared of water', 'He gave up as soon as things got hard', 'His mother forced him to keep swimming against his will'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show that facing a fear gradually, with support, can lead to real progress', wrongs: ['To argue that swim team is too dangerous for beginners', 'To explain the rules of freestyle swimming', 'To criticize Malik for finishing last'] },
    create: { q: 'Which title best fits this passage?', correct: 'From the Shallow End to the Finish Line', wrongs: ['Malik Quits Before He Starts', 'The Coach Who Gave Up', 'A History of Swim Team'] }
  },
  {
    passage: "Layla rarely spoke up in class, but she joined her library's after-school book club hoping to make new friends. During the first few meetings, she stayed quiet while other kids debated the characters and endings. One afternoon, she finally shared her theory about the book's mysterious ending, and the room went silent before everyone agreed it made perfect sense. Layla has since become one of the club's most active members, always first to raise a hand with a new idea.",
    remember: { q: 'What did Layla finally share with the group?', correct: "Her theory about the book's mysterious ending", wrongs: ['A poem she had written', 'A complaint about the book', 'A recipe for snacks'] },
    understand: { q: 'What is the main idea of this passage?', correct: "Layla grew more confident and outspoken after joining the book club", wrongs: ['Layla quit the book club after one meeting', "Nobody listened to Layla's ideas", 'Layla never spoke during club meetings'] },
    apply: { q: 'As used in the passage, what does "theory" mean?', correct: 'An idea used to explain something', wrongs: ['A rule everyone must follow', 'A type of test', 'A short story'] },
    analyze: { q: 'What can you infer about Layla?', correct: 'She was shy at first but capable of insightful thinking', wrongs: ['She never had anything interesting to say', 'She disliked reading books', 'The other members ignored her completely'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show how a shared interest can help someone build confidence and connect with others', wrongs: ['To explain how to run a book club', 'To criticize quiet students', 'To argue that book clubs are boring'] },
    create: { q: 'Which title best fits this passage?', correct: 'Finding Her Voice in the Book Club', wrongs: ['The Club That Ignored Layla', 'A Silent Member Forever', 'The History of Book Clubs'] }
  },
  {
    passage: "Mr. Diaz's science class spent a month building a weather balloon rig equipped with a small camera and temperature sensor. On launch day, wind gusts nearly canceled the event, but the class decided to proceed after checking updated forecasts. The balloon rose over 90,000 feet before bursting and parachuting the equipment back to a field twelve miles away. When the students recovered the footage, they cheered at the curved edge of the Earth visible in the photos.",
    remember: { q: 'How many feet did the balloon rise before bursting?', correct: 'Over 90,000 feet', wrongs: ['About 9,000 feet', 'Exactly 1,000 feet', 'Over 900,000 feet'] },
    understand: { q: 'What is the main idea of this passage?', correct: "A science class successfully launched a weather balloon that captured stunning images despite a shaky start", wrongs: ['The launch was canceled due to weather', 'The balloon and equipment were never recovered', 'The students lost interest in the project'] },
    apply: { q: 'As used in the passage, what does "proceed" mean?', correct: 'To go ahead with a plan', wrongs: ['To cancel an event entirely', 'To repeat an experiment', 'To clean up equipment'] },
    analyze: { q: 'What can you infer about the students and teacher?', correct: 'They were willing to adapt their plans based on new information', wrongs: ['They ignored the weather forecast completely', 'They refused to launch under any circumstances', 'They gave up on the project after the wind picked up'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show how careful planning and flexibility helped a science project succeed', wrongs: ['To explain exactly how weather balloons are manufactured', 'To argue that school science projects are too risky', 'To criticize the students for launching in windy weather'] },
    create: { q: 'Which title best fits this passage?', correct: 'Chasing the Edge of Space', wrongs: ['The Balloon That Never Launched', 'A Science Project Disaster', 'The History of Weather Forecasting'] }
  },
  {
    passage: "For two years, a group of local teens skated on a cracked, weed-covered lot because their town had no real skate park. They started a petition, attended city council meetings, and organized car washes and bake sales to raise money. A local skate shop owner offered to match whatever the teens raised, dollar for dollar. Eighteen months later, the town celebrated the grand opening of a brand-new skate park designed with input from the very teens who fought for it.",
    remember: { q: 'Who offered to match whatever money the teens raised?', correct: 'A local skate shop owner', wrongs: ['The mayor', 'A skate park company', 'Their school principal'] },
    understand: { q: 'What is the main idea of this passage?', correct: "A group of dedicated teens turned years of advocacy into a real skate park for their town", wrongs: ['The city refused to build a skate park', 'The teens gave up on their petition', 'The skate shop owner refused to help'] },
    apply: { q: 'As used in the passage, what does "match" mean in this context?', correct: 'Contribute an equal amount of money', wrongs: ['Compare two similar things', 'Light something on fire', 'Find an identical pair'] },
    analyze: { q: 'What can you infer about the teens?', correct: 'They were determined and organized in pursuing their goal', wrongs: ['They lost interest after the first year', 'The town never supported the project', 'They expected the park to be built for free'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show how consistent effort and community support can achieve a long-term goal', wrongs: ['To criticize skateboarding as a hobby', 'To explain how city councils are structured', 'To argue that fundraisers rarely succeed'] },
    create: { q: 'Which title best fits this passage?', correct: 'Built by the Skaters Who Fought for It', wrongs: ['The Skate Park That Never Came', 'A Town That Said No', 'The History of Skateboarding'] }
  },
  {
    passage: "When the wall behind the cafeteria stayed covered in peeling paint for years, the art teacher proposed a student-designed mural to brighten the space. Dozens of students submitted sketches, and a panel of teachers and parents chose a design showing hands from every grade level painted together in a rainbow. It took six weekends of painting, with over 40 students contributing brushstrokes at some point. On unveiling day, the principal announced the mural would be featured on the cover of the school yearbook.",
    remember: { q: 'What did the winning mural design show?', correct: 'Hands from every grade level painted together in a rainbow', wrongs: ['A map of the school', 'Portraits of the teachers', 'The school mascot'] },
    understand: { q: 'What is the main idea of this passage?', correct: "A collaborative student mural transformed a neglected wall into a celebrated piece of school pride", wrongs: ['The mural project was cancelled due to lack of interest', 'Only one student worked on the mural', 'The wall remained covered in peeling paint'] },
    apply: { q: 'As used in the passage, what does "unveiling" mean?', correct: 'The act of revealing something for the first time', wrongs: ['The act of painting over something', 'A type of art contest', 'A school field trip'] },
    analyze: { q: 'What can you infer about the school community?', correct: 'They valued students having a voice in shaping their shared spaces', wrongs: ['The teachers designed the mural without student input', 'Students were uninterested in participating', 'The principal disapproved of the finished mural'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show how a collaborative art project can bring a school community together', wrongs: ['To criticize schools for having peeling paint', 'To explain how to mix paint colors', 'To argue that murals are a waste of time'] },
    create: { q: 'Which title best fits this passage?', correct: 'Painting Pride on Every Wall', wrongs: ['The Wall Nobody Fixed', 'A Mural Nobody Liked', 'The History of School Art'] }
  },
  {
    passage: "Kayla joined the marching band as a freshman, but her feet seemed to move opposite of everyone else's during her first formation drills. Her section leader stayed after practice twice a week, walking through the counts with her step by step. By the homecoming halftime show, Kayla's formation transitions were sharp enough that the band director used her as an example for the newer members. She has since become a section leader herself, mentoring freshmen the same way she was once mentored.",
    remember: { q: 'What position did Kayla eventually hold within the band?', correct: 'Section leader', wrongs: ['Drum major', 'Band director', 'Equipment manager'] },
    understand: { q: 'What is the main idea of this passage?', correct: "With mentorship, Kayla progressed from struggling with formations to leading and teaching others", wrongs: ['Kayla quit the band after her rocky start', 'Her section leader refused to help her improve', 'Kayla never learned the marching formations'] },
    apply: { q: 'As used in the passage, what does "formation" mean?', correct: 'An organized arrangement or pattern, like where band members stand', wrongs: ['A type of musical note', 'A band uniform', 'A marching band instrument'] },
    analyze: { q: 'What can you infer about Kayla?', correct: 'She is dedicated to helping others the way she was helped', wrongs: ['She resents her time struggling with formations', 'She avoids working with newer band members', 'She never improved her marching skills'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show how mentorship can help someone grow and then pass that support on to others', wrongs: ['To explain the history of marching bands', 'To criticize band members who struggle at first', 'To argue that marching band is too difficult for beginners'] },
    create: { q: 'Which title best fits this passage?', correct: 'From Struggling Steps to Section Leader', wrongs: ['Kayla Quits the Band', 'The Formation Nobody Could Learn', 'A History of Halftime Shows'] }
  },
  {
    passage: "After noticing how much plastic ended up in the cafeteria trash each day, a group of eighth-graders proposed a full recycling and composting program to the school board. Skeptical administrators worried the program would be too expensive and complicated to maintain. The students designed clearly labeled bins, trained the younger grades during lunch periods, and tracked the results for a semester. By spring, the school had cut its cafeteria trash nearly in half, and the board approved funding to expand the program district-wide.",
    remember: { q: 'By how much did the school cut its cafeteria trash?', correct: 'Nearly in half', wrongs: ['By about ten percent', 'Completely', 'Not at all'] },
    understand: { q: 'What is the main idea of this passage?', correct: "Determined students proved a recycling program could work and convinced the school to expand it", wrongs: ['The school board rejected the recycling program outright', 'The students gave up after administrators expressed doubt', 'The program made no difference in the amount of trash'] },
    apply: { q: 'As used in the passage, what does "skeptical" mean?', correct: 'Doubtful or not easily convinced', wrongs: ['Extremely excited', 'Completely certain', 'Financially generous'] },
    analyze: { q: 'What can you infer about the students?', correct: 'They were persistent and organized in proving their idea would work', wrongs: ['They lost interest once they faced doubt', 'The administrators supported the idea immediately', 'The younger grades refused to participate'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show how student initiative can create lasting change despite early doubt', wrongs: ['To argue that recycling programs never work', 'To explain how composting works chemically', 'To criticize school administrators'] },
    create: { q: 'Which title best fits this passage?', correct: 'Turning Trash Into Change', wrongs: ['The Program That Never Started', 'Students Who Gave Up', 'A History of School Lunches'] }
  },
  {
    passage: "Every Tuesday after school, seventh-grader Owen tutors a third-grader named Milo who struggles with multiplication tables. At first, Milo grew frustrated and wanted to quit within the first ten minutes of each session. Owen started turning the drills into a card game with small prizes, and Milo's attitude slowly shifted from dread to excitement. When Milo aced his multiplication quiz for the first time, he ran straight to find Owen to show him the grade.",
    remember: { q: 'What subject does Milo struggle with?', correct: 'Multiplication tables', wrongs: ['Reading comprehension', 'Spelling', 'Handwriting'] },
    understand: { q: 'What is the main idea of this passage?', correct: "Owen's creative approach to tutoring helped Milo build both skill and confidence in math", wrongs: ['Milo quit tutoring after the first session', 'Owen refused to change his teaching method', 'Milo never improved his multiplication skills'] },
    apply: { q: 'As used in the passage, what does "dread" mean?', correct: 'A feeling of fear or reluctance about something', wrongs: ['A feeling of excitement', 'A math strategy', 'A type of card game'] },
    analyze: { q: 'What can you infer about Owen?', correct: 'He is patient and creative in helping Milo learn', wrongs: ['He gave up tutoring Milo after he got frustrated', 'He was uninterested in Milo\'s progress', 'Milo never wanted to be tutored at all'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show how a patient, creative approach can turn a frustrating subject into something enjoyable', wrongs: ['To criticize students who struggle with math', 'To explain the history of multiplication', 'To argue that tutoring never really helps'] },
    create: { q: 'Which title best fits this passage?', correct: 'Turning Times Tables Into a Game', wrongs: ['Milo Gives Up on Math', 'The Tutor Who Quit', 'A History of Multiplication'] }
  },
  {
    passage: "Ten-year-old Priya had fallen so many times during her first ice skating lessons that she began refusing to go back. Her instructor suggested she focus on just one small goal each week instead of trying to skate perfectly right away. Over several months, Priya mastered gliding, then stopping, and eventually a simple spin she had once thought impossible. At her rink's winter showcase, she landed the spin in front of an audience for the first time and grinned all the way off the ice.",
    remember: { q: 'What move did Priya eventually land in front of an audience?', correct: 'A simple spin', wrongs: ['A double jump', 'A backward flip', 'A group routine'] },
    understand: { q: 'What is the main idea of this passage?', correct: "Breaking her goal into small steps helped Priya build skating skills she once thought were out of reach", wrongs: ['Priya quit ice skating after her early falls', "Priya's instructor refused to help her improve", 'Priya never attempted a spin'] },
    apply: { q: 'As used in the passage, what does "mastered" mean?', correct: 'Became highly skilled at something', wrongs: ['Completely forgot how to do', 'Avoided attempting', 'Watched someone else do'] },
    analyze: { q: 'What can you infer about Priya?', correct: 'She became more confident as she achieved each small goal', wrongs: ['She remained afraid to skate the whole time', "Her instructor discouraged her from trying new moves", 'She skipped straight to advanced moves without practice'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show how breaking a big challenge into smaller goals can build confidence and skill', wrongs: ['To explain the rules of competitive ice skating', 'To criticize beginners who fall while learning', 'To argue that ice skating is too dangerous for kids'] },
    create: { q: 'Which title best fits this passage?', correct: 'One Small Goal at a Time', wrongs: ['Priya Quits the Rink', 'The Spin She Never Landed', 'A History of Ice Skating'] }
  },
  {
    passage: "When Mr. and Mrs. Ahmadi bought their new house, the backyard held nothing but an overgrown, rocky slope. Instead of leveling it, they decided to terrace the hillside and plant a small orchard of apple and pear trees suited to the sloped land. Neighbors said fruit trees would never survive on such poor soil, but the couple added compost every season and pruned carefully each winter. Four years later, they hosted a neighborhood picking day, sharing bushels of apples and pears with everyone who had doubted them.",
    remember: { q: 'What two kinds of fruit trees did the Ahmadis plant?', correct: 'Apple and pear trees', wrongs: ['Peach and plum trees', 'Orange and lemon trees', 'Cherry and apricot trees'] },
    understand: { q: 'What is the main idea of this passage?', correct: "The Ahmadis' patience and care turned a rocky slope into a thriving orchard", wrongs: ['The orchard failed to produce any fruit', 'The Ahmadis gave up on gardening after the first year', 'Neighbors helped plant the orchard from the start'] },
    apply: { q: 'As used in the passage, what does "terrace" mean?', correct: 'To shape land into level, step-like sections for planting', wrongs: ['To completely flatten a piece of land', 'To cover land with concrete', 'To dig a deep hole for water storage'] },
    analyze: { q: 'What can you infer about the Ahmadis?', correct: 'They were patient and willing to prove doubters wrong through steady effort', wrongs: ['They agreed the land was too poor to use', 'They gave up on the orchard after neighbors doubted them', 'They hired others to do all the gardening work'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show how patience and careful effort can turn doubt into success', wrongs: ['To explain how to prune fruit trees correctly', 'To argue that fruit trees cannot grow on hillsides', 'To criticize neighbors for doubting the couple'] },
    create: { q: 'Which title best fits this passage?', correct: 'From Rocky Slope to Orchard', wrongs: ['The Orchard That Never Grew', 'Neighbors Who Were Right', 'A History of Apple Farming'] }
  },
  {
    passage: "Grandma Odessa had been quilting for sixty years, but her granddaughter Willow had always found the hobby boring until she needed a project for a community service requirement. Willow reluctantly agreed to help sew squares for quilts donated to a children's hospital. As she learned each stitch, she began asking her grandmother about the story behind every fabric pattern in the sewing basket. By the end of the summer, Willow had finished three quilts and asked to keep quilting long after her service hours were complete.",
    remember: { q: 'Where were the finished quilts donated?', correct: "A children's hospital", wrongs: ['A homeless shelter', 'An animal shelter', 'A retirement home'] },
    understand: { q: 'What is the main idea of this passage?', correct: "A service requirement introduced Willow to quilting, which became a hobby she truly loved", wrongs: ['Willow refused to finish her community service hours', "Willow's grandmother refused to teach her", 'Willow disliked quilting even after finishing'] },
    apply: { q: 'As used in the passage, what does "reluctantly" mean?', correct: 'In an unwilling or hesitant way', wrongs: ['Enthusiastically and eagerly', 'Quickly and carelessly', 'Angrily and loudly'] },
    analyze: { q: 'What can you infer about Willow?', correct: 'Her interest and appreciation for quilting grew the more she learned about it', wrongs: ['She never grew to enjoy quilting at all', 'Her grandmother was uninterested in teaching her', 'She only cared about finishing her required hours'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show how an unexpected opportunity can turn into a genuine new interest', wrongs: ['To explain the history of quilting techniques', 'To criticize community service requirements', 'To argue that hobbies from grandparents are outdated'] },
    create: { q: 'Which title best fits this passage?', correct: 'Stitching a New Tradition', wrongs: ['Willow Quits Quilting', 'The Quilts Nobody Wanted', 'A History of Hospitals'] }
  },
  {
    passage: "Desmond joined the chess club certain he would lose every match, since most other members had played for years. He spent his afternoons studying opening strategies from library books and replaying famous historic games on a pocket chess set. During his first real tournament, he faced the club's top-ranked player and, after a tense two-hour match, won by a single decisive move. His stunned opponent asked to study with him afterward, and the two now practice together every week.",
    remember: { q: "How long did Desmond's tournament match with the top-ranked player last?", correct: 'About two hours', wrongs: ['Ten minutes', 'All day', 'Desmond forfeited early'] },
    understand: { q: 'What is the main idea of this passage?', correct: "Desmond's dedicated study helped him earn an unexpected victory over the club's best player", wrongs: ['Desmond lost every match as he expected', 'Desmond quit chess club before the tournament', 'His opponent refused to acknowledge the loss'] },
    apply: { q: 'As used in the passage, what does "decisive" mean?', correct: 'Producing a clear, final result', wrongs: ['Confusing and unclear', 'Extremely slow', 'Accidental and unplanned'] },
    analyze: { q: 'What can you infer about Desmond?', correct: "His preparation gave him confidence and skill beyond what others expected", wrongs: ['He won purely by luck with no preparation', 'His opponent let him win on purpose', 'He had played chess competitively for years already'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show how dedicated practice can lead to surprising, well-earned success', wrongs: ['To explain the official rules of chess tournaments', 'To criticize experienced chess players', 'To argue that beginners should not enter tournaments'] },
    create: { q: 'Which title best fits this passage?', correct: "The Underdog's Winning Move", wrongs: ['Desmond Loses Again', 'A Chess Club Disaster', 'The History of Chess Openings'] }
  },
  {
    passage: "Every summer, twelve-year-old Theo watched sailboats glide across the bay from his grandfather's porch, wishing he could sail one himself. This year, his grandfather signed him up for a beginner sailing class at the community dock. Theo capsized the small boat twice in his first week, swallowing more lake water than he expected. By the final week of the course, he could rig the sail, read the wind, and guide the boat back to the dock without any help at all.",
    remember: { q: 'How many times did Theo capsize his boat during the first week?', correct: 'Twice', wrongs: ['Once', 'Five times', 'He never capsized'] },
    understand: { q: 'What is the main idea of this passage?', correct: "Despite early setbacks, Theo learned to sail confidently by the end of the course", wrongs: ['Theo quit the sailing class after capsizing', 'Theo already knew how to sail before the class', 'The class was cancelled due to bad weather'] },
    apply: { q: 'As used in the passage, what does "rig" mean?', correct: "To set up a boat's sail and equipment for use", wrongs: ['To cheat in a competition', 'To repair a broken object', 'To anchor a boat in place'] },
    analyze: { q: 'What can you infer about Theo?', correct: 'He was determined to keep trying even after early failures', wrongs: ['He gave up sailing after his first capsize', "His grandfather discouraged him from continuing", 'He never actually wanted to learn to sail'] },
    evaluate: { q: "What is the author's main purpose in this passage?", correct: 'To show how practice and persistence can turn a beginner into a capable sailor', wrongs: ['To explain the physics of how sailboats move', 'To criticize beginners who capsize their boats', 'To argue that sailing is too dangerous for kids'] },
    create: { q: 'Which title best fits this passage?', correct: 'Learning to Read the Wind', wrongs: ['Theo Sinks for Good', 'The Sailing Class That Failed', 'A History of Sailboats'] }
  }
];

function readingTemplate(key) {
  return { gen: () => {
    const entry = choice(READING_POOL);
    const sub = entry[key];
    const choices = shuffle([sub.correct, ...sub.wrongs]);
    return {
      prompt: `<div class="reading-passage">${entry.passage}</div><div class="reading-question">${sub.q}</div>`,
      type: 'mcq',
      choices,
      correct: sub.correct,
      explanation: sub.correct
    };
  }};
}

const readingTemplates = [
  { bloom: 'Remember', gen: readingTemplate('remember').gen },
  { bloom: 'Understand', gen: readingTemplate('understand').gen },
  { bloom: 'Apply', gen: readingTemplate('apply').gen },
  { bloom: 'Analyze', gen: readingTemplate('analyze').gen },
  { bloom: 'Evaluate', gen: readingTemplate('evaluate').gen },
  { bloom: 'Create', gen: readingTemplate('create').gen }
];

// ---- Figurative Language & Literary Devices ----------------------------------

const DEVICE_CATEGORIES = ['Simile', 'Metaphor', 'Personification', 'Hyperbole', 'Onomatopoeia', 'Idiom'];

const FIGURATIVE_POOL = [
  { sentence: 'Her smile was as bright as the sun.', device: 'Simile' },
  { sentence: 'Time is a thief that steals our years.', device: 'Metaphor' },
  { sentence: 'The wind whispered through the trees.', device: 'Personification' },
  { sentence: "I've told you a million times to clean your room.", device: 'Hyperbole' },
  { sentence: 'The bacon sizzled in the pan.', device: 'Onomatopoeia' },
  { sentence: "It's raining cats and dogs outside.", device: 'Idiom' },
  { sentence: 'He is as brave as a lion.', device: 'Simile' },
  { sentence: 'The classroom was a zoo during the fire drill.', device: 'Metaphor' },
  { sentence: 'The old house groaned in the storm.', device: 'Personification' },
  { sentence: "I'm so hungry I could eat a horse.", device: 'Hyperbole' },
  { sentence: 'The bees buzzed around the flowers.', device: 'Onomatopoeia' },
  { sentence: 'Break a leg at your performance tonight!', device: 'Idiom' },
  { sentence: 'Her voice was like velvet.', device: 'Simile' },
  { sentence: 'The stars danced in the night sky.', device: 'Personification' },
  { sentence: 'My backpack weighs a ton.', device: 'Hyperbole' },
  { sentence: 'The snake slithered silently through the grass.', device: 'Onomatopoeia' },
  { sentence: 'His temper was a volcano ready to erupt.', device: 'Metaphor' },
  { sentence: 'The moon smiled down on the sleeping town.', device: 'Personification' },
  { sentence: 'This suitcase weighs a million pounds.', device: 'Hyperbole' },
  { sentence: 'The clock ticked loudly in the silent room.', device: 'Onomatopoeia' },
  { sentence: "Let's touch base sometime next week.", device: 'Idiom' },
  { sentence: 'The diamond sparkled like a thousand tiny stars.', device: 'Simile' },
  { sentence: 'Life is a rollercoaster full of ups and downs.', device: 'Metaphor' },
  { sentence: 'The leaves danced across the sidewalk in the breeze.', device: 'Personification' },
  { sentence: "I'm going to explode if I eat one more bite.", device: 'Hyperbole' },
  { sentence: 'The balloon popped with a loud bang.', device: 'Onomatopoeia' },
  { sentence: 'You really hit the nail on the head with that idea.', device: 'Idiom' },
  { sentence: 'The runner was as fast as lightning.', device: 'Simile' },
  { sentence: 'The city never sleeps, always buzzing with energy.', device: 'Personification' },
  { sentence: 'The fireworks crackled and popped above the crowd.', device: 'Onomatopoeia' }
];

const DEVICE_WHY = {
  Simile: "it compares two things using 'like' or 'as'",
  Metaphor: 'it directly compares two things without using "like" or "as"',
  Personification: 'it gives human qualities to something non-human',
  Hyperbole: 'it uses extreme exaggeration for effect',
  Onomatopoeia: 'it uses a word that imitates the sound it describes',
  Idiom: 'it is a common expression whose meaning differs from its literal words'
};

const EVALUATE_FIGURATIVE_POOL = [
  { plain: 'My backpack is heavy.', figurative: 'My backpack weighs a ton.', device: 'Hyperbole' },
  { plain: 'The wind blew through the trees.', figurative: 'The wind whispered through the trees.', device: 'Personification' },
  { plain: 'She is brave.', figurative: 'She is as brave as a lion.', device: 'Simile' },
  { plain: 'The classroom was chaotic.', figurative: 'The classroom was a zoo.', device: 'Metaphor' },
  { plain: 'The suitcase is very heavy.', figurative: 'This suitcase weighs a million pounds.', device: 'Hyperbole' },
  { plain: 'The moon shone over the town.', figurative: 'The moon smiled down on the sleeping town.', device: 'Personification' },
  { plain: 'The diamond sparkled brightly.', figurative: 'The diamond sparkled like a thousand tiny stars.', device: 'Simile' },
  { plain: 'His anger was building up.', figurative: 'His temper was a volcano ready to erupt.', device: 'Metaphor' },
  { plain: 'The runner moved quickly.', figurative: 'The runner was as fast as lightning.', device: 'Simile' },
  { plain: 'The city is always busy.', figurative: 'The city never sleeps, always buzzing with energy.', device: 'Personification' },
  { plain: 'Life has many ups and downs.', figurative: 'Life is a rollercoaster full of ups and downs.', device: 'Metaphor' },
  { plain: 'I am extremely hungry.', figurative: "I'm so hungry I could eat a horse.", device: 'Hyperbole' }
];

const CREATE_FIGURATIVE_POOL = [
  { literal: 'The thunder was loud.', device: 'Simile', correct: 'The thunder was as loud as a cannon.', wrongs: ['The thunder roared its anger.', 'The thunder was loud enough to wake the dead.', 'Boom went the thunder.'] },
  { literal: 'The leaves fell from the tree.', device: 'Personification', correct: 'The leaves danced down from the tree.', wrongs: ['The leaves fell like gentle rain.', 'A million leaves fell from the tree.', 'The leaves went swish as they fell.'] },
  { literal: 'The soup was hot.', device: 'Hyperbole', correct: 'The soup was hot enough to melt steel.', wrongs: ['The soup was as hot as the sun.', 'The soup bubbled and hissed.', 'The soup whispered its warmth.'] },
  { literal: 'The wind was strong.', device: 'Personification', correct: 'The wind howled and clawed at the windows.', wrongs: ['The wind was as strong as a freight train.', 'The wind gusted at fifty miles per hour.', 'Whoosh went the wind.'] },
  { literal: 'The baby was crying loudly.', device: 'Hyperbole', correct: 'The baby cried loud enough to wake the entire neighborhood.', wrongs: ['The baby cried like a tiny siren.', 'Waaah went the crying baby.', 'The baby cried for exactly ten minutes.'] },
  { literal: 'The stream flowed over the rocks.', device: 'Onomatopoeia', correct: 'The stream gurgled and babbled over the rocks.', wrongs: ['The stream flowed like a silver ribbon.', 'The stream was a highway for tiny fish.', 'The stream flowed fast enough to fill a lake in an hour.'] },
  { literal: 'The traffic was very slow.', device: 'Hyperbole', correct: 'The traffic was so slow we could have walked there faster than crawling.', wrongs: ['The traffic moved like molasses.', 'The cars honked and rumbled in the jam.', 'The traffic was a parking lot on wheels.'] },
  { literal: 'The old car made a lot of noise.', device: 'Onomatopoeia', correct: 'The old car rattled and clanked down the road.', wrongs: ['The old car was as loud as a marching band.', 'The old car groaned like a tired giant.', 'The old car was a rolling trash can.'] },
  { literal: 'The sun was very hot.', device: 'Simile', correct: 'The sun was as hot as a blazing furnace.', wrongs: ['The sun beat down like a punishment.', 'The sun glared angrily at the beach.', 'The sun was hot enough to fry an egg on the sidewalk in seconds.'] },
  { literal: 'The team was excited after winning.', device: 'Hyperbole', correct: 'The team was so excited they could have flown home without a plane.', wrongs: ['The team celebrated like it was a holiday.', 'The crowd roared and cheered.', 'The team was a wave of pure joy.'] },
  { literal: 'The snow fell quietly all night.', device: 'Personification', correct: 'The snow tiptoed silently across the rooftops all night.', wrongs: ['The snow fell like soft feathers.', 'The snow fell fast enough to bury a car.', 'The snow drifted down with a hush.'] },
  { literal: 'The library was completely silent.', device: 'Simile', correct: 'The library was as silent as a tomb.', wrongs: ['The library was silent enough to hear a pin drop from a mile away.', 'The library seemed to be holding its breath.', 'The pages rustled softly.'] },
  { literal: 'The fireworks were bright and loud.', device: 'Onomatopoeia', correct: 'The fireworks crackled, boomed, and hissed across the sky.', wrongs: ['The fireworks were as bright as a thousand suns.', 'The fireworks painted the sky with light.', 'The fireworks were loud enough to wake the whole city.'] },
  { literal: 'The mountain was very tall.', device: 'Hyperbole', correct: 'The mountain was so tall it scraped the edge of space.', wrongs: ['The mountain stood like a silent giant.', 'The mountain watched over the valley below.', 'Rocks tumbled and clattered down its side.'] },
  { literal: 'The clock in the hallway made noise.', device: 'Onomatopoeia', correct: 'The clock ticked and tocked steadily in the hallway.', wrongs: ['The clock was as steady as a heartbeat.', 'The clock counted every second of the wait.', 'The clock was patient enough to outlast anyone.'] },
  { literal: 'The kitten was very small.', device: 'Simile', correct: 'The kitten was as small as a teacup.', wrongs: ['The kitten pounced like a tiny explorer.', 'The kitten mewed softly in the box.', 'The kitten was small enough to fit in a thimble a thousand times over.'] },
  { literal: 'The fog covered the town in the morning.', device: 'Personification', correct: 'The fog crept quietly over the sleeping town.', wrongs: ['The fog was as thick as soup.', 'The fog rolled in fast enough to swallow the whole coast.', 'The fog hissed softly through the streets.'] },
  { literal: 'The test was very difficult.', device: 'Hyperbole', correct: 'The test was hard enough to stump a genius a thousand times over.', wrongs: ['The test felt like climbing a mountain.', 'The papers rustled as students turned pages.', 'The test glared at us from every desk.'] }
];

const figurativeTemplates = [
  { bloom: 'Remember', gen: () => {
    const facts = [
      { q: "What literary device compares two things using 'like' or 'as'?", correct: 'Simile' },
      { q: 'What literary device directly compares two things without using "like" or "as"?', correct: 'Metaphor' },
      { q: 'What literary device gives human qualities to something non-human?', correct: 'Personification' },
      { q: 'What literary device uses extreme exaggeration for effect?', correct: 'Hyperbole' },
      { q: 'What literary device uses a word that imitates the sound it describes, like "buzz" or "crash"?', correct: 'Onomatopoeia' },
      { q: 'What literary device is a common expression whose overall meaning differs from the literal meaning of its words?', correct: 'Idiom' },
      { q: 'Which device would you use to compare a person\'s courage to a lion using the word "like"?', correct: 'Simile' },
      { q: 'Which device would you use to say "time is money" without using "like" or "as"?', correct: 'Metaphor' },
      { q: 'Which device is at work when a story says "the trees whispered secrets to each other"?', correct: 'Personification' },
      { q: 'Which device is at work when someone says "I could sleep for a year" after a long day?', correct: 'Hyperbole' },
      { q: 'Which device is at work in the word "sizzle" describing bacon in a pan?', correct: 'Onomatopoeia' },
      { q: 'Which device is at work in the phrase "spill the beans," meaning to reveal a secret?', correct: 'Idiom' },
      { q: 'Which device compares a diamond\'s sparkle to "a thousand tiny stars" using the word "like"?', correct: 'Simile' },
      { q: 'Which device describes someone\'s anger as "a volcano ready to erupt," with no "like" or "as"?', correct: 'Metaphor' },
      { q: 'Which device is at work when a story says "the moon smiled down on the town"?', correct: 'Personification' },
      { q: 'Which device is at work when someone says "this bag weighs a million pounds" about a heavy backpack?', correct: 'Hyperbole' },
      { q: 'Which device is at work in the word "crackle" describing fireworks in the sky?', correct: 'Onomatopoeia' },
      { q: 'Which device is at work in the phrase "it\'s raining cats and dogs," meaning it is raining heavily?', correct: 'Idiom' }
    ];
    const f = choice(facts);
    const wrongs = DEVICE_CATEGORIES.filter(d => d !== f.correct);
    const choices = shuffle([f.correct, ...shuffle(wrongs).slice(0, 3)]);
    return { prompt: f.q, type: 'mcq', choices, correct: f.correct, explanation: `${f.correct} matches this definition.` };
  }},
  { bloom: 'Understand', gen: () => {
    const entry = choice(FIGURATIVE_POOL);
    const wrongs = DEVICE_CATEGORIES.filter(d => d !== entry.device);
    const choices = shuffle([entry.device, ...shuffle(wrongs).slice(0, 3)]);
    return {
      prompt: `Which literary device is used in this sentence? "${entry.sentence}"`,
      type: 'mcq',
      choices,
      correct: entry.device,
      explanation: `This sentence uses ${entry.device.toLowerCase()}: ${DEVICE_WHY[entry.device]}.`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const targetDevice = choice(DEVICE_CATEGORIES);
    const matching = FIGURATIVE_POOL.filter(e => e.device === targetDevice);
    const nonMatching = FIGURATIVE_POOL.filter(e => e.device !== targetDevice);
    const correctEntry = choice(matching);
    const wrongEntries = shuffle(nonMatching).slice(0, 3);
    const choices = shuffle([correctEntry.sentence, ...wrongEntries.map(e => e.sentence)]);
    return {
      prompt: `Which of these sentences uses ${targetDevice.toLowerCase()}? Options: ${choices.map((c, i) => `(${i + 1}) "${c}"`).join('  ')}`,
      type: 'mcq',
      choices,
      correct: correctEntry.sentence,
      explanation: `"${correctEntry.sentence}" uses ${targetDevice.toLowerCase()}: ${DEVICE_WHY[targetDevice]}.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const entry = choice(FIGURATIVE_POOL);
    const otherDevices = DEVICE_CATEGORIES.filter(d => d !== entry.device);
    const wrongDevice = choice(otherDevices);
    const correct = `It's actually ${/^[aeiou]/i.test(entry.device) ? 'an' : 'a'} ${entry.device}, because ${DEVICE_WHY[entry.device]}`;
    const remainingDevices = otherDevices.filter(d => d !== wrongDevice);
    const wrongs = shuffle(remainingDevices).slice(0, 3).map(d => `It's actually ${/^[aeiou]/i.test(d) ? 'an' : 'a'} ${d}, because ${DEVICE_WHY[d]}`);
    const choices = shuffle([correct, ...wrongs]);
    return {
      prompt: `A student identified "${entry.sentence}" as ${/^[aeiou]/i.test(wrongDevice) ? 'an' : 'a'} ${wrongDevice}. What is the correct device?`,
      type: 'mcq',
      choices,
      correct,
      explanation: `"${entry.sentence}" is ${/^[aeiou]/i.test(entry.device) ? 'an' : 'a'} ${entry.device}, not ${/^[aeiou]/i.test(wrongDevice) ? 'an' : 'a'} ${wrongDevice}.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const entry = choice(EVALUATE_FIGURATIVE_POOL);
    const others = EVALUATE_FIGURATIVE_POOL.filter(e => e !== entry);
    const otherEntry = choice(others);
    const choices = shuffle([entry.figurative, entry.plain, otherEntry.plain, otherEntry.figurative]);
    return {
      prompt: `Starting from the plain statement "${entry.plain}", which sentence below uses figurative language (${entry.device.toLowerCase()}) to create a more vivid image?`,
      type: 'mcq',
      choices,
      correct: entry.figurative,
      explanation: `"${entry.figurative}" uses ${entry.device.toLowerCase()} to paint a more vivid picture than the plain statement "${entry.plain}"`
    };
  }},
  { bloom: 'Create', gen: () => {
    const entry = choice(CREATE_FIGURATIVE_POOL);
    const choices = shuffle([entry.correct, ...entry.wrongs]);
    return {
      prompt: `Which sentence uses ${/^[aeiou]/i.test(entry.device) ? 'an' : 'a'} ${entry.device.toLowerCase()} to describe "${entry.literal}"?`,
      type: 'mcq',
      choices,
      correct: entry.correct,
      explanation: `"${entry.correct}" uses ${entry.device.toLowerCase()}: ${DEVICE_WHY[entry.device]}.`
    };
  }}
];

// ---- Spelling & Meaning ---------------------------------------------------

// 500+ word/definition pairs, grade 7-8 appropriate: a mix of commonly
// misspelled everyday words and moderately advanced vocabulary-building
// words. Definitions are written in plain language, not copied from any
// dictionary. Split into several arrays purely for manageability; the
// SPELLING_WORD_POOL below merges them into the pool the templates use.

const SPELLING_POOL_COMMON1 = [
  { word: 'accommodate', definition: 'to provide space or lodging for; to adjust to fit a need' },
  { word: 'achieve', definition: 'to succeed in reaching a goal through effort' },
  { word: 'acknowledge', definition: 'to admit that something is true or that someone did something' },
  { word: 'acquire', definition: 'to get or gain possession of something' },
  { word: 'across', definition: 'from one side of something to the other' },
  { word: 'address', definition: 'the details of where someone lives, or to speak directly to someone' },
  { word: 'aggressive', definition: 'ready to attack or act with forceful energy' },
  { word: 'although', definition: 'despite the fact that; even though' },
  { word: 'amateur', definition: 'someone who does an activity for enjoyment, not as a profession' },
  { word: 'apparent', definition: 'clearly seen or understood; obvious' },
  { word: 'appearance', definition: 'the way someone or something looks' },
  { word: 'argument', definition: 'a disagreement, or a set of reasons supporting an idea' },
  { word: 'arithmetic', definition: 'the branch of math dealing with basic operations like addition and multiplication' },
  { word: 'athlete', definition: 'a person who is trained in or good at sports' },
  { word: 'athletic', definition: 'physically strong, active, or good at sports' },
  { word: 'awkward', definition: 'causing embarrassment or lacking grace' },
  { word: 'beautiful', definition: 'pleasing to look at; very attractive' },
  { word: 'because', definition: 'for the reason that' },
  { word: 'beginning', definition: 'the point where something starts' },
  { word: 'believe', definition: 'to accept that something is true' },
  { word: 'beneficial', definition: 'producing good results; helpful' },
  { word: 'business', definition: "a person or group's commercial activity, or a matter one is involved in" },
  { word: 'calendar', definition: 'a chart showing the days, weeks, and months of a year' },
  { word: 'camouflage', definition: 'coloring or a pattern that helps something blend into its surroundings' },
  { word: 'category', definition: 'a group of things that share common features' },
  { word: 'cemetery', definition: 'a place where dead people are buried' },
  { word: 'changeable', definition: 'likely to change often or unpredictably' },
  { word: 'character', definition: "a person in a story, or someone's personal qualities" },
  { word: 'chief', definition: 'the most important or highest-ranking person or thing' },
  { word: 'coming', definition: 'moving toward a place; about to arrive' },
  { word: 'committee', definition: 'a small group chosen to handle a specific task' },
  { word: 'comparative', definition: 'measured or judged by comparing to something else' },
  { word: 'competition', definition: 'an event where people try to win against each other' },
  { word: 'completely', definition: 'in every way; totally' },
  { word: 'conscience', definition: 'an inner sense that tells you right from wrong' },
  { word: 'conscious', definition: 'awake and aware of what is happening' },
  { word: 'consistent', definition: 'always acting or happening in the same way' },
  { word: 'controversy', definition: 'a public disagreement about something people feel strongly about' },
  { word: 'convenient', definition: "easy to use or fitting well with someone's needs" },
  { word: 'correspondence', definition: 'letters or messages exchanged between people' },
  { word: 'courteous', definition: 'polite and considerate toward others' },
  { word: 'curiosity', definition: 'a strong desire to know or learn something' },
  { word: 'deceive', definition: 'to make someone believe something that is not true' },
  { word: 'definitely', definition: 'without any doubt; certainly' },
  { word: 'dependent', definition: 'relying on someone or something else for support' },
  { word: 'describe', definition: 'to give details about what something is like' },
  { word: 'desperate', definition: 'feeling or showing a loss of hope, willing to try anything' },
  { word: 'develop', definition: 'to grow or change into a more advanced state' },
  { word: 'difference', definition: 'the way in which two things are not the same' },
  { word: 'dilemma', definition: 'a situation requiring a difficult choice between options' },
  { word: 'disappear', definition: 'to stop being visible; to vanish' },
  { word: 'disappoint', definition: "to fail to meet someone's hopes or expectations" },
  { word: 'discipline', definition: 'training that produces self-control, or a field of study' },
  { word: 'disastrous', definition: 'causing great damage or having very bad results' },
  { word: 'eighth', definition: 'coming after the seventh in a sequence' },
  { word: 'embarrass', definition: 'to make someone feel awkward or ashamed' },
  { word: 'encouragement', definition: 'support that gives someone confidence or hope' },
  { word: 'entrepreneur', definition: 'a person who starts and runs a business, taking on financial risk' },
  { word: 'environment', definition: 'the natural world or the surrounding conditions in which something exists' },
  { word: 'equipment', definition: 'the tools or items needed for a particular activity' },
  { word: 'especially', definition: 'more than usual; particularly' },
  { word: 'exaggerate', definition: 'to describe something as larger or more extreme than it really is' },
  { word: 'exceed', definition: 'to go beyond a limit or amount' },
  { word: 'excellent', definition: 'extremely good; outstanding' },
  { word: 'exercise', definition: 'physical activity done to stay healthy, or a practice task' },
  { word: 'exhausted', definition: 'extremely tired' },
  { word: 'existence', definition: 'the state of being real or alive' },
  { word: 'experience', definition: 'knowledge or skill gained by doing something, or an event lived through' },
  { word: 'explanation', definition: 'a statement that makes something clear or understandable' },
  { word: 'extremely', definition: 'to a very great degree' },
  { word: 'familiar', definition: 'well known or easily recognized' },
  { word: 'fascinate', definition: "to attract and hold someone's interest strongly" },
  { word: 'february', definition: 'the second month of the year' },
  { word: 'fierce', definition: 'showing strong, intense aggression or energy' },
  { word: 'fiery', definition: 'full of flame or intense emotion' },
  { word: 'finally', definition: 'after a long time; at last' },
  { word: 'foreign', definition: 'coming from or located in a different country' },
  { word: 'forty', definition: 'the number equal to four times ten' },
  { word: 'fourth', definition: 'coming after the third in a sequence' },
  { word: 'friend', definition: 'a person you know well and like' },
  { word: 'fulfill', definition: 'to achieve or complete something, like a promise or a goal' },
  { word: 'gauge', definition: 'to measure or estimate something, or an instrument that measures' },
  { word: 'generally', definition: 'in most cases; usually' },
  { word: 'government', definition: 'the group of people who officially run a country or area' },
  { word: 'grammar', definition: 'the set of rules for how words combine into sentences' },
  { word: 'grateful', definition: 'feeling or showing thanks for something' },
  { word: 'guarantee', definition: 'a firm promise that something will happen or be true' },
  { word: 'guidance', definition: "help or advice given to direct someone's actions" },
  { word: 'harass', definition: 'to repeatedly bother or trouble someone' },
  { word: 'height', definition: 'how tall or high something is' },
  { word: 'humorous', definition: 'causing laughter or amusement' },
  { word: 'hygiene', definition: 'practices that keep a person or place clean and healthy' },
  { word: 'hypocrite', definition: 'a person who claims certain beliefs but acts against them' },
  { word: 'ignorance', definition: 'a lack of knowledge or information' },
  { word: 'illegal', definition: 'not allowed by law' },
  { word: 'imaginary', definition: 'existing only in the mind, not in reality' },
  { word: 'imitate', definition: 'to copy the actions or manner of someone or something' },
  { word: 'immediately', definition: 'right away; without delay' },
  { word: 'immense', definition: 'extremely large in size or degree' },
  { word: 'incidentally', definition: 'by the way; as a minor point' },
  { word: 'independent', definition: 'not relying on others for support or control' },
  { word: 'indispensable', definition: 'absolutely necessary; too important to do without' },
  { word: 'inevitable', definition: 'certain to happen; unable to be avoided' },
  { word: 'influential', definition: 'having a strong effect on people or events' },
  { word: 'initial', definition: 'happening at the beginning; first' },
  { word: 'innocent', definition: 'not guilty of a wrongdoing, or free from harm' },
  { word: 'inoculate', definition: 'to protect against a disease with a vaccine' },
  { word: 'intelligence', definition: 'the ability to learn, understand, and reason well' },
  { word: 'interrupt', definition: 'to stop someone in the middle of speaking or doing something' },
  { word: 'irrelevant', definition: 'not related to the matter at hand' },
  { word: 'irresistible', definition: 'too appealing or strong to be resisted' },
  { word: 'jewelry', definition: 'decorative items worn on the body, like rings or necklaces' }
];

const SPELLING_POOL_COMMON2 = [
  { word: 'judgment', definition: 'the ability to make sensible decisions, or a formal decision' },
  { word: 'knowledge', definition: 'information and understanding gained through learning or experience' },
  { word: 'laboratory', definition: 'a room or building equipped for scientific experiments' },
  { word: 'leisure', definition: 'free time used for rest or enjoyment' },
  { word: 'liaison', definition: 'a person who helps different groups communicate with each other' },
  { word: 'library', definition: 'a place that holds books and other materials for reading or borrowing' },
  { word: 'license', definition: 'official permission to do, own, or use something' },
  { word: 'lightning', definition: 'a bright flash of electricity in the sky during a storm' },
  { word: 'likelihood', definition: 'the chance that something will happen' },
  { word: 'loneliness', definition: 'the feeling of being alone or without company' },
  { word: 'maintenance', definition: 'the work done to keep something in good condition' },
  { word: 'maneuver', definition: 'a planned and careful movement or action' },
  { word: 'marriage', definition: 'the legal union of two people as partners' },
  { word: 'mathematics', definition: 'the study of numbers, quantities, and shapes' },
  { word: 'medicine', definition: 'a substance used to treat illness, or the science of healing' },
  { word: 'millennium', definition: 'a period of one thousand years' },
  { word: 'miniature', definition: 'a very small version of something' },
  { word: 'minuscule', definition: 'extremely small' },
  { word: 'mischievous', definition: 'enjoying playful trouble-making' },
  { word: 'misspell', definition: 'to spell a word incorrectly' },
  { word: 'mysterious', definition: 'difficult to explain or understand' },
  { word: 'naturally', definition: 'in a way that is expected, or without artificial help' },
  { word: 'necessary', definition: 'needed in order for something to happen or be true' },
  { word: 'neighbor', definition: 'a person who lives near another person' },
  { word: 'noticeable', definition: 'easy to see or notice' },
  { word: 'nuisance', definition: 'a person or thing that causes annoyance or trouble' },
  { word: 'obedience', definition: 'the act of following rules or instructions' },
  { word: 'obstacle', definition: 'something that blocks progress or makes a task harder' },
  { word: 'occasion', definition: 'a particular time or event' },
  { word: 'occasionally', definition: 'sometimes, but not often' },
  { word: 'occurred', definition: 'happened, in the past tense' },
  { word: 'occurrence', definition: 'something that happens or takes place' },
  { word: 'official', definition: 'approved by an authority, or a person who holds a position of authority' },
  { word: 'omission', definition: 'something left out or not included' },
  { word: 'opinion', definition: 'a belief or judgment that is not necessarily based on fact' },
  { word: 'opportunity', definition: 'a chance to do something' },
  { word: 'opposite', definition: 'completely different from, or facing the other way' },
  { word: 'ordinary', definition: 'normal or usual; not special' },
  { word: 'original', definition: 'the first of its kind, or newly created rather than copied' },
  { word: 'outrageous', definition: 'shockingly bad, unusual, or unacceptable' },
  { word: 'parallel', definition: 'running alongside something else at an equal distance, never meeting' },
  { word: 'parliament', definition: 'a group of elected officials who make laws for a country' },
  { word: 'particularly', definition: 'especially; more than usual' },
  { word: 'pastime', definition: 'an activity done for enjoyment in one\'s free time' },
  { word: 'peculiar', definition: 'strange or unusual' },
  { word: 'perceive', definition: 'to notice or become aware of something through the senses' },
  { word: 'perform', definition: 'to carry out an action, or to present entertainment to an audience' },
  { word: 'permanent', definition: 'lasting forever or for a very long time' },
  { word: 'perseverance', definition: 'continued effort despite difficulty' },
  { word: 'persuade', definition: 'to convince someone to do or believe something' },
  { word: 'personnel', definition: 'the people who work for an organization' },
  { word: 'physically', definition: 'relating to the body rather than the mind' },
  { word: 'playwright', definition: 'a person who writes plays' },
  { word: 'pleasant', definition: 'enjoyable or agreeable' },
  { word: 'portray', definition: 'to show or represent someone or something, often in art or performance' },
  { word: 'possess', definition: 'to own or have something' },
  { word: 'possession', definition: 'something that is owned, or the state of owning something' },
  { word: 'precede', definition: 'to come before something in time or order' },
  { word: 'preferred', definition: 'liked better than the alternatives' },
  { word: 'prejudice', definition: 'an unfair opinion formed without enough knowledge or reason' },
  { word: 'privilege', definition: 'a special right or advantage given to a person or group' },
  { word: 'probably', definition: 'most likely; almost certainly' },
  { word: 'proceed', definition: 'to continue on with an action or journey' },
  { word: 'professional', definition: 'relating to a paid occupation, or showing skill and seriousness' },
  { word: 'pronunciation', definition: 'the way in which a word is spoken' },
  { word: 'psychology', definition: 'the scientific study of the mind and behavior' },
  { word: 'publicly', definition: 'in a way that is open for anyone to see or know' },
  { word: 'pursue', definition: 'to follow or work toward something with effort' },
  { word: 'questionnaire', definition: 'a written set of questions used to gather information' },
  { word: 'realize', definition: 'to become fully aware of something' },
  { word: 'receive', definition: 'to be given or to get something' },
  { word: 'recognize', definition: 'to identify someone or something already known' },
  { word: 'recommend', definition: 'to suggest that something is good or suitable' },
  { word: 'referred', definition: 'directed someone to a source, or mentioned something' },
  { word: 'rehearse', definition: 'to practice something, like a performance, before doing it for real' },
  { word: 'reign', definition: 'the period during which a ruler holds power' },
  { word: 'relevant', definition: 'closely connected to the matter at hand' },
  { word: 'reminisce', definition: 'to think or talk fondly about past experiences' },
  { word: 'repetition', definition: 'the act of doing or saying something again' },
  { word: 'representative', definition: 'a person chosen to act or speak on behalf of others' },
  { word: 'restaurant', definition: 'a place where meals are prepared and served to customers' },
  { word: 'rhyme', definition: 'words that end with the same sound' },
  { word: 'rhythm', definition: 'a repeated pattern of sound or movement' },
  { word: 'ridiculous', definition: 'deserving to be laughed at; absurd' },
  { word: 'sacrifice', definition: 'to give up something valuable for the sake of something else' },
  { word: 'safety', definition: 'the condition of being protected from danger or harm' },
  { word: 'satellite', definition: 'an object that orbits a planet, natural or human-made' },
  { word: 'schedule', definition: 'a plan of times for events or activities' },
  { word: 'secretary', definition: 'a person who handles records, correspondence, or administrative duties' },
  { word: 'seize', definition: 'to take hold of something quickly and firmly' },
  { word: 'separate', definition: 'to divide or set apart from something else' },
  { word: 'sergeant', definition: 'a military or police rank above a private or officer' },
  { word: 'several', definition: 'more than two but not very many' },
  { word: 'severely', definition: 'in a very serious or intense way' },
  { word: 'similar', definition: 'alike in many ways, though not identical' },
  { word: 'sincerely', definition: 'in an honest and genuine way' },
  { word: 'skiing', definition: 'the sport of gliding over snow on skis' },
  { word: 'soldier', definition: 'a person who serves in an army' },
  { word: 'sophomore', definition: 'a student in the second year of high school or college' },
  { word: 'speech', definition: 'the act of speaking, or a talk given to an audience' },
  { word: 'strength', definition: 'the quality of being physically or mentally powerful' },
  { word: 'subtle', definition: 'so delicate or slight that it is not easy to notice' },
  { word: 'successful', definition: 'having achieved a desired result or goal' },
  { word: 'suddenly', definition: 'happening quickly and without warning' },
  { word: 'supersede', definition: 'to take the place of something, making it outdated' },
  { word: 'surprise', definition: 'an unexpected event or feeling of astonishment' },
  { word: 'surround', definition: 'to be on every side of something' },
  { word: 'suspicious', definition: 'feeling or causing doubt about someone\'s honesty' },
  { word: 'symptom', definition: 'a sign that indicates the presence of an illness or condition' },
  { word: 'technique', definition: 'a particular way of carrying out a task' },
  { word: 'temperature', definition: 'a measure of how hot or cold something is' },
  { word: 'thorough', definition: 'complete and careful, leaving nothing out' },
  { word: 'threshold', definition: 'the point at which something begins to happen, or a doorway' },
  { word: 'tomorrow', definition: 'the day after today' }
];

const SPELLING_POOL_ADVANCED1 = [
  { word: 'ambiguous', definition: 'having more than one possible meaning; unclear' },
  { word: 'meticulous', definition: 'extremely careful and precise about details' },
  { word: 'candid', definition: 'honest and direct, even about difficult topics' },
  { word: 'resilient', definition: 'able to recover quickly from difficulty' },
  { word: 'articulate', definition: 'able to express ideas clearly and effectively' },
  { word: 'benevolent', definition: 'kind and generous toward others' },
  { word: 'cognizant', definition: 'aware of or having knowledge of something' },
  { word: 'diligent', definition: 'showing steady, careful effort in one\'s work' },
  { word: 'eloquent', definition: 'fluent and persuasive in speaking or writing' },
  { word: 'frivolous', definition: 'not serious or sensible; silly' },
  { word: 'gregarious', definition: 'enjoying the company of others; sociable' },
  { word: 'hypothesis', definition: 'an idea proposed as a possible explanation, to be tested' },
  { word: 'immaculate', definition: 'perfectly clean or without any flaws' },
  { word: 'juxtapose', definition: 'to place two things side by side for comparison' },
  { word: 'kinetic', definition: 'relating to or caused by motion' },
  { word: 'lethargic', definition: 'lacking energy; sluggish' },
  { word: 'malleable', definition: 'easily shaped or influenced' },
  { word: 'notorious', definition: 'famous for something bad' },
  { word: 'obsolete', definition: 'no longer used because something newer has replaced it' },
  { word: 'pragmatic', definition: 'dealing with things in a practical, realistic way' },
  { word: 'quaint', definition: 'charmingly old-fashioned or unusual' },
  { word: 'scrutinize', definition: 'to examine something closely and carefully' },
  { word: 'tedious', definition: 'boring because it is long or repetitive' },
  { word: 'ubiquitous', definition: 'seeming to be everywhere at once' },
  { word: 'vindicate', definition: 'to clear someone of blame or suspicion' },
  { word: 'whimsical', definition: 'playfully unusual or fanciful' },
  { word: 'zealous', definition: 'showing great energy and enthusiasm for a cause' },
  { word: 'adept', definition: 'very skilled at something' },
  { word: 'brevity', definition: 'the quality of being short and to the point' },
  { word: 'candor', definition: 'openness and honesty in expressing oneself' },
  { word: 'deference', definition: 'respectful submission to someone\'s wishes or judgment' },
  { word: 'empathy', definition: 'the ability to understand and share another person\'s feelings' },
  { word: 'fortitude', definition: 'strength of mind that allows someone to face hardship' },
  { word: 'gratuitous', definition: 'done without good reason; uncalled for' },
  { word: 'haphazard', definition: 'done without organization or planning' },
  { word: 'impartial', definition: 'treating all sides equally; not favoring one over another' },
  { word: 'jubilant', definition: 'feeling or showing great happiness and triumph' },
  { word: 'lucid', definition: 'clear and easy to understand' },
  { word: 'mundane', definition: 'ordinary and not exciting' },
  { word: 'nostalgic', definition: 'feeling fondly sentimental about the past' },
  { word: 'obscure', definition: 'not well known, or hard to understand' },
  { word: 'plausible', definition: 'seeming reasonable or probable' },
  { word: 'quandary', definition: 'a state of confusion over what to do' },
  { word: 'resolute', definition: 'firmly determined and unwavering' },
  { word: 'sanguine', definition: 'optimistic or positive, especially in a difficult situation' },
  { word: 'tenacious', definition: 'holding firmly to a purpose; not easily giving up' },
  { word: 'unprecedented', definition: 'never having happened or existed before' },
  { word: 'vivacious', definition: 'full of energy and enthusiasm; lively' },
  { word: 'wary', definition: 'cautious about possible danger or problems' },
  { word: 'adversity', definition: 'a difficult or unfortunate situation' },
  { word: 'blatant', definition: 'done openly and obviously, without any attempt to hide it' },
  { word: 'coherent', definition: 'logical and easy to follow' },
  { word: 'discreet', definition: 'careful not to attract attention or reveal private information' },
  { word: 'eccentric', definition: 'unconventional or slightly strange in behavior' },
  { word: 'feasible', definition: 'possible to do easily or practically' },
  { word: 'garrulous', definition: 'talking a great deal, especially about unimportant things' },
  { word: 'hostile', definition: 'unfriendly or showing opposition' },
  { word: 'incessant', definition: 'continuing without stopping' },
  { word: 'jargon', definition: 'special words or phrases used by a particular group or profession' },
  { word: 'knack', definition: 'a natural skill or talent for doing something well' },
  { word: 'lament', definition: 'to express sadness or regret about something' },
  { word: 'meager', definition: 'small in amount; barely enough' },
  { word: 'nonchalant', definition: 'appearing calm and unconcerned' },
  { word: 'opaque', definition: 'not able to be seen through; unclear' },
  { word: 'pensive', definition: 'deeply thoughtful, often with a hint of sadness' },
  { word: 'querulous', definition: 'complaining in a whiny or irritable way' },
  { word: 'ramble', definition: 'to talk or write in a long, disorganized way' },
  { word: 'skeptical', definition: 'having doubts about whether something is true' },
  { word: 'taciturn', definition: 'saying very little; reserved in speech' },
  { word: 'unanimous', definition: 'fully agreed upon by everyone' },
  { word: 'vague', definition: 'not clearly expressed or defined' },
  { word: 'wistful', definition: 'having a feeling of vague longing, often for the past' },
  { word: 'amiable', definition: 'friendly and pleasant' },
  { word: 'boisterous', definition: 'noisy, energetic, and full of high spirits' },
  { word: 'capricious', definition: 'changing mood or behavior suddenly and unpredictably' },
  { word: 'dexterous', definition: 'skillful with one\'s hands or body' },
  { word: 'elusive', definition: 'difficult to find, catch, or achieve' },
  { word: 'futile', definition: 'having no useful result; pointless' },
  { word: 'gullible', definition: 'too easily fooled or tricked' },
  { word: 'hindrance', definition: 'something that gets in the way of progress' },
  { word: 'impetuous', definition: 'acting quickly without thinking of the consequences' },
  { word: 'jeopardy', definition: 'a situation of danger or risk of loss' },
  { word: 'lucrative', definition: 'producing a good amount of money or profit' },
  { word: 'morose', definition: 'gloomy and bad-tempered' },
  { word: 'novice', definition: 'a person who is new to and inexperienced at something' },
  { word: 'ominous', definition: 'giving the impression that something bad is about to happen' },
  { word: 'perplex', definition: 'to confuse or puzzle someone' },
  { word: 'rancid', definition: 'having a bad, spoiled smell or taste' },
  { word: 'staunch', definition: 'firmly loyal and dedicated to a cause or person' },
  { word: 'transient', definition: 'lasting only a short time; temporary' },
  { word: 'unassuming', definition: 'modest and not seeking attention' },
  { word: 'vex', definition: 'to annoy or frustrate someone' },
  { word: 'wane', definition: 'to gradually decrease in size, strength, or importance' },
  { word: 'ardent', definition: 'showing very strong feelings; passionate' },
  { word: 'bemused', definition: 'confused or puzzled, often mildly' },
  { word: 'cynical', definition: 'believing people are mainly motivated by self-interest' },
  { word: 'daunting', definition: 'seeming difficult or intimidating' },
  { word: 'exemplary', definition: 'serving as an excellent example; outstanding' },
  { word: 'fervent', definition: 'having or showing intense, passionate feeling' },
  { word: 'gaunt', definition: 'thin and bony, often from illness or hardship' },
  { word: 'hapless', definition: 'unlucky; unfortunate' },
  { word: 'idle', definition: 'not active or being used; doing nothing' }
];

const SPELLING_POOL_ADVANCED2 = [
  { word: 'abhor', definition: 'to hate something intensely' },
  { word: 'benign', definition: 'gentle and harmless; not threatening' },
  { word: 'chronic', definition: 'continuing for a long time, or happening repeatedly' },
  { word: 'diminish', definition: 'to make or become smaller or less important' },
  { word: 'exorbitant', definition: 'unreasonably high, especially in price' },
  { word: 'flagrant', definition: 'clearly bad or offensive, in an obvious way' },
  { word: 'grievance', definition: 'a complaint about unfair treatment' },
  { word: 'impending', definition: 'about to happen very soon' },
  { word: 'jocular', definition: 'fond of joking; humorous in manner' },
  { word: 'lavish', definition: 'given in generous, extravagant amounts' },
  { word: 'mediocre', definition: 'only average in quality; not very good' },
  { word: 'nebulous', definition: 'unclear, vague, or hard to define' },
  { word: 'obstinate', definition: 'stubbornly refusing to change one\'s mind or approach' },
  { word: 'perfunctory', definition: 'done quickly with little care or interest' },
  { word: 'quirky', definition: 'unusual in a charming or interesting way' },
  { word: 'reticent', definition: 'reluctant to share one\'s thoughts or feelings' },
  { word: 'stoic', definition: 'able to endure hardship without complaining' },
  { word: 'tumultuous', definition: 'full of noise, confusion, or disorder' },
  { word: 'unruly', definition: 'difficult to control or keep in order' },
  { word: 'vicarious', definition: 'felt by imagining another person\'s experience' },
  { word: 'abrupt', definition: 'sudden and unexpected' },
  { word: 'brazen', definition: 'bold and shameless' },
  { word: 'chastise', definition: 'to criticize or punish someone for bad behavior' },
  { word: 'disdain', definition: 'a strong feeling that someone or something is not worth respect' },
  { word: 'enigma', definition: 'something or someone mysterious and hard to understand' },
  { word: 'flourish', definition: 'to grow or develop very successfully' },
  { word: 'gaudy', definition: 'extremely bright or showy in a tasteless way' },
  { word: 'hackneyed', definition: 'overused to the point of being boring or unoriginal' },
  { word: 'jubilee', definition: 'a special anniversary celebration' },
  { word: 'languid', definition: 'lacking energy; slow and relaxed' },
  { word: 'meander', definition: 'to wander slowly without a fixed direction' },
  { word: 'nemesis', definition: 'a long-standing rival or a cause of one\'s downfall' },
  { word: 'oblivious', definition: 'not aware of what is happening nearby' },
  { word: 'paramount', definition: 'more important than anything else' },
  { word: 'quell', definition: 'to put an end to something, often forcefully' },
  { word: 'rapport', definition: 'a close, friendly relationship built on understanding' },
  { word: 'scanty', definition: 'very small in amount; barely sufficient' },
  { word: 'thrive', definition: 'to grow or develop very well' },
  { word: 'unwavering', definition: 'steady and not changing, even under pressure' },
  { word: 'verbose', definition: 'using far more words than necessary' },
  { word: 'whim', definition: 'a sudden desire or idea, often acted on without much thought' },
  { word: 'zenith', definition: 'the highest point of something' },
  { word: 'abstain', definition: 'to choose not to do or take part in something' },
  { word: 'belligerent', definition: 'eager to fight or argue' },
  { word: 'condone', definition: 'to accept or allow behavior that is generally seen as wrong' },
  { word: 'demeanor', definition: 'the way a person behaves or presents themselves to others' },
  { word: 'euphoric', definition: 'feeling extremely happy and excited' },
  { word: 'fickle', definition: 'changing frequently, especially in loyalty or opinion' },
  { word: 'grandiose', definition: 'impressively large, or exaggerated beyond what is reasonable' },
  { word: 'harbor', definition: 'to keep a feeling privately, or a sheltered area for ships' },
  { word: 'impede', definition: 'to slow down or get in the way of progress' },
  { word: 'jaded', definition: 'tired of or unimpressed by something due to too much exposure to it' },
  { word: 'languish', definition: 'to remain in an unpleasant or neglected state for a long time' },
  { word: 'niche', definition: 'a specialized area or role especially suited to someone' },
  { word: 'onerous', definition: 'requiring a lot of effort and difficult to carry out' },
  { word: 'placid', definition: 'calm and peaceful, without much disturbance' },
  { word: 'qualm', definition: 'a small feeling of doubt about whether an action is right' },
  { word: 'robust', definition: 'strong and healthy; able to withstand difficulty' },
  { word: 'solace', definition: 'comfort received during a time of sadness or distress' },
  { word: 'turbulent', definition: 'full of sudden, disorderly change' },
  { word: 'unfeigned', definition: 'genuine and real; not pretended' },
  { word: 'venerable', definition: 'deserving great respect because of age, wisdom, or achievement' },
  { word: 'wry', definition: 'showing dry, slightly mocking humor' },
  { word: 'zest', definition: 'great enthusiasm and energy for doing something' },
  { word: 'adage', definition: 'a short, well-known saying that expresses a general truth' },
  { word: 'banter', definition: 'playful, teasing conversation between people' },
  { word: 'clamor', definition: 'a loud, confused noise, often from shouting voices' },
  { word: 'defiant', definition: 'boldly refusing to obey or follow authority' },
  { word: 'exert', definition: 'to apply effort, force, or influence' },
  { word: 'fathom', definition: 'to fully understand something after careful thought' },
  { word: 'gusto', definition: 'great enthusiasm and enjoyment in doing something' },
  { word: 'hindsight', definition: 'understanding of a situation only after it has already happened' },
  { word: 'inquisitive', definition: 'curious and eager to learn or ask about things' },
  { word: 'jostle', definition: 'to push or bump against someone, especially in a crowd' },
  { word: 'kindle', definition: 'to start a fire, or to stir up a feeling' },
  { word: 'lofty', definition: 'very high, or noble and impressive' },
  { word: 'mettle', definition: 'courage and strength of character in facing challenges' },
  { word: 'nuance', definition: 'a subtle difference in meaning, tone, or feeling' },
  { word: 'odious', definition: 'extremely unpleasant and repulsive' },
  { word: 'petty', definition: 'of little importance, or concerned with unimportant details' },
  { word: 'rebuke', definition: 'to express sharp disapproval toward someone' },
  { word: 'solitude', definition: 'the state of being alone, often by choice' },
  { word: 'tangible', definition: 'able to be touched, or clearly real and definite' },
  { word: 'unravel', definition: 'to undo something tangled, or to figure out something complicated' },
  { word: 'vigilant', definition: 'watchful and alert for possible danger' },
  { word: 'wanton', definition: 'deliberate and without any reasonable cause' },
  { word: 'yearn', definition: 'to have a deep, longing desire for something' },
  { word: 'zealot', definition: 'a person who is extremely and fiercely devoted to a cause' },
  { word: 'amble', definition: 'to walk at a slow, relaxed pace' },
  { word: 'brisk', definition: 'quick and full of energy' },
  { word: 'crestfallen', definition: 'sad and disappointed' },
  { word: 'dubious', definition: 'feeling uncertain or doubtful about something' },
  { word: 'ethereal', definition: 'extremely light and delicate, as if not quite of this world' },
  { word: 'frugal', definition: 'careful and economical about spending money' },
  { word: 'humble', definition: 'not proud or boastful; modest' },
  { word: 'impromptu', definition: 'done without any advance planning' },
  { word: 'keen', definition: 'sharp, eager, or having a strong sense of something' },
  { word: 'latent', definition: 'existing but not yet developed or visible' },
  { word: 'myriad', definition: 'an extremely large, countless number of something' },
  { word: 'placate', definition: 'to make someone less angry by doing something pleasing' },
  { word: 'quibble', definition: 'to argue over small, unimportant details' },
  { word: 'reprieve', definition: 'a delay or cancellation of a punishment or difficulty' },
  { word: 'serene', definition: 'calm, peaceful, and untroubled' },
  { word: 'tactful', definition: 'careful and sensitive when dealing with others' },
  { word: 'unyielding', definition: 'not giving in or changing position' },
  { word: 'vivid', definition: 'producing clear, powerful, lifelike images or impressions' }
];

const SPELLING_POOL_ADVANCED3 = [
  { word: 'abolish', definition: 'to officially end or get rid of a law or practice' },
  { word: 'accessible', definition: 'able to be reached, entered, or used easily' },
  { word: 'accustom', definition: 'to make someone familiar with something through repeated exposure' },
  { word: 'acquaintance', definition: 'a person one knows slightly, but not a close friend' },
  { word: 'adjacent', definition: 'next to or bordering something' },
  { word: 'advantageous', definition: 'providing a benefit or favorable position' },
  { word: 'aesthetic', definition: 'concerned with beauty or artistic appeal' },
  { word: 'allegiance', definition: 'loyalty or commitment to a group, cause, or leader' },
  { word: 'allotment', definition: 'a share or portion given to someone' },
  { word: 'ambivalent', definition: 'having mixed or conflicting feelings about something' },
  { word: 'amiss', definition: 'not quite right; wrong in some way' },
  { word: 'anecdote', definition: 'a short, amusing or interesting story about a real event' },
  { word: 'anonymous', definition: 'not identified by name; of unknown identity' },
  { word: 'apathetic', definition: 'showing little interest, concern, or motivation' },
  { word: 'appease', definition: 'to calm or satisfy someone by giving them what they want' },
  { word: 'arbitrary', definition: 'based on random choice rather than reason or system' },
  { word: 'assess', definition: 'to carefully evaluate or judge the quality of something' },
  { word: 'assiduous', definition: 'showing great care and steady effort' },
  { word: 'attain', definition: 'to succeed in achieving something through effort' },
  { word: 'audible', definition: 'loud enough to be heard' },
  { word: 'authentic', definition: 'genuine and true to its origin' },
  { word: 'auxiliary', definition: 'providing extra support or help to the main thing' },
  { word: 'awry', definition: 'not going as planned; off course' },
  { word: 'baffled', definition: 'completely confused or puzzled' },
  { word: 'banish', definition: 'to send someone away as a punishment, or to get rid of' },
  { word: 'barren', definition: 'unable to produce plants, crops, or offspring' },
  { word: 'beckon', definition: 'to signal someone to come closer with a gesture' },
  { word: 'befuddle', definition: 'to confuse someone thoroughly' },
  { word: 'belittle', definition: 'to make someone or something seem less important than it is' },
  { word: 'bewilder', definition: 'to confuse someone completely' },
  { word: 'bias', definition: 'an unfair tendency to favor one side or idea over another' },
  { word: 'bizarre', definition: 'very strange or unusual' },
  { word: 'bleak', definition: 'lacking hope or cheer; grim' },
  { word: 'bolster', definition: 'to support or strengthen something' },
  { word: 'brittle', definition: 'hard but easily broken' },
  { word: 'bustling', definition: 'full of busy, energetic activity' },
  { word: 'calamity', definition: 'a disastrous event causing great damage or suffering' },
  { word: 'callous', definition: 'showing no concern for the feelings of others' },
  { word: 'catastrophe', definition: 'a sudden event causing great damage or suffering' },
  { word: 'cease', definition: 'to stop happening or doing something' },
  { word: 'circumvent', definition: 'to find a way around an obstacle or rule' },
  { word: 'clarity', definition: 'the quality of being clear and easy to understand' },
  { word: 'coincide', definition: 'to happen at the same time as something else' },
  { word: 'commemorate', definition: 'to honor the memory of a person or event' },
  { word: 'commence', definition: 'to begin' },
  { word: 'commodity', definition: 'a good or product that can be bought or sold' },
  { word: 'compassion', definition: 'sympathy and concern for the suffering of others' },
  { word: 'compatible', definition: 'able to exist or work together without conflict' },
  { word: 'compel', definition: 'to force or strongly urge someone to do something' },
  { word: 'compile', definition: 'to gather information from different sources into one place' },
  { word: 'concede', definition: 'to admit that something is true after first disputing it' },
  { word: 'conform', definition: 'to behave in a way that matches accepted standards' },
  { word: 'congregate', definition: 'to gather together in a group' },
  { word: 'conspicuous', definition: 'easily noticed; standing out' },
  { word: 'contemplate', definition: 'to think about something deeply and carefully' },
  { word: 'contradict', definition: 'to say the opposite of what has been said, showing it is not true' },
  { word: 'converge', definition: 'to come together from different directions toward one point' },
  { word: 'credible', definition: 'able to be believed; trustworthy' },
  { word: 'cumbersome', definition: 'heavy, bulky, or difficult to handle' },
  { word: 'debris', definition: 'scattered pieces of rubbish or wreckage' },
  { word: 'decipher', definition: 'to figure out the meaning of something unclear or coded' },
  { word: 'default', definition: 'a standard option chosen automatically, or a failure to act' },
  { word: 'deficient', definition: 'lacking in some necessary quality or amount' },
  { word: 'delegate', definition: 'to give a task or responsibility to another person' },
  { word: 'demolish', definition: 'to completely destroy a structure' },
  { word: 'deplete', definition: 'to gradually use up a supply of something' },
  { word: 'deprive', definition: 'to take something away from someone' },
  { word: 'devastate', definition: 'to cause severe shock, damage, or distress' },
  { word: 'deviate', definition: 'to depart from an established course or standard' },
  { word: 'devise', definition: 'to plan or invent something through careful thought' },
  { word: 'diagnose', definition: 'to identify the nature of a problem or illness' },
  { word: 'diminutive', definition: 'extremely small in size' },
  { word: 'discord', definition: 'disagreement or conflict between people' },
  { word: 'discrepancy', definition: 'a difference between things that should be the same' },
  { word: 'disgruntled', definition: 'annoyed and dissatisfied' },
  { word: 'disperse', definition: 'to scatter or spread out in different directions' },
  { word: 'distraught', definition: 'extremely upset and worried' },
  { word: 'diverse', definition: 'showing a great deal of variety' },
  { word: 'domineering', definition: 'tending to control others in an overbearing way' },
  { word: 'dormant', definition: 'temporarily inactive, as if sleeping' },
  { word: 'drastic', definition: 'extreme and having a sudden, severe effect' },
  { word: 'dwindle', definition: 'to gradually become smaller or less' },
  { word: 'eerie', definition: 'strange and frightening in an unsettling way' },
  { word: 'elaborate', definition: 'detailed and complicated, or to explain something in more detail' },
  { word: 'embark', definition: 'to begin a journey or new undertaking' },
  { word: 'emerge', definition: 'to come out from somewhere or come into view' },
  { word: 'eminent', definition: 'famous and respected in a particular field' },
  { word: 'encompass', definition: 'to include or contain a wide range of things' },
  { word: 'endeavor', definition: 'to try hard to achieve something, or a serious attempt' },
  { word: 'enhance', definition: 'to improve the quality or value of something' },
  { word: 'entice', definition: 'to attract someone by offering something appealing' },
  { word: 'envision', definition: 'to imagine a future possibility' },
  { word: 'erode', definition: 'to gradually wear away over time' },
  { word: 'erratic', definition: 'not consistent or predictable in behavior' },
  { word: 'evade', definition: 'to escape or avoid something skillfully' },
  { word: 'evoke', definition: 'to bring a feeling or memory to mind' },
  { word: 'exemplify', definition: 'to be a typical example of something' },
  { word: 'exhilarate', definition: 'to make someone feel very excited and happy' },
  { word: 'exodus', definition: 'a mass departure of people from a place' },
  { word: 'expedite', definition: 'to make a process happen more quickly' },
  { word: 'exploit', definition: 'to use something to one\'s own advantage, sometimes unfairly' },
  { word: 'extol', definition: 'to praise something enthusiastically' },
  { word: 'facilitate', definition: 'to make an action or process easier' },
  { word: 'falter', definition: 'to lose strength or momentum; to hesitate' },
  { word: 'fastidious', definition: 'very attentive to detail and hard to please' },
  { word: 'fathomable', definition: 'able to be understood or figured out' },
  { word: 'feign', definition: 'to pretend to feel or be something' },
  { word: 'fluctuate', definition: 'to rise and fall irregularly in amount or level' },
  { word: 'foreboding', definition: 'a feeling that something bad is about to happen' },
  { word: 'formidable', definition: 'inspiring fear or respect through great strength or skill' },
  { word: 'fortuitous', definition: 'happening by a lucky chance' },
  { word: 'fraudulent', definition: 'done to deceive; dishonest' },
  { word: 'gape', definition: 'to stare with one\'s mouth open in surprise' },
  { word: 'genuine', definition: 'real and authentic; not fake' },
  { word: 'glean', definition: 'to gather information slowly and in small amounts' },
  { word: 'grim', definition: 'serious, gloomy, or forbidding in appearance' },
  { word: 'grueling', definition: 'extremely tiring and demanding' },
  { word: 'gullet', definition: 'the passage in the throat used for swallowing' },
  { word: 'hamper', definition: 'to hinder or slow the progress of something' },
  { word: 'harrowing', definition: 'extremely disturbing or distressing' },
  { word: 'hasty', definition: 'done quickly, sometimes too quickly to be careful' },
  { word: 'haven', definition: 'a place of safety or refuge' },
  { word: 'hazardous', definition: 'risky or dangerous' },
  { word: 'heed', definition: 'to pay close attention to advice or a warning' },
  { word: 'heighten', definition: 'to increase in intensity or degree' },
  { word: 'hoax', definition: 'a trick meant to deceive people into believing something false' },
  { word: 'hover', definition: 'to remain suspended in the air near one place' },
  { word: 'humid', definition: 'containing a high amount of moisture in the air' },
  { word: 'illuminate', definition: 'to light something up, or to make something clear' },
  { word: 'illustrate', definition: 'to explain or make clear using examples or pictures' },
  { word: 'immerse', definition: 'to involve oneself deeply in an activity' },
  { word: 'impeccable', definition: 'flawless; in perfect condition' },
  { word: 'implement', definition: 'to put a plan or decision into effect' },
  { word: 'implore', definition: 'to beg someone earnestly to do something' },
  { word: 'inadvertent', definition: 'not done on purpose; accidental' },
  { word: 'incentive', definition: 'something that motivates a person to do something' },
  { word: 'incite', definition: 'to encourage or stir up a strong reaction' },
  { word: 'inclination', definition: 'a natural tendency or preference toward something' }
];

const MISSPELLING_ERROR_TYPES = [
  'They swapped two adjacent letters',
  'They doubled a letter that should not be doubled',
  'They dropped one letter from a doubled pair',
  'They mixed up a commonly confused letter pattern, like "ie" and "ei"',
  'They dropped a silent letter',
  'They added extra letters that do not belong'
];

function transposeMutation(word) {
  if (word.length < 3) return null;
  const indices = [];
  for (let i = 0; i < word.length - 1; i++) {
    if (word[i] !== word[i + 1]) indices.push(i);
  }
  if (!indices.length) return null;
  const i = choice(indices);
  const chars = word.split('');
  const tmp = chars[i]; chars[i] = chars[i + 1]; chars[i + 1] = tmp;
  return { misspelling: chars.join(''), errorType: MISSPELLING_ERROR_TYPES[0] };
}

function doubleConsonantMutation(word) {
  const vowels = 'aeiou';
  const candidates = [];
  for (let i = 0; i < word.length; i++) {
    const c = word[i].toLowerCase();
    if (!vowels.includes(c) && c !== 'y' && word[i - 1] !== word[i] && word[i + 1] !== word[i]) {
      candidates.push(i);
    }
  }
  if (!candidates.length) return null;
  const i = choice(candidates);
  const misspelling = word.slice(0, i + 1) + word[i] + word.slice(i + 1);
  return { misspelling, errorType: MISSPELLING_ERROR_TYPES[1] };
}

function removeDoubledMutation(word) {
  const candidates = [];
  for (let i = 0; i < word.length - 1; i++) {
    if (word[i] === word[i + 1]) candidates.push(i);
  }
  if (!candidates.length) return null;
  const i = choice(candidates);
  const misspelling = word.slice(0, i) + word.slice(i + 1);
  return { misspelling, errorType: MISSPELLING_ERROR_TYPES[2] };
}

function phoneticSwapMutation(word) {
  const swaps = [['ie', 'ei'], ['ei', 'ie'], ['able', 'ible'], ['ible', 'able'], ['ance', 'ence'], ['ence', 'ance'], ['ant', 'ent'], ['ent', 'ant'], ['ceed', 'cede'], ['cede', 'ceed']];
  const lower = word.toLowerCase();
  const candidates = swaps.filter(([a]) => lower.includes(a));
  if (!candidates.length) return null;
  const [a, b] = choice(candidates);
  const idx = lower.indexOf(a);
  const misspelling = word.slice(0, idx) + b + word.slice(idx + a.length);
  return { misspelling, errorType: MISSPELLING_ERROR_TYPES[3] };
}

function silentLetterMutation(word) {
  const lower = word.toLowerCase();
  if (/mb$/.test(lower)) return { misspelling: word.slice(0, -1), errorType: MISSPELLING_ERROR_TYPES[4] };
  if (/^kn/.test(lower)) return { misspelling: word.slice(1), errorType: MISSPELLING_ERROR_TYPES[4] };
  if (/^wr/.test(lower)) return { misspelling: word.slice(1), errorType: MISSPELLING_ERROR_TYPES[4] };
  if (/gh/.test(lower)) return { misspelling: word.replace(/gh/i, ''), errorType: MISSPELLING_ERROR_TYPES[4] };
  if (/e$/.test(lower) && word.length > 3) return { misspelling: word.slice(0, -1), errorType: MISSPELLING_ERROR_TYPES[4] };
  return null;
}

// Generates 3 distinct, plausible misspellings of `word`, each tagged with the
// mutation type used. Tries the pattern-based mutators first (transposition,
// wrongly-doubled consonant, dropped doubled letter, phonetic mix-up, dropped
// silent letter); falls back to a simple, guaranteed-unique suffix mutation if
// a short/unusual word doesn't yield 3 from the pattern mutators.
function generateMisspellings(word) {
  const lower = word.toLowerCase();
  const mutators = [transposeMutation, doubleConsonantMutation, removeDoubledMutation, phoneticSwapMutation, silentLetterMutation];
  const results = [];
  const seen = new Set([lower]);
  let guard = 0;
  while (results.length < 3 && guard < 80) {
    guard++;
    const r = choice(mutators)(word);
    if (!r) continue;
    const key = r.misspelling.toLowerCase();
    if (!key || key === lower || seen.has(key) || !/^[a-z]+$/i.test(r.misspelling)) continue;
    seen.add(key);
    results.push(r);
  }
  let extra = 0;
  while (results.length < 3) {
    extra++;
    const misspelling = word + 'e'.repeat(extra);
    const key = misspelling.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      results.push({ misspelling, errorType: MISSPELLING_ERROR_TYPES[5] });
    }
  }
  return results;
}

const SPELLING_WORD_POOL = [].concat(
  SPELLING_POOL_COMMON1,
  SPELLING_POOL_COMMON2,
  SPELLING_POOL_ADVANCED1,
  SPELLING_POOL_ADVANCED2,
  SPELLING_POOL_ADVANCED3
);

const spellingMeaningTemplates = [
  { bloom: 'Remember', gen: () => {
    const entry = choice(SPELLING_WORD_POOL);
    const misspellings = generateMisspellings(entry.word);
    const choices = shuffle([entry.word, ...misspellings.map(m => m.misspelling)]);
    return {
      prompt: `Which is the correct spelling of the word that means: "${entry.definition}"?`,
      type: 'mcq',
      choices,
      correct: entry.word,
      explanation: `"${entry.word}" is the correct spelling. It means: ${entry.definition}.`
    };
  }},
  { bloom: 'Understand', gen: () => {
    const entry = choice(SPELLING_WORD_POOL);
    const choices = buildChoices(entry.definition, () => choice(SPELLING_WORD_POOL).definition);
    return {
      prompt: `What does the word "${entry.word}" mean?`,
      type: 'mcq',
      choices,
      correct: entry.definition,
      explanation: `"${entry.word}" means: ${entry.definition}.`
    };
  }},
  { bloom: 'Apply', gen: () => {
    const entry = choice(SPELLING_WORD_POOL);
    const choices = buildChoices(entry.word, () => choice(SPELLING_WORD_POOL).word);
    return {
      prompt: `Which word means: "${entry.definition}"?`,
      type: 'mcq',
      choices,
      correct: entry.word,
      explanation: `"${entry.word}" means: ${entry.definition}.`
    };
  }},
  { bloom: 'Analyze', gen: () => {
    const entry = choice(SPELLING_WORD_POOL);
    const ms = choice(generateMisspellings(entry.word));
    const usedWords = new Set([entry.word.toLowerCase(), ms.misspelling.toLowerCase()]);
    const others = [];
    let guard = 0;
    while (others.length < 3 && guard < 200) {
      guard++;
      const cand = choice(SPELLING_WORD_POOL);
      const key = cand.word.toLowerCase();
      if (!usedWords.has(key)) { usedWords.add(key); others.push(cand.word); }
    }
    const list = shuffle([ms.misspelling, ...others]);
    return {
      prompt: `Which of these words is misspelled: ${list.join(', ')}?`,
      type: 'mcq',
      choices: list,
      correct: ms.misspelling,
      explanation: `"${ms.misspelling}" is a misspelling of "${entry.word}." ${ms.errorType}.`
    };
  }},
  { bloom: 'Evaluate', gen: () => {
    const entry = choice(SPELLING_WORD_POOL);
    const ms = choice(generateMisspellings(entry.word));
    const wrongs = shuffle(MISSPELLING_ERROR_TYPES.filter(t => t !== ms.errorType)).slice(0, 3);
    const choices = shuffle([ms.errorType, ...wrongs]);
    return {
      prompt: `A student spells "${entry.word}" as "${ms.misspelling}." What is the mistake?`,
      type: 'mcq',
      choices,
      correct: ms.errorType,
      explanation: `The correct spelling is "${entry.word}." ${ms.errorType}.`
    };
  }},
  { bloom: 'Create', gen: () => {
    const entry = choice(SPELLING_WORD_POOL);
    const ms = choice(generateMisspellings(entry.word));
    const usedWords = new Set([entry.word.toLowerCase(), ms.misspelling.toLowerCase()]);
    const others = [];
    let guard = 0;
    while (others.length < 2 && guard < 200) {
      guard++;
      const cand = choice(SPELLING_WORD_POOL);
      const key = cand.word.toLowerCase();
      if (!usedWords.has(key)) { usedWords.add(key); others.push(cand.word); }
    }
    const choices = shuffle([entry.word, ms.misspelling, ...others]);
    return {
      prompt: `Which correctly-spelled word means: "${entry.definition}"?`,
      type: 'mcq',
      choices,
      correct: entry.word,
      explanation: `"${entry.word}" is spelled correctly and means: ${entry.definition}. "${ms.misspelling}" is a common misspelling of it.`
    };
  }}
];

const ENGLISH_TOPICS = [
  defineTopic('parts-of-speech', 'Parts of Speech', '🔤', partsOfSpeechTemplates),
  defineTopic('sentence-structure', 'Sentence Structure', '📝', sentenceStructureTemplates),
  defineTopic('punctuation', 'Punctuation & Capitalization', '❓', punctuationTemplates),
  defineTopic('vocabulary', 'Vocabulary & Word Roots', '📚', vocabularyTemplates, 1000),
  defineTopic('reading', 'Reading Comprehension', '📖', readingTemplates),
  defineTopic('figurative', 'Figurative Language', '🎭', figurativeTemplates),
  defineTopic('spelling-meaning', 'Spelling & Meaning', '🔠', spellingMeaningTemplates)
];
