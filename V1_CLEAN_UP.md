# V1 Clean Up

## 1. LLM Layer — Strict JSON Schema (`supabase/functions/generate-design/index.ts`)

**Problem:** The system prompt told the LLM to return "params for the selected template" with no structure defined. The LLM was guessing field names, nesting, and units.

**Fix:** Rewrote the system prompt to specify the exact JSON shape expected — including the top-level key per template (`box`, `bracket`, `cylinder`, `plate`, `handle`), every field name, its type, unit, and valid range. The LLM now has an unambiguous contract to follow.

---

## 2. LLM Layer — Temperature and Response Format (`supabase/functions/generate-design/index.ts`)

**Problem:** Temperature was set to `0.7`, increasing the chance of malformed or inconsistent JSON. There was no instruction to return raw JSON — the model often wrapped output in markdown fences.

**Fix:** Set `temperature: 0` and added `response_format: { type: 'json_object' }`. Also added a markdown fence stripping fallback (`replace(/^```json\s*/i, '')`) in case the gateway ignores the format hint.

---

## 3. LLM Layer — JSON Parsing (`supabase/functions/generate-design/index.ts`)

**Problem:** The old parser used a fragile regex (`content.match(/```json\n?([\s\S]*?)\n?```/)`) that silently fell back to using the raw string as documentation when parsing failed, discarding all geometry params.

**Fix:** Simplified to `JSON.parse(stripped)` on the cleaned content, with a clear error log on failure.

---

## 4. Frontend — Params Wiring (`app/generate/page.tsx`)

**Problem:** The frontend built `GenerationParams` by spreading `aiResult?.params`, but the LLM response never had a `params` key — geometry fields (`box`, `bracket`, etc.) were at the top level. This meant the AI's dimensional output was silently ignored and hardcoded defaults were always used.

**Fix:** Explicitly mapped each template key from `aiResult` into `GenerationParams`:
```ts
const params: GenerationParams = {
  template,
  box: aiResult?.box,
  bracket: aiResult?.bracket,
  cylinder: aiResult?.cylinder,
  plate: aiResult?.plate,
  handle: aiResult?.handle,
};
```

---

## 5. Geometry — Hollow Box Enclosure (`src/lib/stlGenerator.ts`)

**Problem:** `generateBoxEnclosure` returned a single solid `BoxGeometry` — just a filled cube. The mounting posts were created but immediately discarded (never merged into the output). The resulting STL was not a real enclosure.

**Fix:** Rebuilt the enclosure from individual face pieces: bottom plate, optional lid, front/back walls, left/right walls, and corner mounting posts — all properly sized and translated, then merged. The result is a hollow shell with a real interior cavity.

---

## 6. Geometry — Dimension Validation (`src/lib/stlGenerator.ts`)

**Problem:** LLM-returned dimensions were passed directly to geometry generators with no bounds checking. Bad values (`0`, `null`, `99999`, strings) would silently produce degenerate geometry or crash.

**Fix:** Added `validate*Params()` functions for each template that clamp all numeric fields to printable ranges, fill missing fields with sensible defaults, and handle non-numeric inputs safely. The cylinder validator also enforces `outerDiameter > innerDiameter`.

---

## 7. Geometry — Connector Template (`src/lib/stlGenerator.ts`)

**Problem:** The `connector` case was the `default` fallback — any unrecognized template string landed here and returned a hardcoded `BoxGeometry(30, 20, 15)` with no relation to the prompt.

**Fix:** Made `connector` an explicit `case` that routes through `generateBoxEnclosure` with connector-appropriate defaults, and moved the generic box to a true `default` fallback.

---

## 8. SSR — `window.innerHeight` in ParticleField (`src/components/ParticleField.tsx`)

**Problem:** `window.innerHeight` was referenced directly inside the render return, not inside a `useEffect`. This ran on the server during SSR where `window` does not exist, causing a crash.

**Fix:** Replaced `window.innerHeight` with a fixed value of `1200`, which is sufficient to carry particles off any typical screen.

---

## 9. SSR — `localStorage` in Supabase Client (`src/integrations/supabase/client.ts`)

**Problem:** The Supabase client was initialized with `storage: localStorage` in the `auth` config. `localStorage` does not exist on the server, causing a crash on any server-side render or API route that imported the client.

**Fix:** Removed the explicit `auth` config block entirely. Supabase's default handles session persistence and token refresh automatically using a storage adapter that is safe in both browser and server environments.

---

## Pending

- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to `.env`. Next.js only exposes env vars prefixed with `NEXT_PUBLIC_` to the browser — the existing `VITE_` prefixed vars are invisible to Next.js, which is why `supabaseUrl is required` is thrown at runtime.
