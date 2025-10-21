"use client";

import { ClockIcon, PlayIcon, UsersIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Constants
const TIMER_INTERVAL_MS = 1000;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;
const WARNING_TIME_SECONDS = 300; // 5 minutes

type Team = {
  id: number;
  title: string;
  description: string;
  image: string;
  members: string[];
  order: number;
  status: "PENDING" | "INPROGRESS" | "DONE";
};

type CurrentTeamDisplayProps = {
  currentTeam: Team | null;
  eventDuration: number; // in minutes
  presentationStatus: "PENDING" | "IN_PROGRESS" | "DONE";
};

const CurrentTeamDisplay = ({ currentTeam, eventDuration, presentationStatus }: CurrentTeamDisplayProps) => {
  const [timeLeft, setTimeLeft] = useState(eventDuration * SECONDS_PER_MINUTE);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Reset timer when a new team starts presenting
    if (currentTeam?.status === "INPROGRESS") {
      setTimeLeft(eventDuration * SECONDS_PER_MINUTE);
      setIsRunning(presentationStatus === "IN_PROGRESS");
    } else {
      setIsRunning(false);
    }
  }, [currentTeam?.status, presentationStatus, eventDuration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
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
  }, [isRunning, timeLeft]);

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
            return parsed.fullName || parsed.id || member;
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

  if (!currentTeam) {
    return (
      <Card className='mb-6 border-dashed'>
        <CardContent className='flex items-center justify-center py-12'>
          <div className='text-center text-muted-foreground'>
            <PlayIcon className='mx-auto mb-4 h-12 w-12 opacity-50' />
            <h3 className='mb-2 font-semibold text-lg'>Chưa có đội trình bày</h3>
            <p className='text-sm'>Chọn một đội từ danh sách bên dưới để bắt đầu trình bày</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-blue-900'>
          <PlayIcon className='h-6 w-6' />
          Đội đang trình bày
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid gap-6 md:grid-cols-3'>
          {/* Team Info */}
          <div className='md:col-span-2'>
            <div className='flex items-start gap-4'>
              {/* Team Image */}
              <div className='relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg'>
                <Image
                  alt={`${currentTeam.title} team image`}
                  className='object-cover'
                  fill
                  src={currentTeam.image || "/placeholder-team.jpg"}
                />
              </div>

              {/* Team Details */}
              <div className='flex-1'>
                <div className='mb-2 flex items-center gap-3'>
                  <h3 className='font-bold text-blue-900 text-xl'>{currentTeam.title}</h3>
                  <Badge className='bg-green-100 text-green-800' variant='secondary'>
                    Đang trình bày
                  </Badge>
                </div>
                <p className='mb-3 text-blue-700 text-sm'>{currentTeam.description}</p>

                {/* Team Members */}
                <div className='flex items-center gap-2'>
                  <UsersIcon className='h-4 w-4 text-blue-600' />
                  <span className='font-medium text-blue-900 text-sm'>Thành viên:</span>
                </div>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {parseMembers(currentTeam.members).map((member, idx) => (
                    <div className='flex items-center gap-2' key={`member-${currentTeam.id}-${idx}`}>
                      <Avatar className='h-6 w-6'>
                        <AvatarImage alt={member} src='' />
                        <AvatarFallback className='text-xs'>
                          {member
                            .split(" ")
                            .map((name: string) => name[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className='text-blue-800 text-sm'>{member}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className='flex flex-col items-center justify-center rounded-lg border border-blue-200 bg-white p-4'>
            <div className='mb-2 flex items-center gap-2 text-blue-700'>
              <ClockIcon className='h-5 w-5' />
              <span className='font-medium text-sm'>Thời gian còn lại</span>
            </div>
            <div className='font-bold font-mono text-3xl text-blue-900'>{formatTime(timeLeft)}</div>
            <div className='mt-2 text-center'>
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
      </CardContent>
    </Card>
  );
};

export { CurrentTeamDisplay };
