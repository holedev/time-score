import * as z from "zod"
import { one_time_token_type } from "@prisma/client"
import { Completeusers, RelatedusersModel } from "./index"

export const one_time_tokensModel = z.object({
  id: z.string(),
  user_id: z.string(),
  token_type: z.nativeEnum(one_time_token_type),
  token_hash: z.string(),
  relates_to: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
})

export interface Completeone_time_tokens extends z.infer<typeof one_time_tokensModel> {
  users: Completeusers
}

/**
 * Relatedone_time_tokensModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const Relatedone_time_tokensModel: z.ZodSchema<Completeone_time_tokens> = z.lazy(() => one_time_tokensModel.extend({
  users: RelatedusersModel,
}))
