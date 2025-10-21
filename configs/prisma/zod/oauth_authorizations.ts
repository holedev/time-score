import * as z from "zod"
import { code_challenge_method, oauth_response_type, oauth_authorization_status } from "@prisma/client"
import { Completeoauth_clients, Relatedoauth_clientsModel, Completeusers, RelatedusersModel } from "./index"

export const oauth_authorizationsModel = z.object({
  id: z.string(),
  authorization_id: z.string(),
  client_id: z.string(),
  user_id: z.string().nullish(),
  redirect_uri: z.string(),
  scope: z.string(),
  state: z.string().nullish(),
  resource: z.string().nullish(),
  code_challenge: z.string().nullish(),
  code_challenge_method: z.nativeEnum(code_challenge_method).nullish(),
  response_type: z.nativeEnum(oauth_response_type),
  status: z.nativeEnum(oauth_authorization_status),
  authorization_code: z.string().nullish(),
  created_at: z.date(),
  expires_at: z.date(),
  approved_at: z.date().nullish(),
})

export interface Completeoauth_authorizations extends z.infer<typeof oauth_authorizationsModel> {
  oauth_clients: Completeoauth_clients
  users?: Completeusers | null
}

/**
 * Relatedoauth_authorizationsModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const Relatedoauth_authorizationsModel: z.ZodSchema<Completeoauth_authorizations> = z.lazy(() => oauth_authorizationsModel.extend({
  oauth_clients: Relatedoauth_clientsModel,
  users: RelatedusersModel.nullish(),
}))
