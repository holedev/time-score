import * as z from "zod"
import { CompleteCriteriaTemplate, RelatedCriteriaTemplateModel } from "./index"

export const CriteriaRecordModel = z.object({
  id: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  criteriaId: z.number().int(),
  details: z.string(),
  maxScore: z.number().int(),
})

export interface CompleteCriteriaRecord extends z.infer<typeof CriteriaRecordModel> {
  criteria: CompleteCriteriaTemplate
}

/**
 * RelatedCriteriaRecordModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedCriteriaRecordModel: z.ZodSchema<CompleteCriteriaRecord> = z.lazy(() => CriteriaRecordModel.extend({
  criteria: RelatedCriteriaTemplateModel,
}))
