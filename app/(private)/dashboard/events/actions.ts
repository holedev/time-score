"use server";

import { revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import { handleAuthorizeRoleAdmin, handleErrorServerWithAuth } from "@/utils/handle-error-server";

const _CACHE_TAG_EVENTS = "events";

const getEvents = async () =>
  handleErrorServerWithAuth({
    cb: unstable_cache(
      async () => {
        const events = await prisma.event.findMany({
          where: { isDeleted: false },
          orderBy: { createdAt: "desc" }
        });
        return events;
      },
      [_CACHE_TAG_EVENTS],
      { tags: [_CACHE_TAG_EVENTS] }
    )
  });

export type EventCreateFormType = {
  title: string;
  description: string;
  duration: number;
  timeStart: Date;
  timeEnd: Date;
};

const createEvent = async ({ eventData }: { eventData: EventCreateFormType }) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      const event = await prisma.event.create({
        data: eventData
      });

      revalidateTag(_CACHE_TAG_EVENTS);
      return event;
    }
  });

export { getEvents, createEvent };
