import { Suspense } from "react";
import { LoadingComponent } from "@/components/custom/Loading";
import { PresentationDetailDynamic } from "./dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PresentationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const eventId = Number.parseInt(id, 10);

  if (Number.isNaN(eventId)) {
    throw new Error("ID sự kiện không hợp lệ!");
  }

  return (
    <Suspense fallback={<LoadingComponent />}>
      <PresentationDetailDynamic eventId={eventId} />
    </Suspense>
  );
}
