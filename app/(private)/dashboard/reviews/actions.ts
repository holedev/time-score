"use server";

import { prisma } from "@/configs/prisma/db";
import { handleAuthorizeRoleReviewer } from "@/utils/handle-error-server";

const getEventsForReviewer = async () =>
  handleAuthorizeRoleReviewer({
    cb: async ({ user }) => {
      if (!user?.id) {
        throw new Error("Unauthorized");
      }

      const events = await prisma.event.findMany({
        where: {
          isDeleted: false,
          eventReviewers: {
            some: {
              reviewerId: user.id,
              isDeleted: false
            }
          }
        },
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
        },
        orderBy: { createdAt: "desc" }
      });

      return events;
    }
  });

export { getEventsForReviewer };
