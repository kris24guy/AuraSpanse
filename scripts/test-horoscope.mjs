import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../app/lib/horoscope.ts", import.meta.url), "utf8");
const javascript = ts.transpile(source, {
  module: ts.ModuleKind.ES2022,
  target: ts.ScriptTarget.ES2022,
});
const moduleUrl = "data:text/javascript;base64," + Buffer.from(javascript).toString("base64");
const { generateAuraHoroscope } = await import(moduleUrl);

const emotion = (name, hex) => ({ name, hex });
const inputA = {
  zodiac: {
    sign: "Aries",
    traits: ["Courage"],
    selectedTrait: { polarity: "positive", name: "Courage" },
  },
  primaryAura: "Golden Bloom",
  secondaryAura: "Oceanic Veil",
  blendedHue: emotion("The-Compassion-Blend", "#bbaaff"),
  finalEmotion: emotion("Hope", "#eeeeaa"),
  focus: "turning scattered signals into one clear next move",
  action: "Write one honest next step.",
};
const inputB = {
  zodiac: {
    sign: "Pisces",
    traits: ["Dreaming"],
    selectedTrait: { polarity: "shadow", name: "Dreaming" },
  },
  primaryAura: "Violet Current",
  secondaryAura: "Rose Flame",
  blendedHue: emotion("The-Nostalgia-Blend", "#cc88aa"),
  finalEmotion: emotion("Sorrow", "#5555aa"),
  focus: "protecting your energy",
  action: "Set one clear boundary.",
};

const a = generateAuraHoroscope(inputA);
const b = generateAuraHoroscope(inputB);

assert.equal(a.title, "Aries Aura Horoscope");
assert.equal(b.title, "Pisces Aura Horoscope");
assert.match(a.overview, /golden bloom primary aura/i);
assert.match(a.overview, /oceanic veil secondary aura/i);
assert.match(b.overview, /violet current primary aura/i);
assert.match(b.overview, /rose flame secondary aura/i);
assert.match(a.overview, /compassion blend/i);
assert.match(b.overview, /nostalgia blend/i);
assert.match(a.overview, /turning scattered signals into one clear next move/i);
assert.match(b.overview, /protecting your energy/i);
assert.match(a.strength, /selected courage theme points toward a resource/i);
assert.match(b.strength, /reflection point, not a flaw/i);
assert.match(a.balance, /golden bloom.*oceanic veil/i);
assert.match(b.balance, /violet current.*rose flame/i);
assert.match(a.relationships, /courage/i);
assert.match(b.relationships, /dreaming/i);
assert.match(a.direction, /compassion blend/i);
assert.match(b.direction, /nostalgia blend/i);
assert.equal(a.balancingColor, "Hope");
assert.equal(b.balancingColor, "Sorrow");
assert.equal(a.nextStep, inputA.action);
assert.equal(b.nextStep, inputB.action);

for (const key of ["title", "overview", "strength", "balance", "relationships", "direction", "balancingColor", "nextStep"]) {
  assert.notEqual(a[key], b[key], "Expected input changes to alter horoscope field: " + key);
}

const fallback = generateAuraHoroscope({
  ...inputA,
  zodiac: { sign: "Libra", traits: ["Harmony"] },
});
assert.match(fallback.strength, /invites observation before action/i);
assert.equal(fallback.title, "Libra Aura Horoscope");

console.log("PASS: aura-responsive horoscope output changes across zodiac, aura, color, focus, polarity, and action inputs.");
console.log("PASS: fallback zodiac trait handling works.");
