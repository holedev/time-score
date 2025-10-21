"use client";

import {
  ArrowUpCircleIcon,
  BarChartIcon,
  CameraIcon,
  ClipboardListIcon,
  ClockIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon
} from "lucide-react";
import * as React from "react";
import { NavItemType, NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Sự kiện",
      url: "/dashboard/events",
      role: ["admin"],
      icon: LayoutDashboardIcon
    },
    {
      title: "Người dùng",
      url: "/dashboard/users",
      role: ["admin"],
      icon: ListIcon
    },
    {
      title: "Thuyết trình",
      url: "/dashboard/presentations",
      role: ["admin"],
      icon: ClockIcon
    },
    {
      title: "Đánh giá",
      url: "/dashboard/reviews",
      role: ["reviewer"],
      icon: ClipboardListIcon
    },
  ] as NavItemType[]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  return (
    <Sidebar className='z-10' collapsible='offcanvas' {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  );
}
