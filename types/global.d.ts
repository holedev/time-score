export type UserRole = "anonymous" | "user" | "reviewer" | "admin";

export type UserWithRole = User & { userRole: UserRole };
