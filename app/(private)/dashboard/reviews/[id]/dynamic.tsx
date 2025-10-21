import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { CompleteEvent } from "@/configs/prisma/zod";
import { CompleteEventReviewer } from "@/configs/prisma/zod/eventreviewer";
import { getEventForReviewer } from "./actions";
import { ReviewerEventDisplay } from "./client/ReviewerEventDisplay.client";

type ReviewerEventDynamicProps = {
  params: Promise<{ id: string }>;
};

const ReviewerEventDynamic = async ({ params }: ReviewerEventDynamicProps) => {
  const { id } = await params;
  const eventId = Number.parseInt(id, 10);

  if (Number.isNaN(eventId)) {
    notFound();
  }

  const { data, error } = await getEventForReviewer({ eventId });

  if (error) {
    throw new Error(error.message);
  }

  const { event, reviewerData } = data?.payload as {
    event: CompleteEvent;
    reviewerData: CompleteEventReviewer;
  };

  return (
    <div className='space-y-4'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/dashboard'>Trang quản trị</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/dashboard/reviews'>Đánh giá</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{event.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <ReviewerEventDisplay event={event} reviewerData={reviewerData} />
    </div>
  );
};

export { ReviewerEventDynamic };
