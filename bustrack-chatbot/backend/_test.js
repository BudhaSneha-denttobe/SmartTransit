const q = require('./gtfs/query');
const tests = [
  // ── greetings ──
  'hi',
  'Hello',
  'good morning',
  'hey',
  'greetings',

  // ── I am at X ... to Y ──
  'I am right here at benz circle I want to go to vijayawada bus stand',
  "i'm near guntur i need to go to vijayawada",
  'I am right here at benz circle I want to go to vijayawada bus stand what are buses I can get',
  "i'm near guntur, need to go to vijayawada bus stand",

  // ── I want to go from X to Y ──
  'i want to go from machilipatnam to vijayawada',
  'i need to go from guntur to vijayawada bus stand',
  'i want to go from machilipatnam to vijayawada what buses are available',

  // ── how to go from X to Y ──
  'how to go from benz circle to vijayawada',
  'how can i go from guntur to vijayawada bus stand',

  // ── buses from X to Y ──
  'buses from benz circle to vijayawada',
  'tell me buses from benz circle to vijayawada',

  // ── from X to Y (anywhere) ──
  'from guntur to vijayawada',
  'going from benz circle to vijayawada',
  'can i get a bus from benz circle to vijayawada',
  'what are buses I can get from benz circle to vijayawada',

  // ── simple X to Y ──
  'benz circle to vijayawada',

  // ── other intents ──
  'next bus from KR Market',
];
tests.forEach(t => {
  const r = q.detectIntent(t);
  console.log(JSON.stringify(t) + ' -> ' + JSON.stringify(r));
});
