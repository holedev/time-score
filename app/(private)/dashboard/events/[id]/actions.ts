"use server";

import { revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import { _CACHE_TAG_EVENT_DETAIL, _CACHE_TAG_EVENTS } from "@/constants/cache-tag";
import { handleAuthorizeRoleAdmin, handleErrorServerWithAuth } from "@/utils/handle-error-server";

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

export { getEventDetail, updateEvent, deleteEvent };
