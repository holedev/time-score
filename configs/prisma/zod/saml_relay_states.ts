import * as z from "zod"
import { Completeflow_state, Relatedflow_stateModel, Completesso_providers, Relatedsso_providersModel } from "./index"

export const saml_relay_statesModel = z.object({
  id: z.string(),
  sso_provider_id: z.string(),
  request_id: z.string(),
  for_email: z.string().nullish(),
  redirect_to: z.string().nullish(),
  created_at: z.date().nullish(),
  updated_at: z.date().nullish(),
  flow_state_id: z.string().nullish(),
})

export interface Completesaml_relay_states extends z.infer<typeof saml_relay_statesModel> {
  flow_state?: Completeflow_state | null
  sso_providers: Completesso_providers
}

/**
 * Relatedsaml_relay_statesModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const Relatedsaml_relay_statesModel: z.ZodSchema<Completesaml_relay_states> = z.lazy(() => saml_relay_statesModel.extend({
  flow_state: Relatedflow_stateModel.nullish(),
  sso_providers: Relatedsso_providersModel,
}))
