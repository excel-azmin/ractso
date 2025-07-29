import { z } from 'zod';

// schemas
export const LoginTokenPayloadSchema = z.object({ id: z.string() });
export const RegistrationTokenPayloadSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});
export const RefreshTokenPayloadSchema = z.object({
  email: z.string().email(),
});

// types
export type LoginTokenPayload = z.infer<typeof LoginTokenPayloadSchema>;
export type RefreshTokenPayload = z.infer<typeof RefreshTokenPayloadSchema>;
export type RegistrationTokenPayloadSchema = z.infer<
  typeof RegistrationTokenPayloadSchema
>;
