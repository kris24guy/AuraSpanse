# aura-engine Supabase Edge Function

Deterministic AuraSpanse reading engine using the 12-hue vocabulary:

`crimson`, `amber`, `gold`, `sage`, `emerald`, `teal`, `indigo`, `violet`, `slate`, `rose`, `copper`, `charcoal`

## Deploy

```bash
supabase functions deploy aura-engine --project-ref pcuwqqkgtjqtklqmskdw
```

## Verify locally

```bash
supabase functions serve aura-engine --env-file ./supabase/.env.local

curl -i http://127.0.0.1:54321/functions/v1/aura-engine \
  -H 'Content-Type: application/json' \
  -d '{"birthDate":"1990-06-15","asOf":"2026-08-01"}'
```

## Verify deployed function

```bash
curl -i https://pcuwqqkgtjqtklqmskdw.supabase.co/functions/v1/aura-engine \
  -H 'Content-Type: application/json' \
  -d '{"birthDate":"1990-06-15","asOf":"2026-08-01"}'
```

## Expected response shape

The function accepts either `birthDate` or the legacy `birthdate` field. It returns both:

- a compact `reading` object for the newer Auracle flow; and
- the legacy-compatible `subHues`, `finalHue`, `aurascope`, and `mantra` fields used by the current `/api/reading` UI.

No Anthropic, OpenAI, or external API key is required. The result is deterministic for a given `birthDate` + `asOf` date.
