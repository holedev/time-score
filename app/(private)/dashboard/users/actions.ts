"use server";

import type { app_role } from "@prisma/client";
import { revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import { _CACHE_TAG_USERS } from "@/constants/cache-tag";
import { handleAuthorizeRoleAdmin, handleErrorServerWithAuth } from "@/utils/handle-error-server";

const getUsers = async () =>
  handleErrorServerWithAuth({
    cb: unstable_cache(
      async () => {
        const users = await prisma.users.findMany({
          where: {
            deleted_at: null,
            is_anonymous: false
          },
          select: {
            id: true,
            email: true,
            raw_user_meta_data: true,
            created_at: true,
            last_sign_in_at: true,
            user_roles: {
              select: {
                role: true
              }
            }
          },
          orderBy: { created_at: "desc" }
        });
        return users;
      },
      [_CACHE_TAG_USERS],
      { tags: [_CACHE_TAG_USERS] }
    )
  });

// Update user role
export type UserUpdateRoleFormType = {
  userId: string;
  role: app_role;
};

// Update user display name
export type UserUpdateDisplayNameFormType = {
  userId: string;
  displayName: string;
};

const updateUserDisplayName = async ({ userId, displayName }: UserUpdateDisplayNameFormType) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      // Update user metadata in the database directly
      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: {
          raw_user_meta_data: {
            display_name: displayName
          }
        }
      });

      revalidateTag(_CACHE_TAG_USERS);
      return updatedUser;
    }
  });

const updateUserRole = async ({ userId, role }: UserUpdateRoleFormType) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      // Check if user_roles record exists
      const existingUserRole = await prisma.user_roles.findUnique({
        where: { user_id: userId }
      });

      let updatedUserRole: Awaited<ReturnType<typeof prisma.user_roles.findUnique>>;
      if (existingUserRole) {
        // Update existing role
        updatedUserRole = await prisma.user_roles.update({
          where: { user_id: userId },
          data: { role }
        });
      } else {
        // Create new role record
        updatedUserRole = await prisma.user_roles.create({
          data: {
            user_id: userId,
            role
          }
        });
      }

      revalidateTag(_CACHE_TAG_USERS);
      return updatedUserRole;
    }
  });

export { getUsers, updateUserRole, updateUserDisplayName };
