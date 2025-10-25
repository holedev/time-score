"use client";

import { ClockIcon, PauseIcon, PlayIcon, SquareIcon, UsersIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CompleteTeam } from "@/configs/prisma/zod";
import { createPresentEventChannel, sendTimerAction } from "@/utils/realtime";

// Constants
const TIMER_INTERVAL_MS = 1000;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;
const WARNING_TIME_SECONDS = 300; // 5 minutes

type PresentationHeaderProps = {
  currentTeam: CompleteTeam | null;
  eventDuration: number;
  presentationStatus: "PENDING" | "IN_PROGRESS" | "DONE";
  eventId: number;
};

const PresentationHeader = ({ currentTeam, eventDuration, eventId }: PresentationHeaderProps) => {
  const [timeLeft, setTimeLeft] = useState(eventDuration * SECONDS_PER_MINUTE);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [channel, setChannel] = useState<ReturnType<typeof createPresentEventChannel> | null>(null);

  useEffect(() => {
    if (currentTeam?.status === "INPROGRESS") {
      setTimeLeft(eventDuration * SECONDS_PER_MINUTE);
      setIsTimerRunning(false);
    } else {
      setIsTimerRunning(false);
    }
  }, [currentTeam?.status, eventDuration]);

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

  const handleTimerStart = async () => {
    if (currentTeam?.status === "INPROGRESS") {
      setIsTimerRunning(true);

      // Send real-time update
      if (channel && currentTeam) {
        await sendTimerAction({
          channel,
          payload: {
            teamId: currentTeam.id,
            action: "start",
            timeLeft
          }
        });
      }
    }
  };

  const handleTimerPause = async () => {
    setIsTimerRunning(false);

    // Send real-time update
    if (channel && currentTeam) {
      await sendTimerAction({
        channel,
        payload: {
          teamId: currentTeam.id,
          action: "pause",
          timeLeft
        }
      });
    }
  };

  const handleTimerStop = async () => {
    setIsTimerRunning(false);
    setTimeLeft(eventDuration * SECONDS_PER_MINUTE); // Reset to initial duration

    // Send real-time update
    if (channel && currentTeam) {
      await sendTimerAction({
        channel,
        payload: {
          teamId: currentTeam.id,
          action: "stop",
          timeLeft: eventDuration * SECONDS_PER_MINUTE
        }
      });
    }
  };

  // Set up real-time channel
  useEffect(() => {
    const realtimeChannel = createPresentEventChannel({ eventId });

    // Subscribe to channel
    realtimeChannel.subscribe();
    setChannel(realtimeChannel);

    // Cleanup on unmount
    return () => {
      realtimeChannel.unsubscribe();
      setChannel(null);
    };
  }, [eventId]);

  return (
    <Card className='border-2 bg-gradient-to-r'>
      <CardContent className='p-6'>
        <div>
          <div className='flex flex-1 items-center justify-center gap-4'>
            {currentTeam ? (
              <div className='flex justify-center gap-8'>
                <Image
                  alt={`${currentTeam.title} team image`}
                  height={250}
                  src={currentTeam.image || "/placeholder-team.png"}
                  width={500}
                />

                <div>
                  <div>
                    <div className='mb-1 flex flex-col gap-2'>
                      <Badge className='bg-green-100 text-green-800' variant='secondary'>
                        Đang trình bày
                      </Badge>
                      <h3 className='font-bold text-lg'>
                        {currentTeam.title}
                        {currentTeam.url && (
                          <Link href={currentTeam.url} target='_blank'>
                            <Button className='ml-4' size='sm' variant='outline'>
                              Source (Github)
                            </Button>
                          </Link>
                        )}
                      </h3>
                      <h5 className='text-muted-foreground text-sm'>{currentTeam.description}</h5>
                    </div>
                    <div className='mt-2 flex items-start gap-2 text-sm'>
                      <UsersIcon className='h-4 w-4' />
                      <div>
                        {parseMembers(currentTeam.members).map((member, idx) => (
                          <div className='text-sm' key={`member-${currentTeam.id}-${idx}`}>
                            {member}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Separator className='my-4' />
                  <div className='flex flex-col items-center gap-2'>
                    <div className='flex items-center gap-6'>
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
                    {currentTeam ? (
                      <div className='mt-6 flex items-center gap-4'>
                        {isTimerRunning ? (
                          <Button onClick={handleTimerPause} size='sm' variant='outline'>
                            <PauseIcon className='mr-1 h-4 w-4' />
                            Tạm dừng
                          </Button>
                        ) : (
                          <Button onClick={handleTimerStart} size='sm' variant='default'>
                            <PlayIcon className='mr-1 h-4 w-4' />
                            Bắt đầu đếm
                          </Button>
                        )}

                        <Button onClick={handleTimerStop} size='sm' variant='destructive'>
                          <SquareIcon className='mr-1 h-4 w-4' />
                          Dừng
                        </Button>
                      </div>
                    ) : (
                      <div className='text-muted-foreground text-sm'>Chọn đội để bắt đầu đếm thời gian</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className='flex items-center gap-3 text-muted-foreground'>
                <PlayIcon className='h-8 w-8 opacity-50' />
                <div>
                  <h3 className='font-semibold text-lg'>Chưa có đội trình bày</h3>
                  <p className='text-sm'>Chọn một đội từ danh sách bên dưới</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { PresentationHeader };
