import * as z from "zod"
import { app_role } from "@prisma/client"
import { Completeusers, RelatedusersModel } from "./index"

export const user_rolesModel = z.object({
  user_id: z.string(),
  role: z.nativeEnum(app_role),
})

export interface Completeuser_roles extends z.infer<typeof user_rolesModel> {
  users: Completeusers
}

/**
 * Relateduser_rolesModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const Relateduser_rolesModel: z.ZodSchema<Completeuser_roles> = z.lazy(() => user_rolesModel.extend({
  users: RelatedusersModel,
}))
