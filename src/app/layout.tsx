import type { Metadata } from "next";
import {JetBrains_Mono} from "next/font/google";
import "./globals.css";
import {Providers} from "@/components/providers";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Polaris - AI",
  description: "The ultimate AI-powered Discord bot management platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={` ${jetbrainsMono.variable} antialiased`}
      >
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  );
}
