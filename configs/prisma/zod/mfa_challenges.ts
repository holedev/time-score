import * as z from "zod"
import { Completemfa_factors, Relatedmfa_factorsModel } from "./index"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const mfa_challengesModel = z.object({
  id: z.string(),
  factor_id: z.string(),
  created_at: z.date(),
  verified_at: z.date().nullish(),
  ip_address: z.string(),
  otp_code: z.string().nullish(),
  web_authn_session_data: jsonSchema,
})

export interface Completemfa_challenges extends z.infer<typeof mfa_challengesModel> {
  mfa_factors: Completemfa_factors
}

/**
 * Relatedmfa_challengesModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const Relatedmfa_challengesModel: z.ZodSchema<Completemfa_challenges> = z.lazy(() => mfa_challengesModel.extend({
  mfa_factors: Relatedmfa_factorsModel,
}))
