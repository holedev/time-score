import * as z from "zod"
import { oauth_registration_type } from "@prisma/client"

export const oauth_clientsModel = z.object({
  id: z.string(),
  client_id: z.string(),
  client_secret_hash: z.string(),
  registration_type: z.nativeEnum(oauth_registration_type),
  redirect_uris: z.string(),
  grant_types: z.string(),
  client_name: z.string().nullish(),
  client_uri: z.string().nullish(),
  logo_uri: z.string().nullish(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullish(),
})
