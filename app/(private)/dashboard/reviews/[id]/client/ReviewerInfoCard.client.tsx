"use client";

import { ShieldCheckIcon, StarIcon, UsersIcon } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CompleteEvent } from "@/configs/prisma/zod";
import { CompleteEventReviewer } from "@/configs/prisma/zod/eventreviewer";
import { useHandleError } from "@/hooks/use-handle-error";
import { createReviewerEventChannel, sendScoreEditToggle } from "@/utils/realtime";
import { getAllReviewersScores, ScoreEntry, toggleScoreEditPermission } from "../actions";

type ReviewerInfoCardProps = {
  event: CompleteEvent;
  reviewerData: CompleteEventReviewer;
  setEvent: Dispatch<SetStateAction<CompleteEvent>>;
};

type ReviewerWithScores = {
  id: number;
  isLeader: boolean;
  scores: ScoreEntry[];
  user: {
    id: string;
    email: string | null;
    raw_user_meta_data: Record<string, unknown> | null;
  };
};

type AllReviewersScoresData = {
  allReviewers: ReviewerWithScores[];
  teams: Array<{
    id: number;
    title: string;
    order: number;
  }>;
};

const getReviewerDisplayName = (reviewer: CompleteEventReviewer | ReviewerWithScores) => {
  if (!reviewer.user) {
    return "Unknown User";
  }

  const metaData = reviewer.user.raw_user_meta_data as Record<string, unknown> | null;
  const fullName = metaData?.full_name as string | undefined;
  const name = metaData?.name as string | undefined;
  const email = reviewer.user.email;

  return fullName || name || (email ? email.split("@")[0] : "Unknown");
};

const MEDAL_THRESHOLD = 3;
const FIRST_PLACE = 1;
const SECOND_PLACE = 2;
const THIRD_PLACE = 3;

// Helper function to get rank badge style
const getRankBadgeStyle = (rank: number) => {
  if (rank === FIRST_PLACE) {
    return {
      variant: "default" as const,
      className: "bg-yellow-500 text-yellow-50 font-bold"
    };
  }
  if (rank === SECOND_PLACE) {
    return {
      variant: "secondary" as const,
      className: "bg-gray-400 text-gray-50 font-bold"
    };
  }
  if (rank === THIRD_PLACE) {
    return {
      variant: "outline" as const,
      className: "bg-orange-600 text-orange-50 font-bold"
    };
  }
  return {
    variant: "outline" as const,
    className: "font-bold"
  };
};

const FinalScoreTable = ({
  finalScoresData,
  calculateTeamScoreByReviewer,
  calculateTeamAverageScore,
  getMaxPossibleScore
}: {
  finalScoresData: AllReviewersScoresData;
  calculateTeamScoreByReviewer: (reviewerScores: ScoreEntry[], teamId: number) => number;
  calculateTeamAverageScore: (teamId: number) => number;
  getMaxPossibleScore: () => number;
}) => {
  const maxScore = getMaxPossibleScore();

  // Create teams with average scores for ranking
  const teamsWithAverages = finalScoresData.teams.map((team) => ({
    ...team,
    averageScore: calculateTeamAverageScore(team.id)
  }));

  // Sort teams by average score (descending) for ranking
  const sortedTeams = [...teamsWithAverages].sort((a, b) => b.averageScore - a.averageScore);

  // Create ranking map
  const rankingMap = new Map<number, number>();
  let currentRank = 1;
  let lastScore = -1;

  sortedTeams.forEach((team, index) => {
    if (team.averageScore !== lastScore) {
      currentRank = index + 1;
    }
    rankingMap.set(team.id, currentRank);
    lastScore = team.averageScore;
  });

  return (
    <div className='space-y-4'>
      <div className='max-h-96 overflow-y-auto rounded-md border'>
        <Table>
          <TableHeader className='sticky top-0 bg-background'>
            <TableRow>
              <TableHead className='w-[80px] text-center'>Hạng</TableHead>
              <TableHead className='w-[200px]'>Đội thi</TableHead>
              {finalScoresData.allReviewers.map((reviewer) => (
                <TableHead className='w-[120px] py-2 text-center' key={reviewer.id}>
                  <div className='flex flex-col items-center gap-1'>
                    <span className='text-xs'>{getReviewerDisplayName(reviewer)}</span>
                    {reviewer.isLeader && (
                      <Badge className='px-1 py-0 text-xs' variant='secondary'>
                        Trưởng ban
                      </Badge>
                    )}
                  </div>
                </TableHead>
              ))}
              <TableHead className='w-[120px] bg-muted text-center'>
                <div className='font-semibold'>Điểm TB</div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {finalScoresData.teams
              .map((team) => ({
                ...team,
                averageScore: calculateTeamAverageScore(team.id)
              }))
              .sort((a, b) => {
                // Sort by average score (descending), then by original order (ascending) for ties
                if (b.averageScore !== a.averageScore) {
                  return b.averageScore - a.averageScore;
                }
                return a.order - b.order;
              })
              .map((team) => {
                const rank = rankingMap.get(team.id) || 0;
                const rankStyle = getRankBadgeStyle(rank);

                return (
                  <TableRow key={team.id}>
                    <TableCell className='text-center'>
                      {team.averageScore > 0 ? (
                        <div className='flex items-center justify-center'>
                          {rank <= MEDAL_THRESHOLD ? (
                            <Badge className={rankStyle.className} variant={rankStyle.variant}>
                              #{rank}
                            </Badge>
                          ) : (
                            <span className='font-semibold text-sm'>#{rank}</span>
                          )}
                        </div>
                      ) : (
                        <span className='text-muted-foreground text-sm'>--</span>
                      )}
                    </TableCell>
                    <TableCell className='font-medium'>
                      <div className='flex items-center gap-2'>
                        <span>{team.title}</span>
                      </div>
                    </TableCell>
                    {finalScoresData.allReviewers.map((reviewer) => {
                      const score = calculateTeamScoreByReviewer(reviewer.scores, team.id);
                      return (
                        <TableCell className='text-center' key={reviewer.id}>
                          {score > 0 ? (
                            <Badge className='font-mono' variant='outline'>
                              {score.toFixed(1)}/{maxScore}
                            </Badge>
                          ) : (
                            <span className='text-muted-foreground text-sm'>--</span>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className='bg-muted/50 text-center'>
                      <Badge className='font-bold font-mono' variant='default'>
                        {team.averageScore.toFixed(1)}/{maxScore}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      <div className='space-y-1 text-muted-foreground text-xs'>
        <div>• Hạng: Xếp hạng dựa trên điểm trung bình (cao nhất = #1)</div>
        <div>• Điểm TB: Điểm trung bình của tất cả giám khảo đã chấm</div>
        <div>• Chỉ hiển thị điểm của các giám khảo đã hoàn thành chấm điểm</div>
        <div>• 🥇 Hạng 1 (Vàng) | 🥈 Hạng 2 (Bạc) | 🥉 Hạng 3 (Đồng)</div>
      </div>
    </div>
  );
};

const ReviewerInfoCard = ({ event, reviewerData, setEvent }: ReviewerInfoCardProps) => {
  const { handleErrorClient } = useHandleError();
  const [finalScoresData, setFinalScoresData] = useState<AllReviewersScoresData | null>(null);
  const [isLoadingFinalScores, setIsLoadingFinalScores] = useState(false);
  const [isTogglingPermission, setIsTogglingPermission] = useState(false);
  const [currentCanEditScore, setCurrentCanEditScore] = useState(event.canEditScore);

  const loadFinalScores = async () => {
    if (!reviewerData.isLeader) {
      return;
    }

    setIsLoadingFinalScores(true);
    await handleErrorClient({
      cb: async () => await getAllReviewersScores({ eventId: event.id }),
      withSuccessNotify: false,
      onSuccess: ({ data }) => {
        setFinalScoresData(data.payload as AllReviewersScoresData);
      }
    });
    setIsLoadingFinalScores(false);
  };

  const calculateTeamScoreByReviewer = (reviewerScores: ScoreEntry[], teamId: number) => {
    if (!Array.isArray(reviewerScores)) {
      return 0;
    }

    const teamScores = reviewerScores.filter((score) => score.teamId === teamId);
    return teamScores.reduce((total, score) => total + (score.score || 0), 0);
  };

  const calculateTeamAverageScore = (teamId: number) => {
    if (!finalScoresData) {
      return 0;
    }

    const allScores = finalScoresData.allReviewers
      .map((reviewer) => calculateTeamScoreByReviewer(reviewer.scores, teamId))
      .filter((score) => score > 0);

    if (allScores.length === 0) {
      return 0;
    }
    return allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
  };

  const getMaxPossibleScore = () => {
    const criteria = event.criteriaTemplateId?.criteriaRecords || [];
    return criteria.reduce((sum, criterion) => sum + criterion.maxScore, 0);
  };

  // Toggle score editing permission
  const handleToggleScorePermission = async () => {
    if (!reviewerData.isLeader) {
      return;
    }

    const newPermission = !currentCanEditScore;
    setIsTogglingPermission(true);

    await handleErrorClient({
      cb: async () =>
        await toggleScoreEditPermission({
          eventId: event.id,
          canEditScore: newPermission
        }),
      withSuccessNotify: true,
      onSuccess: () => {
        setCurrentCanEditScore(newPermission);
        setEvent((prev) => ({
          ...prev,
          canEditScore: newPermission
        }));
        const channel = createReviewerEventChannel({ eventId: event.id });
        channel.subscribe();

        sendScoreEditToggle({
          channel,
          payload: {
            eventId: event.id,
            canEditScore: newPermission,
            toggledBy: reviewerData.reviewerId
          }
        }).finally(() => {
          channel.unsubscribe();
        });
      }
    });

    setIsTogglingPermission(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <UsersIcon className='h-5 w-5' />
          Thông tin giám khảo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='flex items-center gap-4 rounded-lg border bg-muted/30 p-4'>
            <Avatar className='h-12 w-12'>
              <AvatarImage alt={getReviewerDisplayName(reviewerData)} src='' />
              <AvatarFallback className='font-semibold text-lg'>
                {getReviewerDisplayName(reviewerData)
                  .split(" ")
                  .map((name: string) => name[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <div className='mb-1 flex items-center gap-2'>
                <h3 className='font-semibold text-lg'>{getReviewerDisplayName(reviewerData)}</h3>
                {reviewerData.isLeader && (
                  <Badge className='text-xs' variant='default'>
                    <ShieldCheckIcon className='mr-1 h-3 w-3' />
                    Trưởng ban giám khảo
                  </Badge>
                )}
              </div>
              <p className='text-muted-foreground text-sm'>{reviewerData.user?.email || "Email không khả dụng"}</p>
            </div>
          </div>

          {/* Score Editing Control for Leaders */}
          {reviewerData.isLeader && (
            <div className='space-y-3'>
              <div className='rounded-lg border p-4'>
                <h4 className='mb-2 font-medium'>Quản lý chấm điểm</h4>
                <div className='flex items-center justify-between'>
                  <div className='flex-1'>
                    <p className='text-sm'>
                      {currentCanEditScore !== false ? "Giám khảo hiện có thể chấm điểm" : "Chấm điểm đã bị khóa"}
                    </p>
                    <p className='mt-1 text-xs'>Bật/tắt khả năng chấm điểm cho tất cả giám khảo</p>
                  </div>
                  <Button
                    disabled={isTogglingPermission}
                    onClick={handleToggleScorePermission}
                    size='sm'
                    variant={currentCanEditScore !== false ? "destructive" : "default"}
                  >
                    {isTogglingPermission
                      ? "Đang cập nhật..."
                      : // TODO: will fix
                        // biome-ignore lint/style/noNestedTernary: <>
                        currentCanEditScore !== false
                        ? "Khóa chấm điểm"
                        : "Mở chấm điểm"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Final Score Table for Leaders */}
          {reviewerData.isLeader && (
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <h4 className='font-medium'>Bảng điểm tổng kết</h4>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button disabled={isLoadingFinalScores} onClick={loadFinalScores} size='sm' variant='outline'>
                      <StarIcon className='mr-2 h-4 w-4' />
                      {isLoadingFinalScores ? "Đang tải..." : "Xem bảng điểm"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='max-h-[80vh] max-w-6xl overflow-y-auto'>
                    <DialogHeader>
                      <DialogTitle className='flex items-center gap-2'>
                        <StarIcon className='h-5 w-5' />
                        Bảng điểm tổng kết - {event.title}
                      </DialogTitle>
                    </DialogHeader>
                    <div className='mt-4'>
                      {(() => {
                        if (isLoadingFinalScores) {
                          return (
                            <div className='flex items-center justify-center py-8'>
                              <div className='text-muted-foreground text-sm'>Đang tải dữ liệu...</div>
                            </div>
                          );
                        }

                        if (finalScoresData) {
                          return (
                            <FinalScoreTable
                              calculateTeamAverageScore={calculateTeamAverageScore}
                              calculateTeamScoreByReviewer={calculateTeamScoreByReviewer}
                              finalScoresData={finalScoresData}
                              getMaxPossibleScore={getMaxPossibleScore}
                            />
                          );
                        }

                        return (
                          <div className='flex items-center justify-center py-8'>
                            <div className='text-muted-foreground text-sm'>Không có dữ liệu</div>
                          </div>
                        );
                      })()}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <p className='text-muted-foreground text-xs'>
                Với tư cách trưởng ban giám khảo, bạn có thể xem điểm số của tất cả giám khảo
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export { ReviewerInfoCard };
