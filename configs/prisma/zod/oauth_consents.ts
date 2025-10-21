import * as z from "zod"
import { Completeoauth_clients, Relatedoauth_clientsModel, Completeusers, RelatedusersModel } from "./index"

export const oauth_consentsModel = z.object({
  id: z.string(),
  user_id: z.string(),
  client_id: z.string(),
  scopes: z.string(),
  granted_at: z.date(),
  revoked_at: z.date().nullish(),
})

export interface Completeoauth_consents extends z.infer<typeof oauth_consentsModel> {
  oauth_clients: Completeoauth_clients
  users: Completeusers
}

/**
 * Relatedoauth_consentsModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const Relatedoauth_consentsModel: z.ZodSchema<Completeoauth_consents> = z.lazy(() => oauth_consentsModel.extend({
  oauth_clients: Relatedoauth_clientsModel,
  users: RelatedusersModel,
}))
