"use client";

import { EyeIcon, StarIcon } from "lucide-react";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CompleteEvent } from "@/configs/prisma/zod";
import { PresentationStatusMap } from "@/constants";
import { handleDatetime } from "@/utils/handle-datetime";

// Constants
const PROGRESS_BAR_FULL_PERCENTAGE = 100;

type ReviewerDataTableProps = {
  data: CompleteEvent[];
};

const ReviewerDataTable = ({ data }: ReviewerDataTableProps) => {
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

  const getRoleText = (isLeader: boolean) => (isLeader ? "Trưởng ban giám khảo" : "Giám khảo");

  const getRoleBadgeVariant = (isLeader: boolean) => (isLeader ? "default" : "secondary");

  const getCurrentTeam = (event: CompleteEvent) => event.teams?.find((team) => team.status === "INPROGRESS");

  const getCompletedTeams = (event: CompleteEvent) => event.teams?.filter((team) => team.status === "DONE").length || 0;

  const getTotalTeams = (event: CompleteEvent) => event.teams?.length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <StarIcon className='h-5 w-5' />
          Sự kiện cần chấm điểm
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên sự kiện</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Tiến độ</TableHead>
              <TableHead>Đội hiện tại</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => {
              const currentTeam = getCurrentTeam(event);
              const completedTeams = getCompletedTeams(event);
              const totalTeams = getTotalTeams(event);
              const reviewerData = event.eventReviewers?.[0];

              return (
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
                    <div className='text-sm'>
                      <div className='font-medium'>
                        {completedTeams}/{totalTeams} đội hoàn thành
                      </div>
                      {totalTeams > 0 && (
                        <div className='mt-1 h-2 w-20 rounded-full bg-muted'>
                          <div
                            className='h-full rounded-full bg-primary transition-all'
                            style={{ width: `${(completedTeams / totalTeams) * PROGRESS_BAR_FULL_PERCENTAGE}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {currentTeam ? (
                      <div className='text-sm'>
                        <div className='font-medium'>{currentTeam.title}</div>
                      </div>
                    ) : (
                      <span className='text-muted-foreground text-sm'>
                        {(() => {
                          if (event.presentationStatus === "PENDING") {
                            return "Chưa bắt đầu";
                          }
                          if (event.presentationStatus === "DONE") {
                            return "Đã kết thúc";
                          }
                          return "Không có đội";
                        })()}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {reviewerData && (
                      <Badge variant={getRoleBadgeVariant(reviewerData.isLeader)}>
                        {getRoleText(reviewerData.isLeader)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(event.presentationStatus)}>
                      {getStatusText(event.presentationStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Button asChild size='sm' variant='ghost'>
                        <Link href={`/dashboard/reviews/${event.id}`}>
                          <EyeIcon className='mr-1 h-4 w-4' />
                          Chấm điểm
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {events.length === 0 && (
          <div className='py-8 text-center text-muted-foreground'>
            Bạn chưa được phân công làm giám khảo cho sự kiện nào.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { ReviewerDataTable };
