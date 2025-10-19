"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import z from "zod";
import { DateTimePicker } from "@/components/date-time-picker";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompleteEvent, RelatedEventModel } from "@/configs/prisma/zod";
import { useHandleError } from "@/hooks/use-handle-error";
import { useIsMobile } from "@/hooks/use-mobile";
import { createEvent, EventCreateFormType } from "../actions";

const DEFAULT_HOUR_START = 8;
const DEFAULT_HOUR_END = 17;

function AddEventDrawerClient({ onSuccess }: { onSuccess: (newEvent: z.infer<typeof RelatedEventModel>) => void }) {
  const now = new Date();

  const isMobile = useIsMobile();
  const { handleErrorClient } = useHandleError();
  const [open, setOpen] = useState(false);
  const [event, setEvent] = useState<EventCreateFormType>({
    title: "",
    description: "",
    duration: 15,
    timeStart: new Date(now.getFullYear(), now.getMonth(), now.getDate(), DEFAULT_HOUR_START, 0, 0, 0),
    timeEnd: new Date(now.getFullYear(), now.getMonth(), now.getDate(), DEFAULT_HOUR_END, 0, 0, 0)
  });

  const handleChange = (field: keyof CompleteEvent, value: string | number | Date) => {
    setEvent((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await handleErrorClient({
      cb: async () => await createEvent({ eventData: event }),
      withSuccessNotify: true,
      onSuccess({ data }) {
        const newItem = data.payload;
        onSuccess(newItem as z.infer<typeof RelatedEventModel>);
        setOpen(false);
      }
    });
  };

  return (
    <Drawer direction='right' onOpenChange={setOpen} open={open}>
      <DrawerTrigger asChild>
        <Button size='sm' variant='outline'>
          <PlusIcon />
          <span className='hidden lg:inline'>Thêm sự kiện</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className='min-w-[500px]'>
        <div className='mx-auto w-full'>
          <DrawerHeader>
            <DrawerTitle>Thêm sự kiện mới</DrawerTitle>
            <DrawerDescription>Điền thông tin để tạo sự kiện mới</DrawerDescription>
          </DrawerHeader>
          <form className='p-4 pb-0' onSubmit={handleSubmit}>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-2'>
                <Label htmlFor='add-title'>Tên sự kiện</Label>
                <Input
                  id='add-title'
                  name='title'
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder='Nhập tên sự kiện'
                  required
                  value={event.title}
                />
              </div>
              <div className='flex flex-col gap-2'>
                <Label htmlFor='add-description'>Mô tả</Label>
                <Input
                  id='add-description'
                  name='description'
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder='Nhập mô tả sự kiện'
                  required
                  value={event.description}
                />
              </div>
              <div className='flex flex-col gap-2'>
                <Label htmlFor='add-duration'>Thời gian (phút)</Label>
                <Input
                  id='add-duration'
                  min='1'
                  name='duration'
                  onChange={(e) => handleChange("duration", Number(e.target.value))}
                  placeholder='15'
                  required
                  type='number'
                  value={event.duration}
                />
              </div>
              <div className='flex flex-col gap-2'>
                <Label htmlFor='add-timeStart'>Thời gian bắt đầu</Label>
                <DateTimePicker
                  datePickerId='time-start-date'
                  onChange={(value) => handleChange("timeStart", value as Date)}
                  timePickerId='time-start-time'
                  value={event.timeStart}
                />
              </div>
              <div className='flex flex-col gap-2'>
                <Label htmlFor='add-timeEnd'>Thời gian kết thúc</Label>
                <DateTimePicker
                  datePickerId='time-end-date'
                  onChange={(value) => handleChange("timeEnd", value as Date)}
                  timePickerId='time-end-time'
                  value={event.timeEnd}
                />
              </div>
            </div>
            <DrawerFooter>
              <Button type='submit'>Tạo sự kiện</Button>
              <DrawerClose asChild>
                <Button variant='outline'>Hủy</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export { AddEventDrawerClient };
