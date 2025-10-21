import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { CompleteEvent } from "@/configs/prisma/zod";
import { PresentationStatusMap } from "@/constants";
import { getEventForPresentation } from "./actions";
import { EventStatusControls } from "./client/EventStatusControls.client";
import { PresentationHeader } from "./client/PresentationHeader.client";
import { TeamManagement } from "./client/TeamManagement.client";

type PresentationDetailDynamicProps = {
  eventId: number;
};

const PresentationDetailDynamic = async ({ eventId }: PresentationDetailDynamicProps) => {
  const { data, error } = await getEventForPresentation({ eventId });

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Không tìm thấy sự kiện!");
  }

  const event = data.payload as CompleteEvent;
  const currentPresentingTeam = event.teams?.find((team) => team.status === "INPROGRESS") || null;

  return (
    <div className='space-y-6'>
      {/* Breadcrumb Navigation */}
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
              <Link href='/dashboard/presentations'>Thuyết trình</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{event.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PresentationHeader
        currentTeam={currentPresentingTeam}
        eventDuration={event.duration}
        eventId={eventId}
        presentationStatus={event.presentationStatus}
      />

      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-bold text-3xl'>{event.title}</h1>
          <p className='mt-2 text-muted-foreground'>{event.description}</p>
        </div>
        <div className='flex items-center gap-4'>
          <Badge
            variant={(() => {
              if (event.presentationStatus === "PENDING") {
                return "secondary";
              }
              if (event.presentationStatus === "IN_PROGRESS") {
                return "default";
              }
              return "destructive";
            })()}
          >
            {PresentationStatusMap[event.presentationStatus]}
          </Badge>
          <EventStatusControls currentStatus={event.presentationStatus} eventId={eventId} />
        </div>
      </div>

      <div className='space-y-6'>
        <Separator />

        <div>
          <h2 className='mb-4 font-semibold text-2xl'>Quản lý đội thi</h2>
          <TeamManagement eventId={eventId} presentationStatus={event.presentationStatus} teams={event.teams || []} />
        </div>
      </div>
    </div>
  );
};

export { PresentationDetailDynamic };
