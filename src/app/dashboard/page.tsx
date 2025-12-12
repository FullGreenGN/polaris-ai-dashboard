"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useGuilds, GuildsProvider } from "@/providers/guilds-provider"
import React from "react"

type GuildDetails = {
  id: string
  name: string
  icon?: string | null
  description?: string | null
  member_count?: number
  approximate_member_count?: number
}

function DashboardContent() {
  const { activeGuild, error: guildError, loading: guildsLoading } = useGuilds()
  const [details, setDetails] = React.useState<GuildDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = React.useState(false)
  const [detailsError, setDetailsError] = React.useState<string | null>(null)

  React.useEffect(() => {
    console.debug("[DashboardContent] render", {
      activeGuildId: activeGuild?.id,
      loadingGuilds: guildsLoading,
      guildError,
      detailsLoading,
      detailsError,
    })
  }, [activeGuild?.id, guildsLoading, guildError, detailsLoading, detailsError])

  // Fetch extra guild info on activeGuild change
  React.useEffect(() => {
    if (!activeGuild) {
      setDetails(null)
      setDetailsError(null)
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        setDetailsLoading(true)
        setDetailsError(null)
        console.debug("[DashboardContent] Fetching /api/guilds/[id] for details", {
          id: activeGuild.id,
        })
        const res = await fetch(`/api/guilds/${activeGuild.id}`, {
          cache: "no-store",
        })
        if (!res.ok) {
          if (res.status === 401) {
            // Soft message; we still show base guild info
            setDetailsError("Guild details are not available for this session.")
          } else if (res.status === 429) {
            setDetailsError("Discord rate limit reached for guild details. Try again later.")
          } else {
            setDetailsError(`Failed to load guild details. (status ${res.status})`)
          }
          return
        }
        const data = await res.json()
        if (cancelled) return
        setDetails({
          id: data.id,
          name: data.name,
          icon: data.icon ?? null,
          description: data.description ?? null,
          member_count: data.member_count ?? undefined,
          approximate_member_count: data.approximate_member_count ?? undefined,
        })
      } catch (e) {
        console.error("[DashboardContent] Error fetching guild details", e)
        if (!cancelled) {
          setDetailsError("Unexpected error while loading guild details.")
        }
      } finally {
        if (!cancelled) setDetailsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [activeGuild])

  if (!activeGuild) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">
            {guildsLoading ? "Loading Discord guilds…" : "No Discord guild selected"}
          </p>
          <p className="mt-1 text-sm">
            {guildError ??
              "Select a server from the sidebar to see its overview."}
          </p>
        </div>
      </div>
    )
  }

  const displayName = details?.name ?? activeGuild.name
  const memberCount =
    details?.approximate_member_count ?? details?.member_count ?? null
  const description =
    details?.description ?? "Basic overview of your selected Discord guild."

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  Discord Workspace
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{displayName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-muted/50 flex flex-col justify-between rounded-xl p-4">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Guild
              </p>
              <p className="mt-1 text-lg font-semibold">{displayName}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                ID: <span className="font-mono">{activeGuild.id}</span>
              </p>
            </div>
            {detailsLoading && (
              <p className="mt-3 text-[11px] text-muted-foreground">
                Syncing details from Discord…
              </p>
            )}
          </div>

          <div className="bg-muted/50 flex flex-col justify-between rounded-xl p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Members
            </p>
            <p className="mt-1 text-3xl font-semibold">
              {memberCount !== null ? memberCount : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {memberCount !== null
                ? "Approximate member count from the Discord API."
                : "Member stats not available yet."}
            </p>
          </div>

          <div className="bg-muted/50 flex flex-col justify-between rounded-xl p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Description
            </p>
            <p className="mt-1 text-sm">
              {description}
            </p>
          </div>
        </div>

        {detailsError && (
          <div className="bg-destructive/10 text-destructive mt-1 rounded-md px-3 py-2 text-xs">
            {detailsError}
          </div>
        )}

        <div className="bg-muted/50 flex-1 rounded-xl p-4 md:min-h-min">
          <p className="text-sm font-medium">
            Activity
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            This area is ready for your guild analytics (channels, messages, bots, etc.).
          </p>
        </div>
      </div>
    </>
  )
}

export default function Page() {
  return (
    <SidebarProvider>
      <GuildsProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardContent />
        </SidebarInset>
      </GuildsProvider>
    </SidebarProvider>
  )
}
