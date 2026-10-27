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
const { getAgeSpectrumPlacement } = await loadTypeScriptModule("../app/lib/ageSpectrum.ts");

assert.ok(emotionColors.length > 1, "The spectrum must have multiple points");
const daysAlive = 15000;
const dayOfYear = 300;
const result = getAgeSpectrumPlacement(daysAlive, "aries", dayOfYear, emotionColors);
const repeated = getAgeSpectrumPlacement(daysAlive, "aries", dayOfYear, emotionColors);
const otherSign = getAgeSpectrumPlacement(daysAlive, "taurus", dayOfYear, emotionColors);

assert.equal(result.daysAlive, daysAlive);
assert.equal(result.spectrumPointCount, emotionColors.length);
assert.equal(result.ageSpectrumRatio, daysAlive / emotionColors.length);
assert.equal(result.completedSpectrumCycles, Math.floor(daysAlive / emotionColors.length));
assert.equal(result.remainingLifeDays, daysAlive % emotionColors.length);
assert.ok(Number.isInteger(result.exponentResidue));
assert.ok(result.exponentResidue >= 0 && result.exponentResidue < 1000003);
assert.ok(result.firstHueIndex >= 0 && result.firstHueIndex < emotionColors.length);
assert.ok(result.currentPlacementIndex >= 0 && result.currentPlacementIndex < emotionColors.length);
assert.equal(result.firstHue, emotionColors[result.firstHueIndex]);
assert.equal(result.currentPlacement, emotionColors[result.currentPlacementIndex]);
assert.deepEqual(result, repeated, "The result must be deterministic for the same inputs");
assert.notEqual(result.firstHueIndex, otherSign.firstHueIndex, "The zodiac contribution should affect the first hue");

for (const age of [0, 1, 365, 3650, 20000, 40000]) {
  const placement = getAgeSpectrumPlacement(age, "pisces", 366, emotionColors);
  assert.ok(placement.firstHueIndex >= 0 && placement.firstHueIndex < emotionColors.length);
  assert.ok(placement.currentPlacementIndex >= 0 && placement.currentPlacementIndex < emotionColors.length);
  assert.ok(Number.isFinite(placement.ageSpectrumRatio));
}

assert.throws(() => getAgeSpectrumPlacement(-1, "aries", dayOfYear, emotionColors), /daysAlive/);
assert.throws(() => getAgeSpectrumPlacement(100, "aries", dayOfYear, []), /at least one/);

console.log("PASS: days-lived division, bounded exponent, first hue, and current placement are deterministic and in range.");
console.log("PASS: zodiac sign affects the first hue and invalid spectrum inputs are rejected.");
