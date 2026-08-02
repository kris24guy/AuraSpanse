type HueKey =
  | "crimson"
  | "amber"
  | "gold"
  | "sage"
  | "emerald"
  | "teal"
  | "indigo"
  | "violet"
  | "slate"
  | "rose"
  | "copper"
  | "charcoal";

type HueDefinition = {
  key: HueKey;
  name: string;
  hex: string;
  emotion: string;
  element: string;
  frequency: number;
  strength: string;
  shadow: string;
  action: string;
};

const HUES: HueDefinition[] = [
  {
    key: "crimson",
    name: "Crimson",
    hex: "#DC2626",
    emotion: "will",
    element: "Fire",
    frequency: 428,
    strength: "You move with direct life-force and decisive creative heat.",
    shadow: "When overloaded, this can become urgency, pressure, or reactive force.",
    action: "Choose one physical action today that turns intensity into clean momentum.",
  },
  {
    key: "amber",
    name: "Amber",
    hex: "#F59E0B",
    emotion: "confidence",
    element: "Solar",
    frequency: 375,
    strength: "You stabilize others through warmth, courage, and visible self-trust.",
    shadow: "You may overextend to keep the light on for everyone else.",
    action: "Name the boundary that lets your warmth stay generous instead of draining.",
  },
  {
    key: "gold",
    name: "Gold",
    hex: "#FACC15",
    emotion: "clarity",
    element: "Light",
    frequency: 528,
    strength: "You clarify patterns quickly and turn scattered effort into coherent direction.",
    shadow: "Clarity can harden into perfectionism when you demand certainty too soon.",
    action: "Pick the next visible step and let action refine the answer.",
  },
  {
    key: "sage",
    name: "Sage",
    hex: "#84CC16",
    emotion: "balance",
    element: "Earth",
    frequency: 322,
    strength: "You restore proportion, patience, and grounded rhythm where things feel chaotic.",
    shadow: "You may delay necessary movement by waiting for everything to feel settled.",
    action: "Simplify one commitment so your pace matches your actual capacity.",
  },
  {
    key: "emerald",
    name: "Emerald",
    hex: "#10B981",
    emotion: "renewal",
    element: "Growth",
    frequency: 242,
    strength: "You carry regenerative energy that helps people and ideas come back to life.",
    shadow: "You can confuse healing with rescuing when you take ownership of others' change.",
    action: "Offer support without absorbing responsibility for the outcome.",
  },
  {
    key: "teal",
    name: "Teal",
    hex: "#14B8A6",
    emotion: "flow",
    element: "Water",
    frequency: 722,
    strength: "You translate emotion into language, movement, and adaptive problem-solving.",
    shadow: "You may keep shifting shape until your own needs become hard to locate.",
    action: "Say the simple true thing before adapting to everyone else's current.",
  },
  {
    key: "indigo",
    name: "Indigo",
    hex: "#4F46E5",
    emotion: "insight",
    element: "Mind",
    frequency: 615,
    strength: "You see hidden structure and sense what is forming before it becomes obvious.",
    shadow: "Insight can isolate you if you stop translating what you see into usable words.",
    action: "Write the pattern in plain language so someone else can act on it.",
  },
  {
    key: "violet",
    name: "Violet",
    hex: "#8B5CF6",
    emotion: "vision",
    element: "Ether",
    frequency: 588,
    strength: "You connect imagination, meaning, and spiritual scale into a compelling field.",
    shadow: "You may float above practical detail when the vision feels bigger than the path.",
    action: "Anchor the vision in one calendarable task today.",
  },
  {
    key: "slate",
    name: "Slate",
    hex: "#64748B",
    emotion: "discernment",
    element: "Stone",
    frequency: 802,
    strength: "You bring sober perception, restraint, and strategic stillness under pressure.",
    shadow: "Discernment can become emotional distance when you protect yourself by going quiet.",
    action: "State what you know, what you do not know, and what you will decide next.",
  },
  {
    key: "rose",
    name: "Rose",
    hex: "#F472B6",
    emotion: "tenderness",
    element: "Heart",
    frequency: 508,
    strength: "You soften guarded spaces and make honesty feel safer for others.",
    shadow: "You may trade truth for harmony when you fear disrupting connection.",
    action: "Let care and candor exist in the same sentence.",
  },
  {
    key: "copper",
    name: "Copper",
    hex: "#B45309",
    emotion: "craft",
    element: "Metal",
    frequency: 828,
    strength: "You convert raw experience into skill, usefulness, and material traction.",
    shadow: "You may measure your worth only by what you can produce or fix.",
    action: "Complete one tangible repair, then stop before usefulness becomes self-erasure.",
  },
  {
    key: "charcoal",
    name: "Charcoal",
    hex: "#374151",
    emotion: "depth",
    element: "Void",
    frequency: 28,
    strength: "You can sit with complexity, grief, and hidden truth without looking away.",
    shadow: "Depth can turn heavy when you stay alone with what needs witness or release.",
    action: "Bring one private truth into safe language, even if only in a note to yourself.",
  },
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  return Math.floor((date.getTime() - start) / 86400000);
}

function zodiacIndex(month: number, day: number): number {
  const marker = month * 100 + day;
  if (marker >= 321 && marker <= 419) return 0;
  if (marker >= 420 && marker <= 520) return 1;
  if (marker >= 521 && marker <= 620) return 2;
  if (marker >= 621 && marker <= 722) return 3;
  if (marker >= 723 && marker <= 822) return 4;
  if (marker >= 823 && marker <= 922) return 5;
  if (marker >= 923 && marker <= 1022) return 6;
  if (marker >= 1023 && marker <= 1121) return 7;
  if (marker >= 1122 && marker <= 1221) return 8;
  if (marker >= 1222 || marker <= 119) return 9;
  if (marker >= 120 && marker <= 218) return 10;
  return 11;
}

function pickHue(index: number): HueDefinition {
  return HUES[((index % HUES.length) + HUES.length) % HUES.length];
}

function parseBirthDate(value: unknown): { iso: string; month: number; day: number } | null {
  if (typeof value !== "string") return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return { iso: value, month, day };
}

function buildReading(birthDate: string, asOf: Date) {
  const parsed = parseBirthDate(birthDate);
  if (!parsed) throw new Error("birthDate must be a valid YYYY-MM-DD date");

  const foundationIndex = zodiacIndex(parsed.month, parsed.day);
  const today = dayOfYear(asOf);
  const weeklyPhase = Math.floor(today / 7);
  const seed = hash(`${parsed.iso}:${asOf.toISOString().slice(0, 10)}`);

  const foundationHue = pickHue(foundationIndex);
  const presentHue = pickHue(foundationIndex + today + (seed % 5));
  const undertoneHue = pickHue(foundationIndex + weeklyPhase + 4);

  const finalName = `${foundationHue.name} ${presentHue.name}`;
  const aurascope = `Your foundation is ${foundationHue.name.toLowerCase()}, giving the reading its steady center of ${foundationHue.emotion}. Today, ${presentHue.name.toLowerCase()} moves through the field as the active color you are carrying right now. Beneath it, ${undertoneHue.name.toLowerCase()} works as the slower undertone, shaping the week-level lesson. The combination asks you to use ${foundationHue.strength.toLowerCase()} At the same time, watch for this shadow: ${presentHue.shadow.toLowerCase()} Your alignment point is simple: ${undertoneHue.action.toLowerCase()}`;

  return {
    birthDate: parsed.iso,
    asOf: asOf.toISOString().slice(0, 10),
    hueVocabulary: HUES.map((h) => h.key),
    reading: {
      foundationHue: foundationHue.key,
      presentHue: presentHue.key,
      undertoneHue: undertoneHue.key,
      primaryHue: presentHue.key,
      finalHue: `${foundationHue.key}-${presentHue.key}`,
    },
    subHues: [foundationHue, presentHue, undertoneHue].map((h) => ({
      name: h.name,
      key: h.key,
      hex: h.hex,
      emotion: h.emotion,
      frequency: h.frequency,
      element: h.element,
      strength: h.strength,
      weakness: h.shadow,
      action: h.action,
    })),
    finalHue: {
      name: finalName,
      key: `${foundationHue.key}-${presentHue.key}`,
      hex: presentHue.hex,
      description: `${foundationHue.name} provides the base frequency, ${presentHue.name} shows what is active now, and ${undertoneHue.name} carries the slower weekly undertone.`,
    },
    aurascope,
    mantra: `I carry ${presentHue.name.toLowerCase()} with clarity, rhythm, and truth.`,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: corsHeaders },
    );
  }

  try {
    const body = await req.json();
    const birthDate = body.birthDate ?? body.birthdate;
    const asOf = typeof body.asOf === "string" ? new Date(`${body.asOf}T00:00:00Z`) : new Date();

    if (Number.isNaN(asOf.getTime())) {
      return Response.json(
        { error: "asOf must be a valid YYYY-MM-DD date" },
        { status: 400, headers: corsHeaders },
      );
    }

    const reading = buildReading(birthDate, asOf);
    return Response.json(reading, { headers: corsHeaders });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to generate aura reading" },
      { status: 400, headers: corsHeaders },
    );
  }
});
