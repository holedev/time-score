import * as z from "zod"
import { Completesessions, RelatedsessionsModel } from "./index"

export const mfa_amr_claimsModel = z.object({
  session_id: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
  authentication_method: z.string(),
  id: z.string(),
})

export interface Completemfa_amr_claims extends z.infer<typeof mfa_amr_claimsModel> {
  sessions: Completesessions
}

/**
 * Relatedmfa_amr_claimsModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const Relatedmfa_amr_claimsModel: z.ZodSchema<Completemfa_amr_claims> = z.lazy(() => mfa_amr_claimsModel.extend({
  sessions: RelatedsessionsModel,
}))
