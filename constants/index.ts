import { UserRole } from "@/types/global";

export const _CLIENT_KEY_USER_ROLE = "userRole";

type RoleMapType = { [key in UserRole]: string };

export const RoleMap: RoleMapType = {
  admin: "Quản trị viên",
  reviewer: "Giám khảo",
  user: "Người dùng",
  anonymous: "Khách"
};

type PresentationStatusMapType = { [key in "PENDING" | "IN_PROGRESS" | "DONE"]: string };

export const PresentationStatusMap: PresentationStatusMapType = {
  PENDING: "Chưa bắt đầu",
  IN_PROGRESS: "Đang diễn ra",
  DONE: "Đã kết thúc"
};

export const _APP_NAME_ABBR = "OUOJ";
export const _APP_NAME_FULL = "Open University Online Judge";
