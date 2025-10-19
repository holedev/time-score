"use client";

import { EditIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RoleMap } from "@/constants";
import { UserRole } from "@/types/global";
import { UserEditDialog } from "./UserEditDialog.client";

type UserData = {
  id: string;
  email: string | null;
  raw_user_meta_data: unknown;
  created_at: Date | null;
  last_sign_in_at: Date | null;
  user_roles: {
    role: UserRole;
  } | null;
};

// Helper function to get full name from metadata
const getFullName = (metadata: unknown): string => {
  if (!metadata) {
    return "N/A";
  }
  const meta = metadata as Record<string, unknown>;
  const fullName = meta.full_name || meta.name || meta.display_name;
  return typeof fullName === "string" ? fullName : "N/A";
};

const getRoleDisplay = (
  role: string | null | undefined
): { text: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
  switch (role) {
    case "admin":
      return { text: RoleMap.admin, variant: "destructive" };
    case "reviewer":
      return { text: RoleMap.reviewer, variant: "default" };
    case "user":
      return { text: RoleMap.user, variant: "secondary" };
    case "anonymous":
      return { text: RoleMap.anonymous, variant: "outline" };
    default:
      return { text: "Không có vai trò", variant: "outline" };
  }
};

export function DataTable({ data: initialData }: { data: UserData[] }) {
  const [users, setUsers] = useState(initialData);

  const handleUserUpdate = (updatedUser: UserData) => {
    setUsers((prev) => prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
  };

  return (
    <div className='rounded-lg border p-4'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='font-semibold text-lg'>Quản lý người dùng</h3>
        <div className='text-muted-foreground text-sm'>{users.length} người dùng</div>
      </div>

      {users.length === 0 ? (
        <div className='py-8 text-center'>
          <p className='text-muted-foreground'>No users found.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const fullName = getFullName(user.raw_user_meta_data);
              const roleInfo = getRoleDisplay(user.user_roles?.role);

              return (
                <TableRow key={user.id}>
                  <TableCell className='font-medium'>{fullName}</TableCell>
                  <TableCell>{user.email || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={roleInfo.variant}>{roleInfo.text}</Badge>
                  </TableCell>
                  <TableCell className='text-right'>
                    <UserEditDialog onUpdate={handleUserUpdate} user={user}>
                      <Button size='sm' variant='outline'>
                        <EditIcon className='h-4 w-4' />
                      </Button>
                    </UserEditDialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
