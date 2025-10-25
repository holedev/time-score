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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CompleteCriteriaTemplate, RelatedEventModel } from "@/configs/prisma/zod";
import { useHandleError } from "@/hooks/use-handle-error";
import { deleteCriteriaRecord, deleteCriteriaTemplate } from "./actions";
import { CriteriaRecordDialog, CriteriaTemplateDialog, HandleSuccessActionType } from "./CriteriaDialog.client";

type CriteriaTabProps = {
  event: z.infer<typeof RelatedEventModel>;
};

function CriteriaTabClient({ event }: CriteriaTabProps) {
  const [criteriaTemplate, setCriteriaTemplate] = useState<CompleteCriteriaTemplate | null>(
    event.criteriaTemplateId || null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingRecordIds, setDeletingRecordIds] = useState<Set<number>>(new Set());
  const { handleErrorClient } = useHandleError();

  const handleDeleteCriteria = async () => {
    if (!criteriaTemplate) {
      return;
    }

    setIsDeleting(true);

    await handleErrorClient({
      cb: async () =>
        await deleteCriteriaTemplate({
          id: criteriaTemplate.id,
          eventId: event.id
        }),
      withSuccessNotify: true,
      onSuccess: () => {
        setCriteriaTemplate(null);
      }
    });

    setIsDeleting(false);
  };

  const handleSuccessAction = ({ template, action }: HandleSuccessActionType) => {
    if (action === "create") {
      setCriteriaTemplate(template);
    }

    if (action === "update") {
      setCriteriaTemplate(template);
    }

    if (action === "delete") {
      setCriteriaTemplate(null);
    }
  };

  const handleDeleteRecord = async (recordId: number) => {
    setDeletingRecordIds((prev: Set<number>) => new Set(prev).add(recordId));

    await handleErrorClient({
      cb: async () => {
        const response = await deleteCriteriaRecord({ id: recordId });
        return response;
      },
      withSuccessNotify: true,
      onSuccess: ({ data }) => {
        const updatedTemplate = data.payload as CompleteCriteriaTemplate;
        setCriteriaTemplate(updatedTemplate);
      }
    });

    setDeletingRecordIds((prev: Set<number>) => {
      const newSet = new Set(prev);
      newSet.delete(recordId);
      return newSet;
    });
  };

  return (
    <div className='rounded-lg border p-4'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='font-semibold text-lg'>Quản lý tiêu chí cuộc thi</h3>
        {!criteriaTemplate && (
          <CriteriaTemplateDialog eventId={event.id} onSuccess={handleSuccessAction}>
            <Button>
              <PlusIcon className='mr-2 h-4 w-4' />
              Tạo tiêu chí mới
            </Button>
          </CriteriaTemplateDialog>
        )}
      </div>

      {criteriaTemplate ? (
        <div className='space-y-6'>
          <div className='rounded-lg border p-4'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <h4 className='font-medium text-lg'>{criteriaTemplate.title}</h4>
                <div className='mt-2 flex items-center gap-2'>
                  <Badge variant='secondary'>{criteriaTemplate.criteriaRecords?.length || 0} tiêu chí con</Badge>
                  <Badge variant='outline'>
                    Tổng điểm:{" "}
                    {criteriaTemplate.criteriaRecords?.reduce((sum, record) => sum + (record.maxScore || 0), 0) || 0}
                  </Badge>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className='text-destructive hover:text-destructive'
                    disabled={isDeleting}
                    size='sm'
                    variant='outline'
                  >
                    <TrashIcon className='h-4 w-4' />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa tiêu chí</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn xóa tiêu chí "{criteriaTemplate.title}"? Hành động này sẽ xóa tất cả tiêu
                      chí con và không thể hoàn tác.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                      className='bg-destructive hover:bg-destructive/90'
                      onClick={handleDeleteCriteria}
                    >
                      Xóa tiêu chí
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <Separator />

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label className='font-medium text-base'>Chi tiết tiêu chí</Label>
              <CriteriaRecordDialog criteriaTemplateId={criteriaTemplate.id} onSuccess={handleSuccessAction}>
                <Button size='sm' variant='outline'>
                  <PlusIcon className='mr-2 h-4 w-4' />
                  Thêm tiêu chí con
                </Button>
              </CriteriaRecordDialog>
            </div>

            {criteriaTemplate.criteriaRecords && criteriaTemplate.criteriaRecords.length > 0 ? (
              <div className='rounded-lg border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Chi tiết</TableHead>
                      <TableHead className='text-center'>Điểm tối đa</TableHead>
                      <TableHead className='text-right'>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {criteriaTemplate.criteriaRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className='font-mono text-sm'>#{record.id}</TableCell>
                        <TableCell>
                          <div className='max-w-md'>
                            <p className='text-sm'>{record.title || "Chưa có mô tả"}</p>
                            <p className='mt-1 text-muted-foreground text-xs'>{record.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className='text-center'>
                          <Badge className='font-mono' variant='outline'>
                            {record.maxScore} điểm
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end space-x-1'>
                            <CriteriaRecordDialog
                              criteriaTemplateId={criteriaTemplate.id}
                              onSuccess={handleSuccessAction}
                              record={record}
                            >
                              <Button size='sm' title='Chỉnh sửa' variant='outline'>
                                <EditIcon className='h-4 w-4' />
                              </Button>
                            </CriteriaRecordDialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  className='text-destructive hover:text-destructive'
                                  disabled={deletingRecordIds.has(record.id)}
                                  size='sm'
                                  title='Xóa tiêu chí con'
                                  variant='outline'
                                >
                                  <TrashIcon className='h-4 w-4' />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Xác nhận xóa tiêu chí con</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bạn có chắc chắn muốn xóa tiêu chí con này? Hành động này không thể hoàn tác.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    className='bg-destructive hover:bg-destructive/90'
                                    onClick={() => handleDeleteRecord(record.id)}
                                  >
                                    Xóa tiêu chí con
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
              </div>
            ) : (
              <div className='rounded-lg border border-dashed py-12 text-center'>
                <div className='mx-auto max-w-md'>
                  <PlusIcon className='mx-auto h-12 w-12 text-muted-foreground' />
                  <h4 className='mt-4 font-medium'>Chưa có tiêu chí con</h4>
                  <p className='mt-2 text-muted-foreground text-sm'>
                    Thêm các tiêu chí con để định nghĩa chi tiết cách chấm điểm cho cuộc thi
                  </p>
                  <CriteriaRecordDialog criteriaTemplateId={criteriaTemplate.id} onSuccess={handleSuccessAction}>
                    <Button className='mt-4' variant='outline'>
                      <PlusIcon className='mr-2 h-4 w-4' />
                      Thêm tiêu chí con đầu tiên
                    </Button>
                  </CriteriaRecordDialog>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* No Criteria Template State */
        <div className='py-12 text-center'>
          <div className='mx-auto max-w-md'>
            <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
              <PlusIcon className='h-6 w-6 text-muted-foreground' />
            </div>
            <h4 className='mt-4 font-medium'>Chưa có tiêu chí nào</h4>
            <p className='mt-2 text-muted-foreground text-sm'>
              Tạo tiêu chí để định nghĩa cách thức chấm điểm cho cuộc thi này
            </p>
            <CriteriaTemplateDialog eventId={event.id} onSuccess={handleSuccessAction}>
              <Button className='mt-4'>
                <PlusIcon className='mr-2 h-4 w-4' />
                Tạo tiêu chí đầu tiên
              </Button>
            </CriteriaTemplateDialog>
          </div>
        </div>
      )}
    </div>
  );
}

export { CriteriaTabClient };
