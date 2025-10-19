import * as z from "zod"
import { aal_level } from "@prisma/client"
import { Completemfa_amr_claims, Relatedmfa_amr_claimsModel, Completerefresh_tokens, Relatedrefresh_tokensModel, Completeusers, RelatedusersModel } from "./index"

export const sessionsModel = z.object({
  id: z.string(),
  user_id: z.string(),
  created_at: z.date().nullish(),
  updated_at: z.date().nullish(),
  factor_id: z.string().nullish(),
  aal: z.nativeEnum(aal_level).nullish(),
  not_after: z.date().nullish(),
  refreshed_at: z.date().nullish(),
  user_agent: z.string().nullish(),
  ip: z.string().nullish(),
  tag: z.string().nullish(),
})

export interface Completesessions extends z.infer<typeof sessionsModel> {
  mfa_amr_claims: Completemfa_amr_claims[]
  refresh_tokens: Completerefresh_tokens[]
  users: Completeusers
}

/**
 * RelatedsessionsModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedsessionsModel: z.ZodSchema<Completesessions> = z.lazy(() => sessionsModel.extend({
  mfa_amr_claims: Relatedmfa_amr_claimsModel.array(),
  refresh_tokens: Relatedrefresh_tokensModel.array(),
  users: RelatedusersModel,
}))
