import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req: Request) => {
  try {
    const { campaignId } = await req.json();
    // Check if all emails for this campaign are sent or failed
    const { count, error } = await supabase
      .from("pending_emails")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", campaignId)
      .in("status", ["pending"]);
    if (error) throw new Error(`Failed to count pending emails: ${error.message}`);
    if (count === 0) {
      // All emails processed, mark campaign as completed
      await supabase.from("campaigns").update({ status: "completed" }).eq("id", campaignId);
    }
    return new Response(JSON.stringify({ success: true, pending: count }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
