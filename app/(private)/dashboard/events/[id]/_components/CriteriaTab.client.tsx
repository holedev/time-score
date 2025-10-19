"use client";

import { TrashIcon } from "lucide-react";
import { useState } from "react";
import z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RelatedEventModel } from "@/configs/prisma/zod";
import { useHandleError } from "@/hooks/use-handle-error";
import { type CriteriaTemplateCreateFormType, createCriteriaTemplate, deleteCriteriaTemplate } from "../actions";

type CriteriaTabProps = {
  event: z.infer<typeof RelatedEventModel>;
};

function CriteriaTab({ event }: CriteriaTabProps) {
  const [criteriaTemplate, setCriteriaTemplate] = useState(event.criteriaTemplateId);
  const [newCriteria, setNewCriteria] = useState<CriteriaTemplateCreateFormType>({
    title: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { handleErrorClient } = useHandleError();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCriteria.title.trim()) {
      setIsSubmitting(true);

      await handleErrorClient({
        cb: async () => {
          const response = await createCriteriaTemplate({
            eventId: event.id,
            criteriaData: newCriteria
          });

          if (response.error) {
            throw new Error(response.error.message);
          }

          // Reset form
          setNewCriteria({
            title: ""
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

  const handleDeleteCriteria = async () => {
    if (!criteriaTemplate) {
      return;
    }

    setIsDeleting(true);

    await handleErrorClient({
      cb: async () => {
        const response = await deleteCriteriaTemplate({
          id: criteriaTemplate.id,
          eventId: event.id
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        // Update local state
        setCriteriaTemplate(null);

        return response;
      },
      onSuccess: () => {
        // Success handled by state update
      },
      withSuccessNotify: true
    });

    setIsDeleting(false);
  };

  return (
    <div className='rounded-lg border p-4'>
      <h3 className='mb-4 font-semibold text-lg'>Quản lý tiêu chí cuộc thi</h3>

      {/* Current Criteria Template */}
      <div className='mb-6 space-y-4'>
        <Label className='font-medium text-sm'>Tiêu chí hiện tại</Label>
        {criteriaTemplate ? (
          <div className='rounded-lg border p-3'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <h4 className='font-medium'>{criteriaTemplate.title}</h4>
                <div className='mt-2'>
                  <Badge variant='secondary'>{criteriaTemplate.criteriaRecords?.length || 0} tiêu chí con</Badge>
                </div>
              </div>
              <Button
                className='text-destructive hover:text-destructive'
                disabled={isDeleting}
                onClick={handleDeleteCriteria}
                size='sm'
                variant='ghost'
              >
                <TrashIcon className='h-4 w-4' />
              </Button>
            </div>
          </div>
        ) : (
          <p className='text-muted-foreground text-sm'>Chưa có tiêu chí nào được thiết lập</p>
        )}
      </div>

      {!criteriaTemplate && (
        <>
          <Separator className='my-6' />

          {/* Add New Criteria Template Form */}
          <form className='space-y-4' onSubmit={handleSubmit}>
            <Label className='font-medium text-sm'>Tạo tiêu chí mới</Label>

            <div className='space-y-3'>
              <div>
                <Label htmlFor='criteria-title'>Tên tiêu chí</Label>
                <Input
                  id='criteria-title'
                  onChange={(e) => setNewCriteria((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder='Nhập tên tiêu chí'
                  required
                  value={newCriteria.title}
                />
              </div>

              <Button className='w-full' disabled={isSubmitting} type='submit'>
                {isSubmitting ? "Đang tạo..." : "Tạo tiêu chí"}
              </Button>
            </div>
          </form>
        </>
      )}

      {criteriaTemplate && (
        <>
          <Separator className='my-6' />

          {/* Criteria Records */}
          <div className='space-y-4'>
            <Label className='font-medium text-sm'>Chi tiết tiêu chí</Label>
            {criteriaTemplate.criteriaRecords && criteriaTemplate.criteriaRecords.length > 0 ? (
              <div className='space-y-3'>
                {criteriaTemplate.criteriaRecords.map((record) => (
                  <div className='rounded-lg border p-3' key={record.id}>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium'>Chi tiết #{record.id}</span>
                      <Badge variant='outline'>{record.maxScore} điểm</Badge>
                    </div>
                    <p className='mt-1 text-muted-foreground text-sm'>{record.details}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-muted-foreground text-sm'>Chưa có tiêu chí con nào</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export { CriteriaTab };
