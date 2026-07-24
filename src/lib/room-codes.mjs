const ROOM_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MEMORABLE_PREFIX = "ZZ";

// These arrays are part of the room-code format. Add to the end only; reordering
// entries would change the meaning of active memorable room names.
export const ROOM_ADJECTIVES = Object.freeze([
  "angry", "artsy", "awful", "bald", "coy", "big", "bitter", "bold",
  "bouncy", "brave", "brisk", "bubbly", "calm", "chatty", "cheeky", "chill",
  "chunky", "classy", "clever", "cosmic", "cranky", "crisp", "curly", "daffy",
  "dizzy", "dopey", "dorky", "dreamy", "eager", "fancy", "fast", "fierce",
  "flaky", "flashy", "fluffy", "foamy", "funky", "fuzzy", "goofy", "happy",
  "hasty", "hazy", "hefty", "hip", "itchy", "jazzy", "jolly", "jumpy",
  "kind", "lanky", "lazy", "loud", "lucky", "loopy", "mad", "mellow",
  "merry", "mighty", "moody", "muddy", "nerdy", "nifty", "noisy", "odd",
  "peppy", "perky", "picky", "pink", "plush", "plucky", "poky", "proud",
  "quick", "quiet", "ready", "rowdy", "salty", "sassy", "scary", "shaggy",
  "shiny", "silly", "simple", "sleepy", "slick", "slimy", "sneaky", "snappy",
  "snazzy", "speedy", "spicy", "spiffy", "spooky", "spotty", "sunny", "sweet",
  "tacky", "tiny", "tipsy", "toothy", "tricky", "twisty", "vivid", "wacky",
  "weird", "wild", "witty", "wonky", "zany", "zesty", "blue", "breezy",
  "bright", "cooky", "creaky", "cute", "fussy", "glossy", "grumpy", "whizzy",
  "jaunty", "nutty", "pudgy", "rusty", "smug", "soft", "stormy", "yappy",
]);

export const ROOM_NOUNS = Object.freeze([
  "ant", "ape", "badger", "bat", "bear", "bee", "beetle", "bird",
  "boar", "bug", "bunny", "camel", "cat", "cobra", "crab", "crow",
  "dingo", "dog", "donkey", "dove", "duck", "eagle", "eel", "emu",
  "ferret", "finch", "fly", "fox", "frog", "gecko", "goat", "goose",
  "hare", "hippo", "horse", "hyena", "ibis", "jay", "koala", "lemur",
  "lion", "llama", "lynx", "mole", "moose", "moth", "mouse", "mule",
  "newt", "otter", "owl", "panda", "pig", "pony", "pug", "quail",
  "raven", "seal", "shark", "sheep", "skunk", "sloth", "snail", "snake",
  "spider", "squid", "stoat", "stork", "swan", "tick", "tiger", "toad",
  "trout", "turkey", "turtle", "viper", "wasp", "whale", "wolf", "wombat",
  "yak", "zebra", "bacon", "bagel", "banjo", "bean", "boot", "bread",
  "brick", "broom", "cake", "chip", "clown", "donut", "drum", "flute",
  "fork", "ghost", "grape", "jelly", "kiwi", "mango", "melon", "nacho",
  "nugget", "peach", "pickle", "pizza", "robot", "sock", "spoon", "taco",
  "toast", "waffle", "wizard", "yodel", "blob", "bucket", "cactus", "cheese",
  "goblin", "muffin", "noodle", "pants", "peanut", "potato", "turnip", "walrus",
]);

function encodeBase32(value, length) {
  let remaining = value;
  let encoded = "";

  for (let index = 0; index < length; index += 1) {
    encoded = ROOM_CHARACTERS[remaining % ROOM_CHARACTERS.length] + encoded;
    remaining = Math.floor(remaining / ROOM_CHARACTERS.length);
  }

  return encoded;
}

function decodeBase32(value) {
  let decoded = 0;

  for (const character of value) {
    const index = ROOM_CHARACTERS.indexOf(character);

    if (index < 0) {
      return null;
    }

    decoded = decoded * ROOM_CHARACTERS.length + index;
  }

  return decoded;
}

function checksumFor(index) {
  return ROOM_CHARACTERS[(index * 17 + 11) % ROOM_CHARACTERS.length];
}

function canonicalLegacyCode(value) {
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (
    clean.length !== 6 ||
    [...clean].some((character) => !ROOM_CHARACTERS.includes(character))
  ) {
    return null;
  }

  return `${clean.slice(0, 3)}-${clean.slice(3)}`;
}

export function encodeRoomName(adjectiveIndex, nounIndex) {
  if (
    !Number.isInteger(adjectiveIndex) ||
    !Number.isInteger(nounIndex) ||
    adjectiveIndex < 0 ||
    adjectiveIndex >= ROOM_ADJECTIVES.length ||
    nounIndex < 0 ||
    nounIndex >= ROOM_NOUNS.length
  ) {
    throw new RangeError("Room-name indexes are out of range.");
  }

  const combinedIndex = adjectiveIndex * ROOM_NOUNS.length + nounIndex;
  const payload = encodeBase32(combinedIndex, 3);
  const rawCode = `${MEMORABLE_PREFIX}${payload}${checksumFor(combinedIndex)}`;

  return `${rawCode.slice(0, 3)}-${rawCode.slice(3)}`;
}

export function decodeRoomName(roomCode) {
  const canonical = canonicalLegacyCode(roomCode);

  if (!canonical) {
    return null;
  }

  const rawCode = canonical.replace("-", "");

  if (!rawCode.startsWith(MEMORABLE_PREFIX)) {
    return null;
  }

  const combinedIndex = decodeBase32(rawCode.slice(2, 5));

  if (
    combinedIndex === null ||
    combinedIndex >= ROOM_ADJECTIVES.length * ROOM_NOUNS.length ||
    rawCode[5] !== checksumFor(combinedIndex)
  ) {
    return null;
  }

  const adjectiveIndex = Math.floor(combinedIndex / ROOM_NOUNS.length);
  const nounIndex = combinedIndex % ROOM_NOUNS.length;

  return {
    adjective: ROOM_ADJECTIVES[adjectiveIndex],
    noun: ROOM_NOUNS[nounIndex],
  };
}

export function makeRoomCode(random = Math.random) {
  const adjectiveIndex = Math.floor(random() * ROOM_ADJECTIVES.length);
  const nounIndex = Math.floor(random() * ROOM_NOUNS.length);

  return encodeRoomName(adjectiveIndex, nounIndex);
}

export function displayRoomCode(roomCode) {
  const memorableName = decodeRoomName(roomCode);

  if (memorableName) {
    return `${memorableName.adjective} ${memorableName.noun}`;
  }

  return canonicalLegacyCode(roomCode) ?? roomCode;
}

export function roomCodeSlug(roomCode) {
  return displayRoomCode(roomCode).toLowerCase().replace(/\s+/g, "-");
}

export function roomCodeFromInput(value) {
  const words = value
    .toLowerCase()
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean);

  if (words.length === 2) {
    const adjectiveIndex = ROOM_ADJECTIVES.indexOf(words[0]);
    const nounIndex = ROOM_NOUNS.indexOf(words[1]);

    if (adjectiveIndex >= 0 && nounIndex >= 0) {
      return encodeRoomName(adjectiveIndex, nounIndex);
    }
  }

  return canonicalLegacyCode(value);
}

export function formatRoomCodeInput(value) {
  if (/\d/.test(value)) {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    return clean.length > 3
      ? `${clean.slice(0, 3)}-${clean.slice(3)}`
      : clean;
  }

  return value
    .toLowerCase()
    .replace(/[^a-z\s-]/g, "")
    .replace(/[\s-]+/g, " ")
    .trimStart()
    .slice(0, 13);
}

