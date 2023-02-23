export async function storeDiscordTokens(userId, tokens) {
  await TOKEN_STORE.put(`discord-${userId}`, JSON.stringify(tokens));
}

export async function getDiscordTokens(userId) {
  return TOKEN_STORE.get(`discord-${userId}`, { type: "json" });
}
