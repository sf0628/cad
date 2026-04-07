import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, productType, useCase, complexity } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an engineering design AI that generates parametric 3D model specifications.

Return ONLY a valid JSON object with no markdown fences, no explanation — just the JSON.

The top-level structure must be:
{
  "template": "<one of: enclosure | bracket | mount | plate | handle | connector>",
  "documentation": "<detailed Markdown engineering report>",
  "<template_key>": { ... }
}

The template_key and its required fields for each template:

"enclosure" → key "box":
  width (mm), height (mm), depth (mm), wallThickness (mm, 1–5),
  hasLid (boolean), hasVents (boolean), ventCount (integer 0–12),
  hasMountingHoles (boolean), cornerRadius (mm, 0–10)

"bracket" → key "bracket":
  armLength1 (mm), armLength2 (mm), thickness (mm, 2–15),
  width (mm), holeCount (integer 0–6), holeDiameter (mm, 2–10)

"mount" → key "cylinder":
  innerDiameter (mm), outerDiameter (mm, must exceed innerDiameter),
  height (mm), hasTabs (boolean), tabCount (integer 0–6), tabWidth (mm)

"plate" → key "plate":
  width (mm), height (mm), thickness (mm, 1–10),
  holeGridX (integer 0–8), holeGridY (integer 0–8),
  holeDiameter (mm, 1–10), hasRoundedCorners (boolean)

"handle" → key "handle":
  length (mm), width (mm), height (mm),
  curveRadius (mm, 3–20), hasGripTexture (boolean)

"connector" → key "box" with small connector-appropriate dimensions.

The documentation field must be a Markdown engineering report with:
- Title and overview
- All dimensions in mm
- Material recommendations table (PLA/ABS/PETG per use case)
- 3D printing guidelines (orientation, layer height, infill %, supports)
- Design rationale tied specifically to the user's request
- Potential improvements

Choose dimensions that are realistic and appropriate for the stated use case and complexity.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Design request: ${prompt}\nProduct type: ${productType}\nUse case: ${useCase}\nComplexity: ${complexity}` },
        ],
        temperature: 0,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || '';

    // Parse the response — with json_object mode, content should be clean JSON
    let result: Record<string, unknown> = { template: productType, documentation: '' };

    try {
      // Strip markdown fences if the gateway ignores response_format
      const stripped = content.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(stripped);
      result = { ...result, ...parsed };
    } catch (parseError) {
      console.error('JSON parse failed, using content as documentation');
      result.documentation = content;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
