"use client";

import * as React from "react";

export type Guild = {
    id: string;
    name: string;
    icon?: string | null;
};

type GuildsContextValue = {
    guilds: Guild[];
    activeGuild: Guild | null;
    setActiveGuild: (guild: Guild | null) => void;
    loading: boolean;
    error: string | null;
    retryAfterTs: number | null;
    refresh: () => Promise<void>;
};

const GuildsContext = React.createContext<GuildsContextValue | undefined>(
    undefined
);

const SESSION_KEY = "polaris_guilds_cache_v1";

type CachedState = {
    guilds: Guild[];
    activeGuildId: string | null;
    retryAfterTs: number | null;
};

export function useGuilds() {
    const ctx = React.useContext(GuildsContext);
    if (!ctx) {
        throw new Error("useGuilds must be used within GuildsProvider");
    }
    return ctx;
}

export function GuildsProvider({children}: { children: React.ReactNode }) {
    const [guilds, setGuilds] = React.useState<Guild[]>([]);
    const [activeGuild, setActiveGuild] = React.useState<Guild | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);
    const [retryAfterTs, setRetryAfterTs] = React.useState<number | null>(null);

    const lastFetchedAtRef = React.useRef<number | null>(null);
    // "Ever fetched successfully" flag: once true, we don't auto-fetch again in this tab
    const hasSuccessfullyFetchedRef = React.useRef<boolean>(false);
    const cooldownMs = 5_000;

    // Load from sessionStorage once on mount (client only)
    React.useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const raw = window.sessionStorage.getItem(SESSION_KEY);
            if (!raw) return;
            const parsed: CachedState = JSON.parse(raw);
            console.debug("[GuildsProvider] Loaded cached guilds from sessionStorage", {
                guildCount: parsed.guilds?.length ?? 0,
                activeGuildId: parsed.activeGuildId,
                retryAfterTs: parsed.retryAfterTs,
                now: Date.now(),
            });
            setGuilds(parsed.guilds || []);
            if (parsed.guilds?.length) {
                const found =
                    parsed.guilds.find((g) => g.id === parsed.activeGuildId) ??
                    parsed.guilds[0];
                setActiveGuild(found ?? null);
                // We had at least one successful fetch in this tab's history
                hasSuccessfullyFetchedRef.current = true;
            }
            if (parsed.retryAfterTs && parsed.retryAfterTs > Date.now()) {
                setRetryAfterTs(parsed.retryAfterTs);
                setError("Discord rate limit reached. Please try again later.");
            }
        } catch (e) {
            console.warn("[GuildsProvider] Failed to parse session cache", e);
        }
    }, []);

    // Persist to sessionStorage whenever guilds / activeGuild / retryAfterTs change
    React.useEffect(() => {
        if (typeof window === "undefined") return;
        const cached: CachedState = {
            guilds,
            activeGuildId: activeGuild?.id ?? null,
            retryAfterTs,
        };
        try {
            window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(cached));
        } catch (e) {
            console.warn("[GuildsProvider] Failed to write session cache", e);
        }
    }, [guilds, activeGuild, retryAfterTs]);

    const fetchGuilds = React.useCallback(async () => {
        const now = Date.now();
        console.debug("[GuildsProvider] fetchGuilds called", {
            now,
            hasSuccessfullyFetched: hasSuccessfullyFetchedRef.current,
            guildCount: guilds.length,
            lastFetchedAt: lastFetchedAtRef.current,
            retryAfterTs,
        });

        // If we already succeeded once in this tab, do not auto-fetch again.
        if (hasSuccessfullyFetchedRef.current) {
            console.debug("[GuildsProvider] Skipping fetch: already successfully fetched in this tab");
            return;
        }

        if (
            lastFetchedAtRef.current &&
            now - lastFetchedAtRef.current < cooldownMs
        ) {
            console.debug("[GuildsProvider] Skipping fetch: local cooldown", {
                delta: now - lastFetchedAtRef.current,
            });
            return;
        }

        if (retryAfterTs && now < retryAfterTs) {
            console.warn("[GuildsProvider] Skipping fetch: retryAfterTs in future", {
                retryAfterTs,
                remainingMs: retryAfterTs - now,
            });
            return;
        }

        lastFetchedAtRef.current = now;
        setLoading(true);
        setError(null);

        try {
            console.debug("[GuildsProvider] Fetching /api/guilds…");
            const res = await fetch("/api/guilds", {cache: "no-store"});
            console.debug("[GuildsProvider] /api/guilds response", {
                status: res.status,
            });

            if (!res.ok) {
                if (res.status === 429) {
                    let retryAfterSec = 5;
                    try {
                        const body = await res.json();
                        console.warn("[GuildsProvider] 429 body", body);
                        if (typeof body?.retryAfter === "number") {
                            retryAfterSec = body.retryAfter;
                        }
                    } catch (e) {
                        console.warn("[GuildsProvider] Failed to parse 429 body", e);
                    }
                    const ts = Date.now() + retryAfterSec * 1000;
                    setRetryAfterTs(ts);
                    setError("Discord rate limit reached. Please try again later.");
                } else if (res.status === 401) {
                    setError("Unauthorized. Please log in with Discord.");
                } else {
                    setError(`Failed to load guilds from Discord. (status ${res.status})`);
                }
                setGuilds([]);
                setActiveGuild(null);
                return;
            }

            const data = await res.json();
            console.debug("[GuildsProvider] /api/guilds OK, parsed body", {
                count: Array.isArray(data) ? data.length : null,
            });

            const normalized = (data || []).map((g: any) => ({
                id: g.id,
                name: g.name,
                icon: g.icon ?? null,
            })) as Guild[];

            setRetryAfterTs(null);
            setGuilds(normalized);
            hasSuccessfullyFetchedRef.current = true;

            setActiveGuild((prev) => {
                if (!prev) {
                    return normalized[0] ?? null;
                }
                const stillExists = normalized.find((g) => g.id === prev.id);
                return stillExists ?? normalized[0] ?? null;
            });
        } catch (err: any) {
            console.error("[GuildsProvider] Error loading guilds:", err);
            setGuilds([]);
            setActiveGuild(null);
            setError("An unexpected error occurred while loading guilds.");
        } finally {
            setLoading(false);
        }
    }, [guilds.length, retryAfterTs]);

    React.useEffect(() => {
        console.debug("[GuildsProvider] useEffect mount, triggering initial fetch");
        fetchGuilds();
    }, [fetchGuilds]);

    const handleRefresh = React.useCallback(async () => {
        console.debug("[GuildsProvider] manual refresh requested");
        hasSuccessfullyFetchedRef.current = false;
        await fetchGuilds();
    }, [fetchGuilds]);

    return (
        <GuildsContext.Provider
            value={{
                guilds,
                activeGuild,
                setActiveGuild,
                loading,
                error,
                retryAfterTs,
                refresh: handleRefresh,
            }}
        >
            {children}
        </GuildsContext.Provider>
    );
}
