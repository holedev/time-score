"use client";

import Link from "next/link";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { RelatedEventModel } from "@/configs/prisma/zod";

type TableCellViewerClientProps = {
  item: z.infer<typeof RelatedEventModel>;
};

function TableCellViewerClient({ item }: TableCellViewerClientProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className='w-fit px-0 text-left text-foreground' variant='link'>
          {item.title}
        </Button>
      </SheetTrigger>
      <SheetContent className='flex min-w-[500px] flex-col' side='right'>
        <SheetHeader className='gap-1'>
          <SheetTitle>{item.title}</SheetTitle>
          <SheetDescription>{item.description}</SheetDescription>
        </SheetHeader>
        <div className='flex flex-1 flex-col gap-4 overflow-y-auto p-4 text-sm'>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <Label className='font-medium'>Sự kiện</Label>
              <p className='text-foreground'>{item.title}</p>
            </div>
            <div className='flex flex-col gap-2'>
              <Label className='font-medium'>Mô tả</Label>
              <p className='text-muted-foreground'>{item.description}</p>
            </div>
            <div className='flex flex-col gap-2'>
              <Label className='font-medium'>Thời gian (phút)</Label>
              <p className='text-foreground'>{item.duration} phút</p>
            </div>
            <div className='flex flex-col gap-2'>
              <Label className='font-medium'>Thời gian bắt đầu</Label>
              <p className='text-foreground'>{new Date(item.timeStart).toLocaleString("vi-VN")}</p>
            </div>
            <div className='flex flex-col gap-2'>
              <Label className='font-medium'>Thời gian kết thúc</Label>
              <p className='text-foreground'>{new Date(item.timeEnd).toLocaleString("vi-VN")}</p>
            </div>
          </div>

          <div className='mt-6 space-y-4'>
            <div className='flex items-center justify-between rounded-lg border p-3'>
              <div>
                <Label className='font-medium'>Danh sách đội tham gia</Label>
                <p className='text-muted-foreground text-sm'>{item.teams?.length || 0} đội</p>
              </div>
            </div>

            <div className='flex items-center justify-between rounded-lg border p-3'>
              <div>
                <Label className='font-medium'>Tiêu chí cuộc thi</Label>
                <p className='text-muted-foreground text-sm'>
                  {item.criteriaTemplateId ? "Đã thiết lập" : "Chưa thiết lập"}
                </p>
              </div>
            </div>

            <div className='flex items-center justify-between rounded-lg border p-3'>
              <div>
                <Label className='font-medium'>Giám khảo</Label>
                <p className='text-muted-foreground text-sm'>{item.eventReviewers?.length || 0} người</p>
              </div>
            </div>
          </div>
        </div>
        <SheetFooter className='mt-auto flex gap-2 sm:flex-col sm:space-x-0'>
          <Link className='w-full' href={`/dashboard/events/${item.id}`}>
            <Button className='w-full'>Xem chi tiết</Button>
          </Link>
          <SheetClose asChild>
            <Button className='w-full' variant='outline'>
              Đóng
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export { TableCellViewerClient };
