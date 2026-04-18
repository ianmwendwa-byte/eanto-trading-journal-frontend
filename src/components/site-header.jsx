import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "./mode-toggle"
import { NavUser } from "./nav-user"
import { useAuth } from "@/app/context/AuthContext"

export function SiteHeader() {
  const { user } = useAuth()

  // fallback (in case user is null during loading)
  if (!user) return null

  return (
    <header
      className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-6" />
        <h1 className="text-base font-medium">Eanto Trading Journal</h1>
      </div>

      {/* Theme + User */}
      <div className="flex items-center gap-2 px-4 lg:px-6">
        {/* Mode Toggle (aligned like NavUser trigger) */}
        <div className="flex items-center">
          <div className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted transition">
            <ModeToggle />
          </div>
        </div>

        <NavUser
          user={{
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: user.avatar || "",
          }}
        />
      </div>
    </header>
  )
}
