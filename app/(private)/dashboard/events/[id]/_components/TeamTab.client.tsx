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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CompleteTeam, RelatedEventModel } from "@/configs/prisma/zod";
import { useHandleError } from "@/hooks/use-handle-error";
import { createTeam, deleteTeam, type TeamCreateFormType, updateTeam, updateTeamOrders } from "../actions";

const _DEBOUNCE_DELAY_MS = 1000;

type TeamTabProps = {
  event: z.infer<typeof RelatedEventModel>;
};

type Member = {
  id: string;
  fullName: string;
};

type TeamFormData = Omit<TeamCreateFormType, "order" | "members"> & {
  members: Member[];
};

type TeamDialogProps = {
  team?: CompleteTeam;
  eventId: number;
  onSuccess: () => void;
  children: React.ReactNode;
  existingTeams: CompleteTeam[];
};

function TeamDialog({ team, eventId, onSuccess, children, existingTeams }: TeamDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<TeamFormData>({
    title: team?.title || "",
    description: team?.description || "",
    image: team?.image || "",
    members:
      team?.members?.map((m: string) => {
        try {
          const parsed = JSON.parse(m);
          if (parsed && typeof parsed === "object" && parsed.id && parsed.fullName) {
            return { id: parsed.id, fullName: parsed.fullName };
          }
          return { id: m, fullName: m };
        } catch {
          return { id: m, fullName: m };
        }
      }) || []
  });
  const [newMember, setNewMember] = useState<Member>({ id: "", fullName: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleErrorClient, toast } = useHandleError();

  const handleAddMember = () => {
    const isExisting = formData.members.some((m) => m.id === newMember.id.trim());
    if (isExisting) {
      toast({
        title: "Thành viên đã tồn tại",
        description: "Thành viên đã tồn tại trong đội!",
        variant: "destructive"
      });
      return;
    }

    if (newMember.id.trim() && newMember.fullName.trim()) {
      setFormData((prev) => ({
        ...prev,
        members: [...prev.members, { ...newMember, id: newMember.id.trim(), fullName: newMember.fullName.trim() }]
      }));
      setNewMember({ id: "", fullName: "" });
    }
  };

  const handleRemoveMember = (memberId: string) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((member) => member.id !== memberId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return;
    }

    setIsSubmitting(true);

    await handleErrorClient({
      cb: async () => {
        const memberStrings = formData.members.map((m) => JSON.stringify(m));
        let response: Awaited<ReturnType<typeof createTeam>> | Awaited<ReturnType<typeof updateTeam>>;

        if (team) {
          const updateData = {
            title: formData.title,
            description: formData.description,
            image: formData.image,
            members: memberStrings
          };

          response = await updateTeam({
            id: team.id,
            eventId,
            teamData: updateData
          });
        } else {
          const maxOrder = existingTeams.length > 0 ? Math.max(...existingTeams.map((t) => t.order)) : 0;
          const teamData: TeamCreateFormType = {
            ...formData,
            members: memberStrings,
            order: maxOrder + 1
          };

          response = await createTeam({
            eventId,
            teamData
          });
        }

        if (response.error) {
          throw new Error(response.error.message);
        }

        setOpen(false);
        onSuccess();

        if (!team) {
          setFormData({
            title: "",
            description: "",
            image: "",
            members: []
          });
        }
        return response;
      },
      withSuccessNotify: true
    });

    setIsSubmitting(false);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{team ? "Cập nhật đội" : "Thêm đội mới"}</DialogTitle>
        </DialogHeader>
        <form className='space-y-4' onSubmit={handleSubmit}>
          <div>
            <Label htmlFor='team-title'>Tên đội</Label>
            <Input
              id='team-title'
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder='Nhập tên đội'
              required
              value={formData.title}
            />
          </div>

          <div>
            <Label htmlFor='team-description'>Mô tả</Label>
            <Input
              id='team-description'
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder='Nhập mô tả đội'
              value={formData.description}
            />
          </div>

          <div>
            <Label htmlFor='team-image'>Hình ảnh (URL)</Label>
            <Input
              id='team-image'
              onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
              placeholder='Nhập URL hình ảnh'
              value={formData.image}
            />
          </div>

          <div>
            <Label>Thành viên</Label>
            <div className='space-y-3'>
              <div className='grid grid-cols-2 gap-2'>
                <Input
                  onChange={(e) => setNewMember((prev) => ({ ...prev, id: e.target.value }))}
                  placeholder='Mã sinh viên (VD: 2051052051)'
                  value={newMember.id}
                />
                <div className='flex gap-2'>
                  <Input
                    onChange={(e) => setNewMember((prev) => ({ ...prev, fullName: e.target.value }))}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddMember();
                      }
                    }}
                    placeholder='Họ và tên'
                    value={newMember.fullName}
                  />
                  <Button onClick={handleAddMember} size='sm' type='button'>
                    <PlusIcon className='h-4 w-4' />
                  </Button>
                </div>
              </div>

              {formData.members.length > 0 && (
                <div className='space-y-2'>
                  {formData.members.map((member) => (
                    <div className='flex items-center justify-between rounded border p-2' key={member.id}>
                      <div>
                        <span className='font-medium'>{member.id}</span> - {member.fullName}
                      </div>
                      <button
                        className='text-destructive hover:text-destructive/80'
                        onClick={() => handleRemoveMember(member.id)}
                        type='button'
                      >
                        <TrashIcon className='h-4 w-4' />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className='flex justify-end space-x-2'>
            <Button onClick={() => setOpen(false)} type='button' variant='outline'>
              Hủy
            </Button>
            <Button disabled={isSubmitting} type='submit'>
              {!isSubmitting && (team ? "Cập nhật" : "Thêm đội")}
              {isSubmitting && "Đang lưu..."}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TeamTabClient({ event }: TeamTabProps) {
  const [teams, setTeams] = useState(event.teams || []);
  const [deletingTeamIds, setDeletingTeamIds] = useState<Set<number>>(new Set());
  const { handleErrorClient } = useHandleError();
  const debounceRef = useRef<NodeJS.Timeout>(null);

  // Debounced function to update team orders
  const debouncedUpdateOrders = useCallback(
    (teamsToUpdate: CompleteTeam[]) => {
      // Clear existing timeout
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Set new timeout
      debounceRef.current = setTimeout(async () => {
        const teamOrders = teamsToUpdate.map((team) => ({
          id: team.id,
          order: team.order
        }));

        await handleErrorClient({
          cb: async () => {
            const response = await updateTeamOrders({
              eventId: event.id,
              teamOrders
            });

            if (response.error) {
              throw new Error(response.error.message);
            }

            return response;
          },
          withSuccessNotify: false
        });
      }, _DEBOUNCE_DELAY_MS);
    },
    [event.id, handleErrorClient]
  );

  const handleDeleteTeam = async (teamId: number) => {
    setDeletingTeamIds((prev) => new Set(prev).add(teamId));

    await handleErrorClient({
      cb: async () => {
        const response = await deleteTeam({
          id: teamId,
          eventId: event.id
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        setTeams((prev) => prev.filter((team) => team.id !== teamId));
        return response;
      },
      withSuccessNotify: true
    });

    setDeletingTeamIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(teamId);
      return newSet;
    });
  };

  const handleRefresh = () => {
    window.location.reload();
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
        <TeamDialog eventId={event.id} existingTeams={teams} onSuccess={handleRefresh}>
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
                      <TeamDialog eventId={event.id} existingTeams={teams} onSuccess={handleRefresh} team={team}>
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
