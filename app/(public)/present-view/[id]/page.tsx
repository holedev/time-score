import { notFound } from "next/navigation";
import { CompleteEvent } from "@/configs/prisma/zod";
import { getEventForPublicPresentView } from "../actions";
import { PresentEventDisplay } from "./client/PresentEventDisplay.client";

type PresentViewPageProps = {
  params: Promise<{ id: string }>;
};

type PresentEvent = Pick<CompleteEvent, "id" | "title" | "duration" | "presentationStatus" | "teams">;

export default async function PresentViewPage({ params }: PresentViewPageProps) {
  const { id } = await params;
  const eventId = Number.parseInt(id, 10);

  if (Number.isNaN(eventId)) {
    notFound();
  }

  const { data, error } = await getEventForPublicPresentView({ eventId });

  if (error) {
    if (error.message === "Sự kiện không tồn tại!") {
      notFound();
    }
    throw new Error(error.message);
  }

  const event = data?.payload as PresentEvent | undefined;

  if (!event) {
    notFound();
  }

  return <PresentEventDisplay event={event} />;
}
