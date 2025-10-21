"use client";

import { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { UserRole } from "@/types/global";
import { useEffect, useState } from "react";
import { createClient } from "@/configs/supabase/client";
import { jwtDecode } from "jwt-decode";
import { DecodedTokenType } from "@/utils/handle-error-server";
import { _CLIENT_KEY_USER_ROLE } from "@/constants";

export type NavItemType = {
  title: string;
  url: string;
  role: UserRole[];
  icon?: LucideIcon;
}

export function NavMain({
  items
}: {
  items: NavItemType[];
}) {

  const [role, setRole] = useState<UserRole>("anonymous");

  // TODO: improve call from client (save to localstorage)
  useEffect(() => {
    const fetchUserRole = () => {
      setRole(
        localStorage.getItem(_CLIENT_KEY_USER_ROLE) as UserRole || "anonymous"
      )
    };
    fetchUserRole();
  }, []);

  return (
    <SidebarGroup>
      <SidebarGroupContent className='mt-20 flex flex-col gap-2'>
        <SidebarMenu>
          {items.map((item) => (
            role && item.role.includes(role) && (
            <Link href={item.url} key={item.title} passHref>
              <SidebarMenuItem >
                <SidebarMenuButton tooltip={item.title} className="cursor-pointer">
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>)
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
