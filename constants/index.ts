import { UserRole } from "@/types/global";

type RoleMapType = { [key in UserRole]: string };

export const RoleMap: RoleMapType = {
  admin: "Quản trị viên",
  reviewer: "Giám khảo",
  user: "Người dùng",
  anonymous: "Khách"
};
