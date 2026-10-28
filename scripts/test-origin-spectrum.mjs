import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

async function loadTypeScriptModule(relativePath) {
  const source = await readFile(new URL(relativePath, import.meta.url), "utf8");
  const javascript = ts.transpile(source, {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  });
  const moduleUrl = "data:text/javascript;base64," + Buffer.from(javascript).toString("base64");
  return import(moduleUrl);
}

const { emotionColors } = await loadTypeScriptModule("../app/lib/emotionColors.ts");
const { generateOriginSpectrum } = await loadTypeScriptModule("../app/lib/originSpectrumEngine.ts");
const { buildEmotionGlossaryPoints, EMOTION_GLOSSARY_ROWS } = await loadTypeScriptModule("../app/lib/emotionGlossary.ts");
const {
  getBirthstoneResonance,
  BIRTHSTONE_REFERENCES,
  AURASPECTRUM_GEOGRAPHIC_ORIGIN,
} = await loadTypeScriptModule("../app/lib/birthstoneResonance.ts");

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
const deps = (now, resolveZodiacSign) => ({
  now,
  spectrum: emotionColors,
  zodiacMap,
  resolveZodiacSign,
  getBirthstoneResonance,
});
const resolveAries = () => "aries";
const result = generateOriginSpectrum("1989-01-01", deps(fixedNow, resolveAries));

const glossaryPoints = buildEmotionGlossaryPoints(emotionColors);
assert.equal(EMOTION_GLOSSARY_ROWS.length, 374, "every supplied definition should become a point");
assert.equal(glossaryPoints.length, 374, "every supplied definition should become a colored point");
assert.equal(new Set(glossaryPoints.map((point) => point.name.toLowerCase())).size, 374, "glossary labels remain individually addressable");
assert.ok(glossaryPoints.every((point) => point.definition.trim().length > 0), "all points retain a definition");
assert.ok(glossaryPoints.every((point) => /^#[0-9a-f]{6}$/i.test(point.hex) && point.freq >= 0 && point.freq <= 1000), "every glossary point has a valid color and frequency");
assert.ok(glossaryPoints.some((point) => point.colorAssignment === "exact"), "exact color-name matches should inherit palette swatches");
assert.ok(glossaryPoints.some((point) => point.colorAssignment === "inferred"), "unmatched entries should receive nearest-palette swatches");
for (let i = 0; i < glossaryPoints.length; i += 1) assert.equal(glossaryPoints[i].definition, EMOTION_GLOSSARY_ROWS[i][1], "definition remains verbatim for " + glossaryPoints[i].name);
const glossaryResult = generateOriginSpectrum("1989-01-01", { ...deps(fixedNow, resolveAries), spectrum: glossaryPoints });
assert.equal(glossaryResult.spectrumPointCount, 374, "the age equation now uses the 374 source glossary points");
assert.equal(glossaryResult.firstHue.name, glossaryPoints[glossaryResult.firstHueIndex].name);
assert.equal(glossaryResult.currentPlacement.name, glossaryPoints[glossaryResult.currentPlacementIndex].name);
assert.deepEqual(buildEmotionGlossaryPoints(emotionColors), glossaryPoints, "glossary color assignment is deterministic");

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

assert.equal(result.composite.sourceWeights.length, 6);
assert.ok(result.composite.sourceWeights.slice(0, 5).every((item) =>
  Math.abs(item.weight - (1 - result.birthstone.opacity) / 5) < 1e-12));
assert.ok(Math.abs(result.composite.sourceWeights[5].weight - result.birthstone.opacity) < 1e-12);
assert.ok(Math.abs(result.composite.sourceWeights.reduce((sum, item) => sum + item.weight, 0) - 1) < 1e-12);
assert.equal(result.composite.sourceWeights[5].hex, result.birthstone.hex);
assert.equal(result.birthstone.hex, "#7B1E3A", "garnet's literal source swatch must be used");
assert.ok(/^#[0-9a-f]{6}$/i.test(result.birthstone.hex));
assert.equal(result.birthstone.origin.name, AURASPECTRUM_GEOGRAPHIC_ORIGIN.name);
assert.ok(result.birthstone.distanceKm > 0);
assert.ok(result.birthstone.opacityPercent >= 25 && result.birthstone.opacityPercent <= 100);
assert.ok(Math.abs(result.birthstone.opacityPercent -
  Math.max(25, Math.min(100, 100 - result.birthstone.distanceKm / 150))) < 1e-9);

const mix = (baseHex, overlayHex, opacity) => {
  const rgb = (hex) => [0, 2, 4].map((offset) => parseInt(hex.slice(offset + 1, offset + 3), 16));
  const base = rgb(baseHex);
  const overlay = rgb(overlayHex);
  return "#" + base.map((channel, index) =>
    Math.round(channel * (1 - opacity) + overlay[index] * opacity).toString(16).padStart(2, "0")
  ).join("");
};
assert.equal(result.composite.hex, mix(result.composite.baseHex, result.birthstone.hex, result.birthstone.opacity),
  "composite color must be mixed from the literal birthstone hex and the geographic opacity");

const repeat = generateOriginSpectrum("1989-01-01", deps(fixedNow, resolveAries));
assert.deepEqual(repeat, result, "same inputs on the same date must return the same result");

const otherSign = generateOriginSpectrum("1989-01-01", deps(fixedNow, () => "taurus"));
assert.notEqual(result.zodiac.sign, otherSign.zodiac.sign);
assert.notEqual(result.firstHueIndex, otherSign.firstHueIndex, "zodiac index should influence first hue");

const nextDay = generateOriginSpectrum("1989-01-01", deps(new Date("2026-10-27T18:00:00.000Z"), resolveAries));
assert.equal(nextDay.daysAlive, result.daysAlive);
assert.notEqual(nextDay.currentDate, result.currentDate);
assert.notEqual(nextDay.currentPlacementIndex, result.currentPlacementIndex,
  "current placement should advance with the current day");

assert.deepEqual(Object.keys(BIRTHSTONE_REFERENCES).map(Number), Array.from({ length: 12 }, (_, i) => i + 1));
for (const month of Array.from({ length: 12 }, (_, i) => i + 1)) {
  const resonance = getBirthstoneResonance(month);
  assert.ok(/^#[0-9a-f]{6}$/i.test(resonance.hex), "month " + month + " needs a literal swatch");
  assert.ok(resonance.opacityPercent >= 25 && resonance.opacityPercent <= 100);
  assert.ok(Number.isFinite(resonance.distanceKm));
}
assert.throws(() => getBirthstoneResonance(0), /month/);
assert.throws(() => generateOriginSpectrum("1989-02-30", deps(fixedNow, resolveAries)), /valid calendar date/);
assert.throws(() => generateOriginSpectrum("2027-01-01", deps(fixedNow, resolveAries)), /future/);
assert.throws(() => generateOriginSpectrum("1989-01-01", {
  ...deps(fixedNow, resolveAries), spectrum: [],
}), /at least two spectrum points/);

const entryHtml = await readFile(new URL("../public/aura-scope-mechanism.html", import.meta.url), "utf8");
assert.ok(entryHtml.includes('window.location.assign("/aura-spectrum")'),
  "canonical birthdate entry must open the Aura-Spectrum mechanism");

const cylinderSource = await readFile(new URL("../app/components/AuraSpectrumCylinder.tsx", import.meta.url), "utf8");
assert.ok(cylinderSource.includes("137.50776405003785"), "the cylinder should use the golden angle");
assert.ok(cylinderSource.includes("darkenHex"), "the cylinder should darken upward");
assert.ok(cylinderSource.includes("Search all "), "the cylinder should expose a searchable glossary index");
assert.ok(cylinderSource.includes("point.spectrumPoint.definition"), "each point should carry its full definition");

console.log("PASS: age/spectrum equation, zodiac balancing, and current placement are deterministic.");
console.log("PASS: literal birthstone hex values drive the geographic opacity blend.");
console.log("PASS: all 12 monthly stone swatches and their geographic opacity values validate.");
console.log("PASS: all 374 source labels preserve their definitions and receive deterministic palette swatches.");
console.log("PASS: the live Aura-Spectrum age equation and cyclone use the 374 glossary points.");
console.log("PASS: the birthdate form opens Aura-Spectrum and the cyclone exposes point search/definitions.");
