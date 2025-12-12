import {GuildsProvider} from "@/providers/guilds-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <GuildsProvider>
            {children}
        </GuildsProvider>
    )
}