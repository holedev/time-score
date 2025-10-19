import * as z from "zod"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const audit_log_entriesModel = z.object({
  instance_id: z.string().nullish(),
  id: z.string(),
  payload: jsonSchema,
  created_at: z.date().nullish(),
  ip_address: z.string(),
})
