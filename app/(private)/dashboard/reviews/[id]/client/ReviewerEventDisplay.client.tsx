"use client";

import { CircleIcon, ClockIcon, StarIcon, UsersIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CompleteEvent } from "@/configs/prisma/zod";
import { CompleteEventReviewer } from "@/configs/prisma/zod/eventreviewer";
import {
  createPresentEventChannel,
  receiveAddTeamCurr,
  receiveRemoveTeamCurr,
  receiveTimerAction
} from "@/utils/realtime";
import { ReviewerInfoCard } from "./ReviewerInfoCard.client";
import { TeamListTable } from "./TeamListTable.client";
import { TeamScoringTable } from "./TeamScoringTable.client";

const TIMER_INTERVAL_MS = 1000;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;
const WARNING_TIME_SECONDS = 300;

type ReviewerEventDisplayProps = {
  event: CompleteEvent;
  reviewerData: CompleteEventReviewer;
};

const ReviewerEventDisplay = ({ event, reviewerData }: ReviewerEventDisplayProps) => {
  const [currentEvent, setCurrentEvent] = useState(event);
  const [timeLeft, setTimeLeft] = useState(event.duration * SECONDS_PER_MINUTE);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const getCurrentTeam = () => currentEvent.teams?.find((team) => team.status === "INPROGRESS");

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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / SECONDS_PER_HOUR);
    const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
    const secs = seconds % SECONDS_PER_MINUTE;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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

  const parseMembers = (members: string[]) => {
    try {
      return members.map((member) => {
        if (typeof member === "string") {
          try {
            const parsed = JSON.parse(member);
            return { id: parsed.id, fullName: parsed.fullName };
          } catch {
            return { id: member, fullName: member };
          }
        }
        return { id: String(member), fullName: String(member) };
      });
    } catch {
      return members.map((m) => ({ id: String(m), fullName: String(m) }));
    }
  };

  const currentTeam = getCurrentTeam();

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
      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <will fix then>
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

  return (
    <div className='space-y-6'>
      {currentTeam ? (
        <Card className='w-full border-1'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CircleIcon className='h-6 w-6' color='red' /> LIVE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex justify-center'>
              <div className='flex'>
                <div className='flex items-start gap-6'>
                  <div className='relative aspect-[16/9] w-[500px] flex-shrink-0 overflow-hidden rounded-lg'>
                    <Image
                      alt={`${currentTeam.title} team image`}
                      className='object-cover'
                      fill
                      src={currentTeam.image || "/placeholder-team.jpg"}
                    />
                  </div>

                  <div className='flex-1'>
                    <div className='mb-2 flex items-center gap-3'>
                      <h3 className='font-bold text-xl'>{currentTeam.title}</h3>
                      <Badge className='' variant='secondary'>
                        Đang trình bày
                      </Badge>
                    </div>
                    <p className='mb-3 text-sm'>{currentTeam.description}</p>

                    <div className='mt-4 mb-2 flex items-center gap-2'>
                      <UsersIcon className='h-4 w-4' />
                      <span className='font-medium text-sm'>Thành viên:</span>
                    </div>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      {parseMembers(currentTeam.members).map((member, idx) => (
                        <div className='flex items-center gap-2' key={`member-${currentTeam.id}-${idx}`}>
                          <Avatar className='h-6 w-6'>
                            <AvatarImage alt={member.fullName} src='' />
                            <AvatarFallback className='text-xs'>
                              {member.fullName
                                .split(" ")
                                .map((name: string) => name[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className='text-sm'>
                            <div className='font-medium'>{member.fullName}</div>
                            <div className='text-xs opacity-75'>{member.id}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator className='mx-6 h-auto' orientation='vertical' />
                  <div className='flex min-w-[200px] flex-col items-center gap-2'>
                    <div className='text-center'>
                      <div className='mb-1 flex items-center gap-2'>
                        <ClockIcon className='h-4 w-4' />
                        <span className='font-medium text-sm'>Thời gian còn lại</span>
                      </div>
                      <div className='font-bold font-mono text-2xl'>{formatTime(timeLeft)}</div>
                      <div className='mt-1'>
                        {(() => {
                          const timeStatus = getTimeStatus();
                          return (
                            <Badge className={timeStatus.className} variant={timeStatus.variant}>
                              {timeStatus.text}
                            </Badge>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className='border-dashed'>
          <CardContent className='flex items-center justify-center py-12'>
            <div className='text-center text-muted-foreground'>
              <StarIcon className='mx-auto mb-4 h-12 w-12 opacity-50' />
              <h3 className='mb-2 font-semibold text-lg'>Chưa có đội trình bày</h3>
              <p className='text-sm'>
                {currentEvent.presentationStatus === "PENDING"
                  ? "Sự kiện chưa bắt đầu"
                  : "Tất cả các đội đã hoàn thành trình bày"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <TeamScoringTable currentTeam={currentTeam} event={currentEvent} />

      <ReviewerInfoCard event={currentEvent} reviewerData={reviewerData} />

      <TeamListTable event={currentEvent} reviewerData={reviewerData} />
    </div>
  );
};

export { ReviewerEventDisplay };
