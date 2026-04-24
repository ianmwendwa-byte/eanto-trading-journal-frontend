import { useState } from "react"

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
} from "@/components/ui/sidebar"

import {
  CircleUserRoundIcon,
  CreditCardIcon,
  LogOutIcon,
} from "lucide-react"

import { useAuth } from "@/app/context/AuthContext"
import { ProfileSheet } from "./user-profile-sheet"


export function NavUser() {
  const { user, logout } = useAuth()

  const [openProfile, setOpenProfile] = useState(false)

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>

          <DropdownMenu>

            {/* ─── Trigger (Avatar) ───────────────────────── */}
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="icon"
                className="
                  p-0
                  hover:bg-transparent
                  focus:bg-transparent
                  data-[state=open]:bg-transparent
                "
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.avatar} alt={user?.email} />
                  <AvatarFallback className="rounded-lg">
                    {user?.firstName?.[0] || "E"}
                    {user?.lastName?.[0] || "J"}
                  </AvatarFallback>
                </Avatar>
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            {/* ─── Dropdown ───────────────────────── */}
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
                    <AvatarImage src={user?.avatar} alt={user?.email} />
                    <AvatarFallback className="rounded-lg">
                      {user?.firstName?.[0] || "E"}
                      {user?.lastName?.[0] || "J"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col">
                    <span className="font-medium">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {/* Menu Items */}
              <DropdownMenuGroup>

                {/* Account → Opens Sheet */}
                <DropdownMenuItem onClick={() => setOpenProfile(true)}>
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
                onClick={logout}
                className="text-red-500 focus:text-red-500"
              >
                <LogOutIcon className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>

        </SidebarMenuItem>
      </SidebarMenu>

      {/* ─── Profile Sheet ───────────────────────── */}
      <ProfileSheet
        open={openProfile}
        onOpenChange={setOpenProfile}
      />
    </>
  )
}