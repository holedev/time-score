"use client";

import { app_role } from "@prisma/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoleMap } from "@/constants";
import { useHandleError } from "@/hooks/use-handle-error";
import {
  type UserUpdateDisplayNameFormType,
  type UserUpdateRoleFormType,
  updateUserDisplayName,
  updateUserRole
} from "./actions";

type UserData = {
  id: string;
  email: string | null;
  raw_user_meta_data: unknown;
  created_at: Date | null;
  last_sign_in_at: Date | null;
  user_roles: {
    role: app_role;
  } | null;
};

type UserEditDialogProps = {
  user: UserData;
  children: React.ReactNode;
  onUpdate?: (updatedUser: UserData) => void;
};

export function UserEditDialog({ user, children, onUpdate }: UserEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState(() => {
    const meta = user.raw_user_meta_data as Record<string, unknown>;
    return (meta?.display_name as string) || (meta?.full_name as string) || (meta?.name as string) || "";
  });
  const [selectedRole, setSelectedRole] = useState<app_role>(user.user_roles?.role || "user");
  const [isLoading, setIsLoading] = useState(false);
  const { handleErrorClient } = useHandleError();

  const handleSubmit = async () => {
    const currentDisplayName = (() => {
      const meta = user.raw_user_meta_data as Record<string, unknown>;
      return (meta?.display_name as string) || (meta?.full_name as string) || (meta?.name as string) || "";
    })();

    const hasDisplayNameChanged = displayName.trim() !== currentDisplayName;
    const hasRoleChanged = selectedRole !== user.user_roles?.role;

    if (!(hasDisplayNameChanged || hasRoleChanged)) {
      setOpen(false);
      return;
    }

    setIsLoading(true);

    try {
      // Update display name if changed
      if (hasDisplayNameChanged && displayName.trim()) {
        await handleErrorClient({
          cb: async () => {
            const formData: UserUpdateDisplayNameFormType = {
              userId: user.id,
              displayName: displayName.trim()
            };
            return await updateUserDisplayName(formData);
          },
          withSuccessNotify: true
        });
      }

      // Update role if changed
      if (hasRoleChanged) {
        await handleErrorClient({
          cb: async () => {
            const formData: UserUpdateRoleFormType = {
              userId: user.id,
              role: selectedRole
            };
            return await updateUserRole(formData);
          },
          withSuccessNotify: true
        });
      }

      // Update local state with new values
      const updatedUser: UserData = {
        ...user,
        raw_user_meta_data: {
          ...(user.raw_user_meta_data as Record<string, unknown>),
          display_name: displayName.trim()
        },
        user_roles: { role: selectedRole }
      };

      if (onUpdate) {
        onUpdate(updatedUser);
      }

      setOpen(false);
    } catch (error) {
      // Error is already handled by handleErrorClient
      // Silent error handling
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = (role: app_role): string => RoleMap[role] || "Không xác định";

  const getFullName = (metadata: unknown): string => {
    if (!metadata || typeof metadata !== "object") {
      return "N/A";
    }
    const meta = metadata as Record<string, unknown>;
    const fullName = meta.full_name || meta.name || meta.display_name;
    return typeof fullName === "string" ? fullName : "N/A";
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update information for {getFullName(user.raw_user_meta_data)} ({user.email})
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label className='text-right' htmlFor='displayName'>
              Display Name
            </Label>
            <div className='col-span-3'>
              <Input
                id='displayName'
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder='Enter display name'
                value={displayName}
              />
            </div>
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label className='text-right' htmlFor='role'>
              Role
            </Label>
            <div className='col-span-3'>
              <Select onValueChange={(value) => setSelectedRole(value as app_role)} value={selectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder='Select a role' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='anonymous'>{getRoleLabel("anonymous")}</SelectItem>
                  <SelectItem value='user'>{getRoleLabel("user")}</SelectItem>
                  <SelectItem value='reviewer'>{getRoleLabel("reviewer")}</SelectItem>
                  <SelectItem value='admin'>{getRoleLabel("admin")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} type='button' variant='outline'>
            Cancel
          </Button>
          <Button disabled={isLoading} onClick={handleSubmit} type='button'>
            {isLoading ? "Updating..." : "Update User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
