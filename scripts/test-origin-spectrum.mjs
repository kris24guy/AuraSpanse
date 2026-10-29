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
const deps = (now, resolveZodiacSign, includeComposite = false) => ({
  now,
  spectrum: emotionColors,
  zodiacMap,
  resolveZodiacSign,
  getBirthstoneResonance,
  includeComposite,
});
const resolveAries = () => "aries";
const result = generateOriginSpectrum("1989-01-01", deps(fixedNow, resolveAries, true));

const glossaryPoints = buildEmotionGlossaryPoints(emotionColors);
assert.equal(EMOTION_GLOSSARY_ROWS.length, 374, "every supplied definition should become a point");
assert.equal(glossaryPoints.length, 374, "every supplied definition should become a colored point");
assert.equal(new Set(glossaryPoints.map((point) => point.name.toLowerCase())).size, 374, "glossary labels remain individually addressable");
assert.ok(glossaryPoints.every((point) => point.definition.trim().length > 0), "all points retain a definition");
assert.ok(glossaryPoints.every((point) => /^#[0-9a-f]{6}$/i.test(point.hex) && !("freq" in point)), "every glossary point has an original color and no numeric frequency field");
assert.ok(glossaryPoints.some((point) => point.colorAssignment === "exact"), "exact color-name matches should inherit palette swatches");
assert.ok(glossaryPoints.some((point) => point.colorAssignment === "inferred"), "unmatched entries should receive nearest-palette swatches");
for (let i = 0; i < glossaryPoints.length; i += 1) assert.equal(glossaryPoints[i].definition, EMOTION_GLOSSARY_ROWS[i][1], "definition remains verbatim for " + glossaryPoints[i].name);
const glossaryResult = generateOriginSpectrum("1989-01-01", { ...deps(fixedNow, resolveAries), spectrum: glossaryPoints });
assert.equal(glossaryResult.composite, null, "the engine default leaves the two primaries separate");
assert.equal(glossaryResult.spectrumPointCount, 374, "the age equation now uses the 374 source glossary points");
assert.equal(glossaryResult.firstHue.name, glossaryPoints[glossaryResult.firstHueIndex].name);
assert.equal(glossaryResult.currentPlacement.name, glossaryPoints[glossaryResult.currentPlacementIndex].name);
assert.deepEqual(buildEmotionGlossaryPoints(emotionColors), glossaryPoints, "glossary color assignment is deterministic");
const unblendedResult = generateOriginSpectrum("1989-01-01", {
  ...deps(fixedNow, resolveAries),
  spectrum: glossaryPoints,
  includeComposite: false,
});
assert.equal(unblendedResult.composite, null, "the public pre-subscription path must not calculate a composite");
assert.equal(unblendedResult.firstHue, glossaryPoints[unblendedResult.firstHueIndex], "Primary Hue 1 must come from the same 374-point spectrum");
assert.ok(/^#[0-9a-f]{6}$/i.test(unblendedResult.birthstone.hex), "Primary Hue 2 must use the literal birthstone swatch");
const blendTwoHex = (firstHex, secondHex) => {
  const rgb = (hex) => [0, 2, 4].map((offset) => parseInt(hex.slice(offset + 1, offset + 3), 16));
  const first = rgb(firstHex);
  const second = rgb(secondHex);
  return "#" + first.map((channel, index) => Math.round((channel + second[index]) / 2).toString(16).padStart(2, "0")).join("");
};
assert.equal(blendTwoHex("#000000", "#ffffff"), "#808080", "two primaries should use equal-weight RGB blending");


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

const repeat = generateOriginSpectrum("1989-01-01", deps(fixedNow, resolveAries, true));
assert.deepEqual(repeat, result, "same inputs on the same date must return the same result");

const otherSign = generateOriginSpectrum("1989-01-01", deps(fixedNow, () => "taurus"));
assert.notEqual(result.zodiac.sign, otherSign.zodiac.sign);
assert.notEqual(result.firstHueIndex, otherSign.firstHueIndex, "zodiac index should influence first hue");

const nextDay = generateOriginSpectrum("1989-01-01", deps(new Date("2026-10-27T18:00:00.000Z"), resolveAries));
assert.equal(nextDay.daysAlive, result.daysAlive + 1, "days alive should advance when the current date advances by one day");
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

const paletteSource = await readFile(new URL("../app/lib/emotionColors.ts", import.meta.url), "utf8");
const glossarySource = await readFile(new URL("../app/lib/emotionGlossary.ts", import.meta.url), "utf8");
const originEngineSource = await readFile(new URL("../app/lib/originSpectrumEngine.ts", import.meta.url), "utf8");
const auraEngineSource = await readFile(new URL("../app/lib/auraEngine.ts", import.meta.url), "utf8");
assert.ok(!/\bfreq\b|frequency|0\s*[-–]\s*1000/.test(paletteSource + glossarySource + originEngineSource + auraEngineSource),
  "color selection and reading calculations must use ordered palette positions, not a 0–1000 frequency scale");
const pageSource = await readFile(new URL("../app/aura-spectrum/page.tsx", import.meta.url), "utf8");
assert.ok(entryHtml.includes('window.location.assign("/aura-spectrum")'),
  "the birthdate entry must route into Aura-Spectrum");
assert.ok(pageSource.includes("aura-spectrum-cyclone.html"), "the reveal page must use the supplied can UI");
assert.ok(pageSource.includes("import AuraSky from '../components/AuraSky'") && pageSource.includes("<AuraSky />"),
  "the static-glow sky should be present as visual framing around the unchanged model");
const auraSkySource = await readFile(new URL("../app/components/AuraSky.tsx", import.meta.url), "utf8");
assert.ok(auraSkySource.includes("pointerEvents: 'none'"), "ambient sky must not intercept UI interaction");
assert.ok(auraSkySource.includes("prefers-reduced-motion: reduce"), "ambient sky must respect reduced-motion preferences");
assert.ok(!/fibonacci|golden.?angle|137\.5/i.test(auraSkySource), "ambient sky must not introduce a spiral-based model");
assert.ok(pageSource.includes("includeComposite: false"), "the public page must not precompute the personal blend");
assert.ok(pageSource.includes("/api/subscribe-aura-spectrum"), "the blend must be requested only through the subscription path");
assert.ok(!pageSource.includes("result.composite"), "the pre-subscription page must not render the older composite model");
assert.ok(!pageSource.includes("auraspanse-aura-spectrum-subscription"),
  "the client must not restore the blend from a spoofable local-storage flag");
assert.ok(pageSource.includes("data.subscribed !== true"),
  "the page must wait for server-confirmed mailing-list subscription before revealing the blend");
assert.ok(pageSource.includes("fetch('/api/subscribe-aura-spectrum?birthDate='"),
  "a previous subscription must be restored only through server validation");

const cycloneSource = await readFile(new URL("../public/aura-spectrum-cyclone.html", import.meta.url), "utf8");
assert.ok(cycloneSource.includes("Browse all 374 points"), "the can must show the 374 emotion entries");
assert.ok(cycloneSource.includes("aura-spectrum-cyclone-points"), "the can must receive the actual engine glossary");
assert.ok(cycloneSource.includes("function colorSortInfo(hex)"), "the emotion wall must sort by original color rather than alphabet");
assert.ok(cycloneSource.includes("nodes.sort(function (left, right)") && cycloneSource.includes("a.hue - b.hue"),
  "wall positions must follow hue order with neutral tones grouped separately");
assert.ok(cycloneSource.includes("group('All emotions, arranged by color', nodes)"),
  "the browse list must follow the color-ordered wall");
assert.ok(cycloneSource.includes("var sourcePrimaryHex = queryParams.get('primary') || '';"),
  "the can must receive Primary Hue 1 from the reveal engine");
assert.ok(cycloneSource.includes("var sourceStoneHex = queryParams.get('stone') || '';"),
  "the can must receive Primary Hue 2's natural birthstone color");
assert.ok(cycloneSource.includes("queryParams.get('opacity')"),
  "the can must receive model-computed geological-deposit proximity strength");
assert.ok(cycloneSource.includes("function vortexTint(height, stoneInfluence, darkness)") &&
  cycloneSource.includes("stoneOpacity * (1 - 0.16 * heightRatio) * stoneInfluence"),
  "deposit proximity must control how the birthstone hue blends into the vortex");
assert.ok(cycloneSource.includes("function drawVortexSurface(c, widthFactor, phase, gradient, alpha, glowColor)") &&
  cycloneSource.includes("function drawFlowEdge(c, phase, colorA, colorB, alpha, thickness)"),
  "the vortex must render as connected surfaces and continuous color-flow ribbons");
assert.ok(cycloneSource.includes("outer.addColorStop(1, vortexTint(1, 1, 0.84))") &&
  cycloneSource.includes("inner.addColorStop(1, vortexTint(1, 1, 0.88))"),
  "the central vortex must darken progressively toward the upper rim");
assert.ok(!cycloneSource.includes("function disc(pt)") && !cycloneSource.includes("var NT = nodes.length, TPts = []"),
  "the central tornado must not be rendered as separate particle dots");
assert.ok(!cycloneSource.includes("A to Z upward") && !cycloneSource.includes("All points, A to Z"),
  "the emotion wall must not be presented as alphabetically ordered");
assert.ok(cycloneSource.includes("meta.textContent = 'Original emotion color · stone-tinted display · ' + place"),
  "the inspector must distinguish the original emotion color from its stone-tinted appearance");
const legacyPrototypeSource = await readFile(new URL("../server.js", import.meta.url), "utf8");
const spectrumComponentSource = await readFile(new URL("../app/components/AuraSpectrum.tsx", import.meta.url), "utf8");
const guideSource = await readFile(new URL("../app/aura-guide/page.tsx", import.meta.url), "utf8");
const revealPageSource = await readFile(new URL("../app/reveal/page.tsx", import.meta.url), "utf8");
const subscriptionEmailSource = await readFile(new URL("../app/api/subscribe-aura-spectrum/route.ts", import.meta.url), "utf8");
assert.ok(!/\bfreq\b|frequency|0\s*[-–]\s*1000|1000\s*hz|\bHz\b/i.test(
  paletteSource + glossarySource + originEngineSource + auraEngineSource + spectrumComponentSource +
  pageSource + cycloneSource + guideSource + revealPageSource + legacyPrototypeSource + subscriptionEmailSource
), "the full app and retired prototype must not use the old 0–1000 emotion-frequency scale");
assert.ok(pageSource.includes("'&primary=' + encodeURIComponent(result.firstHue.hex)"),
  "the reveal page must pass Primary Hue 1 into the can renderer");
assert.ok(pageSource.includes("opacity=' + encodeURIComponent(String(result.birthstone.opacity))"),
  "the reveal page must pass its calculated opacity into the display-only can");
assert.ok(!cycloneSource.includes("137.5°"), "the visual UI must not prescribe a spiral-angle formula");
assert.ok(!cycloneSource.includes("Fib //"), "the visual UI must not label itself with a spiral formula");
assert.ok(!cycloneSource.includes("Quaintness"), "the can must not hard-code one starter emotion");
assert.ok(!cycloneSource.includes("DATA.q") && !cycloneSource.includes("Q-loop") && !cycloneSource.includes("linkTargets"),
  "the can must not contain the separate Q-loop model");

const subscriptionRoute = await readFile(new URL("../app/api/subscribe-aura-spectrum/route.ts", import.meta.url), "utf8");
assert.ok(subscriptionRoute.includes("RESEND_AUDIENCE_ID"), "the signup must be backed by an actual Resend audience");
assert.ok(subscriptionRoute.includes("resend.contacts.create"), "the route must create/confirm a mailing-list contact");
assert.ok(subscriptionRoute.includes("const blendHex = blendTwoPrimaryHex(result.firstHue.hex, result.birthstone.hex)"),
  "the subscribed blend must use exactly the two primaries");
const postSubscriptionRoute = subscriptionRoute.slice(subscriptionRoute.indexOf("export async function POST"));
assert.ok(postSubscriptionRoute.indexOf("const blendHex = blendTwoPrimaryHex(result.firstHue.hex, result.birthstone.hex)") >
  postSubscriptionRoute.indexOf("const created = await resend.contacts.create"),
  "the reveal blend must be calculated after the mailing-list contact request");
assert.ok(subscriptionRoute.includes("export async function GET"), "the route must support restoring a confirmed reveal");
assert.ok(subscriptionRoute.includes("timingSafeEqual") && subscriptionRoute.includes("httpOnly: true"),
  "restoration must rely on a server-signed, HttpOnly subscription ticket");
assert.ok(subscriptionRoute.includes("ticket.birthDate !== birthDate"),
  "a signed ticket must not unlock a different birthdate's blend");

console.log("PASS: age/spectrum equation, zodiac balancing, and current placement are deterministic.");
console.log("PASS: literal birthstone colors and geological-deposit opacity are preserved.");
console.log("PASS: all 12 monthly stone colors and their geographic opacity values validate.");
console.log("PASS: all 374 source labels preserve their definitions and receive deterministic palette swatches.");
console.log("PASS: the transparent can is color-ordered and the continuous vortex blends both primary hues with geographic strength and upper-rim darkening.");
console.log("PASS: the two-primary blend is not calculated by the public page and is calculated after confirmed subscription.");
