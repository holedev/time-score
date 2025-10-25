"use server";

import { prisma } from "@/configs/prisma/db";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

const getEventForPublicPresentView = async ({ eventId }: { eventId: number }) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const event = await prisma.event.findUnique({
        where: { id: eventId, isDeleted: false },
        include: {
          teams: {
            where: { isDeleted: false },
            orderBy: { order: "asc" }
          }
        }
      });

      if (!event) {
        throw new Error("Sự kiện không tồn tại!");
      }

      return event;
    }
  });

export { getEventForPublicPresentView };
