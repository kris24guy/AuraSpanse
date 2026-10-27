import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../app/lib/originSpectrumEngine.ts", import.meta.url), "utf8");
const js = ts.transpile(source, {
  module: ts.ModuleKind.ES2022,
  target: ts.ScriptTarget.ES2022,
});
const moduleUrl = "data:text/javascript;base64," + Buffer.from(js).toString("base64");
const { generateOriginSpectrum } = await import(moduleUrl);

const spectrumSource = await readFile(new URL("../app/lib/emotionColors.ts", import.meta.url), "utf8");
const spectrumJs = ts.transpile(spectrumSource, {
  module: ts.ModuleKind.ES2022,
  target: ts.ScriptTarget.ES2022,
});
const spectrumModuleUrl = "data:text/javascript;base64," + Buffer.from(spectrumJs).toString("base64");
const { emotionColors } = await import(spectrumModuleUrl);

const find = (name) => {
  const item = emotionColors.find((color) => color.name.toLowerCase() === name.toLowerCase());
  assert.ok(item, "Test fixture emotion must exist: " + name);
  return item;
};
const zodiacMap = {
  aries: {
    sign: "Aries", element: "Fire", modality: "Cardinal", traditionalRuler: "Mars",
    description: "Cardinal fire that starts.",
    pos: find("Courage"), neu: find("Spontaneity"), neg: find("Anguish"),
  },
  taurus: {
    sign: "Taurus", element: "Earth", modality: "Fixed", traditionalRuler: "Venus",
    description: "Fixed earth that holds.",
    pos: find("Groundedness"), neu: find("Patience"), neg: find("Fear"),
  },
};
const fixedNow = new Date("2026-10-26T18:00:00.000Z");
const resolveAries = () => "aries";
const result = generateOriginSpectrum("1989-01-01", {
  now: fixedNow, spectrum: emotionColors, zodiacMap, resolveZodiacSign: resolveAries,
});

const expectedDays = Math.floor(
  (Date.UTC(2026, 9, 26) - Date.UTC(1989, 0, 1)) / 86400000
);
assert.equal(result.daysAlive, expectedDays);
assert.equal(result.currentDate, "2026-10-26");
assert.equal(result.spectrumPointCount, emotionColors.length);
assert.equal(result.ageSpectrumRatio, expectedDays / emotionColors.length);
assert.equal(result.completedSpectrumCycles, Math.floor(expectedDays / emotionColors.length));
assert.equal(result.remainingLifeDays, expectedDays % emotionColors.length);
assert.ok(result.exponentResidue >= 0 && result.exponentResidue < result.exponentModulus);
assert.equal(result.firstHue, emotionColors[result.firstHueIndex]);
assert.equal(result.currentPlacement, emotionColors[result.currentPlacementIndex]);
assert.ok(result.firstHueIndex >= 0 && result.firstHueIndex < emotionColors.length);
assert.ok(result.currentPlacementIndex >= 0 && result.currentPlacementIndex < emotionColors.length);
assert.equal(result.zodiac.traitChannels.length, 3);
assert.ok(result.zodiac.traitChannels.every((channel) => channel.weight === 1 / 3));
assert.equal(result.composite.sourceWeights.length, 5);
assert.ok(result.composite.sourceWeights.every((item) => item.weight === 1 / 5));
assert.match(result.composite.hex, /^#[0-9a-f]{6}$/);
assert.ok(result.composite.definition.includes("Courage"));
const cleanName = (name) => name.replace(/^The-/, "").replace(/-/g, " ");
assert.ok(result.composite.definition.includes(cleanName(result.firstHue.name)));
assert.ok(result.composite.definition.includes(cleanName(result.currentPlacement.name)));

const otherSign = generateOriginSpectrum("1989-01-01", {
  now: fixedNow, spectrum: emotionColors, zodiacMap, resolveZodiacSign: () => "taurus",
});
assert.notEqual(result.zodiac.sign, otherSign.zodiac.sign);
assert.notEqual(result.firstHueIndex, otherSign.firstHueIndex, "zodiac index should influence first hue");

const repeated = generateOriginSpectrum("1989-01-01", {
  now: fixedNow, spectrum: emotionColors, zodiacMap, resolveZodiacSign: resolveAries,
});
assert.deepEqual(repeated, result, "same inputs on the same date must return the same result");

const nextDay = generateOriginSpectrum("1989-01-01", {
  now: new Date("2026-10-27T18:00:00.000Z"),
  spectrum: emotionColors, zodiacMap, resolveZodiacSign: resolveAries,
});
assert.equal(nextDay.daysAlive, result.daysAlive);
assert.notEqual(nextDay.currentDate, result.currentDate);
assert.notEqual(nextDay.currentPlacementIndex, result.currentPlacementIndex,
  "current placement should advance with the current day");

assert.throws(() => generateOriginSpectrum("1989-02-30", {
  now: fixedNow, spectrum: emotionColors, zodiacMap, resolveZodiacSign: resolveAries,
}), /valid calendar date/);
assert.throws(() => generateOriginSpectrum("2027-01-01", {
  now: fixedNow, spectrum: emotionColors, zodiacMap, resolveZodiacSign: resolveAries,
}), /future/);
assert.throws(() => generateOriginSpectrum("1989-01-01", {
  now: fixedNow, spectrum: [], zodiacMap, resolveZodiacSign: resolveAries,
}), /at least two spectrum points/);

console.log("PASS: Origin Engine uses the complete emotion-color spectrum, days-lived quotient/remainder, and bounded exponent.");
console.log("PASS: zodiac trait channels are equal, source colors merge equally, and current placement advances by day.");
const entryHtml = await readFile(new URL("../public/aura-scope-mechanism.html", import.meta.url), "utf8");
assert.ok(entryHtml.includes('window.location.assign("/origin")'),
  "canonical birthdate entry must open the independent Origin Engine");

console.log("PASS: invalid and future birthdates are rejected.");
console.log("PASS: canonical birthdate entry hands off to /origin.");
