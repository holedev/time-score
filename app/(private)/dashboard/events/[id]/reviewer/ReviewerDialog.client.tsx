"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompleteEventReviewer } from "@/configs/prisma/zod/eventreviewer";
import { Completeusers } from "@/configs/prisma/zod/users";
import { useHandleError } from "@/hooks/use-handle-error";
import { UserWithRole } from "@/types/global";
import { addReviewer, getAvailableReviewers, type ReviewerCreateFormType, updateReviewerLeader } from "./actions";

export type HandleSuccessActionType = {
  reviewer: CompleteEventReviewer;
  action: "create" | "update";
};

type ReviewerDialogProps = {
  reviewer?: CompleteEventReviewer;
  eventId: number;
  onSuccess: (data: HandleSuccessActionType) => void;
  children: React.ReactNode;
  existingReviewers: CompleteEventReviewer[];
};

function ReviewerDialog({ reviewer, eventId, onSuccess, children }: ReviewerDialogProps) {
  const { handleErrorClient, toast } = useHandleError();

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ReviewerCreateFormType>({
    reviewerId: reviewer?.reviewerId || "",
    isLeader: Boolean(reviewer?.isLeader)
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableReviewers, setAvailableReviewers] = useState<Completeusers[]>([]);
  const [loadingReviewers, setLoadingReviewers] = useState(false);

  const isUpdate = Boolean(reviewer);

  const fetchAvailableReviewers = async () => {
    setLoadingReviewers(true);

    await handleErrorClient({
      cb: async () => await getAvailableReviewers({ eventId }),
      withSuccessNotify: false,
      onSuccess: ({ data }) => {
        setAvailableReviewers(data.payload as Completeusers[]);
      }
    });
    setLoadingReviewers(false);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <dont need fetch on every open change>
  useEffect(() => {
    fetchAvailableReviewers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reviewerId.trim()) {
      toast({
        title: "Vui lòng chọn giám khảo",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    if (isUpdate && reviewer?.id) {
      await handleErrorClient({
        cb: async () => {
          const response = await updateReviewerLeader({
            id: reviewer.id,
            eventId,
            isLeader: formData.isLeader
          });

          return response;
        },
        withSuccessNotify: true,
        onSuccess: () => {
          setOpen(false);
          const updatedReviewer = { ...reviewer, isLeader: formData.isLeader } as CompleteEventReviewer;
          onSuccess({ reviewer: updatedReviewer, action: "update" });
        }
      });
    } else {
      await handleErrorClient({
        cb: async () => {
          const response = await addReviewer({
            eventId,
            reviewerData: {
              reviewerId: formData.reviewerId.trim(),
              isLeader: formData.isLeader
            }
          });

          return response;
        },
        withSuccessNotify: true,
        onSuccess: ({ data }) => {
          setOpen(false);
          setFormData({ reviewerId: "", isLeader: false });
          const newReviewer = data.payload as CompleteEventReviewer;
          onSuccess({ reviewer: newReviewer, action: "create" });
        }
      });
    }
    setIsSubmitting(false);
  };

  const getDisplayName = (user: Completeusers) => {
    const metadata = (user as UserWithRole)?.raw_user_meta_data;
    return metadata?.full_name || user.email || user.id;
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>{reviewer ? "Cập nhật giám khảo" : "Thêm giám khảo mới"}</DialogTitle>
          <DialogDescription>
            {reviewer ? "Cập nhật thông tin giám khảo cho sự kiện." : "Thêm giám khảo mới cho sự kiện."}
          </DialogDescription>
        </DialogHeader>
        <form className='space-y-4' onSubmit={handleSubmit}>
          {isUpdate ? (
            <div>
              <Label>Giám khảo hiện tại</Label>
              <div className='rounded-md border p-3'>
                <div className='font-medium'>{getDisplayName((reviewer?.user as UserWithRole) || reviewer?.user)}</div>
                <div className='text-muted-foreground text-sm'>{reviewer?.user?.email}</div>
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor='reviewer-select'>Chọn giám khảo</Label>
              <Select
                disabled={loadingReviewers || isSubmitting}
                onValueChange={(value) =>
                  setFormData((prev: ReviewerCreateFormType) => ({ ...prev, reviewerId: value }))
                }
                value={formData.reviewerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingReviewers ? "Đang tải..." : "Chọn giám khảo"} />
                </SelectTrigger>
                <SelectContent>
                  {availableReviewers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className='flex flex-col'>
                        <span>{getDisplayName(user)}</span>
                        <span className='text-muted-foreground text-sm'>{user.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                  {availableReviewers.length === 0 && !loadingReviewers && (
                    <SelectItem disabled value='no-reviewers'>
                      Không có giám khảo khả dụng
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className='flex items-center space-x-2'>
            <Checkbox
              checked={formData.isLeader}
              id='is-leader'
              onCheckedChange={(checked) =>
                setFormData((prev: ReviewerCreateFormType) => ({ ...prev, isLeader: !!checked }))
              }
            />
            <Label htmlFor='is-leader'>Làm trưởng ban giám khảo</Label>
          </div>

          <div className='flex justify-end space-x-2'>
            <Button onClick={() => setOpen(false)} type='button' variant='outline'>
              Hủy
            </Button>
            <Button disabled={isSubmitting || loadingReviewers} type='submit'>
              {!isSubmitting && (reviewer ? "Cập nhật" : "Thêm giám khảo")}
              {isSubmitting && "Đang lưu..."}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { ReviewerDialog };
