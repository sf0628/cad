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

    const systemPrompt = `You are an engineering design AI. Analyze the user's request and return a JSON response with:
1. "template": one of "enclosure", "bracket", "mount", "plate", "handle", "connector"
2. "params": parameters for the selected template
3. "documentation": a detailed Markdown engineering report

The documentation should include:
- Title and overview
- Design specifications with dimensions
- Material recommendations
- Manufacturing notes (3D printing guidelines)
- Design rationale
- Potential improvements

Be technical and professional. Use metric units (mm).`;

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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || '';

    // Parse the response
    let result = { template: productType, params: {}, documentation: '' };
    
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        result = { ...result, ...parsed };
      }
      
      // If no structured response, use the content as documentation
      if (!result.documentation && content) {
        result.documentation = content;
      }
    } catch (parseError) {
      console.log('Using content as documentation');
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
