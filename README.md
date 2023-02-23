## This is a fork using [Cloudflare Workers](https://workers.cloudflare.com/)

Some instructions might not have been ported correctly but the code is sound. A GH action is also included to automatically deploy to your CF worker on changes to the repository

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mchangrh/linked-roles-workers)

-----

# Linked Role example app

This repository contains the documentation and example for a linked role bot.

## Project structure
All of the files for the project are on the left-hand side. Here's a quick glimpse at the structure:

```
├── assets          -> Images used in this tutorial
├── src
│   ├── discord.js  -> Discord specific auth & API wrapper
│   ├── register.js -> Tool to register the metadata schema
│   ├── server.js   -> Main entry point for the application
│   ├── storage.js  -> Provider for storing OAuth2 tokens
├── .gitignore
├── package.json
└── README.md
```

## Running app locally

Before you start, you'll need to [create a Discord app](https://discord.com/developers/applications) with the `bot` scope

Configuring the app is covered in detail in the [tutorial](https://discord.com/developers/docs/tutorials/configuring-app-metadata-for-linked-roles).

### Setup project

First clone the project:
```
git clone https://github.com/mchangrh/linked-roles-workers.git
```

Then navigate to its directory and install dependencies:
```
cd linked-roles-worker
npm install
```

### Get app credentials

Fetch the credentials from your app's settings and add them to your Cloudflare Worker Environment. You'll need your bot token (`DISCORD_TOKEN`), client ID (`DISCORD_CLIENT_ID`), client secret (`DISCORD_CLIENT_SECRET`). You'll also need a redirect URI (`DISCORD_REDIRECT_URI`) and a randomly generated UUID (`COOKIE_SECRET`), which are both explained below:

```
DISCORD_CLIENT_ID: <your OAuth2 client Id>
DISCORD_CLIENT_SECRET: <your OAuth2 client secret>
DISCORD_TOKEN: <your bot token>
DISCORD_REDIRECT_URI: https://<your-worker-url>/discord-oauth-callback
COOKIE_SECRET: <random generated UUID>
```

For the UUID (`COOKIE_SECRET`), you can run the following commands:

```
$ node
crypto.randomUUID()
```

### Token Storage K/V

Bind a Cloudflare K/V store to `TOKEN_STORE`. This will take the place of the in-memory token store

Fetching credentials is covered in detail in the [linked roles tutorial](https://discord.com/developers/docs/tutorials/configuring-app-metadata-for-linked-roles).

### Running your app

Just once, you need to register you connection metadata schema. Go to

```
https://example.workers.dev/register
```

### Set up interactivity

The project needs a public endpoint where Discord can send requests.

Copy the worker address that starts with `https://`, in this case `https://discord-linked.workers.dev`, then go to your [app's settings](https://discord.com/developers/applications).

On the **General Information** tab, there will be an **Linked Roles Verification URL**. Paste your ngrok address there, and append `/linked-role` (`https://example.workers.dev/linked-role` in the example).

You should also paste your ngrok address into the `DISCORD_REDIRECT_URI` variable in your `.env` file, with `/discord-oauth-callback` appended (`https://example.workers.dev/discord-oauth-callback` in the example). Then go to the **General** tab under **OAuth2** in your [app's settings](https://discord.com/developers/applications), and add that same address to the list of **Redirects**.

Click **Save Changes** and restart your app.

## Other resources
- Read **[the tutorial](https://discord.com/developers/docs/tutorials/configuring-app-metadata-for-linked-roles)** for in-depth information.
- Join the **[Discord Developers server](https://discord.gg/discord-developers)** to ask questions about the API, attend events hosted by the Discord API team, and interact with other devs.