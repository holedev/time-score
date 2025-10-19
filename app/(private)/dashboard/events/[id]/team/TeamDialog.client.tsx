import { PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompleteTeam } from "@/configs/prisma/zod/team";
import { useHandleError } from "@/hooks/use-handle-error";
import { createTeam, TeamCreateFormType, updateTeam } from "./actions";

export type Member = {
  id: string;
  fullName: string;
};

type TeamFormData = Omit<TeamCreateFormType, "order" | "members"> & {
  members: Member[];
};

export type HandleSuccessActionType = {
  team: CompleteTeam;
  action: "create" | "update";
};

type TeamDialogProps = {
  team?: CompleteTeam;
  eventId: number;
  onSuccess: (data: HandleSuccessActionType) => void;
  children: React.ReactNode;
  existingTeams: CompleteTeam[];
};

function TeamDialog({ team, eventId, onSuccess, children, existingTeams }: TeamDialogProps) {
  const { handleErrorClient, toast } = useHandleError();

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

    const memberStrings = formData.members.map((m) => JSON.stringify(m));

    const isUpdate = Boolean(team);
    setIsSubmitting(true);

    if (isUpdate && team?.id) {
      await handleErrorClient({
        cb: async () => {
          const updateData = {
            title: formData.title,
            description: formData.description,
            image: formData.image,
            members: memberStrings
          };

          const response = await updateTeam({
            id: team.id,
            eventId,
            teamData: updateData
          });

          return response;
        },
        withSuccessNotify: true,
        onSuccess: ({ data }) => {
          setOpen(false);
          const newTeam = data.payload as CompleteTeam;
          onSuccess({ team: newTeam, action: "update" });
        }
      });
    } else {
      await handleErrorClient({
        cb: async () => {
          const maxOrder = existingTeams.length > 0 ? Math.max(...existingTeams.map((t) => t.order)) : 0;
          const teamData: TeamCreateFormType = {
            ...formData,
            members: memberStrings,
            order: maxOrder + 1
          };

          const response = await createTeam({
            eventId,
            teamData
          });

          return response;
        },
        withSuccessNotify: true,
        onSuccess: ({ data }) => {
          setOpen(false);
          const newTeam = data.payload as CompleteTeam;
          onSuccess({ team: newTeam, action: "create" });
        }
      });
    }
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

export { TeamDialog };
