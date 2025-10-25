"use server";

import { revalidateTag } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import { _CACHE_TAG_EVENT_DETAIL } from "@/constants/cache-tag";
import { handleAuthorizeRoleAdmin } from "@/utils/handle-error-server";

export type TeamCreateFormType = {
  title: string;
  description: string;
  image: string;
  url: string;
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

export { createTeam, updateTeam, updateTeamOrders, deleteTeam };
