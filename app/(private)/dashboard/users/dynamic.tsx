import { UserRole } from "@/types/global";
import { getUsers } from "./actions";
import { DataTable } from "./data-table.client";

const TableDynamic = async () => {
  const { data, error } = await getUsers();

  if (error) {
    throw new Error(error.message);
  }

  const users = (data?.payload || []) as Array<{
    id: string;
    email: string | null;
    raw_user_meta_data: unknown;
    created_at: Date | null;
    last_sign_in_at: Date | null;
    user_roles: {
      role: UserRole;
    } | null;
  }>;

  return (
    <div>
      <DataTable data={users} />
    </div>
  );
};

export { TableDynamic };
