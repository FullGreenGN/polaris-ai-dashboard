// lib/discord.ts (No discord.js dependency)

const DISCORD_API_URL = 'https://discord.com/api/v10';

interface GuildAPIResponse {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: string; // The permission bitwise integer string
}


/**
 * Fetches all guilds for the user using their access token and returns only
 * the subset of guilds where the bot (provided via botToken) is also present.
 *
 * NOTE: This requires a valid Bot token (prefix-less, e.g. `Nz...`) with which
 * we call GET /guilds/:id. If the bot token is invalid the function will throw.
 *
 * @param accessToken - OAuth2 access token for the user
 * @param botToken - Bot token used to verify presence in guilds (required)
 */
export async function fetchManagableGuilds(accessToken: string, botToken: string): Promise<GuildAPIResponse[]> {
    if (!botToken) {
        throw new Error('botToken is required to filter guilds by bot presence');
    }

    const response = await fetch(`${DISCORD_API_URL}/users/@me/guilds`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'DiscordBotDashboard (YourAppName/1.0)',
        },
        cache: 'no-store',
    });

    if (!response.ok) {
        console.error(`Discord API fetch failed with status ${response.status}`);
        // Log the full response body if the status is a 401 or 403 for better debugging
        const errorText = await response.text();
        throw new Error(`Failed to fetch guilds from Discord API: ${errorText}`);
    }

    const guilds: GuildAPIResponse[] = await response.json();

    // For each guild returned for the user, check whether the bot is present by
    // attempting to GET /guilds/:id with the Bot token. If the bot is in the guild
    // the endpoint should return 200. Use Promise.allSettled to avoid failing the
    // whole operation if one call errors.
    const botChecks = await Promise.allSettled(
        guilds.map((guild) =>
            fetch(`${DISCORD_API_URL}/guilds/${guild.id}`, {
                headers: {
                    Authorization: `Bot ${botToken}`,
                    'User-Agent': 'DiscordBotDashboard (YourAppName/1.0)',
                },
                cache: 'no-store',
            })
        )
    );

    // If the bot token is invalid/unauthorized we'll likely see 401 responses for
    // many/most checks. Detect and throw a helpful error in that case.
    const anyUnauthorized = botChecks.some((r) => r.status === 'fulfilled' && r.value.status === 401);
    if (anyUnauthorized) {
        throw new Error('Bot token unauthorized when checking guild presence (received 401)');
    }

    // Build final list of guilds where the bot is present (response.ok === true)
    return guilds.filter((_, idx) => {
        const result = botChecks[idx];
        if (result.status !== 'fulfilled') return false; // network/error
        const res = result.value;
        // If the bot isn't in the guild the endpoint normally returns 403/404.
        return res.ok;
    });
}