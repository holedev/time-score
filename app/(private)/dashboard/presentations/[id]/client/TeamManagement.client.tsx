"use client";

import { CheckIcon, ClockIcon, PlayIcon, UsersIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useHandleError } from "@/hooks/use-handle-error";
import { createPresentEventChannel, sendAddTeamCurr, sendRemoveTeamCurr } from "@/utils/realtime";
import { startTeamPresentation, updateTeamStatus } from "../actions";

type Team = {
  id: number;
  title: string;
  description: string;
  members: string[];
  order: number;
  status: "PENDING" | "INPROGRESS" | "DONE";
};

type TeamManagementProps = {
  eventId: number;
  teams: Team[];
  presentationStatus: "PENDING" | "IN_PROGRESS" | "DONE";
};

const TeamManagement = ({ eventId, teams, presentationStatus }: TeamManagementProps) => {
  const { handleErrorClient } = useHandleError();
  const [teamList, setTeamList] = useState(teams);
  const [loadingTeams, setLoadingTeams] = useState<Set<number>>(new Set());
  const [channel, setChannel] = useState<ReturnType<typeof createPresentEventChannel> | null>(null);

  const handleTeamStatusUpdate = async (teamId: number, status: "PENDING" | "DONE") => {
    setLoadingTeams((prev) => new Set([...prev, teamId]));

    await handleErrorClient({
      cb: async () => await updateTeamStatus({ teamId, status, eventId }),
      onSuccess: async () => {
        setTeamList((prev) => prev.map((team) => (team.id === teamId ? { ...team, status } : team)));

        if (channel) {
          await sendRemoveTeamCurr({
            channel,
            payload: { teamId, status }
          });
        }
      },
      withSuccessNotify: true
    });

    setLoadingTeams((prev) => {
      const newSet = new Set(prev);
      newSet.delete(teamId);
      return newSet;
    });
  };

  const handleAddTeamCurr = async (teamId: number) => {
    setLoadingTeams((prev) => new Set([...prev, teamId]));

    await handleErrorClient({
      cb: async () => await startTeamPresentation({ teamId, eventId }),
      onSuccess: async () => {
        setTeamList((prev) => prev.map((team) => (team.id === teamId ? { ...team, status: "INPROGRESS" } : team)));

        // Send real-time update
        if (channel) {
          await sendAddTeamCurr({
            channel,
            payload: { teamId }
          });
        }
      },
      withSuccessNotify: true
    });

    setLoadingTeams((prev) => {
      const newSet = new Set(prev);
      newSet.delete(teamId);
      return newSet;
    });
  };

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

  const canChangeStatus = presentationStatus === "IN_PROGRESS";

  // Custom sorting function for teams by status priority
  const sortTeamsByStatus = (a: Team, b: Team) => {
    const statusPriority = {
      INPROGRESS: 0,
      PENDING: 1,
      DONE: 2
    };

    const priorityA = statusPriority[a.status];
    const priorityB = statusPriority[b.status];

    // First sort by status priority
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // If same status, sort by original order
    return a.order - b.order;
  };

  useEffect(() => {
    const realtimeChannel = createPresentEventChannel({ eventId });

    // Subscribe to channel
    realtimeChannel.subscribe();
    setChannel(realtimeChannel);

    // Cleanup on unmount
    return () => {
      realtimeChannel.unsubscribe();
      setChannel(null);
    };
  }, [eventId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <UsersIcon className='h-5 w-5' />
          Danh sách đội thi ({teamList.length} đội) - Đang chờ (
          {teamList.filter((team) => team.status === "PENDING").length} đội) - Đã hoàn thành (
          {teamList.filter((team) => team.status === "DONE").length} đội)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {teamList.length === 0 ? (
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
              {teamList.sort(sortTeamsByStatus).map((team, index) => (
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
                    <div className='flex items-center gap-2'>
                      {canChangeStatus && team.status === "PENDING" && (
                        <>
                          <Button
                            disabled={loadingTeams.has(team.id)}
                            onClick={() => handleAddTeamCurr(team.id)}
                            size='sm'
                            variant='default'
                          >
                            <PlayIcon className='mr-1 h-4 w-4' />
                            Thêm vào hiện tại
                          </Button>
                          <Button
                            disabled={loadingTeams.has(team.id)}
                            onClick={() => handleTeamStatusUpdate(team.id, "DONE")}
                            size='sm'
                            variant='outline'
                          >
                            <CheckIcon className='mr-1 h-4 w-4' />
                            Hoàn thành
                          </Button>
                        </>
                      )}

                      {canChangeStatus && team.status === "INPROGRESS" && (
                        <>
                          <Button
                            disabled={loadingTeams.has(team.id)}
                            onClick={() => handleTeamStatusUpdate(team.id, "DONE")}
                            size='sm'
                          >
                            <CheckIcon className='mr-1 h-4 w-4' />
                            Hoàn thành
                          </Button>
                          <Button
                            disabled={loadingTeams.has(team.id)}
                            onClick={() => handleTeamStatusUpdate(team.id, "PENDING")}
                            size='sm'
                            variant='outline'
                          >
                            <ClockIcon className='mr-1 h-4 w-4' />
                            Dừng trình bày
                          </Button>
                        </>
                      )}

                      {canChangeStatus && team.status === "DONE" && (
                        <Button
                          disabled={loadingTeams.has(team.id)}
                          onClick={() => handleTeamStatusUpdate(team.id, "PENDING")}
                          size='sm'
                          variant='outline'
                        >
                          <ClockIcon className='mr-1 h-4 w-4' />
                          Chờ lại
                        </Button>
                      )}

                      {!canChangeStatus && (
                        <span className='text-muted-foreground text-sm'>
                          {presentationStatus === "PENDING" ? "Chờ bắt đầu" : "Đã kết thúc"}
                        </span>
                      )}
                    </div>
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

export { TeamManagement };
