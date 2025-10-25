"use client";

import { SaveIcon, StarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompleteEvent } from "@/configs/prisma/zod";
import { CompleteEventReviewer } from "@/configs/prisma/zod/eventreviewer";
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

type CurrentTeamScoringProps = {
  event: CompleteEvent;
  team: Team;
  reviewerData: CompleteEventReviewer;
};

const CurrentTeamScoring = ({ event, team }: CurrentTeamScoringProps) => {
  const { handleErrorClient } = useHandleError();
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get criteria from event
  const criteria = event.criteriaTemplateId?.criteriaRecords || [];

  // Load existing scores for this team
  useEffect(() => {
    const loadScores = async () => {
      setIsLoading(true);
      await handleErrorClient({
        cb: async () => await getReviewerScoresForTeam({ eventId: event.id, teamId: team.id }),
        withSuccessNotify: false,
        onSuccess: ({ data }) => {
          const existingScores = data.payload as ScoreEntry[];
          setScores(existingScores);
        }
      });
      setIsLoading(false);
    };

    if (team?.id) {
      loadScores();
    }
  }, [team?.id, event.id, handleErrorClient]);

  const handleScoreChange = (criteriaId: string, value: string) => {
    const numValue = Number.parseFloat(value) || 0;
    setScores((prev) => ({
      ...prev,
      [criteriaId]: numValue
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await handleErrorClient({
      cb: async () =>
        await saveReviewerScores({
          eventId: event.id,
          teamId: team.id,
          scores
        }),
      withSuccessNotify: true
    });
    setIsSaving(false);
  };

  const getTotalScore = () => scores.reduce((sum, entry) => sum + (entry.score || 0), 0);

  const getMaxTotalScore = () => criteria.reduce((sum, criterion) => sum + criterion.maxScore, 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-8'>
          <div className='text-muted-foreground text-sm'>Đang tải điểm số...</div>
        </CardContent>
      </Card>
    );
  }

  if (criteria.length === 0) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-8'>
          <div className='text-center text-muted-foreground'>
            <StarIcon className='mx-auto mb-2 h-8 w-8 opacity-50' />
            <div className='text-sm'>Chưa có tiêu chí chấm điểm</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const canEdit = event.canEditScore !== false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-sm'>
          <StarIcon className='h-4 w-4' />
          Chấm điểm đội thi
          {!canEdit && (
            <Badge className='text-xs' variant='destructive'>
              Đã khóa
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
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

        <div className='space-y-3'>
          {criteria.map((criterion) => (
            <div className='space-y-2' key={criterion.id}>
              <Label className='font-medium text-sm' htmlFor={`score-${criterion.id}`}>
                {criterion.title}
                <span className='ml-1 text-muted-foreground'>(Tối đa: {criterion.maxScore} điểm)</span>
              </Label>
              <Input
                className='h-8'
                disabled={!canEdit}
                id={`score-${criterion.id}`}
                max={criterion.maxScore}
                min={0}
                onChange={(e) => handleScoreChange(criterion.id.toString(), e.target.value)}
                placeholder={`0 - ${criterion.maxScore}`}
                step={0.1}
                type='number'
                value={scores.find((entry) => entry.criteriaRecordId === criterion.id)?.score || ""}
              />
            </div>
          ))}
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

        {/* Save Button */}
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

        {/* Instructions */}
        <div className='text-muted-foreground text-xs'>
          {canEdit ? (
            <>
              <p>• Nhập điểm cho từng tiêu chí đánh giá</p>
              <p>• Điểm sẽ được lưu tự động khi bạn nhấn "Lưu điểm"</p>
            </>
          ) : (
            <>
              <p>• Chấm điểm hiện đang bị khóa bởi trưởng ban giám khảo</p>
              <p>• Bạn chỉ có thể xem điểm số đã nhập trước đó</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export { CurrentTeamScoring };
