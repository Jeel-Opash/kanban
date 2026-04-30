const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const BASE = BigInt(ALPHABET.length);
const WIDTH = 12;
const MIN = 0n;
const MAX = BASE ** BigInt(WIDTH) - 1n;

const toNumber = (rank) => {
  if (!rank) return null;
  return [...rank].reduce((value, char) => {
    const index = ALPHABET.indexOf(char);
    if (index === -1) return value;
    return value * BASE + BigInt(index);
  }, 0n);
};

const toRank = (value) => {
  let next = value;
  let output = "";
  for (let i = 0; i < WIDTH; i += 1) {
    output = ALPHABET[Number(next % BASE)] + output;
    next /= BASE;
  }
  return output;
};

const midpoint = (before, after) => {
  const low = before ? toNumber(before) : MIN;
  const high = after ? toNumber(after) : MAX;
  if (high - low <= 1n) {
    return `${before || "0"}U`;
  }
  return toRank((low + high) / 2n);
};

const rankForIndex = (items, index) => {
  const before = items[index - 1]?.order;
  const after = items[index]?.order;
  return midpoint(before, after);
};

module.exports = { midpoint, rankForIndex };
