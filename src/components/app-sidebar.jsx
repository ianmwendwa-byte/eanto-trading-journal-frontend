import * as React from "react"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, ListIcon, ChartBarIcon, FolderIcon, UsersIcon, CameraIcon, FileTextIcon, Settings2Icon, CircleHelpIcon, SearchIcon, DatabaseIcon, FileChartColumnIcon, FileIcon, CommandIcon, LightbulbIcon, DatabaseZapIcon, FileChartColumnIncreasingIcon } from "lucide-react"

const data = {
  user: {
    name: "Eanto J.",
    email: "eanto@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  // Sidebar navigation
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (
        <LayoutDashboardIcon />
      ),
    },
     {
      title: "Accounts",
      url: "/accounts",
      icon: (
        <DatabaseZapIcon />
      ),
    },
    {
      title: "Trades",
      url: "/trades",
      icon: (
        <ListIcon />
      ),
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: (
        <FileChartColumnIncreasingIcon />
      ),
    },
    {
      title: "Strategy",
      url: "/strategies",
      icon: (
        <FileTextIcon/>
      ),
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: (
        <ChartBarIcon/>
      ),
    },
    {
      title: "Insights",
      url: "/insights",
      icon: (
        <LightbulbIcon/>
      ),
    },
  ],

  
  navSecondary: [
   
    {
      title: "Get Help",
      url: "#",
      icon: (
        <CircleHelpIcon />
      ),
    },
   
  ],
}

export function AppSidebar({
  ...props
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <a href="#">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">Eanto Journal</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
         <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarFooter>
    </Sidebar>
  );
}
