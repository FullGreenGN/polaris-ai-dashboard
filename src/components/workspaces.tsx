"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useGuilds } from "@/providers/guilds-provider"

export function Workspaces() {
  const { isMobile } = useSidebar()
  const {
    guilds,
    activeGuild,
    setActiveGuild,
    loading,
    error,
    retryAfterTs,
  } = useGuilds()

  React.useEffect(() => {
    console.debug("[Workspaces] state", {
      guildCount: guilds.length,
      activeGuildId: activeGuild?.id,
      loading,
      error,
      retryAfterTs,
      now: Date.now(),
    })
  }, [guilds.length, activeGuild?.id, loading, error, retryAfterTs])

  React.useEffect(() => {
    // Auto-select only if there is no selection yet
    if (!activeGuild && guilds.length) {
      setActiveGuild(guilds[0])
    }
  }, [guilds, activeGuild, setActiveGuild])

  if (loading && !guilds.length) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="bg-sidebar-primary/50 flex aspect-square size-8 animate-pulse items-center justify-center rounded-lg" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Loading guilds…</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (error && !guilds.length) {
    const retryMsg =
      retryAfterTs && retryAfterTs > Date.now()
        ? `Try again in ~${Math.ceil(
            (retryAfterTs - Date.now()) / 1000,
          )}s.`
        : "You can reload the page later to retry."

    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="bg-destructive/10 text-destructive flex aspect-square size-8 items-center justify-center rounded-lg">
              !
            </div>
            <div className="grid flex-1 text-left text-xs leading-tight">
              <span className="truncate font-medium">Failed to load guilds</span>
              <span className="truncate">
                {error} {retryMsg}
              </span>
              <span className="truncate text-[10px] opacity-70">
                debug: retryAfterTs={retryAfterTs ?? "null"}
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (!guilds.length) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <Plus className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">No guilds</span>
              <span className="truncate text-xs">
                Connect a Discord server
              </span>
            </div>
            <ChevronsUpDown className="ml-auto" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (!activeGuild) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="bg-sidebar-primary/50 flex aspect-square size-8 animate-pulse items-center justify-center rounded-lg" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Loading guild…</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const iconUrl = (g: { id: string; icon?: string | null }) =>
    g.icon
      ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`
      : undefined

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
                {iconUrl(activeGuild) ? (
                  <img
                    src={iconUrl(activeGuild)}
                    alt={activeGuild.name}
                    className="size-8 object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium">
                    {activeGuild.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeGuild.name}
                </span>
                <span className="truncate text-xs">Discord guild</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Guilds
            </DropdownMenuLabel>
            {guilds.map((guild, index) => (
              <DropdownMenuItem
                key={guild.id}
                onClick={() => setActiveGuild(guild)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border overflow-hidden">
                  {iconUrl(guild) ? (
                    <img
                      src={iconUrl(guild)}
                      alt={guild.name}
                      className="size-6 object-cover"
                    />
                  ) : (
                    <span className="text-xs font-medium">
                      {guild.name.charAt(0)}
                    </span>
                  )}
                </div>
                {guild.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Add guild
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
