import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "./mode-toggle";
import { NavUser } from "./nav-user";

const data = {
  user: {
    name: "Eanto J.",
    email: "eanto@example.com",
    avatar: "/avatars/shadcn.jpg",
  },  
}

export function SiteHeader() {
  return (
    <header
      className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) ">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-6" />
        <h1 className="text-base font-medium">Eanto Trading Journal</h1>
      </div>
      {/* Theme Toggle */}
      <div className="flex items-center gap-2 px-4 lg:px-6">
        <ModeToggle />
        <div>
          <NavUser user={data.user} />
        </div>
      </div>
    </header>
  );
}
