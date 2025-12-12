"use client"
import React from "react";
import { Sheet, SheetContent, SheetFooter } from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { FaInfinity } from "react-icons/fa";
import { AuthButtons } from "@/features/auth/auth-buttons";
import {CiMenuBurger} from "react-icons/ci";

export function Navbar() {
    const [open, setOpen] = React.useState(false);

    const links = [
        {
            label: "Features",
            href: "#",
        },
        {
            label: "Pricing",
            href: "#",
        },
        {
            label: "About",
            href: "#",
        },
    ];

    return (
        <header
            className={cn(
                // center the fixed header on screen
                "fixed top-5 left-1/2 transform -translate-x-1/2 z-50",
                // width constraint and styling
                "w-full max-w-6xl rounded-lg border shadow",
                "bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur-lg"
            )}
        >
            <nav className="mx-auto flex items-center justify-between p-1.5">
                <Link
                    href={"https://polarisdev.fr"}
                    className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 duration-100"
                >
                    <FaInfinity className="h-5 w-5" />
                    <p className="font-mono text-base font-bold"> / AI</p>
                </Link>
                <div className="hidden items-center gap-1 lg:flex">
                    {links.map((link, idx) => (
                        <Link
                            key={idx}
                            className={buttonVariants({ variant: "ghost", size: "sm" })}
                            href={link.href}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <AuthButtons />
                    <Sheet open={open} onOpenChange={setOpen}>
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setOpen(!open)}
                            className="lg:hidden"
                        >
                            <CiMenuBurger className="h-4 w-4" />
                        </Button>
                        <SheetContent
                            className="bg-background/95 supports-[backdrop-filter]:bg-background/80 gap-0 backdrop-blur-lg"
                            side="left"
                        >
                            <div className="grid gap-y-2 overflow-y-auto px-4 pt-12 pb-5">
                                {links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        className={buttonVariants({
                                            variant: "ghost",
                                            className: "justify-start",
                                        })}
                                        href={link.href}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                            <SheetFooter>
                                <Button variant="outline">Sign In</Button>
                                <Button>Get Started</Button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </header>
    );
}