"use client";

import { SaveIcon, StarIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { CompleteEvent } from "@/configs/prisma/zod";
import { useHandleError } from "@/hooks/use-handle-error";
import { getReviewerScoresForTeam, ScoreEntry, saveReviewerScores } from "../actions";

// Constants
const PROGRESS_BAR_FULL_PERCENTAGE = 100;

type Team = {
  id: number;
  title: string;
  description: string;
  members: string[];
  status: string;
};

type TeamScoringTableProps = {
  event: CompleteEvent;
  currentTeam: Team | undefined;
};

const TeamScoringTable = ({ event, currentTeam }: TeamScoringTableProps) => {
  const { handleErrorClient } = useHandleError();
  const [scoreEntries, setScoreEntries] = useState<ScoreEntry[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState(false);
  const [isSavingScores, setIsSavingScores] = useState(false);

  const criteria = event.criteriaTemplateId?.criteriaRecords || [];

  // Load scores for the current team
  const loadScoresForCurrentTeam = useCallback(async () => {
    if (!currentTeam) {
      setScoreEntries([]);
      return;
    }

    setIsLoadingScores(true);
    await handleErrorClient({
      cb: async () => await getReviewerScoresForTeam({ eventId: event.id, teamId: currentTeam.id }),
      withSuccessNotify: false,
      onSuccess: ({ data }) => {
        const existingScores = data.payload as ScoreEntry[];
        if (existingScores && Array.isArray(existingScores)) {
          const mergedEntries = criteria.map((criterion) => {
            const existingEntry = existingScores.find((entry) => entry.criteriaRecordId === criterion.id);
            return (
              existingEntry || {
                teamId: currentTeam.id,
                criteriaRecordId: criterion.id,
                score: 0,
                comment: ""
              }
            );
          });
          setScoreEntries(mergedEntries);
        } else {
          // Initialize empty scores
          const initialEntries = criteria.map((criterion) => ({
            teamId: currentTeam.id,
            criteriaRecordId: criterion.id,
            score: 0,
            comment: ""
          }));
          setScoreEntries(initialEntries);
        }
      }
    });
    setIsLoadingScores(false);
  }, [currentTeam, event.id, criteria, handleErrorClient]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <need for reload when recive realtime>
  useEffect(() => {
    loadScoresForCurrentTeam();
  }, [currentTeam?.id]);

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

  const handleSaveScores = async () => {
    if (!currentTeam) {
      return;
    }

    setIsSavingScores(true);
    await handleErrorClient({
      cb: async () =>
        await saveReviewerScores({
          eventId: event.id,
          teamId: currentTeam.id,
          scores: scoreEntries
        }),
      withSuccessNotify: true,
      onSuccess: () => {
        // Scores saved successfully
      }
    });
    setIsSavingScores(false);
  };

  const getTotalScore = () => scoreEntries.reduce((sum, entry) => sum + (entry.score || 0), 0);
  const getMaxTotalScore = () => criteria.reduce((sum, criterion) => sum + criterion.maxScore, 0);

  // Don't render anything if no current team
  if (!currentTeam) {
    return (
      <Card className='border-dashed'>
        <CardContent className='flex items-center justify-center py-8'>
          <div className='text-center text-muted-foreground'>
            <StarIcon className='mx-auto mb-4 h-8 w-8 opacity-50' />
            <p className='text-sm'>Chưa có đội trình bày để chấm điểm</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't render if no criteria
  if (criteria.length === 0) {
    return (
      <Card className='border-dashed'>
        <CardContent className='flex items-center justify-center py-8'>
          <div className='text-center text-muted-foreground'>
            <StarIcon className='mx-auto mb-4 h-8 w-8 opacity-50' />
            <p className='text-sm'>Sự kiện chưa có tiêu chí chấm điểm</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const canEdit = event.canEditScore !== false; // Default to true if null/undefined

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <StarIcon className='h-5 w-5' />
          Chấm điểm đội: {currentTeam.title}
          {!canEdit && (
            <Badge className='text-xs' variant='destructive'>
              Đã khóa chấm điểm
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!canEdit && (
          <div className='mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3'>
            <div className='flex items-center gap-2 text-orange-800 text-sm'>
              <StarIcon className='h-4 w-4' />
              <span className='font-medium'>Chấm điểm đã bị khóa</span>
            </div>
            <p className='mt-1 text-orange-700 text-xs'>
              Trưởng ban giám khảo đã tắt chức năng chấm điểm. Bạn chỉ có thể xem điểm đã nhập trước đó.
            </p>
          </div>
        )}
        {isLoadingScores ? (
          <div className='flex items-center justify-center py-8'>
            <div className='text-muted-foreground text-sm'>Đang tải điểm số...</div>
          </div>
        ) : (
          <div className='space-y-4'>
            <ScrollArea className='max-h-[90vh] overflow-y-auto rounded-md border'>
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
                          <Textarea
                            className='min-h-[40px] w-full resize-none rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50'
                            disabled={!canEdit}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                              handleCommentChange(criterion.id, e.target.value)
                            }
                            placeholder='Nhận xét...'
                            rows={2}
                            value={scoreEntry?.comment || ""}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>

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

            {/* Save Button */}
            <Button className='w-full' disabled={isSavingScores || !canEdit} onClick={handleSaveScores} size='sm'>
              <SaveIcon className='mr-2 h-4 w-4' />
              {(() => {
                if (isSavingScores) {
                  return "Đang lưu...";
                }
                if (canEdit) {
                  return "Lưu điểm";
                }
                return "Không thể lưu (đã khóa)";
              })()}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { TeamScoringTable };
