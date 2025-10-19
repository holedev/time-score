import { UserRole } from "@/types/global";

// biome-ignore lint/style/useNamingConvention: <typscript convention>
type RoleMapType = { [key in UserRole]: string };

export const RoleMap: RoleMapType = {
  admin: "Quản trị viên",
  reviewer: "Người đánh giá",
  user: "Người dùng",
  anonymous: "Khách"
};
