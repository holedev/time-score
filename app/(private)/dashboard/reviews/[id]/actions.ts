"use server";

import { revalidateTag } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import { _CACHE_TAG_EVENT_DETAIL } from "@/constants/cache-tag";
import { handleAuthorizeRoleReviewer } from "@/utils/handle-error-server";

export type ScoreEntry = {
  teamId: number;
  criteriaRecordId: number;
  score: number;
  comment: string;
};

// Get specific event details for reviewer
const getEventForReviewer = async ({ eventId }: { eventId: number }) =>
  handleAuthorizeRoleReviewer({
    cb: async ({ user }) => {
      if (!user?.id) {
        throw new Error("Unauthorized");
      }

      const eventReviewer = await prisma.eventReviewer.findFirst({
        where: {
          eventId,
          reviewerId: user.id,
          isDeleted: false
        }
      });

      if (!eventReviewer) {
        throw new Error("Bạn không phải là giám khảo của sự kiện này!");
      }

      const event = await prisma.event.findUnique({
        where: { id: eventId, isDeleted: false },
        include: {
          teams: {
            where: { isDeleted: false },
            orderBy: { order: "asc" }
          },
          eventReviewers: {
            where: {
              isDeleted: false,
              reviewerId: user.id
            },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  raw_user_meta_data: true
                }
              }
            }
          },
          criteriaTemplateId: {
            include: {
              criteriaRecords: {
                orderBy: { id: "asc" }
              }
            }
          }
        }
      });

      if (!event) {
        throw new Error("Sự kiện không tồn tại!");
      }

      // Get the reviewer data with user information included
      const reviewerDataWithUser = await prisma.eventReviewer.findFirst({
        where: {
          eventId,
          reviewerId: user.id,
          isDeleted: false
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              raw_user_meta_data: true
            }
          }
        }
      });

      if (!reviewerDataWithUser) {
        throw new Error("Dữ liệu giám khảo không tồn tại!");
      }

      return { event, reviewerData: reviewerDataWithUser };
    }
  });

const saveReviewerScores = async ({
  eventId,
  teamId,
  scores
}: {
  eventId: number;
  teamId: number;
  scores: ScoreEntry[];
}) =>
  handleAuthorizeRoleReviewer({
    cb: async ({ user }) => {
      if (!user?.id) {
        throw new Error("Unauthorized");
      }

      const event = await prisma.event.findUnique({
        where: { id: eventId, isDeleted: false }
      });

      if (event?.canEditScore === false) {
        throw new Error("Chấm điểm sự kiện này đã bị vô hiệu hóa!");
      }

      const eventReviewer = await prisma.eventReviewer.findFirst({
        where: {
          eventId,
          reviewerId: user.id,
          isDeleted: false
        }
      });

      if (!eventReviewer) {
        throw new Error("Bạn không có quyền chấm điểm sự kiện này!");
      }

      const team = await prisma.team.findFirst({
        where: {
          id: teamId,
          eventId,
          isDeleted: false
        }
      });

      if (!team) {
        throw new Error("Đội không tồn tại trong sự kiện này!");
      }

      const existingScores = eventReviewer.scores as ScoreEntry[];
      if (!(existingScores && Array.isArray(existingScores))) {
        // If no existing scores, simply set the new scores
        const updatedReviewerScore = await prisma.eventReviewer.update({
          where: { id: eventReviewer.id },
          data: { scores }
        });

        revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${eventId}`);
        return updatedReviewerScore;
      }

      const filteredScores = existingScores.filter((score) => score.teamId !== teamId);
      const updatedScores = [...filteredScores, ...scores];

      const updatedReviewerScore = await prisma.eventReviewer.update({
        where: { id: eventReviewer.id },
        data: { scores: updatedScores }
      });

      revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${eventId}`);
      return updatedReviewerScore;
    }
  });

const getReviewerScoresForTeam = async ({ eventId, teamId }: { eventId: number; teamId: number }) =>
  handleAuthorizeRoleReviewer({
    cb: async ({ user }) => {
      if (!user?.id) {
        throw new Error("Unauthorized");
      }

      const eventReviewer = await prisma.eventReviewer.findFirst({
        where: {
          eventId,
          reviewerId: user.id,
          isDeleted: false
        }
      });

      if (!eventReviewer) {
        throw new Error("Bạn không có quyền truy cập điểm số của sự kiện này!");
      }

      const scores = eventReviewer.scores as ScoreEntry[];
      if (!(scores && Array.isArray(scores))) {
        return [];
      }
      return scores.filter((score) => score.teamId === teamId);
    }
  });

const getAllReviewersScores = async ({ eventId }: { eventId: number }) =>
  handleAuthorizeRoleReviewer({
    cb: async ({ user }) => {
      if (!user?.id) {
        throw new Error("Unauthorized");
      }

      const eventReviewer = await prisma.eventReviewer.findFirst({
        where: {
          eventId,
          reviewerId: user.id,
          isDeleted: false,
          isLeader: true
        }
      });

      if (!eventReviewer) {
        throw new Error("Bạn không có quyền xem điểm tổng kết của sự kiện này!");
      }

      const allReviewers = await prisma.eventReviewer.findMany({
        where: {
          eventId,
          isDeleted: false
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              raw_user_meta_data: true
            }
          }
        },
        orderBy: [{ isLeader: "desc" }, { user: { email: "asc" } }]
      });

      const teams = await prisma.team.findMany({
        where: {
          eventId,
          isDeleted: false
        },
        orderBy: { order: "asc" }
      });

      return { allReviewers, teams };
    }
  });

// Toggle score editing permission (for leaders only)
const toggleScoreEditPermission = async ({ eventId, canEditScore }: { eventId: number; canEditScore: boolean }) =>
  handleAuthorizeRoleReviewer({
    cb: async ({ user }) => {
      if (!user?.id) {
        throw new Error("Unauthorized");
      }

      // Check if user is a leader reviewer for this event
      const eventReviewer = await prisma.eventReviewer.findFirst({
        where: {
          eventId,
          reviewerId: user.id,
          isDeleted: false,
          isLeader: true
        }
      });

      if (!eventReviewer) {
        throw new Error("Bạn không có quyền thay đổi cài đặt chấm điểm của sự kiện này!");
      }

      // Update the event's canEditScore field
      const updatedEvent = await prisma.event.update({
        where: {
          id: eventId,
          isDeleted: false
        },
        data: {
          canEditScore
        }
      });

      revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${eventId}`);
      return updatedEvent;
    }
  });

export {
  getEventForReviewer,
  getReviewerScoresForTeam,
  saveReviewerScores,
  getAllReviewersScores,
  toggleScoreEditPermission
};
