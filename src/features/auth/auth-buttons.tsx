import {useSession} from "@/lib/auth-client";
import {UserDropdown} from "@/features/user/user-dropdown";
import {Button} from "@/components/ui/button";
import React from "react";
import Link from "next/link";

export function AuthButtons() {
    const { data: session } = useSession()

    return (
        <>
            {session?.user ? (
                <UserDropdown/>
                ) : (
                    <>
                        <Button size="sm">
                            <Link href={"/login"}>
                                Login
                            </Link>
                        </Button>
                    </>
                )
            }
        </>
    )
}