"use client";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useRouter } from "@/configs/i18n/routing";
import { createClient } from "@/configs/supabase/client";
import { _ROUTE_AUTH, _ROUTE_PROFILE } from "@/constants/route";
import { Button } from "../../ui/button";
import { Skeleton } from "../../ui/skeleton";

const UserProfile = () => {
  const t = useTranslations("common.nav");
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const handleLogout = async () => {
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
          <AvatarImage src={user.user_metadata.avatar_url} />
          <AvatarFallback>{user.user_metadata.full_name}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => router.push(_ROUTE_PROFILE)}>{t("profile")}</DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>{t("logout")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button onClick={() => redirect(_ROUTE_AUTH)} variant='outline'>
      {t("login")}
    </Button>
  );
};

export { UserProfile };
