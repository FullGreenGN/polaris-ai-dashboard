import {siteConfig} from "@/lib/site-config";
import {FaInfinity} from "react-icons/fa";
import {cn} from "@/lib/utils";

interface LogoProps {
    fullDisplay?: boolean
    showIcon?: boolean,
    displayInline?: boolean
}

export function Logo(props: LogoProps) {
    return (
        <div className={cn(props.displayInline ? "flex flex-col items-center gap-2 font-medium" : "flex items-center")}>
            {props.showIcon && (
                <div className={"flex size-8 items-center justify-center rounded-md"}>
                    <FaInfinity/>
                </div>
            )}
            {props.fullDisplay && (
                <span className="ml-2 font-bold">{siteConfig.title}</span>
            )}
        </div>
    )
}