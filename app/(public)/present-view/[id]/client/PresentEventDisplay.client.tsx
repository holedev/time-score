"use client";

import { CircleIcon, ClockIcon, StarIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompleteEvent } from "@/configs/prisma/zod";
import { PresentationStatusMap } from "@/constants";
import {
  createPresentEventChannel,
  receiveAddTeamCurr,
  receiveRemoveTeamCurr,
  receiveTimerAction
} from "@/utils/realtime";

const TIMER_INTERVAL_MS = 1000;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;
const WARNING_TIME_SECONDS = 300;

type PresentEvent = Pick<CompleteEvent, "id" | "title" | "duration" | "presentationStatus" | "teams">;

type PresentEventDisplayProps = {
  event: PresentEvent;
};

const PresentEventDisplay = ({ event }: PresentEventDisplayProps) => {
  const [currentEvent, setCurrentEvent] = useState(event);
  const [timeLeft, setTimeLeft] = useState(event.duration * SECONDS_PER_MINUTE);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const currentTeam = useMemo(
    () => currentEvent.teams?.find((team) => team.status === "INPROGRESS") || null,
    [currentEvent.teams]
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, TIMER_INTERVAL_MS);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning, timeLeft]);

  useEffect(() => {
    if (currentTeam?.status === "INPROGRESS") {
      setTimeLeft(event.duration * SECONDS_PER_MINUTE);
      setIsTimerRunning(false);
    } else {
      setIsTimerRunning(false);
      setTimeLeft(event.duration * SECONDS_PER_MINUTE);
    }
  }, [currentTeam?.status, event.duration]);

  useEffect(() => {
    const channel = createPresentEventChannel({ eventId: currentEvent.id });
    channel.subscribe();

    receiveAddTeamCurr({
      channel,
      cb: ({ payload }) => {
        setCurrentEvent((prev) => ({
          ...prev,
          teams:
            prev.teams?.map((team) => {
              if (team.id === payload.teamId) {
                return { ...team, status: "INPROGRESS" as const };
              }
              if (team.status === "INPROGRESS") {
                return { ...team, status: "PENDING" as const };
              }
              return team;
            }) || []
        }));
      }
    });

    receiveRemoveTeamCurr({
      channel,
      cb: ({ payload }) => {
        const { teamId, status } = payload;

        setCurrentEvent((prev) => ({
          ...prev,
          teams:
            prev.teams?.map((team) => {
              if (team.id === teamId) {
                return { ...team, status };
              }
              return team;
            }) || []
        }));
      }
    });

    receiveTimerAction({
      channel,
      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <todo>
      cb: ({ payload }) => {
        const { action, timeLeft: receivedTimeLeft } = payload;

        if (action === "start") {
          setIsTimerRunning(true);
          if (receivedTimeLeft !== undefined) {
            setTimeLeft(receivedTimeLeft);
          }
        } else if (action === "pause") {
          setIsTimerRunning(false);
          if (receivedTimeLeft !== undefined) {
            setTimeLeft(receivedTimeLeft);
          }
        } else if (action === "stop") {
          setIsTimerRunning(false);
          if (receivedTimeLeft !== undefined) {
            setTimeLeft(receivedTimeLeft);
          }
        }
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [currentEvent.id]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / SECONDS_PER_HOUR);
    const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
    const secs = seconds % SECONDS_PER_MINUTE;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeStatus = () => {
    if (timeLeft === 0) {
      return {
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800",
        text: "Hết thời gian"
      };
    }
    if (timeLeft < WARNING_TIME_SECONDS) {
      return {
        variant: "secondary" as const,
        className: "bg-yellow-100 text-yellow-800",
        text: "Sắp hết thời gian"
      };
    }
    return {
      variant: "secondary" as const,
      className: "bg-green-100 text-green-800",
      text: "Đang đếm ngược"
    };
  };

  return (
    <div className='mx-auto max-w-2xl space-y-6 px-4 py-10 text-center'>
      <div className='space-y-2'>
        <h1 className='font-bold text-3xl'>{currentEvent.title}</h1>
        <Badge variant='outline'>{PresentationStatusMap[currentEvent.presentationStatus]}</Badge>
      </div>

      {currentTeam ? (
        <Card className='border-none shadow-none'>
          <CardHeader>
            <CardTitle className='flex items-center justify-center gap-2 font-medium text-sm uppercase tracking-wide'>
              <span className={`flex items-center ${isTimerRunning ? "text-red-600" : "text-muted-foreground"}`}>
                <CircleIcon className={`h-5 w-5 ${isTimerRunning ? "animate-pulse" : ""}`} />
              </span>
              Đang trình bày
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div>
              <div className='text-muted-foreground text-sm'>Tên đội</div>
              <div className='font-semibold text-2xl'>{currentTeam.title}</div>
            </div>

            <div className='mt-20 flex flex-col items-center gap-2'>
              <div className='flex items-center gap-2 text-muted-foreground text-sm'>
                <ClockIcon className='h-5 w-5' />
                Thời gian còn lại
              </div>
              <div className='font-bold font-mono text-9xl'>{formatTime(timeLeft)}</div>
              {(() => {
                const timeStatus = getTimeStatus();
                return (
                  <Badge className={timeStatus.className} variant={timeStatus.variant}>
                    {timeStatus.text}
                  </Badge>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className='border-dashed'>
          <CardContent className='flex flex-col items-center gap-4 py-12 text-muted-foreground'>
            <StarIcon className='h-12 w-12 opacity-50' />
            <div>
              <h3 className='font-semibold text-lg'>Chưa có đội trình bày</h3>
              <p className='text-sm'>
                {currentEvent.presentationStatus === "PENDING"
                  ? "Sự kiện chưa bắt đầu."
                  : "Tất cả các đội đã hoàn thành phần trình bày."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { PresentEventDisplay };
