import { Suspense } from "react";
import { LoadingComponent } from "@/components/custom/Loading";
import { ReviewerTableDynamic } from "./dynamic";

export const dynamic = "force-dynamic";

export default function ReviewsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='font-bold text-3xl'>Chấm điểm sự kiện</h1>
        <p className='mt-2 text-muted-foreground'>
          Theo dõi và chấm điểm các đội thi trong các sự kiện bạn được phân công làm giám khảo
        </p>
      </div>

      <Suspense fallback={<LoadingComponent />}>
        <ReviewerTableDynamic />
      </Suspense>
    </div>
  );
}
