import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  console.log("[/api/guilds/:id] GET", { id })

  const accessToken = await auth.api.getAccessToken({
    body: {
      providerId: "discord",
    },
    headers: await headers(),
  })

  if (
    !accessToken ||
    !accessToken.accessToken ||
    !accessToken.accessTokenExpiresAt
  ) {
    console.warn("[/api/guilds/:id] Missing or invalid access token")
    return new NextResponse("Unauthorized. Please log in with Discord.", {
      status: 401,
    })
  }

  if (new Date(accessToken.accessTokenExpiresAt) < new Date()) {
    console.warn(
      "[/api/guilds/:id] Access token expired at",
      accessToken.accessTokenExpiresAt,
    )
    return new NextResponse("Unauthorized. Access token has expired.", {
      status: 401,
    })
  }

  try {
    console.log("[/api/guilds/:id] Fetching guild from Discord", { id })
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${encodeURIComponent(
        id,
      )}?with_counts=true`,
      {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
        cache: "no-store",
      },
    )

    const data = await res.json()
    console.log("[/api/guilds/:id] Discord response", {
      id,
      status: res.status,
    })

    // Proxy status + body; client decides what to do (401/429/etc.)
    return new NextResponse(JSON.stringify(data), {
      status: res.status,
      headers: { "content-type": "application/json" },
    })
  } catch (e) {
    console.error("[/api/guilds/:id] Failed to fetch guild", e)
    return NextResponse.json(
      { error: "Failed to fetch guild" },
      { status: 500 },
    )
  }
}
