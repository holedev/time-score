import { RoleMap } from "@/constants";
import { UserRole } from "@/types/global";

export const getRoleName = (role: UserRole) => RoleMap[role] || RoleMap.anonymous;

export const formatDatetime = (date: Date) =>
  date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
