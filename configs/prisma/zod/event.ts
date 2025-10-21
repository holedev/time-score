import * as z from "zod"
import { PresentationStatus } from "@prisma/client"
import { CompleteCriteriaTemplate, RelatedCriteriaTemplateModel, CompleteEventReviewer, RelatedEventReviewerModel, CompleteTeam, RelatedTeamModel } from "./index"

export const EventModel = z.object({
  id: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isDeleted: z.boolean(),
  title: z.string(),
  description: z.string(),
  duration: z.number().int(),
  timeStart: z.date(),
  timeEnd: z.date(),
  presentationStatus: z.nativeEnum(PresentationStatus),
  canEditScore: z.boolean().nullish(),
})

export interface CompleteEvent extends z.infer<typeof EventModel> {
  criteriaTemplateId?: CompleteCriteriaTemplate | null
  eventReviewers: CompleteEventReviewer[]
  teams: CompleteTeam[]
}

/**
 * RelatedEventModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedEventModel: z.ZodSchema<CompleteEvent> = z.lazy(() => EventModel.extend({
  criteriaTemplateId: RelatedCriteriaTemplateModel.nullish(),
  eventReviewers: RelatedEventReviewerModel.array(),
  teams: RelatedTeamModel.array(),
}))
