import React, {JSX} from "react";
import {Navbar} from "@/components/navbar";
import {ToggleTheme} from "@/features/theme/theme-toggle";
import {Footer} from "@/components/footer";

export default function Layout({ children}: { children: JSX.Element}) {
    return (
        <>
            <Navbar/>
            {children}
            <div className={"fixed bottom-4 right-4 z-50"}>
                <ToggleTheme/>
            </div>
            <Footer/>
        </>
    )
}