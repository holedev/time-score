import * as z from "zod"
import { Completeidentities, RelatedidentitiesModel, Completemfa_factors, Relatedmfa_factorsModel, Completeone_time_tokens, Relatedone_time_tokensModel, Completesessions, RelatedsessionsModel, Completeuser_roles, Relateduser_rolesModel, CompleteEventReviewer, RelatedEventReviewerModel } from "./index"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const usersModel = z.object({
  instance_id: z.string().nullish(),
  id: z.string(),
  aud: z.string().nullish(),
  role: z.string().nullish(),
  email: z.string().nullish(),
  encrypted_password: z.string().nullish(),
  email_confirmed_at: z.date().nullish(),
  invited_at: z.date().nullish(),
  confirmation_token: z.string().nullish(),
  confirmation_sent_at: z.date().nullish(),
  recovery_token: z.string().nullish(),
  recovery_sent_at: z.date().nullish(),
  email_change_token_new: z.string().nullish(),
  email_change: z.string().nullish(),
  email_change_sent_at: z.date().nullish(),
  last_sign_in_at: z.date().nullish(),
  raw_app_meta_data: jsonSchema,
  raw_user_meta_data: jsonSchema,
  is_super_admin: z.boolean().nullish(),
  created_at: z.date().nullish(),
  updated_at: z.date().nullish(),
  phone: z.string().nullish(),
  phone_confirmed_at: z.date().nullish(),
  phone_change: z.string().nullish(),
  phone_change_token: z.string().nullish(),
  phone_change_sent_at: z.date().nullish(),
  confirmed_at: z.date().nullish(),
  email_change_token_current: z.string().nullish(),
  email_change_confirm_status: z.number().int().nullish(),
  banned_until: z.date().nullish(),
  reauthentication_token: z.string().nullish(),
  reauthentication_sent_at: z.date().nullish(),
  is_sso_user: z.boolean(),
  deleted_at: z.date().nullish(),
  is_anonymous: z.boolean(),
})

export interface Completeusers extends z.infer<typeof usersModel> {
  identities: Completeidentities[]
  mfa_factors: Completemfa_factors[]
  one_time_tokens: Completeone_time_tokens[]
  sessions: Completesessions[]
  user_roles?: Completeuser_roles | null
  EventReviewer: CompleteEventReviewer[]
}

/**
 * RelatedusersModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedusersModel: z.ZodSchema<Completeusers> = z.lazy(() => usersModel.extend({
  identities: RelatedidentitiesModel.array(),
  mfa_factors: Relatedmfa_factorsModel.array(),
  one_time_tokens: Relatedone_time_tokensModel.array(),
  sessions: RelatedsessionsModel.array(),
  user_roles: Relateduser_rolesModel.nullish(),
  EventReviewer: RelatedEventReviewerModel.array(),
}))
