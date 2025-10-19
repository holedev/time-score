"use server";

import { revalidateTag } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import { _CACHE_TAG_EVENT_DETAIL } from "@/constants/cache-tag";
import { handleAuthorizeRoleAdmin } from "@/utils/handle-error-server";

export type CriteriaTemplateCreateFormType = {
  title: string;
};

export type CriteriaRecordCreateFormType = {
  details: string;
  maxScore: number;
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
        },
        include: {
          criteriaRecords: {
            orderBy: { id: "asc" }
          }
        }
      });

      revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${eventId}`);
      return criteriaTemplate;
    }
  });

const deleteCriteriaTemplate = async ({ id, eventId }: { id: number; eventId: number }) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      const criteriaTemplate = await prisma.criteriaTemplate.delete({
        where: { id }
      });

      revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${eventId}`);
      return criteriaTemplate;
    }
  });

const createCriteriaRecord = async ({
  criteriaTemplateId,
  recordData
}: {
  criteriaTemplateId: number;
  recordData: CriteriaRecordCreateFormType;
}) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      await prisma.criteriaRecord.create({
        data: {
          ...recordData,
          criteriaId: criteriaTemplateId
        }
      });

      const updatedTemplate = await prisma.criteriaTemplate.findUnique({
        where: { id: criteriaTemplateId },
        include: {
          criteriaRecords: {
            orderBy: { id: "asc" }
          }
        }
      });

      if (!updatedTemplate) {
        throw new Error("Không tìm thấy template sau khi tạo criteria record!");
      }

      revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${updatedTemplate.eventId}`);
      return updatedTemplate;
    }
  });

const updateCriteriaRecord = async ({ id, recordData }: { id: number; recordData: CriteriaRecordCreateFormType }) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      const criteriaRecord = await prisma.criteriaRecord.update({
        where: { id },
        data: recordData
      });

      const updatedTemplate = await prisma.criteriaTemplate.findUnique({
        where: { id: criteriaRecord.criteriaId },
        include: {
          criteriaRecords: {
            orderBy: { id: "asc" }
          }
        }
      });

      if (!updatedTemplate) {
        throw new Error("Không tìm thấy template sau khi cập nhật criteria record!");
      }

      revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${updatedTemplate.eventId}`);
      return updatedTemplate;
    }
  });

const deleteCriteriaRecord = async ({ id }: { id: number }) =>
  handleAuthorizeRoleAdmin({
    cb: async () => {
      const criteriaRecord = await prisma.criteriaRecord.delete({
        where: { id }
      });

      const updatedTemplate = await prisma.criteriaTemplate.findUnique({
        where: { id: criteriaRecord.criteriaId },
        include: {
          criteriaRecords: {
            orderBy: { id: "asc" }
          }
        }
      });

      if (!updatedTemplate) {
        throw new Error("Không tìm thấy template sau khi xóa criteria record!");
      }

      revalidateTag(`${_CACHE_TAG_EVENT_DETAIL}-${updatedTemplate.eventId}`);
      return updatedTemplate;
    }
  });

export {
  createCriteriaTemplate,
  deleteCriteriaTemplate,
  createCriteriaRecord,
  updateCriteriaRecord,
  deleteCriteriaRecord
};
