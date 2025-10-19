import * as z from "zod"
import { factor_type, factor_status } from "@prisma/client"
import { Completemfa_challenges, Relatedmfa_challengesModel, Completeusers, RelatedusersModel } from "./index"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const mfa_factorsModel = z.object({
  id: z.string(),
  user_id: z.string(),
  friendly_name: z.string().nullish(),
  factor_type: z.nativeEnum(factor_type),
  status: z.nativeEnum(factor_status),
  created_at: z.date(),
  updated_at: z.date(),
  secret: z.string().nullish(),
  phone: z.string().nullish(),
  last_challenged_at: z.date().nullish(),
  web_authn_credential: jsonSchema,
  web_authn_aaguid: z.string().nullish(),
})

export interface Completemfa_factors extends z.infer<typeof mfa_factorsModel> {
  mfa_challenges: Completemfa_challenges[]
  users: Completeusers
}

/**
 * Relatedmfa_factorsModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const Relatedmfa_factorsModel: z.ZodSchema<Completemfa_factors> = z.lazy(() => mfa_factorsModel.extend({
  mfa_challenges: Relatedmfa_challengesModel.array(),
  users: RelatedusersModel,
}))
