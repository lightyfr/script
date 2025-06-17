// supabase/functions/generate-professor-embedding/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { record } = payload;
    
    // Generate embedding from summary and research topics
    const textToEmbed = [
      record.summary || "",
      ...(record.research_topics || []).join(" ")
    ].join(" ").trim();

    if (!textToEmbed) {
      return new Response(JSON.stringify({ error: "No text to generate embedding" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Generate embedding using Supabase's built-in model
    const model = new Supabase.ai.Session('gte-small');
    const embedding = await model.run(textToEmbed, {
      mean_pool: true,
      normalize: true,
    });

    // Update the professor record with the new embedding
    const { data, error } = await supabase
      .from('scraped_professors')
      .update({ 
        vector: JSON.stringify(embedding),
      })
      .eq('email', record.email)
      .select()
      .single();

    if (error) throw error;

    console.log(`Generated embedding for professor ${record.email}, ${data}`);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Error in generate-professor-embedding:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});