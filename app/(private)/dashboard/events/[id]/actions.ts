"use server";

import { revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import { handleAuthorizeRoleAdmin, handleErrorServerWithAuth } from "@/utils/handle-error-server";

const _CACHE_TAG_EVENT_DETAIL = "event-detail";
const _CACHE_TAG_EVENTS = "events";

// Get single event with all relations
const getEventDetail = async ({ id }: { id: number }) =>
  handleErrorServerWithAuth({
    cb: unstable_cache(
      async () => {
        const event = await prisma.event.findUnique({
          where: { id, isDeleted: false },
          include: {
            teams: {
              where: { isDeleted: false },
              orderBy: { order: "asc" }
            },
            criteriaTemplateId: {
              include: {
                criteriaRecords: {
                  orderBy: { id: "asc" }
                }
              }
            },
            eventReviewers: {
              where: { isDeleted: false },
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    // biome-ignore lint/style/useNamingConvention: <default of supabase>
                    raw_user_meta_data: true
                  }
                }
              },
              orderBy: { createdAt: "asc" }
            }
          }
        });

        if (!event) {
          throw new Error("Không tìm thấy sự kiện!");
        }

        return event;
      },
      [`${_CACHE_TAG_EVENT_DETAIL}-${id}`],
      { tags: [`${_CACHE_TAG_EVENT_DETAIL}-${id}`] }
    )
  });

export type EventUpdateFormType = {
  title: string;
  description: string;
  duration: number;
  timeStart: Date;
  timeEnd: Date;
};

// Update event
const updateEvent = async ({ id, eventData }: { id: number; eventData: EventUpdateFormType }) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      const isExistEvent = await prisma.event.findUnique({
        where: { id, isDeleted: false }
      });

      if (!isExistEvent) {
        throw new Error("Không tìm thấy sự kiện để cập nhật!");
      }

      const event = await prisma.event.update({
        where: { id },
        data: eventData
      });

      revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${id}`);
      revalidateTag(_CACHE_TAG_EVENTS);
      return event;
    }
  });

// Delete event
const deleteEvent = async ({ id }: { id: number }) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      const isExistEvent = await prisma.event.findUnique({
        where: { id, isDeleted: false }
      });

      if (!isExistEvent) {
        throw new Error("Không tìm thấy sự kiện để xóa!");
      }

      const event = await prisma.event.update({
        where: { id },
        data: { isDeleted: true }
      });

      revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${id}`);
      revalidateTag(_CACHE_TAG_EVENTS);
      return event;
    }
  });

// Team management actions
export type TeamCreateFormType = {
  title: string;
  description: string;
  image: string;
  members: string[];
  order: number;
};

const createTeam = async ({ eventId, teamData }: { eventId: number; teamData: TeamCreateFormType }) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      const team = await prisma.team.create({
        data: {
          ...teamData,
          eventId
        }
      });

      revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${eventId}`);
      return team;
    }
  });

const updateTeam = async ({
  id,
  eventId,
  teamData
}: {
  id: number;
  eventId: number;
  teamData: Omit<TeamCreateFormType, "order">;
}) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      const team = await prisma.team.update({
        where: { id },
        data: teamData
      });

      revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${eventId}`);
      return team;
    }
  });

const updateTeamOrders = async ({
  eventId,
  teamOrders
}: {
  eventId: number;
  teamOrders: { id: number; order: number }[];
}) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      // Use Prisma transaction to update all team orders atomically
      const updatePromises = teamOrders.map(({ id, order }) =>
        prisma.team.update({
          where: { id },
          data: { order }
        })
      );

      const teams = await prisma.$transaction(updatePromises);

      revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${eventId}`);
      return teams;
    }
  });

const deleteTeam = async ({ id, eventId }: { id: number; eventId: number }) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      const team = await prisma.team.update({
        where: { id },
        data: { isDeleted: true }
      });

      revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${eventId}`);
      return team;
    }
  });

// Criteria management actions
export type CriteriaTemplateCreateFormType = {
  title: string;
};

const createCriteriaTemplate = async ({
  eventId,
  criteriaData
}: {
  eventId: number;
  criteriaData: CriteriaTemplateCreateFormType;
}) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      const criteriaTemplate = await prisma.criteriaTemplate.create({
        data: {
          ...criteriaData,
          eventId
        }
      });

      revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${eventId}`);
      return criteriaTemplate;
    }
  });

const deleteCriteriaTemplate = async ({ id, eventId }: { id: number; eventId: number }) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      const criteriaTemplate = await prisma.criteriaTemplate.update({
        where: { id },
        data: { isDeleted: true }
      });

      revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${eventId}`);
      return criteriaTemplate;
    }
  });

// Reviewer management actions
export type ReviewerCreateFormType = {
  reviewerId: string;
  isLeader: boolean;
};

const addReviewer = async ({ eventId, reviewerData }: { eventId: number; reviewerData: ReviewerCreateFormType }) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      // Check if user exists
      const user = await prisma.users.findUnique({
        where: { id: reviewerData.reviewerId }
      });

      if (!user) {
        throw new Error("Không tìm thấy người dùng!");
      }

      // Check if reviewer already exists for this event
      const existingReviewer = await prisma.eventReviewer.findFirst({
        where: {
          eventId,
          reviewerId: reviewerData.reviewerId,
          isDeleted: false
        }
      });

      if (existingReviewer) {
        throw new Error("Người dùng này đã là giám khảo của sự kiện!");
      }

      const reviewer = await prisma.eventReviewer.create({
        data: {
          eventId,
          reviewerId: reviewerData.reviewerId,
          isLeader: reviewerData.isLeader,
          scores: {}
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
        data: { isLeader }
      });

      revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${eventId}`);
      return reviewer;
    }
  });

export {
  getEventDetail,
  updateEvent,
  deleteEvent,
  createTeam,
  updateTeam,
  updateTeamOrders,
  deleteTeam,
  createCriteriaTemplate,
  deleteCriteriaTemplate,
  addReviewer,
  removeReviewer,
  updateReviewerLeader
};
