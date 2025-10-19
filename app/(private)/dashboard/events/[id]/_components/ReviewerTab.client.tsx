"use client";

import { TrashIcon } from "lucide-react";
import { useState } from "react";
import z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RelatedEventModel } from "@/configs/prisma/zod";
import { useHandleError } from "@/hooks/use-handle-error";
import { UserWithRole } from "@/types/global";
import { addReviewer, type ReviewerCreateFormType, removeReviewer, updateReviewerLeader } from "../actions";

type ReviewerTabProps = {
  event: z.infer<typeof RelatedEventModel>;
};

function ReviewerTab({ event }: ReviewerTabProps) {
  const [reviewers, setReviewers] = useState(event.eventReviewers || []);
  const [newReviewer, setNewReviewer] = useState<ReviewerCreateFormType>({
    reviewerId: "",
    isLeader: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingReviewerIds, setDeletingReviewerIds] = useState<Set<number>>(new Set());
  const [togglingLeaderIds, setTogglingLeaderIds] = useState<Set<number>>(new Set());
  const { handleErrorClient } = useHandleError();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newReviewer.reviewerId.trim()) {
      setIsSubmitting(true);

      await handleErrorClient({
        cb: async () => {
          const response = await addReviewer({
            eventId: event.id,
            reviewerData: newReviewer
          });

          if (response.error) {
            throw new Error(response.error.message);
          }

          // Reset form
          setNewReviewer({
            reviewerId: "",
            isLeader: false
          });

          // Refresh the page to show updated data
          window.location.reload();

          return response;
        },
        onSuccess: () => {
          // Success handled by page reload
        },
        withSuccessNotify: true
      });

      setIsSubmitting(false);
    }
  };

  const handleDeleteReviewer = async (reviewerId: number) => {
    setDeletingReviewerIds((prev) => new Set(prev).add(reviewerId));

    await handleErrorClient({
      cb: async () => {
        const response = await removeReviewer({
          id: reviewerId,
          eventId: event.id
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        // Remove from local state
        setReviewers((prev) => prev.filter((reviewer) => reviewer.id !== reviewerId));

        return response;
      },
      onSuccess: () => {
        // Success handled by state update
      },
      withSuccessNotify: true
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

        if (response.error) {
          throw new Error(response.error.message);
        }

        // Update local state
        setReviewers((prev) => prev.map((r) => (r.id === reviewerId ? { ...r, isLeader: !r.isLeader } : r)));

        return response;
      },
      onSuccess: () => {
        // Success handled by state update
      },
      withSuccessNotify: true
    });

    setTogglingLeaderIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(reviewerId);
      return newSet;
    });
  };

  return (
    <div className='rounded-lg border p-4'>
      <h3 className='mb-4 font-semibold text-lg'>Quản lý giám khảo</h3>

      {/* Existing Reviewers */}
      <div className='mb-6 space-y-4'>
        <Label className='font-medium text-sm'>Danh sách giám khảo hiện tại</Label>
        {reviewers.length === 0 ? (
          <p className='text-muted-foreground text-sm'>Chưa có giám khảo nào</p>
        ) : (
          <div className='space-y-3'>
            {reviewers.map((reviewer) => (
              <div className='rounded-lg border p-3' key={reviewer.id}>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                      <h4 className='font-medium'>
                        {(reviewer.user as UserWithRole)?.raw_user_meta_data?.full_name ||
                          reviewer.user?.email ||
                          reviewer.reviewerId}
                      </h4>
                      {reviewer.isLeader && <Badge variant='default'>Trưởng ban</Badge>}
                    </div>
                    {reviewer.user?.email && <p className='text-muted-foreground text-sm'>{reviewer.user.email}</p>}
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      disabled={togglingLeaderIds.has(reviewer.id)}
                      onClick={() => handleToggleLeader(reviewer.id)}
                      size='sm'
                      variant='ghost'
                    >
                      {reviewer.isLeader ? "Bỏ trưởng ban" : "Làm trưởng ban"}
                    </Button>
                    <Button
                      className='text-destructive hover:text-destructive'
                      disabled={deletingReviewerIds.has(reviewer.id)}
                      onClick={() => handleDeleteReviewer(reviewer.id)}
                      size='sm'
                      variant='ghost'
                    >
                      <TrashIcon className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator className='my-6' />

      {/* Add New Reviewer Form */}
      <form className='space-y-4' onSubmit={handleSubmit}>
        <Label className='font-medium text-sm'>Thêm giám khảo mới</Label>

        <div className='space-y-3'>
          <div>
            <Label htmlFor='reviewer-id'>ID/Email người dùng</Label>
            <Input
              id='reviewer-id'
              onChange={(e) => setNewReviewer((prev) => ({ ...prev, reviewerId: e.target.value }))}
              placeholder='Nhập ID hoặc email người dùng'
              required
              value={newReviewer.reviewerId}
            />
          </div>

          <div className='flex items-center space-x-2'>
            <Checkbox
              checked={newReviewer.isLeader}
              id='is-leader'
              onCheckedChange={(checked) => setNewReviewer((prev) => ({ ...prev, isLeader: !!checked }))}
            />
            <Label htmlFor='is-leader'>Làm trưởng ban giám khảo</Label>
          </div>

          <Button className='w-full' disabled={isSubmitting} type='submit'>
            {isSubmitting ? "Đang thêm..." : "Thêm giám khảo"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export { ReviewerTab };
