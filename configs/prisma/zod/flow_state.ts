import * as z from "zod"
import { code_challenge_method } from "@prisma/client"
import { Completesaml_relay_states, Relatedsaml_relay_statesModel } from "./index"

export const flow_stateModel = z.object({
  id: z.string(),
  user_id: z.string().nullish(),
  auth_code: z.string(),
  code_challenge_method: z.nativeEnum(code_challenge_method),
  code_challenge: z.string(),
  provider_type: z.string(),
  provider_access_token: z.string().nullish(),
  provider_refresh_token: z.string().nullish(),
  created_at: z.date().nullish(),
  updated_at: z.date().nullish(),
  authentication_method: z.string(),
  auth_code_issued_at: z.date().nullish(),
})

export interface Completeflow_state extends z.infer<typeof flow_stateModel> {
  saml_relay_states: Completesaml_relay_states[]
}

/**
 * Relatedflow_stateModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const Relatedflow_stateModel: z.ZodSchema<Completeflow_state> = z.lazy(() => flow_stateModel.extend({
  saml_relay_states: Relatedsaml_relay_statesModel.array(),
}))
