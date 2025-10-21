import * as z from "zod"
import { oauth_registration_type, oauth_client_type } from "@prisma/client"
import { Completeoauth_authorizations, Relatedoauth_authorizationsModel, Completeoauth_consents, Relatedoauth_consentsModel, Completesessions, RelatedsessionsModel } from "./index"

export const oauth_clientsModel = z.object({
  id: z.string(),
  client_secret_hash: z.string().nullish(),
  registration_type: z.nativeEnum(oauth_registration_type),
  redirect_uris: z.string(),
  grant_types: z.string(),
  client_name: z.string().nullish(),
  client_uri: z.string().nullish(),
  logo_uri: z.string().nullish(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullish(),
  client_type: z.nativeEnum(oauth_client_type),
})

export interface Completeoauth_clients extends z.infer<typeof oauth_clientsModel> {
  oauth_authorizations: Completeoauth_authorizations[]
  oauth_consents: Completeoauth_consents[]
  sessions: Completesessions[]
}

/**
 * Relatedoauth_clientsModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const Relatedoauth_clientsModel: z.ZodSchema<Completeoauth_clients> = z.lazy(() => oauth_clientsModel.extend({
  oauth_authorizations: Relatedoauth_authorizationsModel.array(),
  oauth_consents: Relatedoauth_consentsModel.array(),
  sessions: RelatedsessionsModel.array(),
}))
