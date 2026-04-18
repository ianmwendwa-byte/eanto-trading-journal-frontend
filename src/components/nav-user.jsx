import { useAuth } from "@/app/context/AuthContext"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import {
  CircleUserRoundIcon,
  CreditCardIcon,
  LogOutIcon,
} from "lucide-react"

export function NavUser({ user }) {
  const { isMobile } = useSidebar()
  const { logout } = useAuth()

  return (
    <SidebarMenu>
      <SidebarMenuItem>

        <DropdownMenu>

          {/* Trigger (Avatar) */}
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground  p-0 h-auto
      w-auto   hover:bg-muted "
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user?.firstName?.[0] || "E"}
                  {user?.lastName?.[0] || "J"}
                </AvatarFallback>
              </Avatar>
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          {/* Dropdown Content */}
          <DropdownMenuContent
            className="w-56 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={8}
          >

            {/* User Info */}
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-2 text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user?.firstName?.[0] || "E"}
                    {user?.lastName?.[0] || "J"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <span className="font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Menu Items */}
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <CircleUserRoundIcon className="mr-2 h-4 w-4" />
                Account
              </DropdownMenuItem>

              <DropdownMenuItem>
                <CreditCardIcon className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Logout */}
            <DropdownMenuItem
                onClick={() => logout()}
                className="text-red-500 cursor-pointer focus:text-red-500 focus:bg-red-50"
            >
                <LogOutIcon className="mr-2 h-4 w-4" />
                Log out
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>

      </SidebarMenuItem>
    </SidebarMenu>
  )
}