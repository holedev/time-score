import * as z from "zod"

export const instancesModel = z.object({
  id: z.string(),
  uuid: z.string().nullish(),
  raw_base_config: z.string().nullish(),
  created_at: z.date().nullish(),
  updated_at: z.date().nullish(),
})
