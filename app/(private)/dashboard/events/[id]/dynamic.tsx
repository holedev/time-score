import { CalendarIcon, ClockIcon } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CompleteEvent } from "@/configs/prisma/zod";
import { handleDatetime } from "@/utils/handle-datetime";
import { getEventDetail } from "./actions";
import { EventDeleteButton } from "./EventDeleteButton.client";
import { EventManagementTabs } from "./EventManagementTabs.client";
import { EventUpdateForm } from "./EventUpdateForm.client";

type EventDetailDynamicProps = {
  eventId: number;
};

const EventDetailDynamic = async ({ eventId }: EventDetailDynamicProps) => {
  const { data, error } = await getEventDetail({ id: eventId });

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Không tìm thấy sự kiện!");
  }

  const event = data.payload as CompleteEvent;

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
              <Link href='/dashboard/events'>Sự kiện</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{event.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Section */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-bold text-3xl'>{event.title}</h1>
          <p className='mt-2 text-muted-foreground'>{event.description}</p>
        </div>
        <div className='flex items-center gap-2'>
          <EventUpdateForm event={event} />
          <EventDeleteButton eventId={event.id} />
        </div>
      </div>

      {/* Event Info Cards */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CalendarIcon className='h-5 w-5' />
              Thông tin cơ bản
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <span className='font-medium text-sm'>Thời gian bắt đầu</span>
              <p className='text-muted-foreground text-sm'>{handleDatetime(new Date(event.timeStart))}</p>
            </div>
            <div>
              <span className='font-medium text-sm'>Thời gian kết thúc</span>
              <p className='text-muted-foreground text-sm'>{handleDatetime(new Date(event.timeEnd))}</p>
            </div>
            <div>
              <span className='font-medium text-sm'>Thời lượng</span>
              <p className='text-muted-foreground text-sm'>{event.duration} phút</p>
            </div>
            <div>
              <span className='font-medium text-sm'>Trạng thái</span>
              <div className='mt-1'>
                <Badge variant={event.isDeleted ? "destructive" : "default"}>
                  {event.isDeleted ? "Đã xóa" : "Hoạt động"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <ClockIcon className='h-5 w-5' />
              Thống kê
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex justify-between'>
              <span className='font-medium text-sm'>Số đội tham gia:</span>
              <Badge variant='secondary'>{event.teams?.length || 0}</Badge>
            </div>
            <div className='flex justify-between'>
              <span className='font-medium text-sm'>Số giám khảo:</span>
              <Badge variant='secondary'>{event.eventReviewers?.length || 0}</Badge>
            </div>
            <div className='flex justify-between'>
              <span className='font-medium text-sm'>Tiêu chí đánh giá:</span>
              <Badge variant='secondary'>{event.criteriaTemplateId ? "Đã thiết lập" : "Chưa có"}</Badge>
            </div>
            <div className='flex justify-between'>
              <span className='font-medium text-sm'>Ngày tạo:</span>
              <span className='text-muted-foreground text-sm'>{handleDatetime(new Date(event.createdAt))}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <div className='space-y-6'>
        <Separator />

        {/* Management Actions */}
        <div>
          <h2 className='mb-4 font-semibold text-2xl'>Quản lý sự kiện</h2>
          <EventManagementTabs event={event} />
        </div>
      </div>
    </div>
  );
};

export { EventDetailDynamic };
