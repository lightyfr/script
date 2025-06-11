/**
 * Tracks email responses by monitoring the Gmail inbox for replies to sent emails.
 *
 * @function trackEmailResponses
 * @returns {Promise<void>}
 */


# Email Response Tracker

This Supabase Edge Function tracks email responses by monitoring the Gmail inbox for replies to sent emails.

## Features

- Tracks replies to sent emails using tracking IDs
- Updates email status in the database when responses are received
- Creates notifications for new responses
- Handles rate limiting and errors gracefully

## Prerequisites

1. Supabase project with Edge Functions enabled
2. Gmail API credentials (OAuth 2.0)
3. Environment variables configured in your Supabase project

## Setup

1. **Environment Variables**

   Add these environment variables to your Supabase project:

   ```
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=your_redirect_uri
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

2. **Database Tables**

   Make sure you have these tables in your database:
   - `email_logs` - Stores sent emails with tracking information
   - `notifications` - Stores notifications for users
   - `user_oauth_tokens` - Stores OAuth tokens for Gmail API access

3. **Deploy the Function**

   ```bash
   # Install Supabase CLI if you haven't
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Deploy the function
   supabase functions deploy track-email-responses
   ```

## Usage

The function is designed to be triggered by a cron job. You can set it up in the Supabase dashboard:

1. Go to the Edge Functions section
2. Find `track-email-responses`
3. Set up a schedule (e.g., every 5 minutes)

## How It Works

1. The function queries the database for users with Gmail OAuth tokens
2. For each user, it retrieves their sent emails that haven't been marked as replied to
3. It searches the user's Gmail inbox for replies containing the tracking ID
4. When a reply is found, it updates the email status and creates a notification

## Error Handling

The function includes comprehensive error handling:
- Invalid or expired tokens are skipped
- Failed API calls are logged and the function continues with the next email
- Rate limiting is implemented with delays between API calls

## Monitoring

Check the function logs in the Supabase dashboard to monitor its operation and troubleshoot any issues.
