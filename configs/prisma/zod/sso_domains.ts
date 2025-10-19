import * as z from "zod"
import { Completesso_providers, Relatedsso_providersModel } from "./index"

export const sso_domainsModel = z.object({
  id: z.string(),
  sso_provider_id: z.string(),
  domain: z.string(),
  created_at: z.date().nullish(),
  updated_at: z.date().nullish(),
})

export interface Completesso_domains extends z.infer<typeof sso_domainsModel> {
  sso_providers: Completesso_providers
}

/**
 * Relatedsso_domainsModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const Relatedsso_domainsModel: z.ZodSchema<Completesso_domains> = z.lazy(() => sso_domainsModel.extend({
  sso_providers: Relatedsso_providersModel,
}))
