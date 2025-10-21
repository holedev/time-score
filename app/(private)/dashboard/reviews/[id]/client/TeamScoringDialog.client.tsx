"use client";

import { SaveIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { LoadingComponent } from "@/components/custom/Loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CompleteEvent } from "@/configs/prisma/zod";
import { CompleteEventReviewer } from "@/configs/prisma/zod/eventreviewer";
import { useHandleError } from "@/hooks/use-handle-error";
import { createReviewerEventChannel, receiveScoreEditToggle } from "@/utils/realtime";
import { getReviewerScoresForTeam, ScoreEntry, saveReviewerScores } from "../actions";

// Constants
const PROGRESS_BAR_FULL_PERCENTAGE = 100;

type Team = {
  id: number;
  title: string;
  image: string;
  description: string;
  members: string[];
  status: string;
};

type TeamScoringDialogProps = {
  event: CompleteEvent;
  team: Team;
  reviewerData: CompleteEventReviewer;
  children: React.ReactNode;
};

const TeamScoringDialog = ({ event, team, reviewerData, children }: TeamScoringDialogProps) => {
  const { handleErrorClient, toast } = useHandleError();
  const [scoreEntries, setScoreEntries] = useState<ScoreEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentCanEditScore, setCurrentCanEditScore] = useState(event.canEditScore);

  const criteria = event.criteriaTemplateId?.criteriaRecords || [];
  const canEdit = currentCanEditScore !== false;

  const initializeScores = () => {
    const initialEntries = criteria.map((criterion) => ({
      teamId: team.id,
      criteriaRecordId: criterion.id,
      score: 0,
      comment: ""
    }));
    setScoreEntries(initialEntries);
  };

  const loadScores = async () => {
    setIsLoading(true);
    await handleErrorClient({
      cb: async () => await getReviewerScoresForTeam({ eventId: event.id, teamId: team.id }),
      withSuccessNotify: false,
      onSuccess: ({ data }) => {
        const existingScores = data.payload as ScoreEntry[];
        if (existingScores && Array.isArray(existingScores)) {
          const mergedEntries = criteria.map((criterion) => {
            const existingEntry = existingScores.find((entry) => entry.criteriaRecordId === criterion.id);
            return (
              existingEntry || {
                teamId: team.id,
                criteriaRecordId: criterion.id,
                score: 0,
                comment: ""
              }
            );
          });
          setScoreEntries(mergedEntries);
        } else {
          initializeScores();
        }
      }
    });
    setIsLoading(false);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <todo>
  useEffect(() => {
    if (!(isOpen && team?.id)) {
      return;
    }
    loadScores();
  }, [isOpen, team?.id, event.id]);

  const handleScoreChange = (criteriaRecordId: number, value: string | number, maxScore?: number) => {
    setScoreEntries((prev) =>
      // TODO: improve
      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <x2 loop>
      prev.map((entry) => {
        if (entry.criteriaRecordId !== criteriaRecordId) {
          return entry;
        }

        if (value === "") {
          return { ...entry, score: 0 };
        }

        let num = Number(value);
        if (Number.isNaN(num)) {
          return entry;
        }

        if (num < 0) {
          num = 0;
        }

        if (maxScore !== undefined && num > maxScore) {
          num = maxScore;
        }

        return { ...entry, score: num };
      })
    );
  };

  const handleCommentChange = (criteriaRecordId: number, comment: string) => {
    setScoreEntries((prev) =>
      prev.map((entry) => (entry.criteriaRecordId === criteriaRecordId ? { ...entry, comment } : entry))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    await handleErrorClient({
      cb: async () =>
        await saveReviewerScores({
          eventId: event.id,
          teamId: team.id,
          scores: scoreEntries
        }),
      withSuccessNotify: true,
      onSuccess: () => {
        setIsOpen(false);
      }
    });
    setIsSaving(false);
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

  const getTotalScore = () => scoreEntries.reduce((sum, entry) => sum + (entry.score || 0), 0);
  const getMaxTotalScore = () => criteria.reduce((sum, criterion) => sum + criterion.maxScore, 0);

  const renderDialogContent = () => {
    if (isLoading) {
      return <LoadingComponent />;
    }

    if (criteria.length === 0) {
      return (
        <div className='flex items-center justify-center py-8'>
          <div className='text-center text-muted-foreground'>
            <StarIcon className='mx-auto mb-2 h-8 w-8 opacity-50' />
            <div className='text-sm'>Chưa có tiêu chí chấm điểm</div>
          </div>
        </div>
      );
    }

    return (
      <div className='space-y-4'>
        {!canEdit && (
          <div className='rounded-lg border border-orange-200 bg-orange-50 p-3'>
            <div className='flex items-center gap-2 text-orange-800 text-sm'>
              <StarIcon className='h-4 w-4' />
              <span className='font-medium'>Chấm điểm đã bị khóa</span>
            </div>
            <p className='mt-1 text-orange-700 text-xs'>
              Trưởng ban giám khảo đã tắt chức năng chấm điểm. Bạn chỉ có thể xem điểm đã nhập trước đó.
            </p>
          </div>
        )}

        <div className='flex gap-4 rounded-lg border bg-muted/20 p-3'>
          <div className='relative aspect-[16/9] w-[200px] flex-shrink-0 overflow-hidden rounded-lg'>
            <Image
              alt={`${team.title} team image`}
              className='object-cover'
              fill
              src={team.image || "/placeholder-team.jpg"}
            />
          </div>
          <div>
            <h4 className='font-medium text-sm'>{team.title}</h4>
            <p className='mt-1 text-muted-foreground text-xs'>{team.description}</p>
            <div className='mt-2'>
              {parseMembers(team.members).map((m) => (
                <p key={m}>{m}</p>
              ))}
            </div>
          </div>
        </div>

        <div className='max-h-90 overflow-y-auto rounded-md border'>
          <Table>
            <TableHeader className='sticky top-0 bg-background'>
              <TableRow>
                <TableHead className='w-[40%]'>Tiêu chí</TableHead>
                <TableHead className='w-[15%]'>Điểm tối đa</TableHead>
                <TableHead className='w-[15%]'>Điểm số</TableHead>
                <TableHead className='w-[30%]'>Nhận xét</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {criteria.map((criterion) => {
                const scoreEntry = scoreEntries.find((entry) => entry.criteriaRecordId === criterion.id);
                return (
                  <TableRow key={criterion.id}>
                    <TableCell className='py-3 align-top font-medium text-sm'>{criterion.details}</TableCell>
                    <TableCell className='py-3 text-center align-top'>
                      <span className='rounded bg-muted px-2 py-1 font-medium text-xs'>{criterion.maxScore}</span>
                    </TableCell>
                    <TableCell className='py-3 align-top'>
                      <Input
                        className='h-8 w-20'
                        disabled={!canEdit}
                        max={criterion.maxScore}
                        min={0}
                        onChange={(e) => handleScoreChange(criterion.id, e.target.value, criterion.maxScore)}
                        onKeyDown={(e) => {
                          if (["-", "e", "E", "+"].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        placeholder='0'
                        step={0.1}
                        type='number'
                        value={scoreEntry?.score || ""}
                      />
                    </TableCell>
                    <TableCell className='py-3 align-top'>
                      <textarea
                        className='min-h-[40px] w-full resize-none rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50'
                        disabled={!canEdit}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          handleCommentChange(criterion.id, e.target.value)
                        }
                        placeholder='Nhận xét...'
                        value={scoreEntry?.comment || ""}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Total Score */}
        <div className='rounded-lg border bg-muted/50 p-3'>
          <div className='flex items-center justify-between text-sm'>
            <span className='font-medium'>Tổng điểm:</span>
            <span className='font-bold'>
              {getTotalScore().toFixed(1)} / {getMaxTotalScore()} điểm
            </span>
          </div>
          <div className='mt-2 h-2 w-full rounded-full bg-muted'>
            <div
              className='h-full rounded-full bg-primary transition-all'
              style={{
                width: `${Math.min((getTotalScore() / getMaxTotalScore()) * PROGRESS_BAR_FULL_PERCENTAGE, PROGRESS_BAR_FULL_PERCENTAGE)}%`
              }}
            />
          </div>
        </div>

        <Button className='w-full' disabled={isSaving || !canEdit} onClick={handleSave} size='sm'>
          <SaveIcon className='mr-2 h-4 w-4' />
          {(() => {
            if (isSaving) {
              return "Đang lưu...";
            }
            if (canEdit) {
              return "Lưu điểm";
            }
            return "Không thể lưu (đã khóa)";
          })()}
        </Button>

        <div className='text-muted-foreground text-xs'>
          {canEdit ? (
            <>
              <p>• Nhập điểm cho từng tiêu chí đánh giá</p>
              <p>• Điểm sẽ được lưu và dialog sẽ đóng khi bạn nhấn "Lưu điểm"</p>
            </>
          ) : (
            <>
              <p>• Chấm điểm hiện đang bị khóa bởi trưởng ban giám khảo</p>
              <p>• Bạn chỉ có thể xem điểm số đã nhập trước đó</p>
            </>
          )}
        </div>
      </div>
    );
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <TODO>
  useEffect(() => {
    const channel = createReviewerEventChannel({ eventId: event.id });
    channel.subscribe();

    receiveScoreEditToggle({
      channel,
      cb: ({ payload }) => {
        if (payload.toggledBy !== reviewerData.reviewerId) {
          setCurrentCanEditScore(payload.canEditScore);
          toast({
            title: "Cập nhật quyền chấm điểm",
            description: payload.canEditScore
              ? "Chấm điểm đã được mở khóa bởi trưởng ban giám khảo."
              : "Chấm điểm đã bị khóa bởi trưởng ban giám khảo."
          });
        }
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [event.id, reviewerData.reviewerId]);

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='max-h-[85vh] max-w-4xl overflow-hidden'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <StarIcon className='h-5 w-5' />
            Chấm điểm đội thi
            {!canEdit && (
              <Badge className='text-xs' variant='destructive'>
                Đã khóa
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        {renderDialogContent()}
      </DialogContent>
    </Dialog>
  );
};

export { TeamScoringDialog };
