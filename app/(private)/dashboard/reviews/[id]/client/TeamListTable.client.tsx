"use client";

import { StarIcon, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CompleteEvent } from "@/configs/prisma/zod";
import { CompleteEventReviewer } from "@/configs/prisma/zod/eventreviewer";
import { ScoreEntry } from "../actions";
import { TeamScoringDialog } from "./TeamScoringDialog.client";

type Team = {
  id: number;
  title: string;
  description: string;
  members: string[];
  order: number;
  status: "PENDING" | "INPROGRESS" | "DONE";
};

type TeamListTableProps = {
  event: CompleteEvent;
  reviewerData: CompleteEventReviewer;
};

const TeamListTable = ({ event, reviewerData }: TeamListTableProps) => {
  const teams = event.teams || [];

  const parseMembers = (members: string[]) => {
    try {
      return members.map((member) => {
        if (typeof member === "string") {
          try {
            const parsed = JSON.parse(member);
            const info = `${parsed.id} - ${parsed.fullName}`;
            return info || member;
          } catch {
            return member;
          }
        }
        return String(member);
      });
    } catch {
      return members;
    }
  };

  const getStatusBadge = (status: "PENDING" | "INPROGRESS" | "DONE") => {
    if (status === "DONE") {
      return <Badge variant='default'>Hoàn thành</Badge>;
    }
    if (status === "INPROGRESS") {
      return (
        <Badge className='bg-green-100 text-green-800' variant='secondary'>
          Đang trình bày
        </Badge>
      );
    }
    return <Badge variant='outline'>Chờ trình bày</Badge>;
  };

  // Check if a team has been scored by this reviewer
  const hasTeamBeenScored = (teamId: number): boolean => {
    const reviewerScores = reviewerData.scores as ScoreEntry[];
    if (!(reviewerScores && Array.isArray(reviewerScores))) {
      return true;
    }
    return reviewerScores.some((score) => score.teamId === teamId);
  };

  const sortTeamsByStatus = (a: Team, b: Team) => {
    const statusPriority = {
      INPROGRESS: 0,
      PENDING: 1,
      DONE: 2
    };

    const priorityA = statusPriority[a.status];
    const priorityB = statusPriority[b.status];

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    return a.order - b.order;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <UsersIcon className='h-5 w-5' />
          Danh sách đội thi ({teams.length} đội) - Đang chờ ({teams.filter((team) => team.status === "PENDING").length}{" "}
          đội) - Đã hoàn thành ({teams.filter((team) => team.status === "DONE").length} đội)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {teams.length === 0 ? (
          <div className='py-8 text-center text-muted-foreground'>Chưa có đội nào được đăng ký cho sự kiện này.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Tên đội</TableHead>
                <TableHead>Thành viên</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.sort(sortTeamsByStatus).map((team, index) => (
                <TableRow key={team.id}>
                  <TableCell className='font-medium'>{index + 1}</TableCell>
                  <TableCell>
                    <div>
                      <div className='font-medium'>{team.title}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='space-y-1'>
                      {parseMembers(team.members).map((member, idx) => (
                        <div className='text-sm' key={`member-${team.id}-${idx}`}>
                          {member}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(team.status)}</TableCell>
                  <TableCell>
                    <TeamScoringDialog event={event} reviewerData={reviewerData} team={team}>
                      <Button size='sm' variant='outline'>
                        <StarIcon className='mr-1 h-3 w-3' />
                        {hasTeamBeenScored(team.id) ? "Xem lại điểm" : "Chấm điểm"}
                      </Button>
                    </TeamScoringDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export { TeamListTable };
