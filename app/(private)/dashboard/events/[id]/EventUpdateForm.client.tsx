"use client";

import { EditIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DateTimePicker } from "@/components/date-time-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CompleteEvent } from "@/configs/prisma/zod";
import { useHandleError } from "@/hooks/use-handle-error";
import { updateEvent } from "./actions";

const DATETIME_SLICE_LENGTH = 16;

type EventUpdateFormProps = {
  event: CompleteEvent;
};

function EventUpdateForm({ event }: EventUpdateFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleErrorClient } = useHandleError();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    duration: event.duration,
    timeStart: new Date(event.timeStart),
    timeEnd: new Date(event.timeEnd)
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await handleErrorClient({
      cb: async () =>
        updateEvent({
          id: event.id,
          eventData: {
            title: formData.title,
            description: formData.description,
            duration: formData.duration,
            timeStart: formData.timeStart,
            timeEnd: formData.timeEnd
          }
        }),
      withSuccessNotify: true,
      onSuccess: () => {
        setIsOpen(false);
        router.refresh();
      }
    });

    setIsSubmitting(false);
  };

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger asChild>
        <Button className='flex items-center gap-2' size='sm' variant='outline'>
          <EditIcon className='h-4 w-4' />
          Chỉnh sửa
        </Button>
      </SheetTrigger>
      <SheetContent className='min-w-[500px] p-4' side='right'>
        <SheetHeader>
          <SheetTitle>Chỉnh sửa sự kiện</SheetTitle>
          <SheetDescription>Cập nhật thông tin sự kiện "{event.title}"</SheetDescription>
        </SheetHeader>

        <form className='space-y-4 py-4' onSubmit={handleSubmit}>
          <div className='space-y-2'>
            <Label htmlFor='title'>Tên sự kiện</Label>
            <Input
              id='title'
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder='Nhập tên sự kiện'
              required
              value={formData.title}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Mô tả</Label>
            <Input
              id='description'
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder='Nhập mô tả sự kiện'
              required
              value={formData.description}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='duration'>Thời lượng (phút)</Label>
            <Input
              id='duration'
              min='1'
              onChange={(e) => setFormData((prev) => ({ ...prev, duration: Number(e.target.value) }))}
              placeholder='Nhập thời lượng'
              required
              type='number'
              value={formData.duration}
            />
          </div>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <DateTimePicker
                dateLabel='Ngày bắt đầu'
                datePickerId='timeStart-date'
                datePlaceholder='Chọn ngày bắt đầu'
                onChange={(date) => setFormData((prev) => ({ ...prev, timeStart: date || new Date() }))}
                timeLabel='Giờ bắt đầu'
                timePickerId='timeStart-time'
                value={formData.timeStart}
              />
            </div>

            <div className='space-y-2'>
              <DateTimePicker
                dateLabel='Ngày kết thúc'
                datePickerId='timeEnd-date'
                datePlaceholder='Chọn ngày kết thúc'
                onChange={(date) => setFormData((prev) => ({ ...prev, timeEnd: date || new Date() }))}
                timeLabel='Giờ kết thúc'
                timePickerId='timeEnd-time'
                value={formData.timeEnd}
              />
            </div>
          </div>

          <SheetFooter className='flex gap-2 pt-4'>
            <Button disabled={isSubmitting} type='submit'>
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
            <SheetClose asChild>
              <Button type='button' variant='outline'>
                Hủy
              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export { EventUpdateForm };
