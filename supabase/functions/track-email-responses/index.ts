// Follows the Supabase Edge Functions template
// @ts-ignore - Deno global is available in Supabase Edge Functions
declare const Deno: any;

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Type definitions
interface GmailTokenData {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  user_id: string;
}

interface TrackEmailResponse {
  success: boolean;
  processed: number;
  updated: number;
  error?: string;
}

// Configuration
const CONFIG = {
  BATCH_SIZE: 50,
  RATE_LIMIT_DELAY: 200, // 1 second between Gmail API calls
  MAX_EMAILS_PER_BATCH: 50,
};

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

// Simple rate limiter
class RateLimiter {
  private lastRequestTime = 0;
  private delay: number;

  constructor(delayMs: number) {
    this.delay = delayMs;
  }

  async wait(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.delay) {
      await new Promise(resolve => 
        setTimeout(resolve, this.delay - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }
}

// Check if a Gmail thread has any replies
async function hasReplies(accessToken: string, threadId: string, userId: string): Promise<boolean> {
  if (!accessToken || !threadId) {
    console.error(`[${userId}] Invalid parameters for hasReplies`, { 
      hasAccessToken: !!accessToken,
      hasThreadId: !!threadId 
    });
    return false;
  }

  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/threads/${encodeURIComponent(threadId)}?fields=messages`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
        
        // Handle token expiration specifically
        if (response.status === 401) {
          throw new Error('Token expired or invalid');
        }
      } catch (e) {
        // Failed to parse error response
        console.error(`[${userId}] Failed to parse error response:`, e);
      }
      
      throw new Error(`Gmail API error: ${errorMessage}`);
    }

    const data = await response.json();
    const hasReplies = data.messages && data.messages.length > 1;


    console.log(`[${userId}] Thread ${threadId} has replies: ${hasReplies}`);
    
    return hasReplies;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${userId}] Error checking replies for thread ${threadId}:`, errorMessage);
    
    // Re-throw the error to be handled by the caller
    throw error;
  }
}

// Refresh Gmail access token using direct HTTP call
async function refreshAccessToken(refreshToken: string): Promise<{access_token: string, expires_in: number}> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
      client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Token refresh error:', error);
    throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    expires_in: data.expires_in || 3600
  };
}

// Track email responses for a single user
async function trackUserEmails(
  userId: string,
  rateLimiter: RateLimiter
): Promise<TrackEmailResponse> {
  console.log(`[${userId}] Starting email tracking...`);
  let processed = 0;
  let updated = 0;

  try {
    // Get user's Gmail token
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_oauth_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'gmail')
      .single();

    if (tokenError || !tokenData) {
      const errorMsg = `[${userId}] No Gmail token found`;
      console.error(errorMsg);
      return { success: false, processed: 0, updated: 0, error: errorMsg };
    }
    
    // Check if token is expired and refresh if needed
    const tokenExpiry = new Date(tokenData.expires_at);
    const now = new Date();
    let accessToken = tokenData.access_token;

    if (tokenExpiry <= now) {
      try {
        console.log(`[${userId}] Token expired, refreshing...`);
        const newToken = await refreshAccessToken(tokenData.refresh_token);
        accessToken = newToken.access_token;
        const newExpiry = new Date();
        newExpiry.setSeconds(newExpiry.getSeconds() + newToken.expires_in);
        
        // Update token in database
        const { error: updateError } = await supabase
          .from('user_oauth_tokens')
          .update({ 
            access_token: accessToken, 
            expires_at: newExpiry.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('provider', 'gmail');

        if (updateError) {
          console.error(`[${userId}] Error updating token:`, updateError);
          return { 
            success: false, 
            processed: 0, 
            updated: 0, 
            error: `Failed to update token: ${updateError.message}` 
          };
        }
      } catch (error) {
        const errorMsg = `[${userId}] Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        return { success: false, processed: 0, updated: 0, error: errorMsg };
      }
    }

    // Get email logs that need tracking
    const { data: emailLogs, error: emailsError } = await supabase
      .from('email_logs')
      .select('id, tracking_id, student_id, sent_at, status, pending_email_id, created_at')
      .eq('student_id', userId)
      .or('status.is.null,status.eq.sent')
      .order('created_at', { ascending: false })
      .limit(100);
      
    if (!emailLogs || emailLogs.length === 0) {
      console.log(`[${userId}] No emails found for tracking`);
      return { success: true, processed: 0, updated: 0 };
    }

    if (emailsError) {
      const errorMsg = `[${userId}] Error fetching emails: ${emailsError.message}`;
      console.error(errorMsg);
      return { success: false, processed: 0, updated: 0, error: errorMsg };
    }

    if (!emailLogs?.length) {
      console.log(`[${userId}] No sent emails found`);
      return { success: true, processed: 0, updated: 0 };
    }

    console.log(`[${userId}] Found ${emailLogs.length} sent emails to check`);

    // Define email log type based on the email_logs table schema
    interface EmailLog {
      id: string;
      tracking_id: string;  // This is the Gmail thread ID
      student_id: string;
      pending_email_id: string | null;  // Reference to pending_emails table
      sent_at: string;
      status: string | null;
      campaign_id?: string | null;
      open_count?: number | null;
    }

    // Process email logs in batches
    const BATCH_SIZE = 10;
    let batchUpdated = 0;
    let batchProcessed = 0;

    for (let i = 0; i < emailLogs.length; i += BATCH_SIZE) {
      const batch = emailLogs.slice(i, i + BATCH_SIZE) as EmailLog[];
      const batchPromises = batch.map(async (email: EmailLog) => {
        try {
          await rateLimiter.wait();
          
          // Skip if no tracking_id is available (which is the Gmail thread ID)
          if (!email.tracking_id) {
            console.log(`[${userId}] [OLD_EMAIL] Email ${email.id} has no tracking_id - marking as legacy`);
            try {
              const { error: updateError } = await supabase
                .from('email_logs')
                .update({ status: 'legacy' })
                .eq('id', email.id);
              
              if (updateError) {
                console.error(`[${userId}] Failed to mark email ${email.id} as legacy:`, updateError);
                return { success: false, error: 'Failed to mark as legacy' };
              }
              console.log(`[${userId}] Successfully marked email ${email.id} as legacy`);
              return { success: true, processed: 1, updated: 0, status: 'marked_as_legacy' };
            } catch (error) {
              console.error(`[${userId}] Error marking email ${email.id} as legacy:`, error);
              return { success: false, error: 'Error marking as legacy' };
            }
          }
          
          // Check if this is a new-style tracking ID (Gmail thread ID)
          const isNewStyleId = !email.tracking_id.includes('-');
          if (!isNewStyleId) {
            console.log(`[${userId}] [OLD_EMAIL] Email ${email.id} has old-style tracking ID: ${email.tracking_id} - marking as legacy`);
            try {
              const { error: updateError } = await supabase
                .from('email_logs')
                .update({ status: 'legacy' })
                .eq('id', email.id);
              
              if (updateError) {
                console.error(`[${userId}] Failed to mark email ${email.id} as legacy:`, updateError);
                return { success: false, error: 'Failed to mark as legacy' };
              }
              console.log(`[${userId}] Successfully marked email ${email.id} as legacy`);
              return { success: true, processed: 1, updated: 0, status: 'marked_as_legacy' };
            } catch (error) {
              console.error(`[${userId}] Error marking email ${email.id} as legacy:`, error);
              return { success: false, error: 'Error marking as legacy' };
            }
          }
          
          console.log(`[${userId}] [NEW_EMAIL] Checking replies for email ${email.id} with Gmail thread ID: ${email.tracking_id}`);
          let hasReplied = false;
          try {
            hasReplied = await hasReplies(accessToken, email.tracking_id, userId);
          } catch (error) {
            console.error(`[${userId}] [ERROR] Failed to check replies for email ${email.id}:`, error);
            // Mark as error so we can retry later
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`[${userId}] Error updating email ${email.id}:`, errorMessage);
            await supabase
              .from('email_logs')
              .update({ 
                status: 'error', 
              })
              .eq('id', email.id);
            return { success: false, error: 'Failed to check replies' };
          }
          
          if (hasReplied) {
            const updateData = { 
              status: 'replied'  // Let the database trigger handle updated_at
            };
            
            console.log(`[${userId}] Updating email ${email.id} with:`, JSON.stringify(updateData));
            
            const { error: updateError } = await supabase
              .from('email_logs')
              .update(updateData)
              .eq('id', email.id);
              
            console.log(`[${userId}] Update result for ${email.id}:`, updateError ? `Error: ${updateError.message}` : 'Success');

            if (updateError) {
              console.error(`[${userId}] Error updating email ${email.id}:`, updateError);
              return { success: false };
            }
            batchUpdated++;
          }
          
          batchProcessed++;
          return { success: true, updated: hasReplied };
        } catch (error) {
          const errorMsg = `[${userId}] Error processing email ${email.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(errorMsg);
          return { success: false, error: errorMsg };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      processed += batchProcessed;
      updated += batchUpdated;
      
      // Reset batch counters
      batchProcessed = 0;
      batchUpdated = 0;
      
      // Small delay between batches
      if (i + BATCH_SIZE < emailLogs.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`[${userId}] Processed ${processed} emails, ${updated} updated`);
    return { success: true, processed, updated };
  } catch (error) {
    const errorMessage = `[${userId}] Error in trackUserEmails: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMessage);
    return { 
      success: false, 
      processed: processed, 
      updated: updated, 
      error: errorMessage 
    };
  }
}

// Main function handler
serve(async (req: Request) => {
  try {
    // Verify required environment variables
    const requiredVars = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET'
    ];

    const missingVars = requiredVars.filter(varName => !Deno.env.get(varName));
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Get all users with Gmail tokens
    const { data: users, error: usersError } = await supabase
      .from('user_oauth_tokens')
      .select('user_id, refresh_token, access_token, expires_at')
      .eq('provider', 'gmail');

    if (usersError) {
      throw new Error(`Error fetching users: ${usersError.message}`);
    }

    if (!users?.length) {
      return new Response(
        JSON.stringify({ success: true, message: 'No users with Gmail tokens found' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${users.length} users to process`);
    const rateLimiter = new RateLimiter(CONFIG.RATE_LIMIT_DELAY);

    // Process users in batches
    const results = [];
    for (let i = 0; i < users.length; i += CONFIG.BATCH_SIZE) {
      const batch = users.slice(i, i + CONFIG.BATCH_SIZE);
      
      // Process batch in parallel with rate limiting
      const batchPromises = batch.map((user: { user_id: string }) => 
        trackUserEmails(user.user_id, rateLimiter)
          .catch(error => ({
            userId: user.user_id,
            success: false,
            processed: 0,
            updated: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
          }))
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches
      if (i + CONFIG.BATCH_SIZE < users.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Calculate summary
    const successCount = results.filter(r => r.success).length;
    const processedCount = results.reduce((sum, r) => sum + (r.processed || 0), 0);
    const updatedCount = results.reduce((sum, r) => sum + (r.updated || 0), 0);

    return new Response(
      JSON.stringify({
        success: true,
        usersProcessed: results.length,
        usersSucceeded: successCount,
        usersFailed: results.length - successCount,
        emailsProcessed: processedCount,
        emailsUpdated: updatedCount,
        details: results
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in main handler:', errorMessage);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});