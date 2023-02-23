import * as discord from './discord.js';
import { register } from './register.js';
import * as storage from './storage.js';

async function handler(request) {
  const { pathname, searchParams } = new URL(request.url);
  switch (pathname) {
    case "/linked-role":
      const { url, state } = discord.getOAuthUrl();
      const newCookie = `clientState=${state}; secure; SameSite=Lax; Max-Age=300000`;
      return new Response(null, {
        headers: {
          'Set-Cookie': newCookie,
          'Location': url
        }, status: 302
      });
    case "/discord-oauth-callback":
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        // 1. Uses the code and state to acquire Discord OAuth2 tokens    
        // make sure the state parameter exists
        const cookie = request.headers.get('Cookie').split("=")
        const clientState = request.headers.get('Cookie').split("=")[1]
        if (clientState !== state) {
          console.error('State verification failed.');
          return new Response(null, { status: 403 });
        }
    
        const tokens = await discord.getOAuthTokens(code);
    
        // 2. Uses the Discord Access Token to fetch the user profile
        const meData = await discord.getUserData(tokens);
        const userId = meData.user.id;
        await storage.storeDiscordTokens(userId, {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: Date.now() + tokens.expires_in * 1000,
        });
    
        // 3. Update the users metadata, assuming future updates will be posted to the `/update-metadata` endpoint
        await updateMetadata(userId);
    
        return new Response('You did it!  Now go back to Discord.');
      } catch (e) {
        console.error(e);
        return new Response(null, { status: 500 });
      }
    case "/update-metadata":
      try {
        const body = await request.json();
        const userId = body.userId;
        await updateMetadata(userId)
        return new Response(null, { status: 204 });
      } catch (e) {
        return new Response(null, { status: 500 });
      }
    case "/register":
      await register()
      return new Response(null, { status: 204 });
    default:
      return new Response('Not Found', { status: 404 });
  }
}

// Initialize Worker
addEventListener('fetch', event => {
  event.respondWith(handler(event.request));
});

/**
 * Given a Discord UserId, push static make-believe data to the Discord 
 * metadata endpoint. 
 */
async function updateMetadata(userId) {
  // Fetch the Discord tokens from storage
  const tokens = await storage.getDiscordTokens(userId);
    
  let metadata = {};
  try {
    // Fetch the new metadata you want to use from an external source. 
    // This data could be POST-ed to this endpoint, but every service
    // is going to be different.  To keep the example simple, we'll
    // just generate some random data. 
    metadata = {
      cookieseaten: 1483,
      allergictonuts: 0, // 0 for false, 1 for true
      firstcookiebaked: '2003-12-20',
    };
  } catch (e) {
    e.message = `Error fetching external data: ${e.message}`;
    console.error(e);
    // If fetching the profile data for the external service fails for any reason,
    // ensure metadata on the Discord side is nulled out. This prevents cases
    // where the user revokes an external app permissions, and is left with
    // stale linked role data.
  }

  // Push the data to Discord.
  await discord.pushMetadata(userId, tokens, metadata);
}