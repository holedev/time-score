import * as z from "zod"
import { Completeusers, RelatedusersModel } from "./index"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const identitiesModel = z.object({
  provider_id: z.string(),
  user_id: z.string(),
  identity_data: jsonSchema,
  provider: z.string(),
  last_sign_in_at: z.date().nullish(),
  created_at: z.date().nullish(),
  updated_at: z.date().nullish(),
  email: z.string().nullish(),
  id: z.string(),
})

export interface Completeidentities extends z.infer<typeof identitiesModel> {
  users: Completeusers
}

/**
 * RelatedidentitiesModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedidentitiesModel: z.ZodSchema<Completeidentities> = z.lazy(() => identitiesModel.extend({
  users: RelatedusersModel,
}))
