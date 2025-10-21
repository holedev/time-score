"use server";

import { prisma } from "@/configs/prisma/db";
import { handleAuthorizeRoleAdmin } from "@/utils/handle-error-server";

const getEventsForPresentation = async () =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      const events = await prisma.event.findMany({
        where: {
          isDeleted: false
        },
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
          criteriaTemplateId: true
        },
        orderBy: { createdAt: "desc" }
      });

      return events;
    }
  });

export { getEventsForPresentation };
