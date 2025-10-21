"use client";

import { PauseIcon, PlayIcon, SquareIcon } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useHandleError } from "@/hooks/use-handle-error";
import { updatePresentationStatus } from "../actions";

type EventStatusControlsProps = {
  eventId: number;
  currentStatus: "PENDING" | "IN_PROGRESS" | "DONE";
};

const EventStatusControls = ({ eventId, currentStatus }: EventStatusControlsProps) => {
  const { handleErrorClient } = useHandleError();
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusUpdate = async (newStatus: "PENDING" | "IN_PROGRESS" | "DONE") => {
    setIsLoading(true);

    await handleErrorClient({
      cb: async () => await updatePresentationStatus({ eventId, status: newStatus }),
      withSuccessNotify: true
    });

    setIsLoading(false);
  };

  return (
    <div className='flex items-center gap-2'>
      {currentStatus === "PENDING" && (
        <Button disabled={isLoading} onClick={() => handleStatusUpdate("IN_PROGRESS")} size='sm' variant='default'>
          <PlayIcon className='mr-1 h-4 w-4' />
          Bắt đầu sự kiện
        </Button>
      )}

      {currentStatus === "IN_PROGRESS" && (
        <>
          <Button disabled={isLoading} onClick={() => handleStatusUpdate("PENDING")} size='sm' variant='outline'>
            <PauseIcon className='mr-1 h-4 w-4' />
            Tạm dừng sự kiện
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={isLoading} size='sm' variant='destructive'>
                <SquareIcon className='mr-1 h-4 w-4' />
                Kết thúc sự kiện
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận kết thúc sự kiện</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn kết thúc sự kiện? Hành động này sẽ thông báo cho tất cả giám khảo rằng sự kiện
                  đã kết thúc.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  onClick={() => handleStatusUpdate("DONE")}
                >
                  Kết thúc sự kiện
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      {currentStatus === "DONE" && (
        <Button disabled={isLoading} onClick={() => handleStatusUpdate("PENDING")} size='sm' variant='outline'>
          <PlayIcon className='mr-1 h-4 w-4' />
          Khởi động lại sự kiện
        </Button>
      )}
    </div>
  );
};

export { EventStatusControls };
