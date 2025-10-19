"use client";

import { ChevronDownIcon, ChevronUpIcon, EditIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
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
import { CompleteTeam, RelatedEventModel } from "@/configs/prisma/zod";
import { useHandleError } from "@/hooks/use-handle-error";
import { deleteTeam, updateTeamOrders } from "./actions";
import { HandleSuccessActionType, Member, TeamDialog } from "./TeamDialog.client";

const _DEBOUNCE_DELAY_MS = 1000;

type TeamTabProps = {
  event: z.infer<typeof RelatedEventModel>;
};

function TeamTabClient({ event }: TeamTabProps) {
  const [teams, setTeams] = useState(event.teams || []);
  const [deletingTeamIds, setDeletingTeamIds] = useState<Set<number>>(new Set());
  const { handleErrorClient } = useHandleError();
  const debounceRef = useRef<NodeJS.Timeout>(null);

  const debouncedUpdateOrders = useCallback(
    (teamsToUpdate: CompleteTeam[]) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        const teamOrders = teamsToUpdate.map((team) => ({
          id: team.id,
          order: team.order
        }));

        await handleErrorClient({
          cb: async () =>
            await updateTeamOrders({
              eventId: event.id,
              teamOrders
            }),
          withSuccessNotify: false
        });
      }, _DEBOUNCE_DELAY_MS);
    },
    [event.id, handleErrorClient]
  );

  const handleDeleteTeam = async (teamId: number) => {
    setDeletingTeamIds((prev) => new Set(prev).add(teamId));

    await handleErrorClient({
      cb: async () =>
        await deleteTeam({
          id: teamId,
          eventId: event.id
        }),
      withSuccessNotify: true,
      onSuccess: () => {
        setTeams((prev) => prev.filter((team) => team.id !== teamId));
      }
    });

    setDeletingTeamIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(teamId);
      return newSet;
    });
  };

  const handleSuccessAction = ({ team, action }: HandleSuccessActionType) => {
    if (action === "create") {
      setTeams((prev) => [...prev, team].sort((a, b) => a.order - b.order));
    }

    if (action === "update") {
      setTeams((prev) => prev.map((t) => (t.id === team.id ? team : t)).sort((a, b) => a.order - b.order));
    }
  };

  const handleMoveUp = (teamId: number) => {
    const teamIndex = teams.findIndex((t) => t.id === teamId);
    if (teamIndex <= 0) {
      return;
    }

    const newTeams = [...teams];
    [newTeams[teamIndex], newTeams[teamIndex - 1]] = [newTeams[teamIndex - 1], newTeams[teamIndex]];

    newTeams.forEach((team, index) => {
      team.order = index + 1;
    });

    setTeams(newTeams);
    debouncedUpdateOrders(newTeams);
  };

  const handleMoveDown = (teamId: number) => {
    const teamIndex = teams.findIndex((t) => t.id === teamId);
    if (teamIndex >= teams.length - 1 || teamIndex === -1) {
      return;
    }

    const newTeams = [...teams];
    [newTeams[teamIndex], newTeams[teamIndex + 1]] = [newTeams[teamIndex + 1], newTeams[teamIndex]];

    newTeams.forEach((team, index) => {
      team.order = index + 1;
    });

    setTeams(newTeams);
    debouncedUpdateOrders(newTeams);
  };

  const parseMembers = (members: string[]): Member[] =>
    members.map((member) => {
      try {
        const parsed = JSON.parse(member);
        if (parsed && typeof parsed === "object" && parsed.id && parsed.fullName) {
          return { id: parsed.id, fullName: parsed.fullName };
        }

        return { id: member, fullName: member };
      } catch {
        return { id: member, fullName: member };
      }
    });

  return (
    <div className='rounded-lg border p-4'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='font-semibold text-lg'>Quản lý đội tham gia</h3>
        <TeamDialog eventId={event.id} existingTeams={teams} onSuccess={handleSuccessAction}>
          <Button>
            <PlusIcon className='mr-2 h-4 w-4' />
            Thêm đội mới
          </Button>
        </TeamDialog>
      </div>

      {teams.length === 0 ? (
        <div className='py-8 text-center'>
          <p className='text-muted-foreground'>Chưa có đội nào tham gia</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên đội</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Thành viên</TableHead>
              <TableHead>Thứ tự</TableHead>
              <TableHead className='text-right'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => {
              const members = parseMembers(team.members);
              return (
                <TableRow key={team.id}>
                  <TableCell className='font-medium'>{team.title}</TableCell>
                  <TableCell>{team.description}</TableCell>
                  <TableCell>
                    <div className='flex flex-wrap gap-1'>
                      {members.map((member) => (
                        <Badge className='text-xs' key={member.id} variant='secondary'>
                          {member.id} - {member.fullName}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{team.order}</TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end space-x-1'>
                      <Button
                        disabled={teams.findIndex((t) => t.id === team.id) === 0}
                        onClick={() => handleMoveUp(team.id)}
                        size='sm'
                        title='Di chuyển lên'
                        variant='outline'
                      >
                        <ChevronUpIcon className='h-4 w-4' />
                      </Button>
                      <Button
                        disabled={teams.findIndex((t) => t.id === team.id) === teams.length - 1}
                        onClick={() => handleMoveDown(team.id)}
                        size='sm'
                        title='Di chuyển xuống'
                        variant='outline'
                      >
                        <ChevronDownIcon className='h-4 w-4' />
                      </Button>
                      <TeamDialog eventId={event.id} existingTeams={teams} onSuccess={handleSuccessAction} team={team}>
                        <Button size='sm' title='Chỉnh sửa' variant='outline'>
                          <EditIcon className='h-4 w-4' />
                        </Button>
                      </TeamDialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            className='text-destructive hover:text-destructive'
                            disabled={deletingTeamIds.has(team.id)}
                            size='sm'
                            title='Xóa đội'
                            variant='outline'
                          >
                            <TrashIcon className='h-4 w-4' />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa đội</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa đội "{team.title}"? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              className='bg-destructive hover:bg-destructive/90'
                              onClick={() => handleDeleteTeam(team.id)}
                            >
                              Xóa đội
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export { TeamTabClient };
