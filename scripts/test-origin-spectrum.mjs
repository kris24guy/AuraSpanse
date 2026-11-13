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
assert.ok(result.zodiac.traitChannels.every((channel) => channel.weight === 1 / 4));
assert.equal(result.zodiacHue1.sourceWeights.length, 4);
assert.ok(result.zodiacHue1.sourceWeights.every((item) => item.weight === 1 / 4));
assert.deepEqual(result.zodiacHue1.sourceWeights.map((item) => item.hex), [
  ...result.zodiac.traitChannels.map((channel) => channel.hex),
  result.currentPlacement.hex,
], "the time-weighted placement must be the fourth Hue 1 color input");
const averageHex = (colors) => "#" + [0, 2, 4].map((offset) => Math.round(
  colors.reduce((sum, color) => sum + parseInt(color.slice(offset + 1, offset + 3), 16), 0) / colors.length
).toString(16).padStart(2, "0")).join("");
assert.equal(result.zodiacHue1.hex, averageHex(result.zodiacHue1.sourceWeights.map((item) => item.hex)),
  "Zodiac Hue 1 must be the equal-weight RGB average of its four source colors");
assert.equal(result.zodiacHue1.name, result.zodiacHue1.nearestEmotion.name,
  "the blended Hue 1 name must resolve to the nearest source emotion");

assert.equal(result.composite.sourceWeights.length, 5);
assert.ok(result.composite.sourceWeights.slice(0, 4).every((item) => Math.abs(item.weight - 1 / 8) < 1e-12));
assert.ok(Math.abs(result.composite.sourceWeights[4].weight - 1 / 2) < 1e-12);
assert.ok(Math.abs(result.composite.sourceWeights.reduce((sum, item) => sum + item.weight, 0) - 1) < 1e-12);
assert.equal(result.composite.sourceWeights[3].hex, result.currentPlacement.hex);
assert.equal(result.composite.sourceWeights[4].hex, result.birthstone.hex);
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
assert.equal(result.composite.hex, mix(result.composite.baseHex, result.birthstone.hex, 0.5),
  "composite color must use the two-primary blend, not the geographic opacity");

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
assert.ok(pageSource.includes("import AuraSky from '../components/AuraSky'") && pageSource.includes("<AuraSky />"),
  "the static-glow sky should be present as visual framing around the unchanged model");
const auraSkySource = await readFile(new URL("../app/components/AuraSky.tsx", import.meta.url), "utf8");
assert.ok(auraSkySource.includes("pointerEvents: 'none'"), "ambient sky must not intercept UI interaction");
assert.ok(auraSkySource.includes("prefers-reduced-motion: reduce"), "ambient sky must respect reduced-motion preferences");
assert.ok(!/fibonacci|golden.?angle|137\.5/i.test(auraSkySource), "ambient sky must not introduce a spiral-based model");
assert.ok(pageSource.includes("includeComposite: false"), "the public page must not precompute the personal blend");
assert.ok(pageSource.includes("/api/subscribe-aura-spectrum"), "the blend must be requested only through the subscription path");
assert.ok(!pageSource.includes("result.composite"), "the pre-subscription page must not render the optional server composite");
assert.ok(!pageSource.includes("auraspanse-aura-spectrum-subscription"),
  "the client must not restore the blend from a spoofable local-storage flag");
assert.ok(pageSource.includes("data.subscribed !== true"),
  "the page must wait for server-confirmed mailing-list subscription before revealing the blend");
assert.ok(pageSource.includes("fetch('/api/subscribe-aura-spectrum?birthDate='"),
  "a previous subscription must be restored only through server validation");
assert.ok(pageSource.includes("const [hue2Revealed, setHue2Revealed] = useState(false)"),
  "the birthstone Hue 2 must remain unrevealed until all four Hue 1 inputs are revealed");
assert.ok(pageSource.includes("Reveal birthstone Hue 2") && pageSource.includes("{hue2Revealed && ("),
  "the birthstone Hue 2 follows the completed four-color Hue 1");
assert.ok(pageSource.includes("TIME-WEIGHTED ALIGNMENT") &&
  pageSource.includes("Measuring lived time across the 374-emotion spectrum") &&
  pageSource.includes("Detecting your historical ${result.zodiac.sign} frame") &&
  pageSource.includes("Aligning your date with today's time-weighted spectrum placement"),
  "the birthdate handoff must pace lived-time, zodiac, and current-placement alignment without showing the underlying math");
assert.ok(pageSource.includes("prefers-reduced-motion: reduce") && pageSource.includes("setIsAligning(false)"),
  "the timed alignment transition must finish cleanly and respect reduced-motion preferences");
const alignmentPanelPosition = pageSource.indexOf("TIME-WEIGHTED ALIGNMENT")
const zodiacPanelPosition = pageSource.indexOf("HISTORICAL ZODIAC FRAME")
const hue2PanelPosition = pageSource.indexOf("PRIMARY HUE 2 · BIRTHSTONE")
assert.ok(pageSource.includes("{result && !isAligning && (") &&
  alignmentPanelPosition < zodiacPanelPosition && zodiacPanelPosition < hue2PanelPosition,
  "the timed transition must lead directly into the zodiac Hue 1 reveal before the separate birthstone Hue 2");
assert.ok(pageSource.includes("const [zodiacRevealCount, setZodiacRevealCount] = useState(0)") &&
  pageSource.includes("hue1Sources.slice(0, zodiacRevealCount)") &&
  pageSource.includes("Math.min(count + 1, 4)") &&
  pageSource.includes("time-weighted fourth color") &&
  pageSource.includes("COLOR {index + 1} · {source.title} · 25%"),
  "the three zodiac channels and time-weighted fourth color must reveal sequentially at equal 25% weights");
assert.ok(pageSource.includes("NEW PRIMARY HUE 1 · FOUR-COLOR BLEND") &&
  pageSource.includes("result.zodiacHue1.hex") && pageSource.includes("equal 25% blend of the three zodiac colors"),
  "Hue 1 must appear as the four-color result only after its fourth source is revealed");
assert.ok(!pageSource.includes("THE AGE EQUATION") && !pageSource.includes("aura-spectrum-cyclone.html") && !pageSource.includes("result.daysAlive"),
  "the result UI should omit the extra equation dashboard and full-screen funnel so the birthdate-to-Hue-1 journey stays focused");

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
assert.ok(cycloneSource.includes("var tCan = document.createElement('canvas');"),
  "the offscreen tornado canvas must exist before the render loop uses it");
assert.ok(cycloneSource.includes("GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))") &&
  cycloneSource.includes("FUNNEL_NODE_COUNT = Math.round(nodes.length * 0.78)"),
  "the 374 hue-ordered points must rise on a golden-angle funnel spiral");
assert.ok(cycloneSource.includes("WILLOW_BRANCHES = 7") && cycloneSource.includes("Fine, intertwined willow strands"),
  "the funnel's upper emotion points must open into the willow-like cyclone crown");
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
assert.ok(cycloneSource.includes("'Original emotion color · stone-tinted display · ' + place") &&
  cycloneSource.includes("'Original emotion color · first-reveal display · ' + place"),
  "the inspector must distinguish the original color from first-stage and stone-tinted display colors");
const legacyPrototypeSource = await readFile(new URL("../server.js", import.meta.url), "utf8");
const spectrumComponentSource = await readFile(new URL("../app/components/AuraSpectrum.tsx", import.meta.url), "utf8");
const guideSource = await readFile(new URL("../app/aura-guide/page.tsx", import.meta.url), "utf8");
const revealPageSource = await readFile(new URL("../app/reveal/page.tsx", import.meta.url), "utf8");
const subscriptionEmailSource = await readFile(new URL("../app/api/subscribe-aura-spectrum/route.ts", import.meta.url), "utf8");
assert.ok(!/\bfreq\b|frequency|0\s*[-–]\s*1000|1000\s*hz|\bHz\b/i.test(
  paletteSource + glossarySource + originEngineSource + auraEngineSource + spectrumComponentSource +
  pageSource + cycloneSource + guideSource + revealPageSource + legacyPrototypeSource + subscriptionEmailSource
), "the full app and retired prototype must not use the old 0–1000 emotion-frequency scale");
assert.ok(!cycloneSource.includes("137.5°"), "the visual UI must not prescribe a spiral-angle formula");
assert.ok(!cycloneSource.includes("Fib //"), "the visual UI must not label itself with a spiral formula");
assert.ok(!cycloneSource.includes("Quaintness"), "the can must not hard-code one starter emotion");
assert.ok(!cycloneSource.includes("DATA.q") && !cycloneSource.includes("Q-loop") && !cycloneSource.includes("linkTargets"),
  "the can must not contain the separate Q-loop model");

const subscriptionRoute = await readFile(new URL("../app/api/subscribe-aura-spectrum/route.ts", import.meta.url), "utf8");
assert.ok(subscriptionRoute.includes("RESEND_AUDIENCE_ID"), "the signup must be backed by an actual Resend audience");
assert.ok(subscriptionRoute.includes("resend.contacts.create"), "the route must create/confirm a mailing-list contact");
assert.ok(subscriptionRoute.includes("const blendHex = blendTwoPrimaryHex(result.zodiacHue1.hex, result.birthstone.hex)"),
  "the subscribed final color must blend the four-source Zodiac Hue 1 with the literal birthstone Hue 2");
assert.ok(subscriptionRoute.includes("result.currentPlacement") && subscriptionRoute.includes("result.zodiacHue1"),
  "the time-weighted placement and blended Hue 1 must reach the personalized server reading");
assert.ok(subscriptionRoute.includes("four-color zodiac/time blend") &&
  subscriptionRoute.includes("fourth time-weighted placement color"),
  "the personalized email must explain the new four-source Hue 1 formula");
const postSubscriptionRoute = subscriptionRoute.slice(subscriptionRoute.indexOf("export async function POST"));
assert.ok(postSubscriptionRoute.indexOf("const blendHex = blendTwoPrimaryHex(result.zodiacHue1.hex, result.birthstone.hex)") >
  postSubscriptionRoute.indexOf("const created = await resend.contacts.create"),
  "the reveal blend must be calculated after the mailing-list contact request");
assert.ok(subscriptionRoute.includes("export async function GET"), "the route must support restoring a confirmed reveal");
assert.ok(subscriptionRoute.includes("timingSafeEqual") && subscriptionRoute.includes("httpOnly: true"),
  "restoration must rely on a server-signed, HttpOnly subscription ticket");
assert.ok(subscriptionRoute.includes("ticket.birthDate !== birthDate"),
  "a signed ticket must not unlock a different birthdate's blend");

console.log("PASS: age/time placement is deterministic and the three zodiac channels plus time color form Hue 1 equally.");
console.log("PASS: literal birthstone colors and geological-deposit opacity are preserved.");
console.log("PASS: all 12 monthly stone colors and their geographic opacity values validate.");
console.log("PASS: all 374 source labels preserve their definitions and receive deterministic palette swatches.");
console.log("PASS: the compact UI reveals zodiac positive/neutral/shadow colors, then the time-weighted fourth color, before blending Hue 1.");
console.log("PASS: the literal birthstone remains Hue 2 and the final primary blend stays subscription-confirmed.");
