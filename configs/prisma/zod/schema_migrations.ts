import * as z from "zod"

export const schema_migrationsModel = z.object({
  version: z.string(),
})
