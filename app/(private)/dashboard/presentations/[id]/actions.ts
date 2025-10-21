"use server";

import { revalidateTag } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import { _CACHE_TAG_EVENT_DETAIL, _CACHE_TAG_EVENTS } from "@/constants/cache-tag";
import { handleAuthorizeRoleAdmin } from "@/utils/handle-error-server";

const updatePresentationStatus = async ({
  eventId,
  status
}: {
  eventId: number;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
}) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      const event = await prisma.event.update({
        where: { id: eventId },
        data: { presentationStatus: status }
      });

      revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${eventId}`);
      revalidateTag(_CACHE_TAG_EVENTS);
      return event;
    }
  });

const updateTeamStatus = async ({
  teamId,
  status,
  eventId
}: {
  teamId: number;
  status: "PENDING" | "INPROGRESS" | "DONE";
  eventId: number;
}) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      const team = await prisma.team.update({
        where: { id: teamId },
        data: { status }
      });

      revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${eventId}`);
      return team;
    }
  });

const startTeamPresentation = async ({ teamId, eventId }: { teamId: number; eventId: number }) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      const team = await prisma.team.update({
        where: { id: teamId },
        data: { status: "INPROGRESS" }
      });

      revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${eventId}`);
      return team;
    }
  });

const updateReviewerStatus = async ({
  reviewerId,
  eventId,
  status
}: {
  reviewerId: string;
  eventId: number;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
}) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      const reviewer = await prisma.eventReviewer.update({
        where: {
          eventId_reviewerId: {
            eventId,
            reviewerId
          }
        },
        data: { presentationStatus: status }
      });

      revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${eventId}`);
      return reviewer;
    }
  });

// Get event detail for presentation
const getEventForPresentation = async ({ eventId }: { eventId: number }) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      const event = await prisma.event.findUnique({
        where: { id: eventId, isDeleted: false },
        include: {
          teams: {
            where: { isDeleted: false },
            orderBy: { order: "asc" }
          },
          eventReviewers: {
            where: { isDeleted: false },
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
              criteriaRecords: true
            }
          }
        }
      });

      if (!event) {
        throw new Error("Event not found");
      }

      return event;
    }
  });

export {
  updatePresentationStatus,
  updateTeamStatus,
  updateReviewerStatus,
  getEventForPresentation,
  startTeamPresentation
};
