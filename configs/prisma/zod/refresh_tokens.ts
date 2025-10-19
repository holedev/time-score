import * as z from "zod"
import { Completesessions, RelatedsessionsModel } from "./index"

export const refresh_tokensModel = z.object({
  instance_id: z.string().nullish(),
  id: z.bigint(),
  token: z.string().nullish(),
  user_id: z.string().nullish(),
  revoked: z.boolean().nullish(),
  created_at: z.date().nullish(),
  updated_at: z.date().nullish(),
  parent: z.string().nullish(),
  session_id: z.string().nullish(),
})

export interface Completerefresh_tokens extends z.infer<typeof refresh_tokensModel> {
  sessions?: Completesessions | null
}

/**
 * Relatedrefresh_tokensModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const Relatedrefresh_tokensModel: z.ZodSchema<Completerefresh_tokens> = z.lazy(() => refresh_tokensModel.extend({
  sessions: RelatedsessionsModel.nullish(),
}))
