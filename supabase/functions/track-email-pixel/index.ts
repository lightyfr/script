import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

declare const Deno: any;

// Create a 1x1 transparent GIF pixel
const PIXEL = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

serve(async (req: { url: any; }) => {
  try {
    const url = new URL(req.url);
    const emailId = url.searchParams.get('id');
    
    if (!emailId) {
      return new Response('Missing email ID', { status: 400 });
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update the open_count in email_logs
    const { data: existingLog, error: fetchError } = await supabaseClient
      .from('email_logs')
      .select('open_count')
      .eq('tracking_id', emailId)
      .single();

    if (fetchError) {
      console.error('Error fetching email log:', fetchError);
      throw fetchError;
    }

    // Increment the open_count or set to 1 if null
    const newOpenCount = (existingLog?.open_count || 0) + 1;
    
    const { error: updateError } = await supabaseClient
      .from('email_logs')
      .update({ 
        open_count: newOpenCount,
        updated_at: new Date().toISOString()
      })
      .eq('tracking_id', emailId);

    if (updateError) {
      console.error('Error updating email open count:', updateError);
      throw updateError;
    }

    // Return the 1x1 transparent GIF
    return new Response(atob(PIXEL), {
      headers: {
        'Content-Type': 'image/gif',
        'Content-Length': '43',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });
  } catch (error) {
    console.error('Error in track-email-pixel:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
});
