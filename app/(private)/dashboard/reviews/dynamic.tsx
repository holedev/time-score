import { CompleteEvent } from "@/configs/prisma/zod";
import { getEventsForReviewer } from "./actions";
import { ReviewerDataTable } from "./client/data-table.client";

const ReviewerTableDynamic = async () => {
  const { data, error } = await getEventsForReviewer();

  if (error) {
    throw new Error(error.message);
  }

  const dataTable = data?.payload as CompleteEvent[];

  return (
    <div>
      <ReviewerDataTable data={dataTable} />
    </div>
  );
};

export { ReviewerTableDynamic };
