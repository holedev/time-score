"use client";

import type { User } from "@supabase/supabase-js";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/configs/supabase/client";
import { _CLIENT_KEY_USER_ROLE } from "@/constants";
import { _ROUTE_AUTH, _ROUTE_DASHBOARD, _ROUTE_PROFILE } from "@/constants/route";
import { Button } from "../../ui/button";
import { Skeleton } from "../../ui/skeleton";

const UserProfile = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const handleLogout = async () => {
    localStorage.removeItem(_CLIENT_KEY_USER_ROLE);
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push(_ROUTE_AUTH);
  };

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setUser(data.user as User);
      }
      setLoading(false);
    };

    getUser();
  }, []);

  if (loading) {
    return <Skeleton className='h-10 w-10 rounded-full' />;
  }

  return user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className='cursor-pointer'>
          <AvatarImage src={user.user_metadata.avatar_url || "/default-avt.jpg"} />
          <AvatarFallback>{user.user_metadata.full_name}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => router.push(_ROUTE_DASHBOARD)}>Trang quản trị</DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(_ROUTE_PROFILE)}>Hồ sơ</DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>Đăng xuất</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button onClick={() => redirect(_ROUTE_AUTH)} variant='outline'>
      Login
    </Button>
  );
};

export { UserProfile };
