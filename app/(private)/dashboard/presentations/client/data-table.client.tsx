"use client";

import { EyeIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CompleteEvent } from "@/configs/prisma/zod";
import { PresentationStatusMap } from "@/constants";
import { useHandleError } from "@/hooks/use-handle-error";
import { handleDatetime } from "@/utils/handle-datetime";

type PresentationDataTableProps = {
  data: CompleteEvent[];
};

const PresentationDataTable = ({ data }: PresentationDataTableProps) => {
  const { handleErrorClient } = useHandleError();
  const [events, setEvents] = useState(data);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "secondary";
      case "IN_PROGRESS":
        return "default";
      case "DONE":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status: string) =>
    PresentationStatusMap[status as keyof typeof PresentationStatusMap] || "Không xác định";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách sự kiện</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên sự kiện</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Số đội</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <div>
                    <div className='font-medium'>{event.title}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='text-sm'>
                    <div>Bắt đầu: {handleDatetime(new Date(event.timeStart))}</div>
                    <div>Kết thúc: {handleDatetime(new Date(event.timeEnd))}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant='outline'>{event.teams?.length || 0} đội</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(event.presentationStatus)}>
                    {getStatusText(event.presentationStatus)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Button asChild size='sm' variant='ghost'>
                      <Link href={`/dashboard/presentations/${event.id}`}>
                        <EyeIcon className='mr-1 h-4 w-4' />
                        Xem chi tiết
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {events.length === 0 && (
          <div className='py-8 text-center text-muted-foreground'>Không có sự kiện nào được tìm thấy.</div>
        )}
      </CardContent>
    </Card>
  );
};

export { PresentationDataTable };
