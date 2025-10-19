import { Suspense } from "react";
import { LoadingComponent } from "@/components/custom/Loading";
import { EventDetailDynamic } from "./dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const eventId = Number.parseInt(id, 10);

  if (Number.isNaN(eventId)) {
    throw new Error("ID sự kiện không hợp lệ!");
  }

  return (
    <Suspense fallback={<LoadingComponent />}>
      <EventDetailDynamic eventId={eventId} />
    </Suspense>
  );
}
