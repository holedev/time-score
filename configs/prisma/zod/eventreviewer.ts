import * as z from "zod"
import { CompleteEvent, RelatedEventModel, Completeusers, RelatedusersModel } from "./index"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const EventReviewerModel = z.object({
  id: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isDeleted: z.boolean(),
  eventId: z.number().int(),
  reviewerId: z.string(),
  isLeader: z.boolean(),
  scores: jsonSchema,
})

export interface CompleteEventReviewer extends z.infer<typeof EventReviewerModel> {
  event: CompleteEvent
  user: Completeusers
}

/**
 * RelatedEventReviewerModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedEventReviewerModel: z.ZodSchema<CompleteEventReviewer> = z.lazy(() => EventReviewerModel.extend({
  event: RelatedEventModel,
  user: RelatedusersModel,
}))
