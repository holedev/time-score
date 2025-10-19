"use client";

import { EditIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import z from "zod";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RelatedEventModel } from "@/configs/prisma/zod";
import { useHandleError } from "@/hooks/use-handle-error";
import { UserWithRole } from "@/types/global";
import { removeReviewer, updateReviewerLeader } from "./actions";
import { HandleSuccessActionType, ReviewerDialog } from "./ReviewerDialog.client";

type ReviewerTabProps = {
  event: z.infer<typeof RelatedEventModel>;
};

function ReviewerTabClient({ event }: ReviewerTabProps) {
  const [reviewers, setReviewers] = useState(event.eventReviewers || []);
  const [deletingReviewerIds, setDeletingReviewerIds] = useState<Set<number>>(new Set());
  const [togglingLeaderIds, setTogglingLeaderIds] = useState<Set<number>>(new Set());
  const { handleErrorClient } = useHandleError();

  const handleDeleteReviewer = async (reviewerId: number) => {
    setDeletingReviewerIds((prev) => new Set(prev).add(reviewerId));

    await handleErrorClient({
      cb: async () =>
        await removeReviewer({
          id: reviewerId,
          eventId: event.id
        }),
      withSuccessNotify: true,
      onSuccess: () => {
        setReviewers((prev) => prev.filter((reviewer) => reviewer.id !== reviewerId));
      }
    });

    setDeletingReviewerIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(reviewerId);
      return newSet;
    });
  };

  const handleToggleLeader = async (reviewerId: number) => {
    const reviewer = reviewers.find((r) => r.id === reviewerId);
    if (!reviewer) {
      return;
    }

    setTogglingLeaderIds((prev) => new Set(prev).add(reviewerId));

    await handleErrorClient({
      cb: async () => {
        const response = await updateReviewerLeader({
          id: reviewerId,
          eventId: event.id,
          isLeader: !reviewer.isLeader
        });

        return response;
      },
      withSuccessNotify: true,
      onSuccess: () => {
        setReviewers((prev) => prev.map((r) => (r.id === reviewerId ? { ...r, isLeader: !r.isLeader } : r)));
      }
    });

    setTogglingLeaderIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(reviewerId);
      return newSet;
    });
  };

  const handleSuccessAction = ({ reviewer, action }: HandleSuccessActionType) => {
    if (action === "create") {
      setReviewers((prev) => [...prev, reviewer]);
    }

    if (action === "update") {
      setReviewers((prev) => prev.map((r) => (r.id === reviewer.id ? reviewer : r)));
    }
  };

  const getDisplayName = (reviewer: (typeof reviewers)[0]) => {
    const metadata = (reviewer.user as UserWithRole)?.raw_user_meta_data;
    return metadata?.full_name || metadata?.display_name || reviewer.user?.email || reviewer.reviewerId;
  };

  return (
    <div className='rounded-lg border p-4'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='font-semibold text-lg'>Quản lý giám khảo</h3>
        <ReviewerDialog eventId={event.id} existingReviewers={reviewers} onSuccess={handleSuccessAction}>
          <Button>
            <PlusIcon className='mr-2 h-4 w-4' />
            Thêm giám khảo
          </Button>
        </ReviewerDialog>
      </div>

      {reviewers.length === 0 ? (
        <div className='py-8 text-center'>
          <p className='text-muted-foreground'>Chưa có giám khảo nào</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên giám khảo</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead className='text-right'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviewers.map((reviewer) => (
              <TableRow key={reviewer.id}>
                <TableCell className='font-medium'>{getDisplayName(reviewer)}</TableCell>
                <TableCell>{reviewer.user?.email}</TableCell>
                <TableCell>
                  {reviewer.isLeader ? (
                    <Badge variant='default'>Trưởng ban</Badge>
                  ) : (
                    <Badge variant='secondary'>Giám khảo</Badge>
                  )}
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex justify-end space-x-1'>
                    <Button
                      disabled={togglingLeaderIds.has(reviewer.id)}
                      onClick={() => handleToggleLeader(reviewer.id)}
                      size='sm'
                      title={reviewer.isLeader ? "Bỏ trưởng ban" : "Làm trưởng ban"}
                      variant='outline'
                    >
                      {reviewer.isLeader ? "Bỏ trưởng ban" : "Làm trưởng ban"}
                    </Button>
                    <ReviewerDialog
                      eventId={event.id}
                      existingReviewers={reviewers}
                      onSuccess={handleSuccessAction}
                      reviewer={reviewer}
                    >
                      <Button size='sm' title='Chỉnh sửa' variant='outline'>
                        <EditIcon className='h-4 w-4' />
                      </Button>
                    </ReviewerDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          className='text-destructive hover:text-destructive'
                          disabled={deletingReviewerIds.has(reviewer.id)}
                          size='sm'
                          title='Xóa giám khảo'
                          variant='outline'
                        >
                          <TrashIcon className='h-4 w-4' />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận xóa giám khảo</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa giám khảo "{getDisplayName(reviewer)}"? Hành động này không thể
                            hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            className='bg-destructive hover:bg-destructive/90'
                            onClick={() => handleDeleteReviewer(reviewer.id)}
                          >
                            Xóa giám khảo
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export { ReviewerTabClient };
