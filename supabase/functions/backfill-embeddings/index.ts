import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async () => {
  try {
    // Get all professors without embeddings
    const { data: professors, error: fetchError } = await supabase
      .from('scraped_professors')
      .select('email, summary, research_topics')
      .is('vector', null)
      .limit(10); // Process in batches

    if (fetchError) throw fetchError;
    if (!professors || professors.length === 0) {
      return new Response(JSON.stringify({ message: "No professors need embeddings" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Processing ${professors.length} professors...`);

    // Process each professor
    for (const prof of professors) {
      try {
        const textToEmbed = [
          prof.summary || "",
          ...(prof.research_topics || []).join(" ")
        ].join(" ").trim();

        if (!textToEmbed) continue;

        // Generate embedding
        const model = new Supabase.ai.Session('gte-small');
        const embedding = await model.run(textToEmbed, {
          mean_pool: true,
          normalize: true,
        });

        // Save embedding
        const { error: updateError } = await supabase
          .from('scraped_professors')
          .update({ 
            vector: JSON.stringify(embedding),
          })
          .eq('email', prof.email);

        if (updateError) {
          console.error(`Error updating professor ${prof.email}:`, updateError);
          continue;
        }

        console.log(`Processed professor ${prof.email}`);
      } catch (profError) {
        console.error(`Error processing professor ${prof.email}:`, profError);
      }
    }

    return new Response(JSON.stringify({ 
      message: `Processed ${professors.length} professors` 
    }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Error in backfill-embeddings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});