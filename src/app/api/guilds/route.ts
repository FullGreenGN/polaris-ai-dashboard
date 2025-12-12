// app/api/guilds/route.ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { fetchManagableGuilds } from '@/types/discord';
import { headers } from "next/headers";

// Simple in-memory throttle + single-flight
let lastDiscordCallTs: number | null = null;
const DISCORD_COOLDOWN_MS = 5_000;

// Single-flight promise so concurrent requests share one Discord call
let inflightPromise: Promise<any> | null = null;

export async function GET() {
    const now = Date.now();
    console.log("[/api/guilds] GET called at", new Date(now).toISOString(), {
        lastDiscordCallTs,
        hasInflight: !!inflightPromise,
    });

    // Local cooldown: if we recently hit Discord (success or 429), just tell the client to back off.
    if (lastDiscordCallTs && now - lastDiscordCallTs < DISCORD_COOLDOWN_MS) {
        const retryAfter = (DISCORD_COOLDOWN_MS - (now - lastDiscordCallTs)) / 1000;
        console.warn("[/api/guilds] Local cooldown active, returning 429", {
            retryAfter,
        });
        return NextResponse.json(
            { error: "Discord rate limit (local cooldown)", retryAfter },
            { status: 429 },
        );
    }

    const accessToken = await auth.api.getAccessToken({
        body: {
            providerId: "discord",
        },
        headers: await headers()
    });

    if (!accessToken || !accessToken.accessToken || !accessToken.accessTokenExpiresAt) {
        console.warn("[/api/guilds] Missing or invalid access token");
        return new NextResponse("Unauthorized. Please log in with Discord.", { status: 401 });
    }

    if (new Date(accessToken.accessTokenExpiresAt) < new Date()) {
        console.warn("[/api/guilds] Access token expired at", accessToken.accessTokenExpiresAt);
        return new NextResponse("Unauthorized. Access token has expired.", { status: 401 });
    }

    // If there is already a Discord call in flight, re-use that promise ("single-flight")
    if (inflightPromise) {
        console.log("[/api/guilds] Joining inflight Discord request");
        try {
            const manageableGuilds = await inflightPromise;
            return NextResponse.json(manageableGuilds);
        } catch (error: any) {
            console.error("[/api/guilds] Inflight promise rejected", error);
            return handleDiscordError(error);
        }
    }

    try {
        lastDiscordCallTs = now;
        console.log("[/api/guilds] Calling fetchManagableGuilds with Discord access token");
        inflightPromise = fetchManagableGuilds(accessToken.accessToken, process.env.DISCORD_BOT_TOKEN!)
        const manageableGuilds = await inflightPromise;
        console.log("[/api/guilds] Discord guilds fetched successfully", {
            count: Array.isArray(manageableGuilds) ? manageableGuilds.length : null,
        });
        return NextResponse.json(manageableGuilds);
    } catch (error: any) {
        console.error("[/api/guilds] Error from fetchManagableGuilds", error);
        return handleDiscordError(error);
    } finally {
        inflightPromise = null;
    }
}

function handleDiscordError(error: any) {
    if (error instanceof Error && error.message.includes("You are being rate limited")) {
        let retryAfter = 1;
        try {
            const match = error.message.match(/"retry_after":\s*([0-9.]+)/);
            if (match && match[1]) {
                retryAfter = parseFloat(match[1]) || 1;
            }
        } catch {
            // ignore parsing issues
        }
        const retryAt = Date.now() + retryAfter * 1000;
        lastDiscordCallTs = retryAt; // use as local cooldown marker (ms)

        console.warn("[/api/guilds] Discord 429 detected, returning 429 to client", {
            retryAfter,
            retryAt: new Date(retryAt).toISOString(),
        });

        return NextResponse.json(
            { error: "Discord rate limit reached", retryAfter },
            { status: 429 },
        );
    }

    console.error("[/api/guilds] Non-rate-limit error fetching guilds:", error);
    return new NextResponse("An internal error occurred while retrieving guilds.", { status: 500 });
}