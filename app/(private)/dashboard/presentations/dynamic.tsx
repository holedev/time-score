"use server";

import { CompleteEvent } from "@/configs/prisma/zod";
import { getEventsForPresentation } from "./actions";
import { PresentationDataTable } from "./client/data-table.client";

const PresentationTableDynamic = async () => {
  const { data, error } = await getEventsForPresentation();

  if (error) {
    throw new Error(error.message);
  }

  const dataTable = data?.payload as CompleteEvent[];

  return (
    <div>
      <PresentationDataTable data={dataTable} />
    </div>
  );
};

export { PresentationTableDynamic };
