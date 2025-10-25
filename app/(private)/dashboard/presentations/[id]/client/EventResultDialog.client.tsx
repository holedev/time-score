import { DownloadIcon, StarIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useHandleError } from "@/hooks/use-handle-error";
import { getPresentationFinalScores } from "../actions";

type ScoreEntry = {
  teamId: number;
  criteriaRecordId: number;
  score: number;
  comment: string;
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
  maxPossibleScore: number;
};

const MEDAL_THRESHOLD = 3;
const FIRST_PLACE = 1;
const SECOND_PLACE = 2;
const THIRD_PLACE = 3;

const getReviewerDisplayName = (reviewer: ReviewerWithScores) => {
  if (!reviewer.user) {
    return "Unknown User";
  }

  const metaData = reviewer.user.raw_user_meta_data as Record<string, unknown> | null;
  const fullName = metaData?.full_name as string | undefined;
  const name = metaData?.name as string | undefined;
  const email = reviewer.user.email;

  return fullName || name || (email ? email.split("@")[0] : "Unknown");
};

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
  calculateTeamAverageScore
}: {
  finalScoresData: AllReviewersScoresData;
  calculateTeamScoreByReviewer: (reviewerScores: ScoreEntry[], teamId: number) => number;
  calculateTeamAverageScore: (teamId: number) => number;
}) => {
  const maxScore = finalScoresData.maxPossibleScore;

  const teamsWithAverages = finalScoresData.teams.map((team) => ({
    ...team,
    averageScore: calculateTeamAverageScore(team.id)
  }));

  const sortedTeams = [...teamsWithAverages].sort((a, b) => b.averageScore - a.averageScore);

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
                if (b.averageScore !== a.averageScore) {
                  return b.averageScore - a.averageScore;
                }
                return a.order - b.order;
              })
              .map((team) => {
                const rank = rankingMap.get(team.id) || 0;
                const rankStyle = getRankBadgeStyle(rank);
                const averageScore = team.averageScore;
                const hasScore = averageScore > 0;

                return (
                  <TableRow key={team.id}>
                    <TableCell className='text-center'>
                      {hasScore ? (
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
                      const hasReviewerScore = score > 0;
                      return (
                        <TableCell className='text-center' key={reviewer.id}>
                          {hasReviewerScore ? (
                            <Badge className='font-mono' variant='outline'>
                              {maxScore > 0 ? `${score.toFixed(1)}/${maxScore}` : score.toFixed(1)}
                            </Badge>
                          ) : (
                            <span className='text-muted-foreground text-sm'>--</span>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className='bg-muted/50 text-center'>
                      {hasScore ? (
                        <Badge className='font-bold font-mono' variant='default'>
                          {maxScore > 0 ? `${averageScore.toFixed(1)}/${maxScore}` : averageScore.toFixed(1)}
                        </Badge>
                      ) : (
                        <span className='text-muted-foreground text-sm'>--</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const EventResultDialog = ({ eventId }: { eventId: number }) => {
  const { handleErrorClient } = useHandleError();
  const [finalScoresData, setFinalScoresData] = useState<AllReviewersScoresData | null>(null);
  const [isLoadingFinalScores, setIsLoadingFinalScores] = useState(false);

  const loadFinalScores = async () => {
    setIsLoadingFinalScores(true);
    try {
      await handleErrorClient({
        cb: async () => await getPresentationFinalScores({ eventId }),
        withSuccessNotify: false,
        onSuccess: ({ data }) => {
          setFinalScoresData(data.payload as AllReviewersScoresData);
        }
      });
    } finally {
      setIsLoadingFinalScores(false);
    }
  };

  const calculateTeamScoreByReviewer = (reviewerScores: ScoreEntry[] | undefined, teamId: number) => {
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

  const handleExportCsv = () => {
    if (!finalScoresData) {
      return;
    }

    const { maxPossibleScore } = finalScoresData;

    const teamsWithAverages = finalScoresData.teams.map((team) => ({
      ...team,
      averageScore: calculateTeamAverageScore(team.id)
    }));

    const sortedByAverage = [...teamsWithAverages].sort((a, b) => b.averageScore - a.averageScore);
    const rankingMap = new Map<number, number>();
    let currentRank = 1;
    let lastScore = -1;

    sortedByAverage.forEach((team, index) => {
      if (team.averageScore !== lastScore) {
        currentRank = index + 1;
      }
      rankingMap.set(team.id, currentRank);
      lastScore = team.averageScore;
    });

    const orderedTeams = [...teamsWithAverages].sort((a, b) => {
      if (b.averageScore !== a.averageScore) {
        return b.averageScore - a.averageScore;
      }
      return a.order - b.order;
    });

    const escapeCsvValue = (value: string | number) => {
      const str = String(value);
      // TODO: fix type error
      // biome-ignore lint/performance/useTopLevelRegex: <todo>
      if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      "Hạng",
      "Đội thi",
      ...finalScoresData.allReviewers.map((reviewer) => `${getReviewerDisplayName(reviewer)}`),
      "Điểm trung bình"
    ];

    const rows = orderedTeams.map((team) => {
      const rank = rankingMap.get(team.id) || 0;
      const averageScore = team.averageScore;
      const reviewerScores = finalScoresData.allReviewers.map((reviewer) => {
        const score = calculateTeamScoreByReviewer(reviewer.scores, team.id);
        return score.toFixed(1);
      });

      return [rank > 0 ? `#${rank}` : "", team.title, ...reviewerScores, averageScore.toFixed(2)];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => escapeCsvValue(value ?? "")).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.download = `event-results-${eventId}-${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const canExport = !!finalScoresData && finalScoresData.teams.length > 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={isLoadingFinalScores} onClick={loadFinalScores} size='sm' variant='outline'>
          <StarIcon className='mr-2 h-4 w-4' />
          {isLoadingFinalScores ? "Đang tải..." : "Xem kết quả"}
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[80vh] max-w-6xl overflow-y-auto'>
        <DialogHeader className='space-y-3'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <DialogTitle className='flex items-center gap-2'>
              <StarIcon className='h-5 w-5' />
              Kết quả thuyết trình
            </DialogTitle>
            <Button disabled={!canExport} onClick={handleExportCsv} size='sm' variant='secondary'>
              <DownloadIcon className='mr-2 h-4 w-4' />
              Xuất CSV
            </Button>
          </div>
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
  );
};

export { EventResultDialog };
