import { GalleryVerticalEnd } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {Logo} from "@/components/ui/logo";
import {siteConfig} from "@/lib/site-config";
import {FaDiscord} from "react-icons/fa6";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-2 text-center">
            <Logo showIcon={true} displayInline={true} fullDisplay={false}/>
            <h1 className="text-xl font-bold">Welcome to {siteConfig.title}</h1>
        </div>
        <Field>
            <Button variant="outline" type="button">
                <FaDiscord className={"mr-2 h-4 w-4"} />
                Continue with Discord
            </Button>
        </Field>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
