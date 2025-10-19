"use server";

import { revalidateTag } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import { _CACHE_TAG_EVENT_DETAIL } from "@/constants/cache-tag";
import { handleAuthorizeRoleAdmin } from "@/utils/handle-error-server";

export type ReviewerCreateFormType = {
  reviewerId: string;
  isLeader: boolean;
};

const addReviewer = async ({ eventId, reviewerData }: { eventId: number; reviewerData: ReviewerCreateFormType }) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      const user = await prisma.users.findUnique({
        where: { id: reviewerData.reviewerId }
      });

      if (!user) {
        throw new Error("Không tìm thấy người dùng!");
      }

      const existingReviewer = await prisma.eventReviewer.findFirst({
        where: {
          eventId,
          reviewerId: reviewerData.reviewerId
        }
      });

      if (existingReviewer?.isDeleted === false) {
        throw new Error("Người dùng này đã là giám khảo của sự kiện!");
      }

      if (existingReviewer?.isDeleted === true) {
        const restoredReviewer = await prisma.eventReviewer.update({
          where: { id: existingReviewer.id },
          data: { isDeleted: false, isLeader: reviewerData.isLeader },
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

        revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${eventId}`);
        return restoredReviewer;
      }

      const reviewer = await prisma.eventReviewer.create({
        data: {
          eventId,
          reviewerId: reviewerData.reviewerId,
          isLeader: reviewerData.isLeader,
          scores: {}
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

      revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${eventId}`);
      return reviewer;
    }
  });

const removeReviewer = async ({ id, eventId }: { id: number; eventId: number }) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      const reviewer = await prisma.eventReviewer.update({
        where: { id },
        data: { isDeleted: true }
      });

      revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${eventId}`);
      return reviewer;
    }
  });

const updateReviewerLeader = async ({ id, eventId, isLeader }: { id: number; eventId: number; isLeader: boolean }) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      const reviewer = await prisma.eventReviewer.update({
        where: { id },
        data: { isLeader },
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

      revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${eventId}`);
      return reviewer;
    }
  });

const getAvailableReviewers = async ({ eventId }: { eventId: number }) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      // Get all users with reviewer role
      const reviewerUsers = await prisma.users.findMany({
        where: {
          user_roles: {
            role: "reviewer"
          }
        },
        include: {
          user_roles: true
        }
      });

      // Get existing reviewers for this event
      const existingReviewers = await prisma.eventReviewer.findMany({
        where: {
          eventId,
          isDeleted: false
        },
        select: {
          reviewerId: true
        }
      });

      const existingReviewerIds = new Set(existingReviewers.map((r) => r.reviewerId));

      // Filter out users who are already reviewers for this event
      const availableReviewers = reviewerUsers.filter((user) => !existingReviewerIds.has(user.id));
      return availableReviewers;
    }
  });

export { addReviewer, removeReviewer, updateReviewerLeader, getAvailableReviewers };
