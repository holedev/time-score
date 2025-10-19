import { CompleteEvent } from "@/configs/prisma/zod";
import { getEvents } from "./actions";
import { DataTable } from "./client/data-table.client";

const TableDynamic = async () => {
  const { data, error } = await getEvents();

  if (error) {
    throw new Error(error.message);
  }

  const dataTable = data?.payload as CompleteEvent[];

  return (
    <div>
      <DataTable data={dataTable} />
    </div>
  );
};

export { TableDynamic };
