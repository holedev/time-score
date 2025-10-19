import * as z from "zod"

export const LogModel = z.object({
  id: z.number().int(),
  createdAt: z.date(),
  userId: z.string(),
  action: z.string(),
})
