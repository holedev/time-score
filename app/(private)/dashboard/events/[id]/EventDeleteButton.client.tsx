"use client";

import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { deleteEvent } from "./actions";

type EventDeleteButtonProps = {
  eventId: number;
};

function EventDeleteButton({ eventId }: EventDeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { handleErrorClient } = useHandleError();
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);

    await handleErrorClient({
      cb: () => deleteEvent({ id: eventId }),

      onSuccess: () => {
        router.push("/dashboard/events");
      },
      withSuccessNotify: true
    });

    setIsDeleting(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className='flex items-center gap-2' size='sm' variant='destructive'>
          <TrashIcon className='h-4 w-4' />
          Xóa
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa sự kiện</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác. Sau khi xóa, sự kiện sẽ không còn
            hiển thị trong danh sách và tất cả dữ liệu liên quan sẽ bị ẩn. Các đội tham gia, tiêu chí đánh giá và giám
            khảo cũng sẽ bị ảnh hưởng.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? "Đang xóa..." : "Xóa sự kiện"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { EventDeleteButton };
