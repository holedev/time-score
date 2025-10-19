import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompleteCriteriaRecord, CompleteCriteriaTemplate } from "@/configs/prisma/zod";
import { useHandleError } from "@/hooks/use-handle-error";
import {
  type CriteriaRecordCreateFormType,
  type CriteriaTemplateCreateFormType,
  createCriteriaRecord,
  createCriteriaTemplate,
  updateCriteriaRecord
} from "./actions";

export type HandleSuccessActionType = {
  template: CompleteCriteriaTemplate;
  action: "create" | "update" | "delete";
};

type CriteriaTemplateDialogProps = {
  eventId: number;
  onSuccess: (data: HandleSuccessActionType) => void;
  children: React.ReactNode;
};

type CriteriaRecordDialogProps = {
  criteriaTemplateId: number;
  record?: CompleteCriteriaRecord;
  onSuccess: (data: HandleSuccessActionType) => void;
  children: React.ReactNode;
};

function CriteriaTemplateDialog({ eventId, onSuccess, children }: CriteriaTemplateDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CriteriaTemplateCreateFormType>({
    title: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleErrorClient } = useHandleError();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return;
    }

    setIsSubmitting(true);

    await handleErrorClient({
      cb: async () =>
        await createCriteriaTemplate({
          eventId,
          criteriaData: formData
        }),
      withSuccessNotify: true,
      onSuccess: ({ data }) => {
        setOpen(false);
        setFormData({ title: "" });
        const newTemplate = data.payload as CompleteCriteriaTemplate;
        onSuccess({ template: newTemplate, action: "create" });
      }
    });

    setIsSubmitting(false);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo tiêu chí mới</DialogTitle>
        </DialogHeader>
        <form className='space-y-4' onSubmit={handleSubmit}>
          <div>
            <Label htmlFor='criteria-title'>Tên tiêu chí</Label>
            <Input
              id='criteria-title'
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder='Nhập tên tiêu chí'
              required
              value={formData.title}
            />
          </div>

          <div className='flex justify-end space-x-2'>
            <Button onClick={() => setOpen(false)} type='button' variant='outline'>
              Hủy
            </Button>
            <Button disabled={isSubmitting} type='submit'>
              {isSubmitting ? "Đang tạo..." : "Tạo tiêu chí"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CriteriaRecordDialog({ criteriaTemplateId, record, onSuccess, children }: CriteriaRecordDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CriteriaRecordCreateFormType>({
    details: record?.details || "",
    maxScore: record?.maxScore || 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleErrorClient } = useHandleError();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.details.trim() || formData.maxScore <= 0) {
      return;
    }

    setIsSubmitting(true);

    if (record) {
      // Update existing record
      await handleErrorClient({
        cb: async () => {
          const response = await updateCriteriaRecord({
            id: record.id,
            recordData: formData
          });

          return response;
        },
        withSuccessNotify: true,
        onSuccess: ({ data }) => {
          setOpen(false);
          const updatedTemplate = data.payload as CompleteCriteriaTemplate;
          onSuccess({ template: updatedTemplate, action: "update" });
        }
      });
    } else {
      // Create new record
      await handleErrorClient({
        cb: async () => {
          const response = await createCriteriaRecord({
            criteriaTemplateId,
            recordData: formData
          });

          return response;
        },
        withSuccessNotify: true,
        onSuccess: ({ data }) => {
          setOpen(false);
          setFormData({ details: "", maxScore: 0 });
          const updatedTemplate = data.payload as CompleteCriteriaTemplate;
          onSuccess({ template: updatedTemplate, action: "update" });
        }
      });
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{record ? "Cập nhật tiêu chí con" : "Thêm tiêu chí con"}</DialogTitle>
        </DialogHeader>
        <form className='space-y-4' onSubmit={handleSubmit}>
          <div>
            <Label htmlFor='record-details'>Mô tả chi tiết</Label>
            <Input
              id='record-details'
              onChange={(e) =>
                setFormData((prev: CriteriaRecordCreateFormType) => ({ ...prev, details: e.target.value }))
              }
              placeholder='Nhập mô tả chi tiết cho tiêu chí này'
              required
              value={formData.details}
            />
          </div>

          <div>
            <Label htmlFor='record-maxScore'>Điểm tối đa</Label>
            <Input
              id='record-maxScore'
              min={1}
              onChange={(e) =>
                setFormData((prev: CriteriaRecordCreateFormType) => ({
                  ...prev,
                  maxScore: Number.parseInt(e.target.value, 10) || 0
                }))
              }
              placeholder='Nhập điểm tối đa'
              required
              type='number'
              value={formData.maxScore || ""}
            />
          </div>

          <div className='flex justify-end space-x-2'>
            <Button onClick={() => setOpen(false)} type='button' variant='outline'>
              Hủy
            </Button>
            <Button disabled={isSubmitting} type='submit'>
              {!isSubmitting && (record ? "Cập nhật" : "Thêm tiêu chí")}
              {isSubmitting && "Đang lưu..."}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { CriteriaTemplateDialog, CriteriaRecordDialog };
