import * as z from "zod"
import { CompleteCriteriaRecord, RelatedCriteriaRecordModel, CompleteEvent, RelatedEventModel } from "./index"

export const CriteriaTemplateModel = z.object({
  id: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isDeleted: z.boolean(),
  eventId: z.number().int(),
  title: z.string(),
})

export interface CompleteCriteriaTemplate extends z.infer<typeof CriteriaTemplateModel> {
  criteriaRecords: CompleteCriteriaRecord[]
  event: CompleteEvent
}

/**
 * RelatedCriteriaTemplateModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedCriteriaTemplateModel: z.ZodSchema<CompleteCriteriaTemplate> = z.lazy(() => CriteriaTemplateModel.extend({
  criteriaRecords: RelatedCriteriaRecordModel.array(),
  event: RelatedEventModel,
}))
