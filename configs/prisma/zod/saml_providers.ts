import * as z from "zod"
import { Completesso_providers, Relatedsso_providersModel } from "./index"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const saml_providersModel = z.object({
  id: z.string(),
  sso_provider_id: z.string(),
  entity_id: z.string(),
  metadata_xml: z.string(),
  metadata_url: z.string().nullish(),
  attribute_mapping: jsonSchema,
  created_at: z.date().nullish(),
  updated_at: z.date().nullish(),
  name_id_format: z.string().nullish(),
})

export interface Completesaml_providers extends z.infer<typeof saml_providersModel> {
  sso_providers: Completesso_providers
}

/**
 * Relatedsaml_providersModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const Relatedsaml_providersModel: z.ZodSchema<Completesaml_providers> = z.lazy(() => saml_providersModel.extend({
  sso_providers: Relatedsso_providersModel,
}))
