import * as z from "zod"
import { TeamStatus } from "@prisma/client"
import { CompleteEvent, RelatedEventModel } from "./index"

export const TeamModel = z.object({
  id: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isDeleted: z.boolean(),
  title: z.string(),
  description: z.string(),
  image: z.string(),
  members: z.string().array(),
  order: z.number().int(),
  status: z.nativeEnum(TeamStatus),
  eventId: z.number().int(),
})

export interface CompleteTeam extends z.infer<typeof TeamModel> {
  Event?: CompleteEvent | null
}

/**
 * RelatedTeamModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedTeamModel: z.ZodSchema<CompleteTeam> = z.lazy(() => TeamModel.extend({
  Event: RelatedEventModel.nullish(),
}))
