import * as z from "zod"
import { CompleteEvent, RelatedEventModel, CompleteCriteriaRecord, RelatedCriteriaRecordModel } from "./index"

export const CriteriaTemplateModel = z.object({
  id: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isDeleted: z.boolean(),
  eventId: z.number().int(),
  title: z.string(),
})

export interface CompleteCriteriaTemplate extends z.infer<typeof CriteriaTemplateModel> {
  event: CompleteEvent
  criteriaRecords: CompleteCriteriaRecord[]
}

/**
 * RelatedCriteriaTemplateModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedCriteriaTemplateModel: z.ZodSchema<CompleteCriteriaTemplate> = z.lazy(() => CriteriaTemplateModel.extend({
  event: RelatedEventModel,
  criteriaRecords: RelatedCriteriaRecordModel.array(),
}))
