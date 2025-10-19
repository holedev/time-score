import * as z from "zod"
import { Completesaml_providers, Relatedsaml_providersModel, Completesaml_relay_states, Relatedsaml_relay_statesModel, Completesso_domains, Relatedsso_domainsModel } from "./index"

export const sso_providersModel = z.object({
  id: z.string(),
  resource_id: z.string().nullish(),
  created_at: z.date().nullish(),
  updated_at: z.date().nullish(),
  disabled: z.boolean().nullish(),
})

export interface Completesso_providers extends z.infer<typeof sso_providersModel> {
  saml_providers: Completesaml_providers[]
  saml_relay_states: Completesaml_relay_states[]
  sso_domains: Completesso_domains[]
}

/**
 * Relatedsso_providersModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const Relatedsso_providersModel: z.ZodSchema<Completesso_providers> = z.lazy(() => sso_providersModel.extend({
  saml_providers: Relatedsaml_providersModel.array(),
  saml_relay_states: Relatedsaml_relay_statesModel.array(),
  sso_domains: Relatedsso_domainsModel.array(),
}))
