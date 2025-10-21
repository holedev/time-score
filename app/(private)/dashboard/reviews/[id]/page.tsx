import { Suspense } from "react";
import { LoadingComponent } from "@/components/custom/Loading";
import { ReviewerEventDynamic } from "./dynamic";

type ReviewerEventPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReviewerEventPage({ params }: ReviewerEventPageProps) {
  const { id } = await params;

  return (
    <div className='space-y-6'>
      <Suspense fallback={<LoadingComponent />}>
        <ReviewerEventDynamic params={Promise.resolve({ id })} />
      </Suspense>
    </div>
  );
}
